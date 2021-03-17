# Gaming Button
AviUtl でゲーミングボタンを再現するためのスクリプトです。

## 実行環境
以下の環境での使用を想定しています。
- AviUtl version 1.10
- 拡張編集Plugin version 0.92

## インストール
AviUtl 拡張編集の script フォルダに以下のファイルをコピーします。
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
使い勝手としては CSS の `cubic-bezier(x1, y1, x2, y2)` と似たような感じです。

始点が (0, 0)、終点が (1, 1)、制御点1、2を (x1, y1)、(x2, y2)
とする3次ベジェ曲線に沿うようなトラックバー用スクリプトを簡単に書けるようになります。

### サンプル
`@CBE.tra` を拡張編集の script フォルダにコピーすると以下のイージングがトラックバーで使えるようになります。
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

これらのサンプルは以下を参考にしました。
- [\<easing-function\> - CSS: カスケーディングスタイルシート | MDN](https://developer.mozilla.org/ja/docs/Web/CSS/easing-function)
- [イージング関数チートシート](https://easings.net/ja)

### カスタマイズ
[cubic-bezier.com](https://cubic-bezier.com/)
などを利用して使いたいベジェ曲線が見つかったら以下のサンプルを書き換えてお好みのスクリプトファイル（例：`@3次ベジェイージング.tra`）に保存します。
書き換える箇所は以下の通りです。
- 1行目
    - `@ease`を好きな名前に変える（例：`@イージング`）
- 2行目
    - 数値 `0.25, 0.1, 0.25, 1` を好きな値に変える（例：`0.68, -0.6, 0.32, 1.6`）
```lua
@ease
return require("CubicBezierEasing").trackbar(obj, 0.25, 0.1, 0.25, 1)
```
