/* parser-patterns.js - Pattern detection: detectPatterns, detectDuplicates, codeSimilarity, lcsLength, codeFingerprint, detectLayerViolations, calcComplexity */
Parser.detectPatterns=function(files){
        var patterns=[];
        var singletons=files.filter(function(f){return f.content&&(f.content.includes('getInstance')||f.content.match(/let\s+instance\s*=/)||f.content.match(/private\s+static\s+instance/));});
        if(singletons.length)patterns.push({name:'Singleton',icon:'lock',desc:'Ensures a class has only one instance. Common for configuration, logging, or connection pools.',severity:'info',files:singletons.map(function(f){return{name:f.name,path:f.path};}),metrics:{instances:singletons.length}});
        var factories=files.filter(function(f){return f.content&&(f.name.toLowerCase().includes('factory')||f.content.match(/create[A-Z]\w*\s*\(/)||f.content.includes('return new'));});
        if(factories.length)patterns.push({name:'Factory',icon:'factory',desc:'Creates objects without specifying exact class. Enables loose coupling and extensibility.',severity:'info',files:factories.map(function(f){return{name:f.name,path:f.path};}),metrics:{factories:factories.length}});
        var observers=files.filter(function(f){return f.content&&(f.content.includes('subscribe')||f.content.includes('addEventListener')||f.content.includes('.on(')||f.content.includes('emit('));});
        if(observers.length)patterns.push({name:'Observer/Event',icon:'eye',desc:'Defines a subscription mechanism for event-driven architecture. Great for decoupling.',severity:'info',files:observers.map(function(f){return{name:f.name,path:f.path};}),metrics:{emitters:observers.length}});
        var hooks=files.filter(function(f){return f.content&&f.content.match(/export\s+(?:const|function)\s+use[A-Z]/);});
        if(hooks.length)patterns.push({name:'Custom Hooks',icon:'hook',desc:'React hooks for reusable stateful logic. Promotes code reuse and separation of concerns.',severity:'info',files:hooks.map(function(f){return{name:f.name,path:f.path};}),metrics:{hooks:hooks.length}});
        var hocs=files.filter(function(f){return f.content&&(f.content.match(/with[A-Z]\w*\s*=\s*\(/)||f.content.match(/export\s+default\s+connect/));});
        if(hocs.length)patterns.push({name:'Higher-Order Component',icon:'spark',desc:'Functions that take a component and return an enhanced component.',severity:'info',files:hocs.map(function(f){return{name:f.name,path:f.path};}),metrics:{hocs:hocs.length}});
        var providers=files.filter(function(f){return f.content&&(f.content.includes('createContext')||f.content.includes('Provider')||f.content.includes('useContext'));});
        if(providers.length)patterns.push({name:'Context Provider',icon:'globe',desc:'React Context for global state. Alternative to prop drilling.',severity:'info',files:providers.map(function(f){return{name:f.name,path:f.path};}),metrics:{contexts:providers.length}});
        // VBA-specific patterns
        var vbaUserForms=files.filter(function(f){return f.content&&(f.content.match(/Attribute\s+VB_Name\s*=\s*["']UserForm/i)||f.name.match(/UserForm/i));});
        if(vbaUserForms.length)patterns.push({name:'UserForms',icon:'layout',desc:'VBA UserForms for UI components. Common in Excel/Access automation.',severity:'info',files:vbaUserForms.map(function(f){return{name:f.name,path:f.path};}),metrics:{forms:vbaUserForms.length}});
        var vbaModules=files.filter(function(f){return f.content&&(f.content.match(/Attribute\s+VB_Name\s*=\s*["']Module/i)||f.name.match(/Module/i));});
        if(vbaModules.length)patterns.push({name:'Modules',icon:'box',desc:'VBA Modules for reusable code and business logic.',severity:'info',files:vbaModules.map(function(f){return{name:f.name,path:f.path};}),metrics:{modules:vbaModules.length}});
        var vbaClasses=files.filter(function(f){return f.content&&(f.content.match(/Attribute\s+VB_Name\s*=\s*["']Class/i)||f.name.match(/Class/i));});
        if(vbaClasses.length)patterns.push({name:'Class Modules',icon:'building',desc:'VBA Class Modules for object-oriented programming patterns.',severity:'info',files:vbaClasses.map(function(f){return{name:f.name,path:f.path};}),metrics:{classes:vbaClasses.length}});
        // Python-specific patterns
        var decoratorFiles=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&f.content.match(/@\w+\s*(?:\(.*\))?\s*\n\s*(?:def|class)/);});
        var pyDecorators=decoratorFiles.filter(function(f){return f.content.match(/@(?:app\.route|router\.|blueprint\.|get|post|put|delete|patch)\s*\(/);});
        if(pyDecorators.length)patterns.push({name:'Route Decorators',icon:'route',desc:'Flask/FastAPI/Django route decorators for URL routing. Common in Python web frameworks.',severity:'info',files:pyDecorators.map(function(f){return{name:f.name,path:f.path};}),metrics:{routes:pyDecorators.length}});
        var dataclasses=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&f.content.match(/@dataclass/);});
        if(dataclasses.length)patterns.push({name:'Dataclasses',icon:'database',desc:'Python dataclasses for structured data. Reduces boilerplate for data-holding classes.',severity:'info',files:dataclasses.map(function(f){return{name:f.name,path:f.path};}),metrics:{dataclasses:dataclasses.length}});
        var abcFiles=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&(f.content.match(/\bABC\b/)||f.content.match(/@abstractmethod/)||f.content.match(/ABCMeta/));});
        if(abcFiles.length)patterns.push({name:'Abstract Base Classes',icon:'layers',desc:'Python ABCs enforce interface contracts. Ensures subclasses implement required methods.',severity:'info',files:abcFiles.map(function(f){return{name:f.name,path:f.path};}),metrics:{abcs:abcFiles.length}});
        var ctxManagers=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&(f.content.match(/@contextmanager/)||f.content.match(/def\s+__enter__/));});
        if(ctxManagers.length)patterns.push({name:'Context Managers',icon:'refresh',desc:'Python context managers for resource management (with statement). Ensures proper cleanup.',severity:'info',files:ctxManagers.map(function(f){return{name:f.name,path:f.path};}),metrics:{managers:ctxManagers.length}});
        var pyMixins=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&f.content.match(/class\s+\w*Mixin\w*\s*[\(:]?/);});
        if(pyMixins.length)patterns.push({name:'Mixins',icon:'puzzle',desc:'Python mixins for reusable behavior through multiple inheritance.',severity:'info',files:pyMixins.map(function(f){return{name:f.name,path:f.path};}),metrics:{mixins:pyMixins.length}});
        var pySignals=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&(f.content.match(/Signal\s*\(/)||f.content.match(/@receiver\s*\(/)||f.content.match(/\.connect\s*\(/));});
        if(pySignals.length)patterns.push({name:'Django Signals',icon:'radio',desc:'Django signals for decoupled event-driven communication between components.',severity:'info',files:pySignals.map(function(f){return{name:f.name,path:f.path};}),metrics:{signals:pySignals.length}});
        var pyMiddleware=files.filter(function(f){return f.content&&f.name.endsWith('.py')&&(f.content.match(/class\s+\w*Middleware/)||f.content.match(/def\s+middleware\s*\(/)||f.name.toLowerCase().includes('middleware'));});
        if(pyMiddleware.length)patterns.push({name:'Middleware',icon:'link',desc:'Request/response middleware for cross-cutting concerns (auth, logging, CORS).',severity:'info',files:pyMiddleware.map(function(f){return{name:f.name,path:f.path};}),metrics:{middleware:pyMiddleware.length}});
        var godFiles=files.filter(function(f){return f.isCode!==false&&f.functions&&f.functions.length>15;});
        if(godFiles.length)patterns.push({name:'God Object',icon:'warning',desc:'Files with too many responsibilities (15+ functions). Consider splitting into smaller modules.',severity:'warning',isAnti:true,files:godFiles.map(function(f){return{name:f.name,path:f.path,fns:f.functions.length};}),metrics:{files:godFiles.length,avgFns:Math.round(godFiles.reduce(function(s,f){return s+f.functions.length;},0)/godFiles.length)}});
        var longFiles=files.filter(function(f){return f.isCode!==false&&f.lines&&f.lines>500;});
        if(longFiles.length)patterns.push({name:'Long File',icon:'scroll',desc:'Files over 500 lines are harder to maintain. Consider breaking into smaller modules.',severity:'warning',isAnti:true,files:longFiles.map(function(f){return{name:f.name,path:f.path,lines:f.lines};}),metrics:{files:longFiles.length,avgLines:Math.round(longFiles.reduce(function(s,f){return s+f.lines;},0)/longFiles.length)}});
        // VBA-specific anti-patterns
        var vbaGodFiles=files.filter(function(f){return f.isCode!==false&&f.functions&&f.functions.length>20;});
        if(vbaGodFiles.length)patterns.push({name:'VBA God Module',icon:'warning',desc:'VBA modules with 20+ procedures. Consider splitting into smaller modules.',severity:'warning',isAnti:true,files:vbaGodFiles.map(function(f){return{name:f.name,path:f.path,fns:f.functions.length,lines:f.lines};}),metrics:{files:vbaGodFiles.length,avgFns:Math.round(vbaGodFiles.reduce(function(s,f){return s+f.functions.length;},0)/vbaGodFiles.length)}});
        return patterns;
};

Parser.detectDuplicates=function(files,allFns){
        var duplicates=[];

        // Common function names that are expected to be duplicated across files
        // These are idiomatic patterns, not DRY violations
        var commonNames=new Set([
            // React lifecycle and handlers
            'render','componentDidMount','componentWillUnmount','componentDidUpdate',
            'shouldComponentUpdate','getDerivedStateFromProps','getSnapshotBeforeUpdate',
            'handleClick','handleChange','handleSubmit','handleInput','handleKeyDown',
            'handleKeyUp','handleKeyPress','handleBlur','handleFocus','handleScroll',
            'handleMouseEnter','handleMouseLeave','handleDrag','handleDrop',
            'onClick','onChange','onSubmit','onBlur','onFocus','onKeyDown',
            // Common utility names
            'init','setup','cleanup','destroy','reset','clear','update','refresh',
            'validate','parse','format','transform','convert','process','execute',
            'get','set','fetch','load','save','create','delete','remove','add',
            'find','filter','map','reduce','sort','merge','clone','copy',
            // Test patterns
            'beforeEach','afterEach','beforeAll','afterAll','describe','it','test',
            'setUp','tearDown','mock',
            // Common class methods
            'toString','valueOf','equals','hashCode','compare','clone',
            'serialize','deserialize','toJSON','fromJSON',
            // Express/API patterns
            'index','show','store','update','destroy','create','edit',
            // Python common patterns
            '__init__','__str__','__repr__','__len__','__eq__','__hash__','__enter__','__exit__',
            '__getattr__','__setattr__','__delattr__','__getitem__','__setitem__','__contains__',
            '__iter__','__next__','__call__','__bool__','__lt__','__gt__','__le__','__ge__',
            'upgrade','downgrade','setUp','tearDown','setUpClass','tearDownClass',
            'main','create_app','configure','register','on_startup','on_shutdown','lifespan',
            // Vue lifecycle
            'mounted','created','updated','destroyed','beforeCreate','beforeMount',
            // Angular lifecycle
            'ngOnInit','ngOnDestroy','ngOnChanges','ngAfterViewInit',
            // Svelte
            'onMount','onDestroy'
        ]);

        // Group functions by name (excluding common names)
        var fnByName=Object.create(null);
        allFns.forEach(function(fn){
            // Skip non-string names (e.g. numeric object-literal keys from the JS AST walker)
            if(typeof fn.name!=='string')return;
            // Skip common/idiomatic names
            if(commonNames.has(fn.name))return;
            // Skip very short names (likely false positives)
            if(fn.name.length<3)return;
            // Skip class methods (same method name in different classes is normal)
            if(fn.isClassMethod)return;
            // Skip Python class-scoped names (ClassName.method)
            if(fn.name.includes('.'))return;
            // Skip decorated functions (framework handlers have similar structures by design)
            if(fn.decorators&&fn.decorators.length>0)return;

            if(!fnByName[fn.name])fnByName[fn.name]=[];
            fnByName[fn.name].push(fn);
        });

        // Find duplicate names across different files - only report if suspicious
        Object.entries(fnByName).forEach(function(entry){
            var name=entry[0],fns=entry[1];
            var uniqueFiles=[...new Set(fns.map(function(f){return f.file;}))];

            // Only flag if in 3+ files (2 files might be intentional)
            if(uniqueFiles.length>=3){
                // Check if the code is actually similar (not just same name)
                var codeSamples=fns.filter(function(f){return f.code&&f.code.length>30;});
                if(codeSamples.length>=2){
                    // Compare first two code samples for similarity
                    var sim=Parser.codeSimilarity(codeSamples[0].code,codeSamples[1].code);
                    if(sim>0.5){  // More than 50% similar - likely a real duplicate
                        duplicates.push({
                            type:'name',
                            name:name,
                            count:uniqueFiles.length,
                            files:fns.map(function(f){return{file:f.file,line:f.line};}),
                            similarity:Math.round(sim*100),
                            suggestion:'Function "'+name+'" appears in '+uniqueFiles.length+' files with '+Math.round(sim*100)+'% similarity - consider consolidating'
                        });
                    }
                }
            }
        });

        // Find similar code blocks (improved algorithm)
        // Use structural hash that captures the essence of the code
        var codeGroups=Object.create(null);
        allFns.forEach(function(fn){
            if(!fn.code||fn.code.length<80)return;  // Skip very short functions

            // Create a structural fingerprint
            var fingerprint=Parser.codeFingerprint(fn.code);
            if(!fingerprint)return;

            if(!codeGroups[fingerprint])codeGroups[fingerprint]=[];
            codeGroups[fingerprint].push(fn);
        });

        Object.values(codeGroups).forEach(function(fns){
            if(fns.length>1){
                var uniqueFiles=[...new Set(fns.map(function(f){return f.file;}))];
                // Must be in different files to be a real duplication issue
                if(uniqueFiles.length>1){
                    // Verify with actual similarity check
                    var sim=Parser.codeSimilarity(fns[0].code,fns[1].code);
                    if(sim>0.7){  // 70% or more similar
                        duplicates.push({
                            type:'code',
                            name:fns.map(function(f){return f.name;}).join(', '),
                            count:fns.length,
                            files:fns.map(function(f){return{file:f.file,name:f.name,line:f.line};}),
                            similarity:Math.round(sim*100),
                            suggestion:'Similar code blocks ('+Math.round(sim*100)+'% match) - consider extracting to a shared utility'
                        });
                    }
                }
            }
        });

        return duplicates;
};

// Calculate code similarity using normalized comparison (0-1 scale)
Parser.codeSimilarity=function(code1,code2){
        if(!code1||!code2)return 0;

        // Normalize both code blocks
        function normalize(code){
            return code
                .replace(/\/\/.*$/gm,'')           // Remove JS single-line comments
                .replace(/#.*$/gm,'')              // Remove Python/Ruby comments
                .replace(/\/\*[\s\S]*?\*\//g,'')   // Remove multi-line comments
                .replace(/"""[\s\S]*?"""/g,'S')    // Remove Python docstrings (triple double)
                .replace(/'''[\s\S]*?'''/g,'S')    // Remove Python docstrings (triple single)
                .replace(/['"`][^'"`]*['"`]/g,'S') // Normalize strings
                .replace(/\b\d+\.?\d*\b/g,'N')     // Normalize numbers
                .replace(/\s+/g,' ')               // Normalize whitespace
                .trim();
        }

        var n1=normalize(code1);
        var n2=normalize(code2);

        if(n1===n2)return 1;
        if(n1.length===0||n2.length===0)return 0;

        // Use longest common subsequence ratio
        var lcs=Parser.lcsLength(n1,n2);
        var maxLen=Math.max(n1.length,n2.length);
        return lcs/maxLen;
};

// Longest common subsequence length (optimized for similarity)
Parser.lcsLength=function(s1,s2){
        // Use simplified approach for performance
        if(s1.length>500||s2.length>500){
            // For long strings, use sampling
            s1=s1.substring(0,500);
            s2=s2.substring(0,500);
        }

        var m=s1.length,n=s2.length;
        var prev=new Array(n+1).fill(0);
        var curr=new Array(n+1).fill(0);

        for(var i=1;i<=m;i++){
            for(var j=1;j<=n;j++){
                if(s1[i-1]===s2[j-1]){
                    curr[j]=prev[j-1]+1;
                }else{
                    curr[j]=Math.max(prev[j],curr[j-1]);
                }
            }
            var tmp=prev;prev=curr;curr=tmp;
            curr.fill(0);
        }
        return prev[n];
};

// Create a structural fingerprint for code (for grouping similar code)
Parser.codeFingerprint=function(code){
        if(!code||code.length<50)return null;

        // Extract structural elements
        var structure=code
            .replace(/\/\/.*$/gm,'')           // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g,'')
            .replace(/['"`][^'"`]*['"`]/g,'')  // Remove string contents
            .replace(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g,'I')  // All identifiers -> I
            .replace(/\b\d+\.?\d*\b/g,'N')     // All numbers -> N
            .replace(/\s+/g,'');               // Remove whitespace

        // Take a hash-like fingerprint based on structure length and key patterns
        var patterns={
            loops:(structure.match(/for|while/g)||[]).length,
            conditions:(structure.match(/if|\?/g)||[]).length,
            calls:(structure.match(/I\(/g)||[]).length,
            returns:(structure.match(/return/g)||[]).length,
            len:Math.floor(structure.length/50)*50  // Bucket by length
        };

        // Create fingerprint string
        return 'L'+patterns.loops+'C'+patterns.conditions+'F'+patterns.calls+'R'+patterns.returns+'S'+patterns.len;
};

Parser.detectLayerViolations=function(files,connections){
        var violations=[];
        var layerOrder={presentation:0,ui:0,component:0,components:0,page:0,view:0,feature:1,service:2,services:2,api:2,data:3,model:3,util:4,utils:4,helper:4,lib:4,core:4,config:5,test:6,modules:5,forms:0,classes:3};
        var fileByPath={};
        files.forEach(function(f){fileByPath[f.path]=f;});
        connections.forEach(function(c){
            var srcFile=fileByPath[c.source];
            var tgtFile=fileByPath[c.target];
            if(!srcFile||!tgtFile)return;
            var srcLayer=(srcFile.layer||'').toLowerCase();
            var tgtLayer=(tgtFile.layer||'').toLowerCase();
            var srcLevel=layerOrder[srcLayer];
            var tgtLevel=layerOrder[tgtLayer];
            // Violation: lower layer importing from higher layer (e.g., service importing from UI)
            if(srcLevel!==undefined&&tgtLevel!==undefined&&srcLevel>tgtLevel&&srcLevel-tgtLevel>1){
                violations.push({
                    from:srcFile.path,
                    fromLayer:srcFile.layer,
                    to:tgtFile.path,
                    toLayer:tgtFile.layer,
                    fn:c.fn,
                    suggestion:srcFile.layer+' should not import from '+tgtFile.layer+'. Consider inverting the dependency or using dependency injection.'
                });
            }
        });
        return violations;
};

Parser.calcComplexity=function(content,filename){
        if(!content)return{score:0,level:'low'};
        if(filename&&Parser.isScriptContainer(filename)){
            var blocks=Parser.getEmbeddedCodeBlocks(content,filename,{includeHandlers:true});
            if(!blocks.length)return{score:0,level:'low'};
            content=blocks.map(function(block){return block.content;}).join('\n');
        }
        // Approximate cyclomatic complexity - supports JS, Python, and other languages
        var complexity=1;
        // JS/C-style patterns
        var patterns=[/\bif\s*\(/g,/\belse\s+if\s*\(/g,/\bwhile\s*\(/g,/\bfor\s*\(/g,/\bcase\s+/g,/\bcatch\s*\(/g,/\?\s*[^:]+\s*:/g,/&&/g,/\|\|/g];
        // Python-specific patterns
        var pyPatterns=[/\bif\s+[^(]/g,/\belif\s+/g,/\bwhile\s+[^(]/g,/\bfor\s+\w+\s+in\s+/g,/\bexcept\s*/g,/\bwith\s+/g,/\band\b/g,/\bor\b/g,/\bif\s+.+\s+else\s+/g,/\bfor\s+.+\s+in\s+[^\n]*\]/g];
        patterns.concat(pyPatterns).forEach(function(p){var m=content.match(p);if(m)complexity+=m.length;});
        // Deduplicate: if both `if (` and `if ` match the same lines, the count is inflated
        // but for a quick approximation this is acceptable
        var level='low';
        if(complexity>30)level='critical';
        else if(complexity>20)level='high';
        else if(complexity>10)level='medium';
        return{score:complexity,level:level};
};
