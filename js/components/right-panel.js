/* right-panel.js - AppRightPanel component */
function AppRightPanel(props){
    var isMobile=props.isMobile;
    var mobilePanel=props.mobilePanel;
    var setMobilePanel=props.setMobilePanel;
    var rightPanelWidth=props.rightPanelWidth;
    var setRightPanelWidth=props.setRightPanelWidth;
    var data=props.data;
    var selected=props.selected;
    var selectFile=props.selectFile;
    var setSelected=props.setSelected;
    var setBlastRadius=props.setBlastRadius;
    var rightTab=props.rightTab;
    var setRightTab=props.setRightTab;
    var drillDown=props.drillDown;
    var setDrillDown=props.setDrillDown;
    var graphConfig=props.graphConfig;
    var expandedCards=props.expandedCards;
    var toggleCard=props.toggleCard;
    var blastRadius=props.blastRadius;
    var ownerLoading=props.ownerLoading;
    var ownership=props.ownership;
    var expandedFns=props.expandedFns;
    var toggleFn=props.toggleFn;
    var nodesRef=props.nodesRef;
    var linksRef=props.linksRef;
    var getNodeColor=props.getNodeColor;
    var theme=props.theme;
    var architectureIncludeTests=props.architectureIncludeTests;
    var architectureIncludeBuildOutput=props.architectureIncludeBuildOutput;
    var setArchitectureIncludeTests=props.setArchitectureIncludeTests;
    var setArchitectureIncludeBuildOutput=props.setArchitectureIncludeBuildOutput;
    var openFilePreview=props.openFilePreview;
    var setShowUnused=props.setShowUnused;
    var osvData=props.osvData;
    var osvLoading=props.osvLoading;
    var osvProgress=props.osvProgress;
    var communities=props.communities||{clusterMap:{},clusterCount:0,misplaced:{},clusterFiles:{},clusterMajorityFolder:{}};
    var _cg=React.useState(false);var showCGModal=_cg[0],setShowCGModal=_cg[1];
    var _cgCfg=React.useState({layout:'force',spacing:150,linkDist:60,showLabels:true,curvedLinks:false,colorMode:'cc',vizType:'node'});
    var cgCfg=_cgCfg[0],setCgCfg=_cgCfg[1];
    // #28 #30 #35 — hoisted unconditionally (hooks cannot be inside conditional branches)
    var _hx=React.useState(null);var histExpanded=_hx[0],setHistExpanded=_hx[1];
    var _di=React.useState(false);var deadOpen=_di[0],setDeadOpen=_di[1];
    var _mv=React.useState(null);var martinHovered=_mv[0],setMartinHovered=_mv[1];
    // reset modal when selected file changes
    React.useEffect(function(){setShowCGModal(false);},[selected&&selected.path]);
    // Test coverage estimation — map test function names to production functions by naming convention
    var testCoverageMap=React.useMemo(function(){
        if(!data)return Object.create(null);
        var testFileRe=/[\/\\](tests?|specs?|__tests?__|__specs?__)[\/\\]|[\/\\](tests?|specs?)[\/\\]|[_\.](test|spec)\.[a-z]+$|(Test|Spec)\.[a-z]+$/i;
        function isTestFile(p){return testFileRe.test(p)||/\btest\b|\bspec\b/i.test(p.split('/').pop());}
        function stripTestAffix(n){
            n=n.replace(/^(test_|it_|should_|check_)/i,'');
            n=n.replace(/^test(?=[A-Z])/,'');
            n=n.replace(/(_test|_spec|Test|Spec)$/i,'');
            return n.toLowerCase().replace(/[_\s]/g,'');
        }
        var testTargets=new Set();
        (data.files||[]).forEach(function(f){
            if(!isTestFile(f.path))return;
            (f.functions||[]).forEach(function(fn){
                var t=stripTestAffix(fn.name);
                if(t.length>=2)testTargets.add(t);
            });
        });
        var map=Object.create(null);
        (data.files||[]).forEach(function(f){
            if(isTestFile(f.path))return;
            var fns=f.functions||[];
            if(!fns.length){map[f.path]=null;return;}
            var covered=fns.filter(function(fn){
                var k=fn.name.toLowerCase().replace(/[_\s]/g,'');
                return testTargets.has(k);
            }).length;
            map[f.path]={covered:covered,total:fns.length,pct:Math.round(covered/fns.length*100)};
        });
        return map;
    },[data]);
    return React.createElement('div',{className:'right-panel'+(isMobile&&mobilePanel==='details'?' mobile-visible':''),style:{width:isMobile?'100vw':rightPanelWidth}},
                isMobile&&React.createElement('div',{className:'mobile-panel-header'},
                    React.createElement('div',{className:'mobile-panel-meta'},
                        React.createElement('div',{className:'mobile-panel-title'},selected?selected.name:'Insights'),
                        React.createElement('div',{className:'mobile-panel-subtitle'},selected?selected.path:(data?'Browse issues, patterns, and security findings':'Select a file to inspect it'))
                    ),
                    React.createElement('button',{className:'mobile-panel-close',type:'button','aria-label':'Close details panel',onClick:function(){setMobilePanel(null);}},
                        React.createElement(Icon,{name:'close',size:'m'})
                    )
                ),
                React.createElement('div',{className:'resize-handle',onMouseDown:function(e){
                    e.preventDefault();
                    var startX=e.clientX,startW=rightPanelWidth;
                    function onMove(e){setRightPanelWidth(Math.max(280,Math.min(500,startW-(e.clientX-startX))));}
                    function onUp(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
                    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
                }}),
                data?React.createElement(React.Fragment,null,
                    React.createElement('div',{className:'panel-tabs'},
                        React.createElement('button',{className:'panel-tab'+(rightTab==='details'?' active':''),onClick:function(){setRightTab('details');setDrillDown(null);}},selected?iconLabel('file','Inspector'):(graphConfig.vizType==='architecture'?iconLabel('layers','Arch'):iconLabel('search','Issues'))),
                        React.createElement('button',{className:'panel-tab'+(rightTab==='patterns'?' active':''),onClick:function(){setRightTab('patterns');setDrillDown(null);}},iconLabel('puzzle','Patterns'),' ',React.createElement('span',{className:'badge badge-default'},data.patterns.length)),
                        React.createElement('button',{className:'panel-tab'+(rightTab==='security'?' active':''),onClick:function(){setRightTab('security');setDrillDown(null);}},iconLabel('security','Security'),data.stats.security>0&&React.createElement('span',{className:'view-mode-badge',style:{marginLeft:4}},data.stats.security)),
                        React.createElement('button',{className:'panel-tab'+(rightTab==='suggestions'?' active':''),onClick:function(){setRightTab('suggestions');setDrillDown(null);}},iconLabel('action','Actions'),data.suggestions&&data.suggestions.length>0&&React.createElement('span',{className:'view-mode-badge',style:{marginLeft:4}},data.suggestions.length)),
                        React.createElement('button',{className:'panel-tab'+(rightTab==='deps'?' active':''),onClick:function(){setRightTab('deps');setDrillDown(null);}},iconLabel('link','Deps'),osvData&&osvData.totalVulns>0&&React.createElement('span',{className:'view-mode-badge',style:{marginLeft:4,background:'var(--red)'}},osvData.totalVulns)),
                        React.createElement('button',{className:'panel-tab'+(rightTab==='todos'?' active':''),onClick:function(){setRightTab('todos');setDrillDown(null);}},iconLabel('search','TODOs'),data.todos&&data.todos.length>0&&React.createElement('span',{className:'view-mode-badge',style:{marginLeft:4}},data.todos.length))
                    ),
                    React.createElement('div',{className:'panel-content'},
                        rightTab==='details'&&(selected?React.createElement(React.Fragment,null,
                            React.createElement('button',{className:'back-link',type:'button',onClick:function(){setSelected(null);setBlastRadius(null);if(nodesRef.current){nodesRef.current.selectAll('.nc').transition().duration(200).attr('opacity',1).attr('fill',getNodeColor);}if(linksRef.current){linksRef.current.transition().duration(200).attr('stroke-opacity',0.4).attr('stroke',theme==='light'?'#ccc':'#333');}},},React.createElement(Icon,{name:'chevron-left',size:'s'}),'Back'),
                            React.createElement('div',{className:'panel-header',style:{margin:'0 -12px 12px',padding:12}},
                                React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}},
                                    React.createElement('div',null,
                                        React.createElement('div',{className:'panel-title'},React.createElement(Icon,{name:'file',size:'m'}),' ',selected.name),
                                        React.createElement('div',{className:'panel-subtitle',style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}},
                                            React.createElement('span',null,selected.folder||'root',' • ',selected.layer,' • ',selected.lines,' lines'),
                                            selected.complexity&&selected.complexity.score>0&&React.createElement('span',{className:'badge '+(selected.complexity.level==='critical'?'badge-danger':selected.complexity.level==='high'?'badge-warning':selected.complexity.level==='medium'?'badge-info':'badge-default'),title:'Cyclomatic Complexity'},'CC ',selected.complexity.score),
                                            selected.mi!=null&&React.createElement('span',{className:'badge '+(selected.miLevel==='low'?'badge-danger':selected.miLevel==='medium'?'badge-warning':'badge-success'),title:'Maintainability Index (0–100). ≥85 good, ≥65 ok, <65 hard to maintain'},'MI ',selected.mi),
                                            (function(){var cov=testCoverageMap[selected.path];if(!cov)return null;var cls=cov.pct>=70?'badge-success':cov.pct>=30?'badge-warning':'badge-danger';return React.createElement('span',{className:'badge '+cls,title:'Estimated test coverage by naming convention (test_foo→foo). '+cov.covered+' of '+cov.total+' functions matched.'},'~'+cov.pct+'% cov');})()

                                        ),
                                        React.createElement('div',{style:{fontSize:8,color:'var(--t3)',marginTop:2,lineHeight:'14px'}},
                                            'MI: ',React.createElement('span',{style:{color:'var(--green)'}},'≥85 good'),
                                            ' · ',React.createElement('span',{style:{color:'var(--orange)'}},'≥65 ok'),
                                            ' · ',React.createElement('span',{style:{color:'var(--red)'}},'<65 poor'),
                                            '   CC: ',React.createElement('span',{style:{color:'var(--green)'}},'≤5 low'),
                                            ' · ',React.createElement('span',{style:{color:'var(--acc)'}},'≤10 med'),
                                            ' · ',React.createElement('span',{style:{color:'var(--orange)'}},'≤20 high'),
                                            ' · ',React.createElement('span',{style:{color:'var(--red)'}},'21+ crit')
                                        )
                                    ),
                                    React.createElement('button',{className:'view-file-btn',onClick:function(){openFilePreview(selected.path);}},iconLabel('eye','View Source'))
                                )
                            ),
                            blastRadius&&React.createElement('div',{className:'card',style:{marginBottom:12}},
                                React.createElement('div',{className:'card-header',onClick:function(){toggleCard('blast');}},React.createElement('div',{className:'card-title'},React.createElement('span',{className:'card-toggle'+(expandedCards.has('blast')?' open':'')},'▶'),React.createElement(Icon,{name:'impact',size:'s'}),' Impact Analysis'),React.createElement('span',{className:'badge badge-'+(blastRadius.level==='low'?'success':blastRadius.level==='medium'?'warning':'danger')},blastRadius.level.toUpperCase())),
                                expandedCards.has('blast')&&React.createElement('div',{className:'card-body'},
                                    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}},
                                        React.createElement('div',{style:{background:'var(--bg0)',padding:8,borderRadius:6,textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:16,fontWeight:600,color:'var(--acc)'}},blastRadius.count),
                                            React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},'Direct Dependents')
                                        ),
                                        React.createElement('div',{style:{background:'var(--bg0)',padding:8,borderRadius:6,textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:16,fontWeight:600,color:'var(--purple)'}},blastRadius.transitiveCount||0),
                                            React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},'Transitive')
                                        ),
                                        React.createElement('div',{style:{background:'var(--bg0)',padding:8,borderRadius:6,textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:16,fontWeight:600,color:'var(--green)'}},blastRadius.fnsUsed||0),
                                            React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},'Fns Exported')
                                        ),
                                        React.createElement('div',{style:{background:'var(--bg0)',padding:8,borderRadius:6,textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:16,fontWeight:600,color:'var(--orange)'}},(blastRadius.dependencies||[]).length),
                                            React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},'Dependencies')
                                        )
                                    ),
                                    (blastRadius.count>0||blastRadius.fnsUsed>0)&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:8,padding:'6px 8px',background:'var(--bg0)',borderRadius:4}},
                                        blastRadius.count>0?blastRadius.count+' file'+(blastRadius.count>1?'s':'')+' directly depend on this file':'',
                                        blastRadius.count>0&&blastRadius.fnsUsed>0?' • ':'',
                                        blastRadius.fnsUsed>0?blastRadius.fnsUsed+' function'+(blastRadius.fnsUsed>1?'s':'')+' used '+blastRadius.totalCalls+' times':''
                                    ),
                                    blastRadius.affected.length>0&&React.createElement('div',{className:'blast-detail'},
                                        React.createElement('div',{style:{fontSize:9,fontWeight:600,marginBottom:6}},'Files that import from this:'),
                                        blastRadius.affected.slice(0,8).map(function(path){return React.createElement('div',{key:path,className:'blast-file',onClick:function(){selectFile(path);}},React.createElement(Icon,{name:'file',size:'s'}),' ',path.split('/').pop());}),
                                        blastRadius.affected.length>8&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:4}},'+',blastRadius.affected.length-8,' more')
                                    ),
                                    (blastRadius.dependencies||[]).length>0&&React.createElement('div',{className:'blast-detail',style:{marginTop:8}},
                                        React.createElement('div',{style:{fontSize:9,fontWeight:600,marginBottom:6,color:'var(--orange)'}},'Dependencies (risk if these change):'),
                                        blastRadius.dependencies.slice(0,5).map(function(path){return React.createElement('div',{key:path,className:'blast-file',onClick:function(){selectFile(path);}},React.createElement(Icon,{name:'file',size:'s'}),' ',path.split('/').pop());}),
                                        blastRadius.dependencies.length>5&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:4}},'+',blastRadius.dependencies.length-5,' more')
                                    )
                                )
                            ),
                            (function(){
                                var outgoing=[],incoming=[];
                                var connByFile={out:{},in:{}};
                                data.connections.forEach(function(c){
                                    var src=typeof c.source==='object'?c.source.id:c.source;
                                    var tgt=typeof c.target==='object'?c.target.id:c.target;
                                    if(src===selected.path){
                                        if(!connByFile.out[tgt])connByFile.out[tgt]={file:tgt,fns:[]};
                                        connByFile.out[tgt].fns.push({name:c.fn,count:c.count});
                                    }
                                    if(tgt===selected.path){
                                        if(!connByFile.in[src])connByFile.in[src]={file:src,fns:[]};
                                        connByFile.in[src].fns.push({name:c.fn,count:c.count});
                                    }
                                });
                                outgoing=Object.values(connByFile.out).sort(function(a,b){return b.fns.length-a.fns.length;});
                                incoming=Object.values(connByFile.in).sort(function(a,b){return b.fns.length-a.fns.length;});
                                var totalConns=outgoing.length+incoming.length;
                                return totalConns>0&&React.createElement('div',{className:'card',style:{marginBottom:12}},
                                    React.createElement('div',{className:'card-header',onClick:function(){toggleCard('conns');}},React.createElement('div',{className:'card-title'},React.createElement('span',{className:'card-toggle'+(expandedCards.has('conns')?' open':'')},'▶'),React.createElement(Icon,{name:'link',size:'s'}),' Connections'),React.createElement('span',{className:'badge badge-default'},totalConns)),
                                    expandedCards.has('conns')&&React.createElement('div',{className:'card-body',style:{padding:0}},
                                        outgoing.length>0&&React.createElement(React.Fragment,null,
                                            React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',padding:'8px 12px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}},'Uses (',outgoing.length,' files)'),
                                            outgoing.slice(0,15).map(function(conn){
                                                var isOpen=expandedCards.has('conn-out-'+conn.file);
                                                return React.createElement('div',{key:conn.file,className:'conn-item'},
                                                    React.createElement('div',{className:'conn-header',onClick:function(e){e.stopPropagation();toggleCard('conn-out-'+conn.file);}},
                                                        React.createElement('span',{className:'card-toggle'+(isOpen?' open':''),style:{fontSize:8,marginRight:6}},'▶'),
                                                        React.createElement('span',{className:'conn-file-icon'},React.createElement(Icon,{name:'file',size:'s'})),
                                                        React.createElement('span',{className:'conn-file-name'},conn.file.split('/').pop()),
                                                        React.createElement('span',{className:'badge badge-default',style:{marginLeft:'auto'}},conn.fns.length,' fn',conn.fns.length!==1?'s':'')
                                                    ),
                                                    isOpen&&React.createElement('div',{className:'conn-fns'},
                                                        conn.fns.map(function(fn,i){return React.createElement('div',{key:i,className:'conn-fn'},
                                                            React.createElement('span',{className:'conn-fn-name'},fn.name,'()'),
                                                            React.createElement('span',{className:'conn-fn-count'},fn.count,'×')
                                                        );}),
                                                        React.createElement('div',{className:'conn-goto',onClick:function(){selectFile(conn.file);}},'→ View ',conn.file.split('/').pop())
                                                    )
                                                );
                                            }),
                                            outgoing.length>15&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',padding:8,textAlign:'center'}},'+',outgoing.length-15,' more files')
                                        ),
                                        incoming.length>0&&React.createElement(React.Fragment,null,
                                            React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',padding:'8px 12px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',borderTop:outgoing.length>0?'1px solid var(--border)':'none'}},'Used by (',incoming.length,' files)'),
                                            incoming.slice(0,15).map(function(conn){
                                                var isOpen=expandedCards.has('conn-in-'+conn.file);
                                                return React.createElement('div',{key:conn.file,className:'conn-item'},
                                                    React.createElement('div',{className:'conn-header',onClick:function(e){e.stopPropagation();toggleCard('conn-in-'+conn.file);}},
                                                        React.createElement('span',{className:'card-toggle'+(isOpen?' open':''),style:{fontSize:8,marginRight:6}},'▶'),
                                                        React.createElement('span',{className:'conn-file-icon'},React.createElement(Icon,{name:'file',size:'s'})),
                                                        React.createElement('span',{className:'conn-file-name'},conn.file.split('/').pop()),
                                                        React.createElement('span',{className:'badge badge-default',style:{marginLeft:'auto'}},conn.fns.length,' fn',conn.fns.length!==1?'s':'')
                                                    ),
                                                    isOpen&&React.createElement('div',{className:'conn-fns'},
                                                        conn.fns.map(function(fn,i){return React.createElement('div',{key:i,className:'conn-fn'},
                                                            React.createElement('span',{className:'conn-fn-name'},fn.name,'()'),
                                                            React.createElement('span',{className:'conn-fn-count'},fn.count,'×')
                                                        );}),
                                                        React.createElement('div',{className:'conn-goto',onClick:function(){selectFile(conn.file);}},'→ View ',conn.file.split('/').pop())
                                                    )
                                                );
                                            }),
                                            incoming.length>15&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',padding:8,textAlign:'center'}},'+',incoming.length-15,' more files')
                                        )
                                    )
                                );
                            })(),
                            React.createElement('div',{className:'card',style:{marginBottom:12}},
                                React.createElement('div',{className:'card-header',onClick:function(){toggleCard('own');}},React.createElement('div',{className:'card-title'},React.createElement('span',{className:'card-toggle'+(expandedCards.has('own')?' open':'')},'▶'),React.createElement(Icon,{name:'users',size:'s'}),' Ownership')),
                                expandedCards.has('own')&&React.createElement('div',{className:'card-body'},
                                    ownerLoading?React.createElement('div',{className:'loading-owner'},'Loading ownership data...'):
                                    ownership&&ownership.length>0?React.createElement(React.Fragment,null,
                                        React.createElement('div',{className:'owner-bar'},ownership.slice(0,5).map(function(o,i){return React.createElement('div',{key:i,className:'owner-segment',style:{width:o.percent+'%',background:COLORS[i%COLORS.length]}});})),
                                        React.createElement('div',{className:'owner-list'},ownership.slice(0,5).map(function(o,i){return React.createElement('div',{key:i,className:'owner-item'},React.createElement('div',{className:'owner-avatar',style:{background:COLORS[i%COLORS.length]}},o.name[0].toUpperCase()),React.createElement('span',{className:'owner-name'},o.name),React.createElement('span',{className:'owner-percent'},o.percent,'%'));}))
                                    ):React.createElement('div',{style:{fontSize:10,color:'var(--t3)',padding:8}},'No ownership data available')
                                )
                            ),
                            selected.callGraph&&React.createElement('div',{className:'card',style:{marginBottom:12}},
                                React.createElement('div',{className:'card-header',style:{cursor:'default'}},
                                    React.createElement('div',{className:'card-title'},React.createElement(Icon,{name:'bolt',size:'s'}),' Call Graph'),
                                    React.createElement('span',{className:'badge badge-default'},selected.callGraph.length,' edges')
                                ),
                                React.createElement('div',{className:'card-body',style:{padding:10}},
                                    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:10}},
                                        React.createElement('div',{style:{background:'var(--bg1)',borderRadius:5,padding:'6px 4px',textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:13,fontWeight:600,color:'var(--acc)'}},(selected.functions||[]).length),
                                            React.createElement('div',{style:{fontSize:8,color:'var(--t3)'}},'Functions')
                                        ),
                                        React.createElement('div',{style:{background:'var(--bg1)',borderRadius:5,padding:'6px 4px',textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:13,fontWeight:600,color:'var(--cyan)'}},selected.callGraph.length),
                                            React.createElement('div',{style:{fontSize:8,color:'var(--t3)'}},'Edges')
                                        ),
                                        React.createElement('div',{style:{background:'var(--bg1)',borderRadius:5,padding:'6px 4px',textAlign:'center'}},
                                            React.createElement('div',{style:{fontSize:13,fontWeight:600,color:'var(--green)'}},
                                                (function(){var s=new Set(selected.callGraph.map(function(e){return e.to;}));return (selected.functions||[]).filter(function(f){return!s.has(f.name);}).length;})()
                                            ),
                                            React.createElement('div',{style:{fontSize:8,color:'var(--t3)'}},'Entry pts')
                                        )
                                    ),
                                    React.createElement('button',{
                                        className:'view-file-btn',
                                        style:{width:'100%',justifyContent:'center',padding:'7px 0',fontSize:10,gap:6},
                                        onClick:function(){setShowCGModal(true);}
                                    },React.createElement(Icon,{name:'bolt',size:'s'}),' Open Full Call Graph ↗')
                                )
                            ),
                            showCGModal&&selected&&selected.callGraph&&React.createElement(CallGraphModal,{selected:selected,data:data,cgCfg:cgCfg,setCgCfg:setCgCfg,onClose:function(){setShowCGModal(false);}}),
                            React.createElement('div',{className:'card'},
                                React.createElement('div',{className:'card-header',onClick:function(){toggleCard('fns');}},React.createElement('div',{className:'card-title'},React.createElement('span',{className:'card-toggle'+(expandedCards.has('fns')?' open':'')},'▶'),React.createElement(Icon,{name:'bolt',size:'s'}),' Functions (',selected.functions.length,')')),
                                expandedCards.has('fns')&&React.createElement('div',{className:'card-body',style:{padding:8}},
                                    selected.functions.length===0?React.createElement('div',{style:{fontSize:10,color:'var(--t3)',padding:8,textAlign:'center'}},'No functions detected'):
                                    selected.functions.map(function(fn){
                                        var statKey=fn.key||Parser.functionKey(fn);
                                        var st=data.fnStats[statKey]||data.fnStats[fn.name];
                                        var expandKey=statKey||fn.name;
                                        var isExpanded=expandedFns.has(expandKey);
                                        var intCalls=st?st.internal:0,extCalls=st?st.external:0;
                                        return React.createElement('div',{key:expandKey,className:'fn-item'},
                                            React.createElement('div',{className:'fn-header',onClick:function(){toggleFn(expandKey);}},
                                                React.createElement('span',{className:'fn-name'},fn.name,'()'),
                                                React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                                                    React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(selected.path,fn.line);},title:'View source'},React.createElement(Icon,{name:'eye',size:'s'})),
                                                    React.createElement('span',{className:'fn-line'},'L',fn.line),
                                                    fn.cc!=null&&React.createElement('span',{className:'badge '+(fn.ccLevel==='critical'?'badge-danger':fn.ccLevel==='high'?'badge-warning':fn.ccLevel==='medium'?'badge-info':'badge-default'),title:'Cyclomatic complexity'},'CC:',fn.cc),
                                                    fn.cogCC!=null&&fn.cogCC>fn.cc&&React.createElement('span',{className:'badge '+(fn.cogCC>20?'badge-danger':fn.cogCC>10?'badge-warning':fn.cogCC>4?'badge-info':'badge-default'),title:'Cognitive complexity (SonarQube method) — penalises nesting. Higher than CC = deeply nested code.'},'Cog:',fn.cogCC),
                                                    React.createElement('span',{className:'badge badge-default',title:'Internal calls (same file)'},intCalls,' int'),
                                                    React.createElement('span',{className:'badge '+(extCalls>10?'badge-danger':extCalls>0?'badge-warning':'badge-default'),title:'External calls (other files)'},extCalls,' ext'),
                                                    extCalls>0&&intCalls===0&&React.createElement('span',{className:'badge badge-success',title:'Entry point — called only from external files',style:{fontSize:7,letterSpacing:'0.02em'}},'↗ Entry')
                                                )
                                            ),
                                            isExpanded&&React.createElement(React.Fragment,null,
                                                fn.code&&React.createElement('div',{className:'fn-code'},fn.code),
                                                st&&st.callers&&st.callers.length>0&&React.createElement('div',{className:'fn-callers'},
                                                    React.createElement('div',{className:'fn-callers-title'},'External callers:'),
                                                    st.callers.slice(0,8).map(function(c,i){return React.createElement('div',{key:i,className:'fn-caller',onClick:function(){selectFile(c.file);}},
                                                        React.createElement(Icon,{name:'file',size:'s'}),
                                                        React.createElement('span',null,c.name),
                                                        React.createElement('span',{style:{marginLeft:'auto',color:'var(--t3)'}},c.count,'×')
                                                    );}),
                                                    st.callers.length>8&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',padding:'4px 6px'}},'+',st.callers.length-8,' more'),
                                                    (function(){
                                                        // Cross-file call trace: 2 levels of upstream callers
                                                        var level2=[];
                                                        var seenL2=new Set();
                                                        st.callers.slice(0,5).forEach(function(caller){
                                                            data.connections.forEach(function(c){
                                                                var src=typeof c.source==='object'?c.source.id:c.source;
                                                                var tgt=typeof c.target==='object'?c.target.id:c.target;
                                                                if(src===caller.file&&!seenL2.has(tgt)){
                                                                    seenL2.add(tgt);
                                                                    level2.push({file:tgt,calledFrom:caller.file});
                                                                }
                                                            });
                                                        });
                                                        if(!level2.length)return null;
                                                        return React.createElement('div',{style:{marginTop:6,paddingTop:6,borderTop:'1px solid var(--border)'}},
                                                            React.createElement('div',{style:{fontSize:8,color:'var(--t3)',marginBottom:4,fontWeight:600}},'Upstream call chain (2 levels):'),
                                                            level2.slice(0,5).map(function(l2,i){
                                                                return React.createElement('div',{key:i,style:{fontSize:8,color:'var(--t3)',padding:'2px 0 2px 8px',borderLeft:'2px solid var(--border)',marginBottom:2,cursor:'pointer'},onClick:function(){selectFile(l2.file);}},
                                                                    React.createElement(Icon,{name:'file',size:'s'}),
                                                                    ' ',l2.file.split('/').pop(),
                                                                    React.createElement('span',{style:{color:'var(--t3)',marginLeft:4}},'→ ',l2.calledFrom.split('/').pop())
                                                                );
                                                            }),
                                                            level2.length>5&&React.createElement('div',{style:{fontSize:8,color:'var(--t3)',paddingLeft:8}},'+',level2.length-5,' more')
                                                        );
                                                    })()
                                                ),
                                                intCalls===0&&extCalls===0&&React.createElement('div',{style:{fontSize:9,color:'var(--orange)',padding:8,textAlign:'center',background:'rgba(255,159,67,0.1)',borderRadius:4}},
                                                    React.createElement(Icon,{name:'warning',size:'s'}),
                                                    ' This function is never called'
                                                )
                                            )
                                        );
                                    })
                                )
                            )
                        ):graphConfig.vizType==='architecture'?React.createElement(ArchitectureSummaryPanel,{data:data,architectureIncludeTests:architectureIncludeTests,architectureIncludeBuildOutput:architectureIncludeBuildOutput,setArchitectureIncludeTests:setArchitectureIncludeTests,setArchitectureIncludeBuildOutput:setArchitectureIncludeBuildOutput}):React.createElement(React.Fragment,null,
                            // #28 Complexity Histogram
                            (function(){
                                var allFns=[];(data.files||[]).forEach(function(f){(f.functions||[]).forEach(function(fn){allFns.push({name:fn.name,file:f.path,cc:fn.cc||1,line:fn.line});});});
                                if(!allFns.length)return null;
                                var bands=[{label:'1–5',min:1,max:5,color:'var(--green)'},{label:'6–10',min:6,max:10,color:'var(--acc)'},{label:'11–20',min:11,max:20,color:'var(--orange)'},{label:'21+',min:21,max:Infinity,color:'var(--red)'}];
                                var counts=bands.map(function(b){return{label:b.label,color:b.color,fns:allFns.filter(function(f){return f.cc>=b.min&&f.cc<=b.max;})};});
                                var maxCount=Math.max.apply(null,counts.map(function(b){return b.fns.length;})||[1]);
                                return React.createElement('div',{style:{marginBottom:14}},
                                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}},
                                        React.createElement(Icon,{name:'chart',size:'s'}),' Complexity Distribution — ',allFns.length,' functions'),
                                    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:8}},
                                        counts.map(function(b,i){
                                            return React.createElement('div',{key:i,style:{background:'var(--bg0)',borderRadius:6,padding:'6px 8px',cursor:'pointer',border:'1px solid '+(histExpanded===i?b.color:'var(--border)'),transition:'border-color 0.15s'},onClick:function(){setHistExpanded(histExpanded===i?null:i);}},
                                                React.createElement('div',{style:{fontSize:16,fontWeight:700,color:b.color}},b.fns.length),
                                                React.createElement('div',{style:{fontSize:8,color:'var(--t3)',marginBottom:5}},'CC '+b.label),
                                                React.createElement('div',{style:{background:'var(--bg3)',borderRadius:2,height:4,overflow:'hidden'}},
                                                    React.createElement('div',{style:{background:b.color,height:'100%',borderRadius:2,width:(maxCount?Math.round(b.fns.length/maxCount*100):0)+'%'}})
                                                )
                                            );
                                        })
                                    ),
                                    histExpanded!==null&&counts[histExpanded].fns.length>0&&React.createElement('div',{style:{background:'var(--bg0)',borderRadius:6,padding:'8px 10px',maxHeight:160,overflowY:'auto'}},
                                        React.createElement('div',{style:{fontSize:9,fontWeight:600,color:counts[histExpanded].color,marginBottom:6}},'CC '+counts[histExpanded].label+' — '+counts[histExpanded].fns.length+' functions'),
                                        counts[histExpanded].fns.sort(function(a,b){return b.cc-a.cc;}).map(function(fn,i){
                                            return React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'3px 0',borderBottom:'1px solid var(--border)',fontSize:9}},
                                                React.createElement('div',{style:{overflow:'hidden',flex:1,minWidth:0}},
                                                    React.createElement('div',{style:{color:'var(--t1)',fontFamily:"'JetBrains Mono',monospace",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},fn.name),
                                                    React.createElement('div',{style:{color:'var(--t3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},fn.file.split('/').pop())
                                                ),
                                                React.createElement('span',{style:{flexShrink:0,marginLeft:8,color:counts[histExpanded].color,fontWeight:600}},'CC ',fn.cc)
                                            );
                                        })
                                    )
                                );
                            })(),
                            // #29 Hot Path Detector — files imported by most other files
                            (function(){
                                var inDeg=Object.create(null);
                                (data.connections||[]).forEach(function(c){var t=typeof c.target==='object'?c.target.id:c.target;inDeg[t]=(inDeg[t]||0)+1;});
                                var hotFiles=Object.entries(inDeg).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
                                if(!hotFiles.length||hotFiles[0][1]<2)return null;
                                var maxIn=hotFiles[0][1];
                                return React.createElement('div',{style:{marginBottom:14}},
                                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}},'🔥 Hot Paths — most imported files'),
                                    hotFiles.map(function(e,i){
                                        var color=i===0?'var(--red)':i<3?'var(--orange)':'var(--acc)';
                                        return React.createElement('div',{key:i,style:{marginBottom:6,cursor:'pointer'},onClick:function(){selectFile(e[0]);}},
                                            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:9,marginBottom:2}},
                                                React.createElement('span',{style:{color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'75%'}},e[0].split('/').pop()),
                                                React.createElement('span',{style:{color:color,flexShrink:0,fontWeight:600}},e[1]+' import'+(e[1]>1?'s':''))
                                            ),
                                            React.createElement('div',{style:{background:'var(--bg3)',borderRadius:2,height:4,overflow:'hidden'}},
                                                React.createElement('div',{style:{background:color,height:'100%',borderRadius:2,width:Math.round(e[1]/maxIn*100)+'%'}})
                                            )
                                        );
                                    })
                                );
                            })(),
                            // #30 Dead Code Island — unreachable functions grouped by file
                            (function(){
                                var dead=data.deadFunctions||[];
                                if(!dead.length)return null;
                                var totalLines=dead.reduce(function(s,f){return s+(f.codeLines||0);},0);
                                var byFile=Object.create(null);
                                dead.forEach(function(f){if(!byFile[f.file])byFile[f.file]={file:f.file,folder:f.folder,fns:[]};byFile[f.file].fns.push(f);});
                                var fileGroups=Object.values(byFile).sort(function(a,b){return b.fns.length-a.fns.length;}).slice(0,8);
                                return React.createElement('div',{style:{marginBottom:14}},
                                    React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,cursor:'pointer'},onClick:function(){setDeadOpen(!deadOpen);}},
                                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em'}},
                                            '💀 Dead Code — ',dead.length,' unused functions'),
                                        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6}},
                                            React.createElement('span',{style:{fontSize:9,color:'var(--red)'}},totalLines+' lines removable'),
                                            React.createElement('span',{style:{fontSize:10,color:'var(--t3)'}},(deadOpen?'▾':'▸'))
                                        )
                                    ),
                                    deadOpen&&React.createElement('div',null,
                                        fileGroups.map(function(g,i){
                                            return React.createElement('div',{key:i,style:{background:'var(--bg0)',borderRadius:6,padding:'8px 10px',marginBottom:6}},
                                                React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}},
                                                    React.createElement('span',{style:{fontWeight:600,fontSize:10,color:'var(--t1)',cursor:'pointer'},onClick:function(){selectFile(g.file);}},g.file.split('/').pop()),
                                                    React.createElement('span',{style:{fontSize:9,color:'var(--red)'}},g.fns.length+' unused fn'+(g.fns.length>1?'s':''))
                                                ),
                                                g.fns.slice(0,5).map(function(fn,j){
                                                    return React.createElement('div',{key:j,style:{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--t3)',padding:'2px 0',borderTop:'1px solid var(--border)'}},
                                                        React.createElement('span',{style:{fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)'}},fn.name),
                                                        fn.codeLines&&React.createElement('span',null,fn.codeLines+' lines')
                                                    );
                                                }),
                                                g.fns.length>5&&React.createElement('div',{style:{fontSize:8,color:'var(--t3)',marginTop:3}},'+',g.fns.length-5,' more')
                                            );
                                        }),
                                        React.createElement('div',{style:{fontSize:9,color:'var(--acc)',cursor:'pointer',textAlign:'center',padding:'4px 0'},onClick:function(){setShowUnused(true);}},'View all ',dead.length,' unused functions →')
                                    )
                                );
                            })(),
                            // #36 Git Heatmap — hot + complex danger files
                            (function(){
                                var now=Date.now();
                                var dangerFiles=(data.files||[]).filter(function(f){
                                    if(!f.lastCommit)return false;
                                    var days=(now-new Date(f.lastCommit).getTime())/(1000*86400);
                                    var fns=f.functions||[];
                                    var avgCC=fns.length?fns.reduce(function(s,fn){return s+(fn.cc||1);},0)/fns.length:0;
                                    return days<30&&avgCC>10;
                                }).sort(function(a,b){
                                    var ccA=(a.functions||[]).reduce(function(s,fn){return s+(fn.cc||1);},0);
                                    var ccB=(b.functions||[]).reduce(function(s,fn){return s+(fn.cc||1);},0);
                                    return ccB-ccA;
                                }).slice(0,6);
                                if(!dangerFiles.length)return null;
                                return React.createElement('div',{style:{marginBottom:14}},
                                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--red)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'⚠ Hot + Complex — ',dangerFiles.length,' danger file'+(dangerFiles.length!==1?'s':'')),
                                    React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:8}},'Recently changed (< 30 days) and high avg CC > 10 — highest regression risk'),
                                    dangerFiles.map(function(f,i){
                                        var days=Math.round((now-new Date(f.lastCommit).getTime())/(1000*86400));
                                        var fns=f.functions||[];
                                        var avgCC=fns.length?Math.round(fns.reduce(function(s,fn){return s+(fn.cc||1);},0)/fns.length):0;
                                        return React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',borderRadius:4,marginBottom:3,background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'},onClick:function(){selectFile(f.path);}},
                                            React.createElement('span',{style:{fontSize:9,color:'var(--t1)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},f.name),
                                            React.createElement('span',{style:{fontSize:8,color:'var(--orange)',flexShrink:0}},'CC '+avgCC),
                                            React.createElement('span',{style:{fontSize:8,color:'var(--red)',flexShrink:0}},days+'d ago')
                                        );
                                    })
                                );
                            })(),
                            // #35 Martin's Coupling Metrics — instability vs abstractness scatter
                            (function(){
                                var conns=data.connections||[];
                                var caMap=Object.create(null),ceMap=Object.create(null);
                                conns.forEach(function(c){
                                    var s=typeof c.source==='object'?c.source.id:c.source;
                                    var t=typeof c.target==='object'?c.target.id:c.target;
                                    ceMap[s]=(ceMap[s]||0)+1;
                                    caMap[t]=(caMap[t]||0)+1;
                                });
                                var files=data.files||[];
                                if(files.length<4)return null;
                                var points=files.map(function(f){
                                    var ca=caMap[f.path]||0;
                                    var ce=ceMap[f.path]||0;
                                    var I=ca+ce===0?0.5:ce/(ca+ce);
                                    var hasFns=(f.functions||[]).length>0;
                                    var isAbstractLike=/types?|interfaces?|abstract|constants?|models?|schema|proto/i.test(f.name)&&!hasFns;
                                    var A=!hasFns?1.0:isAbstractLike?0.7:0.0;
                                    var D=Math.abs(A+I-1);
                                    return{name:f.name,path:f.path,ca:ca,ce:ce,I:I,A:A,D:D};
                                });
                                var W=220,H=160,PAD=24;
                                var plotW=W-PAD*2,plotH=H-PAD*2;
                                var worst=points.slice().sort(function(a,b){return b.D-a.D;}).slice(0,5);
                                return React.createElement('div',{style:{marginBottom:14}},
                                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}},'Martin\'s Coupling Metrics'),
                                    React.createElement('div',{style:{position:'relative',marginBottom:6}},
                                        React.createElement('svg',{width:'100%',viewBox:'0 0 '+W+' '+H,style:{display:'block',overflow:'visible'}},
                                            // Axes
                                            React.createElement('line',{x1:PAD,y1:H-PAD,x2:W-PAD,y2:H-PAD,stroke:'var(--border)',strokeWidth:1}),
                                            React.createElement('line',{x1:PAD,y1:PAD,x2:PAD,y2:H-PAD,stroke:'var(--border)',strokeWidth:1}),
                                            // Axis labels
                                            React.createElement('text',{x:W/2,y:H-2,fontSize:7,fill:'var(--t3)',textAnchor:'middle'},'Instability (I) →'),
                                            React.createElement('text',{x:5,y:H/2,fontSize:7,fill:'var(--t3)',textAnchor:'middle',transform:'rotate(-90,5,'+H/2+')'},'Abstractness (A)'),
                                            // Zone labels
                                            React.createElement('text',{x:PAD+4,y:PAD+10,fontSize:6,fill:'#f97316',opacity:0.7},'Zone of Pain'),
                                            React.createElement('text',{x:W-PAD-4,y:H-PAD-6,fontSize:6,fill:'#8b5cf6',opacity:0.7,textAnchor:'end'},'Zone of Uselessness'),
                                            // Main sequence line (A+I=1)
                                            React.createElement('line',{x1:PAD,y1:PAD,x2:W-PAD,y2:H-PAD,stroke:'rgba(99,102,241,0.35)',strokeWidth:1,strokeDasharray:'4 3'}),
                                            // Points
                                            points.map(function(p,i){
                                                var x=PAD+p.I*plotW,y=H-PAD-p.A*plotH;
                                                var col=p.D>0.4?'#ef4444':p.D>0.2?'#f97316':'#22c55e';
                                                return React.createElement('circle',{key:i,cx:x,cy:y,r:3,fill:col,opacity:0.75,style:{cursor:'pointer'},
                                                    onMouseEnter:function(){setMartinHovered(p);},onMouseLeave:function(){setMartinHovered(null);}});
                                            }),
                                            martinHovered&&React.createElement(React.Fragment,null,
                                                React.createElement('rect',{x:PAD+martinHovered.I*plotW-2,y:H-PAD-martinHovered.A*plotH-2,width:4,height:4,fill:'var(--acc)',stroke:'var(--acc)',strokeWidth:1}),
                                                React.createElement('text',{x:Math.min(PAD+martinHovered.I*plotW+5,W-80),y:Math.max(H-PAD-martinHovered.A*plotH-5,16),fontSize:7,fill:'var(--t0)',style:{pointerEvents:'none'}},martinHovered.name)
                                            )
                                        )
                                    ),
                                    React.createElement('div',{style:{fontSize:8,color:'var(--t3)',marginBottom:6,display:'flex',gap:10,justifyContent:'center'}},
                                        React.createElement('span',null,React.createElement('span',{style:{color:'#22c55e'}},'●'),' Near main seq.'),
                                        React.createElement('span',null,React.createElement('span',{style:{color:'#f97316'}},'●'),' Distanced'),
                                        React.createElement('span',null,React.createElement('span',{style:{color:'#ef4444'}},'●'),' Far (D>0.4)')
                                    ),
                                    worst.length>0&&React.createElement('div',{style:{background:'var(--bg0)',borderRadius:6,padding:'6px 8px'}},
                                        React.createElement('div',{style:{fontSize:8,fontWeight:600,color:'var(--t3)',marginBottom:5}},'Most Off Main Sequence (D = |A+I−1|)'),
                                        worst.map(function(p,i){
                                            return React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'2px 0',borderBottom:i<worst.length-1?'1px solid var(--border)':'none',fontSize:8,gap:4}},
                                                React.createElement('span',{style:{color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}},p.name),
                                                React.createElement('span',{style:{color:'var(--t3)',flexShrink:0}},'I='+p.I.toFixed(2)),
                                                React.createElement('span',{style:{color:'var(--t3)',flexShrink:0}},'A='+p.A.toFixed(1)),
                                                React.createElement('span',{style:{color:p.D>0.4?'var(--red)':'var(--orange)',flexShrink:0,fontWeight:600}},'D='+p.D.toFixed(2))
                                            );
                                        })
                                    )
                                );
                            })(),
                            // #42 Community Detection clusters
                            communities.clusterCount>1&&(function(){
                                var misplacedFiles=Object.keys(communities.misplaced||{});
                                return React.createElement('div',{style:{marginBottom:16}},
                                    React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:8}},
                                        React.createElement(Icon,{name:'layers',size:'m'}),' Dependency Clusters (',communities.clusterCount,')'
                                    ),
                                    React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}},
                                        Object.keys(communities.clusterFiles||{}).map(function(cid){
                                            var files=communities.clusterFiles[cid]||[];
                                            var color=(typeof CLUSTER_COLORS!=='undefined')?CLUSTER_COLORS[parseInt(cid)%CLUSTER_COLORS.length]:'#6366f1';
                                            var majorFolder=communities.clusterMajorityFolder[cid]||'root';
                                            return React.createElement('div',{key:cid,title:'Cluster '+(parseInt(cid)+1)+': '+majorFolder+' ('+files.length+' files)',style:{display:'flex',alignItems:'center',gap:4,background:'var(--bg1)',borderRadius:4,padding:'3px 6px',fontSize:9,border:'1px solid var(--border)'}},
                                                React.createElement('div',{style:{width:8,height:8,borderRadius:'50%',background:color,flexShrink:0}}),
                                                React.createElement('span',{style:{color:'var(--t2)',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},majorFolder),
                                                React.createElement('span',{style:{color:'var(--t3)'}},files.length)
                                            );
                                        })
                                    ),
                                    misplacedFiles.length>0&&React.createElement('div',{style:{background:'var(--bg0)',borderRadius:6,padding:'6px 8px'}},
                                        React.createElement('div',{style:{fontSize:8,fontWeight:600,color:'var(--orange)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},
                                            React.createElement(Icon,{name:'warning',size:'s'}),' ',misplacedFiles.length,' Misplaced File'+(misplacedFiles.length!==1?'s':'')
                                        ),
                                        misplacedFiles.slice(0,8).map(function(fp,i){
                                            var m=communities.misplaced[fp];
                                            var fname=fp.split('/').pop();
                                            return React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'2px 0',borderBottom:i<Math.min(misplacedFiles.length,8)-1?'1px solid var(--border)':'none',fontSize:8,gap:4,cursor:'pointer'},onClick:function(){selectFile(fp);}},
                                                React.createElement('span',{style:{color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1},title:fp},fname),
                                                React.createElement('span',{style:{color:'var(--t3)',flexShrink:0}},m.myFolder),
                                                React.createElement('span',{style:{color:'var(--orange)',flexShrink:0}},'→'),
                                                React.createElement('span',{style:{color:'var(--acc)',flexShrink:0}},m.majorityFolder)
                                            );
                                        }),
                                        misplacedFiles.length>8&&React.createElement('div',{style:{fontSize:8,color:'var(--t3)',marginTop:4}},'+',misplacedFiles.length-8,' more')
                                    )
                                );
                            })(),
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},React.createElement(Icon,{name:'search',size:'m'}),' Architecture Issues (',data.issues.length,')'),
                            data.issues.length===0?React.createElement('div',{style:{textAlign:'center',padding:20}},React.createElement(Icon,{name:'spark',size:'xxl',className:'empty-icon'}),React.createElement('div',{style:{color:'var(--green)'}},'No issues detected!')):
                            data.issues.map(function(issue,i){return React.createElement('div',{key:i,className:'security-item '+(issue.type==='critical'?'high':'medium'),style:{cursor:'pointer'},onClick:function(){setDrillDown({type:'issue',data:issue});}},
                                React.createElement('div',{className:'security-header'},
                                    React.createElement(StatusDot,{color:issue.type==='critical'?'var(--red)':'var(--orange)'}),
                                    React.createElement('span',{className:'security-title'},issue.title)
                                ),
                                React.createElement('div',{className:'security-desc'},issue.desc),
                                issue.items&&issue.items.length>0&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:4}},issue.items.filter(function(it){return it.file;}).map(function(it){return it.file;}).filter(function(f,i,a){return a.indexOf(f)===i;}).length+' file(s) affected'),
                                React.createElement('div',{style:{fontSize:9,color:'var(--acc)',marginTop:6}},'Click for details (',issue.items?issue.items.length:0,' items) →')
                            );})
                        )),
                        rightTab==='patterns'&&React.createElement(React.Fragment,null,
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},React.createElement(Icon,{name:'puzzle',size:'m'}),' Design Patterns & Anti-Patterns'),
                            data.patterns.length===0?React.createElement('div',{style:{textAlign:'center',padding:20,color:'var(--t3)'}},React.createElement(Icon,{name:'puzzle',size:'xxl',className:'empty-icon'}),React.createElement('div',null,'No patterns detected'),React.createElement('div',{style:{fontSize:10,marginTop:8}},'Patterns are detected based on code structure')):
                            data.patterns.map(function(p,i){return React.createElement('div',{key:i,className:'pattern-item'+(p.isAnti?' anti':''),style:{cursor:'pointer'},onClick:function(){setDrillDown({type:'pattern',data:p});}},
                                React.createElement('div',{className:'pattern-header'},
                                    React.createElement(Icon,{name:p.icon,size:'m',className:'pattern-icon'}),
                                    React.createElement('span',{className:'pattern-name'},p.name),
                                    p.isAnti&&React.createElement('span',{className:'badge badge-danger',style:{marginLeft:8}},'Anti-pattern')
                                ),
                                React.createElement('div',{className:'pattern-desc'},p.desc),
                                React.createElement('div',{style:{fontSize:9,color:'var(--acc)',marginTop:6}},'Click for details (',p.files.length,' files) →')
                            );})
                        ),
                        rightTab==='security'&&React.createElement(React.Fragment,null,
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},React.createElement(Icon,{name:'security',size:'m'}),' Security Analysis'),
                            data.securityIssues.length===0?React.createElement('div',{style:{textAlign:'center',padding:20}},React.createElement(Icon,{name:'security',size:'xxl',className:'empty-icon'}),React.createElement('div',{style:{color:'var(--green)',fontWeight:600}},'No security issues found!'),React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginTop:8}},'Your code passed all security checks')):
                            React.createElement(React.Fragment,null,
                                React.createElement('div',{style:{display:'flex',gap:8,marginBottom:12}},
                                    React.createElement('div',{className:'badge badge-danger'},data.securityIssues.filter(function(i){return i.severity==='high';}).length,' High'),
                                    React.createElement('div',{className:'badge badge-warning'},data.securityIssues.filter(function(i){return i.severity==='medium';}).length,' Medium'),
                                    React.createElement('div',{className:'badge badge-info'},data.securityIssues.filter(function(i){return i.severity==='low';}).length,' Low')
                                ),
                                data.securityIssues.map(function(issue,i){return React.createElement('div',{key:i,className:'security-item '+issue.severity,style:{cursor:'pointer'},onClick:function(){setDrillDown({type:'security',data:issue});}},
                                    React.createElement('div',{className:'security-header'},
                                        React.createElement(StatusDot,{color:getSeverityColor(issue.severity)}),
                                        React.createElement('span',{className:'security-title'},issue.title)
                                    ),
                                    React.createElement('div',{className:'security-desc'},issue.desc),
                                    issue.file&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:4,fontFamily:"'JetBrains Mono',monospace"}},issue.file+(issue.line?(' : L'+issue.line+(issue.endLine&&issue.endLine!==issue.line?'–'+issue.endLine:'')):'')),
                                    React.createElement('div',{style:{fontSize:9,color:'var(--acc)',marginTop:6}},'Click for details →'),
                                    issue.code&&React.createElement('div',{className:'security-code'},issue.code)
                                );})
                            )
                        ),
                        rightTab==='deps'&&React.createElement(React.Fragment,null,
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},React.createElement(Icon,{name:'link',size:'m'}),' Dependency CVEs'),
                            osvLoading?React.createElement('div',{style:{textAlign:'center',padding:24}},
                                React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginBottom:8}},'Scanning against OSV.dev…'),
                                React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},osvProgress||'Querying vulnerability database…')
                            ):(!osvData||osvData.scanned===0)?React.createElement('div',{style:{textAlign:'center',padding:20}},
                                React.createElement(Icon,{name:'file',size:'xxl',className:'empty-icon'}),
                                React.createElement('div',{style:{fontWeight:600,marginBottom:6}},'No dependency files found'),
                                React.createElement('div',{style:{fontSize:10,color:'var(--t3)'}},'Add package.json or requirements.txt to enable CVE scanning')
                            ):osvData.totalVulns===0?React.createElement('div',{style:{textAlign:'center',padding:20}},
                                React.createElement(Icon,{name:'security',size:'xxl',className:'empty-icon'}),
                                React.createElement('div',{style:{color:'var(--green)',fontWeight:600}},'No known CVEs!'),
                                React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginTop:8}},osvData.scanned+' packages scanned across '+osvData.depFiles.length+' file'+(osvData.depFiles.length>1?'s':''))
                            ):React.createElement(React.Fragment,null,
                                React.createElement('div',{style:{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}},
                                    React.createElement('div',{className:'badge badge-danger'},Object.values(osvData.vulnMap).reduce(function(n,e){return n+e.vulns.filter(function(v){return v.severity==='critical'||v.severity==='high';}).length;},0),' High+'),
                                    React.createElement('div',{className:'badge badge-warning'},Object.values(osvData.vulnMap).reduce(function(n,e){return n+e.vulns.filter(function(v){return v.severity==='medium';}).length;},0),' Medium'),
                                    React.createElement('div',{className:'badge badge-info'},Object.values(osvData.vulnMap).reduce(function(n,e){return n+e.vulns.filter(function(v){return v.severity==='low'||v.severity==='unknown';}).length;},0),' Low'),
                                    React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginLeft:'auto',alignSelf:'center'}},osvData.scanned+' pkgs scanned')
                                ),
                                Object.values(osvData.vulnMap).sort(function(a,b){
                                    var sev={critical:0,high:1,medium:2,low:3,unknown:4};
                                    var aWorst=Math.min.apply(null,a.vulns.map(function(v){return sev[v.severity]||4;}));
                                    var bWorst=Math.min.apply(null,b.vulns.map(function(v){return sev[v.severity]||4;}));
                                    return aWorst-bWorst;
                                }).map(function(entry,i){
                                    var worstSev=entry.vulns.reduce(function(w,v){
                                        var order={critical:0,high:1,medium:2,low:3,unknown:4};
                                        return(order[v.severity]||4)<(order[w]||4)?v.severity:w;
                                    },'unknown');
                                    var borderColor=worstSev==='critical'||worstSev==='high'?'var(--red)':worstSev==='medium'?'var(--orange)':'var(--border)';
                                    return React.createElement('div',{key:i,style:{background:'var(--bg0)',borderRadius:6,padding:'8px 10px',marginBottom:8,borderLeft:'3px solid '+borderColor}},
                                        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
                                            React.createElement('span',{style:{fontWeight:600,fontSize:11,fontFamily:"'JetBrains Mono',monospace"}},entry.pkg.name),
                                            React.createElement('span',{style:{fontSize:9,color:'var(--t3)'}},entry.pkg.version),
                                            React.createElement('span',{className:'badge badge-'+(worstSev==='critical'||worstSev==='high'?'danger':worstSev==='medium'?'warning':'info'),style:{marginLeft:'auto',fontSize:8}},entry.vulns.length+' CVE'+(entry.vulns.length>1?'s':''))
                                        ),
                                        React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}},entry.filePath),
                                        entry.vulns.slice(0,5).map(function(v,j){
                                            return React.createElement('div',{key:j,style:{display:'flex',alignItems:'flex-start',gap:6,padding:'4px 0',borderTop:'1px solid var(--border)'},onClick:function(){window.open(v.url,'_blank','noopener');},style:{display:'flex',alignItems:'flex-start',gap:6,padding:'4px 0',borderTop:'1px solid var(--border)',cursor:'pointer'}},
                                                React.createElement(StatusDot,{color:getSeverityColor(v.severity)}),
                                                React.createElement('div',{style:{flex:1,minWidth:0}},
                                                    React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--acc)',fontFamily:"'JetBrains Mono',monospace"}},v.id),
                                                    React.createElement('div',{style:{fontSize:9,color:'var(--t2)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},v.summary)
                                                ),
                                                React.createElement(Icon,{name:'external-link',size:'s',style:{color:'var(--t3)',flexShrink:0}})
                                            );
                                        }),
                                        entry.vulns.length>5&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)',paddingTop:4}},'+',entry.vulns.length-5,' more CVEs — click ID to view on OSV.dev')
                                    );
                                })
                            )
                        ),
                        rightTab==='suggestions'&&React.createElement(React.Fragment,null,
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},React.createElement(Icon,{name:'action',size:'m'}),' Actionable Suggestions'),
                            (!data.suggestions||data.suggestions.length===0)?React.createElement('div',{style:{textAlign:'center',padding:20}},React.createElement(Icon,{name:'spark',size:'xxl',className:'empty-icon'}),React.createElement('div',{style:{color:'var(--green)',fontWeight:600}},'No issues to address!'),React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginTop:8}},'Your codebase looks healthy')):
                            React.createElement(React.Fragment,null,
                                React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:12}},'Prioritized recommendations based on your codebase analysis'),
                                data.suggestions.map(function(s,i){
                                    var suggestionTone=s.priority==='critical'
                                        ? getAccentBlockStyle('rgba(255,95,95,0.36)','rgba(255,95,95,0.08)',{padding:12,marginBottom:10})
                                        : s.priority==='high'
                                            ? getAccentBlockStyle('rgba(255,159,67,0.34)','rgba(255,159,67,0.08)',{padding:12,marginBottom:10})
                                            : getAccentBlockStyle('rgba(99,102,241,0.28)','rgba(99,102,241,0.08)',{padding:12,marginBottom:10});
                                    return React.createElement('div',{key:i,className:'suggestion-card',style:suggestionTone},
                                    React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:6}},
                                        React.createElement(Icon,{name:s.icon,size:'l'}),
                                        React.createElement('span',{style:{fontWeight:600,fontSize:11}},s.title),
                                        React.createElement('span',{className:'badge badge-'+(s.priority==='critical'?'danger':s.priority==='high'?'warning':'info'),style:{marginLeft:'auto',fontSize:8}},s.priority.toUpperCase())
                                    ),
                                    React.createElement('div',{style:{fontSize:10,color:'var(--t2)',marginBottom:8}},s.desc),
                                    React.createElement('div',{style:{fontSize:9,background:'var(--bg2)',padding:'6px 8px',borderRadius:4,marginBottom:6}},
                                        React.createElement('span',{style:{color:'var(--t3)'}},'Action: '),
                                        React.createElement('span',{style:{color:'var(--t1)'}},s.action)
                                    ),
                                    React.createElement('div',{style:{fontSize:9,color:'var(--green)'}},React.createElement(Icon,{name:'spark',size:'s'}),' ',s.impact)
                                );}),
                                data.duplicates&&data.duplicates.length>0&&React.createElement('div',{style:{marginTop:16}},
                                    React.createElement('div',{style:{fontSize:11,fontWeight:600,marginBottom:8}},React.createElement(Icon,{name:'copy',size:'m'}),' Duplicate Functions (',data.duplicates.length,')'),
                                    data.duplicates.slice(0,10).map(function(d,i){return React.createElement('div',{key:i,style:{background:'var(--bg0)',borderRadius:6,padding:8,marginBottom:6,fontSize:10,cursor:'pointer'},onClick:function(){setDrillDown({type:'duplicate',data:d});}},
                                        React.createElement('div',{style:{fontWeight:600,color:d.type==='code'?'var(--purple)':'var(--orange)'}},d.type==='code'?'Similar Code':'Same Name',': ',d.name),
                                        React.createElement('div',{style:{fontSize:9,color:'var(--acc)',marginTop:4}},'Click for details (',d.files.length,' locations) →')
                                    );})
                                ),
                                (function(){
                                    var covEntries=Object.entries(testCoverageMap).filter(function(e){return e[1]!==null;});
                                    if(!covEntries.length)return null;
                                    var total=covEntries.reduce(function(s,e){return s+e[1].total;},0);
                                    var covered=covEntries.reduce(function(s,e){return s+e[1].covered;},0);
                                    var overallPct=total>0?Math.round(covered/total*100):0;
                                    var uncovered=covEntries.filter(function(e){return e[1].pct===0&&e[1].total>0;}).sort(function(a,b){return b[1].total-a[1].total;}).slice(0,5);
                                    var pctColor=overallPct>=70?'var(--green)':overallPct>=30?'var(--orange)':'var(--red)';
                                    return React.createElement('div',{style:{marginTop:16}},
                                        React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
                                            React.createElement('div',{style:{fontSize:11,fontWeight:600}},React.createElement(Icon,{name:'activity',size:'m'}),' Estimated Test Coverage'),
                                            React.createElement('span',{style:{fontSize:13,fontWeight:700,color:pctColor}},'~'+overallPct+'%')
                                        ),
                                        React.createElement('div',{style:{background:'var(--bg3)',borderRadius:3,height:6,overflow:'hidden',marginBottom:8}},
                                            React.createElement('div',{style:{background:pctColor,height:'100%',borderRadius:3,width:overallPct+'%',transition:'width 0.4s'}})
                                        ),
                                        React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:8}},covered,' of ',total,' functions matched to test names · ',covEntries.length,' files analysed'),
                                        uncovered.length>0&&React.createElement(React.Fragment,null,
                                            React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.05em'}},'Least Covered (no test matches)'),
                                            uncovered.map(function(e,i){
                                                return React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 8px',background:'var(--bg0)',borderRadius:4,marginBottom:4,cursor:'pointer',fontSize:9},onClick:function(){selectFile(e[0]);}},
                                                    React.createElement('span',{style:{color:'var(--t2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'75%'}},e[0].split('/').pop()),
                                                    React.createElement('span',{style:{color:'var(--red)',flexShrink:0}},e[1].total+' fn'+(e[1].total>1?'s':'')+' uncovered')
                                                );
                                            })
                                        )
                                    );
                                })()
                            )
                        )
                        ,rightTab==='todos'&&React.createElement(React.Fragment,null,
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:4}},React.createElement(Icon,{name:'search',size:'m'}),' TODO / FIXME Tracker'),
                            React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:12}},'Annotated comments across the codebase that need attention'),
                            (!data.todos||data.todos.length===0)?React.createElement('div',{style:{textAlign:'center',padding:20}},React.createElement(Icon,{name:'spark',size:'xxl',className:'empty-icon'}),React.createElement('div',{style:{color:'var(--green)',fontWeight:600}},'No TODO/FIXME comments found!')):
                            (function(){
                                var tagColor={TODO:'var(--acc)',FIXME:'var(--red)',BUG:'var(--red)',HACK:'var(--orange)',XXX:'var(--orange)',OPTIMIZE:'#a78bfa',NOTE:'var(--t3)'};
                                var tagBg={TODO:'rgba(99,102,241,0.12)',FIXME:'rgba(239,68,68,0.12)',BUG:'rgba(239,68,68,0.12)',HACK:'rgba(249,115,22,0.12)',XXX:'rgba(249,115,22,0.12)',OPTIMIZE:'rgba(167,139,250,0.12)',NOTE:'var(--bg3)'};
                                var byType={};
                                data.todos.forEach(function(t){if(!byType[t.type])byType[t.type]=0;byType[t.type]++;});
                                return React.createElement(React.Fragment,null,
                                    React.createElement('div',{style:{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}},
                                        Object.entries(byType).sort(function(a,b){return b[1]-a[1];}).map(function(e,i){
                                            return React.createElement('span',{key:i,style:{fontSize:8,fontWeight:700,padding:'2px 7px',borderRadius:10,background:tagBg[e[0]]||'var(--bg3)',color:tagColor[e[0]]||'var(--t3)',border:'1px solid '+(tagColor[e[0]]||'var(--border)')}},e[0],' ',e[1]);
                                        })
                                    ),
                                    data.todos.map(function(t,i){
                                        var tc=tagColor[t.type]||'var(--t3)';
                                        return React.createElement('div',{key:i,style:{padding:'7px 10px',borderRadius:6,background:'var(--bg0)',marginBottom:5,border:'1px solid var(--border)',cursor:'pointer'},onClick:function(){selectFile(t.path);}},
                                            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:3}},
                                                React.createElement('span',{style:{fontSize:8,fontWeight:700,padding:'1px 6px',borderRadius:3,background:tagBg[t.type]||'var(--bg3)',color:tc,flexShrink:0}},t.type),
                                                React.createElement('span',{style:{fontSize:9,color:'var(--t1)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},t.text)
                                            ),
                                            React.createElement('div',{style:{fontSize:8,color:'var(--t3)',display:'flex',gap:8}},
                                                React.createElement('span',null,t.file),
                                                React.createElement('span',null,'L'+t.line)
                                            )
                                        );
                                    })
                                );
                            })()
                        )
                    )
                ):React.createElement('div',{className:'empty-state'},
                    React.createElement(Icon,{name:'chart',size:'xxl',className:'empty-icon'}),
                    React.createElement('div',{className:'empty-title'},'Analysis'),
                    React.createElement('div',{className:'empty-desc'},'Analyze a GitHub repo, local folder, or ZIP archive to see insights')
                )
            );
}
