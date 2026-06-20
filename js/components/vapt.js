/* vapt.js - VAPT (Vulnerability Assessment & Penetration Testing) Report Modal */

var VAPT_OWASP_MAP={
    'Hardcoded Secret':{owasp:'A07:2021',owaspName:'Identification & Auth Failures',cwe:'CWE-798',cweName:'Use of Hard-coded Credentials',cvss:'CVSS 9.8 (Critical)',
        impact:'Attacker can authenticate as a privileged service account and pivot to cloud resources, databases, or third-party APIs. Credentials leaked in public repos are scraped by automated bots within minutes of a push.',
        steps:['Remove the credential from source code immediately and invalidate it','Generate a new credential to replace the exposed one','Store secrets in environment variables or a dedicated secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler)','Add the pattern to .gitignore and integrate git-secrets or TruffleHog in CI to prevent recurrence','Audit access logs for the exposed credential to detect past exploitation'],
        remediation:'Move credentials to environment variables or a secrets manager. Never commit secrets to source control.'},
    'AWS Key Exposed':{owasp:'A07:2021',owaspName:'Identification & Auth Failures',cwe:'CWE-798',cweName:'Use of Hard-coded Credentials',cvss:'CVSS 9.8 (Critical)',
        impact:"Attacker gains AWS account access matching the key's IAM permissions — can exfiltrate S3 data, spin up EC2 instances for crypto-mining, delete backups, or pivot to RDS and other services. Keys in public repos are harvested in under 2 minutes.",
        steps:['Rotate (deactivate then delete) the exposed key immediately via AWS IAM console','Assume it is already compromised — check CloudTrail for API calls from the past 30 days','Replace long-lived keys with IAM roles on EC2/Lambda/ECS — no static credentials needed','Store any remaining keys in AWS Secrets Manager or SSM Parameter Store (SecureString)','Enable AWS GuardDuty to alert on future credential anomalies'],
        remediation:'Rotate the key immediately. Use IAM roles or environment variables. Consider AWS Secrets Manager.'},
    'SQL Injection Risk':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-89',cweName:'SQL Injection',cvss:'CVSS 9.8 (Critical)',
        impact:'Attacker can read all database tables, bypass authentication, extract PII and password hashes, modify or delete records. On SQL Server with xp_cmdshell enabled: full OS command execution.',
        steps:['Replace string concatenation with parameterized queries / prepared statements','For ORMs: use the query builder exclusively — never raw f-string/format SQL with user input','Apply allowlist input validation as a secondary control (reject unexpected characters/types)','Enforce DB least-privilege: separate read-only and write accounts, no DROP/ALTER grants','Deploy a WAF rule to block common SQLi payloads at the network perimeter'],
        remediation:'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL strings.'},
    'XSS Vulnerability':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-79',cweName:'Cross-site Scripting (XSS)',cvss:'CVSS 8.1 (High)',
        impact:'Attacker can steal session cookies, capture keystrokes, redirect users to phishing pages, or perform actions on behalf of the victim within the vulnerable domain. Stored XSS affects every user who visits the page.',
        steps:['Replace innerHTML with textContent for any plain-text output','When HTML rendering is required: sanitize input with DOMPurify before insertion','Set a strict Content-Security-Policy header to restrict script sources','Enable HttpOnly and Secure flags on session cookies to limit cookie theft','Use a templating engine with auto-escaping (React JSX, Jinja2 autoescaping) as default'],
        remediation:'Use textContent instead of innerHTML. Sanitize with DOMPurify before any HTML insertion. Enable CSP headers.'},
    'eval() Usage':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-95',cweName:'Code Injection via Evaluated Input',cvss:'CVSS 8.8 (High)',
        impact:"If any user-controlled data reaches eval(), attacker executes arbitrary JavaScript in the browser or Node.js process — full application compromise including data exfiltration.",
        steps:['For JSON parsing: replace eval() with JSON.parse()','For dynamic dispatch: use a whitelist object ({ add: fn, remove: fn }[action]())','Server-side: use sandboxed VM (vm2, isolated-vm) if code eval is unavoidable','Remove unsafe-eval from Content-Security-Policy — broken eval() calls will then surface immediately','Add eslint rule no-eval to prevent future occurrences'],
        remediation:'Replace eval() with JSON.parse() for data or a dispatch table for dynamic calls. Avoid executing dynamic strings.'},
    'Python eval()':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-95',cweName:'Code Injection via Evaluated Input',cvss:'CVSS 8.8 (High)',
        impact:'Arbitrary Python code execution on the server. Attacker can read system files, launch subprocesses, exfiltrate secrets from environment variables, or establish a reverse shell.',
        steps:['For parsing literals: use ast.literal_eval() (safe for strings, numbers, dicts, lists)','For dynamic dispatch: use a dict lookup — {\'add\': fn, \'remove\': fn}[action]()','For math expressions: use a safe parser like simpleeval or numexpr','If eval is truly unavoidable: sandbox with RestrictedPython or an isolated subprocess','Add Bandit rule B307 to CI to flag eval() automatically'],
        remediation:'Use ast.literal_eval() for safe literal parsing. Restructure to avoid dynamic code execution entirely.'},
    'Python exec()':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-95',cweName:'Code Injection via Evaluated Input',cvss:'CVSS 8.8 (High)',
        impact:'Full server-side code execution. Attacker can overwrite files, install malware, exfiltrate environment variables and secrets, or take over the entire host process.',
        steps:['Refactor to a dict dispatch table — eliminates the need for exec() entirely','For loading plugins: use importlib.import_module() with a strict allowlist of module names','If user-submitted code must run: execute in an isolated container with seccomp + network restrictions','Validate and sanitize any string before it can reach exec()','Add Bandit rule B102 to CI to automatically flag exec() usage'],
        remediation:'Refactor to avoid exec(). Use a dict dispatch table for dynamic function calls.'},
    'Pickle Deserialization':{owasp:'A08:2021',owaspName:'Software & Data Integrity Failures',cwe:'CWE-502',cweName:'Deserialization of Untrusted Data',cvss:'CVSS 9.8 (Critical)',
        impact:'Deserializing attacker-supplied pickle data triggers arbitrary Python code execution before any validation runs. Classic vector for supply-chain attacks and malicious API payloads.',
        steps:['Switch to JSON, MessagePack, or Protocol Buffers for data exchange','For ML models: use safetensors format instead of pickle-based .pkl/.pt files','If pickle is unavoidable: HMAC-sign payloads and verify signature before calling loads()','Never unpickle data received over the network or from user-controlled uploads','Add Bandit B301/B302 to CI to flag pickle.loads() usage automatically'],
        remediation:'Use JSON, MessagePack, or Protocol Buffers instead. If pickle is unavoidable, sign payloads with HMAC.'},
    'yaml.load() Unsafe':{owasp:'A08:2021',owaspName:'Software & Data Integrity Failures',cwe:'CWE-502',cweName:'Deserialization of Untrusted Data',cvss:'CVSS 8.1 (High)',
        impact:"PyYAML's yaml.load() can instantiate arbitrary Python objects via !!python/object tags — enabling remote code execution when loading untrusted YAML files or API responses.",
        steps:['Replace yaml.load(data) with yaml.safe_load(data) everywhere','For full-featured YAML: use yaml.load(data, Loader=yaml.SafeLoader) explicitly','Add Bandit B506 to CI to catch unsafe yaml.load() calls automatically','Validate YAML schema after safe loading (e.g. with pydantic or cerberus)','If YAML comes from user input: consider JSON instead — no object instantiation possible'],
        remediation:'Use yaml.safe_load() instead. Never load YAML from untrusted sources without SafeLoader.'},
    'Path Traversal Risk':{owasp:'A01:2021',owaspName:'Broken Access Control',cwe:'CWE-22',cweName:'Path Traversal',cvss:'CVSS 7.5 (High)',
        impact:'Attacker reads arbitrary server files (/etc/passwd, .env, private keys, config files) by injecting ../ sequences. May escalate to writing files if the endpoint has write access.',
        steps:['Resolve the full path: Path(user_input).resolve() or os.path.realpath()','Assert the resolved path starts with the permitted base directory before opening','Use an allowlist of permitted filenames/extensions rather than blocklisting ../','Serve static files via a web server (nginx/S3) rather than application code','Log and alert on path traversal patterns — they indicate active reconnaissance'],
        remediation:'Validate paths with os.path.realpath(). Verify the resolved path starts with the allowed base directory.'},
    'Weak Hash (MD5/SHA1)':{owasp:'A02:2021',owaspName:'Cryptographic Failures',cwe:'CWE-326',cweName:'Inadequate Encryption Strength',cvss:'CVSS 7.5 (High)',
        impact:'MD5 and SHA-1 are broken for security. Password hashes can be cracked via rainbow tables or GPU brute force in hours. SHA-1 TLS certificates are rejected by modern browsers.',
        steps:['For checksums and integrity: upgrade to SHA-256 (hashlib.sha256) or SHA-3','For passwords: use bcrypt, scrypt, or Argon2 — never a raw hash function, even SHA-256','For HMACs: use HMAC-SHA256 as the minimum acceptable algorithm','Migrate any stored MD5/SHA-1 password hashes on next user login','Document cryptographic algorithm choices in an architecture decision record'],
        remediation:'Use SHA-256 or SHA-3 for hashing. For passwords use bcrypt, scrypt, or Argon2 — never raw hash functions.'},
    'Math.random() for Crypto':{owasp:'A02:2021',owaspName:'Cryptographic Failures',cwe:'CWE-338',cweName:'Weak Pseudo-Random Number Generator',cvss:'CVSS 7.5 (High)',
        impact:'Math.random() is not cryptographically secure and is predictable. Tokens, session IDs, or OTPs generated with it can be predicted, enabling session hijacking or CSRF bypass.',
        steps:['In browsers: replace with crypto.getRandomValues(new Uint8Array(32))','In Node.js: replace with crypto.randomBytes(32).toString(\'hex\')','For UUIDs: use the Web Crypto API crypto.randomUUID() or the uuid npm package','Audit all token/OTP/nonce generation code paths for Math.random() usage','Add eslint-plugin-security rule to flag Math.random() in security-sensitive contexts'],
        remediation:'Use crypto.getRandomValues() (browser) or crypto.randomBytes() (Node.js) for cryptographic randomness.'},
    'requests verify=False':{owasp:'A02:2021',owaspName:'Cryptographic Failures',cwe:'CWE-295',cweName:'Improper Certificate Validation',cvss:'CVSS 7.4 (High)',
        impact:'Disables TLS certificate verification entirely. Any network attacker (coffee-shop Wi-Fi, compromised DNS) can intercept HTTPS traffic, steal credentials, and inject malicious responses.',
        steps:['Remove verify=False from all requests calls','For self-signed certificates: pass the CA cert path explicitly: verify="/path/to/ca.crt"','Add the internal CA to the system trust store so all tools verify it automatically','Use certifi for up-to-date CA bundles: verify=certifi.where()','Add a pre-commit hook or CI gate to reject verify=False from merging'],
        remediation:'Remove verify=False. For self-signed certs specify the CA bundle explicitly: verify="/path/to/ca.crt".'},
    'subprocess shell=True':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-78',cweName:'OS Command Injection',cvss:'CVSS 9.8 (Critical)',
        impact:"Any user input reaching shell=True enables injection of ; | $() metacharacters to run arbitrary OS commands with the application's user privileges — full server takeover.",
        steps:['Pass arguments as a list: subprocess.run(["cmd", "arg1", arg2]) — no shell parsing','Set shell=False (the default) — this bypasses the shell entirely','Validate and sanitize any dynamic values used as command arguments','If shell features are truly needed: use shlex.quote() on each individual argument','Run the application under a least-privilege OS user with minimal filesystem permissions'],
        remediation:'Pass arguments as a list: subprocess.run(["cmd","arg"]). Never pass user input to a shell=True command.'},
    'SendKeys Usage':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-78',cweName:'OS Command Injection',cvss:'CVSS 6.5 (Medium)',
        impact:'SendKeys can inject keystrokes into other application windows, potentially triggering privileged actions in system dialogs, admin tools, or running processes on the same desktop.',
        steps:['Replace SendKeys with the target application\'s programmatic API','If SendKeys cannot be avoided: validate all strings passed to it against a strict allowlist','Run automation scripts in isolated, sandboxed environments (VMs, containers)','Log all SendKeys invocations for audit purposes','Migrate to UI automation frameworks with explicit element targeting (Playwright, Selenium)'],
        remediation:'Replace SendKeys with specific API calls. Validate all input before any keyboard simulation.'},
    'Shell Command Execution':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-78',cweName:'OS Command Injection',cvss:'CVSS 8.1 (High)',
        impact:'Shell execution with user-controlled input enables arbitrary OS command injection — read/write files, exfiltrate secrets, install backdoors, or take over the host.',
        steps:['Identify every code path where user input flows into shell commands','Replace shell invocation with specific language library or OS API calls','Apply allowlist validation on any dynamic values used in commands','Apply least-privilege to the process OS user (no root/SYSTEM)','Enable application-level logging of all shell invocations for audit trails'],
        remediation:'Use specific APIs instead of shell commands. Validate and sanitize any input used in command construction.'},
    'WScript.Shell Creation':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-78',cweName:'OS Command Injection',cvss:'CVSS 8.1 (High)',
        impact:'WScript.Shell provides full OS shell access from VBScript/JScript. Attacker can run arbitrary executables, modify the Windows registry, or establish persistence across reboots.',
        steps:['Replace WScript.Shell.Run with a specific COM object or .NET API','If shell execution is required: validate command strings against a strict allowlist','Restrict script execution context with AppLocker or Software Restriction Policies','Log all WScript.Shell invocations to Windows Event Log','Consider migrating legacy VBScript automation to PowerShell with Constrained Language Mode'],
        remediation:'Avoid WScript.Shell where possible. Use specific COM objects. Ensure all input is validated.'},
    'Application.Run Usage':{owasp:'A03:2021',owaspName:'Injection',cwe:'CWE-78',cweName:'OS Command Injection',cvss:'CVSS 7.2 (High)',
        impact:'Dynamic macro execution via Application.Run can be abused to run hidden VBA macros, bypass Office macro security settings, or execute injected code from external data sources.',
        steps:['Replace Application.Run with direct Sub/Function calls where possible','For dynamic dispatch: use a Select Case or Dictionary mapping over allowed macro names only','Validate macro name strings against a strict allowlist before passing to Application.Run','Enable macro signing and Office Trust Center restrictions to block unsigned macros','Audit all Application.Run calls and document their intended purpose in comments'],
        remediation:'Use specific macros or APIs. Avoid dynamic macro execution from user-controlled strings.'}
};
var VAPT_DEFAULT_OWASP={owasp:'A05:2021',owaspName:'Security Misconfiguration',cwe:'CWE-693',cweName:'Protection Mechanism Failure',cvss:'CVSS 5.3 (Medium)',
    impact:'Misconfigured security controls can expose internal interfaces, enable unauthorized access, or allow attackers to bypass authentication and authorization mechanisms.',
    steps:['Review the specific configuration against OWASP hardening guidelines for this platform','Apply the principle of least privilege to all settings','Remove unnecessary features, services, and default/demo accounts','Automate configuration scanning in CI (Checkov, tfsec, trivy, Lynis)','Document the rationale for any non-default security settings in architecture docs'],
    remediation:'Apply the principle of least privilege and follow security hardening guidelines for this pattern.'};
