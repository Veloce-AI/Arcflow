/* topbar.js - AppTopbar component */
function AppTopbar(props){
    var data=props.data;
    var loading=props.loading;
    var repoUrl=props.repoUrl; var setRepoUrl=props.setRepoUrl;
    var analyze=props.analyze;
    var refreshAnalysis=props.refreshAnalysis;
    var resetAnalysis=props.resetAnalysis;
    var token=props.token; var setToken=props.setToken;
    var authMethod=props.authMethod; var setAuthMethod=props.setAuthMethod;
    var appId=props.appId; var setAppId=props.setAppId;
    var privateKey=props.privateKey;
    var setShowKeyModal=props.setShowKeyModal;
    var openExcludeModal=props.openExcludeModal;
    var openLocalFolder=props.openLocalFolder;
    var openLocalZip=props.openLocalZip;
    var customExcludeCount=props.customExcludeCount;
    var copyLink=props.copyLink;
    var setShowPR=props.setShowPR;
    var setShowExport=props.setShowExport;
    var setShowVAPT=props.setShowVAPT;
    var setShowRoutes=props.setShowRoutes;
    var setShowComponents=props.setShowComponents;
    var nlFilter=props.nlFilter;
    var setNlFilter=props.setNlFilter;
    var setShowPrivacy=props.setShowPrivacy;
    var theme=props.theme; var setTheme=props.setTheme;
    var isMobile=props.isMobile;
    var mobilePanel=props.mobilePanel;
    var toggleMobilePanel=props.toggleMobilePanel;
    var topbarRef=props.topbarRef;
    var localSourceKind=props.localSourceKind;
    var selected=props.selected;
    return React.createElement('div',{className:'topbar',ref:topbarRef},
        isMobile&&React.createElement(React.Fragment,null,
            React.createElement('div',{className:'mobile-brand-row'},
                React.createElement('div',{className:'logo',onClick:function(){setShowPrivacy(true);}},
                    React.createElement('div',{className:'logo-mark'},React.createElement(Icon,{name:'logo',size:'l'})),
                    React.createElement('span',{className:'logo-text'},React.createElement('strong',null,'Arc'),React.createElement('span',{className:'logo-light'},'flow'))
                ),
                React.createElement('div',{className:'mobile-action-stack'},
                    React.createElement('button',{className:'top-btn mobile-icon-btn','aria-label':'Toggle theme',title:'Theme',onClick:function(){setTheme(function(t){return t==='dark'?'light':'dark';});},type:'button'},React.createElement(Icon,{name:theme==='dark'?'sun':'moon',size:'m'}))
                )
            ),
            React.createElement('div',{className:'mobile-source-controls'},
                React.createElement('div',{className:'mobile-primary-row'},
                    React.createElement('input',{className:'repo-input','aria-label':'Repository URL',placeholder:'owner/repo or GitHub URL',value:repoUrl,onChange:function(e){setRepoUrl(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&!loading)analyze();}}),
                    React.createElement('button',{id:'mobile-analyze-btn',className:'top-btn primary mobile-analyze-btn','aria-label':'Analyze repository',title:'Analyze',onClick:analyze,disabled:loading||!repoUrl,type:'button'},
                        React.createElement(Icon,{name:loading?'activity':'search',size:'m'})
                    )
                ),
                React.createElement('div',{className:'mobile-secondary-row'},
                    React.createElement('select',{className:'auth-select','aria-label':'Authentication Method',value:authMethod,onChange:function(e){setAuthMethod(e.target.value);}},
                        React.createElement('option',{value:'none'},'No Auth'),
                        React.createElement('option',{value:'pat'},'Token'),
                        React.createElement('option',{value:'github_app'},'App')
                    ),
                    React.createElement('div',{className:'auth-inputs'},
                        authMethod==='pat'&&React.createElement('input',{className:'repo-input',type:'password','aria-label':'GitHub Token',placeholder:'Personal Access Token',value:token,onChange:function(e){setToken(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&!loading)analyze();}}),
                        authMethod==='github_app'&&React.createElement(React.Fragment,null,
                            React.createElement('input',{className:'repo-input','aria-label':'App ID',placeholder:'App ID',value:appId,onChange:function(e){setAppId(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&!loading)analyze();}}),
                            React.createElement('button',{className:'private-key-btn'+(privateKey?' has-key':''),'aria-label':'Set Private Key',onClick:function(){setShowKeyModal(true);},type:'button'},
                                React.createElement(Icon,{name:privateKey?'key':'shield',size:'m'}),
                                privateKey?'Key':'Private Key'
                            )
                        )
                    ),
                    React.createElement('button',{className:'top-btn','aria-label':'Edit exclude patterns',onClick:function(){openExcludeModal();},disabled:loading,type:'button',style:customExcludeCount?{borderColor:'var(--acc)',color:'var(--acc)'}:null},
                        React.createElement(Icon,{name:'ban',size:'m'}),
                        'Excludes',
                        customExcludeCount>0?' ('+customExcludeCount+')':''
                    ),
                    React.createElement('button',{className:'top-btn','aria-label':'Open local folder',onClick:function(){openLocalFolder();},disabled:loading,type:'button'},
                        React.createElement(Icon,{name:'folder',size:'m'}),
                        'Folder'
                    ),
                    React.createElement('button',{className:'top-btn','aria-label':'Open ZIP archive',onClick:function(){openLocalZip();},disabled:loading,type:'button'},
                        React.createElement(Icon,{name:'archive',size:'m'}),
                        'ZIP'
                    ),
                    data&&React.createElement('button',{className:'refresh-btn','aria-label':'Refresh analysis',onClick:refreshAnalysis,disabled:loading,title:'Refresh Analysis',type:'button'},
                        React.createElement(Icon,{name:'refresh',size:'m'}),
                        'Refresh'
                    ),
                    data&&React.createElement('button',{className:'reset-btn','aria-label':'Reset analysis',onClick:resetAnalysis,title:'Clear & Reset',type:'button'},
                        React.createElement(Icon,{name:'close',size:'m'}),
                        'Reset'
                    )
                )
            )
        ),
        React.createElement('div',{className:'logo',onClick:function(){setShowPrivacy(true);}},
            React.createElement('div',{className:'logo-mark'},React.createElement(Icon,{name:'logo',size:'l'})),
            React.createElement('span',{className:'logo-text'},React.createElement('strong',null,'Arc'),React.createElement('span',{className:'logo-light'},'flow'))
        ),
        React.createElement('div',{className:'repo-input-group'},
            React.createElement('input',{className:'repo-input','aria-label':'Repository URL',placeholder:'owner/repo or GitHub URL',value:repoUrl,onChange:function(e){setRepoUrl(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&!loading)analyze();}}),
            React.createElement('select',{className:'auth-select','aria-label':'Authentication Method',value:authMethod,onChange:function(e){setAuthMethod(e.target.value);}},
                React.createElement('option',{value:'none'},'No Auth'),
                React.createElement('option',{value:'pat'},'Token (PAT)'),
                React.createElement('option',{value:'github_app'},'GitHub App')
            ),
            React.createElement('div',{className:'auth-inputs'},
                authMethod==='pat'&&React.createElement('input',{className:'repo-input',type:'password','aria-label':'GitHub Token',placeholder:'Personal Access Token',value:token,onChange:function(e){setToken(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&!loading)analyze();},style:{minWidth:140}}),
                authMethod==='github_app'&&React.createElement(React.Fragment,null,
                    React.createElement('input',{className:'repo-input','aria-label':'App ID',placeholder:'App ID',value:appId,onChange:function(e){setAppId(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&!loading)analyze();},style:{width:80}}),
                    React.createElement('button',{className:'private-key-btn'+(privateKey?' has-key':''),'aria-label':'Set Private Key',onClick:function(){setShowKeyModal(true);},type:'button'},
                        React.createElement(Icon,{name:privateKey?'key':'shield',size:'m'}),
                        privateKey?'Key Set':'Private Key'
                    )
                )
            ),
            React.createElement('button',{className:'top-btn','aria-label':'Edit exclude patterns',title:'Edit exclude patterns'+(customExcludeCount>0?' ('+customExcludeCount+')':''),onClick:function(){openExcludeModal();},disabled:loading,style:customExcludeCount?{borderColor:'var(--acc)',color:'var(--acc)'}:null},
                React.createElement(Icon,{name:'ban',size:'m'}),
                !data&&'Excludes',
                (!data&&customExcludeCount>0)?' ('+customExcludeCount+')':''
            ),
            React.createElement('button',{id:'analyze-btn',className:'top-btn primary','aria-label':'Analyze repository',title:'Analyze repository',onClick:analyze,disabled:loading||!repoUrl},
                React.createElement(Icon,{name:loading?'activity':'search',size:'m'}),
                !data&&'Analyze'
            ),
            React.createElement('button',{className:'top-btn','aria-label':'Open local folder',title:'Open local folder',onClick:function(){openLocalFolder();},disabled:loading},
                React.createElement(Icon,{name:'folder',size:'m'}),
                !data&&'Open Folder'
            ),
            React.createElement('button',{className:'top-btn','aria-label':'Open ZIP archive',title:'Open ZIP archive',onClick:function(){openLocalZip();},disabled:loading},
                React.createElement(Icon,{name:'archive',size:'m'}),
                !data&&'Open ZIP'
            ),
            data&&React.createElement('button',{className:'refresh-btn','aria-label':'Refresh analysis',onClick:refreshAnalysis,disabled:loading,title:'Refresh Analysis'},
                React.createElement(Icon,{name:'refresh',size:'m'}),
                'Refresh'
            ),
            data&&React.createElement('button',{className:'reset-btn','aria-label':'Reset analysis',onClick:resetAnalysis,title:'Clear & Reset'},
                React.createElement(Icon,{name:'close',size:'m'}),
                'Reset'
            )
        ),
        isMobile&&React.createElement('div',{className:'mobile-panel-actions'},
            React.createElement('button',{className:'top-btn'+(mobilePanel==='explorer'?' active':''),'aria-label':'Toggle explorer panel',onClick:function(){toggleMobilePanel('explorer');},type:'button'},
                React.createElement(Icon,{name:'folder',size:'m'}),
                'Explorer'
            ),
            React.createElement('button',{className:'top-btn'+(mobilePanel==='details'?' active':''),'aria-label':'Toggle details panel',onClick:function(){toggleMobilePanel('details');},disabled:!data,type:'button'},
                React.createElement(Icon,{name:selected?'file':'layout',size:'m'}),
                selected?'Inspector':'Insights'
            )
        ),
        React.createElement('div',{className:'topbar-actions'},
            data&&!isMobile&&React.createElement(React.Fragment,null,
                React.createElement('input',{style:{fontSize:10,background:'var(--bg0)',color:'var(--t1)',border:'1px solid '+(nlFilter?'var(--acc)':'var(--border)'),borderRadius:4,padding:'3px 8px',width:130,outline:'none',flexShrink:0},placeholder:'find files…',value:nlFilter,onChange:function(e){setNlFilter(e.target.value);},title:'Find files: type keywords to highlight matching nodes (e.g. "auth", "api routes", "test")'}),
                nlFilter&&React.createElement('button',{className:'top-btn',style:{padding:'2px 6px',fontSize:10},onClick:function(){setNlFilter('');},title:'Clear filter'},'×')
            ),
            React.createElement('button',{className:'top-btn',disabled:!data||!!localSourceKind,'aria-label':'Analyze Pull Request',title:'Analyze Pull Request',onClick:function(){setShowPR(true);},type:'button'},React.createElement(Icon,{name:'pull-request',size:'m'}),!data&&'PR'),
            React.createElement('button',{className:'top-btn',disabled:!data,'aria-label':'VAPT Security Report',title:'VAPT Security Report',onClick:function(){setShowVAPT(true);},type:'button'},React.createElement(Icon,{name:'shield',size:'m'}),!data&&'VAPT'),
            React.createElement('button',{className:'top-btn',disabled:!data,'aria-label':'API Endpoint Map',title:'API Endpoint Map',onClick:function(){setShowRoutes(true);},type:'button'},React.createElement(Icon,{name:'link',size:'m'})),
            React.createElement('button',{className:'top-btn',disabled:!data,'aria-label':'Component Tree',title:'Component Tree',onClick:function(){setShowComponents(true);},type:'button'},React.createElement(Icon,{name:'puzzle',size:'m'})),
            React.createElement('button',{className:'top-btn',disabled:!data,'aria-label':'Export analysis',title:'Export analysis',onClick:function(){setShowExport(true);},type:'button'},React.createElement(Icon,{name:'export',size:'m'}),!data&&'Export'),
            React.createElement('button',{className:'top-btn',disabled:!data||!!localSourceKind,'aria-label':'Copy share link',title:'Copy share link',onClick:copyLink,type:'button'},React.createElement(Icon,{name:'share',size:'m'}),!data&&'Share'),
            React.createElement('button',{className:'top-btn','aria-label':'Toggle theme',title:theme==='dark'?'Switch to light':'Switch to dark',onClick:function(){setTheme(function(t){return t==='dark'?'light':'dark';});},type:'button'},React.createElement(Icon,{name:theme==='dark'?'sun':'moon',size:'m'}),!data&&(theme==='dark'?'Light':'Dark'))
        )
    );
}
