/* canvas.js - AppCanvas component */
var VIZ_TYPES=[
    {v:'graph',l:'Graph'},{v:'graph3d',l:'3D'},{v:'treemap',l:'Treemap'},
    {v:'matrix',l:'Matrix'},{v:'dendro',l:'Tree'},{v:'sankey',l:'Flow'},
    {v:'disjoint',l:'Cluster'},{v:'bundle',l:'Bundle'},{v:'chord',l:'Chord'},{v:'architecture',l:'Block'}
];
function AppCanvas(props){
    var loading=props.loading;
    var progress=props.progress;
    var data=props.data;
    var setRepoUrl=props.setRepoUrl;
    var analyze=props.analyze;
    var graphConfig=props.graphConfig;
    var setGraphConfig=props.setGraphConfig;
    var setSelected=props.setSelected;
    var setBlastRadius=props.setBlastRadius;
    var svgRef=props.svgRef;
    var graph3dRef=props.graph3dRef;
    var treemapRef=props.treemapRef;
    var matrixRef=props.matrixRef;
    var dendroRef=props.dendroRef;
    var sankeyRef=props.sankeyRef;
    var disjointRef=props.disjointRef;
    var bundleRef=props.bundleRef;
    var chordRef=props.chordRef;
    var showGraphConfig=props.showGraphConfig;
    var setShowGraphConfig=props.setShowGraphConfig;
    var zoomIn=props.zoomIn;
    var zoomOut=props.zoomOut;
    var resetZoom=props.resetZoom;
    var fitView=props.fitView;
    var folderFilter=props.folderFilter;
    var selected=props.selected;
    var blastRadius=props.blastRadius;
    var colorMode=props.colorMode;
    var colorMap=props.colorMap;
    var legendCollapsed=props.legendCollapsed;
    var setLegendCollapsed=props.setLegendCollapsed;
    var filterByFolder=props.filterByFolder;
    var renderArchitectureView=props.renderArchitectureView;
    var tooltip=props.tooltip;
    var communities=props.communities||{clusterCount:0,clusterFiles:{},clusterMajorityFolder:{}};
    return React.createElement('div',{className:'canvas-area'},
                loading?React.createElement('div',{className:'loading'},
                    React.createElement('div',{className:'spinner'}),
                    React.createElement('div',{className:'loading-text'},progress?progress:'Analyzing…'),
                    React.createElement('div',{className:'loading-progress'},'Large repos may take 20–30 seconds')
                ):
                !data?React.createElement('div',{className:'empty-state'},
                    React.createElement(Icon,{name:'logo',size:'xxl',className:'empty-icon'}),
                    React.createElement('div',{className:'empty-title'},'Arcflow'),
                    React.createElement('div',{className:'empty-desc'},'Visualize architecture, blast radius, ownership, patterns & security\n\nEnter a GitHub URL, open a folder, or load a ZIP archive')
                ):
                React.createElement(React.Fragment,null,
                    React.createElement('div',{className:'viz-selector'},
                        React.createElement('select',{className:'viz-select',value:graphConfig.vizType,onChange:function(e){
                            var v=e.target.value;
                            setGraphConfig(Object.assign({},graphConfig,{vizType:v}));
                            if(v==='architecture'){setSelected(null);setBlastRadius(null);}
                        }},
                            VIZ_TYPES.map(function(item){
                                return React.createElement('option',{key:item.v,value:item.v},item.l);
                            })
                        )
                    ),
                    graphConfig.vizType==='graph'&&React.createElement('svg',{ref:svgRef}),
                    graphConfig.vizType==='graph3d'&&React.createElement('div',{ref:graph3dRef,className:'graph3d-container',style:{width:'100%',height:'100%'}}),
                    graphConfig.vizType==='treemap'&&React.createElement('div',{ref:treemapRef,className:'treemap-container'}),
                    graphConfig.vizType==='matrix'&&React.createElement('div',{ref:matrixRef,className:'matrix-container',style:{width:'100%',height:'100%',overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center'}}),
                    graphConfig.vizType==='dendro'&&React.createElement('div',{ref:dendroRef,className:'dendro-container',style:{width:'100%',height:'100%',position:'relative'}}),
                    graphConfig.vizType==='sankey'&&React.createElement('div',{ref:sankeyRef,className:'sankey-container',style:{width:'100%',height:'100%',position:'relative'}}),
                    graphConfig.vizType==='disjoint'&&React.createElement('div',{ref:disjointRef,className:'disjoint-container',style:{width:'100%',height:'100%',position:'relative'}}),
                    graphConfig.vizType==='bundle'&&React.createElement('div',{ref:bundleRef,className:'bundle-container'}),
                    graphConfig.vizType==='chord'&&React.createElement('div',{ref:chordRef,className:'chord-container',style:{width:'100%',height:'100%',position:'relative'}}),
                    graphConfig.vizType==='architecture'&&renderArchitectureView(),
                    (graphConfig.vizType==='graph'||graphConfig.vizType==='graph3d')&&React.createElement('div',{className:'canvas-toolbar'},
                        React.createElement('button',{className:'tool-btn',onClick:zoomIn,'aria-label':'Zoom in'},'+'),
                        React.createElement('button',{className:'tool-btn',onClick:zoomOut,'aria-label':'Zoom out'},'−'),
                        React.createElement('button',{className:'tool-btn',onClick:resetZoom,'aria-label':'Reset zoom'},'↺'),
                        React.createElement('button',{className:'tool-btn',onClick:fitView,'aria-label':'Fit view'},'⤢'),
                        React.createElement('button',{className:'tool-btn'+(showGraphConfig?' active':''),onClick:function(){setShowGraphConfig(!showGraphConfig);},'aria-label':'Graph settings',style:showGraphConfig?{background:'var(--accbg)',borderColor:'var(--acc)'}:{}},
                            React.createElement(Icon,{name:'settings',size:'m'})
                        )
                    ),
                    (graphConfig.vizType==='graph'||graphConfig.vizType==='graph3d')&&showGraphConfig&&React.createElement('div',{className:'graph-config'},
                        graphConfig.vizType==='graph'&&React.createElement('div',{className:'graph-config-title'},'Layout'),
                        graphConfig.vizType==='graph'&&React.createElement('div',{className:'view-toggle',style:{flexWrap:'wrap'}},
                            React.createElement('button',{className:'view-btn'+(graphConfig.viewMode==='force'?' active':''),onClick:function(){setGraphConfig(Object.assign({},graphConfig,{viewMode:'force'}));}},'Force'),
                            React.createElement('button',{className:'view-btn'+(graphConfig.viewMode==='radial'?' active':''),onClick:function(){setGraphConfig(Object.assign({},graphConfig,{viewMode:'radial'}));}},'Radial'),
                            React.createElement('button',{className:'view-btn'+(graphConfig.viewMode==='hierarchical'?' active':''),onClick:function(){setGraphConfig(Object.assign({},graphConfig,{viewMode:'hierarchical'}));}},'Layers'),
                            React.createElement('button',{className:'view-btn'+(graphConfig.viewMode==='grid'?' active':''),onClick:function(){setGraphConfig(Object.assign({},graphConfig,{viewMode:'grid'}));}},'Grid'),
                            React.createElement('button',{className:'view-btn'+(graphConfig.viewMode==='metro'?' active':''),onClick:function(){setGraphConfig(Object.assign({},graphConfig,{viewMode:'metro'}));}},'Metro')
                        ),
                        React.createElement('div',{className:'graph-config-title',style:{marginTop:graphConfig.vizType==='graph'?8:0}},'Spacing'),
                        React.createElement('div',{className:'config-row'},
                            React.createElement('span',{className:'config-label'},'Spread'),
                            React.createElement('input',{type:'range',className:'config-slider',min:'50',max:'500',value:graphConfig.spacing,onChange:function(e){setGraphConfig(Object.assign({},graphConfig,{spacing:parseInt(e.target.value)}));}}),
                            React.createElement('span',{className:'config-value'},graphConfig.spacing)
                        ),
                        React.createElement('div',{className:'config-row'},
                            React.createElement('span',{className:'config-label'},'Links'),
                            React.createElement('input',{type:'range',className:'config-slider',min:'30',max:'200',value:graphConfig.linkDist,onChange:function(e){setGraphConfig(Object.assign({},graphConfig,{linkDist:parseInt(e.target.value)}));}}),
                            React.createElement('span',{className:'config-value'},graphConfig.linkDist)
                        ),
                        React.createElement('div',{className:'graph-config-title',style:{marginTop:8}},'Display'),
                        React.createElement('label',{className:'config-check'},
                            React.createElement('input',{type:'checkbox',checked:graphConfig.showLabels,onChange:function(e){setGraphConfig(Object.assign({},graphConfig,{showLabels:e.target.checked}));}}),
                            'Show labels'
                        ),
                        React.createElement('label',{className:'config-check',style:{marginTop:6}},
                            React.createElement('input',{type:'checkbox',checked:graphConfig.curvedLinks,onChange:function(e){setGraphConfig(Object.assign({},graphConfig,{curvedLinks:e.target.checked}));}}),
                            'Curved links'
                        ),
                        graphConfig.vizType==='graph3d'&&React.createElement('label',{className:'config-check',style:{marginTop:6}},
                            React.createElement('input',{type:'checkbox',checked:!!graphConfig.autoRotate,onChange:function(e){setGraphConfig(Object.assign({},graphConfig,{autoRotate:e.target.checked}));}}),
                            'Auto-rotate'
                        )
                    ),
                    graphConfig.vizType!=='architecture'&&React.createElement('div',{className:'canvas-info'},
                        React.createElement('div',{className:'info-chip'},React.createElement('strong',null,folderFilter?data.files.filter(function(f){return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/');}).length:data.files.length),' files'),
                        React.createElement('div',{className:'info-chip'},React.createElement('strong',null,data.connections.length),' links'),
                        graphConfig.vizType==='graph'&&(function(){
                            var targetSet=new Set(data.connections.map(function(c){return typeof c.target==='object'?c.target.id:c.target;}));
                            var entryCount=(folderFilter?data.files.filter(function(f){return f.folder===folderFilter||f.folder.startsWith(folderFilter+'/');}).length:data.files.length)-data.files.filter(function(f){return targetSet.has(f.path)&&(!folderFilter||f.folder===folderFilter||f.folder.startsWith(folderFilter+'/'));}).length;
                            return entryCount>0&&React.createElement('div',{className:'info-chip',title:'Files with no incoming dependencies (entry points shown with dashed ring)'},React.createElement('strong',null,entryCount),' entry pts');
                        })(),
                        data.excludePatterns&&data.excludePatterns.length>0&&React.createElement('div',{className:'info-chip'},
                            React.createElement(Icon,{name:'ban',size:'s'}),
                            ' ',
                            React.createElement('strong',null,data.excludePatterns.length),
                            ' custom excludes'
                        ),
                        selected&&blastRadius&&React.createElement('div',{className:'info-chip'},
                            React.createElement(Icon,{name:'impact',size:'s'}),
                            ' ',
                            React.createElement('strong',null,blastRadius.count),
                            ' dependents',
                            blastRadius.fnsUsed>0?' · '+blastRadius.fnsUsed+' fns used':''
                        )
                    ),
                    graphConfig.vizType!=='architecture'&&React.createElement('div',{className:'legend'+(legendCollapsed?' collapsed':'')},
                        React.createElement('div',{className:'legend-header',onClick:function(){setLegendCollapsed(!legendCollapsed);}},
                            React.createElement('div',{className:'legend-title',style:{margin:0}},colorMode==='folder'?'Folders':colorMode==='layer'?'Layers':colorMode==='git'?'Git Recency':colorMode==='clusters'?'Clusters':'Churn'),
                            React.createElement('span',{className:'legend-toggle'},'▼')
                        ),
                        React.createElement('div',{className:'legend-content'},
                            colorMode==='folder'&&data.folders.slice(0,12).map(function(f,i){return React.createElement('div',{key:f,className:'legend-item'+(folderFilter===f?' active':''),onClick:function(e){e.stopPropagation();filterByFolder(f);}},React.createElement('div',{className:'legend-color',style:{background:colorMap[f]||COLORS[i%COLORS.length]}}),f||'root');}),
                            colorMode==='folder'&&data.folders.length>12&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:4}},'+',data.folders.length-12,' more'),
                            colorMode==='layer'&&(function(){var usedLayers=new Set(data.files.map(function(f){return f.layer;}));return Object.entries(LAYER_COLORS).filter(function(e){return usedLayers.has(e[0]);}).map(function(e){return React.createElement('div',{key:e[0],className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:e[1]}}),e[0]==='modules'?'Modules':e[0]==='forms'?'UserForms':e[0]==='classes'?'Classes':e[0]);});}()),
                            colorMode==='churn'&&React.createElement(React.Fragment,null,React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#ff5f5f'}}),'High (7+ commits)'),React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#ff9f43'}}),'Medium (4-6)'),React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#22c55e'}}),'Low (0-3)')),
                            colorMode==='git'&&React.createElement(React.Fragment,null,
                                React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#ef4444'}}),'This week'),
                                React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#f97316'}}),'This month'),
                                React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#f59e0b'}}),'1-3 months'),
                                React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#22c55e'}}),'3-6 months'),
                                React.createElement('div',{className:'legend-item'},React.createElement('div',{className:'legend-color',style:{background:'#334155'}}),'Stale / no data')
                            ),
                            colorMode==='clusters'&&(function(){
                                var cids=Object.keys(communities.clusterFiles||{});
                                return React.createElement(React.Fragment,null,
                                    cids.slice(0,12).map(function(cid){
                                        var color=(typeof CLUSTER_COLORS!=='undefined')?CLUSTER_COLORS[parseInt(cid)%CLUSTER_COLORS.length]:'#6366f1';
                                        var label=communities.clusterMajorityFolder[cid]||('Cluster '+(parseInt(cid)+1));
                                        var count=(communities.clusterFiles[cid]||[]).length;
                                        return React.createElement('div',{key:cid,className:'legend-item'},
                                            React.createElement('div',{className:'legend-color',style:{background:color}}),
                                            label+(count?' ('+count+')':'')
                                        );
                                    }),
                                    cids.length>12&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:4}},'+',cids.length-12,' more')
                                );
                            })()
                        )
                    ),
                    tooltip&&React.createElement('div',{className:'tooltip',style:{left:tooltip.x,top:tooltip.y}},React.createElement('div',{className:'tooltip-title'},tooltip.title),React.createElement('div',{className:'tooltip-content'},tooltip.content))
                )
            );
}