function vaptGetOwasp(title){return VAPT_OWASP_MAP[title]||VAPT_DEFAULT_OWASP;}

function vaptFindCycles(connections){
    var adj=Object.create(null);var allNodes=new Set();
    (connections||[]).forEach(function(c){
        var s=typeof c.source==='object'?c.source.id:c.source;
        var t=typeof c.target==='object'?c.target.id:c.target;
        allNodes.add(s);allNodes.add(t);
        if(!adj[s])adj[s]=[];adj[s].push(t);
    });
    var idx=0,stack=[],onStack=new Set(),indices=Object.create(null),lowlinks=Object.create(null),sccs=[];
    function sc(v){
        indices[v]=lowlinks[v]=idx++;stack.push(v);onStack.add(v);
        (adj[v]||[]).forEach(function(w){
            if(indices[w]===undefined){sc(w);lowlinks[v]=Math.min(lowlinks[v],lowlinks[w]);}
            else if(onStack.has(w)){lowlinks[v]=Math.min(lowlinks[v],indices[w]);}
        });
        if(lowlinks[v]===indices[v]){var scc=[],w;do{w=stack.pop();onStack.delete(w);scc.push(w);}while(w!==v);if(scc.length>1)sccs.push(scc);}
    }
    allNodes.forEach(function(v){if(indices[v]===undefined){try{sc(v);}catch(e){}}});
    return sccs;
}

