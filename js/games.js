// js/games.js
const GAME_TITLES = {
    sun:     'EL SOL · Quiz Solar',
    mercury: 'MERCURIO · Esquiva Meteoritos',
    venus:   'VENUS · Memorama Cósmico',
    earth:   'TIERRA · Recicla el Planeta',
    mars:    'MARTE · Encuentra al Rover',
    jupiter: 'JÚPITER · Lunas Galileanas',
    saturn:  'SATURNO · Ordena los Anillos',
    uranus:  'URANO · Trivia de Gigantes',
    neptune: 'NEPTUNO · Captura a Tritón',
    pluto:   'PLUTÓN · Sopa de Letras'
};

// =========================================================
// UTILIDADES
// =========================================================
function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function showWin(container, msg) {
    const win = el('div', 'game-win');
    win.innerHTML = `<div class="game-win__title">¡EXCELENTE!</div><div class="game-win__msg">${msg}</div>`;
    container.appendChild(win);
}

function showLose(container, msg) {
    const lose = el('div', 'game-win game-win--lose');
    lose.innerHTML = `<div class="game-win__title">¡INTÉNTALO DE NUEVO!</div><div class="game-win__msg">${msg}</div>`;
    container.appendChild(lose);
}

// =========================================================
// 1. SOL — Quiz Solar
// =========================================================
function game_sun(c) {
    const questions = [
        { q: '¿De qué está compuesto principalmente el Sol?', opts: ['Hidrógeno y helio', 'Hierro y níquel', 'Roca y metal', 'Hielo y polvo'], a: 0 },
        { q: '¿Qué edad tiene el Sol aproximadamente?', opts: ['1 millón de años', '4 600 millones de años', '500 mil años', '12 mil millones de años'], a: 1 },
        { q: '¿Qué proceso genera la energía del Sol?', opts: ['Combustión química', 'Fusión nuclear', 'Fisión nuclear', 'Electricidad estática'], a: 1 },
        { q: '¿Cuál es la temperatura de la superficie del Sol?', opts: ['100 °C', '500 °C', '5 500 °C', '1 millón °C'], a: 2 },
        { q: '¿Qué porcentaje de la masa del Sistema Solar concentra el Sol?', opts: ['25%', '50%', '75%', '99.86%'], a: 3 }
    ];
    let i = 0, score = 0;
    const intro = el('p', 'game-intro', 'Responde 5 preguntas sobre nuestra estrella.');
    c.appendChild(intro);

    const stage = el('div', 'quiz-stage');
    c.appendChild(stage);

    function render() {
        if (i >= questions.length) {
            stage.innerHTML = '';
            const passed = score >= 3;
            (passed ? showWin : showLose)(stage, `Puntaje: ${score}/${questions.length}`);
            return;
        }
        stage.innerHTML = '';
        const q = questions[i];
        stage.appendChild(el('div', 'quiz-progress', `Pregunta ${i + 1} / ${questions.length}`));
        stage.appendChild(el('h3', 'quiz-question', q.q));
        const opts = el('div', 'quiz-options');
        q.opts.forEach((text, idx) => {
            const btn = el('button', 'quiz-opt', text);
            btn.onclick = () => {
                if (idx === q.a) { btn.classList.add('correct'); score++; }
                else { btn.classList.add('wrong'); }
                stage.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
                stage.querySelectorAll('.quiz-opt')[q.a].classList.add('correct');
                setTimeout(() => { i++; render(); }, 900);
            };
            opts.appendChild(btn);
        });
        stage.appendChild(opts);
    }
    render();
}

