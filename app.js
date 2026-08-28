/**
 * CNC PathSim Pro
 * Professional G-code Simulator for VMC / HMC / 5-Axis
 * HTML + CSS + Vanilla JS + Three.js + CodeMirror
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  //  G-CODE MODE FOR CODEMIRROR
  // ═══════════════════════════════════════════════════════════
  CodeMirror.defineSimpleMode('gcode', {
    start: [
      { regex: /;.*$/, token: 'comment' },
      { regex: /\(.*?\)/, token: 'comment' },
      { regex: /\bG0+\b/i, token: 'keyword rapid' },
      { regex: /\bG0*1\b/i, token: 'keyword cut' },
      { regex: /\bG0*[23]\b/i, token: 'keyword arc' },
      { regex: /\bG\d+(\.\d+)?\b/i, token: 'keyword' },
      { regex: /\bM\d+(\.\d+)?\b/i, token: 'atom' },
      { regex: /\bT\d+\b/i, token: 'variable-2' },
      { regex: /\b[XYZABC]\s*-?\d*\.?\d+/i, token: 'number' },
      { regex: /\b[IJKR]\s*-?\d*\.?\d+/i, token: 'number' },
      { regex: /\b[FSH]\s*-?\d*\.?\d+/i, token: 'attribute' },
      { regex: /\bN\d+\b/i, token: 'def' },
      { regex: /[A-Za-z]/, token: 'variable' },
      { regex: /-?\d+\.?\d*/, token: 'number' },
    ],
    meta: { lineComment: ';' }
  });

  // ═══════════════════════════════════════════════════════════
  //  EXAMPLES
  // ═══════════════════════════════════════════════════════════
  const EXAMPLES = {
    pocket: `; Cavidad rectangular VMC
; Material: Aluminio 6061
G21 G90 G17 G40 G49 G80
G54
T1 M6
S12000 M3
G0 X0 Y0 Z50
G0 Z5
G1 Z-2 F200
G1 X40 F800
G1 Y30
G1 X0
G1 Y0
G1 Z-4 F200
G1 X40 F800
G1 Y30
G1 X0
G1 Y0
G1 Z-6 F200
G1 X40 F800
G1 Y30
G1 X0
G1 Y0
G0 Z50
M5
M30`,

    circle: `; Contorno circular + arcos
G21 G90 G17
G54
T2 M6
S8000 M3
G0 X0 Y0 Z30
G0 Z2
G1 Z-1.5 F150
G2 X20 Y0 I10 J0 F600
G2 X0 Y0 I-10 J0
G0 Z5
G0 X5 Y0
G1 Z-1.5 F150
G3 X15 Y0 I5 J0 F500
G3 X5 Y0 I-5 J0
G0 Z30
M5
M30`,

    g81: `; Ciclo G81 — Taladrado simple
; R = plano de aproximación, Z = profundidad final
G21 G90 G17 G40 G49
G54
T3 M6
S2500 M3
G0 X0 Y0 Z50
G98
G81 X10 Y10 Z-15 R2 F120
X30 Y10
X50 Y10
X10 Y30
X30 Y30
X50 Y30
G80
G0 Z50
M5
M30`,

    g83: `; Ciclo G83 — Peck drill (taladrado interrumpido)
; Q = profundidad por picado
G21 G90 G17
G54
T4 M6
S1800 M3
G0 X0 Y0 Z50
G98
G83 X15 Y15 Z-25 R3 Q5 F80
X35 Y15
X15 Y35
X35 Y35
G80
G0 Z50
M5
M30`,

    bolt: `; Círculo de agujeros — G81 (6 taladros)
G21 G90 G17
G54
T3 M6
S3000 M3
G0 X0 Y0 Z40
G98
G81 X20 Y0 Z-10 R2 F100
X10 Y17.321
X-10 Y17.321
X-20 Y0
X-10 Y-17.321
X10 Y-17.321
G80
G0 Z40
M5
M30`,

    face: `; Face mill / Refrentado
G21 G90 G17
G54
T1 M6
S4000 M3
G0 X-5 Y-5 Z30
G0 Z2
G1 Z-0.5 F300
G1 X55 F900
G1 Y10
G1 X-5
G1 Y25
G1 X55
G1 Y40
G1 X-5
G0 Z30
M5
M30`,

    slot: `; Ranura / Slot
G21 G90 G17
G54
T5 M6
S6000 M3
G0 X0 Y15 Z30
G0 Z2
G1 Z-3 F200
G1 X50 F600
G0 Z2
G0 Y15
G1 Z-6 F200
G1 X0 F600
G0 Z30
M5
M30`,

    '5axis': `; Trayectoria 5 ejes (simulación A/C)
; Nota: visualización de ejes rotativos
G21 G90 G17
G54
T4 M6
S15000 M3
G0 X0 Y0 Z60 A0 C0
G0 Z10
G1 Z0 F300
G1 X20 Y0 A15 F800
G1 X20 Y20 A30 C45
G1 X0 Y20 A15 C90
G1 X0 Y0 A0 C0
G1 X10 Y10 A-10 C180 F600
G1 X-10 Y10 A10 C270
G1 X-10 Y-10 A-5 C0
G1 X10 Y-10 A0 C90
G1 X0 Y0 A0 C0
G0 Z60
M5
M30`,

    hmc: `; Cara HMC + indexación
G21 G90 G17
G54
T1 M6
S6000 M3
G0 X0 Y0 Z80
G0 Z10
; Cara frontal
G1 Z-1 F200
G1 X50 F700
G1 Y40
G1 X0
G1 Y0
G0 Z20
; Índice B90 (simulado)
G0 X0 Y0
G1 Z-1 F200
G1 X40 F700
G1 Y30
G1 X0
G1 Y0
G0 Z80
M5
M30`,

    g82: `; Ciclo G82 — Taladrado con dwell (P)
G21 G90 G17
G54
T3 M6
S2000 M3
G0 X0 Y0 Z40
G98
G82 X10 Y10 Z-8 R2 P0.5 F100
X30 Y10
X10 Y30
G80
G0 Z40
M5
M30`,

    g85: `; Ciclo G85 — Boring (entrada y salida a feed)
G21 G90 G17
G54
T6 M6
S1200 M3
G0 X0 Y0 Z40
G98
G85 X20 Y20 Z-12 R3 F80
X40 Y20
X20 Y40
G80
G0 Z40
M5
M30`,

    g89: `; Ciclo G89 — Boring + dwell + salida a feed
G21 G90 G17
G54
T6 M6
S1000 M3
G0 X0 Y0 Z40
G98
G89 X15 Y15 Z-10 R2 P1 F70
X35 Y15
G80
G0 Z40
M5
M30`,

    g18arc: `; Arcos en plano G18 (XZ)
G21 G90 G17
G54
T2 M6
S5000 M3
G0 X0 Y0 Z30
G0 Z5
G18
G1 X0 Z0 F300
G2 X20 Z0 I10 K0 F400
G3 X0 Z0 I-10 K0
G17
G0 Z30
M5
M30`,

    comp: `; Contorno con G41 (comp. radio visual)
G21 G90 G17 G40
G54
T1 M6
S8000 M3
G0 X0 Y0 Z30
G0 Z2
G1 Z-2 F200
G41 D1
G1 X5 Y5 F600
G1 X35 Y5
G1 X35 Y25
G1 X5 Y25
G1 X5 Y5
G40
G0 Z30
M5
M30`,

    lathe: `; Torno — perfil exterior + G71 visual
; X = diámetro (modo diámetro en panel)
G21 G90 G18
G54
T1 M6
S1200 M3
G0 X42 Z5
; Desbaste G71 (U = paso radial visual)
G71 U1.5 R0.5
G71 P10 Q20 U0.4 W0.1 F0.2
N10 G0 X28
G1 Z-25 F0.15
G1 X32 Z-28
G1 Z-35
G1 X40
N20 G0 X42
G0 Z5
M5
M30`,

    m98: `; Subprograma M98/M99
G21 G90 G17
G54
T1 M6
S5000 M3
G0 X0 Y0 Z30
M98 P1000 L2
G0 Z30
M5
M30

O1000
G0 X10 Y10 Z5
G1 Z-2 F200
G1 X30 F400
G1 Y30
G1 X10
G1 Y10
G0 Z5
M99
`,

    latheface: `; Torno — refrentado G72 visual
G21 G90 G18
G54
T1 M6
S1000 M3
G0 X45 Z2
G72 W1.0 R0.5
G72 P30 Q40 U0.2 W0.1 F0.2
N30 G0 Z-2
G1 X20 F0.15
G1 Z0
N40 G0 X45
G0 Z5
M5
M30`,

    g76: `; Torno — roscado G76 (M12x1.75 visual)
; X = diámetro, F = paso, Q = DOC (mm o 1/1000), P = altura rosca
G21 G90 G18
G54
T3 M6
S600 M3
G0 X14 Z5
G0 Z2
; Bloque 1: parámetros
G76 P020060 Q100 R0.05
; Bloque 2: trayectoria
G76 X10.106 Z-20 P947 Q200 F1.75
G0 X20 Z5
M5
M30`
  };

  // ═══════════════════════════════════════════════════════════
  //  G-CODE PARSER & INTERPRETER (with G81/G83 expansion)
  // ═══════════════════════════════════════════════════════════
  class GCodeParser {
    constructor() {
      this.reset();
    }

    reset() {
      this.state = {
        x: 0, y: 0, z: 0, a: 0, c: 0,
        i: 0, j: 0, k: 0, r: 0,
        f: 0, s: 0,
        absolute: true,
        plane: 'XY',
        units: 'mm',
        motion: 'G0',
        tool: 0,
        spindle: 0,
        coolant: false,
        wcs: 'G54',
        comp: 0,       // 0=G40, 1=G41 left, -1=G42 right
        compD: 0,      // D offset register (approx = tool#)
        cycle: null,
        cycleR: 0,
        cycleZ: 0,
        cycleQ: 0,
        cycleP: 0,
        retractInitial: true,
        initialZ: 0,
        latheU: 0,   // G71 depth of cut (radius)
        latheW: 0,   // G72 depth of cut (Z)
        latheMode: null, // 'G71' | 'G72' | 'G76' | null
        g76Q: 0.2,   // first/DOC radial (mm)
        g76R: 0,     // finish allowance
        g76P: 0      // thread height (radius, mm)
      };
      this.segments = [];
      this.stats = { moves: 0, distance: 0, rapids: 0, cuts: 0, arcs: 0, cycles: 0, dwellSec: 0 };
      this.bbox = { min: { x: Infinity, y: Infinity, z: Infinity }, max: { x: -Infinity, y: -Infinity, z: -Infinity } };
    }

    parse(text) {
      this.reset();
      // Expand M98/M99 subprograms first
      const expanded = this._expandSubprograms(text);
      const lines = expanded.split(/\r?\n/);
      const result = [];

      for (let li = 0; li < lines.length; li++) {
        const raw = lines[li];
        const cleaned = raw.replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
        if (!cleaned) {
          result.push({ lineNum: li + 1, raw, type: 'empty', words: {} });
          continue;
        }

        const words = this._parseWords(cleaned);
        // Skip O numbers / M99 as pure meta after expansion
        if (words.O !== undefined && Object.keys(words).length === 1) {
          result.push({ lineNum: li + 1, raw, type: 'meta', words });
          continue;
        }
        if (words.M === 99) {
          result.push({ lineNum: li + 1, raw, type: 'meta', words });
          continue;
        }
        if (words.M === 98) {
          result.push({ lineNum: li + 1, raw, type: 'meta', words });
          continue;
        }

        const segs = this._interpret(words, li + 1, raw);
        if (segs && segs.length) {
          segs.forEach(seg => this.segments.push(seg));
          result.push(...segs);
        } else {
          result.push({ lineNum: li + 1, raw, type: 'meta', words });
        }
      }
      return { segments: this.segments, lines: result, stats: this.stats, bbox: this.bbox, state: { ...this.state } };
    }

    /**
     * Expand M98 Pxxxx Lnn / M99 subprograms in one file.
     * Supports O1000 ... M99 blocks and N1000 labels as entry.
     */
    _expandSubprograms(text) {
      const src = text.split(/\r?\n/);
      // Index O-numbers and also lines that start with N#### when used as sub
      const oMap = {}; // oNum -> { start, end }
      for (let i = 0; i < src.length; i++) {
        const c = src[i].replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
        const om = c.match(/^O(\d+)/i) || c.match(/\bO(\d+)/i);
        if (om) {
          const num = parseInt(om[1], 10);
          if (!oMap[num]) oMap[num] = { start: i, end: -1 };
        }
        if (/\bM99\b/i.test(c)) {
          // close nearest open O without end
          const keys = Object.keys(oMap).map(Number).sort((a, b) => oMap[b].start - oMap[a].start);
          for (const k of keys) {
            if (oMap[k].end < 0 && oMap[k].start < i) {
              oMap[k].end = i;
              break;
            }
          }
        }
      }
      // Fallback: if O has no M99, end at next O or EOF
      const oNums = Object.keys(oMap).map(Number).sort((a, b) => oMap[a].start - oMap[b].start);
      for (let i = 0; i < oNums.length; i++) {
        const n = oNums[i];
        if (oMap[n].end < 0) {
          oMap[n].end = i + 1 < oNums.length ? oMap[oNums[i + 1]].start - 1 : src.length - 1;
        }
      }

      const out = [];
      const expandLine = (i, depth) => {
        if (depth > 8) {
          out.push('; ERROR: subprogram recursion limit');
          return;
        }
        if (i < 0 || i >= src.length) return;
        const raw = src[i];
        const cleaned = raw.replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
        const words = this._parseWords(cleaned);
        if (words.M === 98 && words.P !== undefined) {
          // P can be 1000 or 01000; L = repeats
          let p = words.P;
          // Fanuc sometimes encodes L in P as Pllllpppp — keep simple: P = program
          const prog = Math.floor(p) % 10000; // allow Pxxxyyyy forms partially
          const pStr = String(Math.floor(p));
          let oNum = Math.floor(p);
          if (pStr.length > 4) oNum = parseInt(pStr.slice(-4), 10);
          const reps = words.L !== undefined ? Math.max(1, Math.floor(words.L)) : 1;
          const block = oMap[oNum];
          out.push(raw + ' ; CALL O' + oNum + ' x' + reps);
          if (block) {
            for (let r = 0; r < reps; r++) {
              for (let j = block.start; j <= block.end; j++) {
                const line = src[j];
                const cc = line.replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
                if (/\bM99\b/i.test(cc)) break;
                if (/^\s*O\d+/i.test(cc)) continue;
                // nested M98
                const w2 = this._parseWords(cc);
                if (w2.M === 98) {
                  expandLine(j, depth + 1);
                } else {
                  out.push(line);
                }
              }
            }
          } else {
            out.push('; WARN: subprograma O' + oNum + ' no encontrado');
          }
          return;
        }
        if (words.M === 99) return; // don't emit return in main expansion of body
        out.push(raw);
      };

      // Main program = lines before first O, or all lines that aren't inside O blocks only for main
      // Strategy: walk all lines; if inside an O body at depth 0 of main file, skip until called
      const inSub = new Array(src.length).fill(false);
      Object.keys(oMap).forEach(k => {
        const b = oMap[k];
        for (let j = b.start; j <= b.end; j++) inSub[j] = true;
      });

      for (let i = 0; i < src.length; i++) {
        if (inSub[i]) {
          // still allow M98 in main only — skip O bodies in main stream
          const cleaned = src[i].replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
          // keep O headers as comments in expanded for clarity? skip
          continue;
        }
        expandLine(i, 0);
      }
      // If entire file is only subprograms + calls... also if no main content, expand any top-level M98 already handled

      // If file has no "main" (all inSub), run from start including O0 style — fallback: process all with expand but skip O definitions until called
      if (out.length === 0) {
        for (let i = 0; i < src.length; i++) expandLine(i, 0);
      }

      return out.join('\n');
    }

    _parseWords(line) {
      const words = {};
      const re = /([A-Za-z])\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)/g;
      let m;
      while ((m = re.exec(line)) !== null) {
        const letter = m[1].toUpperCase();
        const val = parseFloat(m[2]);
        if (!isNaN(val)) words[letter] = val;
      }
      return words;
    }

    _makeSeg(lineNum, raw, type, from, to, extra) {
      const dist = Math.sqrt(
        Math.pow(to.x - from.x, 2) +
        Math.pow(to.y - from.y, 2) +
        Math.pow(to.z - from.z, 2)
      );
      if (type === 'rapid') this.stats.rapids++;
      else if (type === 'cut') this.stats.cuts++;
      else if (type && type.startsWith('arc')) this.stats.arcs++;
      this.stats.moves++;
      this.stats.distance += dist;
      this._updateBBox(from);
      this._updateBBox(to);
      const s = this.state;
      return Object.assign({
        lineNum, raw, type,
        from: { x: from.x, y: from.y, z: from.z, a: from.a || 0, c: from.c || 0 },
        to: { x: to.x, y: to.y, z: to.z, a: to.a || 0, c: to.c || 0 },
        arc: null,
        feed: s.f,
        spindle: s.spindle,
        tool: s.tool,
        plane: s.plane,
        absolute: s.absolute,
        units: s.units,
        wcs: s.wcs,
        coolant: s.coolant,
        distance: dist,
        words: {}
      }, extra || {});
    }

    _expandCycle(lineNum, raw, holeX, holeY) {
      const s = this.state;
      const segs = [];
      const R = s.cycleR;
      const Z = s.cycleZ;
      const retractZ = s.retractInitial ? s.initialZ : R;
      let cur = { x: s.x, y: s.y, z: s.z, a: s.a, c: s.c };

      // Rapid to hole XY at current Z (or retract plane)
      if (cur.x !== holeX || cur.y !== holeY) {
        const toXY = { x: holeX, y: holeY, z: cur.z, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toXY));
        cur = toXY;
      }

      // Rapid down to R plane
      if (cur.z !== R) {
        const toR = { x: holeX, y: holeY, z: R, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toR));
        cur = toR;
      }

      const feedToZ = () => {
        const toZ = { x: holeX, y: holeY, z: Z, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'cut', cur, toZ, { dwell: 0 }));
        cur = toZ;
      };
      const rapidRetract = () => {
        const toRet = { x: holeX, y: holeY, z: retractZ, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toRet));
        cur = toRet;
      };
      const feedRetract = () => {
        const toRet = { x: holeX, y: holeY, z: retractZ, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'cut', cur, toRet));
        cur = toRet;
      };
      const applyDwell = () => {
        if (s.cycleP > 0 && segs.length) {
          segs[segs.length - 1].dwell = (segs[segs.length - 1].dwell || 0) + s.cycleP;
          this.stats.dwellSec = (this.stats.dwellSec || 0) + s.cycleP;
        }
      };

      if (s.cycle === 'G81') {
        // Drill: feed in, rapid out
        feedToZ();
        rapidRetract();
      } else if (s.cycle === 'G82') {
        // Drill with dwell: feed in, dwell, rapid out
        feedToZ();
        applyDwell();
        rapidRetract();
      } else if (s.cycle === 'G83') {
        // Peck drill
        const Q = Math.abs(s.cycleQ) || 1;
        const goingDown = Z < R;
        let depth = R;
        const target = Z;
        while (true) {
          let nextDepth = goingDown ? depth - Q : depth + Q;
          if (goingDown && nextDepth <= target) nextDepth = target;
          if (!goingDown && nextDepth >= target) nextDepth = target;
          const toPeck = { x: holeX, y: holeY, z: nextDepth, a: cur.a, c: cur.c };
          segs.push(this._makeSeg(lineNum, raw, 'cut', cur, toPeck));
          cur = toPeck;
          depth = nextDepth;
          if (depth === target) break;
          const toClear = { x: holeX, y: holeY, z: R, a: cur.a, c: cur.c };
          segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toClear));
          cur = toClear;
          const approach = goingDown ? depth + 0.5 : depth - 0.5;
          const toApproach = { x: holeX, y: holeY, z: approach, a: cur.a, c: cur.c };
          segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toApproach));
          cur = toApproach;
        }
        rapidRetract();
      } else if (s.cycle === 'G84') {
        // Tapping (simplified): feed in, feed out
        feedToZ();
        feedRetract();
      } else if (s.cycle === 'G85') {
        // Boring: feed in, feed out
        feedToZ();
        feedRetract();
      } else if (s.cycle === 'G86') {
        // Boring: feed in, rapid out
        feedToZ();
        rapidRetract();
      } else if (s.cycle === 'G89') {
        // Boring with dwell: feed in, dwell, feed out
        feedToZ();
        applyDwell();
        feedRetract();
      } else {
        // Fallback like G81
        feedToZ();
        rapidRetract();
      }

      s.x = cur.x; s.y = cur.y; s.z = cur.z;
      this.stats.cycles++;
      return segs;
    }

    _activateCycle(g, words) {
      const s = this.state;
      s.cycle = 'G' + g;
      s.motion = s.cycle;
      s.initialZ = s.z;
      if (words.R !== undefined) s.cycleR = s.absolute ? words.R : s.z + words.R;
      if (words.Z !== undefined) s.cycleZ = s.absolute ? words.Z : s.z + words.Z;
      if (words.Q !== undefined) s.cycleQ = Math.abs(words.Q);
      if (words.P !== undefined) {
        // P often ms on Fanuc if large; treat >= 100 as ms
        s.cycleP = words.P >= 100 ? words.P / 1000 : words.P;
      }
    }

    _interpret(words, lineNum, raw) {
      const s = this.state;
      let changed = false;

      if (words.G !== undefined) {
        const g = words.G;
        if (g === 0) { s.motion = 'G0'; s.cycle = null; changed = true; }
        else if (g === 1) { s.motion = 'G1'; s.cycle = null; changed = true; }
        else if (g === 2) { s.motion = 'G2'; s.cycle = null; changed = true; }
        else if (g === 3) { s.motion = 'G3'; s.cycle = null; changed = true; }
        else if (g === 17) { s.plane = 'XY'; }
        else if (g === 18) { s.plane = 'XZ'; }
        else if (g === 19) { s.plane = 'YZ'; }
        else if (g === 20) { s.units = 'inch'; }
        else if (g === 21) { s.units = 'mm'; }
        else if (g === 40) { s.comp = 0; }
        else if (g === 41) { s.comp = 1; }
        else if (g === 42) { s.comp = -1; }
        else if (g === 90) { s.absolute = true; }
        else if (g === 91) { s.absolute = false; }
        else if (g === 98) { s.retractInitial = true; }
        else if (g === 99) { s.retractInitial = false; }
        else if (g === 80) { s.cycle = null; }
        else if (g === 81 || g === 82 || g === 83 || g === 84 || g === 85 || g === 86 || g === 89) {
          this._activateCycle(g, words);
          changed = true;
        }
        else if (g === 71) {
          s.latheMode = 'G71';
          if (words.U !== undefined) s.latheU = Math.abs(words.U);
          if (words.W !== undefined) s.latheW = Math.abs(words.W);
          changed = true;
        }
        else if (g === 72) {
          s.latheMode = 'G72';
          if (words.W !== undefined) s.latheW = Math.abs(words.W);
          if (words.U !== undefined) s.latheU = Math.abs(words.U);
          changed = true;
        }
        else if (g === 76) {
          // Threading cycle — first block may only set P/Q/R; second has X Z F
          s.latheMode = 'G76';
          if (words.Q !== undefined) {
            const q = Math.abs(words.Q);
            s.g76Q = q >= 10 ? q / 1000 : q; // Fanuc often 1/1000 mm
          }
          if (words.R !== undefined) {
            const r = Math.abs(words.R);
            s.g76R = r >= 10 ? r / 1000 : r;
          }
          if (words.P !== undefined && words.X === undefined && words.Z === undefined) {
            // First-block P (aa bb cc) — ignore for visual
          } else if (words.P !== undefined) {
            const p = Math.abs(words.P);
            s.g76P = p >= 20 ? p / 1000 : p; // thread height microns → mm
          }
          if (words.F !== undefined) s.f = words.F; // pitch
          changed = true;
        }
        else if (g >= 54 && g <= 59) { s.wcs = 'G' + g; }
      }

      // G76 second block with X/Z → expand threading passes
      if (words.G === 76 && (words.X !== undefined || words.Z !== undefined)) {
        return this._expandG76(lineNum, raw, words);
      }
      if (words.D !== undefined) s.compD = words.D;

      if (s.cycle && words.R !== undefined && (words.G === undefined || [81,82,83,84,85,86,89].indexOf(words.G) >= 0)) {
        if (words.G === undefined) s.cycleR = s.absolute ? words.R : s.z + words.R;
      }
      if (s.cycle && words.Z !== undefined && words.G === undefined) {
        s.cycleZ = s.absolute ? words.Z : s.z + words.Z;
      }
      if (s.cycle === 'G83' && words.Q !== undefined) s.cycleQ = Math.abs(words.Q);
      if ((s.cycle === 'G82' || s.cycle === 'G89') && words.P !== undefined) {
        s.cycleP = words.P >= 100 ? words.P / 1000 : words.P;
      }

      if (words.M !== undefined) {
        const m = words.M;
        if (m === 3) s.spindle = 1;
        else if (m === 4) s.spindle = -1;
        else if (m === 5) s.spindle = 0;
        else if (m === 7 || m === 8) s.coolant = true;
        else if (m === 9) s.coolant = false;
        else if (m === 6 && words.T !== undefined) s.tool = words.T;
      }

      if (words.T !== undefined && words.M === undefined) s.tool = words.T;
      if (words.F !== undefined) s.f = words.F;
      if (words.S !== undefined) s.s = words.S;

      const CYCLE_SET = { G81: 1, G82: 1, G83: 1, G84: 1, G85: 1, G86: 1, G89: 1 };
      if (s.cycle && CYCLE_SET[s.cycle]) {
        const hasXY = words.X !== undefined || words.Y !== undefined;
        const isCycleCmd = words.G === 81 || words.G === 82 || words.G === 83 ||
          words.G === 84 || words.G === 85 || words.G === 86 || words.G === 89;
        if (hasXY || isCycleCmd) {
          let hx = s.x, hy = s.y;
          if (words.X !== undefined) hx = s.absolute ? words.X : s.x + words.X;
          if (words.Y !== undefined) hy = s.absolute ? words.Y : s.y + words.Y;
          if (words.R !== undefined) s.cycleR = s.absolute ? words.R : s.z + words.R;
          if (words.Z !== undefined) s.cycleZ = s.absolute ? words.Z : s.z + words.Z;
          if (words.Q !== undefined) s.cycleQ = Math.abs(words.Q);
          if (words.P !== undefined) s.cycleP = words.P >= 100 ? words.P / 1000 : words.P;
          return this._expandCycle(lineNum, raw, hx, hy);
        }
        if (isCycleCmd && !hasXY) return null;
      }

      const hasMove = ['X','Y','Z','A','C','I','J','K'].some(k => words[k] !== undefined);
      // R alone without cycle already handled
      if (!hasMove && words.G === undefined) return null;

      const from = { x: s.x, y: s.y, z: s.z, a: s.a, c: s.c };
      const to = { x: from.x, y: from.y, z: from.z, a: from.a, c: from.c };

      const apply = (axis, val) => {
        if (val === undefined) return;
        if (s.absolute) to[axis] = val;
        else to[axis] = from[axis] + val;
      };

      apply('x', words.X);
      apply('y', words.Y);
      apply('z', words.Z);
      apply('a', words.A);
      apply('c', words.C);

      s.x = to.x; s.y = to.y; s.z = to.z; s.a = to.a; s.c = to.c;

      const moved = from.x !== to.x || from.y !== to.y || from.z !== to.z || from.a !== to.a || from.c !== to.c;
      if (!moved && !changed) return null;
      // Don't create a motion segment for pure mode changes with no move
      if (!moved) return null;

      // Cutter radius compensation
      if (words.G === 40) s.comp = 0;
      else if (words.G === 41) s.comp = 1;  // left
      else if (words.G === 42) s.comp = -1; // right
      if (words.D !== undefined) s.compD = words.D;

      let type = 'rapid';
      if (s.motion === 'G1') type = 'cut';
      else if (s.motion === 'G2') type = 'arc-cw';
      else if (s.motion === 'G3') type = 'arc-ccw';

      let arc = null;
      if (type.startsWith('arc')) {
        arc = this._computeArc(from, to, words, type, s.plane);
      }

      // Visual expansion G71/G72 (approximate multi-pass)
      if (type === 'cut' && s.latheMode === 'G71' && s.latheU > 0) {
        const dx = to.x - from.x;
        // X decreases toward axis (diameter or radius programming: treat as coordinate)
        if (dx < -s.latheU * 0.5) {
          const segs = [];
          let cur = { ...from };
          const steps = Math.max(1, Math.ceil(Math.abs(dx) / s.latheU));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const nx = from.x + dx * t;
            const nz = from.z + (to.z - from.z) * t;
            const ny = from.y + (to.y - from.y) * t;
            const next = { x: nx, y: ny, z: nz, a: to.a, c: to.c };
            // Cut at intermediate X, then small retract in Z style
            segs.push(this._makeSeg(lineNum, raw, 'cut', cur, next, {
              words, plane: s.plane, tool: s.tool, feed: s.f, lathe: 'G71'
            }));
            cur = next;
          }
          this.stats.cycles++;
          return segs;
        }
      }
      if (type === 'cut' && s.latheMode === 'G72' && s.latheW > 0) {
        const dz = to.z - from.z;
        if (Math.abs(dz) > s.latheW * 0.5) {
          const segs = [];
          let cur = { ...from };
          const steps = Math.max(1, Math.ceil(Math.abs(dz) / s.latheW));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const next = {
              x: from.x + (to.x - from.x) * t,
              y: from.y + (to.y - from.y) * t,
              z: from.z + dz * t,
              a: to.a, c: to.c
            };
            segs.push(this._makeSeg(lineNum, raw, 'cut', cur, next, {
              words, plane: s.plane, tool: s.tool, feed: s.f, lathe: 'G72'
            }));
            cur = next;
          }
          this.stats.cycles++;
          return segs;
        }
      }

      const seg = this._makeSeg(lineNum, raw, type, from, to, {
        arc, words, plane: s.plane, tool: s.tool, feed: s.f,
        comp: s.comp, compD: s.compD
      });
      return [seg];
    }

    _expandG76(lineNum, raw, words) {
      const s = this.state;
      const from = { x: s.x, y: s.y, z: s.z, a: s.a, c: s.c };
      let endX = from.x, endZ = from.z;
      if (words.X !== undefined) endX = s.absolute ? words.X : from.x + words.X;
      if (words.Z !== undefined) endZ = s.absolute ? words.Z : from.z + words.Z;
      if (words.F !== undefined) s.f = words.F;
      if (words.Q !== undefined) {
        const q = Math.abs(words.Q);
        s.g76Q = q >= 10 ? q / 1000 : q;
      }
      if (words.P !== undefined) {
        const p = Math.abs(words.P);
        s.g76P = p >= 20 ? p / 1000 : p;
      }

      const pitch = s.f > 0 ? s.f : 1.5;
      const doc = Math.max(s.g76Q || 0.2, 0.05);
      const finish = s.g76R || 0;

      let startX = Math.max(from.x, endX);
      if (s.g76P > 0) startX = Math.max(startX, endX + 2 * s.g76P);
      const targetX = endX + (finish > 0 ? 2 * finish : 0);
      const clearX = startX + Math.max(2, Math.abs(startX - endX) * 0.1);
      const zStart = from.z;
      const zEnd = endZ;

      const radialSpan = Math.abs(startX - targetX) / 2;
      const passes = Math.max(1, Math.min(40, Math.ceil(radialSpan / Math.max(doc, 0.05))));
      const segs = [];
      let cur = { ...from };

      const toClear = { x: clearX, y: cur.y, z: zStart, a: cur.a, c: cur.c };
      if (cur.x !== clearX || cur.z !== zStart) {
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toClear, { lathe: 'G76' }));
        cur = toClear;
      }

      for (let i = 1; i <= passes; i++) {
        const t = i / passes;
        const xPass = startX + (targetX - startX) * t;
        const passLabel = 'P' + i + '/' + passes;
        const toStart = { x: xPass, y: cur.y, z: zStart, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toStart, {
          lathe: 'G76', pass: i, passes: passes, passLabel: passLabel
        }));
        cur = toStart;
        const zSteps = Math.max(4, Math.ceil(Math.abs(zEnd - zStart) / Math.max(pitch * 0.5, 0.25)));
        for (let k = 1; k <= zSteps; k++) {
          const tk = k / zSteps;
          const zk = zStart + (zEnd - zStart) * tk;
          const next = { x: xPass, y: cur.y, z: zk, a: cur.a, c: cur.c };
          segs.push(this._makeSeg(lineNum, raw, 'cut', cur, next, {
            lathe: 'G76', feed: pitch, words: words, pass: i, passes: passes, passLabel: passLabel, thread: true
          }));
          cur = next;
        }
        const toRet = { x: clearX, y: cur.y, z: zEnd, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toRet, {
          lathe: 'G76', pass: i, passes: passes, passLabel: passLabel
        }));
        cur = toRet;
        const toZ0 = { x: clearX, y: cur.y, z: zStart, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toZ0, {
          lathe: 'G76', pass: i, passes: passes, passLabel: passLabel
        }));
        cur = toZ0;
      }

      if (Math.abs(targetX - endX) > 1e-4) {
        const passLabel = 'FINISH';
        const toStart = { x: endX, y: cur.y, z: zStart, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toStart, {
          lathe: 'G76', pass: passes + 1, passes: passes + 1, passLabel: passLabel
        }));
        cur = toStart;
        const zSteps = Math.max(4, Math.ceil(Math.abs(zEnd - zStart) / Math.max(pitch * 0.5, 0.25)));
        for (let k = 1; k <= zSteps; k++) {
          const tk = k / zSteps;
          const zk = zStart + (zEnd - zStart) * tk;
          const next = { x: endX, y: cur.y, z: zk, a: cur.a, c: cur.c };
          segs.push(this._makeSeg(lineNum, raw, 'cut', cur, next, {
            lathe: 'G76', feed: pitch, words: words, pass: passes + 1, passLabel: passLabel, thread: true
          }));
          cur = next;
        }
        const toRet = { x: clearX, y: cur.y, z: zEnd, a: cur.a, c: cur.c };
        segs.push(this._makeSeg(lineNum, raw, 'rapid', cur, toRet, { lathe: 'G76', passLabel: passLabel }));
        cur = toRet;
      }

      s.x = cur.x; s.y = cur.y; s.z = cur.z;
      this.stats.cycles++;
      return segs;
    }

    _computeArc(from, to, words, type, plane) {
      const i = words.I || 0;
      const j = words.J || 0;
      const k = words.K || 0;
      plane = plane || 'XY';

      // Axis mapping per plane: (u,v) primary plane, w = out-of-plane
      // XY: u=x v=y offsets I,J ; XZ: u=x v=z offsets I,K ; YZ: u=y v=z offsets J,K
      let fu, fv, tu, tv, fw, tw, ou, ov;
      if (plane === 'XZ') {
        fu = from.x; fv = from.z; tu = to.x; tv = to.z; fw = from.y; tw = to.y;
        ou = i; ov = k;
      } else if (plane === 'YZ') {
        fu = from.y; fv = from.z; tu = to.y; tv = to.z; fw = from.x; tw = to.x;
        ou = j; ov = k;
      } else {
        fu = from.x; fv = from.y; tu = to.x; tv = to.y; fw = from.z; tw = to.z;
        ou = i; ov = j;
      }

      let cu, cv, radius;
      if (words.R !== undefined) {
        radius = Math.abs(words.R);
        const du = tu - fu, dv = tv - fv;
        const d = Math.sqrt(du * du + dv * dv);
        if (d > 0 && d <= 2 * radius) {
          const h = Math.sqrt(Math.max(0, radius * radius - (d / 2) * (d / 2)));
          const mu = (fu + tu) / 2, mv = (fv + tv) / 2;
          const sign = (type === 'arc-cw' ? -1 : 1) * (words.R >= 0 ? 1 : -1);
          cu = mu + sign * h * (-dv / d);
          cv = mv + sign * h * (du / d);
        } else {
          cu = fu + ou; cv = fv + ov;
          radius = Math.sqrt(ou * ou + ov * ov) || 1;
        }
      } else {
        cu = fu + ou;
        cv = fv + ov;
        radius = Math.sqrt(ou * ou + ov * ov) || 1;
      }

      // Store center in XYZ
      let cx, cy, cz;
      if (plane === 'XZ') { cx = cu; cy = fw; cz = cv; }
      else if (plane === 'YZ') { cx = fw; cy = cu; cz = cv; }
      else { cx = cu; cy = cv; cz = fw; }

      return { cx, cy, cz, radius, i, j, k, plane, cu, cv, fw, tw };
    }

    _updateBBox(p) {
      this.bbox.min.x = Math.min(this.bbox.min.x, p.x);
      this.bbox.min.y = Math.min(this.bbox.min.y, p.y);
      this.bbox.min.z = Math.min(this.bbox.min.z, p.z);
      this.bbox.max.x = Math.max(this.bbox.max.x, p.x);
      this.bbox.max.y = Math.max(this.bbox.max.y, p.y);
      this.bbox.max.z = Math.max(this.bbox.max.z, p.z);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  TRACE 2D (estilo gráfica de control CNC)
  // ═══════════════════════════════════════════════════════════
  class TraceView {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.segments = [];
      this.plane = 'xy';
      this.tool = { u: 0, v: 0 };
      this.progress = 1;
      this.pad = 28;
      this._bounds = null;
      this._panU = 0;
      this._panV = 0;
      this._zoom = 1;
      this._dragging = false;
      this._lastX = 0;
      this._lastY = 0;
      this.diameterMode = false;
      this.sectionMode = false; // XZ material section fill
      this._bindInput();
    }

    _bindInput() {
      const c = this.canvas;
      c.addEventListener('pointerdown', (e) => {
        this._dragging = true;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
        try { c.setPointerCapture(e.pointerId); } catch (_) {}
      });
      c.addEventListener('pointermove', (e) => {
        if (!this._dragging) return;
        const dx = e.clientX - this._lastX;
        const dy = e.clientY - this._lastY;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
        const scale = this._scale || 1;
        this._panU += dx / scale;
        this._panV -= dy / scale;
        this.draw();
      });
      c.addEventListener('pointerup', () => { this._dragging = false; });
      c.addEventListener('pointercancel', () => { this._dragging = false; });
      c.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        this._zoom = Math.max(0.2, Math.min(20, this._zoom * factor));
        this.draw();
      }, { passive: false });
    }

    setSegments(segments) {
      this.segments = segments || [];
      this._bounds = null;
      this._panU = 0;
      this._panV = 0;
      this._zoom = 1;
      this.draw();
    }

    setPlane(plane) {
      this.plane = plane || 'xy';
      this._bounds = null;
      this._panU = 0;
      this._panV = 0;
      this.draw();
    }

    setTool(x, y, z) {
      if (this.plane === 'xz') this.tool = { u: x, v: z, x, y, z };
      else if (this.plane === 'yz') this.tool = { u: y, v: z, x, y, z };
      else this.tool = { u: x, v: y, x, y, z };
      this.draw();
    }

    setDiameterMode(on) {
      this.diameterMode = !!on;
      this.draw();
    }

    setSectionMode(on) {
      this.sectionMode = !!on;
      this.draw();
    }

    setProgress(p) {
      this.progress = Math.max(0, Math.min(1, p));
      this.draw();
    }

    _proj(p) {
      if (this.plane === 'xz') return { u: p.x, v: p.z };
      if (this.plane === 'yz') return { u: p.y, v: p.z };
      return { u: p.x, v: p.y };
    }

    _computeBounds() {
      let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
      this.segments.forEach(s => {
        [s.from, s.to].forEach(p => {
          const q = this._proj(p);
          minU = Math.min(minU, q.u); maxU = Math.max(maxU, q.u);
          minV = Math.min(minV, q.v); maxV = Math.max(maxV, q.v);
        });
      });
      if (!isFinite(minU)) { minU = -10; maxU = 10; minV = -10; maxV = 10; }
      const spanU = Math.max(maxU - minU, 1);
      const spanV = Math.max(maxV - minV, 1);
      const padU = spanU * 0.12, padV = spanV * 0.12;
      this._bounds = {
        minU: minU - padU, maxU: maxU + padU,
        minV: minV - padV, maxV: maxV + padV,
        cu: (minU + maxU) / 2, cv: (minV + maxV) / 2,
        spanU: spanU + 2 * padU, spanV: spanV + 2 * padV
      };
    }

    resize() {
      const parent = this.canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth, h = parent.clientHeight;
      if (w < 2 || h < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._cssW = w; this._cssH = h;
      this.draw();
    }

    _worldToScreen(u, v) {
      const b = this._bounds;
      const w = this._cssW || this.canvas.clientWidth;
      const h = this._cssH || this.canvas.clientHeight;
      const pad = this.pad;
      const availW = w - pad * 2, availH = h - pad * 2;
      const baseScale = Math.min(availW / b.spanU, availH / b.spanV);
      const scale = baseScale * this._zoom;
      this._scale = scale;
      const cu = b.cu - this._panU, cv = b.cv - this._panV;
      return {
        x: pad + availW / 2 + (u - cu) * scale,
        y: pad + availH / 2 - (v - cv) * scale
      };
    }

    draw() {
      const ctx = this.ctx;
      const w = this._cssW || this.canvas.clientWidth;
      const h = this._cssH || this.canvas.clientHeight;
      if (!w || !h) return;
      if (!this._bounds) this._computeBounds();

      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, w, h);
      this._drawGrid(ctx, w, h);
      this._drawAxes(ctx, w, h);
      if (this.sectionMode && this.plane === 'xz') this._drawSection(ctx);

      const n = this.segments.length;
      const maxI = Math.floor(n * this.progress);
      const passColors = ['#f0abfc', '#a78bfa', '#818cf8', '#38bdf8', '#2dd4bf', '#4ade80', '#facc15', '#fb923c'];
      let lastPassLabel = null;
      for (let i = 0; i < maxI; i++) {
        const s = this.segments[i];
        const a = this._proj(s.from), b = this._proj(s.to);
        const p0 = this._worldToScreen(a.u, a.v);
        const p1 = this._worldToScreen(b.u, b.v);
        if (s.type === 'rapid') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 3]);
        } else if (s.lathe === 'G76' && s.thread) {
          const pi = (s.pass || 1) - 1;
          ctx.strokeStyle = passColors[pi % passColors.length];
          ctx.lineWidth = 1.8;
          ctx.setLineDash([]);
        } else if (s.type && s.type.startsWith('arc')) {
          ctx.strokeStyle = '#e879f9';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = '#f0abfc';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Number G76 passes at start of each cut pass
        if (s.lathe === 'G76' && s.thread && s.passLabel && s.passLabel !== lastPassLabel) {
          lastPassLabel = s.passLabel;
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '600 10px ui-monospace, monospace';
          ctx.fillText(s.passLabel, p0.x + 4, p0.y - 4);
        }
      }
      ctx.setLineDash([]);

      const tp = this._worldToScreen(this.tool.u, this.tool.v);
      ctx.strokeStyle = '#22d3ee';
      ctx.fillStyle = '#22d3ee';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(tp.x - 8, tp.y); ctx.lineTo(tp.x + 8, tp.y);
      ctx.moveTo(tp.x, tp.y - 8); ctx.lineTo(tp.x, tp.y + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tp.x, tp.y - 4);
      ctx.lineTo(tp.x + 4, tp.y);
      ctx.lineTo(tp.x, tp.y + 4);
      ctx.lineTo(tp.x - 4, tp.y);
      ctx.closePath();
      ctx.fill();

      // HUD top — never under the bottom coord overlay
      const planeLabel = this.plane === 'xz' ? 'X–Z TRACE' : (this.plane === 'yz' ? 'Y–Z TRACE' : 'X–Y TRACE');
      // Diameter always when lathe mode or checkbox / XZ plane in lathe
      const dia = !!this.diameterMode || !!this.latheMode;
      let xVal, yVal, zVal;
      if (this.plane === 'xz') {
        xVal = this.tool.u; yVal = 0; zVal = this.tool.v;
      } else if (this.plane === 'yz') {
        xVal = 0; yVal = this.tool.u; zVal = this.tool.v;
      } else {
        xVal = this.tool.u; yVal = this.tool.v; zVal = this.tool.z != null ? this.tool.z : 0;
      }
      if (this.tool.x != null) { xVal = this.tool.x; yVal = this.tool.y; zVal = this.tool.z; }

      const xStr = dia ? (xVal * 2).toFixed(3) + 'Ø' : xVal.toFixed(3);
      let hud = planeLabel + '   X ' + xStr + '   Y ' + yVal.toFixed(3) + '   Z ' + zVal.toFixed(3);
      if (this.sectionMode) hud += '   §XZ';

      ctx.fillStyle = 'rgba(10, 12, 16, 0.82)';
      ctx.fillRect(8, 6, Math.min(w - 16, ctx.measureText ? 0 : 280), 28);
      // measure after font set
      ctx.font = '600 12px ui-monospace, monospace';
      const tw = ctx.measureText(hud).width + 20;
      ctx.fillRect(8, 6, Math.min(w - 16, Math.max(tw, 200)), 26);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(hud, 16, 24);
    }

    _drawGrid(ctx, w, h) {
      const b = this._bounds;
      if (!b) return;
      const scale = this._scale || 1;
      const worldStep = this._niceStep(40 / (scale || 1));
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.45)';
      ctx.lineWidth = 1;
      const u0 = Math.floor(b.minU / worldStep) * worldStep;
      const v0 = Math.floor(b.minV / worldStep) * worldStep;
      for (let u = u0; u <= b.maxU + worldStep; u += worldStep) {
        const p0 = this._worldToScreen(u, b.minV);
        const p1 = this._worldToScreen(u, b.maxV);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }
      for (let v = v0; v <= b.maxV + worldStep; v += worldStep) {
        const p0 = this._worldToScreen(b.minU, v);
        const p1 = this._worldToScreen(b.maxU, v);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }
    }

    _niceStep(raw) {
      if (!isFinite(raw) || raw <= 0) return 10;
      const pow = Math.pow(10, Math.floor(Math.log10(raw)));
      const n = raw / pow;
      if (n < 1.5) return pow;
      if (n < 3.5) return 2 * pow;
      if (n < 7.5) return 5 * pow;
      return 10 * pow;
    }

    _drawAxes(ctx, w, h) {
      const origin = this._worldToScreen(0, 0);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(w, origin.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-monospace, monospace';
      const uName = this.plane === 'yz' ? 'Y' : 'X';
      const vName = this.plane === 'xy' ? 'Y' : 'Z';
      ctx.fillText(uName + '→', w - 24, Math.min(Math.max(origin.y - 4, 12), h - 4));
      ctx.fillText(vName + '↑', Math.min(Math.max(origin.x + 4, 4), w - 24), 14);
    }

    /** Approximate XZ material section: fill under cut profile (upper side, X>0) */
    _drawSection(ctx) {
      if (!this.segments.length) return;
      // Collect outermost cut X at sampled Z from executed path
      const cuts = this.segments.filter(s =>
        s.type === 'cut' || (s.lathe === 'G76' && s.thread)
      );
      if (!cuts.length) return;
      const pts = [];
      cuts.forEach(s => {
        pts.push({ x: s.from.x, z: s.from.z });
        pts.push({ x: s.to.x, z: s.to.z });
      });
      // Sort by Z, keep max |X| envelope (diameter side)
      pts.sort((a, b) => a.z - b.z);
      const envelope = [];
      let i = 0;
      while (i < pts.length) {
        const z0 = pts[i].z;
        let maxX = pts[i].x;
        while (i < pts.length && Math.abs(pts[i].z - z0) < 0.05) {
          maxX = Math.max(maxX, pts[i].x);
          i++;
        }
        envelope.push({ x: maxX, z: z0 });
      }
      if (envelope.length < 2) return;

      ctx.beginPath();
      const first = this._worldToScreen(envelope[0].x, envelope[0].z);
      // start from axis
      const axis0 = this._worldToScreen(0, envelope[0].z);
      ctx.moveTo(axis0.x, axis0.y);
      ctx.lineTo(first.x, first.y);
      for (let k = 1; k < envelope.length; k++) {
        const p = this._worldToScreen(envelope[k].x, envelope[k].z);
        ctx.lineTo(p.x, p.y);
      }
      const last = envelope[envelope.length - 1];
      const axis1 = this._worldToScreen(0, last.z);
      ctx.lineTo(axis1.x, axis1.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  3D VIEWPORT
  // ═══════════════════════════════════════════════════════════
  class Viewport3D {
    constructor(container) {
      this.container = container;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.screenSpacePanning = true;

      this.toolpathGroup = new THREE.Group();
      this.scene.add(this.toolpathGroup);

      this.toolMesh = null;
      this.stockMesh = null;
      this.gridHelper = null;
      this.axesHelper = null;
      this.showRapids = true;
      this.showTool = true;
      this.showStock = true;
      this.machineType = 'vmc';

      this._setupLights();
      this._setupGrid();
      this._setupAxes();
      this._setupTool();
      this.setView('iso');
      this._onResize();
      window.addEventListener('resize', () => this._onResize());

      this._animate = this._animate.bind(this);
      requestAnimationFrame(this._animate);
    }

    _setupLights() {
      const amb = new THREE.AmbientLight(0xffffff, 0.55);
      this.scene.add(amb);
      const dir = new THREE.DirectionalLight(0xffffff, 0.7);
      dir.position.set(50, 80, 40);
      this.scene.add(dir);
      const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
      dir2.position.set(-30, 20, -40);
      this.scene.add(dir2);
    }

    _setupGrid() {
      if (this.gridHelper) this.scene.remove(this.gridHelper);
      this.gridHelper = new THREE.GridHelper(200, 20, 0x3a4155, 0x2a3040);
      this.gridHelper.position.y = 0;
      this.scene.add(this.gridHelper);
    }

    _setupAxes() {
      if (this.axesHelper) this.scene.remove(this.axesHelper);
      this.axesHelper = new THREE.AxesHelper(30);
      this.scene.add(this.axesHelper);
    }

    _setupTool() {
      if (this.toolMesh) this.scene.remove(this.toolMesh);
      this.toolMesh = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, metalness: 0.55, roughness: 0.35,
        emissive: 0xf59e0b, emissiveIntensity: 0.12
      });
      // Compact cutter: short tip + small shank (visual scale, not 1:1 mm)
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.2, 12), mat);
      tip.rotation.x = Math.PI;
      tip.position.y = 1.1;
      const shank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 2.5, 10),
        mat.clone()
      );
      shank.position.y = 3.3;
      this.toolMesh.add(tip);
      this.toolMesh.add(shank);
      this.toolMesh.userData.tip = tip;
      this.toolMesh.userData.shank = shank;
      this.scene.add(this.toolMesh);
    }

    setToolGeometry(diameter, length) {
      if (!this.toolMesh) return;
      const tip = this.toolMesh.userData.tip;
      const shank = this.toolMesh.userData.shank;
      if (!tip || !shank) return;

      // Visual scale: real mm → scene units (keep tool small relative to path)
      const scale = 0.12;
      const r = Math.max(((diameter || 6) / 2) * scale, 0.25);
      const tipH = Math.max(Math.min((length || 30) * scale * 0.25, 3.5), 1.2);
      const shankH = Math.max(Math.min((length || 30) * scale * 0.35, 4.5), 1.5);
      const shankR = r * 0.55;

      tip.geometry.dispose();
      tip.geometry = new THREE.ConeGeometry(r, tipH, 14);
      tip.rotation.x = Math.PI;
      tip.position.y = tipH / 2;

      shank.geometry.dispose();
      shank.geometry = new THREE.CylinderGeometry(shankR * 0.85, shankR, shankH, 10);
      shank.position.y = tipH + shankH / 2;
    }

    setBackground(isDark) {
      this.renderer.setClearColor(isDark ? 0x0f1115 : 0xe8ecf2, 1);
      if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
        this.gridHelper = new THREE.GridHelper(200, 20,
          isDark ? 0x3a4155 : 0xb0b8c8,
          isDark ? 0x2a3040 : 0xd0d5e0
        );
        this.scene.add(this.gridHelper);
      }
    }

    setMachine(type) {
      this.machineType = type;
      // Adjust camera defaults slightly
      if (type === 'hmc') {
        this.camera.up.set(0, 0, 1);
      } else {
        this.camera.up.set(0, 1, 0);
      }
    }

    clearToolpath() {
      while (this.toolpathGroup.children.length) {
        const c = this.toolpathGroup.children[0];
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
        this.toolpathGroup.remove(c);
      }
    }

    buildToolpath(segments, options) {
      this.clearToolpath();
      this._allSegments = segments || [];
      this._segmentData = this._allSegments;
      options = options || {};
      this._pathOptions = {
        heatMap: !!options.heatMap,
        showComp: options.showComp !== false,
        zMin: options.zMin,
        zMax: options.zMax,
        tools: options.tools || {}
      };
      this._rebuildPathGeometry();
      if (segments && segments.length) this._fitCamera(segments);
    }

    setPathOptions(partial) {
      this._pathOptions = Object.assign({}, this._pathOptions || {}, partial);
      this._rebuildPathGeometry();
    }

    _feedColor(feed, fMin, fMax) {
      // blue (slow) → cyan → green → yellow → red (fast)
      const t = fMax > fMin ? Math.max(0, Math.min(1, (feed - fMin) / (fMax - fMin))) : 0.5;
      const stops = [
        [0x3b82f6, 0], [0x06b6d4, 0.25], [0x22c55e, 0.5], [0xeab308, 0.75], [0xef4444, 1]
      ];
      let a = stops[0], b = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i][1] && t <= stops[i + 1][1]) { a = stops[i]; b = stops[i + 1]; break; }
      }
      const u = (b[1] - a[1]) > 0 ? (t - a[1]) / (b[1] - a[1]) : 0;
      const ar = (a[0] >> 16) & 255, ag = (a[0] >> 8) & 255, ab = a[0] & 255;
      const br = (b[0] >> 16) & 255, bg = (b[0] >> 8) & 255, bb = b[0] & 255;
      const r = Math.round(ar + (br - ar) * u);
      const g = Math.round(ag + (bg - ag) * u);
      const bl = Math.round(ab + (bb - ab) * u);
      return (r << 16) | (g << 8) | bl;
    }

    _offsetPoint(from, to, side, radius) {
      // Perpendicular offset in XY for G41/G42 approximate visual
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1e-9 || !radius) return { from: { ...from }, to: { ...to } };
      // left normal = (-dy, dx), right = (dy, -dx); side: 1=left G41, -1=right G42
      const nx = side * (-dy / len) * radius;
      const ny = side * (dx / len) * radius;
      return {
        from: { x: from.x + nx, y: from.y + ny, z: from.z },
        to: { x: to.x + nx, y: to.y + ny, z: to.z }
      };
    }

    _rebuildPathGeometry() {
      this.clearToolpath();
      const segments = this._allSegments || [];
      if (!segments.length) return;

      const opt = this._pathOptions || {};
      const zMin = opt.zMin;
      const zMax = opt.zMax;
      const heatMap = opt.heatMap;
      const tools = opt.tools || {};

      const inZ = (seg) => {
        if (zMin == null || zMax == null) return true;
        const za = Math.min(seg.from.z, seg.to.z);
        const zb = Math.max(seg.from.z, seg.to.z);
        return zb >= zMin && za <= zMax;
      };

      let fMin = Infinity, fMax = -Infinity;
      segments.forEach(s => {
        if (s.type !== 'rapid' && s.feed > 0) {
          fMin = Math.min(fMin, s.feed);
          fMax = Math.max(fMax, s.feed);
        }
      });
      if (!isFinite(fMin)) { fMin = 0; fMax = 1000; }

      const rapidPositions = [];
      const arcPositions = [];
      const cutBuckets = {}; // color -> positions
      const compPositions = [];

      const addLine = (arr, from, to) => {
        arr.push(from.x, from.z, -from.y);
        arr.push(to.x, to.z, -to.y);
      };

      const visible = [];
      for (const seg of segments) {
        if (!inZ(seg)) continue;
        visible.push(seg);

        if (seg.type === 'rapid') {
          addLine(rapidPositions, seg.from, seg.to);
        } else if (seg.type && seg.type.startsWith('arc') && seg.arc) {
          const pts = this._arcPoints(seg);
          for (let i = 0; i < pts.length - 1; i++) addLine(arcPositions, pts[i], pts[i + 1]);
        } else {
          const feed = seg.feed || 500;
          const color = heatMap ? this._feedColor(feed, fMin, fMax) : 0x22c55e;
          const key = color.toString(16);
          if (!cutBuckets[key]) cutBuckets[key] = [];
          addLine(cutBuckets[key], seg.from, seg.to);
        }

        // G41/G42 approximate offset (XY only, linear cuts)
        if (opt.showComp && seg.comp && seg.type === 'cut') {
          const tNum = seg.tool || 0;
          const tool = tools[tNum] || tools[String(tNum)];
          const radius = tool ? (tool.diameter / 2) : 3;
          const off = this._offsetPoint(seg.from, seg.to, seg.comp, radius);
          addLine(compPositions, off.from, off.to);
        }
      }

      this._segmentData = visible;

      const makeLines = (positions, color, opacity) => {
        if (positions.length < 6) return;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
          color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1
        });
        this.toolpathGroup.add(new THREE.LineSegments(geo, mat));
      };

      makeLines(rapidPositions, 0xef4444, 0.45);
      Object.keys(cutBuckets).forEach(k => {
        makeLines(cutBuckets[k], parseInt(k, 16), 1);
      });
      makeLines(arcPositions, heatMap ? 0xa855f7 : 0xa855f7, 1);
      makeLines(compPositions, 0x38bdf8, 0.7); // compensated path in sky blue
    }

    highlightSegment(seg) {
      if (this._hlMesh) {
        this.toolpathGroup.remove(this._hlMesh);
        if (this._hlMesh.geometry) this._hlMesh.geometry.dispose();
        if (this._hlMesh.material) this._hlMesh.material.dispose();
        this._hlMesh = null;
      }
      if (!seg) return;
      const positions = [
        seg.from.x, seg.from.z, -seg.from.y,
        seg.to.x, seg.to.z, -seg.to.y
      ];
      if (seg.arc && seg.type && seg.type.startsWith('arc')) {
        const pts = this._arcPoints(seg);
        positions.length = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          positions.push(pts[i].x, pts[i].z, -pts[i].y);
          positions.push(pts[i + 1].x, pts[i + 1].z, -pts[i + 1].y);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
      this._hlMesh = new THREE.LineSegments(geo, mat);
      this.toolpathGroup.add(this._hlMesh);
    }

    pickSegment(clientX, clientY) {
      if (!this._segmentData || !this._segmentData.length) return null;
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      // Project midpoints and find nearest in screen space
      let best = null;
      let bestDist = Infinity;
      const v = new THREE.Vector3();
      for (let i = 0; i < this._segmentData.length; i++) {
        const s = this._segmentData[i];
        const mx = (s.from.x + s.to.x) / 2;
        const my = (s.from.y + s.to.y) / 2;
        const mz = (s.from.z + s.to.z) / 2;
        v.set(mx, mz, -my);
        v.project(this.camera);
        const dx = v.x - mouse.x;
        const dy = v.y - mouse.y;
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = { index: i, segment: s };
        }
      }
      // Threshold ~0.05 in NDC
      if (bestDist > 0.04) return null;
      return best;
    }

    _arcPoints(seg) {
      const { from, to, arc, type } = seg;
      if (!arc) return [from, to];
      const plane = (arc.plane || seg.plane || 'XY');
      const radius = arc.radius || 1;
      const cw = type === 'arc-cw';

      let fu, fv, tu, tv, cu, cv, fw, tw;
      if (plane === 'XZ') {
        fu = from.x; fv = from.z; tu = to.x; tv = to.z;
        cu = arc.cx; cv = arc.cz; fw = from.y; tw = to.y;
      } else if (plane === 'YZ') {
        fu = from.y; fv = from.z; tu = to.y; tv = to.z;
        cu = arc.cy; cv = arc.cz; fw = from.x; tw = to.x;
      } else {
        fu = from.x; fv = from.y; tu = to.x; tv = to.y;
        cu = arc.cx; cv = arc.cy; fw = from.z; tw = to.z;
      }

      const startAngle = Math.atan2(fv - cv, fu - cu);
      let endAngle = Math.atan2(tv - cv, tu - cu);
      let delta = endAngle - startAngle;
      if (cw) { if (delta > 0) delta -= 2 * Math.PI; }
      else { if (delta < 0) delta += 2 * Math.PI; }
      if (Math.abs(delta) < 1e-6) delta = cw ? -2 * Math.PI : 2 * Math.PI;

      const steps = Math.max(8, Math.ceil(Math.abs(delta) / (Math.PI / 18)));
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = startAngle + delta * t;
        const u = cu + radius * Math.cos(ang);
        const v = cv + radius * Math.sin(ang);
        const w = fw + (tw - fw) * t;
        if (plane === 'XZ') pts.push({ x: u, y: w, z: v });
        else if (plane === 'YZ') pts.push({ x: w, y: u, z: v });
        else pts.push({ x: u, y: v, z: w });
      }
      return pts;
    }

    _fitCamera(segments) {
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      for (const s of segments) {
        for (const p of [s.from, s.to]) {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
          minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
        }
      }
      if (!isFinite(minX)) return;

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const cz = (minZ + maxZ) / 2;
      const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 20);
      this._pathSize = size;
      const dist = size * 1.8;

      // Map: CNC X → Three X, CNC Z → Three Y, CNC Y → Three -Z
      this.controls.target.set(cx, cz, -cy);
      if (this._viewMode === 'plan') {
        this.setView('plan');
      } else {
        this.camera.position.set(cx + dist * 0.7, cz + dist * 0.6, -cy + dist * 0.7);
        this.controls.update();
      }
    }

    setView(name) {
      this._viewMode = name;
      const t = this.controls.target.clone();
      const size = this._pathSize || 80;
      const d = Math.max(size * 1.4, 40);

      // Toggle orthographic for true 2D plan view
      if (name === 'plan') {
        this._useOrtho(true, d);
        this.camera.up.set(0, 0, -1); // look down so X right, Y up on screen roughly
        // Scene: X=X, Y=Z, Z=-Y → top view from +Y
        this.camera.up.set(0, 0, -1);
        this.camera.position.set(t.x, t.y + d, t.z);
        this.controls.enableRotate = false;
        this.controls.screenSpacePanning = true;
      } else {
        this._useOrtho(false, d);
        this.controls.enableRotate = true;
        if (this.machineType === 'hmc') this.camera.up.set(0, 0, 1);
        else this.camera.up.set(0, 1, 0);

        switch (name) {
          case 'top':
            this.camera.position.set(t.x, t.y + d, t.z);
            break;
          case 'front':
            this.camera.position.set(t.x, t.y, t.z + d);
            break;
          case 'side':
            this.camera.position.set(t.x + d, t.y, t.z);
            break;
          default: // iso
            this.camera.position.set(t.x + d * 0.7, t.y + d * 0.55, t.z + d * 0.7);
        }
      }
      this.camera.lookAt(t);
      this.controls.target.copy(t);
      this.controls.update();
    }

    _useOrtho(on, frustumSize) {
      const el = this.container;
      const w = Math.max(el.clientWidth, 1);
      const h = Math.max(el.clientHeight, 1);
      const aspect = w / h;
      const fs = frustumSize || 80;

      if (on) {
        if (!(this.camera.isOrthographicCamera)) {
          this._perspCamera = this.camera;
          this.camera = new THREE.OrthographicCamera(
            -fs * aspect / 2, fs * aspect / 2, fs / 2, -fs / 2, 0.1, 5000
          );
          this.controls.object = this.camera;
        } else {
          this.camera.left = -fs * aspect / 2;
          this.camera.right = fs * aspect / 2;
          this.camera.top = fs / 2;
          this.camera.bottom = -fs / 2;
          this.camera.updateProjectionMatrix();
        }
      } else {
        if (this.camera.isOrthographicCamera) {
          this.camera = this._perspCamera || new THREE.PerspectiveCamera(50, aspect, 0.1, 5000);
          this.controls.object = this.camera;
        }
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
      }
    }

    setToolPosition(x, y, z) {
      if (!this.toolMesh) return;
      this.toolMesh.position.set(x, z, -y);
      this.toolMesh.visible = this.showTool;
    }

    setToolVisible(v) { this.showTool = v; if (this.toolMesh) this.toolMesh.visible = v; }
    setGridVisible(v) { if (this.gridHelper) this.gridHelper.visible = v; }
    setAxesVisible(v) { if (this.axesHelper) this.axesHelper.visible = v; }
    setStockVisible(v) {
      this.showStock = v;
      if (this.stockMesh) this.stockMesh.visible = v;
      if (this.stockSurface) this.stockSurface.visible = v;
    }

    updateStock(bbox, padding) {
      if (this.stockMesh) {
        this.scene.remove(this.stockMesh);
        if (this.stockMesh.geometry) this.stockMesh.geometry.dispose();
        if (this.stockMesh.material) {
          if (Array.isArray(this.stockMesh.material)) this.stockMesh.material.forEach(m => m.dispose());
          else this.stockMesh.material.dispose();
        }
        this.stockMesh = null;
      }
      if (this.stockSurface) {
        this.scene.remove(this.stockSurface);
        if (this.stockSurface.geometry) this.stockSurface.geometry.dispose();
        if (this.stockSurface.material) this.stockSurface.material.dispose();
        this.stockSurface = null;
      }
      if (!bbox || !isFinite(bbox.min.x)) return;

      const pad = padding != null ? padding : 5;
      const minX = bbox.min.x - pad;
      const maxX = bbox.max.x + pad;
      const minY = bbox.min.y - pad;
      const maxY = bbox.max.y + pad;
      let minZ = Math.min(bbox.min.z, 0) - 1;
      let maxZ = Math.max(bbox.max.z, 0);
      if (bbox.min.z < 0) {
        minZ = bbox.min.z - 2;
        maxZ = Math.max(0, bbox.max.z) + 1;
      } else {
        minZ = -2;
        maxZ = bbox.max.z + 2;
      }

      const sx = Math.max(maxX - minX, 1);
      const sy = Math.max(maxY - minY, 1);
      const sz = Math.max(maxZ - minZ, 1);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const cz = (minZ + maxZ) / 2;

      this._stockBounds = { minX, maxX, minY, maxY, minZ, maxZ, topZ: maxZ };

      const geo = new THREE.BoxGeometry(sx, sz, sy);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        transparent: true,
        opacity: 0.12,
        metalness: 0.1,
        roughness: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      this.stockMesh = new THREE.Mesh(geo, mat);
      this.stockMesh.position.set(cx, cz, -cy);
      this.stockMesh.visible = this.showStock;
      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x9ca3af, transparent: true, opacity: 0.4 });
      this.stockMesh.add(new THREE.LineSegments(edges, edgeMat));
      this.scene.add(this.stockMesh);

      // Heightmap surface for material removal (top of stock)
      this._initStockHeightmap(minX, maxX, minY, maxY, maxZ, minZ);
    }

    _initStockHeightmap(minX, maxX, minY, maxY, topZ, minZ) {
      const res = 48;
      this._hm = {
        res,
        minX, maxX, minY, maxY, topZ, minZ,
        heights: new Float32Array(res * res)
      };
      this._hm.heights.fill(topZ);

      const sx = maxX - minX;
      const sy = maxY - minY;
      const geo = new THREE.PlaneGeometry(sx, sy, res - 1, res - 1);
      // Plane is XY in three; rotate to XZ plane mapping: local X->X, local Y->-Y (CNC)
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.45,
        metalness: 0.05,
        roughness: 0.9,
        side: THREE.DoubleSide,
        flatShading: true
      });
      this.stockSurface = new THREE.Mesh(geo, mat);
      this.stockSurface.position.set((minX + maxX) / 2, 0, -(minY + maxY) / 2);
      this.stockSurface.visible = this.showStock;
      this.scene.add(this.stockSurface);
      this._hmBasePositions = Float32Array.from(geo.attributes.position.array);
      this._updateStockSurfaceMesh();
    }

    resetMaterialRemoval() {
      if (!this._hm) return;
      this._hm.heights.fill(this._hm.topZ);
      this._updateStockSurfaceMesh();
    }

    /** Carve stock along a tool move (approximate) */
    carveSegment(from, to, toolRadius) {
      if (!this._hm || !from || !to) return;
      const r = Math.max(toolRadius || 1, 0.5);
      const hm = this._hm;
      const steps = Math.max(2, Math.ceil(
        Math.sqrt(
          Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2) + Math.pow(to.z - from.z, 2)
        ) / Math.max(r * 0.4, 0.5)
      ));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        const z = from.z + (to.z - from.z) * t;
        this._carveCircle(x, y, z, r);
      }
    }

    _carveCircle(x, y, zTool, radius) {
      const hm = this._hm;
      if (!hm) return;
      const res = hm.res;
      const sx = (hm.maxX - hm.minX) / (res - 1);
      const sy = (hm.maxY - hm.minY) / (res - 1);
      const i0 = Math.floor((x - radius - hm.minX) / sx);
      const i1 = Math.ceil((x + radius - hm.minX) / sx);
      const j0 = Math.floor((y - radius - hm.minY) / sy);
      const j1 = Math.ceil((y + radius - hm.minY) / sy);
      for (let j = Math.max(0, j0); j <= Math.min(res - 1, j1); j++) {
        for (let i = Math.max(0, i0); i <= Math.min(res - 1, i1); i++) {
          const cx = hm.minX + i * sx;
          const cy = hm.minY + j * sy;
          const d = Math.sqrt((cx - x) * (cx - x) + (cy - y) * (cy - y));
          if (d <= radius) {
            const idx = j * res + i;
            if (zTool < hm.heights[idx]) hm.heights[idx] = Math.max(zTool, hm.minZ);
          }
        }
      }
    }

    _updateStockSurfaceMesh() {
      if (!this.stockSurface || !this._hm || !this._hmBasePositions) return;
      const pos = this.stockSurface.geometry.attributes.position;
      const base = this._hmBasePositions;
      const hm = this._hm;
      const res = hm.res;
      // PlaneGeometry vertices order: grid
      for (let j = 0; j < res; j++) {
        for (let i = 0; i < res; i++) {
          const vi = (j * res + i) * 3;
          const h = hm.heights[j * res + i];
          // After rotateX(-90): y is height
          pos.array[vi] = base[vi];
          pos.array[vi + 1] = h;
          pos.array[vi + 2] = base[vi + 2];
        }
      }
      pos.needsUpdate = true;
      this.stockSurface.geometry.computeVertexNormals();
    }

    flushMaterialRemoval() {
      this._updateStockSurfaceMesh();
    }

    /** Rapid through stock? returns collision info or null */
    checkCollision(from, to, type) {
      if (!this._stockBounds || type !== 'rapid') return null;
      const b = this._stockBounds;
      // Sample midpoints
      for (let i = 0; i <= 4; i++) {
        const t = i / 4;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        const z = from.z + (to.z - from.z) * t;
        if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY && z < b.topZ - 0.2 && z > b.minZ) {
          // If heightmap exists, compare to local surface
          let surfaceZ = b.topZ;
          if (this._hm) {
            const hm = this._hm;
            const ix = Math.round((x - hm.minX) / (hm.maxX - hm.minX) * (hm.res - 1));
            const iy = Math.round((y - hm.minY) / (hm.maxY - hm.minY) * (hm.res - 1));
            if (ix >= 0 && iy >= 0 && ix < hm.res && iy < hm.res) {
              surfaceZ = hm.heights[iy * hm.res + ix];
            }
          }
          if (z < surfaceZ - 0.15) {
            return { x, y, z, surfaceZ };
          }
        }
      }
      return null;
    }

    setRapidsVisible(v) {
      this.showRapids = v;
      this.toolpathGroup.children.forEach((c) => {
        if (c.material && c.material.opacity !== undefined && c.material.opacity < 1) {
          c.visible = v;
        }
      });
    }

    _onResize() {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;
      const aspect = w / h;
      if (this.camera.isOrthographicCamera) {
        const fs = this._pathSize ? this._pathSize * 1.4 : 80;
        this.camera.left = -fs * aspect / 2;
        this.camera.right = fs * aspect / 2;
        this.camera.top = fs / 2;
        this.camera.bottom = -fs / 2;
      } else {
        this.camera.aspect = aspect;
      }
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    _animate() {
      requestAnimationFrame(this._animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  SIMULATOR
  // ═══════════════════════════════════════════════════════════
  class Simulator {
    constructor(viewport, onUpdate) {
      this.viewport = viewport;
      this.onUpdate = onUpdate;
      this.segments = [];
      this.index = 0;
      this.playing = false;
      this.speed = 2;
      this._raf = null;
      this._lastTime = 0;
      this._accum = 0;
    }

    load(segments) {
      this.stop();
      this.segments = segments;
      this.index = 0;
      this._accum = 0;
      this._updateUI();
      if (segments.length) {
        const s = segments[0];
        this.viewport.setToolPosition(s.from.x, s.from.y, s.from.z);
      }
    }

    play() {
      if (!this.segments.length) return;
      this.playing = true;
      this._lastTime = performance.now();
      this._tick();
      this.onUpdate({ playing: true });
    }

    pause() {
      this.playing = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
      this.onUpdate({ playing: false });
    }

    stop() {
      this.pause();
      this.index = 0;
      this._accum = 0;
      this._updateUI();
    }

    reset() {
      this.stop();
      if (this.segments.length) {
        const s = this.segments[0];
        this.viewport.setToolPosition(s.from.x, s.from.y, s.from.z);
      }
      this._updateUI();
    }

    stepForward() {
      if (this.index >= this.segments.length) return;
      this._applySegment(this.segments[this.index]);
      this.index++;
      this._updateUI();
    }

    stepBack() {
      if (this.index <= 0) return;
      this.index--;
      if (this.index > 0) {
        const s = this.segments[this.index - 1];
        this.viewport.setToolPosition(s.to.x, s.to.y, s.to.z);
      } else if (this.segments.length) {
        const s = this.segments[0];
        this.viewport.setToolPosition(s.from.x, s.from.y, s.from.z);
      }
      this._updateUI();
    }

    setSpeed(v) { this.speed = v; }

    _tick() {
      if (!this.playing) return;
      const now = performance.now();
      const dt = (now - this._lastTime) / 1000;
      this._lastTime = now;
      this._accum += dt * this.speed * 8; // base rate ~8 segs/sec at 1x

      while (this._accum >= 1 && this.index < this.segments.length) {
        this._applySegment(this.segments[this.index]);
        this.index++;
        this._accum -= 1;
      }

      if (this.index >= this.segments.length) {
        this.pause();
        this.onUpdate({ playing: false, finished: true });
      } else {
        this._updateUI();
        this._raf = requestAnimationFrame(() => this._tick());
      }
    }

    _applySegment(seg) {
      this.viewport.setToolPosition(seg.to.x, seg.to.y, seg.to.z);
    }

    _updateUI() {
      const total = this.segments.length;
      const idx = Math.min(this.index, total);
      const seg = idx > 0 ? this.segments[idx - 1] : (total ? this.segments[0] : null);
      const pos = seg ? (idx > 0 ? seg.to : seg.from) : { x: 0, y: 0, z: 0, a: 0, c: 0 };

      this.onUpdate({
        index: idx,
        total,
        segment: seg,
        position: pos,
        playing: this.playing
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  APPLICATION
  // ═══════════════════════════════════════════════════════════
  const App = {
    editor: null,
    viewport: null,
    parser: new GCodeParser(),
    simulator: null,
    parseResult: null,
    machine: 'vmc',

    init() {
      this._initEditor();
      this._initViewport();
      this._initSimulator();
      this._bindEvents();
      this._initMobile();
      const hasSave = !!(this.editor && this.editor.getValue().trim());
      if (!hasSave) this._loadExample('pocket');
      else this._reparse();
      this._applyTheme(localStorage.getItem('cnc-theme') || 'dark');
    },

    _initEditor() {
      this._history = [];
      this._historyIndex = -1;
      this._historyLock = false;
      this._syncLock = false;
      this._typing = false;

      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (window.matchMedia && window.matchMedia('(max-width: 900px)').matches);

      this.editor = CodeMirror.fromTextArea(document.getElementById('gcode-editor'), {
        mode: 'gcode',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        // contenteditable on Android often reorders digits/decimals — use textarea input
        inputStyle: 'textarea',
        styleActiveLine: !isMobile,
        matchBrackets: !isMobile,
        indentUnit: 0,
        tabSize: 2,
        indentWithTabs: false,
        smartIndent: false,
        electricChars: false,
        disableInput: false,
        dragDrop: !isMobile,
        cursorBlinkRate: isMobile ? 0 : 530,
        // Avoid CM rewriting / auto-indent while typing G-code
        extraKeys: {
          'Enter': function (cm) {
            cm.replaceSelection('\n', 'end');
          },
          'Ctrl-Enter': () => this._reparse(),
          'Cmd-Enter': () => this._reparse(),
          'Ctrl-Z': () => { this._undo(); return true; },
          'Cmd-Z': () => { this._undo(); return true; },
          'Ctrl-Y': () => { this._redo(); return true; },
          'Cmd-Shift-Z': () => { this._redo(); return true; },
          'Ctrl-S': () => { this._autosave(true); return true; },
          'Cmd-S': () => { this._autosave(true); return true; }
        }
      });

      // Kill mobile autocorrect / capitalize (causes G0X3.5 → 5.G0X3 style glitches)
      const input = this.editor.getInputField();
      if (input) {
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('inputmode', 'text');
        input.setAttribute('data-gramm', 'false');
      }

      // Restore autosave
      try {
        const saved = localStorage.getItem('cnc-gcode-autosave');
        if (saved && saved.trim()) {
          this.editor.setValue(saved);
        }
      } catch (_) { /* ignore */ }

      this.editor.on('change', (cm, change) => {
        // Ignore setValue from our own history/load
        if (this._historyLock) return;
        this._typing = true;
        clearTimeout(this._typingTimer);
        this._typingTimer = setTimeout(() => { this._typing = false; }, 500);

        // Only push history for user origin changes
        if (change && change.origin && change.origin !== 'setValue') {
          clearTimeout(this._histTimer);
          this._histTimer = setTimeout(() => this._pushHistory(), 300);
        }

        clearTimeout(this._parseTimer);
        this._parseTimer = setTimeout(() => this._reparse(), isMobile ? 700 : 450);
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => this._autosave(false), 1000);
      });

      // Debounced cursor→3D sync — never while actively typing
      this.editor.on('cursorActivity', () => {
        if (this._syncLock || this._typing) return;
        clearTimeout(this._cursorTimer);
        this._cursorTimer = setTimeout(() => {
          if (!this._typing) this._onEditorCursor();
        }, 350);
      });

      this._pushHistory();
    },

    _pushHistory() {
      if (!this.editor) return;
      const val = this.editor.getValue();
      if (this._historyIndex >= 0 && this._history[this._historyIndex] === val) return;
      this._history = this._history.slice(0, this._historyIndex + 1);
      this._history.push(val);
      if (this._history.length > 80) {
        this._history.shift();
      } else {
        this._historyIndex++;
      }
      this._historyIndex = this._history.length - 1;
    },

    _undo() {
      if (this._historyIndex <= 0) return;
      this._historyIndex--;
      this._historyLock = true;
      this.editor.setValue(this._history[this._historyIndex]);
      this._historyLock = false;
      this._reparse();
    },

    _redo() {
      if (this._historyIndex >= this._history.length - 1) return;
      this._historyIndex++;
      this._historyLock = true;
      this.editor.setValue(this._history[this._historyIndex]);
      this._historyLock = false;
      this._reparse();
    },

    _autosave(force) {
      try {
        localStorage.setItem('cnc-gcode-autosave', this.editor.getValue());
        if (force) {
          const st = document.getElementById('parse-status');
          const prev = st.textContent;
          st.textContent = 'Guardado local ✓';
          setTimeout(() => { st.textContent = prev; }, 1200);
        }
      } catch (_) { /* quota */ }
    },

    _onEditorCursor() {
      if (this._typing || this._syncLock) return;
      if (!this.parseResult || !this.parseResult.segments) return;
      if (this.simulator && this.simulator.playing) return;
      const line = this.editor.getCursor().line + 1;
      const segs = this.parseResult.segments;
      let found = null;
      for (let i = 0; i < segs.length; i++) {
        if (segs[i].lineNum === line) found = { index: i, segment: segs[i] };
      }
      if (!found) return;
      this._selectSegment(found.index, found.segment, false);
    },

    _selectSegment(index, seg, scrollEditor) {
      if (!seg) return;
      this.viewport.highlightSegment(seg);
      this.viewport.setToolPosition(seg.to.x, seg.to.y, seg.to.z);
      if (scrollEditor && seg.lineNum && !this._typing) {
        this._syncLock = true;
        try {
          this.editor.setCursor(seg.lineNum - 1, 0);
          this.editor.scrollIntoView({ line: seg.lineNum - 1, ch: 0 }, 80);
          if (this._hlLine) this.editor.removeLineClass(this._hlLine, 'background', 'cm-sim-line');
          this._hlLine = this.editor.addLineClass(seg.lineNum - 1, 'background', 'cm-sim-line');
        } finally {
          this._syncLock = false;
        }
      }
      document.getElementById('current-line').textContent = seg.raw || '—';
      document.getElementById('pos-x').textContent = seg.to.x.toFixed(3);
      document.getElementById('pos-y').textContent = seg.to.y.toFixed(3);
      document.getElementById('pos-z').textContent = seg.to.z.toFixed(3);
    },

    _initViewport() {
      const el = document.getElementById('viewport');
      this.viewport = new Viewport3D(el);
      this.viewport.setBackground(true);
      const tc = document.getElementById('trace-canvas');
      this.trace = new TraceView(tc);
      this._viewMode = 'iso';
      window.addEventListener('resize', () => {
        if (this._viewMode === 'trace') this.trace.resize();
      });
    },

    _setViewMode(name) {
      this._viewMode = name;
      const traceCanvas = document.getElementById('trace-canvas');
      const planeSel = document.getElementById('trace-plane-select');
      const overlay = document.querySelector('.viewport-overlay');
      const isTrace = name === 'trace';
      if (traceCanvas) traceCanvas.classList.toggle('hidden', !isTrace);
      if (planeSel) planeSel.classList.toggle('hidden', !isTrace);
      // Avoid double coords: hide 3D overlay while Trace shows its own HUD
      if (overlay) overlay.classList.toggle('hidden', isTrace);
      if (this.viewport && this.viewport.renderer) {
        this.viewport.renderer.domElement.style.visibility = isTrace ? 'hidden' : 'visible';
      }
      if (isTrace) {
        if (this.trace) {
          const dia = document.getElementById('diameter-mode');
          this.trace.latheMode = this.machine === 'lathe';
          this.trace.setDiameterMode(this.machine === 'lathe' || (dia && dia.checked));
          const sec = document.getElementById('trace-section');
          this.trace.setSectionMode(sec && sec.checked);
          this.trace.resize();
          if (this.parseResult) {
            const segs = this._applyWcsToSegments
              ? this._applyWcsToSegments(this.parseResult.segments)
              : this.parseResult.segments;
            this.trace.setSegments(segs);
            const p = this.parser.state;
            this.trace.setTool(p.x, p.y, p.z);
          }
        }
      } else {
        this.viewport.setView(name);
      }
    },

    _initSimulator() {
      this.simulator = new Simulator(this.viewport, (data) => this._onSimUpdate(data));
    },

    _bindEvents() {
      const on = (id, ev, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(ev, fn);
      };
      const qon = (sel, ev, fn) => {
        const el = document.querySelector(sel);
        if (el) el.addEventListener(ev, fn);
      };

      // Theme
      on('btn-theme', 'click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        this._applyTheme(isDark ? 'light' : 'dark');
      });

      // Templates
      on('btn-templates', 'click', () => {
        const m = document.getElementById('templates-modal');
        if (m) m.classList.remove('hidden');
      });
      on('templates-close', 'click', () => {
        const m = document.getElementById('templates-modal');
        if (m) m.classList.add('hidden');
      });
      qon('#templates-modal .modal-backdrop', 'click', () => {
        const m = document.getElementById('templates-modal');
        if (m) m.classList.add('hidden');
      });
      document.querySelectorAll('[data-tpl]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-tpl]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          ['face', 'pocket', 'lathe', 'thread'].forEach(id => {
            const f = document.getElementById('tpl-' + id);
            if (f) f.classList.toggle('hidden', btn.dataset.tpl !== id);
          });
        });
      });
      // Metric thread presets
      const thrSel = document.getElementById('tpl-thr-metric');
      if (thrSel) {
        const METRIC = {
          6:  { od: 6,  pitch: 1.0,  minor: 4.917 },
          8:  { od: 8,  pitch: 1.25, minor: 6.647 },
          10: { od: 10, pitch: 1.5,  minor: 8.376 },
          12: { od: 12, pitch: 1.75, minor: 10.106 },
          14: { od: 14, pitch: 2.0,  minor: 11.835 },
          16: { od: 16, pitch: 2.0,  minor: 13.835 },
          20: { od: 20, pitch: 2.5,  minor: 17.294 }
        };
        thrSel.addEventListener('change', () => {
          const m = METRIC[thrSel.value];
          if (!m) return;
          document.getElementById('tpl-thr-od').value = m.od;
          document.getElementById('tpl-thr-pitch').value = m.pitch;
        });
        this._metricThreads = METRIC;
      }
      on('btn-gen-template', 'click', () => {
        this._generateTemplate();
        const m = document.getElementById('templates-modal');
        if (m) m.classList.add('hidden');
      });
      on('diameter-mode', 'change', () => {
        if (this.parser) {
          const p = this.parser.state;
          this._updateCoordDisplay(p.x, p.y, p.z);
        }
        if (this.trace) {
          const dia = document.getElementById('diameter-mode');
          const force = this.machine === 'lathe' || (dia && dia.checked);
          this.trace.latheMode = this.machine === 'lathe';
          this.trace.setDiameterMode(force);
        }
      });
      on('trace-section', 'change', (e) => {
        if (this.trace) {
          this.trace.setSectionMode(e.target.checked);
          if (e.target.checked && this.trace.plane !== 'xz') {
            this.trace.setPlane('xz');
            document.querySelectorAll('[data-trace-plane]').forEach(b => {
              b.classList.toggle('active', b.dataset.tracePlane === 'xz');
            });
          }
        }
      });

      // Thread calculator
      this._initThreadCalc();

      // WCS offsets → rebuild toolpath
      const wcsRebuild = () => {
        if (!this.parseResult) return;
        clearTimeout(this._wcsTimer);
        this._wcsTimer = setTimeout(() => this._reparse(), 300);
      };
      document.querySelectorAll('#wcs-tbody input').forEach(inp => {
        inp.addEventListener('change', wcsRebuild);
        inp.addEventListener('input', wcsRebuild);
      });

      // Machine tabs
      document.querySelectorAll('.machine-tabs .tab').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.machine-tabs .tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.machine = btn.dataset.machine;
          this.viewport.setMachine(this.machine);
          if (this.machine === 'lathe') {
            document.getElementById('diameter-mode').checked = true;
            this._setViewMode('trace');
            if (this.trace) {
              this.trace.setPlane('xz');
              this.trace.latheMode = true;
              this.trace.setDiameterMode(true);
            }
            document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
            const tr = document.querySelector('[data-view="trace"]');
            if (tr) tr.classList.add('active');
            document.querySelectorAll('[data-trace-plane]').forEach(b => {
              b.classList.toggle('active', b.dataset.tracePlane === 'xz');
            });
          } else if (this.trace) {
            this.trace.latheMode = false;
          }
          // Show A/C for 5-axis
          const showRot = this.machine === '5axis';
          document.querySelector('.coord.a-axis').classList.toggle('hidden', !showRot);
          document.querySelector('.coord.c-axis').classList.toggle('hidden', !showRot);
        });
      });

      // File load
      document.getElementById('btn-load').addEventListener('click', () => {
        document.getElementById('file-input').click();
      });
      document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.editor.setValue(ev.target.result);
          this._reparse();
        };
        reader.readAsText(file);
        e.target.value = '';
      });

      // Examples
      document.getElementById('btn-examples').addEventListener('click', () => {
        document.getElementById('examples-modal').classList.remove('hidden');
      });
      document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('examples-modal').classList.add('hidden');
      });
      document.querySelector('#examples-modal .modal-backdrop').addEventListener('click', () => {
        document.getElementById('examples-modal').classList.add('hidden');
      });
      document.querySelectorAll('#examples-modal .example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._loadExample(btn.dataset.example);
          document.getElementById('examples-modal').classList.add('hidden');
        });
      });

      // Export
      document.getElementById('btn-export').addEventListener('click', () => {
        document.getElementById('export-modal').classList.remove('hidden');
      });
      document.getElementById('export-close').addEventListener('click', () => {
        document.getElementById('export-modal').classList.add('hidden');
      });
      document.querySelector('#export-modal .modal-backdrop').addEventListener('click', () => {
        document.getElementById('export-modal').classList.add('hidden');
      });
      document.getElementById('export-gcode').addEventListener('click', () => {
        this._exportGCode();
        document.getElementById('export-modal').classList.add('hidden');
      });
      document.getElementById('export-csv').addEventListener('click', () => {
        this._exportCSV();
        document.getElementById('export-modal').classList.add('hidden');
      });
      document.getElementById('export-json').addEventListener('click', () => {
        this._exportJSON();
        document.getElementById('export-modal').classList.add('hidden');
      });
      document.getElementById('export-dxf').addEventListener('click', () => {
        this._exportDXF();
        document.getElementById('export-modal').classList.add('hidden');
      });

      // Editor actions
      document.getElementById('btn-undo').addEventListener('click', () => this._undo());
      document.getElementById('btn-redo').addEventListener('click', () => this._redo());
      document.getElementById('btn-clear').addEventListener('click', () => {
        this.editor.setValue('');
        try { localStorage.removeItem('cnc-gcode-autosave'); } catch (_) {}
        this._reparse();
      });
      document.getElementById('btn-format').addEventListener('click', () => {
        const lines = this.editor.getValue().split('\n').map(l => l.trimEnd());
        this.editor.setValue(lines.join('\n'));
      });

      // 3D → editor sync (click toolpath)
      this.viewport.renderer.domElement.addEventListener('click', (e) => {
        const hit = this.viewport.pickSegment(e.clientX, e.clientY);
        if (hit) this._selectSegment(hit.index, hit.segment, true);
      });

      // Simulation controls
      on('btn-play', 'click', () => {
        if (this.simulator.playing) this.simulator.pause();
        else {
          if (this.simulator.index === 0 && this.trace) this.trace.setProgress(0);
          this.simulator.play();
        }
      });
      on('btn-stop', 'click', () => {
        this.simulator.stop();
        if (this.trace) this.trace.setProgress(1);
      });
      on('btn-reset', 'click', () => {
        this.simulator.reset();
        if (this.trace) this.trace.setProgress(0);
        if (this.viewport) this.viewport.resetMaterialRemoval();
        this._collisionHits = [];
      });
      on('btn-step-fwd', 'click', () => this.simulator.stepForward());
      on('btn-step-back', 'click', () => this.simulator.stepBack());

      const speedSlider = document.getElementById('speed-slider');
      if (speedSlider) {
        speedSlider.addEventListener('input', () => {
          const v = parseFloat(speedSlider.value);
          this.simulator.setSpeed(v);
          const sv = document.getElementById('speed-value');
          if (sv) sv.textContent = v.toFixed(1) + '×';
        });
      }

      // View options
      document.getElementById('show-grid').addEventListener('change', (e) => {
        this.viewport.setGridVisible(e.target.checked);
      });
      document.getElementById('show-axes').addEventListener('change', (e) => {
        this.viewport.setAxesVisible(e.target.checked);
      });
      document.getElementById('show-rapids').addEventListener('change', (e) => {
        this.viewport.setRapidsVisible(e.target.checked);
      });
      document.getElementById('show-tool').addEventListener('change', (e) => {
        this.viewport.setToolVisible(e.target.checked);
      });
      document.getElementById('show-stock').addEventListener('change', (e) => {
        this.viewport.setStockVisible(e.target.checked);
      });
      document.getElementById('show-heatmap').addEventListener('change', () => this._applyPathOptions());
      document.getElementById('show-comp').addEventListener('change', () => this._applyPathOptions());
      document.getElementById('z-filter-on').addEventListener('change', () => this._applyPathOptions());
      document.getElementById('z-min').addEventListener('input', () => this._onZSlider());
      document.getElementById('z-max').addEventListener('input', () => this._onZSlider());

      document.querySelectorAll('#tool-tbody input').forEach(inp => {
        inp.addEventListener('change', () => {
          this._applyPathOptions();
          this._updateActiveToolGeom();
        });
      });

      // PWA install
      this._deferredPrompt = null;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this._deferredPrompt = e;
        const btn = document.getElementById('btn-install');
        if (btn) btn.classList.remove('hidden');
      });
      window.addEventListener('appinstalled', () => {
        this._deferredPrompt = null;
        const btn = document.getElementById('btn-install');
        if (btn) btn.classList.add('hidden');
      });
      document.getElementById('btn-install').addEventListener('click', async () => {
        if (!this._deferredPrompt) {
          alert('Para instalar: abre la app por HTTPS o localhost (no file://).\nEn Chrome móvil: menú → “Instalar app” / “Añadir a pantalla de inicio”.');
          return;
        }
        this._deferredPrompt.prompt();
        try {
          await this._deferredPrompt.userChoice;
        } catch (_) { /* ignore */ }
        this._deferredPrompt = null;
        document.getElementById('btn-install').classList.add('hidden');
      });

      // View presets
      document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this._setViewMode(btn.dataset.view);
        });
      });
      document.querySelectorAll('[data-trace-plane]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-trace-plane]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (this.trace) this.trace.setPlane(btn.dataset.tracePlane);
        });
      });

      // Drag & drop
      const viewport = document.getElementById('viewport');
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
        viewport.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); });
      });
      viewport.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.editor.setValue(ev.target.result);
          this._reparse();
        };
        reader.readAsText(file);
      });
    },

    _initMobile() {
      document.querySelectorAll('.mobile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const panel = tab.dataset.panel;
          document.querySelectorAll('.panel').forEach(p => p.classList.remove('active-mobile'));
          if (panel === 'editor') document.querySelector('.panel-editor').classList.add('active-mobile');
          else if (panel === 'viewport') document.querySelector('.panel-viewport').classList.add('active-mobile');
          else document.querySelector('.panel-info').classList.add('active-mobile');
          // Resize viewport after switch
          setTimeout(() => this.viewport._onResize(), 50);
        });
      });
      // Default mobile view
      if (window.innerWidth <= 900) {
        document.querySelector('.panel-viewport').classList.add('active-mobile');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-panel="viewport"]').classList.add('active');
      }
    },

    _applyTheme(theme) {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add('theme-' + theme);
      localStorage.setItem('cnc-theme', theme);
      if (this.editor) {
        this.editor.setOption('theme', theme === 'dark' ? 'dracula' : 'eclipse');
      }
      if (this.viewport) {
        this.viewport.setBackground(theme === 'dark');
      }
    },

    _loadExample(name) {
      const code = EXAMPLES[name] || EXAMPLES.pocket;
      this.editor.setValue(code);
      this._pushHistory();
      this._autosave(false);
      this._reparse();
      if (name === 'lathe' || name === 'latheface' || name === 'g76') {
        this.machine = 'lathe';
        document.querySelectorAll('.machine-tabs .tab').forEach(b => {
          b.classList.toggle('active', b.dataset.machine === 'lathe');
        });
        document.getElementById('diameter-mode').checked = true;
        this._setViewMode('trace');
        if (this.trace) this.trace.setPlane('xz');
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        const tr = document.querySelector('[data-view="trace"]');
        if (tr) tr.classList.add('active');
      }
    },

    _generateTemplate() {
      const active = document.querySelector('[data-tpl].active');
      const kind = active ? active.dataset.tpl : 'face';
      let code = '';
      if (kind === 'face') {
        const X = +document.getElementById('tpl-face-x').value || 100;
        const Y = +document.getElementById('tpl-face-y').value || 60;
        const Z = +document.getElementById('tpl-face-z').value || -0.5;
        const step = Math.max(0.5, +document.getElementById('tpl-face-step').value || 8);
        const F = +document.getElementById('tpl-face-f').value || 800;
        const S = +document.getElementById('tpl-face-s').value || 6000;
        const T = +document.getElementById('tpl-face-t').value || 1;
        const lines = [
          '; Careado generado — ' + X + 'x' + Y + ' Z' + Z,
          'G21 G90 G17',
          'G54',
          'T' + T + ' M6',
          'S' + S + ' M3',
          'G0 X0 Y0 Z30',
          'G0 Z2',
          'G1 Z' + Z + ' F200'
        ];
        let y = 0, dir = 1;
        while (y <= Y + 1e-6) {
          if (dir > 0) {
            lines.push('G1 X' + X + ' Y' + y.toFixed(3) + ' F' + F);
            y += step;
            if (y <= Y) lines.push('G1 X' + X + ' Y' + Math.min(y, Y).toFixed(3));
          } else {
            lines.push('G1 X0 Y' + y.toFixed(3) + ' F' + F);
            y += step;
            if (y <= Y) lines.push('G1 X0 Y' + Math.min(y, Y).toFixed(3));
          }
          dir *= -1;
        }
        lines.push('G0 Z30', 'M5', 'M30');
        code = lines.join('\n');
      } else if (kind === 'pocket') {
        const X = +document.getElementById('tpl-pok-x').value || 40;
        const Y = +document.getElementById('tpl-pok-y').value || 25;
        const Zf = +document.getElementById('tpl-pok-z').value || -5;
        const stepZ = Math.max(0.5, +document.getElementById('tpl-pok-stepz').value || 2.5);
        const F = +document.getElementById('tpl-pok-f').value || 400;
        const S = +document.getElementById('tpl-pok-s').value || 8000;
        const lines = [
          '; Cavidad generada ' + X + 'x' + Y + 'x' + Zf,
          'G21 G90 G17',
          'G54',
          'T1 M6',
          'S' + S + ' M3',
          'G0 X0 Y0 Z30'
        ];
        for (let z = -stepZ; z >= Zf - 1e-6; z -= stepZ) {
          const zz = Math.max(z, Zf);
          lines.push('G0 X0 Y0 Z2');
          lines.push('G1 Z' + zz.toFixed(3) + ' F200');
          lines.push('G1 X' + X + ' F' + F);
          lines.push('G1 Y' + Y);
          lines.push('G1 X0');
          lines.push('G1 Y0');
        }
        lines.push('G0 Z30', 'M5', 'M30');
        code = lines.join('\n');
      } else if (kind === 'lathe') {
        // lathe OD roughing
        const od = +document.getElementById('tpl-lat-od').value || 40;
        const id = +document.getElementById('tpl-lat-id').value || 28;
        const Z = +document.getElementById('tpl-lat-z').value || -30;
        const U = Math.max(0.2, +document.getElementById('tpl-lat-u').value || 1.5);
        const F = +document.getElementById('tpl-lat-f').value || 0.2;
        const S = +document.getElementById('tpl-lat-s').value || 1200;
        const lines = [
          '; Desbaste torno Ø' + od + ' → Ø' + id + ' Z' + Z,
          '; X en diámetro',
          'G21 G90 G18',
          'G54',
          'T1 M6',
          'S' + S + ' M3',
          'G0 X' + (od + 2) + ' Z5'
        ];
        for (let x = od; x >= id - 1e-6; x -= U * 2) {
          // U is radius DOC; diameter step = 2*U
          const xx = Math.max(x, id);
          lines.push('G0 X' + xx.toFixed(3) + ' Z2');
          lines.push('G1 Z' + Z + ' F' + F);
          lines.push('G0 X' + (od + 2));
          lines.push('G0 Z5');
        }
        lines.push('G0 X' + id + ' Z2');
        lines.push('G1 Z' + Z + ' F' + (F * 0.7));
        lines.push('G0 X' + (od + 2), 'G0 Z5', 'M5', 'M30');
        code = lines.join('\n');
        this.machine = 'lathe';
        document.querySelectorAll('.machine-tabs .tab').forEach(b => {
          b.classList.toggle('active', b.dataset.machine === 'lathe');
        });
        document.getElementById('diameter-mode').checked = true;
      } else if (kind === 'thread') {
        const METRIC = this._metricThreads || {};
        const key = document.getElementById('tpl-thr-metric').value;
        const preset = METRIC[key] || { od: 12, pitch: 1.75, minor: 10.106 };
        const od = +document.getElementById('tpl-thr-od').value || preset.od;
        const pitch = +document.getElementById('tpl-thr-pitch').value || preset.pitch;
        const Z = +document.getElementById('tpl-thr-z').value || -20;
        const Q = +document.getElementById('tpl-thr-q').value || 0.2;
        const S = +document.getElementById('tpl-thr-s').value || 600;
        // Minor diameter approx for ISO metric: d - 1.082532 * pitch
        const minor = preset.minor || (od - 1.082532 * pitch);
        const height = (od - minor) / 2; // radius height
        const Pmic = Math.round(height * 1000);
        const Qmic = Math.round(Q * 1000);
        const clear = od + 2;
        code = [
          '; Rosca métrica M' + key + ' × ' + pitch + ' — G76 visual',
          '; Ø mayor ' + od + '  Ø menor ≈ ' + minor.toFixed(3) + '  paso ' + pitch,
          'G21 G90 G18',
          'G54',
          'T3 M6',
          'S' + S + ' M3',
          'G0 X' + clear + ' Z5',
          'G0 Z2',
          'G76 P020060 Q' + Qmic + ' R0.05',
          'G76 X' + minor.toFixed(3) + ' Z' + Z + ' P' + Pmic + ' Q' + Qmic + ' F' + pitch,
          'G0 X' + clear + ' Z5',
          'M5',
          'M30'
        ].join('\n');
        this.machine = 'lathe';
        document.querySelectorAll('.machine-tabs .tab').forEach(b => {
          b.classList.toggle('active', b.dataset.machine === 'lathe');
        });
        document.getElementById('diameter-mode').checked = true;
      }
      this.editor.setValue(code);
      this._pushHistory();
      this._autosave(false);
      this._reparse();
      if (kind === 'lathe' || kind === 'thread') {
        this._setViewMode('trace');
        if (this.trace) this.trace.setPlane('xz');
      }
    },

    _validateGCode(text, segments, tools) {
      const alarms = [];
      const lines = text.split(/\r?\n/);
      const knownG = {
        0:1,1:1,2:1,3:1,17:1,18:1,19:1,20:1,21:1,28:1,40:1,41:1,42:1,
        54:1,55:1,56:1,57:1,58:1,59:1,80:1,81:1,82:1,83:1,84:1,85:1,86:1,89:1,
        90:1,91:1,98:1,99:1,71:1,72:1,76:1
      };
      let lastMotion = 'G0';
      let sawTool = false;
      let toolNum = 0;
      let hasFeed = false;

      lines.forEach((raw, i) => {
        const ln = i + 1;
        const cleaned = raw.replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
        if (!cleaned) return;
        const words = {};
        const re = /([A-Za-z])\s*(-?\d*\.?\d+)/g;
        let m;
        while ((m = re.exec(cleaned)) !== null) {
          words[m[1].toUpperCase()] = parseFloat(m[2]);
        }
        if (words.G !== undefined) {
          const g = words.G;
          if (!knownG[g] && g !== 4) {
            alarms.push({ level: 'warn', line: ln, msg: 'G' + g + ' no soportado / desconocido' });
          }
          if (g === 0) lastMotion = 'G0';
          if (g === 1 || g === 2 || g === 3) lastMotion = 'G1';
        }
        if (words.T !== undefined) { sawTool = true; toolNum = words.T; }
        if (words.M === 6) sawTool = true;
        if (words.F !== undefined) hasFeed = true;

        // Cut without feed
        if ((words.G === 1 || lastMotion === 'G1') && (words.X !== undefined || words.Y !== undefined || words.Z !== undefined)) {
          if (!hasFeed && words.F === undefined) {
            // only once per program style
          }
        }
      });

      if (!sawTool) {
        alarms.push({ level: 'warn', line: 0, msg: 'No se definió herramienta (T / M6)' });
      } else if (toolNum && tools && !tools[toolNum]) {
        alarms.push({ level: 'warn', line: 0, msg: 'T' + toolNum + ' no está en la tabla de herramientas' });
      }

      // Plunge without rapid approach
      let prevWasRapid = true;
      let prevZ = 0;
      (segments || []).forEach(s => {
        if (s.type === 'rapid') {
          prevWasRapid = true;
        } else if (s.type === 'cut') {
          const dz = s.to.z - s.from.z;
          if (dz < -0.2 && !prevWasRapid && s.from.z > s.to.z) {
            // only flag steep plunge from air without recent rapid
            if (s.from.z > 1 && Math.abs(s.to.x - s.from.x) < 0.01 && Math.abs(s.to.y - s.from.y) < 0.01) {
              alarms.push({
                level: 'error',
                line: s.lineNum,
                msg: 'Penetración Z en G1 sin aproximación G0 (L' + s.lineNum + ')'
              });
            }
          }
          prevWasRapid = false;
        }
        prevZ = s.to.z;
      });

      // Missing F on any cut
      const cutsNoF = (segments || []).filter(s => s.type === 'cut' && !(s.feed > 0));
      if (cutsNoF.length) {
        alarms.push({
          level: 'warn',
          line: cutsNoF[0].lineNum,
          msg: 'Movimientos de corte sin F (feed) definido'
        });
      }

      // Empty
      if (!(segments || []).length && text.trim()) {
        alarms.push({ level: 'info', line: 0, msg: 'No se generaron movimientos — revisa el G-code' });
      }

      return alarms;
    },

    _renderAlarms(alarms) {
      const box = document.getElementById('alarms-list');
      const badge = document.getElementById('alarm-count');
      if (!box) return;
      badge.textContent = String(alarms.length);
      badge.classList.toggle('zero', alarms.length === 0);
      if (!alarms.length) {
        box.innerHTML = '<div class="alarm-empty">Sin alarmas</div>';
        return;
      }
      box.innerHTML = alarms.map(a => {
        const cls = a.level === 'error' ? '' : (a.level === 'warn' ? 'warn' : 'info');
        const tag = a.line ? 'L' + a.line + ' · ' : '';
        return '<div class="alarm-item ' + cls + '">' + tag + a.msg + '</div>';
      }).join('');
    },

    _updateCoordDisplay(x, y, z) {
      const chk = document.getElementById('diameter-mode');
      const dia = this.machine === 'lathe' || (chk && chk.checked);
      if (dia) {
        document.getElementById('pos-x').textContent = (x * 2).toFixed(3) + 'Ø';
      } else {
        document.getElementById('pos-x').textContent = x.toFixed(3);
      }
      document.getElementById('pos-y').textContent = y.toFixed(3);
      document.getElementById('pos-z').textContent = z.toFixed(3);
    },

    _initThreadCalc() {
      // ISO metric coarse (Ø, pitch, minor approx)
      const METRIC = [
        { name: 'M3×0.5', od: 3, pitch: 0.5, minor: 2.387 },
        { name: 'M4×0.7', od: 4, pitch: 0.7, minor: 3.141 },
        { name: 'M5×0.8', od: 5, pitch: 0.8, minor: 4.019 },
        { name: 'M6×1', od: 6, pitch: 1.0, minor: 4.917 },
        { name: 'M8×1.25', od: 8, pitch: 1.25, minor: 6.647 },
        { name: 'M10×1.5', od: 10, pitch: 1.5, minor: 8.376 },
        { name: 'M12×1.75', od: 12, pitch: 1.75, minor: 10.106 },
        { name: 'M14×2', od: 14, pitch: 2.0, minor: 11.835 },
        { name: 'M16×2', od: 16, pitch: 2.0, minor: 13.835 },
        { name: 'M18×2.5', od: 18, pitch: 2.5, minor: 15.294 },
        { name: 'M20×2.5', od: 20, pitch: 2.5, minor: 17.294 },
        { name: 'M24×3', od: 24, pitch: 3.0, minor: 20.752 }
      ];
      // UNC/UNF common (size, TPI, major inch)
      const UN = [
        { name: '1/4-20 UNC', odIn: 0.25, tpi: 20 },
        { name: '5/16-18 UNC', odIn: 0.3125, tpi: 18 },
        { name: '3/8-16 UNC', odIn: 0.375, tpi: 16 },
        { name: '1/2-13 UNC', odIn: 0.5, tpi: 13 },
        { name: '5/8-11 UNC', odIn: 0.625, tpi: 11 },
        { name: '3/4-10 UNC', odIn: 0.75, tpi: 10 },
        { name: '1/4-28 UNF', odIn: 0.25, tpi: 28 },
        { name: '5/16-24 UNF', odIn: 0.3125, tpi: 24 },
        { name: '3/8-24 UNF', odIn: 0.375, tpi: 24 },
        { name: '1/2-20 UNF', odIn: 0.5, tpi: 20 }
      ];
      this._threadTables = { METRIC, UN };

      const mSel = document.getElementById('thr-table-metric');
      const uSel = document.getElementById('thr-table-un');
      if (mSel) {
        mSel.innerHTML = METRIC.map((r, i) =>
          '<option value="' + i + '">' + r.name + '  Ø' + r.od + '  P' + r.pitch + '</option>'
        ).join('');
      }
      if (uSel) {
        uSel.innerHTML = UN.map((r, i) =>
          '<option value="' + i + '">' + r.name + '  ' + r.tpi + ' TPI</option>'
        ).join('');
      }

      const fillFromMetric = (r) => {
        document.getElementById('thr-od').value = r.od;
        document.getElementById('thr-pitch').value = r.pitch;
        document.getElementById('thr-minor').value = r.minor.toFixed(3);
        document.getElementById('thr-height').value = ((r.od - r.minor) / 2).toFixed(4);
        document.getElementById('thr-f').value = r.pitch;
      };
      const fillFromUn = (r) => {
        const od = r.odIn * 25.4;
        const pitch = 25.4 / r.tpi;
        // approx minor for 60°: H = 0.866025 * pitch; minor ≈ od - 5/4 H * 2? external minor ≈ od - 1.0825*pitch
        const minor = od - 1.082532 * pitch;
        document.getElementById('thr-od').value = od.toFixed(3);
        document.getElementById('thr-pitch').value = pitch.toFixed(4);
        document.getElementById('thr-minor').value = minor.toFixed(3);
        document.getElementById('thr-height').value = ((od - minor) / 2).toFixed(4);
        document.getElementById('thr-f').value = pitch.toFixed(4);
      };

      if (mSel) {
        mSel.addEventListener('change', () => {
          const r = METRIC[+mSel.value];
          if (r) fillFromMetric(r);
        });
        mSel.selectedIndex = 6; // M12
        fillFromMetric(METRIC[6]);
      }
      if (uSel) {
        uSel.addEventListener('change', () => {
          const r = UN[+uSel.value];
          if (r) fillFromUn(r);
        });
      }

      document.querySelectorAll('[data-thr-sys]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-thr-sys]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const isM = btn.dataset.thrSys === 'metric';
          document.getElementById('thr-metric-panel').classList.toggle('hidden', !isM);
          document.getElementById('thr-un-panel').classList.toggle('hidden', isM);
        });
      });

      const on = (id, ev, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(ev, fn);
      };
      on('btn-thread-calc', 'click', () => {
        document.getElementById('thread-calc-modal').classList.remove('hidden');
      });
      on('thread-calc-close', 'click', () => {
        document.getElementById('thread-calc-modal').classList.add('hidden');
      });
      const bd = document.querySelector('#thread-calc-modal .modal-backdrop');
      if (bd) bd.addEventListener('click', () => {
        document.getElementById('thread-calc-modal').classList.add('hidden');
      });
      on('btn-thr-to-g76', 'click', () => {
        const od = +document.getElementById('thr-od').value;
        const pitch = +document.getElementById('thr-pitch').value;
        const minor = +document.getElementById('thr-minor').value;
        const Z = +document.getElementById('thr-z').value || -20;
        const Q = +document.getElementById('thr-q').value || 0.2;
        const height = (od - minor) / 2;
        const Pmic = Math.round(height * 1000);
        const Qmic = Math.round(Q * 1000);
        const clear = od + 2;
        const code = [
          '; Rosca generada — Ø' + od.toFixed(3) + ' paso ' + pitch.toFixed(4),
          'G21 G90 G18',
          'G54',
          'T3 M6',
          'S600 M3',
          'G0 X' + clear.toFixed(3) + ' Z5',
          'G0 Z2',
          'G76 P020060 Q' + Qmic + ' R0.05',
          'G76 X' + minor.toFixed(3) + ' Z' + Z + ' P' + Pmic + ' Q' + Qmic + ' F' + pitch.toFixed(4),
          'G0 X' + clear.toFixed(3) + ' Z5',
          'M5',
          'M30'
        ].join('\n');
        this.editor.setValue(code);
        this._pushHistory();
        this.machine = 'lathe';
        document.querySelectorAll('.machine-tabs .tab').forEach(b => {
          b.classList.toggle('active', b.dataset.machine === 'lathe');
        });
        document.getElementById('diameter-mode').checked = true;
        document.getElementById('thread-calc-modal').classList.add('hidden');
        this._reparse();
        this._setViewMode('trace');
        if (this.trace) {
          this.trace.setPlane('xz');
          this.trace.latheMode = true;
          this.trace.setDiameterMode(true);
        }
      });
    },

    _download(filename, content, mime) {
      const blob = new Blob([content], { type: mime || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    _exportGCode() {
      const segs = (this.parseResult && this.parseResult.segments) || [];
      if (!segs.length) { alert('No hay toolpath para exportar'); return; }
      const lines = [
        '; CNC PathSim Pro — G-Code expandido',
        '; Ciclos G81/G83 ya descompuestos en movimientos',
        'G21 G90 G17',
        'G54'
      ];
      let lastType = null;
      segs.forEach(s => {
        const p = s.to;
        if (s.type === 'rapid') {
          lines.push(`G0 X${p.x.toFixed(3)} Y${p.y.toFixed(3)} Z${p.z.toFixed(3)}`);
          lastType = 'G0';
        } else if (s.type === 'cut') {
          const f = s.feed ? ` F${s.feed}` : '';
          lines.push(`G1 X${p.x.toFixed(3)} Y${p.y.toFixed(3)} Z${p.z.toFixed(3)}${f}`);
          lastType = 'G1';
        } else if (s.type && s.type.startsWith('arc')) {
          const g = s.type === 'arc-cw' ? 'G2' : 'G3';
          let extra = '';
          if (s.arc) {
            extra = ` I${(s.arc.cx - s.from.x).toFixed(3)} J${(s.arc.cy - s.from.y).toFixed(3)}`;
          }
          const f = s.feed ? ` F${s.feed}` : '';
          lines.push(`${g} X${p.x.toFixed(3)} Y${p.y.toFixed(3)} Z${p.z.toFixed(3)}${extra}${f}`);
          lastType = g;
        }
      });
      lines.push('M30');
      this._download('toolpath_expanded.nc', lines.join('\n'), 'text/plain');
    },

    _exportCSV() {
      const segs = (this.parseResult && this.parseResult.segments) || [];
      if (!segs.length) { alert('No hay toolpath para exportar'); return; }
      const rows = ['index,type,from_x,from_y,from_z,to_x,to_y,to_z,distance,feed,line'];
      segs.forEach((s, i) => {
        rows.push([
          i + 1,
          s.type,
          s.from.x.toFixed(4), s.from.y.toFixed(4), s.from.z.toFixed(4),
          s.to.x.toFixed(4), s.to.y.toFixed(4), s.to.z.toFixed(4),
          s.distance.toFixed(4),
          s.feed || 0,
          s.lineNum || ''
        ].join(','));
      });
      this._download('toolpath.csv', rows.join('\n'), 'text/csv');
    },

    _exportJSON() {
      const segs = (this.parseResult && this.parseResult.segments) || [];
      if (!segs.length) { alert('No hay toolpath para exportar'); return; }
      const data = {
        generator: 'CNC PathSim Pro',
        stats: this.parseResult.stats,
        bbox: this.parseResult.bbox,
        segments: segs.map(s => ({
          type: s.type,
          from: s.from,
          to: s.to,
          feed: s.feed,
          lineNum: s.lineNum,
          distance: s.distance,
          arc: s.arc || null
        }))
      };
      this._download('toolpath.json', JSON.stringify(data, null, 2), 'application/json');
    },

    _exportDXF() {
      const segs = (this.parseResult && this.parseResult.segments) || [];
      if (!segs.length) { alert('No hay toolpath para exportar'); return; }
      // Minimal DXF: LINE entities in XY plane (Z ignored for 2D CAD)
      const ents = [];
      segs.forEach(s => {
        ents.push('0', 'LINE', '8', s.type === 'rapid' ? 'RAPIDS' : 'CUTS');
        ents.push('10', s.from.x.toFixed(4), '20', s.from.y.toFixed(4), '30', '0');
        ents.push('11', s.to.x.toFixed(4), '21', s.to.y.toFixed(4), '31', '0');
      });
      const dxf = [
        '0', 'SECTION', '2', 'HEADER',
        '9', '$ACADVER', '1', 'AC1009',
        '0', 'ENDSEC',
        '0', 'SECTION', '2', 'TABLES',
        '0', 'TABLE', '2', 'LAYER', '70', '2',
        '0', 'LAYER', '2', 'CUTS', '70', '0', '62', '3', '6', 'CONTINUOUS',
        '0', 'LAYER', '2', 'RAPIDS', '70', '0', '62', '1', '6', 'CONTINUOUS',
        '0', 'ENDTAB', '0', 'ENDSEC',
        '0', 'SECTION', '2', 'ENTITIES',
        ...ents,
        '0', 'ENDSEC',
        '0', 'EOF'
      ].join('\n');
      this._download('toolpath.dxf', dxf, 'application/dxf');
    },

    _reparse() {
      const text = this.editor.getValue();
      document.getElementById('line-count').textContent = text.split('\n').length + ' líneas';
      document.getElementById('parse-status').textContent = 'Parseando…';

      try {
        this.parseResult = this.parser.parse(text);
        const { segments, stats, bbox } = this.parseResult;

        // Update Z slider range from bbox
        if (isFinite(bbox.min.z)) {
          const z0 = Math.floor(bbox.min.z - 1);
          const z1 = Math.ceil(bbox.max.z + 1);
          const zMinEl = document.getElementById('z-min');
          const zMaxEl = document.getElementById('z-max');
          zMinEl.min = z0; zMinEl.max = z1;
          zMaxEl.min = z0; zMaxEl.max = z1;
          if (!document.getElementById('z-filter-on').checked) {
            zMinEl.value = z0;
            zMaxEl.value = z1;
          }
        }

        const visSegs = this._applyWcsToSegments(segments);
        this.viewport.buildToolpath(visSegs, this._getPathOptions());
        this.viewport.updateStock(bbox);
        this.viewport.resetMaterialRemoval();
        this.simulator.load(visSegs);
        this._updateActiveToolGeom();
        this._collisionHits = [];
        if (this.trace) {
          this.trace.setSegments(visSegs);
          this.trace.setProgress(1);
          if (this._viewMode === 'trace') this.trace.resize();
        }

        const tools = this._getTools();
        const alarms = this._validateGCode(text, segments, tools);
        // Pre-scan collisions on rapids
        visSegs.forEach(s => {
          if (s.type === 'rapid') {
            const hit = this.viewport.checkCollision(s.from, s.to, 'rapid');
            if (hit) {
              alarms.push({
                level: 'error',
                line: s.lineNum,
                msg: 'Colisión rapid/stock L' + s.lineNum +
                  ' @ X' + hit.x.toFixed(1) + ' Y' + hit.y.toFixed(1) + ' Z' + hit.z.toFixed(1)
              });
            }
          }
        });
        this._renderAlarms(alarms);
        const st = document.getElementById('parse-status');
        if (alarms.some(a => a.level === 'error')) st.textContent = 'Alarmas';
        else if (alarms.length) st.textContent = 'Avisos';
        else st.textContent = 'OK';

        // Stats
        document.getElementById('stat-moves').textContent = stats.moves;
        document.getElementById('stat-distance').textContent = stats.distance.toFixed(1) + ' mm';
        document.getElementById('stat-rapids').textContent = stats.rapids;
        document.getElementById('stat-cuts').textContent = stats.cuts;
        document.getElementById('stat-arcs').textContent = stats.arcs;
        document.getElementById('stat-cycles').textContent = stats.cycles || 0;

        if (isFinite(bbox.min.x)) {
          const dx = (bbox.max.x - bbox.min.x).toFixed(1);
          const dy = (bbox.max.y - bbox.min.y).toFixed(1);
          const dz = (bbox.max.z - bbox.min.z).toFixed(1);
          document.getElementById('stat-bbox').textContent = `${dx}×${dy}×${dz}`;
        } else {
          document.getElementById('stat-bbox').textContent = '—';
        }

        // Cycle time estimate
        const timeInfo = this._estimateTime(segments);
        document.getElementById('stat-time').textContent = timeInfo.label;
        document.getElementById('time-detail').textContent = timeInfo.detail;

        document.getElementById('parse-status').textContent = segments.length + ' movimientos';
        document.getElementById('parse-status').style.color = '';
      } catch (err) {
        console.error(err);
        document.getElementById('parse-status').textContent = 'Error de parseo';
        document.getElementById('parse-status').style.color = 'var(--danger)';
      }
    },

    _getTools() {
      const tools = {};
      document.querySelectorAll('#tool-tbody tr').forEach(tr => {
        const t = parseInt(tr.getAttribute('data-t'), 10);
        const dia = parseFloat(tr.querySelector('.tool-dia').value) || 6;
        const len = parseFloat(tr.querySelector('.tool-len').value) || 30;
        tools[t] = { diameter: dia, length: len };
      });
      return tools;
    },

    _getWcsOffsets() {
      const map = {};
      document.querySelectorAll('#wcs-tbody tr').forEach(tr => {
        const name = tr.getAttribute('data-wcs');
        map[name] = {
          x: parseFloat(tr.querySelector('.wcs-x').value) || 0,
          y: parseFloat(tr.querySelector('.wcs-y').value) || 0,
          z: parseFloat(tr.querySelector('.wcs-z').value) || 0
        };
      });
      return map;
    },

    _getActiveWcsName() {
      const r = document.querySelector('input[name="wcs-active"]:checked');
      return r ? r.value : 'G54';
    },

    _applyWcsToSegments(segments) {
      const offsets = this._getWcsOffsets();
      // Use per-segment wcs if present, else active radio
      const active = this._getActiveWcsName();
      return (segments || []).map(s => {
        const w = s.wcs && offsets[s.wcs] ? s.wcs : active;
        const o = offsets[w] || { x: 0, y: 0, z: 0 };
        if (!o.x && !o.y && !o.z) return s;
        const copy = Object.assign({}, s);
        copy.from = { x: s.from.x + o.x, y: s.from.y + o.y, z: s.from.z + o.z, a: s.from.a, c: s.from.c };
        copy.to = { x: s.to.x + o.x, y: s.to.y + o.y, z: s.to.z + o.z, a: s.to.a, c: s.to.c };
        if (s.arc) {
          copy.arc = Object.assign({}, s.arc, {
            cx: (s.arc.cx || 0) + o.x,
            cy: (s.arc.cy || 0) + o.y,
            cz: (s.arc.cz || 0) + o.z
          });
        }
        return copy;
      });
    },

    _getPathOptions() {
      const heatMap = document.getElementById('show-heatmap').checked;
      const showComp = document.getElementById('show-comp').checked;
      const zOn = document.getElementById('z-filter-on').checked;
      let zMin = null, zMax = null;
      if (zOn) {
        zMin = parseFloat(document.getElementById('z-min').value);
        zMax = parseFloat(document.getElementById('z-max').value);
        if (zMin > zMax) { const t = zMin; zMin = zMax; zMax = t; }
        document.getElementById('z-range-label').textContent =
          zMin.toFixed(1) + ' … ' + zMax.toFixed(1);
      } else {
        document.getElementById('z-range-label').textContent = 'todo';
      }
      return { heatMap, showComp, zMin, zMax, tools: this._getTools() };
    },

    _applyPathOptions() {
      if (!this.parseResult) return;
      this.viewport.setPathOptions(this._getPathOptions());
    },

    _onZSlider() {
      if (!document.getElementById('z-filter-on').checked) {
        document.getElementById('z-filter-on').checked = true;
      }
      this._applyPathOptions();
    },

    _updateActiveToolGeom(toolNum) {
      const tools = this._getTools();
      let t = toolNum;
      if (t == null && this.parseResult && this.parser) t = this.parser.state.tool;
      t = t || 1;
      const tool = tools[t] || tools[1] || { diameter: 6, length: 30 };
      this.viewport.setToolGeometry(tool.diameter, tool.length);
    },

    _estimateTime(segments) {
      // Defaults: rapid 5000 mm/min, feed from segment or 500 mm/min
      const RAPID_F = 5000;
      const DEFAULT_FEED = 500;
      let cutMin = 0;
      let rapidMin = 0;
      let cutDist = 0;
      let rapidDist = 0;

      segments.forEach(s => {
        const d = s.distance || 0;
        if (s.type === 'rapid') {
          rapidDist += d;
          rapidMin += d / RAPID_F;
        } else {
          // cuts and arcs
          const f = (s.feed && s.feed > 0) ? s.feed : DEFAULT_FEED;
          cutDist += d;
          cutMin += d / f;
        }
      });

      let dwellSec = 0;
      segments.forEach(s => { dwellSec += s.dwell || 0; });
      if (this.parseResult && this.parseResult.stats && this.parseResult.stats.dwellSec) {
        dwellSec = Math.max(dwellSec, this.parseResult.stats.dwellSec);
      }

      const totalMin = cutMin + rapidMin + dwellSec / 60;
      const totalSec = totalMin * 60;

      let label;
      if (totalSec < 60) label = totalSec.toFixed(1) + ' s';
      else if (totalMin < 60) {
        const m = Math.floor(totalMin);
        const s = Math.round((totalMin - m) * 60);
        label = m + 'm ' + s + 's';
      } else {
        const h = Math.floor(totalMin / 60);
        const m = Math.round(totalMin % 60);
        label = h + 'h ' + m + 'm';
      }

      const detail = 'Corte: ' + (cutMin * 60).toFixed(1) + 's (' + cutDist.toFixed(0) + ' mm) · ' +
        'Rapid: ' + (rapidMin * 60).toFixed(1) + 's (' + rapidDist.toFixed(0) + ' mm)' +
        (dwellSec ? ' · Dwell: ' + dwellSec.toFixed(1) + 's' : '') +
        ' · Frapid≈' + RAPID_F + ' mm/min';

      return { label, detail, totalSec, cutMin, rapidMin };
    },

    _onSimUpdate(data) {
      const playBtn = document.getElementById('btn-play');
      if (data.playing) playBtn.classList.add('playing');
      else playBtn.classList.remove('playing');

      if (data.position) {
        const p = data.position;
        this._updateCoordDisplay(p.x, p.y, p.z);
        document.getElementById('pos-a').textContent = (p.a || 0).toFixed(3);
        document.getElementById('pos-c').textContent = (p.c || 0).toFixed(3);
        if (this.trace) this.trace.setTool(p.x, p.y, p.z);
      }

      // Material removal + live collision on current segment
      if (data.segment && data.index > 0) {
        const s = data.segment;
        if (s.type === 'cut' || (s.type && s.type.startsWith('arc'))) {
          const tools = this._getTools();
          const t = tools[s.tool] || tools[1] || { diameter: 6 };
          this.viewport.carveSegment(s.from, s.to, (t.diameter || 6) / 2);
          if (data.index % 3 === 0) this.viewport.flushMaterialRemoval();
        } else if (s.type === 'rapid') {
          const hit = this.viewport.checkCollision(s.from, s.to, 'rapid');
          if (hit && !(this._collisionHits || []).includes(s.lineNum)) {
            this._collisionHits = this._collisionHits || [];
            this._collisionHits.push(s.lineNum);
            const alarms = [{
              level: 'error',
              line: s.lineNum,
              msg: 'COLISIÓN rapid/stock L' + s.lineNum +
                ' Z' + hit.z.toFixed(2) + ' < stock Z' + hit.surfaceZ.toFixed(2)
            }];
            // append to list
            const box = document.getElementById('alarms-list');
            if (box && !box.innerHTML.includes('L' + s.lineNum)) {
              box.insertAdjacentHTML('afterbegin',
                '<div class="alarm-item">L' + s.lineNum + ' · COLISIÓN rapid/stock</div>');
              const badge = document.getElementById('alarm-count');
              if (badge) badge.textContent = String((parseInt(badge.textContent, 10) || 0) + 1);
            }
          }
        }
      }
      if (data.finished) this.viewport.flushMaterialRemoval();

      if (data.total !== undefined) {
        const pct = data.total ? (data.index / data.total * 100) : 0;
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('progress-line').textContent = `Línea ${data.index} / ${data.total}`;
        document.getElementById('progress-pct').textContent = pct.toFixed(0) + '%';
        if (this.trace && data.total) {
          this.trace.setProgress(data.total ? data.index / data.total : 0);
        }
      }
      if (data.finished && this.trace) this.trace.setProgress(1);

      if (data.segment) {
        const s = data.segment;
        document.getElementById('current-line').textContent = s.raw || '—';
        document.getElementById('info-mode').textContent = s.absolute ? 'G90 Abs' : 'G91 Inc';
        document.getElementById('info-plane').textContent = 'G17 ' + (s.plane || 'XY');
        document.getElementById('info-units').textContent = s.units === 'inch' ? 'G20 inch' : 'G21 mm';
        document.getElementById('info-feed').textContent = s.feed ? s.feed + ' mm/min' : '—';
        document.getElementById('info-spindle').textContent =
          s.spindle === 1 ? 'CW ' + (this.parser.state.s || '') :
          s.spindle === -1 ? 'CCW' : 'OFF';
        document.getElementById('info-tool').textContent = 'T' + (s.tool || 0);
        document.getElementById('info-coolant').textContent = s.coolant ? 'ON' : 'OFF';
        document.getElementById('info-wcs').textContent = s.wcs || 'G54';
        // Sync radio to program WCS
        if (s.wcs) {
          const radio = document.querySelector('input[name="wcs-active"][value="' + s.wcs + '"]');
          if (radio && !radio.checked) radio.checked = true;
        }
        const planeCode = s.plane === 'XZ' ? 'G18' : (s.plane === 'YZ' ? 'G19' : 'G17');
        document.getElementById('info-plane').textContent = planeCode + ' ' + (s.plane || 'XY');
        this._updateActiveToolGeom(s.tool);

        // Highlight line in editor (never while user is typing — breaks mobile input)
        if (s.lineNum && !this._typing && !this._syncLock) {
          this._syncLock = true;
          try {
            if (this.simulator && this.simulator.playing) {
              this.editor.setCursor(s.lineNum - 1, 0);
            }
            if (this._hlLine) this.editor.removeLineClass(this._hlLine, 'background', 'cm-sim-line');
            this._hlLine = this.editor.addLineClass(s.lineNum - 1, 'background', 'cm-sim-line');
          } finally {
            this._syncLock = false;
          }
        }
      }
    }
  };

  // Highlight style for simulation line
  const style = document.createElement('style');
  style.textContent = `
    .cm-sim-line { background: rgba(59, 130, 246, 0.18) !important; }
    .cm-s-dracula .cm-keyword.cm-rapid { color: #ff5555; }
    .cm-s-dracula .cm-keyword.cm-cut { color: #50fa7b; }
    .cm-s-dracula .cm-keyword.cm-arc { color: #bd93f9; }
    .cm-s-eclipse .cm-keyword.cm-rapid { color: #c41a16; }
    .cm-s-eclipse .cm-keyword.cm-cut { color: #1a7f37; }
    .cm-s-eclipse .cm-keyword.cm-arc { color: #8250df; }
  `;
  document.head.appendChild(style);

  // Boot
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
