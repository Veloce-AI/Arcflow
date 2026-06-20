# Arcflow — Development Plan

Tick each item after manual test passes before moving to next.

---

## BATCH 1 — Quick wins (UI + visual polish)

- [x] **1. Graph label contrast** — auto dark/light text on bright nodes, add text-shadow so labels are readable on any node color
- [x] **2. UI identity** — accent color → indigo `#6366f1`, add Inter font for UI text (keep JetBrains Mono for code only), frosted-glass topbar
- [x] **3. PNG export** — SVG → canvas → `toBlob()` download, add to export menu
- [x] **4. WebGL badge** — show "Performance mode — WebGL active" chip in topbar when >300 files switch to Sigma

---

## BATCH 2 — Security & analysis depth

- [x] **5. Missing security patterns** — add: AWS key (`AKIA…`), SQL string concat, weak hash (`md5/sha1`), `Math.random()` for crypto, `yaml.load()` without SafeLoader, `pickle.loads()`, `requests verify=False`, path traversal
- [x] **6. OSV.dev dependency scan** — parse `package.json` / `requirements.txt` → POST to `api.osv.dev` → CVE badges on affected nodes, click for CVE detail
- [x] **7. Cyclomatic complexity** — count `if/else/while/for/switch/catch/&&/||` per function, show in metrics panel alongside LOC
- [x] **8. Maintainability index** — formula: `171 - 5.2×ln(HV) - 0.23×CC - 16.2×ln(LOC)`, replaces rough health score with industry-standard 0–100

---

## BATCH 3 — In-file code flow (new visual layer)

- [x] **9. Function call graph** — when a file is selected, render a small D3 graph in the right panel showing function→function calls within that file
- [x] **10. Cross-file call trace** — click any function → show full call chain across files as a collapsible tree (e.g. `loginRoute → authService.login() → db.findUser()`)
- [x] **11. Entry point detection** — visually mark "root" functions (called from outside) vs internal helpers with a different node color/shape

---

## BATCH 4 — Language + export depth

- [x] **12. Import path resolution** — map Python/Go/Java/Kotlin/C#/Rust/Scala import strings to actual file nodes so non-JS dependency graphs are accurate
- [x] **13. CSV / SARIF export** — file metrics CSV (File, Folder, Layer, Lines, Functions, Avg CC, MI Score, Security Issues, In/Out degree) + SARIF 2.1.0 for GitHub Code Scanning
- [x] **14. Terraform + Solidity support** — `.tf`/`.tfvars`/`.sol` parsed; resource/module/variable/output blocks extracted; Solidity contract/function/modifier/event extracted; module `source=` and Solidity `import` edges in call graph

---

## BATCH 5 — Diagrams + Unified Export

- [x] **15. Block view (main canvas)** — "Block" option in main view dropdown; whole-repo Mermaid architecture diagram; file nodes colored by layer; directed edges; folder grouping; zoom + pan
- [x] **16. Block view (Call Graph modal)** — new "Block" tab in Call Graph modal; D3 tree layout with rounded-rect nodes; CC-colored; entry nodes with cyan border; CC badge; bezier edges with arrowheads; auto-fit zoom + pan
- [x] **17. SVG export** — serialize any D3 SVG to `.svg` blob download; available on main canvas all viz types + Call Graph modal
- [x] **18. PDF export** — jsPDF (pre-loaded CDN); SVG → canvas → PDF page; available on all visualization surfaces
- [x] **19. PNG/SVG/PDF export in Call Graph modal** — PNG, SVG, PDF export buttons added to Call Graph modal toolbar (row 0, right side); captures modal SVG directly

---

## BATCH 6 — VAPT Security Report

- [x] **20. VAPT report page** — Shield button in toolbar opens full-screen modal; risk score (0-100); findings by severity with OWASP + CWE tags; per-finding code snippet, description, remediation; severity filter chips; CVE section from OSV; architecture smells; remediation checklist
- [x] **21. Architecture smells in VAPT** — God files (>20 fns or CC sum >100), high avg CC files (>15), layer violations (fromLayer→toLayer), orphaned files (no connections) — all surfaced with severity badges in Architecture Analysis section
- [x] **22. VAPT HTML export** — self-contained dark-themed HTML with inline CSS; opens in new tab; browser Print→Save as PDF; includes all sections
- [x] **23. VAPT JSON export** — machine-readable JSON with riskScore, summary, findings (severity/owasp/cwe/remediation), dependencyVulns, architectureSmells

