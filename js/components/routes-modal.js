/* routes-modal.js - API Endpoint Map modal */

var ROUTE_METHOD_COLORS={
    GET:'#22c55e',POST:'#6366f1',PUT:'#f59e0b',PATCH:'#f97316',
    DELETE:'#ef4444',HEAD:'#94a3b8',OPTIONS:'#94a3b8',ANY:'#a78bfa','GET*':'#60a5fa',ANY:'#a78bfa'
};
function routeMethodColor(m){return ROUTE_METHOD_COLORS[m]||'#94a3b8';}

function RoutesModal(props){
    var data=props.data;
    var onClose=props.onClose;
    var selectFile=props.selectFile;
    var routes=(data.apiRoutes||[]);
    var _sf=React.useState('');var searchTerm=_sf[0],setSearchTerm=_sf[1];
    var _mf=React.useState('ALL');var methodFilter=_mf[0],setMethodFilter=_mf[1];
    var _fw=React.useState('ALL');var frameworkFilter=_fw[0],setFrameworkFilter=_fw[1];
    var _sort=React.useState('path');var sortBy=_sort[0],setSortBy=_sort[1];

    var allMethods=['ALL'].concat([...new Set(routes.map(function(r){return r.method;}))].sort());
    var allFrameworks=['ALL'].concat([...new Set(routes.map(function(r){return r.framework;}))].sort());

    var filtered=routes.filter(function(r){
        if(methodFilter!=='ALL'&&r.method!==methodFilter)return false;
        if(frameworkFilter!=='ALL'&&r.framework!==frameworkFilter)return false;
        if(searchTerm){var q=searchTerm.toLowerCase();if(!r.path.toLowerCase().includes(q)&&!r.handler.toLowerCase().includes(q)&&!r.fname.toLowerCase().includes(q))return false;}
        return true;
    }).sort(function(a,b){
        if(sortBy==='method')return a.method.localeCompare(b.method)||a.path.localeCompare(b.path);
        if(sortBy==='file')return a.fname.localeCompare(b.fname);
        return a.path.localeCompare(b.path);
    });

    // Method breakdown counts
    var methodCounts={};
    routes.forEach(function(r){methodCounts[r.method]=(methodCounts[r.method]||0)+1;});

    // Group filtered routes by file for grouped view
    var _view=React.useState('table');var viewMode=_view[0],setViewMode=_view[1];
    var byFile=Object.create(null);
    filtered.forEach(function(r){if(!byFile[r.file])byFile[r.file]={file:r.file,fname:r.fname,routes:[]};byFile[r.file].routes.push(r);});
    var fileGroups=Object.values(byFile).sort(function(a,b){return b.routes.length-a.routes.length;});

    if(!routes.length){
        return React.createElement('div',{className:'modal-overlay',onClick:onClose,style:{zIndex:1100}},
            React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{maxWidth:520,padding:32,textAlign:'center'}},
                React.createElement(Icon,{name:'link',size:'xxl',className:'empty-icon'}),
                React.createElement('div',{style:{fontWeight:700,fontSize:14,color:'var(--t0)',marginBottom:8}},'No API Routes Detected'),
                React.createElement('div',{style:{fontSize:11,color:'var(--t2)',lineHeight:1.6,marginBottom:16}},'Arcflow looks for route definitions from Express, FastAPI, Flask, Django, Spring, Go net/http, Gin, Rails, and ASP.NET. Make sure your framework files are included in the analysis.'),
                React.createElement('button',{className:'top-btn primary',onClick:onClose},'Close')
            )
        );
    }

    return React.createElement('div',{className:'modal-overlay',onClick:onClose,style:{zIndex:1100}},
        React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{width:'92vw',maxWidth:920,height:'90vh',display:'flex',flexDirection:'column',padding:0,overflow:'hidden'}},
            // Header
            React.createElement('div',{style:{padding:'10px 14px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8,flexShrink:0}},
                React.createElement(Icon,{name:'link',size:'m'}),
                React.createElement('span',{style:{fontWeight:700,fontSize:13,color:'var(--t0)'}},'API Endpoint Map'),
                React.createElement('span',{style:{fontSize:10,color:'var(--t3)',marginLeft:4}},routes.length+' routes detected'),
                React.createElement('div',{style:{marginLeft:'auto',display:'flex',gap:4}},
                    React.createElement('button',{className:'view-btn'+(viewMode==='table'?' active':''),style:{fontSize:9,padding:'2px 8px',height:20},onClick:function(){setViewMode('table');}},'Table'),
                    React.createElement('button',{className:'view-btn'+(viewMode==='grouped'?' active':''),style:{fontSize:9,padding:'2px 8px',height:20},onClick:function(){setViewMode('grouped');}},'By File')
                ),
                React.createElement('button',{className:'modal-close',style:{marginLeft:8},onClick:onClose},'×')
            ),
            // Summary row — method breakdown
            React.createElement('div',{style:{padding:'8px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12,flexShrink:0,flexWrap:'wrap'}},
                Object.entries(methodCounts).sort(function(a,b){return b[1]-a[1];}).map(function(e,i){
                    return React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:5,cursor:'pointer'},onClick:function(){setMethodFilter(methodFilter===e[0]?'ALL':e[0]);}},
                        React.createElement('span',{style:{background:routeMethodColor(e[0]),color:'#fff',padding:'1px 7px',borderRadius:3,fontSize:9,fontWeight:700,opacity:methodFilter!=='ALL'&&methodFilter!==e[0]?0.4:1}},e[0]),
                        React.createElement('span',{style:{fontSize:11,fontWeight:600,color:'var(--t1)',opacity:methodFilter!=='ALL'&&methodFilter!==e[0]?0.4:1}},e[1])
                    );
                }),
                React.createElement('div',{style:{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}},
                    React.createElement('span',{style:{fontSize:9,color:'var(--t3)'}},'Framework:'),
                    React.createElement('select',{style:{fontSize:9,background:'var(--bg0)',color:'var(--t1)',border:'1px solid var(--border)',borderRadius:4,padding:'2px 4px'},value:frameworkFilter,onChange:function(e){setFrameworkFilter(e.target.value);}},
                        allFrameworks.map(function(fw,i){return React.createElement('option',{key:i,value:fw},fw);})
                    )
                )
            ),
            // Toolbar — search + sort
            React.createElement('div',{style:{padding:'6px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',gap:8,alignItems:'center',flexShrink:0,flexWrap:'wrap'}},
                React.createElement('input',{style:{fontSize:10,background:'var(--bg0)',color:'var(--t1)',border:'1px solid var(--border)',borderRadius:4,padding:'3px 8px',flex:1,minWidth:120},placeholder:'Search path, handler, file…',value:searchTerm,onChange:function(e){setSearchTerm(e.target.value);}}),
                React.createElement('span',{style:{fontSize:9,color:'var(--t3)'}},'Sort:'),
                ['path','method','file'].map(function(s,i){
                    return React.createElement('button',{key:i,className:'view-btn'+(sortBy===s?' active':''),style:{fontSize:9,padding:'2px 8px',height:20},onClick:function(){setSortBy(s);}},s);
                }),
                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginLeft:'auto'}},filtered.length+' shown'),
                (function(){var unprotected=filtered.filter(function(r){return !r.authProtected&&['POST','PUT','DELETE','PATCH'].includes(r.method);}).length;return unprotected>0?React.createElement('span',{style:{fontSize:9,color:'var(--orange)',fontWeight:600}},unprotected+' unprotected'):null;})()

            ),
            // Body
            React.createElement('div',{style:{flex:1,overflowY:'auto',minHeight:0}},
                viewMode==='table'
                ? React.createElement('table',{style:{width:'100%',borderCollapse:'collapse',fontSize:10}},
                    React.createElement('thead',null,
                        React.createElement('tr',{style:{background:'var(--bg2)',position:'sticky',top:0,zIndex:1}},
                            React.createElement('th',{style:{padding:'6px 12px',textAlign:'left',fontSize:9,color:'var(--t3)',fontWeight:600,width:70}},'METHOD'),
                            React.createElement('th',{style:{padding:'6px 12px',textAlign:'left',fontSize:9,color:'var(--t3)',fontWeight:600}},'PATH'),
                            React.createElement('th',{style:{padding:'6px 12px',textAlign:'left',fontSize:9,color:'var(--t3)',fontWeight:600}},'HANDLER'),
                            React.createElement('th',{style:{padding:'6px 12px',textAlign:'left',fontSize:9,color:'var(--t3)',fontWeight:600}},'FILE'),
                            React.createElement('th',{style:{padding:'6px 8px',textAlign:'left',fontSize:9,color:'var(--t3)',fontWeight:600,width:80}},'FRAMEWORK')
                        )
                    ),
                    React.createElement('tbody',null,
                        filtered.map(function(r,i){
                            return React.createElement('tr',{key:i,style:{borderBottom:'1px solid var(--border)',cursor:'pointer'},onClick:function(){selectFile(r.file);onClose();},'data-hover':true,
                                onMouseEnter:function(e){e.currentTarget.style.background='var(--bg2)';},
                                onMouseLeave:function(e){e.currentTarget.style.background='';} },
                                React.createElement('td',{style:{padding:'7px 12px'}},
                                    React.createElement('span',{style:{background:routeMethodColor(r.method),color:'#fff',padding:'1px 6px',borderRadius:3,fontSize:9,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}},r.method),
                                    !r.authProtected&&['POST','PUT','DELETE','PATCH'].includes(r.method)&&React.createElement('div',{style:{fontSize:7,color:'var(--orange)',marginTop:2,fontWeight:700}},'⚠ No auth')
                                ),
                                React.createElement('td',{style:{padding:'7px 12px',fontFamily:"'JetBrains Mono',monospace",color:'var(--t0)',fontWeight:500}},r.path),
                                React.createElement('td',{style:{padding:'7px 12px',fontFamily:"'JetBrains Mono',monospace",color:'var(--acc)'}},r.handler||React.createElement('span',{style:{color:'var(--t3)'}},'—')),
                                React.createElement('td',{style:{padding:'7px 12px',color:'var(--t2)'}},
                                    React.createElement('div',{style:{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:220}},r.fname),
                                    r.line&&React.createElement('div',{style:{fontSize:8,color:'var(--t3)'}},'line ',r.line)
                                ),
                                React.createElement('td',{style:{padding:'7px 8px',fontSize:8,color:'var(--t3)'}},r.framework)
                            );
                        })
                    )
                )
                : React.createElement('div',{style:{padding:'10px 14px'}},
                    fileGroups.map(function(g,i){
                        return React.createElement('div',{key:i,style:{border:'1px solid var(--border)',borderRadius:6,marginBottom:10,overflow:'hidden'}},
                            React.createElement('div',{style:{padding:'8px 12px',background:'var(--bg2)',display:'flex',alignItems:'center',gap:8,cursor:'pointer'},onClick:function(){selectFile(g.file);onClose();}},
                                React.createElement(Icon,{name:'file',size:'s'}),
                                React.createElement('span',{style:{fontWeight:600,fontSize:11,color:'var(--t0)'}},g.fname),
                                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginLeft:'auto'}},g.routes.length+' route'+(g.routes.length>1?'s':'')),
                                React.createElement('div',{style:{display:'flex',gap:3,marginLeft:8}},
                                    [...new Set(g.routes.map(function(r){return r.method;}))].map(function(m,j){
                                        return React.createElement('span',{key:j,style:{background:routeMethodColor(m),color:'#fff',padding:'0 4px',borderRadius:2,fontSize:8,fontWeight:700}},m);
                                    })
                                )
                            ),
                            g.routes.map(function(r,j){
                                return React.createElement('div',{key:j,style:{padding:'6px 12px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,fontSize:10}},
                                    React.createElement('span',{style:{background:routeMethodColor(r.method),color:'#fff',padding:'1px 6px',borderRadius:3,fontSize:9,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}},r.method),
                                    !r.authProtected&&['POST','PUT','DELETE','PATCH'].includes(r.method)&&React.createElement('span',{style:{fontSize:7,color:'var(--orange)',fontWeight:700,flexShrink:0}},'⚠'),
                                    React.createElement('span',{style:{fontFamily:"'JetBrains Mono',monospace",color:'var(--t0)',fontWeight:500,flex:1}},r.path),
                                    r.handler&&React.createElement('span',{style:{color:'var(--acc)',fontFamily:"'JetBrains Mono',monospace",fontSize:9}},r.handler),
                                    r.line&&React.createElement('span',{style:{color:'var(--t3)',fontSize:9,flexShrink:0}},'L'+r.line)
                                );
                            })
                        );
                    })
                )
            )
        )
    );
}
