<div align="center">

<img src="logo.svg" width="160" alt="Arcflow Logo">

<br><br>

<h1>Arcflow</h1>

<h3>VAPT &amp; Security Analysis Platform with Architecture Intelligence</h3>

<p><strong>Scan for vulnerabilities · Map dependencies · Detect secrets · Audit your codebase — all in your browser, zero install.</strong></p>

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE) [![GitHub Stars](https://img.shields.io/github/stars/Veloce-AI/Arcflow?style=flat-square&color=6366f1)](https://github.com/Veloce-AI/Arcflow/stargazers) [![Open Issues](https://img.shields.io/github/issues/Veloce-AI/Arcflow?style=flat-square&color=a78bfa)](https://github.com/Veloce-AI/Arcflow/issues) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-a78bfa?style=flat-square)](https://github.com/Veloce-AI/Arcflow/pulls) [![Works Offline](https://img.shields.io/badge/works-offline-6366f1?style=flat-square)](#whats-bundled-offline) [![Zero Install](https://img.shields.io/badge/zero-install-a78bfa?style=flat-square)](#quick-setup--zero-install) [![VS Code](https://img.shields.io/badge/VS%20Code-Extension-6366f1?style=flat-square&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=Veloce-AI.arcflow)![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black) ![D3.js](https://img.shields.io/badge/D3.js-7.8-F9A03C?style=flat-square&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-ES5-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-offline-E34F26?style=flat-square&logo=html5&logoColor=white) ![WebGL](https://img.shields.io/badge/WebGL-3D_graphs-990000?style=flat-square) ![Mermaid](https://img.shields.io/badge/Mermaid-diagrams-FF3670?style=flat-square) ![OWASP](https://img.shields.io/badge/OWASP-Top_10-000000?style=flat-square) ![CycloneDX](https://img.shields.io/badge/CycloneDX-SBOM-00AEEF?style=flat-square) ![SARIF](https://img.shields.io/badge/SARIF-2.1.0-0078D4?style=flat-square&logo=github&logoColor=white)

<br>

<p>Paste a GitHub URL, open a local folder, or drop a ZIP — and within seconds see how every file connects,<br>what would break if something changed, where the secrets and vulnerabilities are, and how healthy the overall structure is.<br>Everything runs in your browser tab. Nothing is ever uploaded.</p>

<br>

<p><em>Developed with ♥ by <strong><a href="https://veloceai.in">VeloceAI.in</a></strong> — open source for the community</em></p>

</div>

---

> **Fully offline.** All libraries (React, D3, fonts) ship with the app. No internet required after first download.

---

## Why Arcflow?

| Security | Architecture | Quality |
|:---:|:---:|:---:|
| 🛡 OWASP Top 10 radar | 🗺 10 graph/chart views | 📊 Maintainability Index |
| 🔑 Secrets & entropy scan | 💥 Blast radius analysis | 🔄 Cyclomatic complexity |
| 🚨 CVE / OSV dependency audit | 📡 API routes + auth detection | 🕳 Dead code & duplication |
| 📄 SARIF / SBOM export | 🏗 Auto architecture diagrams | 🔬 Call graph tracing |
| 🏴‍☠️ Unprotected endpoint detection | 🔗 Circular dependency finder | 🏷 TODO / FIXME tracker |

---

## How to Open

**Option 1 — VS Code Live Server (recommended)**
Right-click `index.html` → *Open with Live Server*

**Option 2 — start.bat**
Double-click `start.bat`. Starts a tiny local server and opens the browser. Requires Node.js.

**Option 3 — Firefox only**
Firefox lets you open HTML files directly from disk. Chrome and Edge do not allow multi-file local projects to run this way.

---

## Quick Setup — Zero Install

Arcflow has no server, no build step, no npm, no dependencies to install. Every library is already bundled in the `vendor/` folder.

**Step 1 — Download the repo**

```
# Clone via git
git clone https://github.com/Veloce-AI/Arcflow.git

# Or click "Code → Download ZIP" on GitHub, then unzip it
```

**Step 2 — Open it**

Pick any one of these:

| Method | Steps | Requires |
|---|---|---|
| **VS Code Live Server** | Install the "Live Server" extension → right-click `index.html` → *Open with Live Server* | VS Code + Live Server extension |
| **start.bat** | Double-click `start.bat` in the folder | Node.js (any version) |
| **Firefox** | File → Open File → select `index.html` | Firefox browser |

That's it. No `npm install`. No build. No terminal commands beyond the optional `start.bat`.

> **Chrome / Edge limitation**: These browsers block local multi-file HTML pages for security reasons. Use Live Server or `start.bat` — both start a tiny local server that Chrome accepts.

---

## Loading Your Codebase

| Method | Steps | Best for |
|---|---|---|
| **GitHub URL** | Paste any `github.com/owner/repo` URL → click **Analyze** | Public repos, quick exploration |
| **Local Folder** | Click the **folder icon** in the topbar | Your own code on disk |
| **ZIP Archive** | Click the **ZIP icon** in the topbar | Snapshots, shared codebases, private repos without a token |

For **private GitHub repos**, click the key icon and enter a Personal Access Token (PAT) — a secret string from your GitHub settings that grants read access.

---

## The Interface

```
┌────────────────────────── Topbar ──────────────────────────────────────┐
│ [URL input]  Analyze  📁Folder  📦ZIP  🔍Filter  Export  VAPT  Routes │
├──── Sidebar (left) ─────┬──────── Canvas (centre) ────────────────────┤
│  Health Score           │                                              │
│  Color By               │   [ Interactive graph / chart ]              │
│  Stats (files, fns…)    │                                              │
│  File Explorer (tree)   │                                              │
├─────────────────────────┴────────────────────────┬─────────────────────┤
│                                                  │  Right Panel        │
│                                                  │  Details / Insights │
│                                                  │  Patterns / Security│
│                                                  │  TODOs / Functions  │
└──────────────────────────────────────────────────┴─────────────────────┘
│  Status bar: files · issues · security · functions · LOC · CVEs        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## All Features — Complete Reference

### SECTION 1 — Visualizations

Click the **dropdown in the top-left of the canvas** to switch between 10 different views of the same data.

---

#### 1. Graph (Force-Directed) — default view

Every file is a circle (node). Every import is a line (edge). Files that import each other are pulled together by a physics simulation; unrelated files drift apart.

- **Dashed ring** around a node = entry point (nothing imports this file; it is a top-level starting point)
- **Click a node** to select that file and see full details in the right panel
- **Click empty space** to deselect

**Layout sub-modes** (click the gear ⚙ icon in the canvas toolbar):

| Layout | What it does |
|---|---|
| **Force** | Physics simulation — files cluster naturally by dependency weight |
| **Radial** | Entry points at the centre, dependents radiate outward like a sun |
| **Layers** | Vertical stack — entry points at the top, deep utilities at the bottom |
| **Grid** | Uniform grid, good for large repos where the force layout gets crowded |
| **Metro** | Subway-map style, right-angle routing |

**Spacing sliders** (in the ⚙ panel):
- **Spread** — how far apart nodes push each other
- **Links** — how long the connecting lines prefer to be

**Display toggles**: Show labels / Curved links

---

#### 2. 3D Graph

Same force-directed graph but rendered in 3D using WebGL. You can rotate, zoom, and orbit with your mouse or trackpad. Toggle **Auto-rotate** in the settings panel for a hands-free animated tour. The status bar shows *WebGL active* when this view is on.

Best for: stunning overviews of large repositories and presentations.

---

#### 3. Treemap

The whole codebase as nested rectangles. The **size** of each rectangle = how many lines of code (LOC) that file contains. Files sit inside their folder's rectangle. Hover to see exact counts. Click a file to select it.

Best for: instantly spotting which files are enormous relative to the rest.

---

#### 4. Matrix (Dependency Matrix)

A square grid where both the rows and columns are files. A coloured square at row A / column B means *file A imports file B*. Dense patches reveal tight clusters of files that are heavily coupled to each other.

Best for: finding modules that "know too much" about each other.

---

#### 5. Tree (Dendrogram)

A classic collapsible tree showing the folder hierarchy. Branches = folders. Leaves = files. Gives a clean structural view of how deep and wide your folder organisation is.

---

#### 6. Flow (Sankey Diagram)

Thick ribbons between folder names. The **wider** the ribbon, the more files in one folder import from another. Instantly shows which folders depend heavily on which others. Click a folder column to filter the graph.

Best for: understanding cross-folder coupling at a glance.

---

#### 7. Cluster (Disjoint Force)

Like the regular force graph, but files with **no connections to the rest** are pulled into separate isolated islands instead of floating near the main graph. Shows you immediately if your codebase is one connected unit or several independent chunks.

---

#### 8. Bundle (Hierarchical Edge Bundling)

All files arranged in a circle, grouped by folder. Dependency lines are drawn as smooth curves that follow a common path through the centre rather than crossing directly. Prevents the "spaghetti" of thousands of crossing lines.

Hover a file → only its connections light up. Click to select.

---

#### 9. Chord

Folders are placed around a ring. The thick arcs between folders represent cross-folder imports — thicker arc = more files crossing between those two folders. Click a folder's outer arc to filter the main canvas to just that folder.

Best for: seeing the biggest architectural coupling bottlenecks between modules.

---

#### 10. Block (Architecture Diagram)

An auto-generated architecture block diagram using Mermaid. Shows the high-level layers of the project (frontend, backend, services, database, etc.) as labelled boxes with arrows. Generated automatically from patterns detected in the code — no configuration needed.

Supports zoom + pan. Use the **Include Tests** and **Include Build Output** checkboxes (in the right panel when this view is active) to control whether test files and compiled output are shown.

---

### SECTION 2 — Color By Modes

The sidebar **Color By** section changes what node colours mean across all visualizations.

| Mode | Colour meaning |
|---|---|
| **Folder** | Each folder gets its own distinct colour. Files in the same folder share a colour. Use the legend (bottom-left of canvas) to see which colour = which folder. Click a legend entry to filter to that folder. |
| **Layer** | Colour shows the architectural role of the file, detected automatically from its path and code patterns: red = API routes, blue = UI components, green = utilities/helpers, purple = database/models, etc. |
| **Churn** | How many git commits have touched this file. **Red** = changed very often (unstable, risky). **Green** = rarely changed (stable). Requires GitHub API access. |
| **Git Recency** | When was this file last modified. **Red** = this week. **Orange** = this month. **Yellow** = 1–3 months. **Green** = 3–6 months. **Dark** = stale / no data. Useful for finding abandoned code. |
| **Clusters** | Colour by detected *dependency community*. Files that predominantly import each other get the same colour, regardless of which folder they're in. Files with a colour that doesn't match their folder are *misplaced* — they architecturally belong elsewhere. |

---

### SECTION 3 — Right Panel Tabs

Click any file in the graph or explorer to open its details. These tabs appear in the right panel.

---

#### Details Tab

| Section | What you see |
|---|---|
| **File header** | Name, path, language, LOC (lines of code), file size, MI score badge (Maintainability Index) |
| **Test coverage badge** | Estimated % of functions covered by tests — detected by matching test file function names (e.g. `testLogin` → `login`, `test_parse` → `parse`) |
| **Blast Radius** | How many files would be affected if this file changed or was deleted. Shows count of direct dependents and total transitive affected files. Canvas highlights those files. |
| **Functions list** | Every function/method in the file with: CC badge, Cog CC badge (if higher), whether it is an entry point, whether it has test coverage, LOC, and the function signature |
| **Imports** | Every file this file depends on |
| **Exports** | Every symbol this file makes available to others |
| **Ownership** | Who wrote how much of this file (from GitHub's git blame API — only available for GitHub repos) |
| **Duplicate code** | If any functions match functions in other files above the similarity threshold, they are listed here with a similarity % |

---

#### Call Graph (function-level view)

Inside the Details tab, when a file is selected, the **Call Graph** card shows a mini interactive D3 graph of how functions call each other *within that file*. Nodes are coloured by CC level (green → red). Drag nodes to reorganise. Click a function node to expand its details.

**Cross-file call trace**: In the expanded function detail, an **External callers** section shows which functions from *other files* call this function — a 2-level upstream chain. This lets you trace: "who calls `loginRoute`?" → "which calls `authService.login()`?" → "which calls `db.findUser()`?"

**Entry point indicator**: Functions with no callers within the codebase show an **↗ Entry** badge — they are called from outside (framework, user, test runner).

**Block view**: The Call Graph modal has a **Block** tab that renders the same call graph as a hierarchical top-down block diagram using D3 (not Mermaid). Rounded rectangle nodes are coloured by CC level. Entry nodes have a cyan border. Bezier edges have arrowheads showing direction. Auto-fits to the modal size.

---

#### Insights Tab

Global analysis of the whole codebase — available regardless of which file is selected.

| Section | What it means |
|---|---|
| **CC Histogram** | Bar chart of all functions grouped by complexity band: 1–5 (simple), 6–10 (moderate), 11–20 (complex), 21+ (critical). Click a bar to see all functions in that range, sorted worst first. |
| **Hot Paths** | The 8 most-imported files (highest in-degree). These are your most critical files — a bug here affects the most code. Shown with a bar proportional to how many files import them. Click to jump to the file. |
| **Circular Dependencies** | Groups of files that import each other in a cycle (A → B → C → A). Detected with Tarjan's SCC algorithm. Listed with cycle path and file count. These make code impossible to test in isolation and can cause load-order bugs. |
| **Dead Code** | Files that nothing imports (orphaned). Candidates for safe deletion. Click "View all" to open the full unused-files modal. Expandable list of unreachable functions per file with line counts. |
| **Code Duplication** | Pairs of functions across the codebase that are very similar (detected by tokenisation + fingerprinting). Click any pair to open a side-by-side diff view with red/green line highlighting and a numbered refactor guide. |
| **Complexity Histogram** | (same as CC Histogram above — visible in Insights even without file selected) |
| **Hot + Complex Danger Files** | Files that are *both* highly imported (hot path) *and* have high average CC (complex). These are the highest-risk files in the repo — a bug there is both likely and widely impactful. |
| **Test Coverage Summary** | Overall estimated test coverage % across the codebase. Progress bar. List of uncovered files. |
| **Martin's Coupling Metrics** | Scatter plot of every file by Instability (I) vs Abstractness (A). The ideal "main sequence" is the diagonal. Files in the **Zone of Pain** (bottom-left: stable + concrete) are fragile. Files in the **Zone of Uselessness** (top-right: unstable + abstract) are unnecessary. Hover any dot for the file name and D score. |
| **Dependency Clusters** | Coloured pills showing each detected community with its majority folder and file count. Below that: a list of **Misplaced Files** — files whose folder does not match the community they belong to architecturally. Click a file to navigate to it. |
| **Architecture Issues** | Larger structural problems: layer violations (e.g. a utility importing from API), missing separation of concerns, etc. Click any issue for a drilldown with the full list of affected files. |

---

#### Patterns Tab

Detected design patterns and anti-patterns across the codebase. Each entry links to a drilldown with the list of affected files.

**Good patterns** (shown green): Singleton, Factory, Observer, Repository, Service Layer, Facade, Command, Strategy, Adapter

**Anti-patterns** (shown red): God Object (one file doing everything), Spaghetti Code (tangled dependencies), Magic Numbers (unexplained numeric constants), Shotgun Surgery (a single change requires edits in many files)

---

#### Security Tab

Static analysis findings from scanning every file's source code. Grouped by severity. Click any finding for a drilldown with the code snippet, OWASP category, CWE number, impact description, and a step-by-step remediation guide.

**Severity levels**: High (red) · Medium (orange) · Low (blue)

**What is scanned**:
- Hardcoded secrets: API keys, passwords, tokens, private keys
- AWS access keys (`AKIA…` pattern)
- JWT tokens embedded in source
- PEM private keys (`-----BEGIN PRIVATE KEY`)
- Stripe / Twilio / SendGrid live credentials
- Database connection strings containing username and password
- Azure connection strings
- High-entropy strings (random-looking character sequences ≥ 20 chars that are likely secrets even without keyword match — detected with Shannon entropy)
- SQL query string concatenation (SQL injection risk)
- Weak hash functions (`md5`, `sha1` used for security purposes)
- `Math.random()` used for cryptographic purposes (not cryptographically secure)
- `yaml.load()` without SafeLoader (Python RCE risk)
- `pickle.loads()` (Python arbitrary code execution risk)
- `requests verify=False` (TLS certificate validation disabled)
- `eval()` and similar dangerous execution functions
- Path traversal patterns
- `exec()`, `system()`, `shell_exec()` with user-controlled input

---

#### TODOs Tab

Every developer annotation comment in the codebase, collected in one place.

| Tag | Colour | Meaning |
|---|---|---|
| `TODO` | Blue | Planned work not yet done |
| `FIXME` | Red | Known broken code that needs fixing |
| `BUG` | Red | Confirmed bug not yet fixed |
| `HACK` | Orange | Temporary workaround that should be cleaned up |
| `XXX` | Orange | Dangerous or questionable code, needs attention |
| `OPTIMIZE` | Purple | Working code but known performance issue |
| `NOTE` | Gray | Informational comment for future readers |

Shows the comment text, file name, and line number. Click any item to select that file and jump to it.

---

#### Functions Tab (call graph modal)

Click **Call Graph** in the Details tab header to open a full-screen modal with the function call graph for the selected file. Export as PNG, SVG, or PDF from the modal toolbar.

---

### SECTION 4 — Topbar Tools

---

#### Natural Language Filter

The search box in the topbar (placeholder: *find auth files…*) filters the graph using plain keywords. Type `auth login` and all nodes whose name, path, or layer contains those words will be highlighted; everything else dims. No AI or API key required — pure client-side keyword matching.

---

#### Exclude Patterns

Click the **Exclude** button (the filter icon in the topbar). Add glob patterns to skip certain files from analysis. Examples: `*.test.js`, `node_modules/**`, `dist/**`, `**/*.min.js`. The next analysis will ignore matching files. Active exclude count is shown as a badge on the button.

---

#### Export Menu

All exports are client-side — no server involved.

| Format | What it contains |
|---|---|
| **PNG** | Screenshot of the current graph view as an image |
| **SVG** | The current D3 graph as a scalable vector graphic — scales perfectly to any size |
| **PDF** | Current graph rendered into a PDF page |
| **CSV** | Spreadsheet with one row per file: path, folder, layer, LOC, functions, average CC, MI score, security issue count, in-degree, out-degree |
| **SARIF** | SARIF 2.1.0 format — import directly into GitHub Code Scanning to see security findings as pull request annotations |
| **Mermaid** | Raw Mermaid text for the architecture diagram — paste into any Mermaid-compatible tool |
| **SBOM (CycloneDX)** | Software Bill of Materials in CycloneDX 1.4 JSON format — lists all detected open-source dependencies with their versions and known CVEs, for SOC 2 / supply chain compliance |

---

#### VAPT — Security Dashboard

The **VAPT** button (shield icon) opens a full-screen security report.

**OWASP Radar Chart**: A spider web with 10 axes — one per OWASP Top 10 category. The more findings in a category, the further the polygon extends along that axis. Axes that are highlighted have at least one finding.

**Risk Score 0–100**: Calculated from severity counts weighted by OWASP category.

**Findings list**: Every security issue with:
- Severity badge (High / Medium / Low)
- OWASP category tag (e.g. A03:Injection)
- CWE number and full name (e.g. CWE-89: SQL Injection)
- CVSS score estimate
- Code snippet
- Impact description
- Step-by-step fix (5 numbered steps)

**Unprotected Endpoints**: Every POST / PUT / DELETE / PATCH route that has no authentication middleware detected is listed as a High-severity finding.

**Architecture Smells**: God files (>20 functions or CC sum >100), high-CC files, layer violations, orphaned files.

**License Risk**: GPL / AGPL licenses that could impose open-source obligations on proprietary code.

**Dependency CVEs**: All known CVEs from the OSV.dev database for packages found in `package.json` / `requirements.txt`.

**Export**: The VAPT report can be exported as:
- **HTML** — self-contained dark-themed report you can open in any browser and print to PDF
- **JSON** — machine-readable report with all findings, CVEs, and architecture smells

---

#### API Routes Map

The **Routes** button opens a modal listing every API endpoint detected in the codebase.

**Frameworks detected**: Express, Koa, Fastify, FastAPI, Flask, Django, Spring Boot, Go net/http + Gin + Chi, Rails, Sinatra, ASP.NET

Each route shows:
- **HTTP method** badge (GET / POST / PUT / DELETE / PATCH)
- **Path** (e.g. `/api/users/:id`)
- **Source file** where the route is defined
- **⚠ No auth** badge if no authentication middleware was detected in that file (for mutating methods)

Views: **Table** (sortable, searchable) and **Grouped by file**. Filter by method or framework.

The **unprotected count** is shown in the toolbar — the number of mutating routes with no detected auth guard.

---

#### Component Tree

The **Components** button opens a modal showing the UI component hierarchy for React, Vue, Svelte, or Angular codebases.

- Which component renders which child components
- Framework breakdown (% React vs Vue, etc.)
- Props listed per component
- Click any component to jump to its source file

---

#### PR Risk Analyser

Click **PR** in the topbar. Paste a GitHub Pull Request URL. Arcflow scores the PR:

| Signal | Weight |
|---|---|
| Number of files changed | Spread of impact |
| Whether high-CC files are touched | Code quality risk |
| Whether high-churn files are touched | Instability risk |
| Whether security-sensitive files are touched | Security risk |
| Whether circular dependencies increase | Architecture risk |

Returns a risk score and a breakdown by category. Good for a reviewer to get a quick read before diving in.

---

#### Snapshot Diff

Every time you **re-analyze** the same codebase, Arcflow automatically compares the new result against the previous one and shows a delta report:

- **Files added** since last analysis
- **Files removed** since last analysis
- **CC regressions** — functions whose complexity got worse (increased by more than 2 points)
- **New security issues** that weren't there before
- **New circular dependencies** introduced

The diff modal auto-opens after a re-analysis if there are any changes.

---

### SECTION 5 — Sidebar

#### Health Score

A number from 0 to 100 shown as a ring chart. Calculated using the **Maintainability Index** formula (industry-standard): combines Halstead Volume (how many unique operators and operands), average Cyclomatic Complexity, and Lines of Code. 

- **80–100**: Healthy, well-structured code
- **60–79**: Moderate, some areas need attention
- **Below 60**: Significant quality problems

#### Stats Cards

| Card | What it shows |
|---|---|
| **Files** | Total files analysed |
| **Functions** | Total functions/methods found |
| **Links** | Total import connections |
| **Unused** | Files with no incoming imports (dead code candidates) — click to open the dead code list |

**LOC** (Lines of Code): total lines across all files, shown below the cards.

**Language bar**: A colour bar showing what % of the codebase is each language, with a mini legend.

#### File Explorer

A collapsible folder tree. Click any file to select it. Click any folder name to filter the canvas to show only files in that folder. A **Clear filter** button appears in the explorer header when a folder filter is active.

---

### SECTION 6 — Status Bar

The thin bar at the very bottom of the screen shows live stats:

| Chip | Meaning |
|---|---|
| **Live** | Analysis data is loaded |
| `N files` | Total files in current analysis |
| `N issues` | Architecture issues detected |
| `N security` | Security findings count |
| `N functions` | Total functions parsed |
| `N LOC` | Total lines of code |
| **WebGL active** | 3D graph view is on, GPU rendering in use |
| **⚡ Performance mode** | Repo has >300 files; some lightweight rendering trade-offs active |
| **Scanning deps…** | OSV dependency vulnerability scan is running in background |
| **N CVEs** | Number of CVEs found in dependencies — click to open VAPT |

---

### SECTION 7 — Advanced Analysis Features

#### OSV Dependency Scan

Automatically runs in the background when a repo is loaded. Reads `package.json` (Node.js), `requirements.txt` / `pyproject.toml` (Python), `Cargo.toml` (Rust), `composer.json` (PHP), `go.mod` (Go), and other dependency files. Sends package names and versions to the **OSV.dev** public API to check against all known CVEs. Results appear as a CVE count in the status bar and in the VAPT report.

#### Entropy Scanner

Every string literal in the source code that is 20+ characters long is checked for **Shannon entropy** (a measure of randomness). Strings with entropy ≥ 4.5 bits/char are flagged as probable secrets — API keys, tokens, passwords — even if they don't match any keyword pattern. This catches secrets that developers tried to obscure.

#### Code Duplication Detector

Functions across all files are tokenised and fingerprinted using a shingling algorithm. Pairs with similarity above the threshold are reported. The drilldown shows:
- Side-by-side line diff with red/green highlighting
- Similarity percentage bar
- Numbered refactor guide (e.g. "Extract to shared utility, update both callers")

#### Import Path Resolution

For non-JavaScript languages, Arcflow resolves import strings to actual file nodes so the dependency graph is accurate:

| Language | Resolution method |
|---|---|
| **Python** | Relative imports (`from . import x`) + absolute imports matched to source root |
| **Go** | `go.mod` module name stripped; remaining path matched to file |
| **Java / Kotlin / Scala** | Source root auto-detected; `com.example.utils.Helper` → `src/utils/Helper.java` |
| **C#** | Dot-notation converted to slash path |
| **Rust** | `crate::` prefix resolved to crate root |

#### Terraform + Solidity Support

`.tf` / `.tfvars` files are parsed for `resource`, `module`, `variable`, `output`, `data`, and `provider` blocks. Module `source=` paths create edges in the dependency graph.

`.sol` (Solidity) files are parsed for `contract`, `function`, `modifier`, and `event` declarations. Solidity `import` statements create edges.

#### License Scanner

Reads the `license` field from `package.json`, `Cargo.toml`, `composer.json`, and `pyproject.toml`. Also scans `LICENSE` and `COPYING` files. Flags risky licenses in the VAPT report:
- **GPL / AGPL** → High risk (copyleft: may require your code to be open-sourced)
- **LGPL** → Medium risk (weaker copyleft)
- **MIT / Apache / BSD** → Permissive (OK for commercial use)

#### SBOM — Software Bill of Materials

Exports a **CycloneDX 1.4 JSON** file listing every dependency detected in the project with its name, version, and any associated CVEs. This is the format required for SOC 2 audits and software supply chain compliance reports.

#### SARIF Export

**SARIF 2.1.0** (Static Analysis Results Interchange Format) — the format GitHub Code Scanning accepts. Upload the `.sarif` file to your GitHub repository's Security tab to see all Arcflow findings as inline annotations directly on your code, with severity labels and remediation steps.

---

## Abbreviations & Glossary

| Term | Stands for | Plain explanation |
|---|---|---|
| **LOC** | Lines of Code | Number of code lines in a file (blank lines and comments not counted) |
| **CC** | Cyclomatic Complexity | How many different execution paths exist through a function. 1–5 = simple, 6–10 = moderate, 11–20 = complex, 21+ = critical. Calculated by counting decision points: `if`, `else`, `for`, `while`, `switch`, `catch`, `&&`, `\|\|` |
| **Cog CC** | Cognitive Complexity | Like CC but adds a penalty for nesting depth. A triple-nested `if` is much harder to read than three flat checks even if the CC score is equal. Shows only when it is higher than CC. Created by SonarQube. |
| **MI** | Maintainability Index | Industry-standard 0–100 score. Formula: `171 − 5.2×ln(HV) − 0.23×CC − 16.2×ln(LOC)`. ≥85 = green, ≥65 = yellow, <65 = red |
| **HV** | Halstead Volume | A measure of the vocabulary of a function: how many unique operators (`+`, `=`, `if`…) and operands (variable names, literals) it uses. Part of the MI formula. |
| **I** | Instability | Martin's metric: how free a file is to change. `I = outgoing imports / (outgoing + incoming)`. 0 = rigid (everything depends on it). 1 = free (nothing depends on it). |
| **A** | Abstractness | Martin's metric: how abstract vs concrete a file is. `A = abstract functions / total functions`. 0 = all concrete implementation. 1 = pure interface. |
| **D** | Distance from Main Sequence | Martin's metric: `D = \|A + I − 1\|`. How far a file is from the ideal balance. 0 = ideal. Higher = either in the Zone of Pain or Zone of Uselessness. |
| **Ca** | Afferent Coupling | How many other files import this file (incoming dependencies). High = this file is a hotspot. |
| **Ce** | Efferent Coupling | How many other files this file imports (outgoing dependencies). High = this file depends on too many things. |
| **SCC** | Strongly Connected Component | A group of files where every file can reach every other file through import chains. Used to detect circular dependency groups. Detected with Tarjan's algorithm. |
| **VAPT** | Vulnerability Assessment & Penetration Testing | A security review process. "Assessment" = finding weaknesses in the code. Used here as the name for the security dashboard. |
| **OWASP** | Open Web Application Security Project | A nonprofit that publishes the "Top 10" most dangerous web vulnerability categories, updated every few years. |
| **OWASP Top 10** | — | The 10 most critical web security risk categories: A01 Broken Access Control · A02 Cryptographic Failures · A03 Injection · A04 Insecure Design · A05 Security Misconfiguration · A06 Vulnerable Components · A07 Authentication Failures · A08 Software Integrity Failures · A09 Logging Failures · A10 SSRF |
| **CWE** | Common Weakness Enumeration | A numbered catalogue of software weakness types. e.g. CWE-89 = SQL Injection, CWE-798 = Hardcoded Credentials. Maintained by MITRE. |
| **CVE** | Common Vulnerabilities and Exposures | A specific known vulnerability in a specific version of a software package. Format: `CVE-YEAR-NUMBER`. |
| **CVSS** | Common Vulnerability Scoring System | A 0–10 numeric score for the severity of a CVE. 0–3.9 Low · 4–6.9 Medium · 7–8.9 High · 9–10 Critical. |
| **OSV** | Open Source Vulnerabilities | An open database at osv.dev listing CVEs in open-source packages. Arcflow queries it automatically. |
| **SBOM** | Software Bill of Materials | A list of every open-source library your project uses, their versions, and their known CVEs. Required for SOC 2 audits and US government software procurement. |
| **CycloneDX** | — | An open SBOM standard. Arcflow exports CycloneDX 1.4 JSON. |
| **SARIF** | Static Analysis Results Interchange Format | A JSON format for reporting code analysis findings. GitHub Code Scanning accepts SARIF files and shows findings as PR annotations. |
| **PR** | Pull Request | A proposal to merge code changes. GitHub, GitLab, and Bitbucket use this terminology. |
| **JWT** | JSON Web Token | A compact signed string used to prove identity in APIs. Looks like `eyJ...`. If found hardcoded in source code it is a critical security leak. |
| **PEM** | Privacy Enhanced Mail | A base64 file format for cryptographic keys and certificates. A `-----BEGIN PRIVATE KEY-----` in source code is a critical secret leak. |
| **XSS** | Cross-Site Scripting | An attack where malicious JavaScript is injected into a web page and runs in another user's browser. |
| **SQL Injection / SQLi** | — | An attack where a user inserts SQL commands into an input field to read or corrupt the database. Caused by building SQL queries with string concatenation. |
| **SSRF** | Server-Side Request Forgery | An attack where the server is tricked into making HTTP requests to internal systems on behalf of the attacker. |
| **RCE** | Remote Code Execution | The most severe class of vulnerability — an attacker can run arbitrary code on the server. Caused by `eval()`, unsafe deserialization, or command injection. |
| **CORS** | Cross-Origin Resource Sharing | A browser security rule controlling which websites can call your API. Misconfigured CORS can let malicious sites read your data. |
| **PAT** | Personal Access Token | A secret string from GitHub that grants API access on your behalf. Used to analyse private repos. Never commit this to source code. |
| **API** | Application Programming Interface | A set of URL endpoints that programs use to talk to each other. The Routes modal lists all detected API endpoints. |
| **WebGL** | Web Graphics Library | The browser's 3D GPU rendering engine. Used by the 3D graph view. |
| **SOC 2** | Service Organization Control 2 | A security compliance audit standard. The SBOM and SARIF exports help satisfy its software supply chain requirements. |
| **SCA** | Software Composition Analysis | Scanning your dependencies for known vulnerabilities. What the OSV scan does. |
| **AST** | Abstract Syntax Tree | The tree structure that a parser builds from source code. Arcflow uses Acorn (JS) and web-tree-sitter (other languages) to build ASTs for function and import extraction. |
| **Entropy** | Shannon Entropy | A measure of randomness in a string. High-entropy strings (≥4.5 bits/char) look like random keys or tokens. Used to detect secrets without keywords. |
| **In-degree** | — | How many other files import this file. High in-degree = hot path / critical dependency. |
| **Out-degree** | — | How many other files this file imports. High out-degree = high coupling. |

---

## License

MIT — see [LICENSE](LICENSE) for the full text.

Free to use, modify, and distribute for any purpose, commercial or personal. The only requirement is that the copyright notice is kept in copies of the software.

---

## Contributing

Arcflow is open source and contributions are welcome — from bug fixes and new language support to new visualizations and security patterns.

### How the code is organized

Before making changes, skim these files to get oriented:

| File | What it does |
|---|---|
| `js/App.js` | Root component — all state, all `useEffect` hooks, passes props down |
| `js/analysis/graph-builder.js` | Takes raw parsed files → builds the `data` object the whole UI reads from |
| `js/analysis/parser-*.js` | Language parsing, security scanning, route detection, etc. |
| `js/components/right-panel.js` | The largest UI file — all right-panel tabs |
| `js/renderers/renderer-*.js` | One file per visualization type |

### Ground rules for this codebase

- **No build step** — everything is vanilla ES5 JavaScript that runs directly in the browser. No JSX compilation, no TypeScript, no bundler. Keep it that way.
- **No arrow functions, no template literals** — the codebase uses `function(){}` and string concatenation consistently. Match this style so the code stays uniform.
- **No new CDN links** — if a feature needs a library, download it to `vendor/` and reference it locally. The app must stay fully offline.
- **Minimal impact** — touch only the files your feature needs. Don't refactor unrelated code in the same PR.
- **Test manually** — there is no test suite. Load a real GitHub repo (e.g. `facebook/react` or `django/django`) and confirm your change works end-to-end before submitting.

### How to contribute

1. **Fork** the repo on GitHub (click "Fork" top-right)

2. **Clone your fork** locally:
   ```
   git clone https://github.com/YOUR_USERNAME/Arcflow.git
   cd Arcflow
   ```

3. **Create a branch** for your change:
   ```
   git checkout -b feature/my-feature-name
   ```

4. **Make your changes** — edit the files directly, no install needed

5. **Test it** — open the app via Live Server or `start.bat`, analyze a real repo, verify your feature works and nothing else broke

6. **Commit and push**:
   ```
   git add js/the-file-you-changed.js
   git commit -m "add: brief description of what you added"
   git push origin feature/my-feature-name
   ```

7. **Open a Pull Request** on GitHub — describe what you changed and why, and mention which repo you tested against

### Good first issues to tackle

- **New language support** — add parsing rules in `js/analysis/parser-languages.js` for a language not yet covered (Swift, Ruby, Dart, Lua, etc.)
- **New security patterns** — add regex patterns in `js/analysis/parser-security.js` for secret types not yet detected
- **New framework routes** — add route detection in `js/analysis/parser-routes.js` for a web framework not yet supported
- **UI polish** — improve the layout, add tooltips, fix edge cases in any of the visualization renderers
- **Bug fixes** — open an issue describing the bug (which repo triggered it, what happened, what you expected)

### Reporting bugs

Open a GitHub Issue and include:
- The repo URL you were analysing (or describe the file structure if private)
- What you expected to happen
- What actually happened
- Your browser name and version

### Suggesting features

Open a GitHub Issue with the `enhancement` label. Describe the feature, which problem it solves, and roughly where in the UI it would live.

---

## Privacy

- **No code is ever uploaded.** Everything runs in your browser tab.
- **GitHub API calls** go directly from your browser to `api.github.com` — no proxy.
- **OSV API calls** go directly from your browser to `api.osv.dev` — only package names and versions are sent, never source code.
- **Your GitHub token (PAT)** is held in browser memory for the session only and is sent exclusively to `api.github.com`.

---

## What's Bundled (Offline)

```
Arcflow/
├── index.html                    ← open this via Live Server or start.bat
├── start.bat                     ← double-click to run (requires Node.js)
│
├── vendor/                       ← all JS libraries (no internet needed)
│   ├── react.production.min.js           React 18.2
│   ├── react-dom.production.min.js       React DOM 18.2
│   ├── d3.min.js                         D3.js 7.8 (all visualizations)
│   ├── d3-sankey.min.js                  Sankey / flow diagram
│   ├── acorn.min.js                      JavaScript AST parser
│   ├── jsrsasign-all-min.js              GitHub App JWT signing
│   ├── jszip.min.js                      ZIP archive reading
│   ├── jspdf.umd.min.js                  PDF export
│   ├── mermaid.min.js                    Architecture block diagram
│   ├── tree-sitter.js                    Multi-language syntax parser
│   └── 3d-force-graph.min.js             3D WebGL graph
│
├── fonts/                        ← Inter + JetBrains Mono (no internet needed)
│   ├── fonts.css
│   └── *.woff2                   (13 font files, all subsets)
│
├── css/                          ← app stylesheets
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── graph.css
│
└── js/                           ← all app logic (~8000 lines)
    ├── App.js                    root component + state
    ├── constants.js              colours, layer definitions
    ├── github.js                 GitHub API client
    ├── analysis/
    │   ├── parser-core.js        base parser
    │   ├── parser-patterns.js    design pattern detection
    │   ├── parser-suggestions.js refactor suggestions
    │   ├── parser-security.js    security scan + TODO collector
    │   ├── parser-extract.js     function/import/export extraction
    │   ├── parser-languages.js   language-specific rules
    │   ├── parser-routes.js      API route detection
    │   ├── parser-components.js  React/Vue component tree
    │   ├── parser-callgraph.js   function call graph
    │   ├── parser-findcalls.js   cross-file call tracing
    │   ├── graph-builder.js      wires parser → graph data
    │   ├── community-detection.js label propagation clustering
    │   ├── health.js             MI score + health grade
    │   ├── architecture-*.js     block diagram generation
    │   ├── data-loader.js        GitHub/local/ZIP loading
    │   ├── pr-risk.js            PR risk scoring
    │   └── osv-scan.js           OSV.dev CVE scanning
    ├── components/
    │   ├── topbar.js             top navigation bar
    │   ├── sidebar.js            file explorer + color-by
    │   ├── canvas.js             main visualization area
    │   ├── right-panel.js        details / insights / security
    │   ├── vapt.js               VAPT security dashboard
    │   ├── routes-modal.js       API routes map
    │   ├── component-tree-modal.js  React/Vue tree
    │   ├── modals.js             export / PR / diff modals
    │   ├── shared.js             shared UI components
    │   ├── export.js             PNG/SVG/PDF/CSV/SARIF/SBOM
    │   ├── overlays.js           modal orchestration
    │   └── graph-controls.js     zoom / fit / rotate
    └── renderers/
        ├── renderer-d3.js        force-directed graph
        ├── renderer-3d.js        WebGL 3D graph
        ├── renderer-sankey.js    Sankey flow diagram
        ├── renderer-treemap.js   treemap
        ├── renderer-matrix.js    dependency matrix
        ├── renderer-dendro.js    dendrogram tree
        ├── renderer-disjoint.js  disjoint cluster graph
        ├── renderer-bundle.js    hierarchical edge bundle
        └── renderer-chord.js     chord diagram
```

---

## Tech Stack

| Library | Version | Used for |
|---|---|---|
| React | 18.2 | All UI rendering |
| D3.js | 7.8 | Every 2D visualization |
| 3d-force-graph | 1.73 | 3D WebGL graph |
| Mermaid | 10.9 | Architecture block diagram |
| Acorn | 8.11 | JavaScript / TypeScript AST parsing |
| web-tree-sitter | 0.20 | Python, Go, Java, Rust, C#, etc. |
| JSZip | 3.10 | Reading ZIP archives |
| jsPDF | 2.5 | PDF export |
| jsrsasign | 11.1 | JWT signing for GitHub App auth |

**No build step. No npm install. No Node.js required to run.**

---

## Acknowledgments

> Inspired by **[CodeFlow](https://github.com/braedonsaunders/codeflow)** — the original idea that codebase visualization should be instant and frictionless.

Built on the shoulders of excellent open-source libraries: [React](https://react.dev), [D3.js](https://d3js.org), [Mermaid](https://mermaid.js.org), [Acorn](https://github.com/acornjs/acorn), [web-tree-sitter](https://github.com/tree-sitter/tree-sitter), [JSZip](https://stuk.github.io/jszip/), [jsPDF](https://github.com/parallax/jsPDF).

CVE data powered by [OSV.dev](https://osv.dev) — the open-source vulnerability database.

---

<div align="center">

**Arcflow** is an open-source project by **[VeloceAI.in](https://veloceai.in)**

Built for developers, security engineers, and architects who want clarity without complexity.

*If Arcflow saved you time, give it a ⭐ on [GitHub](https://github.com/Veloce-AI/Arcflow)*

</div>
