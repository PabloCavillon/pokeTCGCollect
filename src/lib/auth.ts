import { cookies } from "next/headers";

const SECRET  = process.env.AUTH_SECRET!;
const COOKIE  = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
	id:    string;
	email: string;
	name:  string | null;
}

// ── Crypto helpers (Web Crypto API — works in Node 18+ and Edge) ──────────────

async function hmacSign(data: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw", enc.encode(SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false, ["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
	return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function makeToken(payload: SessionUser): Promise<string> {
	const data = btoa(JSON.stringify(payload));
	const sig  = await hmacSign(data);
	return `${data}.${sig}`;
}

async function parseToken(token: string): Promise<SessionUser | null> {
	const dot = token.lastIndexOf(".");
	if (dot === -1) return null;
	const data     = token.slice(0, dot);
	const sig      = token.slice(dot + 1);
	const expected = await hmacSign(data);
	if (sig !== expected) return null;
	try { return JSON.parse(atob(data)) as SessionUser; }
	catch { return null; }
}

// ── Password hashing (PBKDF2) ─────────────────────────────────────────────────

const hex = (arr: Uint8Array) =>
	Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key  = await crypto.subtle.importKey(
		"raw", new TextEncoder().encode(password),
		"PBKDF2", false, ["deriveBits"],
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
		key, 256,
	);
	return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [saltHex, hashHex] = stored.split(":");
	if (!saltHex || !hashHex) return false;
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
	const key  = await crypto.subtle.importKey(
		"raw", new TextEncoder().encode(password),
		"PBKDF2", false, ["deriveBits"],
	);
	const bits     = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
		key, 256,
	);
	const computed = hex(new Uint8Array(bits));
	return computed === hashHex;
}

// ── Session management ────────────────────────────────────────────────────────

export async function createSession(user: SessionUser): Promise<void> {
	const token = await makeToken(user);
	(await cookies()).set(COOKIE, token, {
		httpOnly: true,
		secure:   process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge:   MAX_AGE,
		path:     "/",
	});
}

export async function getSession(): Promise<SessionUser | null> {
	const token = (await cookies()).get(COOKIE)?.value;
	if (!token) return null;
	return parseToken(token);
}

export async function deleteSession(): Promise<void> {
	(await cookies()).delete(COOKIE);
}
