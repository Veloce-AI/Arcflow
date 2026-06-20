# Arcflow — Enterprise Codebase Intelligence
## Claude Code Development Prompt

---

## What you are building

You are building **Arcflow** — a browser-based enterprise codebase intelligence tool forked from the open-source project CodeFlow (https://github.com/braedonsaunders/codeflow). Arcflow is NOT a reskin. It is a ground-up rebuild of the analysis engine, renderer, and UI using CodeFlow's concept as the starting point only.

The core philosophy:
- Runs 100% in the browser. No backend. No accounts. No data leaves the machine.
- Single `index.html` file (self-contained, zero install, open in browser = done)
- All CDN dependencies must be loaded from: `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `unpkg.com`, or `esm.sh` only
- Built for engineering leads, security teams, and senior developers at enterprises
- The differentiator over CodeFlow: accurate analysis, real code visibility, actionable security, and a renderer that handles large repos without dying

---

## Step 0 — Read the source first

Before writing a single line of code:

1. Fetch and read the entire CodeFlow `index.html` from: `https://raw.githubusercontent.com/braedonsaunders/codeflow/main/index.html`
2. Map out mentally: what the existing parser does, how the D3 graph is initialized, how GitHub API calls are made, what the current security scanner patterns are, and where the React component tree starts
3. You will reuse: the GitHub API fetch logic, the local file drag-drop system, the health score formula, and the existing UI shell structure
4. You will replace or heavily extend: the dependency resolver, the renderer, the security scanner, the side panel, and the visualization modes

Do not start coding until you have read and understood the source.

---

## Tech stack (all via CDN, no npm, no build step)

```
React 18          → cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
ReactDOM 18       → cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
Babel standalone  → cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js
D3 v7             → cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js
Sigma.js v2       → cdn.jsdelivr.net/npm/sigma@2.4.0/build/sigma.min.js
Graphology        → cdn.jsdelivr.net/npm/graphology@0.25.4/dist/graphology.umd.min.js
Graphology layout → cdn.jsdelivr.net/npm/graphology-layout-forceatlas2@0.10.1/dist/graphology-layout-forceatlas2.min.js
Acorn (AST)       → cdnjs.cloudflare.com/ajax/libs/acorn/8.11.3/acorn.min.js
Highlight.js      → cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js
Highlight CSS     → cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css
Fuse.js           → cdnjs.cloudflare.com/ajax/libs/fuse.js/7.0.0/fuse.min.js
```

Remove `jsrsasign` entirely — replace with `window.crypto` (built-in Web Crypto API) for any token handling. It is 400KB of dead weight.

---

## Feature build list — implement ALL of these

Build in this exact order. Each phase must be working before moving to the next.

---

### PHASE 1 — Dual renderer with auto-switching

**The renderer is the most important decision. Get this right first.**

Implement TWO rendering engines that Arcflow switches between automatically:

**Engine A: D3 Force Graph** (default for repos ≤ 300 files)
- Keep D3 force simulation as the primary renderer for small/medium repos
- Add D3 hierarchical edge bundling (`d3.curveBundle`) for repos 100–300 files — this eliminates the hairball problem by grouping parallel edges into smooth curves
- Node size = number of imports (fan-in). Bigger node = more things depend on it
- Edge thickness = import frequency between those two files
- Maintain all 4 existing color modes: Folder, Layer, Churn, Blast

**Engine B: Sigma.js + WebGL** (auto-activates for repos > 300 files)
- Sigma.js renders via WebGL — handles 10,000+ nodes at 60fps
- Use Graphology as the underlying graph data structure for Sigma
- Use ForceAtlas2 layout (graphology-layout-forceatlas2) — runs in a Web Worker to avoid blocking the UI
- When file count exceeds 300: automatically switch to Sigma, show a small "Performance mode — WebGL active" badge in the top bar
- Keep the same 4 color modes working in Sigma via node/edge attribute coloring
- All click interactions (select node, blast radius, code view) must work identically in both engines

**Minimap** (works in both engines):
- Render a 160×100px thumbnail of the full graph in bottom-right corner using a small offscreen canvas
- Show a semi-transparent red rectangle representing the current viewport
- Click/drag the minimap to pan the main view

**Node grouping / directory collapse:**
- Right-click any node → "Collapse directory" — merges all files in that folder into one aggregate node
- Collapsed node shows: file count, average health score, total LOC
- Right-click collapsed node → "Expand"
- Store collapsed state in URL hash params so shareable links preserve the view

---

### PHASE 2 — Real dependency resolution (replace heuristic)

**The current CodeFlow dependency detection is function-name matching. Replace it entirely.**

Use Acorn (already in the CDN list) to parse JavaScript and TypeScript files into an AST and extract real import/require statements:

```
For each JS/TS file:
  1. Run acorn.parse(fileContent, { ecmaVersion: 2020, sourceType: 'module' })
  2. Walk the AST — find ImportDeclaration nodes → extract .source.value
  3. Find CallExpression nodes where callee.name === 'require' → extract argument
  4. Resolve relative paths (./utils → utils.js, ../lib/auth → lib/auth.js)
  5. Map resolved paths to actual file nodes in the graph
  6. Create a directed edge: this file → imported file
```

For non-JS files (Python, Go, Java, Ruby etc.) — keep the existing regex-based approach from CodeFlow but improve it:
- Python: `import X`, `from X import Y` — resolve X to actual files in the repo
- Go: extract import paths from `import ( ... )` blocks
- Java/Kotlin: extract `import com.example.X` and try to match to files

**Circular dependency detection with full path:**
- After building the graph, run DFS cycle detection
- When a cycle is found, store the full path: `[auth.js → user.js → db.js → auth.js]`
- Render the cycle as a highlighted red loop on the graph
- In the side panel: list each cycle with the full chain, and for each link in the chain show which specific import statement creates it
- Suggestion: "Break the cycle by moving X from auth.js to a shared utils.js"

---

### PHASE 3 — Inline code viewer with exact line jump

**This is the feature that makes everything else meaningful.**

When a user clicks any node, opens the right panel. The panel has two tabs:

**Tab 1: Metrics**
(existing CodeFlow metrics: health score, LOC, functions, churn, owners — keep these)

**Tab 2: Code**
- Show the full file content, syntax highlighted using highlight.js
- Language is auto-detected from file extension
- The code viewer scrolls to and highlights a specific line when:
  - A security issue badge was clicked → jump to the exact line of the vulnerability
  - A pattern detection badge was clicked → jump to the first line of the pattern
  - A function name is clicked in the metrics tab → jump to the function definition line
  - A circular dep is clicked → jump to the import statement that creates the cycle

Implementation:
```
1. File content is already fetched during analysis — store it in the node data object
2. After highlight.js renders, find line N by counting <br> tags or wrapping each line in a <span data-line="N">
3. Scroll the code panel to that line and add a CSS highlight class (amber background, left border accent)
4. Line numbers shown in gutter — clicking a line number copies "filename:lineN" to clipboard
```

**Cmd+K / Ctrl+K command palette:**
- Fuse.js fuzzy search across: all file names, all function names, all detected security issues, all pattern matches
- Results grouped by type (Files / Functions / Issues / Patterns)
- Arrow keys navigate, Enter jumps to that node in the graph AND opens its code viewer
- Esc closes
- Show keyboard shortcut hint in the top bar

---

### PHASE 4 — PR impact analysis, done properly

**Arcflow's PR analysis must show full transitive blast radius, not just direct imports.**

When user pastes a PR URL:

```
1. Fetch PR diff from GitHub API: GET /repos/{owner}/{repo}/pulls/{number}/files
2. For each changed file in the diff:
   a. Get the list of changed line ranges (hunk headers from the diff)
   b. Identify which functions were modified (match line ranges against function position map)
   c. Walk the dependency graph outward — BFS from the changed file
   d. Level 1 = files that directly import the changed file
   e. Level 2 = files that import Level 1 files
   f. Continue until no more dependents or Level 5 (cap to avoid infinite traversal)
3. Build a "blast map" object: { direct: [...], level2: [...], level3: [...], ... }
```

**Visual output:**
- Animate a ripple effect on the graph: changed files pulse red, Level 1 dependents pulse amber, Level 2 pulse yellow, deeper levels fade
- In the side panel: show a ranked list — "3 files directly affected, 12 transitively affected, 2 have zero test coverage (red)"
- Each file in the list: click to jump to it in the graph and open code viewer

**Change risk score per affected file:**
Calculate a 0–100 risk score for each file in the blast radius:
```
risk = (fan_in * 0.35) + (complexity * 0.25) + (churn_rate * 0.20) + (security_issues * 0.20)
```
Where:
- `fan_in` = number of files importing this file (normalized 0–1 against max in repo)
- `complexity` = function count + nesting depth estimate (normalized)
- `churn_rate` = commits in last 30 days (normalized)
- `security_issues` = count of open security issues in this file (normalized)

Show risk score as a colored ring around each node in blast mode: red (>70), amber (40–70), green (<40).

**Test coverage overlay:**
- Add a "Drop coverage file" zone in the PR panel (or drag onto the graph)
- Accept: `coverage-summary.json` (Jest), `lcov.info` (Istanbul/NYC), `coverage.xml` (Cobertura)
- Parse the coverage file in the browser — map file paths to nodes
- Overlay a coverage % badge on each node in the blast radius
- Show warning: "This PR affects 5 files — 3 have < 40% test coverage" in amber banner at top of panel

---

### PHASE 5 — Security scanner, rebuilt

**Replace CodeFlow's pattern list with a serious one. Add line-level precision.**

**Pattern library** — for each pattern, store: the regex/AST rule, the line number it fires on, the severity (Critical / High / Medium / Low), and a fix suggestion string:

```javascript
const SECURITY_PATTERNS = [
  // Secrets
  { id: 'hardcoded-secret', name: 'Hardcoded secret', severity: 'Critical',
    pattern: /(api[_-]?key|secret|password|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    fix: 'Move to environment variable. Use process.env.YOUR_KEY or a secrets manager.' },

  { id: 'aws-key', name: 'AWS key exposed', severity: 'Critical',
    pattern: /AKIA[0-9A-Z]{16}/g,
    fix: 'Rotate this AWS key immediately. Add to .gitignore and use IAM roles instead.' },

  // Injection
  { id: 'sql-concat', name: 'SQL injection risk', severity: 'Critical',
    pattern: /(query|execute|sql)\s*\(\s*[`'"].*\+/gi,
    fix: 'Use parameterized queries or a query builder. Never concatenate user input into SQL.' },

  { id: 'eval-usage', name: 'eval() usage', severity: 'High',
    pattern: /\beval\s*\(/g,
    fix: 'Remove eval(). Use JSON.parse() for data, or restructure to avoid dynamic code execution.' },

  { id: 'innerhtml', name: 'innerHTML XSS risk', severity: 'High',
    pattern: /\.innerHTML\s*=/g,
    fix: 'Use textContent or DOMPurify.sanitize() before setting innerHTML.' },

  // Auth & crypto
  { id: 'weak-hash', name: 'Weak hash algorithm', severity: 'High',
    pattern: /\b(md5|sha1)\s*\(/gi,
    fix: 'Use SHA-256 or bcrypt. MD5 and SHA1 are cryptographically broken.' },

  { id: 'math-random', name: 'Insecure random for security', severity: 'Medium',
    pattern: /Math\.random\(\)/g,
    fix: 'Use crypto.getRandomValues() for any security-sensitive random number generation.' },

  // Debug / prod hygiene
  { id: 'debug-endpoint', name: 'Debug endpoint exposed', severity: 'Medium',
    pattern: /app\.(get|post)\s*\(\s*['"]\/debug/gi,
    fix: 'Remove or gate this endpoint behind an environment check before deploying to production.' },

  { id: 'console-log', name: 'console.log in production', severity: 'Low',
    pattern: /console\.(log|debug|info)\s*\(/g,
    fix: 'Remove or replace with a proper logging library that can be disabled in production.' },

  { id: 'todo-security', name: 'Security TODO comment', severity: 'Low',
    pattern: /\/\/\s*(todo|fixme|hack|xxx).*?(auth|security|password|token)/gi,
    fix: 'This comment flags an unresolved security concern. Address before shipping to production.' },
]
```

**Taint analysis (heuristic):**
- Track functions that accept parameters named: `req`, `request`, `body`, `input`, `userInput`, `query`, `params`
- If those variables flow into: database calls, file system calls, `eval()`, `innerHTML`, `exec()` — flag the path
- Draw the taint path as an orange dashed line in the graph from the entry point function to the sink
- Label: "User input flows to database call without sanitization — 3 hops"

**OSV.dev dependency scan:**
- After parsing `package.json` / `requirements.txt` / `go.mod` from the repo:
- Call `https://api.osv.dev/v1/query` with each package name + version (POST, CORS-enabled, no key needed)
- Match returned CVEs to files that import that package
- Show a "⚠ CVE" badge on those nodes
- Clicking the badge shows: CVE ID, severity, description, and the fixed version to upgrade to

---

### PHASE 6 — New D3 visualization modes

Add three new view modes to the existing 4 (Folder / Layer / Churn / Blast):

**View 5: Treemap**
```
Use d3.treemap() with d3.hierarchy()
Root = repo, children = directories, leaves = files
Node area = lines of code (bigger = larger file)
Node color = health score (green → amber → red)
Clicking a cell selects that node, opens code viewer
Hovering shows: filename, LOC, health score, function count
Breadcrumb trail at top: repo / src / utils / auth.js
Click any breadcrumb to zoom out to that level
```

**View 6: Sunburst**
```
Use d3.partition() with radial layout
Innermost ring = repo root
Each ring outward = one directory level deeper
Arc size = LOC proportion within parent
Color = same health/churn/layer modes as force graph
Click an arc to zoom in (that arc becomes the new root, children expand)
Click center circle to zoom back out one level
```

**View 7: Dependency matrix (adjacency heatmap)**
```
Use d3.chord() or a simple SVG grid
Rows = files, Columns = files
Cell color intensity = number of imports between them
Hot cells = tight coupling (worth refactoring)
Hover a cell → highlight those two nodes in the force graph (both views in sync)
Sort rows/cols by: most coupled, alphabetical, by directory
This view is specifically for identifying coupling hotspots — enterprise architects love this
```

All view modes share the same underlying graph data. Switching views is instant — it's just a different rendering of the same computed data structure.

---

### PHASE 7 — Additional patterns & anti-patterns

Expand the pattern detection. For each pattern: detect it, badge the node, click → jump to line in code viewer.

**Design patterns to add:**
```
- Repository pattern: class *Repository with find/save/delete methods
- CQRS: separate command/query handler classes
- Mediator: central event bus or mediator object
- Decorator: class wrapping another class, delegating calls
- Proxy: class intercepting method calls on another object
- Command: objects with execute() method encapsulating an action
- Strategy: swappable algorithm classes behind a common interface
- State machine: state variable + transition map or switch statement
- Builder: chained method calls returning `this`, ending in .build()
- Abstract Factory: factory that creates other factories
- Pub/Sub: event emitter pattern, subscribe/publish/emit methods
- MVC / MVVM: model-view-controller separation by file naming convention
- Hexagonal (Ports & Adapters): clear separation of domain / infrastructure
```

**Anti-patterns to add:**
```
- Shotgun Surgery: one file has outgoing imports to > 15 other files (flag as "high coupling, changes here ripple everywhere")
- Feature Envy: a function that calls methods on another class more than its own (heuristic: count external method calls vs internal)
- God Object: class > 500 LOC with > 20 methods (already in CodeFlow — extend threshold to be configurable)
- Magic Numbers: numeric literals not assigned to a named constant
- Dead Code: exported functions with zero imports anywhere in the repo
- Inappropriate Intimacy: two files with bidirectional imports (they know too much about each other)
- Long Parameter List: functions with > 5 parameters
- Duplicate Code: identical function bodies across files (normalize whitespace, compare hash)
```

---

### PHASE 8 — UI & navigation polish

**Resizable panels:**
- Add drag handles between: graph canvas | left panel | right panel
- Mouse-down on handle → mousemove resizes adjacent panels
- Store sizes in `sessionStorage` (not localStorage — resets per session, keeping stateless feel)

**Node collapse / expand:**
- Right-click context menu on any node or group of nodes
- "Collapse to directory" → merge all files in same folder into one aggregate node
- Aggregate node label: "src/utils (8 files)"
- Aggregate node size = sum of children sizes
- Expand arrow indicator on collapsed nodes

**Graph search with highlighting:**
- Cmd+K / Ctrl+K opens command palette (Fuse.js)
- Typing animates: non-matching nodes fade to 20% opacity, matching nodes stay full opacity and pulse once
- Results list shows 5 at a time, arrow key navigation
- Enter: select node, center graph on it, open code panel

**Keyboard shortcuts** (add to existing Enter / +/- / Esc):
```
Cmd+K       → command palette
Cmd+F       → search within current open file (code viewer)
Cmd+Shift+C → copy current file path to clipboard  
G then G    → go to graph root / reset zoom
B           → toggle blast radius mode
S           → toggle security overlay
T           → cycle through view modes (Force → Treemap → Sunburst → Matrix → Force)
```

---

## Enterprise differentiators — the things that separate Arcflow from CodeFlow

These are the features to call out in any product positioning:

1. **Accurate edges** — real AST import tracing, not function-name guessing. Enterprise teams can trust the dependency graph.

2. **Scales to real repos** — WebGL renderer auto-activates for large repos. CodeFlow freezes on facebook/react. Arcflow doesn't.

3. **Line-level precision** — every security issue, every pattern, every circular dep links to an exact line of code. Not "this file has a problem" — "line 47 of auth.js has this problem, here's the code, here's the fix."

4. **Transitive blast radius** — PR impact shows all 5 levels of transitively affected files, with risk scores. No other free tool does this locally.

5. **Real security, not toy patterns** — OSV.dev CVE scanning for dependencies + taint analysis tracing user input to dangerous sinks.

6. **Dependency coupling matrix** — the adjacency heatmap view is what architects use in paid tools like Structure101. Arcflow has it free, in the browser.

7. **Zero data custody** — relevant for regulated industries (BFSI, healthcare, defence). Code never leaves the browser. Audit log-safe.

---

## Code quality rules

- No `console.log` left in final code (ironic given the security scanner)
- All React state managed with `useState` and `useReducer` — no globals except the graph data object
- The graph data object IS a global (`window.stratumGraph`) — it is the single source of truth shared between all renderers and panels
- Comments on every non-obvious function — this is going to be a large file
- Error boundaries around the graph canvas — if D3 or Sigma throws, show a graceful error state, not a blank screen
- All GitHub API calls go through a single `fetchWithRateLimit()` wrapper that: checks remaining rate limit header, queues requests if below 10 remaining, shows a rate limit warning badge in the UI
- For repos > 500 files: show a "Large repo — analysis may take a minute" progress indicator with a file counter

---

## File structure (still single index.html, but mentally organized)

```
index.html
├── <head>        CDN script tags in order listed above
├── <style>       All CSS — dark theme by default, light theme toggle
├── <script type="text/babel">
│   ├── // ── CONSTANTS & CONFIG ──────────────────────
│   ├── SECURITY_PATTERNS array
│   ├── DESIGN_PATTERNS array  
│   ├── ANTIPATTERN_RULES array
│   ├── // ── ANALYSIS ENGINE ─────────────────────────
│   ├── parseImportsAST(fileContent, filePath)     ← Acorn-based
│   ├── parseImportsRegex(fileContent, lang)       ← fallback for non-JS
│   ├── buildDependencyGraph(files)                ← returns graphology Graph
│   ├── detectCycles(graph)                        ← DFS, returns cycle paths
│   ├── detectPatterns(fileContent, filePath)      ← design patterns
│   ├── detectAntiPatterns(fileContent, graph)     ← anti-patterns
│   ├── runSecurityScan(fileContent, filePath)     ← returns line-level issues
│   ├── computeRiskScore(node, graph)              ← 0–100 risk
│   ├── computeBlastRadius(nodeId, graph, depth)   ← BFS, returns leveled map
│   ├── // ── RENDERERS ───────────────────────────────
│   ├── D3Renderer({ graph, mode, onNodeClick })   ← React component
│   ├── SigmaRenderer({ graph, mode, onNodeClick })← React component
│   ├── TreemapView({ graph, onNodeClick })        ← D3 treemap
│   ├── SunburstView({ graph, onNodeClick })       ← D3 partition
│   ├── MatrixView({ graph, onNodeClick })         ← D3 adjacency grid
│   ├── Minimap({ graphRef, viewport })            ← canvas overlay
│   ├── // ── UI COMPONENTS ───────────────────────────
│   ├── CommandPalette({ graph, onSelect })        ← Fuse.js search
│   ├── CodeViewer({ file, highlightLine })        ← highlight.js panel
│   ├── PRImpactPanel({ graph, prUrl })            ← PR blast radius
│   ├── SecurityPanel({ issues })                  ← security findings
│   ├── MetricsPanel({ node, graph })              ← health, LOC, churn
│   ├── // ── MAIN APP ─────────────────────────────────
│   └── App()                                      ← root React component
└── <div id="root">
```

---

## What NOT to build

- No backend, no API server, no database
- No user accounts, no login, no persistence between sessions
- No npm, no webpack, no build step
- No Cytoscape.js (Sigma.js is the WebGL renderer of choice)
- No localStorage for analysis results (stateless by design)
- Do not remove the local file drag-drop feature from CodeFlow — keep it, it's a key privacy feature
- Do not remove the existing GitHub Action card system — keep `card/` directory and README intact

---

## Definition of done

The tool is done when:

1. Paste `https://github.com/facebook/react` → full analysis completes, graph renders, no freeze
2. Paste `https://github.com/expressjs/express` → circular dependency path shown, clicking it jumps to exact import line
3. Drag-drop a local folder with 500 JS files → Sigma/WebGL auto-activates, graph renders in < 5 seconds
4. Click any node → code panel opens, file content visible with syntax highlighting
5. Click a security badge on any node → code panel jumps to exact vulnerable line
6. Paste a PR URL → transitive blast radius animates, risk scores shown, test coverage overlay works if lcov dropped
7. Press Cmd+K → command palette opens, fuzzy searching "auth" returns matching files and functions
8. Switch to Treemap view → rectangles sized by LOC, colored by health, clicking opens code panel
9. Switch to Matrix view → coupling heatmap renders, hovering a cell highlights both nodes in force graph
10. WebGL badge appears automatically when repo > 300 files

---

## Start command

```
Begin with Phase 1. Read the CodeFlow source first (fetch the raw index.html). 
Then build the dual renderer system (D3 + Sigma with auto-switch at 300 files).
Get the graph rendering with both engines before touching anything else.
Commit working state after each phase.
```