/* renderer-treemap.js - Treemap renderer */


/**
 * Renders the Treemap into containerEl.
 * @param {HTMLElement} containerEl
 * @param {object} data
 * @param {object} opts      - { colorMap, folderFilter, selected, blastRadius }
 * @param {object} callbacks - { onSelect (selectFileRef.current), setSelected, setBlastRadius }
 */
function renderTreemap(containerEl, data, opts, callbacks) {
    var colorMap     = opts.colorMap;
    var folderFilter = opts.folderFilter;
    var selected     = opts.selected;
    var blastRadius  = opts.blastRadius;
    var onSelect     = callbacks.onSelect;
    var setSelected  = callbacks.setSelected;
    var setBlastRadius = callbacks.setBlastRadius;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth||800, h = containerEl.clientHeight||600;
    var svg = container.append('svg').attr('width',w).attr('height',h).style('cursor','grab');
    var g   = svg.append('g');
    var zoom = d3.zoom().scaleExtent([0.3,4]).on('zoom',function(e){
        g.attr('transform',e.transform);
        svg.style('cursor',e.transform.k>1?'grab':'default');
    });
    svg.call(zoom);

    var hier = {name:'root',children:[]};
    var folderMap = {};
    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    filteredFiles.forEach(function(f){
        var folder = f.folder||'root';
        if(!folderMap[folder])folderMap[folder]={name:folder,children:[]};
        folderMap[folder].children.push({name:f.name,value:f.lines||1,path:f.path,layer:f.layer,fns:f.functions.length,folder:folder});
    });
    hier.children = Object.values(folderMap);
    var root = d3.hierarchy(hier).sum(function(d){ return d.value||0; }).sort(function(a,b){ return b.value-a.value; });
    d3.treemap().size([w-20,h-20]).padding(3).round(true)(root);

    var cells = g.selectAll('g.treemap-cell-g').data(root.leaves()).join('g').attr('class','treemap-cell-g')
        .attr('transform',function(d){ return'translate('+d.x0+','+d.y0+')'; });
    cells.append('rect').attr('class','treemap-rect')
        .attr('width',function(d){ return Math.max(0,d.x1-d.x0); })
        .attr('height',function(d){ return Math.max(0,d.y1-d.y0); })
        .attr('fill',function(d){ return colorMap[d.parent.data.name]||COLORS[hier.children.indexOf(d.parent.data)%COLORS.length]; })
        .attr('opacity',0.85).attr('rx',3).attr('stroke','var(--bg0)').attr('stroke-width',1).style('cursor','pointer');
    cells.filter(function(d){ return d.x1-d.x0>45&&d.y1-d.y0>22; }).append('text').attr('class','treemap-text')
        .attr('x',4).attr('y',14).attr('fill','white').attr('font-size','10px').attr('font-weight','500')
        .style('text-shadow','0 1px 2px rgba(0,0,0,0.5)').style('pointer-events','none')
        .text(function(d){ var n=d.data.name.replace(/\.[^.]+$/,''); var maxLen=Math.floor((d.x1-d.x0-8)/6); return n.length>maxLen?n.slice(0,maxLen-1)+'…':n; });
    cells.filter(function(d){ return d.x1-d.x0>60&&d.y1-d.y0>35; }).append('text').attr('class','treemap-subtext')
        .attr('x',4).attr('y',26).attr('fill','rgba(255,255,255,0.7)').attr('font-size','8px').style('pointer-events','none')
        .text(function(d){ return d.data.value+' lines'; });

    var tooltip = container.append('div').attr('class','treemap-tooltip').style('display','none').style('position','absolute');
    cells.on('mouseenter',function(e,d){
        tooltip.html(renderTooltipHtml(d.data.name,[
            {label:'Lines',value:d.data.value},{label:'Functions',value:d.data.fns||0},
            {label:'Layer',value:d.data.layer||'—'},{label:'Folder',value:d.data.folder||'root'}
        ])).style('display','block').style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px');
        d3.select(this).select('rect').transition().duration(150).attr('opacity',1).attr('stroke','var(--acc)').attr('stroke-width',2);
    }).on('mousemove',function(e){ tooltip.style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px'); })
    .on('mouseleave',function(e,d){
        tooltip.style('display','none');
        var sel  = selected?selected.path:null;
        var isSelected  = d.data.path===sel;
        var isAffected  = blastRadius&&blastRadius.affected.includes(d.data.path);
        d3.select(this).select('rect').transition().duration(150)
            .attr('opacity',isSelected?1:isAffected?0.95:0.85)
            .attr('stroke',isSelected?'#ff5f5f':isAffected?'var(--orange)':'var(--bg0)')
            .attr('stroke-width',isSelected||isAffected?2:1);
    }).on('click',function(e,d){
        e.stopPropagation();
        if(d.data.path&&onSelect){
            onSelect(d.data.path);
            setTimeout(function(){
                var blast=blastRadius;
                cells.select('rect').transition().duration(300)
                    .attr('opacity',function(n){ return n.data.path===d.data.path?1:(blast&&blast.affected.includes(n.data.path))?0.95:0.4; })
                    .attr('fill',function(n){ return n.data.path===d.data.path?'#ff5f5f':(blast&&blast.affected.includes(n.data.path))?'#ff9f43':colorMap[n.parent.data.name]||COLORS[0]; })
                    .attr('stroke',function(n){ return n.data.path===d.data.path?'#ff5f5f':(blast&&blast.affected.includes(n.data.path))?'var(--orange)':'var(--bg0)'; })
                    .attr('stroke-width',function(n){ return n.data.path===d.data.path||(blast&&blast.affected.includes(n.data.path))?2:1; });
            },100);
        }
    });
    svg.on('click',function(){
        setSelected(null); setBlastRadius(null);
        cells.select('rect').transition().duration(300)
            .attr('opacity',0.85)
            .attr('fill',function(d){ return colorMap[d.parent.data.name]||COLORS[0]; })
            .attr('stroke','var(--bg0)').attr('stroke-width',1);
    });
    svg.on('dblclick.zoom',function(e){ e.preventDefault(); svg.transition().duration(300).call(zoom.scaleTo,1); });
}

