# Archive v1.5.2 機能復旧 hotfix

## 原因
Archive v1.5 の小物資料更新時、`assets/js/app.js` の差し替え処理で、`renderTimeline()` から `renderStory()` までの関数群が誤って欠落した。
そのため初期化処理が `renderTimeline()` 呼び出しで停止し、年表、SCENE CHECK、本編あらすじ、第一部小説の章一覧など、以降の初期化に依存する機能が表示・動作しなくなっていた。

## 修正
- v1.4.1 で正常動作していた以下の関数群を復旧。
  - renderTimeline / openMain / openDaily / switchTimelineHub
  - initSceneCheck / sceneList / renderSceneCheck / sceneCheckText / copySceneCheck
  - renderStory
- v1.5 の小物資料機能・登録データは維持。
- v1.5.1 の file:// localStorage 安全化、初期概要表示、GitHub Pages キャッシュ対策も維持。
- CSS/JS のURLを v1.5.2 へ更新し、GitHub Pages の旧キャッシュ混在を回避。
