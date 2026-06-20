/* export.js - Export and download helpers extracted from App.js
   All functions here are pure or take their dependencies as parameters.
   Browser globals only — no ES modules, no React imports needed. */

function getEmbeddedSvgStyle(){
    var vars=['--bg0','--bg1','--bg2','--bg3','--bg4','--hover','--border','--border2','--t0','--t1','--t2','--t3','--acc','--acc2','--accbg','--blue','--purple','--orange','--red','--cyan','--pink','--green'];
    var computed=getComputedStyle(document.documentElement);
    var root=':root{';
    vars.forEach(function(name){var value=computed.getPropertyValue(name);if(value)root+=name+':'+value.trim()+';';});
    root+='}';
    return root+'text{font-family:JetBrains Mono,monospace;pointer-events:none}';
}

function exportSVG(graphConfig,svgRef,allRefs,showNotification){
    var vt=graphConfig.vizType;
    if(vt==='architecture'){showNotification('Use "Diagram SVG" for architecture export.','info');return;}
    if(vt==='graph3d'){showNotification('SVG export not available for 3D view.','error');return;}
    var svgEl=resolveVizSvg(graphConfig,svgRef,allRefs);
    if(!svgEl){showNotification('No visualization to export.','error');return;}
    var PAD=60;
    var innerG=svgEl.querySelector('g');
    var bbox=null;
    if(innerG){try{bbox=innerG.getBBox();}catch(e){}}
    if(!bbox||bbox.width<1){try{bbox=svgEl.getBBox();}catch(e){}}
    var svgClone=svgEl.cloneNode(true);
    svgClone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    var styleEl=document.createElementNS('http://www.w3.org/2000/svg','style');
    styleEl.textContent=getEmbeddedSvgStyle();
    svgClone.insertBefore(styleEl,svgClone.firstChild);
    if(bbox&&bbox.width>0){
        var vx=bbox.x-PAD,vy=bbox.y-PAD,vw=bbox.width+PAD*2,vh=bbox.height+PAD*2;
        var cloneG=svgClone.querySelector('g');
        if(cloneG)cloneG.removeAttribute('transform');
        svgClone.setAttribute('viewBox',vx+' '+vy+' '+vw+' '+vh);
        svgClone.setAttribute('width',String(Math.round(vw)));
        svgClone.setAttribute('height',String(Math.round(vh)));
    }else{
        svgClone.setAttribute('width',svgEl.clientWidth);
        svgClone.setAttribute('height',svgEl.clientHeight);
    }
    var fname=buildExportFilename(graphConfig,allRefs.localSourceKind,allRefs.repoInfo,'svg');
    var blob=new Blob([new XMLSerializer().serializeToString(svgClone)],{type:'image/svg+xml'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download=fname;a.click();
    URL.revokeObjectURL(url);
    showNotification('SVG downloaded.','success');
}

function copyText(text,successMessage,showNotification){
    if(!text){showNotification('Nothing to copy.','error');return;}
    if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){showNotification(successMessage||'Copied.','success');}).catch(function(){fallbackCopyText(text,successMessage,showNotification);});
        return;
    }
    fallbackCopyText(text,successMessage,showNotification);
}

function fallbackCopyText(text,successMessage,showNotification){
    var textarea=document.createElement('textarea');
    textarea.value=text;
    textarea.setAttribute('readonly','');
    textarea.style.position='fixed';
    textarea.style.left='-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try{
        document.execCommand('copy');
        showNotification(successMessage||'Copied.','success');
    }catch(err){
        showNotification('Copy failed.','error');
    }
    document.body.removeChild(textarea);
}

function copyMermaid(data,architectureIncludeTests,architectureIncludeBuildOutput,showNotification){
    var diagram=data&&data.architectureDiagram;
    var text=diagram?generateMermaidBlockDiagram(diagram,architectureIncludeTests,architectureIncludeBuildOutput):'';
    copyText(text,'Mermaid diagram copied.',showNotification);
}

