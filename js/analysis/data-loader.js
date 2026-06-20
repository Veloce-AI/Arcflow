/* analysis/data-loader.js - Repository/folder/ZIP analysis and file preview loaders */

// URL parsing utility (pure — no closures)
    function parseUrl(url){
        if(!url||typeof url!=='string')return null;
        url=url.trim();
        if(url.length>200||url.includes('{')|| url.includes('"'))return null;
        var m=url.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
        if(m)return{owner:m[1],repo:m[2].replace(/\.git$/,'')};
        var simple=url.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
        if(simple)return{owner:simple[1],repo:simple[2]};
        return null;
    }

function loaderAnalyze(params,ctx){
    var repoUrl=params.repoUrl,token=params.token,authMethod=params.authMethod,appId=params.appId,privateKey=params.privateKey,activeExcludePatterns=params.activeExcludePatterns;
    var setLoading=ctx.setLoading,setProgress=ctx.setProgress,setError=ctx.setError,setData=ctx.setData,setRepoInfo=ctx.setRepoInfo,setExpandedPaths=ctx.setExpandedPaths,setLocalSourceKind=ctx.setLocalSourceKind,setLocalDirHandle=ctx.setLocalDirHandle,zipArchiveRef=ctx.zipArchiveRef,zipFileRef=ctx.zipFileRef,resetAnalysisState=ctx.resetAnalysisState,requestConfirm=ctx.requestConfirm,showNotification=ctx.showNotification;
        var p=parseUrl(repoUrl);
        if(!p){setError('Invalid URL. Use format: owner/repo');return;}
        var currentExcludePatterns=activeExcludePatterns;
        
        // Validate authentication inputs
        if(authMethod==='pat'&&!token){
            setError('Please enter a Personal Access Token');return;
        }
        if(authMethod==='github_app'){
            if(!appId){setError('Please enter the GitHub App ID');return;}
            if(!privateKey){setError('Please set the GitHub App private key');return;}
        }
        
        resetAnalysisState();
        setLocalDirHandle(null);
        setLocalSourceKind(null);
        zipArchiveRef.current=null;
        zipFileRef.current=null;
        setLoading(true);
        setProgress('Initializing...');
        
        // Configure GitHub authentication based on method
        GitHub.token=null;
        GitHub.appId=null;
        GitHub.privateKey=null;
        GitHub.installationToken=null;
        
        if(authMethod==='pat'){
            GitHub.token=token;
        }else if(authMethod==='github_app'){
            GitHub.appId=appId;
            GitHub.privateKey=privateKey;
        }
        
        setRepoInfo(p);

        // Authentication promise - resolve immediately for no auth/PAT, authenticate for GitHub App
        var authPromise;
        if(authMethod==='github_app'){
            setProgress('Authenticating with GitHub App...');
            authPromise=GitHub.authenticateApp(p.owner,p.repo).catch(function(err){
                throw new Error('GitHub App authentication failed: '+err.message);
            });
        }else{
            authPromise=Promise.resolve();
        }
        
        authPromise.then(function(){
            setProgress('Loading language parsers...');
            return Parser.initTreeSitter().catch(function(){return null;});
        }).then(function(){
            setProgress('Checking rate limit...');
            return GitHub.getRateLimit();
        }).then(function(rl){
            var hasAuth=!!GitHub.token||authMethod==='github_app';
            var estimatedRequests=50;// Conservative estimate for a small-medium repo

            // Warn if rate limit is very low and no authentication
            if(!hasAuth&&rl.remaining<estimatedRequests){
                var resetTime=new Date(rl.reset*1000).toLocaleTimeString();
                return requestConfirm({
                    tone:'warning',
                    icon:'warning',
                    title:'GitHub API rate limit is low',
                    message:
                        'Remaining requests: '+rl.remaining+'/'+rl.limit+'\n'+
                        'Resets at: '+resetTime+'\n\n'+
                        'Without authentication, you only get 60 requests per hour.\n'+
                        'Adding a token or GitHub App raises that to 5,000 requests per hour.\n\n'+
                        'Token (PAT): GitHub Settings -> Developer Settings -> Personal access tokens\n'+
                        'GitHub App: use App ID + Private Key for organization access\n\n'+
                        'Continue anyway with the remaining requests?',
                    confirmLabel:'Continue anyway'
                }).then(function(proceed){
                    if(!proceed){
                        setLoading(false);
                        return Promise.reject('cancelled');
                    }
                    setProgress('Scanning repository...');
                    return GitHub.scan(p.owner,p.repo,setProgress,currentExcludePatterns);
                });
            }

            setProgress('Scanning repository...');
            return GitHub.scan(p.owner,p.repo,setProgress,currentExcludePatterns);
        }).then(function(files){
            if(!files)return;// Cancelled
            if(!files.length)throw new Error(currentExcludePatterns.length?'No code files found after applying exclude patterns':'No code files found');
            var SOFT_LIMIT=ANALYSIS_LIMITS.repoSoft,HARD_LIMIT=ANALYSIS_LIMITS.repoMax;
            function beginRepoAnalysis(){
                if(files.length>HARD_LIMIT){
                    showNotification('Found '+files.length+' files. Using a '+HARD_LIMIT+'-file API sample. Use Open ZIP for full analysis.','warning');
                }
                var max=Math.min(files.length,HARD_LIMIT);
                var analyzed=[];
                var allFns=[];

                function processFile(i){
                    if(i>=max){finishAnalysis();return;}
                    var f=files[i];
                    setProgress('Analyzing '+(i+1)+'/'+max+': '+f.name);
                    var isCodeFile=f.isCode!==false&&Parser.isCode(f.name);
                    if(isCodeFile){
                        Promise.all([
                            GitHub.getFile(p.owner,p.repo,f.path),
                            GitHub.getCommits(p.owner,p.repo,f.path,10).catch(function(){return[];})
                        ]).then(function(results){
                            var content=results[0];
                            var commits=results[1];
                            if(content){
                                var layer=Parser.detectLayer(f.path);
                                var actualIsCode=!Parser.isScriptContainer(f.path)||Parser.hasEmbeddedCode(content,f.path);
                                var fns=actualIsCode?Parser.extract(content,f.path):[];
                                analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content,functions:fns,lines:content.split('\n').length,layer:layer,churn:Array.isArray(commits)?commits.length:0,lastCommit:Array.isArray(commits)&&commits[0]?commits[0].commit.author.date:null,isCode:actualIsCode});
                                if(actualIsCode){
                                    fns.forEach(function(fn){allFns.push(Object.assign({},fn,{folder:f.folder,layer:layer}));});
                                }
                            }
                            processFile(i+1);
                        }).catch(function(){processFile(i+1);});
                    }else{
                        GitHub.getFile(p.owner,p.repo,f.path).then(function(content){
                            var layer=Parser.detectLayer(f.path);
                            var lines=content?content.split('\n').length:0;
                            analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content||'',functions:[],lines:lines,layer:layer,churn:0,isCode:false});
                            processFile(i+1);
                        }).catch(function(){
                            analyzed.push({path:f.path,name:f.name,folder:f.folder,content:'',functions:[],lines:0,layer:Parser.detectLayer(f.path),churn:0,isCode:false});
                            processFile(i+1);
                        });
                    }
                }

                async function finishAnalysis(){
                    try{
                        var dataObj=await runAnalysisData({
                            analyzed:analyzed,
                            allFns:allFns,
                            excludePatterns:currentExcludePatterns.map(function(x){return x.raw;}),
                            progress:setProgress,
                            yieldFn:yieldToBrowser
                        });
                        setData(dataObj);
                        setExpandedPaths(new Set(['']));
                        window.history.replaceState({},'',buildAppUrl(p.owner+'/'+p.repo,false));
                        setLoading(false);
                    }catch(err){
                        setError('Analysis failed: '+(err.message||err)+'. Try a smaller repository.');
                        setLoading(false);
                    }
                }

                processFile(0);
                return null;
            }

            if(files.length>SOFT_LIMIT&&files.length<=HARD_LIMIT){
                return requestConfirm({
                    tone:'warning',
                    icon:'warning',
                    title:'Analyze a large repository?',
                    message:
                        'This repository has '+files.length+' files.\n\n'+
                        'Analyzing larger repositories can take longer and may hit GitHub API rate limits.\n\n'+
                        'Tip: add a token or GitHub App for higher limits.',
                    confirmLabel:'Analyze repository'
                }).then(function(proceed){
                    if(!proceed){
                        setLoading(false);
                        return Promise.reject('cancelled');
                    }
                    return beginRepoAnalysis();
                });
            }

            if(files.length>HARD_LIMIT){
                return requestConfirm({
                    tone:'warning',
                    icon:'archive',
                    title:'Analyze a GitHub API sample?',
                    message:
                        'This GitHub repository has '+files.length+' analyzable files.\n\n'+
                        'The browser cannot read GitHub zipball archives directly because GitHub redirects archive downloads to a CORS-restricted host.\n\n'+
                        'For full analysis: download the repository ZIP from GitHub, then use Open ZIP in Arcflow.\n\n'+
                        'Continue now with a '+HARD_LIMIT+'-file API sample?',
                    confirmLabel:'Analyze sample'
                }).then(function(proceed){
                    if(!proceed){
                        setLoading(false);
                        return Promise.reject('cancelled');
                    }
                    return beginRepoAnalysis();
                });
            }

            return beginRepoAnalysis();
        }).catch(function(e){if(e!=='cancelled'){setError(e.message||e);setLoading(false);}});
    }

