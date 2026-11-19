# 身份庫、衣著庫、背景庫與卡片配方

以下是新專案建議的資料契約，**隨附示範尚未讀取這些 manifest**。先實作 loader／renderer adapter 再提供置換介面。不要把文件設計當成已完成的產品功能。

## 建議目錄

```text
library/
  characters/<character-id>/<version>/
    source.png, head-neck.png, hair-back.png, hair-front.png
    character.json
  outfits/<outfit-id>/<version>/
    source.png, body.png, collar-mask.png (需要時), parts/
    outfit.json
  bindings/<character-id>/<outfit-id>.json
  backgrounds/<background-id>/<version>/
    clean.png, props/, foreground.png (需要時)
    background.json
  motions/<motion-id>.json
  effects/<effect-id>/
  textures/<texture-id>/
  themes/<theme-id>/
cards/<card-id>.json
```

不要從另一角色複製身份資料。角色名稱、稀有度、技能數值不是去背工具可推斷的事實；不確定時用已提供的名稱或清楚的原型標籤。

## 座標規則

- 同一角色的部件在同一 logical canvas 上。基準是 896 × 1200；可採其他尺寸，但全套一致。
- pivot 和 anchor 儲存為 0–1 正規化座標，附座標系名稱；基準程式的像素座標不能直接套到新角色。
- 角色的 groundAnchor、頭頂高度、視線／道具目標各自記錄。背景使用 horizonY、groundAnchor、subjectSafeArea。
- 配方上的 placement 同時給 scale、offset，按 groundAnchor 對齊；不要把人物和背景分別硬拉伸成同一長寬。
- 頭部圖集需記每格 rect 和 neckAnchor；組圖生成未保證格子準確時先量測。

## 角色 manifest 最少資訊

`id`, `version`, `displayName`, `source`, `logicalSize`, `parts`（頭頸、前後髮的 path、trim、pivot）、`headPoses`（需要時的 rect、anchor、gaze）、`styleTags`, `palette`, `lighting`, `supportedMotions`, `approvalStatus`。

## 衣著與搭配綁定

衣著保存 `id`, `version`, `source`, `logicalSize`, `parts`（身體、手臂、道具與可選衣領遮擋層）、`rig`（neck/shoulder/feet）、`groundAnchor`, `supportedMotions`, `approvalStatus`。同一衣著 ID 和版本必須指向同一份衣著資產，不以身份暗中選擇另一全身圖。

搭配綁定記錄身份及衣著版本、頭頸接點、頭部尺度／偏移、前後髮對位、遮擋設定及已驗證動作。衣著尺度和頭部尺度分開；詳見 [共用衣著與頭髮分層](shared-outfits.md)。

`approvalStatus` 區分 draft/reviewed/approved；只有使用者實際批准才可標 approved。背景只獲准某一次合成，不等於所有搭配皆合格。

## 背景 manifest 最少資訊

`id`, `version`, `cleanPlate`, `logicalSize`, `styleTags`, `palette`, `lighting`（direction、temperature、timeOfDay）、`horizonY`, `groundAnchor`, `subjectSafeArea`, `foregroundLayers`, `props`（path、anchor、motion）、`effects`（rain/motes/foliage 等）、`approvalStatus`。

背景需要兩層標籤：**題材**（cyberpunk/forest/temple 等）和 **繪畫特徵**（anime-line/cel-shaded/watercolor/realistic 等）。題材相同但畫風不符仍不合適。

## 匹配策略

先排除嚴重不相容，再排序；不必把主觀感覺包裝成精確百分比。

1. 畫風／線條密度能否共存？
2. 地平線、鏡頭俯仰與接地面是否相容？人物站位是否會擋掉主要敘事物件？
3. 主光方向、明暗和冷暖是否可用輕微校色配合？
4. 角色服裝、題材和劇情是否匹配？
5. 配色和特效是否襯托角色？背景不應比臉更搶眼。

使用者未指定背景時，從現有合適資產中呈現最多三個有實際圖像的候選，說明簡短理由。能合理沿用已確認搭配時直接做；不要為每次微調設置批准關卡。沒有合適背景才提議新增。

## 卡片配方範例（資料設計，非目前程式可直接執行）

```json
{
  "id": "yuki-cyber-001",
  "character": {"id": "yuki-blue", "version": "v1"},
  "outfit": {"id": "cyber-armor", "version": "v1"},
  "binding": "yuki-blue-cyber-armor-v1",
  "background": {"id": "neon-street", "version": "v1"},
  "effects": ["rain-night"],
  "texture": {"id": "holofoil-rare", "strength": 0.45},
  "motion": "tablet-to-sky",
  "theme": "black-silver-cyan-violet",
  "placement": {"scale": 1, "offset": [0, 0]},
  "display": {"title": "霓虹巡察者", "rarity": "SSR"}
}
```

這個範例的文字是已接受卡面上的原型文案，不是未來所有角色的強制設定。

## 低成本批量次序

先完成一個身份＋共用衣著＋背景，再用第二個身份接到同一衣著，驗證衣領肩甲不變且頭髮接合正確。資料契約需實際接入 renderer 才算完成；之後可獨立擴充身份、衣著與背景包。

新身份仍需要頭頸與髮層製作、身份驗收及搭配校準；共用衣著可省去反覆重製身體，不能保證所有頭型一鍵適配。紋理強度按紋理 ID 各自保存；範例的 45% 是使用者接受的 Holofoil Rare 設定，不是其他紋理的統一預設。
