function clip(x, min, max) {
  x = (x < min) ? min : x;
  x = (x > max) ? max : x;
  return x;
}

function drawCubicBezier(canvas, size, points) {
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
    ctx.ellipse(p[i], p[i+1], 3, 3, 0, 0, 2 * Math.PI);
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

  const output = "return require(\"CubicBezierEasing\").trackbar(obj, " +
    new_coords.map(x => x.toFixed(2)).join(", ") +
    ")";
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
  const new_coords_str = new_coords.map(x => x.toFixed(3));
  let new_coords_join = "";
  if (form.elements.heuristic.checked) {  // 見やすく出力する
    new_coords_join = "{\n";
    let index = 0;
    while (index < new_coords_str.length) {
      new_coords_join += "    " + new_coords_str.slice(index, index + 4).join(", ") + "\n";
      index += 4;
      if (index >= new_coords_str.length) {
        break;
      }
      new_coords_join += "    " + new_coords_str.slice(index, index + 2).join(", ") + "\n";
      index += 2;
    }
    new_coords_join += "}";
  } else {  // 1行で出力する
    new_coords_join = "{" + new_coords_str.join(",") + "}";
  }
  const output = "return require(\"CubicBezierEasing\").trackbarMultiBezier(obj, " +
    new_coords_join + ")";
  form.elements.output.value = output;

  drawCubicBezier(document.getElementById("multi-bezier-preview"), 250, new_coords);
}

window.onload = function() {
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
  })
}
