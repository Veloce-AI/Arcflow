/* shared.js - Shared React components and utility functions */

function Icon(props){
    var name=props.name||'file';
    var size=props.size||'m';
    var className='icon icon-'+size+(props.className?' '+props.className:'');
    var common={fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round'};
    var children;
    switch(name){
        case 'logo':
            children=[
                React.createElement('line',{key:'e1',x1:'5',y1:'18',x2:'12',y2:'6',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round'}),
                React.createElement('line',{key:'e2',x1:'12',y1:'6',x2:'19',y2:'18',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round'}),
                React.createElement('line',{key:'e3',x1:'5',y1:'18',x2:'19',y2:'18',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round'}),
                React.createElement('circle',{key:'n1',cx:'5',cy:'18',r:'2.5',fill:'currentColor',stroke:'none'}),
                React.createElement('circle',{key:'n2',cx:'12',cy:'6',r:'2.5',fill:'currentColor',stroke:'none'}),
                React.createElement('circle',{key:'n3',cx:'19',cy:'18',r:'2.5',fill:'currentColor',stroke:'none'})
            ];
            break;
        case 'bolt':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M13 2 4 14h6l-1 8 9-12h-6l1-8z'},common))];
            break;
        case 'chevron-left':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M15 18l-6-6 6-6'},common))];
            break;
        case 'search':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'11',cy:'11',r:'7'},common)),React.createElement('line',Object.assign({key:'l1',x1:'20',y1:'20',x2:'16.65',y2:'16.65'},common))];
            break;
        case 'folder':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z'},common))];
            break;
        case 'folder-open':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M3 9.5A1.5 1.5 0 0 1 4.5 8H9l2 2h8.5A1.5 1.5 0 0 1 21 11.5V12'},common)),React.createElement('path',Object.assign({key:'p2',d:'M4 12.5h17l-1.5 5A2 2 0 0 1 17.58 19H5.92A2 2 0 0 1 4 17.5z'},common))];
            break;
        case 'file':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'14 3 14 8 19 8'},common))];
            break;
        case 'file-pdf':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'14 3 14 8 19 8'},common)),React.createElement('path',Object.assign({key:'p3',d:'M8 13h8M8 17h5'},common))];
            break;
        case 'layers':
            children=[React.createElement('polygon',Object.assign({key:'p1',points:'12 3 3 8 12 13 21 8 12 3'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'3 12 12 17 21 12'},common)),React.createElement('polyline',Object.assign({key:'p3',points:'3 16 12 21 21 16'},common))];
            break;
        case 'activity':
            children=[React.createElement('polyline',Object.assign({key:'p1',points:'3 12 8 12 11 6 14 18 17 12 21 12'},common))];
            break;
        case 'shield':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z'},common))];
            break;
        case 'lock':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'5',y:'11',width:'14',height:'10',rx:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M8 11V8a4 4 0 0 1 8 0v3'},common))];
            break;
        case 'factory':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M3 21h18'},common)),React.createElement('path',Object.assign({key:'p2',d:'M5 21V9l5 3V9l5 3V6l4 2v13'},common)),React.createElement('path',Object.assign({key:'p3',d:'M15 6V3h3v5'},common))];
            break;
        case 'eye':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z'},common)),React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'3'},common))];
            break;
        case 'hook':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M9 10V7a3 3 0 0 1 6 0v7a4 4 0 1 1-8 0v-1'},common))];
            break;
        case 'spark':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M19 15l.8 1.7L21.5 18l-1.7.8L19 20.5l-.8-1.7L16.5 18l1.7-.8z'},common))];
            break;
        case 'globe':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'9'},common)),React.createElement('path',Object.assign({key:'p1',d:'M3 12h18'},common)),React.createElement('path',Object.assign({key:'p2',d:'M12 3a15 15 0 0 1 0 18'},common)),React.createElement('path',Object.assign({key:'p3',d:'M12 3a15 15 0 0 0 0 18'},common))];
            break;
        case 'layout':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'3',y:'4',width:'18',height:'16',rx:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M9 4v16'},common)),React.createElement('path',Object.assign({key:'p2',d:'M9 10h12'},common))];
            break;
        case 'box':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M21 8.5 12 3 3 8.5 12 14z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M3 8.5V16l9 5 9-5V8.5'},common)),React.createElement('path',Object.assign({key:'p3',d:'M12 14v7'},common))];
            break;
        case 'archive':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'3',y:'3',width:'18',height:'5',rx:'1'},common)),React.createElement('path',Object.assign({key:'p1',d:'M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8'},common)),React.createElement('path',Object.assign({key:'p2',d:'M10 12h4'},common))];
            break;
        case 'building':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M4 21h16'},common)),React.createElement('path',Object.assign({key:'p2',d:'M7 21V8l5-5 5 5v13'},common)),React.createElement('path',Object.assign({key:'p3',d:'M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01'},common))];
            break;
        case 'route':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'6',cy:'18',r:'2'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'18',cy:'6',r:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M8 18h4a4 4 0 0 0 4-4V8'},common))];
            break;
        case 'database':
            children=[React.createElement('ellipse',Object.assign({key:'e1',cx:'12',cy:'5',rx:'7',ry:'3'},common)),React.createElement('path',Object.assign({key:'p1',d:'M5 5v10c0 1.7 3.1 3 7 3s7-1.3 7-3V5'},common)),React.createElement('path',Object.assign({key:'p2',d:'M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3'},common)),React.createElement('path',Object.assign({key:'p3',d:'M5 15c0 1.7 3.1 3 7 3s7-1.3 7-3'},common))];
            break;
        case 'refresh':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M20 11a8 8 0 0 0-14.9-3'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'4 4 5 8 9 7'},common)),React.createElement('path',Object.assign({key:'p3',d:'M4 13a8 8 0 0 0 14.9 3'},common)),React.createElement('polyline',Object.assign({key:'p4',points:'20 20 19 16 15 17'},common))];
            break;
        case 'puzzle':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M10 4H6a2 2 0 0 0-2 2v4h2a2 2 0 1 1 0 4H4v4a2 2 0 0 0 2 2h4v-2a2 2 0 1 1 4 0v2h4a2 2 0 0 0 2-2v-4h-2a2 2 0 1 1 0-4h2V6a2 2 0 0 0-2-2h-4v2a2 2 0 1 1-4 0z'},common))];
            break;
        case 'radio':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M16.24 7.76a6 6 0 0 1 0 8.48'},common)),React.createElement('path',Object.assign({key:'p2',d:'M7.76 16.24a6 6 0 0 1 0-8.48'},common)),React.createElement('path',Object.assign({key:'p3',d:'M19.07 4.93a10 10 0 0 1 0 14.14'},common)),React.createElement('path',Object.assign({key:'p4',d:'M4.93 19.07a10 10 0 0 1 0-14.14'},common))];
            break;
        case 'link':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13'},common)),React.createElement('path',Object.assign({key:'p2',d:'M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11'},common))];
            break;
        case 'external-link':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'15 3 21 3 21 9'},common)),React.createElement('line',Object.assign({key:'p3',x1:'10',y1:'14',x2:'21',y2:'3'},common))];
            break;
        case 'warning':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 4 3 20h18L12 4z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M12 9v5'},common)),React.createElement('path',Object.assign({key:'p3',d:'M12 17h.01'},common))];
            break;
        case 'scroll':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M7 3h10a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M9 8h6M9 12h6M9 16h4'},common))];
            break;
        case 'broom':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M14 4 6 12'},common)),React.createElement('path',Object.assign({key:'p2',d:'m11 7 6 6'},common)),React.createElement('path',Object.assign({key:'p3',d:'M3 14h7l3 7H6z'},common))];
            break;
        case 'split':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M8 4H5a2 2 0 0 0-2 2v3'},common)),React.createElement('path',Object.assign({key:'p2',d:'M16 20h3a2 2 0 0 0 2-2v-3'},common)),React.createElement('path',Object.assign({key:'p3',d:'M12 4v16'},common)),React.createElement('path',Object.assign({key:'p4',d:'M9 8 12 5 15 8'},common)),React.createElement('path',Object.assign({key:'p5',d:'M15 16 12 19 9 16'},common))];
            break;
        case 'copy':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'9',y:'9',width:'11',height:'11',rx:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'},common))];
            break;
        case 'beaker':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M10 3v5l-5 8a3 3 0 0 0 2.57 4.5h8.86A3 3 0 0 0 19 16l-5-8V3'},common)),React.createElement('path',Object.assign({key:'p2',d:'M8 13h8'},common))];
            break;
        case 'ban':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'9'},common)),React.createElement('path',Object.assign({key:'p1',d:'M5 19 19 5'},common))];
            break;
        case 'key':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'8',cy:'15',r:'4'},common)),React.createElement('path',Object.assign({key:'p1',d:'M12 15h9'},common)),React.createElement('path',Object.assign({key:'p2',d:'M18 12v6'},common)),React.createElement('path',Object.assign({key:'p3',d:'M21 13v4'},common))];
            break;
        case 'pull-request':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'6',cy:'5',r:'2'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'18',cy:'7',r:'2'},common)),React.createElement('circle',Object.assign({key:'c3',cx:'18',cy:'19',r:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M8 5h4a4 4 0 0 1 4 4v8'},common)),React.createElement('path',Object.assign({key:'p2',d:'M16 9V7'},common))];
            break;
        case 'export':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 3v12'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'8 7 12 3 16 7'},common)),React.createElement('path',Object.assign({key:'p3',d:'M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5'},common))];
            break;
        case 'share':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'18',cy:'5',r:'2'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'6',cy:'12',r:'2'},common)),React.createElement('circle',Object.assign({key:'c3',cx:'18',cy:'19',r:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M8 12 16 6'},common)),React.createElement('path',Object.assign({key:'p2',d:'M8 12 16 18'},common))];
            break;
        case 'close':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M6 6l12 12'},common)),React.createElement('path',Object.assign({key:'p2',d:'M18 6 6 18'},common))];
            break;
        case 'settings':
            children=[
                React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'3.2'},common)),
                React.createElement('path',Object.assign({key:'p1',d:'M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.02 1.53V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.02-1.53 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.53-1.02H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.98a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.92 4.6 1.7 1.7 0 0 0 9.94 3.08V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.02 1.53 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.98c.22.31.36.66.4 1.02H20a2 2 0 1 1 0 4h-.09c-.04.36-.18.71-.4 1.02z'},common))
            ];
            break;
        case 'sun':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'4'},common)),React.createElement('path',Object.assign({key:'p1',d:'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'},common))];
            break;
        case 'moon':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z'},common))];
            break;
        case 'graph':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'5',cy:'17',r:'2'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'12',cy:'7',r:'2'},common)),React.createElement('circle',Object.assign({key:'c3',cx:'19',cy:'14',r:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M6.7 15.6 10.3 8.4M13.8 8.1l3.4 4.8'},common))];
            break;
        case 'treemap':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'3',y:'3',width:'18',height:'18',rx:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M10 3v18M10 10h11M3 14h7'},common))];
            break;
        case 'matrix':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'4',y:'4',width:'16',height:'16',rx:'2'},common)),React.createElement('path',Object.assign({key:'p1',d:'M4 10h16M4 14h16M10 4v16M14 4v16'},common))];
            break;
        case 'tree':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 3v18'},common)),React.createElement('path',Object.assign({key:'p2',d:'M12 7 7 12M12 9l5 5M12 14l-4 5M12 16l4 5'},common)),React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'3',r:'2'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'7',cy:'12',r:'2'},common)),React.createElement('circle',Object.assign({key:'c3',cx:'17',cy:'14',r:'2'},common)),React.createElement('circle',Object.assign({key:'c4',cx:'8',cy:'19',r:'2'},common)),React.createElement('circle',Object.assign({key:'c5',cx:'16',cy:'21',r:'2'},common))];
            break;
        case 'flow':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M4 7h10'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'11 4 14 7 11 10'},common)),React.createElement('path',Object.assign({key:'p3',d:'M4 17h16'},common)),React.createElement('polyline',Object.assign({key:'p4',points:'17 14 20 17 17 20'},common))];
            break;
        case 'cluster':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'8',cy:'8',r:'3'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'16',cy:'8',r:'3'},common)),React.createElement('circle',Object.assign({key:'c3',cx:'12',cy:'16',r:'3'},common)),React.createElement('path',Object.assign({key:'p1',d:'M10.5 10.5 11.5 13.5M13.5 13.5l1-3'},common))];
            break;
        case 'target':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'8'},common)),React.createElement('circle',Object.assign({key:'c2',cx:'12',cy:'12',r:'4'},common)),React.createElement('circle',Object.assign({key:'c3',cx:'12',cy:'12',r:'1'},common))];
            break;
        case 'impact':
            children=[React.createElement('circle',Object.assign({key:'c1',cx:'12',cy:'12',r:'3'},common)),React.createElement('path',Object.assign({key:'p1',d:'M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8'},common))];
            break;
        case 'users':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2'},common)),React.createElement('circle',Object.assign({key:'c1',cx:'9.5',cy:'8',r:'3'},common)),React.createElement('path',Object.assign({key:'p2',d:'M20 21v-2a4 4 0 0 0-3-3.87'},common)),React.createElement('path',Object.assign({key:'p3',d:'M14.5 5.2a3 3 0 0 1 0 5.6'},common))];
            break;
        case 'action':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2'},common))];
            break;
        case 'image':
            children=[React.createElement('rect',Object.assign({key:'r1',x:'3',y:'5',width:'18',height:'14',rx:'2'},common)),React.createElement('circle',Object.assign({key:'c1',cx:'9',cy:'10',r:'1.5'},common)),React.createElement('path',Object.assign({key:'p1',d:'M21 16l-5-5-5 6-2-2-6 5'},common))];
            break;
        case 'note':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M15 3v4h4'},common)),React.createElement('path',Object.assign({key:'p3',d:'M8 12h8M8 16h6'},common))];
            break;
        case 'code':
            children=[React.createElement('polyline',Object.assign({key:'p1',points:'8 8 4 12 8 16'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'16 8 20 12 16 16'},common)),React.createElement('path',Object.assign({key:'p3',d:'M13 6 11 18'},common))];
            break;
        case 'brush':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M18 3a3 3 0 0 1 3 3c0 4-3 6-6 9l-6-6c3-3 5-6 9-6z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M9 15c-3 0-5 2-5 5 3 0 5-2 5-5z'},common))];
            break;
        case 'chart':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M4 20V10'},common)),React.createElement('path',Object.assign({key:'p2',d:'M10 20V4'},common)),React.createElement('path',Object.assign({key:'p3',d:'M16 20v-6'},common)),React.createElement('path',Object.assign({key:'p4',d:'M22 20H2'},common))];
            break;
        case 'security':
            children=[React.createElement('path',Object.assign({key:'p1',d:'M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z'},common)),React.createElement('path',Object.assign({key:'p2',d:'M9 12l2 2 4-4'},common))];
            break;
        default:
            children=[React.createElement('path',Object.assign({key:'p1',d:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'},common)),React.createElement('polyline',Object.assign({key:'p2',points:'14 3 14 8 19 8'},common))];
    }
    return React.createElement('span',{className:className,'aria-hidden':'true'},React.createElement('svg',{viewBox:'0 0 24 24'},children));
}

function StatusDot(props){
    return React.createElement('span',{className:'status-dot',style:{background:props.color||'currentColor'}});
}

function iconLabel(name,label,size,className){
    return React.createElement(React.Fragment,null,
        React.createElement(Icon,{name:name,size:size||'s',className:className}),
        ' ',
        label
    );
}

function getSeverityColor(level){
    return level==='critical'||level==='high'?'var(--red)':level==='medium'?'var(--orange)':'var(--blue)';
}

function getFilePreviewIconName(filename){
    if(!Parser.isCode(filename))return'file';
    if(Parser.isVBA(filename))return'chart';
    if(Parser.isHTML(filename))return'globe';
    if(Parser.isCSS(filename))return'brush';
    if(Parser.isJSON(filename))return'note';
    return'code';
}

function buildAppUrl(repo,autoRun){
    var url=new URL(window.location.href);
    url.search='';
    if(repo)url.searchParams.set('repo',repo);
    if(autoRun&&repo)url.searchParams.set('run','1');
    return url.toString();
}

function getDialogTone(tone){
    if(tone==='danger')return{
        color:'var(--red)',
        borderColor:'rgba(255,95,95,0.34)',
        background:'rgba(255,95,95,0.12)'
    };
    if(tone==='info')return{
        color:'var(--blue)',
        borderColor:'rgba(77,159,255,0.34)',
        background:'rgba(77,159,255,0.12)'
    };
    return{
        color:'var(--orange)',
        borderColor:'rgba(255,159,67,0.34)',
        background:'rgba(255,159,67,0.12)'
    };
}

function TreeNode(props){
    var node=props.node,selected=props.selected,onSelect=props.onSelect,expanded=props.expanded,toggle=props.toggle,filterFolder=props.filterFolder,activeFilter=props.activeFilter;
    var isOpen=expanded.has(node.path);
    var isFiltered=activeFilter===node.path;
    var children=Object.values(node.children).sort(function(a,b){return a.name.localeCompare(b.name);});
    return React.createElement('div',null,
        React.createElement('div',{className:'tree-folder'+(isFiltered?' filtered':''),onClick:function(){if(node.path==='')filterFolder(null);else filterFolder(node.path);}},
            React.createElement('span',{className:'tree-toggle'+(isOpen?' open':''),onClick:function(e){e.stopPropagation();toggle(node.path);}},children.length>0||node.files.length>0?'▶':''),
            React.createElement(Icon,{name:isOpen?'folder-open':'folder',size:'m',className:'tree-entry-icon'}),
            React.createElement('span',{className:'tree-name'},node.name),
            React.createElement('span',{className:'tree-count'},countFiles(node))
        ),
        isOpen&&React.createElement('div',{className:'tree-children'},
            children.map(function(c){return React.createElement(TreeNode,{key:c.path,node:c,selected:selected,onSelect:onSelect,expanded:expanded,toggle:toggle,filterFolder:filterFolder,activeFilter:activeFilter});}),
            node.files.map(function(f){return React.createElement('div',{key:f.path,className:'tree-file'+(selected&&selected.path===f.path?' active':''),onClick:function(){onSelect(f.path);}},React.createElement(Icon,{name:'file',size:'s',className:'tree-entry-icon'}),React.createElement('span',{className:'tree-name'},f.name));})
        )
    );
}

function HealthRing(props){
    var score=props.score,grade=props.grade;
    var circ=2*Math.PI*18;
    var offset=circ-(score/100)*circ;
    var color=score>=80?'var(--green)':score>=60?'var(--orange)':'var(--red)';
    return React.createElement('div',{className:'health-ring'},
        React.createElement('svg',{width:'48',height:'48'},
            React.createElement('circle',{cx:'24',cy:'24',r:'18',fill:'none',stroke:'var(--bg3)',strokeWidth:'4'}),
            React.createElement('circle',{cx:'24',cy:'24',r:'18',fill:'none',stroke:color,strokeWidth:'4',strokeDasharray:circ,strokeDashoffset:offset,strokeLinecap:'round'})
        ),
        React.createElement('div',{className:'health-ring-value',style:{color:color}},grade)
    );
}

// Architecture Summary Panel component
function ArchitectureSummaryPanel(props){
    var data=props.data;
    var architectureIncludeTests=props.architectureIncludeTests;
    var architectureIncludeBuildOutput=props.architectureIncludeBuildOutput;
    var setArchitectureIncludeTests=props.setArchitectureIncludeTests;
    var setArchitectureIncludeBuildOutput=props.setArchitectureIncludeBuildOutput;

    function architectureGroupDotColor(group){
        if(group==='Browser App'||group==='App Entry / Shell'||group==='Analysis Core'||group==='Frontend Routes'||group==='Frontend Page Components')return'var(--blue)';
        if(group==='GitHub Action'||group==='Repository Collection'||group==='Backend API / Platform Logic')return'var(--purple)';
        if(group==='Rendering / Reports'||group==='Storage'||group==='Configuration')return'var(--orange)';
        if(group==='Content / Data')return'var(--green)';
        if(group==='Testing'||group==='Fixtures / Examples'||group==='Build Output')return'var(--t3)';
        return'var(--t2)';
    }
    function renderArchitectureBlockList(blocks,emptyText){
        if(!blocks||!blocks.length)return React.createElement('div',{style:{fontSize:10,color:'var(--t3)',padding:8}},emptyText);
        return React.createElement('div',{className:'architecture-list'},
            blocks.slice(0,12).map(function(block){
                return React.createElement('div',{key:block.id,className:'architecture-list-item'},
                    React.createElement(StatusDot,{color:architectureGroupDotColor(block.group)}),
                    React.createElement('span',{title:(block.files&&block.files[0])||block.route||block.title},block.title)
                );
            }),
            blocks.length>12&&React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},'+',blocks.length-12,' more')
        );
    }

    var diagram=data&&data.architectureDiagram;
    if(!diagram)return React.createElement('div',{className:'empty-state'},React.createElement('div',{className:'empty-title'},'No architecture diagram'));
    var stats=getArchitectureViewStats(diagram,architectureIncludeTests,architectureIncludeBuildOutput);
    var blocks=getVisibleArchitectureBlocks(diagram.blocks||[],architectureIncludeTests,architectureIncludeBuildOutput);
    var hidden=diagram.hiddenSummary||{build:0,tests:0,fixtures:0,lowSignal:0,total:0};
    var groupOrder=getArchitectureGroupOrder(diagram.profile||'generic');
    var groupCards=groupOrder.map(function(group){
        var groupBlocks=blocks.filter(function(block){return block.group===group;});
        if(!groupBlocks.length)return null;
        return React.createElement('div',{key:group,className:'card'},
            React.createElement('div',{className:'card-header'},
                React.createElement('div',{className:'card-title'},group),
                React.createElement('span',{className:'badge badge-default'},groupBlocks.length)
            ),
            React.createElement('div',{className:'card-body'},renderArchitectureBlockList(groupBlocks,'No blocks in this group.'))
        );
    }).filter(Boolean);
    return React.createElement(React.Fragment,null,
        React.createElement('div',{style:{fontSize:12,fontWeight:600,marginBottom:12}},React.createElement(Icon,{name:'layers',size:'m'}),' Architecture Summary'),
        React.createElement('div',{className:'stats-grid',style:{marginBottom:12}},
            React.createElement('div',{className:'stat-card'},React.createElement('div',{className:'stat-value'},stats.blocks||0),React.createElement('div',{className:'stat-label'},'Blocks')),
            React.createElement('div',{className:'stat-card'},React.createElement('div',{className:'stat-value'},stats.dependencies||0),React.createElement('div',{className:'stat-label'},'Deps')),
            React.createElement('div',{className:'stat-card'},React.createElement('div',{className:'stat-value'},stats.routes||0),React.createElement('div',{className:'stat-label'},'Routes')),
            React.createElement('div',{className:'stat-card warn'},React.createElement('div',{className:'stat-value'},stats.databaseTouchpoints||0),React.createElement('div',{className:'stat-label'},'DB Touches'))
        ),
        React.createElement('div',{className:'card'},
            React.createElement('div',{className:'card-header'},React.createElement('div',{className:'card-title'},React.createElement(Icon,{name:'globe',size:'s'}),' Framework'),React.createElement('span',{className:'badge badge-info'},diagram.framework)),
            React.createElement('div',{className:'card-body'},
                React.createElement('div',{style:{fontSize:10,color:'var(--t2)',marginBottom:10}},'Type: ',diagram.type,' | Profile: ',diagram.profile||'generic',' | Warnings: ',stats.warnings||0),
                React.createElement('div',{style:{display:'flex',gap:8,flexWrap:'wrap'}},
                    React.createElement('button',{className:'top-btn'+(architectureIncludeTests?' primary':''),style:{fontSize:10,padding:'4px 10px'},onClick:function(){setArchitectureIncludeTests(function(v){return !v;});},type:'button'},'Tests'),
                    React.createElement('button',{className:'top-btn'+(architectureIncludeBuildOutput?' primary':''),style:{fontSize:10,padding:'4px 10px'},onClick:function(){setArchitectureIncludeBuildOutput(function(v){return !v;});},type:'button'},'Build output')
                ),
                React.createElement('div',{style:{fontSize:9,color:'var(--t3)',marginTop:8}},'Pan: drag diagram · Zoom: scroll wheel · Export: navbar Export button')
            )
        ),
        hidden.total>0&&React.createElement('div',{className:'card'},
            React.createElement('div',{className:'card-header'},React.createElement('div',{className:'card-title'},React.createElement(Icon,{name:'info',size:'s'}),' Hidden from diagram'),React.createElement('span',{className:'badge badge-default'},hidden.total)),
            React.createElement('div',{className:'card-body'},
                hidden.build>0&&React.createElement('div',{style:{fontSize:10,color:'var(--t2)',marginBottom:4}},hidden.build,' build file',hidden.build===1?'':'s'),
                hidden.tests>0&&React.createElement('div',{style:{fontSize:10,color:'var(--t2)',marginBottom:4}},hidden.tests,' test file',hidden.tests===1?'':'s'),
                hidden.fixtures>0&&React.createElement('div',{style:{fontSize:10,color:'var(--t2)',marginBottom:4}},hidden.fixtures,' fixture file',hidden.fixtures===1?'':'s'),
                hidden.lowSignal>0&&React.createElement('div',{style:{fontSize:10,color:'var(--t2)',marginBottom:4}},hidden.lowSignal,' low-signal utility file',hidden.lowSignal===1?'':'s')
            )
        ),
        groupCards,
        diagram.warnings&&diagram.warnings.length>0&&React.createElement('div',{className:'card'},
            React.createElement('div',{className:'card-header'},React.createElement('div',{className:'card-title'},React.createElement(Icon,{name:'warning',size:'s'}),' Warnings'),React.createElement('span',{className:'badge badge-warning'},diagram.warnings.length)),
            React.createElement('div',{className:'card-body'},diagram.warnings.map(function(warning,i){return React.createElement('div',{key:i,style:{fontSize:10,color:'var(--t2)',marginBottom:6,lineHeight:1.5}},warning);}))
        )
    );
}

