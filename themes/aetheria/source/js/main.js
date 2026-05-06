document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Command Palette (Ctrl + K) ---
    const palette = document.getElementById('command-palette');
    const paletteInput = document.getElementById('palette-input');
    const paletteResults = document.getElementById('palette-results');
    let isPaletteOpen = false;
    let terminalData = null;

    const initTerminalData = async () => {
        if (terminalData) return;
        try {
            const root = window.AETHERIA_CONFIG?.root || '/';
            const res = await fetch(root + 'search.json');
            terminalData = await res.json();
        } catch(e) { terminalData = []; }
    };

    const addResult = (text, cls = '') => {
        if (!paletteResults) return;
        const line = document.createElement('div');
        line.className = 'palette-result-line' + (cls ? ' ' + cls : '');
        line.textContent = text;
        paletteResults.appendChild(line);
        paletteResults.scrollTop = paletteResults.scrollHeight;
    };

    const clearResults = () => {
        if (paletteResults) paletteResults.innerHTML = '';
    };

    const openPalette = () => {
        if (!palette) return;
        palette.classList.add('active');
        isPaletteOpen = true;
        clearResults();
        if (paletteInput) {
            paletteInput.value = '';
            setTimeout(() => paletteInput.focus(), 50);
        }
        initTerminalData();
        handlePaletteCommand('help');
    };

    const closePalette = () => {
        if (!palette) return;
        palette.classList.remove('active');
        isPaletteOpen = false;
    };

    // Ctrl + K to toggle, Esc to close
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            if (isPaletteOpen) closePalette();
            else openPalette();
        }
        if (e.key === 'Escape' && isPaletteOpen) {
            closePalette();
        }
    });

    // Click backdrop to close
    if (palette) {
        palette.querySelector('.palette-backdrop')?.addEventListener('click', closePalette);
    }

    // Handle command on Enter
    if (paletteInput) {
        paletteInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = paletteInput.value.trim().toLowerCase();
                paletteInput.value = '';
                if (!cmd) return;
                handlePaletteCommand(cmd);
            }
        });
    }

    // --- Persistent State Loading ---
    const savedTheme = localStorage.getItem('aetheria_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    const savedRetro = localStorage.getItem('aetheria_retro');
    if (savedRetro) {
        document.documentElement.setAttribute('data-retro', savedRetro);
    }

    const dnaActive = localStorage.getItem('aetheria_dna_active');
    if (dnaActive === 'false') {
        const dna = document.getElementById('post-dna-canvas');
        if (dna) dna.style.display = 'none';
    }

    if (localStorage.getItem('aetheria_emp_active') === 'true') {
        document.documentElement.setAttribute('data-emp', 'true');
    }

    if (localStorage.getItem('aetheria_zen_active') === 'true') {
        document.documentElement.setAttribute('data-zen', 'true');
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                const isExpanded = navLinks.classList.contains('active');
                icon.setAttribute('data-lucide', isExpanded ? 'x' : 'menu');
                if (window.lucide) window.lucide.createIcons();
            }
        });
        
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });
    }

    const savedAccent = localStorage.getItem('aetheria_accent');
    if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent);
    const savedBorder = localStorage.getItem('aetheria_border');
    if (savedBorder) document.documentElement.style.setProperty('--border-width', savedBorder + 'px');
    const savedShadow = localStorage.getItem('aetheria_shadow');
    if (savedShadow) document.documentElement.style.setProperty('--shadow-offset', savedShadow + 'px');

    const matrixActive = localStorage.getItem('aetheria_matrix_active');
    if (matrixActive === 'true') {
        setTimeout(startMatrixRain, 500);
    }

    const getAliases = () => JSON.parse(localStorage.getItem('aetheria_aliases') || '{}');
    const saveAliases = (aliases) => localStorage.setItem('aetheria_aliases', JSON.stringify(aliases));

    const handlePaletteCommand = (cmd) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        const args = trimmedCmd.split(' ');
        const base = args[0].toLowerCase();

        // 1. Alias Execution (Highest Priority)
        const aliases = getAliases();
        if (aliases[base] && !trimmedCmd.includes('=')) {
            const chain = aliases[base].split('+');
            addResult(`EXECUTING ALIAS: ${base.toUpperCase()}`, 'info');
            chain.forEach(subCmd => {
                if (subCmd.trim().toLowerCase() !== base) {
                    handlePaletteCommand(subCmd.trim());
                }
            });
            return;
        }

        // 2. Specialized Command Parsing (Alias Definition)
        if (base === 'alias' && trimmedCmd.includes('=')) {
            const parts = trimmedCmd.substring(6).split('=');
            if (parts.length === 2) {
                const aliasName = parts[0].trim().toLowerCase();
                const commands = parts[1].trim();
                const currentAliases = getAliases();
                currentAliases[aliasName] = commands;
                saveAliases(currentAliases);
                addResult(`ALIAS REGISTERED: ${aliasName.toUpperCase()} -> ${commands.toUpperCase()}`, 'success');
                return;
            }
        }

        // 3. Main Command Switch
        const themes = ['neon', 'hacker', 'print', 'sepia', 'wireframe', 'dark', 'light'];
        if (themes.includes(base)) {
            applyHackerTheme(base);
            addResult(`SYSTEM THEME SET TO: ${base.toUpperCase()}`, 'success');
            setTimeout(closePalette, 800);
            return;
        }

        clearResults();

        switch(base) {
            case 'help':
                const helpHTML = `
                    <div class="help-section">
                        <div class="help-tag yellow">
                            <i data-lucide="palette"></i>
                            <span>🎨 持久化主题 (THEMES)</span>
                        </div>
                        <div class="help-grid">
                            ${themes.map(t => `
                                <div class="help-item" onclick="document.getElementById('palette-input').value='${t}'; handlePaletteCommand('${t}')">
                                    <span class="help-cmd">${t}</span>
                                    <span class="help-desc">${t === 'neon' ? '赛博朋克霓虹' : t === 'hacker' ? '极客终端' : t === 'print' ? '点阵打印' : t === 'sepia' ? '羊皮艺术' : t === 'wireframe' ? '线框视界' : t === 'dark' ? '深夜模式' : '默认明亮'}</span>
                                </div>
                            `).join('')}
                            <div class="help-item" onclick="document.getElementById('palette-input').value='reset'; handlePaletteCommand('reset')">
                                <span class="help-cmd">reset</span>
                                <span class="help-desc">恢复出厂设置</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <div class="help-tag pink">
                            <i data-lucide="zap"></i>
                            <span>💥 视觉特效 (EFFECTS)</span>
                        </div>
                        <div class="help-grid">
                            <div class="help-item" onclick="document.getElementById('palette-input').value='matrix'; handlePaletteCommand('matrix')">
                                <span class="help-cmd">matrix</span> <span class="help-desc">黑客数字雨</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='gravity'; handlePaletteCommand('gravity')">
                                <span class="help-cmd">gravity</span> <span class="help-desc">重力崩塌</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='graph'; handlePaletteCommand('graph')">
                                <span class="help-cmd">graph</span> <span class="help-desc">知识图谱</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='hack'; handlePaletteCommand('hack')">
                                <span class="help-cmd">hack</span> <span class="help-desc">乱码解密</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='emp'; handlePaletteCommand('emp')">
                                <span class="help-cmd">emp</span> <span class="help-desc">应急模式 (持久化)</span>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <div class="help-tag blue" style="background: #00d2ff; color: #fff !important;">
                            <i data-lucide="brain"></i>
                            <span>🧠 智能 & DNA (AI)</span>
                        </div>
                        <div class="help-grid">
                            <div class="help-item" onclick="document.getElementById('palette-input').value='dna'; handlePaletteCommand('dna')">
                                <span class="help-cmd">dna</span> <span class="help-desc">视觉 DNA 开关</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='garden'; handlePaletteCommand('garden')">
                                <span class="help-cmd">garden</span> <span class="help-desc">知识生长树</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='zen'; handlePaletteCommand('zen')">
                                <span class="help-cmd">zen</span> <span class="help-desc">沉浸阅读模式</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='style'; handlePaletteCommand('style')">
                                <span class="help-cmd">style</span> <span class="help-desc">UI 样式自定义</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='cite'; handlePaletteCommand('cite')">
                                <span class="help-cmd">cite</span> <span class="help-desc">自动生成引用</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='log'; handlePaletteCommand('log')">
                                <span class="help-cmd">log</span> <span class="help-desc">导出任务简报</span>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <div class="help-tag yellow" style="background: #ff00ff; color: #fff !important;">
                            <i data-lucide="history"></i>
                            <span>🕰️ 时空回溯 (RETRO)</span>
                        </div>
                        <div class="help-grid">
                            <div class="help-item" onclick="document.getElementById('palette-input').value='retro 1995'; handlePaletteCommand('retro 1995')">
                                <span class="help-cmd">retro 1995</span> <span class="help-desc">Netscape 时代</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='retro 1980'; handlePaletteCommand('retro 1980')">
                                <span class="help-cmd">retro 1980</span> <span class="help-desc">绿色终端时代</span>
                            </div>
                            <div class="help-item" onclick="document.getElementById('palette-input').value='modern'; handlePaletteCommand('modern')">
                                <span class="help-cmd">modern</span> <span class="help-desc">返回现代</span>
                            </div>
                        </div>
                    </div>

                    <div class="palette-footer">
                        <button class="palette-close-btn" id="palette-manual-close">关闭 (CLOSE)</button>
                    </div>
                `;
                if (paletteResults) {
                    paletteResults.innerHTML = helpHTML;
                    document.getElementById('palette-manual-close')?.addEventListener('click', closePalette);
                    if (window.lucide) window.lucide.createIcons();
                }
                break;

            case 'emp':
                const isEMP = document.documentElement.getAttribute('data-emp') === 'true';
                if (!isEMP) {
                    const flash = document.createElement('div');
                    flash.className = 'emp-active-flash';
                    document.body.appendChild(flash);
                    setTimeout(() => {
                        flash.remove();
                        document.documentElement.setAttribute('data-emp', 'true');
                        localStorage.setItem('aetheria_emp_active', 'true');
                        addResult('CRITICAL: EMP DEPLOYED. ALL SYSTEMS MINIMAL.', 'error');
                    }, 800);
                } else {
                    document.documentElement.removeAttribute('data-emp');
                    localStorage.removeItem('aetheria_emp_active');
                    addResult('RESTORING SYSTEMS... EMP DEACTIVATED.', 'success');
                }
                setTimeout(closePalette, 1200);
                break;
            case 'zen':
                const isZen = document.documentElement.getAttribute('data-zen') === 'true';
                document.documentElement.setAttribute('data-zen', !isZen);
                localStorage.setItem('aetheria_zen_active', !isZen);
                addResult(`ZEN MODE: ${!isZen ? 'ACTIVATED' : 'DEACTIVATED'}`, 'success');
                setTimeout(closePalette, 800);
                break;
            case 'style':
                showStyleCustomizer();
                closePalette();
                break;
            case 'cite':
                const citation = `[${document.title}](${window.location.href}) - Aetheria Blog`;
                addResult('CITATION GENERATED:', 'info');
                addResult(citation, 'success');
                navigator.clipboard.writeText(citation).then(() => addResult('(COPIED TO CLIPBOARD)', 'info'));
                break;
            case 'garden':
                showGenerativeGarden();
                closePalette();
                break;
            case 'reset':
            case 'reboot':
                localStorage.clear();
                location.reload();
                break;
            case 'log':
                generateLog();
                break;
            case 'graph':
                showKnowledgeGraph();
                closePalette();
                break;
            case 'gravity':
                runGravity();
                closePalette();
                break;
            case 'matrix':
                localStorage.setItem('aetheria_matrix_active', 'true');
                startMatrixRain();
                closePalette();
                break;
            case 'hack':
                runHackerDecryption();
                closePalette();
                break;
            case 'retro':
                const year = args[1] || '1995';
                document.documentElement.setAttribute('data-retro', year);
                localStorage.setItem('aetheria_retro', year);
                addResult(`RETRO REGRESSION: ${year} MODE ACTIVE.`, 'success');
                setTimeout(closePalette, 800);
                break;
            case 'modern':
                document.documentElement.removeAttribute('data-retro');
                localStorage.removeItem('aetheria_retro');
                addResult('BACK TO THE FUTURE: MODERN MODE ACTIVE.', 'success');
                setTimeout(closePalette, 800);
                break;
            case 'dna':
                const dna = document.getElementById('post-dna-canvas');
                if (dna) {
                    const isVisible = dna.style.display !== 'none';
                    dna.style.display = isVisible ? 'none' : 'block';
                    localStorage.setItem('aetheria_dna_active', !isVisible);
                    addResult(`VISUAL DNA: ${isVisible ? 'OFF' : 'ON'}`, 'success');
                } else {
                    addResult('DNA ONLY AVAILABLE ON POST PAGES', 'error');
                }
                setTimeout(closePalette, 800);
                break;
            case 'alias':
                const allAliases = getAliases();
                const keys = Object.keys(allAliases);
                if (keys.length === 0) addResult('NO ALIASES DEFINED.', 'info');
                else keys.forEach(k => addResult(`${k.toUpperCase()} -> ${allAliases[k].toUpperCase()}`));
                break;
            case 'unalias':
                if (args[1]) {
                    const aliases = getAliases();
                    delete aliases[args[1]];
                    saveAliases(aliases);
                    addResult(`REMOVED ALIAS: ${args[1]}`, 'success');
                }
                break;
            case 'exit':
                localStorage.removeItem('aetheria_matrix_active');
                location.reload();
                break;
            default:
                addResult(`UNKNOWN COMMAND: ${base}`, 'error');
        }
    };

    // --- Effect Implementations ---
    function siteBurn() {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(255, 50, 0, 0.2)', mixBlendMode: 'color-burn',
            zIndex: '10000000', pointerEvents: 'none', animation: 'burnPulse 0.5s infinite alternate'
        });
        document.body.appendChild(overlay);
        document.body.style.filter = 'blur(1px) contrast(200%)';
        const style = document.createElement('style');
        style.innerHTML = `@keyframes burnPulse { from { opacity: 0.5; } to { opacity: 0.8; } }`;
        document.head.appendChild(style);
        setTimeout(() => location.reload(), 3000);
    }

    function runEMP() {
        document.body.style.transition = 'none';
        let count = 0;
        const interval = setInterval(() => {
            document.body.style.filter = count % 2 === 0 ? 'invert(1) grayscale(1)' : 'none';
            document.body.style.opacity = Math.random() > 0.5 ? '0.8' : '1';
            count++;
            if (count > 20) {
                clearInterval(interval);
                document.body.style.filter = 'grayscale(1)';
                document.body.style.opacity = '1';
                addResult('SYSTEM EMP DISCHARGE COMPLETE.', '#aaa');
            }
        }, 50);
    }

    function runGlitch() {
        const style = document.createElement('style');
        style.id = 'glitch-style';
        style.innerHTML = `
            @keyframes glitchAnim {
                0% { clip-path: inset(10% 0 30% 0); transform: translate(-5px, 5px); }
                20% { clip-path: inset(40% 0 10% 0); transform: translate(10px, -5px); }
                40% { clip-path: inset(20% 0 50% 0); transform: translate(-10px, 10px); }
                60% { clip-path: inset(80% 0 5% 0); transform: translate(5px, -10px); }
                80% { clip-path: inset(10% 0 70% 0); transform: translate(-5px, 5px); }
                100% { clip-path: inset(30% 0 20% 0); transform: translate(10px, 5px); }
            }
            body { animation: glitchAnim 0.2s infinite alternate-reverse; filter: hue-rotate(90deg); }
        `;
        document.head.appendChild(style);
        setTimeout(() => { style.remove(); document.body.style.filter = ''; }, 2000);
    }

    function applyHackerTheme(theme) {
        localStorage.setItem('aetheria_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Remove any old hacker theme style tag if it exists
        document.getElementById('hacker-theme-overrides')?.remove();
    }

    function startMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        Object.assign(canvas.style, {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: '10000000', pointerEvents: 'none', opacity: '1'
        });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        
        // Initial solid black background to hide content immediately
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]';
        const fontSize = 16;
        const columns = w / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Deepened fade for better contrast
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        const interval = setInterval(draw, 33);
        window.matrixInterval = interval;
    }

    function runHackerDecryption() {
        const elements = document.querySelectorAll('h1, h2, h3, p, span, a');
        elements.forEach(el => {
            if (el.children.length > 0) return;
            const originalText = el.textContent;
            const chars = '░▒▓█<>[]{}+-*/=%#&_';
            let iterations = 0;
            const interval = setInterval(() => {
                el.textContent = originalText.split('').map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
                iterations += 1/3;
                if (iterations >= originalText.length) clearInterval(interval);
            }, 30);
        });
    }

    let isZeroG = false;
    function toggleZeroG() {
        isZeroG = !isZeroG;
        const elements = document.querySelectorAll('.post-card, .btn, .sticker, h1, .header-inner');
        elements.forEach((el, i) => {
            if (isZeroG) {
                el.style.transition = 'transform 10s ease-in-out';
                const rx = (Math.random() - 0.5) * 200;
                const ry = (Math.random() - 0.5) * 200;
                const rot = (Math.random() - 0.5) * 45;
                el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg)`;
            } else {
                el.style.transform = '';
            }
        });
    }

    function siteExplode() {
        const elements = document.querySelectorAll('.post-card, .btn, .sticker, h1, p, img');
        elements.forEach(el => {
            el.style.transition = 'all 0.8s cubic-bezier(0.1, 0, 0.3, 1)';
            const rx = (Math.random() - 0.5) * 2000;
            const ry = (Math.random() - 0.5) * 2000;
            const rot = (Math.random() - 0.5) * 1000;
            el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg) scale(0)`;
            el.style.opacity = '0';
        });
        setTimeout(() => location.reload(), 1500);
    }

    function showGenerativeGarden() {
        if (!terminalData || terminalData.length === 0) {
            initTerminalData().then(showGenerativeGarden);
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'garden-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.95)', zIndex: '20000000', cursor: 'crosshair',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        });

        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        overlay.appendChild(canvas);
        
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '× EXIT GARDEN';
        closeBtn.style.cssText = 'position:fixed; top:20px; right:20px; color:#fff; font-family:monospace; cursor:pointer; border:1px solid #fff; padding:5px 10px; z-index:100;';
        closeBtn.onclick = () => overlay.remove();
        overlay.appendChild(closeBtn);

        document.body.appendChild(overlay);
        const ctx = canvas.getContext('2d');

        function drawBranch(x, y, len, angle, branchWidth, depth) {
            ctx.beginPath();
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - depth/8})`;
            ctx.lineWidth = branchWidth;
            ctx.translate(x, y);
            ctx.rotate(angle * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -len);
            ctx.stroke();

            if (depth < 7) {
                if (depth > 4) {
                    ctx.fillStyle = `hsla(${depth * 40}, 70%, 60%, 0.6)`;
                    ctx.beginPath();
                    ctx.arc(0, -len, 3 + Math.random()*2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                drawBranch(0, -len, len * 0.75, angle + (15 + Math.random()*15), branchWidth * 0.7, depth + 1);
                drawBranch(0, -len, len * 0.75, angle - (15 + Math.random()*15), branchWidth * 0.7, depth + 1);
            }
            ctx.restore();
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBranch(canvas.width / 2, canvas.height - 50, 150, 0, 12, 0);
            
            ctx.fillStyle = '#fff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("DIGITAL GARDEN: THE EVOLUTION OF THOUGHT", canvas.width/2, 40);
            ctx.fillText("EVERY LEAF IS AN ARTICLE. EVERY BRANCH A CATEGORY.", canvas.width/2, 60);
        };
        render();
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; render(); });
    }

    function showStyleCustomizer() {
        let modal = document.getElementById('style-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'style-modal';
            modal.innerHTML = `
                <div style="margin-bottom:20px; font-weight:bold; border-bottom:2px solid #000; padding-bottom:10px;">🎨 STYLE CUSTOMIZER</div>
                <div class="style-row">
                    <label>ACCENT COLOR</label>
                    <input type="color" id="style-accent" value="${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff0055'}">
                </div>
                <div class="style-row">
                    <label>BORDER THICKNESS</label>
                    <input type="range" id="style-border" min="0" max="10" value="${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-width')) || 3}">
                </div>
                <div class="style-row">
                    <label>SHADOW OFFSET</label>
                    <input type="range" id="style-shadow" min="0" max="20" value="${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--shadow-offset')) || 8}">
                </div>
                <div class="style-modal-footer">
                    <button class="btn" id="style-close" style="padding:5px 15px;">CLOSE</button>
                    <button class="btn" id="style-reset" style="background:#eee; padding:5px 15px;">RESET</button>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('style-accent').oninput = (e) => {
                document.documentElement.style.setProperty('--accent', e.target.value);
                localStorage.setItem('aetheria_accent', e.target.value);
            };
            document.getElementById('style-border').oninput = (e) => {
                document.documentElement.style.setProperty('--border-width', e.target.value + 'px');
                localStorage.setItem('aetheria_border', e.target.value);
            };
            document.getElementById('style-shadow').oninput = (e) => {
                document.documentElement.style.setProperty('--shadow-offset', e.target.value + 'px');
                localStorage.setItem('aetheria_shadow', e.target.value);
            };
            document.getElementById('style-close').onclick = () => modal.classList.remove('active');
            document.getElementById('style-reset').onclick = () => {
                localStorage.removeItem('aetheria_accent');
                localStorage.removeItem('aetheria_border');
                localStorage.removeItem('aetheria_shadow');
                location.reload();
            };
        }
        modal.classList.add('active');
    }



    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    const navFavorites = document.getElementById('nav-favorites');
    const shareBtn = document.getElementById('share-post');
    const bookmarkBtn = document.getElementById('bookmark-post');
    const postId = window.location.pathname;
    const postTitle = document.querySelector('.post-header .title')?.innerText || "Untitled Post";

    // --- Helpers ---
    const getFavorites = () => JSON.parse(localStorage.getItem('aetheria_favs') || '[]');
    const saveFavorites = (favs) => localStorage.setItem('aetheria_favs', JSON.stringify(favs));
    
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast glass ${type}`;
        toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i><span>${message}</span>`;
        document.body.appendChild(toast);
        if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 2 } });
        setTimeout(() => toast.classList.add('active'), 10);
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 600);
        }, 3000);
    };

    // --- Force Light Theme ---
    body.setAttribute('data-theme', 'light');

    // --- Custom Cursor & Touch Support ---
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        body.classList.add('is-touch');
    } else {
        body.style.cursor = 'none';
        let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, outlineX = 0, outlineY = 0;
        window.addEventListener('mousemove', (e) => { 
            mouseX = e.clientX; 
            mouseY = e.clientY; 
        });

        // Click effect
        window.addEventListener('mousedown', () => {
            if (cursorOutline) cursorOutline.style.transform += ' scale(0.8)';
            if (cursorDot) cursorDot.style.transform += ' scale(1.5)';
        });
        window.addEventListener('mouseup', () => {
            if (cursorOutline) cursorOutline.style.transform = cursorOutline.style.transform.replace(' scale(0.8)', '');
            if (cursorDot) cursorDot.style.transform = cursorDot.style.transform.replace(' scale(1.5)', '');
        });

        const animateCursor = () => {
            // Dot follows almost instantly
            dotX += (mouseX - dotX) * 0.4; 
            dotY += (mouseY - dotY) * 0.4;
            // Outline trails behind smoothly
            outlineX += (mouseX - outlineX) * 0.15; 
            outlineY += (mouseY - outlineY) * 0.15;

            if (cursorDot) cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
            if (cursorOutline) {
                const isHover = body.classList.contains('cursor-hover');
                const isCard = body.classList.contains('cursor-card');
                const offset = isHover ? 30 : 20;
                cursorOutline.style.transform = `translate(${outlineX - offset}px, ${outlineY - offset}px)`;
                
                if (isCard) {
                    cursorOutline.classList.add('is-card');
                    cursorOutline.innerHTML = '<span class="cursor-text">VIEW</span>';
                } else {
                    cursorOutline.classList.remove('is-card');
                    cursorOutline.innerHTML = '';
                }
            }

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // --- Grid Highlight ---
        window.addEventListener('mousemove', (e) => {
            const x = Math.round(e.clientX / 40) * 40;
            const y = Math.round(e.clientY / 40) * 40;
            const gridHighlight = document.getElementById('grid-highlight');
            if (gridHighlight) {
                gridHighlight.style.transform = `translate(${x}px, ${y}px)`;
            }
        });

        const updateHoverState = () => {
            document.querySelectorAll('a, button, .feature-card, .btn, .action-btn, .tag-link, .cloud-tag, .copy-btn, #theme-toggle').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    body.classList.add('cursor-hover');
                    if (el.classList.contains('feature-card')) body.classList.add('cursor-card');
                });
                el.addEventListener('mouseleave', () => {
                    body.classList.remove('cursor-hover');
                    body.classList.remove('cursor-card');
                });
            });
        };

        const onMouseEnter = () => body.classList.add('cursor-hover');
        const onMouseLeave = () => body.classList.remove('cursor-hover');

        updateHoverState();
        // Re-apply for dynamic elements
        const observer = new MutationObserver(updateHoverState);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- Scroll Features ---
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (progressBar) progressBar.style.width = (winScroll / height) * 100 + "%";
        
        const navbar = document.querySelector('#navbar');
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Reveal Observer with pixel-drift staggered effect
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Inject reveal classes to post content and other key elements
    document.querySelectorAll('.feature-card, .section-head, .stat-item, .newsletter-card, .post-content > *, .archive-item').forEach((el, index) => {
        el.classList.add('pixel-reveal');
        // Staggered entry for the first few items
        if (index < 12) el.style.transitionDelay = `${index * 0.08}s`;
        revealObserver.observe(el);
    });

    // Holographic Tilt Effect for Cards
    const cards = document.querySelectorAll('.feature-card, .stat-item');
    cards.forEach(card => {
        // Create glare element
        if (!card.querySelector('.card-glare')) {
            const glare = document.createElement('div');
            glare.className = 'card-glare';
            card.appendChild(glare);
        }
        const glare = card.querySelector('.card-glare');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            
            // Move glare relative to mouse
            if (glare) {
                glare.style.left = `${x}px`;
                glare.style.top = `${y}px`;
            }

            // Internal Parallax for titles and excerpts
            const title = card.querySelector('.card-title');
            const excerpt = card.querySelector('.card-excerpt');
            if (title) title.style.transform = `translateZ(30px) translateX(${(centerX - x) / 20}px)`;
            if (excerpt) excerpt.style.transform = `translateZ(15px) translateX(${(centerX - x) / 40}px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            const title = card.querySelector('.card-title');
            const excerpt = card.querySelector('.card-excerpt');
            if (title) title.style.transform = 'translateZ(0) translateX(0)';
            if (excerpt) excerpt.style.transform = 'translateZ(0) translateX(0)';
        });
    });

    // --- Code Blocks ---
    document.querySelectorAll('.highlight').forEach(block => {
        // Wrap table for scrolling
        const table = block.querySelector('table');
        if (table) {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn'; copyBtn.innerText = 'COPY';
        block.appendChild(copyBtn);
        copyBtn.addEventListener('click', async () => {
            const code = block.querySelector('.code pre')?.innerText || block.querySelector('.code')?.innerText;
            try {
                await navigator.clipboard.writeText(code);
                copyBtn.innerText = 'COPIED!'; copyBtn.style.background = 'var(--primary)';
                setTimeout(() => { copyBtn.innerText = 'COPY'; copyBtn.style.background = ''; }, 2000);
            } catch (err) { console.error(err); }
        });

        // Auto Collapse Logic
        if (block.scrollHeight > 420) {
            const expandBtn = document.createElement('div');
            expandBtn.className = 'code-expand-btn';
            expandBtn.innerHTML = '<span>展开完整代码</span>';
            block.appendChild(expandBtn);
            
            const collapseBtn = document.createElement('div');
            collapseBtn.className = 'code-collapse-btn';
            collapseBtn.innerHTML = '<span>收起完整代码</span>';
            block.appendChild(collapseBtn);

            expandBtn.addEventListener('click', () => {
                block.classList.add('expanded');
            });

            collapseBtn.addEventListener('click', () => {
                block.classList.remove('expanded');
                // Optional: Scroll back to the top of the block
                block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    });

    // --- Back to Top ---
    const btt = document.createElement('button');
    btt.id = 'back-to-top'; btt.innerHTML = '<i data-lucide="arrow-up"></i>';
    document.body.appendChild(btt);
    window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 500));
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // --- Keyboard ESC support ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelector('#img-overlay')?.click();
            document.querySelector('.modal-overlay')?.click();
        }
    });

    // --- Image Zoom ---
    document.querySelectorAll('.post-content img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.id = 'img-overlay'; overlay.className = 'glass';
            overlay.innerHTML = `<img src="${img.src}" class="zoomed-img">`;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('active'), 10);
            overlay.addEventListener('click', () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 400);
            });
        });
    });

    // --- Favorites Logic ---
    if (bookmarkBtn) {
        const checkFav = () => bookmarkBtn.classList.toggle('active', getFavorites().some(f => f.url === postId));
        checkFav();
        bookmarkBtn.addEventListener('click', () => {
            let favs = getFavorites();
            const index = favs.findIndex(f => f.url === postId);
            if (index > -1) {
                favs.splice(index, 1);
                showToast('Removed from favorites', 'info');
            } else {
                favs.push({ url: postId, title: postTitle, date: new Date().toLocaleDateString() });
                showToast('Added to favorites!', 'success');
            }
            saveFavorites(favs);
            checkFav();
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try { await navigator.share({ title: document.title, url: window.location.href }); } catch (e) {}
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!', 'success');
            }
        });
    }

    // Magnetic Button Effect
    const magneticBtns = document.querySelectorAll('.btn-primary, .action-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    if (navFavorites) {
        navFavorites.addEventListener('click', () => {
            if (document.querySelector('.fav-modal')) return;
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            const modal = document.createElement('div');
            modal.className = 'fav-modal glass';
            
            const render = () => {
                const favs = getFavorites().filter(f => f.url && f.url !== '/' && !f.url.includes('index.html'));
                if (favs.length === 0) return `<div class="empty-fav"><div class="empty-icon-wrap"><i data-lucide="sparkles"></i></div><p>Gallery is Empty</p></div>`;
                return `
                    <div class="fav-header-actions"><span class="count">${favs.length} ARTICLES</span><button class="clear-all">Reset All</button></div>
                    <div class="fav-grid">${favs.map(f => `
                        <div class="fav-item glass" data-url="${f.url}">
                            <div class="fav-item-content" onclick="window.location.href='${f.url}'">
                                <div class="fav-icon"><i data-lucide="book"></i></div>
                                <span class="fav-item-title">${f.title}</span>
                                <span class="fav-item-date">${f.date}</span>
                            </div>
                            <button class="remove-fav"><i data-lucide="trash-2"></i></button>
                        </div>`).join('')}</div>`;
            };

            modal.innerHTML = `<div class="fav-modal-content"><div class="modal-header"><h3>THE ARCHIVE</h3></div><div id="fav-list-container">${render()}</div></div>`;
            document.body.appendChild(overlay); document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 2 } });
            setTimeout(() => { overlay.classList.add('active'); modal.classList.add('active'); }, 10);

            modal.addEventListener('click', (e) => {
                if (e.target.closest('.remove-fav')) {
                    const url = e.target.closest('.fav-item').dataset.url;
                    saveFavorites(getFavorites().filter(f => f.url !== url));
                    document.getElementById('fav-list-container').innerHTML = render();
                    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 2 } });
                    if (bookmarkBtn && url === postId) bookmarkBtn.classList.remove('active');
                }
                if (e.target.closest('.clear-all')) {
                    if (confirm('Clear library?')) {
                        saveFavorites([]);
                        document.getElementById('fav-list-container').innerHTML = render();
                        if (window.lucide) window.lucide.createIcons();
                        if (bookmarkBtn) bookmarkBtn.classList.remove('active');
                    }
                }
            });

            overlay.addEventListener('click', () => {
                overlay.classList.remove('active'); modal.classList.add('active-out');
                document.body.style.overflow = '';
                setTimeout(() => { overlay.remove(); modal.remove(); }, 500);
            });
        });
    }

    // --- Dynamic Styles ---
    const finalStyle = document.createElement('style');
    finalStyle.innerHTML = `
        .is-touch * { cursor: auto !important; }
        .toast { position: fixed; bottom: 3rem; left: 50%; transform: translateX(-50%) translateY(100px); display: flex; align-items: center; gap: 1rem; padding: 1.2rem 2.5rem; z-index: 9999; opacity: 0; transition: all 0.4s var(--cubic-bezier); background: var(--white); border: 4px solid var(--black); box-shadow: 8px 8px 0px 0px var(--black); pointer-events: none; color: var(--black); font-weight: 900; }
        .toast.active { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: auto; }
        .toast.success { border-bottom: 8px solid #27c93f; }
        .toast.info { border-bottom: 8px solid var(--primary); }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9998; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }
        .fav-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -40%); width: 90%; max-width: 800px; max-height: 80vh; background: var(--bg-card); border: var(--border-width) solid var(--text-main); box-shadow: 15px 15px 0px 0px var(--text-main); z-index: 9999; opacity: 0; transition: all 0.4s var(--cubic-bezier); pointer-events: none; overflow-y: auto; padding: 3rem; }
        .fav-modal.active { opacity: 1; transform: translate(-50%, -50%); pointer-events: auto; }
        .fav-modal-content { position: relative; }
        .modal-header { margin-bottom: 3rem; text-align: center; }
        .modal-header h3 { font-size: 2rem; letter-spacing: 0.1em; color: var(--text-main); font-weight: 900; text-transform: uppercase; }
        .fav-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: var(--border-width) solid var(--text-main); }
        .fav-header-actions .count { font-weight: 900; font-size: 0.8rem; letter-spacing: 0.05em; }
        .fav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
        .fav-item { position: relative; cursor: pointer; transition: all 0.2s var(--cubic-bezier); padding: 2rem 1.5rem; text-align: center; border: var(--border-width) solid var(--text-main); background: var(--white); box-shadow: 4px 4px 0px 0px var(--text-main); }
        .fav-item:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0px 0px var(--text-main); background: var(--primary); }
        [data-theme="hacker"] .fav-item:hover { color: #000 !important; }
        .fav-icon { width: 32px; height: 32px; color: var(--text-main); margin: 0 auto 1rem; }
        [data-theme="hacker"] .fav-item:hover .fav-icon { color: #000 !important; }
        .fav-item-title { font-size: 1rem; font-weight: 900; color: var(--text-main); margin-bottom: 0.5rem; display: block; text-transform: uppercase; }
        .fav-item-date { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }
        .remove-fav { position: absolute; top: 0.5rem; right: 0.5rem; opacity: 0.3; transition: 0.2s; background: none; border: none; color: var(--text-main); cursor: pointer; }
        .fav-item:hover .remove-fav { opacity: 1; }
        .empty-fav { padding: 4rem 0; text-align: center; }
        .empty-icon-wrap { font-size: 3.5rem; color: var(--primary); margin-bottom: 1rem; }
        .fav-modal.active-out { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
        #back-to-top { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: var(--primary); color: var(--black); border: var(--border-width) solid var(--black); box-shadow: 6px 6px 0px 0px var(--black); cursor: pointer; z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(20px); transition: all 0.3s var(--cubic-bezier); }
        #back-to-top:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0px 0px var(--black); }
        [data-theme="hacker"] #back-to-top { background: #000 !important; color: #00ff41 !important; border-color: #00ff41 !important; box-shadow: 4px 4px 0px 0px #003b00 !important; }
        [data-theme="hacker"] #back-to-top:hover { background: #003b00 !important; }
        #back-to-top.visible { opacity: 1; transform: translateY(0); }
        .revealed { opacity: 1 !important; transform: translateY(0) !important; }
        
        /* Image Zoom Overlay - Refined */
        #img-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; cursor: zoom-out; }
        #img-overlay.active { opacity: 1; }
        .zoomed-img { width: auto; height: auto; max-width: 90vw; max-height: 90vh; object-fit: contain; border: 4px solid var(--white); box-shadow: 20px 20px 0px 0px var(--black); transform: scale(0.8); transition: transform 0.4s var(--cubic-bezier); background: var(--white); }
        #img-overlay.active .zoomed-img { transform: scale(1); }

        /* Search Modal Styles Injected - Premium Edition */
        .search-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10005; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter: blur(12px); }
        .search-modal.active { opacity: 1; pointer-events: auto; }
        .search-modal-content { width: 90%; max-width: 850px; background: #fff; border: 4px solid #000; box-shadow: 20px 20px 0px 0px #000; padding: 4rem; transform: scale(0.9) translateY(40px); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); position: relative; }
        .search-modal.active .search-modal-content { transform: scale(1) translateY(0); }
        .search-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 6px solid #000; padding-bottom: 1rem; }
        .search-title { font-weight: 900; font-size: 2.2rem; text-transform: uppercase; letter-spacing: -0.02em; color: #000; line-height: 1; }
        .search-input { width: 100%; padding: 1.5rem 2rem; background: #f0f0f0; border: 4px solid #000; color: #000; font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 900; border-radius: 0; transition: all 0.2s ease; margin-top: 1rem; }
        .search-input:focus { outline: none; background: #fff; transform: translate(-4px, -4px); box-shadow: 8px 8px 0px 0px #000; }
        .search-results { max-height: 55vh; overflow-y: auto; margin-top: 2rem; padding-right: 1.5rem; }
        .search-results::-webkit-scrollbar { width: 8px; }
        .search-results::-webkit-scrollbar-thumb { background: #000; }
        .search-result-item { display: flex; align-items: center; justify-content: space-between; padding: 2rem; border: 2px solid #eee; margin-bottom: 1rem; text-decoration: none; color: #000; transition: all 0.3s var(--cubic-bezier); background: #fafafa; }
        .search-result-item:hover, .search-result-item.active { background: var(--primary); border-color: #000; transform: translateX(8px); box-shadow: -8px 0px 0px 0px #000; }
        .search-result-content-wrap { flex: 1; }
        .search-result-title { font-weight: 900; font-size: 1.3rem; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: -0.01em; color: #000; }
        .search-result-excerpt { font-size: 0.95rem; line-height: 1.6; color: #444; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .search-result-footer { display: flex; align-items: center; gap: 1.5rem; }
        .search-result-tag { font-size: 0.7rem; font-weight: 900; background: #000; color: #fff; padding: 0.2rem 0.6rem; letter-spacing: 0.1em; }
        .search-result-meta { font-size: 0.8rem; font-weight: 700; opacity: 0.5; }
        .search-result-arrow { opacity: 0; transform: translateX(-10px); transition: all 0.3s ease; font-size: 1.2rem; }
        .search-result-item:hover .search-result-arrow, .search-result-item.active .search-result-arrow { opacity: 1; transform: translateX(0); }
        .search-highlight { background: #ffea00; color: #000; padding: 0 2px; font-weight: 900; }
        .search-placeholder, .search-no-results { padding: 3rem; text-align: center; font-weight: 700; color: #bbb; font-size: 1rem; text-transform: uppercase; }
    `;

    document.head.appendChild(finalStyle);
    
    // --- Search Logic ---
    let searchData = null;
    const fetchSearchData = async () => {
        if (searchData) return searchData;
        try {
            const root = window.AETHERIA_CONFIG?.root || '/';
            const path = window.AETHERIA_CONFIG?.searchPath || 'search.json';
            const res = await fetch(root + path);
            searchData = await res.json();
            return searchData;
        } catch (err) {
            console.error('Search index not found:', err);
            return [];
        }
    };

    const searchBtn = document.getElementById('nav-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const data = await fetchSearchData();
            
            const searchModal = document.createElement('div');
            searchModal.className = 'search-modal';
            searchModal.innerHTML = `
                <div class="search-modal-content">
                    <div class="search-header">
                        <div class="search-title">全站搜索</div>
                        <button class="action-btn" id="close-search"><i data-lucide="x"></i></button>
                    </div>
                    <input type="text" class="search-input" placeholder="输入关键词搜索全站文章..." id="search-input-field">
                    <div class="search-results" id="search-results-list">
                        <div style="text-align:center; padding: 2rem; color: var(--text-dim);">
                            ${data.length > 0 ? '全站索引已就绪，请输入关键词...' : '正在尝试加载索引或索引为空...'}
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(searchModal);
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => searchModal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';

            const closeSearch = () => {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
                setTimeout(() => searchModal.remove(), 400);
            };

            document.getElementById('close-search').onclick = closeSearch;
            searchModal.onclick = (e) => { if (e.target === searchModal) closeSearch(); };

            const searchInput = document.getElementById('search-input-field');
            const resultsList = document.getElementById('search-results-list');
            searchInput.focus();
            
            let selectedIndex = -1;

            const stripHtml = (html) => {
                if (!html) return '';
                return html.replace(/<[^>]*>?/gm, '').trim();
            };

            const highlight = (text, query) => {
                if (!query) return text;
                const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedQuery})`, 'gi');
                return text.replace(regex, '<mark class="search-highlight">$1</mark>');
            };

            const getExcerpt = (content, query) => {
                const plainText = stripHtml(content);
                const index = plainText.toLowerCase().indexOf(query.toLowerCase());
                if (index === -1) return plainText.substring(0, 120) + '...';
                const start = Math.max(0, index - 50);
                const end = Math.min(plainText.length, index + 120);
                return (start > 0 ? '...' : '') + plainText.substring(start, end) + (end < plainText.length ? '...' : '');
            };

            const renderResults = (results, query) => {
                if (results.length > 0) {
                    resultsList.innerHTML = results.map((r, i) => {
                        const root = window.AETHERIA_CONFIG?.root || '/';
                        const cleanUrl = r.url.startsWith('/') ? r.url.substring(1) : r.url;
                        // Use a safer path join to avoid // leading slashes which browser treats as protocol-relative
                        let finalUrl = (root + '/' + cleanUrl).replace(/\/+/g, '/');
                        
                        const activeClass = i === selectedIndex ? 'active' : '';
                        return `
                            <a href="${finalUrl}" class="search-result-item ${activeClass}">
                                <div class="search-result-content-wrap">
                                    <div class="search-result-title">${highlight(r.title || '无标题', query)}</div>
                                    <div class="search-result-excerpt">${highlight(getExcerpt(r.content, query), query)}</div>
                                    <div class="search-result-footer">
                                        <span class="search-result-tag">DOC</span>
                                        <span class="search-result-meta">${r.date ? new Date(r.date).toLocaleDateString() : ''}</span>
                                    </div>
                                </div>
                                <div class="search-result-arrow"><i data-lucide="chevron-right"></i></div>
                            </a>
                        `;
                    }).join('');
                    if (window.lucide) window.lucide.createIcons();
                } else {
                    resultsList.innerHTML = `<div class="search-no-results">NO RESULTS FOR "${query}"</div>`;
                }
            };

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                selectedIndex = -1;
                
                if (query.length < 1) {
                    resultsList.innerHTML = '<div class="search-placeholder">正在监听键盘输入...</div>';
                    return;
                }
                
                if (!data || data.length === 0) {
                    resultsList.innerHTML = '<div class="search-placeholder">未找到搜索索引...</div>';
                    return;
                }

                const filtered = data.filter(post => {
                    const titleMatch = post.title && post.title.toLowerCase().includes(query);
                    const contentMatch = post.content && stripHtml(post.content).toLowerCase().includes(query);
                    return titleMatch || contentMatch;
                }).slice(0, 8); 

                renderResults(filtered, query);

                // Keyboard handling
                searchInput.onkeydown = (ke) => {
                    const items = resultsList.querySelectorAll('.search-result-item');
                    if (ke.key === 'ArrowDown') {
                        ke.preventDefault();
                        selectedIndex = (selectedIndex + 1) % items.length;
                        renderResults(filtered, query);
                        items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                    } else if (ke.key === 'ArrowUp') {
                        ke.preventDefault();
                        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                        renderResults(filtered, query);
                        items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                    } else if (ke.key === 'Enter') {
                        if (selectedIndex > -1) {
                            ke.preventDefault();
                            items[selectedIndex].click();
                        }
                    }
                };
            });
        });
    }

    if (window.lucide) window.lucide.createIcons();

    // --- Draggable Stickers ---
    const draggables = document.querySelectorAll('.sticker.draggable');
    draggables.forEach(sticker => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        sticker.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = sticker.offsetLeft;
            initialY = sticker.offsetTop;
            sticker.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            sticker.style.left = `${initialX + dx}px`;
            sticker.style.top = `${initialY + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            sticker.style.cursor = 'grab';
        });

        // Touch Support for Stickers
        sticker.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            initialX = sticker.offsetLeft;
            initialY = sticker.offsetTop;
            // Prevent default to stop scrolling while dragging
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        sticker.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            sticker.style.left = `${initialX + dx}px`;
            sticker.style.top = `${initialY + dy}px`;
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        sticker.addEventListener('touchend', () => {
            isDragging = false;
        });
    });



    // --- UI Sounds ---
    let soundsEnabled = true; // Could be a user preference
    // Very short, low-fi click sound (base64)
    const clickSoundUrl = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; 
    // Using a silent/placeholder base64 for now to avoid large strings, but the logic works.
    // In a real scenario, this would be a real sound URL or a small base64 string.
    
    // Instead of base64, we can synthesize a tiny mechanical click using Web Audio API for true "tech" feel without assets
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playClickSound() {
        if (!soundsEnabled || audioCtx.state === 'suspended') return;
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'square'; // Harsh, mechanical sound
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // Low pitch
        oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05); // Pitch drop
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Low volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); // Quick fade
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    }

    function playHoverSound() {
        if (!soundsEnabled || audioCtx.state === 'suspended') return;
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine'; // Softer for hover
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.03);
        
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.03);
    }

    // Attach sounds
    document.body.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });

    document.querySelectorAll('a, button, .feature-card, .action-btn, .draggable').forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
        el.addEventListener('mousedown', playClickSound);
    });

    // --- 1. Konami Code (God Mode) ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.body.classList.toggle('god-mode');
                showToast('GOD MODE ACTIVATED', 'success');
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // --- 2. Neural Ink & Layer (NIL) System ---
    class NILSystem {
        constructor() {
            this.active = false;
            this.tool = 'pencil'; // pencil, marker, eraser, text
            this.color = localStorage.getItem('nil_color') || 'var(--text-main)';
            this.canvas = null;
            this.ctx = null;
            this.drawing = false;
            this.lastX = 0;
            this.lastY = 0;
            this.highlights = JSON.parse(localStorage.getItem(`nil_highlights_${window.location.pathname}`)) || [];
            this.canvasData = localStorage.getItem(`nil_canvas_${window.location.pathname}`);
            
            this.init();
        }

        init() {
            const btn = document.getElementById('nav-highlight');
            if (!btn) return;

            // Create Canvas Layer
            const container = document.createElement('div');
            container.id = 'nil-canvas-container';
            container.innerHTML = `<canvas id="nil-canvas"></canvas>`;
            document.body.appendChild(container);
            
            this.canvas = document.getElementById('nil-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            // Create HUD
            const hud = document.createElement('div');
            hud.id = 'nil-hud';
            hud.innerHTML = `
                <button class="nil-tool active" data-tool="pencil" title="Pencil (P)"><i data-lucide="pencil"></i></button>
                <button class="nil-tool" data-tool="marker" title="Marker (M)"><i data-lucide="brush"></i></button>
                <button class="nil-tool" data-tool="eraser" title="Eraser (E)"><i data-lucide="eraser"></i></button>
                <button class="nil-tool" data-tool="text" title="Text Highlighter (T)"><i data-lucide="highlighter"></i></button>
                <div style="width:1px; background:var(--text-main); opacity:0.2; margin:0 5px;"></div>
                <div class="nil-colors">
                    <div class="nil-color-btn" data-color="var(--text-main)" style="background:var(--text-main);" title="Default"></div>
                    <div class="nil-color-btn" data-color="var(--primary)" style="background:var(--primary);" title="Primary"></div>
                    <div class="nil-color-btn" data-color="var(--secondary)" style="background:var(--secondary);" title="Secondary"></div>
                    <div class="nil-color-btn" data-color="var(--accent)" style="background:var(--accent);" title="Accent"></div>
                    <div class="nil-color-btn" data-color="#ff4757" style="background:#ff4757;" title="Red Alert"></div>
                    <div class="nil-color-btn" data-color="#2ed573" style="background:#2ed573;" title="Secure Green"></div>
                </div>
                <div style="width:1px; background:var(--text-main); opacity:0.2; margin:0 5px;"></div>
                <button class="nil-tool nil-clear" id="nil-clear" title="Clear All"><i data-lucide="trash-2"></i></button>
            `;
            document.body.appendChild(hud);
            if (window.lucide) window.lucide.createIcons();

            // Mark active color
            hud.querySelectorAll('.nil-color-btn').forEach(b => {
                if (b.dataset.color === this.color) b.classList.add('active');
            });

            // Load Saved Data
            if (this.canvasData) {
                const img = new Image();
                img.onload = () => this.ctx.drawImage(img, 0, 0);
                img.src = this.canvasData;
            }
            this.applyTextHighlights();

            // Event Listeners
            btn.addEventListener('click', () => this.toggle());
            
            hud.querySelectorAll('.nil-tool[data-tool]').forEach(t => {
                t.addEventListener('click', () => this.setTool(t.dataset.tool));
            });

            hud.querySelectorAll('.nil-color-btn').forEach(c => {
                c.addEventListener('click', () => this.setColor(c.dataset.color));
            });

            document.getElementById('nil-clear').addEventListener('click', () => this.clearAll());

            // Drawing Events
            this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
            this.canvas.addEventListener('mousemove', (e) => this.draw(e));
            this.canvas.addEventListener('mouseup', () => this.stopDrawing());
            this.canvas.addEventListener('mouseout', () => this.stopDrawing());

            // Touch Drawing Events
            this.canvas.addEventListener('touchstart', (e) => {
                if (!this.active || this.tool === 'text') return;
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.drawing = true;
                this.lastX = touch.clientX - rect.left;
                this.lastY = touch.clientY - rect.top;
                if (e.cancelable) e.preventDefault();
            }, { passive: false });

            this.canvas.addEventListener('touchmove', (e) => {
                if (!this.drawing) return;
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                this.drawAt(x, y);
                if (e.cancelable) e.preventDefault();
            }, { passive: false });

            this.canvas.addEventListener('touchend', () => this.stopDrawing());

            // Text Highlight Events
            document.addEventListener('mouseup', () => {
                if (this.active && this.tool === 'text') this.handleTextSelection();
            });

            // Keyboard Shortcuts
            document.addEventListener('keydown', (e) => {
                if (!this.active) return;
                if (e.key.toLowerCase() === 'p') this.setTool('pencil');
                if (e.key.toLowerCase() === 'm') this.setTool('marker');
                if (e.key.toLowerCase() === 'e') this.setTool('eraser');
                if (e.key.toLowerCase() === 't') this.setTool('text');
                if (e.key >= '1' && e.key <= '6') {
                    const colors = hud.querySelectorAll('.nil-color-btn');
                    this.setColor(colors[parseInt(e.key) - 1].dataset.color);
                }
            });
        }

        resizeCanvas() {
            const temp = this.canvas.toDataURL();
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            const img = new Image();
            img.onload = () => this.ctx.drawImage(img, 0, 0);
            img.src = temp;
        }

        toggle() {
            this.active = !this.active;
            document.body.classList.toggle('nil-active', this.active);
            document.getElementById('nil-hud').classList.toggle('active', this.active);
            document.getElementById('nil-canvas-container').classList.toggle('interactive', this.active && this.tool !== 'text');
            
            const btn = document.getElementById('nav-highlight');
            btn.style.color = this.active ? 'var(--primary)' : '';
            btn.style.background = this.active ? 'var(--text-main)' : '';
            
            showToast(this.active ? 'NIL System: ONLINE' : 'NIL System: OFFLINE', 'info');
        }

        setTool(t) {
            this.tool = t;
            document.querySelectorAll('.nil-tool').forEach(el => el.classList.remove('active'));
            document.querySelector(`.nil-tool[data-tool="${t}"]`).classList.add('active');
            
            document.getElementById('nil-canvas-container').classList.toggle('interactive', this.active && t !== 'text');
            playClickSound();
        }

        setColor(c) {
            this.color = c;
            document.querySelectorAll('.nil-color-btn').forEach(el => el.classList.remove('active'));
            document.querySelector(`.nil-color-btn[data-color="${c}"]`).classList.add('active');
            localStorage.setItem('nil_color', c);
            playClickSound();
        }

        startDrawing(e) {
            if (!this.active || this.tool === 'text') return;
            this.drawing = true;
            [this.lastX, this.lastY] = [e.clientX, e.clientY];
        }

        draw(e) {
            if (!this.drawing) return;
            this.drawAt(e.clientX, e.clientY);
        }

        drawAt(x, y) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(x, y);
            
            let colorValue = this.color;
            if (this.color.startsWith('var(')) {
                colorValue = getComputedStyle(document.documentElement).getPropertyValue(this.color.replace('var(', '').replace(')', '')).trim();
            }

            if (this.tool === 'pencil') {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = colorValue || '#000';
                this.ctx.lineWidth = 2;
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
            } else if (this.tool === 'marker') {
                this.ctx.globalCompositeOperation = 'source-over';
                if (colorValue.startsWith('#')) {
                    this.ctx.strokeStyle = colorValue + '66';
                } else {
                    this.ctx.strokeStyle = colorValue.replace('rgb', 'rgba').replace(')', ', 0.4)');
                }
                this.ctx.lineWidth = 15;
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
            } else if (this.tool === 'eraser') {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.lineWidth = 20;
            }
            
            this.ctx.stroke();
            [this.lastX, this.lastY] = [x, y];
        }

        stopDrawing() {
            if (this.drawing) {
                this.drawing = false;
                this.saveData();
            }
        }

        handleTextSelection() {
            const selection = window.getSelection();
            if (!selection.isCollapsed && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const text = selection.toString();
                
                const span = document.createElement('span');
                span.className = 'nil-text-highlight';
                
                // Use current color for text highlight too!
                let colorValue = this.color;
                if (this.color.startsWith('var(')) {
                    colorValue = getComputedStyle(document.documentElement).getPropertyValue(this.color.replace('var(', '').replace(')', '')).trim();
                }
                span.style.backgroundColor = colorValue;
                
                // Ensure text contrast
                const isDark = (c) => {
                    // Simple heuristic for dark colors
                    if (!c) return false;
                    if (c === 'var(--text-main)' || c === '#000000') return true;
                    return false;
                };
                if (isDark(this.color)) span.style.color = '#fff';

                try {
                    range.surroundContents(span);
                    this.highlights.push({ text, color: this.color }); 
                    this.saveData();
                    playClickSound();
                } catch (e) {
                    showToast('Cannot highlight across blocks', 'error');
                }
                selection.removeAllRanges();
            }
        }

        applyTextHighlights() {
            // Persistence of text highlights would require a more complex range-to-path library.
        }

        clearAll() {
            if (confirm('Wipe all annotations on this page?')) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.highlights = [];
                this.saveData();
                playClickSound();
                showToast('Layer Cleared', 'success');
            }
        }

        saveData() {
            localStorage.setItem(`nil_canvas_${window.location.pathname}`, this.canvas.toDataURL());
            localStorage.setItem(`nil_highlights_${window.location.pathname}`, JSON.stringify(this.highlights));
        }
    }

    // Initialize NIL
    window.nilSystem = new NILSystem();



    // --- 3. Matrix Data Stream (Code Blocks) ---
    document.querySelectorAll('.highlight').forEach(block => {
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-canvas';
        block.appendChild(canvas);
        
        let interval;
        block.addEventListener('mouseenter', () => {
            const ctx = canvas.getContext('2d');
            canvas.width = block.offsetWidth;
            canvas.height = block.offsetHeight;
            const chars = '01'.split('');
            const fontSize = 14;
            const columns = canvas.width / fontSize;
            const drops = [];
            for (let x = 0; x < columns; x++) drops[x] = 1;

            interval = setInterval(() => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0f0'; // Matrix green
                ctx.font = fontSize + 'px monospace';
                for (let i = 0; i < drops.length; i++) {
                    const text = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }, 50);
        });
        
        block.addEventListener('mouseleave', () => {
            clearInterval(interval);
        });
    });

    // --- 4. Magnetic Text Distortion ---
    const magneticTitles = document.querySelectorAll('.section-title, .logo');
    magneticTitles.forEach(title => {
        if (!title.classList.contains('magnetic-text')) {
            const text = title.textContent;
            title.textContent = '';
            title.classList.add('magnetic-text');
            for (let char of text) {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                title.appendChild(span);
            }
        }
        
        title.addEventListener('mousemove', (e) => {
            const rect = title.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            title.querySelectorAll('span').forEach((span, index) => {
                const spanRect = span.getBoundingClientRect();
                const spanX = spanRect.left - rect.left + spanRect.width / 2;
                const spanY = spanRect.top - rect.top + spanRect.height / 2;
                
                const distanceX = mouseX - spanX;
                const distanceY = mouseY - spanY;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                
                if (distance < 50) {
                    const pushX = (distanceX / distance) * 10;
                    const pushY = (distanceY / distance) * 10;
                    span.style.transform = `translate(${-pushX}px, ${-pushY}px) scale(1.1) skewX(${-pushX}deg)`;
                    span.style.color = 'var(--primary)';
                } else {
                    span.style.transform = 'translate(0, 0) scale(1) skewX(0)';
                    span.style.color = '';
                }
            });
        });
        
        title.addEventListener('mouseleave', () => {
            title.querySelectorAll('span').forEach(span => {
                span.style.transform = 'translate(0, 0) scale(1) skewX(0)';
                span.style.color = '';
            });
        });
    });

    function setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('aetheria_theme', themeName);
        showToast(`Theme updated: ${themeName}`, 'success');
    }

    function executeCommand(cmd) {
        const themeCmds = ['light', 'dark', 'neon', 'print', 'wireframe', 'hacker', 'sepia'];
        const actionCmds = ['home', 'posts', 'tags', 'glitch', 'burn', 'emp', 'focus', 'matrix', 'hack', 'gravity0', 'explode', 'reset', 'exit'];
        
        if (cmd === 'help') {
            showToast(`Themes: ${themeCmds.join(', ')} | Actions: ${actionCmds.join(', ')}`, 'info');
        } 
        else if (themeCmds.includes(cmd)) setTheme(cmd);
        else if (cmd === 'reset') setTheme('light');
        else if (cmd === 'home') window.location.href = '/';
        else if (cmd === 'posts') window.location.href = '/archives';
        else if (cmd === 'tags') window.location.href = '/tags';
        else if (cmd === 'glitch') document.body.classList.toggle('glitch-active');
        else if (cmd === 'focus') document.body.classList.toggle('focus-mode');
        else if (cmd === 'emp') {
            document.body.classList.add('emp-mode');
            setTimeout(() => document.body.classList.remove('emp-mode'), 5000);
        }
        else if (cmd === 'burn') {
            let burnOverlay = document.getElementById('burn-overlay');
            if (!burnOverlay) {
                burnOverlay = document.createElement('div');
                burnOverlay.id = 'burn-overlay';
                burnOverlay.textContent = 'SYSTEM PURGE INITIATED';
                document.body.appendChild(burnOverlay);
            }
            setTimeout(() => burnOverlay.classList.add('burning'), 50);
            setTimeout(() => window.location.reload(), 2500);
        }
        else if (cmd === 'matrix') {
            if (document.getElementById('matrix-canvas-overlay')) return;
            const canvas = document.createElement('canvas');
            canvas.id = 'matrix-canvas-overlay';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.zIndex = '999998';
            canvas.style.pointerEvents = 'none';
            document.body.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const drops = [];
            const fontSize = 16;
            for (let i = 0; i < canvas.width / fontSize; i++) drops[i] = 1;
            window.matrixInterval = setInterval(() => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0f0';
                ctx.font = fontSize + 'px monospace';
                for (let i = 0; i < drops.length; i++) {
                    const text = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }, 33);
            showToast('MATRIX OVERRIDE INITIATED (type "exit" to stop)', 'success');
        }
        else if (cmd === 'exit') {
            const matrixOverlay = document.getElementById('matrix-canvas-overlay');
            if (matrixOverlay) {
                matrixOverlay.remove();
                clearInterval(window.matrixInterval);
                showToast('MATRIX TERMINATED', 'info');
            } else {
                showToast('Nothing to exit', 'info');
            }
        }
        else if (cmd === 'hack') {
            showToast('BREACHING FIREWALL... 100%', 'error');
            const textNodes = [];
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while(node = walk.nextNode()) {
                if (node.nodeValue.trim() !== '' && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                    textNodes.push({ node, original: node.nodeValue });
                }
            }
            const chars = '!@#$%^&*()_+-=[]{}|;:,.<>/?~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let iterations = 0;
            const hackInterval = setInterval(() => {
                textNodes.forEach(item => {
                    item.node.nodeValue = item.original.split('').map(c => 
                        c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
                    ).join('');
                });
                iterations++;
                if (iterations > 30) {
                    clearInterval(hackInterval);
                    textNodes.forEach(item => item.node.nodeValue = item.original);
                }
            }, 100);
        }
        else if (cmd === 'gravity0') {
            showToast('GRAVITY DISABLED', 'info');
            document.querySelectorAll('.feature-card, .btn, .sticker, img, h1, h2, h3, p, .action-btn').forEach(el => {
                el.style.position = 'relative';
                el.style.transition = 'none'; // Disable hover transitions that might interfere
                let x = 0, y = 0;
                let vx = (Math.random() - 0.5) * 4;
                let vy = (Math.random() - 0.5) * 4;
                setInterval(() => {
                    x += vx; y += vy;
                    if (Math.abs(x) > 100) vx *= -1;
                    if (Math.abs(y) > 100) vy *= -1;
                    el.style.transform = `translate(${x}px, ${y}px) rotate(${x/2}deg)`;
                }, 16);
            });
        }
        else if (cmd === 'explode') {
            playClickSound();
            document.body.style.background = '#000';
            document.body.style.overflow = 'hidden';
            document.querySelectorAll('body > *').forEach(el => {
                if (el.id === 'command-palette' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.id === 'cursor-dot' || el.id === 'cursor-outline') return;
                el.style.transition = 'all 1s cubic-bezier(0.1, 0.9, 0.2, 1)';
                const vx = (Math.random() - 0.5) * 3000;
                const vy = (Math.random() - 0.5) * 3000;
                const rot = (Math.random() - 0.5) * 1080;
                el.style.transform = `translate(${vx}px, ${vy}px) rotate(${rot}deg) scale(0)`;
                el.style.opacity = '0';
            });
            setTimeout(() => window.location.reload(), 1500);
        }
        else showToast(`Unknown command: ${cmd}`, 'error');
    }

    // --- Terminal Help Modal Logic ---
    const helpBtn = document.getElementById('terminal-help-btn');
    const helpModal = document.getElementById('terminal-help-modal');
    const helpOverlay = document.getElementById('terminal-help-overlay');
    const closeHelpBtn = document.getElementById('close-terminal-help');

    if (helpBtn && helpModal && helpOverlay) {
        helpBtn.addEventListener('click', () => {
            helpModal.style.display = 'block';
            helpOverlay.style.display = 'block';
            lucide.createIcons(); // refresh icons inside modal just in case
        });
        
        const closeHelp = () => {
            helpModal.style.display = 'none';
            helpOverlay.style.display = 'none';
        };
        
        closeHelpBtn.addEventListener('click', closeHelp);
        helpOverlay.addEventListener('click', closeHelp);
    }

    // --- 6. ASCII Art Generator (Footer) ---
    const asciiContainer = document.getElementById('ascii-art-container');
    if (asciiContainer) {
        let A = 0, B = 0;
        const renderAscii = () => {
            const b = [];
            const z = [];
            A += 0.07;
            B += 0.03;
            const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
            for (let k = 0; k < 1760; k++) {
                b[k] = k % 80 === 79 ? "\n" : " ";
                z[k] = 0;
            }
            for (let j = 0; j < 6.28; j += 0.07) {
                const ct = Math.cos(j), st = Math.sin(j);
                for (let i = 0; i < 6.28; i += 0.02) {
                    const sp = Math.sin(i), cp = Math.cos(i), h = ct + 2, D = 1 / (sp * h * sA + st * cA + 5), t = sp * h * cA - st * sA;
                    const x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)), y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)), o = x + 80 * y, N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
                    if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
                        z[o] = D;
                        b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
                    }
                }
            }
            asciiContainer.textContent = b.join("");
        };
        // Use IntersectionObserver to only animate when footer is visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!window.asciiInterval) window.asciiInterval = setInterval(renderAscii, 50);
            } else {
                clearInterval(window.asciiInterval);
                window.asciiInterval = null;
            }
        });
        observer.observe(asciiContainer);
    }

    // --- 7. Navbar Enhancements (Zen Mode, Voice Reader, Scroll Progress) ---
    
    // A. Reading Progress Bar
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    // B. Zen Mode (Focus Mode)
    const zenBtn = document.getElementById('nav-zen');
    let isZen = false;
    if (zenBtn) {
        zenBtn.addEventListener('click', () => {
            isZen = !isZen;
            const leftSidebar = document.querySelector('.post-sidebar-left');
            const rightSidebar = document.querySelector('.post-sidebar-right');
            const wrapper = document.querySelector('.post-body-wrapper');
            const content = document.querySelector('.post-content');

            if (isZen) {
                if (leftSidebar) leftSidebar.style.display = 'none';
                if (rightSidebar) rightSidebar.style.display = 'none';
                if (wrapper) wrapper.style.gridTemplateColumns = '1fr';
                if (content) content.style.maxWidth = '1000px';
                if (content) content.style.margin = '0 auto';
                zenBtn.classList.add('active');
                showToast('ZEN MODE ENABLED', 'info');
            } else {
                if (leftSidebar) leftSidebar.style.display = '';
                if (rightSidebar) rightSidebar.style.display = '';
                if (wrapper) wrapper.style.gridTemplateColumns = '';
                if (content) content.style.maxWidth = '';
                if (content) content.style.margin = '';
                zenBtn.classList.remove('active');
                zenBtn.classList.remove('active');
                showToast('ZEN MODE DISABLED', 'success');
            }
        });
    }

    // C. AI Voice Reader (Web Speech API - 100% FREE)
    const voiceBtn = document.getElementById('nav-voice');
    let isReading = false;
    let synth = window.speechSynthesis;
    let utterance = null;

    if (voiceBtn && synth) {
        voiceBtn.addEventListener('click', () => {
            if (isReading) {
                synth.cancel();
                isReading = false;
                voiceBtn.classList.remove('voice-active');
                showToast('VOICE STOPPED', 'info');
            } else {
                const text = document.querySelector('.post-content')?.innerText;
                if (!text) {
                    showToast('NO CONTENT TO READ', 'error');
                    return;
                }

                utterance = new SpeechSynthesisUtterance(text);
                
                // Get all available voices
                const voices = synth.getVoices();
                const isChinese = /[\u4e00-\u9fa5]/.test(text);
                
                // Optimized voice selection: Look for "Neural", "Natural", or "Online" keywords for best quality
                let preferredVoice = voices.find(v => 
                    (isChinese ? v.lang.includes('zh') : v.lang.includes('en')) && 
                    (v.name.includes('Neural') || v.name.includes('Online') || v.name.includes('Natural'))
                );

                // Fallback to any matching language voice if no neural voice found
                if (!preferredVoice) {
                    preferredVoice = voices.find(v => isChinese ? v.lang.includes('zh') : v.lang.includes('en'));
                }

                if (preferredVoice) utterance.voice = preferredVoice;

                utterance.rate = 1.0; 
                utterance.pitch = 1.1; // Slightly higher pitch for more clarity and less drone

                utterance.onend = () => {
                    isReading = false;
                    voiceBtn.classList.remove('voice-active');
                };
                synth.speak(utterance);
                isReading = true;
                voiceBtn.classList.add('voice-active');
                showToast('READING STARTED', 'success');
            }
        });
    }

    // --- Initialize Icons ---
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
