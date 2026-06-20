/* analysis/architecture-utils.js - Architecture analysis utilities */
// Architecture analysis, Mermaid diagram generation
// ---------------------------------------------------------------------------

var ARCHITECTURE_MAX_BLOCKS=64;
var ARCHITECTURE_MAX_RENDERED_DEPENDENCIES=48;
var ARCHITECTURE_GROUP_ORDER_CODEFLOW=['Browser App','GitHub Action','Analysis Core','Repository Collection','Rendering / Reports','Testing','Fixtures / Examples','Application','Storage'];
var ARCHITECTURE_GROUP_ORDER_WEBAPP=['App Entry / Shell','Frontend Routes / Views','Frontend Components','Backend / API Layer','Services / Business Logic','Data / Storage','Shared / Utilities','Configuration','Content / Data','External Integrations','Build Output','Testing','Fixtures / Examples'];
var ARCHITECTURE_GROUP_ORDER_GENERIC=['Application','Shared Services / Utils','Configuration','Content / Data','Build Output','Testing','Fixtures / Examples','Storage'];

function getArchitectureGroupOrder(profile){
    if(profile==='codeflow')return ARCHITECTURE_GROUP_ORDER_CODEFLOW;
    if(profile==='web-app')return ARCHITECTURE_GROUP_ORDER_WEBAPP;
    return ARCHITECTURE_GROUP_ORDER_GENERIC;
}