// Syntax highlighting — pure function, no state, no React
function highlightSyntax(code,filename){
    if(!code)return'';
    var ext=(filename||'').split('.').pop().toLowerCase();
    var isJS=['js','jsx','ts','tsx','mjs','cjs'].includes(ext);
    var isPy=['py','pyw','pyi'].indexOf(ext)>=0;
    var isJava=['java','kt','scala','cs','go'].includes(ext);
    var isHTML=['html','htm','vue','svelte'].includes(ext);
    var isCSS=['css','scss','sass','less'].includes(ext);
    var isJSON=['json','yaml','yml','toml'].includes(ext);
    var isRuby=['rb','rake'].includes(ext);
    var isPHP=ext==='php';
    var isVBA=['vba','bas','cls','xlsm','xlam','xlsb','xla','xlw'].includes(ext);
    function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
    // Split into tokens while preserving structure
    var result=code.split('\n').map(function(line){
        var escaped=esc(line);
        // Comments
        if(isJS||isJava||isPHP||isCSS)escaped=escaped.replace(/(\/\/.*$)/gm,'<span class="syn-com">$1</span>');
        if(isPy||isRuby)escaped=escaped.replace(/(#.*$)/gm,'<span class="syn-com">$1</span>');
        if(isHTML)escaped=escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g,'<span class="syn-com">$1</span>');
        // Strings - careful with order
        escaped=escaped.replace(/(&quot;[^&]*&quot;|'[^']*'|`[^`]*`)/g,'<span class="syn-str">$1</span>');
        // Numbers
        escaped=escaped.replace(/\b(\d+\.?\d*)\b/g,'<span class="syn-num">$1</span>');
        // Keywords
        if(isJS)escaped=escaped.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|from|default|async|await|yield|typeof|instanceof|in|of|this|super|null|undefined|true|false|void|static|get|set)\b/g,'<span class="syn-kw">$1</span>');
        if(isPy){
            escaped=escaped.replace(/\b(async|await|def|class|return|if|elif|else|for|while|try|except|finally|raise|import|from|as|with|pass|break|continue|lambda|yield|global|nonlocal|assert|True|False|None|and|or|not|in|is|del|match|case|type)\b/g,'<span class="syn-kw">$1</span>');
            escaped=escaped.replace(/(@\w+)/g,'<span class="syn-fn">$1</span>');
            escaped=escaped.replace(/\b(self|cls)\b/g,'<span class="syn-kw" style="opacity:0.7">$1</span>');
        }
        if(isJava)escaped=escaped.replace(/\b(public|private|protected|static|final|void|class|interface|extends|implements|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|import|package|this|super|null|true|false)\b/g,'<span class="syn-kw">$1</span>');
        if(isRuby)escaped=escaped.replace(/\b(def|class|module|end|return|if|elsif|else|unless|case|when|for|while|until|do|begin|rescue|ensure|raise|require|include|extend|attr_accessor|attr_reader|attr_writer|true|false|nil|self)\b/g,'<span class="syn-kw">$1</span>');
        if(isPHP)escaped=escaped.replace(/\b(function|class|return|if|else|elseif|for|foreach|while|do|switch|case|break|continue|try|catch|finally|throw|new|public|private|protected|static|const|use|namespace|extends|implements|true|false|null)\b/g,'<span class="syn-kw">$1</span>');
        if(isVBA)escaped=escaped.replace(/\b(Public|Private|Friend|Static|Dim|Set|Let|Get|Call|Function|Sub|End Sub|End Function|Exit Sub|Exit Function|If|Then|Else|ElseIf|End If|For|To|Step|Next|Do|Loop|While|Wend|Select|Case|End Select|With|End With|On Error|Resume|GoTo|ByVal|ByRef|Optional|ParamArray|As|Type|Enum|Const|True|False|Nothing|Empty|Null|Me|Application|ThisWorkbook|Worksheets|Cells|Range|MsgBox|InputBox|Debug\.Print)\b/gi,'<span class="syn-kw">$1</span>');
        if(isCSS)escaped=escaped.replace(/(@media|@import|@keyframes|@font-face|!important)/g,'<span class="syn-kw">$1</span>');
        if(isHTML){escaped=escaped.replace(/(&lt;\/?)([\w-]+)/g,'$1<span class="syn-tag">$2</span>');escaped=escaped.replace(/([\w-]+)(=)/g,'<span class="syn-attr">$1</span>$2');}
        // Function calls
        escaped=escaped.replace(/\b([a-zA-Z_]\w*)\s*\(/g,'<span class="syn-fn">$1</span>(');
        // Types (capitalized words in certain contexts)
        if(isJS||isJava)escaped=escaped.replace(/:\s*([A-Z]\w*)/g,': <span class="syn-type">$1</span>');
        return escaped;
    });
    return result;
}


function getAccentBlockStyle(borderColor,tint,extra){
    return Object.assign({
        background:'linear-gradient(180deg, '+tint+' 0%, var(--bg0) 55%)',
        border:'1px solid '+borderColor,
        borderRadius:8
    },extra||{});
}

// Error boundary to prevent white screen crashes on large codebases
class ErrorBoundary extends React.Component{
    constructor(props){super(props);this.state={hasError:false,error:null};}
    static getDerivedStateFromError(error){return{hasError:true,error:error};}
    componentDidCatch(error,info){console.error('Arcflow crashed:',error,info);}
    render(){
        if(this.state.hasError){
            var self=this;
            return React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg0)',color:'var(--t0)',fontFamily:'JetBrains Mono, monospace',padding:40,textAlign:'center'}},
                React.createElement(Icon,{name:'logo',size:'xxl',className:'empty-icon'}),
                React.createElement('h2',{style:{marginBottom:12,color:'var(--acc)'}},'Arcflow ran into an issue'),
                React.createElement('p',{style:{color:'var(--t2)',marginBottom:8,maxWidth:500}},'The codebase may be too large for your browser\'s available memory. Try analyzing a subfolder instead, or close other browser tabs to free memory.'),
                React.createElement('p',{style:{color:'var(--t3)',fontSize:11,marginBottom:20}},String(this.state.error)),
                React.createElement('button',{onClick:function(){self.setState({hasError:false,error:null});},style:{padding:'8px 20px',background:'var(--acc)',color:'var(--bg0)',border:'none',borderRadius:6,cursor:'pointer',fontFamily:'inherit',fontWeight:600}},'Reload')
            );
        }
        return this.props.children;
    }
}
