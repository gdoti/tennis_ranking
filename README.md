# テニスサークル順位表

ダブルスの試合結果を記録し、個人成績で順位表を表示する Web アプリ。
データは各端末のブラウザ（localStorage）に保存され、リロードしても残ります。

## 技術スタック

- React 19 + Vite 6
- Tailwind CSS v4（CSS-first 構成）
- データ保存: localStorage（バックエンド不要）

## ディレクトリ構成

```
src/
├── main.jsx              エントリポイント
├── App.jsx               TennisRanking を描画
├── index.css             Tailwind の読み込み
├── TennisRanking.jsx     UI 本体
├── lib/
│   ├── standings.js      順位計算ロジック（computeStandings）
│   ├── rankingImage.js   画像出力の Canvas 描画（renderRankingImage）
│   └── storage.js        localStorage の読み書き（loadState / saveState）
└── data/
    └── defaults.js       初期サンプルデータ
```

## ローカルで動かす

```bash
npm install
npm run dev
```

`http://localhost:5173` で開きます（localStorage 保存もここで確認できます）。

## ビルド

```bash
npm run build      # dist/ に静的ファイルが出力される
npm run preview    # ビルド結果をローカルで確認
```

## GitHub Pages へのデプロイ

1. `vite.config.js` の `base` をリポジトリ名に合わせる
   （例: `https://ユーザー名.github.io/tennis-ranking/` で公開するなら `/tennis-ranking/`）。
2. GitHub にリポジトリを作成して push する。
3. リポジトリの **Settings → Pages → Build and deployment → Source** を
   「**GitHub Actions**」に設定する。
4. `main` ブランチに push すると `.github/workflows/deploy.yml` が
   自動でビルド＆公開する。公開 URL は Settings → Pages に表示される。

> 画面が真っ白になる場合は、ほぼ `vite.config.js` の `base` とリポジトリ名の
> 不一致が原因です。最初にそこを確認してください。

## メモ

- 初期サンプルデータは `src/data/defaults.js` にあります。本番で空から始めたい場合は
  `DEFAULT_PLAYERS` / `DEFAULT_MATCHES` の中身を `[]` にしてください。
- データは端末・ブラウザごとに保存され、他端末とは共有されません。
  複数人で同じ順位表を共有したくなった場合は Firestore などへの切り替えが必要です。
