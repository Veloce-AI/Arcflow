/* renderer-sankey.js - Sankey diagram renderer (extracted from App.js useEffect) */

/**
 * Renders the Sankey flow diagram into containerEl.
 * @param {HTMLElement} containerEl - the sankey container div (sankeyRef.current)
 * @param {object} data      - full analysis data object
 * @param {object} opts      - { folderFilter, colorMap }
 * @param {object} callbacks - { onFolderFilter } — called with folder path when a node is clicked
 */
function renderSankey(containerEl, data, opts, callbacks) {
    var folderFilter   = opts.folderFilter;
    var colorMap       = opts.colorMap;
    var onFolderFilter = callbacks.onFolderFilter;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth  || 800;
    var h = containerEl.clientHeight || 600;
    var svg = container.append('svg').attr('width',w).attr('height',h);
    var g   = svg.append('g').attr('transform','translate(20,20)');
    var zoom = d3.zoom().scaleExtent([0.5,2]).on('zoom',function(e){
        g.attr('transform','translate('+(20+e.transform.x)+','+(20+e.transform.y)+') scale('+e.transform.k+')');
    });
    svg.call(zoom);

    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    var folders = [...new Set(filteredFiles.map(function(f){ return f.folder||'root'; }))].slice(0,15);
    var folderIdx = {};
    folders.forEach(function(f,i){ folderIdx[f]=i; });
    var filteredPaths = new Set(filteredFiles.map(function(f){ return f.path; }));

    var flowMap = {};
    data.connections.forEach(function(c){
        var src = typeof c.source==='object'?c.source.id:c.source;
        var tgt = typeof c.target==='object'?c.target.id:c.target;
        if(!filteredPaths.has(src)&&!filteredPaths.has(tgt))return;
        var srcFile = data.files.find(function(f){ return f.path===src; });
        var tgtFile = data.files.find(function(f){ return f.path===tgt; });
        if(srcFile&&tgtFile&&srcFile.folder!==tgtFile.folder){
            var key = srcFile.folder+'|'+tgtFile.folder;
            flowMap[key] = (flowMap[key]||0) + (c.count||1);
        }
    });

    var nodes = folders.map(function(f,i){
        return {id:i,name:f.split('/').pop()||'root',fullPath:f,fileCount:filteredFiles.filter(function(x){ return x.folder===f; }).length};
    });

    // Merge bidirectional flows to avoid circular link errors
    var linkMap = {};
    Object.entries(flowMap).forEach(function(e){
        var parts=e[0].split('|'), val=e[1];
        var si=folderIdx[parts[0]], ti=folderIdx[parts[1]];
        if(si!==undefined&&ti!==undefined&&si!==ti){
            var key=Math.min(si,ti)+'|'+Math.max(si,ti);
            if(!linkMap[key])linkMap[key]={a:Math.min(si,ti),b:Math.max(si,ti),ab:0,ba:0};
            if(si<ti)linkMap[key].ab+=val; else linkMap[key].ba+=val;
        }
    });
    var links = [];
    Object.values(linkMap).forEach(function(l){
        var net=l.ab-l.ba;
        if(net>0)links.push({source:l.a,target:l.b,value:net});
        else if(net<0)links.push({source:l.b,target:l.a,value:-net});
        else if(l.ab>0)links.push({source:l.a,target:l.b,value:l.ab});
    });

    if(links.length===0){
        g.append('text').attr('x',w/2).attr('y',h/2).attr('fill','#888').attr('font-size','12px').attr('text-anchor','middle').text('No cross-folder dependencies to visualize');
        return;
    }

    // Break cycles with DFS before passing to sankey
    function breakCycles(ns,ls){
        var adj={};
        ns.forEach(function(n){adj[n.id]=[];});
        ls.forEach(function(l){(adj[l.source]=adj[l.source]||[]).push(l);});
        var kept=[],visiting={},visited={};
        function dfs(id){
            if(visiting[id])return;
            visiting[id]=1;
            (adj[id]||[]).forEach(function(l){
                if(!visiting[l.target]){kept.push(l);dfs(l.target);}
            });
            visiting[id]=0;visited[id]=1;
        }
        ns.forEach(function(n){if(!visited[n.id])dfs(n.id);});
        return kept;
    }
    links=breakCycles(nodes,links);

    if(!d3.sankey){
        g.append('text').attr('x',w/2).attr('y',h/2).attr('fill','#888').attr('font-size','12px').attr('text-anchor','middle').text('d3-sankey not loaded');
        return;
    }

    var sankey = d3.sankey()
        .nodeId(function(d){ return d.id; })
        .nodeWidth(20).nodePadding(15)
        .extent([[0,0],[w-60,h-60]]);

    var graph;
    try {
        graph = sankey({
            nodes:nodes.map(function(d){ return Object.assign({},d); }),
            links:links.map(function(d){ return Object.assign({},d); })
        });
    } catch(e) {
        g.append('text').attr('x',w/2).attr('y',h/2).attr('fill','#888').attr('font-size','12px').attr('text-anchor','middle')
            .text('Flow unavailable — try a subfolder or Force Graph view.');
        return;
    }

    var tooltip = container.append('div').attr('class','treemap-tooltip').style('display','none').style('position','absolute');

    g.selectAll('path.sankey-link').data(graph.links).join('path').attr('class','sankey-link')
        .attr('d',d3.sankeyLinkHorizontal()).attr('fill','none')
        .attr('stroke',function(d){ return colorMap[d.source.fullPath]||COLORS[d.source.id%COLORS.length]; })
        .attr('stroke-width',function(d){ return Math.max(2,d.width); }).attr('stroke-opacity',0.4)
        .on('mouseenter',function(e,d){
            d3.select(this).attr('stroke-opacity',0.8);
            tooltip.html(renderTooltipHtml(d.source.name+' → '+d.target.name,[{label:'Connections',value:d.value}]))
                .style('display','block').style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px');
        }).on('mouseleave',function(){ d3.select(this).attr('stroke-opacity',0.4); tooltip.style('display','none'); });

    var node = g.selectAll('g.sankey-node').data(graph.nodes).join('g').attr('class','sankey-node').style('cursor','pointer');
    node.append('rect')
        .attr('x',function(d){ return d.x0; }).attr('y',function(d){ return d.y0; })
        .attr('width',function(d){ return d.x1-d.x0; }).attr('height',function(d){ return Math.max(4,d.y1-d.y0); })
        .attr('fill',function(d){ return colorMap[d.fullPath]||COLORS[d.id%COLORS.length]; }).attr('rx',3);
    node.append('text')
        .attr('x',function(d){ return d.x0<w/2?d.x1+8:d.x0-8; }).attr('y',function(d){ return(d.y0+d.y1)/2; })
        .attr('dy','0.35em').attr('text-anchor',function(d){ return d.x0<w/2?'start':'end'; })
        .attr('fill','var(--t1)').attr('font-size','10px').attr('font-weight','500')
        .text(function(d){ return d.name+' ('+d.fileCount+')'; });
    node.on('mouseenter',function(e,d){
        tooltip.html(renderTooltipHtml(d.fullPath,[{label:'Files',value:d.fileCount}]))
            .style('display','block').style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px');
        g.selectAll('path.sankey-link').attr('stroke-opacity',function(l){ return l.source.id===d.id||l.target.id===d.id?0.8:0.1; });
    }).on('mouseleave',function(){ tooltip.style('display','none'); g.selectAll('path.sankey-link').attr('stroke-opacity',0.4); })
    .on('click',function(e,d){ e.stopPropagation(); onFolderFilter(d.fullPath); });
}
