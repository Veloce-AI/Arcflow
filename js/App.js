/* App.js - ErrorBoundary, App root component, ReactDOM render */

// ---------------------------------------------------------------------------
// Language bar colors — keyed by lowercase file extension
// ---------------------------------------------------------------------------
var EXT_COLORS={
    js:'#f7df1e',ts:'#3178c6',jsx:'#61dafb',tsx:'#3178c6',
    py:'#3572A5',rb:'#701516',go:'#00ADD8',java:'#b07219',
    rs:'#dea584',cs:'#178600',php:'#4F5D95',kt:'#A97BFF',
    swift:'#ffac45',c:'#555555',cpp:'#f34b7d',m:'#438eff',
    html:'#e34c26',css:'#563d7c',scss:'#c6538c',vue:'#41b883',
    svelte:'#ff3e00',md:'#4a90d9',markdown:'#4a90d9',
    json:'#cbcb41',yml:'#cb171e',yaml:'#cb171e',toml:'#9c4221',
    sh:'#89e051',bash:'#89e051',sql:'#336791',r:'#198ce7',
    tf:'#7b42bc',dockerfile:'#0db7ed',
    gitignore:'#777',lock:'#888',txt:'#aaa',env:'#666'
};
var EXT_DEFAULT_COLORS=['#6366f1','#22c55e','#f97316','#06b6d4','#8b5cf6','#ec4899','#14b8a6','#a78bfa'];

// ---------------------------------------------------------------------------
// React Application
// ---------------------------------------------------------------------------