// =========================================================
// 2. MERCURIO — Esquiva Meteoritos
// =========================================================
function game_mercury(c) {
    c.appendChild(el('p', 'game-intro', 'Mueve la nave con ← → para esquivar meteoritos durante 25 segundos.'));
    const arena = el('div', 'arena dodge-arena');
    c.appendChild(arena);
    const hud = el('div', 'arena-hud', 'Tiempo: <span id="dg-time">25</span>s · <span id="dg-msg">¡Esquiva!</span>');
    c.appendChild(hud);

    const ship = el('div', 'dodge-ship', '<i class="fa fa-rocket"></i>');
    arena.appendChild(ship);

    const W = 480, H = 320;
    let shipX = W / 2 - 20;
    let leftKey = false, rightKey = false;
    let timeLeft = 25, gameOver = false;
    const meteors = [];

    function onKey(e, down) {
        if (e.key === 'ArrowLeft') leftKey = down;
        if (e.key === 'ArrowRight') rightKey = down;
    }
    const kd = (e) => onKey(e, true);
    const ku = (e) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    arena.tabIndex = 0;
    arena.focus();

    function spawn() {
        if (gameOver) return;
        const m = el('div', 'meteor', '<i class="fa fa-circle"></i>');
        const x = Math.random() * (W - 30);
        m.style.left = x + 'px';
        m.style.top = '-30px';
        m._x = x;
        m._y = -30;
        m._speed = 2 + Math.random() * 3;
        arena.appendChild(m);
        meteors.push(m);
        setTimeout(spawn, 350 + Math.random() * 400);
    }

    function tick() {
        if (gameOver) return;
        if (leftKey) shipX = Math.max(0, shipX - 5);
        if (rightKey) shipX = Math.min(W - 40, shipX + 5);
        ship.style.left = shipX + 'px';

        for (let k = meteors.length - 1; k >= 0; k--) {
            const m = meteors[k];
            m._y += m._speed;
            m.style.top = m._y + 'px';
            // Colisión simple
            if (m._y > H - 50 && m._y < H - 10 && Math.abs(m._x - shipX) < 35) {
                gameOver = true;
                m.classList.add('hit');
                cleanup();
                showLose(c, '¡Te golpeó un meteorito! Vuelve a intentarlo.');
                return;
            }
            if (m._y > H + 30) { m.remove(); meteors.splice(k, 1); }
        }
        requestAnimationFrame(tick);
    }

    const timer = setInterval(() => {
        if (gameOver) return;
        timeLeft--;
        document.getElementById('dg-time').textContent = timeLeft;
        if (timeLeft <= 0) {
            gameOver = true;
            cleanup();
            showWin(c, '¡Sobreviviste a la lluvia de meteoritos!');
        }
    }, 1000);

    function cleanup() {
        clearInterval(timer);
        window.removeEventListener('keydown', kd);
        window.removeEventListener('keyup', ku);
    }

    setTimeout(spawn, 600);
    requestAnimationFrame(tick);
    c._cleanup = cleanup;
}

// =========================================================
// 3. VENUS — Memorama Cósmico
// =========================================================
function game_venus(c) {
    c.appendChild(el('p', 'game-intro', 'Encuentra las 6 parejas de planetas y elementos cósmicos.'));
    const grid = el('div', 'memory-grid');
    c.appendChild(grid);
    const hud = el('div', 'arena-hud', 'Movimientos: <span id="mem-moves">0</span>');
    c.appendChild(hud);

    const symbols = ['☉', '☿', '♀', '♁', '♂', '♃']; // sol, mercurio, venus, tierra, marte, júpiter
    const deck = shuffle([...symbols, ...symbols]);
    const cards = [];
    let first = null, lock = false, moves = 0, matched = 0;

    deck.forEach((s, i) => {
        const card = el('div', 'mem-card', `<div class="mem-front">?</div><div class="mem-back">${s}</div>`);
        card.dataset.symbol = s;
        card.onclick = () => {
            if (lock || card.classList.contains('flipped')) return;
            card.classList.add('flipped');
            if (!first) { first = card; return; }
            moves++;
            document.getElementById('mem-moves').textContent = moves;
            if (first.dataset.symbol === card.dataset.symbol) {
                first.classList.add('matched');
                card.classList.add('matched');
                matched++;
                first = null;
                if (matched === symbols.length) {
                    setTimeout(() => showWin(c, `¡Encontraste todas las parejas en ${moves} movimientos!`), 400);
                }
            } else {
                lock = true;
                const f = first;
                setTimeout(() => {
                    f.classList.remove('flipped');
                    card.classList.remove('flipped');
                    first = null;
                    lock = false;
                }, 700);
            }
        };
        cards.push(card);
        grid.appendChild(card);
    });
}

