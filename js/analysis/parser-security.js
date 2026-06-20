/* parser-security.js - Security pattern detection */

// Scan forward from startIdx to estimate where the problematic block ends (1-based endLine)
function secFindEndLine(lines,startIdx){
    var depth=0,max=Math.min(lines.length,startIdx+20);
    for(var i=startIdx;i<max;i++){
        var l=lines[i];
        for(var j=0;j<l.length;j++){var c=l[j];if(c==='{')depth++;else if(c==='}')depth--;}
        if(depth<0)return i+1; // exited enclosing block
        if(l.trim()===''&&i>startIdx)return i; // blank line = end of statement
        if(depth===0&&(l.trimEnd().endsWith(';')||l.trimEnd().endsWith(','))){return i+1;}
    }
    return Math.min(lines.length,startIdx+5);
}

Parser.detectSecurity=function(files){
        var issues=[];
        files.forEach(function(f){
            var scanContent=getSecurityScanContent(f);
            if(!scanContent)return;
            var lines=scanContent.split('\n');
            lines.forEach(function(line,idx){
                if(line.match(/(?:password|passwd|pwd|secret|api_key|apikey|token|auth)\s*[=:]\s*['"][^'"]{4,}['"]/i)&&!line.includes('process.env')&&!line.includes('config.')){
                    issues.push({severity:'high',title:'Hardcoded Secret',file:f.name,path:f.path,line:idx+1,endLine:secFindEndLine(lines,idx),desc:'Credentials should never be hardcoded. Use environment variables or a secrets manager.',code:line.trim().substring(0,80)});
                }
            });
            // SQL injection — require actual SQL keywords AND db method context to avoid false positives
            var hasSQLKeywords=/\b(?:SELECT|INSERT|UPDATE|DELETE|FROM\s+\w|JOIN\s+\w)\b/i.test(scanContent);
            var hasSQLConcat=scanContent.match(/(?:db|conn|pool|client|cursor|mysql|pg|sqlite|knex|sequelize)\s*\.?\s*(?:query|execute|prepare|run)\s*\(\s*[`'"][^`'"]*[\+\$]/i)||
                             scanContent.match(/query\s*\(\s*['"`][^'"`]*\s*\+/)||
                             scanContent.match(/['"`][^'"`]*(?:SELECT|INSERT|UPDATE|DELETE)[^'"`]*(?:\+|\$\{)/i);
            if(hasSQLKeywords&&hasSQLConcat){
                // Try to find exact line: SQL keyword + concatenation on same line
                var sqlIdx=lines.findIndex(function(l){return /(?:SELECT|INSERT|UPDATE|DELETE).*(?:\+|\$\{)|\+.*(?:SELECT|INSERT|UPDATE|DELETE)/i.test(l)||/(?:db|conn|pool|client|cursor)\s*\.?\s*(?:query|execute)\s*\([^)]*\+/.test(l);});
                // Fallback: SQL keyword with + anywhere on the same line
                if(sqlIdx<0)sqlIdx=lines.findIndex(function(l){return /\b(?:SELECT|INSERT|UPDATE|DELETE)\b/i.test(l)&&/[+]/.test(l);});
                // Fallback: the db execute/query call line
                if(sqlIdx<0)sqlIdx=lines.findIndex(function(l){return /(?:cursor|conn|db|pool|client|mysql|pg|sqlite|knex|sequelize)\s*\.?\s*(?:execute|query|run|prepare)\s*\(/.test(l);});
                // Fallback: any line containing a SQL string literal
                if(sqlIdx<0)sqlIdx=lines.findIndex(function(l){return /["'`].*\b(?:SELECT|INSERT|UPDATE|DELETE)\b/i.test(l);});
                var sqlLine=sqlIdx>=0?sqlIdx+1:undefined;
                var m=scanContent.match(/.*(query|execute|SELECT|INSERT|UPDATE|DELETE).*(\+|\$\{).*/i);
                issues.push({severity:'high',title:'SQL Injection Risk',file:f.name,path:f.path,line:sqlLine,endLine:sqlLine?secFindEndLine(lines,sqlIdx):undefined,desc:'String concatenation in SQL queries. Use parameterized queries instead.',code:m?m[0].trim().substring(0,80):''});
            }
            var hasInnerHtmlAssignment=scanContent.match(/innerHTML\s*=/);
            var hasDangerousHtmlRender=scanContent.match(/dangerouslySetInnerHTML/);
            var isSafePreviewRender=!hasInnerHtmlAssignment&&hasDangerousHtmlRender&&isSanitizedPreviewRenderer(f.content||'');
            if((hasInnerHtmlAssignment||hasDangerousHtmlRender)&&!isSafePreviewRender){
                var xssIdx=lines.findIndex(function(l){return /innerHTML\s*=|dangerouslySetInnerHTML/.test(l);});
                issues.push({severity:'high',title:'XSS Vulnerability',file:f.name,path:f.path,line:xssIdx>=0?xssIdx+1:undefined,endLine:xssIdx>=0?secFindEndLine(lines,xssIdx):undefined,desc:'Direct HTML injection can lead to XSS attacks. Sanitize user input.',code:xssIdx>=0?lines[xssIdx].trim().substring(0,80):''});
            }
            if(scanContent.includes('eval(')){
                var evalLine=lines.findIndex(function(l){return l.includes('eval(');});
                issues.push({severity:'medium',title:'Dynamic Code Execution',file:f.name,path:f.path,line:evalLine+1,endLine:evalLine>=0?secFindEndLine(lines,evalLine):undefined,desc:'eval() executes arbitrary code. Avoid if possible or validate input strictly.',code:evalLine>=0?lines[evalLine].trim().substring(0,80):''});
            }
            if(scanContent.includes('Function(')||scanContent.match(/new\s+Function\s*\(/)){
                var fnCtorIdx=lines.findIndex(function(l){return l.includes('Function(')||/new\s+Function\s*\(/.test(l);});
                issues.push({severity:'medium',title:'Function Constructor',file:f.name,path:f.path,line:fnCtorIdx>=0?fnCtorIdx+1:undefined,endLine:fnCtorIdx>=0?secFindEndLine(lines,fnCtorIdx):undefined,desc:'Function constructor is similar to eval(). Consider alternatives.',code:fnCtorIdx>=0?lines[fnCtorIdx].trim().substring(0,80):''});
            }
            if(scanContent.match(/\.exec\s*\(/)||scanContent.match(/child_process/)){
                var cmdExecIdx=lines.findIndex(function(l){return /\.exec\s*\(/.test(l)||l.includes('child_process');});
                issues.push({severity:'medium',title:'Command Execution',file:f.name,path:f.path,line:cmdExecIdx>=0?cmdExecIdx+1:undefined,endLine:cmdExecIdx>=0?secFindEndLine(lines,cmdExecIdx):undefined,desc:'Shell command execution detected. Ensure input is sanitized to prevent injection.',code:cmdExecIdx>=0?lines[cmdExecIdx].trim().substring(0,80):''});
            }
            if(scanContent.match(/console\.(log|debug|info)\(/)){
                var consoleCount=(scanContent.match(/console\.(log|debug|info)\(/g)||[]).length;
                if(consoleCount>3){
                    var debugStmtIdx=lines.findIndex(function(l){return /console\.(log|debug|info)\(/.test(l);});
                    issues.push({severity:'low',title:'Debug Statements',file:f.name,path:f.path,line:debugStmtIdx>=0?debugStmtIdx+1:undefined,desc:consoleCount+' console statements found. Remove before production.',code:debugStmtIdx>=0?lines[debugStmtIdx].trim().substring(0,80):''});
                }
            }
            // VBA-specific security checks
            if(scanContent.match(/SendKeys\s*\(/i)){
                var sendKeysIdx=lines.findIndex(function(l){return /SendKeys\s*\(/i.test(l);});
                issues.push({severity:'high',title:'SendKeys Usage',file:f.name,path:f.path,line:sendKeysIdx>=0?sendKeysIdx+1:undefined,endLine:sendKeysIdx>=0?secFindEndLine(lines,sendKeysIdx):undefined,desc:'SendKeys can be exploited for code injection. Avoid using SendKeys.',code:sendKeysIdx>=0?lines[sendKeysIdx].trim().substring(0,80):''});
            }
            if(scanContent.match(/Shell\s*\(/i)){
                var shellVbaIdx=lines.findIndex(function(l){return /Shell\s*\(/i.test(l);});
                issues.push({severity:'high',title:'Shell Command Execution',file:f.name,path:f.path,line:shellVbaIdx>=0?shellVbaIdx+1:undefined,endLine:shellVbaIdx>=0?secFindEndLine(lines,shellVbaIdx):undefined,desc:'Shell() executes system commands. Ensure input is validated.',code:shellVbaIdx>=0?lines[shellVbaIdx].trim().substring(0,80):''});
            }
            if(scanContent.match(/CreateObject\s*\(\s*["']WScript\.Shell["']/i)){
                var createObjIdx=lines.findIndex(function(l){return /CreateObject\s*\(\s*["']WScript\.Shell["']/i.test(l);});
                issues.push({severity:'high',title:'WScript.Shell Creation',file:f.name,path:f.path,line:createObjIdx>=0?createObjIdx+1:undefined,endLine:createObjIdx>=0?secFindEndLine(lines,createObjIdx):undefined,desc:'Creating WScript.Shell object allows command execution. Use with caution.',code:createObjIdx>=0?lines[createObjIdx].trim().substring(0,80):''});
            }
            if(scanContent.match(/Application\.Run\s*\(/i)){
                var appRunIdx=lines.findIndex(function(l){return /Application\.Run\s*\(/i.test(l);});
                issues.push({severity:'medium',title:'Dynamic Code Execution',file:f.name,path:f.path,line:appRunIdx>=0?appRunIdx+1:undefined,endLine:appRunIdx>=0?secFindEndLine(lines,appRunIdx):undefined,desc:'Application.Run can execute arbitrary code. Validate input.',code:appRunIdx>=0?lines[appRunIdx].trim().substring(0,80):''});
            }
            if(scanContent.match(/On Error Resume Next/i)){
                var errorResumeCount=(scanContent.match(/On Error Resume Next/gi)||[]).length;
                if(errorResumeCount>2){
                    issues.push({severity:'medium',title:'Excessive Error Suppression',file:f.name,path:f.path,desc:errorResumeCount+' instances of "On Error Resume Next" found. This can hide bugs.',code:''});
                }
            }
            if(scanContent.match(/TODO|FIXME|HACK|XXX/)){
                var todoCount=(scanContent.match(/TODO|FIXME|HACK|XXX/g)||[]).length;
                issues.push({severity:'low',title:'Code Comments',file:f.name,path:f.path,desc:todoCount+' TODO/FIXME comments found. Address before release.',code:''});
            }
            // AWS access key
            var awsKeyIdx=lines.findIndex(function(l){return /AKIA[0-9A-Z]{16}/.test(l);});
            if(awsKeyIdx>=0){
                issues.push({severity:'high',title:'AWS Key Exposed',file:f.name,path:f.path,line:awsKeyIdx+1,endLine:secFindEndLine(lines,awsKeyIdx),desc:'AWS access key found in source. Rotate immediately and use IAM roles or environment variables.',code:lines[awsKeyIdx].trim().substring(0,80)});
            }
            // JWT token hardcoded (3-part base64url)
            var jwtIdx=lines.findIndex(function(l){return /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./.test(l);});
            if(jwtIdx>=0){
                issues.push({severity:'high',title:'JWT Token Exposed',file:f.name,path:f.path,line:jwtIdx+1,endLine:secFindEndLine(lines,jwtIdx),desc:'JWT token hardcoded in source. Tokens belong in secure storage, not code — anyone with repo access can impersonate this identity.',code:lines[jwtIdx].trim().substring(0,80)});
            }
            // PEM private key
            var pemIdx=lines.findIndex(function(l){return /-----BEGIN\s+(?:RSA\s+|EC\s+|OPENSSH\s+)?PRIVATE KEY/.test(l);});
            if(pemIdx>=0){
                issues.push({severity:'high',title:'Private Key Exposed',file:f.name,path:f.path,line:pemIdx+1,endLine:secFindEndLine(lines,pemIdx),desc:'PEM private key found in source. Rotate immediately and store in a secrets manager or HSM — never commit private keys.',code:lines[pemIdx].trim().substring(0,80)});
            }
            // Stripe live key
            var stripeIdx=lines.findIndex(function(l){return /(?:sk_live_|rk_live_)[A-Za-z0-9]{20,}/.test(l);});
            if(stripeIdx>=0){
                issues.push({severity:'high',title:'Stripe Live Key Exposed',file:f.name,path:f.path,line:stripeIdx+1,endLine:secFindEndLine(lines,stripeIdx),desc:'Stripe live API key found in source. Rotate immediately in the Stripe dashboard and use environment variables.',code:lines[stripeIdx].trim().substring(0,80)});
            }
            // Twilio credential
            var twilioIdx=lines.findIndex(function(l){return /SK[0-9a-fA-F]{32}/.test(l);});
            if(twilioIdx>=0){
                issues.push({severity:'high',title:'Twilio Credential Exposed',file:f.name,path:f.path,line:twilioIdx+1,endLine:secFindEndLine(lines,twilioIdx),desc:'Twilio API credential found in source. Rotate via Twilio console and move to environment variables.',code:lines[twilioIdx].trim().substring(0,80)});
            }
            // SendGrid API key
            var sgIdx=lines.findIndex(function(l){return /SG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{22,}/.test(l);});
            if(sgIdx>=0){
                issues.push({severity:'high',title:'SendGrid API Key Exposed',file:f.name,path:f.path,line:sgIdx+1,endLine:secFindEndLine(lines,sgIdx),desc:'SendGrid API key found in source. Rotate immediately in the SendGrid dashboard and use environment variables.',code:lines[sgIdx].trim().substring(0,80)});
            }
            // Database URL with embedded credentials
            var dbUrlIdx=lines.findIndex(function(l){return /(?:postgres|mysql|mongodb|redis|mssql|mariadb):\/\/[^:@\s]+:[^@\s]+@/.test(l);});
            if(dbUrlIdx>=0){
                issues.push({severity:'high',title:'Database URL with Credentials',file:f.name,path:f.path,line:dbUrlIdx+1,endLine:secFindEndLine(lines,dbUrlIdx),desc:'Database connection URL with embedded username and password. Use environment variables or a secrets manager for connection strings.',code:lines[dbUrlIdx].trim().substring(0,80)});
            }
            // Azure storage connection string
            var azureIdx=lines.findIndex(function(l){return /DefaultEndpointsProtocol=https/.test(l);});
            if(azureIdx>=0){
                issues.push({severity:'high',title:'Azure Connection String Exposed',file:f.name,path:f.path,line:azureIdx+1,endLine:secFindEndLine(lines,azureIdx),desc:'Azure storage connection string found in source. Move to environment variables or Azure Key Vault.',code:lines[azureIdx].trim().substring(0,80)});
            }
            // Extended credential variable names not caught by main pattern
            var extCredIdx=lines.findIndex(function(l){return /(?:private_key|client_secret|access_token|refresh_token|signing_key|encryption_key)\s*[=:]\s*['"][^'"]{8,}['"]/.test(l)&&!l.includes('process.env')&&!l.includes('config.');});
            if(extCredIdx>=0){
                var alreadyCred=issues.some(function(x){return x.path===f.path&&x.line===extCredIdx+1&&x.title==='Hardcoded Secret';});
                if(!alreadyCred)issues.push({severity:'high',title:'Hardcoded Secret',file:f.name,path:f.path,line:extCredIdx+1,endLine:secFindEndLine(lines,extCredIdx),desc:'Sensitive credential variable hardcoded in source. Use environment variables or a secrets manager.',code:lines[extCredIdx].trim().substring(0,80)});
            }
            // Weak hash algorithms
            var weakHashIdx=lines.findIndex(function(l){return /(?:hashlib\.(md5|sha1)\s*\(|crypto\.createHash\s*\(\s*['"](?:md5|sha1)['"]|\bMD5\s*\(|\bSHA1\s*\()/i.test(l);});
            if(weakHashIdx>=0){
                issues.push({severity:'medium',title:'Weak Hash Algorithm',file:f.name,path:f.path,line:weakHashIdx+1,endLine:secFindEndLine(lines,weakHashIdx),desc:'MD5 and SHA-1 are cryptographically broken. Use SHA-256 or stronger for security-sensitive hashing.',code:lines[weakHashIdx].trim().substring(0,80)});
            }
            // Math.random() in a security-sensitive context
            if(scanContent.match(/Math\.random\s*\(\s*\)/)&&scanContent.match(/(?:token|secret|password|passwd|key|nonce|salt|session|csrf|uuid)/i)){
                var randIdx=lines.findIndex(function(l){return /Math\.random\s*\(\s*\)/.test(l);});
                if(randIdx>=0){
                    issues.push({severity:'medium',title:'Insecure Randomness',file:f.name,path:f.path,line:randIdx+1,endLine:secFindEndLine(lines,randIdx),desc:'Math.random() is not cryptographically secure. Use crypto.getRandomValues() or crypto.randomBytes() for tokens and secrets.',code:lines[randIdx].trim().substring(0,80)});
                }
            }
            // Path traversal — user input piped into file open/read
            var traversalIdx=lines.findIndex(function(l){
                return /(?:open|readFile|createReadStream|readFileSync)\s*\([^)]*(?:req\.|request\.|params\.|query\.|body\.)/.test(l)||
                       /(?:open|fopen|include|require)\s*\(\s*(?:\$_GET|\$_POST|\$_REQUEST)/.test(l);
            });
            if(traversalIdx>=0){
                issues.push({severity:'high',title:'Path Traversal Risk',file:f.name,path:f.path,line:traversalIdx+1,endLine:secFindEndLine(lines,traversalIdx),desc:'User input used directly in a file path. Sanitize input and validate against an allowed base directory.',code:lines[traversalIdx].trim().substring(0,80)});
            }
            // Python-specific security checks
            var isPyFile=f.name.endsWith('.py')||f.name.endsWith('.pyw');
            if(isPyFile&&scanContent){
                // eval() and exec() - arbitrary code execution
                if(scanContent.match(/\beval\s*\(/)){
                    var evalLine=lines.findIndex(function(l){return l.match(/\beval\s*\(/);});
                    issues.push({severity:'high',title:'Python eval()',file:f.name,path:f.path,line:evalLine>=0?evalLine+1:undefined,endLine:evalLine>=0?secFindEndLine(lines,evalLine):undefined,desc:'eval() executes arbitrary Python code. Use ast.literal_eval() for safe parsing.',code:evalLine>=0?lines[evalLine].trim().substring(0,80):''});
                }
                if(scanContent.match(/\bexec\s*\(/)){
                    var execLine=lines.findIndex(function(l){return l.match(/\bexec\s*\(/);});
                    issues.push({severity:'high',title:'Python exec()',file:f.name,path:f.path,line:execLine>=0?execLine+1:undefined,endLine:execLine>=0?secFindEndLine(lines,execLine):undefined,desc:'exec() executes arbitrary Python code. This is almost always a security risk.',code:execLine>=0?lines[execLine].trim().substring(0,80):''});
                }
                // pickle - deserialization attacks
                if(scanContent.match(/\bpickle\.load/)||scanContent.match(/\bunpickle/)){
                    var pickleIdx=lines.findIndex(function(l){return /\bpickle\.load/.test(l)||/\bunpickle/.test(l);});
                    issues.push({severity:'high',title:'Pickle Deserialization',file:f.name,path:f.path,line:pickleIdx>=0?pickleIdx+1:undefined,endLine:pickleIdx>=0?secFindEndLine(lines,pickleIdx):undefined,desc:'pickle.load() can execute arbitrary code from untrusted data. Use JSON or safe alternatives.',code:pickleIdx>=0?lines[pickleIdx].trim().substring(0,80):''});
                }
                // subprocess with shell=True
                if(scanContent.match(/subprocess\.\w+\([^)]*shell\s*=\s*True/)){
                    var subprocIdx=lines.findIndex(function(l){return /subprocess\.\w+\([^)]*shell\s*=\s*True/.test(l);});
                    issues.push({severity:'high',title:'Shell Injection Risk',file:f.name,path:f.path,line:subprocIdx>=0?subprocIdx+1:undefined,endLine:subprocIdx>=0?secFindEndLine(lines,subprocIdx):undefined,desc:'subprocess with shell=True is vulnerable to command injection. Use shell=False with a list of args.',code:subprocIdx>=0?lines[subprocIdx].trim().substring(0,80):''});
                }
                // os.system / os.popen - command injection
                if(scanContent.match(/\bos\.system\s*\(/)||scanContent.match(/\bos\.popen\s*\(/)){
                    var osLine=lines.findIndex(function(l){return l.match(/\bos\.(system|popen)\s*\(/);});
                    issues.push({severity:'high',title:'OS Command Execution',file:f.name,path:f.path,line:osLine>=0?osLine+1:undefined,endLine:osLine>=0?secFindEndLine(lines,osLine):undefined,desc:'os.system()/os.popen() are vulnerable to command injection. Use subprocess with shell=False.',code:osLine>=0?lines[osLine].trim().substring(0,80):''});
                }
                // __import__ - dynamic imports
                if(scanContent.match(/__import__\s*\(/)){
                    var importDynIdx=lines.findIndex(function(l){return /__import__\s*\(/.test(l);});
                    issues.push({severity:'medium',title:'Dynamic Import',file:f.name,path:f.path,line:importDynIdx>=0?importDynIdx+1:undefined,endLine:importDynIdx>=0?secFindEndLine(lines,importDynIdx):undefined,desc:'__import__() with user input can load arbitrary modules. Validate module names against an allowlist.',code:importDynIdx>=0?lines[importDynIdx].trim().substring(0,80):''});
                }
                // Bare except clauses
                var bareExcepts=(scanContent.match(/\bexcept\s*:/g)||[]).length;
                if(bareExcepts>2){
                    issues.push({severity:'medium',title:'Bare Except Clauses',file:f.name,path:f.path,desc:bareExcepts+' bare except: clauses found. These catch all exceptions including SystemExit and KeyboardInterrupt.',code:''});
                }
                // assert in non-test files
                if(!f.name.includes('test')&&!f.path.includes('test')){
                    var assertCount=(scanContent.match(/\bassert\s+/g)||[]).length;
                    if(assertCount>5){
                        issues.push({severity:'low',title:'Assert in Production',file:f.name,path:f.path,desc:assertCount+' assert statements found. Assertions are stripped with python -O. Use proper validation.',code:''});
                    }
                }
                // Hardcoded DEBUG = True
                if(scanContent.match(/\bDEBUG\s*=\s*True\b/)){
                    var debugPyIdx=lines.findIndex(function(l){return /\bDEBUG\s*=\s*True\b/.test(l);});
                    issues.push({severity:'medium',title:'Debug Mode Enabled',file:f.name,path:f.path,line:debugPyIdx>=0?debugPyIdx+1:undefined,endLine:debugPyIdx>=0?secFindEndLine(lines,debugPyIdx):undefined,desc:'DEBUG = True found. Ensure this is disabled in production.',code:debugPyIdx>=0?lines[debugPyIdx].trim().substring(0,80):''});
                }
                // yaml.load() without SafeLoader
                if(scanContent.match(/\byaml\.load\s*\(/)&&!scanContent.match(/yaml\.safe_load/)&&!scanContent.match(/yaml\.load[^)]*SafeLoader/)){
                    var yamlIdx=lines.findIndex(function(l){return /\byaml\.load\s*\(/.test(l);});
                    issues.push({severity:'high',title:'Unsafe YAML Load',file:f.name,path:f.path,line:yamlIdx>=0?yamlIdx+1:undefined,endLine:yamlIdx>=0?secFindEndLine(lines,yamlIdx):undefined,desc:'yaml.load() without SafeLoader can execute arbitrary Python code. Use yaml.safe_load() instead.',code:yamlIdx>=0?lines[yamlIdx].trim().substring(0,80):''});
                }
                // requests with SSL verification disabled
                if(scanContent.match(/verify\s*=\s*False/)&&scanContent.match(/\brequests\./)){
                    var reqVerifyIdx=lines.findIndex(function(l){return /verify\s*=\s*False/.test(l);});
                    issues.push({severity:'high',title:'TLS Verification Disabled',file:f.name,path:f.path,line:reqVerifyIdx>=0?reqVerifyIdx+1:undefined,endLine:reqVerifyIdx>=0?secFindEndLine(lines,reqVerifyIdx):undefined,desc:'requests with verify=False disables SSL/TLS certificate validation, enabling man-in-the-middle attacks.',code:reqVerifyIdx>=0?lines[reqVerifyIdx].trim().substring(0,80):''});
                }
            }
        });
        // #31 Entropy Scanner — flag high-entropy string literals (probable secrets without obvious keywords)
        files.forEach(function(f){
            var scanContent=getSecurityScanContent(f);
            if(!scanContent)return;
            var lines=scanContent.split('\n');
            // Known-safe file types (config schemas, test fixtures, lock files)
            var ext=(f.path||'').split('.').pop().toLowerCase();
            if(['json','lock','sum','mod','svg','png','jpg','woff','ttf'].includes(ext))return;
            lines.forEach(function(line,idx){
                // Extract string literals (single, double, backtick)
                var strRe=/['"`]([A-Za-z0-9+/=_\-]{20,})[`'"]/g;
                var m;
                while((m=strRe.exec(line))!==null){
                    var s=m[1];
                    // Skip obvious non-secrets: long identifiers, CSS classes, URLs, file paths, UUIDs
                    if(/^[a-z][a-z0-9-]*$/.test(s))continue;           // lowercase slug
                    if(s.includes('.')&&s.includes('/'))continue;       // looks like path/url
                    if(/^[0-9a-f-]{32,}$/.test(s)&&s.includes('-'))continue; // UUID
                    if(/^[\w\s]+$/.test(s))continue;                    // plain words
                    // Shannon entropy calculation
                    var freq={};for(var i=0;i<s.length;i++)freq[s[i]]=(freq[s[i]]||0)+1;
                    var ent=0;var len=s.length;
                    Object.values(freq).forEach(function(c){var p=c/len;ent-=p*Math.log2(p);});
                    if(ent>=4.5){
                        // Dedupe: skip if same file already has a hardcoded-secret hit
                        var alreadyFlagged=issues.some(function(x){return x.path===f.path&&x.line===idx+1&&x.title==='Hardcoded Secret';});
                        if(!alreadyFlagged){
                            issues.push({severity:'medium',title:'High-Entropy String',file:f.name,path:f.path,line:idx+1,endLine:idx+1,desc:'String with entropy '+ent.toFixed(1)+' may be a hardcoded secret (API key, token, or credential). Review and move to environment variables if sensitive.',code:line.trim().substring(0,80)});
                        }
                    }
                }
            });
        });
        return issues.sort(function(a,b){var sev={high:0,medium:1,low:2};return (sev[a.severity]||1)-(sev[b.severity]||1);});
};

// #43 TODO/FIXME tracker — collect annotated comments across all files
Parser.collectTodos=function(files){
    var todos=[];
    var tagRe=/(?:\/\/|#|<!--)\s*(TODO|FIXME|HACK|BUG|XXX|OPTIMIZE|NOTE)\b\s*:?\s*(.{0,140})/i;
    files.forEach(function(f){
        var content=f.content||'';
        if(!content)return;
        var lines=content.split('\n');
        lines.forEach(function(line,idx){
            var m=line.match(tagRe);
            if(m){
                todos.push({type:m[1].toUpperCase(),text:(m[2]||'').trim()||'(no description)',file:f.name,path:f.path,folder:f.folder||'root',line:idx+1});
            }
        });
    });
    return todos;
};