function vaptComputeSmells(data){
    var smells=[];
    (data.files||[]).forEach(function(f){
        var fns=f.functions||[];var ccSum=fns.reduce(function(s,fn){return s+(fn.cc||1);},0);
        if(fns.length>20)smells.push({type:'God File',severity:'medium',file:f.path,detail:fns.length+' functions — split into focused modules',metric:fns.length+' fns'});
        else if(ccSum>100)smells.push({type:'High Complexity',severity:'medium',file:f.path,detail:'Total CC '+ccSum+' — file is overly complex',metric:'CC '+ccSum});
        else if(fns.length>1){var avg=ccSum/fns.length;if(avg>15)smells.push({type:'High Avg CC',severity:'low',file:f.path,detail:'Avg CC '+avg.toFixed(1)+' per function — refactor complex functions',metric:'avg CC '+avg.toFixed(1)});}
    });
    var cycles=vaptFindCycles(data.connections);
    cycles.slice(0,20).forEach(function(scc){
        var names=scc.map(function(p){return p.split('/').pop();});
        smells.push({type:'Circular Dependency',severity:'medium',file:scc[0],detail:scc.length+'-file cycle: '+names.join(' → ')+' → '+names[0],metric:scc.length+' files'});
    });
    (data.layerViolations||[]).slice(0,25).forEach(function(v){
        smells.push({type:'Layer Violation',severity:'low',file:v.from||'',detail:(v.fromLayer||'?')+' importing '+(v.toLayer||'?')+': '+v.from+' → '+v.to,metric:''});
    });
    var connSrc=new Set((data.connections||[]).map(function(c){return typeof c.source==='object'?c.source.id:c.source;}));
    var connTgt=new Set((data.connections||[]).map(function(c){return typeof c.target==='object'?c.target.id:c.target;}));
    (data.files||[]).forEach(function(f){
        if(!connSrc.has(f.path)&&!connTgt.has(f.path))
            smells.push({type:'Orphaned File',severity:'low',file:f.path,detail:'No import or dependency edges — may be dead code or a standalone utility',metric:''});
    });
    return smells;
}

function vaptRiskScore(secIssues,osvData,smells){
    var score=100;
    (secIssues||[]).forEach(function(i){if(i.severity==='critical')score-=20;else if(i.severity==='high')score-=8;else if(i.severity==='medium')score-=4;else score-=1;});
    score-=Math.min(((osvData&&osvData.totalVulns)||0)*6,30);
    score-=Math.min((smells||[]).filter(function(s){return s.type==='God File'||s.type==='High Complexity';}).length*2,10);
    score-=Math.min((smells||[]).filter(function(s){return s.type==='Layer Violation';}).length,8);
    return Math.max(0,Math.min(100,Math.round(score)));
}

// ─── License Scanner ────────────────────────────────────────────────────────
var LICENSE_COPYLEFT_STRONG=['GPL-2.0','GPL-3.0','AGPL-3.0','AGPL-1.0','GPL','AGPL'];
var LICENSE_COPYLEFT_WEAK=['LGPL-2.0','LGPL-2.1','LGPL-3.0','LGPL','MPL-2.0','MPL','EUPL-1.1','EUPL-1.2','OSL-3.0','CDDL-1.0','EPL-1.0','EPL-2.0'];
var LICENSE_NONCOMMERCIAL=['CC-BY-NC','CC-BY-NC-SA','CC-BY-NC-ND','PolyForm-Noncommercial','SSPL'];
var LICENSE_PERMISSIVE=['MIT','Apache-2.0','Apache-1.1','BSD-2-Clause','BSD-3-Clause','ISC','0BSD','Unlicense','Zlib','Artistic-2.0','WTFPL','CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0'];

function vaptLicenseRisk(licStr){
    if(!licStr||licStr==='UNLICENSED')return{risk:'info',label:'Unlicensed / Unknown',reason:'No license declared — all rights reserved by default. You may not have the right to use or distribute this package.'};
    var l=licStr.toUpperCase().replace(/\s/g,'-');
    for(var i=0;i<LICENSE_COPYLEFT_STRONG.length;i++){if(l.includes(LICENSE_COPYLEFT_STRONG[i].toUpperCase()))return{risk:'high',label:licStr,reason:'Strong copyleft — any software that links to or distributes this package may be required to be released under the same license (GPL/AGPL). Critical for commercial / proprietary products.'};}
    for(var j=0;j<LICENSE_NONCOMMERCIAL.length;j++){if(l.includes(LICENSE_NONCOMMERCIAL[j].toUpperCase()))return{risk:'high',label:licStr,reason:'Non-commercial clause — may not be used in commercial products without a separate commercial license.'};}
    for(var k=0;k<LICENSE_COPYLEFT_WEAK.length;k++){if(l.includes(LICENSE_COPYLEFT_WEAK[k].toUpperCase()))return{risk:'medium',label:licStr,reason:'Weak copyleft — modifications to this library may need to be shared, but your application code is typically unaffected. Review carefully for static linking.'};}
    for(var m=0;m<LICENSE_PERMISSIVE.length;m++){if(l.includes(LICENSE_PERMISSIVE[m].toUpperCase()))return{risk:'ok',label:licStr,reason:'Permissive — generally safe for commercial and proprietary use. Check attribution requirements (e.g. MIT copyright notice).'  };}
    return{risk:'info',label:licStr,reason:'License not in known list — review manually to confirm commercial use rights.'};
}

function vaptScanLicenses(files){
    var results=[];
    (files||[]).forEach(function(f){
        var name=(f.name||'').toLowerCase();
        var path=f.path||'';
        var src=f.content||'';
        if(!src.trim())return;

        // package.json
        if(name==='package.json'){
            try{
                var pkg=JSON.parse(src);
                var lic=pkg.license||pkg.licence||'';
                if(typeof lic==='object'&&lic.type)lic=lic.type;
                var r=vaptLicenseRisk(lic||'UNLICENSED');
                results.push({file:path,source:'package.json',package:pkg.name||path,license:lic||'(none)',risk:r.risk,label:r.label,reason:r.reason});
            }catch(e){}
        }
        // pyproject.toml
        if(name==='pyproject.toml'){
            var m=src.match(/license\s*=\s*\{[^}]*text\s*=\s*['"]([^'"]+)['"]/i)||src.match(/license\s*=\s*['"]([^'"]+)['"]/i);
            if(m){var r2=vaptLicenseRisk(m[1]);results.push({file:path,source:'pyproject.toml',package:path,license:m[1],risk:r2.risk,label:r2.label,reason:r2.reason});}
        }
        // setup.py
        if(name==='setup.py'){
            var m2=src.match(/license\s*=\s*['"]([^'"]+)['"]/i);
            if(m2){var r3=vaptLicenseRisk(m2[1]);results.push({file:path,source:'setup.py',package:path,license:m2[1],risk:r3.risk,label:r3.label,reason:r3.reason});}
        }
        // Cargo.toml
        if(name==='cargo.toml'){
            var m3=src.match(/license\s*=\s*['"]([^'"]+)['"]/i);
            if(m3){var r4=vaptLicenseRisk(m3[1]);results.push({file:path,source:'Cargo.toml',package:path,license:m3[1],risk:r4.risk,label:r4.label,reason:r4.reason});}
        }
        // composer.json (PHP)
        if(name==='composer.json'){
            try{
                var comp=JSON.parse(src);
                var clic=(comp.license||'');
                if(Array.isArray(clic))clic=clic.join(' OR ');
                var r5=vaptLicenseRisk(clic||'UNLICENSED');
                results.push({file:path,source:'composer.json',package:comp.name||path,license:clic||'(none)',risk:r5.risk,label:r5.label,reason:r5.reason});
            }catch(e){}
        }
        // Go module — no license field in go.mod, skip
        // LICENSE file → detect license by content keywords
        if(/^license(\.(txt|md))?$/i.test(name)||(path.endsWith('/LICENSE')||path.endsWith('\\LICENSE'))){
            var lc=src.slice(0,400).toUpperCase();
            var detected='Unknown';
            if(lc.includes('AFFERO'))detected='AGPL-3.0';
            else if(lc.includes('GNU GENERAL PUBLIC LICENSE')&&lc.includes('VERSION 3'))detected='GPL-3.0';
            else if(lc.includes('GNU GENERAL PUBLIC LICENSE')&&lc.includes('VERSION 2'))detected='GPL-2.0';
            else if(lc.includes('GNU LESSER GENERAL PUBLIC LICENSE')&&lc.includes('VERSION 3'))detected='LGPL-3.0';
            else if(lc.includes('GNU LESSER GENERAL PUBLIC LICENSE'))detected='LGPL-2.1';
            else if(lc.includes('MOZILLA PUBLIC LICENSE'))detected='MPL-2.0';
            else if(lc.includes('MIT LICENSE')||lc.includes('PERMISSION IS HEREBY GRANTED'))detected='MIT';
            else if(lc.includes('APACHE LICENSE'))detected='Apache-2.0';
            else if(lc.includes('BSD '))detected='BSD';
            else if(lc.includes('ISC LICENSE'))detected='ISC';
            if(detected!=='Unknown'){var r6=vaptLicenseRisk(detected);results.push({file:path,source:'LICENSE file',package:path,license:detected,risk:r6.risk,label:r6.label,reason:r6.reason});}
        }
    });
    return results;
}