// =========================================================
// 4. TIERRA — Recicla el Planeta
// =========================================================
function game_earth(c) {
    c.appendChild(el('p', 'game-intro', 'Arrastra cada residuo al contenedor correcto. ¡Necesitas 8 aciertos!'));
    const arena = el('div', 'recycle-arena');
    c.appendChild(arena);
    const hud = el('div', 'arena-hud', 'Aciertos: <span id="rc-score">0</span> / 8 · Errores: <span id="rc-err">0</span>');
    c.appendChild(hud);

    const items = [
        { txt: 'Botella PET', emoji: '🥤', bin: 'plastico' },
        { txt: 'Periódico', emoji: '📰', bin: 'papel' },
        { txt: 'Manzana', emoji: '🍎', bin: 'organico' },
        { txt: 'Caja de cartón', emoji: '📦', bin: 'papel' },
        { txt: 'Bolsa plástica', emoji: '🛍️', bin: 'plastico' },
        { txt: 'Cáscara plátano', emoji: '🍌', bin: 'organico' },
        { txt: 'Libreta', emoji: '📒', bin: 'papel' },
        { txt: 'Hojas secas', emoji: '🍂', bin: 'organico' },
        { txt: 'Botella shampoo', emoji: '🧴', bin: 'plastico' },
        { txt: 'Pan duro', emoji: '🍞', bin: 'organico' }
    ];
    const queue = shuffle(items);
    let score = 0, errors = 0, current = null;

    const itemSlot = el('div', 'rc-item-slot');
    arena.appendChild(itemSlot);

    const bins = el('div', 'rc-bins');
    [
        { id: 'papel',    label: 'PAPEL',    color: '#3a7bd5', emoji: '📄' },
        { id: 'plastico', label: 'PLÁSTICO', color: '#f39041', emoji: '♻️' },
        { id: 'organico', label: 'ORGÁNICO', color: '#4caf50', emoji: '🌿' }
    ].forEach(b => {
        const bin = el('div', 'rc-bin', `<div class="rc-bin-icon">${b.emoji}</div><div>${b.label}</div>`);
        bin.style.borderColor = b.color;
        bin.dataset.bin = b.id;
        bin.ondragover = (e) => { e.preventDefault(); bin.classList.add('over'); };
        bin.ondragleave = () => bin.classList.remove('over');
        bin.ondrop = (e) => {
            e.preventDefault();
            bin.classList.remove('over');
            if (!current) return;
            if (current.bin === b.id) {
                score++;
                document.getElementById('rc-score').textContent = score;
                bin.classList.add('correct-flash');
                setTimeout(() => bin.classList.remove('correct-flash'), 400);
            } else {
                errors++;
                document.getElementById('rc-err').textContent = errors;
                bin.classList.add('wrong-flash');
                setTimeout(() => bin.classList.remove('wrong-flash'), 400);
            }
            next();
        };
        bins.appendChild(bin);
    });
    arena.appendChild(bins);

    function next() {
        itemSlot.innerHTML = '';
        if (score >= 8) { showWin(c, `¡Reciclador experto! Aciertos: ${score}, errores: ${errors}.`); return; }
        if (queue.length === 0 || errors >= 4) {
            if (score >= 8) showWin(c, `Aciertos: ${score}`);
            else showLose(c, `Necesitas 8 aciertos. Lograste ${score}.`);
            return;
        }
        current = queue.shift();
        const it = el('div', 'rc-item', `<div class="rc-emoji">${current.emoji}</div><div>${current.txt}</div>`);
        it.draggable = true;
        it.ondragstart = (e) => { e.dataTransfer.setData('text/plain', current.bin); it.classList.add('dragging'); };
        it.ondragend = () => it.classList.remove('dragging');
        itemSlot.appendChild(it);
    }
    next();
}