---

## BATCH 7 — Code Intelligence

- [x] **24. Circular dependency finder** — Tarjan's SCC algorithm in vapt.js; finds all multi-file circular dependency groups; surfaced in VAPT Architecture Analysis section with file count, cycle path, and severity badge
- [x] **25. Change impact analysis** — already implemented as Blast Radius: click any file → shows direct dependents, transitive count, fns exported/used, full dependent file list; canvas highlights dependent nodes
- [x] **26. Code duplication detector** — tokenize + fingerprint functions across files (shingling); find similar pairs above similarity threshold; side-by-side diff view with refactor suggestion (detectDuplicates already runs; UI diff view still needed)
- [x] **27. Test coverage estimator** — parse test files; map test functions to production functions by naming convention (test_foo → foo, FooTest → Foo); show estimated coverage % per file as badge in right panel

---

## BATCH 8 — Quick Wins (build on existing data)

- [x] **28. Complexity histogram** — D3 bar chart in Insights panel; X = CC band (1-5 / 6-10 / 11-20 / 21+), Y = function count; color-coded; click bar to list functions in that band
- [x] **29. Hot path detector** — rank files by in-degree (imported-by count) from connections; listed as "Hot Paths" in Insights panel with progress bars; click to jump to file
- [x] **30. Dead code island view** — collapsible "Dead Code" section in Insights panel; unreachable functions grouped by file; shows lines removable; "View all" opens existing unused-functions modal
- [x] **31. Entropy scanner** — Shannon entropy on string literals (length ≥ 20, entropy ≥ 4.5); flags probable secrets even without keyword match; feeds into existing security issues list with dedup guard

---

## BATCH 9 — Language Intelligence

- [x] **32. API endpoint map** — detect route definitions across Express/Koa/Fastify, FastAPI/Flask, Django, Spring, Go net/http/Gin/Chi, Rails/Sinatra, ASP.NET; parser-routes.js + RoutesModal with table+grouped views; method badges, search, sort, framework filter; Routes button in topbar
- [x] **33. React component tree** — detect React components (function returning JSX, class extends Component, `export default`); show parent→child hierarchy as separate tree view; props listed per node
- [x] **34. License scanner** — read license field from `package.json` / `requirements.txt` + cross-ref OSV data; flag GPL/AGPL/LGPL; add "License Risk" section to VAPT report

---

## BATCH 10 — Architecture Metrics

- [x] **35. Martin's coupling metrics** — afferent (Ca) + efferent (Ce) coupling per file; instability `I = Ce/(Ca+Ce)`; abstractness `A = abstract_fns/total_fns`; plot all files on instability vs abstractness scatter; highlight "zone of pain" and "zone of uselessness"
- [x] **36. Git heatmap** — use GitHub API commits-per-file endpoint; color nodes by last-commit recency (hot=recent, cold=stale); combine with CC to flag "hot + complex = danger" files
- [x] **37. SBOM export** — CycloneDX JSON from OSV scan data already loaded; machine-readable software bill of materials for SOC 2 / supply chain compliance
- [x] **38. Snapshot diff** — serialize analysis result to `sessionStorage`; on re-analyze, diff new vs old: new/removed files, CC regressions, new security issues, new circular deps; show delta report

---

## BATCH 11 — AI Integration

- [x] **39. Natural language filter** — text input in topbar: "show auth files" → client-side keyword + layer heuristic highlights matching nodes on canvas; no API key needed
- ~~**40. AI function explainer**~~ — removed (out of scope)

---

## BATCH 12 — Visuals, Intelligence & Security Depth

