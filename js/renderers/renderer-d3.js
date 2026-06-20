/* renderer-d3.js - D3 force-graph renderer (extracted from App.js useEffect) */

/**
 * Renders the 2D D3 force-graph into svgEl.
 * @param {SVGElement} svgEl - the <svg ref> element
 * @param {object} data      - full analysis data object
 * @param {object} opts      - { colorMode, colorMap, theme, folderFilter, graphConfig, zoomRef, simRef, nodesRef, linksRef }
 * @param {object} callbacks - { onSelect, setTooltip, setSelected, setBlastRadius }
 * @returns {function} cleanup - call to stop the simulation
 */
function renderForceGraph(svgEl, data, opts, callbacks) {
    var colorMode    = opts.colorMode;
    var colorMap     = opts.colorMap;
    var theme        = opts.theme;
    var folderFilter = opts.folderFilter;
    var graphConfig  = opts.graphConfig;
    var zoomRef      = opts.zoomRef;
    var simRef       = opts.simRef;
    var nodesRef     = opts.nodesRef;
    var linksRef     = opts.linksRef;

    var onSelect        = callbacks.onSelect;       // selectFileRef.current
    var setTooltip      = callbacks.setTooltip;
    var setSelected     = callbacks.setSelected;
    var setBlastRadius  = callbacks.setBlastRadius;

    var svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    try {
        var w = svgEl.clientWidth;
        var h = svgEl.clientHeight;
        var filteredFiles = folderFilter
            ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
            : data.files;
        var fileIds = new Set(filteredFiles.map(function(f){ return f.path; }));
        var nodes = filteredFiles.map(function(f){ return {id:f.path,name:f.name,folder:f.folder,fnCount:f.functions.length,layer:f.layer,churn:f.churn||0}; });
        var linkMap = new Map();
        data.connections.forEach(function(c){
            if(!fileIds.has(c.source)||!fileIds.has(c.target))return;
            if(c.source===c.target)return;
            var k = c.source+'|'+c.target;
            if(!linkMap.has(k))linkMap.set(k,{source:c.source,target:c.target,count:0});
            linkMap.get(k).count += c.count;
        });
        var links = Array.from(linkMap.values());

        // Entry-point files: nodes with no incoming connections in the current filtered view
        var incomingTargets = new Set(links.map(function(l){ return l.target; }));
        var entryPointSet = new Set(nodes.filter(function(n){ return !incomingTargets.has(n.id); }).map(function(n){ return n.id; }));

        function getR(d){ return Math.max(8,Math.min(24,5+d.fnCount*0.8)); }
        function getC(d){
            if(colorMode==='folder')return colorMap[d.folder]||COLORS[0];
            if(colorMode==='layer')return LAYER_COLORS[d.layer]||LAYER_COLORS['utils'];
            if(colorMode==='churn')return colorMap[d.id]||'#22c55e';
            return COLORS[0];
        }
        function contrastColor(hex){
            var c=d3.color(hex);
            if(!c)return'#fff';
            var r=c.r/255,g=c.g/255,b=c.b/255;
            r=r<0.03928?r/12.92:Math.pow((r+0.055)/1.055,2.4);
            g=g<0.03928?g/12.92:Math.pow((g+0.055)/1.055,2.4);
            b=b<0.03928?b/12.92:Math.pow((b+0.055)/1.055,2.4);
            return(0.2126*r+0.7152*g+0.0722*b)>0.179?'#111':'#fff';
        }

        var folders=[...new Set(nodes.map(function(n){ return n.folder; }))];
        var cols=Math.max(2,Math.ceil(Math.sqrt(folders.length)));
        var cw=w/(cols+1);
        var ch=h/(Math.ceil(folders.length/cols)+1);
        var centers={};
        folders.forEach(function(f,i){ centers[f]={x:(i%cols+1)*cw,y:(Math.floor(i/cols)+1)*ch}; });

        var zoom=d3.zoom().scaleExtent([0.2,5]).on('zoom',function(e){ container.attr('transform',e.transform); });
        svg.call(zoom);
        zoomRef.current = zoom;

        var container = svg.append('g');
        var defs = svg.append('defs');
        defs.append('marker').attr('id','arr').attr('viewBox','0 -5 10 10').attr('refX',14).attr('markerWidth',4).attr('markerHeight',4).attr('orient','auto')
            .append('path').attr('d','M0,-4L10,0L0,4').attr('fill',theme==='light'?'#aaa':'#444');

        var hullLayer = container.append('g');
        var linkLayer = container.append('g');
        var nodeLayer = container.append('g');

        var sim = d3.forceSimulation(nodes);
        if(graphConfig.viewMode==='force'){
            sim.force('link',d3.forceLink(links).id(function(d){ return d.id; }).distance(graphConfig.linkDist).strength(0.3))
               .force('charge',d3.forceManyBody().strength(-graphConfig.spacing).distanceMax(400))
               .force('collision',d3.forceCollide().radius(function(d){ return getR(d)+12; }))
               .force('x',d3.forceX(function(d){ return centers[d.folder]?centers[d.folder].x:w/2; }).strength(0.15))
               .force('y',d3.forceY(function(d){ return centers[d.folder]?centers[d.folder].y:h/2; }).strength(0.15));
        } else if(graphConfig.viewMode==='radial'){
            var r=Math.min(w,h)*0.35;
            nodes.forEach(function(n,i){ n.angle=i/nodes.length*2*Math.PI; n.targetX=w/2+Math.cos(n.angle)*r; n.targetY=h/2+Math.sin(n.angle)*r; });
            sim.force('link',d3.forceLink(links).id(function(d){ return d.id; }).distance(graphConfig.linkDist*0.5).strength(0.05))
               .force('charge',d3.forceManyBody().strength(-graphConfig.spacing*0.3))
               .force('collision',d3.forceCollide().radius(function(d){ return getR(d)+8; }))
               .force('x',d3.forceX(function(d){ return d.targetX; }).strength(0.8))
               .force('y',d3.forceY(function(d){ return d.targetY; }).strength(0.8));
        } else if(graphConfig.viewMode==='hierarchical'){
            var layerOrder={util:0,model:1,service:2,controller:3,view:4,test:5,config:6,modules:7,forms:8,classes:9};
            var layerGroups={};
            nodes.forEach(function(n){ var l=n.layer||'util'; if(!layerGroups[l])layerGroups[l]=[]; layerGroups[l].push(n); });
            var sortedLayers=Object.keys(layerGroups).sort(function(a,b){ return(layerOrder[a]||99)-(layerOrder[b]||99); });
            sortedLayers.forEach(function(l,li){ var g=layerGroups[l]; var colW=w/(sortedLayers.length+1); g.forEach(function(n,ni){ n.targetX=(li+1)*colW; n.targetY=(ni+1)*h/(g.length+1); }); });
            sim.force('link',d3.forceLink(links).id(function(d){ return d.id; }).distance(graphConfig.linkDist).strength(0.1))
               .force('charge',d3.forceManyBody().strength(-graphConfig.spacing*0.5).distanceMax(200))
               .force('collision',d3.forceCollide().radius(function(d){ return getR(d)+10; }))
               .force('x',d3.forceX(function(d){ return d.targetX||w/2; }).strength(0.9))
               .force('y',d3.forceY(function(d){ return d.targetY||h/2; }).strength(0.3));
        } else if(graphConfig.viewMode==='grid'){
            var gridCols=Math.ceil(Math.sqrt(nodes.length));
            var cellW=w/(gridCols+1);
            var cellH=h/(Math.ceil(nodes.length/gridCols)+1);
            nodes.forEach(function(n,i){ n.targetX=(i%gridCols+1)*cellW; n.targetY=(Math.floor(i/gridCols)+1)*cellH; });
            sim.force('link',d3.forceLink(links).id(function(d){ return d.id; }).distance(graphConfig.linkDist*1.5).strength(0.02))
               .force('collision',d3.forceCollide().radius(function(d){ return getR(d)+15; }))
               .force('x',d3.forceX(function(d){ return d.targetX; }).strength(1))
               .force('y',d3.forceY(function(d){ return d.targetY; }).strength(1));
        } else if(graphConfig.viewMode==='metro'){
            var metro={lines:[],stations:{}};
            var roots=nodes.filter(function(n){ return !links.some(function(l){ return(l.target.id||l.target)===n.id; }); });
            if(!roots.length)roots=[nodes[0]];
            var lineY=80, lineSpacing=Math.min(120,(h-160)/Math.max(1,roots.length));
            roots.forEach(function(root,li){
                var visited=new Set(), queue=[root.id], line=[], x=80;
                while(queue.length){
                    var id=queue.shift(); if(visited.has(id))continue; visited.add(id);
                    var node=nodes.find(function(n){ return n.id===id; });
                    if(node){ node.targetX=x; node.targetY=lineY+li*lineSpacing; node.metroLine=li; line.push(node); x+=graphConfig.spacing*0.8; }
                    links.forEach(function(l){ var s=l.source.id||l.source, t=l.target.id||l.target; if(s===id&&!visited.has(t))queue.push(t); });
                }
                metro.lines.push(line);
            });
            nodes.filter(function(n){ return !n.targetX; }).forEach(function(n,i){ n.targetX=80+i*50; n.targetY=h-80; n.metroLine=roots.length; });
            sim.force('link',d3.forceLink(links).id(function(d){ return d.id; }).distance(graphConfig.linkDist).strength(0.05))
               .force('collision',d3.forceCollide().radius(function(d){ return getR(d)+12; }))
               .force('x',d3.forceX(function(d){ return d.targetX||w/2; }).strength(0.95))
               .force('y',d3.forceY(function(d){ return d.targetY||h/2; }).strength(0.95));
        }

        var isLargeGraph = nodes.length > 300;
        var alphaDecay   = isLargeGraph ? 0.08 : 0.05;
        var velDecay     = isLargeGraph ? 0.7  : 0.6;
        sim.velocityDecay(velDecay).alphaDecay(alphaDecay);
        simRef.current = sim;

        var link = linkLayer.selectAll('path').data(links).join('path')
            .attr('fill','none')
            .attr('stroke',theme==='light'?'#aaa':'#555')
            .attr('stroke-width',function(d){ return Math.max(1,Math.min(2,Math.sqrt(d.count)*0.3)); })
            .attr('stroke-opacity',0.65)
            .attr('marker-end','url(#arr)');
        linksRef.current = link;

        var node = nodeLayer.selectAll('g').data(nodes).join('g').style('cursor','pointer');
        nodesRef.current = node;

        node.call(d3.drag()
            .on('start',function(e,d){ if(!e.active)sim.alphaTarget(0.1).restart(); d.fx=d.x; d.fy=d.y; })
            .on('drag',function(e,d){ d.fx=e.x; d.fy=e.y; })
            .on('end',function(e,d){ if(!e.active)sim.alphaTarget(0); d.fx=null; d.fy=null; }));

        node.on('click',function(e,d){ e.stopPropagation(); if(onSelect)onSelect(d.id); });
        node.on('mouseenter',function(e,d){
            var r=svgEl.getBoundingClientRect();
            setTooltip({x:e.clientX-r.left+10,y:e.clientY-r.top,title:d.name,content:d.fnCount+' functions\n'+d.layer+' layer\n'+d.churn+' recent commits'});
        }).on('mouseleave',function(){ setTooltip(null); });

        svg.on('click',function(e){
            if(e.target===svgEl){
                setSelected(null);
                setBlastRadius(null);
                link.attr('stroke',theme==='light'?'#aaa':'#555').attr('stroke-opacity',0.65);
                node.selectAll('.nc').attr('opacity',1).attr('fill',getC);
            }
        });

        node.append('circle').attr('class','nc').attr('r',getR).attr('fill',getC)
            .attr('stroke',function(d){ var c=d3.color(getC(d)); return c?c.brighter(0.3):'#fff'; })
            .attr('stroke-width',1.5);

        // Entry-point ring: dashed outer circle for files with no incoming connections
        node.filter(function(d){ return entryPointSet.has(d.id); })
            .append('circle').attr('class','nc-entry')
            .attr('r',function(d){ return getR(d)+5; })
            .attr('fill','none')
            .attr('stroke',function(d){ return getC(d); })
            .attr('stroke-width',1.5)
            .attr('stroke-dasharray','3,2')
            .attr('opacity',0.55)
            .attr('pointer-events','none');

        if(!isLargeGraph||graphConfig.showLabels){
            node.append('text').attr('text-anchor','middle')
                .attr('dy',function(d){ return getR(d)+10; })
                .attr('fill','var(--t1)')
                .attr('stroke','var(--bg1)').attr('stroke-width',3).attr('paint-order','stroke fill')
                .attr('font-size','8.5px')
                .attr('font-family','JetBrains Mono').attr('font-weight','500').attr('pointer-events','none')
                .text(function(d){
                    var n=d.name;
                    var dot=n.lastIndexOf('.');
                    // strip extension only if dot is not at start and ext is short (≤5 chars)
                    var base=(dot>0&&n.length-dot<=5)?n.slice(0,dot):n;
                    return base.length<=11?base:base.slice(0,10)+'…';
                });
        }

        var nodesByFolder={};
        folders.forEach(function(f){ nodesByFolder[f]=nodes.filter(function(n){ return n.folder===f; }); });

        function updateHulls(){
            hullLayer.selectAll('*').remove();
            folders.forEach(function(f){
                var fn=nodesByFolder[f];
                if(!fn||fn.length<1)return;
                var pad=30, pts=[];
                fn.forEach(function(n){ if(n.x&&n.y)pts.push([n.x-pad,n.y-pad],[n.x+pad,n.y-pad],[n.x-pad,n.y+pad],[n.x+pad,n.y+pad]); });
                if(pts.length<3)return;
                var hull=d3.polygonHull(pts);
                if(hull){
                    var color=colorMap[f]||COLORS[folders.indexOf(f)%COLORS.length];
                    hullLayer.append('path').attr('d','M'+hull.join('L')+'Z').attr('fill',color).attr('fill-opacity',0.04).attr('stroke',color).attr('stroke-width',2).attr('stroke-opacity',0.25).attr('rx',8);
                    var cx=d3.mean(fn,function(n){ return n.x; }), cy=d3.min(fn,function(n){ return n.y; })-pad-8;
                    hullLayer.append('text').attr('x',cx).attr('y',cy).attr('text-anchor','middle').attr('fill',color).attr('font-size','10px').attr('font-family','JetBrains Mono').attr('font-weight','600').attr('opacity',0.7).text(f||'root');
                }
            });
        }

        var hullInterval=isLargeGraph?5:1;
        var tickCount=0;
        sim.on('tick',function(){
            if(graphConfig.curvedLinks){
                link.attr('d',function(d){ var dx=d.target.x-d.source.x,dy=d.target.y-d.source.y,dr=Math.sqrt(dx*dx+dy*dy); return'M'+d.source.x+','+d.source.y+'A'+dr+','+dr+' 0 0,1 '+d.target.x+','+d.target.y; });
            } else {
                link.attr('d',function(d){ return'M'+d.source.x+','+d.source.y+'L'+d.target.x+','+d.target.y; });
            }
            node.attr('transform',function(d){ return'translate('+d.x+','+d.y+')'; });
            tickCount++;
            if(tickCount%hullInterval===0)updateHulls();
        });

        node.selectAll('text').attr('opacity',graphConfig.showLabels?1:0);

    } catch(e) {
        console.error('Force graph error:',e);
        d3.select(svgEl).selectAll('*').remove();
        d3.select(svgEl).append('text').attr('x',20).attr('y',30).attr('fill','var(--t3)').text('Graph rendering error: '+e.message);
    }

    return function cleanup(){
        if(simRef.current)simRef.current.stop();
    };
}