async function loaderReadLocalFolder(dirHandle,compiledPatterns,ctx){
    var setLoading=ctx.setLoading,setProgress=ctx.setProgress,setError=ctx.setError,setData=ctx.setData,setRepoInfo=ctx.setRepoInfo,setExpandedPaths=ctx.setExpandedPaths,requestConfirm=ctx.requestConfirm,activeExcludePatterns=ctx.activeExcludePatterns;
        var files=[];
        var SOFT_LIMIT=ANALYSIS_LIMITS.localSoft;
        var fileCount=0;
        setProgress('Loading language parsers...');
        await Parser.initTreeSitter().catch(function(){return null;});
        setProgress('Scanning local folder...');

        async function readDirectory(handle, currentPath){
            for await (const entry of handle.values()){
                var entryPath=currentPath?currentPath+'/'+entry.name:entry.name;
                if(entry.kind==='directory'){
                    if(!shouldIgnoreDirectory(entryPath,entry.name,compiledPatterns)){
                        await readDirectory(entry,entryPath);
                    }
                }else if(entry.kind==='file'){
                    var name=entry.name;
                    if(shouldExcludeFile(entryPath,name,compiledPatterns))continue;
                    var folder=currentPath||'root';
                    fileCount++;
                    files.push({path:entryPath,name:name,folder:folder,size:0,isCode:Parser.isCode(name),handle:entry});
                    if(fileCount%50===0){
                        setProgress('Scanning files... '+fileCount+' found');
                    }
                }
            }
        }

        await readDirectory(dirHandle,'');
        
        if(fileCount>SOFT_LIMIT){
            var proceed=await requestConfirm({
                tone:'warning',
                icon:'folder',
                title:'Analyze '+fileCount+' files?',
                message:
                    'This folder has '+fileCount+' analyzable files.\n\n'+
                    'Arcflow will analyze every eligible file. Large folders can take minutes and use significant browser memory.\n\n'+
                    'Continue with all '+fileCount+' files?',
                confirmLabel:'Analyze all files'
            });
            if(!proceed){setLoading(false);return;}
        }
        var max=files.length;
        var analyzed=[];
        var allFns=[];

        async function processFile(i){
            if(i>=max){await finishAnalysis();return;}
            var f=files[i];
            // Yield to browser every 50 files to keep UI responsive
            if(i>0&&i%50===0)await yieldToBrowser();
            setProgress('Analyzing '+(i+1)+'/'+max+': '+f.name);
            var isCodeFile=f.isCode!==false&&Parser.isCode(f.name);
            
            try{
                var fileHandle=f.handle;
                if(isCodeFile){
                    var fileObj=await fileHandle.getFile();
                    var content=await fileObj.text();
                    var layer=Parser.detectLayer(f.path);
                    var actualIsCode=!Parser.isScriptContainer(f.path)||Parser.hasEmbeddedCode(content,f.path);
                    var fns=actualIsCode?Parser.extract(content,f.path):[];
                    analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content,functions:fns,lines:content.split('\n').length,layer:layer,churn:0,isCode:actualIsCode});
                    if(actualIsCode){
                        fns.forEach(function(fn){allFns.push(Object.assign({},fn,{folder:f.folder,layer:layer}));});
                    }
                    processFile(i+1);
                }else{
                    var fileObj=await fileHandle.getFile();
                    var content=await fileObj.text();
                    var layer=Parser.detectLayer(f.path);
                    var lines=content?content.split('\n').length:0;
                    analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content||'',functions:[],lines:lines,layer:layer,churn:0,isCode:false});
                    processFile(i+1);
                }
            }catch(e){
                analyzed.push({path:f.path,name:f.name,folder:f.folder,content:'',functions:[],lines:0,layer:Parser.detectLayer(f.path),churn:0,isCode:false});
                processFile(i+1);
            }
        }

        async function finishAnalysis(){
            try{
                var dataObj=await runAnalysisData({
                    analyzed:analyzed,
                    allFns:allFns,
                    excludePatterns:(compiledPatterns||[]).map(function(x){return x.raw;}),
                    progress:setProgress,
                    yieldFn:yieldToBrowser
                });
                setData(dataObj);
                setExpandedPaths(new Set(['']));
                setRepoInfo({owner:'local',repo:'folder',name:dirHandle.name||'Folder'});
                setLoading(false);
            }catch(err){
                setError('Analysis failed: '+(err.message||err)+'. Try a smaller folder or subfolder.');
                setLoading(false);
            }
        }

        if(files.length===0){
            setError((compiledPatterns&&compiledPatterns.length)?'No code files found in the selected folder after applying exclude patterns':'No code files found in the selected folder');
            setLoading(false);
            return;
        }

        processFile(0);
    }