function detectArchitectureProfile(files,framework){
    var paths=(files||[]).map(function(f){return normalizeArchitecturePath(f.path||f.name).toLowerCase();});
    if(paths.some(function(p){return /(^|\/)index\.html?$/i.test(p);})&&paths.some(function(p){return /(^|\/)card\/(lib|render)\//i.test(p);}))return'codeflow';
    if(framework==='Next.js')return'web-app';
    if(paths.some(function(p){
        return /(^|\/)src\/app\//i.test(p)||/(^|\/)pages\//i.test(p)||/(^|\/)(backend|server|api|services?|middleware|routes?|platforms?)\b/i.test(p);
    }))return'web-app';
    if(framework==='Browser App')return'web-app';
    return'generic';
}

function isArchitectureBuildOutput(path,name){
    var p=String(path||'').toLowerCase().replace(/\\/g,'/');
    var base=String(name||p.split('/').pop()||'').toLowerCase();
    if(/(^|\/)out(\/|$)/.test(p)||/(^|\/)dist(\/|$)/.test(p)||/(^|\/)build(\/|$)/.test(p)||/(^|\/)coverage(\/|$)/.test(p))return true;
    if(/(^|\/)\.next(\/|$)/.test(p)||/(^|\/)\.nuxt(\/|$)/.test(p)||/(^|\/)\.output(\/|$)/.test(p))return true;
    if(/^page-[a-f0-9]{6,}/i.test(base)||/^layout-[a-f0-9]{6,}/i.test(base))return true;
    if(/\/page-[a-f0-9]{6,}\//i.test(p)||/\/layout-[a-f0-9]{6,}\//i.test(p))return true;
    if(/(^|\/)404\/index\.html?$/i.test(p)&&/(^|\/)out\//i.test(p))return true;
    return false;
}

function isArchitectureTestFile(path){
    var p=String(path||'').toLowerCase().replace(/\\/g,'/');
    return /(^|\/)tests?\//.test(p)||/(^|\/)__tests__(\/|$)/.test(p)||/\.test\.(js|jsx|ts|tsx|mjs|cjs)$/.test(p)||/\.spec\.(js|jsx|ts|tsx|mjs|cjs)$/.test(p)||/\.smoke\.(js|mjs|cjs)$/.test(p);
}

function isArchitectureFixtureFile(path){
    var p=String(path||'').toLowerCase().replace(/\\/g,'/');
    return /(^|\/)fixtures(\/|$)/.test(p)||/(^|\/)__fixtures__(\/|$)/.test(p);
}

function isArchitectureBarrelIndex(path){
    var p=normalizeArchitecturePath(path).toLowerCase();
    return /\/index\.(js|mjs|cjs|ts)$/i.test(p)&&!/\/index\.(tsx|jsx)$/i.test(p);
}

function isNonRouteFolderSegment(segment){
    return ['hooks','components','ui','views','schemas','schema','controllers','middleware','services','routes','utils','lib','common','analytics','types','constants','validators','models','repositories','config','core','api','server','backend','workers','functions','platforms','tabs','charts','widgets','providers','layouts','shared','domain','usecases','processors','jobs','db','database','content','posts','blog','docs','tests','fixtures','node_modules','public','static','assets','styles','themes'].indexOf(segment)>=0;
}

function isArchitectureBackendPath(path){
    var p=normalizeArchitecturePath(path).toLowerCase();
    if(/(^|\/)(a-)?backend(\/|$)/.test(p))return true;
    if(/(^|\/)server(\/|$)/.test(p))return true;
    if(/(^|\/)workers?(\/|$)/.test(p))return true;
    if(/(^|\/)functions(\/|$)/.test(p))return true;
    if(/(^|\/)lambda(\/|$)/.test(p))return true;
    if(/^src\/app\/api\//.test(p))return false;
    var segments=p.split('/').filter(Boolean);
    for(var i=0;i<segments.length;i++){
        var seg=segments[i];
        if(seg==='middleware'||seg==='controllers'||seg==='handlers')return true;
        if(seg==='routes'||seg==='services'){
            if(i===0)return true;
            var prev=segments[i-1];
            if(prev==='backend'||prev==='a-backend'||prev==='server'||prev==='api')return true;
        }
    }
    return false;
}

function canBeFrontendRoute(path){
    var p=normalizeArchitecturePath(path).toLowerCase();
    if(isArchitectureBuildOutput(path)||isArchitectureBackendPath(path)||isArchitectureBarrelIndex(path))return false;
    if(/(^|\/)src\/app\/.*\/page\.(jsx|tsx)$/i.test(p))return true;
    if(/^src\/app\/page\.(jsx|tsx)$/i.test(p))return true;
    if(/^src\/site-pages\/.+\/index\.(tsx|jsx)$/i.test(p))return true;
    if(/(^|\/)pages\/.*\.(jsx|tsx)$/i.test(p)&&!/(^|\/)pages\/api\//i.test(p))return true;
    var flat=p.match(/^([a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*){0,4})\/index\.(tsx|jsx)$/);
    if(flat){
        var segments=flat[1].split('/').filter(Boolean);
        if(!segments.some(isNonRouteFolderSegment))return true;
    }
    return false;
}

function isArchitectureFrontendPath(path){
    var p=normalizeArchitecturePath(path).toLowerCase();
    if(isArchitectureBuildOutput(path)||isArchitectureBackendPath(path))return false;
    if(/(^|\/)src\/app\//i.test(p)||/(^|\/)src\/site-pages\//i.test(p))return true;
    if(/(^|\/)pages\//i.test(p)&&/\.(jsx|tsx)$/i.test(p))return true;
    if(/(^|\/)(components|ui|views|widgets)\//i.test(p)&&/\.(jsx|tsx)$/i.test(p))return true;
    if(canBeFrontendRoute(path))return true;
    return false;
}

function inferNextSpecialFile(path){
    var p=normalizeArchitecturePath(path).toLowerCase();
    if(/\/global-error\.(tsx|jsx)$/.test(p))return{role:'frontend-component',title:'Global Error Boundary',route:null,kind:'component'};
    if(/\/not-found\.(tsx|jsx)$/.test(p))return{role:'frontend-route',title:'404 Not Found',route:'/404',kind:'page'};
    if(/\/error\.(tsx|jsx)$/.test(p))return{role:'frontend-component',title:'Error Boundary',route:null,kind:'component'};
    if(/\/loading\.(tsx|jsx)$/.test(p))return{role:'frontend-component',title:'Loading UI',route:null,kind:'component'};
    if(/\/template\.(tsx|jsx)$/.test(p))return{role:'app-shell',title:'App Template',route:null,kind:'shell'};
    if(/\/layout\.(tsx|jsx)$/.test(p))return{role:'app-shell',title:'App Layout',route:null,kind:'shell'};
    if(/\/providers\.(tsx|jsx)$/.test(p))return{role:'app-shell',title:'App Providers',route:null,kind:'shell'};
    return null;
}

function isArchitectureConfigPath(path,name){
    var p=normalizeArchitecturePath(path).toLowerCase();
    var base=String(name||'').toLowerCase();
    return /(^|\/)config(\/|$)/i.test(p)||/\.config\.(js|ts|mjs|cjs)$/.test(p)||base==='package.json'||base==='wrangler.toml'||base==='tsconfig.json';
}

function isArchitectureContentPath(path,name){
    var p=normalizeArchitecturePath(path).toLowerCase();
    return /(^|\/)(blog|posts|content|data|static\/content)\b/i.test(p)||/\.(md|mdx)$/i.test(name||'');
}

function isLikelyUiComponentSource(content){
    return /(from\s+['"`]react['"`]|React\.)/.test(content||'')&&(/export\s+(?:default\s+)?function\s+[A-Z]/.test(content||'')||/export\s+(?:default\s+)?(?:const|class)\s+[A-Z]/.test(content||'')||/<[A-Z][A-Za-z0-9_]*\b/.test(content||''));
}

function inferWebAppRoute(path){
    if(!canBeFrontendRoute(path))return null;
    var p=normalizeArchitecturePath(path);
    var nextRoute=inferArchitectureRoute(p);
    if(nextRoute&&!isArchitectureBackendPath(path))return nextRoute;
    var match=p.match(/^(?:src\/)?site-pages\/(.+)\/index\.(tsx|jsx)$/i);
    if(match)return normalizeArchitectureRoute('/'+match[1].split('/').filter(Boolean).join('/'));
    match=p.match(/^([a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*){0,4})\/index\.(tsx|jsx)$/i);
    if(match&&!isNonRouteFolderSegment(match[1].split('/')[0])){
        var segments=match[1].split('/').filter(Boolean);
        if(!segments.some(isNonRouteFolderSegment))return normalizeArchitectureRoute('/'+segments.join('/'));
    }
    return null;
}

function inferCodeflowArchitectureRole(path){
    var p=normalizeArchitecturePath(path).toLowerCase();
    if(isArchitectureTestFile(path))return'test';
    if(isArchitectureFixtureFile(path))return'fixture';
    if(/(^|\/)index\.html?$/i.test(p))return'browser-shell';
    if(/(^|\/)card\/index\.(js|mjs|cjs)$/i.test(p))return'action-entry';
    if(/\/analyzer\.(js|mjs|cjs)$/i.test(p))return'analyzer-loader';
    if(/\/collect\.(js|mjs|cjs)$/i.test(p))return'collector';
    if(/\/git\.(js|mjs|cjs)$/i.test(p))return'git';
    if(/\/inputs\.(js|mjs|cjs)$/i.test(p))return'inputs';
    if(/\/pr\.(js|mjs|cjs)$/i.test(p))return'pr';
    if(/\/state\.(js|mjs|cjs)$/i.test(p))return'state';
    if(/\/card\/render\/card\.(js|mjs|cjs)$/i.test(p))return'renderer';
    if(/(^|\/)card\/render\//i.test(p))return'render-support';
    if(/(^|\/)card\/lib\//i.test(p))return'module';
    return'module';
}

function inferWebAppArchitectureRole(path,classified,content){
    var p=normalizeArchitecturePath(path).toLowerCase();
    var base=architectureFileBaseName(path);
    var special=inferNextSpecialFile(path);
    if(special)return special.role;
    if(isArchitectureTestFile(path))return'test';
    if(isArchitectureFixtureFile(path))return'fixture';
    if(isArchitectureBuildOutput(path))return'build-output';
    if(isArchitectureBackendPath(path)){
        if(/\/middleware(\/|$)/.test(p)||base.toLowerCase()==='middleware')return'backend-middleware';
        if(/\/routes(\/|$)/.test(p)||base.toLowerCase()==='routes')return'backend-routes';
        if(/\/services(\/|$)/.test(p)||base.toLowerCase()==='services'||base.toLowerCase()==='service')return'backend-services';
        if(/\/config(\/|$)/.test(p)||base.toLowerCase()==='config')return'config';
        if(/\/core(\/|$)/.test(p)||base.toLowerCase()==='core')return'config';
        if(/\/platforms\/[^/]+\//.test(p)&&(/analyzer|controller|api/.test(p)||/analyzer|controller/i.test(base)))return'platform-analyzer';
        if(/\/analyzer/.test(p)||/analyzer/i.test(base))return'platform-analyzer';
        if(/api[-_]?client/i.test(p)||/api[-_]?client/i.test(base))return'api-client';
        return'backend-module';
    }
    if(isArchitectureConfigPath(path,base))return'config';
    if(isArchitectureContentPath(path,base))return'content';
    if(/(^|\/)src\/app\/(layout|template|providers|page)\./i.test(p))return'app-shell';
    if(classified.kind==='api'||/^src\/app\/api\//.test(p))return'backend-routes';
    if(classified.kind==='page'&&classified.route&&canBeFrontendRoute(path))return'frontend-route';
    if(/\/hooks(\/|$)/.test(p)||/\/schemas?(\/|$)/.test(p)||/\/validators?(\/|$)/.test(p))return'shared-module';
    if(/\/components(\/|$)/.test(p)||/\/ui\/components(\/|$)/.test(p)||/\/views(\/|$)/.test(p)){
        if(/\.(tsx|jsx)$/i.test(p)&&isLikelyUiComponentSource(content))return'frontend-component';
        return'shared-module';
    }
    if((classified.kind==='component'||classified.kind==='hook')&&/\.(tsx|jsx)$/i.test(p)&&isLikelyUiComponentSource(content))return'frontend-component';
    if(/(^|\/)utils?\b/i.test(p)||/(^|\/)lib\//i.test(p)||/(^|\/)common\//i.test(p)||/(^|\/)constants?\b/i.test(p))return'shared-module';
    return'shared-module';
}

function inferArchitectureRole(path,profile,classified,content){
    if(profile==='codeflow')return inferCodeflowArchitectureRole(path);
    return inferWebAppArchitectureRole(path,classified||{kind:'utility',route:null},content||'');
}

function inferArchitectureGroup(role,fact,profile){
    if(profile==='codeflow'){
        if(role==='browser-shell')return'Browser App';
        if(role==='action-entry')return'GitHub Action';
        if(role==='analyzer-loader'||role==='state')return'Analysis Core';
        if(role==='collector'||role==='git'||role==='inputs'||role==='pr')return'Repository Collection';
        if(role==='renderer'||role==='render-support')return'Rendering / Reports';
        if(role==='test')return'Testing';
        if(role==='fixture')return'Fixtures / Examples';
        if(fact&&fact.kind==='page')return'Browser App';
        if(fact&&fact.kind==='api')return'Application';
        if(fact&&(fact.kind==='database-adapter'||fact.kind==='database'))return'Storage';
        return'Application';
    }
    if(role==='app-shell')return'App Entry / Shell';
    if(role==='frontend-route')return'Frontend Routes / Views';
    if(role==='frontend-component')return'Frontend Components';
    if(role==='platform-analyzer')return'Services / Business Logic';
    if(role==='backend-routes'||role==='backend-middleware'||role==='api-client')return'Backend / API Layer';
    if(role==='backend-services'||role==='backend-module')return'Services / Business Logic';
    if(role==='config')return'Configuration';
    if(role==='content')return'Content / Data';
    if(role==='build-output')return'Build Output';
    if(role==='test')return'Testing';
    if(role==='fixture')return'Fixtures / Examples';
    if(role==='shared-module')return'Shared / Utilities';
    if(fact&&(fact.kind==='database-adapter'||fact.kind==='database'))return'Data / Storage';
    return'Shared / Utilities';
}

function isArchitectureSignificantFile(path,role,fact,framework,profile,importedByCore){
    if(isArchitectureTestFile(path)||isArchitectureFixtureFile(path)||isArchitectureBuildOutput(path))return false;
    if(profile==='codeflow'){
        if(role==='browser-shell'||role==='action-entry')return true;
        if(role==='analyzer-loader'||role==='collector'||role==='git'||role==='inputs'||role==='pr'||role==='state'||role==='renderer'||role==='render-support')return true;
        if(/(^|\/)card\/(lib|render)\//i.test(path))return true;
        if(fact.kind==='page'||fact.kind==='api')return true;
        if(fact.kind==='database-adapter'&&fact.dbUsage)return true;
        return false;
    }
    if(role==='app-shell')return true;
    if(role==='frontend-route'&&fact.route&&canBeFrontendRoute(path))return true;
    if(role==='frontend-component'&&/\.(tsx|jsx)$/i.test(path))return true;
    if(role==='backend-routes'||role==='backend-middleware'||role==='backend-services'||role==='platform-analyzer'||role==='api-client')return true;
    if(role==='config'||role==='content')return true;
    if(role==='backend-module'&&/(middleware|routes?|services?|analyzer|platform)/i.test(path))return true;
    if(fact.kind==='page'&&fact.route&&canBeFrontendRoute(path))return true;
    if(fact.kind==='api')return true;
    if(fact.kind==='database-adapter'&&fact.dbUsage)return true;
    if(importedByCore)return true;
    return false;
}

function extractExportedComponentName(content){
    var match=(content||'').match(/export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/);
    if(match)return match[1];
    match=(content||'').match(/export\s+default\s+(?:const|class)\s+([A-Z][A-Za-z0-9_]*)/);
    if(match)return match[1];
    match=(content||'').match(/export\s+function\s+([A-Z][A-Za-z0-9_]*)/);
    if(match)return match[1];
    return null;
}

function inferPageComponentTitle(path,route,content){
    var special=inferNextSpecialFile(path);
    if(special&&special.title)return special.title;
    var exported=extractExportedComponentName(content);
    if(exported)return exported;
    var base=architectureFileBaseName(path);
    if(/^[A-Z]/.test(base)&&base!=='Index'&&base!=='Page')return base;
    if(route&&route!=='/'){
        var segment=route.split('/').filter(Boolean).pop()||'';
        if(segment)return segment.charAt(0).toUpperCase()+segment.slice(1).replace(/[-_](\w)/g,function(m,c){return c.toUpperCase();})+' Page';
    }
    if(/layout/i.test(base))return'App Layout';
    if(/page/i.test(base))return'Page Module';
    return'UI Module';
}

function testFileReferencesCore(content){
    return /CODEFLOW_ANALYZER|buildAnalysisData|loadAnalyzer|locateIndexHtml|const Parser=\{/.test(content||'');
}

function inferTestTargetPaths(testPath){
    var base=architectureFileBaseName(testPath).toLowerCase();
    var targets=[];
    if(/golden/.test(base))targets.push('card/lib/analyzer.js');
    if(/repo-smoke|smoke/.test(base))targets.push('card/lib/collect.js');
    if(/md-extractor|sync-with-html|html-inline/.test(base))targets.push('index.html');
    return targets;
}

function architectureDependencyLabel(sourceRole,targetRole,importPath){
    if(sourceRole==='test')return'tests';
    if(sourceRole==='browser-shell'&&targetRole==='analyzer-loader')return'runs analysis';
    if(sourceRole==='browser-shell'&&targetRole==='collector')return'loads repo data';
    if(sourceRole==='action-entry'&&targetRole==='browser-shell')return'loads analyzer from';
    if(sourceRole==='action-entry'&&targetRole==='collector')return'collects repo';
    if(sourceRole==='action-entry'&&targetRole==='analyzer-loader')return'runs analysis';
    if(sourceRole==='action-entry'&&targetRole==='state')return'stores derived state';
    if(sourceRole==='action-entry'&&targetRole==='renderer')return'renders report';
    if(sourceRole==='collector'&&targetRole==='git')return'uses GitHub API';
    if(sourceRole==='collector'&&targetRole==='inputs')return'normalizes input';
    if(sourceRole==='pr'&&targetRole==='git')return'analyzes pull requests';
    if(sourceRole==='analyzer-loader'&&targetRole==='state')return'stores derived state';
    if(sourceRole==='renderer'&&targetRole==='render-support')return'uses visual helpers';
    if(sourceRole==='render-support'&&targetRole==='render-support'){
        if(/receipt-md/.test(importPath||''))return'exports markdown';
        if(/theme/.test(importPath||''))return'uses';
        return'uses';
    }
    if(targetRole==='database')return'queries';
    if(sourceRole==='browser-shell'&&targetRole==='api')return'calls';
    if(sourceRole==='app-shell'&&targetRole==='frontend-route')return'bootstraps';
    if(sourceRole==='frontend-route'&&targetRole==='frontend-component')return'renders';
    if(sourceRole==='frontend-component'&&targetRole==='platform-analyzer')return'calls';
    if(sourceRole==='frontend-component'&&targetRole==='backend-services')return'calls';
    if(sourceRole==='backend-routes'&&targetRole==='backend-middleware')return'passes through';
    if(sourceRole==='backend-routes'&&targetRole==='backend-services')return'dispatches';
    if(sourceRole==='backend-services'&&targetRole==='platform-analyzer')return'uses';
    if(sourceRole==='platform-analyzer'&&targetRole==='api-client')return'uses API';
    if(sourceRole==='frontend-component'&&targetRole==='content')return'reads content';
    if((sourceRole==='app-shell'||sourceRole==='backend-module')&&targetRole==='config')return'depends on';
    return'depends on';
}

function normalizeArchitecturePath(value){
    return (value||'').replace(/\\/g,'/').replace(/^\/+/,'').replace(/\/{2,}/g,'/');
}

function architectureDirname(path){
    path=normalizeArchitecturePath(path);
    return path.includes('/')?path.split('/').slice(0,-1).join('/'):'';
}

function stripArchitectureExt(path){
    return normalizeArchitecturePath(path).replace(/\.(jsx?|tsx?|mjs|cjs|html?|css|scss|sass|less|py|pyw|pyi|rb|go|java|php|rs|cs|swift|kt|kts)$/i,'');
}

function architectureFileBaseName(path){
    var base=stripArchitectureExt(path).split('/').pop()||'Block';
    return base==='index'?(stripArchitectureExt(path).split('/').slice(-2,-1)[0]||base):base;
}

function normalizeArchitectureRoute(route){
    route=String(route||'').split('#')[0].split('?')[0].trim();
    if(!route)return'';
    if(route[0]!=='/')route='/'+route;
    route=route.replace(/\/{2,}/g,'/');
    if(route.length>1)route=route.replace(/\/$/,'');
    return route||'/';
}

function routeSegmentsMatch(patternRoute,targetRoute){
    patternRoute=normalizeArchitectureRoute(patternRoute);
    targetRoute=normalizeArchitectureRoute(targetRoute);
    if(patternRoute===targetRoute)return true;
    var pattern=patternRoute.split('/').filter(Boolean);
    var target=targetRoute.split('/').filter(Boolean);
    for(var i=0;i<pattern.length;i++){
        var segment=pattern[i];
        if(segment.charAt(0)===':'&&segment.endsWith('*'))return true;
        if(i>=target.length)return false;
        if(segment.charAt(0)===':')continue;
        if(segment!==target[i])return false;
    }
    return pattern.length===target.length;
}

