/* components/architecture-controls.js - Architecture pan/zoom handlers and view renderer */

function getArchitectureViewStats(diagram,includeTests,includeBuildOutput){
    if(!diagram)return{blocks:0,dependencies:0,routes:0,apiRoutes:0,databaseTouchpoints:0,warnings:0};
    var blocks=getVisibleArchitectureBlocks(diagram.blocks||[],!!includeTests,!!includeBuildOutput);
    var visibleIds=new Set(blocks.map(function(block){return block.id;}));
    var dependencies=(diagram.dependencies||[]).filter(function(dep){return visibleIds.has(dep.from)&&visibleIds.has(dep.to);});
    var stats=computeArchitectureStats(blocks,dependencies);
    stats.warnings=diagram.stats&&diagram.stats.warnings!=null?diagram.stats.warnings:(diagram.warnings?diagram.warnings.length:0);
    return stats;
}

function createArchitectureControls(refs){
    var architectureRenderRef=refs.architectureRenderRef;
    var architectureDragRef=refs.architectureDragRef;
    var architectureViewportRef=refs.architectureViewportRef;
    var architectureDraggingRef=refs.architectureDraggingRef;
    var setArchitectureViewport=refs.setArchitectureViewport;
    var setArchitectureDragging=refs.setArchitectureDragging;

    // normalizeArchitectureSvg â€” extracted to js/components/export.js
    function fitArchitectureViewport(){
        var container=architectureRenderRef.current;
        var svg=container?container.querySelector('.architecture-pan svg'):null;
        if(!container||!svg)return;
        var rect=container.getBoundingClientRect();
        var dims=normalizeArchitectureSvg(svg);
        var availableWidth=Math.max(240,rect.width-64);
        var availableHeight=Math.max(180,rect.height-64);
        var scale=Math.min(1,availableWidth/dims.width,availableHeight/dims.height);
        scale=clampArchitectureScale(scale);
        var x=Math.max(24,Math.round((rect.width-dims.width*scale)/2));
        var y=Math.max(24,Math.round((rect.height-dims.height*scale)/2));
        setArchitectureViewport({scale:scale,x:x,y:y});
    }
    // clampArchitectureScale â€” extracted to js/components/export.js
    function zoomArchitecture(multiplier,clientX,clientY){
        var container=architectureRenderRef.current;
        setArchitectureViewport(function(prev){
            var nextScale=clampArchitectureScale(prev.scale*multiplier);
            var rect=container?container.getBoundingClientRect():null;
            var px=rect?(clientX==null?rect.left+rect.width/2:clientX)-rect.left:0;
            var py=rect?(clientY==null?rect.top+rect.height/2:clientY)-rect.top:0;
            var ratio=nextScale/prev.scale;
            return{
                scale:nextScale,
                x:px-(px-prev.x)*ratio,
                y:py-(py-prev.y)*ratio
            };
        });
    }
    function resetArchitectureViewport(){
        fitArchitectureViewport();
    }
    function handleArchitecturePointerDown(e){
        if(e.button!==undefined&&e.button!==0)return;
        e.preventDefault();
        architectureDragRef.current={
            pointerId:e.pointerId,
            startX:e.clientX,
            startY:e.clientY,
            originX:architectureViewportRef.current.x,
            originY:architectureViewportRef.current.y
        };
        if(e.currentTarget&&e.currentTarget.setPointerCapture){
            try{e.currentTarget.setPointerCapture(e.pointerId);}catch(err){}
        }
        setArchitectureDragging(true);
    }
    function handleArchitecturePointerMove(e){
        var drag=architectureDragRef.current;
        if(!drag)return;
        e.preventDefault();
        setArchitectureViewport(function(prev){
            return Object.assign({},prev,{
                x:drag.originX+e.clientX-drag.startX,
                y:drag.originY+e.clientY-drag.startY
            });
        });
    }
    function handleArchitecturePointerUp(e){
        if(e&&e.currentTarget&&e.currentTarget.releasePointerCapture&&architectureDragRef.current){
            try{e.currentTarget.releasePointerCapture(architectureDragRef.current.pointerId);}catch(err){}
        }
        architectureDragRef.current=null;
        setArchitectureDragging(false);
    }
    function handleArchitectureWheel(e){
        e.preventDefault();
        zoomArchitecture(e.deltaY<0?1.12:0.88,e.clientX,e.clientY);

    }
    function renderArchitectureView(){
        return React.createElement('div',{className:'architecture-view'},
            React.createElement('div',{className:'architecture-shell'},
                React.createElement('div',{
                    className:'mermaid-render'+(architectureDraggingRef.current?' dragging':''),
                    ref:architectureRenderRef,
                    onPointerDown:handleArchitecturePointerDown,
                    onPointerMove:handleArchitecturePointerMove,
                    onPointerUp:handleArchitecturePointerUp,
                    onPointerCancel:handleArchitecturePointerUp,
                    onWheel:handleArchitectureWheel,
                    role:'img',
                    'aria-label':'Architecture block diagram. Drag to pan, mouse wheel to zoom.'
                })
            )
        );
    }

    return{fitArchitectureViewport:fitArchitectureViewport,zoomArchitecture:zoomArchitecture,resetArchitectureViewport:resetArchitectureViewport,handleArchitecturePointerDown:handleArchitecturePointerDown,handleArchitecturePointerMove:handleArchitecturePointerMove,handleArchitecturePointerUp:handleArchitecturePointerUp,handleArchitectureWheel:handleArchitectureWheel,renderArchitectureView:renderArchitectureView};
}
