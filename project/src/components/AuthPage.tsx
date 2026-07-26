import { useState, type FormEvent } from 'react';
import { Pill, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';
import type { AuthUser } from '@/types';

interface AuthPageProps {
  onAuthed: (user: AuthUser) => void;
}

export default function AuthPage({ onAuthed }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next: 'signin' | 'signup') {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user =
        mode === 'signin'
          ? await signIn(email, password)
          : await signUp(name, email, password);
      onAuthed(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-sky-700" />
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-sky-300/20 blur-2xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
              <Pill className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-white">MedMinder</h1>
            <p className="mt-1 text-sm text-teal-50/85">Your daily medicine companion</p>
          </div>

          <div className="card p-6 sm:p-7">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-teal-50 p-1">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    mode === m ? 'bg-white text-teal-700 shadow-soft' : 'text-teal-600 hover:text-teal-700'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <h2 className="font-display text-lg font-bold text-teal-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-0.5 text-sm text-teal-600">
              {mode === 'signin' ? 'Sign in to manage your medicines.' : 'Start tracking your medicines in seconds.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {mode === 'signup' && (
                <div className="animate-fade-in">
                  <label className="label" htmlFor="auth-name">Name</label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
                    <input
                      id="auth-name"
                      className="input pl-9"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                      autoFocus
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="label" htmlFor="auth-email">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
                  <input
                    id="auth-email"
                    type="email"
                    className="input pl-9"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={120}
                    autoFocus={mode === 'signin'}
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="auth-password">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
                  <input
                    id="auth-password"
                    type="password"
                    className="input pl-9"
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{error}</p>
              )}

              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                {!busy && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-teal-50/70 px-3.5 py-3 text-xs text-teal-700">
              <ShieldCheck className="h-4 w-4 shrink-0 text-teal-500" />
              <span>Your medicines are stored privately on this device and won&apos;t sync to other devices or browsers.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
