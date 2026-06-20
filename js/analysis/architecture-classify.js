function getArchitectureScanFiles(files){
    return (files||[]).filter(function(file){
        var path=normalizeArchitecturePath(file.path||file.name);
        return !isArchitectureTestFile(path)&&!isArchitectureFixtureFile(path);
    });
}

function detectArchitectureFramework(files){
    var paths=getArchitectureScanFiles(files).map(function(f){return normalizeArchitecturePath(f.path||f.name).toLowerCase();});
    var hasNextConfig=paths.some(function(p){return /(^|\/)next\.config\.(js|mjs|ts|cjs)$/.test(p);});
    var hasAppRouter=paths.some(function(p){return /(^|\/)(src\/)?app\/.*(page|route)\.(js|jsx|ts|tsx)$/.test(p);});
    var hasPagesRouter=paths.some(function(p){return /(^|\/)(src\/)?pages\/.*\.(js|jsx|ts|tsx)$/.test(p);});
    if(hasNextConfig||hasAppRouter||hasPagesRouter)return'Next.js';
    if(paths.some(function(p){return /\.(html?|xhtml)$/.test(p);}))return'Browser App';
    if(paths.some(function(p){return /\.(jsx?|tsx?|mjs|cjs)$/.test(p);}))return'JavaScript/TypeScript';
    if(paths.some(function(p){return /\.(py|pyw|pyi)$/.test(p);}))return'Python';
    return'Generic';
}

function convertNextRouteSegment(segment){
    if(!segment||/^\(.*\)$/.test(segment))return null;
    var optionalCatchAll=segment.match(/^\[\[\.\.\.(.+)\]\]$/);
    if(optionalCatchAll)return':'+optionalCatchAll[1]+'*';
    var catchAll=segment.match(/^\[\.\.\.(.+)\]$/);
    if(catchAll)return':'+catchAll[1]+'*';
    var dynamic=segment.match(/^\[(.+)\]$/);
    if(dynamic)return':'+dynamic[1];
    return segment;
}

function nextRouteFromSegments(segments){
    var clean=[];
    (segments||[]).forEach(function(segment){
        var converted=convertNextRouteSegment(segment);
        if(converted)clean.push(converted);
    });
    return normalizeArchitectureRoute('/'+clean.join('/'));
}

function inferArchitectureRoute(path){
    var p=normalizeArchitecturePath(path);
    var match;

    match=p.match(/^(?:src\/)?app\/api\/(.+)\/route\.(js|jsx|ts|tsx)$/i);
    if(match)return nextRouteFromSegments(['api'].concat(match[1].split('/')));

    match=p.match(/^(?:src\/)?app\/api\/route\.(js|jsx|ts|tsx)$/i);
    if(match)return'/api';

    match=p.match(/^(?:src\/)?app\/(.+)\/page\.(js|jsx|ts|tsx)$/i);
    if(match)return nextRouteFromSegments(match[1].split('/'));

    match=p.match(/^(?:src\/)?app\/page\.(js|jsx|ts|tsx)$/i);
    if(match)return'/';

    match=p.match(/^(?:src\/)?pages\/api\/(.+)\.(js|jsx|ts|tsx)$/i);
    if(match){
        var apiParts=stripArchitectureExt(match[1]).split('/').filter(Boolean);
        if(apiParts[apiParts.length-1]==='index')apiParts.pop();
        return nextRouteFromSegments(['api'].concat(apiParts));
    }

    match=p.match(/^(?:src\/)?pages\/(.+)\.(js|jsx|ts|tsx)$/i);
    if(match){
        var routePath=stripArchitectureExt(match[1]);
        var parts=routePath.split('/').filter(Boolean);
        var first=parts[0]||'';
        if(first.charAt(0)==='_')return null;
        if(parts[parts.length-1]==='index')parts.pop();
        return nextRouteFromSegments(parts);
    }

    return null;
}

