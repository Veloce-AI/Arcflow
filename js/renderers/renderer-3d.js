/* renderer-3d.js - 3D force-graph renderer (extracted from App.js useEffect) */

/**
 * Renders the 3D force-graph into containerEl using 3d-force-graph.
 * @param {HTMLElement} containerEl - the container div
 * @param {object} data      - full analysis data object
 * @param {object} opts      - { colorMode, colorMap, theme, folderFilter, graphConfig,
 *                               force3dRef (graph3dInstanceRef), selected, blastRadius,
 *                               selectFileRef }
 * @param {object} callbacks - { setSelected, setBlastRadius }
 * @returns {function} cleanup
 */
function render3DGraph(containerEl, data, opts, callbacks) {
    var colorMode         = opts.colorMode;
    var colorMap          = opts.colorMap;
    var theme             = opts.theme;
    var folderFilter      = opts.folderFilter;
    var graphConfig       = opts.graphConfig;
    var force3dRef        = opts.force3dRef;   // graph3dInstanceRef
    var selected          = opts.selected;
    var blastRadius       = opts.blastRadius;
    var selectFileRef     = opts.selectFileRef;

    var setSelected       = callbacks.setSelected;
    var setBlastRadius    = callbacks.setBlastRadius;

    if(typeof ForceGraph3D==='undefined'){
        console.warn('3d-force-graph library not loaded');
        return function(){};
    }

    var w = containerEl.clientWidth  || 800;
    var h = containerEl.clientHeight || 600;
    var filteredFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'); })
        : data.files;
    var fileIds = new Set(filteredFiles.map(function(f){ return f.path; }));

    // Preserve existing node positions to prevent jumps
    var existingNodesMap = new Map();
    if(force3dRef.current){
        var currentData = force3dRef.current.graphData();
        if(currentData&&currentData.nodes){
            currentData.nodes.forEach(function(n){ existingNodesMap.set(n.id,n); });
        }
    }

    var nodes = filteredFiles.map(function(f){
        var existing = existingNodesMap.get(f.path);
        if(existing){
            existing.name=f.name; existing.folder=f.folder;
            existing.fnCount=f.functions.length; existing.layer=f.layer; existing.churn=f.churn||0;
            return existing;
        }
        return {id:f.path,name:f.name,folder:f.folder,fnCount:f.functions.length,layer:f.layer,churn:f.churn||0};
    });

    var linkMap = new Map();
    data.connections.forEach(function(c){
        if(!fileIds.has(c.source)||!fileIds.has(c.target))return;
        if(c.source===c.target)return;
        var k=c.source+'|'+c.target;
        if(!linkMap.has(k))linkMap.set(k,{source:c.source,target:c.target,count:0});
        linkMap.get(k).count += c.count;
    });
    var links = Array.from(linkMap.values());

    function resolveHex(colorStr){
        if(!colorStr)return'#888888';
        if(colorStr.startsWith('var(--')){
            var isLight=(theme==='light');
            if(colorStr==='var(--acc)')return isLight?'#4f46e5':'#6366f1';
            if(colorStr==='var(--purple)')return'#a78bfa';
            if(colorStr==='var(--orange)')return'#ff9f43';
            if(colorStr==='var(--cyan)')return'#22d3ee';
            if(colorStr==='var(--red)')return'#ff5f5f';
            if(colorStr==='var(--green)')return'#22c55e';
            if(colorStr==='var(--blue)')return'#4d9fff';
            if(colorStr==='var(--pink)')return'#ec4899';
            if(colorStr==='var(--border)')return isLight?'#dadce0':'#2d2d35';
            if(colorStr==='var(--bg0)')return isLight?'#ffffff':'#0a0a0c';
        }
        return colorStr;
    }
    function hexToRgba(hex,alpha){
        var resolved=resolveHex(hex);
        resolved=resolved.replace('#','');
        if(resolved.length===3){ resolved=resolved[0]+resolved[0]+resolved[1]+resolved[1]+resolved[2]+resolved[2]; }
        var r=parseInt(resolved.substring(0,2),16);
        var g=parseInt(resolved.substring(2,4),16);
        var b=parseInt(resolved.substring(4,6),16);
        return'rgba('+r+','+g+','+b+','+alpha+')';
    }
    function getBaseColor(d){
        if(colorMode==='folder')return colorMap[d.folder]||COLORS[0];
        if(colorMode==='layer')return LAYER_COLORS[d.layer]||LAYER_COLORS['utils'];
        if(colorMode==='churn')return colorMap[d.id]||'#22c55e';
        return COLORS[0];
    }
    function getR(d){
        var base=Math.max(6,Math.min(20,4+d.fnCount*0.4));
        if(selected){
            if(d.id===selected.path)return base*2.0;
            if(blastRadius&&blastRadius.affected.indexOf(d.id)>=0)return base*1.4;
            if(blastRadius&&blastRadius.dependencies.indexOf(d.id)>=0)return base*1.4;
            return base*0.6;
        }
        return base;
    }
    function getC(d){
        var baseColor=getBaseColor(d);
        if(selected){
            if(d.id===selected.path)return hexToRgba('var(--acc)',0.95);
            if(blastRadius&&blastRadius.affected.indexOf(d.id)>=0)return hexToRgba('var(--purple)',0.95);
            if(blastRadius&&blastRadius.dependencies.indexOf(d.id)>=0)return hexToRgba('var(--orange)',0.95);
            return hexToRgba(baseColor,0.15);
        }
        return resolveHex(baseColor);
    }

    var graph;
    if(!force3dRef.current){
        graph = ForceGraph3D({controlType:'orbit'})(containerEl);
        force3dRef.current = graph;
    } else {
        graph = force3dRef.current;
    }

    graph
        .width(w).height(h)
        .backgroundColor(theme==='light'?'#ffffff':'#0a0a0c')
        .showNavInfo(false)
        .graphData({nodes:nodes,links:links})
        .nodeResolution(24)
        .nodeVal(getR)
        .nodeColor(getC)
        .nodeLabel(function(node){
            return '<div style="font-family:JetBrains Mono,monospace;font-size:10px;padding:6px;background:rgba(15,15,18,0.95);border:1px solid var(--border);border-radius:6px;color:#fff;">'+
                '<strong style="color:var(--acc);">'+node.name+'</strong><br/>'+
                node.folder+'<br/>'+
                node.fnCount+' functions • '+node.layer+' layer • '+node.churn+' commits'+
                '</div>';
        })
        .linkColor(function(link){
            var s=link.source.id||link.source;
            var t=link.target.id||link.target;
            if(selected){
                if(s===selected.path)return hexToRgba('var(--orange)',0.85);
                if(t===selected.path)return hexToRgba('var(--purple)',0.85);
                return theme==='light'?'rgba(220,220,220,0.08)':'rgba(40,40,48,0.08)';
            }
            return theme==='light'?'rgba(140,140,165,0.72)':'rgba(130,130,155,0.72)';
        })
        .linkWidth(function(link){
            var s=link.source.id||link.source;
            var t=link.target.id||link.target;
            var baseWidth=Math.max(0.8,Math.min(3,Math.sqrt(link.count)*0.4));
            if(selected){
                if(s===selected.path||t===selected.path)return baseWidth*2.0;
                return baseWidth*0.3;
            }
            return baseWidth;
        })
        .linkDirectionalArrowLength(function(link){
            if(selected){
                var s=link.source.id||link.source;
                var t=link.target.id||link.target;
                if(s===selected.path||t===selected.path)return 5.0;
                return 0;
            }
            return 3.5;
        })
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalParticles(function(link){
            if(selected){
                var s=link.source.id||link.source;
                var t=link.target.id||link.target;
                if(s===selected.path||t===selected.path)return 4;
                return 0;
            }
            return 1;
        })
        .linkDirectionalParticleWidth(function(link){ return selected?2.5:1.2; })
        .linkDirectionalParticleSpeed(function(link){ return selected?0.015:0.004; })
        .linkDirectionalParticleColor(function(link){
            var s=link.source.id||link.source;
            var t=link.target.id||link.target;
            if(selected){
                if(s===selected.path)return resolveHex('var(--orange)');
                if(t===selected.path)return resolveHex('var(--purple)');
            }
            return resolveHex('var(--acc)');
        })
        .linkCurvature(graphConfig.curvedLinks?0.25:0)
        .onNodeClick(function(node){
            var distance=120;
            var distRatio=1+distance/Math.hypot(node.x,node.y,node.z);
            var newPos=node.x||node.y||node.z
                ?{x:node.x*distRatio,y:node.y*distRatio,z:node.z*distRatio}
                :{x:0,y:0,z:distance};
            graph.cameraPosition(newPos,node,1200);
            if(selectFileRef.current)selectFileRef.current(node.id);
        })
        .onBackgroundClick(function(){
            setSelected(null);
            setBlastRadius(null);
        });

    // 3D node label sprites
    var THREE=window.THREE;
    if(THREE&&graphConfig.showLabels){
        graph.nodeThreeObject(function(node){
            var r=getR(node);
            var color=getC(node);
            var group=new THREE.Group();

            var sphereGeo=new THREE.SphereGeometry(r,24,24);
            var sphereMat=new THREE.MeshPhongMaterial({color:color,shininess:80});
            var sphereMesh=new THREE.Mesh(sphereGeo,sphereMat);
            group.add(sphereMesh);

            var labelText=node.name;
            var canvas=document.createElement('canvas');
            var ctx=canvas.getContext('2d');
            var scale=4;
            ctx.font=(10*scale)+'px "JetBrains Mono", monospace';
            var textWidth=ctx.measureText(labelText).width;
            canvas.width=textWidth+(16*scale);
            canvas.height=24*scale;
            ctx.font=(10*scale)+'px "JetBrains Mono", monospace';
            ctx.fillStyle=theme==='light'?'rgba(255,255,255,0.9)':'rgba(10,10,12,0.9)';

            var w_rect=canvas.width, h_rect=canvas.height, r_rect=4*scale;
            ctx.beginPath();
            ctx.moveTo(r_rect,0); ctx.lineTo(w_rect-r_rect,0);
            ctx.quadraticCurveTo(w_rect,0,w_rect,r_rect);
            ctx.lineTo(w_rect,h_rect-r_rect);
            ctx.quadraticCurveTo(w_rect,h_rect,w_rect-r_rect,h_rect);
            ctx.lineTo(r_rect,h_rect);
            ctx.quadraticCurveTo(0,h_rect,0,h_rect-r_rect);
            ctx.lineTo(0,r_rect);
            ctx.quadraticCurveTo(0,0,r_rect,0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle=theme==='light'?'rgba(0,0,0,0.15)':'rgba(255,255,255,0.15)';
            ctx.lineWidth=1*scale;
            ctx.stroke();
            ctx.fillStyle=theme==='light'?'#111':'#fff';
            ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(labelText,canvas.width/2,canvas.height/2);

            var texture=new THREE.CanvasTexture(canvas);
            var labelMaterial=new THREE.SpriteMaterial({map:texture,depthWrite:false,depthTest:false});
            var labelSprite=new THREE.Sprite(labelMaterial);
            var spriteWidth=(canvas.width/scale)*0.5;
            var spriteHeight=(canvas.height/scale)*0.5;
            labelSprite.scale.set(spriteWidth,spriteHeight,1);
            labelSprite.position.set(0,r+spriteHeight*0.6+2,0);
            group.add(labelSprite);

            return group;
        });
        graph.nodeThreeObjectExtend(false);
    } else {
        graph.nodeThreeObject(null);
    }

    // Auto-rotation
    setTimeout(function(){
        if(force3dRef.current){
            var ctrl=force3dRef.current.controls();
            if(ctrl){ ctrl.autoRotate=!!graphConfig.autoRotate; ctrl.autoRotateSpeed=1.0; }
        }
    },100);

    var linkForce=graph.d3Force('link');
    if(linkForce)linkForce.distance(graphConfig.linkDist||70);
    var chargeForce=graph.d3Force('charge');
    if(chargeForce)chargeForce.strength(-(graphConfig.spacing||200));

    // Clustering force
    var groups=[];
    if(colorMode==='folder'){
        groups=Array.from(new Set(filteredFiles.map(function(f){ return f.folder; })));
    } else if(colorMode==='layer'){
        groups=Array.from(new Set(filteredFiles.map(function(f){ return f.layer; })));
    }

    var centers={};
    if(groups.length>0){
        var nG=groups.length;
        groups.forEach(function(g,i){
            var phi=Math.acos(1-2*(i+0.5)/nG);
            var theta=Math.PI*(1+Math.sqrt(5))*(i+0.5);
            var radius=180;
            centers[g]={x:radius*Math.sin(phi)*Math.cos(theta),y:radius*Math.sin(phi)*Math.sin(theta),z:radius*Math.cos(phi)};
        });
    }

    function customForce(axis,targetSelector,strength){
        var _nodes;
        function force(alpha){
            var velProp='v'+axis;
            for(var i=0;i<_nodes.length;i++){
                var node=_nodes[i];
                var target=targetSelector(node);
                node[velProp]+=(target-node[axis])*strength*alpha;
            }
        }
        force.initialize=function(_){ _nodes=_; };
        return force;
    }

    if(groups.length>0){
        var targetProp=colorMode==='folder'?'folder':'layer';
        var forceStrength=0.15;
        graph.d3Force('x',customForce('x',function(d){ return centers[d[targetProp]]?centers[d[targetProp]].x:0; },forceStrength));
        graph.d3Force('y',customForce('y',function(d){ return centers[d[targetProp]]?centers[d[targetProp]].y:0; },forceStrength));
        graph.d3Force('z',customForce('z',function(d){ return centers[d[targetProp]]?centers[d[targetProp]].z:0; },forceStrength));
    } else {
        graph.d3Force('x',null);
        graph.d3Force('y',null);
        graph.d3Force('z',null);
    }

    var resizeObserver = new ResizeObserver(function(entries){
        for(var entry of entries){
            if(containerEl){
                var width=containerEl.clientWidth||800;
                var height=containerEl.clientHeight||600;
                graph.width(width).height(height);
            }
        }
    });
    resizeObserver.observe(containerEl);

    return function cleanup(){
        resizeObserver.disconnect();
        if(force3dRef.current){
            force3dRef.current.pauseAnimation();
            force3dRef.current.graphData({nodes:[],links:[]});
            force3dRef.current=null;
        }
    };
}
