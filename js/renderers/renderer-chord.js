/* renderer-chord.js - Inter-folder dependency chord diagram */
function renderChord(containerEl, data, opts, callbacks) {
    var colorMap   = opts.colorMap   || {};
    var folderFilter = opts.folderFilter;
    var onFolderFilter = callbacks.onFolderFilter;

    var container = d3.select(containerEl);
    container.selectAll('*').remove();
    var w = containerEl.clientWidth  || 800;
    var h = containerEl.clientHeight || 600;
    var svg = container.append('svg').attr('width', w).attr('height', h);
    var cx = w / 2, cy = h / 2;
    var outerR = Math.min(cx, cy) - 70;
    var innerR = outerR - 26;

    var allFiles = folderFilter
        ? data.files.filter(function(f){ return f.folder === folderFilter || (f.folder||'').startsWith(folderFilter + '/'); })
        : data.files;

    var folderSet = [];
    allFiles.forEach(function(f){ var fo = f.folder || 'root'; if(folderSet.indexOf(fo)<0) folderSet.push(fo); });
    var N = folderSet.length;

    if(N < 2){
        svg.append('text').attr('x', cx).attr('y', cy).attr('text-anchor','middle')
            .attr('fill','var(--t2)').attr('font-size',12)
            .text('Need ≥ 2 folders for chord diagram');
        return;
    }

    var fileMap = {};
    allFiles.forEach(function(f){ fileMap[f.path] = f; });

    var matrix = [];
    for(var i = 0; i < N; i++){ matrix.push([]); for(var j = 0; j < N; j++) matrix[i].push(0); }

    data.connections.forEach(function(c){
        var sid = typeof c.source === 'object' ? c.source.id : c.source;
        var tid = typeof c.target === 'object' ? c.target.id : c.target;
        var sf = fileMap[sid], tf = fileMap[tid];
        if(!sf || !tf) return;
        var si = folderSet.indexOf(sf.folder || 'root');
        var ti = folderSet.indexOf(tf.folder || 'root');
        if(si >= 0 && ti >= 0 && si !== ti) matrix[si][ti]++;
    });

    var FALLBACK = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#a855f7'];
    function getColor(idx){ return colorMap[folderSet[idx]] || FALLBACK[idx % FALLBACK.length]; }

    var chordLayout = d3.chord().padAngle(0.04).sortSubgroups(d3.descending);
    var chords = chordLayout(matrix);
    var arc    = d3.arc().innerRadius(innerR).outerRadius(outerR);
    var ribbon = d3.ribbon().radius(innerR - 1);

    var g = svg.append('g').attr('transform','translate('+cx+','+cy+')');

    // Ribbons
    g.append('g').selectAll('path').data(chords).join('path')
        .attr('d', ribbon)
        .attr('fill', function(d){ return getColor(d.source.index); })
        .attr('opacity', 0.3)
        .attr('stroke', 'var(--bg0)').attr('stroke-width', 0.5)
        .on('mouseenter', function(){ d3.select(this).attr('opacity', 0.65); })
        .on('mouseleave', function(){ d3.select(this).attr('opacity', 0.3); })
        .append('title').text(function(d){
            return folderSet[d.source.index] + ' → ' + folderSet[d.target.index] + ': ' + d.source.value + ' dep(s)';
        });

    // Arc groups
    var arcG = g.append('g').selectAll('g').data(chords.groups).join('g');

    arcG.append('path')
        .attr('d', arc)
        .attr('fill', function(d){ return getColor(d.index); })
        .attr('opacity', 0.88)
        .attr('stroke', 'var(--bg0)').attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('click', function(e, d){ if(onFolderFilter) onFolderFilter(folderSet[d.index]); })
        .on('mouseenter', function(){ d3.select(this).attr('opacity', 1); })
        .on('mouseleave', function(){ d3.select(this).attr('opacity', 0.88); })
        .append('title').text(function(d){
            return (folderSet[d.index] || 'root') + '\n' + d.value + ' cross-folder connection(s)';
        });

    // Folder name labels
    arcG.append('text')
        .each(function(d){ d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr('dy', '0.35em')
        .attr('transform', function(d){
            var a = (d.startAngle + d.endAngle) / 2;
            var r = outerR + 14;
            return 'rotate(' + ((a * 180 / Math.PI) - 90) + ') translate(' + r + ',0)' + (a > Math.PI ? ' rotate(180)' : '');
        })
        .attr('text-anchor', function(d){ return (d.startAngle + d.endAngle) / 2 > Math.PI ? 'end' : 'start'; })
        .attr('font-size', 8).attr('fill', 'var(--t1)')
        .text(function(d){
            var name = folderSet[d.index] || 'root';
            return name.length > 16 ? name.split('/').pop() : name;
        });

    // Center label
    svg.append('text').attr('x', cx).attr('y', cy - 8).attr('text-anchor','middle')
        .attr('font-size', 10).attr('fill', 'var(--t2)').attr('font-weight', 600)
        .text(N + ' folders');
    svg.append('text').attr('x', cx).attr('y', cy + 8).attr('text-anchor','middle')
        .attr('font-size', 8).attr('fill', 'var(--t3)')
        .text('Click arc to filter');
}
