function extractArchitectureFacts(files,framework){
    var profile=detectArchitectureProfile(files,framework);
    var rawFacts=(files||[]).filter(function(file){
        return file&&file.content&&Parser.isCode(file.name||file.path||'');
    }).map(function(file){
        var path=normalizeArchitecturePath(file.path||file.name);
        var content=file.content||'';
        if(isArchitectureBuildOutput(path,file.name)){
            return{
                path:path,
                name:file.name||path.split('/').pop(),
                kind:'build-output',
                route:null,
                role:'build-output',
                group:'Build Output',
                profile:profile,
                isTest:false,
                isFixture:false,
                isBuildOutput:true,
                isCore:false,
                imports:[],
                jsxComponents:[],
                links:[],
                apiCalls:[],
                dbUsage:false,
                content:content,
                loc:file.lines||0
            };
        }
        var special=inferNextSpecialFile(path);
        var webRoute=canBeFrontendRoute(path)?inferWebAppRoute(path):null;
        var classified=framework==='Next.js'
            ? classifyArchitectureFile(path,content)
            : classifyGenericArchitectureFile(file,content);
        if(special){
            classified={kind:special.kind,route:special.route};
        }else if(webRoute&&profile!=='codeflow'&&!isArchitectureBackendPath(path)){
            classified=classified.kind==='api'?classified:{kind:'page',route:webRoute};
        }else if(isArchitectureBackendPath(path)||isArchitectureBarrelIndex(path)){
            if(classified.kind==='page')classified={kind:'module',route:null};
        }
        var role=inferArchitectureRole(path,profile,classified,content);
        if(special){
            role=special.role;
            if(special.route)classified.route=special.route;
        }
        if(role==='fixture')classified={kind:'fixture',route:null};
        else if(role==='browser-shell')classified={kind:'shell',route:inferGenericArchitectureRoute(path)||'/'};
        else if(role==='action-entry')classified={kind:'action-entry',route:null};
        else if(role==='test')classified={kind:'test',route:null};
        else if(role==='build-output')classified={kind:'build-output',route:null};
        else if(role==='app-shell')classified={kind:'shell',route:null};
        else if(role==='frontend-route')classified={kind:'page',route:classified.route||webRoute};
        else if(role==='frontend-component')classified={kind:'component',route:classified.route||null};
        else if(role==='backend-routes'||role==='backend-middleware'||role==='backend-services'||role==='backend-module'||role==='platform-analyzer'||role==='api-client'){
            classified={kind:role==='platform-analyzer'?'service':'module',route:null};
        }
        var displayTitle=special?special.title:null;
        if(!displayTitle&&role==='frontend-component')displayTitle=inferPageComponentTitle(path,classified.route,content);
        return{
            path:path,
            name:file.name||path.split('/').pop(),
            kind:classified.kind,
            route:classified.route,
            displayTitle:displayTitle,
            role:role,
            group:inferArchitectureGroup(role,{kind:classified.kind},profile),
            profile:profile,
            isTest:isArchitectureTestFile(path),
            isFixture:isArchitectureFixtureFile(path),
            isBuildOutput:isArchitectureBuildOutput(path,file.name),
            isCore:false,
            imports:extractArchitectureImports(content),
            jsxComponents:extractJsxComponents(content),
            links:extractNavigationLinks(content),
            apiCalls:extractApiCalls(content),
            dbUsage:detectDatabaseUsage(content),
            content:content,
            loc:file.lines||0
        };
    });
    var corePaths=new Set();
    rawFacts.forEach(function(fact){
        if(fact.isBuildOutput||fact.isTest||fact.isFixture)return;
        fact.isCore=isArchitectureSignificantFile(fact.path,fact.role,fact,framework,fact.profile,false);
        if(fact.isCore)corePaths.add(fact.path);
    });
    rawFacts.forEach(function(fact){
        if(fact.isCore)return;
        if(fact.isBuildOutput||fact.isTest||fact.isFixture)return;
        var importedByCore=fact.imports.some(function(importPath){
            var resolved=resolveArchitectureImport(importPath,fact.path,files);
            return resolved&&corePaths.has(resolved);
        });
        if(!importedByCore&&fact.role==='frontend-component'){
            importedByCore=fact.imports.length>0||isArchitectureFrontendPath(fact.path);
        }
        if(importedByCore||isArchitectureSignificantFile(fact.path,fact.role,fact,framework,fact.profile,true)){
            fact.isCore=true;
            corePaths.add(fact.path);
        }
    });
    return rawFacts;
}

function shouldShowArchitectureBlock(fact){
    return ['page','api','component','hook','service','database-adapter','module','utility','shell','fixture','action-entry','test','build-output'].includes(fact.kind);
}

