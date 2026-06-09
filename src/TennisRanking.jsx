import React, { useState, useMemo, useEffect } from "react";
import { computeStandings } from "./lib/standings";
import { renderRankingImage } from "./lib/rankingImage";
import { loadState, saveState } from "./lib/storage";
import { DEFAULT_PLAYERS, DEFAULT_MATCHES } from "./data/defaults";

export default function TennisRanking() {
  const [players, setPlayers] = useState(
    () => loadState()?.players ?? DEFAULT_PLAYERS
  );
  const [matches, setMatches] = useState(
    () => loadState()?.matches ?? DEFAULT_MATCHES
  );

  const [tab, setTab] = useState("rank");
  const [newName, setNewName] = useState("");
  const [form, setForm] = useState({ a1: "", a2: "", b1: "", b2: "", sa: 0, sb: 0 });
  const [error, setError] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [imgUrl, setImgUrl] = useState(null);

  const standings = useMemo(
    () => computeStandings(players, matches),
    [players, matches]
  );

  // 変更があるたびに localStorage へ保存（次回アクセス時に復元される）
  useEffect(() => {
    saveState({ players, matches });
  }, [players, matches]);
  const nameOf = (id) => players.find((p) => p.id === id)?.name ?? "?";

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    if (players.some((p) => p.name === name)) {
      setPlayerError(`「${name}」は既に登録されています`);
      return;
    }
    setPlayers([...players, { id: Date.now(), name }]);
    setNewName("");
    setPlayerError("");
  };

  const removePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
    setMatches(matches.filter((m) => ![m.a1, m.a2, m.b1, m.b2].includes(id)));
  };

  const bump = (field, delta) =>
    setForm((f) => ({ ...f, [field]: Math.max(0, Number(f[field]) + delta) }));

  const addMatch = () => {
    const { a1, a2, b1, b2, sa, sb } = form;
    const ids = [a1, a2, b1, b2];
    if (ids.some((v) => v === "")) { setError("4人すべて選んでください"); return; }
    if (new Set(ids).size !== 4) { setError("同じ選手が重複しています"); return; }
    if (Number(sa) === Number(sb)) { setError("スコアを入力してください（同点は登録できません）"); return; }
    setMatches([
      ...matches,
      {
        id: Date.now(),
        a1: Number(a1), a2: Number(a2),
        b1: Number(b1), b2: Number(b2),
        sa: Number(sa), sb: Number(sb),
      },
    ]);
    setForm({ a1: "", a2: "", b1: "", b2: "", sa: 0, sb: 0 });
    setError("");
  };

  const removeMatch = (id) => setMatches(matches.filter((m) => m.id !== id));

  const exportImage = () => {
    if (standings.length === 0) return;
    setImgUrl(renderRankingImage(standings, matches.length));
  };

  const downloadImage = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = "tennis_ranking.png";
    a.click();
  };

  const medal = ["bg-yellow-400 text-stone-900", "bg-gray-300 text-stone-900", "bg-amber-600 text-white"];

  // 入力欄は text-base（16px以上）= iOS Safari のフォーカス時自動ズームを防止
  const selected = [form.a1, form.a2, form.b1, form.b2];
  const PlayerSelect = ({ field, placeholder }) => (
    <select
      value={form[field]}
      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      className="w-full bg-emerald-950 rounded-xl px-3 py-3.5 text-base border-2 border-emerald-600/70 focus:border-lime-400 outline-none appearance-none"
    >
      <option value="">{placeholder}</option>
      {players.map((p) => (
        <option
          key={p.id}
          value={p.id}
          disabled={selected.includes(String(p.id)) && form[field] !== String(p.id)}
        >
          {p.name}
        </option>
      ))}
    </select>
  );

  const Stepper = ({ field }) => (
    <div className="flex items-center gap-3">
      <button
        onClick={() => bump(field, -1)}
        className="w-14 h-14 shrink-0 rounded-xl bg-emerald-950 border-2 border-emerald-600 text-3xl font-bold leading-none flex items-center justify-center active:bg-emerald-700 active:border-lime-400 select-none"
      >
        −
      </button>
      <div className="flex-1 text-center text-4xl font-bold font-mono tabular-nums text-lime-400 select-none">
        {Number(form[field])}
      </div>
      <button
        onClick={() => bump(field, 1)}
        className="w-14 h-14 shrink-0 rounded-xl bg-emerald-950 border-2 border-emerald-600 text-3xl font-bold leading-none flex items-center justify-center active:bg-emerald-700 active:border-lime-400 select-none"
      >
        +
      </button>
    </div>
  );

  // 視認性向上: 暗い背景 + はっきりした明るめの枠 + 影で浮かせる
  const card = "bg-emerald-800/70 rounded-2xl border-2 border-emerald-500/40 shadow-lg shadow-black/30";

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 font-sans px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-3 shrink-0 rounded-full bg-lime-400 shadow-[0_0_12px_2px] shadow-lime-400/60" />
            <h1 className="text-2xl font-bold tracking-tight font-mono truncate">TENNIS CIRCLE</h1>
          </div>
          {standings.length > 0 && (
            <button
              onClick={exportImage}
              className="bg-lime-400 text-emerald-950 font-bold py-2 px-3 rounded-lg text-xs active:bg-lime-300 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>🖼</span> 結果出力
            </button>
          )}
        </div>
        <p className="text-emerald-300/70 text-[11px] mb-5 ml-5 tracking-widest uppercase font-mono">
          doubles &middot; score &amp; ranking
        </p>

        {/* タブ */}
        <div className="flex gap-1 mb-5 bg-emerald-900/80 p-1 rounded-2xl border border-emerald-700/60">
          {[
            { k: "rank", label: "順位表" },
            { k: "match", label: "試合入力" },
            { k: "player", label: "メンバー" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`flex-1 py-3 rounded-xl text-[15px] font-bold transition-all ${
                tab === t.k
                  ? "bg-lime-400 text-emerald-950 shadow-lg"
                  : "text-emerald-300 active:bg-emerald-800/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 順位表 */}
        {tab === "rank" && (
          <div className="space-y-2.5">
            {standings.length > 0 && (
              <div className="flex items-center mb-1">
                <span className="text-emerald-300/70 text-xs font-mono tracking-wider">
                  {standings.length}名 ・ 全{matches.length}試合
                </span>
              </div>
            )}
            {standings.length === 0 && (
              <p className="text-center text-emerald-400/60 py-12 text-sm">
                {players.length === 0
                  ? "メンバーを登録してください"
                  : "まだ試合結果がありません"}
              </p>
            )}
            {standings.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-3 py-3.5 ${card}`}
              >
                <div
                  className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-base font-mono ${
                    medal[i] ?? "bg-emerald-600 text-emerald-50"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[17px] truncate leading-tight">{s.name}</div>
                  <div className="text-xs text-emerald-300/70 mt-1.5 font-mono">
                    {s.played}試合 ・ 勝率{(s.winRate * 100).toFixed(0)}% ・ G率{(s.gameRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono leading-none">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-bold text-lime-400">{s.win}</span>
                    <span className="text-emerald-300/40 text-lg font-light">/</span>
                    <span className="text-lg font-bold text-emerald-200/90">{s.lose}</span>
                  </div>
                  <div className="text-[10px] text-emerald-300/50 mt-2 tracking-[0.25em]">
                    WIN / LOSE
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 試合入力 */}
        {tab === "match" && (
          <div>
            <div className={`p-4 mb-5 space-y-4 ${card}`}>
              {/* TEAM A */}
              <div className="space-y-2.5">
                <div className="text-xs text-lime-400 font-bold tracking-wide font-mono">TEAM A</div>
                <div className="grid grid-cols-2 gap-2">
                  <PlayerSelect field="a1" placeholder="選手1" />
                  <PlayerSelect field="a2" placeholder="選手2" />
                </div>
                <Stepper field="sa" />
              </div>

              {/* VS（はっきり大きく） */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-emerald-500/40" />
                <span className="text-2xl font-extrabold font-mono text-lime-400 tracking-[0.25em] px-2 select-none drop-shadow">
                  VS
                </span>
                <div className="flex-1 h-px bg-emerald-500/40" />
              </div>

              {/* TEAM B */}
              <div className="space-y-2.5">
                <div className="text-xs text-emerald-200 font-bold tracking-wide font-mono">TEAM B</div>
                <div className="grid grid-cols-2 gap-2">
                  <PlayerSelect field="b1" placeholder="選手1" />
                  <PlayerSelect field="b2" placeholder="選手2" />
                </div>
                <Stepper field="sb" />
              </div>

              {error && (
                <p className="text-red-200 text-xs text-center bg-red-900/40 rounded-lg py-2 border border-red-500/40">
                  {error}
                </p>
              )}

              <button
                onClick={addMatch}
                className="w-full bg-lime-400 text-emerald-950 font-bold py-4 rounded-xl text-base active:bg-lime-300 transition-colors"
              >
                結果を記録
              </button>
            </div>

            <div className="space-y-2">
              {matches.length === 0 && (
                <p className="text-center text-emerald-400/60 py-8 text-sm">
                  まだ試合がありません
                </p>
              )}
              {[...matches].reverse().map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 bg-emerald-800/60 rounded-xl px-2.5 py-3 text-[13px] border border-emerald-600/40"
                >
                  <span className={`flex-1 text-right truncate ${m.sa > m.sb ? "font-bold text-lime-400" : ""}`}>
                    {nameOf(m.a1)}・{nameOf(m.a2)}
                  </span>
                  <span className="font-bold tabular-nums px-1.5 shrink-0 font-mono text-sm">
                    {m.sa}-{m.sb}
                  </span>
                  <span className={`flex-1 truncate ${m.sb > m.sa ? "font-bold text-lime-400" : ""}`}>
                    {nameOf(m.b1)}・{nameOf(m.b2)}
                  </span>
                  <button
                    onClick={() => removeMatch(m.id)}
                    className="text-emerald-300/50 active:text-red-400 px-1.5 shrink-0 text-base"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メンバー */}
        {tab === "player" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (playerError) setPlayerError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                placeholder="名前を入力"
                className="flex-1 min-w-0 bg-emerald-950 rounded-xl px-4 py-3.5 text-base border-2 border-emerald-600/70 focus:border-lime-400 outline-none"
              />
              <button
                onClick={addPlayer}
                className="bg-lime-400 text-emerald-950 font-bold px-5 rounded-xl text-base active:bg-lime-300 transition-colors shrink-0"
              >
                追加
              </button>
            </div>
            {playerError && (
              <p className="text-red-200 text-xs bg-red-900/40 rounded-lg py-2 px-3 border border-red-500/40 mb-3">
                {playerError}
              </p>
            )}
            <p className="text-emerald-300/60 text-xs mb-4">登録メンバー {players.length}人</p>
            <div className="space-y-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-emerald-800/60 rounded-xl px-4 py-3.5 border border-emerald-600/40"
                >
                  <span className="font-bold text-base">{p.name}</span>
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-emerald-300/50 active:text-red-400 text-sm px-2 py-1"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 画像プレビュー モーダル */}
      {imgUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImgUrl(null)}
        >
          <div
            className="bg-emerald-900 rounded-2xl border-2 border-emerald-500/50 shadow-2xl shadow-black/60 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-700/60 shrink-0">
              <h2 className="font-bold text-base">最終結果</h2>
              <button
                onClick={() => setImgUrl(null)}
                className="text-emerald-300/70 active:text-emerald-100 text-2xl leading-none px-1"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <img
                src={imgUrl}
                alt="最終結果"
                className="w-full rounded-xl border-2 border-emerald-500/40"
              />
              <p className="text-[11px] text-emerald-300/70 mt-2 text-center">
                画像を長押しで保存、または下のボタンでダウンロード
              </p>
            </div>
            <div className="p-4 pt-0 shrink-0">
              <button
                onClick={downloadImage}
                className="w-full bg-lime-400 text-emerald-950 font-bold py-3.5 rounded-xl text-base active:bg-lime-300 transition-colors"
              >
                ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
