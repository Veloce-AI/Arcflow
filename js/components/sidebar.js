/* sidebar.js - AppSidebar component */
function AppSidebar(props){
    var data=props.data;
    var isMobile=props.isMobile;
    var mobilePanel=props.mobilePanel;
    var folderFilter=props.folderFilter;
    var health=props.health;
    var colorMode=props.colorMode;
    var setColorMode=props.setColorMode;
    var expandedPaths=props.expandedPaths;
    var togglePath=props.togglePath;
    var selected=props.selected;
    var selectFile=props.selectFile;
    var setBlastRadius=props.setBlastRadius;
    var setFolderFilter=props.setFolderFilter;
    var filterByFolder=props.filterByFolder;
    var setMobilePanel=props.setMobilePanel;
    var graphConfig=props.graphConfig;
    var repoInfo=props.repoInfo;
    var sidebarWidth=props.sidebarWidth;
    var setSidebarWidth=props.setSidebarWidth;
    var folderInputRef=props.folderInputRef;
    var colorMap=props.colorMap;
    var setShowUnused=props.setShowUnused;
    return React.createElement('div',{className:'sidebar'+(isMobile&&mobilePanel==='explorer'?' mobile-visible':''),style:{width:isMobile?'100vw':sidebarWidth}},
        isMobile&&React.createElement('div',{className:'mobile-panel-header'},
            React.createElement('div',{className:'mobile-panel-meta'},
                React.createElement('div',{className:'mobile-panel-title'},'Explorer'),
                React.createElement('div',{className:'mobile-panel-subtitle'},data?(folderFilter?'Filtered by '+folderFilter:data.files.length+' files ready to browse'):'Analyze a repo or open a folder')
            ),
            React.createElement('button',{className:'mobile-panel-close',type:'button','aria-label':'Close explorer panel',onClick:function(){setMobilePanel(null);}},
                React.createElement(Icon,{name:'close',size:'m'})
            )
        ),
        React.createElement('div',{className:'resize-handle',onMouseDown:function(e){
            e.preventDefault();
            var startX=e.clientX,startW=sidebarWidth;
            function onMove(e){setSidebarWidth(Math.max(180,Math.min(400,startW+e.clientX-startX)));}
            function onUp(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
            document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
        }}),
        data?React.createElement(React.Fragment,null,
            React.createElement('div',{className:'sidebar-top'},
            repoInfo&&React.createElement('div',{className:'repo-identity'},
                React.createElement(Icon,{name:'folder',size:'s',style:{color:'var(--acc)',flexShrink:0}}),
                React.createElement('span',{className:'repo-id-name'},repoInfo.owner+'/'+repoInfo.repo),
                React.createElement('a',{className:'repo-id-link',href:'https://github.com/'+repoInfo.owner+'/'+repoInfo.repo,target:'_blank',rel:'noopener noreferrer',title:'Open on GitHub'},React.createElement(Icon,{name:'share',size:'s'}))
            ),
            React.createElement('div',{className:'sidebar-section'},
                React.createElement('div',{className:'health-score'},
                    React.createElement(HealthRing,{score:health.score,grade:health.grade}),
                    React.createElement('div',{className:'health-info'},
                        React.createElement('div',{className:'health-grade',style:{color:health.score>=80?'var(--green)':health.score>=60?'var(--orange)':'var(--red)'}},health.score,'/100'),
                        React.createElement('div',{className:'health-label'},'Health Score')
                    )
                )
            ),
            React.createElement('div',{className:'sidebar-section'},
                React.createElement('div',{className:'sidebar-title'},'Color By'),
                React.createElement('div',{className:'view-modes'},
                    React.createElement('div',{className:'view-mode'+(colorMode==='folder'?' active':''),onClick:function(){setColorMode('folder');}},React.createElement(Icon,{name:'folder',size:'m',className:'view-mode-icon'}),'Folder'),
                    React.createElement('div',{className:'view-mode'+(colorMode==='layer'?' active':''),onClick:function(){setColorMode('layer');}},React.createElement(Icon,{name:'layers',size:'m',className:'view-mode-icon'}),'Layer'),
                    React.createElement('div',{className:'view-mode'+(colorMode==='churn'?' active':''),onClick:function(){setColorMode('churn');}},React.createElement(Icon,{name:'activity',size:'m',className:'view-mode-icon'}),'Churn'),
                    React.createElement('div',{className:'view-mode'+(colorMode==='git'?' active':''),onClick:function(){setColorMode('git');}},React.createElement(Icon,{name:'activity',size:'m',className:'view-mode-icon'}),'Git'),
                    React.createElement('div',{className:'view-mode'+(colorMode==='clusters'?' active':''),onClick:function(){setColorMode('clusters');}},React.createElement(Icon,{name:'layers',size:'m',className:'view-mode-icon'}),'Clusters')
                )
            ),
            React.createElement('div',{className:'sidebar-section'},
                React.createElement('div',{className:'stats-grid'},
                    React.createElement('div',{className:'stat-card'},React.createElement('div',{className:'stat-value'},data.stats.files),React.createElement('div',{className:'stat-label'},'Files')),
                    React.createElement('div',{className:'stat-card'},React.createElement('div',{className:'stat-value'},data.stats.functions),React.createElement('div',{className:'stat-label'},'Functions')),
                    React.createElement('div',{className:'stat-card'},React.createElement('div',{className:'stat-value'},data.stats.connections),React.createElement('div',{className:'stat-label'},'Links')),
                    React.createElement('div',{className:'stat-card'+(data.stats.dead>10?' warn':''),style:{cursor:data.stats.dead>0?'pointer':'default'},onClick:function(){if(data.stats.dead>0)setShowUnused(true);}},React.createElement('div',{className:'stat-value'},data.stats.dead),React.createElement('div',{className:'stat-label'},'Unused'))
                ),
                React.createElement('div',{className:'loc-stat'},
                    React.createElement('div',{className:'loc-value'},data.stats.loc?data.stats.loc.toLocaleString():'0'),
                    React.createElement('div',{className:'loc-label'},'Lines of Code')
                ),
                data.stats.languages&&data.stats.languages.length>0&&React.createElement(React.Fragment,null,
                    React.createElement('div',{className:'lang-bar'},
                        data.stats.languages.map(function(l,i){
                            var c=(typeof EXT_COLORS!=='undefined'&&EXT_COLORS[l.ext])||COLORS[i%COLORS.length];
                            return React.createElement('div',{key:l.ext,className:'lang-bar-segment',style:{flex:l.pct,width:'auto',background:c},title:l.ext+' '+l.pct+'%'});
                        })
                    ),
                    React.createElement('div',{className:'lang-legend'},
                        data.stats.languages.map(function(l,i){
                            var c=(typeof EXT_COLORS!=='undefined'&&EXT_COLORS[l.ext])||COLORS[i%COLORS.length];
                            return React.createElement('div',{key:l.ext,className:'lang-item'},
                                React.createElement('div',{className:'lang-dot',style:{background:c}}),
                                React.createElement('span',null,l.ext,' ',l.pct,'%')
                            );
                        })
                    )
                )
            ),
            ),
            React.createElement('div',{className:'sidebar-scroll'},
                React.createElement('div',{className:'explorer-label'},
                    React.createElement('span',null,'Explorer'),
                    folderFilter&&React.createElement('button',{className:'clear-filter-btn',onClick:function(){setFolderFilter(null);}},
                        React.createElement(Icon,{name:'close',size:'s'}),' ',folderFilter
                    )
                ),
                React.createElement(TreeNode,{node:data.tree,selected:selected,onSelect:selectFile,expanded:expandedPaths,toggle:togglePath,filterFolder:filterByFolder,activeFilter:folderFilter})
            )
        ):React.createElement('div',{className:'empty-state'},
            React.createElement(Icon,{name:'search',size:'xxl',className:'empty-icon'}),
            React.createElement('div',{className:'empty-title'},'No Repository'),
            React.createElement('div',{className:'empty-desc'},'Enter a GitHub URL, open a folder, or load a ZIP archive')
        )
    );
}