// =========================================================
// 5. MARTE — Encuentra al Rover
// =========================================================
function game_mars(c) {
    c.appendChild(el('p', 'game-intro', 'Encuentra el rover Curiosity escondido entre las rocas marcianas.'));
    const arena = el('div', 'arena find-arena');
    c.appendChild(arena);
    const hud = el('div', 'arena-hud', 'Tiempo: <span id="fd-time">30</span>s · Pistas usadas: <span id="fd-hint">0</span>/2');
    c.appendChild(hud);

    const W = 480, H = 320;
    const numRocks = 50;
    let timeLeft = 30, found = false, hints = 0;

    // Posición real del rover
    const rx = 30 + Math.random() * (W - 60);
    const ry = 30 + Math.random() * (H - 60);

    // Rocas distractoras
    for (let i = 0; i < numRocks; i++) {
        const r = el('div', 'find-rock', '<i class="fa fa-circle"></i>');
        const x = Math.random() * (W - 24);
        const y = Math.random() * (H - 24);
        r.style.left = x + 'px';
        r.style.top = y + 'px';
        r.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
        arena.appendChild(r);
    }

    // El rover
    const rover = el('div', 'find-rover', '<i class="fa fa-truck"></i>');
    rover.style.left = rx + 'px';
    rover.style.top = ry + 'px';
    rover.onclick = () => {
        if (found) return;
        found = true;
        rover.classList.add('found');
        cleanup();
        showWin(c, `¡Encontraste al rover en ${30 - timeLeft} segundos!`);
    };
    arena.appendChild(rover);

    const hintBtn = el('button', 'mini-btn', '<i class="fa fa-lightbulb-o"></i> Pista');
    hintBtn.onclick = () => {
        if (hints >= 2) return;
        hints++;
        document.getElementById('fd-hint').textContent = hints;
        const ring = el('div', 'find-hint-ring');
        ring.style.left = (rx - 30) + 'px';
        ring.style.top = (ry - 30) + 'px';
        arena.appendChild(ring);
        setTimeout(() => ring.remove(), 1500);
        if (hints >= 2) hintBtn.disabled = true;
    };
    c.appendChild(hintBtn);

    const timer = setInterval(() => {
        if (found) return;
        timeLeft--;
        document.getElementById('fd-time').textContent = timeLeft;
        if (timeLeft <= 0) {
            cleanup();
            rover.classList.add('found');
            showLose(c, 'Se acabó el tiempo. ¡Aquí estaba el rover!');
        }
    }, 1000);

    function cleanup() { clearInterval(timer); }
    c._cleanup = cleanup;
}

