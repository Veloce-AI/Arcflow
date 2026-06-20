/* component-tree-modal.js - React/Vue/Svelte/Angular Component Tree modal */

function ComponentTreeModal(props){
    var data=props.data;
    var onClose=props.onClose;
    var selectFile=props.selectFile;
    var components=data.components||[];
    var _sf=React.useState('');var search=_sf[0],setSearch=_sf[1];
    var _fw=React.useState('ALL');var fwFilter=_fw[0],setFwFilter=_fw[1];
    var _exp=React.useState(new Set());var expanded=_exp[0],setExpanded=_exp[1];

    var frameworks=['ALL'].concat([...new Set(components.map(function(c){return c.framework;}))].sort());
    var fwColors={React:'#61dafb',Vue:'#42b883',Svelte:'#ff3e00',Angular:'#dd0031'};

    var filtered=components.filter(function(c){
        if(fwFilter!=='ALL'&&c.framework!==fwFilter)return false;
        if(search&&!c.name.toLowerCase().includes(search.toLowerCase())&&!c.fname.toLowerCase().includes(search.toLowerCase()))return false;
        return true;
    });

    // Build child set to find roots (components not used as children by others)
    var allChildren=new Set();
    components.forEach(function(c){c.children.forEach(function(ch){allChildren.add(ch);});});
    var roots=filtered.filter(function(c){return!allChildren.has(c.name);});
    var nonRoots=filtered.filter(function(c){return allChildren.has(c.name);});

    var compByName=Object.create(null);
    components.forEach(function(c){compByName[c.name]=c;});

    function typeIcon(t){return t==='class'?'C':t==='sfc'?'V':t==='svelte'?'S':t==='angular'?'A':'F';}

    function toggleExpand(name){
        setExpanded(function(prev){
            var next=new Set(prev);
            if(next.has(name))next.delete(name);else next.add(name);
            return next;
        });
    }

    function CompNode(comp,depth){
        if(!comp)return null;
        var fw=comp.framework||'React';
        var color=fwColors[fw]||'var(--acc)';
        var hasChildren=comp.children&&comp.children.length>0;
        var isExp=expanded.has(comp.name);
        var typeLabel=typeIcon(comp.type);
        return React.createElement('div',{key:comp.name+depth,style:{marginLeft:depth*16}},
            React.createElement('div',{
                style:{display:'flex',alignItems:'center',gap:6,padding:'4px 8px',borderRadius:5,cursor:'pointer',marginBottom:2,
                    background:depth===0?'var(--bg0)':'transparent',
                    border:depth===0?'1px solid var(--border)':'none'},
                onClick:function(){if(hasChildren)toggleExpand(comp.name);}
            },
                hasChildren&&React.createElement('span',{style:{fontSize:9,color:'var(--t3)',width:10,flexShrink:0}},(isExp?'▾':'▸')),
                !hasChildren&&React.createElement('span',{style:{width:10,flexShrink:0}}),
                React.createElement('span',{style:{background:color,color:'#000',fontWeight:700,fontSize:8,padding:'0 4px',borderRadius:2,flexShrink:0}},typeLabel),
                React.createElement('span',{style:{fontWeight:600,fontSize:11,color:'var(--t0)',cursor:'pointer'},onClick:function(e){e.stopPropagation();selectFile(comp.file);onClose();}},comp.name),
                comp.props&&comp.props.length>0&&React.createElement('span',{style:{fontSize:9,color:'var(--t3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}},
                    comp.props.slice(0,4).map(function(p){return React.createElement('span',{key:p,style:{background:'rgba(99,102,241,0.1)',color:'var(--acc)',padding:'0 4px',borderRadius:2,marginLeft:3,fontSize:8}},p);})),
                React.createElement('span',{style:{fontSize:8,color:'var(--t3)',marginLeft:'auto',flexShrink:0}},comp.fname),
                hasChildren&&React.createElement('span',{style:{fontSize:8,color:'var(--t3)',marginLeft:4,flexShrink:0}},comp.children.length+' child'+(comp.children.length>1?'ren':''))
            ),
            isExp&&hasChildren&&comp.children.map(function(childName){
                var child=compByName[childName];
                if(!child)return React.createElement('div',{key:childName,style:{marginLeft:(depth+1)*16+10,fontSize:9,color:'var(--t3)',padding:'2px 0'}},childName,' (external)');
                return CompNode(child,depth+1);
            })
        );
    }

    if(!components.length){
        return React.createElement('div',{className:'modal-overlay',onClick:onClose,style:{zIndex:1100}},
            React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{maxWidth:500,padding:32,textAlign:'center'}},
                React.createElement(Icon,{name:'puzzle',size:'xxl',className:'empty-icon'}),
                React.createElement('div',{style:{fontWeight:700,fontSize:14,color:'var(--t0)',marginBottom:8}},'No Components Detected'),
                React.createElement('div',{style:{fontSize:11,color:'var(--t2)',lineHeight:1.6,marginBottom:16}},'Arcflow looks for React (JSX/TSX), Vue SFCs, Svelte, and Angular components. Make sure component files are included in your analysis.'),
                React.createElement('button',{className:'top-btn primary',onClick:onClose},'Close')
            )
        );
    }

    return React.createElement('div',{className:'modal-overlay',onClick:onClose,style:{zIndex:1100}},
        React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{width:'88vw',maxWidth:820,height:'90vh',display:'flex',flexDirection:'column',padding:0,overflow:'hidden'}},
            // Header
            React.createElement('div',{style:{padding:'10px 14px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8,flexShrink:0}},
                React.createElement(Icon,{name:'puzzle',size:'m'}),
                React.createElement('span',{style:{fontWeight:700,fontSize:13,color:'var(--t0)'}},'Component Tree'),
                React.createElement('span',{style:{fontSize:10,color:'var(--t3)',marginLeft:4}},components.length+' components'),
                React.createElement('button',{className:'modal-close',style:{marginLeft:'auto'},onClick:onClose},'×')
            ),
            // Toolbar
            React.createElement('div',{style:{padding:'7px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',gap:8,alignItems:'center',flexShrink:0,flexWrap:'wrap'}},
                // Framework filter chips
                frameworks.map(function(fw,i){
                    var active=fwFilter===fw;
                    var col=fwColors[fw]||'var(--acc)';
                    return React.createElement('button',{key:i,
                        style:{fontSize:9,padding:'2px 8px',height:20,border:'1px solid '+(active?(fw==='ALL'?'var(--acc)':col):'var(--border)'),borderRadius:4,background:active?(fw==='ALL'?'rgba(99,102,241,0.15)':col+'22'):'transparent',color:active?(fw==='ALL'?'var(--acc)':col):'var(--t2)',cursor:'pointer',fontWeight:active?700:400},
                        onClick:function(){setFwFilter(fw);}
                    },fw);
                }),
                React.createElement('input',{style:{fontSize:10,background:'var(--bg0)',color:'var(--t1)',border:'1px solid var(--border)',borderRadius:4,padding:'3px 8px',flex:1,minWidth:100,marginLeft:4},placeholder:'Search components…',value:search,onChange:function(e){setSearch(e.target.value);}}),
                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',flexShrink:0}},filtered.length+' shown')
            ),
            // Legend
            React.createElement('div',{style:{padding:'5px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center',flexShrink:0,flexWrap:'wrap'}},
                [['F','Function/Arrow','#61dafb'],['C','Class','#61dafb'],['V','Vue SFC','#42b883'],['S','Svelte','#ff3e00'],['A','Angular','#dd0031']].map(function(l,i){
                    return React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:4,fontSize:9,color:'var(--t3)'}},
                        React.createElement('span',{style:{background:l[2],color:'#000',fontWeight:700,fontSize:8,padding:'0 4px',borderRadius:2}},l[0]),l[1]);
                }),
                React.createElement('div',{style:{marginLeft:'auto',fontSize:9,color:'var(--t3)'}},
                    React.createElement('span',{style:{color:'var(--acc)'}},'▸'),' = has children · click name → jump to file')
            ),
            // Body — two columns: root tree + flat list
            React.createElement('div',{style:{flex:1,overflowY:'auto',minHeight:0,display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}},
                // Left: component tree (roots + their subtrees)
                React.createElement('div',{style:{padding:'12px 14px',borderRight:'1px solid var(--border)',overflowY:'auto'}},
                    React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}},
                        'Component Tree ('+roots.length+' root'+(roots.length!==1?'s':'')+')'),
                    roots.length===0
                        ?React.createElement('div',{style:{color:'var(--t3)',fontSize:10,padding:12,textAlign:'center'}},'No root components found — all components are used as children of others.')
                        :roots.map(function(c){return CompNode(c,0);}),
                    nonRoots.length>0&&roots.length>0&&React.createElement('div',{style:{marginTop:16}},
                        React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}},
                            'Shared / Child Components ('+nonRoots.length+')'),
                        nonRoots.map(function(c){return CompNode(c,0);})
                    )
                ),
                // Right: stats + component detail
                React.createElement('div',{style:{padding:'12px 14px',overflowY:'auto'}},
                    React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}},'Framework Breakdown'),
                    (function(){
                        var byFw=Object.create(null);
                        components.forEach(function(c){byFw[c.framework]=(byFw[c.framework]||0)+1;});
                        var maxFw=Math.max.apply(null,Object.values(byFw));
                        return React.createElement('div',{style:{marginBottom:16}},
                            Object.entries(byFw).sort(function(a,b){return b[1]-a[1];}).map(function(e,i){
                                var col=fwColors[e[0]]||'var(--acc)';
                                return React.createElement('div',{key:i,style:{marginBottom:6}},
                                    React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:9,marginBottom:2}},
                                        React.createElement('span',{style:{color:col,fontWeight:600}},e[0]),
                                        React.createElement('span',{style:{color:'var(--t3)'}},e[1]+' component'+(e[1]>1?'s':''))
                                    ),
                                    React.createElement('div',{style:{background:'var(--bg3)',borderRadius:2,height:5,overflow:'hidden'}},
                                        React.createElement('div',{style:{background:col,height:'100%',borderRadius:2,width:Math.round(e[1]/maxFw*100)+'%'}})
                                    )
                                );
                            })
                        );
                    })(),
                    React.createElement('div',{style:{fontSize:9,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}},'All Components'),
                    filtered.sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(c,i){
                        var col=fwColors[c.framework]||'var(--acc)';
                        return React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',borderRadius:4,marginBottom:3,cursor:'pointer',background:'var(--bg0)',border:'1px solid var(--border)'},onClick:function(){selectFile(c.file);onClose();}},
                            React.createElement('span',{style:{background:col,color:'#000',fontWeight:700,fontSize:8,padding:'0 4px',borderRadius:2,flexShrink:0}},typeIcon(c.type)),
                            React.createElement('span',{style:{fontWeight:600,fontSize:10,color:'var(--t0)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},c.name),
                            c.children.length>0&&React.createElement('span',{style:{fontSize:8,color:'var(--t3)',flexShrink:0}},c.children.length+' ↓'),
                            React.createElement('span',{style:{fontSize:8,color:'var(--t3)',flexShrink:0}},'L'+c.line)
                        );
                    })
                )
            )
        )
    );
}
