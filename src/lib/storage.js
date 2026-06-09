// localStorage 永続化
// データは各端末のブラウザに保存され、リロードしても残る。
// （ブラウザのサイトデータを削除するとリセットされる）
export const STORAGE_KEY = "tennis-ranking-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // localStorage が使えない環境では null を返す
    return null;
  }
}

export function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* 保存できない環境では何もしない */
  }
}