// =========================================================
// 6. JÚPITER — Lunas Galileanas (clic en orden mientras orbitan)
// =========================================================
function game_jupiter(c) {
    c.appendChild(el('p', 'game-intro', 'Las 4 lunas galileanas orbitan Júpiter. ¡Clica cada luna en el orden indicado mientras se mueven! Tienes 3 vidas.'));

    const arena = el('div', 'arena moons-arena');
    c.appendChild(arena);

    const hud = el('div', 'arena-hud', 'Aciertos: <span id="mn-score">0</span>/8 · Vidas: <span id="mn-lives">❤❤❤</span>');
    c.appendChild(hud);

    const target = el('div', 'moons-target', 'Clica: <strong id="mn-target">--</strong>');
    c.appendChild(target);

    const jupiter = el('div', 'jupiter-center');
    arena.appendChild(jupiter);

    const moons = [
        { id: 'io',         name: 'ÍO',         r: 65,  speed: 0.045, color: '#ffd060', size: 14 },
        { id: 'europa',     name: 'EUROPA',     r: 100, speed: 0.030, color: '#e8d4a8', size: 12 },
        { id: 'ganimedes',  name: 'GANÍMEDES',  r: 145, speed: 0.020, color: '#c9a060', size: 18 },
        { id: 'calisto',    name: 'CALISTO',    r: 190, speed: 0.014, color: '#8a7a6a', size: 16 }
    ];

    const cx = 240, cy = 160;
    const moonElements = [];

    moons.forEach((m, i) => {
        m.angle = i * Math.PI / 2;
        const me = el('div', 'jupiter-moon');
        me.dataset.id = m.id;
        me.style.background = `radial-gradient(circle at 30% 30%, ${m.color}, #4a3020)`;
        me.style.width = m.size + 'px';
        me.style.height = m.size + 'px';
        const lbl = el('div', 'jupiter-moon-label', m.name);
        me.appendChild(lbl);
        me.onclick = (e) => { e.stopPropagation(); handleClick(m.id); };
        arena.appendChild(me);
        moonElements.push({ moon: m, el: me });
    });

    let score = 0, lives = 3, ended = false;
    let sequence = [], seqIndex = 0;

    function makeSequence() {
        const ids = moons.map(m => m.id);
        sequence = shuffle(ids).concat(shuffle(ids));
        seqIndex = 0;
        nextTarget();
    }

    function nextTarget() {
        const id = sequence[seqIndex];
        const moonName = moons.find(m => m.id === id).name;
        document.getElementById('mn-target').innerText = moonName;
    }

    function handleClick(id) {
        if (ended) return;
        if (id === sequence[seqIndex]) {
            score++;
            seqIndex++;
            document.getElementById('mn-score').textContent = score;
            if (seqIndex >= sequence.length) endGame(true);
            else nextTarget();
        } else {
            lives--;
            document.getElementById('mn-lives').textContent = lives > 0 ? '❤'.repeat(lives) : '💀';
            arena.classList.add('flash-error');
            setTimeout(() => arena.classList.remove('flash-error'), 250);
            if (lives <= 0) endGame(false);
        }
    }

    function endGame(won) {
        ended = true;
        cancelAnimationFrame(rafId);
        if (won) showWin(c, `¡Maestro de las lunas galileanas! Aciertos: ${score}/8`);
        else showLose(c, `Te quedaste sin vidas. Aciertos: ${score}/8`);
    }

    let rafId;
    function tick() {
        if (ended) return;
        moons.forEach((m, i) => {
            m.angle += m.speed * 0.4;
            const half = m.size / 2;
            const x = cx + Math.cos(m.angle) * m.r - half;
            const y = cy + Math.sin(m.angle) * m.r - half;
            moonElements[i].el.style.left = x + 'px';
            moonElements[i].el.style.top = y + 'px';
        });
        rafId = requestAnimationFrame(tick);
    }
    tick();
    makeSequence();
    c._cleanup = () => { ended = true; cancelAnimationFrame(rafId); };
}

// =========================================================
// 7. SATURNO — Ordena los Anillos
// =========================================================
function game_saturn(c) {
    c.appendChild(el('p', 'game-intro', 'Haz clic en los anillos en orden de tamaño, del MÁS GRANDE al MÁS PEQUEÑO.'));
    const arena = el('div', 'arena ring-arena');
    c.appendChild(arena);
    const hud = el('div', 'arena-hud', 'Progreso: <span id="rg-prog">0</span> / 6');
    c.appendChild(hud);

    const sizes = [120, 100, 80, 60, 45, 30];
    const shuffled = shuffle(sizes.map((s, i) => ({ s, i: i + 1 })));
    let expectedNext = 0; // índice en sizes (orden grande→pequeño)

    shuffled.forEach((obj) => {
        const r = el('div', 'sat-ring');
        r.style.width = obj.s + 'px';
        r.style.height = obj.s + 'px';
        r.style.borderWidth = (obj.s / 12) + 'px';
        r.dataset.size = obj.s;
        r.onclick = () => {
            if (r.classList.contains('done')) return;
            if (parseInt(r.dataset.size) === sizes[expectedNext]) {
                r.classList.add('done');
                expectedNext++;
                document.getElementById('rg-prog').textContent = expectedNext;
                if (expectedNext >= sizes.length) {
                    showWin(c, '¡Anillos ordenados perfectamente!');
                }
            } else {
                r.classList.add('shake');
                setTimeout(() => r.classList.remove('shake'), 400);
            }
        };
        arena.appendChild(r);
    });
}