function exportVaptJSON(data,osvData,smells){
    var secIssues=data.securityIssues||[];
    var out={generated:new Date().toISOString(),riskScore:vaptRiskScore(secIssues,osvData,smells),
        summary:{files:data.stats.files,functions:data.stats.functions,securityFindings:secIssues.length,cveDependencies:(osvData&&osvData.totalVulns)||0,architectureSmells:smells.length},
        findings:secIssues.map(function(i){var ow=vaptGetOwasp(i.title);return{severity:i.severity,title:i.title,file:i.path,line:i.line,owasp:ow.owasp,owaspName:ow.owaspName,cwe:ow.cwe,cweName:ow.cweName,cvss:ow.cvss,impact:ow.impact,steps:ow.steps,description:i.desc,code:i.code,remediation:ow.remediation};}),
        dependencyVulns:Object.values((osvData&&osvData.vulnMap)||{}).map(function(e){return{package:e.pkg.name,version:e.pkg.version,ecosystem:e.pkg.ecosystem,vulns:e.vulns};}),
        architectureSmells:smells};
    var blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='vapt-report.json';a.click();URL.revokeObjectURL(url);
}

function exportVaptHTML(data,osvData,smells,riskScore,licenseRisks){
    var secIssues=data.securityIssues||[];
    var critical=secIssues.filter(function(i){return i.severity==='critical';});
    var high=secIssues.filter(function(i){return i.severity==='high';});
    var medium=secIssues.filter(function(i){return i.severity==='medium';});
    var low=secIssues.filter(function(i){return i.severity==='low'||i.severity==='info';});
    var rc=riskScore>=75?'#22c55e':riskScore>=50?'#f59e0b':riskScore>=25?'#f97316':'#ef4444';
    var rl=riskScore>=75?'Low Risk':riskScore>=50?'Medium Risk':riskScore>=25?'High Risk':'Critical Risk';
    function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function badge(sev){var c=sev==='critical'?'#7c3aed':sev==='high'?'#ef4444':sev==='medium'?'#f97316':'#22c55e';return'<span style="background:'+c+';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase">'+sev+'</span>';}
    function findingCard(f){
        var ow=vaptGetOwasp(f.title);
        var bc=f.severity==='critical'?'#7c3aed':f.severity==='high'?'#ef4444':f.severity==='medium'?'#f97316':'#22c55e';
        var stepsHtml=ow.steps?'<div style="margin-top:10px"><div style="color:#fbbf24;font-size:11px;font-weight:600;margin-bottom:5px">🔧 Step-by-step Fix</div><ol style="margin:0;padding-left:18px;color:#cbd5e1;font-size:12px;line-height:1.8">'+ow.steps.map(function(s){return'<li>'+esc(s)+'</li>';}).join('')+'</ol></div>':'';
        return'<div style="border:1px solid #21262d;border-left:4px solid '+bc+';border-radius:6px;margin:10px 0;padding:14px;background:#161b22">'
            +'<div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px">'+badge(f.severity)+'<strong style="color:#f1f5f9;font-size:13px">'+esc(f.title)+'</strong>'
            +'<span style="background:#1e3a5f;color:#93c5fd;padding:1px 7px;border-radius:3px;font-size:10px">'+ow.owasp+' — '+esc(ow.owaspName)+'</span>'
            +'<span style="background:#1a2e1a;color:#86efac;padding:1px 7px;border-radius:3px;font-size:10px">'+ow.cwe+' — '+esc(ow.cweName)+'</span>'
            +(ow.cvss?'<span style="background:#2d1f3d;color:#c084fc;padding:1px 7px;border-radius:3px;font-size:10px">'+esc(ow.cvss)+'</span>':'')
            +'</div>'
            +'<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">📍 <code style="color:#fbbf24">'+esc(f.path+(f.line?':'+f.line:''))+'</code></div>'
            +(f.code?'<pre style="background:#0d1117;color:#e2e8f0;padding:8px;border-radius:4px;overflow-x:auto;font-size:11px;margin:8px 0;white-space:pre-wrap">'+esc(f.code)+'</pre>':'')
            +'<div style="color:#cbd5e1;font-size:12px;margin:5px 0">'+esc(f.desc)+'</div>'
            +(ow.impact?'<div style="background:#1c1a00;border:1px solid rgba(251,191,36,0.2);border-radius:4px;padding:8px 10px;font-size:12px;color:#fde68a;margin-top:8px">⚡ <strong>Impact:</strong> '+esc(ow.impact)+'</div>':'')
            +stepsHtml
            +'<div style="display:flex;gap:8px;margin-top:10px">'
            +'<a href="https://cwe.mitre.org/data/definitions/'+ow.cwe.replace('CWE-','')+'.html" target="_blank" style="color:#86efac;font-size:10px;text-decoration:none">'+ow.cwe+' ↗</a>'
            +'<a href="https://owasp.org/Top10/'+ow.owasp.split(':')[0].replace('A','A0').slice(0,3)+'_'+new Date().getFullYear()+'/" target="_blank" style="color:#93c5fd;font-size:10px;text-decoration:none">OWASP '+ow.owasp+' ↗</a>'
            +'</div></div>';
    }
    function smellCard(s){
        var bc=s.severity==='medium'?'#f97316':'#6366f1';
        return'<div style="border:1px solid #21262d;border-left:4px solid '+bc+';border-radius:6px;margin:8px 0;padding:11px 13px;background:#161b22">'
            +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">'+badge(s.severity)+'<strong style="color:#f1f5f9;font-size:12px">'+esc(s.type)+'</strong>'+(s.metric?'<span style="background:#1e3a5f;color:#93c5fd;padding:1px 6px;border-radius:3px;font-size:10px">'+esc(s.metric)+'</span>':'')+'</div>'
            +'<div style="color:#94a3b8;font-size:12px;margin-bottom:4px">📍 <code style="color:#fbbf24">'+esc(s.file)+'</code></div>'
            +'<div style="color:#cbd5e1;font-size:12px">'+esc(s.detail)+'</div>'
            +'</div>';
    }
    // OWASP coverage groups for bar chart
    var owGroups={};
    secIssues.forEach(function(i){var k=vaptGetOwasp(i.title).owasp;owGroups[k]=(owGroups[k]||0)+1;});
    var owEntries=Object.keys(owGroups).sort().map(function(k){return{k:k,v:owGroups[k]};});
    var owMax=owEntries.reduce(function(m,e){return Math.max(m,e.v);},1);
    var owHtml=owEntries.length>0?'<div style="background:#161b22;border:1px solid #21262d;border-radius:6px;padding:14px;margin-bottom:20px">'
        +'<div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">OWASP Coverage Distribution</div>'
        +owEntries.map(function(e){return'<div style="display:grid;grid-template-columns:80px 1fr 24px;align-items:center;gap:8px;margin-bottom:6px">'
            +'<span style="font-size:10px;color:#93c5fd;font-family:monospace">'+esc(e.k)+'</span>'
            +'<div style="background:#0d1117;border-radius:3px;height:14px;overflow:hidden"><div style="background:#6366f1;height:100%;border-radius:3px;width:'+Math.round(e.v/owMax*100)+'%"></div></div>'
            +'<span style="font-size:10px;color:#94a3b8;text-align:right">'+e.v+'</span></div>';}).join('')
        +'</div>':'';
    var chklist=[];
    if(critical.length)chklist.push('<li style="color:#c084fc">Fix '+critical.length+' critical finding(s) immediately</li>');
    if(high.length)chklist.push('<li style="color:#f87171">Resolve '+high.length+' high severity finding(s) this sprint</li>');
    if((osvData&&osvData.totalVulns||0)>0)chklist.push('<li style="color:#60a5fa">Update '+osvData.totalPkgs+' vulnerable package(s) ('+osvData.totalVulns+' CVEs)</li>');
    if(medium.length)chklist.push('<li style="color:#fb923c">Address '+medium.length+' medium severity finding(s) within 30 days</li>');
    var gc=smells.filter(function(s){return s.type==='God File';}).length;
    if(gc)chklist.push('<li>Refactor '+gc+' God File(s) into smaller modules</li>');
    var vc=smells.filter(function(s){return s.type==='Layer Violation';}).length;
    if(vc)chklist.push('<li>Fix '+vc+' architecture layer violation(s)</li>');
    if(low.length)chklist.push('<li style="color:#86efac">Review '+low.length+' low severity finding(s)</li>');
    var htmlGplCount=(licenseRisks||[]).filter(function(l){return l.risk==='high';}).length;
    if(htmlGplCount)chklist.push('<li style="color:#fb923c">Review '+htmlGplCount+' high-risk license(s) (GPL/AGPL) before commercial distribution</li>');
    var licHtml=(licenseRisks&&licenseRisks.length>0)?licenseRisks.map(function(lr){
        var rc2=lr.risk==='high'?'#ef4444':lr.risk==='medium'?'#f97316':lr.risk==='ok'?'#22c55e':'#64748b';
        var rl2=lr.risk==='high'?'HIGH RISK':lr.risk==='medium'?'MEDIUM RISK':lr.risk==='ok'?'PERMISSIVE':'INFO';
        return'<div style="border:1px solid #21262d;border-left:4px solid '+rc2+';border-radius:6px;margin:8px 0;padding:11px 13px;background:#161b22">'
            +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
            +'<span style="background:'+rc2+';color:#fff;padding:1px 7px;border-radius:3px;font-size:9px;font-weight:700">'+rl2+'</span>'
            +'<strong style="color:#f1f5f9;font-size:12px">'+esc(lr.label||lr.license)+'</strong>'
            +'<span style="color:#94a3b8;font-size:10px;margin-left:auto;font-family:monospace">'+esc(lr.source)+'</span></div>'
            +'<div style="color:#fbbf24;font-size:10px;font-family:monospace;margin-bottom:4px">'+esc(lr.file)+'</div>'
            +'<div style="color:#cbd5e1;font-size:12px">'+esc(lr.reason)+'</div></div>';
    }).join(''):'';
    var osvHtml=Object.values((osvData&&osvData.vulnMap)||{}).map(function(e){
        return'<div style="border:1px solid #21262d;border-radius:6px;margin:8px 0;padding:12px;background:#161b22">'
            +'<strong style="color:#f1f5f9">'+esc(e.pkg.name)+'</strong> <span style="color:#94a3b8;font-size:11px">v'+esc(e.pkg.version)+' ('+esc(e.pkg.ecosystem)+')</span>'
            +'<div style="margin-top:5px">'+e.vulns.map(function(v){return'<div style="font-size:12px;margin:3px 0"><a href="'+esc(v.url)+'" target="_blank" style="color:#60a5fa;text-decoration:none">'+esc(v.id)+'</a> <span style="color:#94a3b8">— '+esc(v.summary)+'</span></div>';}).join('')+'</div>'
            +'</div>';
    }).join('');
    var glossary='<div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:16px;margin-bottom:24px">'
        +'<div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">What these terms mean</div>'
        +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">'
        +[['VAPT','Vulnerability Assessment & Penetration Testing','Finding and documenting security holes before attackers do'],
          ['OWASP','Open Web Application Security Project','A list of the top 10 most critical web security risks (updated every 4 years)'],
          ['CWE','Common Weakness Enumeration','A numbered catalogue of specific software weakness types, maintained by MITRE'],
          ['CVSS','Common Vulnerability Scoring System','A 0–10 number measuring how severe a vulnerability is (7+ = High, 9+ = Critical)'],
          ['CVE','Common Vulnerabilities & Exposures','Publicly known, uniquely identified security bugs in specific software versions'],
          ['SARIF','Static Analysis Results Interchange Format','A standard file format for sharing code-scan results with tools like GitHub Code Scanning']
        ].map(function(t){return'<div style="background:#161b22;border-radius:5px;padding:8px 10px">'
            +'<span style="color:#6366f1;font-weight:700;font-family:monospace;font-size:12px">'+t[0]+'</span>'
            +' <span style="color:#94a3b8;font-size:10px">'+esc(t[1])+'</span>'
            +'<div style="color:#cbd5e1;font-size:11px;margin-top:2px">'+esc(t[2])+'</div></div>';}).join('')
        +'</div></div>';
    var html='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>VAPT Report — Arcflow</title>'
        +'<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0d1117;color:#e2e8f0;line-height:1.6}.wrap{max-width:900px;margin:0 auto;padding:32px 20px}'
        +'h2{font-size:13px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin:28px 0 10px;padding-bottom:8px;border-bottom:1px solid #1e293b}'
        +'@media print{body{background:#fff;color:#000}a{color:#1d4ed8}}</style></head><body><div class="wrap">'
        +'<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:24px;display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">'
        +'<div><div style="font-size:22px;font-weight:800;color:#f1f5f9;margin-bottom:4px">VAPT Security Report</div>'
        +'<div style="color:#64748b;font-size:12px">Generated by Arcflow · '+new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})+'</div>'
        +'<div style="display:flex;gap:14px;margin-top:16px;flex-wrap:wrap">'
        +[['#7c3aed',critical.length,'Critical'],['#ef4444',high.length,'High'],['#f97316',medium.length,'Medium'],['#22c55e',low.length,'Low'],['#60a5fa',(osvData&&osvData.totalVulns)||0,'CVEs'],['#a78bfa',smells.length,'Smells']].map(function(x){return'<div style="text-align:center"><div style="font-size:22px;font-weight:700;color:'+x[0]+'">'+x[1]+'</div><div style="font-size:10px;color:#64748b">'+x[2]+'</div></div>';}).join('')
        +'</div></div>'
        +'<div style="text-align:center;min-width:90px"><div style="font-size:44px;font-weight:800;color:'+rc+'">'+riskScore+'</div><div style="font-size:12px;color:'+rc+';font-weight:600">'+rl+'</div><div style="font-size:10px;color:#64748b;margin-top:2px">Risk Score</div></div>'
        +'</div>'
        +'<h2>📖 Glossary</h2>'+glossary
        +(owHtml?'<h2>📊 OWASP Coverage</h2>'+owHtml:'')
        +(critical.concat(high).concat(medium).concat(low).length?'<h2>⚠ Security Findings ('+secIssues.length+')</h2>'+critical.concat(high).concat(medium).concat(low).map(findingCard).join(''):'<h2>Security Findings</h2><div style="color:#94a3b8;background:#161b22;border-radius:6px;padding:12px;font-size:12px">✅ No static security issues detected.</div>')
        +(osvHtml?'<h2>📦 Dependency Vulnerabilities</h2>'+osvHtml:'<h2>📦 Dependency Vulnerabilities</h2><div style="color:#94a3b8;background:#161b22;border-radius:6px;padding:12px;font-size:12px">✅ No CVEs found.</div>')
        +(smells.length?'<h2>🏛 Architecture Analysis ('+smells.length+')</h2>'+smells.map(smellCard).join(''):'')
        +(licHtml?'<h2>📜 License Risk</h2>'+licHtml:'')
        +'<h2>✅ Remediation Checklist</h2>'
        +'<ul style="background:#161b22;border:1px solid #21262d;border-radius:6px;padding:14px 14px 14px 30px;font-size:13px;line-height:2">'+(chklist.length?chklist.join(''):'<li style="color:#86efac">✅ No critical items. Keep dependencies updated.</li>')+'</ul>'
        +'<div style="margin-top:28px;text-align:center;font-size:10px;color:#64748b;padding:12px;border-top:1px solid #1e293b">Generated by <strong style="color:#6366f1">Arcflow</strong> static analysis · '+data.stats.files+' files · '+data.stats.functions+' functions · Static analysis only — complement with dynamic and manual testing.</div>'
        +'</div></body></html>';
    var w=window.open('','_blank');if(w){w.document.write(html);w.document.close();}
}

