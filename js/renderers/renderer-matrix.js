/* renderer-matrix.js - Dependency matrix renderer */

/**
 * Renders the dependency Matrix (heatmap) into containerEl.
 * @param {HTMLElement} containerEl
 * @param {object} data
 * @param {object} opts      - { folderFilter }
 * @param {object} callbacks - { onSelect (selectFileRef.current) }
 */
function renderMatrix(containerEl, data, opts, callbacks) {
    var folderFilter = opts.folderFilter;
    var onSelect     = callbacks.onSelect;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth||800, h = containerEl.clientHeight||600;
    var svg = container.append('svg').attr('width',w).attr('height',h);
    var g   = svg.append('g').attr('transform','translate(100,80)');
    var zoom = d3.zoom().scaleExtent([0.5,3]).on('zoom',function(e){
        g.attr('transform','translate('+(100+e.transform.x)+','+(80+e.transform.y)+') scale('+e.transform.k+')');
    });
    svg.call(zoom);

    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    var files  = filteredFiles.slice(0,40);
    var n      = files.length;
    var cellSize = Math.min(18,Math.max(10,(Math.min(w-120,h-100))/n));
    var matrix = [], fileIdx = {};
    files.forEach(function(f,i){ fileIdx[f.path]=i; matrix[i]=[]; for(var j=0;j<n;j++)matrix[i][j]=0; });
    data.connections.forEach(function(c){
        var src=typeof c.source==='object'?c.source.id:c.source;
        var tgt=typeof c.target==='object'?c.target.id:c.target;
        if(fileIdx[src]!==undefined&&fileIdx[tgt]!==undefined)matrix[fileIdx[src]][fileIdx[tgt]]+=c.count||1;
    });
    var maxVal=1;
    matrix.forEach(function(row){ row.forEach(function(v){ if(v>maxVal)maxVal=v; }); });

    var colLabels = g.selectAll('text.col-label').data(files).join('text').attr('class','col-label')
        .attr('x',function(d,i){ return i*cellSize+cellSize/2; }).attr('y',-8).attr('text-anchor','start')
        .attr('transform',function(d,i){ return'rotate(-45,'+(i*cellSize+cellSize/2)+','+-8+')'; })
        .attr('fill','var(--t2)').attr('font-size','9px')
        .text(function(d){ var n=d.name.replace(/\.[^.]+$/,''); return n.length>10?n.slice(0,8)+'…':n; })
        .style('cursor','pointer').on('click',function(e,d){ if(onSelect)onSelect(d.path); });
    var rowLabels = g.selectAll('text.row-label').data(files).join('text').attr('class','row-label')
        .attr('x',-8).attr('y',function(d,i){ return i*cellSize+cellSize/2+3; }).attr('text-anchor','end')
        .attr('fill','var(--t2)').attr('font-size','9px')
        .text(function(d){ var n=d.name.replace(/\.[^.]+$/,''); return n.length>10?n.slice(0,8)+'…':n; })
        .style('cursor','pointer').on('click',function(e,d){ if(onSelect)onSelect(d.path); });

    var cellData = [];
    files.forEach(function(f,i){ files.forEach(function(g2,j){ cellData.push({row:i,col:j,value:matrix[i][j],source:f,target:g2}); }); });

    var tooltip = container.append('div').attr('class','treemap-tooltip').style('display','none').style('position','absolute');
    var cells   = g.selectAll('rect.matrix-cell-rect').data(cellData).join('rect').attr('class','matrix-cell-rect')
        .attr('x',function(d){ return d.col*cellSize; }).attr('y',function(d){ return d.row*cellSize; })
        .attr('width',cellSize-1).attr('height',cellSize-1).attr('rx',2)
        .attr('fill',function(d){ return d.value>0?'rgba(99,102,241,'+Math.max(0.15,d.value/maxVal)+')':'var(--bg2)'; })
        .attr('stroke','var(--bg0)').attr('stroke-width',0.5).style('cursor','pointer');
    cells.on('mouseenter',function(e,d){
        tooltip.html(renderTooltipHtml(d.source.name+' → '+d.target.name,[{label:'Connections',value:d.value}]))
            .style('display','block').style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px');
        g.selectAll('rect.matrix-cell-rect').attr('opacity',function(c){ return c.row===d.row||c.col===d.col?1:0.3; });
        colLabels.attr('fill',function(f,i){ return i===d.col?'var(--acc)':'var(--t2)'; }).attr('font-weight',function(f,i){ return i===d.col?'600':'400'; });
        rowLabels.attr('fill',function(f,i){ return i===d.row?'var(--acc)':'var(--t2)'; }).attr('font-weight',function(f,i){ return i===d.row?'600':'400'; });
        d3.select(this).attr('stroke','var(--acc)').attr('stroke-width',2);
    }).on('mousemove',function(e){ tooltip.style('left',(e.offsetX+15)+'px').style('top',(e.offsetY+15)+'px'); })
    .on('mouseleave',function(){
        tooltip.style('display','none');
        cells.attr('opacity',1);
        colLabels.attr('fill','var(--t2)').attr('font-weight','400');
        rowLabels.attr('fill','var(--t2)').attr('font-weight','400');
        d3.select(this).attr('stroke','var(--bg0)').attr('stroke-width',0.5);
    }).on('click',function(e,d){ e.stopPropagation(); if(onSelect)onSelect(d.source.path); });

    var legend = container.append('div').attr('class','heatmap-legend').style('position','absolute').style('bottom','60px').style('right','20px');
    legend.html('<div style="font-size:9px;color:var(--t2)">Connection Strength</div><div class="heatmap-gradient"></div><div style="display:flex;justify-content:space-between;font-size:8px;color:var(--t3)"><span>0</span><span>'+maxVal+'</span></div>');
}

