"use strict";

function clip(x, min, max) {
  x = (x < min) ? min : x;
  x = (x > max) ? max : x;
  return x;
}

function buildSingleBezierCode(points) {
  const code = "return require(\"CubicBezierEasing\").trackbar(obj, " +
    points.map(x => x.toFixed(2)).join(", ") +
    ")";
  return code;
}

function buildMultiBezierCode(points, heuristic) {
  const points_str = points.map(x => x.toFixed(3));
  let points_join = "";
  if (heuristic) {  // 見やすく出力する
    points_join = "{\n";
    for (let i = 0; i < points_str.length; i += 2) {
      points_join += "  " + points_str.slice(i, i + 4).join(", ") + ",\n";
      i += 4;
      if (i >= points_str.length) {
        break;
      }
      points_join += "  " + points_str.slice(i, i + 2).join(", ") + ",\n";
    }
    points_join += "}";
  } else {  // 1行で出力する
    points_join = "{" + points_str.join(",") + "}";
  }
  const code = "return require(\"CubicBezierEasing\").trackbarMultiBezier(obj, " +
    points_join + ")";
  return code;
}

function buildBezierCodeForTextObject(points, heuristic) {
  const points_str = points.map(x => x.toFixed(3));
  let points_join = "";
  if (heuristic) {  // 見やすく出力する
    points_join = "{\n";
    for (let i = 0; i < points_str.length; i += 2) {
      points_join += "  " + points_str.slice(i, i + 4).join(", ") + ",\n";
      i += 4;
      if (i >= points_str.length) {
        break;
      }
      points_join += "  " + points_str.slice(i, i + 2).join(", ") + ",\n";
    }
    points_join += "}";
  } else {  // シンプルに出力する
    points_join = "{" + points_str.join(",") + "}";
  }
  const code = `<?
b = {${points_join}}
require("CubicBezierEasing").easings:set(obj, b)?>`;
  return code;
}

