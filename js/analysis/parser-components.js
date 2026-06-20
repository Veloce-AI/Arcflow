/* parser-components.js - React / Vue / Angular / Svelte component detection */

Parser.detectComponents=function(files){
    var components=[];
    var compMap=Object.create(null); // name → component

    files.forEach(function(f){
        var src=f.content||'';
        if(!src.trim())return;
        var ext=(f.path||'').split('.').pop().toLowerCase();

        // ─── React (JSX / TSX / JS / TS) ───────────────────────────────────────
        if(['jsx','tsx','js','ts','mjs'].includes(ext)){
            // Skip test files and non-component files
            if(/[\/\\](tests?|specs?|__tests?__)[\/\\]/.test(f.path))return;

            var isLikelyComponent=
                src.includes('React')||src.includes('jsx')||
                src.includes('createElement')||src.includes('useState')||
                src.includes('useEffect')||f.path.endsWith('.jsx')||f.path.endsWith('.tsx');
            if(!isLikelyComponent)return;

            var lines=src.split('\n');

            // Function component: export function Foo() / export const Foo = () =>
            // Must start with uppercase to be a component
            var fnCompRe=/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Z][a-zA-Z0-9_]*)\s*\(/gm;
            var arrowCompRe=/^(?:export\s+)?(?:const|let|var)\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(?:React\.memo\s*\()?(?:\([^)]*\)|[a-z_$][\w$]*)\s*=>/gm;
            // Class component: class Foo extends React.Component
            var classCompRe=/class\s+([A-Z][a-zA-Z0-9_]*)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/gm;

            var found=new Set();
            var m;
            while((m=fnCompRe.exec(src))!==null){
                if(!found.has(m[1])&&_looksLikeComponent(src,m[1],m.index)){
                    found.add(m[1]);
                    var lineNum=src.slice(0,m.index).split('\n').length;
                    components.push({name:m[1],file:f.path,fname:f.name,line:lineNum,type:'function',framework:'React',props:_extractProps(src,m.index),children:[]});
                    compMap[m[1]]={file:f.path,type:'function'};
                }
            }
            while((m=arrowCompRe.exec(src))!==null){
                if(!found.has(m[1])&&_looksLikeComponent(src,m[1],m.index)){
                    found.add(m[1]);
                    var lineNum2=src.slice(0,m.index).split('\n').length;
                    components.push({name:m[1],file:f.path,fname:f.name,line:lineNum2,type:'arrow',framework:'React',props:_extractProps(src,m.index),children:[]});
                    compMap[m[1]]={file:f.path,type:'arrow'};
                }
            }
            while((m=classCompRe.exec(src))!==null){
                if(!found.has(m[1])){
                    found.add(m[1]);
                    var lineNum3=src.slice(0,m.index).split('\n').length;
                    components.push({name:m[1],file:f.path,fname:f.name,line:lineNum3,type:'class',framework:'React',props:_extractProps(src,m.index),children:[]});
                    compMap[m[1]]={file:f.path,type:'class'};
                }
            }
        }

        // ─── Vue SFC (.vue) ─────────────────────────────────────────────────────
        if(ext==='vue'){
            var nameM=src.match(/name\s*:\s*['"]([^'"]+)['"]/);
            var vueName=nameM?nameM[1]:f.name.replace(/\.vue$/,'');
            components.push({name:vueName,file:f.path,fname:f.name,line:1,type:'sfc',framework:'Vue',props:_extractVueProps(src),children:[]});
            compMap[vueName]={file:f.path,type:'sfc'};
        }

        // ─── Svelte (.svelte) ───────────────────────────────────────────────────
        if(ext==='svelte'){
            var svName=f.name.replace(/\.svelte$/,'');
            components.push({name:svName,file:f.path,fname:f.name,line:1,type:'svelte',framework:'Svelte',props:_extractSvelteProps(src),children:[]});
            compMap[svName]={file:f.path,type:'svelte'};
        }

        // ─── Angular (.component.ts) ────────────────────────────────────────────
        if(ext==='ts'&&f.path.includes('.component.')){
            var ngM=src.match(/@Component\s*\(\s*\{[^}]*selector\s*:\s*['"]([^'"]+)['"]/);
            var ngName=ngM?ngM[1]:f.name.replace(/\.component\.ts$/,'');
            var ngClass=src.match(/export\s+class\s+([A-Z][a-zA-Z0-9_]*)/);
            components.push({name:ngClass?ngClass[1]:ngName,file:f.path,fname:f.name,line:1,type:'angular',framework:'Angular',selector:ngName,props:[],children:[]});
            compMap[ngClass?ngClass[1]:ngName]={file:f.path,type:'angular'};
        }
    });

    // Build parent→child relationships by scanning JSX usage
    // For each component, find which other components it renders
    files.forEach(function(f){
        var src=f.content||'';
        var ext=(f.path||'').split('.').pop().toLowerCase();
        if(!['jsx','tsx','js','ts','vue','svelte'].includes(ext))return;

        // Find JSX tags: <ComponentName or React.createElement(ComponentName
        Object.keys(compMap).forEach(function(name){
            // Check if this file uses the component as a JSX tag
            var jsxRe=new RegExp('<'+name+'[\\s/>]|createElement\\s*\\(\\s*'+name+'[,\\s)]');
            if(jsxRe.test(src)){
                // Find which components are defined in this file
                components.forEach(function(c){
                    if(c.file===f.path&&c.name!==name){
                        if(!c.children.includes(name))c.children.push(name);
                    }
                });
                // Vue/Svelte: check template usage
                if(ext==='vue'||ext==='svelte'){
                    components.forEach(function(c){
                        if(c.file===f.path&&c.name!==name){
                            if(!c.children.includes(name))c.children.push(name);
                        }
                    });
                }
            }
        });
    });

    return {components:components,compMap:compMap};
};

function _looksLikeComponent(src,name,idx){
    // Heuristic: function body contains JSX or React.createElement
    var body=src.slice(idx,Math.min(src.length,idx+2000));
    return body.includes('return (')||body.includes('return<')||body.includes('createElement')||
           body.includes('jsx')||/<[A-Z]|<[a-z][a-zA-Z]*[\s>\/]/.test(body.slice(0,500));
}

function _extractProps(src,startIdx){
    // Extract prop destructuring from function signature
    var m=src.slice(startIdx,startIdx+300).match(/\(\s*\{([^}]*)\}/);
    if(!m)return[];
    return m[1].split(',').map(function(p){return p.trim().split(/[=:]/)[0].trim();}).filter(function(p){return p&&/^[a-zA-Z_$]/.test(p);}).slice(0,8);
}

function _extractVueProps(src){
    var m=src.match(/props\s*:\s*\[([^\]]+)\]/);
    if(m)return m[1].match(/['"](\w+)['"]/g).map(function(s){return s.replace(/['"]/g,'');});
    var m2=src.match(/props\s*:\s*\{([^}]+)\}/);
    if(m2)return m2[1].match(/(\w+)\s*:/g).map(function(s){return s.replace(':','').trim();});
    return[];
}

function _extractSvelteProps(src){
    var props=[];
    var re=/export\s+let\s+(\w+)/g;
    var m;while((m=re.exec(src))!==null)props.push(m[1]);
    return props;
}
