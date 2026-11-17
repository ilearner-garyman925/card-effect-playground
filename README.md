# 動態卡片工作台

以 Canvas 2D、WebGL 網格與 CSS 閃箔呈現的互動角色卡原型，無需建置或 API key。

## 開啟

網站首頁會轉到 `cyber-card/workbench.html`。

本機執行：

```sh
node cyber-card/server.cjs
```

然後開啟 <http://127.0.0.1:8766/workbench.html>。

## 功能

- 角色、衣著、背景、特效與紋理獨立選擇。
- 卡面 hover 傾斜、閒置反射、人物與背景視差、點擊翻面。
- 多種閃箔與紋理，個別強度設定。
- 人物遠近滑桿，按角色／衣著組合保存於目前瀏覽器。
- 賽博長髮角色採用後髮、共用身體／手臂、頭頸、衣領前緣、前髮分層。

這是持續調整中的原型。長髮頭部目前是平面旋轉，不是真正三維轉頭；德魯伊仍使用完整人物素材。頭頸接位的視覺效果仍待進一步修訂。

## GitHub Pages

使用 repository 的 Settings → Pages，選擇 **Deploy from a branch**，來源 `main`、`/ (root)`。本專案是純靜態網站，不需要 Actions 建置流程。

## 目錄

- `cyber-card/`：目前工作台、渲染與素材，以及早期原型。
- `cyber-card/character-studies/`：角色參考、生成提示詞及拆件說明。
- `skill-packages/animated-game-cards/`：可重用製作流程及已確認的卡面基準。
- 根目錄圖片與 GIF：早期參考與測試素材。

## 來源與授權

閃箔程式改編自 [Simon Goellner 的 pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css)，相關程式遵循 GPL-3.0。保留原始 CSS、[授權全文](cyber-card/HOLO-LICENSE.txt)及[素材來源說明](cyber-card/HOLO-SOURCES.md)。角色與其他圖片素材不因程式授權而自動取得第三方肖像或商標使用權。