// =========================================================
// 8. URANO — Trivia de Gigantes de Hielo
// =========================================================
function game_uranus(c) {
    const questions = [
        { q: '¿Por qué Urano se ve azul-verdoso?', opts: ['Por hielo en su superficie', 'Por el metano en su atmósfera', 'Por el agua', 'Por su distancia al Sol'], a: 1 },
        { q: '¿Qué peculiaridad tiene el eje de Urano?', opts: ['Es perfectamente vertical', 'Está inclinado casi 98°', 'Cambia con el tiempo', 'No rota'], a: 1 },
        { q: '¿Cuántas lunas conocidas tiene Urano?', opts: ['5', '12', '27', '63'], a: 2 },
        { q: '¿Qué es un "gigante de hielo"?', opts: ['Un planeta hecho de hielo de agua', 'Un planeta con manto de hielos comprimidos', 'Un cometa grande', 'Un asteroide'], a: 1 },
        { q: '¿Cuánto dura un año en Urano?', opts: ['1 año terrestre', '12 años', '84 años', '165 años'], a: 2 }
    ];
    let i = 0, score = 0;
    c.appendChild(el('p', 'game-intro', 'Demuestra tus conocimientos sobre los gigantes de hielo.'));
    const stage = el('div', 'quiz-stage');
    c.appendChild(stage);

    function render() {
        if (i >= questions.length) {
            stage.innerHTML = '';
            const passed = score >= 3;
            (passed ? showWin : showLose)(stage, `Puntaje: ${score}/${questions.length}`);
            return;
        }
        stage.innerHTML = '';
        const q = questions[i];
        stage.appendChild(el('div', 'quiz-progress', `Pregunta ${i + 1} / ${questions.length}`));
        stage.appendChild(el('h3', 'quiz-question', q.q));
        const opts = el('div', 'quiz-options');
        q.opts.forEach((text, idx) => {
            const btn = el('button', 'quiz-opt', text);
            btn.onclick = () => {
                if (idx === q.a) { btn.classList.add('correct'); score++; }
                else { btn.classList.add('wrong'); }
                stage.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
                stage.querySelectorAll('.quiz-opt')[q.a].classList.add('correct');
                setTimeout(() => { i++; render(); }, 900);
            };
            opts.appendChild(btn);
        });
        stage.appendChild(opts);
    }
    render();
}

