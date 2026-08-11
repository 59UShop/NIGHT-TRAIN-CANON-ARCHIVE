# Archive v1.5.1 GitHub Pages / local hotfix

- GitHub Pagesで新しいindex.htmlと古いstyle.cssが混在した際に、サイドバーの×や用語集タブが未装飾になる問題へ対策。
- CSSを `style-v1.5.1.css` として参照し、全JS/data参照に `?v=1.5.1` を付与してキャッシュを回避。
- `app.js` の localStorage 参照を try/catch 経由へ変更。`file://` で localStorage が拒否される環境でも初期化を止めない。
- HTML側で「概要」を初期 active にして、JavaScript初期化前でも空白画面にならないようにした。
- `.nojekyll` を追加し、GitHub Pagesで静的ファイルをそのまま配信しやすくした。
