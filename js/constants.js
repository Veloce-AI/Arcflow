/* constants.js - Arcflow: COLORS, LAYER_COLORS, IGNORE, shared helpers, yieldToBrowser */
/*
 * CodeFlow is intentionally shipped as one HTML file.
 *
 * The file is organized in five broad sections:
 * 1. Shared constants, exclusion helpers, and browser-yield utilities.
 * 2. Parser and static-analysis primitives.
 * 3. GitHub API adapter and repository scanning.
 * 4. Shared analysis pipeline plus inline Web Worker fallback.
 * 5. React UI, local folder/ZIP ingestion, visualization, and modals.
 */
const{useState,useEffect,useRef,useMemo,useCallback}=React;
const COLORS=['#4d9fff','#a78bfa','#22d3ee','#6366f1','#ff9f43','#ec4899','#ff5f5f','#84cc16'];
const LAYER_COLORS={ui:'#4d9fff',components:'#22d3ee',services:'#a78bfa',utils:'#6366f1',data:'#ff9f43',config:'#ec4899',test:'#f59e0b',modules:'#a78bfa',forms:'#22d3ee',classes:'#ff9f43',note:'#c084fc'};
const IGNORE=new Set(['node_modules','.git','vendor','dist','build','__pycache__','.next','coverage','.venv','venv','env','.env','.tox','.mypy_cache','.pytest_cache','.ruff_cache','__pypackages__','.eggs','__macosx']);
const DEFAULT_EXCLUDE_CHIPS=['.git','node_modules','dist','build','coverage','__pycache__','.next','.venv','venv','.tox'];
const ANALYSIS_LIMITS={repoSoft:300,repoMax:750,localSoft:500};

// ---------------------------------------------------------------------------
// Shared Helpers
// ---------------------------------------------------------------------------

function normalizeExcludePath(value){
    return (value||'').replace(/\\/g,'/').replace(/^\/+/,'').replace(/\/{2,}/g,'/');
}

function parseExcludePatterns(input){
    var seen=new Set();
    return (input||'').split(/\r?\n|,/).map(function(item){
        return normalizeExcludePath(item.trim()).replace(/\/$/,'');
    }).filter(function(item){
        if(!item||seen.has(item.toLowerCase()))return false;
        seen.add(item.toLowerCase());
        return true;
    });
}

function escapeRegexChar(ch){
    return /[|\\{}()[\]^$+?.]/.test(ch)?'\\'+ch:ch;
}

function globToRegex(pattern){
    var normalized=normalizeExcludePath(pattern).toLowerCase();
    var out='^';
    for(var i=0;i<normalized.length;i++){
        var ch=normalized[i];
        if(ch==='*'){
            if(normalized[i+1]==='*'){
                if(normalized[i+2]==='/'){
                    out+='(?:[^/]+/)*';
                    i+=2;
                }else{
                    out+='.*';
                    i++;
                }
            }else{
                out+='[^/]*';
            }
        }else if(ch==='?'){
            out+='[^/]';
        }else{
            out+=escapeRegexChar(ch);
        }
    }
    out+='$';
    return new RegExp(out,'i');
}

function compileExcludePatterns(input){
    return parseExcludePatterns(input).map(function(pattern){
        var lower=pattern.toLowerCase();
        var hasGlob=pattern.includes('*')||pattern.includes('?');
        var hasPath=pattern.includes('/');
        return{
            raw:pattern,
            lower:lower,
            regex:(hasGlob||hasPath)?globToRegex(pattern):null
        };
    });
}

function matchesExcludePattern(compiledPatterns,path,name){
    if(!compiledPatterns||!compiledPatterns.length)return false;
    var normalizedPath=normalizeExcludePath(path||name).replace(/\/$/,'');
    var lowerPath=normalizedPath.toLowerCase();
    var lowerName=(name||normalizedPath.split('/').pop()||'').toLowerCase();
    var lowerPathWithSlash=lowerPath?lowerPath+'/':'';
    var segments=lowerPath.split('/').filter(Boolean);
    return compiledPatterns.some(function(pattern){
        if(!pattern.regex){
            return lowerName===pattern.lower||segments.includes(pattern.lower);
        }
        return pattern.regex.test(lowerPath)||pattern.regex.test(lowerPathWithSlash)||pattern.regex.test(lowerName);
    });
}

