/* parser-core.js - Parser object shell: config, predicates, tree-sitter init, HTML/script extraction, markdown, layer detection */
// ===== CODEFLOW_ANALYZER_START =====
const Parser={
    // Tree-sitter parsers are loaded lazily from CDN and used when a language has
    // a stable grammar path. Regex remains an explicit fallback, not a silent lie.
    _tsRuntimePromise:null,
    _tsLanguagePromises:Object.create(null),
    _tsLanguages:Object.create(null),
    _tsParsers:Object.create(null),
    _callCandidateThreshold:250,
    treeSitterWasmBase:'https://cdn.jsdelivr.net/npm/tree-sitter-wasms@0.1.13/out/',
    treeSitterGrammars:{
        python:{grammar:'python',exts:['.py','.pyw','.pyi'],coverage:'calls'},
        javascript:{grammar:'javascript',exts:['.js','.jsx','.mjs','.cjs'],coverage:'available'},
        typescript:{grammar:'typescript',exts:['.ts'],coverage:'available'},
        tsx:{grammar:'tsx',exts:['.tsx'],coverage:'available'},
        go:{grammar:'go',exts:['.go'],coverage:'available'},
        rust:{grammar:'rust',exts:['.rs'],coverage:'available'},
        java:{grammar:'java',exts:['.java'],coverage:'available'},
        ruby:{grammar:'ruby',exts:['.rb'],coverage:'available'},
        php:{grammar:'php',exts:['.php'],coverage:'available'},
        c:{grammar:'c',exts:['.c','.h'],coverage:'available'},
        cpp:{grammar:'cpp',exts:['.cpp','.cc','.hpp'],coverage:'available'},
        csharp:{grammar:'c_sharp',exts:['.cs'],coverage:'available'},
        swift:{grammar:'swift',exts:['.swift'],coverage:'available'},
        kotlin:{grammar:'kotlin',exts:['.kt','.kts'],coverage:'available'},
        scala:{grammar:'scala',exts:['.scala'],coverage:'available'},
        elixir:{grammar:'elixir',exts:['.ex','.exs'],coverage:'available'},
        lua:{grammar:'lua',exts:['.lua'],coverage:'available'},
        bash:{grammar:'bash',exts:['.sh','.bash','.zsh','.fish'],coverage:'available'}
    },
    treeSitterFetchTimeoutMs:8000,
    _withTimeout:function(promise,ms){
        return Promise.race([
            promise,
            new Promise(function(_,reject){setTimeout(function(){reject(new Error('tree-sitter fetch timed out'));},ms);})
        ]);
    },
    initTreeSitter:async function(){
        if(this._tsRuntimePromise)return this._tsRuntimePromise;
        this._tsRuntimePromise=(async()=>{
            if(typeof TreeSitter==='undefined')return null;
            try{
                await Parser._withTimeout(TreeSitter.init({
                    locateFile:function(scriptName){
                        return 'https://cdn.jsdelivr.net/npm/web-tree-sitter@0.20.8/'+scriptName;
                    }
                }),Parser.treeSitterFetchTimeoutMs);
                return TreeSitter;
            }catch(e){
                return null;
            }
        })();
        return this._tsRuntimePromise;
    },
    getTreeSitterConfig:function(filename){
        var lower=(filename||'').toLowerCase();
        var configs=Object.values(Parser.treeSitterGrammars);
        for(var i=0;i<configs.length;i++){
            if(configs[i].exts.some(function(ext){return lower.endsWith(ext);})){
                return configs[i];
            }
        }
        return null;
    },
    loadTreeSitterLanguage:async function(config){
        if(!config)return null;
        if(this._tsLanguages[config.grammar])return this._tsLanguages[config.grammar];
        if(this._tsLanguagePromises[config.grammar])return this._tsLanguagePromises[config.grammar];
        this._tsLanguagePromises[config.grammar]=(async()=>{
            var runtime=await Parser.initTreeSitter();
            if(!runtime)return null;
            try{
                var lang=await Parser._withTimeout(runtime.Language.load(Parser.treeSitterWasmBase+'tree-sitter-'+config.grammar+'.wasm'),Parser.treeSitterFetchTimeoutMs);
                var parser=new runtime();
                parser.setLanguage(lang);
                Parser._tsLanguages[config.grammar]=lang;
                Parser._tsParsers[config.grammar]=parser;
                return lang;
            }catch(e){
                return null;
            }
        })();
        return this._tsLanguagePromises[config.grammar];
    },
    prepareTreeSitter:async function(files){
        var configs=new Map();
        (files||[]).forEach(function(file){
            var cfg=Parser.getTreeSitterConfig(file.path||file.name);
            if(cfg&&cfg.coverage==='calls')configs.set(cfg.grammar,cfg);
        });
        await Promise.all(Array.from(configs.values()).map(function(cfg){return Parser.loadTreeSitterLanguage(cfg);}));
    },
    getLoadedTreeSitterParser:function(filename){
        var cfg=Parser.getTreeSitterConfig(filename);
        return cfg?Parser._tsParsers[cfg.grammar]||null:null;
    },
    getParserProvenance:function(filename){
        var lower=(filename||'').toLowerCase();
        var cfg=Parser.getTreeSitterConfig(filename);
        if(cfg&&Parser._tsParsers[cfg.grammar])return cfg.coverage==='calls'?'tree-sitter:'+cfg.grammar+'-calls':'tree-sitter:'+cfg.grammar;
        if(['.js','.jsx','.ts','.tsx','.mjs','.cjs','.vue','.svelte'].some(function(ext){return lower.endsWith(ext);})&&typeof acorn!=='undefined')return 'acorn-babel';
        if(Parser.isMarkdown&&Parser.isMarkdown(filename))return 'markdown-link-parser';
        if(Parser.isCode(filename))return 'heuristic-regex';
        return 'text';
    },
    codeExts:['.js','.jsx','.ts','.tsx','.mjs','.cjs','.py','.pyw','.pyi','.java','.go','.rb','.php','.rs','.c','.cpp','.cc','.h','.hpp','.cs','.swift','.kt','.kts','.scala','.clj','.ex','.exs','.erl','.hs','.lua','.r','.R','.jl','.dart','.elm','.fs','.fsx','.ml','.pl','.pm','.sh','.bash','.zsh','.fish','.ps1','.psm1','.groovy','.gradle','.vba','.bas','.cls','.xlsm','.xlam','.xlsb','.xla','.xlw','.tf','.tfvars','.sol'],
    scriptContainerExts:['.html','.htm','.xhtml','.vue','.svelte'],
    textExts:['.md','.markdown','.txt','.json','.jsonl','.yaml','.yml','.toml','.xml','.html','.htm','.css','.scss','.sass','.less','.svg','.graphql','.gql','.sql','.prisma','.proto','.tf','.tfvars','.env','.env.example','.gitignore','.gitattributes','.gitmodules','.eslintrc','.prettierrc','.babelrc','.editorconfig','.ini','.cfg','.conf','.properties','.lock','.csv','.tsv','.rst','.tex','.cmake','.rake','.vba','.bas','.cls','.xlsm','.xlam','.xlsb','.xla','.xlw','.mod','.sum'],
    textNames:['dockerfile','containerfile','makefile','rakefile','gemfile','podfile','pipfile','procfile','brewfile','justfile','taskfile','cmakelists.txt','license','copying','notice','readme','changelog','authors','contributors','owners','codeowners','go.mod','go.sum'],
    binExts:['.png','.jpg','.jpeg','.gif','.ico','.webp','.bmp','.svg','.woff','.woff2','.ttf','.eot','.otf','.pdf','.zip','.tar','.gz','.rar','.7z','.exe','.dll','.so','.dylib','.bin','.dat','.db','.sqlite','.mp3','.mp4','.wav','.avi','.mov','.webm'],
    isCode:function(n){
        var lower=n.toLowerCase();
        return Parser.codeExts.some(function(e){return lower.endsWith(e);})||
            Parser.scriptContainerExts.some(function(e){return lower.endsWith(e);});
    },
    isText:function(n){
        var lower=n.toLowerCase();
        return Parser.textExts.some(function(e){return lower.endsWith(e);})||Parser.textNames.indexOf(lower)>=0;
    },
    isBinary:function(n){return Parser.binExts.some(function(e){return n.toLowerCase().endsWith(e);});},
    isIncluded:function(n){return !Parser.isBinary(n)&&(Parser.isCode(n)||Parser.isText(n));},
    isScriptContainer:function(n){return Parser.scriptContainerExts.some(function(e){return n.toLowerCase().endsWith(e);});},
    isVBA:function(n){return ['.vba','.bas','.cls','.xlsm','.xlam','.xlsb','.xla','.xlw'].some(function(e){return n.toLowerCase().endsWith(e);});},
    isHTML:function(n){return ['.html','.htm','.xhtml'].some(function(e){return n.toLowerCase().endsWith(e);});},
    isCSS:function(n){return ['.css','.scss','.sass','.less'].some(function(e){return n.toLowerCase().endsWith(e);});},
    isJSON:function(n){return ['.json'].some(function(e){return n.toLowerCase().endsWith(e);});},
    parseHTMLAttributes:function(attrs){
        if(!attrs)return[];
        var parsed=[];
        var attrRegex=/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        var match;
        while((match=attrRegex.exec(attrs))){
            var value=match[2]!==undefined?match[2]:(match[3]!==undefined?match[3]:match[4]);
            parsed.push({
                name:(match[1]||'').toLowerCase(),
                value:value===undefined?'':value,
                valueStart:value===undefined?-1:match.index+match[0].indexOf(value)
            });
        }
        return parsed;
    },
    getScriptTagAttribute:function(attrs,name){
        var parsed=Parser.parseHTMLAttributes(attrs);
        var lowered=name.toLowerCase();
        for(var i=0;i<parsed.length;i++){
            if(parsed[i].name===lowered)return parsed[i].value;
        }
        return'';
    },
    getScriptBlockInfo:function(attrs){
        var type=(Parser.getScriptTagAttribute(attrs,'type')||'').split(';')[0].trim().toLowerCase();
        var lang=(Parser.getScriptTagAttribute(attrs,'lang')||'').split(';')[0].trim().toLowerCase();
        var info={executable:false,isTS:false,sourceType:'script'};

        if(!type){
            info.executable=true;
        }else if(type==='module'){
            info.executable=true;
            info.sourceType='module';
        }else if(
            type.match(/^(?:text|application)\/(?:x-)?(?:java|ecma)script$/)||
            type==='text/babel'||type==='text/jsx'||type==='application/jsx'||
            type==='application/babel'
        ){
            info.executable=true;
        }else if(
            type.match(/^(?:text|application)\/(?:x-)?typescript$/)||
            type==='text/tsx'||type==='application/tsx'
        ){
            info.executable=true;
            info.isTS=true;
        }

        if(lang==='ts'||lang==='tsx'||lang==='typescript'){
            info.executable=true;
            info.isTS=true;
        }else if(lang==='js'||lang==='jsx'||lang==='javascript'||lang==='babel'){
            info.executable=true;
        }

        return info;
    },
    getEmbeddedCodeBlocks:function(content,filename,options){
        if(!content||!Parser.isScriptContainer(filename))return[];
        var blocks=[];
        var scriptRegex=/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi;
        var match;
        var scriptRanges=[];
        while((match=scriptRegex.exec(content))){
            var attrs=match[1]||'';
            var info=Parser.getScriptBlockInfo(attrs);
            var scriptContent=match[2]||'';
            scriptRanges.push({start:match.index,end:match.index+match[0].length});
            if(!info.executable||!scriptContent.trim())continue;
            var openTagEnd=match[0].indexOf('>');
            if(openTagEnd<0)continue;
            var bodyStart=match.index+openTagEnd+1;
            blocks.push({
                content:scriptContent,
                offset:content.slice(0,bodyStart).split('\n').length-1,
                isTS:info.isTS,
                sourceType:info.sourceType,
                kind:'script'
            });
        }

        if(options&&options.includeHandlers&&Parser.isHTML(filename)){
            var tagRegex=/<([a-z][\w:-]*)([^<>]*?)>/gi;
            while((match=tagRegex.exec(content))){
                var tagStart=match.index;
                var insideScript=false;
                for(var sri=0;sri<scriptRanges.length;sri++){
                    if(tagStart>=scriptRanges[sri].start&&tagStart<scriptRanges[sri].end){
                        insideScript=true;
                        break;
                    }
                }
                if(insideScript)continue;
                var attrs=match[2]||'';
                var attrsStart=match[0].indexOf(attrs);
                var parsedAttrs=Parser.parseHTMLAttributes(attrs);
                for(var ai=0;ai<parsedAttrs.length;ai++){
                    var attr=parsedAttrs[ai];
                    if(!/^on[a-z][\w:-]*$/i.test(attr.name)||attr.valueStart<0)continue;
                    if(!attr.value||!attr.value.trim())continue;
                    var valueStart=tagStart+attrsStart+attr.valueStart;
                    blocks.push({
                        content:attr.value,
                        offset:content.slice(0,valueStart).split('\n').length-1,
                        isTS:false,
                        sourceType:'script',
                        kind:'handler'
                    });
                }
            }
        }

        return blocks;
    },
    hasEmbeddedCode:function(content,filename){
        return Parser.getEmbeddedCodeBlocks(content,filename,{includeHandlers:true}).length>0;
    },
    isMarkdown:function(n){return ['.md','.markdown'].some(function(e){return n.toLowerCase().endsWith(e);});},
    // Mirror of tests/md-extractors.mjs::extractMarkdownLinks. Keep in sync.
    extractMarkdownLinks:function(content){
        if(!content)return[];
        var stripped=content.replace(/```[\s\S]*?```/g,'').replace(/~~~[\s\S]*?~~~/g,'').replace(/`[^`\n]*`/g,'');
        var links=[];
        var wikiRe=/\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g;
        var m;
        while((m=wikiRe.exec(stripped))!==null){
            links.push({kind:'wikilink',raw:m[0],target:m[1].trim()});
        }
        var mdRe=/(!?)\[((?:[^\[\]]|\[[^\[\]]*\])*)\]\(([^)\s]+?)(?:\s+"[^"]*")?\)/g;
        while((m=mdRe.exec(stripped))!==null){
            if(m[1]==='!')continue;
            var url=m[3].trim();
            if(!url)continue;
            if(/^(?:https?:|mailto:|ftp:|file:|tel:|#)/i.test(url))continue;
            var clean=url.split('#')[0].split('?')[0];
            if(!clean)continue;
            links.push({kind:'mdlink',raw:m[0],target:url});
        }
        return links;
    },
    // Mirror of tests/md-extractors.mjs::resolveMarkdownLink. Keep in sync.
    resolveMarkdownLink:function(rawTarget,fromPath,allPaths,kind){
        if(!rawTarget)return null;
        var allLower=allPaths.map(function(p){return p.toLowerCase();});
        function findExact(candidate){
            var c=candidate.toLowerCase();
            var i=allLower.indexOf(c);
            return i>=0?allPaths[i]:null;
        }
        function findWithMd(candidate){
            var hit=findExact(candidate);
            if(hit)return hit;
            if(!/\.(md|markdown)$/i.test(candidate)){
                var mdHit=findExact(candidate+'.md');
                if(mdHit)return mdHit;
                return findExact(candidate+'.markdown');
            }
            return null;
        }
        if(kind==='mdlink'){
            var cleanTarget=rawTarget.split('#')[0].split('?')[0];
            var resolved;
            if(cleanTarget.charAt(0)==='/'){
                resolved=cleanTarget.slice(1);
            }else{
                var fromDir=fromPath.indexOf('/')>=0?fromPath.split('/').slice(0,-1).join('/'):'';
                var parts=(fromDir?fromDir.split('/'):[]).concat(cleanTarget.split('/'));
                var out=[];
                for(var pi=0;pi<parts.length;pi++){
                    var p=parts[pi];
                    if(p===''||p==='.')continue;
                    if(p==='..'){out.pop();continue;}
                    out.push(p);
                }
                resolved=out.join('/');
            }
            var direct=findWithMd(resolved);
            if(direct)return direct;
        }
        var baseName=rawTarget.split('#')[0].split('?')[0].split('/').pop();
        if(!baseName)return null;
        for(var i=0;i<allPaths.length;i++){
            var pname=allPaths[i].split('/').pop().toLowerCase();
            if(/\.(md|markdown)$/i.test(baseName)){
                if(pname===baseName.toLowerCase())return allPaths[i];
            }else if(pname===baseName.toLowerCase()+'.md'||pname===baseName.toLowerCase()+'.markdown'){
                return allPaths[i];
            }
        }
        return null;
    },
    detectLayer:function(p){
        var l=p.toLowerCase();
        // Test files
        if(l.includes('/test')||l.match(/test_\w+\.py$/)||l.match(/\w+_test\.py$/)||l.includes('conftest'))return'test';
        // UI/View layer
        if(l.includes('/ui/')||l.includes('/views/')||l.includes('/pages/')||l.includes('/templates/')||l.includes('/static/'))return'ui';
        if(l.includes('/component'))return'components';
        // Service/API layer
        if(l.includes('/service')||l.includes('/api/')||l.includes('/controller')||l.includes('/endpoint')||l.includes('/router'))return'services';
        // Python middleware/handler layer
        if(l.includes('/middleware')||l.includes('/handler')||l.includes('/signal'))return'services';
        // Utility/Helper layer
        if(l.includes('/util')||l.includes('/helper')||l.includes('/lib/')||l.includes('/common/'))return'utils';
        // Data/Model layer
        if(l.includes('/data')||l.includes('/model')||l.includes('/store')||l.includes('/schema')||l.includes('/serializer'))return'data';
        // Python-specific data layers
        if(l.includes('/migration'))return'data';
        if(l.includes('/fixtures/'))return'data';
        // Task/Worker layer
        if(l.includes('/task')||l.includes('/worker')||l.includes('/celery')||l.includes('/job'))return'services';
        // Config layer
        if(l.includes('/config')||l.includes('/settings')||l.match(/settings\.py$/))return'config';
        // VBA-specific layer detection
        if(l.includes('/modules/')||l.includes('/bas/'))return'modules';
        if(l.includes('/forms/')||l.includes('/userforms/'))return'ui';
        if(l.includes('/classes/'))return'data';
        if(l.includes('/standard/'))return'utils';
        return'utils';
    },
};

function escapeHtml(value){
    return String(value==null?'':value)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
}

function renderTooltipHtml(title,stats){
    return '<div class="treemap-tooltip-title">'+escapeHtml(title)+'</div>'+stats.map(function(stat){
        return '<div class="treemap-tooltip-stat"><span>'+escapeHtml(stat.label)+':</span><span>'+escapeHtml(stat.value)+'</span></div>';
    }).join('');
}

// ---------------------------------------------------------------------------

// expose Parser and utility functions globally
window.Parser = Parser;
window.escapeHtml = escapeHtml;
window.renderTooltipHtml = renderTooltipHtml;