async function loaderReadLocalFolderFromFiles(fileObjs,compiledPatterns,ctx){
    var setLoading=ctx.setLoading,setProgress=ctx.setProgress,setError=ctx.setError,setData=ctx.setData,setRepoInfo=ctx.setRepoInfo,setExpandedPaths=ctx.setExpandedPaths,requestConfirm=ctx.requestConfirm,activeExcludePatterns=ctx.activeExcludePatterns;
        var patterns=compiledPatterns||activeExcludePatterns;
        var SOFT_LIMIT=ANALYSIS_LIMITS.localSoft;
        try{
            setProgress('Loading language parsers...');
            await Parser.initTreeSitter().catch(function(){return null;});
            setProgress('Scanning local folder...');
            var rawPaths=fileObjs.map(function(f){return f.webkitRelativePath||f.name;});
            var rootPrefix=getArchiveRootPrefix(rawPaths);
            var files=[];
            var fileCount=0;
            var dirCache=new Map();

            fileObjs.forEach(function(fileObj){
                var rawPath=normalizeExcludePath(fileObj.webkitRelativePath||fileObj.name);
                if(!rawPath||rawPath.endsWith('/'))return;
                var entryPath=rootPrefix&&rawPath.indexOf(rootPrefix)===0?rawPath.slice(rootPrefix.length):rawPath;
                entryPath=normalizeExcludePath(entryPath);
                if(!entryPath||shouldSkipArchivePath(entryPath,patterns,dirCache))return;
                var parts=entryPath.split('/').filter(Boolean);
                var name=parts[parts.length-1]||'';
                if(!name||name==='.DS_Store'||shouldExcludeFile(entryPath,name,patterns))return;
                var folder=parts.length>1?parts.slice(0,-1).join('/'):'root';
                fileCount++;
                files.push({path:entryPath,name:name,folder:folder,size:fileObj.size||0,isCode:Parser.isCode(name),file:fileObj});
                if(fileCount%50===0){
                    setProgress('Scanning files... '+fileCount+' found');
                }
            });

            if(fileCount===0){
                setError(patterns&&patterns.length?'No code files found in the selected folder after applying exclude patterns':'No code files found in the selected folder');
                setLoading(false);
                return;
            }

            if(fileCount>SOFT_LIMIT){
                var proceed=await requestConfirm({
                    tone:'warning',
                    icon:'folder',
                    title:'Analyze '+fileCount+' files?',
                    message:
                        'This folder has '+fileCount+' analyzable files.\n\n'+
                        'Arcflow will analyze every eligible file. Large folders can take minutes and use significant browser memory.\n\n'+
                        'Continue with all '+fileCount+' files?',
                    confirmLabel:'Analyze all files'
                });
                if(!proceed){setLoading(false);return;}
            }

            var max=files.length;
            var analyzed=[];
            var allFns=[];
            for(var i=0;i<max;i++){
                var f=files[i];
                if(i>0&&i%50===0)await yieldToBrowser();
                setProgress('Analyzing '+(i+1)+'/'+max+': '+f.name);
                var isCodeFile=f.isCode!==false&&Parser.isCode(f.name);
                try{
                    var content=await f.file.text();
                    var layer=Parser.detectLayer(f.path);
                    if(isCodeFile){
                        var actualIsCode=!Parser.isScriptContainer(f.path)||Parser.hasEmbeddedCode(content,f.path);
                        var fns=actualIsCode?Parser.extract(content,f.path):[];
                        analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content,functions:fns,lines:content.split('\n').length,layer:layer,churn:0,isCode:actualIsCode});
                        if(actualIsCode){
                            fns.forEach(function(fn){allFns.push(Object.assign({},fn,{folder:f.folder,layer:layer}));});
                        }
                    }else{
                        analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content||'',functions:[],lines:content?content.split('\n').length:0,layer:layer,churn:0,isCode:false});
                    }
                }catch(e){
                    analyzed.push({path:f.path,name:f.name,folder:f.folder,content:'',functions:[],lines:0,layer:Parser.detectLayer(f.path),churn:0,isCode:false});
                }
            }

            var dataObj=await runAnalysisData({
                analyzed:analyzed,
                allFns:allFns,
                excludePatterns:(patterns||[]).map(function(x){return x.raw;}),
                progress:setProgress,
                yieldFn:yieldToBrowser
            });
            setData(dataObj);
            setExpandedPaths(new Set(['']));
            var folderName=rootPrefix?rootPrefix.replace(/\/+$/,''):(fileObjs[0]&&fileObjs[0].webkitRelativePath?fileObjs[0].webkitRelativePath.split('/')[0]:'Folder');
            setRepoInfo({owner:'local',repo:'folder',name:folderName||'Folder'});
            setLoading(false);
        }catch(err){
            setError('Analysis failed: '+(err.message||err)+'. Try a smaller folder or subfolder.');
            setLoading(false);
        }
    }