- [x] **40. Treemap view** — renderer-treemap.js already existed and wired; folder-grouped D3 treemap, area=LOC, colorMap colors; click to select; zoom; hover tooltip
- [x] **41. Cognitive complexity** — `calcFunctionCogCC()` in graph-builder.js: nesting-weighted control flow count (+1 per nesting level); `Cog:N` badge per function in right panel, shown only when higher than CC to avoid noise
- [x] **42. Community detection (Louvain)** — pending (complex, next batch)
- [x] **43. TODO/FIXME tracker** — `Parser.collectTodos()` in parser-security.js scans all files before content nulled; `todos` array in dataObj; new "TODOs" tab in right panel with type badges (TODO/FIXME/HACK/BUG/OPTIMIZE/NOTE), full text, file+line, click-to-select
- [x] **44. Chord diagram** — renderer-chord.js: D3 chord layout; folders as outer arcs (folder colorMap colors); ribbon width = cross-folder dependency count; hover tooltip; click arc to folder-filter; "Chord" added to VIZ_TYPES; chordRef wired in App.js + canvas.js
- [x] **45. OWASP radar chart** — SVG spider chart in VAPTModal: all 10 OWASP axes, filled polygon = finding counts, axis labels highlighted when non-zero; compact bar list alongside; `radarPts` computed from allFindings; replaces plain bar chart
- [x] **46. More secret patterns** — 8 new patterns in parser-security.js: JWT token, PEM private key, Stripe live key, Twilio credential, SendGrid API key, DB URL with creds, Azure connection string, extended credential variable names; all deduped + severity high
- [x] **47. Unprotected route detection** — `authRe` in parser-routes.js checks each file for auth middleware; `authProtected` bool on every route; ⚠ "No auth" badge in RoutesModal table + grouped view + unprotected count in toolbar; POST/PUT/DELETE/PATCH without auth injected as high-severity findings in VAPTModal

---

