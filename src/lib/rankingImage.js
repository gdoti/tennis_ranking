// 順位表を Canvas に描画して PNG dataURL を返す
export function renderRankingImage(standings, totalMatches) {
  const dpr = 2;
  const W = 820;
  const padX = 36;
  const headerH = 168;
  const colHeadH = 46;
  const rowH = 64;
  const footerH = 86;
  const H = headerH + colHeadH + standings.length * rowH + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // 背景
  ctx.fillStyle = "#022c22";
  ctx.fillRect(0, 0, W, H);

  // ヘッダー帯
  ctx.fillStyle = "#064e3b";
  ctx.fillRect(0, 0, W, headerH);
  ctx.fillStyle = "#a3e635";
  ctx.fillRect(0, headerH - 4, W, 4);

  // テニスボール
  ctx.beginPath();
  ctx.arc(padX + 12, 52, 11, 0, Math.PI * 2);
  ctx.fillStyle = "#a3e635";
  ctx.fill();

  // タイトル
  ctx.fillStyle = "#ecfdf5";
  ctx.font = "700 34px ui-monospace, monospace";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("TENNIS CIRCLE", padX + 34, 62);

  ctx.fillStyle = "#6ee7b7";
  ctx.font = "600 15px ui-monospace, monospace";
  ctx.fillText("DOUBLES RANKING", padX, 96);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  ctx.fillStyle = "#a7f3d0";
  ctx.font = "500 15px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText(dateStr, W - padX, 96);
  ctx.textAlign = "left";

  ctx.fillStyle = "#34d399";
  ctx.font = "500 14px sans-serif";
  ctx.fillText(`全${totalMatches}試合 ・ ${standings.length}名`, padX, 132);

  // 列の x 座標
  const colName = padX + 44;
  const colPlayed = 440;
  const colWin = 512;
  const colLose = 575;
  const colRate = 658;
  const colGame = W - padX; // 右寄せ

  // 列見出し
  const chY = headerH + 30;
  ctx.fillStyle = "#6ee7b7";
  ctx.font = "600 13px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("選手", colName, chY);
  ctx.textAlign = "center";
  ctx.fillText("試合", colPlayed, chY);
  ctx.fillText("勝", colWin, chY);
  ctx.fillText("敗", colLose, chY);
  ctx.fillText("勝率", colRate, chY);
  ctx.textAlign = "right";
  ctx.fillText("ゲーム率", colGame, chY);

  // 各行
  const medalBg = ["#facc15", "#d1d5db", "#d97706"];
  const medalFg = ["#1c1917", "#1c1917", "#ffffff"];
  standings.forEach((s, i) => {
    const top = headerH + colHeadH + i * rowH;
    const midY = top + rowH / 2;

    // 行背景（交互）
    ctx.fillStyle = i % 2 === 0 ? "rgba(6,78,59,0.55)" : "rgba(6,78,59,0.25)";
    ctx.fillRect(padX - 10, top + 5, W - (padX - 10) * 2, rowH - 10);

    // 順位バッジ
    ctx.beginPath();
    ctx.arc(padX + 14, midY, 16, 0, Math.PI * 2);
    ctx.fillStyle = i < 3 ? medalBg[i] : "#065f46";
    ctx.fill();
    ctx.fillStyle = i < 3 ? medalFg[i] : "#a7f3d0";
    ctx.font = "700 16px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), padX + 14, midY + 1);

    // 名前
    ctx.fillStyle = "#ecfdf5";
    ctx.font = "700 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(s.name, colName, midY + 1);

    // 数値
    ctx.font = "600 18px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#d1fae5";
    ctx.fillText(String(s.played), colPlayed, midY + 1);
    ctx.fillStyle = "#a3e635";
    ctx.font = "700 20px ui-monospace, monospace";
    ctx.fillText(String(s.win), colWin, midY + 1);
    ctx.fillStyle = "#d1fae5";
    ctx.font = "600 18px ui-monospace, monospace";
    ctx.fillText(String(s.lose), colLose, midY + 1);
    ctx.fillText(`${(s.winRate * 100).toFixed(0)}%`, colRate, midY + 1);
    ctx.textAlign = "right";
    ctx.fillStyle = "#a3e635";
    ctx.font = "700 18px ui-monospace, monospace";
    ctx.fillText(`${(s.gameRate * 100).toFixed(1)}%`, colGame, midY + 1);

    ctx.textBaseline = "alphabetic";
  });

  // フッター
  ctx.textAlign = "center";
  ctx.fillStyle = "#34d399";
  ctx.font = "500 13px ui-monospace, monospace";
  ctx.fillText("順位: 勝数 → ゲーム率 → 勝率", W / 2, H - 48);
  ctx.fillStyle = "#6ee7b7";
  ctx.font = "500 12px sans-serif";
  ctx.fillText("ゲーム率 = 獲得ゲーム ÷ 全ゲーム", W / 2, H - 26);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}
