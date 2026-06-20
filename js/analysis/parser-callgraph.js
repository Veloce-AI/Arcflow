Parser.findJSCalls=function(content,fnNames,defLines,options){
        fnNames=Parser.candidateFunctionNames(content,fnNames);
        var calls={};
        var refs={};
        if(!fnNames.length)return calls;
        fnNames.forEach(function(fn){calls[fn]=0;refs[fn]=0;});

        var sourceType=options&&options.sourceType==='script'?'script':'module';
        var isTS=!!(options&&options.isTS);

        if(typeof acorn!=='undefined'){
            try{
                var jsContent=content;
                if(typeof Babel!=='undefined'){
                    try{
                        var babelPresets=['react'];
                        if(isTS)babelPresets.push('typescript');
                        var babelResult=Babel.transform(content,{
                            presets:babelPresets,
                            filename:options&&options.filename?options.filename:'file.js',
                            sourceType:sourceType,
                            retainLines:true
                        });
                        jsContent=babelResult.code;
                    }catch(babelErr){
                        jsContent=isTS?Parser.stripTypeScript(content):content;
                    }
                }else if(isTS){
                    jsContent=Parser.stripTypeScript(content);
                }

                var ast=acorn.parse(jsContent,{
                    ecmaVersion:2022,
                    sourceType:sourceType,
                    allowHashBang:true,
                    allowAwaitOutsideFunction:true,
                    allowImportExportEverywhere:true,
                    allowReturnOutsideFunction:true,
                    locations:true,
                    tolerant:true
                });
                var fnSet=new Set(fnNames);

                function walk(node,inDeclaration){
                    if(!node||typeof node!=='object')return;
                    var isDecl=node.type==='FunctionDeclaration'||node.type==='VariableDeclarator';

                    if(node.type==='CallExpression'){
                        var callee=node.callee;
                        if(callee.type==='Identifier'&&fnSet.has(callee.name)){
                            var line=callee.loc?callee.loc.start.line:0;
                            if(!defLines[callee.name]||defLines[callee.name]!==line){
                                calls[callee.name]++;
                            }
                        }
                        node.arguments.forEach(function(arg){
                            if(arg.type==='Identifier'&&fnSet.has(arg.name)){
                                refs[arg.name]++;
                            }
                        });
                    }

                    if(node.type==='ArrayExpression'){
                        node.elements.forEach(function(el){
                            if(el&&el.type==='Identifier'&&fnSet.has(el.name)){
                                refs[el.name]++;
                            }
                        });
                    }
                    if(node.type==='Property'&&node.value&&node.value.type==='Identifier'&&fnSet.has(node.value.name)){
                        refs[node.value.name]++;
                    }

                    if(node.type==='Identifier'&&fnSet.has(node.name)&&!inDeclaration){
                        // Identifier references are handled via the surrounding parent nodes.
                    }

                    for(var key in node){
                        if(key==='loc'||key==='range'||key==='start'||key==='end')continue;
                        var child=node[key];
                        var nextInDecl=isDecl&&(key==='id'||key==='key');
                        if(Array.isArray(child)){
                            child.forEach(function(c){walk(c,nextInDecl);});
                        }else if(child&&typeof child==='object'&&child.type){
                            walk(child,nextInDecl);
                        }
                    }
                }

                walk(ast,false);
                fnNames.forEach(function(fn){
                    calls[fn]=calls[fn]+(refs[fn]||0);
                });
                return calls;
            }catch(e){
                // Fall back to regex below.
            }
        }

        return Parser.countCandidateCalls(content,fnNames,{isJS:true});
};

Parser.buildFunctionNameIndex=function(fnNames){
        var exact=new Set();
        var byBase=Object.create(null);
        (fnNames||[]).forEach(function(fn){
            if(typeof fn!=='string'||!fn)return;
            exact.add(fn);
            if(fn.indexOf('.')>=0){
                var parts=fn.split('.');
                var base=parts[parts.length-1];
                if(!byBase[base])byBase[base]=[];
                byBase[base].push(fn);
            }
        });
        return{exact:exact,byBase:byBase};
};