function drawCubicBezier(canvas, size, points, handle_size = 3) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 枠の描画
  const w = size, h = size;
  const ox = (canvas.width - w) / 2, oy = canvas.height - (canvas.height - h) / 2;
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.strokeRect(ox, canvas.height - oy, w, h);

  const p = [0, 0].concat(points, [1, 1]);
  // 座標変換
  for (let i = 0; i < p.length; i++) {
    if (i % 2 == 0) {
      p[i] = p[i] * w + ox;
    } else {
      p[i] = -p[i] * h + oy;
    }
  }
  // 制御点のクリッピング
  for (let i = 2; i < p.length; i += 6) {
    p[i] = clip(p[i], p[i - 2], p[i + 4]);
    p[i + 2] = clip(p[i + 2], p[i - 2], p[i + 4]);
  }

  // ベジェ曲線
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 6) {
    ctx.bezierCurveTo(p[i], p[i+1], p[i+2], p[i+3], p[i+4], p[i+5]);
  }
  ctx.stroke();

  // 制御点の棒
  ctx.lineWidth = 1;
  ctx.strokeStyle = "dimgray";
  ctx.beginPath();
  for (let i = 0; i < p.length - 2; i += 2) {
    ctx.moveTo(p[i], p[i+1]);
    ctx.lineTo(p[i+2], p[i+3]);
    i += 4;
    ctx.moveTo(p[i], p[i+1]);
    ctx.lineTo(p[i+2], p[i+3]);
  }
  ctx.stroke();

  // 制御点
  ctx.fillStyle = "red"
  for (let i = 2; i < p.length - 2; i += 2) {
    ctx.beginPath();
    ctx.ellipse(p[i], p[i+1], handle_size, handle_size, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class BezierTConverter {
  constructor() {
    this.form = document.getElementById("bezierT-converter");
    this.canvas = document.getElementById("bezierT-preview");

    this.form.size.addEventListener("change", e => this.convert());
    this.form.anchor.addEventListener("change", e => this.convert());
    Array.prototype.forEach.call(this.form.output_type, r => {
      r.addEventListener("change", e => this.convert());
    });
    this.form.copy.addEventListener("click", e => {
      this.form.output.select();
      document.execCommand("copy");
    });
  }

  convert() {
    if (!(this.form.size.value) || !(this.form.anchor.value)) {
      this.form.output.value = "サイズとアンカーを入力してください";
      return;
    }

    const size = parseFloat(this.form.size.value);
    let anchor = this.form.anchor.value;
    anchor = anchor.replace(" ", "");
    anchor = anchor.replace("{", "");
    anchor = anchor.replace("}", "");
    const input_coords = anchor.split(",").map(x => parseFloat(x));
    if (input_coords.length != 4) {
      this.form.output.value = "アンカーの数値が4個ではありません";
      return;
    }
    if (input_coords.some(x => isNaN(x))) {
      this.form.output.value = "アンカーに数値ではない要素があります";
      return;
    }
    input_coords[1] *= -1;
    input_coords[3] *= -1;

    const new_coords = input_coords.map(x => x / size + 0.5);
    new_coords[0] = clip(new_coords[0], 0, 1);
    new_coords[2] = clip(new_coords[2], 0, 1);

    switch (this.form.output_type.value) {
      case "script":
        this.form.output.value = buildSingleBezierCode(new_coords);
        break;
      case "text":
        this.form.output.value = buildBezierCodeForTextObject(new_coords, false);
        break;
    }

    drawCubicBezier(this.canvas, 250, new_coords);
  }
}

class MultiBezierConverter {
  constructor() {
    this.form = document.getElementById("multi-bezier-converter");
    this.canvas = document.getElementById("multi-bezier-preview");

    this.form.anchor.addEventListener("change", e => this.convert());
    Array.prototype.forEach.call(this.form.output_type, r => {
      r.addEventListener("change", e => this.convert());
    });
    this.form.heuristic.addEventListener("change", e => this.convert());
    this.form.copy.addEventListener("click", e => {
      this.form.output.select();
      document.execCommand("copy");
    });
  }

  convert() {
    if (!(this.form.anchor.value)) {
      this.form.output.value = "";
      return;
    }

    // 数値の抽出
    let anchor = this.form.anchor.value;
    anchor = anchor.replace(" ", "");
    anchor = anchor.replace("{", "");
    anchor = anchor.replace("}", "");
    const input_coords = anchor.split(",").map(x => parseInt(x));
    if (input_coords.some(x => isNaN(x))) {
      this.form.output.value = "アンカーに数値ではない要素があります";
      return;
    }
    // y座標の反転
    for (let i = 1; i < input_coords.length; i += 2) {
      input_coords[i] *= -1;
    }
    // ポイント数が3,4の時の対応
    const ends = [];
    for (let i = 4; i < input_coords.length; i += 6) {
      ends.push([input_coords[i], input_coords[i + 1]]);
    }
    if (ends.length >= 3) {
      const poped = ends.splice(1, 1);
      ends.push(poped[0]);
      for (let i = 0; i < ends.length; i++) {
        input_coords[6*i+4] = ends[i][0];
        input_coords[6*i+5] = ends[i][1];
      }
    }

    const new_coords = input_coords.map(x => x / 400 + 0.5);
    // 制御点のx座標をクリッピング
    for (let i = 0; i < new_coords.length; i += 6) {
      const min = ((i - 2) < 0) ? 0 : new_coords[i - 2];
      const max = ((i + 4) >= new_coords.length) ? 1 : new_coords[i + 4];
      new_coords[i] = clip(new_coords[i], min, max);
      new_coords[i+2] = clip(new_coords[i+2], min, max);
    }

    const heuristic = this.form.heuristic.checked;
    switch (this.form.output_type.value) {
      case "script":
        this.form.output.value = buildMultiBezierCode(new_coords, heuristic);
        break;
      case "text":
        this.form.output.value = buildBezierCodeForTextObject(new_coords, heuristic);
        break;
    }

    drawCubicBezier(this.canvas, 250, new_coords);
  }
}

class BezierEditor {
  constructor(margin) {
    this.form = document.getElementById("bezier-editor-form");
    this.canvas = document.getElementById("bezier-editor-canvas");
    this.num_bezier = this.form.num;
    this.output_type = this.form.output_type;
    this.heuristic = this.form.heuristic;
    this.size = this.canvas.width - margin;
    this.ox = margin / 2;
    this.oy = this.canvas.height - (this.canvas.height - this.size) / 2;
    this.points = [[0.5, 0], [0.5, 1]];
    this.dragging = false;
    this.handle_size = 5;
    this.dragIndex = 0;

    this.canvas.addEventListener("mousedown", e => this.onMouseDown(e));
    this.canvas.addEventListener("mouseup", e => this.onMouseUp(e));
    this.canvas.addEventListener("mousemove", e => this.onMouseMove(e));
    this.num_bezier.addEventListener("change", e => this.onChangeNum(e));
    Array.prototype.forEach.call(this.output_type, r => {
      r.addEventListener("change", e => this.outputCode());
    });
    this.heuristic.addEventListener("change", e => this.outputCode());
    this.form.copy.addEventListener("click", () => {
      this.form.output.select();
      document.execCommand("copy");
    })

    this.draw();
    this.outputCode();
  }

  draw() {
    drawCubicBezier(this.canvas, this.size, this.points.flat(), this.handle_size);
  }

  outputCode() {
    const points = this.points.flat();
    const heuristic = this.heuristic.checked;
    switch (this.output_type.value) {
      case "script":
        this.form.output.value = buildMultiBezierCode(points, heuristic);
        break;
      case "text":
        this.form.output.value = buildBezierCodeForTextObject(points, heuristic);
    }
  }

  calcMousePoint(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = (x - this.ox) / this.size;
    const ny = (-y + this.oy) / this.size;
    return [nx, ny];
  }

  clipX() {
    for (let i = 0; i < this.points.length; i += 3) {
      const min = (i - 1 < 0) ? 0 : this.points[i - 1][0];
      const max = (i + 2 >= this.points.length) ? 1 : this.points[i + 2][0];
      this.points[i][0] = clip(this.points[i][0], min, max);
      this.points[i + 1][0] = clip(this.points[i + 1][0], min, max);
    }
  }

  onMouseDown(e) {
    const [x, y] = this.calcMousePoint(e);
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (Math.sqrt((x-p[0])**2 + (y-p[1])**2) <= this.handle_size / this.size) {
        this.dragging = true;
        this.dragIndex = i;
        break;
      }
    }
  }

  onMouseUp(e) {
    this.dragging = false;
    this.clipX();
    this.draw();
    this.outputCode();
  }

  onMouseMove(e) {
    if (!this.dragging) {
      return;
    }

    const p = this.calcMousePoint(e);
    this.points[this.dragIndex] = p;

    this.draw();
    this.outputCode();
  }

  onChangeNum(e) {
    const num = this.num_bezier.value;
    const p = [[1 / (2 * num), 0], [1 / (2 * num), 1 / num]];
    for (let i = 1; i < num; i++){
      p.push([i / num, i / num]);
      p.push([(i + 0.5) / num, i / num]);
      p.push([(i + 0.5) / num, (i + 1) / num]);
    }
    this.points = p;

    this.draw();
    this.outputCode();
  }
}

function transitionPages(num) {
  const articles = document.getElementsByTagName("article");
  for (let i = 0; i < articles.length; i++) {
    if (i == num) {
      articles[i].style.display = "block";
    } else {
      articles[i].style.display = "none";
    }
  }
}

window.onload = function() {
  const bezierTConverter = new BezierTConverter();
  const multiBezierConverter = new MultiBezierConverter();

  // bezier editor
  const editor_canvas = document.getElementById("bezier-editor-canvas");
  const editor_margin = 40;
  editor_canvas.height = Math.round(window.innerHeight * 0.9);
  editor_canvas.width = Math.round(editor_canvas.height / 2 + editor_margin);

  const editor = new BezierEditor(editor_margin);

  // ページ遷移
  const pageNums = {
    "#convert-tool": 0,
    "#convert-from-bezierT": 0,
    "#convert-from-multi-bezier": 0,
    "#bezier-editor": 1,
  };
  const links = document.getElementsByTagName("nav")[0].getElementsByTagName("a");
  Array.prototype.forEach.call(links, a => {
    const href = a.getAttribute("href");
    a.addEventListener("click", () => transitionPages(pageNums[href]));
  });
  transitionPages(0);
}