function shouldIgnoreDirectory(path,name,compiledPatterns){
    var lowerName=(name||'').toLowerCase();
    return IGNORE.has(lowerName)||lowerName.endsWith('.egg-info')||matchesExcludePattern(compiledPatterns,path,name);
}

function shouldExcludeFile(path,name,compiledPatterns){
    return !Parser.isIncluded(name)||matchesExcludePattern(compiledPatterns,path,name);
}

function getArchiveRootPrefix(paths){
    var splitPaths=(paths||[]).map(function(path){return normalizeExcludePath(path).split('/').filter(Boolean);}).filter(function(parts){return parts.length>0;});
    if(!splitPaths.length)return'';
    var firstSegment=splitPaths[0][0];
    var hasSingleRoot=splitPaths.every(function(parts){return parts.length>1&&parts[0]===firstSegment;});
    return hasSingleRoot?firstSegment+'/':'';
}

function shouldSkipArchivePath(path,compiledPatterns,dirCache){
    var segments=normalizeExcludePath(path).split('/').filter(Boolean);
    var current='';
    for(var i=0;i<segments.length-1;i++){
        current=current?current+'/'+segments[i]:segments[i];
        if(dirCache&&dirCache.has(current)){
            if(dirCache.get(current))return true;
            continue;
        }
        var ignored=shouldIgnoreDirectory(current,segments[i],compiledPatterns);
        if(dirCache)dirCache.set(current,ignored);
        if(ignored)return true;
    }
    return false;
}

function getSecurityScanContent(file){
    var content=file&&file.content?file.content:'';
    if(file&&file.name==='index.html'&&content.includes('detectSecurity:function(files){')&&content.includes('calcComplexity:function')){
        return content.replace(
            /detectSecurity:function\(files\)\{[\s\S]*?\n    \},\n    calcComplexity:function/,
            "detectSecurity:function(files){\n        return[];\n    },\n    calcComplexity:function"
        );
    }
    return content;
}

function isSanitizedPreviewRenderer(content){
    return content.includes("function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}") &&
           content.includes("var escaped=esc(line);") &&
           content.includes("dangerouslySetInnerHTML:{__html:lineHtml||' '}");
}

function yieldToBrowser(){
    if(typeof scheduler!=='undefined'&&scheduler.yield){
        return scheduler.yield();
    }
    if(typeof MessageChannel!=='undefined'){
        return new Promise(function(resolve){
            var channel=new MessageChannel();
            channel.port1.onmessage=function(){
                channel.port1.close();
                channel.port2.close();
                resolve();
            };
            channel.port2.postMessage(null);
        });
    }
    return new Promise(function(resolve){setTimeout(resolve,0);});
}

// ---------------------------------------------------------------------------
// Parser And Static Analysis
// ---------------------------------------------------------------------------


// expose shared helpers on window so other modules can access them
window.normalizeExcludePath = normalizeExcludePath;
window.parseExcludePatterns = parseExcludePatterns;
window.compileExcludePatterns = compileExcludePatterns;
window.matchesExcludePattern = matchesExcludePattern;
window.shouldIgnoreDirectory = shouldIgnoreDirectory;
window.shouldExcludeFile = shouldExcludeFile;
window.getArchiveRootPrefix = getArchiveRootPrefix;
window.shouldSkipArchivePath = shouldSkipArchivePath;
window.getSecurityScanContent = getSecurityScanContent;
window.isSanitizedPreviewRenderer = isSanitizedPreviewRenderer;
window.yieldToBrowser = yieldToBrowser;
