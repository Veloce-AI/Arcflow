/* renderer-dendro.js - Cluster dendrogram renderer */

/**
 * Renders the Cluster Dendrogram into containerEl.
 * @param {HTMLElement} containerEl
 * @param {object} data
 * @param {object} opts      - { colorMap, folderFilter }
 * @param {object} callbacks - { onSelect (selectFileRef.current), onFolderFilter }
 */
function renderDendro(containerEl, data, opts, callbacks) {
    var colorMap     = opts.colorMap;
    var folderFilter = opts.folderFilter;
    var onSelect     = callbacks.onSelect;
    var onFolderFilter = callbacks.onFolderFilter;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth||800, h = containerEl.clientHeight||600;
    var svg = container.append('svg').attr('width',w).attr('height',h);
    var g   = svg.append('g').attr('transform','translate(80,20)');
    var zoom = d3.zoom().scaleExtent([0.3,3]).on('zoom',function(e){
        g.attr('transform','translate('+(80+e.transform.x)+','+(20+e.transform.y)+') scale('+e.transform.k+')');
    });
    svg.call(zoom);

    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    var hier = {name:'root',children:[]};
    var folderMap = {};
    filteredFiles.slice(0,80).forEach(function(f){
        var folder = f.folder||'root';
        if(!folderMap[folder])folderMap[folder]={name:folder.split('/').pop()||'root',fullPath:folder,children:[]};
        folderMap[folder].children.push({name:f.name,path:f.path,fns:f.functions.length,lines:f.lines,folder:folder,layer:f.layer});
    });
    hier.children = Object.values(folderMap);
    var root = d3.hierarchy(hier);
    var treeLayout = d3.cluster().size([h-60,w-200]);
    treeLayout(root);

    var tooltip = container.append('div').attr('class','treemap-tooltip').style('display','none').style('position','absolute');
    g.selectAll('path.dendro-link').data(root.links()).join('path').attr('class','dendro-link')
        .attr('d',function(d){ return'M'+d.source.y+','+d.source.x+'C'+(d.source.y+d.target.y)/2+','+d.source.x+' '+(d.source.y+d.target.y)/2+','+d.target.x+' '+d.target.y+','+d.target.x; })
        .attr('fill','none').attr('stroke','var(--border)').attr('stroke-width',1.5).attr('stroke-opacity',0.6);

    var node = g.selectAll('g.dendro-node').data(root.descendants()).join('g').attr('class','dendro-node')
        .attr('transform',function(d){ return'translate('+d.y+','+d.x+')'; }).style('cursor','pointer');
    node.append('circle').attr('r',function(d){ return d.children?6:8; })
        .attr('fill',function(d){ return d.children?'var(--bg3)':colorMap[d.data.folder]||COLORS[0]; })
        .attr('stroke',function(d){ return d.children?'var(--t3)':'var(--bg0)'; }).attr('stroke-width',2);
    node.filter(function(d){ return !d.children; }).append('text').attr('x',12).attr('dy','0.35em')
        .attr('fill','var(--t1)').attr('font-size','9px')
        .text(function(d){ var n=d.data.name.replace(/\.[^.]+$/,''); return n.length>20?n.slice(0,18)+'…':n; });
    node.filter(function(d){ return d.children&&d.depth>0; }).append('text').attr('x',-10).attr('dy','0.35em').attr('text-anchor','end')
        .attr('fill','var(--t2)').attr('font-size','10px').attr('font-weight','600').text(function(d){ return d.data.name; });
    node.on('mouseenter',function(e,d){
        if(!d.data.path)return;
        tooltip.html(renderTooltipHtml(d.data.name,[
            {label:'Lines',value:d.data.lines||0},{label:'Functions',value:d.data.fns||0},{label:'Layer',value:d.data.layer||'—'}
        ])).style('display','block').style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px');
        d3.select(this).select('circle').transition().duration(150).attr('r',12).attr('stroke','var(--acc)').attr('stroke-width',3);
    }).on('mousemove',function(e){ tooltip.style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px'); })
    .on('mouseleave',function(e,d){
        tooltip.style('display','none');
        d3.select(this).select('circle').transition().duration(150)
            .attr('r',d.children?6:8).attr('stroke',d.children?'var(--t3)':'var(--bg0)').attr('stroke-width',2);
    }).on('click',function(e,d){
        e.stopPropagation();
        if(d.data.path&&onSelect)onSelect(d.data.path);
        else if(d.data.fullPath&&onFolderFilter)onFolderFilter(d.data.fullPath);
    });
}

