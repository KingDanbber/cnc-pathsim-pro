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
        initialZ: 0
      };
      this.segments = [];
      this.stats = { moves: 0, distance: 0, rapids: 0, cuts: 0, arcs: 0, cycles: 0, dwellSec: 0 };
      this.bbox = { min: { x: Infinity, y: Infinity, z: Infinity }, max: { x: -Infinity, y: -Infinity, z: -Infinity } };
    }

    parse(text) {
      this.reset();
      const lines = text.split(/\r?\n/);
      const result = [];

      for (let li = 0; li < lines.length; li++) {
        const raw = lines[li];
        const cleaned = raw.replace(/;.*$/, '').replace(/\(.*?\)/g, '').trim();
        if (!cleaned) {
          result.push({ lineNum: li + 1, raw, type: 'empty', words: {} });
          continue;
        }

        const words = this._parseWords(cleaned);
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
        else if (g >= 54 && g <= 59) { s.wcs = 'G' + g; }
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

      const seg = this._makeSeg(lineNum, raw, type, from, to, {
        arc, words, plane: s.plane, tool: s.tool, feed: s.f,
        comp: s.comp, compD: s.compD
      });
      return [seg];
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
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 6, 12),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b, metalness: 0.6, roughness: 0.3,
          emissive: 0xf59e0b, emissiveIntensity: 0.15
        })
      );
      cone.rotation.x = Math.PI;
      cone.position.y = 0;
      this.toolMesh.add(cone);
      this.toolMesh.userData.cone = cone;
      this.scene.add(this.toolMesh);
    }

    setToolGeometry(diameter, length) {
      if (!this.toolMesh) return;
      const cone = this.toolMesh.userData.cone;
      if (!cone) return;
      const r = Math.max((diameter || 6) / 2, 0.3);
      const h = Math.max(length || 20, 4);
      cone.geometry.dispose();
      cone.geometry = new THREE.ConeGeometry(r, h, 16);
      cone.rotation.x = Math.PI;
      // tip at tool position: cone height along +Y in local after rotation means tip at origin
      cone.position.y = h / 2;
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
      const dist = size * 1.8;

      // Map: CNC X → Three X, CNC Z → Three Y, CNC Y → Three -Z
      this.controls.target.set(cx, cz, -cy);
      this.camera.position.set(cx + dist * 0.7, cz + dist * 0.6, -cy + dist * 0.7);
      this.controls.update();
    }

    setView(name) {
      const t = this.controls.target;
      const d = 80;
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
      this.controls.update();
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
      if (!bbox || !isFinite(bbox.min.x)) return;

      const pad = padding != null ? padding : 5;
      const minX = bbox.min.x - pad;
      const maxX = bbox.max.x + pad;
      const minY = bbox.min.y - pad;
      const maxY = bbox.max.y + pad;
      // Stock from Z=0 (table) down to min Z with margin, or full range if all positive
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

      // Three.js: X=X, Y=Z, Z=-Y
      const geo = new THREE.BoxGeometry(sx, sz, sy);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        transparent: true,
        opacity: 0.22,
        metalness: 0.1,
        roughness: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      this.stockMesh = new THREE.Mesh(geo, mat);
      this.stockMesh.position.set(cx, cz, -cy);
      this.stockMesh.visible = this.showStock;

      // Edge outline
      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x9ca3af, transparent: true, opacity: 0.45 });
      const edgeLines = new THREE.LineSegments(edges, edgeMat);
      this.stockMesh.add(edgeLines);

      this.scene.add(this.stockMesh);
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
      this.camera.aspect = w / h;
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

      this.editor = CodeMirror.fromTextArea(document.getElementById('gcode-editor'), {
        mode: 'gcode',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: false,
        styleActiveLine: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        extraKeys: {
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

      // Restore autosave
      try {
        const saved = localStorage.getItem('cnc-gcode-autosave');
        if (saved && saved.trim()) {
          this.editor.setValue(saved);
        }
      } catch (_) { /* ignore */ }

      this.editor.on('change', () => {
        if (!this._historyLock) this._pushHistory();
        clearTimeout(this._parseTimer);
        this._parseTimer = setTimeout(() => this._reparse(), 400);
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => this._autosave(false), 800);
      });

      this.editor.on('cursorActivity', () => {
        if (this._syncLock) return;
        this._onEditorCursor();
      });

      // Seed history
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
      if (!this.parseResult || !this.parseResult.segments) return;
      const line = this.editor.getCursor().line + 1;
      const segs = this.parseResult.segments;
      // Prefer last segment of that line
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
      if (scrollEditor && seg.lineNum) {
        this._syncLock = true;
        this.editor.setCursor(seg.lineNum - 1, 0);
        this.editor.scrollIntoView({ line: seg.lineNum - 1, ch: 0 }, 80);
        if (this._hlLine) this.editor.removeLineClass(this._hlLine, 'background', 'cm-sim-line');
        this._hlLine = this.editor.addLineClass(seg.lineNum - 1, 'background', 'cm-sim-line');
        this._syncLock = false;
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
    },

    _initSimulator() {
      this.simulator = new Simulator(this.viewport, (data) => this._onSimUpdate(data));
    },

    _bindEvents() {
      // Theme
      document.getElementById('btn-theme').addEventListener('click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        this._applyTheme(isDark ? 'light' : 'dark');
      });

      // Machine tabs
      document.querySelectorAll('.machine-tabs .tab').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.machine-tabs .tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.machine = btn.dataset.machine;
          this.viewport.setMachine(this.machine);
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
      document.getElementById('btn-play').addEventListener('click', () => {
        if (this.simulator.playing) this.simulator.pause();
        else this.simulator.play();
      });
      document.getElementById('btn-reset').addEventListener('click', () => this.simulator.reset());
      document.getElementById('btn-step-fwd').addEventListener('click', () => this.simulator.stepForward());
      document.getElementById('btn-step-back').addEventListener('click', () => this.simulator.stepBack());

      const speedSlider = document.getElementById('speed-slider');
      speedSlider.addEventListener('input', () => {
        const v = parseFloat(speedSlider.value);
        this.simulator.setSpeed(v);
        document.getElementById('speed-value').textContent = v.toFixed(1) + '×';
      });

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
        btn.addEventListener('click', () => this.viewport.setView(btn.dataset.view));
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

        this.viewport.buildToolpath(segments, this._getPathOptions());
        this.viewport.updateStock(bbox);
        this.simulator.load(segments);
        this._updateActiveToolGeom();

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
        document.getElementById('pos-x').textContent = p.x.toFixed(3);
        document.getElementById('pos-y').textContent = p.y.toFixed(3);
        document.getElementById('pos-z').textContent = p.z.toFixed(3);
        document.getElementById('pos-a').textContent = (p.a || 0).toFixed(3);
        document.getElementById('pos-c').textContent = (p.c || 0).toFixed(3);
      }

      if (data.total !== undefined) {
        const pct = data.total ? (data.index / data.total * 100) : 0;
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('progress-line').textContent = `Línea ${data.index} / ${data.total}`;
        document.getElementById('progress-pct').textContent = pct.toFixed(0) + '%';
      }

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
        const planeCode = s.plane === 'XZ' ? 'G18' : (s.plane === 'YZ' ? 'G19' : 'G17');
        document.getElementById('info-plane').textContent = planeCode + ' ' + (s.plane || 'XY');
        this._updateActiveToolGeom(s.tool);

        // Highlight line in editor
        if (s.lineNum) {
          this.editor.setCursor(s.lineNum - 1, 0);
          const line = this.editor.getLineHandle(s.lineNum - 1);
          // clear previous
          if (this._hlLine) this.editor.removeLineClass(this._hlLine, 'background', 'cm-sim-line');
          this._hlLine = this.editor.addLineClass(s.lineNum - 1, 'background', 'cm-sim-line');
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