function normalizeArchitectureSvg(svg){
    if(!svg)return{width:0,height:0};
    var width=0;
    var height=0;
    var viewBox=svg.getAttribute('viewBox')||'';
    var viewBoxParts=viewBox.trim().split(/\s+/).map(function(part){return Number(part);});
    if(viewBoxParts.length===4&&viewBoxParts.every(function(value){return isFinite(value);})){
        width=viewBoxParts[2];
        height=viewBoxParts[3];
    }
    if(!width||!height){
        try{
            var bbox=svg.getBBox();
            if(bbox&&bbox.width&&bbox.height){
                width=bbox.width;
                height=bbox.height;
                svg.setAttribute('viewBox',[bbox.x,bbox.y,bbox.width,bbox.height].join(' '));
            }
        }catch(err){}
    }
    if(!width||!height){
        var rect=svg.getBoundingClientRect();
        width=rect.width||900;
        height=rect.height||600;
    }
    width=Math.max(320,Math.ceil(width));
    height=Math.max(240,Math.ceil(height));
    svg.setAttribute('width',String(width));
    svg.setAttribute('height',String(height));
    svg.setAttribute('data-codeflow-width',String(width));
    svg.setAttribute('data-codeflow-height',String(height));
    svg.style.width=width+'px';
    svg.style.height=height+'px';
    svg.style.maxWidth='none';
    return{width:width,height:height};
}

function clampArchitectureScale(value){
    return Math.max(0.08,Math.min(3,value));
}