// =========================================================
// 9. NEPTUNO — Captura a Tritón (luna retrógrada)
// =========================================================
function game_neptune(c) {
    c.appendChild(el('p', 'game-intro', 'Tritón orbita Neptuno en sentido retrógrado. Haz clic en Tritón cuando pase por la zona dorada de captura. ¡5 capturas para ganar!'));

    const arena = el('div', 'arena triton-arena');
    c.appendChild(arena);

    const hud = el('div', 'arena-hud', 'Capturas: <span id="tr-score">0</span>/5');
    c.appendChild(hud);

    const cx = 240, cy = 160, R = 110;

    const neptune = el('div', 'neptune-center');
    arena.appendChild(neptune);

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 480 320');
    svg.setAttribute('class', 'triton-svg');
    arena.appendChild(svg);

    const orbit = document.createElementNS(SVG_NS, 'circle');
    orbit.setAttribute('cx', cx);
    orbit.setAttribute('cy', cy);
    orbit.setAttribute('r', R);
    orbit.setAttribute('fill', 'none');
    orbit.setAttribute('stroke', 'rgba(86, 119, 212, 0.35)');
    orbit.setAttribute('stroke-width', '2');
    orbit.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(orbit);

    const captureArc = document.createElementNS(SVG_NS, 'path');
    captureArc.setAttribute('fill', 'none');
    captureArc.setAttribute('stroke', '#ffd060');
    captureArc.setAttribute('stroke-width', '6');
    captureArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(captureArc);

    function describeArc(cx, cy, r, startAngle, endAngle) {
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
    }

    let windowAngle = Math.random() * Math.PI * 2;
    let windowSize = Math.PI / 4; // ~45° de margen
    function repaintArc() {
        captureArc.setAttribute('d', describeArc(cx, cy, R, windowAngle, windowAngle + windowSize));
    }
    repaintArc();

    let tritonAngle = Math.PI;
    let tritonSpeed = -0.022; 

    const triton = el('div', 'triton-moon');
    arena.appendChild(triton);

    let captures = 0, ended = false;

    function inWindow(a) {
        const TAU = Math.PI * 2;
        const norm = ((a % TAU) + TAU) % TAU;
        const s = ((windowAngle % TAU) + TAU) % TAU;
        const e = (s + windowSize) % TAU;
        return s < e ? (norm >= s && norm <= e) : (norm >= s || norm <= e);
    }

    triton.onclick = (e) => {
        e.stopPropagation();
        if (ended) return;
        if (inWindow(tritonAngle)) {
            captures++;
            document.getElementById('tr-score').textContent = captures;
            arena.classList.add('flash-success');
            setTimeout(() => arena.classList.remove('flash-success'), 250);
            if (captures >= 5) { endGame(true); return; }
            windowAngle = Math.random() * Math.PI * 2;
            windowSize = Math.max(Math.PI / 8, windowSize - Math.PI / 30);
            repaintArc();
            tritonSpeed *= 1.12;
        } else {
            arena.classList.add('flash-error');
            setTimeout(() => arena.classList.remove('flash-error'), 250);
        }
    };

    function endGame(won) {
        ended = true;
        cancelAnimationFrame(rafId);
        if (won) showWin(c, '¡Capturaste a Tritón en su órbita retrógrada!');
        else showLose(c, `Capturas: ${captures}/5`);
    }

    let rafId;
    function tick() {
        if (ended) return;
        tritonAngle += tritonSpeed;
        const x = cx + Math.cos(tritonAngle) * R - 11;
        const y = cy + Math.sin(tritonAngle) * R - 11;
        triton.style.left = x + 'px';
        triton.style.top = y + 'px';
        triton.classList.toggle('in-window', inWindow(tritonAngle));
        rafId = requestAnimationFrame(tick);
    }
    tick();
    c._cleanup = () => { ended = true; cancelAnimationFrame(rafId); };
}