function App(){
    var _a=useState(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'),theme=_a[0],setTheme=_a[1];
    var _b=useState(''),repoUrl=_b[0],setRepoUrl=_b[1];
    var _c=useState(''),token=_c[0],setToken=_c[1];
    var _authMethod=useState('none'),authMethod=_authMethod[0],setAuthMethod=_authMethod[1];// 'none', 'pat', 'github_app'
    var _appId=useState(''),appId=_appId[0],setAppId=_appId[1];
    var _privateKey=useState(''),privateKey=_privateKey[0],setPrivateKey=_privateKey[1];
    var _showKeyModal=useState(false),showKeyModal=_showKeyModal[0],setShowKeyModal=_showKeyModal[1];
    var _d=useState(false),loading=_d[0],setLoading=_d[1];
    var _e=useState(''),progress=_e[0],setProgress=_e[1];
    var _f=useState(null),error=_f[0],setError=_f[1];
    var _g=useState(null),data=_g[0],setData=_g[1];
    var _h=useState(null),repoInfo=_h[0],setRepoInfo=_h[1];
    var _i=useState('folder'),colorMode=_i[0],setColorMode=_i[1];
    var _j=useState(null),selected=_j[0],setSelected=_j[1];
    var _k=useState(new Set([''])),expandedPaths=_k[0],setExpandedPaths=_k[1];
    var _l=useState(new Set(['blast','fns'])),expandedCards=_l[0],setExpandedCards=_l[1];
    var _m=useState('details'),rightTab=_m[0],setRightTab=_m[1];
    var _m2=useState(null),drillDown=_m2[0],setDrillDown=_m2[1];// {type:'issue'|'pattern'|'security'|'suggestion'|'duplicate', data:...}
    var _n=useState(null),blastRadius=_n[0],setBlastRadius=_n[1];
    var _o=useState(null),ownership=_o[0],setOwnership=_o[1];
    var _p=useState(''),prUrl=_p[0],setPrUrl=_p[1];
    var _q=useState(null),prData=_q[0],setPrData=_q[1];
    var _r=useState(false),showExport=_r[0],setShowExport=_r[1];
    var _vapt=useState(false),showVAPT=_vapt[0],setShowVAPT=_vapt[1];
    var _rts=useState(false),showRoutes=_rts[0],setShowRoutes=_rts[1];
    var _comp=useState(false),showComponents=_comp[0],setShowComponents=_comp[1];
    var _sdiff=useState(false),showSnapshotDiff=_sdiff[0],setShowSnapshotDiff=_sdiff[1];
    var _nlf=useState(''),nlFilter=_nlf[0],setNlFilter=_nlf[1];
    var _s=useState(false),showPR=_s[0],setShowPR=_s[1];
    var _t=useState(false),showPrivacy=_t[0],setShowPrivacy=_t[1];
    var _u=useState(null),tooltip=_u[0],setTooltip=_u[1];
    var _v=useState(null),toast=_v[0],setToast=_v[1];
    var _w=useState(false),ownerLoading=_w[0],setOwnerLoading=_w[1];
    var _x=useState(null),folderFilter=_x[0],setFolderFilter=_x[1];
    var _y=useState(new Set()),expandedFns=_y[0],setExpandedFns=_y[1];
    var _z=useState(false),showUnused=_z[0],setShowUnused=_z[1];
    var _aa=useState({spacing:200,linkDist:70,viewMode:'force',vizType:'graph',showLabels:true,curvedLinks:true}),graphConfig=_aa[0],setGraphConfig=_aa[1];
    var _ab=useState(false),showGraphConfig=_ab[0],setShowGraphConfig=_ab[1];
    var _ac=useState(260),sidebarWidth=_ac[0],setSidebarWidth=_ac[1];
    var _ad=useState(360),rightPanelWidth=_ad[0],setRightPanelWidth=_ad[1];
    var _ae=useState(true),legendCollapsed=_ae[0],setLegendCollapsed=_ae[1];
    var _af=useState(null),filePreview=_af[0],setFilePreview=_af[1];// {path, content, line, filename, loading, error}
    var _ag=useState(null),localDirHandle=_ag[0],setLocalDirHandle=_ag[1];
    var _ap=useState(null),localSourceKind=_ap[0],setLocalSourceKind=_ap[1];// null | 'folder' | 'zip'
    var _osv1=useState(null),osvData=_osv1[0],setOsvData=_osv1[1];
    var _osv2=useState(false),osvLoading=_osv2[0],setOsvLoading=_osv2[1];
    var _osv3=useState(''),osvProgress=_osv3[0],setOsvProgress=_osv3[1];
    var _ah=useState(false),showExcludeModal=_ah[0],setShowExcludeModal=_ah[1];
    var _ai=useState(''),excludePatternInput=_ai[0],setExcludePatternInput=_ai[1];
    var _aj=useState(''),excludePatternDraft=_aj[0],setExcludePatternDraft=_aj[1];
    var _al=useState(null),confirmDialog=_al[0],setConfirmDialog=_al[1];
    var _am=useState(window.innerWidth),viewportWidth=_am[0],setViewportWidth=_am[1];
    var _an=useState(null),mobilePanel=_an[0],setMobilePanel=_an[1];
    var _ao=useState(48),topbarHeight=_ao[0],setTopbarHeight=_ao[1];
    var _arch=useState({scale:1,x:0,y:0}),architectureViewport=_arch[0],setArchitectureViewport=_arch[1];
    var _archDrag=useState(false),architectureDragging=_archDrag[0],setArchitectureDragging=_archDrag[1];
    var _archTests=useState(false),architectureIncludeTests=_archTests[0],setArchitectureIncludeTests=_archTests[1];
    var _archBuild=useState(false),architectureIncludeBuildOutput=_archBuild[0],setArchitectureIncludeBuildOutput=_archBuild[1];
    var isMobile=viewportWidth<=980;
    var svgRef=useRef(null);
    var graph3dRef=useRef(null);
    var graph3dInstanceRef=useRef(null);
    var topbarRef=useRef(null);
    var filePreviewRef=useRef(null);
    var treemapRef=useRef(null);
    var matrixRef=useRef(null);
    var dendroRef=useRef(null);
    var sankeyRef=useRef(null);
    var disjointRef=useRef(null);
    var bundleRef=useRef(null);
    var chordRef=useRef(null);
    var architectureRenderRef=useRef(null);
    var architectureDragRef=useRef(null);
    var zoomRef=useRef(null);
    var simRef=useRef(null);
    var nodesRef=useRef(null);
    var linksRef=useRef(null);
    var selectFileRef=useRef(null);
    var zipInputRef=useRef(null);
    var zipArchiveRef=useRef(null);
    var zipFileRef=useRef(null);
    var folderInputRef=useRef(null);
    var localFilesRef=useRef(null);
    var pendingExcludePatternsRef=useRef(null);
    var confirmResolverRef=useRef(null);
    var prevDataRef=useRef(null);
    var activeExcludePatterns=useMemo(function(){return compileExcludePatterns(excludePatternInput);},[excludePatternInput]);
    var customExcludeCount=activeExcludePatterns.length;

    useEffect(function(){
        document.body.className=theme==='light'?'light':'';
        if(window.mermaid){
            window.mermaid.initialize({
                startOnLoad:false,
                securityLevel:'strict',
                theme:theme==='light'?'default':'dark',
                flowchart:{htmlLabels:true,curve:'basis'}
            });
        }
    },[theme]);

    useEffect(function(){
        if(graphConfig.vizType!=='architecture')return;
        var container=architectureRenderRef.current;
        if(!container)return;
        var diagram=data&&data.architectureDiagram;
        var mermaidText=diagram?generateMermaidBlockDiagram(diagram,architectureIncludeTests,architectureIncludeBuildOutput):'';
        if(!mermaidText){
            container.innerHTML='<div class="empty-state"><div class="empty-title">No architecture diagram</div><div class="empty-desc">Analyze a repository to generate a block diagram.</div></div>';
            return;
        }
        if(!window.mermaid){
            container.innerHTML='<div class="empty-state"><div class="empty-title">Mermaid unavailable</div><div class="empty-desc">The Mermaid renderer did not load. You can still export the raw Mermaid source.</div></div>';
            return;
        }
        var cancelled=false;
        var renderId='codeflow-architecture-'+Date.now();
        container.innerHTML='<div class="loading"><div class="spinner"></div><div class="loading-text">Rendering block diagram...</div></div>';
        try{
            window.mermaid.initialize({
                startOnLoad:false,
                securityLevel:'strict',
                theme:theme==='light'?'default':'dark',
                flowchart:{htmlLabels:true,curve:'basis'}
            });
            window.mermaid.render(renderId,mermaidText).then(function(result){
                if(cancelled||!architectureRenderRef.current)return;
                architectureRenderRef.current.innerHTML='<div class="architecture-pan">'+result.svg+'</div>';
                var svg=architectureRenderRef.current.querySelector('.architecture-pan svg');
                if(!svg){
                    architectureRenderRef.current.innerHTML='<div class="empty-state"><div class="empty-title">Mermaid render failed</div><div class="empty-desc">The renderer returned no SVG for this diagram.</div></div>';
                    return;
                }
                normalizeArchitectureSvg(svg);
                requestAnimationFrame(function(){
                    if(!cancelled)fitArchitectureViewport();
                });
            }).catch(function(err){
                if(cancelled||!architectureRenderRef.current)return;
                architectureRenderRef.current.innerHTML='<div class="empty-state"><div class="empty-title">Mermaid render failed</div><div class="empty-desc">'+escapeHtml(err&&err.message?err.message:String(err))+'</div></div>';
            });
        }catch(err){
            container.innerHTML='<div class="empty-state"><div class="empty-title">Mermaid render failed</div><div class="empty-desc">'+escapeHtml(err&&err.message?err.message:String(err))+'</div></div>';
        }
        return function(){cancelled=true;};
    },[data,graphConfig.vizType,theme,architectureIncludeTests,architectureIncludeBuildOutput]);

    useEffect(function(){
        var container=architectureRenderRef.current;
        var pan=container?container.querySelector('.architecture-pan'):null;
        if(!pan)return;
        pan.style.transform='translate('+architectureViewport.x+'px,'+architectureViewport.y+'px) scale('+architectureViewport.scale+')';
    },[architectureViewport,data,graphConfig.vizType,theme]);

    useEffect(function(){
        if(graphConfig.vizType!=='architecture')return;
        var frame=requestAnimationFrame(function(){fitArchitectureViewport();});
        return function(){cancelAnimationFrame(frame);};
    },[viewportWidth,sidebarWidth,rightPanelWidth,graphConfig.vizType]);

    useEffect(function(){
        var el=folderInputRef.current;
        if(!el)return;
        el.setAttribute('webkitdirectory','');
        el.setAttribute('directory','');
        el.setAttribute('mozdirectory','');
    },[]);

    useEffect(function(){
        function onResize(){setViewportWidth(window.innerWidth);}
        window.addEventListener('resize',onResize);
        onResize();
        return function(){window.removeEventListener('resize',onResize);};
    },[]);

    useEffect(function(){
        if(!topbarRef.current)return;
        function measureTopbar(){
            if(topbarRef.current){
                setTopbarHeight(topbarRef.current.offsetHeight||48);
            }
        }
        measureTopbar();
        if(typeof ResizeObserver==='undefined'){
            window.addEventListener('resize',measureTopbar);
            return function(){window.removeEventListener('resize',measureTopbar);};
        }
        var observer=new ResizeObserver(measureTopbar);
        observer.observe(topbarRef.current);
        return function(){observer.disconnect();};
    },[]);

    useEffect(function(){
        if(!isMobile){
            setMobilePanel(null);
            return;
        }
        setLegendCollapsed(true);
        setShowGraphConfig(false);
    },[isMobile]);

    useEffect(function(){
        if(!data){
            setMobilePanel(null);
        }
    },[data]);

    useEffect(function(){
        return function(){
            if(confirmResolverRef.current){
                confirmResolverRef.current(false);
                confirmResolverRef.current=null;
            }
        };
    },[]);

    useEffect(function(){
        if(!confirmDialog)return;
        function onKeyDown(e){
            if(e.key==='Escape'){
                e.preventDefault();
                closeConfirmDialog(false);
            }
        }
        document.addEventListener('keydown',onKeyDown);
        return function(){document.removeEventListener('keydown',onKeyDown);};
    },[confirmDialog]);

    useEffect(function(){
        var params=new URLSearchParams(window.location.search);
        var repo=params.get('repo');
        var shouldAutoRun=params.get('run')==='1';
        if(repo&&repo.length<200&&!repo.includes('{')&&/^[a-zA-Z0-9_.\/-]+$/.test(repo)){
            setRepoUrl(repo);
            if(shouldAutoRun){
                setTimeout(function(){var btn=document.getElementById('analyze-btn');if(btn)btn.click();},500);
            }
        }
    },[]);


    function resetAnalysisState(){
        setError(null);
        setData(null);
        setSelected(null);
        setBlastRadius(null);
        setOwnership(null);
        setFolderFilter(null);
        setPrData(null);
        setFilePreview(null);
        setMobilePanel(null);
        setShowGraphConfig(false);
    }

    function openExcludeModal(){
        setExcludePatternDraft(excludePatternInput);
        setShowExcludeModal(true);
    }

    function closeExcludeModal(){
        setShowExcludeModal(false);
    }

    function saveExcludePatterns(){
        setExcludePatternInput(excludePatternDraft);
        setShowExcludeModal(false);
    }

    function closeConfirmDialog(result){
        setConfirmDialog(null);
        if(confirmResolverRef.current){
            var resolve=confirmResolverRef.current;
            confirmResolverRef.current=null;
            resolve(!!result);
        }
    }

    function requestConfirm(options){
        return new Promise(function(resolve){
            if(confirmResolverRef.current){
                confirmResolverRef.current(false);
            }
            confirmResolverRef.current=resolve;
            setConfirmDialog(Object.assign({
                tone:'warning',
                icon:'warning',
                title:'Please confirm',
                message:'',
                confirmLabel:'Continue',
                cancelLabel:'Cancel'
            },options||{}));
        });
    }

    function toggleMobilePanel(panel){
        setMobilePanel(function(prev){return prev===panel?null:panel;});
    }

    function analyze(){
        loaderAnalyze({repoUrl:repoUrl,token:token,authMethod:authMethod,appId:appId,privateKey:privateKey,activeExcludePatterns:activeExcludePatterns},{setLoading:setLoading,setProgress:setProgress,setError:setError,setData:setData,setRepoInfo:setRepoInfo,setExpandedPaths:setExpandedPaths,setLocalSourceKind:setLocalSourceKind,setLocalDirHandle:setLocalDirHandle,zipArchiveRef:zipArchiveRef,zipFileRef:zipFileRef,requestConfirm:requestConfirm,activeExcludePatterns:activeExcludePatterns,resetAnalysisState:resetAnalysisState,showNotification:showNotification});
    }

    function launchLocalFolderPicker(compiledPatterns){
        pendingExcludePatternsRef.current=compiledPatterns||activeExcludePatterns;
        if(!window.showDirectoryPicker){
            if(folderInputRef.current){
                folderInputRef.current.value='';
                folderInputRef.current.click();
            }
            return;
        }
        window.showDirectoryPicker().then(function(dirHandle){
            resetAnalysisState();
            setRepoInfo(null);
            setLocalDirHandle(dirHandle);
            setLocalSourceKind('folder');
            zipArchiveRef.current=null;
            zipFileRef.current=null;
            setLoading(true);
            setProgress('Reading local folder...');
            readLocalFolder(dirHandle,compiledPatterns||activeExcludePatterns);
        }).catch(function(e){
            if(e.name!=='AbortError'){
                setError('Failed to open folder: '+(e.message||e));
            }
        });
    }

    function openLocalFolder(){
        launchLocalFolderPicker();
    }

    function openLocalZip(){
        if(!window.JSZip){
            setError('ZIP support failed to load. Check your network connection and try again.');
            return;
        }
        if(zipInputRef.current){
            zipInputRef.current.value='';
            zipInputRef.current.click();
        }
    }

    function handleZipSelected(e){
        var file=e.target.files&&e.target.files[0];
        if(!file)return;
        resetAnalysisState();
        setRepoInfo(null);
        setLocalDirHandle(null);
        setLocalSourceKind('zip');
        zipArchiveRef.current=null;
        zipFileRef.current=file;
        setLoading(true);
        setProgress('Reading ZIP archive...');
        readZipArchive(file,activeExcludePatterns);
    }

    function handleFolderSelected(e){
        var fileList=e.target.files;
        if(!fileList||fileList.length===0)return;
        var files=Array.from(fileList);
        localFilesRef.current=files;
        resetAnalysisState();
        setRepoInfo(null);
        setLocalDirHandle(null);
        setLocalSourceKind('folder');
        zipArchiveRef.current=null;
        zipFileRef.current=null;
        setLoading(true);
        setProgress('Reading local folder...');
        readLocalFolderFromFiles(files,pendingExcludePatternsRef.current||activeExcludePatterns);
    }

    function refreshAnalysis(){
        if(localSourceKind==='folder'&&localDirHandle){
            resetAnalysisState();
            setLoading(true);
            setProgress('Reading local folder...');
            readLocalFolder(localDirHandle,activeExcludePatterns);
            return;
        }
        if(localSourceKind==='folder'&&localFilesRef.current){
            resetAnalysisState();
            setLoading(true);
            setProgress('Reading local folder...');
            readLocalFolderFromFiles(localFilesRef.current,activeExcludePatterns);
            return;
        }
        if(localSourceKind==='zip'){
            if(!zipFileRef.current){
                showNotification('ZIP archive is no longer available. Load it again to refresh.','warning');
                return;
            }
            resetAnalysisState();
            setLocalDirHandle(null);
            setLocalSourceKind('zip');
            zipArchiveRef.current=null;
            setLoading(true);
            setProgress('Reading ZIP archive...');
            readZipArchive(zipFileRef.current,activeExcludePatterns);
            return;
        }
        analyze();
    }

    function readLocalFolder(dirHandle,compiledPatterns){
        return loaderReadLocalFolder(dirHandle,compiledPatterns,{setLoading:setLoading,setProgress:setProgress,setError:setError,setData:setData,setRepoInfo:setRepoInfo,setExpandedPaths:setExpandedPaths,requestConfirm:requestConfirm,activeExcludePatterns:activeExcludePatterns});
    }

    async function readLocalFolderFromFiles(fileObjs,compiledPatterns){
        return loaderReadLocalFolderFromFiles(fileObjs,compiledPatterns,{setLoading:setLoading,setProgress:setProgress,setError:setError,setData:setData,setRepoInfo:setRepoInfo,setExpandedPaths:setExpandedPaths,requestConfirm:requestConfirm,activeExcludePatterns:activeExcludePatterns});
    }

    async function readZipArchive(zipFile,compiledPatterns){
        return loaderReadZipArchive(zipFile,compiledPatterns,{setLoading:setLoading,setProgress:setProgress,setError:setError,setData:setData,setRepoInfo:setRepoInfo,setExpandedPaths:setExpandedPaths,setLocalSourceKind:setLocalSourceKind,setLocalDirHandle:setLocalDirHandle,zipArchiveRef:zipArchiveRef,zipFileRef:zipFileRef,requestConfirm:requestConfirm,activeExcludePatterns:activeExcludePatterns});
    }

    var selectFile=useCallback(function(path){
        if(!data)return;
        var file=data.files.find(function(f){return f.path===path;});
        if(file){
            setSelected(file);
            setRightTab('details');
            if(isMobile){
                setMobilePanel('details');
                setLegendCollapsed(true);
            }
            var blast=calcBlast(path,data.connections,data.files);
            setBlastRadius(blast);
            setOwnership(null);
            setExpandedFns(new Set());
            if(repoInfo&&!localSourceKind){
                setOwnerLoading(true);
                GitHub.getBlame(repoInfo.owner,repoInfo.repo,path).then(function(owners){setOwnership(owners);setOwnerLoading(false);}).catch(function(){setOwnerLoading(false);});
            }else if(localSourceKind){
                setOwnerLoading(false);
                setOwnership([]);
            }
            updateGraphHighlight(path,blast);
        }
    },[data,repoInfo,localSourceKind,isMobile]);
    selectFileRef.current=selectFile;

    function updateGraphHighlight(path,blast){
        if(!nodesRef.current||!linksRef.current)return;
        var affectedSet=new Set(blast?blast.affected:[]);
        nodesRef.current.selectAll('.nc').transition().duration(200)
            .attr('opacity',function(n){if(n.id===path)return 1;if(affectedSet.has(n.id))return 1;return path?0.2:1;})
            .attr('fill',function(n){if(n.id===path)return'#ff5f5f';if(affectedSet.has(n.id))return'#ff9f43';return getNodeColor(n);});
        linksRef.current.transition().duration(200)
            .attr('stroke-opacity',function(l){var src=l.source.id||l.source;var tgt=l.target.id||l.target;if(src===path||tgt===path)return 0.8;return path?0.05:0.4;})
            .attr('stroke',function(l){var src=l.source.id||l.source;var tgt=l.target.id||l.target;if(src===path||tgt===path)return'var(--acc)';return theme==='light'?'#ccc':'#333';});
    }

    function getNodeColor(d){
        if(colorMode==='folder')return colorMap[d.folder]||COLORS[0];
        if(colorMode==='layer')return LAYER_COLORS[d.layer]||LAYER_COLORS['utils'];
        if(colorMode==='churn')return colorMap[d.id]||'#22c55e';
        if(colorMode==='git')return colorMap[d.id]||'#64748b';
        if(colorMode==='clusters')return colorMap[d.id]||'#64748b';
        return COLORS[0];
    }

    var togglePath=useCallback(function(p){setExpandedPaths(function(prev){var n=new Set(prev);if(n.has(p))n.delete(p);else n.add(p);return n;});},[]);
    var toggleCard=useCallback(function(id){setExpandedCards(function(prev){var n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});},[]);
    var toggleFn=useCallback(function(name){setExpandedFns(function(prev){var n=new Set(prev);if(n.has(name))n.delete(name);else n.add(name);return n;});},[]);

    // OSV dependency scan — auto-triggers when analysis data loads
    useEffect(function(){
        if(!data){setOsvData(null);return;}
        setOsvLoading(true);setOsvProgress('');
        runOSVScan(data,function(msg){setOsvProgress(msg);}).then(function(result){
            setOsvData(result);setOsvLoading(false);setOsvProgress('');
        }).catch(function(){setOsvLoading(false);setOsvProgress('');});
    },[data]);

    // Open file preview
    function openFilePreview(path,line){
        loaderOpenFilePreview(path,line,{repoInfo:repoInfo,data:data,localSourceKind:localSourceKind,localDirHandle:localDirHandle,setFilePreview:setFilePreview,zipArchiveRef:zipArchiveRef,localFilesRef:localFilesRef});
    }

    // Scroll to highlighted line after file preview loads
    useEffect(function(){
        if(filePreview&&filePreview.content&&filePreview.line&&filePreviewRef.current){
            setTimeout(function(){
                var el=filePreviewRef.current.querySelector('.file-preview-line.highlighted');
                if(el)el.scrollIntoView({behavior:'smooth',block:'center'});
            },100);
        }
    },[filePreview]);

    var communities=useMemo(function(){
        if(!data)return{clusterMap:{},clusterCount:0,misplaced:{},clusterFiles:{},clusterMajorityFolder:{}};
        return detectCommunities(data.files,data.connections);
    },[data]);

    var colorMap=useMemo(function(){
        if(!data)return{};
        var m={};
        if(colorMode==='folder'){data.folders.forEach(function(f,i){m[f]=COLORS[i%COLORS.length];});m['root']=COLORS[0];}
        else if(colorMode==='layer')data.files.forEach(function(f){m[f.path]=LAYER_COLORS[f.layer]||COLORS[0];});
        else if(colorMode==='churn'){
            var maxC=Math.max.apply(null,data.files.map(function(f){return f.churn||0;}))||1;
            data.files.forEach(function(f){var r=(f.churn||0)/maxC;m[f.path]=r>0.7?'#ff5f5f':r>0.4?'#ff9f43':'#22c55e';});
        }else if(colorMode==='git'){
            var now=Date.now();
            data.files.forEach(function(f){
                if(!f.lastCommit){m[f.path]='#334155';return;}
                var days=(now-new Date(f.lastCommit).getTime())/(1000*86400);
                m[f.path]=days<7?'#ef4444':days<30?'#f97316':days<90?'#f59e0b':days<180?'#22c55e':'#334155';
            });
        }else if(colorMode==='clusters'){
            data.files.forEach(function(f){
                var cid=communities.clusterMap[f.path];
                m[f.path]=cid!==undefined?CLUSTER_COLORS[cid%CLUSTER_COLORS.length]:'#64748b';
            });
        }
        return m;
    },[data,colorMode,communities]);

    useEffect(function(){
        if(!data||!svgRef.current)return;
        return renderForceGraph(svgRef.current, data, {
            colorMode:colorMode, colorMap:colorMap, theme:theme,
            folderFilter:folderFilter, graphConfig:graphConfig,
            zoomRef:zoomRef, simRef:simRef, nodesRef:nodesRef, linksRef:linksRef
        }, {
            onSelect:function(id){if(selectFileRef.current)selectFileRef.current(id);},
            setTooltip:setTooltip, setSelected:setSelected, setBlastRadius:setBlastRadius
        });
    },[data,colorMap,colorMode,theme,folderFilter,graphConfig]);

    // 3D Force Graph Hook â€” body extracted to js/renderers/renderer-3d.js
    useEffect(function(){
        if(!data||!graph3dRef.current||graphConfig.vizType!=='graph3d')return;
        return render3DGraph(graph3dRef.current, data, {
            colorMode:colorMode, colorMap:colorMap, theme:theme,
            folderFilter:folderFilter, graphConfig:graphConfig,
            force3dRef:graph3dInstanceRef, selected:selected, blastRadius:blastRadius,
            selectFileRef:selectFileRef
        }, {
            setSelected:setSelected, setBlastRadius:setBlastRadius
        });
        // (original body extracted to js/renderers/renderer-3d.js)
    },[data,colorMap,colorMode,theme,folderFilter,graphConfig.vizType,selected,blastRadius,graphConfig.linkDist,graphConfig.spacing,graphConfig.showLabels,graphConfig.curvedLinks,graphConfig.autoRotate]);

    // Treemap visualization â€” body extracted to js/renderers/renderer-views.js
    useEffect(function(){
        if(!data||!treemapRef.current||graphConfig.vizType!=='treemap')return;
        renderTreemap(treemapRef.current, data, {
            colorMap:colorMap, folderFilter:folderFilter, selected:selected, blastRadius:blastRadius
        }, {
            onSelect:function(id){if(selectFileRef.current)selectFileRef.current(id);},
            setSelected:setSelected, setBlastRadius:setBlastRadius
        });
    },[data,graphConfig.vizType,colorMap,folderFilter,selected,blastRadius]);

    // Dependency Matrix visualization â€” body extracted to js/renderers/renderer-views.js
    useEffect(function(){
        if(!data||!matrixRef.current||graphConfig.vizType!=='matrix')return;
        renderMatrix(matrixRef.current, data, {folderFilter:folderFilter}, {
            onSelect:function(id){if(selectFileRef.current)selectFileRef.current(id);}
        });
    },[data,graphConfig.vizType,folderFilter]);

    // Cluster Dendrogram â€” body extracted to js/renderers/renderer-views.js
    useEffect(function(){
        if(!data||!dendroRef.current||graphConfig.vizType!=='dendro')return;
        renderDendro(dendroRef.current, data, {colorMap:colorMap, folderFilter:folderFilter}, {
            onSelect:function(id){if(selectFileRef.current)selectFileRef.current(id);},
            onFolderFilter:filterByFolder
        });
    },[data,graphConfig.vizType,colorMap,folderFilter]);

    // Sankey Diagram â€” body extracted to js/renderers/renderer-sankey.js
    useEffect(function(){
        if(!data||!sankeyRef.current||graphConfig.vizType!=='sankey')return;
        renderSankey(sankeyRef.current, data, {folderFilter:folderFilter, colorMap:colorMap}, {
            onFolderFilter:filterByFolder
        });
    },[data,graphConfig.vizType,colorMap,folderFilter]);

    // Disjoint Force-Directed â€” body extracted to js/renderers/renderer-views.js
    useEffect(function(){
        if(!data||!disjointRef.current||graphConfig.vizType!=='disjoint')return;
        return renderDisjoint(disjointRef.current, data, {colorMap:colorMap, folderFilter:folderFilter}, {
            onSelect:function(id){if(selectFileRef.current)selectFileRef.current(id);},
            setSelected:setSelected, setBlastRadius:setBlastRadius
        });
    },[data,graphConfig.vizType,colorMap,folderFilter]);

    // Chord diagram (#44)
    useEffect(function(){
        if(!data||!chordRef.current||graphConfig.vizType!=='chord')return;
        renderChord(chordRef.current, data, {colorMap:colorMap, folderFilter:folderFilter}, {onFolderFilter:filterByFolder});
    },[data,graphConfig.vizType,colorMap,folderFilter]);

    // Circular Bundle â€” body extracted to js/renderers/renderer-views.js
    useEffect(function(){
        if(!data||!bundleRef.current||graphConfig.vizType!=='bundle')return;
        renderBundle(bundleRef.current, data, {
            colorMap:colorMap, folderFilter:folderFilter, selected:selected, blastRadius:blastRadius
        }, {
            onSelect:function(id){if(selectFileRef.current)selectFileRef.current(id);},
            onFolderFilter:filterByFolder,
            setSelected:setSelected, setBlastRadius:setBlastRadius
        });
    },[data,graphConfig.vizType,colorMap,folderFilter,selected,blastRadius]);

    var architectureViewportRef=useRef(architectureViewport);
    architectureViewportRef.current=architectureViewport;
    var architectureDraggingRef=useRef(false);
    architectureDraggingRef.current=architectureDragging;
    var _archCtrls=createArchitectureControls({architectureRenderRef:architectureRenderRef,architectureDragRef:architectureDragRef,architectureViewportRef:architectureViewportRef,architectureDraggingRef:architectureDraggingRef,setArchitectureViewport:setArchitectureViewport,setArchitectureDragging:setArchitectureDragging});
    var fitArchitectureViewport=_archCtrls.fitArchitectureViewport;
    var zoomArchitecture=_archCtrls.zoomArchitecture;
    var resetArchitectureViewport=_archCtrls.resetArchitectureViewport;
    var handleArchitecturePointerDown=_archCtrls.handleArchitecturePointerDown;
    var handleArchitecturePointerMove=_archCtrls.handleArchitecturePointerMove;
    var handleArchitecturePointerUp=_archCtrls.handleArchitecturePointerUp;
    var handleArchitectureWheel=_archCtrls.handleArchitectureWheel;
    var renderArchitectureView=_archCtrls.renderArchitectureView;
    function zoomIn(){graphZoomIn(graphConfig,graph3dInstanceRef,zoomRef,svgRef);}
    function zoomOut(){graphZoomOut(graphConfig,graph3dInstanceRef,zoomRef,svgRef);}
    function resetZoom(){graphResetZoom(graphConfig,graph3dInstanceRef,zoomRef,svgRef);}
    function computeGraphFitTransform(paddingSlack){return graphComputeFitTransform(zoomRef,svgRef,simRef,paddingSlack);}
    function fitView(){graphFitView(graphConfig,graph3dInstanceRef,zoomRef,svgRef,simRef);}
    // getEmbeddedSvgStyle, exportSVG, copyText, fallbackCopyText, copyMermaid,
    // normalizeArchitectureSvg â€” extracted to js/components/export.js
    function showNotification(msg,type){setToast({msg:msg,type:type||'success'});setTimeout(function(){setToast(null);},3000);}
    function copyLink(){
        if(localSourceKind){
            showNotification('Share links are not available for local sources','warning');
            return;
        }
        var shareUrl=buildAppUrl(repoInfo?repoInfo.owner+'/'+repoInfo.repo:repoUrl,true);
        navigator.clipboard.writeText(shareUrl).then(function(){showNotification('Link copied to clipboard!');}).catch(function(){showNotification('Failed to copy link','error');});
    }
    function analyzePR(){if(!prUrl||!repoInfo)return;var m=prUrl.match(/\/pull\/(\d+)/);if(!m){showNotification('Invalid PR URL','error');return;}GitHub.getPR(repoInfo.owner,repoInfo.repo,m[1]).then(function(pr){if(pr)setPrData(pr);else showNotification('Could not load PR','error');});}
    function resetAnalysis(){setData(null);setSelected(null);setBlastRadius(null);setOwnership(null);setRepoInfo(null);setRepoUrl('');setPrData(null);setFolderFilter(null);setLocalDirHandle(null);setLocalSourceKind(null);setArchitectureIncludeTests(false);setArchitectureIncludeBuildOutput(false);zipArchiveRef.current=null;zipFileRef.current=null;window.history.replaceState({},'',window.location.pathname);}
    function filterByFolder(path){setFolderFilter(function(prev){return prev===path?null:path;});}
    // #39 Natural language filter — highlight nodes matching the query
    useEffect(function(){
        if(!nodesRef.current||!linksRef.current||!data)return;
        if(!nlFilter.trim()){
            nodesRef.current.selectAll('.nc').transition().duration(200).attr('opacity',1).attr('fill',getNodeColor);
            linksRef.current.transition().duration(200).attr('stroke-opacity',0.4).attr('stroke',theme==='light'?'#ccc':'#333');
            return;
        }
        var kws=nlFilter.toLowerCase().trim().split(/\s+/);
        var matchSet=new Set();
        (data.files||[]).forEach(function(f){
            var text=(f.name+' '+f.path+' '+(f.layer||'')+' '+(f.folder||'')).toLowerCase();
            if(kws.every(function(k){return text.includes(k);}))matchSet.add(f.path);
        });
        nodesRef.current.selectAll('.nc').transition().duration(200)
            .attr('opacity',function(n){return matchSet.has(n.id)?1:0.1;})
            .attr('fill',function(n){return matchSet.has(n.id)?'var(--acc)':getNodeColor(n);});
        linksRef.current.transition().duration(200)
            .attr('stroke-opacity',function(l){var s=l.source.id||l.source,t=l.target.id||l.target;return matchSet.has(s)&&matchSet.has(t)?0.6:0.03;})
            .attr('stroke',theme==='light'?'#ccc':'#333');
    },[nlFilter,data]);

    var health=useMemo(function(){return calcHealth(data);},[data]);

    // #38 Snapshot diff — compare new analysis against previous
    var snapshotDiff=useMemo(function(){
        var prev=prevDataRef.current;
        if(!data||!prev)return null;
        var prevPaths=new Set((prev.files||[]).map(function(f){return f.path;}));
        var newPaths=new Set((data.files||[]).map(function(f){return f.path;}));
        var added=(data.files||[]).filter(function(f){return!prevPaths.has(f.path);}).map(function(f){return f.path;});
        var removed=(prev.files||[]).filter(function(f){return!newPaths.has(f.path);}).map(function(f){return f.path;});
        // CC regressions: functions where CC increased by >2
        var prevFnCC=Object.create(null);
        (prev.files||[]).forEach(function(f){(f.functions||[]).forEach(function(fn){prevFnCC[f.path+'|'+fn.name]=fn.cc||1;});});
        var ccRegressions=[];
        (data.files||[]).forEach(function(f){(f.functions||[]).forEach(function(fn){var k=f.path+'|'+fn.name;var oldCC=prevFnCC[k];if(oldCC&&(fn.cc||1)-oldCC>2)ccRegressions.push({name:fn.name,file:f.path,oldCC:oldCC,newCC:fn.cc||1});});});
        // New security issues
        var prevSecKeys=new Set((prev.securityIssues||[]).map(function(i){return i.path+'|'+i.line+'|'+i.title;}));
        var newSecIssues=(data.securityIssues||[]).filter(function(i){return!prevSecKeys.has(i.path+'|'+i.line+'|'+i.title);});
        // New circular deps
        var prevCirc=new Set((prev.circularDeps||[]).map(function(g){return g.join('>');}));
        var newCirc=(data.circularDeps||[]).filter(function(g){return!prevCirc.has(g.join('>'));});
        if(!added.length&&!removed.length&&!ccRegressions.length&&!newSecIssues.length&&!newCirc.length)return null;
        return{added:added,removed:removed,ccRegressions:ccRegressions.slice(0,10),newSecIssues:newSecIssues.slice(0,10),newCirc:newCirc.slice(0,5)};
    },[data]);

    useEffect(function(){
        if(data){
            if(prevDataRef.current)setShowSnapshotDiff(true);
            prevDataRef.current=data;
        }
    },[data]);

    return React.createElement('div',{className:'app',style:{'--topbar-height':topbarHeight+'px'}},
        React.createElement('input',{ref:zipInputRef,type:'file',accept:'.zip,application/zip,application/x-zip-compressed',style:{display:'none'},onChange:handleZipSelected}),
        React.createElement('input',{ref:folderInputRef,type:'file',webkitdirectory:'',directory:'',mozdirectory:'',multiple:true,style:{display:'none'},onChange:handleFolderSelected}),
        React.createElement(AppTopbar,{data:data,loading:loading,repoUrl:repoUrl,setRepoUrl:setRepoUrl,analyze:analyze,refreshAnalysis:refreshAnalysis,resetAnalysis:resetAnalysis,token:token,setToken:setToken,authMethod:authMethod,setAuthMethod:setAuthMethod,appId:appId,setAppId:setAppId,privateKey:privateKey,setShowKeyModal:setShowKeyModal,openExcludeModal:openExcludeModal,openLocalFolder:openLocalFolder,openLocalZip:openLocalZip,customExcludeCount:customExcludeCount,copyLink:copyLink,setShowPR:setShowPR,setShowExport:setShowExport,setShowPrivacy:setShowPrivacy,setShowVAPT:setShowVAPT,setShowRoutes:setShowRoutes,setShowComponents:setShowComponents,nlFilter:nlFilter,setNlFilter:setNlFilter,theme:theme,setTheme:setTheme,isMobile:isMobile,mobilePanel:mobilePanel,toggleMobilePanel:toggleMobilePanel,topbarRef:topbarRef,localSourceKind:localSourceKind,selected:selected}),
        React.createElement('div',{className:'main'},
            isMobile&&React.createElement('button',{type:'button',className:'mobile-panel-backdrop'+(mobilePanel?' visible':''),'aria-label':'Close mobile panel',onClick:function(){setMobilePanel(null);}}),
            React.createElement(AppSidebar,{data:data,isMobile:isMobile,mobilePanel:mobilePanel,folderFilter:folderFilter,health:health,colorMode:colorMode,setColorMode:setColorMode,expandedPaths:expandedPaths,togglePath:togglePath,selected:selected,selectFile:selectFile,setBlastRadius:setBlastRadius,setFolderFilter:setFolderFilter,filterByFolder:filterByFolder,setMobilePanel:setMobilePanel,graphConfig:graphConfig,repoInfo:repoInfo,sidebarWidth:sidebarWidth,setSidebarWidth:setSidebarWidth,folderInputRef:folderInputRef,colorMap:colorMap,setShowUnused:setShowUnused}),
            React.createElement(AppCanvas,{loading:loading,progress:progress,data:data,setRepoUrl:setRepoUrl,analyze:analyze,graphConfig:graphConfig,setGraphConfig:setGraphConfig,setSelected:setSelected,setBlastRadius:setBlastRadius,svgRef:svgRef,graph3dRef:graph3dRef,treemapRef:treemapRef,matrixRef:matrixRef,dendroRef:dendroRef,sankeyRef:sankeyRef,disjointRef:disjointRef,bundleRef:bundleRef,chordRef:chordRef,showGraphConfig:showGraphConfig,setShowGraphConfig:setShowGraphConfig,zoomIn:zoomIn,zoomOut:zoomOut,resetZoom:resetZoom,fitView:fitView,folderFilter:folderFilter,selected:selected,blastRadius:blastRadius,colorMode:colorMode,colorMap:colorMap,legendCollapsed:legendCollapsed,setLegendCollapsed:setLegendCollapsed,filterByFolder:filterByFolder,renderArchitectureView:renderArchitectureView,tooltip:tooltip,communities:communities}),
            React.createElement(AppRightPanel,{isMobile:isMobile,mobilePanel:mobilePanel,setMobilePanel:setMobilePanel,rightPanelWidth:rightPanelWidth,setRightPanelWidth:setRightPanelWidth,data:data,selected:selected,selectFile:selectFile,setSelected:setSelected,setBlastRadius:setBlastRadius,rightTab:rightTab,setRightTab:setRightTab,drillDown:drillDown,setDrillDown:setDrillDown,graphConfig:graphConfig,expandedCards:expandedCards,toggleCard:toggleCard,blastRadius:blastRadius,ownerLoading:ownerLoading,ownership:ownership,expandedFns:expandedFns,toggleFn:toggleFn,nodesRef:nodesRef,linksRef:linksRef,getNodeColor:getNodeColor,theme:theme,architectureIncludeTests:architectureIncludeTests,architectureIncludeBuildOutput:architectureIncludeBuildOutput,setArchitectureIncludeTests:setArchitectureIncludeTests,setArchitectureIncludeBuildOutput:setArchitectureIncludeBuildOutput,openFilePreview:openFilePreview,setShowUnused:setShowUnused,osvData:osvData,osvLoading:osvLoading,osvProgress:osvProgress,communities:communities})
        ),
        data&&React.createElement('div',{className:'status-bar'},
            React.createElement('span',{className:'status-live'},'Live'),
            React.createElement('span',null,data.stats.files,' files'),
            React.createElement('span',{className:'status-sep'},'·'),
            React.createElement('span',null,data.issues.length,' issues'),
            React.createElement('span',{className:'status-sep'},'·'),
            React.createElement('span',null,data.stats.security,' security'),
            React.createElement('span',{className:'status-sep'},'·'),
            React.createElement('span',null,data.stats.functions,' functions'),
            data.stats.loc&&React.createElement(React.Fragment,null,
                React.createElement('span',{className:'status-sep'},'·'),
                React.createElement('span',null,data.stats.loc.toLocaleString(),' LOC')
            ),
            graphConfig.vizType==='graph3d'&&React.createElement('span',{className:'status-chip status-chip--webgl'},'WebGL active'),
            data.files.length>300&&React.createElement('span',{className:'status-chip status-chip--perf'},'⚡ Performance mode'),
            osvLoading&&React.createElement('span',{className:'status-chip status-chip--scanning'},'Scanning deps…'),
            !osvLoading&&osvData&&osvData.totalVulns>0&&React.createElement('span',{className:'status-chip status-chip--vuln',title:osvData.totalPkgs+' vulnerable packages'},osvData.totalVulns+' CVEs')
        ),
        React.createElement(AppOverlays,{showExport:showExport,setShowExport:setShowExport,showVAPT:showVAPT,setShowVAPT:setShowVAPT,showRoutes:showRoutes,setShowRoutes:setShowRoutes,showComponents:showComponents,setShowComponents:setShowComponents,showSnapshotDiff:showSnapshotDiff,setShowSnapshotDiff:setShowSnapshotDiff,snapshotDiff:snapshotDiff,osvData:osvData,data:data,graphConfig:graphConfig,architectureIncludeTests:architectureIncludeTests,architectureIncludeBuildOutput:architectureIncludeBuildOutput,architectureRenderRef:architectureRenderRef,svgRef:svgRef,zoomRef:zoomRef,computeGraphFitTransform:computeGraphFitTransform,graph3dRef:graph3dRef,sankeyRef:sankeyRef,treemapRef:treemapRef,matrixRef:matrixRef,dendroRef:dendroRef,disjointRef:disjointRef,bundleRef:bundleRef,copyLink:copyLink,showNotification:showNotification,localSourceKind:localSourceKind,repoInfo:repoInfo,showExcludeModal:showExcludeModal,excludePatternDraft:excludePatternDraft,setExcludePatternDraft:setExcludePatternDraft,closeExcludeModal:closeExcludeModal,saveExcludePatterns:saveExcludePatterns,showPR:showPR,setShowPR:setShowPR,prUrl:prUrl,setPrUrl:setPrUrl,prData:prData,analyzePR:analyzePR,isMobile:isMobile,mobilePanel:mobilePanel,toggleMobilePanel:toggleMobilePanel,drillDown:drillDown,setDrillDown:setDrillDown,selectFile:selectFile,openFilePreview:openFilePreview,selected:selected,showPrivacy:showPrivacy,setShowPrivacy:setShowPrivacy,showKeyModal:showKeyModal,privateKey:privateKey,setPrivateKey:setPrivateKey,setShowKeyModal:setShowKeyModal,showUnused:showUnused,setShowUnused:setShowUnused,expandedFns:expandedFns,toggleFn:toggleFn,setExpandedFns:setExpandedFns,confirmDialog:confirmDialog,closeConfirmDialog:closeConfirmDialog,toast:toast,filePreview:filePreview,filePreviewRef:filePreviewRef,setFilePreview:setFilePreview,highlightSyntax:highlightSyntax,error:error,setError:setError})
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ErrorBoundary,null,React.createElement(App)));