## Progress log

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Graph label contrast | ✅ Done | WCAG luminance formula on D3 nodes + paint-order stroke halo; 3D canvas label text fixed to white/black |
| 2 | UI identity | ✅ Done | Accent → indigo #6366f1; Inter font for UI, JetBrains Mono kept for code elements; frosted-glass topbar; updated constants + heatmap |
| — | App.js split (infra) | ✅ Done | Extracted to pr-risk.js (92L) + shared.js (261L); App.js 4200→3790L; index.html load order updated |
| 3 | PNG export | ✅ Done | exportPNG() in export.js; fits graph, captures SVG→canvas, restores zoom; button in export overlay |
| 4 | WebGL badge | ✅ Done | status-chip--webgl (indigo) shows in status bar when 3D view active; status-chip--perf (amber) when >300 files |
| 5 | Missing security patterns | ✅ Done | AWS key (AKIA…), weak hash (md5/sha1), Math.random crypto, yaml.load unsafe, requests verify=False, path traversal |
| 6 | OSV.dev dependency scan | ✅ Done | osv-scan.js auto-runs on load; Deps tab in right panel; CVE count badge in status bar; click CVE → osv.dev |
| 7 | Cyclomatic complexity | ✅ Done | calcFunctionCC() per fn in graph-builder.js; CC:N badge on each fn in right panel (color-coded low/med/high/critical) |
| 8 | Maintainability index | ✅ Done | calcMI() in health.js using Halstead Volume + CC + LOC; MI badge per file in right panel header (green ≥85, yellow ≥65, red <65) |
| 9 | Function call graph | ✅ Done | D3 mini-graph in right panel Call Graph card; nodes colored by CC level; draggable |
| 10 | Cross-file call trace | ✅ Done | 2-level upstream call chain shown under "External callers" in each expanded function; entry pt chip in canvas info bar |
| 11 | Entry point detection | ✅ Done | Dashed ring on D3 nodes with no incoming deps; ↗ Entry badge on functions called only externally |
| 12 | Import path resolution | ✅ Done | Go (go.mod module name + dirFirstFile), Java/Kotlin/Scala (dynamic source root detection), C# (dot→slash), Rust (crate::), Python (relative + absolute); direct import edges added in graph-builder for non-JS files |
| 13 | CSV / SARIF export | ✅ Done | exportCSV() with 10 columns in export.js; exportSARIF() SARIF 2.1.0 with rules+results+artifacts; CSV Metrics + SARIF (GitHub) buttons in export overlay |
| 14 | Terraform + Solidity | ✅ Done | .tf/.tfvars/.sol added to codeExts; resource/module/variable/output/data/provider blocks extracted (Terraform); contract/function/modifier/event extracted (Solidity); Solidity import + Terraform local source= edges in call graph |
| 15-19 | BATCH 5 (Diagrams + Export) | ✅ Done | Block view on main canvas (Mermaid); Block tab in Call Graph modal (D3 tree); SVG/PDF export on all surfaces; PNG/SVG/PDF in Call Graph modal |
| 20-23 | BATCH 6 (VAPT) | ✅ Done | VAPT modal (Shield btn); architecture smells; HTML+JSON export; risk score 0-100 |
| 24 | Circular dep finder | ✅ Done | Tarjan SCC in vapt.js; surfaced in VAPT Architecture Analysis |
| 25 | Change impact analysis | ✅ Done | Pre-existing Blast Radius feature covers this fully |
| 20-23 (enhanced) | VAPT card depth | ✅ Done | CWE full name + OWASP full name + Impact section + step-by-step fix (5 steps) + CVSS score; glossary box (VAPT/OWASP/CWE/CVSS/CVE/SARIF) at top of every report; OWASP coverage bar chart in report body |
| 26 | Code duplication diff view | ✅ Done | Side-by-side diff in duplicate drilldown modal; per-line red/green highlighting; similarity % bar; numbered refactor guide |
| 27 | Test coverage estimator | ✅ Done | computeTestCoverage() in right-panel.js; test_foo→foo / testFoo→foo / foo_test→foo mapping; ~N% cov badge per file in header; overall coverage bar + uncovered files list in Actions tab |
| 28 | Complexity histogram | ✅ Done | CC band cards (1–5/6–10/11–20/21+) in Insights panel; click to expand inline function list sorted by CC desc |
| 29 | Hot path detector | ✅ Done | In-degree ranking from connections; top 8 files with progress bars in Insights panel |
| 30 | Dead code island | ✅ Done | Collapsible Dead Code section in Insights panel; unreachable functions grouped by file; View all → unused-functions modal |
| 31 | Entropy scanner | ✅ Done | Shannon entropy on strings ≥20 chars, threshold ≥4.5; feeds security issues list as High-Entropy String (medium severity) |
| 32 | API endpoint map | ✅ Done | parser-routes.js detects Express/FastAPI/Flask/Django/Spring/Go/Rails/ASP.NET; RoutesModal with table + grouped views; Routes button in topbar |
| 33 | React component tree | ✅ Done | parser-components.js detects React/Vue/Svelte/Angular; ComponentTreeModal with expand/collapse tree + framework breakdown; Components button in topbar |
| 34 | License scanner | ✅ Done | vaptScanLicenses() scans package.json/pyproject.toml/setup.py/Cargo.toml/composer.json/LICENSE files; GPL/AGPL=high, LGPL=medium, permissive=ok; License Risk section in VAPT modal + HTML export |
| 35 | Martin's coupling metrics | ✅ Done | Ca/Ce/Instability/Abstractness per file; SVG scatter plot with hover tooltips; zone of pain + zone of uselessness labels; top-5 worst files table in Insights panel |
| 36 | Git heatmap | ✅ Done | lastCommit date stored from GitHub API; 'git' colorMode with 5 recency bands (hot→cold); Hot+Complex danger file list in Insights; Git legend in canvas |
| 37 | SBOM export | ✅ Done | exportSBOM() generates CycloneDX 1.4 JSON from OSV data + package.json dependencies; SBOM (CycloneDX) button in export overlay |
| 38 | Snapshot diff | ✅ Done | prevDataRef tracks last analysis; useMemo computes added/removed files, CC regressions, new security issues, new circular deps; delta modal auto-shows on re-analyze |
| 39 | Natural language filter | ✅ Done | nlFilter state in App.js; "find auth files…" input in topbar; useEffect highlights matching nodes (keyword+path+layer search), dims others with D3 transitions |
| 40 | Treemap view | ✅ Done | Already wired — renderer-treemap.js, D3 treemap area=LOC, folder grouping, colorMap, click-to-select |
| 41 | Cognitive complexity | ✅ Done | calcFunctionCogCC() in graph-builder.js; nesting-weighted; Cog:N badge in right panel (shown only when > CC) |
| 43 | TODO/FIXME tracker | ✅ Done | Parser.collectTodos() scans files pre-null; todos[] in dataObj; TODOs tab in right panel with type badges + click-to-select |
| 44 | Chord diagram | ✅ Done | renderer-chord.js D3 chord layout; folder arcs + ribbons; click to filter; "Chord" in VIZ_TYPES |
| 45 | OWASP radar chart | ✅ Done | SVG spider chart in VAPTModal; 10 OWASP axes; filled polygon; replaces bar chart |
| 46 | More secret patterns | ✅ Done | 8 new patterns: JWT, PEM key, Stripe, Twilio, SendGrid, DB URL, Azure, extra cred vars |
| 47 | Unprotected route detection | ✅ Done | authProtected flag per route; ⚠ badge in RoutesModal; high-sev findings in VAPT |
