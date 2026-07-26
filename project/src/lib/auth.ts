import type { AuthUser } from '@/types';

// Demo-grade local auth. Users and sessions live in this browser's
// localStorage only — nothing is sent to a server, so accounts and data
// never sync across devices. Passwords are hashed (SHA-256 + salt), never
// stored in plain text.

interface StoredUser extends AuthUser {
  salt: string;
  hash: string;
}

const USERS_KEY = 'medminder:users';
const SESSION_KEY = 'medminder:session';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(digest);
}

function toSession(u: StoredUser): AuthUser {
  return { id: u.id, email: u.email, name: u.name };
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.id !== 'string') return null;
    return { id: parsed.id, email: parsed.email ?? '', name: parsed.name ?? '' };
  } catch {
    return null;
  }
}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName) throw new Error('Please enter your name.');
  if (!EMAIL_RE.test(cleanEmail)) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');

  const users = readUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }
  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: cleanEmail,
    name: cleanName,
    salt,
    hash,
  };
  writeUsers([...users, user]);
  const session = toSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new Error('Please enter a valid email address.');
  if (!password) throw new Error('Please enter your password.');

  const user = readUsers().find((u) => u.email === cleanEmail);
  if (!user) throw new Error('No account found with this email.');
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.hash) throw new Error('Incorrect password. Please try again.');
  const session = toSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}
