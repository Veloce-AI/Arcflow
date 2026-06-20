/* parser-routes.js - API endpoint / route detection across frameworks */

Parser.detectApiRoutes=function(files){
    var routes=[];
    var HTTP_METHODS=['get','post','put','patch','delete','head','options','all'];

    files.forEach(function(f){
        var src=f.content||'';
        if(!src.trim())return;
        var ext=(f.path||'').split('.').pop().toLowerCase();
        var lines=src.split('\n');
        var fname=f.name||f.path.split('/').pop();

        // ─── JavaScript / TypeScript (Express, Koa, Hapi, Fastify) ────────────
        if(['js','ts','jsx','tsx','mjs','cjs'].includes(ext)){
            lines.forEach(function(line,idx){
                // app.get('/path', handler) / router.post('/path', ...) / fastify.put(...)
                var m=line.match(/(?:app|router|server|fastify|api|r)\s*\.\s*(get|post|put|patch|delete|head|options|all)\s*\(\s*['"`]([^'"`]+)['"`]/i);
                if(m){
                    var handler=_guessJsHandler(lines,idx);
                    routes.push({method:m[1].toUpperCase(),path:m[2],handler:handler,file:f.path,fname:fname,line:idx+1,framework:'Express/Node'});
                    return;
                }
                // route('/path').get(handler)  — chained style
                var m2=line.match(/\.route\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\.\s*(get|post|put|patch|delete)/i);
                if(m2){
                    routes.push({method:m2[2].toUpperCase(),path:m2[1],handler:'',file:f.path,fname:fname,line:idx+1,framework:'Express/Node'});
                }
            });
        }

        // ─── Python — FastAPI / Flask / Django ─────────────────────────────────
        if(['py'].includes(ext)){
            var prevDecorators=[];
            lines.forEach(function(line,idx){
                var trimmed=line.trim();

                // FastAPI: @app.get("/path") / @router.post("/path")
                var fa=trimmed.match(/^@(?:\w+)\.(?:get|post|put|patch|delete|head|options)\s*\(\s*['"]([^'"]+)['"]/i);
                if(fa){
                    var method=trimmed.match(/\.(get|post|put|patch|delete|head|options)\s*\(/i);
                    prevDecorators.push({method:(method?method[1]:'get').toUpperCase(),path:fa[1]});
                    return;
                }

                // Flask: @app.route("/path", methods=["GET","POST"])
                var fl=trimmed.match(/^@(?:\w+)\.route\s*\(\s*['"]([^'"]+)['"]/i);
                if(fl){
                    var methods=['GET'];
                    var mm=trimmed.match(/methods\s*=\s*\[([^\]]+)\]/i);
                    if(mm)methods=mm[1].match(/['"](\w+)['"]/g).map(function(s){return s.replace(/['"]/g,'').toUpperCase();});
                    methods.forEach(function(meth){prevDecorators.push({method:meth,path:fl[1]});});
                    return;
                }

                // Function definition following decorators → attach
                if(prevDecorators.length>0){
                    var fnDef=trimmed.match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
                    if(fnDef){
                        prevDecorators.forEach(function(d){
                            routes.push({method:d.method,path:d.path,handler:fnDef[1],file:f.path,fname:fname,line:idx+1,framework:'FastAPI/Flask'});
                        });
                        prevDecorators=[];
                    } else if(!trimmed.startsWith('@')){
                        prevDecorators=[];
                    }
                    return;
                }

                // Django urlpatterns: path('url/', view_fn, name='...')
                var dj=trimmed.match(/^\s*(?:path|re_path|url)\s*\(\s*r?['"]([^'"]+)['"]\s*,\s*(\w[\w.]*)/);
                if(dj){
                    routes.push({method:'GET*',path:'/'+dj[1].replace(/^\//,''),handler:dj[2],file:f.path,fname:fname,line:idx+1,framework:'Django'});
                }
            });
        }

        // ─── Java / Kotlin (Spring MVC / JAX-RS) ────────────────────────────────
        if(['java','kt'].includes(ext)){
            var baseMapping='';
            lines.forEach(function(line,idx){
                var trimmed=line.trim();
                // Class-level @RequestMapping
                var cm=trimmed.match(/@RequestMapping\s*\(\s*(?:value\s*=\s*)?['"]([^'"]+)['"]/i);
                if(cm){baseMapping=cm[1];return;}
                // Method-level mappings
                var sm=trimmed.match(/@(Get|Post|Put|Patch|Delete|Request)Mapping\s*\(\s*(?:value\s*=\s*)?['"]([^'"]+)['"]/i);
                if(!sm)sm=trimmed.match(/@(GET|POST|PUT|PATCH|DELETE)\s*(?:\(\s*['"]([^'"]*)['"]\s*\))?/);
                if(sm){
                    var method=sm[1].replace('Mapping','').replace('Request','').toUpperCase()||'GET';
                    if(method==='REQUEST')method='ANY';
                    var subPath=sm[2]||'';
                    var fullPath=(baseMapping+'/'+subPath).replace(/\/+/g,'/').replace(/\/$/,'');
                    // Look ahead for the method name
                    var handler='';
                    for(var k=idx+1;k<Math.min(lines.length,idx+3);k++){
                        var jm=lines[k].match(/(?:public|private|protected)?\s+\w+\s+(\w+)\s*\(/);
                        if(jm){handler=jm[1];break;}
                        var km=lines[k].match(/fun\s+(\w+)\s*\(/);
                        if(km){handler=km[1];break;}
                    }
                    routes.push({method:method,path:fullPath||'/',handler:handler,file:f.path,fname:fname,line:idx+1,framework:'Spring'});
                }

                // JAX-RS: @GET @Path("/path")
                var jax=trimmed.match(/@(GET|POST|PUT|DELETE|PATCH)/);
                var jaxPath=trimmed.match(/@Path\s*\(\s*['"]([^'"]+)['"]/);
                if(jaxPath&&!jax){
                    // Store for next annotation
                }
            });
        }

        // ─── Go (net/http, Gin, Echo, Chi, Fiber) ──────────────────────────────
        if(ext==='go'){
            lines.forEach(function(line,idx){
                // http.HandleFunc("/path", handler) / http.Handle("/path", ...)
                var hf=line.match(/http\.HandleFunc\s*\(\s*"([^"]+)"\s*,\s*(\w+)/);
                if(hf){routes.push({method:'ANY',path:hf[1],handler:hf[2],file:f.path,fname:fname,line:idx+1,framework:'net/http'});return;}
                // Gin: r.GET("/path", handler) / gin group
                var gm=line.match(/(?:\w+)\.(GET|POST|PUT|PATCH|DELETE|Any|HEAD)\s*\(\s*"([^"]+)"\s*,\s*(\w+)/i);
                if(gm){routes.push({method:gm[1].toUpperCase(),path:gm[2],handler:gm[3],file:f.path,fname:fname,line:idx+1,framework:'Gin/Echo/Fiber'});return;}
                // Chi/Fiber: r.Get("/path", handler)
                var chi=line.match(/\w+\.(Get|Post|Put|Patch|Delete|Head)\s*\(\s*"([^"]+)"\s*,\s*(\w+)/);
                if(chi){routes.push({method:chi[1].toUpperCase(),path:chi[2],handler:chi[3],file:f.path,fname:fname,line:idx+1,framework:'Chi/Fiber'});}
            });
        }

        // ─── Ruby (Rails / Sinatra) ─────────────────────────────────────────────
        if(ext==='rb'){
            lines.forEach(function(line,idx){
                // get '/path' => 'controller#action' (Rails)
                var rail=line.match(/^\s*(get|post|put|patch|delete|resources?)\s+['"]([^'"]+)['"]/i);
                if(rail&&rail[1].toLowerCase()!=='resources'&&rail[1].toLowerCase()!=='resource'){
                    routes.push({method:rail[1].toUpperCase(),path:rail[2],handler:'',file:f.path,fname:fname,line:idx+1,framework:'Rails/Sinatra'});
                }
                // Sinatra: get '/' { ... }
                var sin=line.match(/^\s*(get|post|put|patch|delete)\s+['"]([^'"]+)['"]\s*(?:do|\{)/i);
                if(sin){routes.push({method:sin[1].toUpperCase(),path:sin[2],handler:'',file:f.path,fname:fname,line:idx+1,framework:'Sinatra'});}
            });
        }

        // ─── C# (.NET / ASP.NET Core) ───────────────────────────────────────────
        if(['cs'].includes(ext)){
            var csBase='';
            lines.forEach(function(line,idx){
                var trimmed=line.trim();
                var routeAttr=trimmed.match(/\[Route\s*\(\s*["']([^"']+)["']/i);
                if(routeAttr){csBase=routeAttr[1];return;}
                var csm=trimmed.match(/\[(HttpGet|HttpPost|HttpPut|HttpDelete|HttpPatch)\s*(?:\(\s*["']([^"']*)["']\s*\))?/i);
                if(csm){
                    var method=csm[1].replace('Http','').toUpperCase();
                    var subPath=csm[2]||'';
                    var fullPath=(csBase+'/'+subPath).replace(/\/+/g,'/');
                    var handler='';
                    for(var k=idx+1;k<Math.min(lines.length,idx+3);k++){
                        var hm=lines[k].match(/public\s+\S+\s+(\w+)\s*\(/);
                        if(hm){handler=hm[1];break;}
                    }
                    routes.push({method:method,path:fullPath||'/',handler:handler,file:f.path,fname:fname,line:idx+1,framework:'ASP.NET'});
                }
                // Minimal API: app.MapGet("/path", handler)
                var map=trimmed.match(/app\.Map(Get|Post|Put|Delete|Patch)\s*\(\s*["']([^"']+)["']/i);
                if(map){
                    routes.push({method:map[1].toUpperCase(),path:map[2],handler:'',file:f.path,fname:fname,line:idx+1,framework:'ASP.NET Minimal'});
                }
            });
        }
    });

    // #47 Unprotected route detection — check each route's file for auth middleware patterns
    var authRe=/\b(?:requireAuth|isAuthenticated|authenticate|login_required|Authorize|protect\b|verifyToken|ensureAuth|checkAuth|authMiddleware|passport\.authenticate|jwt\.verify|verifyJWT|bearerAuth|tokenRequired|loginRequired|requireLogin|isLoggedIn|authGuard|@Security|@login_required|currentUser|getCurrentUser)\b/i;
    var authFileCache={};
    files.forEach(function(f){authFileCache[f.path]=authRe.test(f.content||'');});
    routes.forEach(function(r){r.authProtected=!!(authFileCache[r.file]);});
    return routes;
};

// Guess the handler name for Express-style JS routes
function _guessJsHandler(lines,idx){
    // Look for named function in same line or next few lines
    var ctx=lines.slice(idx,Math.min(lines.length,idx+3)).join(' ');
    var m=ctx.match(/,\s*(?:async\s+)?(?:function\s+(\w+)|(\w+)\s*(?:,|\)|\s*=>))/);
    if(m)return m[1]||m[2]||'';
    return '';
}
