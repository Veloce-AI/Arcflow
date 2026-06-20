/* analysis/graph-builder.js - buildTree, buildAnalysisData, runAnalysisData */
// Core graph/tree building and main analysis pipeline
// ---------------------------------------------------------------------------

function buildTree(files){
    var root={name:'root',path:'',children:{},files:[]};
    files.forEach(function(f){
        var parts=f.folder&&f.folder!=='root'?f.folder.split('/'):[];
        var cur=root;
        parts.forEach(function(p,i){
            var path=parts.slice(0,i+1).join('/');
            if(!cur.children[p])cur.children[p]={name:p,path:path,children:{},files:[]};
            cur=cur.children[p];
        });
        cur.files.push(f);
    });
    return root;
}

function countFiles(n){return n.files.length+Object.values(n.children).reduce(function(s,c){return s+countFiles(c);},0);}

function calcFunctionCC(snippet){
    var cc=1;
    [/\bif\s*[\(\s]/g,/\belse\s+if\s*[\(\s]/g,/\belif\s+/g,/\bwhile\s*[\(\s]/g,/\bfor\s*[\(\s]/g,
     /\bcase\s+/g,/\bcatch\s*[\(\s]/g,/&&/g,/\|\|/g,/\?\s*[^:\s]/g,/\band\b/g,/\bor\b/g
    ].forEach(function(p){var m=snippet.match(p);if(m)cc+=m.length;});
    return cc;
}
function ccLevel(cc){return cc>20?'critical':cc>10?'high':cc>4?'medium':'low';}
// #41 Cognitive complexity — nesting-weighted (SonarQube method)
function calcFunctionCogCC(snippet){
    var cog=0,nesting=0;
    var lines=snippet.split('\n');
    var nestRe=/\b(if|else\s+if|elif|for\b|while\b|do\b|switch\b|catch\b|with\b)\b/;
    lines.forEach(function(l){
        var opens=(l.match(/\{/g)||[]).length,closes=(l.match(/\}/g)||[]).length;
        if(nestRe.test(l))cog+=(1+nesting);
        if(/\belse\b/.test(l)&&!/\belse\s+if\b/.test(l))cog+=1;
        nesting=Math.max(0,nesting+opens-closes);
    });
    cog+=(snippet.match(/&&|\|\|/g)||[]).length;
    return Math.max(1,cog);
}

async function buildAnalysisData(options){
    var analyzed=options.analyzed||[];
    var allFns=options.allFns||[];
    var excludePatterns=options.excludePatterns||[];
    var progress=typeof options.progress==='function'?options.progress:function(){};
    var yieldFn=options.yieldFn||yieldToBrowser;
    var CALL_BATCH=30;

    progress('Building dependency graph (1/6)...');
    await yieldFn();
    await Parser.prepareTreeSitter(analyzed);
    var fnDefIndex=Parser.buildFunctionDefinitionIndex(allFns);
    var fnNames=Object.keys(fnDefIndex.byName);
    var fnNameIndex=Parser.buildFunctionNameIndex(fnNames);
    var fnDefLineIndex=Parser.buildFunctionDefLineIndex(allFns);
    Parser.buildImportContext(analyzed);
    var fileImportInfo=Object.create(null);
    analyzed.forEach(function(file){
        fileImportInfo[file.path]=Parser.extractCallGraphImportMap(file.content||'',file.path,analyzed);
    });
    var conns=[];
    var fnStats=Object.create(null);

    function createFunctionStat(fn){
        return{
            key:fn.key,
            name:fn.name,
            internal:0,
            external:0,
            callers:new Map(),
            file:fn.file,
            folder:fn.folder,
            line:fn.line,
            code:fn.code,
            isTopLevel:fn.isTopLevel!==false,
            isExported:fn.isExported||false,
            isClassMethod:fn.isClassMethod||false,
            type:fn.type||'function',
            decorators:fn.decorators||null,
            className:fn.className||null
        };
    }

    function firstDefinitionFromOneFile(defs){
        if(!defs.length)return null;
        var file=defs[0].file;
        for(var i=1;i<defs.length;i++){
            if(defs[i].file!==file)return null;
        }
        return defs[0];
    }

    function resolveCallDefinitions(fnName,file){
        var defs=fnDefIndex.byName[fnName]||[];
        if(!defs.length)return[];
        var sameFile=defs.filter(function(def){return def.file===file.path;});
        var sameFileDef=firstDefinitionFromOneFile(sameFile);
        if(sameFileDef)return[sameFileDef];
        if(defs.length===1)return[defs[0]];

        var imports=fileImportInfo[file.path]||{locals:Object.create(null),targets:new Set()};
        var directImports=(imports.locals&&imports.locals[fnName])||[];
        var matches=[];
        if(directImports.length){
            matches=defs.filter(function(def){return directImports.indexOf(def.file)>=0;});
            var directDef=firstDefinitionFromOneFile(matches);
            if(directDef)return[directDef];
        }

        if(imports.targets&&typeof imports.targets.has==='function'){
            matches=defs.filter(function(def){return imports.targets.has(def.file);});
            var importedDef=firstDefinitionFromOneFile(matches);
            if(importedDef)return[importedDef];
        }
        return[];
    }

    Object.keys(fnDefIndex.byKey).forEach(function(key){
        fnStats[key]=createFunctionStat(fnDefIndex.byKey[key]);
    });

    for(var bi=0;bi<analyzed.length;bi+=CALL_BATCH){
        var batchEnd=Math.min(bi+CALL_BATCH,analyzed.length);
        progress('Analyzing dependencies (2/6)... '+batchEnd+'/'+analyzed.length+' files');
        for(var fi=bi;fi<batchEnd;fi++){
            var file=analyzed[fi];
            if(!file.content)continue;
            var calls=Parser.findCalls(file.content,fnNames,file.path,fnDefLineIndex,fnNameIndex);
            Object.entries(calls).forEach(function(entry){
                var fn=entry[0],cnt=entry[1];
                if(cnt<=0)return;
                var defs=resolveCallDefinitions(fn,file);
                defs.forEach(function(def){
                    var stat=fnStats[def.key];
                    if(!stat)return;
                    if(def.file===file.path){
                        stat.internal+=cnt;
                    }else{
                        conns.push({source:def.file,target:file.path,fn:fn,count:cnt,functionKey:def.key});
                        var ex=stat.callers.get(file.path);
                        if(ex)ex.count+=cnt;
                        else stat.callers.set(file.path,{file:file.path,name:file.name,count:cnt});
                        stat.external+=cnt;
                    }
                });
            });
        }
        await yieldFn();
    }
    Object.values(fnStats).forEach(function(s){s.callers=Array.from(s.callers.values());s.count=s.internal+s.external;});

    progress('Resolving markdown links...');
    await yieldFn();
    var mdAllPaths=analyzed.map(function(f){return f.path;});
    analyzed.forEach(function(file){
        if(!Parser.isMarkdown(file.name))return;
        file.layer='note';
        if(!file.content)return;
        var links=Parser.extractMarkdownLinks(file.content);
        var deps=[];
        links.forEach(function(link){
            var resolved=Parser.resolveMarkdownLink(link.target,file.path,mdAllPaths,link.kind);
            deps.push({kind:link.kind,raw:link.raw,target:link.target,resolved:resolved});
            if(resolved&&resolved!==file.path){
                conns.push({source:file.path,target:resolved,fn:link.raw,count:1,kind:link.kind});
            }
        });
        file.dependencies=deps;
    });
    analyzed.forEach(function(f){if(!f.dependencies)f.dependencies=[];});

    // Direct import-level edges for non-JS/TS languages (supplements function call analysis)
    progress('Resolving cross-language import edges (4/6)...');
    await yieldFn();
    var jsExts=new Set(['js','jsx','ts','tsx','mjs','cjs','md','markdown','html','htm','vue','svelte']);
    var importConnSet=new Set(conns.map(function(c){return c.source+'|'+c.target;}));
    analyzed.forEach(function(file){
        var ext=(file.path||'').split('.').pop().toLowerCase();
        if(jsExts.has(ext))return;
        var info=fileImportInfo[file.path];
        if(!info||!info.targets)return;
        info.targets.forEach(function(imported){
            if(!imported||imported===file.path)return;
            var key=imported+'|'+file.path;
            if(!importConnSet.has(key)){importConnSet.add(key);conns.push({source:imported,target:file.path,fn:'import',count:1,kind:'import'});}
        });
    });

    var issues=[];
    var deadFns=Object.entries(fnStats).filter(function(x){
        var stats=x[1],name=stats.name;
        if(stats.internal>0||stats.external>0)return false;
        if(stats.isClassMethod)return false;
        if(!stats.isTopLevel)return false;
        if(stats.decorators&&stats.decorators.length>0)return false;
        if(stats.type==='class'||stats.type==='dataclass'||stats.type==='abstract_class')return false;
        var baseName=name.includes('.')?name.split('.').pop():name;
        if(baseName.startsWith('__')&&baseName.endsWith('__'))return false;
        if(baseName.startsWith('test_')||baseName==='setUp'||baseName==='tearDown'||baseName==='setUpClass'||baseName==='tearDownClass')return false;
        if(stats.file&&(stats.file.includes('test_')||stats.file.includes('_test.')||stats.file.includes('/tests/')))return false;
        if((baseName==='upgrade'||baseName==='downgrade')&&stats.file&&(stats.file.includes('migration')||stats.file.includes('alembic')||stats.file.includes('versions')))return false;
        if(['main','create_app','make_app','get_app','setup','configure','register','on_startup','on_shutdown','lifespan'].indexOf(baseName)>=0)return false;
        if(stats.isExported&&stats.file&&/\.[jt]sx?$/.test(stats.file))return false;
        if(stats.file&&(/\.(?:spec|test)\.[jt]sx?$/.test(stats.file)||stats.file.includes('__tests__')))return false;
        return true;
    });
    if(deadFns.length)issues.push({type:'warning',title:deadFns.length+' Unused Functions',desc:'Functions not called from other files',items:deadFns.map(function(x){return{name:x[1].name,file:x[1].file,line:x[1].line,code:x[1].code};})});

    var godFiles=analyzed.filter(function(f){return f.functions.length>15;});
    if(godFiles.length)issues.push({type:'critical',title:godFiles.length+' Large Files',desc:'Files with 15+ functions',items:godFiles.map(function(f){return{name:f.name+' ('+f.functions.length+' fns)',file:f.path,fns:f.functions.length,lines:f.lines};})});

    var coupling=Object.create(null);
    conns.forEach(function(c){coupling[c.target]=(coupling[c.target]||0)+1;});
    var highCoup=Object.entries(coupling).filter(function(x){return x[1]>8;}).sort(function(a,b){return b[1]-a[1];});
    if(highCoup.length)issues.push({type:'warning',title:highCoup.length+' Highly Coupled',desc:'Files imported by 8+ others',items:highCoup.map(function(x){return{name:x[0].split('/').pop()+' ('+x[1]+' imports)',file:x[0],imports:x[1]};})});

    var connSet=new Set(conns.map(function(c){return c.source+'|'+c.target;}));
    var circular=[];
    conns.forEach(function(c){
        if(connSet.has(c.target+'|'+c.source)){
            var key=[c.source,c.target].sort().join('|');
            if(!circular.includes(key))circular.push(key);
        }
    });
    if(circular.length)issues.push({type:'critical',title:circular.length+' Circular Dependencies',desc:'Files that import each other',items:circular.map(function(p){var parts=p.split('|');return{name:parts.map(function(x){return x.split('/').pop();}).join(' ↔ '),files:parts};})});

    progress('Detecting patterns (3/6)...');
    await yieldFn();
    var patterns=Parser.detectPatterns(analyzed);
    var securityIssues=Parser.detectSecurity(analyzed);
    var apiRoutes=Parser.detectApiRoutes(analyzed);
    var componentData=Parser.detectComponents(analyzed);

    progress('Analyzing code quality (4/6)...');
    await yieldFn();
    var duplicates=Parser.detectDuplicates(analyzed,allFns);
    var layerViolations=Parser.detectLayerViolations(analyzed,conns);
    for(var ci=0;ci<analyzed.length;ci+=CALL_BATCH){
        var cEnd=Math.min(ci+CALL_BATCH,analyzed.length);
        for(var cj=ci;cj<cEnd;cj++){
            analyzed[cj].complexity=analyzed[cj].isCode!==false?Parser.calcComplexity(analyzed[cj].content,analyzed[cj].path):{score:0,level:'low'};
        }
        if(ci+CALL_BATCH<analyzed.length)await yieldFn();
    }

    // Per-file Maintainability Index
    analyzed.forEach(function(f){
        if(!f.isCode||!f.content||f.lines<1){f.mi=null;f.miLevel=null;return;}
        var cc=(f.complexity&&f.complexity.score)||1;
        f.mi=calcMI(f.content,cc,f.lines);
        f.miLevel=miLevel(f.mi);
    });

    // Per-function cyclomatic + cognitive complexity (#41)
    var fileLineMap={};
    analyzed.forEach(function(f){if(f.content)fileLineMap[f.path]=f.content.split('\n');});
    allFns.forEach(function(fn){
        var lines=fileLineMap[fn.file];
        if(!lines){fn.cc=1;fn.ccLevel='low';fn.cogCC=1;return;}
        var start=Math.max(0,fn.line-1);
        var snippet=lines.slice(start,Math.min(lines.length,start+80)).join('\n');
        fn.cc=calcFunctionCC(snippet);
        fn.ccLevel=ccLevel(fn.cc);
        fn.cogCC=calcFunctionCogCC(snippet);
    });

    // Build intra-file function call graph (who calls whom within the same file)
    analyzed.forEach(function(f){
        f.callGraph=[];
        if(!f.functions||f.functions.length<2)return;
        var flines=fileLineMap[f.path];
        if(!flines)return;
        var fnNames=f.functions.map(function(fn){return fn.name;});
        var seen={};
        f.functions.forEach(function(fn){
            var start=Math.max(0,fn.line-1);
            var snippet=flines.slice(start,Math.min(flines.length,start+80)).join('\n');
            fnNames.forEach(function(other){
                if(other===fn.name)return;
                var k=fn.name+'->'+other;
                if(!seen[k]&&new RegExp('\\b'+other+'\\s*\\(').test(snippet)){seen[k]=1;f.callGraph.push({from:fn.name,to:other});}
            });
        });
    });

    progress('Building architecture diagram (5/6)...');
    await yieldFn();
    var architectureDiagram=buildArchitectureDiagram(analyzed);

    progress('Finalizing (6/6)...');
    await yieldFn();
    var todos=Parser.collectTodos(analyzed); // #43 — must run before content is nulled
    analyzed.forEach(function(f){f.content=null;});

    var folders=[...new Set(analyzed.map(function(f){return f.folder;}))].sort();
    var tree=buildTree(analyzed);
    var totalLoc=analyzed.reduce(function(s,f){return s+f.lines;},0);
    var langStats=Object.create(null);
    var parserStats=Object.create(null);
    analyzed.forEach(function(f){
        var ext=f.name.split('.').pop().toLowerCase();
        langStats[ext]=(langStats[ext]||0)+f.lines;
        var provenance=f.parserProvenance||Parser.getParserProvenance(f.path||f.name);
        f.parserProvenance=provenance;
        parserStats[provenance]=(parserStats[provenance]||0)+1;
    });
    var langArray=Object.entries(langStats).sort(function(a,b){return b[1]-a[1];}).map(function(e){return{ext:e[0],lines:e[1],pct:totalLoc?Math.round(e[1]/totalLoc*100):0};});
    var parserArray=Object.entries(parserStats).sort(function(a,b){return b[1]-a[1];}).map(function(e){return{mode:e[0],files:e[1]};});

    if(duplicates.length>0){
        var nameDups=duplicates.filter(function(d){return d.type==='name';});
        var codeDups=duplicates.filter(function(d){return d.type==='code';});
        if(nameDups.length)issues.push({type:'warning',title:nameDups.length+' Duplicate Function Names',desc:'Same function name in multiple files',items:nameDups.map(function(d){return{name:d.name+' ('+d.count+' files)',suggestion:d.suggestion,files:d.files,count:d.count};})});
        if(codeDups.length)issues.push({type:'warning',title:codeDups.length+' Similar Code Blocks',desc:'Copy-paste code detected',items:codeDups.map(function(d){return{name:d.name,suggestion:d.suggestion,files:d.files};})});
    }
    if(layerViolations.length>0){
        issues.push({type:'critical',title:layerViolations.length+' Architecture Violations',desc:'Lower layers importing from higher layers',items:layerViolations.map(function(v){return{name:v.fromLayer+' → '+v.toLayer,file:v.from,toFile:v.to,fn:v.fn,suggestion:v.suggestion};})});
    }
    var highComplexity=analyzed.filter(function(f){return f.complexity&&f.complexity.level==='critical';}).sort(function(a,b){return b.complexity.score-a.complexity.score;});
    if(highComplexity.length)issues.push({type:'warning',title:highComplexity.length+' High Complexity Files',desc:'Files with complexity score >30',items:highComplexity.map(function(f){return{name:f.name+' ('+f.complexity.score+')',file:f.path,score:f.complexity.score,lines:f.lines};})});

    var dataObj={
        files:analyzed,
        functions:allFns,
        connections:conns,
        fnStats:fnStats,
        folders:folders,
        tree:tree,
        issues:issues,
        patterns:patterns,
        securityIssues:securityIssues,
        apiRoutes:apiRoutes,
        components:componentData.components,
        duplicates:duplicates,
        layerViolations:layerViolations,
        architectureDiagram:architectureDiagram,
        todos:todos,
        deadFunctions:deadFns.map(function(x){var codeLines=x[1].code?x[1].code.split('\n').length:0;return{name:x[1].name,file:x[1].file,folder:x[1].folder,line:x[1].line,code:x[1].code,codeLines:codeLines,ext:x[1].file.split('.').pop()};}),
        excludePatterns:excludePatterns,
        stats:{files:analyzed.length,functions:allFns.length,connections:conns.length,dead:deadFns.length,patterns:patterns.length,security:securityIssues.filter(function(i){return i.severity==='high';}).length,duplicates:duplicates.length,violations:layerViolations.length,loc:totalLoc,languages:langArray,parserModes:parserArray}
    };
    dataObj.suggestions=Parser.generateSuggestions(dataObj);
    return dataObj;
}

// ---------------------------------------------------------------------------
// Inline Worker Runtime
// ---------------------------------------------------------------------------

var analysisWorkerSourcePromise=null;

function createAnalysisWorkerSource(){
    if(analysisWorkerSourcePromise)return analysisWorkerSourcePromise;
    analysisWorkerSourcePromise=fetch(window.location.href,{cache:'no-store'}).then(function(response){
        if(!response.ok)throw new Error('Unable to load analyzer source');
        return response.text();
    }).then(function(html){
        // Build markers via concatenation so they don't match themselves in the slice.
        var startMarker='// ===== CODEFLOW_'+'ANALYZER_START =====';
        var endMarker='// ===== CODEFLOW_'+'ANALYZER_END =====';
        var parserStart=html.indexOf(startMarker);
        var parserEnd=html.indexOf(endMarker,parserStart);
        if(parserStart<0||parserEnd<0)throw new Error('Analyzer source markers missing');
        var analyzerSource=html.slice(parserStart,parserEnd);
        return [
            'self.window=self;',
            'function getSecurityScanContent(file){return file&&file.content?file.content:\"\";}',
            'function isSanitizedPreviewRenderer(){return false;}',
            'function yieldToBrowser(){return Promise.resolve();}',
            'try{importScripts(\"https://cdnjs.cloudflare.com/ajax/libs/acorn/8.11.3/acorn.min.js\");}catch(e){}',
            'try{importScripts(\"https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js\");}catch(e){}',
            'try{importScripts(\"https://cdn.jsdelivr.net/npm/web-tree-sitter@0.20.8/tree-sitter.js\");}catch(e){}',
            analyzerSource,
            'self.onmessage=async function(event){',
            '  var payload=event.data||{};',
            '  try{',
            '    var data=await buildAnalysisData({',
            '      analyzed:payload.analyzed||[],',
            '      allFns:payload.allFns||[],',
            '      excludePatterns:payload.excludePatterns||[],',
            '      progress:function(message){self.postMessage({type:\"progress\",message:message});},',
            '      yieldFn:function(){return Promise.resolve();}',
            '    });',
            '    self.postMessage({type:\"done\",data:data});',
            '  }catch(error){',
            '    self.postMessage({type:\"error\",message:error&&error.message?error.message:String(error)});',
            '  }',
            '};'
        ].join('\n');
    });
    return analysisWorkerSourcePromise;
}

function runAnalysisData(options){
    if(typeof Worker==='undefined'||typeof Blob==='undefined'||typeof URL==='undefined'){
        return buildAnalysisData(options);
    }
    return createAnalysisWorkerSource().then(function(workerSource){
        return new Promise(function(resolve,reject){
            var workerUrl=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));
            var worker=new Worker(workerUrl);
            var settled=false;
            function cleanup(){
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
            }
            worker.onmessage=function(event){
                var message=event.data||{};
                if(message.type==='progress'){
                    if(typeof options.progress==='function')options.progress(message.message);
                    return;
                }
                settled=true;
                cleanup();
                if(message.type==='done')resolve(message.data);
                else reject(new Error(message.message||'Worker analysis failed'));
            };
            worker.onerror=function(error){
                if(settled)return;
                settled=true;
                cleanup();
                reject(error&&error.message?new Error(error.message):new Error('Worker analysis failed'));
            };
            worker.postMessage({
                analyzed:options.analyzed||[],
                allFns:options.allFns||[],
                excludePatterns:options.excludePatterns||[]
            });
        });
    }).catch(function(){
        return buildAnalysisData(options);
    });
}
// ===== CODEFLOW_ANALYZER_END =====

// expose graph-builder functions globally
window.buildTree = buildTree;
window.countFiles = countFiles;
window.buildAnalysisData = buildAnalysisData;
window.runAnalysisData = runAnalysisData;
