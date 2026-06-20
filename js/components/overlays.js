/* overlays.js - AppOverlays component (modals, dialogs, toasts) */
function AppOverlays(props){
    var showExport=props.showExport;
    var setShowExport=props.setShowExport;
    var data=props.data;
    var graphConfig=props.graphConfig;
    var architectureIncludeTests=props.architectureIncludeTests;
    var architectureIncludeBuildOutput=props.architectureIncludeBuildOutput;
    var architectureRenderRef=props.architectureRenderRef;
    var svgRef=props.svgRef;
    var zoomRef=props.zoomRef;
    var computeGraphFitTransform=props.computeGraphFitTransform;
    var graph3dRef=props.graph3dRef;
    var sankeyRef=props.sankeyRef;
    var treemapRef=props.treemapRef;
    var matrixRef=props.matrixRef;
    var dendroRef=props.dendroRef;
    var disjointRef=props.disjointRef;
    var bundleRef=props.bundleRef;
    var copyLink=props.copyLink;
    var showNotification=props.showNotification;
    var localSourceKind=props.localSourceKind;
    var repoInfo=props.repoInfo;
    var showExcludeModal=props.showExcludeModal;
    var excludePatternDraft=props.excludePatternDraft;
    var setExcludePatternDraft=props.setExcludePatternDraft;
    var closeExcludeModal=props.closeExcludeModal;
    var saveExcludePatterns=props.saveExcludePatterns;
    var showPR=props.showPR;
    var setShowPR=props.setShowPR;
    var prUrl=props.prUrl;
    var setPrUrl=props.setPrUrl;
    var prData=props.prData;
    var analyzePR=props.analyzePR;
    var isMobile=props.isMobile;
    var mobilePanel=props.mobilePanel;
    var toggleMobilePanel=props.toggleMobilePanel;
    var drillDown=props.drillDown;
    var setDrillDown=props.setDrillDown;
    var selectFile=props.selectFile;
    var openFilePreview=props.openFilePreview;
    var selected=props.selected;
    var showPrivacy=props.showPrivacy;
    var setShowPrivacy=props.setShowPrivacy;
    var showKeyModal=props.showKeyModal;
    var privateKey=props.privateKey;
    var setPrivateKey=props.setPrivateKey;
    var setShowKeyModal=props.setShowKeyModal;
    var showUnused=props.showUnused;
    var setShowUnused=props.setShowUnused;
    var expandedFns=props.expandedFns;
    var toggleFn=props.toggleFn;
    var setExpandedFns=props.setExpandedFns;
    var confirmDialog=props.confirmDialog;
    var closeConfirmDialog=props.closeConfirmDialog;
    var toast=props.toast;
    var filePreview=props.filePreview;
    var filePreviewRef=props.filePreviewRef;
    var setFilePreview=props.setFilePreview;
    var highlightSyntax=props.highlightSyntax;
    var error=props.error;
    var setError=props.setError;
    var showVAPT=props.showVAPT;
    var setShowVAPT=props.setShowVAPT;
    var osvData=props.osvData;
    var showRoutes=props.showRoutes;
    var setShowRoutes=props.setShowRoutes;
    var showComponents=props.showComponents;
    var setShowComponents=props.setShowComponents;
    var showSnapshotDiff=props.showSnapshotDiff;
    var setShowSnapshotDiff=props.setShowSnapshotDiff;
    var snapshotDiff=props.snapshotDiff;
    return React.createElement(React.Fragment,null,
        showVAPT&&data&&React.createElement(VAPTModal,{data:data,osvData:osvData,onClose:function(){setShowVAPT(false);}}),
        showRoutes&&data&&React.createElement(RoutesModal,{data:data,onClose:function(){setShowRoutes(false);},selectFile:selectFile}),
        showComponents&&data&&React.createElement(ComponentTreeModal,{data:data,onClose:function(){setShowComponents(false);},selectFile:selectFile}),
        showSnapshotDiff&&snapshotDiff&&React.createElement('div',{className:'modal-overlay',onClick:function(){setShowSnapshotDiff(false);},style:{zIndex:1200}},
            React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{maxWidth:560,maxHeight:'80vh',display:'flex',flexDirection:'column',padding:0,overflow:'hidden'}},
                React.createElement('div',{style:{padding:'10px 14px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8,flexShrink:0}},
                    React.createElement(Icon,{name:'activity',size:'m'}),
                    React.createElement('span',{style:{fontWeight:700,fontSize:13,color:'var(--t0)'}},'Re-analysis Delta'),
                    React.createElement('span',{style:{fontSize:10,color:'var(--t3)',marginLeft:4}},'Changes since last scan'),
                    React.createElement('button',{className:'modal-close',style:{marginLeft:'auto'},onClick:function(){setShowSnapshotDiff(false);}},'×')
                ),
                React.createElement('div',{style:{flex:1,overflowY:'auto',padding:'14px 16px'}},
                    snapshotDiff.added.length>0&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--green)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'+'+snapshotDiff.added.length+' new file'+(snapshotDiff.added.length!==1?'s':'')),
                        snapshotDiff.added.slice(0,8).map(function(p,i){return React.createElement('div',{key:i,style:{fontSize:10,color:'var(--t2)',padding:'2px 0',fontFamily:"'JetBrains Mono',monospace",cursor:'pointer'},onClick:function(){selectFile(p);setShowSnapshotDiff(false);}},p);}),
                        React.createElement('div',{style:{marginBottom:12}})
                    ),
                    snapshotDiff.removed.length>0&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--red)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'-'+snapshotDiff.removed.length+' removed file'+(snapshotDiff.removed.length!==1?'s':'')),
                        snapshotDiff.removed.slice(0,8).map(function(p,i){return React.createElement('div',{key:i,style:{fontSize:10,color:'var(--t3)',padding:'2px 0',fontFamily:"'JetBrains Mono',monospace",textDecoration:'line-through'}},p);}),
                        React.createElement('div',{style:{marginBottom:12}})
                    ),
                    snapshotDiff.ccRegressions.length>0&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--orange)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'⚠ CC Regressions ('+snapshotDiff.ccRegressions.length+')'),
                        snapshotDiff.ccRegressions.map(function(r,i){return React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',fontSize:10,padding:'3px 0',borderBottom:'1px solid var(--border)'}},
                            React.createElement('span',{style:{color:'var(--t1)',fontFamily:"'JetBrains Mono',monospace",overflow:'hidden',textOverflow:'ellipsis',flex:1}},r.name),
                            React.createElement('span',{style:{color:'var(--t3)',flexShrink:0,marginLeft:8}},r.file.split('/').pop()),
                            React.createElement('span',{style:{color:'var(--orange)',flexShrink:0,marginLeft:8}},'CC '+r.oldCC+' → '+r.newCC)
                        );}),
                        React.createElement('div',{style:{marginBottom:12}})
                    ),
                    snapshotDiff.newSecIssues.length>0&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--red)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'🔐 New Security Issues ('+snapshotDiff.newSecIssues.length+')'),
                        snapshotDiff.newSecIssues.map(function(s,i){return React.createElement('div',{key:i,style:{fontSize:10,padding:'3px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:8}},
                            React.createElement('span',{style:{background:s.severity==='critical'?'#7c3aed':s.severity==='high'?'#ef4444':'#f97316',color:'#fff',padding:'1px 5px',borderRadius:3,fontSize:8,flexShrink:0}},s.severity),
                            React.createElement('span',{style:{color:'var(--t1)'}}  ,s.title),
                            React.createElement('span',{style:{color:'var(--t3)',marginLeft:'auto',flexShrink:0}},s.file)
                        );}),
                        React.createElement('div',{style:{marginBottom:12}})
                    ),
                    snapshotDiff.newCirc.length>0&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--purple)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'♻ New Circular Dependencies ('+snapshotDiff.newCirc.length+')'),
                        snapshotDiff.newCirc.map(function(g,i){return React.createElement('div',{key:i,style:{fontSize:9,color:'var(--t2)',padding:'2px 0',fontFamily:"'JetBrains Mono',monospace"}},g.join(' → '));})
                    )
                ),
                React.createElement('div',{style:{padding:'10px 16px',borderTop:'1px solid var(--border)',flexShrink:0,display:'flex',justifyContent:'flex-end'}},
                    React.createElement('button',{className:'top-btn primary',onClick:function(){setShowSnapshotDiff(false);}},  'Dismiss')
                )
            )
        ),
        showExport&&React.createElement('div',{className:'modal-overlay',onClick:function(){setShowExport(false);}},
            React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{maxWidth:480}},
                React.createElement('div',{className:'modal-header'},React.createElement('div',{className:'modal-title'},iconLabel('export','Export','m')),React.createElement('button',{className:'modal-close',onClick:function(){setShowExport(false);}},'×')),
                React.createElement('div',{className:'modal-body'},
                    data&&data.architectureDiagram&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',marginBottom:8}},graphConfig.vizType==='architecture'?'Block Diagram (current view)':'Block Diagram'),
                        React.createElement('div',{className:'export-options'},
                            React.createElement('div',{className:'export-option',onClick:function(){copyMermaid(data,architectureIncludeTests,architectureIncludeBuildOutput,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'copy',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Copy Mermaid')),
                            React.createElement('div',{className:'export-option',onClick:function(){downloadMermaid(data,architectureIncludeTests,architectureIncludeBuildOutput,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'code',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Mermaid File')),
                            React.createElement('div',{className:'export-option',onClick:function(){downloadArchitectureSVG(architectureRenderRef,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'image',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Diagram SVG'))
                        )
                    ),
                    graphConfig.vizType!=='architecture'&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',marginBottom:8,marginTop:data&&data.architectureDiagram?16:0}},'Graph Visualization'),
                        React.createElement('div',{className:'export-options'},
                            React.createElement('div',{className:'export-option',onClick:function(){var allRefs={graph3dRef:graph3dRef,sankeyRef:sankeyRef,treemapRef:treemapRef,matrixRef:matrixRef,dendroRef:dendroRef,disjointRef:disjointRef,bundleRef:bundleRef,localSourceKind:localSourceKind,repoInfo:repoInfo};exportPNG(graphConfig,svgRef,allRefs,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'image',size:'xl'})),React.createElement('div',{className:'export-option-label'},'PNG Image')),
                            React.createElement('div',{className:'export-option',onClick:function(){var allRefs={graph3dRef:graph3dRef,sankeyRef:sankeyRef,treemapRef:treemapRef,matrixRef:matrixRef,dendroRef:dendroRef,disjointRef:disjointRef,bundleRef:bundleRef,localSourceKind:localSourceKind,repoInfo:repoInfo};exportSVG(graphConfig,svgRef,allRefs,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'image',size:'xl'})),React.createElement('div',{className:'export-option-label'},'SVG Image')),
                            React.createElement('div',{className:'export-option',onClick:function(){var allRefs={graph3dRef:graph3dRef,sankeyRef:sankeyRef,treemapRef:treemapRef,matrixRef:matrixRef,dendroRef:dendroRef,disjointRef:disjointRef,bundleRef:bundleRef,localSourceKind:localSourceKind,repoInfo:repoInfo};exportPDF(graphConfig,svgRef,allRefs,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'file-pdf',size:'xl'})),React.createElement('div',{className:'export-option-label'},'PDF Document')),
                            React.createElement('div',{className:'export-option',onClick:function(){copyLink();setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'link',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Share Link'))
                        )
                    ),
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',marginBottom:8,marginTop:16}},'Analysis Report'),
                    React.createElement('div',{style:{fontSize:9,color:'var(--t2)',marginBottom:10}},'Complete analysis with files, functions, patterns, security issues, and dependencies'),
                    React.createElement('div',{className:'export-options'},
                        React.createElement('div',{className:'export-option',onClick:function(){generateReport('json',data,localSourceKind,repoInfo,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'code',size:'xl'})),React.createElement('div',{className:'export-option-label'},'JSON Report')),
                        React.createElement('div',{className:'export-option',onClick:function(){generateReport('md',data,localSourceKind,repoInfo,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'note',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Markdown')),
                        React.createElement('div',{className:'export-option',onClick:function(){generateReport('txt',data,localSourceKind,repoInfo,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'file',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Plain Text')),
                        React.createElement('div',{className:'export-option',onClick:function(){exportCSV(data,localSourceKind,repoInfo,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'table',size:'xl'})),React.createElement('div',{className:'export-option-label'},'CSV Metrics')),
                        React.createElement('div',{className:'export-option',onClick:function(){exportSARIF(data,localSourceKind,repoInfo,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'shield',size:'xl'})),React.createElement('div',{className:'export-option-label'},'SARIF (GitHub)')),
                        React.createElement('div',{className:'export-option',onClick:function(){exportSBOM(data,osvData,localSourceKind,repoInfo,showNotification);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'code',size:'xl'})),React.createElement('div',{className:'export-option-label'},'SBOM (CycloneDX)'))
                    ),
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',marginBottom:8,marginTop:16}},'Raw Data'),
                    React.createElement('div',{className:'export-options'},
                        React.createElement('div',{className:'export-option',onClick:function(){exportJSON(data);setShowExport(false);}},React.createElement('div',{className:'export-option-icon'},React.createElement(Icon,{name:'settings',size:'xl'})),React.createElement('div',{className:'export-option-label'},'Raw JSON'))
                    )
                )
            )
        ),
        showExcludeModal&&React.createElement(ExcludeModal,{
            excludePatternDraft:excludePatternDraft,
            onDraftChange:setExcludePatternDraft,
            onClose:closeExcludeModal,
            onSave:saveExcludePatterns
        }),
        showPR&&React.createElement('div',{className:'modal-overlay',onClick:function(){setShowPR(false);}},
            React.createElement('div',{className:'modal pr-modal',onClick:function(e){e.stopPropagation();}},
                React.createElement('div',{className:'modal-header'},React.createElement('div',{className:'modal-title'},iconLabel('chart','PR Impact Analyzer','m')),React.createElement('button',{className:'modal-close',onClick:function(){setShowPR(false);}},'×')),
                React.createElement('div',{className:'modal-body',style:{maxHeight:'75vh',overflowY:'auto'}},
                    React.createElement('div',{className:'form-group'},React.createElement('label',{className:'form-label'},'Pull Request URL'),React.createElement('input',{className:'form-input','aria-label':'Pull Request URL',placeholder:'https://github.com/owner/repo/pull/123',value:prUrl,onChange:function(e){setPrUrl(e.target.value);},onKeyDown:function(e){if(e.key==='Enter')analyzePR();}})),
                    React.createElement('button',{className:'top-btn primary','aria-label':'Analyze Pull Request',onClick:analyzePR,style:{marginBottom:16,width:'100%'}},iconLabel('search','Analyze PR Impact')),
                    prData&&(function(){
                        var risk = calcPRRisk(prData, data);
                        var reviewers = findSuggestedReviewers(prData, data);
                        var testImpact = findTestImpact(prData, data);
                        var chains = findDependencyChains(prData, data);
                        var riskColor = risk.level === 'critical' ? 'var(--red)' : risk.level === 'high' ? 'var(--orange)' : risk.level === 'medium' ? 'var(--blue)' : 'var(--green)';
                        return React.createElement(React.Fragment, null,
                            React.createElement('div',{className:'pr-header',style:{marginBottom:16}},
                                React.createElement('div',{className:'pr-title',style:{fontSize:14}},prData.title),
                                React.createElement('div',{className:'pr-stats',style:{marginTop:8}},
                                    React.createElement('span',{className:'pr-add'},'+',prData.additions||0),
                                    React.createElement('span',{className:'pr-del'},'-',prData.deletions||0),
                                    React.createElement('span',{style:{color:'var(--t3)',marginLeft:8}},prData.files?prData.files.length:0,' files')
                                )
                            ),
                            React.createElement('div',{className:'pr-impact-grid'},
                                React.createElement('div',{className:'pr-impact-card'},
                                    React.createElement('div',{className:'pr-risk-meter'},
                                        React.createElement('div',{className:'pr-risk-circle',style:{borderColor:riskColor,background:'rgba('+[risk.level==='critical'?'255,95,95':risk.level==='high'?'255,159,67':risk.level==='medium'?'77,159,255':'34,197,94'].join(',')+',0.1)'}},
                                            React.createElement('div',{className:'pr-risk-value',style:{color:riskColor}},risk.score),
                                            React.createElement('div',{className:'pr-risk-text',style:{color:riskColor}},risk.level)
                                        ),
                                        React.createElement('div',{style:{marginTop:12,fontSize:10,color:'var(--t2)',textAlign:'center'}},'Risk Score')
                                    ),
                                    risk.factors.length > 0 && React.createElement('div',{style:{marginTop:12}},
                                        risk.factors.map(function(f,i) { return React.createElement('div',{key:i,style:{fontSize:9,color:'var(--t2)',padding:'4px 0',borderTop:i>0?'1px solid var(--border2)':'none'}},'• ',f); })
                                    )
                                ),
                                React.createElement('div',{className:'pr-impact-card'},
                                    React.createElement('div',{className:'pr-impact-card-title'},iconLabel('impact','Impact Metrics')),
                                    React.createElement('div',{className:'pr-metric-row'},React.createElement('span',{className:'pr-metric-label'},'Total Blast Radius'),React.createElement('span',{className:'pr-metric-value'},risk.totalBlast,' files')),
                                    React.createElement('div',{className:'pr-metric-row'},React.createElement('span',{className:'pr-metric-label'},'Files Changed'),React.createElement('span',{className:'pr-metric-value'},prData.files?prData.files.length:0)),
                                    React.createElement('div',{className:'pr-metric-row'},React.createElement('span',{className:'pr-metric-label'},'Lines Modified'),React.createElement('span',{className:'pr-metric-value'},(prData.additions||0)+(prData.deletions||0))),
                                    React.createElement('div',{className:'pr-metric-row'},React.createElement('span',{className:'pr-metric-label'},'Net Change'),React.createElement('span',{className:'pr-metric-value',style:{color:(prData.additions||0)-(prData.deletions||0)>=0?'var(--green)':'var(--red)'}},(prData.additions||0)-(prData.deletions||0)>0?'+':'',(prData.additions||0)-(prData.deletions||0)))
                                ),
                                reviewers.length > 0 && React.createElement('div',{className:'pr-impact-card'},
                                    React.createElement('div',{className:'pr-impact-card-title'},iconLabel('users','Suggested Reviewers')),
                                    reviewers.map(function(r,i) { return React.createElement('div',{key:i,className:'pr-reviewer-card'},
                                        React.createElement('div',{className:'pr-reviewer-avatar',style:{background:r.avatar}},r.name[0]),
                                        React.createElement('div',{className:'pr-reviewer-info'},
                                            React.createElement('div',{className:'pr-reviewer-name'},r.name),
                                            React.createElement('div',{className:'pr-reviewer-reason'},r.reason)
                                        )
                                    ); })
                                ),
                                testImpact.length > 0 && React.createElement('div',{className:'pr-impact-card'},
                                    React.createElement('div',{className:'pr-impact-card-title'},iconLabel('beaker','Test Impact')),
                                    React.createElement('div',{className:'pr-test-impact'},
                                        testImpact.slice(0,5).map(function(t,i) { return React.createElement('div',{key:i,className:'pr-test-file'},
                                            React.createElement('span',{className:'pr-test-icon'},React.createElement(Icon,{name:t.suggested?'spark':'security',size:'s'})),
                                            React.createElement('span',{style:{flex:1}},t.file),
                                            t.suggested && React.createElement('span',{className:'badge badge-info'},'suggested')
                                        ); })
                                    )
                                )
                            ),
                            chains.length > 0 && React.createElement('div',{className:'pr-impact-card',style:{marginTop:16}},
                                React.createElement('div',{className:'pr-impact-card-title'},iconLabel('link','Dependency Chains')),
                                React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginBottom:12}},'Files that import modified files (downstream impact)'),
                                chains.map(function(chain,i) { return React.createElement('div',{key:i,className:'pr-dependency-chain',style:{marginBottom:8}},
                                    chain.map(function(node,j) { return React.createElement(React.Fragment,{key:j},
                                        React.createElement('span',{className:'pr-chain-node'+(j===0?' changed':'')},node),
                                        j < chain.length - 1 && React.createElement('span',{className:'pr-chain-arrow'},'→')
                                    ); })
                                ); })
                            ),
                            risk.hotspots.length > 0 && React.createElement('div',{className:'pr-impact-card',style:{marginTop:16}},
                                React.createElement('div',{className:'pr-impact-card-title'},iconLabel('activity','Hotspots')),
                                React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginBottom:12}},'Files with highest blast radius'),
                                risk.hotspots.map(function(h,i) {
                                    var maxBlast = Math.max.apply(null, risk.hotspots.map(function(x){return x.blast;})) || 1;
                                    return React.createElement('div',{key:i,className:'pr-hotspot'},
                                        React.createElement('span',{style:{fontSize:10,color:'var(--t1)',minWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},h.file.split('/').pop()),
                                        React.createElement('div',{className:'pr-hotspot-bar'},
                                            React.createElement('div',{className:'pr-hotspot-fill',style:{width:(h.blast/maxBlast*100)+'%',background:'linear-gradient(90deg, var(--orange), var(--red))'}})
                                        ),
                                        React.createElement('span',{style:{fontSize:9,color:'var(--t3)',minWidth:50,textAlign:'right'}},h.blast,' files')
                                    );
                                })
                            ),
                            React.createElement('div',{className:'pr-impact-card',style:{marginTop:16}},
                                React.createElement('div',{className:'pr-impact-card-title'},iconLabel('folder','Changed Files')),
                                React.createElement('div',{className:'pr-files-list'},
                                    prData.files&&prData.files.slice(0,20).map(function(f,i){
                                        var existing=data&&data.files.find(function(df){return df.path===f.filename;});
                                        var blast=existing?calcBlast(f.filename,data.connections,data.files):null;
                                        var statusColor = f.status === 'added' ? 'var(--green)' : f.status === 'removed' ? 'var(--red)' : 'var(--blue)';
                                        return React.createElement('div',{key:i,className:'pr-file-row'},
                                            React.createElement('div',{className:'pr-file-status',style:{background:statusColor}}),
                                            React.createElement('div',{className:'pr-file-info'},
                                                React.createElement('div',{className:'pr-file-path'},f.filename.split('/').pop()),
                                                React.createElement('div',{className:'pr-file-folder'},f.filename.includes('/')?f.filename.substring(0,f.filename.lastIndexOf('/')):'root')
                                            ),
                                            React.createElement('div',{className:'pr-file-badges'},
                                                f.additions>0&&React.createElement('span',{className:'pr-mini-badge',style:{background:'rgba(34,197,94,0.2)',color:'var(--green)'}},'+',f.additions),
                                                f.deletions>0&&React.createElement('span',{className:'pr-mini-badge',style:{background:'rgba(255,95,95,0.2)',color:'var(--red)'}},'-',f.deletions),
                                                blast&&React.createElement('span',{className:'pr-mini-badge',style:{background:blast.level==='low'?'rgba(34,197,94,0.2)':blast.level==='medium'?'rgba(255,159,67,0.2)':'rgba(255,95,95,0.2)',color:blast.level==='low'?'var(--green)':blast.level==='medium'?'var(--orange)':'var(--red)'}},React.createElement(Icon,{name:'impact',size:'s'}),' ',blast.count)
                                            )
                                        );
                                    }),
                                    prData.files&&prData.files.length>20&&React.createElement('div',{style:{textAlign:'center',padding:8,fontSize:10,color:'var(--t3)'}},'+',prData.files.length-20,' more files')
                                )
                            )
                        );
                    })()
                )
            )
        ),
        isMobile&&React.createElement('div',{className:'mobile-bottom-nav'},
            React.createElement('button',{className:'top-btn'+(mobilePanel==='explorer'?' active':''),'aria-label':'Open explorer panel',onClick:function(){toggleMobilePanel('explorer');},type:'button'},
                React.createElement(Icon,{name:'folder',size:'m'}),
                'Explorer'
            ),
            React.createElement('button',{className:'top-btn'+(!mobilePanel?' active':''),'aria-label':'Show canvas',onClick:function(){setMobilePanel(null);},type:'button'},
                React.createElement(Icon,{name:'graph',size:'m'}),
                'Canvas'
            ),
            React.createElement('button',{className:'top-btn'+(mobilePanel==='details'?' active':''),'aria-label':'Open insights panel',onClick:function(){toggleMobilePanel('details');},disabled:!data,type:'button'},
                React.createElement(Icon,{name:selected?'file':'layout',size:'m'}),
                selected?'Inspector':'Insights'
            )
        ),
        drillDown&&React.createElement('div',{className:'modal-overlay',onClick:function(){setDrillDown(null);}},
            React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{maxWidth:600,maxHeight:'85vh',display:'flex',flexDirection:'column'}},
                React.createElement('div',{className:'modal-header'},
                    React.createElement('div',{className:'modal-title'},
                        drillDown.type==='issue'?React.createElement(React.Fragment,null,React.createElement(StatusDot,{color:drillDown.data.type==='critical'?'var(--red)':'var(--orange)'}),' ',drillDown.data.title):
                        drillDown.type==='pattern'?iconLabel(drillDown.data.icon,drillDown.data.name,'m'):
                        drillDown.type==='security'?React.createElement(React.Fragment,null,React.createElement(StatusDot,{color:getSeverityColor(drillDown.data.severity)}),' ',drillDown.data.title):
                        drillDown.type==='duplicate'?iconLabel(drillDown.data.type==='code'?'copy':'note',(drillDown.data.type==='code'?'Similar Code':'Duplicate Name')+': '+drillDown.data.name,'m'):
                        'Details'
                    ),
                    React.createElement('button',{className:'modal-close',onClick:function(){setDrillDown(null);}},'×')
                ),
                React.createElement('div',{className:'modal-body',style:{overflowY:'auto',flex:1}},
                    // Issue drill-down
                    drillDown.type==='issue'&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{background:'var(--bg0)',padding:12,borderRadius:8,marginBottom:16}},
                            React.createElement('div',{style:{fontSize:11,color:'var(--t2)'}},drillDown.data.desc)
                        ),
                        React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},'All Affected Items (',drillDown.data.items?drillDown.data.items.length:0,')'),
                        drillDown.data.items&&drillDown.data.items.map(function(item,j){return React.createElement('div',{key:j,style:getAccentBlockStyle('rgba(99,102,241,0.28)','rgba(99,102,241,0.08)',{padding:12,marginBottom:8})},
                            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
                                React.createElement('div',{style:{fontWeight:600,fontSize:11}},item.name),
                                item.file&&React.createElement('div',{style:{display:'flex',gap:6}},
                                    React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(item.file,item.line);}},iconLabel('eye','View')),
                                    React.createElement('button',{style:{fontSize:9,padding:'4px 8px',background:'var(--acc)',color:'var(--bg0)',border:'none',borderRadius:4,cursor:'pointer'},onClick:function(e){e.stopPropagation();selectFile(item.file);setDrillDown(null);}},'Go to file →')
                                )
                            ),
                            item.file&&React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginTop:4,fontFamily:"'JetBrains Mono',monospace"}},item.file,item.line?' : '+item.line:''),
                            (item.lines||item.fns||item.imports||item.score)&&React.createElement('div',{style:{display:'flex',gap:12,marginTop:8}},
                                item.lines&&React.createElement('span',{style:{fontSize:9,color:'var(--purple)'}},item.lines,' lines'),
                                item.fns&&React.createElement('span',{style:{fontSize:9,color:'var(--orange)'}},item.fns,' functions'),
                                item.imports&&React.createElement('span',{style:{fontSize:9,color:'var(--blue)'}},item.imports,' imports'),
                                item.score&&React.createElement('span',{style:{fontSize:9,color:'var(--red)'}},'Complexity: ',item.score)
                            ),
                            item.code&&React.createElement('pre',{style:{fontSize:9,background:'var(--bg2)',padding:8,borderRadius:4,marginTop:8,overflow:'auto',maxHeight:100,fontFamily:"'JetBrains Mono',monospace"}},item.code),
                            item.suggestion&&React.createElement('div',{style:{fontSize:10,color:'var(--acc)',marginTop:8,padding:'6px 8px',background:'var(--bg2)',borderRadius:4}},React.createElement(Icon,{name:'spark',size:'s'}),' ',item.suggestion),
                            // For items with nested files (like duplicates)
                            item.files&&React.createElement('div',{style:{marginTop:8}},
                                React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginBottom:4}},'Locations:'),
                                item.files.map(function(f,k){return React.createElement('div',{key:k,style:{fontSize:9,color:'var(--t2)',padding:'4px 8px',background:'var(--bg2)',borderRadius:4,marginBottom:4,display:'flex',justifyContent:'space-between',alignItems:'center'}},
                                    React.createElement('span',{style:{fontFamily:"'JetBrains Mono',monospace",cursor:'pointer',flex:1},onClick:function(){selectFile(f.file||f);setDrillDown(null);}},typeof f==='string'?f.split('/').pop():(f.file||'').split('/').pop(),f.line?' :'+f.line:''),
                                    React.createElement('div',{style:{display:'flex',gap:4}},
                                        React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(f.file||f,f.line);}},React.createElement(Icon,{name:'eye',size:'s'})),
                                        React.createElement('span',{style:{color:'var(--acc)',cursor:'pointer'},onClick:function(){selectFile(f.file||f);setDrillDown(null);}},'→')
                                    )
                                );})
                            )
                        );})
                    ),
                    // Pattern drill-down
                    drillDown.type==='pattern'&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:{background:'var(--bg0)',padding:12,borderRadius:8,marginBottom:16}},
                            React.createElement('div',{style:{fontSize:11,color:'var(--t2)'}},drillDown.data.desc),
                            drillDown.data.isAnti&&React.createElement('div',{style:{marginTop:8}},React.createElement('span',{className:'badge badge-danger'},'Anti-pattern'))
                        ),
                        drillDown.data.metrics&&React.createElement('div',{style:{display:'flex',gap:12,marginBottom:16}},
                            Object.entries(drillDown.data.metrics).map(function(e){return React.createElement('div',{key:e[0],style:{background:'var(--bg0)',padding:12,borderRadius:8,textAlign:'center',flex:1}},
                                React.createElement('div',{style:{fontSize:20,fontWeight:600,color:'var(--acc)'}},e[1]),
                                React.createElement('div',{style:{fontSize:9,color:'var(--t3)',textTransform:'capitalize'}},e[0])
                            );})
                        ),
                        React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},'All Files (',drillDown.data.files.length,')'),
                        drillDown.data.files.map(function(f,j){return React.createElement('div',{key:j,style:getAccentBlockStyle('rgba(99,102,241,0.28)','rgba(99,102,241,0.08)',{padding:12,marginBottom:8})},
                            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
                                React.createElement('div',{style:{fontWeight:600,fontSize:11,cursor:'pointer'},onClick:function(){selectFile(f.path);setDrillDown(null);}},f.name),
                                React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(f.path);}},iconLabel('eye','View'))
                            ),
                            React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginTop:4,fontFamily:"'JetBrains Mono',monospace",cursor:'pointer'},onClick:function(){selectFile(f.path);setDrillDown(null);}},f.path),
                            f.fns&&React.createElement('div',{style:{fontSize:10,color:'var(--orange)',marginTop:4}},f.fns,' functions'),
                            f.lines&&React.createElement('div',{style:{fontSize:10,color:'var(--purple)',marginTop:4}},f.lines,' lines')
                        );})
                    ),
                    // Security drill-down
                    drillDown.type==='security'&&React.createElement(React.Fragment,null,
                        React.createElement('div',{style:drillDown.data.severity==='high'
                            ? getAccentBlockStyle('rgba(255,95,95,0.36)','rgba(255,95,95,0.1)',{padding:12,marginBottom:16})
                            : drillDown.data.severity==='medium'
                                ? getAccentBlockStyle('rgba(255,159,67,0.34)','rgba(255,180,100,0.1)',{padding:12,marginBottom:16})
                                : getAccentBlockStyle('rgba(77,159,255,0.34)','rgba(100,180,255,0.1)',{padding:12,marginBottom:16})},
                            React.createElement('div',{style:{fontSize:11,fontWeight:600,marginBottom:4}},drillDown.data.severity.toUpperCase()+' Severity'),
                            React.createElement('div',{style:{fontSize:11,color:'var(--t2)'}},drillDown.data.desc)
                        ),
                        React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},'Location'),
                        React.createElement('div',{style:{background:'var(--bg0)',padding:12,borderRadius:8,marginBottom:16}},
                            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
                                React.createElement('div',{style:{fontWeight:600,fontSize:11,cursor:'pointer'},onClick:function(){selectFile(drillDown.data.path);setDrillDown(null);}},drillDown.data.file),
                                React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(drillDown.data.path,drillDown.data.line);}},iconLabel('eye','View'))
                            ),
                            React.createElement('div',{style:{fontSize:10,color:'var(--t3)',marginTop:4,fontFamily:"'JetBrains Mono',monospace",cursor:'pointer'},onClick:function(){selectFile(drillDown.data.path);setDrillDown(null);}},drillDown.data.path),
                            drillDown.data.line&&React.createElement('div',{style:{fontSize:10,color:'var(--orange)',marginTop:4}},drillDown.data.endLine&&drillDown.data.endLine!==drillDown.data.line?'Lines '+drillDown.data.line+'–'+drillDown.data.endLine:'Line '+drillDown.data.line)
                        ),
                        drillDown.data.code&&React.createElement(React.Fragment,null,
                            React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},'Code'),
                            React.createElement('pre',{style:{background:'var(--bg0)',padding:12,borderRadius:8,fontSize:10,fontFamily:"'JetBrains Mono',monospace",overflow:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all'}},drillDown.data.code)
                        ),
                        React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12,marginTop:16}},'How to Fix'),
                        React.createElement('div',{style:{background:'var(--bg0)',padding:12,borderRadius:8,fontSize:10}},
                            drillDown.data.title==='Hardcoded Secret'?'Move credentials to environment variables (process.env) or a secrets manager like AWS Secrets Manager, HashiCorp Vault, or .env files (not committed to git).':
                            drillDown.data.title==='SQL Injection Risk'?'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL strings.':
                            drillDown.data.title==='XSS Vulnerability'?'Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.':
                            drillDown.data.title==='Dynamic Code Execution'?'Avoid eval() entirely. Use JSON.parse() for JSON, or Function constructor only with trusted input.':
                            'Review the flagged code and apply security best practices.'
                        )
                    ),
                    // Duplicate drill-down — side-by-side diff view
                    drillDown.type==='duplicate'&&(function(){
                        var dd=drillDown.data;
                        // Build function code lookup from data.files
                        var fnCodeMap=Object.create(null);
                        (data.files||[]).forEach(function(f){
                            (f.functions||[]).forEach(function(fn){
                                var k1=f.path+'|'+fn.name+'|'+fn.line;
                                var k2=f.path+'|'+fn.name;
                                fnCodeMap[k1]=fn.code;
                                if(!fnCodeMap[k2])fnCodeMap[k2]=fn.code;
                            });
                        });
                        function getCode(f){
                            return fnCodeMap[f.file+'|'+(f.name||dd.name)+'|'+f.line]
                                || fnCodeMap[f.file+'|'+(f.name||dd.name)]
                                || null;
                        }
                        // Simple line-diff for first two locations
                        var codeA=getCode(dd.files[0]);
                        var codeB=dd.files.length>1?getCode(dd.files[1]):null;
                        var diffLines=null;
                        if(codeA&&codeB){
                            var la=codeA.split('\n'),lb=codeB.split('\n');
                            var maxL=Math.max(la.length,lb.length);
                            diffLines=[];
                            for(var di=0;di<maxL;di++){
                                var a=la[di]!==undefined?la[di]:'';
                                var b=lb[di]!==undefined?lb[di]:'';
                                diffLines.push({a:a,b:b,same:a.trim()===b.trim()});
                            }
                        }
                        var isCode=dd.type==='code';
                        var simColor=isCode?'var(--purple)':'var(--orange)';
                        return React.createElement(React.Fragment,null,
                            // Summary row
                            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:12,padding:'8px 10px',background:'var(--bg0)',borderRadius:6}},
                                React.createElement('span',{style:{background:isCode?'rgba(167,139,250,0.2)':'rgba(255,159,67,0.2)',color:simColor,padding:'2px 8px',borderRadius:3,fontSize:10,fontWeight:700}},isCode?'Similar Code':'Duplicate Name'),
                                React.createElement('span',{style:{fontWeight:600,fontSize:11,color:'var(--t0)'}},dd.name),
                                React.createElement('span',{style:{marginLeft:'auto',fontSize:10,color:simColor,fontWeight:600}},dd.similarity+'% match')
                            ),
                            // Suggestion
                            React.createElement('div',{style:{fontSize:10,color:'var(--acc)',padding:'6px 10px',background:'rgba(99,102,241,0.08)',borderRadius:5,marginBottom:12,display:'flex',gap:6,alignItems:'flex-start'}},
                                React.createElement(Icon,{name:'spark',size:'s'}),dd.suggestion),
                            // Side-by-side diff (first two locations)
                            diffLines&&React.createElement('div',{style:{marginBottom:14}},
                                React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}},'Side-by-side Diff'),
                                React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}},
                                    [dd.files[0],dd.files[1]].map(function(f,si){
                                        var lines=si===0?diffLines.map(function(r){return{line:r.a,same:r.same};}):diffLines.map(function(r){return{line:r.b,same:r.same};});
                                        return React.createElement('div',{key:si,style:{background:'var(--bg3)',borderRadius:5,overflow:'hidden',minWidth:0}},
                                            React.createElement('div',{style:{padding:'4px 8px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',fontSize:9,color:'var(--t3)',fontFamily:"'JetBrains Mono',monospace",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer'},onClick:function(){selectFile(f.file);setDrillDown(null);}},
                                                (f.name||dd.name),' ',React.createElement('span',{style:{color:'var(--t3)'}},f.file.split('/').pop()+(f.line?':'+f.line:''))
                                            ),
                                            React.createElement('div',{style:{overflowX:'auto',maxHeight:220,overflowY:'auto'}},
                                                React.createElement('pre',{style:{margin:0,padding:'4px 0',fontSize:9,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.6}},
                                                    lines.map(function(r,ri){
                                                        return React.createElement('div',{key:ri,style:{padding:'0 8px',background:r.same?'transparent':(si===0?'rgba(239,68,68,0.12)':'rgba(34,197,94,0.10)'),borderLeft:r.same?'2px solid transparent':(si===0?'2px solid rgba(239,68,68,0.6)':'2px solid rgba(34,197,94,0.5)'),color:r.same?'var(--t1)':(si===0?'#fca5a5':'#86efac'),whiteSpace:'pre'}},r.line||' ');
                                                    })
                                                )
                                            )
                                        );
                                    })
                                ),
                                React.createElement('div',{style:{display:'flex',gap:12,marginTop:5,fontSize:9,color:'var(--t3)'}},
                                    React.createElement('span',null,React.createElement('span',{style:{display:'inline-block',width:8,height:8,background:'rgba(239,68,68,0.4)',borderRadius:1,marginRight:4}}),diffLines.filter(function(r){return!r.same;}).length,' different lines'),
                                    React.createElement('span',null,React.createElement('span',{style:{display:'inline-block',width:8,height:8,background:'rgba(34,197,94,0.3)',borderRadius:1,marginRight:4}}),diffLines.filter(function(r){return r.same;}).length,' identical lines')
                                )
                            ),
                            // All locations
                            React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}},'All Locations ('+dd.files.length+')'),
                            dd.files.map(function(f,j){return React.createElement('div',{key:j,style:{border:'1px solid var(--border)',borderLeft:'3px solid '+simColor,borderRadius:5,padding:'8px 10px',marginBottom:6,background:'var(--bg0)'}},
                                React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
                                    React.createElement('div',{style:{fontWeight:600,fontSize:11,cursor:'pointer',color:'var(--t0)'},onClick:function(){selectFile(f.file);setDrillDown(null);}},f.name||dd.name),
                                    React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(f.file,f.line);}},iconLabel('eye','View'))
                                ),
                                React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:3,fontFamily:"'JetBrains Mono',monospace",cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},onClick:function(){selectFile(f.file);setDrillDown(null);}},f.file),
                                f.line&&React.createElement('span',{style:{fontSize:9,color:'var(--orange)'}}, 'Line '+f.line)
                            );}),
                            // Refactor guide
                            React.createElement('div',{style:{marginTop:14,background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:5,padding:'9px 11px'}},
                                React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--green)',marginBottom:5}},'🔧 Refactor Suggestion'),
                                React.createElement('div',{style:{fontSize:10,color:'var(--t2)',lineHeight:1.6}},
                                    isCode
                                    ?React.createElement(React.Fragment,null,
                                        '1. Extract the common logic into a shared utility function',React.createElement('br'),
                                        '2. Replace both implementations with a call to the shared function',React.createElement('br'),
                                        '3. Pass any differing values (highlighted in red/green above) as parameters',React.createElement('br'),
                                        '4. Delete the duplicate — only keep the shared version')
                                    :React.createElement(React.Fragment,null,
                                        '1. Decide which file should be the canonical location for "'+dd.name+'"',React.createElement('br'),
                                        '2. Move the function there and export it',React.createElement('br'),
                                        '3. Update all other files to import from the canonical location',React.createElement('br'),
                                        '4. Remove the now-duplicate definitions')
                                )
                            )
                        );
                    })()
                )
            )
        ),
        showPrivacy&&React.createElement(PrivacyModal,{onClose:function(){setShowPrivacy(false);}}),
        showKeyModal&&React.createElement(KeyModal,{privateKey:privateKey,onKeyChange:setPrivateKey,onClose:function(){setShowKeyModal(false);}}),
        showUnused&&data&&data.deadFunctions&&React.createElement('div',{className:'modal-overlay',onClick:function(){setShowUnused(false);}},
            React.createElement('div',{className:'modal',style:{maxWidth:650,maxHeight:'85vh'},onClick:function(e){e.stopPropagation();}},
                React.createElement('div',{className:'modal-header'},React.createElement('div',{className:'modal-title'},iconLabel('warning','Unused Functions','m')),React.createElement('button',{className:'modal-close',onClick:function(){setShowUnused(false);}},'×')),
                React.createElement('div',{className:'modal-body',style:{maxHeight:'70vh',overflowY:'auto'}},
                    React.createElement('div',{className:'unused-summary'},
                        React.createElement('div',{className:'unused-summary-item'},
                            React.createElement('div',{className:'unused-summary-value'},data.deadFunctions.length),
                            React.createElement('div',{className:'unused-summary-label'},'Dead Functions')
                        ),
                        React.createElement('div',{className:'unused-summary-item'},
                            React.createElement('div',{className:'unused-summary-value'},data.deadFunctions.reduce(function(s,f){return s+f.codeLines;},0)),
                            React.createElement('div',{className:'unused-summary-label'},'Dead Lines')
                        ),
                        React.createElement('div',{className:'unused-summary-item'},
                            React.createElement('div',{className:'unused-summary-value'},[...new Set(data.deadFunctions.map(function(f){return f.file;}))].length),
                            React.createElement('div',{className:'unused-summary-label'},'Files Affected')
                        )
                    ),
                    React.createElement('div',{style:Object.assign(getAccentBlockStyle('rgba(255,159,67,0.34)','rgba(255,159,67,0.08)'),{fontSize:10,color:'var(--t3)',marginBottom:12,padding:'8px 12px',borderRadius:6})},'These functions have zero calls from other files or within their own file. They are likely dead code that can be safely removed.'),
                    data.deadFunctions.map(function(fn,i){
                        var isExpanded=expandedFns.has('dead-'+fn.name);
                        return React.createElement('div',{key:i,className:'unused-fn'},
                            React.createElement('div',{className:'unused-fn-header',onClick:function(){toggleFn('dead-'+fn.name);}},
                                React.createElement('div',null,
                                    React.createElement('span',{className:'unused-fn-name'},fn.name,'()'),
                                    React.createElement('div',{className:'unused-fn-path'},
                                        React.createElement('span',null,React.createElement(Icon,{name:'folder',size:'s'}),' ',fn.folder||'root'),
                                        React.createElement('span',null,'→'),
                                        React.createElement('span',{className:'unused-fn-file',onClick:function(e){e.stopPropagation();selectFile(fn.file);setShowUnused(false);}},fn.file.split('/').pop())
                                    )
                                ),
                                React.createElement('div',{className:'unused-fn-meta'},
                                    React.createElement('button',{className:'view-file-btn',onClick:function(e){e.stopPropagation();openFilePreview(fn.file,fn.line);},title:'View source'},React.createElement(Icon,{name:'eye',size:'s'})),
                                    React.createElement('span',{className:'unused-fn-lines'},fn.codeLines,' lines'),
                                    fn.line&&React.createElement('span',{className:'unused-fn-loc'},'L',fn.line),
                                    React.createElement('span',{style:{fontSize:10,color:'var(--t3)'}},isExpanded?'▼':'▶')
                                )
                            ),
                            isExpanded&&fn.code&&React.createElement('div',{className:'unused-fn-preview'},
                                React.createElement('div',{className:'unused-fn-code'},fn.code)
                            )
                        );
                    })
                ),
                React.createElement('div',{className:'modal-footer',style:{display:'flex',gap:8}},
                    React.createElement('button',{className:'top-btn',onClick:function(){data.deadFunctions.forEach(function(fn){expandedFns.add('dead-'+fn.name);});setExpandedFns(new Set(expandedFns));}},'Expand All'),
                    React.createElement('button',{className:'top-btn',onClick:function(){setExpandedFns(new Set());}},'Collapse All'),
                    React.createElement('button',{className:'top-btn primary',onClick:function(){setShowUnused(false);}},'Close')
                )
            )
        ),
        confirmDialog&&(function(){
            var tone=getDialogTone(confirmDialog.tone);
            return React.createElement('div',{className:'modal-overlay',style:{zIndex:1200},onClick:function(){closeConfirmDialog(false);}},
                React.createElement('div',{className:'modal confirm-modal',onClick:function(e){e.stopPropagation();}},
                    React.createElement('div',{className:'modal-body'},
                        React.createElement('div',{className:'confirm-content'},
                            React.createElement('div',{className:'confirm-icon',style:{color:tone.color,background:tone.background,border:'1px solid '+tone.borderColor}},
                                React.createElement(Icon,{name:confirmDialog.icon||'warning',size:'l'})
                            ),
                            React.createElement('div',{className:'confirm-copy'},
                                React.createElement('div',{className:'confirm-title'},confirmDialog.title),
                                React.createElement('div',{className:'confirm-message'},confirmDialog.message)
                            )
                        )
                    ),
                    React.createElement('div',{className:'modal-footer'},
                        React.createElement('button',{className:'top-btn',onClick:function(){closeConfirmDialog(false);}},confirmDialog.cancelLabel||'Cancel'),
                        React.createElement('button',{className:'top-btn primary',style:{background:tone.color,borderColor:tone.color,color:'var(--bg0)'},onClick:function(){closeConfirmDialog(true);}},confirmDialog.confirmLabel||'Continue')
                    )
                )
            );
        })(),
        toast&&React.createElement('div',{className:'toast '+(toast.type||'success'),'role':'alert'},toast.msg),
        filePreview&&React.createElement(FilePreviewModal,{
            filePreview:filePreview,
            filePreviewRef:filePreviewRef,
            onClose:function(){setFilePreview(null);},
            highlightSyntax:highlightSyntax
        }),
        error&&React.createElement('div',{style:{position:'fixed',bottom:20,right:20,background:'var(--red)',color:'white',padding:'12px 20px',borderRadius:8,zIndex:1000,maxWidth:350},'role':'alert'},[error,React.createElement('button',{'aria-label':'Dismiss error','onClick':function(){setError(null);},style:{marginLeft:12,background:'none',border:'none',color:'white',cursor:'pointer',fontSize:16}},'×')])
    );
}
