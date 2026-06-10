import React, { useState, useMemo, useEffect, useRef } from "react";
import { computeStandings } from "./lib/standings";
import { renderRankingImage, renderMatchesImage } from "./lib/rankingImage";
import {
  getSavedRoomCode, getSavedPassword, getSavedIsAdmin,
  saveRoomCode, savePassword, saveIsAdmin, clearRoomCode,
  generateRoomCode, createRoom, roomExists, verifyPassword,
  subscribeRoom, updateRoom,
} from "./lib/db";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ────────────────────────────────────────────
// ルーム選択画面
// ────────────────────────────────────────────
function RoomScreen({ onJoin }) {
  const [mode, setMode] = useState(null); // "create" | "join"
  const [inputCode, setInputCode] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const pass = createPassword.trim();
    if (!pass) { setError("パスワードを入力してください"); return; }
    setLoading(true);
    setError("");
    const code = generateRoomCode();
    await createRoom(code, {
      players: [], matches: [],
      circleName: "TENNIS CIRCLE",
      outputDate: todayStr(),
      password: pass,
    });
    saveRoomCode(code);
    savePassword(pass);
    saveIsAdmin(true);
    onJoin(code, pass, true);
  };

  const handleJoin = async () => {
    const code = inputCode.trim().toUpperCase();
    const pass = inputPassword.trim();
    if (code.length < 4) { setError("ルームコードを入力してください"); return; }
    if (!pass) { setError("パスワードを入力してください"); return; }
    setLoading(true);
    setError("");
    const exists = await roomExists(code);
    if (!exists) { setError("ルームが見つかりません"); setLoading(false); return; }
    const ok = await verifyPassword(code, pass);
    if (!ok) { setError("パスワードが違います"); setLoading(false); return; }
    saveRoomCode(code);
    savePassword(pass);
    saveIsAdmin(false);
    onJoin(code, pass, false);
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 flex flex-col items-center justify-center px-6 gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-lime-400 shadow-[0_0_16px_4px] shadow-lime-400/60 mb-1" />
        <h1 className="text-3xl tracking-tight" style={{ fontFamily: "'Black Ops One', sans-serif" }}>
          TENNIS CIRCLE
        </h1>
        <p className="text-emerald-300/60 text-xs font-mono tracking-widest uppercase">
          doubles · score &amp; ranking
        </p>
      </div>

      {mode === null && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={() => setMode("create")}
            className="w-full bg-lime-400 text-emerald-950 font-bold py-4 rounded-2xl text-base active:bg-lime-300 transition-colors"
          >
            🎾 新しくルームを作る
          </button>
          <button
            onClick={() => setMode("join")}
            className="w-full border-2 border-emerald-500 text-emerald-200 font-bold py-4 rounded-2xl text-base active:bg-emerald-800/50 transition-colors"
          >
            🔑 コードで参加する
          </button>
        </div>
      )}

      {mode === "create" && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <p className="text-emerald-300/70 text-sm text-center">ルームのパスワードを設定してください</p>
          <input
            autoFocus
            type="password"
            value={createPassword}
            onChange={(e) => { setCreatePassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="パスワード"
            className="w-full bg-emerald-900 rounded-2xl px-4 py-4 text-base text-center border-2 border-emerald-600/70 focus:border-lime-400 outline-none"
          />
          {error && (
            <p className="text-red-300 text-sm text-center bg-red-900/40 rounded-xl py-2 border border-red-500/40">{error}</p>
          )}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-lime-400 text-emerald-950 font-bold py-4 rounded-2xl text-base active:bg-lime-300 transition-colors disabled:opacity-50"
          >
            {loading ? "作成中..." : "ルームを作成"}
          </button>
          <button onClick={() => { setMode(null); setError(""); }} className="text-emerald-400/60 text-sm text-center py-2">戻る</button>
        </div>
      )}

      {mode === "join" && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <input
            autoFocus
            value={inputCode}
            onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setError(""); }}
            placeholder="ルームコード"
            maxLength={8}
            className="w-full bg-emerald-900 rounded-2xl px-4 py-4 text-xl font-mono text-center border-2 border-emerald-600/70 focus:border-lime-400 outline-none tracking-widest"
          />
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => { setInputPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="パスワード"
            className="w-full bg-emerald-900 rounded-2xl px-4 py-4 text-base text-center border-2 border-emerald-600/70 focus:border-lime-400 outline-none"
          />
          {error && (
            <p className="text-red-300 text-sm text-center bg-red-900/40 rounded-xl py-2 border border-red-500/40">{error}</p>
          )}
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-lime-400 text-emerald-950 font-bold py-4 rounded-2xl text-base active:bg-lime-300 transition-colors disabled:opacity-50"
          >
            {loading ? "確認中..." : "参加する"}
          </button>
          <button onClick={() => { setMode(null); setError(""); }} className="text-emerald-400/60 text-sm text-center py-2">戻る</button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// メインアプリ
// ────────────────────────────────────────────
export default function TennisRanking() {
  const [roomCode, setRoomCode] = useState(() => getSavedRoomCode());
  const [password, setPassword] = useState(() => getSavedPassword());
  const [isAdmin, setIsAdmin] = useState(() => getSavedIsAdmin());

  // Firestoreから同期されるデータ
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [circleName, setCircleName] = useState("TENNIS CIRCLE");
  const [outputDate, setOutputDate] = useState(todayStr());

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState("rank");
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [form, setForm] = useState({ a1: "", a2: "", b1: "", b2: "", sa: 0, sb: 0 });
  const [error, setError] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [imgUrl, setImgUrl] = useState(null);
  const [matchImgUrl, setMatchImgUrl] = useState(null);
  const [showRoomCode, setShowRoomCode] = useState(false);

  // Firestoreリアルタイム同期
  useEffect(() => {
    if (!roomCode) return;
    const unsub = subscribeRoom(roomCode, (data) => {
      setPlayers(data.players ?? []);
      setMatches(data.matches ?? []);
      setCircleName(data.circleName ?? "TENNIS CIRCLE");
      setOutputDate(data.outputDate ?? todayStr());
    });
    return unsub;
  }, [roomCode]);

  const update = (patch) => updateRoom(roomCode, password, patch);

  const nameOf = (id) => players.find((p) => p.id === id)?.name ?? "?";

  const standings = useMemo(() => computeStandings(players, matches), [players, matches]);

  // ルーム参加前は選択画面
  if (!roomCode) {
    return <RoomScreen onJoin={(code, pass, admin) => {
      setRoomCode(code);
      setPassword(pass);
      setIsAdmin(admin);
    }} />;
  }

  // ────── ハンドラ ──────
  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    if (players.some((p) => p.name === name)) {
      setPlayerError(`「${name}」は既に登録されています`); return;
    }
    const age = newAge !== "" ? Number(newAge) : null;
    const next = [...players, { id: Date.now(), name, age }];
    update({ players: next });
    setNewName(""); setNewAge(""); setPlayerError("");
  };

  const removePlayer = (id) => {
    update({
      players: players.filter((p) => p.id !== id),
      matches: matches.filter((m) => ![m.a1, m.a2, m.b1, m.b2].includes(id)),
    });
  };

  const bump = (field, delta) =>
    setForm((f) => ({ ...f, [field]: Math.max(0, Number(f[field]) + delta) }));

  const addMatch = () => {
    const { a1, a2, b1, b2, sa, sb } = form;
    const ids = [a1, a2, b1, b2];
    if (ids.some((v) => v === "")) { setError("4人すべて選んでください"); return; }
    if (new Set(ids).size !== 4) { setError("同じ選手が重複しています"); return; }
    if (Number(sa) === Number(sb)) { setError("スコアを入力してください（同点は登録できません）"); return; }
    const next = [...matches, {
      id: Date.now(),
      a1: Number(a1), a2: Number(a2),
      b1: Number(b1), b2: Number(b2),
      sa: Number(sa), sb: Number(sb),
    }];
    update({ matches: next });
    setForm({ a1: "", a2: "", b1: "", b2: "", sa: 0, sb: 0 }); setError("");
  };

  const removeMatch = (id) => update({ matches: matches.filter((m) => m.id !== id) });

  const resetAll = () => {
    if (!window.confirm("メンバーと試合結果をすべて削除します。よろしいですか？")) return;
    update({ players: [], matches: [] });
    setForm({ a1: "", a2: "", b1: "", b2: "", sa: 0, sb: 0 });
    setError(""); setPlayerError("");
  };

  const leaveRoom = () => {
    if (!window.confirm("このルームから退出します。\n（データはサーバーに残ります）")) return;
    clearRoomCode();
    setRoomCode("");
  };

  const nextDownloadNumber = () => {
    const key = "tennis-download-counter";
    const n = (parseInt(localStorage.getItem(key) ?? "0", 10) + 1);
    localStorage.setItem(key, String(n));
    return String(n).padStart(3, "0");
  };

  const exportImage = async () => {
    if (standings.length === 0) return;
    setImgUrl(await renderRankingImage(standings, matches.length, circleName, outputDate));
  };

  const downloadImage = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl; a.download = `tennis_ranking_${nextDownloadNumber()}.png`; a.click();
  };

  const exportMatchesImage = async () => {
    if (matches.length === 0) return;
    setMatchImgUrl(await renderMatchesImage(matches, nameOf, circleName, outputDate));
  };

  const downloadMatchesImage = () => {
    if (!matchImgUrl) return;
    const a = document.createElement("a");
    a.href = matchImgUrl; a.download = `tennis_matches_${nextDownloadNumber()}.png`; a.click();
  };

  const medal = ["bg-yellow-400 text-stone-900", "bg-gray-300 text-stone-900", "bg-amber-600 text-white"];
  const selected = [form.a1, form.a2, form.b1, form.b2];

  const PlayerSelect = ({ field, placeholder }) => (
    <select
      value={form[field]}
      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      className="w-full bg-emerald-950 rounded-xl px-3 py-3.5 text-base border-2 border-emerald-600/70 focus:border-lime-400 outline-none appearance-none"
    >
      <option value="">{placeholder}</option>
      {players.map((p) => (
        <option key={p.id} value={p.id}
          disabled={selected.includes(String(p.id)) && form[field] !== String(p.id)}>
          {p.name}
        </option>
      ))}
    </select>
  );

  const Stepper = ({ field }) => (
    <div className="flex items-center gap-3">
      <button onClick={() => bump(field, -1)}
        className="w-14 h-14 shrink-0 rounded-xl bg-emerald-950 border-2 border-emerald-600 text-3xl font-bold leading-none flex items-center justify-center active:bg-emerald-700 active:border-lime-400 select-none">−</button>
      <div className="flex-1 text-center text-4xl font-bold font-mono tabular-nums text-lime-400 select-none">{Number(form[field])}</div>
      <button onClick={() => bump(field, 1)}
        className="w-14 h-14 shrink-0 rounded-xl bg-emerald-950 border-2 border-emerald-600 text-3xl font-bold leading-none flex items-center justify-center active:bg-emerald-700 active:border-lime-400 select-none">+</button>
    </div>
  );

  const card = "bg-emerald-800/70 rounded-2xl border-2 border-emerald-500/40 shadow-lg shadow-black/30";

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 font-sans px-4 py-6">
      <div className="max-w-md mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-3 shrink-0 rounded-full bg-lime-400 shadow-[0_0_12px_2px] shadow-lime-400/60" />
            {editingName ? (
              <input autoFocus value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => { const v = nameInput.trim() || "TENNIS CIRCLE"; update({ circleName: v }); setEditingName(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { const v = nameInput.trim() || "TENNIS CIRCLE"; update({ circleName: v }); setEditingName(false); }
                  else if (e.key === "Escape") setEditingName(false);
                }}
                className="text-xl tracking-tight bg-emerald-900 border-b-2 border-lime-400 outline-none text-lime-400 w-44 min-w-0"
                style={{ fontFamily: "'Black Ops One', sans-serif" }}
              />
            ) : (
              <button onClick={() => { setNameInput(circleName); setEditingName(true); }}
                className="text-2xl tracking-tight truncate text-left hover:text-lime-300 active:text-lime-400 transition-colors"
                style={{ fontFamily: "'Black Ops One', sans-serif" }}>
                {circleName}
              </button>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {standings.length > 0 && (
              <button onClick={exportImage}
                className="bg-lime-400 text-emerald-950 font-bold py-2 px-3 rounded-lg text-xs active:bg-lime-300 transition-colors flex items-center gap-1">
                <span>🖼</span> 結果出力
              </button>
            )}
            {matches.length > 0 && (
              <button onClick={exportMatchesImage}
                className="bg-emerald-600 text-emerald-50 font-bold py-2 px-3 rounded-lg text-xs active:bg-emerald-500 transition-colors flex items-center gap-1 border border-emerald-400/50">
                <span>📋</span> 試合一覧
              </button>
            )}
          </div>
        </div>

        {/* サブタイトル行 */}
        <div className="flex items-center gap-2 mb-5 ml-5">
          <p className="text-emerald-300/70 text-[11px] tracking-widest uppercase font-mono">
            doubles · score &amp; ranking
          </p>
          <span className="text-emerald-600/60 text-[11px]">|</span>
          <input type="date" value={outputDate}
            onChange={(e) => update({ outputDate: e.target.value || todayStr() })}
            className="text-[11px] font-mono text-emerald-300/70 bg-transparent border-b border-emerald-600/50 outline-none focus:border-lime-400 focus:text-lime-400 transition-colors cursor-pointer"
          />
        </div>

        {/* ルームコードバー */}
        <button
          onClick={() => setShowRoomCode((v) => !v)}
          className="w-full flex items-center justify-between bg-emerald-900/60 rounded-xl px-4 py-2.5 mb-5 border border-emerald-700/50 active:bg-emerald-800/60 transition-colors"
        >
          <span className="text-xs text-emerald-300/70 font-mono">ルームコード</span>
          <span className="text-lg font-mono font-bold text-lime-400 tracking-[0.2em]">
            {showRoomCode ? roomCode : "••••••"}
          </span>
          <span className="text-xs text-emerald-400/60">{showRoomCode ? "隠す" : "表示"}</span>
        </button>

        {/* タブ */}
        <div className="flex gap-1 mb-5 bg-emerald-900/80 p-1 rounded-2xl border border-emerald-700/60">
          {[{ k: "rank", label: "順位表" }, { k: "match", label: "試合入力" }, { k: "player", label: "メンバー" }].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex-1 py-3 rounded-xl text-[15px] font-bold transition-all ${tab === t.k ? "bg-lime-400 text-emerald-950 shadow-lg" : "text-emerald-300 active:bg-emerald-800/50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 順位表 */}
        {tab === "rank" && (
          <div className="space-y-2.5">
            {standings.length > 0 && (
              <span className="text-emerald-300/70 text-xs font-mono tracking-wider block mb-1">
                {standings.length}名 ・ 全{matches.length}試合
              </span>
            )}
            {standings.length === 0 && (
              <p className="text-center text-emerald-400/60 py-12 text-sm">
                {players.length === 0 ? "メンバーを登録してください" : "まだ試合結果がありません"}
              </p>
            )}
            {standings.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-3 py-3.5 ${card}`}>
                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-base font-mono ${medal[i] ?? "bg-emerald-600 text-emerald-50"}`}>
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
                  <div className="text-[10px] text-emerald-300/50 mt-2 tracking-[0.25em]">WIN / LOSE</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 試合入力 */}
        {tab === "match" && (
          <div>
            <div className={`p-4 mb-5 space-y-4 ${card}`}>
              <div className="space-y-2.5">
                <div className="text-xs text-lime-400 font-bold tracking-wide font-mono">TEAM A</div>
                <div className="grid grid-cols-2 gap-2">
                  <PlayerSelect field="a1" placeholder="選手1" />
                  <PlayerSelect field="a2" placeholder="選手2" />
                </div>
                <Stepper field="sa" />
              </div>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-emerald-500/40" />
                <span className="text-2xl font-extrabold font-mono text-lime-400 tracking-[0.25em] px-2 select-none drop-shadow">VS</span>
                <div className="flex-1 h-px bg-emerald-500/40" />
              </div>
              <div className="space-y-2.5">
                <div className="text-xs text-emerald-200 font-bold tracking-wide font-mono">TEAM B</div>
                <div className="grid grid-cols-2 gap-2">
                  <PlayerSelect field="b1" placeholder="選手1" />
                  <PlayerSelect field="b2" placeholder="選手2" />
                </div>
                <Stepper field="sb" />
              </div>
              {error && (
                <p className="text-red-200 text-xs text-center bg-red-900/40 rounded-lg py-2 border border-red-500/40">{error}</p>
              )}
              <button onClick={addMatch}
                className="w-full bg-lime-400 text-emerald-950 font-bold py-4 rounded-xl text-base active:bg-lime-300 transition-colors">
                結果を記録
              </button>
            </div>
            <div className="space-y-2">
              {matches.length === 0 && <p className="text-center text-emerald-400/60 py-8 text-sm">まだ試合がありません</p>}
              {[...matches].reverse().map((m) => (
                <div key={m.id} className="flex items-center gap-1.5 bg-emerald-800/60 rounded-xl px-2.5 py-3 text-[13px] border border-emerald-600/40">
                  <span className={`flex-1 text-right truncate ${m.sa > m.sb ? "font-bold text-lime-400" : ""}`}>
                    {nameOf(m.a1)}・{nameOf(m.a2)}
                  </span>
                  <span className="font-bold tabular-nums px-1.5 shrink-0 font-mono text-sm">{m.sa}-{m.sb}</span>
                  <span className={`flex-1 truncate ${m.sb > m.sa ? "font-bold text-lime-400" : ""}`}>
                    {nameOf(m.b1)}・{nameOf(m.b2)}
                  </span>
                  <button onClick={() => removeMatch(m.id)} className="text-emerald-300/50 active:text-red-400 px-1.5 shrink-0 text-base">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メンバー */}
        {tab === "player" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input value={newName}
                onChange={(e) => { setNewName(e.target.value); if (playerError) setPlayerError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                placeholder="名前"
                className="flex-1 min-w-0 bg-emerald-950 rounded-xl px-4 py-3.5 text-base border-2 border-emerald-600/70 focus:border-lime-400 outline-none"
              />
              <input type="number" min="0" max="120" value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                placeholder="年齢"
                className="w-20 shrink-0 bg-emerald-950 rounded-xl px-3 py-3.5 text-base border-2 border-emerald-600/70 focus:border-lime-400 outline-none"
              />
              <button onClick={addPlayer}
                className="bg-lime-400 text-emerald-950 font-bold px-5 rounded-xl text-base active:bg-lime-300 transition-colors shrink-0">
                追加
              </button>
            </div>
            {playerError && (
              <p className="text-red-200 text-xs bg-red-900/40 rounded-lg py-2 px-3 border border-red-500/40 mb-3">{playerError}</p>
            )}
            <p className="text-emerald-300/60 text-xs mb-4">登録メンバー {players.length}人</p>
            <div className="space-y-2">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-emerald-800/60 rounded-xl px-4 py-3 border border-emerald-600/40">
                  <span className="font-bold text-base flex-1 min-w-0 truncate">{p.name}</span>
                  <input type="number" min="0" max="120" value={p.age ?? ""}
                    onChange={(e) => {
                      const age = e.target.value !== "" ? Number(e.target.value) : null;
                      update({ players: players.map((pl) => pl.id === p.id ? { ...pl, age } : pl) });
                    }}
                    placeholder="年齢"
                    className="w-16 shrink-0 bg-emerald-950 rounded-lg px-2 py-1.5 text-sm text-center border border-emerald-600/50 focus:border-lime-400 outline-none"
                  />
                  <span className="text-emerald-300/50 text-xs shrink-0">歳</span>
                  <button onClick={() => removePlayer(p.id)} className="text-emerald-300/50 active:text-red-400 text-sm px-1 py-1 shrink-0">削除</button>
                </div>
              ))}
            </div>
            {isAdmin && (players.length > 0 || matches.length > 0) && (
              <button onClick={resetAll}
                className="w-full mt-6 border-2 border-red-500/50 text-red-300 font-bold py-3.5 rounded-xl text-sm active:bg-red-900/40 transition-colors">
                🔒 すべてリセット（管理者のみ）
              </button>
            )}
            <button onClick={leaveRoom}
              className="w-full mt-3 border border-emerald-600/40 text-emerald-400/60 py-3 rounded-xl text-sm active:bg-emerald-900/40 transition-colors">
              このルームから退出
            </button>
          </div>
        )}
      </div>

      {/* 全試合結果モーダル */}
      {matchImgUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMatchImgUrl(null)}>
          <div className="bg-emerald-900 rounded-2xl border-2 border-emerald-500/50 shadow-2xl shadow-black/60 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-700/60 shrink-0">
              <h2 className="font-bold text-base">全試合結果</h2>
              <button onClick={() => setMatchImgUrl(null)} className="text-emerald-300/70 active:text-emerald-100 text-2xl leading-none px-1">×</button>
            </div>
            <div className="p-4 overflow-y-auto">
              <img src={matchImgUrl} alt="全試合結果" className="w-full rounded-xl border-2 border-emerald-500/40" />
              <p className="text-[11px] text-emerald-300/70 mt-2 text-center">画像を長押しで保存、または下のボタンでダウンロード</p>
            </div>
            <div className="p-4 pt-0 shrink-0">
              <button onClick={downloadMatchesImage} className="w-full bg-lime-400 text-emerald-950 font-bold py-3.5 rounded-xl text-base active:bg-lime-300 transition-colors">ダウンロード</button>
            </div>
          </div>
        </div>
      )}

      {/* 順位表モーダル */}
      {imgUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setImgUrl(null)}>
          <div className="bg-emerald-900 rounded-2xl border-2 border-emerald-500/50 shadow-2xl shadow-black/60 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-700/60 shrink-0">
              <h2 className="font-bold text-base">最終結果</h2>
              <button onClick={() => setImgUrl(null)} className="text-emerald-300/70 active:text-emerald-100 text-2xl leading-none px-1">×</button>
            </div>
            <div className="p-4 overflow-y-auto">
              <img src={imgUrl} alt="最終結果" className="w-full rounded-xl border-2 border-emerald-500/40" />
              <p className="text-[11px] text-emerald-300/70 mt-2 text-center">画像を長押しで保存、または下のボタンでダウンロード</p>
            </div>
            <div className="p-4 pt-0 shrink-0">
              <button onClick={downloadImage} className="w-full bg-lime-400 text-emerald-950 font-bold py-3.5 rounded-xl text-base active:bg-lime-300 transition-colors">ダウンロード</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