Parser.buildFunctionDefLineIndex=function(fnDefs){
        var byFile=Object.create(null);
        (fnDefs||[]).forEach(function(fn){
            if(!byFile[fn.file])byFile[fn.file]=Object.create(null);
            byFile[fn.file][fn.name]=fn.line;
        });
        return byFile;
};

Parser.functionKey=function(fn){
        if(!fn)return'';
        return [fn.file||'',fn.line||'',String(fn.name==null?'':fn.name)].join('|');
};

Parser.buildFunctionDefinitionIndex=function(fnDefs){
        var byName=Object.create(null);
        var byKey=Object.create(null);
        (fnDefs||[]).forEach(function(fn){
            if(!fn||typeof fn.name!=='string'||!fn.name)return;
            var key=Parser.functionKey(fn);
            fn.key=key;
            if(byKey[key])return;
            byKey[key]=fn;
            if(!byName[fn.name])byName[fn.name]=[];
            byName[fn.name].push(fn);
        });
        return{byName:byName,byKey:byKey};
};

// Pre-compute project-level context for import resolution (Go module name, Java roots, etc.)
Parser._importContext=null;
Parser.buildImportContext=function(files){
    var ctx={goModuleName:null,javaRoots:['src/main/java','src/test/java','src'],dirFirstFile:Object.create(null)};
    // Find go.mod → extract module name
    (files||[]).forEach(function(f){
        var p=String(f.path||f.name||'').replace(/\\/g,'/');
        if(p==='go.mod'||p.endsWith('/go.mod')){
            var m=(f.content||'').match(/^\s*module\s+(\S+)/m);
            if(m)ctx.goModuleName=m[1].trim();
        }
    });
    // Directory → first file map (for Go package directory resolution)
    (files||[]).forEach(function(f){
        var p=String(f.path||f.name||'').replace(/\\/g,'/').replace(/^\/+/,'');
        if(!p)return;
        var slash=p.lastIndexOf('/');
        if(slash<0)return;
        var dir=p.substring(0,slash).toLowerCase();
        if(!ctx.dirFirstFile[dir])ctx.dirFirstFile[dir]=p;
    });
    // Detect Java source roots from package declarations in .java files
    var javaRootSet=new Set();
    (files||[]).forEach(function(f){
        if(!f.path||!f.path.endsWith('.java')||!f.content)return;
        var pkg=f.content.match(/^\s*package\s+([\w.]+)\s*;/m);
        if(!pkg)return;
        var pkgPath=pkg[1].replace(/\./g,'/');
        var dir=f.path.replace(/\\/g,'/').split('/').slice(0,-1).join('/');
        if(dir.endsWith(pkgPath)){var root=dir.slice(0,dir.length-pkgPath.length).replace(/\/$/,'');if(root)javaRootSet.add(root);}
    });
    if(javaRootSet.size>0)ctx.javaRoots=Array.from(javaRootSet);
    Parser._importContext=ctx;
    return ctx;
};

