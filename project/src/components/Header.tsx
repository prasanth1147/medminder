import { Pill, LogOut } from 'lucide-react';
import { greeting, formatTodayLong } from '@/lib/time';
import type { AuthUser } from '@/types';

interface HeaderProps {
  user: AuthUser;
  onAddMedicine: () => void;
  onSignOut: () => void;
}

export default function Header({ user, onAddMedicine, onSignOut }: HeaderProps) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-500 to-sky-600" />
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-sky-300/20 blur-2xl" />

      <div className="relative mx-auto max-w-5xl px-4 pt-8 pb-28 sm:px-6 sm:pt-12">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold tracking-tight text-white">MedMinder</p>
              <p className="text-xs font-medium text-teal-50/80">Your daily medicine companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddMedicine}
              className="hidden items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 active:scale-[0.98] sm:inline-flex"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Medicine
            </button>
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-sm font-medium text-teal-50/85">{greeting()}, {user.name.split(' ')[0]}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {formatTodayLong()}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-teal-50/85">
            Stay on track with your medications. Mark each dose as taken and watch your daily
            adherence grow.
          </p>
        </div>
      </div>
    </header>
  );
}
