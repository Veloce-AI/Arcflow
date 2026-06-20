/* parser-suggestions.js - Suggestion/recommendation generation */
Parser.generateSuggestions=function(data){
        var suggestions=[];
        // Based on dead functions
        if(data.stats.dead>10){
            suggestions.push({priority:'high',icon:'broom',title:'Remove Dead Code',desc:data.stats.dead+' unused functions detected. Removing them will improve maintainability and reduce bundle size.',action:'Review unused functions in the Issues panel',impact:'Reduces codebase by ~'+(data.stats.dead*15)+' lines'});
        }
        // Based on circular dependencies
        var circular=data.issues.filter(function(i){return i.title&&i.title.includes('Circular');});
        if(circular.length){
            suggestions.push({priority:'critical',icon:'refresh',title:'Break Circular Dependencies',desc:circular.length+' circular dependencies found. These cause tight coupling and make testing difficult.',action:'Extract shared code to a new module or use dependency injection',impact:'Improves testability and modularity'});
        }
        // Based on god files
        var godFiles=data.issues.filter(function(i){return i.title&&i.title.includes('Large');});
        if(godFiles.length){
            suggestions.push({priority:'high',icon:'split',title:'Split Large Files',desc:godFiles.length+' files have too many functions. Split by responsibility.',action:'Group related functions and extract to separate modules',impact:'Improves code navigation and testing'});
        }
        // Based on high coupling
        var coupling=data.issues.filter(function(i){return i.title&&i.title.includes('Coupled');});
        if(coupling.length){
            suggestions.push({priority:'medium',icon:'link',title:'Reduce Coupling',desc:coupling.length+' files are imported by many others. Consider if this is intentional.',action:'Review if these should be split or if importers should be consolidated',impact:'Reduces blast radius of changes'});
        }
        // Based on duplicates
        if(data.duplicates&&data.duplicates.length>0){
            var nameDups=data.duplicates.filter(function(d){return d.type==='name';});
            var codeDups=data.duplicates.filter(function(d){return d.type==='code';});
            if(nameDups.length){
                suggestions.push({priority:'medium',icon:'copy',title:'Resolve Naming Conflicts',desc:nameDups.length+' function names are duplicated across files. This can cause confusion.',action:'Rename functions to be more specific or consolidate into shared module',impact:'Prevents bugs from importing wrong function'});
            }
            if(codeDups.length){
                suggestions.push({priority:'high',icon:'box',title:'Extract Duplicated Code',desc:codeDups.length+' instances of similar code found. DRY principle violation.',action:'Create shared utility functions',impact:'Reduces maintenance burden and potential bugs'});
            }
        }
        // Based on layer violations
        if(data.layerViolations&&data.layerViolations.length>0){
            suggestions.push({priority:'high',icon:'layers',title:'Fix Architecture Violations',desc:data.layerViolations.length+' layer violations found. Lower layers should not depend on higher layers.',action:'Invert dependencies or use interfaces/events',impact:'Improves architecture and testability'});
        }
        // Based on security
        var highSec=data.securityIssues?data.securityIssues.filter(function(s){return s.severity==='high';}):[];
        if(highSec.length){
            suggestions.push({priority:'critical',icon:'shield',title:'Fix Security Issues',desc:highSec.length+' high-severity security issues found.',action:'Address hardcoded secrets, injection risks immediately',impact:'Prevents potential security breaches'});
        }
        // Test coverage hint
        var testFiles=data.files.filter(function(f){return f.name.includes('.test.')||f.name.includes('.spec.')||f.path.includes('__tests__');});
        var testRatio=data.files.length>0?(testFiles.length/data.files.length*100):0;
        if(testRatio<10&&data.files.length>10){
            suggestions.push({priority:'medium',icon:'beaker',title:'Add Test Coverage',desc:'Only '+testFiles.length+' test files found ('+Math.round(testRatio)+'%). Consider adding more tests.',action:'Focus on testing critical paths and high-complexity files',impact:'Prevents regressions and improves confidence'});
        }
        return suggestions.sort(function(a,b){var p={critical:0,high:1,medium:2,low:3};return p[a.priority]-p[b.priority];});
};