async function loaderReadZipArchive(zipFile,compiledPatterns,ctx){
    var setLoading=ctx.setLoading,setProgress=ctx.setProgress,setError=ctx.setError,setData=ctx.setData,setRepoInfo=ctx.setRepoInfo,setExpandedPaths=ctx.setExpandedPaths,setLocalSourceKind=ctx.setLocalSourceKind,setLocalDirHandle=ctx.setLocalDirHandle,zipArchiveRef=ctx.zipArchiveRef,zipFileRef=ctx.zipFileRef,requestConfirm=ctx.requestConfirm,activeExcludePatterns=ctx.activeExcludePatterns;
        var patterns=compiledPatterns||activeExcludePatterns;
        var SOFT_LIMIT=ANALYSIS_LIMITS.localSoft;
        try{
            if(!window.JSZip)throw new Error('ZIP support failed to load');
            setProgress('Loading language parsers...');
            await Parser.initTreeSitter().catch(function(){return null;});
            setProgress('Reading ZIP archive...');
            var zip=await JSZip.loadAsync(zipFile);
            var rawEntries=Object.keys(zip.files).sort().map(function(name){return zip.files[name];}).filter(function(entry){return entry&&!entry.dir;});
            var rootPrefix=getArchiveRootPrefix(rawEntries.map(function(entry){return entry.name;}));
            var files=[];
            var entriesByPath=Object.create(null);
            var fileCount=0;
            var dirCache=new Map();

            rawEntries.forEach(function(entry){
                var rawPath=normalizeExcludePath(entry.name);
                if(!rawPath||rawPath.endsWith('/'))return;
                var entryPath=rootPrefix&&rawPath.indexOf(rootPrefix)===0?rawPath.slice(rootPrefix.length):rawPath;
                entryPath=normalizeExcludePath(entryPath);
                if(!entryPath||shouldSkipArchivePath(entryPath,patterns,dirCache))return;
                var parts=entryPath.split('/').filter(Boolean);
                var name=parts[parts.length-1]||'';
                if(!name||name==='.DS_Store'||shouldExcludeFile(entryPath,name,patterns))return;
                var folder=parts.length>1?parts.slice(0,-1).join('/'):'root';
                fileCount++;
                files.push({path:entryPath,name:name,folder:folder,size:entry._data&&entry._data.uncompressedSize?entry._data.uncompressedSize:0,isCode:Parser.isCode(name),entry:entry});
                entriesByPath[entryPath]=entry;
            });

            if(fileCount===0){
                setError(patterns&&patterns.length?'No code files found in the ZIP archive after applying exclude patterns':'No code files found in the ZIP archive');
                setLoading(false);
                return;
            }

            if(fileCount>SOFT_LIMIT){
                var proceed=await requestConfirm({
                    tone:'warning',
                    icon:'archive',
                    title:'Analyze '+fileCount+' files?',
                    message:
                        'This ZIP archive has '+fileCount+' analyzable files.\n\n'+
                        'Arcflow will analyze every eligible file. Large archives can take minutes and use significant browser memory.\n\n'+
                        'Continue with all '+fileCount+' files?',
                    confirmLabel:'Analyze all files'
                });
                if(!proceed){setLocalSourceKind(null);zipFileRef.current=null;setLoading(false);return;}
            }

            zipArchiveRef.current={zip:zip,entriesByPath:entriesByPath,name:zipFile.name};
            zipFileRef.current=zipFile;
            setLocalDirHandle(null);
            setLocalSourceKind('zip');

            var max=files.length;
            var analyzed=[];
            var allFns=[];
            for(var i=0;i<max;i++){
                var f=files[i];
                if(i>0&&i%50===0)await yieldToBrowser();
                setProgress('Analyzing '+(i+1)+'/'+max+': '+f.name);
                var isCodeFile=f.isCode!==false&&Parser.isCode(f.name);
                try{
                    var content=await f.entry.async('string');
                    var layer=Parser.detectLayer(f.path);
                    if(isCodeFile){
                        var actualIsCode=!Parser.isScriptContainer(f.path)||Parser.hasEmbeddedCode(content,f.path);
                        var fns=actualIsCode?Parser.extract(content,f.path):[];
                        analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content,functions:fns,lines:content.split('\n').length,layer:layer,churn:0,isCode:actualIsCode});
                        if(actualIsCode){
                            fns.forEach(function(fn){allFns.push(Object.assign({},fn,{folder:f.folder,layer:layer}));});
                        }
                    }else{
                        analyzed.push({path:f.path,name:f.name,folder:f.folder,content:content||'',functions:[],lines:content?content.split('\n').length:0,layer:layer,churn:0,isCode:false});
                    }
                }catch(e){
                    analyzed.push({path:f.path,name:f.name,folder:f.folder,content:'',functions:[],lines:0,layer:Parser.detectLayer(f.path),churn:0,isCode:false});
                }
            }

            var dataObj=await runAnalysisData({
                analyzed:analyzed,
                allFns:allFns,
                excludePatterns:(patterns||[]).map(function(x){return x.raw;}),
                progress:setProgress,
                yieldFn:yieldToBrowser
            });
            setData(dataObj);
            setExpandedPaths(new Set(['']));
            setRepoInfo({owner:'local',repo:'zip',name:zipFile.name});
            setLoading(false);
        }catch(err){
            setLocalSourceKind(null);
            zipArchiveRef.current=null;
            setError('Failed to analyze ZIP archive: '+(err.message||err));
            setLoading(false);
        }
    }

