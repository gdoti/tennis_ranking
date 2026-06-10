import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages にデプロイする場合は base をリポジトリ名に合わせる。
// 例: https://ユーザー名.github.io/tennis-ranking/ で公開するなら "/tennis-ranking/"
// 独自ドメインやユーザーサイト(ルート配信)なら "/" にするか base 行を削除する。
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
