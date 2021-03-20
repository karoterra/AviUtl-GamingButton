# Gaming Button
AviUtl でゲーミングボタンを再現するためのスクリプトです。

## 実行環境
以下の環境での使用を想定しています。
- AviUtl version 1.10
- 拡張編集Plugin version 0.92

## インストール
AviUtl 拡張編集の script フォルダに以下のものをコピーします。
- `CubicBezierEasing` フォルダ
- `CubicBezierEasing.lua`
- `@GamingButton.anm`

## 使い方
1. 拡張編集タイムライン上に図形（四角形、赤）とテキスト（白）を配置
2. グループ制御を配置し、以下のアニメーション効果を適用
    - 色相変化@GamingButton
        - 速度：色相が変化する速度
        - オフセット：元のオブジェクトに対して色相をずらしてから変化させたいときに使う
    - サイズ変化@GamingButton
        - 速度：オブジェクトの大きさが変化する速度
        - 拡大率：変化の度合い。0にすると変化しなくなる。

## 3次ベジェ曲線イージング
副産物としてトラックバーで3次ベジェ曲線が使えるようになりました。

以下のようなイージングをトラックバースクリプト、またはタイムライン上のテキストオブジェクトから設定できるようになります。
- 1本の3次ベジェ曲線をイージング関数に使う
- 複数の3次ベジェ曲線をつなげた曲線をイージング関数に使う
- 中間点ごとに違う曲線をイージング関数に使う

### トラックバースクリプト
[cubic-bezier.com](https://cubic-bezier.com/) や
`doc/index.html`
にあるベジエ曲線エディタなどを利用して使いたいベジェ曲線が見つかったら以下のサンプルを書き換えてお好みのスクリプトファイル（例：`@3次ベジェイージング.tra`）に保存します。
書き換える箇所は以下の通りです。
- 1行目
    - `@ease`を好きな名前に変える（例：`@イージング`）
- 2行目
    - 数値 `0.25, 0.1, 0.25, 1` を好きな値に変える（例：`0.68, -0.6, 0.32, 1.6`）
```lua
@ease
return require("CubicBezierEasing").trackbar(obj, 0.25, 0.1, 0.25, 1)
```

複数のベジェ曲線を使って複雑なカーブを表現したい場合は以下のサンプルを参考にしてください。
```lua
@MultiBezierSample1
return require("CubicBezierEasing").trackbarMultiBezier(obj, {
    0.025, 0.144, 0.113, 0.194,  -- 1本目のベジェ曲線の制御点
    0.304, 0.188,                -- 1本目と2本目の接続点
    0.319, 0.538, 0.661, 0.191,  -- 2本目のベジェ曲線の制御点
    0.670, 0.594,                -- 2本目と3本目の接続点
    0.737, 0.098, 0.984, 0.442   -- 3本目のベジェ曲線の制御点
})
```

中間点ごとに違うベジェ曲線を使いたい場合は以下のサンプルを参考にしてください。
```lua
@ForEachKeyframeSample1
return require("CubicBezierEasing").trackbarForEachKeyframe(obj, {
    {1, 0, 0, 1},   -- 第1中間点のベジェ曲線
    {0, 0, 1, 1},   -- 第2中間点のベジェ曲線
    {0, 1, 1, 0},   -- 第3中間点のベジェ曲線
})
```

### テキストオブジェクトから設定
拡張編集のタイムライン上に配置したテキストオブジェクトにベジェ曲線の制御点リストを記述し、それを参照することでトラックバーにイージングを掛けることができます。
手順は以下の通りです。
1. タイムライン上にテキストオブジェクトを配置する。
2. テキストに以下のように記述する。
    ```lua
    <?
    b = {
      {1, 0, 0, 1},   -- 第1中間点のベジェ曲線
      {0, 0, 1, 1},   -- 第2中間点のベジェ曲線
      {0, 1, 1, 0},   -- 第3中間点のベジェ曲線
    }
    require("CubicBezierEasing").easings:set(obj, b)?>
    ```
3. イージングを掛けたいオブジェクトのトラックバーに「テキストから@CBE_checker」を適用し、設定に上述のテキストオブジェクトのレイヤー番号を入力する。

### 既存スクリプトからの移植
AviUtlのトラックバーで3次ベジェ曲線を使うための他のスクリプトで定義した曲線を本スクリプト用に変換するためのツール（`doc/index.html`）を用意しました。
対応スクリプトは以下の通りです。
- 「ベジエ曲線による軌道調整」（ティム氏）
- 「マルチベジェ軌道」（93氏）

これを使うことで、曲線を別のプロジェクトで使いまわしたりするのが簡単になります。

### サンプル
`@CBE_sample.tra` にサンプルとして以下のイージングを定義してあります。
- 3次ベジェ曲線を1本使う例
    - ease
    - ease-in
    - ease-out
    - ease-in-out
    - easeInSine
    - easeOutSine
    - easeInOutSine
    - easeInQuad
    - easeOutQuad
    - easeInOutQuad
    - easeInCubic
    - easeOutCubic
    - easeInOutCubic
    - easeInQuart
    - easeOutQuart
    - easeInOutQuart
    - easeInQuint
    - easeOutQuint
    - easeInOutQuint
    - easeInExpo
    - easeOutExpo
    - easeInOutExpo
    - easeInCirc
    - easeOutCirc
    - easeInOutCirc
    - easeInBack
    - easeOutBack
    - easeInOutBack
- 3次ベジェ曲線を複数本使う例
    - MultiBezierSample1
- 中間点ごとに違う曲線を使う例
    - ForEachKeyframeSample1

これらのサンプルは以下を参考にしました。
- [\<easing-function\> - CSS: カスケーディングスタイルシート | MDN](https://developer.mozilla.org/ja/docs/Web/CSS/easing-function)
- [イージング関数チートシート](https://easings.net/ja)
