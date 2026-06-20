/* components/graph-controls.js - Standalone zoom/fit helpers for force and 3D graph */

function graphZoomIn(graphConfig,graph3dInstanceRef,zoomRef,svgRef){
    if(graphConfig.vizType==='graph3d'&&graph3dInstanceRef.current){var pos=graph3dInstanceRef.current.cameraPosition();graph3dInstanceRef.current.cameraPosition({x:pos.x*0.7,y:pos.y*0.7,z:pos.z*0.7},null,400);}
    else if(zoomRef.current&&svgRef.current){d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy,1.4);}
}

function graphZoomOut(graphConfig,graph3dInstanceRef,zoomRef,svgRef){
    if(graphConfig.vizType==='graph3d'&&graph3dInstanceRef.current){var pos=graph3dInstanceRef.current.cameraPosition();graph3dInstanceRef.current.cameraPosition({x:pos.x*1.4,y:pos.y*1.4,z:pos.z*1.4},null,400);}
    else if(zoomRef.current&&svgRef.current){d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy,0.7);}
}

function graphResetZoom(graphConfig,graph3dInstanceRef,zoomRef,svgRef){
    if(graphConfig.vizType==='graph3d'&&graph3dInstanceRef.current){graph3dInstanceRef.current.zoomToFit(600);}
    else if(zoomRef.current&&svgRef.current){d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.transform,d3.zoomIdentity);}
}

function graphComputeFitTransform(zoomRef,svgRef,simRef,paddingSlack){
    paddingSlack=paddingSlack==null?100:paddingSlack;
    if(!zoomRef.current||!svgRef.current||!simRef.current)return null;
    var nodes=simRef.current.nodes();
    if(!nodes.length)return null;
    var xs=nodes.map(function(n){return n.x;}),ys=nodes.map(function(n){return n.y;});
    var minX=Math.min.apply(null,xs),maxX=Math.max.apply(null,xs),minY=Math.min.apply(null,ys),maxY=Math.max.apply(null,ys);
    var w=svgRef.current.clientWidth,h=svgRef.current.clientHeight;
    if(w<1||h<1)return null;
    var scale=0.8/Math.max((maxX-minX+paddingSlack)/w,(maxY-minY+paddingSlack)/h);
    return d3.zoomIdentity.translate(w/2-scale*(minX+maxX)/2,h/2-scale*(minY+maxY)/2).scale(Math.min(scale,2));
}

function graphFitView(graphConfig,graph3dInstanceRef,zoomRef,svgRef,simRef){
    if(graphConfig.vizType==='graph3d'&&graph3dInstanceRef.current){graph3dInstanceRef.current.zoomToFit(600);}
    else{var t=graphComputeFitTransform(zoomRef,svgRef,simRef,100);if(!t)return;d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform,t);}
}