function architectureLayer(fact){
    if(fact.kind==='page'||fact.kind==='component'||fact.kind==='hook')return'Frontend';
    if(fact.kind==='api'||fact.kind==='service')return'Backend';
    if(fact.kind==='database-adapter')return'Data Layer';
    if(fact.kind==='database')return'Storage';
    if(fact.kind==='module'||fact.kind==='utility')return'Shared';
    return'Shared';
}

function architectureTitle(fact){
    if(fact.displayTitle)return fact.displayTitle;
    if(fact.role==='app-shell')return'App Entry / Shell';
    if(fact.kind==='shell'||fact.role==='browser-shell')return'Browser App Shell';
    if(fact.kind==='action-entry')return'GitHub Action';
    if(fact.role==='frontend-route')return fact.route==='/'?'/':fact.route;
    if(fact.role==='frontend-component')return inferPageComponentTitle(fact.path,fact.route,fact.content);
    if(fact.role==='platform-analyzer'){
        var seg=(fact.path.match(/\/(youtube|reddit|twitter|github|tiktok|instagram)\b/i)||[])[1];
        if(seg)return seg.charAt(0).toUpperCase()+seg.slice(1)+' Analyzer';
        return architectureFileBaseName(fact.path)+' Analyzer';
    }
    if(fact.role==='backend-middleware')return'Middleware';
    if(fact.role==='backend-routes')return'API Routes';
    if(fact.role==='backend-services')return'Services';
    if(fact.role==='backend-module'){
        var seg=normalizeArchitecturePath(fact.path).split('/').filter(Boolean);
        var name=architectureFileBaseName(fact.path);
        if(name&&name!=='index')return name.charAt(0).toUpperCase()+name.slice(1);
        return seg.length?seg[seg.length-1].charAt(0).toUpperCase()+seg[seg.length-1].slice(1):'Backend Module';
    }
    if(fact.role==='api-client')return'API Clients';
    if(fact.role==='config')return'Config';
    if(fact.role==='content')return'Content';
    if(fact.kind==='page')return fact.route==='/'?'Home Page':'Page '+fact.route;
    if(fact.kind==='api')return'API '+fact.route;
    if(fact.kind==='database')return'Database';
    return architectureFileBaseName(fact.path);
}

