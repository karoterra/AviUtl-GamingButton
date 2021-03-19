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
    let index = 0;
    while (index < points_str.length) {
      points_join += "    " + points_str.slice(index, index + 4).join(", ") + "\n";
      index += 4;
      if (index >= points_str.length) {
        break;
      }
      points_join += "    " + points_str.slice(index, index + 2).join(", ") + "\n";
      index += 2;
    }
    points_join += "}";
  } else {  // 1行で出力する
    points_join = "{" + points_str.join(",") + "}";
  }
  const code = "return require(\"CubicBezierEasing\").trackbarMultiBezier(obj, " +
    points_join + ")";
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

function convertBezierT() {
  const form = document.getElementById("bezierT-converter");

  if (!(form.elements.size.value) || !(form.elements.anchor.value)) {
    form.elements.output.value = "サイズとアンカーを入力してください";
    return;
  }

  const size = parseFloat(form.elements.size.value);
  let anchor = form.elements.anchor.value;
  anchor = anchor.replace(" ", "");
  anchor = anchor.replace("{", "");
  anchor = anchor.replace("}", "");
  const input_coords = anchor.split(",").map(x => parseFloat(x));
  if (input_coords.length != 4) {
    form.elements.output.value = "アンカーの数値が4個ではありません";
    return;
  }
  if (input_coords.some(x => isNaN(x))) {
    form.elements.output.value = "アンカーに数値ではない要素があります";
    return;
  }
  input_coords[1] *= -1;
  input_coords[3] *= -1;

  const new_coords = input_coords.map(x => x / size + 0.5);
  new_coords[0] = clip(new_coords[0], 0, 1);
  new_coords[2] = clip(new_coords[2], 0, 1);

  const output = buildSingleBezierCode(new_coords);
  form.elements.output.value = output;

  drawCubicBezier(document.getElementById("bezierT-preview"), 250, new_coords);
}

function convertMultiBezier() {
  const form = document.getElementById("multi-bezier-converter");

  if (!(form.elements.anchor.value)) {
    form.elements.output.value = "";
    return;
  }

  // 数値の抽出
  let anchor = form.elements.anchor.value;
  anchor = anchor.replace(" ", "");
  anchor = anchor.replace("{", "");
  anchor = anchor.replace("}", "");
  const input_coords = anchor.split(",").map(x => parseInt(x));
  if (input_coords.some(x => isNaN(x))) {
    form.elements.output.value = "アンカーに数値ではない要素があります";
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

  const output = buildMultiBezierCode(new_coords, form.elements.heuristic.checked);
  form.elements.output.value = output;

  drawCubicBezier(document.getElementById("multi-bezier-preview"), 250, new_coords);
}

class BezierEditor {
  constructor(margin) {
    this.form = document.getElementById("bezier-editor-form");
    this.canvas = document.getElementById("bezier-editor-canvas");
    this.num_bezier = this.form.elements.num;
    this.heuristic = this.form.elements.heuristic;
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
    this.heuristic.addEventListener("change", e => this.outputCode());

    this.draw();
    this.outputCode();
  }

  draw() {
    drawCubicBezier(this.canvas, this.size, this.points.flat(), this.handle_size);
  }

  outputCode() {
    this.form.elements.output.value = buildMultiBezierCode(this.points.flat(), this.heuristic.checked);
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

window.onload = function() {
  // convert tool
  const bezierT_converter = document.getElementById("bezierT-converter");
  bezierT_converter.elements.size.addEventListener("change", convertBezierT);
  bezierT_converter.elements.anchor.addEventListener("change", convertBezierT);
  bezierT_converter.elements.copy.addEventListener("click", () => {
    bezierT_converter.elements.output.select();
    document.execCommand("copy");
  });

  const multi_bezier_converter = document.getElementById("multi-bezier-converter");
  multi_bezier_converter.elements.anchor.addEventListener("change", convertMultiBezier);
  multi_bezier_converter.elements.heuristic.addEventListener("change", convertMultiBezier);
  multi_bezier_converter.elements.copy.addEventListener("click", () => {
    multi_bezier_converter.elements.output.select();
    document.execCommand("copy");
  });

  // bezier editor
  const editor_canvas = document.getElementById("bezier-editor-canvas");
  const editor_margin = 40;
  editor_canvas.height = Math.round(window.innerHeight * 0.9);
  editor_canvas.width = Math.round(editor_canvas.height / 2 + editor_margin);

  const editor_form = document.getElementById("bezier-editor-form");
  editor_form .elements.copy.addEventListener("click", () => {
    editor_form.elements.output.select();
    document.execCommand("copy");
  });

  const editor = new BezierEditor(editor_margin);
}
