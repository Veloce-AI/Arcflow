/* renderer-disjoint.js - Disjoint force-directed renderer */

/**
 * Renders the Disjoint (cluster) force-graph into containerEl.
 * @param {HTMLElement} containerEl
 * @param {object} data
 * @param {object} opts      - { colorMap, folderFilter }
 * @param {object} callbacks - { onSelect (selectFileRef.current), setSelected, setBlastRadius }
 * @returns {function} cleanup
 */
function renderDisjoint(containerEl, data, opts, callbacks) {
    var colorMap     = opts.colorMap;
    var folderFilter = opts.folderFilter;
    var onSelect     = callbacks.onSelect;
    var setSelected  = callbacks.setSelected;
    var setBlastRadius = callbacks.setBlastRadius;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth||800, h = containerEl.clientHeight||600;
    var svg = container.append('svg').attr('width',w).attr('height',h);
    var g   = svg.append('g');
    var zoom = d3.zoom().scaleExtent([0.2,4]).on('zoom',function(e){ g.attr('transform',e.transform); });
    svg.call(zoom);

    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    var files   = filteredFiles.slice(0,100);
    var fileIdx = {}; files.forEach(function(f,i){ fileIdx[f.path]=i; });
    var folders = [...new Set(files.map(function(f){ return f.folder||'root'; }))];
    var cols    = Math.ceil(Math.sqrt(folders.length));
    var cellW   = w/cols, cellH = h/Math.ceil(folders.length/cols);
    var centers = {};
    folders.forEach(function(f,i){ centers[f]={x:(i%cols+0.5)*cellW,y:(Math.floor(i/cols)+0.5)*cellH}; });
    var nodes = files.map(function(f){ return {id:f.path,name:f.name,folder:f.folder||'root',fns:f.functions.length,lines:f.lines,layer:f.layer,cx:centers[f.folder||'root'].x,cy:centers[f.folder||'root'].y}; });
    var links = [];
    data.connections.forEach(function(c){
        var src=typeof c.source==='object'?c.source.id:c.source;
        var tgt=typeof c.target==='object'?c.target.id:c.target;
        if(fileIdx[src]!==undefined&&fileIdx[tgt]!==undefined&&src!==tgt)links.push({source:src,target:tgt,count:c.count||1});
    });

    var sim = d3.forceSimulation(nodes)
        .force('link',d3.forceLink(links).id(function(d){ return d.id; }).distance(40).strength(0.3))
        .force('charge',d3.forceManyBody().strength(-80))
        .force('x',d3.forceX(function(d){ return d.cx; }).strength(0.15))
        .force('y',d3.forceY(function(d){ return d.cy; }).strength(0.15))
        .force('collide',d3.forceCollide(15));

    g.selectAll('rect.cluster-bg').data(folders).join('rect').attr('class','cluster-bg')
        .attr('x',function(d,i){ return(i%cols)*cellW+10; }).attr('y',function(d,i){ return Math.floor(i/cols)*cellH+10; })
        .attr('width',cellW-20).attr('height',cellH-20).attr('rx',12)
        .attr('fill',function(d){ return colorMap[d]||COLORS[folders.indexOf(d)%COLORS.length]; }).attr('opacity',0.08)
        .attr('stroke',function(d){ return colorMap[d]||COLORS[folders.indexOf(d)%COLORS.length]; }).attr('stroke-width',1).attr('stroke-opacity',0.3);
    g.selectAll('text.cluster-label').data(folders).join('text').attr('class','cluster-label')
        .attr('x',function(d,i){ return(i%cols)*cellW+20; }).attr('y',function(d,i){ return Math.floor(i/cols)*cellH+28; })
        .attr('fill','var(--t2)').attr('font-size','11px').attr('font-weight','600')
        .text(function(d){ return d.split('/').pop()||'root'; });

    var link = g.selectAll('line.disjoint-link').data(links).join('line').attr('class','disjoint-link')
        .attr('stroke','var(--border)').attr('stroke-width',1).attr('stroke-opacity',0.3);
    var tooltip = container.append('div').attr('class','treemap-tooltip').style('display','none').style('position','absolute');
    var node    = g.selectAll('g.disjoint-node').data(nodes).join('g').attr('class','disjoint-node').style('cursor','pointer')
        .call(d3.drag()
            .on('start',function(e,d){ if(!e.active)sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
            .on('drag',function(e,d){ d.fx=e.x; d.fy=e.y; })
            .on('end',function(e,d){ if(!e.active)sim.alphaTarget(0); d.fx=null; d.fy=null; }));
    node.append('circle').attr('class','disjoint-circle').attr('r',function(d){ return Math.max(6,Math.min(14,4+d.fns)); })
        .attr('fill',function(d){ return colorMap[d.folder]||COLORS[0]; }).attr('stroke','var(--bg0)').attr('stroke-width',1.5);
    node.on('mouseenter',function(e,d){
        tooltip.html(renderTooltipHtml(d.name,[
            {label:'Lines',value:d.lines||0},{label:'Functions',value:d.fns||0},{label:'Folder',value:d.folder}
        ])).style('display','block').style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px');
        link.attr('stroke-opacity',function(l){ return l.source.id===d.id||l.target.id===d.id?0.8:0.05; })
            .attr('stroke',function(l){ return l.source.id===d.id||l.target.id===d.id?'var(--acc)':'var(--border)'; });
        d3.select(this).select('circle').transition().duration(150).attr('r',14).attr('stroke','var(--acc)').attr('stroke-width',2);
    }).on('mousemove',function(e){ tooltip.style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px'); })
    .on('mouseleave',function(e,d){
        tooltip.style('display','none');
        link.attr('stroke-opacity',0.3).attr('stroke','var(--border)');
        d3.select(this).select('circle').transition().duration(150)
            .attr('r',Math.max(6,Math.min(14,4+d.fns))).attr('stroke','var(--bg0)').attr('stroke-width',1.5);
    }).on('click',function(e,d){ e.stopPropagation(); if(onSelect)onSelect(d.id); });

    sim.on('tick',function(){
        link.attr('x1',function(d){ return d.source.x; }).attr('y1',function(d){ return d.source.y; })
            .attr('x2',function(d){ return d.target.x; }).attr('y2',function(d){ return d.target.y; });
        node.attr('transform',function(d){ return'translate('+d.x+','+d.y+')'; });
    });
    svg.on('click',function(){ setSelected(null); setBlastRadius(null); });

    return function cleanup(){ sim.stop(); };
}

