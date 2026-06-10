// 順位計算ロジック（個人成績で集計）
export function computeStandings(players, matches) {
  const stats = {};
  players.forEach((p) => {
    stats[p.id] = {
      id: p.id, name: p.name, age: p.age ?? null,
      played: 0, win: 0, lose: 0, draw: 0, gamesFor: 0, gamesAgainst: 0,
    };
  });

  matches.forEach((m) => {
    const teamA = [m.a1, m.a2];
    const teamB = [m.b1, m.b2];
    const sa = Number(m.sa);
    const sb = Number(m.sb);
    const aWin = sa > sb;
    const bWin = sb > sa;
    const isDraw = sa === sb;

    teamA.forEach((id) => {
      if (stats[id] == null) return;
      stats[id].played++;
      stats[id].gamesFor += sa;
      stats[id].gamesAgainst += sb;
      if (aWin) stats[id].win++;
      else if (bWin) stats[id].lose++;
      else if (isDraw) stats[id].draw++;
    });
    teamB.forEach((id) => {
      if (stats[id] == null) return;
      stats[id].played++;
      stats[id].gamesFor += sb;
      stats[id].gamesAgainst += sa;
      if (bWin) stats[id].win++;
      else if (aWin) stats[id].lose++;
      else if (isDraw) stats[id].draw++;
    });
  });

  return Object.values(stats)
    .map((s) => {
      const totalGames = s.gamesFor + s.gamesAgainst;
      return {
        ...s,
        // ゲーム率: 獲得ゲーム ÷ 全ゲーム（試合数に依存しない）
        gameRate: totalGames > 0 ? s.gamesFor / totalGames : 0,
        winRate: s.played > 0 ? s.win / s.played : 0,
        drawRate: s.played > 0 ? s.draw / s.played : 0,
      };
    })
    .filter((s) => s.played > 0)
    .sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.gameRate !== a.gameRate) return b.gameRate - a.gameRate;
      // 同率の場合は高齢者優先（age未設定は0扱い）
      const ageDiff = (b.age ?? 0) - (a.age ?? 0);
      if (ageDiff !== 0) return ageDiff;
      return a.name.localeCompare(b.name, "ja");
    });
}
