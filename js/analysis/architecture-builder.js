/* analysis/architecture-builder.js - Architecture block/dependency builders and Mermaid generation */

function makeMermaidSafeId(value){
    var safe=String(value||'Block')
        .replace(/[^a-zA-Z0-9_]/g,'_')
        .replace(/^([0-9])/,'_$1')
        .slice(0,80);
    return safe||'Block';
}

function escapeMermaidLabel(value){
    return String(value||'')
        .replace(/"/g,"'")
        .replace(/\|/g,'/')
        .replace(/\n/g,' ')
        .replace(/\r/g,' ')
        .slice(0,120);
}

function resolveArchitectureImport(importPath,fromFile,files){
    if(!importPath||/^(react|next|@?vercel|node:|https?:)/.test(importPath))return null;
    var candidates=[];
    if(importPath.startsWith('@/'))candidates.push('src/'+importPath.slice(2));
    if(importPath.startsWith('~/'))candidates.push('src/'+importPath.slice(2));
    if(importPath.startsWith('./')||importPath.startsWith('../')){
        var baseParts=(architectureDirname(fromFile)?architectureDirname(fromFile).split('/'):[]).concat(importPath.split('/'));
        var normalized=[];
        baseParts.forEach(function(part){
            if(!part||part==='.')return;
            if(part==='..')normalized.pop();
            else normalized.push(part);
        });
        candidates.push(normalized.join('/'));
    }
    if(!candidates.length)return null;
    var exts=['','.js','.jsx','.ts','.tsx','.mjs','.cjs','/index.js','/index.jsx','/index.ts','/index.tsx'];
    var pathMap=Object.create(null);
    (files||[]).forEach(function(file){
        var p=normalizeArchitecturePath(file.path||file.name);
        pathMap[p.toLowerCase()]=file.path||file.name;
    });
    for(var i=0;i<candidates.length;i++){
        for(var j=0;j<exts.length;j++){
            var candidate=normalizeArchitecturePath(candidates[i]+exts[j]).toLowerCase();
            if(pathMap[candidate])return normalizeArchitecturePath(pathMap[candidate]);
        }
    }
    return null;
}

function makeArchitectureBlocks(facts,files,warnings){
    var corePaths=new Set();
    var visiblePaths=new Set();
    facts.forEach(function(fact){
        if(fact.isCore){
            corePaths.add(fact.path);
            visiblePaths.add(fact.path);
        }
    });
    facts.forEach(function(fact){
        if(corePaths.has(fact.path)){
            fact.imports.forEach(function(importPath){
                var resolved=resolveArchitectureImport(importPath,fact.path,files);
                if(resolved)visiblePaths.add(resolved);
            });
        }else{
            fact.imports.forEach(function(importPath){
                var resolved=resolveArchitectureImport(importPath,fact.path,files);
                if(resolved&&corePaths.has(resolved))visiblePaths.add(fact.path);
            });
        }
    });
    var candidates=facts.filter(function(fact){
        if(!shouldShowArchitectureBlock(fact))return false;
        if(fact.isTest||fact.isFixture||fact.isBuildOutput)return true;
        return corePaths.has(fact.path)||visiblePaths.has(fact.path);
    });
    var priority={shell:0,'action-entry':1,page:2,api:3,'database-adapter':4,service:5,component:6,hook:7,module:8,utility:9,test:10,fixture:11};
    candidates.sort(function(a,b){
        return (priority[a.kind]||12)-(priority[b.kind]||12)||a.path.localeCompare(b.path);
    });
    if(candidates.length>ARCHITECTURE_MAX_BLOCKS){
        warnings.push('Diagram capped at '+ARCHITECTURE_MAX_BLOCKS+' blocks; '+(candidates.length-ARCHITECTURE_MAX_BLOCKS)+' directly related items were omitted for readability.');
        candidates=candidates.slice(0,ARCHITECTURE_MAX_BLOCKS);
    }
    var usedIds=Object.create(null);
    var profile=(facts[0]&&facts[0].profile)||'generic';
    var blocks=candidates.map(function(fact){
        var baseId=makeMermaidSafeId(fact.path);
        var id=baseId;
        var counter=2;
        while(usedIds[id]){
            id=baseId+'_'+counter;
            counter++;
        }
        usedIds[id]=true;
        return{
            id:id,
            title:architectureTitle(fact),
            kind:fact.kind,
            role:fact.role,
            group:fact.group,
            layer:architectureLayer(fact),
            route:fact.route,
            files:[fact.path],
            profile:profile,
            isTest:!!fact.isTest,
            isFixture:!!fact.isFixture,
            isBuildOutput:!!fact.isBuildOutput,
            loc:fact.loc||0
        };
    });
    if(facts.some(function(fact){return fact.dbUsage;})){
        blocks.push({id:'Storage_Database',title:'Database',kind:'database',role:'database',group:'Storage',layer:'Storage',profile:profile,files:[],isTest:false,isFixture:false,isBuildOutput:false,loc:0});
    }
    return aggregateArchitectureBlocks(blocks,profile,warnings);
}

function findBlockByFile(blocks,path){
    path=normalizeArchitecturePath(path);
    return (blocks||[]).find(function(block){return (block.files||[]).indexOf(path)>=0;})||null;
}

function findBlockByRoute(blocks,route){
    route=normalizeArchitectureRoute(route);
    var exact=(blocks||[]).find(function(block){return block.route&&normalizeArchitectureRoute(block.route)===route;});
    if(exact)return exact;
    return (blocks||[]).find(function(block){return block.route&&routeSegmentsMatch(block.route,route);})||null;
}

function findBlockByComponentName(blocks,name){
    return (blocks||[]).find(function(block){
        if(block.kind!=='component')return false;
        if(block.title===name)return true;
        var file=(block.files&&block.files[0])||'';
        return architectureFileBaseName(file)===name;
    })||null;
}

function findBlockByRole(blocks,role){
    return (blocks||[]).find(function(block){return block.role===role;})||null;
}

function findBlockByPathEnds(blocks,suffix){
    suffix=normalizeArchitecturePath(suffix).toLowerCase();
    return (blocks||[]).find(function(block){
        var file=normalizeArchitecturePath((block.files&&block.files[0])||'').toLowerCase();
        return file===suffix||file.endsWith('/'+suffix);
    })||null;
}

function inferDependencyKind(sourceKind,targetKind){
    if(targetKind==='database')return'database';
    if(sourceKind==='page'&&targetKind==='api')return'api-call';
    if(targetKind==='component')return'renders';
    if(targetKind==='hook')return'uses-hook';
    return'depends-on';
}

function buildImportBasedDependencies(facts,blocks,files){
    var deps=[];
    facts.forEach(function(fact){
        var source=findBlockByFile(blocks,fact.path);
        if(!source)return;
        fact.imports.forEach(function(importPath){
            var resolved=resolveArchitectureImport(importPath,fact.path,files);
            if(!resolved)return;
            var target=findBlockByFile(blocks,resolved);
            if(!target||target.id===source.id)return;
            deps.push({
                from:source.id,
                to:target.id,
                kind:inferDependencyKind(source.kind,target.kind),
                label:architectureDependencyLabel(source.role,target.role,importPath),
                confidence:'high'
            });
        });
        fact.jsxComponents.forEach(function(componentName){
            var target=findBlockByComponentName(blocks,componentName);
            if(!target||target.id===source.id)return;
            deps.push({from:source.id,to:target.id,kind:'renders',label:'renders '+componentName,confidence:'medium'});
        });
    });
    return deps;
}

function buildSyntheticArchitectureDependencies(blocks,facts){
    var deps=[];
    var shell=findBlockByRole(blocks,'browser-shell');
    var analyzer=findBlockByRole(blocks,'analyzer-loader')||findBlockByPathEnds(blocks,'card/lib/analyzer.js');
    var collector=findBlockByRole(blocks,'collector')||findBlockByPathEnds(blocks,'card/lib/collect.js');
    var action=findBlockByRole(blocks,'action-entry')||findBlockByPathEnds(blocks,'card/index.js');
    if(shell&&analyzer){
        deps.push({from:shell.id,to:analyzer.id,kind:'runtime',label:architectureDependencyLabel(shell.role,analyzer.role),confidence:'high'});
    }
    if(shell&&collector){
        deps.push({from:shell.id,to:collector.id,kind:'runtime',label:architectureDependencyLabel(shell.role,collector.role),confidence:'high'});
    }
    if(action&&shell){
        deps.push({from:action.id,to:shell.id,kind:'runtime',label:architectureDependencyLabel(action.role,shell.role),confidence:'high'});
    }
    var state=findBlockByRole(blocks,'state')||findBlockByPathEnds(blocks,'card/lib/state.js');
    var pr=findBlockByRole(blocks,'pr')||findBlockByPathEnds(blocks,'card/lib/pr.js');
    var git=findBlockByRole(blocks,'git')||findBlockByPathEnds(blocks,'card/lib/git.js');
    var inputs=findBlockByRole(blocks,'inputs')||findBlockByPathEnds(blocks,'card/lib/inputs.js');
    if(analyzer&&state){
        deps.push({from:analyzer.id,to:state.id,kind:'runtime',label:architectureDependencyLabel('analyzer-loader','state'),confidence:'medium'});
    }
    if(pr&&git){
        deps.push({from:pr.id,to:git.id,kind:'runtime',label:architectureDependencyLabel('pr','git'),confidence:'high'});
    }
    if(action&&collector&&inputs){
        deps.push({from:collector.id,to:inputs.id,kind:'runtime',label:architectureDependencyLabel('collector','inputs'),confidence:'medium'});
    }
    if(action&&collector&&git){
        deps.push({from:collector.id,to:git.id,kind:'runtime',label:architectureDependencyLabel('collector','git'),confidence:'medium'});
    }
    var appShell=findBlockByRole(blocks,'app-shell');
    if(appShell){
        blocks.forEach(function(block){
            if(block.role!=='frontend-route'||block.id===appShell.id)return;
            deps.push({from:appShell.id,to:block.id,kind:'runtime',label:architectureDependencyLabel('app-shell','frontend-route'),confidence:'high'});
        });
    }
    blocks.forEach(function(block){
        if(block.role!=='frontend-route')return;
        var component=blocks.find(function(candidate){
            return candidate.role==='frontend-component'&&candidate.route&&block.route&&normalizeArchitectureRoute(candidate.route)===normalizeArchitectureRoute(block.route);
        });
        if(component&&component.id!==block.id){
            deps.push({from:block.id,to:component.id,kind:'runtime',label:architectureDependencyLabel('frontend-route','frontend-component'),confidence:'high'});
        }
    });
    blocks.forEach(function(block){
        if(block.role!=='frontend-component')return;
        var analyzer=blocks.find(function(candidate){return candidate.role==='platform-analyzer';});
        if(analyzer&&analyzer.id!==block.id){
            deps.push({from:block.id,to:analyzer.id,kind:'runtime',label:architectureDependencyLabel('frontend-component','platform-analyzer'),confidence:'medium'});
        }
    });
    var routesBlock=findBlockByRole(blocks,'backend-routes');
    var middlewareBlock=findBlockByRole(blocks,'backend-middleware');
    var servicesBlock=findBlockByRole(blocks,'backend-services');
    if(routesBlock&&middlewareBlock){
        deps.push({from:routesBlock.id,to:middlewareBlock.id,kind:'runtime',label:architectureDependencyLabel('backend-routes','backend-middleware'),confidence:'medium'});
    }
    if(routesBlock&&servicesBlock){
        deps.push({from:routesBlock.id,to:servicesBlock.id,kind:'runtime',label:architectureDependencyLabel('backend-routes','backend-services'),confidence:'medium'});
    }
    facts.forEach(function(fact){
        if(!fact.isTest)return;
        var source=findBlockByFile(blocks,fact.path);
        if(!source)return;
        var targets=[];
        if(testFileReferencesCore(fact.content)){
            if(shell)targets.push(shell);
            if(analyzer)targets.push(analyzer);
            if(collector)targets.push(collector);
        }
        inferTestTargetPaths(fact.path).forEach(function(suffix){
            var target=findBlockByPathEnds(blocks,suffix);
            if(target)targets.push(target);
        });
        var seen=new Set();
        targets.forEach(function(target){
            if(!target||target.id===source.id||seen.has(target.id))return;
            seen.add(target.id);
            deps.push({from:source.id,to:target.id,kind:'tests',label:'tests',confidence:'high'});
        });
    });
    return deps;
}

function dedupeArchitectureDependencies(deps){
    var seen=new Set();
    return (deps||[]).filter(function(dep){
        var key=[dep.from,dep.to,dep.kind,dep.label].join('|');
        if(seen.has(key))return false;
        seen.add(key);
        return true;
    });
}

function buildArchitectureDependencies(facts,blocks,files){
    var deps=[];
    facts.forEach(function(fact){
        var source=findBlockByFile(blocks,fact.path);
        if(!source)return;
        fact.links.forEach(function(link){
            var target=findBlockByRoute(blocks,link);
            if(target&&target.id!==source.id){
                deps.push({from:source.id,to:target.id,kind:'navigation',label:'links '+link,confidence:'high'});
            }
        });
        fact.apiCalls.forEach(function(call){
            var target=findBlockByRoute(blocks,call.url);
            if(target&&target.id!==source.id){
                deps.push({from:source.id,to:target.id,kind:'api-call',label:call.method+' '+call.url,confidence:'high'});
            }
        });
        if(fact.dbUsage){
            deps.push({from:source.id,to:'Storage_Database',kind:'database',label:'queries',confidence:'medium'});
        }
    });
    deps=deps.concat(buildImportBasedDependencies(facts,blocks,files));
    deps=deps.concat(buildSyntheticArchitectureDependencies(blocks,facts));
    return dedupeArchitectureDependencies(deps).filter(function(dep){
        if(!dep.label||/^uses \d+ calls?$/i.test(dep.label))return false;
        return !!findBlockById(blocks,dep.from)&&!!findBlockById(blocks,dep.to);
    });
}

function getRenderedArchitectureDependencies(dependencies,visibleBlockIds){
    var visible=visibleBlockIds||null;
    var priority={high:0,medium:1,low:2};
    return (dependencies||[]).filter(function(dep){
        if(!visible)return true;
        return visible.has(dep.from)&&visible.has(dep.to);
    }).sort(function(a,b){
        return (priority[a.confidence]||9)-(priority[b.confidence]||9)||
            String(a.from).localeCompare(String(b.from))||
            String(a.to).localeCompare(String(b.to));
    }).slice(0,ARCHITECTURE_MAX_RENDERED_DEPENDENCIES);
}

function findBlockById(blocks,id){
    return (blocks||[]).find(function(block){return block.id===id;})||null;
}

function buildArchitectureGroups(blocks){
    var groups={};
    (blocks||[]).forEach(function(block){
        var key=block.group||block.layer||'Application';
        if(!groups[key])groups[key]=[];
        groups[key].push(block.id);
    });
    return groups;
}

function formatMermaidBlock(block){
    var label=escapeMermaidLabel(block.title);
    var filePath=(block.files&&block.files[0])||'';
    if(block.kind==='shell'||block.group==='App Entry / Shell'){
        if(filePath)label+='<br/>'+escapeMermaidLabel(filePath);
        if((block.files||[]).length>1)label+='<br/>'+((block.files||[]).length)+' shell files';
        else if(block.role==='browser-shell'||block.group==='Browser App')label+='<br/>React UI + Worker + Visualization';
    }else if(filePath){
        label+='<br/>'+escapeMermaidLabel(filePath);
    }else if(block.route){
        label+='<br/>'+escapeMermaidLabel(block.route);
    }
    if(block.kind==='database')return '[("'+label+'")]';
    if(block.kind==='api')return '{{"'+label+'"}}';
    return '["'+label+'"]';
}

function architectureGroupStyleClass(group){
    if(group==='Browser App'||group==='App Entry / Shell')return group==='App Entry / Shell'?'appentry':'browser';
    if(group==='GitHub Action')return'action';
    if(group==='Analysis Core')return'analysis';
    if(group==='Repository Collection')return'collection';
    if(group==='Rendering / Reports')return'rendering';
    if(group==='Frontend Routes / Views'||group==='Frontend Routes')return'frontend';
    if(group==='Frontend Components'||group==='Frontend Page Components')return'fecomponents';
    if(group==='Backend / API Layer'||group==='Backend API / Platform Logic')return'backend';
    if(group==='Services / Business Logic')return'services';
    if(group==='Data / Storage')return'storage';
    if(group==='Shared / Utilities'||group==='Shared Services / Utils')return'shared';
    if(group==='Configuration')return'config';
    if(group==='Content / Data')return'content';
    if(group==='Build Output')return'buildoutput';
    if(group==='Testing')return'testing';
    if(group==='Fixtures / Examples')return'fixtures';
    if(group==='Storage')return'storage';
    return'application';
}

function getVisibleArchitectureBlocks(blocks,includeTests,includeBuildOutput){
    return (blocks||[]).filter(function(block){
        if(block.isBuildOutput||block.group==='Build Output'||block.role==='build-output')return !!includeBuildOutput;
        if(block.isTest||block.isFixture)return !!includeTests;
        return true;
    });
}

function computeArchitectureStats(blocks,dependencies){
    return{
        blocks:blocks.length,
        dependencies:dependencies.length,
        routes:blocks.filter(function(block){return block.kind==='page'||block.kind==='shell';}).length,
        apiRoutes:blocks.filter(function(block){return block.kind==='api';}).length,
        databaseTouchpoints:dependencies.filter(function(dep){return dep.kind==='database';}).length
    };
}

function groupBlocksByArchitectureGroup(blocks,profile){
    var order=getArchitectureGroupOrder(profile||'generic');
    var grouped={};
    order.forEach(function(group){grouped[group]=[];});
    (blocks||[]).forEach(function(block){
        var group=block.group||'Application';
        if(!grouped[group])grouped[group]=[];
        grouped[group].push(block);
    });
    return {order:order,grouped:grouped};
}

function generateMermaidBlockDiagram(diagram,includeTests,includeBuildOutput){
    var allBlocks=diagram.blocks||[];
    var blocks=getVisibleArchitectureBlocks(allBlocks,!!includeTests,!!includeBuildOutput);
    var profile=diagram.profile||'generic';
    if(!blocks.length){
        return [
            'flowchart TD',
            '  classDef application fill:#252529,stroke:#8b8b95,color:#f0f0f2;',
            '  NoArchitecture["No architecture blocks detected"]',
            '  class NoArchitecture application;'
        ].join('\n');
    }
    var visibleIds=new Set(blocks.map(function(block){return block.id;}));
    var lines=[];
    lines.push('%%{init: {"flowchart": {"nodeSpacing": 45, "rankSpacing": 80}} }%%');
    lines.push('flowchart TB');
    lines.push('  classDef browser fill:#102033,stroke:#4d9fff,color:#f0f0f2;');
    lines.push('  classDef action fill:#1f2433,stroke:#7c8cff,color:#f0f0f2;');
    lines.push('  classDef analysis fill:#102033,stroke:#4d9fff,color:#f0f0f2;');
    lines.push('  classDef collection fill:#251b33,stroke:#a78bfa,color:#f0f0f2;');
    lines.push('  classDef rendering fill:#2b2414,stroke:#ff9f43,color:#f0f0f2;');
    lines.push('  classDef testing fill:#252529,stroke:#8b8b95,color:#f0f0f2;');
    lines.push('  classDef fixtures fill:#1f2b1f,stroke:#22c55e,color:#f0f0f2;');
    lines.push('  classDef storage fill:#2b2414,stroke:#ff9f43,color:#f0f0f2;');
    lines.push('  classDef application fill:#252529,stroke:#8b8b95,color:#f0f0f2;');
    lines.push('  classDef appentry fill:#102033,stroke:#4d9fff,color:#f0f0f2;');
    lines.push('  classDef frontend fill:#102033,stroke:#4d9fff,color:#f0f0f2;');
    lines.push('  classDef fecomponents fill:#152238,stroke:#6eb6ff,color:#f0f0f2;');
    lines.push('  classDef backend fill:#251b33,stroke:#a78bfa,color:#f0f0f2;');
    lines.push('  classDef config fill:#2b2414,stroke:#ff9f43,color:#f0f0f2;');
    lines.push('  classDef content fill:#1f2b1f,stroke:#22c55e,color:#f0f0f2;');
    lines.push('  classDef buildoutput fill:#252529,stroke:#666,color:#aaa;');
    var layout=groupBlocksByArchitectureGroup(blocks,profile);
    layout.order.forEach(function(group){
        if(!layout.grouped[group]||!layout.grouped[group].length)return;
        var subgraphLabel=group;
        if(group==='Testing'&&!includeTests)return;
        if(group==='Testing'&&includeTests)subgraphLabel='Testing - optional';
        if(group==='Build Output'&&!includeBuildOutput)return;
        if(group==='Build Output'&&includeBuildOutput)subgraphLabel='Build Output - optional';
        lines.push('  subgraph '+makeMermaidSafeId(group)+'_Group["'+escapeMermaidLabel(subgraphLabel)+'"]');
        lines.push('    direction TB');
        layout.grouped[group].forEach(function(block){
            lines.push('    '+block.id+formatMermaidBlock(block));
        });
        lines.push('  end');
    });
    getRenderedArchitectureDependencies(diagram.dependencies||[],visibleIds).forEach(function(dep){
        lines.push('  '+dep.from+' -->|"'+escapeMermaidLabel(dep.label||dep.kind)+'"| '+dep.to);
    });
    blocks.forEach(function(block){
        lines.push('  class '+block.id+' '+architectureGroupStyleClass(block.group)+';');
    });
    return lines.join('\n');
}

function buildArchitectureDiagram(files){
    var warnings=[];
    var framework=detectArchitectureFramework(files);
    var facts=extractArchitectureFacts(files,framework);
    var profile=(facts[0]&&facts[0].profile)||detectArchitectureProfile(files,framework);
    var blocks=makeArchitectureBlocks(facts,files,warnings);
    var dependencies=buildArchitectureDependencies(facts,blocks,files);
    if(dependencies.length>ARCHITECTURE_MAX_RENDERED_DEPENDENCIES){
        warnings.push('Diagram rendering shows the '+ARCHITECTURE_MAX_RENDERED_DEPENDENCIES+' strongest dependencies; export JSON includes all '+dependencies.length+'.');
    }
    if(framework==='Next.js'&&!blocks.length){
        warnings.push('Next.js was detected, but no page or API route blocks were visible in the analyzed files.');
    }else if(framework!=='Next.js'&&!blocks.length){
        warnings.push('No code files with architecture-significant blocks were visible in the analyzed files.');
    }
    var visibleBlocks=getVisibleArchitectureBlocks(blocks,false,false);
    var visibleIds=new Set(visibleBlocks.map(function(block){return block.id;}));
    var visibleDependencies=(dependencies||[]).filter(function(dep){return visibleIds.has(dep.from)&&visibleIds.has(dep.to);});
    var stats=computeArchitectureStats(visibleBlocks,visibleDependencies);
    stats.warnings=warnings.length;
    var hiddenSummary=computeArchitectureHiddenSummary(facts,blocks,false,false);
    var diagram={
        framework:framework,
        profile:profile,
        type:'block-diagram',
        options:{includeTests:false,includeBuildOutput:false},
        mermaid:'',
        blocks:blocks,
        dependencies:dependencies,
        groups:buildArchitectureGroups(visibleBlocks),
        stats:stats,
        hiddenSummary:hiddenSummary,
        warnings:warnings
    };
    diagram.mermaid=generateMermaidBlockDiagram(diagram,false,false);
    return diagram;
}

// expose architecture functions globally
window.buildArchitectureDiagram = buildArchitectureDiagram;
window.generateMermaidBlockDiagram = generateMermaidBlockDiagram;