function downloadMermaid(data,architectureIncludeTests,architectureIncludeBuildOutput,showNotification){
    var diagram=data&&data.architectureDiagram;
    var text=diagram?generateMermaidBlockDiagram(diagram,architectureIncludeTests,architectureIncludeBuildOutput):'';
    if(!text){showNotification('No Mermaid source to download.','error');return;}
    var blob=new Blob([text],{type:'text/plain'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download='codeflow-architecture.mmd';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Mermaid source downloaded.','success');
}

function downloadArchitectureSVG(architectureRenderRef,showNotification){
    var svg=architectureRenderRef.current?architectureRenderRef.current.querySelector('svg'):null;
    if(!svg){showNotification('No rendered architecture SVG to download.','error');return;}
    var clone=svg.cloneNode(true);
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    var blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download='codeflow-architecture.svg';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Architecture SVG downloaded.','success');
}

function graphSvgToPngDataUrlForPdf(svgRef,scale,done){
    scale=scale||2;
    if(!svgRef.current){done('No graph to export');return;}
    var svgEl=svgRef.current;
    var w=svgEl.clientWidth,h=svgEl.clientHeight;
    if(w<1||h<1){done('Graph has zero size');return;}
    var svgClone=svgEl.cloneNode(true);
    svgClone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    svgClone.setAttribute('width',String(w));
    svgClone.setAttribute('height',String(h));
    var styleEl=document.createElementNS('http://www.w3.org/2000/svg','style');
    styleEl.textContent=getEmbeddedSvgStyle();
    svgClone.insertBefore(styleEl,svgClone.firstChild);
    var svgStr=new XMLSerializer().serializeToString(svgClone);
    var blob=new Blob([svgStr],{type:'image/svg+xml;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var img=new Image();
    img.onload=function(){
        try{
            var cw=Math.floor(w*scale),ch=Math.floor(h*scale);
            var canvas=document.createElement('canvas');
            canvas.width=cw;
            canvas.height=ch;
            var ctx=canvas.getContext('2d');
            ctx.fillStyle=document.documentElement.classList.contains('light')?'#ffffff':'#0a0a0c';
            ctx.fillRect(0,0,cw,ch);
            ctx.drawImage(img,0,0,cw,ch);
            URL.revokeObjectURL(url);
            var dataUrl=canvas.toDataURL('image/png');
            done(null,dataUrl,w,h);
        }catch(ex){
            URL.revokeObjectURL(url);
            done(ex.message||'Raster failed');
        }
    };
    img.onerror=function(){
        URL.revokeObjectURL(url);
        done('Could not rasterize graph for PDF');
    };
    img.src=url;
}

var VIZ_TYPE_LABELS={graph:'Graph',graph3d:'3D',treemap:'Treemap',matrix:'Matrix',dendro:'Tree',sankey:'Flow',disjoint:'Cluster',bundle:'Bundle',architecture:'Block'};

function buildExportFilename(graphConfig,localSourceKind,repoInfo,ext){
    var ri=repoInfo||{};
    var sourceName;
    if(localSourceKind==='zip'){
        sourceName=(ri.name||'archive').replace(/\.zip$/i,'');
    }else if(localSourceKind==='folder'){
        sourceName=ri.name||'Folder';
    }else{
        sourceName=ri.repo||'repo';
    }
    // sanitize: keep alphanumeric, dash, dot; replace rest with underscore
    sourceName=sourceName.replace(/[^a-zA-Z0-9\-\.]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
    var vizLabel=VIZ_TYPE_LABELS[graphConfig.vizType]||graphConfig.vizType;
    return 'Arcflow_'+sourceName+'_'+vizLabel+'.'+ext;
}

/* Shared helper: resolve the SVG element for the active viz type */
function resolveVizSvg(graphConfig,svgRef,allRefs){
    var vt=graphConfig.vizType;
    if(vt==='graph')return svgRef&&svgRef.current;
    if(vt==='graph3d'||vt==='architecture')return null;
    var refMap={sankey:allRefs.sankeyRef,treemap:allRefs.treemapRef,matrix:allRefs.matrixRef,
        dendro:allRefs.dendroRef,disjoint:allRefs.disjointRef,bundle:allRefs.bundleRef};
    var ref=refMap[vt];
    return ref&&ref.current?ref.current.querySelector('svg'):null;
}

/* Rasterize any SVG to a canvas and call back with (canvas) or null on error.
   Uses getBBox to capture all content regardless of current zoom. */
function svgToCanvas(svgEl,done){
    var PAD=60;
    var innerG=svgEl.querySelector('g');
    var bbox=null;
    if(innerG){try{bbox=innerG.getBBox();}catch(e){}}
    if(!bbox||bbox.width<1){try{bbox=svgEl.getBBox();}catch(e){}}

    var svgClone=svgEl.cloneNode(true);
    svgClone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    var styleEl=document.createElementNS('http://www.w3.org/2000/svg','style');
    styleEl.textContent=getEmbeddedSvgStyle();
    svgClone.insertBefore(styleEl,svgClone.firstChild);

    var exportW,exportH;
    if(bbox&&bbox.width>0&&bbox.height>0){
        var vx=bbox.x-PAD,vy=bbox.y-PAD,vw=bbox.width+PAD*2,vh=bbox.height+PAD*2;
        var cloneG=svgClone.querySelector('g');
        if(cloneG)cloneG.removeAttribute('transform');
        svgClone.setAttribute('viewBox',vx+' '+vy+' '+vw+' '+vh);
        exportW=2400;exportH=Math.round(exportW*(vh/vw));
        if(exportH>4000){exportH=4000;exportW=Math.round(exportH*(vw/vh));}
    }else{
        exportW=(svgEl.clientWidth||1200)*2;exportH=(svgEl.clientHeight||800)*2;
        svgClone.setAttribute('viewBox','0 0 '+(svgEl.clientWidth||1200)+' '+(svgEl.clientHeight||800));
    }
    svgClone.setAttribute('width',String(exportW));svgClone.setAttribute('height',String(exportH));

    var svgStr=new XMLSerializer().serializeToString(svgClone);
    var blob=new Blob([svgStr],{type:'image/svg+xml;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var img=new Image();
    img.onload=function(){
        try{
            var canvas=document.createElement('canvas');
            canvas.width=exportW;canvas.height=exportH;
            var ctx=canvas.getContext('2d');
            ctx.fillStyle=document.documentElement.classList.contains('light')?'#ffffff':'#0a0a0c';
            ctx.fillRect(0,0,exportW,exportH);
            ctx.drawImage(img,0,0,exportW,exportH);
            URL.revokeObjectURL(url);
            done(canvas);
        }catch(ex){URL.revokeObjectURL(url);done(null,ex.message);}
    };
    img.onerror=function(){URL.revokeObjectURL(url);done(null,'Could not rasterize visualization');};
    img.src=url;
}

function exportPNG(graphConfig,svgRef,allRefs,showNotification){
    var vt=graphConfig.vizType;
    var fname=buildExportFilename(graphConfig,allRefs.localSourceKind,allRefs.repoInfo,'png');
    if(vt==='architecture'){showNotification('Use "Diagram SVG" for architecture export.','info');return;}
    if(vt==='graph3d'){
        var c=allRefs.graph3dRef&&allRefs.graph3dRef.current&&allRefs.graph3dRef.current.querySelector('canvas');
        if(!c){showNotification('3D graph not ready.','error');return;}
        var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=fname;a.click();
        showNotification('PNG downloaded.','success');return;
    }
    var svgEl=resolveVizSvg(graphConfig,svgRef,allRefs);
    if(!svgEl){showNotification('No visualization to export.','error');return;}
    svgToCanvas(svgEl,function(canvas,err){
        if(err||!canvas){showNotification(err||'Export failed','error');return;}
        var a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=fname;a.click();
        showNotification('PNG downloaded.','success');
    });
}


function exportPDF(graphConfig,svgRef,allRefs,showNotification){
    if(typeof window.jspdf==='undefined'||!window.jspdf.jsPDF){showNotification('PDF library failed to load.','error');return;}
    var vt=graphConfig.vizType;
    var fname=buildExportFilename(graphConfig,allRefs.localSourceKind,allRefs.repoInfo,'pdf');
    if(vt==='architecture'){showNotification('Use "Diagram SVG" for architecture export.','info');return;}
    if(vt==='graph3d'){showNotification('PDF export not available for 3D view.','error');return;}
    var svgEl=resolveVizSvg(graphConfig,svgRef,allRefs);
    if(!svgEl){showNotification('No visualization to export.','error');return;}
    svgToCanvas(svgEl,function(canvas,err){
        if(err||!canvas){showNotification(err||'PDF export failed','error');return;}
        try{
            var JsPDF=window.jspdf.jsPDF;
            var imgW=canvas.width,imgH=canvas.height;
            var aspect=imgW/imgH;
            var orientation=aspect>=1?'l':'p';
            var doc=new JsPDF({unit:'pt',format:'a4',orientation:orientation});
            var pageW=doc.internal.pageSize.getWidth(),pageH=doc.internal.pageSize.getHeight();
            var margin=36,maxW=pageW-2*margin,maxH=pageH-2*margin;
            var scale=Math.min(maxW/imgW,maxH/imgH);
            var drawW=imgW*scale,drawH=imgH*scale;
            doc.addImage(canvas.toDataURL('image/png'),'PNG',margin+(maxW-drawW)/2,margin+(maxH-drawH)/2,drawW,drawH);
            doc.save(fname);
        }catch(ex){showNotification(ex.message||'PDF export failed','error');}
    });
}

function exportJSON(data){if(!data)return;var blob=new Blob([JSON.stringify({stats:data.stats,files:data.files.map(function(f){return{path:f.path,fns:f.functions.length,layer:f.layer,lines:f.lines,dependencies:f.dependencies||[]};}),connections:data.connections,issues:data.issues,patterns:data.patterns,security:data.securityIssues,architectureDiagram:data.architectureDiagram},null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='codeflow-analysis.json';a.click();URL.revokeObjectURL(url);}

function getAnalysisSourceLabel(localSourceKind,repoInfo){
    if(localSourceKind==='folder')return'Local Folder';
    if(localSourceKind==='zip')return repoInfo&&repoInfo.name?repoInfo.name:'ZIP Archive';
    return repoInfo?repoInfo.owner+'/'+repoInfo.repo:'Unknown Repository';
}

function generateReport(format,data,localSourceKind,repoInfo,showNotification){
    if(!data)return;
    var repo=getAnalysisSourceLabel(localSourceKind,repoInfo);
    var h=calcHealth(data);
    var report={
        repository:repo,
        analyzedAt:new Date().toISOString(),
        codeflowVersion:'1.0',
        summary:{
            healthScore:h.score,
            healthGrade:h.grade,
            totalFiles:data.stats.files,
            totalFunctions:data.stats.functions,
            totalConnections:data.stats.connections,
            linesOfCode:data.stats.loc,
            unusedFunctions:data.stats.dead,
            securityIssues:data.securityIssues.length,
            patterns:data.patterns.length,
            duplicates:data.stats.duplicates||0,
            layerViolations:data.stats.violations||0,
            highSecurityIssues:data.stats.security||0
        },
        files:data.files.map(function(f){
            var fns=f.functions.map(function(fn){
                var statKey=fn.key||Parser.functionKey(fn);
                var st=data.fnStats[statKey]||data.fnStats[fn.name];
                return{
                    key:statKey,
                    name:fn.name,
                    line:fn.line,
                    internalCalls:st?st.internal:0,
                    externalCalls:st?st.external:0,
                    totalCalls:st?(st.internal+st.external):0,
                    isUnused:st?(st.internal+st.external===0):true,
                    isExported:st?st.isExported:false,
                    isClassMethod:st?st.isClassMethod:false,
                    isTopLevel:st?st.isTopLevel:true,
                    type:st?st.type:'function',
                    callers:st&&st.callers?st.callers.map(function(c){return{file:c.file,name:c.name,count:c.count};}):[],
                    code:fn.code
                };
            });
            return{
                path:f.path,
                name:f.name,
                folder:f.folder,
                layer:f.layer,
                lines:f.lines,
                churn:f.churn||0,
                isCode:f.isCode!==false,
                functions:fns,
                functionCount:f.functions.length
            };
        }),
        unusedFunctions:data.deadFunctions.map(function(fn){return{name:fn.name,file:fn.file,folder:fn.folder,line:fn.line,codeLines:fn.codeLines,code:fn.code,extension:fn.ext};}),
        dependencies:data.connections.map(function(c){
            var src=typeof c.source==='object'?c.source.id:c.source;
            var tgt=typeof c.target==='object'?c.target.id:c.target;
            return{from:src,to:tgt,function:c.fn,callCount:c.count};
        }),
        architectureIssues:data.issues.map(function(i){return{type:i.type,title:i.title,description:i.desc,affectedFiles:i.items?i.items.map(function(x){return x.file||x.name;}):[],affectedItems:i.items||[]};}),
        patterns:data.patterns.map(function(p){return{name:p.name,description:p.desc,isAntiPattern:p.isAnti||false,severity:p.severity||'info',icon:p.icon||'',files:p.files.map(function(f){return f.path||f.name;}),fileDetails:p.files||[],metrics:p.metrics||{}};}),
        securityIssues:data.securityIssues.map(function(s){return{severity:s.severity,title:s.title,description:s.desc,file:s.file,path:s.path,line:s.line,code:s.code};}),
        duplicates:data.duplicates||[],
        layerViolations:data.layerViolations||[],
        suggestions:data.suggestions||[],
        languageBreakdown:data.stats.languages||[],
        folderStructure:data.folders,
        functionStatistics:Object.keys(data.fnStats||{}).map(function(fnKey){
            var st=data.fnStats[fnKey];
            return{
                key:fnKey,
                name:st.name||fnKey,
                file:st.file,
                folder:st.folder,
                line:st.line,
                internalCalls:st.internal,
                externalCalls:st.external,
                totalCalls:st.count||(st.internal+st.external),
                isExported:st.isExported,
                isClassMethod:st.isClassMethod,
                isTopLevel:st.isTopLevel,
                type:st.type,
                callers:st.callers?st.callers.map(function(c){return{file:c.file,name:c.name,count:c.count};}):[],
                code:st.code
            };
        })
    };
    if(format==='json'){
        var blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
        var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='codeflow-report.json';a.click();URL.revokeObjectURL(url);
    }else if(format==='md'){
        var md='# CodeFlow Analysis Report\n\n';
        md+='**Repository:** '+repo+'\n';
        md+='**Analyzed:** '+new Date().toLocaleString()+'\n\n';
        md+='## Summary\n\n';
        md+='| Metric | Value |\n|--------|-------|\n';
        md+='| Health Score | '+h.score+'/100 ('+h.grade+') |\n';
        md+='| Files | '+data.stats.files+' |\n';
        md+='| Functions | '+data.stats.functions+' |\n';
        md+='| Lines of Code | '+data.stats.loc.toLocaleString()+' |\n';
        md+='| Dependencies | '+data.stats.connections+' |\n';
        md+='| Unused Functions | '+data.stats.dead+' |\n';
        md+='| Security Issues | '+data.securityIssues.length+' |\n\n';
        if(data.securityIssues.length>0){
            md+='## Security Issues\n\n';
            data.securityIssues.forEach(function(s){
                md+='### '+s.severity.toUpperCase()+': '+s.title+'\n';
                md+='- **File:** `'+s.path+'`'+(s.line?' (line '+s.line+')':'')+'\n';
                md+='- **Description:** '+s.desc+'\n';
                if(s.code)md+='- **Code:** `'+s.code+'`\n';
                md+='\n';
            });
        }
        if(data.deadFunctions.length>0){
            md+='## Unused Functions ('+data.deadFunctions.length+')\n\n';
            md+='These functions have zero calls (internal or external) and may be dead code:\n\n';
            data.deadFunctions.slice(0,50).forEach(function(fn){
                md+='### `'+fn.name+'()`\n';
                md+='- **File:** `'+fn.file+'`\n';
                md+='- **Line:** '+fn.line+'\n';
                md+='- **Lines of code:** '+fn.codeLines+'\n';
                if(fn.code)md+='```\n'+fn.code+'\n```\n';
                md+='\n';
            });
            if(data.deadFunctions.length>50)md+='\n*...and '+(data.deadFunctions.length-50)+' more unused functions*\n\n';
        }
        if(data.patterns.length>0){
            md+='## Design Patterns\n\n';
            data.patterns.filter(function(p){return!p.isAnti;}).forEach(function(p){
                md+='### '+p.name+'\n';
                md+=p.desc+'\n\n';
                md+='**Files:** '+p.files.slice(0,5).map(function(f){return'`'+f.name+'`';}).join(', ')+(p.files.length>5?' (+'+p.files.length-5+' more)':'')+'\n\n';
            });
            var antiPatterns=data.patterns.filter(function(p){return p.isAnti;});
            if(antiPatterns.length>0){
                md+='## Anti-Patterns\n\n';
                antiPatterns.forEach(function(p){
                    md+='### '+p.name+'\n';
                    md+=p.desc+'\n\n';
                    md+='**Affected files:** '+p.files.slice(0,5).map(function(f){return'`'+f.name+'`';}).join(', ')+'\n\n';
                });
            }
        }
        if(data.issues.length>0){
            md+='## Architecture Issues\n\n';
            data.issues.forEach(function(i){
                md+='### '+i.title+'\n';
                md+=i.desc+'\n\n';
                if(i.items)md+='**Affected:** '+i.items.slice(0,5).map(function(x){return'`'+(x.name||x.file)+'`';}).join(', ')+'\n\n';
            });
        }
        md+='## File Details\n\n';
        md+='| File | Folder | Layer | Lines | Functions |\n';
        md+='|------|--------|-------|-------|----------|\n';
        data.files.slice(0,100).forEach(function(f){
            md+='| `'+f.name+'` | '+f.folder+' | '+f.layer+' | '+f.lines+' | '+f.functions.length+' |\n';
        });
        if(data.files.length>100)md+='\n*...and '+(data.files.length-100)+' more files*\n';
        var blob=new Blob([md],{type:'text/markdown'});
        var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='codeflow-report.md';a.click();URL.revokeObjectURL(url);
    }else if(format==='txt'){
        var txt='CODEFLOW ANALYSIS REPORT\n';
        txt+='========================\n\n';
        txt+='Repository: '+repo+'\n';
        txt+='Analyzed: '+new Date().toLocaleString()+'\n\n';
        txt+='SUMMARY\n-------\n';
        txt+='Health Score: '+h.score+'/100 (Grade: '+h.grade+')\n';
        txt+='Files: '+data.stats.files+'\n';
        txt+='Functions: '+data.stats.functions+'\n';
        txt+='Lines of Code: '+data.stats.loc.toLocaleString()+'\n';
        txt+='Dependencies: '+data.stats.connections+'\n';
        txt+='Unused Functions: '+data.stats.dead+'\n';
        txt+='Security Issues: '+data.securityIssues.length+'\n\n';
        if(data.securityIssues.length>0){
            txt+='SECURITY ISSUES\n---------------\n';
            data.securityIssues.forEach(function(s,i){
                txt+=(i+1)+'. ['+s.severity.toUpperCase()+'] '+s.title+'\n';
                txt+='   File: '+s.path+(s.line?' (line '+s.line+')':'')+'\n';
                txt+='   '+s.desc+'\n';
                if(s.code)txt+='   Code: '+s.code+'\n';
                txt+='\n';
            });
        }
        if(data.deadFunctions.length>0){
            txt+='UNUSED FUNCTIONS ('+data.deadFunctions.length+')\n'+'-'.repeat(20)+'\n';
            txt+='These functions are never called and may be dead code:\n\n';
            data.deadFunctions.forEach(function(fn,i){
                txt+=(i+1)+'. '+fn.name+'()\n';
                txt+='   File: '+fn.file+' (line '+fn.line+')\n';
                txt+='   Lines: '+fn.codeLines+'\n';
                if(fn.code){txt+='   Code:\n';fn.code.split('\n').forEach(function(line){txt+='      '+line+'\n';});}
                txt+='\n';
            });
        }
        if(data.patterns.length>0){
            txt+='PATTERNS DETECTED\n-----------------\n';
            data.patterns.forEach(function(p){
                txt+=(p.isAnti?'[ANTI-PATTERN] ':'')+p.name+'\n';
                txt+='  '+p.desc+'\n';
                txt+='  Files: '+p.files.map(function(f){return f.name;}).join(', ')+'\n\n';
            });
        }
        if(data.issues.length>0){
            txt+='ARCHITECTURE ISSUES\n-------------------\n';
            data.issues.forEach(function(i){
                txt+='['+i.type.toUpperCase()+'] '+i.title+'\n';
                txt+='  '+i.desc+'\n';
                if(i.items)txt+='  Affected: '+i.items.map(function(x){return x.name||x.file;}).join(', ')+'\n';
                txt+='\n';
            });
        }
        txt+='FILE LIST\n---------\n';
        data.files.forEach(function(f){
            txt+=f.path+' ('+f.lines+' lines, '+f.functions.length+' functions, '+f.layer+')\n';
        });
        txt+='\nDEPENDENCIES\n------------\n';
        data.connections.slice(0,100).forEach(function(c){
            var src=typeof c.source==='object'?c.source.id:c.source;
            var tgt=typeof c.target==='object'?c.target.id:c.target;
            txt+=src.split('/').pop()+' -> '+tgt.split('/').pop()+' ('+c.fn+': '+c.count+' calls)\n';
        });
        if(data.connections.length>100)txt+='\n...and '+(data.connections.length-100)+' more dependencies\n';
        var blob=new Blob([txt],{type:'text/plain'});
        var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='codeflow-report.txt';a.click();URL.revokeObjectURL(url);
    }
    showNotification('Report exported as '+format.toUpperCase(),'success');
}

function exportCSV(data,localSourceKind,repoInfo,showNotification){
    if(!data){showNotification('No data to export.','error');return;}
    var rows=[['File','Folder','Layer','Lines','Functions','Avg CC','MI Score','Security Issues','Incoming','Outgoing']];
    var inDeg={},outDeg={};
    (data.connections||[]).forEach(function(c){
        var src=typeof c.source==='object'?c.source.id:c.source;
        var tgt=typeof c.target==='object'?c.target.id:c.target;
        outDeg[src]=(outDeg[src]||0)+1;
        inDeg[tgt]=(inDeg[tgt]||0)+1;
    });
    var secByFile={};
    (data.securityIssues||[]).forEach(function(s){
        var p=s.path||s.file||'';
        secByFile[p]=(secByFile[p]||0)+1;
    });
    (data.files||[]).forEach(function(f){
        var fns=f.functions||[];
        var avgCC=fns.length?Math.round(fns.reduce(function(s,fn){return s+(fn.cc||1);},0)/fns.length*10)/10:0;
        var mi=f.mi!=null?f.mi:(f.metrics&&f.metrics.mi!=null?f.metrics.mi:'');
        function esc(v){var s=String(v==null?'':v);return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s;}
        rows.push([esc(f.name),esc(f.folder||''),esc(f.layer||''),f.lines||0,fns.length,avgCC,mi,secByFile[f.path]||0,inDeg[f.path]||0,outDeg[f.path]||0]);
    });
    var csv=rows.map(function(r){return r.join(',');}).join('\n');
    var blob=new Blob([csv],{type:'text/csv'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    var repo=getAnalysisSourceLabel(localSourceKind,repoInfo);
    a.href=url;a.download='arcflow-metrics-'+repo.replace(/[^a-z0-9]/gi,'_')+'.csv';a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV downloaded ('+data.files.length+' files).','success');
}

function exportSARIF(data,localSourceKind,repoInfo,showNotification){
    if(!data){showNotification('No data to export.','error');return;}
    // SARIF 2.1.0 — GitHub Code Scanning compatible
    var rules=[];var ruleIndex={};
    var severityMap={high:'error',medium:'warning',low:'note',info:'note'};
    (data.securityIssues||[]).forEach(function(s){
        var ruleId=s.title.replace(/\s+/g,'-').replace(/[^a-zA-Z0-9-]/g,'').toLowerCase();
        if(ruleIndex[ruleId]==null){
            ruleIndex[ruleId]=rules.length;
            rules.push({id:ruleId,name:s.title,shortDescription:{text:s.title},fullDescription:{text:s.desc||s.title},
                defaultConfiguration:{level:severityMap[s.severity]||'warning'},
                helpUri:'https://owasp.org/www-project-top-ten/',
                properties:{tags:['security'],'security-severity':s.severity==='high'?'8.0':s.severity==='medium'?'5.0':'2.0'}});
        }
    });
    var results=(data.securityIssues||[]).map(function(s){
        var ruleId=s.title.replace(/\s+/g,'-').replace(/[^a-zA-Z0-9-]/g,'').toLowerCase();
        return{
            ruleId:ruleId,ruleIndex:ruleIndex[ruleId]||0,
            level:severityMap[s.severity]||'warning',
            message:{text:s.desc||s.title},
            locations:[{physicalLocation:{
                artifactLocation:{uri:(s.path||s.file||'').replace(/\\/g,'/'),uriBaseId:'%SRCROOT%'},
                region:{startLine:s.line||1,startColumn:1}
            }}]
        };
    });
    var sarif={
        version:'2.1.0',
        $schema:'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
        runs:[{
            tool:{driver:{name:'Arcflow',version:'1.0',informationUri:'https://arcflow.dev',rules:rules}},
            results:results,
            artifacts:(data.files||[]).map(function(f){return{location:{uri:f.path.replace(/\\/g,'/'),uriBaseId:'%SRCROOT%'},length:f.content?f.content.length:0};}),
            invocations:[{executionSuccessful:true,endTimeUtc:new Date().toISOString()}]
        }]
    };
    var blob=new Blob([JSON.stringify(sarif,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var repo=getAnalysisSourceLabel(localSourceKind,repoInfo);
    var a=document.createElement('a');a.href=url;a.download='arcflow-'+repo.replace(/[^a-z0-9]/gi,'_')+'.sarif';a.click();
    URL.revokeObjectURL(url);
    showNotification('SARIF exported ('+results.length+' findings).','success');
}

function exportSBOM(data,osvData,localSourceKind,repoInfo,showNotification){
    if(!data){showNotification('No data to export.','error');return;}
    var repo=getAnalysisSourceLabel(localSourceKind,repoInfo);
    var now=new Date().toISOString();
    // CycloneDX 1.4 JSON schema
    var components=[];
    var vulns=[];
    var vulnMap=(osvData&&osvData.vulnMap)||{};
    // Build components from OSV dependency data
    Object.values(vulnMap).forEach(function(entry){
        var pkg=entry.pkg;
        var compRef='pkg:'+pkg.ecosystem.toLowerCase()+'/'+pkg.name+'@'+pkg.version;
        components.push({
            type:'library',
            'bom-ref':compRef,
            name:pkg.name,
            version:pkg.version,
            purl:compRef
        });
        entry.vulns.forEach(function(v){
            vulns.push({
                id:v.id,
                source:{name:'OSV',url:v.url||('https://osv.dev/vulnerability/'+v.id)},
                ratings:[{severity:'unknown'}],
                description:v.summary||'',
                affects:[{ref:compRef,versions:[{version:pkg.version,status:'affected'}]}]
            });
        });
    });
    // Also add packages found without CVEs if we can detect them from package.json
    (data.files||[]).forEach(function(f){
        var name=(f.name||'').toLowerCase();
        if(name==='package.json'){
            try{
                var pkg=JSON.parse(f.content||'{}');
                var allDeps=Object.assign({},pkg.dependencies||{},pkg.devDependencies||{});
                Object.entries(allDeps).forEach(function(e){
                    var pRef='pkg:npm/'+e[0]+'@'+e[1].replace(/[\^~>=]/g,'');
                    if(!components.find(function(c){return c.name===e[0];})){
                        components.push({type:'library','bom-ref':pRef,name:e[0],version:e[1],purl:pRef});
                    }
                });
            }catch(e){}
        }
    });
    var sbom={
        bomFormat:'CycloneDX',
        specVersion:'1.4',
        serialNumber:'urn:uuid:'+([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(c){return(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16);}),
        version:1,
        metadata:{
            timestamp:now,
            tools:[{vendor:'Arcflow',name:'Arcflow Static Analyzer',version:'1.0'}],
            component:{type:'application',name:repo,version:''}
        },
        components:components,
        vulnerabilities:vulns
    };
    var blob=new Blob([JSON.stringify(sbom,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download='sbom-'+repo.replace(/[^a-z0-9]/gi,'_')+'.cdx.json';a.click();
    URL.revokeObjectURL(url);
    showNotification('SBOM exported (CycloneDX 1.4, '+components.length+' component'+(components.length!==1?'s':'')+', '+vulns.length+' vulnerability ref'+(vulns.length!==1?'s':'')+').','success');
}