function aggregateFrontendComponentKey(block){
    var files=(block.files||[]).map(function(f){return normalizeArchitecturePath(f).toLowerCase();});
    var sample=files[0]||'';
    var platform=sample.match(/\/platforms\/([^/]+)\//);
    if(platform){
        var name=platform[1];
        if(/\/tabs\/[^/]+\/insights\//.test(sample))return'agg:fe:'+name+'-insight-tabs';
        if(/\/tabs\//.test(sample))return'agg:fe:'+name+'-tabs';
        if(/\/components\/charts\//.test(sample)||/\/charts\//.test(sample))return'agg:fe:'+name+'-chart-components';
        if(/\/views\//.test(sample)||/\/pages\//.test(sample))return'agg:fe:'+name+'-dashboard';
        if(/\/components\//.test(sample))return'agg:fe:'+name+'-components';
        return'agg:fe:'+name+'-feature-ui';
    }
    if(/\/components\/charts\//.test(sample)||/\/charts\//.test(sample))return'agg:fe:chart-components';
    if(/\/components\//.test(sample)||/\/ui\/components\//.test(sample))return'agg:fe:shared-ui-components';
    if(/\/hooks\//.test(sample))return'agg:fe:hooks';
    if(/\/views\//.test(sample))return'agg:fe:views';
    return'agg:fe:feature-components';
}

function getArchitectureAggregateKey(block,profile){
    if(profile==='codeflow')return null;
    if(block.isBuildOutput)return null;
    if(block.role==='app-shell'||block.role==='browser-shell')return'agg:app-shell';
    if(block.role==='frontend-route'&&block.route)return'agg:route:'+block.route;
    if(block.role==='frontend-component')return aggregateFrontendComponentKey(block);
    if(block.role==='platform-analyzer'){
        var sample=String((block.files&&block.files[0])||'').toLowerCase();
        var seg=sample.match(/\/platforms\/([^/]+)\//);
        if(seg)return'agg:analyzer:'+seg[1];
        seg=sample.match(/\/(youtube|reddit|twitter|github|tiktok|instagram)\b/);
        return'agg:analyzer:'+(seg?seg[1]:block.title).toLowerCase();
    }
    if(block.role==='backend-middleware')return'agg:backend:middleware';
    if(block.role==='backend-routes')return'agg:backend:routes';
    if(block.role==='backend-services')return'agg:backend:services';
    if(block.role==='api-client')return'agg:backend:api-client';
    if(block.role==='backend-module'){
        var sample=String((block.files&&block.files[0])||'').toLowerCase();
        if(/\/config\//.test(sample))return'agg:backend:config';
        if(/\/core\//.test(sample))return'agg:backend:core';
        return'agg:backend:'+architectureFileBaseName((block.files&&block.files[0])||'module').toLowerCase();
    }
    if(block.role==='config')return'agg:config';
    if(block.role==='content')return'agg:content';
    if(block.group==='Shared / Utilities'||block.role==='shared-module'){
        var sample=String((block.files&&block.files[0])||'').toLowerCase();
        if(/\/hooks\//.test(sample))return'agg:shared:hooks';
        if(/\/schemas?\//.test(sample))return'agg:shared:schema';
        if(/\/utils?\//.test(sample))return'agg:shared:utils';
        return'agg:shared:utilities';
    }
    return null;
}

function titleCaseSegment(value){
    return String(value||'').split(/[-_]/).filter(Boolean).map(function(part){
        return part.charAt(0).toUpperCase()+part.slice(1);
    }).join(' ');
}

function resolveAggregateBlockTitle(key){
    if(!key||!key.startsWith('agg:'))return null;
    var known={
        'agg:app-shell':'App Shell',
        'agg:backend:middleware':'Middleware',
        'agg:backend:routes':'API Routes',
        'agg:backend:services':'Services',
        'agg:backend:api-client':'API Clients',
        'agg:backend:config':'Config',
        'agg:backend:core':'Core',
        'agg:config':'App Config',
        'agg:content':'Content',
        'agg:fe:chart-components':'Chart Components',
        'agg:fe:shared-ui-components':'Shared UI Components',
        'agg:fe:hooks':'Hooks',
        'agg:fe:views':'Views',
        'agg:fe:feature-components':'Feature Components',
        'agg:shared:hooks':'Hooks',
        'agg:shared:schema':'Schema',
        'agg:shared:utils':'Utils',
        'agg:shared:utilities':'Utilities'
    };
    if(known[key])return known[key];
    var routeMatch=key.match(/^agg:route:(.+)$/);
    if(routeMatch){
        var route=normalizeArchitectureRoute(routeMatch[1]);
        return route==='/'?'/':route;
    }
    var analyzerMatch=key.match(/^agg:analyzer:(.+)$/);
    if(analyzerMatch)return titleCaseSegment(analyzerMatch[1])+' Analyzer';
    var feMatch=key.match(/^agg:fe:([^-]+)-(.+)$/);
    if(feMatch)return titleCaseSegment(feMatch[1])+' '+titleCaseSegment(feMatch[2].replace(/-/g,' '));
    var backendMatch=key.match(/^agg:backend:(.+)$/);
    if(backendMatch)return titleCaseSegment(backendMatch[1]);
    return null;
}

function aggregateArchitectureBlocks(blocks,profile,warnings){
    if(profile==='codeflow')return blocks;
    var merged=Object.create(null);
    var passthrough=[];
    blocks.forEach(function(block){
        var key=getArchitectureAggregateKey(block,profile);
        if(!key){
            passthrough.push(block);
            return;
        }
        if(!merged[key]){
            merged[key]=Object.assign({},block,{files:(block.files||[]).slice(),loc:block.loc||0});
            merged[key].id=makeMermaidSafeId(key);
            var aggregateTitle=resolveAggregateBlockTitle(key);
            if(aggregateTitle)merged[key].title=aggregateTitle;
        }else{
            (block.files||[]).forEach(function(filePath){
                if(merged[key].files.indexOf(filePath)<0)merged[key].files.push(filePath);
            });
            merged[key].loc=(merged[key].loc||0)+(block.loc||0);
        }
    });
    var aggregated=Object.keys(merged).map(function(key){return merged[key];});
    if(aggregated.length+passthrough.length<blocks.length){
        warnings.push('Aggregated '+blocks.length+' architecture files into '+(aggregated.length+passthrough.length)+' diagram blocks for readability.');
    }
    return aggregated.concat(passthrough);
}

function computeArchitectureHiddenSummary(facts,blocks,includeTests,includeBuildOutput){
    var shownPaths=new Set();
    getVisibleArchitectureBlocks(blocks,includeTests,includeBuildOutput).forEach(function(block){
        (block.files||[]).forEach(function(filePath){shownPaths.add(normalizeArchitecturePath(filePath));});
    });
    var hidden={build:0,tests:0,fixtures:0,lowSignal:0,total:0};
    (facts||[]).forEach(function(fact){
        if(shownPaths.has(fact.path))return;
        if(fact.isBuildOutput){
            hidden.build++;
        }else if(fact.isTest){
            hidden.tests++;
        }else if(fact.isFixture){
            hidden.fixtures++;
        }else{
            hidden.lowSignal++;
        }
        hidden.total++;
    });
    return hidden;
}
