/* renderer-bundle.js - Circular bundle renderer */

/**
 * Renders the Circular Bundle into containerEl.
 * @param {HTMLElement} containerEl
 * @param {object} data
 * @param {object} opts      - { colorMap, folderFilter, selected, blastRadius }
 * @param {object} callbacks - { onSelect (selectFileRef.current), onFolderFilter, setSelected, setBlastRadius }
 * @returns {function} cleanup (no-op for bundle)
 */
function renderBundle(containerEl, data, opts, callbacks) {
    var colorMap     = opts.colorMap;
    var folderFilter = opts.folderFilter;
    var selected     = opts.selected;
    var blastRadius  = opts.blastRadius;
    var onSelect     = callbacks.onSelect;
    var onFolderFilter = callbacks.onFolderFilter;
    var setSelected  = callbacks.setSelected;
    var setBlastRadius = callbacks.setBlastRadius;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth||800, h = containerEl.clientHeight||600;
    var svg    = container.append('svg').attr('width',w).attr('height',h);
    var mainG  = svg.append('g').attr('transform','translate('+w/2+','+h/2+')');
    var zoom   = d3.zoom().scaleExtent([0.4,3]).on('zoom',function(e){
        mainG.attr('transform','translate('+(w/2+e.transform.x)+','+(h/2+e.transform.y)+') scale('+e.transform.k+')');
    });
    svg.call(zoom);

    var radius = Math.min(w,h)/2-100;
    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    var files = filteredFiles.slice(0,70);
    var fileIdx = {}; files.forEach(function(f,i){ fileIdx[f.path]=i; });
    var folderGroups = {};
    files.forEach(function(f){ var folder=f.folder||'root'; if(!folderGroups[folder])folderGroups[folder]=[]; folderGroups[folder].push(f); });

    var nodes = [], angle = 0;
    var sortedFolders = Object.entries(folderGroups).sort(function(a,b){ return b[1].length-a[1].length; });
    sortedFolders.forEach(function(entry){
        var folder=entry[0], fls=entry[1];
        var step = 2*Math.PI*fls.length/files.length;
        fls.forEach(function(f){
            nodes.push({id:f.path,name:f.name,folder:folder,angle:angle,x:Math.cos(angle-Math.PI/2)*radius,y:Math.sin(angle-Math.PI/2)*radius,layer:f.layer,fns:f.functions.length,lines:f.lines});
            angle += step/fls.length;
        });
    });
    var nodeMap = {}; nodes.forEach(function(n){ nodeMap[n.id]=n; });
    var links = [];
    data.connections.forEach(function(c){
        var src=typeof c.source==='object'?c.source.id:c.source;
        var tgt=typeof c.target==='object'?c.target.id:c.target;
        if(nodeMap[src]&&nodeMap[tgt]&&src!==tgt)links.push({source:nodeMap[src],target:nodeMap[tgt],count:c.count||1});
    });

    function isBundleLinkMatch(nodeId,linkDatum){ return linkDatum.source.id===nodeId||linkDatum.target.id===nodeId; }
    function getBundleLinkColor(linkDatum){ return colorMap[linkDatum.source.folder]||'var(--acc)'; }
    function getBundleDirectConnections(nodeId){
        var connected=new Set([nodeId]);
        links.forEach(function(linkDatum){ if(isBundleLinkMatch(nodeId,linkDatum)){ connected.add(linkDatum.source.id); connected.add(linkDatum.target.id); } });
        return connected;
    }

    var link = mainG.selectAll('path.bundle-link').data(links).join('path').attr('class','bundle-link')
        .attr('d',function(d){
            var a1=d.source.angle, a2=d.target.angle;
            var x1=Math.cos(a1-Math.PI/2)*(radius-15), y1=Math.sin(a1-Math.PI/2)*(radius-15);
            var x2=Math.cos(a2-Math.PI/2)*(radius-15), y2=Math.sin(a2-Math.PI/2)*(radius-15);
            var midAngle=(a1+a2)/2, tension=0.3*radius;
            var cx=Math.cos(midAngle-Math.PI/2)*tension, cy=Math.sin(midAngle-Math.PI/2)*tension;
            return'M'+x1+','+y1+'Q'+cx+','+cy+' '+x2+','+y2;
        })
        .attr('fill','none').attr('stroke',getBundleLinkColor).attr('stroke-width',1.8).attr('stroke-opacity',0.35);

    var tooltip = container.append('div').attr('class','treemap-tooltip').style('display','none').style('position','absolute');
    var node    = mainG.selectAll('g.bundle-node').data(nodes).join('g').attr('class','bundle-node').style('cursor','pointer')
        .attr('transform',function(d){ return'rotate('+(d.angle*180/Math.PI-90)+') translate('+radius+',0)'+(d.angle>Math.PI?' rotate(180)':''); });
    node.append('circle').attr('class','bundle-circle').attr('r',6)
        .attr('fill',function(d){ return colorMap[d.folder]||COLORS[0]; }).attr('stroke','var(--bg0)').attr('stroke-width',1.5)
        .attr('transform',function(d){ return d.angle>Math.PI?'translate(-6,0)':'translate(6,0)'; });
    node.append('text').attr('dy','0.31em').attr('x',function(d){ return d.angle>Math.PI?-14:14; })
        .attr('text-anchor',function(d){ return d.angle>Math.PI?'end':'start'; })
        .attr('fill','var(--t2)').attr('font-size','9px')
        .text(function(d){ var n=d.name.replace(/\.[^.]+$/,''); return n.length>16?n.slice(0,13)+'…':n; });

    function applyBundleDefaultState(){
        link.transition().duration(200).attr('stroke-opacity',0.35).attr('stroke-width',1.8).attr('stroke',getBundleLinkColor);
        node.selectAll('.bundle-circle').transition().duration(200)
            .attr('fill',function(d){ return colorMap[d.folder]||COLORS[0]; }).attr('opacity',1).attr('r',6).attr('stroke','var(--bg0)').attr('stroke-width',1.5);
    }
    function applyBundleHoverState(nodeId){
        var directConnections=getBundleDirectConnections(nodeId);
        link.transition().duration(200)
            .attr('stroke-opacity',function(linkDatum){ return isBundleLinkMatch(nodeId,linkDatum)?0.88:0.04; })
            .attr('stroke-width',function(linkDatum){ return isBundleLinkMatch(nodeId,linkDatum)?3.1:1; })
            .attr('stroke',function(linkDatum){ return isBundleLinkMatch(nodeId,linkDatum)?'var(--acc)':getBundleLinkColor(linkDatum); });
        node.selectAll('.bundle-circle').transition().duration(200)
            .attr('opacity',function(nodeDatum){ return directConnections.has(nodeDatum.id)?1:0.22; })
            .attr('r',function(nodeDatum){ return nodeDatum.id===nodeId?9:6; })
            .attr('stroke',function(nodeDatum){ return nodeDatum.id===nodeId?'var(--acc)':'var(--bg0)'; })
            .attr('stroke-width',function(nodeDatum){ return nodeDatum.id===nodeId?2:1.5; });
    }
    function applyBundleSelectionState(nodeId,blast){
        var directConnections=getBundleDirectConnections(nodeId);
        var affectedSet=new Set(blast&&blast.affected?blast.affected:[]);
        link.transition().duration(300)
            .attr('stroke-opacity',function(linkDatum){ return isBundleLinkMatch(nodeId,linkDatum)?0.96:0.08; })
            .attr('stroke-width',function(linkDatum){ return isBundleLinkMatch(nodeId,linkDatum)?3.6:1.15; })
            .attr('stroke',function(linkDatum){ return isBundleLinkMatch(nodeId,linkDatum)?'#ff9f43':getBundleLinkColor(linkDatum); });
        node.selectAll('.bundle-circle').transition().duration(300)
            .attr('fill',function(nodeDatum){ return nodeDatum.id===nodeId?'#ff5f5f':affectedSet.has(nodeDatum.id)?'#ff9f43':colorMap[nodeDatum.folder]||COLORS[0]; })
            .attr('opacity',function(nodeDatum){ return directConnections.has(nodeDatum.id)||affectedSet.has(nodeDatum.id)?1:0.22; })
            .attr('r',function(nodeDatum){ return nodeDatum.id===nodeId?9:6; })
            .attr('stroke',function(nodeDatum){ return nodeDatum.id===nodeId?'var(--acc)':'var(--bg0)'; })
            .attr('stroke-width',function(nodeDatum){ return nodeDatum.id===nodeId?2:1.5; });
    }

    node.on('mouseenter',function(e,d){
        var rect = containerEl.getBoundingClientRect();
        tooltip.html(renderTooltipHtml(d.name,[
            {label:'Lines',value:d.lines||0},{label:'Functions',value:d.fns||0},{label:'Folder',value:d.folder||'root'}
        ])).style('display','block').style('left',(e.clientX-rect.left+15)+'px').style('top',(e.clientY-rect.top+15)+'px');
        applyBundleHoverState(d.id);
    }).on('mousemove',function(e){
        var rect=containerEl.getBoundingClientRect();
        tooltip.style('left',(e.clientX-rect.left+15)+'px').style('top',(e.clientY-rect.top+15)+'px');
    }).on('mouseleave',function(){
        tooltip.style('display','none');
        if(selected&&nodeMap[selected.path]){
            applyBundleSelectionState(selected.path,blastRadius);
        } else {
            applyBundleDefaultState();
        }
    }).on('click',function(e,d){
        e.stopPropagation();
        if(onSelect)onSelect(d.id);
    });

    var arcGen = d3.arc().innerRadius(radius+20).outerRadius(radius+30);
    var folderAngleStart = 0;
    sortedFolders.forEach(function(entry,i){
        var folder=entry[0], count=entry[1].length;
        var span = 2*Math.PI*count/files.length;
        mainG.append('path').attr('d',arcGen({startAngle:folderAngleStart,endAngle:folderAngleStart+span}))
            .attr('fill',colorMap[folder]||COLORS[i%COLORS.length]).attr('opacity',0.5).style('cursor','pointer')
            .on('click',function(){ if(onFolderFilter)onFolderFilter(folder); });
        if(span>0.15){
            var midAngle = folderAngleStart+span/2-Math.PI/2;
            mainG.append('text').attr('x',Math.cos(midAngle)*(radius+40)).attr('y',Math.sin(midAngle)*(radius+40))
                .attr('text-anchor','middle').attr('fill','var(--t2)').attr('font-size','8px')
                .attr('transform','rotate('+(midAngle*180/Math.PI+90)+','+Math.cos(midAngle)*(radius+40)+','+Math.sin(midAngle)*(radius+40)+')')
                .text(folder.split('/').pop()||'root');
        }
        folderAngleStart += span;
    });

    svg.on('click',function(){ setSelected(null); setBlastRadius(null); applyBundleDefaultState(); });

    if(selected&&nodeMap[selected.path]){
        applyBundleSelectionState(selected.path,blastRadius);
    } else {
        applyBundleDefaultState();
    }
}
