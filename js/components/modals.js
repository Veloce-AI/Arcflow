/* modals.js - Extracted React modal components (global scope, no ES modules) */

/**
 * PrivacyModal — Privacy & Security info modal.
 * Props: { onClose }
 */
function PrivacyModal(props) {
    var onClose = props.onClose;
    return React.createElement('div', {className:'modal-overlay', onClick:onClose},
        React.createElement('div', {className:'modal privacy-modal', onClick:function(e){e.stopPropagation();}},
            React.createElement('div', {className:'modal-header'},
                React.createElement('div', {className:'modal-title'}, iconLabel('lock','Privacy & Security','m')),
                React.createElement('button', {className:'modal-close', onClick:onClose}, '×')
            ),
            React.createElement('div', {className:'modal-body'},
                React.createElement('div', {className:'privacy-item'},
                    React.createElement('div', {className:'privacy-icon'}, React.createElement(Icon,{name:'globe',size:'l'})),
                    React.createElement('div', null,
                        React.createElement('div', {className:'privacy-title'}, '100% Browser-Based'),
                        React.createElement('div', {className:'privacy-text'}, 'Arcflow runs entirely in your browser. No backend servers, no data collection.')
                    )
                ),
                React.createElement('div', {className:'privacy-item'},
                    React.createElement('div', {className:'privacy-icon'}, React.createElement(Icon,{name:'key',size:'l'})),
                    React.createElement('div', null,
                        React.createElement('div', {className:'privacy-title'}, 'Your Token Stays Local'),
                        React.createElement('div', {className:'privacy-text'}, "Your GitHub token is stored only in your browser's memory. It's never saved, logged, or transmitted anywhere except directly to GitHub's API.")
                    )
                ),
                React.createElement('div', {className:'privacy-item'},
                    React.createElement('div', {className:'privacy-icon'}, React.createElement(Icon,{name:'share',size:'l'})),
                    React.createElement('div', null,
                        React.createElement('div', {className:'privacy-title'}, 'Direct API Calls'),
                        React.createElement('div', {className:'privacy-text'}, 'All GitHub API calls go directly from your browser to api.github.com. We have no proxy, no middleware, no way to intercept your data.')
                    )
                ),
                React.createElement('div', {className:'privacy-item'},
                    React.createElement('div', {className:'privacy-icon'}, React.createElement(Icon,{name:'ban',size:'l'})),
                    React.createElement('div', null,
                        React.createElement('div', {className:'privacy-title'}, 'Nothing Persisted'),
                        React.createElement('div', {className:'privacy-text'}, "Close the tab and everything is gone. No cookies, no local storage, no tracking. Check the source code - it's all in one HTML file!")
                    )
                ),
                React.createElement('div', {style:{marginTop:16,padding:12,background:'var(--accbg)',borderRadius:8,fontSize:10,color:'var(--t1)'}},
                    React.createElement(Icon,{name:'spark',size:'s'}),
                    ' Tip: Create a ',
                    React.createElement('a', {href:'https://github.com/settings/tokens',target:'_blank',rel:'noopener',style:{color:'var(--acc)'}}, 'Personal Access Token'),
                    ' with only "public_repo" scope for extra peace of mind when analyzing public repositories.'
                )
            ),
            React.createElement('div', {className:'modal-footer'},
                React.createElement('button', {className:'top-btn primary', onClick:onClose}, 'Got it!')
            )
        )
    );
}

/**
 * KeyModal — GitHub App private key modal.
 * Props: { privateKey, onKeyChange, onClose }
 */
function KeyModal(props) {
    var privateKey  = props.privateKey;
    var onKeyChange = props.onKeyChange;
    var onClose     = props.onClose;
    return React.createElement('div', {className:'modal-overlay', onClick:onClose},
        React.createElement('div', {className:'modal key-modal', onClick:function(e){e.stopPropagation();}},
            React.createElement('div', {className:'modal-header'},
                React.createElement('div', {className:'modal-title'}, iconLabel('key','GitHub App Private Key','m')),
                React.createElement('button', {className:'modal-close', onClick:onClose}, '×')
            ),
            React.createElement('div', {className:'modal-body'},
                React.createElement('div', {className:'key-info'},
                    'Paste the private key from your GitHub App. This key is stored only in memory and never leaves your browser.',
                    React.createElement('br'), React.createElement('br'),
                    'To get a private key:', React.createElement('br'),
                    '1. Go to GitHub → Settings → Developer settings → GitHub Apps', React.createElement('br'),
                    '2. Select your app → Generate a private key', React.createElement('br'),
                    '3. Open the downloaded ', React.createElement('code', null, '.pem'), ' file and paste its contents below'
                ),
                React.createElement('div', {className:'form-group'},
                    React.createElement('label', {className:'form-label'}, 'Private Key (PEM format)'),
                    React.createElement('textarea', {
                        className:'form-input',
                        placeholder:'-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
                        value:privateKey,
                        onChange:function(e){ onKeyChange(e.target.value); },
                        rows:10
                    })
                )
            ),
            React.createElement('div', {className:'modal-footer'},
                privateKey && React.createElement('button', {className:'top-btn', onClick:function(){onKeyChange('');}, style:{marginRight:'auto'}}, 'Clear Key'),
                React.createElement('button', {className:'top-btn', onClick:onClose}, 'Cancel'),
                React.createElement('button', {className:'top-btn primary', onClick:onClose}, 'Save')
            )
        )
    );
}

/**
 * ExcludeModal — Exclude patterns modal.
 * Props: { excludePatternDraft, onDraftChange, onClose, onSave }
 */
function ExcludeModal(props) {
    var excludePatternDraft = props.excludePatternDraft;
    var onDraftChange       = props.onDraftChange;
    var onClose             = props.onClose;
    var onSave              = props.onSave;
    return React.createElement('div', {className:'modal-overlay', onClick:onClose},
        React.createElement('div', {className:'modal', onClick:function(e){e.stopPropagation();}, style:{maxWidth:540}},
            React.createElement('div', {className:'modal-header'},
                React.createElement('div', {className:'modal-title'}, iconLabel('ban','Exclude Patterns','m')),
                React.createElement('div', {style:{display:'flex',alignItems:'center',gap:12}},
                    React.createElement('div', {className:'exclude-count'}, parseExcludePatterns(excludePatternDraft).length, ' custom'),
                    React.createElement('button', {className:'modal-close', onClick:onClose}, '×')
                )
            ),
            React.createElement('div', {className:'modal-body'},
                React.createElement('div', {className:'exclude-note'},
                    'Common build and cache folders are already excluded by default. Add project-specific patterns here before scanning a repo or opening a local folder.'
                ),
                React.createElement('div', {className:'exclude-note'},
                    'Supports exact names like ', React.createElement('code', null, '.git'), ' or ', React.createElement('code', null, 'attachments'),
                    ', file globs like ', React.createElement('code', null, '*.png'),
                    ', and path globs like ', React.createElement('code', null, 'uploads/**'), ' or ', React.createElement('code', null, '**/cache/**'), '.'
                ),
                React.createElement('div', {className:'form-group'},
                    React.createElement('label', {className:'form-label'}, 'Always Excluded'),
                    React.createElement('div', {className:'exclude-chip-list'},
                        DEFAULT_EXCLUDE_CHIPS.map(function(pattern){
                            return React.createElement('div', {key:pattern, className:'exclude-chip'}, pattern);
                        })
                    )
                ),
                React.createElement('div', {className:'form-group'},
                    React.createElement('label', {className:'form-label'}, 'Custom Patterns'),
                    React.createElement('textarea', {
                        className:'form-input exclude-textarea',
                        'aria-label':'Custom exclude patterns',
                        placeholder:'attachments\nuploads/**\n**/cache/**\n*.png\n*.log',
                        value:excludePatternDraft,
                        onChange:function(e){ onDraftChange(e.target.value); },
                        rows:8
                    }),
                    React.createElement('div', {className:'exclude-help'}, 'Use one pattern per line, or separate patterns with commas. Changes apply to the next analysis or refresh.')
                )
            ),
            React.createElement('div', {className:'modal-footer'},
                excludePatternDraft && React.createElement('button', {className:'top-btn', onClick:function(){onDraftChange('');}, style:{marginRight:'auto'}}, 'Clear Custom'),
                React.createElement('button', {className:'top-btn', onClick:onClose}, 'Cancel'),
                React.createElement('button', {className:'top-btn primary', onClick:onSave}, 'Save')
            )
        )
    );
}