// =========================================================
// 10. PLUTÓN — Sopa de Letras
// =========================================================
function game_pluto(c) {
    c.appendChild(el('p', 'game-intro', 'Encuentra las 5 palabras ocultas. Haz clic en la primera y última letra de cada palabra.'));

    const words = ['HIELO', 'KUIPER', 'ENANO', 'NITROGENO', 'CARONTE'];
    const SIZE = 11;
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));

    function place(word) {
        const dirs = [[0, 1], [1, 0], [1, 1]];
        for (let attempt = 0; attempt < 100; attempt++) {
            const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
            const r = Math.floor(Math.random() * SIZE);
            const cc = Math.floor(Math.random() * SIZE);
            const er = r + dr * (word.length - 1);
            const ec = cc + dc * (word.length - 1);
            if (er >= SIZE || ec >= SIZE) continue;
            let ok = true;
            for (let i = 0; i < word.length; i++) {
                const cell = grid[r + dr * i][cc + dc * i];
                if (cell && cell !== word[i]) { ok = false; break; }
            }
            if (!ok) continue;
            for (let i = 0; i < word.length; i++) {
                grid[r + dr * i][cc + dc * i] = word[i];
            }
            return { word, r, c: cc, dr, dc };
        }
        return null;
    }
    const placed = words.map(place).filter(Boolean);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < SIZE; r++) {
        for (let cc = 0; cc < SIZE; cc++) {
            if (!grid[r][cc]) grid[r][cc] = letters[Math.floor(Math.random() * letters.length)];
        }
    }

    const wrap = el('div', 'wordsearch-wrap');
    const board = el('div', 'wordsearch-grid');
    board.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;

    let firstCell = null;
    let foundWords = 0;

    for (let r = 0; r < SIZE; r++) {
        for (let cc = 0; cc < SIZE; cc++) {
            const cell = el('div', 'ws-cell', grid[r][cc]);
            cell.dataset.r = r;
            cell.dataset.c = cc;
            cell.onclick = () => {
                if (cell.classList.contains('found')) return;
                if (!firstCell) {
                    firstCell = cell;
                    cell.classList.add('selected');
                    return;
                }
                const r1 = +firstCell.dataset.r, c1 = +firstCell.dataset.c;
                const r2 = +cell.dataset.r, c2 = +cell.dataset.c;
                const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
                const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
                let str = '';
                for (let i = 0; i < len; i++) str += grid[r1 + dr * i][c1 + dc * i];
                const reversed = str.split('').reverse().join('');
                const target = placed.find(p => (p.word === str || p.word === reversed));
                firstCell.classList.remove('selected');
                if (target) {
                    for (let i = 0; i < len; i++) {
                        const e2 = board.querySelector(`[data-r="${r1 + dr * i}"][data-c="${c1 + dc * i}"]`);
                        e2.classList.add('found');
                    }
                    foundWords++;
                    document.querySelector(`[data-word="${target.word}"]`).classList.add('done');
                    if (foundWords >= placed.length) showWin(c, `¡Encontraste las ${placed.length} palabras!`);
                }
                firstCell = null;
            };
            board.appendChild(cell);
        }
    }
    wrap.appendChild(board);

    const list = el('div', 'wordsearch-words');
    placed.forEach(p => {
        const w = el('div', 'ws-word', p.word);
        w.dataset.word = p.word;
        list.appendChild(w);
    });
    wrap.appendChild(list);
    c.appendChild(wrap);
}

// =========================================================
// DESPACHADOR
// =========================================================
const GAMES = {
    sun: game_sun,
    mercury: game_mercury,
    venus: game_venus,
    earth: game_earth,
    mars: game_mars,
    jupiter: game_jupiter,
    saturn: game_saturn,
    uranus: game_uranus,
    neptune: game_neptune,
    pluto: game_pluto
};

let currentBody = null;

export function openGame(planetId) {
    const modal = document.getElementById('game-modal');
    const body = document.getElementById('game-body');
    const title = document.getElementById('game-title');
    if (!modal || !body) return;

    title.textContent = GAME_TITLES[planetId] || 'MINIJUEGO';
    body.innerHTML = '';
    currentBody = body;

    const fn = GAMES[planetId];
    if (fn) fn(body);
    else body.appendChild(el('p', 'game-intro', 'Próximamente...'));

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
}

export function closeGame() {
    const modal = document.getElementById('game-modal');
    if (!modal) return;
    if (currentBody && currentBody._cleanup) currentBody._cleanup();
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; if (currentBody) currentBody.innerHTML = ''; }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('game-close');
    const backdrop = document.getElementById('game-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeGame);
    if (backdrop) backdrop.addEventListener('click', closeGame);
    // ESC se maneja centralizado en interaction.js
});
