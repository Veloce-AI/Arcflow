/* community-detection.js — Label Propagation community detection for dependency graphs */

var CLUSTER_COLORS=[
    '#f43f5e','#f97316','#eab308','#84cc16','#06b6d4',
    '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#a855f7',
    '#10b981','#f59e0b','#e11d48','#0ea5e9','#7c3aed'
];

function detectCommunities(files, connections){
    if(!files||files.length<2)return{clusterMap:{},clusterCount:0,misplaced:{},clusterFiles:{},clusterMajorityFolder:{}};

    // Build undirected weighted adjacency
    var adj={};
    files.forEach(function(f){adj[f.path]={};});
    (connections||[]).forEach(function(c){
        var s=typeof c.source==='object'?c.source.id:c.source;
        var t=typeof c.target==='object'?c.target.id:c.target;
        if(!adj[s]||!adj[t])return;
        adj[s][t]=(adj[s][t]||0)+1;
        adj[t][s]=(adj[t][s]||0)+1;
    });

    // Init: each node = its own label (use index for stability)
    var paths=files.map(function(f){return f.path;});
    var labels={};
    paths.forEach(function(p,i){labels[p]=i;});

    // Label propagation — up to 20 iterations
    for(var iter=0;iter<20;iter++){
        var changed=false;
        // Shuffle for fairness (seeded-ish via iteration)
        var order=paths.slice();
        for(var i=order.length-1;i>0;i--){
            var j=Math.floor(((i*7+iter*13)%order.length+order.length)%order.length);
            var tmp=order[i];order[i]=order[j];order[j]=tmp;
        }
        order.forEach(function(p){
            var nbrs=adj[p];
            var nkeys=Object.keys(nbrs);
            if(!nkeys.length)return;
            // Weighted label frequency
            var freq={};
            nkeys.forEach(function(n){var l=labels[n];freq[l]=(freq[l]||0)+nbrs[n];});
            // Best label: highest frequency, tie-break smallest id
            var best=labels[p],bestF=-1;
            Object.keys(freq).forEach(function(l){
                var ln=parseInt(l),fv=freq[l];
                if(fv>bestF||(fv===bestF&&ln<best)){bestF=fv;best=ln;}
            });
            if(best!==labels[p]){labels[p]=best;changed=true;}
        });
        if(!changed)break;
    }

    // Normalize cluster IDs to 0-based sequential
    var seen=[],norm={};
    paths.forEach(function(p){if(norm[labels[p]]===undefined){norm[labels[p]]=seen.length;seen.push(labels[p]);}});
    var clusterMap={};
    paths.forEach(function(p){clusterMap[p]=norm[labels[p]];});

    // Group files by cluster
    var clusterFiles={};
    files.forEach(function(f){
        var cid=clusterMap[f.path];
        if(!clusterFiles[cid])clusterFiles[cid]=[];
        clusterFiles[cid].push(f);
    });

    // Majority folder per cluster
    var clusterMajorityFolder={};
    Object.keys(clusterFiles).forEach(function(cid){
        var folderCount={};
        clusterFiles[cid].forEach(function(f){var fo=f.folder||'root';folderCount[fo]=(folderCount[fo]||0)+1;});
        var bestFo=null,bestN=0;
        Object.keys(folderCount).forEach(function(fo){if(folderCount[fo]>bestN){bestN=folderCount[fo];bestFo=fo;}});
        clusterMajorityFolder[cid]=bestFo;
    });

    // Misplaced: file whose folder ≠ cluster's majority folder (only in clusters >1 file, only non-trivial)
    var misplaced={};
    files.forEach(function(f){
        var cid=clusterMap[f.path];
        if((clusterFiles[cid]||[]).length<2)return;
        var mfo=clusterMajorityFolder[cid];
        if(mfo&&(f.folder||'root')!==mfo){
            misplaced[f.path]={clusterId:cid,myFolder:f.folder||'root',majorityFolder:mfo};
        }
    });

    return{clusterMap:clusterMap,clusterCount:seen.length,misplaced:misplaced,clusterFiles:clusterFiles,clusterMajorityFolder:clusterMajorityFolder};
}