function VAPTModal(props){
    var data=props.data;var osvData=props.osvData;var onClose=props.onClose;
    var secIssues=(data.securityIssues||[]).slice();
    // #47 Inject unprotected endpoint findings (POST/PUT/DELETE/PATCH with no auth middleware detected)
    (data.apiRoutes||[]).filter(function(r){return !r.authProtected&&['POST','PUT','DELETE','PATCH'].includes(r.method);}).forEach(function(r){
        secIssues.push({severity:'high',title:'Unprotected Endpoint',file:r.fname,path:r.file,line:r.line,desc:r.method+' '+r.path+' — no authentication middleware detected in this file. Unauthenticated callers may be able to modify or delete data.',code:r.method+' '+r.path});
    });
    var critical=secIssues.filter(function(i){return i.severity==='critical';});
    var high=secIssues.filter(function(i){return i.severity==='high';});
    var medium=secIssues.filter(function(i){return i.severity==='medium';});
    var low=secIssues.filter(function(i){return i.severity==='low'||i.severity==='info';});
    var smells=vaptComputeSmells(data);
    var licenseRisks=vaptScanLicenses(data.files||[]);
    var riskScore=vaptRiskScore(secIssues,osvData,smells);
    var rc=riskScore>=75?'#22c55e':riskScore>=50?'#f59e0b':riskScore>=25?'#f97316':'#ef4444';
    var rl=riskScore>=75?'Low Risk':riskScore>=50?'Medium Risk':riskScore>=25?'High Risk':'Critical Risk';
    var _af=React.useState(null);var activeFilter=_af[0],setActiveFilter=_af[1];
    var allFindings=critical.concat(high).concat(medium).concat(low);
    var shown=activeFilter?secIssues.filter(function(i){return i.severity===activeFilter;}):allFindings;
    var osvEntries=Object.values((osvData&&osvData.vulnMap)||{});
    // File → layer lookup
    var fileLayerMap={};
    (data.files||[]).forEach(function(f){if(f.layer)fileLayerMap[f.path]=f.layer;});
    // OWASP coverage distribution
    var owGroups={};
    allFindings.forEach(function(i){var ow=vaptGetOwasp(i.title);var k=ow.owasp+'|'+ow.owaspName;owGroups[k]=(owGroups[k]||0)+1;});
    var owEntries=Object.keys(owGroups).sort().map(function(k){return{k:k.split('|')[0],name:k.split('|')[1],v:owGroups[k]};});
    var owMax=owEntries.reduce(function(m,e){return Math.max(m,e.v);},1);
    // #45 OWASP radar — all 10 categories as axes
    var OWASP_SHORT=['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10'];
    var owShortMap={};allFindings.forEach(function(i){var k=(vaptGetOwasp(i.title).owasp||'').split(':')[0];if(k)owShortMap[k]=(owShortMap[k]||0)+1;});
    var radarPts=OWASP_SHORT.map(function(k,ii){var a=Math.PI*2*ii/10-Math.PI/2;var rr=75*(Math.min(owShortMap[k]||0,owMax)/Math.max(owMax,1));return{k:k,v:owShortMap[k]||0,ax:110+75*Math.cos(a),ay:105+75*Math.sin(a),x:110+rr*Math.cos(a),y:105+rr*Math.sin(a),lx:110+93*Math.cos(a),ly:105+93*Math.sin(a)};});
    var radarPolyPts=radarPts.map(function(p){return p.x+','+p.y;}).join(' ');
    // Checklist
    var checklist=[];
    if(critical.length)checklist.push({text:'Fix '+critical.length+' critical finding(s) immediately',c:'#c084fc'});
    if(high.length)checklist.push({text:'Resolve '+high.length+' high severity finding(s) this sprint',c:'#f87171'});
    if((osvData&&osvData.totalVulns||0)>0)checklist.push({text:'Update '+osvData.totalPkgs+' vulnerable package(s) ('+osvData.totalVulns+' CVEs)',c:'#60a5fa'});
    if(medium.length)checklist.push({text:'Address '+medium.length+' medium severity finding(s) within 30 days',c:'#fb923c'});
    var gc=smells.filter(function(s){return s.type==='God File';}).length;
    if(gc)checklist.push({text:'Refactor '+gc+' God File(s) into smaller modules',c:'var(--t2)'});
    var vc=smells.filter(function(s){return s.type==='Layer Violation';}).length;
    if(vc)checklist.push({text:'Fix '+vc+' architecture layer violation(s)',c:'var(--t2)'});
    if(low.length)checklist.push({text:'Review '+low.length+' low severity finding(s)',c:'var(--green)'});
    var gplCount=licenseRisks.filter(function(l){return l.risk==='high';}).length;
    if(gplCount)checklist.push({text:'Review '+gplCount+' high-risk license(s) (GPL/AGPL/non-commercial) before commercial distribution',c:'#f97316'});
    function sevColor(sev){return sev==='critical'?'#7c3aed':sev==='high'?'#ef4444':sev==='medium'?'#f97316':'#22c55e';}
    function sevBorder(sev){return'4px solid '+(sev==='critical'?'#7c3aed':sev==='high'?'#ef4444':sev==='medium'?'#f97316':'#22c55e');}
    function cvssColor(cvss){if(!cvss)return'#a78bfa';var n=parseFloat(cvss.match(/[\d.]+/)||[0]);return n>=9?'#ef4444':n>=7?'#f97316':n>=4?'#f59e0b':'#22c55e';}
    function FindingCard(f,idx){
        var ow=vaptGetOwasp(f.title);
        var layer=fileLayerMap[f.path];
        return React.createElement('div',{key:idx,style:{border:'1px solid var(--border)',borderLeft:sevBorder(f.severity),borderRadius:6,marginBottom:12,padding:'12px 14px',background:'var(--bg0)'}},
            // Row 1: severity + title + CVSS
            React.createElement('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6,marginBottom:7}},
                React.createElement('span',{style:{background:sevColor(f.severity),color:'#fff',padding:'1px 7px',borderRadius:3,fontSize:9,fontWeight:700,textTransform:'uppercase'}},f.severity),
                React.createElement('strong',{style:{color:'var(--t0)',fontSize:12}},f.title),
                ow.cvss&&React.createElement('span',{style:{background:'rgba(192,132,252,0.12)',color:cvssColor(ow.cvss),padding:'1px 6px',borderRadius:3,fontSize:9,fontWeight:600,marginLeft:'auto',flexShrink:0}},ow.cvss)
            ),
            // Row 2: OWASP + CWE tags (with full names)
            React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:5,marginBottom:7}},
                React.createElement('span',{style:{background:'rgba(99,102,241,0.12)',color:'var(--acc)',padding:'2px 7px',borderRadius:3,fontSize:9}},ow.owasp+' — '+ow.owaspName),
                React.createElement('span',{style:{background:'rgba(34,197,94,0.09)',color:'var(--green)',padding:'2px 7px',borderRadius:3,fontSize:9}},ow.cwe+' — '+ow.cweName)
            ),
            // Row 3: file location + layer
            React.createElement('div',{style:{color:'var(--t3)',fontSize:10,marginBottom:7,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
                React.createElement('span',null,'📍 ',React.createElement('span',{style:{color:'var(--orange)',fontFamily:"'JetBrains Mono',monospace"}},f.path+(f.line?':'+f.line:''))),
                layer&&React.createElement('span',{style:{background:'rgba(99,102,241,0.1)',color:'var(--acc)',padding:'1px 6px',borderRadius:3,fontSize:9}},layer)
            ),
            // Code snippet
            f.code&&React.createElement('pre',{style:{background:'var(--bg3)',color:'var(--t1)',padding:'6px 8px',borderRadius:4,fontSize:10,overflowX:'auto',margin:'0 0 7px',fontFamily:"'JetBrains Mono',monospace",whiteSpace:'pre-wrap'}},f.code),
            // Description
            React.createElement('div',{style:{color:'var(--t2)',fontSize:11,marginBottom:7,lineHeight:1.5}},f.desc),
            // Impact
            ow.impact&&React.createElement('div',{style:{background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.18)',borderRadius:4,padding:'7px 10px',fontSize:11,color:'#fde68a',marginBottom:8,lineHeight:1.5}},
                React.createElement('span',{style:{fontWeight:600}},'⚡ Impact: '),ow.impact),
            // Step-by-step fix
            ow.steps&&React.createElement('div',{style:{background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:4,padding:'8px 10px',marginBottom:8}},
                React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--green)',marginBottom:5}},'🔧 Step-by-step Fix'),
                React.createElement('ol',{style:{margin:0,paddingLeft:16,color:'var(--t2)',fontSize:11,lineHeight:1.8}},
                    ow.steps.map(function(s,si){return React.createElement('li',{key:si},s);})
                )
            ),
            // Reference links
            React.createElement('div',{style:{display:'flex',gap:12,marginTop:4}},
                React.createElement('a',{href:'https://cwe.mitre.org/data/definitions/'+ow.cwe.replace('CWE-','')+'.html',target:'_blank',rel:'noopener',style:{color:'var(--green)',fontSize:9,textDecoration:'none'}},ow.cwe+' Reference ↗'),
                React.createElement('a',{href:'https://owasp.org/Top10/',target:'_blank',rel:'noopener',style:{color:'var(--acc)',fontSize:9,textDecoration:'none'}},'OWASP '+ow.owasp+' ↗')
            )
        );
    }
    function SmellCard(s,idx){
        return React.createElement('div',{key:idx,style:{border:'1px solid var(--border)',borderLeft:sevBorder(s.severity),borderRadius:6,marginBottom:8,padding:'10px 12px',background:'var(--bg0)'}},
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
                React.createElement('span',{style:{background:sevColor(s.severity),color:'#fff',padding:'1px 7px',borderRadius:3,fontSize:9,fontWeight:700,textTransform:'uppercase'}},s.severity),
                React.createElement('strong',{style:{color:'var(--t0)',fontSize:12}},s.type),
                s.metric&&React.createElement('span',{style:{background:'rgba(99,102,241,0.15)',color:'var(--acc)',padding:'1px 6px',borderRadius:3,fontSize:9}},s.metric)
            ),
            React.createElement('div',{style:{color:'var(--t3)',fontSize:10,marginBottom:3}},'📍 ',React.createElement('span',{style:{color:'var(--orange)',fontFamily:"'JetBrains Mono',monospace"}},s.file)),
            React.createElement('div',{style:{color:'var(--t2)',fontSize:11}},s.detail)
        );
    }
    // Glossary terms
    var glossTerms=[
        ['VAPT','Vulnerability Assessment & Penetration Testing','Finding and fixing security holes before attackers do'],
        ['OWASP','Open Web Application Security Project','The top 10 list of the most critical web security risks — globally recognised standard'],
        ['CWE','Common Weakness Enumeration','A numbered catalogue of specific software weakness types, maintained by MITRE (mitre.org)'],
        ['CVSS','Common Vulnerability Scoring System','A 0–10 severity score: 7+ = High, 9+ = Critical'],
        ['CVE','Common Vulnerabilities & Exposures','Publicly known, uniquely identified security bugs in specific software versions'],
        ['SARIF','Static Analysis Results Interchange Format','Standard file format for sharing scan results with GitHub Code Scanning and other tools']
    ];
    return React.createElement('div',{className:'modal-overlay',onClick:onClose,style:{zIndex:1100}},
        React.createElement('div',{className:'modal',onClick:function(e){e.stopPropagation();},style:{width:'90vw',maxWidth:860,height:'90vh',display:'flex',flexDirection:'column',padding:0,overflow:'hidden'}},
            // Header
            React.createElement('div',{style:{padding:'10px 14px',background:'var(--bg0)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8,flexShrink:0}},
                React.createElement(Icon,{name:'shield',size:'m'}),
                React.createElement('span',{style:{fontWeight:700,fontSize:13,color:'var(--t0)'}},'VAPT Security Report'),
                React.createElement('div',{style:{marginLeft:'auto',display:'flex',gap:5}},
                    React.createElement('button',{className:'tool-btn',style:{fontSize:9,padding:'2px 10px',height:22},onClick:function(){exportVaptJSON(data,osvData,smells);}},'JSON'),
                    React.createElement('button',{className:'tool-btn',style:{fontSize:9,padding:'2px 10px',height:22},onClick:function(){exportVaptHTML(data,osvData,smells,riskScore,licenseRisks);}},'HTML Report')
                ),
                React.createElement('button',{className:'modal-close',style:{marginLeft:6},onClick:onClose},'×')
            ),
            // Risk summary row
            React.createElement('div',{style:{padding:'10px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:16,flexShrink:0,flexWrap:'wrap'}},
                React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:6}},
                    React.createElement('span',{style:{fontSize:26,fontWeight:800,color:rc,lineHeight:1}},riskScore),
                    React.createElement('span',{style:{fontSize:11,color:rc,fontWeight:600}},rl)
                ),
                React.createElement('div',{style:{width:1,height:28,background:'var(--border)',flexShrink:0}}),
                [['Critical',critical.length,'#7c3aed','critical'],['High',high.length,'#ef4444','high'],['Medium',medium.length,'#f97316','medium'],['Low',low.length,'#22c55e','low'],['CVEs',(osvData&&osvData.totalVulns)||0,'#60a5fa',null],['Smells',smells.length,'#a78bfa',null]].map(function(x,i){
                    return React.createElement('div',{key:i,style:{textAlign:'center',cursor:x[3]?'pointer':'default',opacity:activeFilter&&x[3]&&activeFilter!==x[3]?0.45:1},onClick:function(){if(x[3])setActiveFilter(activeFilter===x[3]?null:x[3]);}},
                        React.createElement('div',{style:{fontSize:17,fontWeight:700,color:x[2]}},x[1]),
                        React.createElement('div',{style:{fontSize:9,color:'var(--t3)'}},x[0])
                    );
                }),
                React.createElement('div',{style:{marginLeft:'auto',fontSize:9,color:'var(--t3)'}},data.stats.files,' files · ',data.stats.functions,' fns')
            ),
            // Filter chips
            React.createElement('div',{style:{padding:'5px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',gap:4,alignItems:'center',flexShrink:0}},
                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginRight:4}},'Filter:'),
                [['All',null],['Critical','critical'],['High','high'],['Medium','medium'],['Low','low']].map(function(f,i){
                    return React.createElement('button',{key:i,className:'view-btn'+(activeFilter===f[1]?' active':''),style:{fontSize:9,padding:'2px 8px',height:20},onClick:function(){setActiveFilter(f[1]);}},f[0]);
                })
            ),
            // Scrollable body
            React.createElement('div',{style:{flex:1,overflowY:'auto',minHeight:0,padding:'14px 14px 20px'}},
                // Glossary — always visible at top
                React.createElement('div',{style:{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',marginBottom:14}},
                    React.createElement('div',{style:{fontSize:9,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}},'📖 What these abbreviations mean'),
                    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:6}},
                        glossTerms.map(function(t,i){
                            return React.createElement('div',{key:i,style:{background:'var(--bg0)',borderRadius:4,padding:'6px 9px'}},
                                React.createElement('span',{style:{color:'var(--acc)',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fontSize:10}},t[0]),
                                React.createElement('span',{style:{color:'var(--t3)',fontSize:9,marginLeft:4}},t[1]),
                                React.createElement('div',{style:{color:'var(--t2)',fontSize:10,marginTop:2,lineHeight:1.4}},t[2])
                            );
                        })
                    )
                ),
                // #45 OWASP radar chart (only when not filtered)
                !activeFilter&&React.createElement('div',{style:{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',marginBottom:14}},
                    React.createElement('div',{style:{fontSize:9,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}},'🕸 OWASP Top 10 Coverage Radar'),
                    React.createElement('div',{style:{display:'flex',gap:16,alignItems:'flex-start',flexWrap:'wrap'}},
                        React.createElement('svg',{width:220,height:210,viewBox:'0 0 220 210',style:{flexShrink:0,overflow:'visible'}},
                            [1,0.75,0.5,0.25].map(function(f,ri){return React.createElement('polygon',{key:ri,points:OWASP_SHORT.map(function(_,ii){var a=Math.PI*2*ii/10-Math.PI/2;return (110+75*f*Math.cos(a))+','+(105+75*f*Math.sin(a));}).join(' '),fill:'none',stroke:'var(--border)',strokeWidth:0.5});}),
                            radarPts.map(function(p,ii){return React.createElement('line',{key:ii,x1:110,y1:105,x2:p.ax,y2:p.ay,stroke:'var(--border)',strokeWidth:0.5});}),
                            React.createElement('polygon',{points:radarPolyPts,fill:'rgba(99,102,241,0.18)',stroke:'var(--acc)',strokeWidth:1.5}),
                            radarPts.map(function(p,ii){return p.v>0?React.createElement('circle',{key:ii,cx:p.x,cy:p.y,r:3.5,fill:'var(--acc)'}):null;}),
                            radarPts.map(function(p,ii){var anchor=p.lx<98?'end':p.lx>122?'start':'middle';return React.createElement('text',{key:ii,x:p.lx,y:p.ly+3,fontSize:7,fill:p.v>0?'var(--acc)':'var(--t3)',textAnchor:anchor,fontFamily:"'JetBrains Mono',monospace",fontWeight:p.v>0?700:400},p.k);})
                        ),
                        owEntries.length>0?React.createElement('div',{style:{flex:1,minWidth:130}},
                            owEntries.map(function(e,i){
                                return React.createElement('div',{key:i,style:{display:'grid',gridTemplateColumns:'55px 1fr 18px',alignItems:'center',gap:6,marginBottom:5}},
                                    React.createElement('span',{style:{fontSize:8,color:'var(--acc)',fontFamily:"'JetBrains Mono',monospace",whiteSpace:'nowrap'}},e.k),
                                    React.createElement('div',{style:{background:'var(--bg3)',borderRadius:2,height:10,overflow:'hidden'}},
                                        React.createElement('div',{style:{background:'var(--acc)',height:'100%',borderRadius:2,width:Math.round(e.v/owMax*100)+'%'}})
                                    ),
                                    React.createElement('span',{style:{fontSize:8,color:'var(--t3)',textAlign:'right'}},e.v)
                                );
                            })
                        ):React.createElement('div',{style:{fontSize:10,color:'var(--green)',alignSelf:'center',padding:'0 8px'}},'✅ No OWASP findings detected')
                    )
                ),
                // Security findings section header
                React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}},
                    shown.length+' Security Finding'+(shown.length!==1?'s':'')+(activeFilter?' ('+activeFilter+')':'')),
                shown.length>0?shown.map(FindingCard):
                    React.createElement('div',{style:{color:'var(--t3)',padding:'14px',background:'var(--bg2)',borderRadius:6,fontSize:11,textAlign:'center'}},
                        activeFilter?'No '+activeFilter+' findings.':'✅ No static security issues detected.'),
                // Dependency CVEs
                !activeFilter&&React.createElement(React.Fragment,null,
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',margin:'18px 0 8px',textTransform:'uppercase',letterSpacing:'0.05em'}},'Dependency Vulnerabilities'),
                    osvEntries.length>0?osvEntries.map(function(e,i){
                        return React.createElement('div',{key:i,style:{border:'1px solid var(--border)',borderRadius:6,marginBottom:8,padding:'10px 12px',background:'var(--bg0)'}},
                            React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:6,marginBottom:5}},
                                React.createElement('strong',{style:{color:'var(--t0)',fontSize:12}},e.pkg.name),
                                React.createElement('span',{style:{color:'var(--t3)',fontSize:10}},'v'+e.pkg.version+' ('+e.pkg.ecosystem+')'),
                                React.createElement('span',{style:{background:'rgba(239,68,68,0.15)',color:'var(--red)',padding:'1px 6px',borderRadius:3,fontSize:9,marginLeft:'auto'}},e.vulns.length+' CVE'+(e.vulns.length!==1?'s':''))
                            ),
                            e.vulns.map(function(v,j){
                                return React.createElement('div',{key:j,style:{fontSize:11,color:'var(--t2)',display:'flex',gap:8,marginTop:3}},
                                    React.createElement('a',{href:v.url,target:'_blank',rel:'noopener',style:{color:'var(--acc)',textDecoration:'none',fontFamily:"'JetBrains Mono',monospace",fontSize:10,flexShrink:0}},v.id),
                                    React.createElement('span',{style:{color:'var(--t3)'}},v.summary)
                                );
                            })
                        );
                    }):React.createElement('div',{style:{color:'var(--t3)',padding:'12px',background:'var(--bg2)',borderRadius:6,fontSize:11,textAlign:'center'}},'✅ No CVEs found. Dependencies look healthy.')
                ),
                // Architecture smells
                !activeFilter&&React.createElement(React.Fragment,null,
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',margin:'18px 0 8px',textTransform:'uppercase',letterSpacing:'0.05em'}},'Architecture Analysis — '+smells.length+' smell'+(smells.length!==1?'s':'')),
                    smells.length>0?smells.slice(0,30).map(SmellCard):
                        React.createElement('div',{style:{color:'var(--t3)',padding:'12px',background:'var(--bg2)',borderRadius:6,fontSize:11,textAlign:'center'}},'✅ No significant architecture smells detected.')
                ),
                // License Risk section
                !activeFilter&&licenseRisks.length>0&&React.createElement(React.Fragment,null,
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',margin:'18px 0 8px',textTransform:'uppercase',letterSpacing:'0.05em'}},'License Risk — '+licenseRisks.length+' manifest'+(licenseRisks.length!==1?'s':'')+' scanned'),
                    licenseRisks.map(function(lr,i){
                        var rc2=lr.risk==='high'?'#ef4444':lr.risk==='medium'?'#f97316':lr.risk==='ok'?'#22c55e':'#94a3b8';
                        var rl2=lr.risk==='high'?'High Risk':lr.risk==='medium'?'Medium Risk':lr.risk==='ok'?'Permissive':'Info';
                        return React.createElement('div',{key:i,style:{border:'1px solid var(--border)',borderLeft:'4px solid '+rc2,borderRadius:6,marginBottom:8,padding:'10px 12px',background:'var(--bg0)'}},
                            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}},
                                React.createElement('span',{style:{background:rc2,color:'#fff',padding:'1px 7px',borderRadius:3,fontSize:9,fontWeight:700,textTransform:'uppercase'}},rl2),
                                React.createElement('strong',{style:{color:'var(--t0)',fontSize:11}},lr.label||lr.license),
                                React.createElement('span',{style:{fontSize:9,color:'var(--t3)',marginLeft:'auto',fontFamily:"'JetBrains Mono',monospace"}},lr.source)
                            ),
                            React.createElement('div',{style:{fontSize:9,color:'var(--orange)',fontFamily:"'JetBrains Mono',monospace",marginBottom:4}},lr.file),
                            React.createElement('div',{style:{fontSize:11,color:'var(--t2)',lineHeight:1.5}},lr.reason)
                        );
                    })
                ),
                !activeFilter&&licenseRisks.length===0&&React.createElement(React.Fragment,null,
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',margin:'18px 0 8px',textTransform:'uppercase',letterSpacing:'0.05em'}},'License Risk'),
                    React.createElement('div',{style:{color:'var(--t3)',padding:'12px',background:'var(--bg2)',borderRadius:6,fontSize:11,textAlign:'center'}},'No package manifests with license fields found.')
                ),
                // Remediation checklist
                !activeFilter&&checklist.length>0&&React.createElement(React.Fragment,null,
                    React.createElement('div',{style:{fontSize:10,fontWeight:600,color:'var(--t3)',margin:'18px 0 8px',textTransform:'uppercase',letterSpacing:'0.05em'}},'Remediation Checklist'),
                    React.createElement('div',{style:{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,overflow:'hidden'}},
                        checklist.map(function(item,i){
                            return React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderBottom:i<checklist.length-1?'1px solid var(--border)':'none'}},
                                React.createElement('span',{style:{width:7,height:7,borderRadius:'50%',background:item.c,flexShrink:0}}),
                                React.createElement('span',{style:{fontSize:11,color:'var(--t1)'}},item.text)
                            );
                        })
                    )
                )
            )
        )
    );
}