/**
 * FilePreviewModal — Source file preview modal.
 * Props: { filePreview, filePreviewRef, onClose, highlightSyntax }
 */
function FilePreviewModal(props) {
    var filePreview     = props.filePreview;
    var filePreviewRef  = props.filePreviewRef;
    var onClose         = props.onClose;
    var highlightSyntax = props.highlightSyntax;

    return React.createElement('div', {className:'file-preview-overlay', onClick:onClose},
        React.createElement('div', {className:'file-preview-modal', onClick:function(e){e.stopPropagation();}},
            React.createElement('div', {className:'file-preview-header'},
                React.createElement('div', {className:'file-preview-title'},
                    React.createElement('span', {className:'file-preview-icon'}, React.createElement(Icon,{name:getFilePreviewIconName(filePreview.filename),size:'l'})),
                    React.createElement('span', {className:'file-preview-name'}, filePreview.filename),
                    React.createElement('span', {className:'file-preview-path'}, filePreview.path)
                ),
                React.createElement('div', {className:'file-preview-actions'},
                    filePreview.line && React.createElement('span', {className:'file-preview-line-badge'}, 'Line ', filePreview.line),
                    React.createElement('button', {className:'file-preview-close', onClick:onClose}, '×')
                )
            ),
            React.createElement('div', {className:'file-preview-content', ref:filePreviewRef},
                filePreview.loading
                    ? React.createElement('div', {className:'file-preview-loading'},
                        React.createElement('div', {className:'spinner'}),
                        React.createElement('div', {className:'file-preview-loading-text'}, 'Loading file...')
                      )
                    : filePreview.error
                        ? React.createElement('div', {className:'file-preview-error'},
                            React.createElement(Icon,{name:'warning',size:'xxl',className:'file-preview-error-icon'}),
                            React.createElement('div', null, filePreview.error)
                          )
                        : filePreview.content
                            ? React.createElement('pre', {className:'file-preview-code'},
                                highlightSyntax(filePreview.content, filePreview.filename).map(function(lineHtml,i){
                                    var lineNum = i+1;
                                    var isHighlighted = filePreview.line && lineNum===filePreview.line;
                                    return React.createElement('div', {key:i, className:'file-preview-line'+(isHighlighted?' highlighted':'')},
                                        React.createElement('span', {className:'file-preview-linenum'}, lineNum),
                                        React.createElement('span', {className:'file-preview-text', dangerouslySetInnerHTML:{__html:lineHtml||' '}})
                                    );
                                })
                              )
                            : null
            )
        )
    );
}

/**
 * CallGraphModal — Full-screen resizable intra-file function call graph.
 * Props: { selected, data, cgCfg, setCgCfg, onClose }
 */
