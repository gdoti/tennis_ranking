import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const ROOM_KEY = "tennis-room-code";
const PASS_KEY = "tennis-room-password";

export function getSavedRoomCode() {
  return localStorage.getItem(ROOM_KEY) || "";
}

export function getSavedPassword() {
  return localStorage.getItem(PASS_KEY) || "";
}

export function saveRoomCode(code) {
  localStorage.setItem(ROOM_KEY, code);
}

export function savePassword(password) {
  localStorage.setItem(PASS_KEY, password);
}

export function clearRoomCode() {
  localStorage.removeItem(ROOM_KEY);
  localStorage.removeItem(PASS_KEY);
}

export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function createRoom(code, initialData) {
  await setDoc(doc(db, "rooms", code), initialData);
}

export async function roomExists(code) {
  const snap = await getDoc(doc(db, "rooms", code));
  return snap.exists();
}

export async function verifyPassword(code, password) {
  const snap = await getDoc(doc(db, "rooms", code));
  if (!snap.exists()) return false;
  return snap.data().password === password;
}

export function subscribeRoom(code, onData) {
  return onSnapshot(doc(db, "rooms", code), (snap) => {
    if (snap.exists()) onData(snap.data());
  });
}

export async function updateRoom(code, password, patch) {
  await updateDoc(doc(db, "rooms", code), { ...patch, password });
}
