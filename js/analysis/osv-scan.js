/* osv-scan.js - OSV.dev vulnerability scanner for package dependencies */

function osvParsePackageJson(content){
    try{
        var pkg=JSON.parse(content);
        var deps=Object.assign({},pkg.dependencies||{},pkg.devDependencies||{});
        return Object.keys(deps).slice(0,200).map(function(name){
            var raw=deps[name]||'';
            var ver=raw.replace(/^[\^~>=<\s]+/,'').split(/[\s,]/)[0]||'';
            return {name:name,version:ver,ecosystem:'npm'};
        }).filter(function(p){return p.version;});
    }catch(e){return[];}
}

function osvParseRequirementsTxt(content){
    var pkgs=[];
    content.split('\n').forEach(function(line){
        line=line.trim();
        if(!line||line[0]==='#'||line[0]==='-'||line[0]==='.')return;
        var m=line.match(/^([A-Za-z0-9_\-\.]+)\s*(?:==|===)\s*([^\s,;#\[]+)/);
        if(m)pkgs.push({name:m[1],version:m[2],ecosystem:'PyPI'});
    });
    return pkgs.slice(0,200);
}

function osvGetSeverity(vuln){
    if(vuln.severity&&vuln.severity.length){
        var cv=vuln.severity.find(function(s){return s.type==='CVSS_V3'||s.type==='CVSS_V4';});
        if(cv){
            var score=parseFloat(cv.score);
            if(score>=9)return'critical';
            if(score>=7)return'high';
            if(score>=4)return'medium';
            return'low';
        }
    }
    var ds=vuln.database_specific;
    if(ds&&ds.severity)return ds.severity.toLowerCase();
    return'unknown';
}

async function runOSVScan(data,onProgress){
    var depFiles=data.files.filter(function(f){
        return(f.name==='package.json'&&f.folder==='root')||f.name==='requirements.txt';
    });
    if(!depFiles.length)return{vulnMap:{},totalVulns:0,totalPkgs:0,scanned:0,depFiles:[]};

    var allPkgs=[];
    var pkgMeta={};
    depFiles.forEach(function(f){
        var pkgs=f.name==='package.json'
            ?osvParsePackageJson(f.content||'')
            :osvParseRequirementsTxt(f.content||'');
        pkgs.forEach(function(p){
            var key=p.name+'|'+p.ecosystem;
            if(!pkgMeta[key]){pkgMeta[key]={pkg:p,filePath:f.path};allPkgs.push(p);}
        });
    });

    var vulnMap={};
    var BATCH=50;
    for(var i=0;i<allPkgs.length;i+=BATCH){
        var batch=allPkgs.slice(i,i+BATCH);
        onProgress&&onProgress('Scanning dependencies '+(i+batch.length)+'/'+allPkgs.length+'…');
        try{
            var res=await fetch('https://api.osv.dev/v1/querybatch',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({queries:batch.map(function(p){return{package:{name:p.name,ecosystem:p.ecosystem},version:p.version};})})
            });
            if(!res.ok)continue;
            var json=await res.json();
            (json.results||[]).forEach(function(r,idx){
                var p=batch[idx];
                var key=p.name+'|'+p.ecosystem;
                if(r.vulns&&r.vulns.length){
                    vulnMap[key]={
                        pkg:p,
                        filePath:pkgMeta[key]?pkgMeta[key].filePath:'',
                        vulns:r.vulns.map(function(v){
                            return{
                                id:v.id,
                                summary:(v.summary||v.details||'No description').substring(0,120),
                                severity:osvGetSeverity(v),
                                url:'https://osv.dev/vulnerability/'+v.id
                            };
                        })
                    };
                }
            });
        }catch(e){}
    }

    var totalVulns=Object.values(vulnMap).reduce(function(n,e){return n+e.vulns.length;},0);
    return{vulnMap:vulnMap,totalVulns:totalVulns,totalPkgs:Object.keys(vulnMap).length,scanned:allPkgs.length,depFiles:depFiles.map(function(f){return f.path;})};
}