function extractArchitectureImports(content){
    var imports=[];
    var regexes=[
        /import\s+[\s\S]*?\s+from\s+['"`]([^'"`]+)['"`]/g,
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];
    regexes.forEach(function(regex){
        var match;
        while((match=regex.exec(content||'')))imports.push(match[1]);
    });
    return Array.from(new Set(imports));
}

function extractJsxComponents(content){
    var components=[];
    var ignored=new Set(['Fragment','React','Suspense','StrictMode']);
    var regex=/<([A-Z][A-Za-z0-9_]*)\b/g;
    var match;
    while((match=regex.exec(content||''))){
        if(!ignored.has(match[1]))components.push(match[1]);
    }
    return Array.from(new Set(components));
}

function extractNavigationLinks(content){
    var links=[];
    var regexes=[
        /<Link[^>]+href=["'`]([^"'`]+)["'`]/g,
        /<a[^>]+href=["'`]([^"'`]+)["'`]/g,
        /router\.(?:push|replace)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
        /navigate\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
    ];
    regexes.forEach(function(regex){
        var match;
        while((match=regex.exec(content||''))){
            var route=normalizeArchitectureRoute(match[1]);
            if(route&&route.charAt(0)==='/'&&!route.startsWith('/api'))links.push(route);
        }
    });
    return Array.from(new Set(links));
}

function extractApiCalls(content){
    var calls=[];
    var match;
    var fetchRegex=/fetch\s*\(\s*["'`]([^"'`]+)["'`](?:\s*,\s*\{([\s\S]{0,180}?)\})?/g;
    while((match=fetchRegex.exec(content||''))){
        var method='GET';
        var methodMatch=(match[2]||'').match(/method\s*:\s*["'`]([A-Za-z]+)["'`]/);
        if(methodMatch)method=methodMatch[1].toUpperCase();
        calls.push({method:method,url:normalizeArchitectureRoute(match[1])});
    }
    var axiosRegex=/axios\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g;
    while((match=axiosRegex.exec(content||''))){
        calls.push({method:match[1].toUpperCase(),url:normalizeArchitectureRoute(match[2])});
    }
    return calls.filter(function(call){return call.url&&call.url.startsWith('/api');});
}

function detectDatabaseUsage(content){
    return [
        /\bnew\s+PrismaClient\s*\(/,
        /\bprisma\.\w+\.(findMany|findUnique|findFirst|create|update|delete|upsert|count|aggregate)\s*\(/,
        /\bsupabase\.from\s*\(/,
        /\bmongoose\.model\b/,
        /\bpool\.query\s*\(/,
        /\bdb\.(select|insert|update|delete|query)\s*\(/,
        /\bcollection\s*\(/
    ].some(function(pattern){return pattern.test(content||'');});
}

function isLikelyReactComponentFile(path,content){
    var p=normalizeArchitecturePath(path);
    var base=architectureFileBaseName(p);
    return /(^|\/)(components|ui)\//i.test(p)||
        /^[A-Z]/.test(base)||
        /\.(jsx|tsx)$/i.test(p)||
        (/(from\s+['"`]react['"`]|React\.)/.test(content||'')&&/<[A-Z][A-Za-z0-9_]*\b/.test(content||''));
}

function classifyArchitectureFile(path,content){
    var p=normalizeArchitecturePath(path);
    var route=inferArchitectureRoute(p);
    if(route){
        return route.startsWith('/api')?{kind:'api',route:route}:{kind:'page',route:route};
    }
    var base=architectureFileBaseName(p);
    var dbUsage=detectDatabaseUsage(content);
    if(/^use[A-Z0-9_]/.test(base)||/(^|\/)hooks?\//i.test(p))return{kind:'hook',route:null};
    if(dbUsage&&/(^|\/)(db|database|prisma|models?|schema|repositories?|data)\b/i.test(p))return{kind:'database-adapter',route:null};
    if(/(^|\/)(services?|controllers?|server|actions)\//i.test(p))return{kind:'service',route:null};
    if(isLikelyReactComponentFile(p,content))return{kind:'component',route:null};
    if(dbUsage)return{kind:'database-adapter',route:null};
    return{kind:'utility',route:null};
}

function inferGenericArchitectureRoute(path){
    var p=normalizeArchitecturePath(path);
    if(/(^|\/)index\.html?$/i.test(p))return'/';
    if(/\.(html?|xhtml)$/i.test(p)){
        return normalizeArchitectureRoute('/'+stripArchitectureExt(p).replace(/\/index$/i,''));
    }
    return null;
}

function classifyGenericArchitectureFile(file,content){
    var p=normalizeArchitecturePath(file.path||file.name);
    var name=file.name||p.split('/').pop()||'';
    var layer=(file.layer||Parser.detectLayer(p)||'utils').toLowerCase();
    var dbUsage=detectDatabaseUsage(content);
    var route=inferGenericArchitectureRoute(p);

    if(route||Parser.isHTML(name))return{kind:'page',route:route||'/'+stripArchitectureExt(name)};
    if(dbUsage||layer==='data'||layer==='classes')return{kind:'database-adapter',route:null};
    if(layer==='ui'||layer==='forms'||layer==='components')return{kind:'component',route:null};
    if(layer==='services')return{kind:'service',route:null};
    if(layer==='config')return{kind:'utility',route:null};
    if(file.functions&&file.functions.length>0)return{kind:'module',route:null};
    return{kind:'utility',route:null};
}