function loaderOpenFilePreview(path,line,ctx){
    var repoInfo=ctx.repoInfo,data=ctx.data,localSourceKind=ctx.localSourceKind,localDirHandle=ctx.localDirHandle,setFilePreview=ctx.setFilePreview,zipArchiveRef=ctx.zipArchiveRef;
        if(!repoInfo)return;
        var filename=path.split('/').pop();
        setFilePreview({path:path,filename:filename,content:null,line:line||null,loading:true,error:null});
        // Check if we already have the content in data
        if(data){
            var existingFile=data.files.find(function(f){return f.path===path;});
            if(existingFile&&existingFile.content){
                setFilePreview({path:path,filename:filename,content:existingFile.content,line:line||null,loading:false,error:null});
                return;
            }
        }
        // Fetch from GitHub, local directory, or ZIP archive
        if(localSourceKind==='folder'&&localDirHandle){
            // Read from a local directory using async traversal
            (async function(){
                try{
                    var parts=path.split('/');
                    var currentHandle=localDirHandle;
                    for(var i=0;i<parts.length-1;i++){
                        currentHandle=await currentHandle.getDirectoryHandle(parts[i]);
                    }
                    var fileHandle=await currentHandle.getFileHandle(parts[parts.length-1]);
                    var fileObj=await fileHandle.getFile();
                    var content=await fileObj.text();
                    setFilePreview({path:path,filename:filename,content:content,line:line||null,loading:false,error:null});
                }catch(e){
                    setFilePreview({path:path,filename:filename,content:null,line:line||null,loading:false,error:e.message||'Failed to load file'});
                }
            })();
        }else if(localSourceKind==='zip'){
            (async function(){
                try{
                    var archive=zipArchiveRef.current;
                    var entry=archive&&archive.entriesByPath?archive.entriesByPath[path]:null;
                    if(!entry)throw new Error('File is not available in the loaded ZIP archive');
                    var content=await entry.async('string');
                    setFilePreview({path:path,filename:filename,content:content,line:line||null,loading:false,error:null});
                }catch(e){
                    setFilePreview({path:path,filename:filename,content:null,line:line||null,loading:false,error:e.message||'Failed to load ZIP file'});
                }
            })();
        }else{
            // Fetch from GitHub
            GitHub.getFile(repoInfo.owner,repoInfo.repo,path).then(function(content){
                if(content){
                    setFilePreview({path:path,filename:filename,content:content,line:line||null,loading:false,error:null});
                }else{
                    setFilePreview({path:path,filename:filename,content:null,line:line||null,loading:false,error:'Could not load file content'});
                }
            }).catch(function(e){
                setFilePreview({path:path,filename:filename,content:null,line:line||null,loading:false,error:e.message||'Failed to load file'});
            });
        }
    }