Parser.resolveCallGraphImportPath=function(importPath,fromFile,files){
        if(!importPath||/^(?:node:|https?:|data:|mailto:)/i.test(importPath))return null;
        var fromPath=String(fromFile||'').replace(/\\/g,'/').replace(/^\/+/,'');
        var fromDir=fromPath.indexOf('/')>=0?fromPath.split('/').slice(0,-1).join('/'):'';
        var fromExt=(fromPath.split('.').pop()||'').toLowerCase();
        var isPython=['py','pyw','pyi'].indexOf(fromExt)>=0;
        var isGo=fromExt==='go';
        var isJavaLike=['java','kt','kts','scala','groovy'].indexOf(fromExt)>=0;
        var isCS=fromExt==='cs';
        var isRust=fromExt==='rs';
        var candidates=[];
        function normalizePath(path){
            var out=[];
            String(path||'').replace(/\\/g,'/').split('/').forEach(function(part){
                if(!part||part==='.')return;
                if(part==='..')out.pop();
                else out.push(part);
            });
            return out.join('/');
        }
        function addCandidate(path){
            path=normalizePath(path);
            if(path&&candidates.indexOf(path)<0)candidates.push(path);
        }

        if(importPath.startsWith('@/'))addCandidate('src/'+importPath.slice(2));
        else if(importPath.startsWith('~/'))addCandidate('src/'+importPath.slice(2));
        else if(importPath.startsWith('./')||importPath.startsWith('../'))addCandidate((fromDir?fromDir+'/':'')+importPath);
        else if(isPython&&/^\.+/.test(importPath)){
            var dotCount=(importPath.match(/^\.+/)||[''])[0].length;
            var rest=importPath.slice(dotCount).replace(/\./g,'/');
            var parts=fromDir?fromDir.split('/'):[];
            for(var di=1;di<dotCount;di++)parts.pop();
            addCandidate(parts.concat(rest?rest.split('/'):[]).join('/'));
        }else if(isPython){
            var modulePath=importPath.replace(/\./g,'/');
            addCandidate((fromDir?fromDir+'/':'')+modulePath);
            addCandidate(modulePath);
        }else if(isGo){
            // Skip Go stdlib (first path segment has no dot: "fmt", "net/http", etc.)
            if(!importPath.split('/')[0].includes('.'))return null;
            var ctx=Parser._importContext;
            var modName=ctx&&ctx.goModuleName;
            if(modName&&importPath.startsWith(modName)){
                var goPkg=importPath.slice(modName.length).replace(/^\//,'');
                if(goPkg)addCandidate(goPkg);
            }else if(!modName){
                // Without go.mod, try stripping first two segments (owner/repo)
                var segs=importPath.split('/');
                if(segs.length>2)addCandidate(segs.slice(2).join('/'));
            }
        }else if(isJavaLike){
            // com.example.Foo → try multiple source roots + plain path
            var ctx2=Parser._importContext;
            var roots=(ctx2&&ctx2.javaRoots)||['src/main/java','src/test/java','src'];
            var javaPath=importPath.replace(/\./g,'/');
            roots.forEach(function(root){addCandidate(root+'/'+javaPath);});
            addCandidate(javaPath);
        }else if(isCS){
            // MyApp.Services.MyService → MyApp/Services/MyService
            var csPath=importPath.replace(/\./g,'/');
            addCandidate(csPath);addCandidate('src/'+csPath);
        }else if(isRust&&importPath.startsWith('crate::')){
            // crate::module::sub → src/module/sub
            var rustPath=importPath.slice('crate::'.length).replace(/::/g,'/');
            addCandidate('src/'+rustPath);addCandidate(rustPath);
        }else{
            return null;
        }

        var pathMap=Object.create(null);
        (files||[]).forEach(function(file){
            var p=String(file.path||file.name||'').replace(/\\/g,'/').replace(/^\/+/,'');
            if(p)pathMap[p.toLowerCase()]=p;
        });

        // Go: try directory-based match first (Go packages = directories, not single files)
        if(isGo){
            var goCtx=Parser._importContext;
            if(goCtx&&goCtx.dirFirstFile){
                for(var gi=0;gi<candidates.length;gi++){
                    var goFile=goCtx.dirFirstFile[normalizePath(candidates[gi]).toLowerCase()];
                    if(goFile)return goFile;
                }
            }
        }

        var exts=['','.js','.jsx','.ts','.tsx','.mjs','.cjs','.vue','.svelte',
                  '.py','.pyw','.pyi','/__init__.py',
                  '.go','.java','.kt','.kts','.cs','.rb','.rs','.swift','.scala','.groovy',
                  '.tf','.sol','.vba','.bas','.cls','/index.js','/index.jsx','/index.ts','/index.tsx'];
        for(var i=0;i<candidates.length;i++){
            for(var j=0;j<exts.length;j++){
                var candidate=normalizePath(candidates[i]+exts[j]).toLowerCase();
                if(pathMap[candidate])return pathMap[candidate];
            }
        }
        return null;
};

Parser.extractCallGraphImportMap=function(content,fromFile,files){
        var locals=Object.create(null);
        var targets=new Set();
        function addLocal(localName,resolved){
            if(!localName||!resolved)return;
            if(!locals[localName])locals[localName]=new Set();
            locals[localName].add(resolved);
            targets.add(resolved);
        }
        function addTarget(resolved){
            if(resolved)targets.add(resolved);
        }
        function parseImportNames(spec,resolved){
            (spec||'').split(',').forEach(function(part){
                part=part.trim().replace(/^type\s+/,'').trim();
                if(!part||part==='default')return;
                var alias=part.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
                if(alias){addLocal(alias[2],resolved);return;}
                var destructured=part.match(/^([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*)$/);
                if(destructured){addLocal(destructured[2],resolved);return;}
                var name=part.match(/^([A-Za-z_$][\w$]*)$/);
                if(name)addLocal(name[1],resolved);
            });
        }
        function parseJsImportSpec(spec,resolved){
            spec=(spec||'').trim().replace(/^type\s+/,'').trim();
            if(!spec)return;
            var named=spec.match(/\{([\s\S]*?)\}/);
            if(named)parseImportNames(named[1],resolved);
            var ns=spec.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
            if(ns)addLocal(ns[1],resolved);
            var defaultPart=spec.split('{')[0].split('*')[0].split(',')[0].trim();
            if(/^[A-Za-z_$][\w$]*$/.test(defaultPart))addLocal(defaultPart,resolved);
        }

        var source=String(content||'');
        var match;
        var jsImportRe=/\bimport\s+(?!\()([\s\S]*?)\s+from\s*['"`]([^'"`]+)['"`]/g;
        while((match=jsImportRe.exec(source))!==null){
            var importSpec=match[1]||'';
            if(/^\s*type\b/.test(importSpec))continue;
            var resolved=Parser.resolveCallGraphImportPath(match[2],fromFile,files);
            addTarget(resolved);
            parseJsImportSpec(importSpec,resolved);
        }
        var cjsNamedRe=/\b(?:const|let|var)\s+\{([\s\S]*?)\}\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
        while((match=cjsNamedRe.exec(source))!==null){
            var namedResolved=Parser.resolveCallGraphImportPath(match[2],fromFile,files);
            addTarget(namedResolved);
            parseImportNames(match[1],namedResolved);
        }
        var cjsDefaultRe=/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
        while((match=cjsDefaultRe.exec(source))!==null){
            var defaultResolved=Parser.resolveCallGraphImportPath(match[2],fromFile,files);
            addLocal(match[1],defaultResolved);
        }

        var pyFromRe=/^\s*from\s+([.\w]+)\s+import\s+([^\n#]+)/gm;
        while((match=pyFromRe.exec(source))!==null){
            var pyResolved=Parser.resolveCallGraphImportPath(match[1],fromFile,files);
            addTarget(pyResolved);
            parseImportNames(match[2].replace(/[()]/g,''),pyResolved);
        }
        var pyImportRe=/^\s*import\s+([^\n#]+)/gm;
        while((match=pyImportRe.exec(source))!==null){
            match[1].split(',').forEach(function(part){
                part=part.trim();
                var pieces=part.split(/\s+as\s+/);
                var moduleName=(pieces[0]||'').trim();
                var localName=(pieces[1]||moduleName.split('.').pop()||'').trim();
                var moduleResolved=Parser.resolveCallGraphImportPath(moduleName,fromFile,files);
                addLocal(localName,moduleResolved);
            });
        }

        var srcExt=(String(fromFile||'').split('.').pop()||'').toLowerCase();

        // Go imports (single + grouped)
        if(srcExt==='go'){
            var goSingleRe=/^\s*import\s+(?:([a-zA-Z_]\w*)\s+)?["']([^"']+)["']/gm;
            while((match=goSingleRe.exec(source))!==null){
                var goRes=Parser.resolveCallGraphImportPath(match[2],fromFile,files);
                addTarget(goRes);
                var goAlias=match[1]||(match[2].split('/').pop());
                addLocal(goAlias,goRes);
            }
            var goGroupRe=/\bimport\s+\(([\s\S]*?)\)/g;
            while((match=goGroupRe.exec(source))!==null){
                var lineRe2=/^\s*(?:([a-zA-Z_]\w*|_|\.)\s+)?["']([^"']+)["']/gm;
                var lm;
                while((lm=lineRe2.exec(match[1]))!==null){
                    var grpRes=Parser.resolveCallGraphImportPath(lm[2],fromFile,files);
                    addTarget(grpRes);
                    var grpAlias=(lm[1]&&lm[1]!=='_'&&lm[1]!=='.')?lm[1]:(lm[2].split('/').pop());
                    addLocal(grpAlias,grpRes);
                }
            }
        }

        // Java imports
        if(srcExt==='java'){
            var javaImportRe=/^\s*import\s+(?:static\s+)?([\w.]+)\s*;/gm;
            while((match=javaImportRe.exec(source))!==null){
                if(match[1].endsWith('.*'))continue;
                var jRes=Parser.resolveCallGraphImportPath(match[1],fromFile,files);
                addTarget(jRes);addLocal(match[1].split('.').pop(),jRes);
            }
        }

        // Kotlin imports (import com.example.Foo [as Bar])
        if(srcExt==='kt'||srcExt==='kts'){
            var ktImportRe=/^\s*import\s+([\w.]+)(?:\s+as\s+(\w+))?/gm;
            while((match=ktImportRe.exec(source))!==null){
                if(match[1].endsWith('.*'))continue;
                var ktRes=Parser.resolveCallGraphImportPath(match[1],fromFile,files);
                addTarget(ktRes);addLocal(match[2]||match[1].split('.').pop(),ktRes);
            }
        }

        // C# using statements
        if(srcExt==='cs'){
            var csRe=/^\s*using\s+(?:(?:static|global)\s+)*(?:(\w+)\s*=\s*)?([\w.]+)\s*;/gm;
            var csSystemNs=/^(?:System|Microsoft|Windows|UnityEngine|Xamarin)/;
            while((match=csRe.exec(source))!==null){
                if(csSystemNs.test(match[2]))continue;
                var csRes=Parser.resolveCallGraphImportPath(match[2],fromFile,files);
                addTarget(csRes);
                if(match[1])addLocal(match[1],csRes);
            }
        }

        // Scala imports
        if(srcExt==='scala'){
            var scalaRe=/^\s*import\s+([\w.]+)(?:\.\{([^}]+)\})?/gm;
            while((match=scalaRe.exec(source))!==null){
                var scalaRes=Parser.resolveCallGraphImportPath(match[1],fromFile,files);
                addTarget(scalaRes);
                if(match[2]){parseImportNames(match[2],scalaRes);}
                else{addLocal(match[1].split('.').pop(),scalaRes);}
            }
        }

        // Solidity imports: import "./token.sol"; or import {Foo} from "./foo.sol";
        if(srcExt==='sol'){
            var solRe=/^\s*import\s+(?:\{[^}]*\}\s+from\s+)?["']([^"']+)["']/gm;
            while((match=solRe.exec(source))!==null){
                var solRes=Parser.resolveCallGraphImportPath(match[1],fromFile,files);
                addTarget(solRes);
            }
        }

        // Terraform module sources: module "name" { source = "./path" }
        if(srcExt==='tf'||srcExt==='tfvars'){
            var tfSrcRe=/^\s*source\s*=\s*["']([^"']+)["']/gm;
            while((match=tfSrcRe.exec(source))!==null){
                // Only resolve local paths (start with ./ or ../)
                var tfPath=match[1];
                if(tfPath.startsWith('./')||tfPath.startsWith('../')){
                    var tfRes=Parser.resolveCallGraphImportPath(tfPath,fromFile,files);
                    addTarget(tfRes);
                }
            }
        }

        var localFiles=Object.create(null);
        Object.keys(locals).forEach(function(name){
            localFiles[name]=Array.from(locals[name]);
        });
        return{locals:localFiles,targets:targets};
};