function CallGraphModal(props){
    var selected=props.selected;
    var data=props.data;
    var cgCfg=props.cgCfg;
    var setCgCfg=props.setCgCfg;
    var onClose=props.onClose;
    var svgRef=React.useRef(null);
    var simRef=React.useRef(null);
    var _tt=React.useState(null);var tooltip=_tt[0],setTooltip=_tt[1];
    var _sz=React.useState(function(){return{w:Math.round(window.innerWidth*0.9),h:Math.round(window.innerHeight*0.87)};});
    var sz=_sz[0],setSz=_sz[1];

    function startResize(e){
        e.preventDefault();e.stopPropagation();
        var sx=e.clientX,sy=e.clientY,sw=sz.w,sh=sz.h;
        function onMove(e){setSz({w:Math.max(500,sw+e.clientX-sx),h:Math.max(380,sh+e.clientY-sy)});}
        function onUp(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
        document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
    }

    var cgExportName='Arcflow_CallGraph_'+(selected&&selected.name||'file');
    function exportCGPNG(){
        var svgEl=svgRef.current;if(!svgEl)return;
        svgToCanvas(svgEl,function(canvas,err){
            if(err||!canvas)return;
            var a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=cgExportName+'.png';a.click();
        });
    }
    function exportCGSVG(){
        var svgEl=svgRef.current;if(!svgEl)return;
        var clone=svgEl.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
        var st=document.createElementNS('http://www.w3.org/2000/svg','style');
        st.textContent=getEmbeddedSvgStyle();clone.insertBefore(st,clone.firstChild);
        var blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'});
        var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=cgExportName+'.svg';a.click();URL.revokeObjectURL(url);
    }
    function exportCGPDF(){
        if(typeof window.jspdf==='undefined'||!window.jspdf.jsPDF)return;
        var svgEl=svgRef.current;if(!svgEl)return;
        svgToCanvas(svgEl,function(canvas,err){
            if(err||!canvas)return;
            try{
                var JsPDF=window.jspdf.jsPDF;
                var imgW=canvas.width,imgH=canvas.height;
                var doc=new JsPDF({unit:'pt',format:'a4',orientation:imgW>=imgH?'l':'p'});
                var pW=doc.internal.pageSize.getWidth(),pH=doc.internal.pageSize.getHeight();
                var m=36,mW=pW-2*m,mH=pH-2*m,sc=Math.min(mW/imgW,mH/imgH);
                doc.addImage(canvas.toDataURL('image/png'),'PNG',m+(mW-imgW*sc)/2,m+(mH-imgH*sc)/2,imgW*sc,imgH*sc);
                doc.save(cgExportName+'.pdf');
            }catch(ex){}
        });
    }

    React.useEffect(function(){
        var el=svgRef.current;
        if(!el||!selected||!selected.callGraph)return;
        d3.select(el).selectAll('*').remove();
        var cg=selected.callGraph;
        var W=el.clientWidth||sz.w-32;
        var H=el.clientHeight||sz.h-160;

        var fnMap={};
        (selected.functions||[]).forEach(function(fn){fnMap[fn.name]=fn;});
        var nodeNames=new Set();
        cg.forEach(function(e){nodeNames.add(e.from);nodeNames.add(e.to);});
        (selected.functions||[]).forEach(function(fn){nodeNames.add(fn.name);});

        // Build node data including fanout (outgoing edges per node)
        var fanoutMap={};
        cg.forEach(function(e){fanoutMap[e.from]=(fanoutMap[e.from]||0)+1;});
        var nodes=Array.from(nodeNames).map(function(name){
            var fn=fnMap[name]||{};
            var key=fn.key||(fn.file&&fn.line!=null&&fn.name?[fn.file,String(fn.line),fn.name].join('|'):'');
            var st=(key&&data.fnStats&&data.fnStats[key])||(data.fnStats&&data.fnStats[name])||null;
            return{id:name,cc:fn.cc||1,ccLevel:fn.ccLevel||'low',line:fn.line||0,
                   internal:st?st.internal:0,external:st?st.external:0,fanout:fanoutMap[name]||0};
        });
        var links=cg.map(function(e){return{source:e.from,target:e.to};});
        var calledSet=new Set(cg.map(function(e){return e.to;}));
        var callerSet=new Set(cg.map(function(e){return e.from;}));
        var entrySet=new Set(nodes.filter(function(n){return!calledSet.has(n.id);}).map(function(n){return n.id;}));
        // Dead/unused: never called internally AND no external callers AND not in any cg edge
        var unusedSet=new Set(nodes.filter(function(n){
            return n.internal===0&&n.external===0&&!calledSet.has(n.id)&&!callerSet.has(n.id);
        }).map(function(n){return n.id;}));

        // BFS depth from entry points (for depth color mode + structured layouts)
        var nodeById={};nodes.forEach(function(n){nodeById[n.id]=n;});
        var depthBFS={};var _dq=[];
        nodes.forEach(function(n){if(entrySet.has(n.id)){depthBFS[n.id]=0;_dq.push(n.id);}});
        var _dv=new Set(_dq);
        while(_dq.length){var _dc=_dq.shift(),_dd=depthBFS[_dc];links.forEach(function(l){if(l.source===_dc&&!_dv.has(l.target)){_dv.add(l.target);depthBFS[l.target]=_dd+1;_dq.push(l.target);}});}
        nodes.forEach(function(n){if(depthBFS[n.id]===undefined)depthBFS[n.id]=0;});
        var vt=cgCfg.vizType||'node';

        // Dynamic color functions per mode
        var actMax=Math.max(1,d3.max(nodes,function(n){return n.internal+n.external;})||1);
        var foMax=Math.max(1,d3.max(nodes,function(n){return n.fanout;})||1);
        var maxCC=Math.max(1,d3.max(nodes,function(n){return n.cc;})||1);
        var actScale=d3.scaleSequential(d3.interpolateYlOrRd).domain([0,actMax]);
        var foScale=d3.scaleSequential(d3.interpolateBuPu).domain([0,foMax]);
        var depthScale=d3.scaleOrdinal(d3.schemeTableau10);
        var ccCol=function(lv){return lv==='critical'?'#ef4444':lv==='high'?'#f97316':lv==='medium'?'#6366f1':'#22c55e';};
        function nodeColor(d){
            if(unusedSet.has(d.id))return'#555';
            var cm=cgCfg.colorMode||'cc';
            if(cm==='activity')return actScale(d.internal+d.external);
            if(cm==='fanout')return foScale(d.fanout);
            if(cm==='status')return entrySet.has(d.id)?'#06b6d4':d.fanout===0?'#8b5cf6':'#6366f1';
            if(cm==='depth')return depthScale(String(depthBFS[d.id]||0));
            if(cm==='gradient'){var gs=(d.cc/maxCC*0.5)+((d.internal+d.external)/actMax*0.5);return d3.interpolateInferno(Math.min(0.9,0.15+gs*0.75));}
            return ccCol(d.ccLevel);
        }
        // Node radius varies by color mode
        function getR(d){
            if(unusedSet.has(d.id))return 10;
            if(cgCfg.colorMode==='activity'){var a=d.internal+d.external;return Math.max(10,Math.min(28,8+a*1.5));}
            if(cgCfg.colorMode==='fanout')return Math.max(10,Math.min(28,8+d.fanout*2));
            if(cgCfg.colorMode==='gradient'){var gs2=(d.cc/maxCC*0.5)+((d.internal+d.external)/actMax*0.5);return Math.max(10,Math.min(28,8+gs2*20));}
            return Math.max(12,Math.min(26,8+d.cc*1.1));
        }

        var svg=d3.select(el);
        var defs=svg.append('defs');
        defs.append('marker').attr('id','cg-arr').attr('viewBox','0 -4 8 8')
            .attr('refX',18).attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
            .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','#777');
        // Separate red arrow for outgoing highlight
        defs.append('marker').attr('id','cg-arr-out').attr('viewBox','0 -4 8 8')
            .attr('refX',18).attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
            .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','#f97316');
        defs.append('marker').attr('id','cg-arr-in').attr('viewBox','0 -4 8 8')
            .attr('refX',18).attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
            .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','#6366f1');

        var zoom=d3.zoom().scaleExtent([0.1,6]).on('zoom',function(e){g.attr('transform',e.transform);});
        svg.call(zoom);
        var g=svg.append('g');

        // ── Arc Diagram
        if(vt==='arc'){
            nodes.sort(function(a,b){return depthBFS[a.id]-depthBFS[b.id]||a.id.localeCompare(b.id);});
            var xP={};nodes.forEach(function(n,i){xP[n.id]=44+(i+0.5)*(W-88)/Math.max(1,nodes.length);});
            var yL=H*0.52;
            var larc=g.selectAll('path.al').data(links).join('path').attr('class','al').attr('fill','none')
                .attr('d',function(l){
                    var sx=xP[l.source],tx=xP[l.target];
                    if(sx==null||tx==null)return'';
                    var mx=(sx+tx)/2,ht=Math.max(20,Math.abs(tx-sx)*0.44);
                    return'M'+sx+','+yL+' Q'+mx+','+(yL-ht)+' '+tx+','+yL;
                })
                .attr('stroke',function(l){var nd=nodeById[l.source];return nd?nodeColor(nd):'#555';})
                .attr('stroke-width',1.5).attr('stroke-opacity',0.42).attr('marker-end','url(#cg-arr)');
            var narc=g.selectAll('g.an').data(nodes).join('g').attr('class','an')
                .attr('transform',function(d){return'translate('+(xP[d.id]||0)+','+yL+')';});
            narc.append('circle').attr('class','main-c').attr('r',getR).attr('fill',nodeColor)
                .attr('stroke',function(d){var c=d3.color(nodeColor(d));return c?c.brighter(0.6):'#fff';}).attr('stroke-width',1.5);
            narc.filter(function(d){return entrySet.has(d.id)&&!unusedSet.has(d.id);})
                .append('circle').attr('r',function(d){return getR(d)+5;}).attr('fill','none')
                .attr('stroke',nodeColor).attr('stroke-width',1.5).attr('stroke-dasharray','4,2.5').attr('opacity',0.6).attr('pointer-events','none');
            narc.filter(function(d){return unusedSet.has(d.id);})
                .append('text').attr('text-anchor','middle').attr('dy',4)
                .attr('font-size',function(d){return getR(d)*0.7+'px';}).attr('fill','#aaa').attr('pointer-events','none').text('✕');
            if(cgCfg.showLabels){
                narc.append('text').attr('text-anchor','middle').attr('dy',function(d){return getR(d)+14;})
                    .attr('fill',function(d){return unusedSet.has(d.id)?'var(--t3)':'var(--t1)';})
                    .attr('stroke','var(--bg1)').attr('stroke-width',2.5).attr('paint-order','stroke fill')
                    .attr('font-size','8px').attr('font-family','JetBrains Mono').attr('pointer-events','none')
                    .text(function(d){return d.id.length<=14?d.id:d.id.slice(0,13)+'…';});
                narc.append('text').attr('text-anchor','middle').attr('dy',function(d){return-getR(d)-6;})
                    .attr('fill','var(--t3)').attr('font-size','7px').attr('pointer-events','none')
                    .text(function(d){return'd'+depthBFS[d.id];});
            }
            narc.on('mouseenter',function(e,d){
                var r=el.getBoundingClientRect();setTooltip({x:e.clientX-r.left+16,y:e.clientY-r.top,d:d});
                larc.attr('stroke-opacity',function(l){return(l.source===d.id||l.target===d.id)?0.9:0.06;})
                    .attr('stroke-width',function(l){return(l.source===d.id||l.target===d.id)?2.5:1.5;});
                narc.selectAll('circle.main-c').attr('opacity',function(n){
                    var conn=links.some(function(l){return(l.source===d.id&&l.target===n.id)||(l.target===d.id&&l.source===n.id);});
                    return n.id===d.id||conn?1:0.25;
                });
            }).on('mouseleave',function(){
                setTooltip(null);larc.attr('stroke-opacity',0.42).attr('stroke-width',1.5);
                narc.selectAll('circle.main-c').attr('opacity',1);
            });
            return function(){};
        }

        // ── Flame / Icicle chart (horizontal partition by call depth)
        if(vt==='flame'){
            var tchild={};var tass=new Set();var tq2=[];
            var froots=nodes.filter(function(n){return entrySet.has(n.id);});
            if(froots.length===0)froots=nodes.slice(0,1);
            froots.forEach(function(fr){tass.add(fr.id);tq2.push(fr.id);});
            tchild['__r__']=froots.map(function(fr){return fr.id;});
            while(tq2.length){
                var tc2=tq2.shift();
                links.forEach(function(l){if(l.source===tc2&&!tass.has(l.target)){tass.add(l.target);if(!tchild[tc2])tchild[tc2]=[];tchild[tc2].push(l.target);tq2.push(l.target);}});
            }
            nodes.forEach(function(n){if(!tass.has(n.id)){if(!tchild['__r__'])tchild['__r__']=[];tchild['__r__'].push(n.id);}});
            function btree(id){
                var nd2=id==='__r__'?{id:'__r__',cc:1,ccLevel:'low',line:0,internal:0,external:0,fanout:0}:(nodeById[id]||{id:id,cc:1,ccLevel:'low',line:0,internal:0,external:0,fanout:0});
                return{id:id,nd:nd2,children:(tchild[id]||[]).map(btree),value:Math.max(1,nd2.cc)};
            }
            var froot=d3.hierarchy(btree('__r__')).sum(function(d){return Math.max(1,d.value);}).sort(function(a,b){return b.value-a.value;});
            d3.partition().size([W,H-2]).padding(1)(froot);
            var fcells=g.selectAll('g.fc').data(froot.descendants().filter(function(d){return d.data.id!=='__r__';})).join('g').attr('class','fc')
                .attr('transform',function(d){return'translate('+d.x0+','+d.y0+')';});
            fcells.append('rect')
                .attr('width',function(d){return Math.max(0,d.x1-d.x0-1);})
                .attr('height',function(d){return Math.max(0,d.y1-d.y0-1);})
                .attr('fill',function(d){return nodeColor(d.data.nd);})
                .attr('rx',2).attr('stroke','var(--bg1)').attr('stroke-width',0.5);
            fcells.filter(function(d){return(d.x1-d.x0)>36;})
                .append('text').attr('x',4).attr('y',function(d){return Math.max(11,(d.y1-d.y0)*0.5+4);})
                .attr('fill',function(d){var c=d3.hsl(nodeColor(d.data.nd));return c.l>0.55?'#1a1a2e':'#fff';})
                .attr('font-size',function(d){return Math.min(10,Math.max(7,(d.x1-d.x0)/9))+'px';})
                .attr('font-family','JetBrains Mono').attr('pointer-events','none')
                .text(function(d){var w=d.x1-d.x0-8,s=d.data.id,ch=Math.floor(w/6.5);return s.length<=ch?s:s.slice(0,Math.max(1,ch-1))+'…';});
            fcells.on('mouseenter',function(e,d){
                var r=el.getBoundingClientRect();
                setTooltip({x:e.clientX-r.left+16,y:e.clientY-r.top,d:d.data.nd});
                fcells.selectAll('rect').attr('opacity',function(f){return f===d?1:0.4;});
            }).on('mouseleave',function(){setTooltip(null);fcells.selectAll('rect').attr('opacity',1);});
            svg.call(zoom);
            return function(){};
        }

        // ── Adjacency Matrix (caller × callee heatmap)
        if(vt==='matrix'){
            var msorted=nodes.slice().sort(function(a,b){return a.id.localeCompare(b.id);});
            var nn=msorted.length;if(nn===0)return function(){};
            var mpad={t:84,r:16,b:16,l:84};
            var mcw=Math.max(6,Math.min(32,(W-mpad.l-mpad.r)/nn));
            var mch=Math.max(6,Math.min(32,(H-mpad.t-mpad.b)/nn));
            var edgeSet=new Set(links.map(function(l){return l.source+'|'+l.target;}));
            var matG=g.append('g').attr('transform','translate('+mpad.l+','+mpad.t+')');
            var mcells=[];
            msorted.forEach(function(row,ri){msorted.forEach(function(col,ci){mcells.push({row:row,col:col,ri:ri,ci:ci,has:edgeSet.has(row.id+'|'+col.id)});});});
            var cellSel=matG.selectAll('rect.mc').data(mcells).join('rect').attr('class','mc')
                .attr('x',function(d){return d.ci*mcw;}).attr('y',function(d){return d.ri*mch;})
                .attr('width',mcw-1).attr('height',mch-1)
                .attr('fill',function(d){return d.has?nodeColor(d.row):'var(--bg2)';})
                .attr('rx',1).attr('stroke','var(--border)').attr('stroke-width',0.5)
                .on('mouseenter',function(e,d){
                    if(!d.has)return;
                    var r=el.getBoundingClientRect();
                    setTooltip({x:e.clientX-r.left+16,y:e.clientY-r.top,d:d.row});
                    cellSel.attr('opacity',function(c){return c.ri===d.ri||c.ci===d.ci?1:0.12;});
                }).on('mouseleave',function(){setTooltip(null);cellSel.attr('opacity',1);});
            msorted.forEach(function(n2,i){
                var lbl=n2.id.length<=11?n2.id:n2.id.slice(0,10)+'…';
                matG.append('text').attr('x',-5).attr('y',i*mch+mch/2+3)
                    .attr('text-anchor','end').attr('font-size','8px').attr('font-family','JetBrains Mono')
                    .attr('fill',unusedSet.has(n2.id)?'var(--t3)':'var(--t1)').text(lbl);
            });
            msorted.forEach(function(n2,i){
                var lbl=n2.id.length<=11?n2.id:n2.id.slice(0,10)+'…';
                matG.append('text').attr('x',i*mcw+mcw/2).attr('y',-5)
                    .attr('text-anchor','start').attr('font-size','8px').attr('font-family','JetBrains Mono')
                    .attr('fill',unusedSet.has(n2.id)?'var(--t3)':'var(--t1)')
                    .attr('transform','rotate(-45,'+(i*mcw+mcw/2)+',-5)').text(lbl);
            });
            matG.append('text').attr('transform','translate('+-mpad.l/2+','+(nn*mch/2)+') rotate(-90)')
                .attr('text-anchor','middle').attr('font-size','8px').attr('fill','var(--t3)').text('caller →');
            matG.append('text').attr('transform','translate('+(nn*mcw/2)+','+-mpad.t/2+')')
                .attr('text-anchor','middle').attr('font-size','8px').attr('fill','var(--t3)').text('callee →');
            return function(){};
        }

        // ── Block / Hierarchy diagram (D3 tree layout, rounded-rect nodes)
        if(vt==='block'){
            var BROOT='__bg_root__',BNW=128,BNH=36,BGAPX=18,BGAPY=56;
            // BFS spanning tree from entry nodes
            var bch={};var bvisited=new Set();
            var broots=nodes.filter(function(n){return entrySet.has(n.id);});
            if(!broots.length)broots=[nodes[0]];
            var bq=broots.map(function(n){n=n.id;bvisited.add(n);return n;});
            while(bq.length){
                var bcur=bq.shift();
                links.forEach(function(l){if(l.source===bcur&&!bvisited.has(l.target)){bvisited.add(l.target);if(!bch[bcur])bch[bcur]=[];bch[bcur].push(l.target);bq.push(l.target);}});
            }
            var borphans=nodes.filter(function(n){return!bvisited.has(n.id);}).map(function(n){return n.id;});
            function btreeNode(id){return{id:id,children:(bch[id]||[]).map(btreeNode)};}
            var bsynth={id:BROOT,children:broots.map(function(r){return btreeNode(r.id);}).concat(borphans.map(function(id){return{id:id,children:[]};}))};
            var bhier=d3.hierarchy(bsynth);
            d3.tree().nodeSize([BNW+BGAPX,BNH+BGAPY])(bhier);
            var bnodes=bhier.descendants().filter(function(d){return d.data.id!==BROOT;});
            var blinks=bhier.links().filter(function(l){return l.source.data.id!==BROOT;});
            var bxMin=d3.min(bnodes,function(d){return d.x;})||0;
            var bxMax=d3.max(bnodes,function(d){return d.x;})||W;
            var byMax=d3.max(bnodes,function(d){return d.y;})||H;
            var bTotW=bxMax-bxMin+BNW+40,bTotH=byMax+BNH+40;
            var bsvg=d3.select(svgRef.current);bsvg.selectAll('*').remove();
            bsvg.append('defs').append('marker').attr('id','bg-arr').attr('viewBox','0 -4 8 8').attr('refX',8).attr('refY',0).attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
                .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','var(--border2)');
            var bg=bsvg.append('g');
            // Links
            bg.selectAll('.bgl').data(blinks).enter().append('path').attr('class','bgl')
                .attr('d',function(l){
                    var sx=l.source.x-bxMin+BNW/2+20,sy=l.source.y+BNH;
                    var tx=l.target.x-bxMin+BNW/2+20,ty=l.target.y;
                    var my=(sy+ty)/2;
                    return'M'+sx+','+sy+' C'+sx+','+my+' '+tx+','+my+' '+tx+','+(ty-5);
                })
                .attr('fill','none').attr('stroke','var(--border2)').attr('stroke-width',1.5).attr('marker-end','url(#bg-arr)');
            // Node groups
            var bng=bg.selectAll('.bgn').data(bnodes).enter().append('g').attr('class','bgn')
                .attr('transform',function(d){return'translate('+(d.x-bxMin+20)+','+d.y+')';})
                .style('cursor','pointer');
            bng.append('rect').attr('width',BNW).attr('height',BNH).attr('rx',9).attr('ry',9)
                .attr('fill',function(d){var nd=nodeById[d.data.id];return nd?nodeColor(nd):'#555';})
                .attr('stroke',function(d){return entrySet.has(d.data.id)?'#06b6d4':'var(--bg0)';})
                .attr('stroke-width',function(d){return entrySet.has(d.data.id)?2:1.5;});
            // CC badge
            bng.each(function(d){
                var nd=nodeById[d.data.id];if(!nd)return;
                var g=d3.select(this);
                g.append('circle').attr('cx',BNW-7).attr('cy',7).attr('r',9).attr('fill','rgba(0,0,0,0.35)').attr('stroke','none');
                g.append('text').attr('x',BNW-7).attr('y',7).attr('text-anchor','middle').attr('dominant-baseline','middle')
                    .attr('font-size',7).attr('fill','#fff').attr('pointer-events','none').text(nd.cc||1);
            });
            // Labels
            bng.append('text').attr('x',BNW/2).attr('y',BNH/2).attr('text-anchor','middle').attr('dominant-baseline','middle')
                .attr('font-size',10).attr('pointer-events','none').attr('paint-order','stroke fill')
                .attr('stroke','rgba(0,0,0,0.25)').attr('stroke-width',2)
                .attr('fill',function(d){var nd=nodeById[d.data.id];var col=nd?nodeColor(nd):'#555';return d3.hsl(col).l>0.52?'#111':'#fff';})
                .text(function(d){var s=d.data.id;return s.length>14?s.slice(0,13)+'…':s;});
            // Hover highlight
            bng.on('mouseover',function(event,d){d3.select(this).select('rect').attr('stroke','var(--acc)').attr('stroke-width',2.5);})
               .on('mouseout',function(event,d){
                    d3.select(this).select('rect')
                        .attr('stroke',entrySet.has(d.data.id)?'#06b6d4':'var(--bg0)')
                        .attr('stroke-width',entrySet.has(d.data.id)?2:1.5);
               });
            // Pan + zoom with initial fit
            var bz=d3.zoom().scaleExtent([0.1,3]).on('zoom',function(event){bg.attr('transform',event.transform);});
            bsvg.call(bz);
            var bsc=Math.min(W/bTotW,H/bTotH,1)*0.9;
            bsvg.call(bz.transform,d3.zoomIdentity.translate((W-bTotW*bsc)/2+20,(H-bTotH*bsc)/2+20).scale(bsc));
            return function(){};
        }

        var sim=d3.forceSimulation(nodes);
        var lo=cgCfg.layout;
        if(lo==='radial'){
            var rr=Math.min(W,H)*0.4;
            nodes.forEach(function(n,i){n.targetX=W/2+Math.cos(i/nodes.length*2*Math.PI)*rr;n.targetY=H/2+Math.sin(i/nodes.length*2*Math.PI)*rr;});
            sim.force('link',d3.forceLink(links).id(function(d){return d.id;}).distance(cgCfg.linkDist*0.5).strength(0.05))
               .force('charge',d3.forceManyBody().strength(-cgCfg.spacing*0.35))
               .force('collision',d3.forceCollide().radius(function(d){return getR(d)+10;}))
               .force('x',d3.forceX(function(d){return d.targetX;}).strength(0.82))
               .force('y',d3.forceY(function(d){return d.targetY;}).strength(0.82));
        }else if(lo==='grid'){
            var gcols=Math.ceil(Math.sqrt(nodes.length));
            var cw2=W/(gcols+1),ch2=H/(Math.ceil(nodes.length/gcols)+1);
            nodes.forEach(function(n,i){n.targetX=(i%gcols+1)*cw2;n.targetY=(Math.floor(i/gcols)+1)*ch2;});
            sim.force('link',d3.forceLink(links).id(function(d){return d.id;}).distance(cgCfg.linkDist*1.5).strength(0.02))
               .force('collision',d3.forceCollide().radius(function(d){return getR(d)+16;}))
               .force('x',d3.forceX(function(d){return d.targetX;}).strength(1))
               .force('y',d3.forceY(function(d){return d.targetY;}).strength(1));
        }else if(lo==='layers'){
            // BFS depth-based layered layout (call depth from entry points left→right)
            var depthMap={};
            var bq=[];
            nodes.forEach(function(n){if(entrySet.has(n.id)){depthMap[n.id]=0;bq.push(n.id);}});
            var bvis=new Set(bq);
            while(bq.length){
                var cur=bq.shift(),cd=depthMap[cur];
                links.forEach(function(l){var s=l.source,t=l.target;if(s===cur&&!bvis.has(t)){bvis.add(t);depthMap[t]=cd+1;bq.push(t);}});
            }
            nodes.forEach(function(n){if(depthMap[n.id]===undefined)depthMap[n.id]=0;});
            var byD={};
            nodes.forEach(function(n){var d=depthMap[n.id];if(!byD[d])byD[d]=[];byD[d].push(n);});
            var depths=Object.keys(byD).map(Number).sort(function(a,b){return a-b;});
            depths.forEach(function(d,di){
                var grp=byD[d],x=(di+1)*W/(depths.length+1);
                grp.forEach(function(n,ni){n.targetX=x;n.targetY=(ni+1)*H/(grp.length+1);});
            });
            sim.force('link',d3.forceLink(links).id(function(d){return d.id;}).distance(cgCfg.linkDist*1.2).strength(0.18))
               .force('charge',d3.forceManyBody().strength(-cgCfg.spacing*0.4).distanceMax(250))
               .force('collision',d3.forceCollide().radius(function(d){return getR(d)+12;}))
               .force('x',d3.forceX(function(d){return d.targetX||W/2;}).strength(0.92))
               .force('y',d3.forceY(function(d){return d.targetY||H/2;}).strength(0.55));
        }else if(lo==='tree'){
            // Top-down tree: entry nodes at top, sinks at bottom
            var tdDepth={};
            var tdQ=[];
            nodes.forEach(function(n){if(entrySet.has(n.id)){tdDepth[n.id]=0;tdQ.push(n.id);}});
            var tdVis=new Set(tdQ);
            while(tdQ.length){
                var tc=tdQ.shift(),td=tdDepth[tc];
                links.forEach(function(l){var s=l.source,t=l.target;if(s===tc&&!tdVis.has(t)){tdVis.add(t);tdDepth[t]=td+1;tdQ.push(t);}});
            }
            nodes.forEach(function(n){if(tdDepth[n.id]===undefined)tdDepth[n.id]=0;});
            var tdByD={};
            nodes.forEach(function(n){var d=tdDepth[n.id];if(!tdByD[d])tdByD[d]=[];tdByD[d].push(n);});
            var tdDs=Object.keys(tdByD).map(Number).sort(function(a,b){return a-b;});
            tdDs.forEach(function(d,di){
                var grp=tdByD[d],y=(di+1)*H/(tdDs.length+1);
                grp.forEach(function(n,ni){n.targetX=(ni+1)*W/(grp.length+1);n.targetY=y;});
            });
            sim.force('link',d3.forceLink(links).id(function(d){return d.id;}).distance(cgCfg.linkDist).strength(0.18))
               .force('charge',d3.forceManyBody().strength(-cgCfg.spacing*0.5).distanceMax(280))
               .force('collision',d3.forceCollide().radius(function(d){return getR(d)+12;}))
               .force('x',d3.forceX(function(d){return d.targetX||W/2;}).strength(0.65))
               .force('y',d3.forceY(function(d){return d.targetY||H/2;}).strength(0.92));
        }else{
            sim.force('link',d3.forceLink(links).id(function(d){return d.id;}).distance(cgCfg.linkDist).strength(0.3))
               .force('charge',d3.forceManyBody().strength(-cgCfg.spacing))
               .force('collision',d3.forceCollide().radius(function(d){return getR(d)+10;}))
               .force('center',d3.forceCenter(W/2,H/2));
        }
        simRef.current=sim;

        var link=g.selectAll('path').data(links).join('path')
            .attr('fill','none').attr('stroke','#555').attr('stroke-width',1.5)
            .attr('stroke-opacity',0.5).attr('marker-end','url(#cg-arr)');

        var node=g.selectAll('g.cgn').data(nodes).join('g').attr('class','cgn').style('cursor','pointer');
        node.call(d3.drag()
            .on('start',function(e,d){if(!e.active)sim.alphaTarget(0.1).restart();d.fx=d.x;d.fy=d.y;})
            .on('drag',function(e,d){d.fx=e.x;d.fy=e.y;})
            .on('end',function(e,d){if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));

        node.on('mouseenter',function(e,d){
            var r=el.getBoundingClientRect();
            setTooltip({x:e.clientX-r.left+16,y:e.clientY-r.top,d:d});
            link.attr('stroke-opacity',function(l){var s=l.source.id||l.source,t=l.target.id||l.target;return(s===d.id||t===d.id)?1:0.06;})
                .attr('stroke',function(l){var s=l.source.id||l.source,t=l.target.id||l.target;return s===d.id?'#f97316':t===d.id?'#6366f1':'#555';})
                .attr('marker-end',function(l){var s=l.source.id||l.source,t=l.target.id||l.target;return s===d.id?'url(#cg-arr-out)':t===d.id?'url(#cg-arr-in)':'url(#cg-arr)';})
                .attr('stroke-width',function(l){var s=l.source.id||l.source,t=l.target.id||l.target;return(s===d.id||t===d.id)?2.5:1.5;});
            node.selectAll('circle.main-c').attr('opacity',function(n){
                var nid=n.id;
                var connected=links.some(function(l){var s=l.source.id||l.source,t=l.target.id||l.target;return(s===d.id&&t===nid)||(t===d.id&&s===nid);});
                return nid===d.id||connected?1:0.25;
            });
        }).on('mouseleave',function(){
            setTooltip(null);
            link.attr('stroke-opacity',0.5).attr('stroke','#555').attr('stroke-width',1.5).attr('marker-end','url(#cg-arr)');
            node.selectAll('circle.main-c').attr('opacity',1);
        });

        // Entry-point dashed outer ring
        node.filter(function(d){return entrySet.has(d.id)&&!unusedSet.has(d.id);})
            .append('circle').attr('r',function(d){return getR(d)+6;}).attr('fill','none')
            .attr('stroke',function(d){return nodeColor(d);}).attr('stroke-width',1.8)
            .attr('stroke-dasharray','4,2.5').attr('opacity',0.6).attr('pointer-events','none');

        // Main circle
        node.append('circle').attr('class','main-c').attr('r',getR)
            .attr('fill',function(d){return nodeColor(d);})
            .attr('stroke',function(d){
                if(unusedSet.has(d.id))return'#888';
                var c=d3.color(nodeColor(d));return c?c.brighter(0.6):'#fff';
            })
            .attr('stroke-width',function(d){return unusedSet.has(d.id)?1.5:2;})
            .attr('stroke-dasharray',function(d){return unusedSet.has(d.id)?'3,2':'none';});

        // Dead/unused: gray X marker
        node.filter(function(d){return unusedSet.has(d.id);})
            .append('text').attr('text-anchor','middle').attr('dy',4)
            .attr('font-size',function(d){return getR(d)*0.7+'px';})
            .attr('fill','#aaa').attr('pointer-events','none').text('✕');

        // External-caller badge (top-right dot)
        node.filter(function(d){return d.external>0&&!unusedSet.has(d.id);})
            .append('circle').attr('cx',function(d){return getR(d)*0.72;}).attr('cy',function(d){return-getR(d)*0.72;})
            .attr('r',6).attr('fill','#f97316').attr('stroke','var(--bg1)').attr('stroke-width',1.5).attr('pointer-events','none');
        node.filter(function(d){return d.external>0&&!unusedSet.has(d.id);})
            .append('text').attr('x',function(d){return getR(d)*0.72;}).attr('y',function(d){return-getR(d)*0.72+4;})
            .attr('text-anchor','middle').attr('font-size','7px').attr('font-family','JetBrains Mono')
            .attr('fill','white').attr('pointer-events','none').text(function(d){return d.external>9?'9+':String(d.external);});

        // Sink badge (bottom-right, purple dot for functions that call nothing)
        node.filter(function(d){return d.fanout===0&&calledSet.has(d.id)&&!unusedSet.has(d.id);})
            .append('circle').attr('cx',function(d){return getR(d)*0.72;}).attr('cy',function(d){return getR(d)*0.72;})
            .attr('r',5).attr('fill','#8b5cf6').attr('stroke','var(--bg1)').attr('stroke-width',1.5).attr('pointer-events','none');

        if(cgCfg.showLabels){
            node.append('text').attr('text-anchor','middle').attr('dy',function(d){return getR(d)+14;})
                .attr('fill',function(d){return unusedSet.has(d.id)?'var(--t3)':'var(--t1)';})
                .attr('stroke','var(--bg1)').attr('stroke-width',2.5).attr('paint-order','stroke fill')
                .attr('font-size','9px').attr('font-family','JetBrains Mono').attr('pointer-events','none')
                .text(function(d){return d.id.length<=18?d.id:d.id.slice(0,17)+'…';});
        }

        sim.on('tick',function(){
            if(cgCfg.curvedLinks){
                link.attr('d',function(d){var dx=d.target.x-d.source.x,dy=d.target.y-d.source.y,dr=Math.sqrt(dx*dx+dy*dy)*1.2;return'M'+d.source.x+','+d.source.y+'A'+dr+','+dr+' 0 0,1 '+d.target.x+','+d.target.y;});
            }else{
                link.attr('d',function(d){return'M'+d.source.x+','+d.source.y+'L'+d.target.x+','+d.target.y;});
            }
            node.attr('transform',function(d){return'translate('+d.x+','+d.y+')';});
        });
        return function(){if(simRef.current)simRef.current.stop();};
    },[selected&&selected.path,cgCfg.vizType,cgCfg.layout,cgCfg.spacing,cgCfg.linkDist,cgCfg.showLabels,cgCfg.curvedLinks,cgCfg.colorMode,sz.w,sz.h]);

    if(!selected||!selected.callGraph)return null;
    var cg=selected.callGraph;
    var fns=selected.functions||[];
    var calledSetM=new Set(cg.map(function(e){return e.to;}));
    var callerSetM=new Set(cg.map(function(e){return e.from;}));
    var entryCountM=fns.filter(function(f){return!calledSetM.has(f.name);}).length;
    var unusedCountM=fns.filter(function(f){return!calledSetM.has(f.name)&&!callerSetM.has(f.name)&&(function(){var fn=f;var key=fn.key||(fn.file&&fn.line!=null&&fn.name?[fn.file,String(fn.line),fn.name].join('|'):'');var st=(key&&data.fnStats&&data.fnStats[key])||(data.fnStats&&data.fnStats[f.name])||null;return st?st.internal===0&&st.external===0:true;})();}).length;
    var avgCC=fns.length?Math.round(fns.reduce(function(s,f){return s+(f.cc||1);},0)/fns.length*10)/10:0;

    // Legend content depends on color mode
    function renderLegend(){
        var cm=cgCfg.colorMode;
        if(cm==='activity'){return React.createElement(React.Fragment,null,
            React.createElement('span',{style:{fontWeight:600,color:'var(--t2)'}},'Activity (calls):'),
            React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                React.createElement('span',{style:{width:60,height:9,borderRadius:4,background:'linear-gradient(to right,#ffffb2,#fd8d3c,#bd0026)',display:'inline-block'}}),
                React.createElement('span',null,'Low → High'))
        );}
        if(cm==='fanout'){return React.createElement(React.Fragment,null,
            React.createElement('span',{style:{fontWeight:600,color:'var(--t2)'}},'Fan-out (calls to):'),
            React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                React.createElement('span',{style:{width:60,height:9,borderRadius:4,background:'linear-gradient(to right,#f0e6ff,#7c3aed)',display:'inline-block'}}),
                React.createElement('span',null,'Low → High'))
        );}
        if(cm==='status'){return React.createElement(React.Fragment,null,
            React.createElement('span',{style:{fontWeight:600,color:'var(--t2)'}},'Status:'),
            [['#06b6d4','Entry'],['#6366f1','Regular'],['#8b5cf6','Sink'],['#555','Unused']].map(function(x,i){return React.createElement('span',{key:i,style:{display:'flex',alignItems:'center',gap:4}},React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',background:x[0],display:'inline-block'}}),x[1]);})
        );}
        if(cm==='depth'){return React.createElement(React.Fragment,null,
            React.createElement('span',{style:{fontWeight:600,color:'var(--t2)'}},'Call depth:'),
            d3.schemeTableau10.slice(0,6).map(function(c,i){return React.createElement('span',{key:i,style:{display:'flex',alignItems:'center',gap:4}},
                React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',background:c,display:'inline-block'}}),React.createElement('span',null,'L'+i));})
        );}
        if(cm==='gradient'){return React.createElement(React.Fragment,null,
            React.createElement('span',{style:{fontWeight:600,color:'var(--t2)'}},'Complexity + Activity:'),
            React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                React.createElement('span',{style:{width:70,height:9,borderRadius:4,background:'linear-gradient(to right,#280b53,#9c179e,#ed7953,#fde724)',display:'inline-block'}}),
                React.createElement('span',null,'Low → High'))
        );}
        return React.createElement(React.Fragment,null,
            React.createElement('span',{style:{fontWeight:600,color:'var(--t2)'}},'CC level:'),
            [['#22c55e','Low ≤4'],['#6366f1','Med 5–10'],['#f97316','High 11–20'],['#ef4444','Crit 21+']].map(function(item,i){
                return React.createElement('span',{key:i,style:{display:'flex',alignItems:'center',gap:4}},
                    React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',background:item[0],display:'inline-block'}}),item[1]);
            })
        );
    }

    return React.createElement('div',{className:'modal-overlay',onClick:onClose,style:{zIndex:1000}},
        React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},
            style:{width:sz.w,height:sz.h,maxWidth:'99vw',maxHeight:'99vh',display:'flex',flexDirection:'column',padding:0,overflow:'hidden',position:'relative',boxSizing:'border-box'}},

            // ── Header
            React.createElement('div',{className:'modal-header',style:{padding:'9px 14px',flexShrink:0}},
                React.createElement('div',{className:'modal-title'},
                    React.createElement(Icon,{name:'bolt',size:'m'}),' Call Graph — ',selected.name,
                    React.createElement('span',{className:'badge badge-default',style:{marginLeft:8}},fns.length,' fns'),
                    React.createElement('span',{className:'badge badge-default',style:{marginLeft:4}},cg.length,' edges'),
                    unusedCountM>0&&React.createElement('span',{className:'badge badge-warning',style:{marginLeft:4}},unusedCountM,' unused')
                ),
                React.createElement('button',{className:'modal-close',onClick:onClose},'×')
            ),

            // ── Toolbar row 0: viz type tabs + export buttons
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,padding:'5px 14px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',flexShrink:0}},
                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginRight:4}},'View:'),
                React.createElement('div',{className:'view-toggle'},
                    [['node','Node Graph'],['arc','Arc'],['flame','Flame'],['matrix','Matrix'],['block','Block']].map(function(vz){
                        return React.createElement('button',{key:vz[0],className:'view-btn'+((cgCfg.vizType||'node')===vz[0]?' active':''),
                            onClick:function(){setCgCfg(Object.assign({},cgCfg,{vizType:vz[0]}));}},vz[1]);
                    })
                ),
                React.createElement('div',{style:{marginLeft:'auto',display:'flex',gap:4}},
                    React.createElement('button',{className:'tool-btn',title:'Export PNG',onClick:exportCGPNG,style:{fontSize:9,padding:'2px 8px',height:22,lineHeight:'normal'}},'PNG'),
                    React.createElement('button',{className:'tool-btn',title:'Export SVG',onClick:exportCGSVG,style:{fontSize:9,padding:'2px 8px',height:22,lineHeight:'normal'}},'SVG'),
                    React.createElement('button',{className:'tool-btn',title:'Export PDF',onClick:exportCGPDF,style:{fontSize:9,padding:'2px 8px',height:22,lineHeight:'normal'}},'PDF')
                )
            ),
            // ── Toolbar row 1: layout (node only) + color mode
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'5px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',flexWrap:'wrap',flexShrink:0}},
                (cgCfg.vizType==='node'||!cgCfg.vizType)&&React.createElement(React.Fragment,null,
                    React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginRight:2}},'Layout:'),
                    React.createElement('div',{className:'view-toggle'},
                        [['force','Force'],['radial','Radial'],['grid','Grid'],['layers','Layers'],['tree','Tree']].map(function(la){
                            return React.createElement('button',{key:la[0],className:'view-btn'+(cgCfg.layout===la[0]?' active':''),onClick:function(){setCgCfg(Object.assign({},cgCfg,{layout:la[0]}));}},la[1]);
                        })
                    ),
                    React.createElement('div',{style:{width:1,height:18,background:'var(--border)',margin:'0 4px'}})
                ),
                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginRight:2}},'Color:'),
                React.createElement('select',{className:'viz-select',style:{fontSize:9,padding:'2px 6px',height:24},value:cgCfg.colorMode||'cc',onChange:function(e){setCgCfg(Object.assign({},cgCfg,{colorMode:e.target.value}));}},
                    React.createElement('option',{value:'cc'},'CC Level'),
                    React.createElement('option',{value:'activity'},'Activity'),
                    React.createElement('option',{value:'fanout'},'Fan-out'),
                    React.createElement('option',{value:'status'},'Status'),
                    React.createElement('option',{value:'depth'},'Depth'),
                    React.createElement('option',{value:'gradient'},'Gradient')
                )
            ),

            // ── Toolbar row 2: sliders + toggles (hidden for block view)
            cgCfg.vizType!=='block'&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'4px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',flexWrap:'wrap',flexShrink:0}},
                React.createElement('div',{className:'config-row',style:{gap:5}},
                    React.createElement('span',{className:'config-label'},'Spread'),
                    React.createElement('input',{type:'range',className:'config-slider',min:'40',max:'500',value:cgCfg.spacing,onChange:function(e){setCgCfg(Object.assign({},cgCfg,{spacing:parseInt(e.target.value)}));}}),
                    React.createElement('span',{className:'config-value'},cgCfg.spacing)
                ),
                React.createElement('div',{className:'config-row',style:{gap:5}},
                    React.createElement('span',{className:'config-label'},'Link dist'),
                    React.createElement('input',{type:'range',className:'config-slider',min:'20',max:'250',value:cgCfg.linkDist,onChange:function(e){setCgCfg(Object.assign({},cgCfg,{linkDist:parseInt(e.target.value)}));}}),
                    React.createElement('span',{className:'config-value'},cgCfg.linkDist)
                ),
                React.createElement('label',{className:'config-check',style:{marginLeft:4}},
                    React.createElement('input',{type:'checkbox',checked:cgCfg.showLabels,onChange:function(e){setCgCfg(Object.assign({},cgCfg,{showLabels:e.target.checked}));}}),
                    'Labels'
                ),
                React.createElement('label',{className:'config-check'},
                    React.createElement('input',{type:'checkbox',checked:cgCfg.curvedLinks,onChange:function(e){setCgCfg(Object.assign({},cgCfg,{curvedLinks:e.target.checked}));}}),
                    'Curved'
                ),
                React.createElement('span',{style:{marginLeft:'auto',fontSize:9,color:'var(--t3)'}},'Drag nodes · Scroll to zoom · Hover to trace')
            ),

            // ── Stats bar
            React.createElement('div',{style:{display:'flex',gap:18,padding:'4px 14px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',fontSize:9,color:'var(--t3)',flexShrink:0,flexWrap:'wrap'}},
                React.createElement('span',null,React.createElement('strong',{style:{color:'var(--acc)'}},fns.length),' fns'),
                React.createElement('span',null,React.createElement('strong',{style:{color:'var(--cyan)'}},cg.length),' edges'),
                React.createElement('span',null,React.createElement('strong',{style:{color:'var(--green)'}},entryCountM),' entry pts'),
                unusedCountM>0&&React.createElement('span',null,React.createElement('strong',{style:{color:'var(--orange)'}},unusedCountM),' unused'),
                React.createElement('span',null,'avg CC ',React.createElement('strong',{style:{color:avgCC>10?'var(--red)':avgCC>4?'var(--orange)':'var(--green)'}},avgCC))
            ),

            // ── SVG canvas
            React.createElement('div',{style:{flex:1,position:'relative',overflow:'hidden',minHeight:0}},
                React.createElement('svg',{ref:svgRef,style:{width:'100%',height:'100%',display:'block',background:'var(--bg1)'}}),
                tooltip&&React.createElement('div',{style:{position:'absolute',left:Math.min(tooltip.x,sz.w-200),top:tooltip.y,background:'var(--bg0)',border:'1px solid var(--border)',borderRadius:6,padding:'9px 11px',fontSize:9,pointerEvents:'none',minWidth:168,zIndex:10,boxShadow:'0 4px 20px rgba(0,0,0,0.38)'}},
                    React.createElement('div',{style:{fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:'var(--t0)',marginBottom:5,fontSize:10}},tooltip.d.id,'()'),
                    (tooltip.d.internal===0&&tooltip.d.external===0&&tooltip.d.fanout===0)&&React.createElement('div',{style:{color:'var(--orange)',fontSize:8,marginBottom:4,background:'rgba(255,159,67,0.12)',padding:'2px 5px',borderRadius:3}},'⚠ Unused — never called anywhere'),
                    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'auto 1fr',gap:'3px 12px'}},
                        React.createElement('span',{style:{color:'var(--t3)'}},'CC:'),
                        React.createElement('span',{style:{color:tooltip.d.ccLevel==='critical'?'var(--red)':tooltip.d.ccLevel==='high'?'var(--orange)':tooltip.d.ccLevel==='medium'?'var(--acc)':'var(--green)'}},tooltip.d.cc,' (',tooltip.d.ccLevel,')'),
                        React.createElement('span',{style:{color:'var(--t3)'}},'Internal calls:'),React.createElement('span',null,tooltip.d.internal),
                        React.createElement('span',{style:{color:'var(--t3)'}},'External calls:'),React.createElement('span',null,tooltip.d.external),
                        React.createElement('span',{style:{color:'var(--t3)'}},'Calls out to:'),React.createElement('span',null,tooltip.d.fanout,' fn'+(tooltip.d.fanout!==1?'s':'')),
                        tooltip.d.line>0&&React.createElement(React.Fragment,null,React.createElement('span',{style:{color:'var(--t3)'}},'Line:'),React.createElement('span',null,'L',tooltip.d.line))
                    )
                )
            ),

            // ── Legend
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'6px 14px',background:'var(--bg2)',borderTop:'1px solid var(--border)',fontSize:9,color:'var(--t3)',flexWrap:'wrap',flexShrink:0}},
                renderLegend(),
                React.createElement('span',{style:{width:1,height:14,background:'var(--border)',margin:'0 2px'}}),
                React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                    React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',border:'1.5px dashed #06b6d4',display:'inline-block'}}),
                    'Dashed = entry pt'),
                React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                    React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',background:'#f97316',display:'inline-block'}}),
                    'Top badge = ext callers'),
                React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                    React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',background:'#8b5cf6',display:'inline-block'}}),
                    'Bottom badge = sink'),
                React.createElement('span',{style:{display:'flex',alignItems:'center',gap:4}},
                    React.createElement('span',{style:{width:9,height:9,borderRadius:'50%',background:'#555',border:'1px dashed #888',display:'inline-block'}},React.createElement('span',{style:{fontSize:6,color:'#aaa',display:'block',textAlign:'center',lineHeight:'9px'}},'✕')),
                    'Gray ✕ = unused')
            ),

            // ── Resize handle (bottom-right corner)
            React.createElement('div',{
                onMouseDown:startResize,
                title:'Drag to resize',
                style:{position:'absolute',bottom:0,right:0,width:18,height:18,cursor:'se-resize',
                       background:'var(--border)',borderRadius:'4px 0 6px 0',opacity:0.7,
                       display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'var(--t3)',
                       userSelect:'none',zIndex:20}
            },'⊿')
        )
    );
}
