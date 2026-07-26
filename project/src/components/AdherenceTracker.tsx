import { CheckCircle2, Activity } from 'lucide-react';

interface AdherenceTrackerProps {
  taken: number;
  total: number;
}

export default function AdherenceTracker({ taken, total }: AdherenceTrackerProps) {
  const pct = total === 0 ? 0 : Math.round((taken / total) * 100);
  const complete = total > 0 && taken === total;
  const status = total === 0 ? 'No medicines scheduled yet' : complete ? "Perfect — you've taken everything!" : `${pct}% medicines taken today`;

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-teal-50/60" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-teal-600">
            <Activity className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wide">Today&apos;s Adherence</p>
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold text-teal-900">
            {total === 0 ? '—' : `${pct}%`}
          </p>
          <p className="mt-1 text-sm text-teal-600">{status}</p>
        </div>

        <div className="relative grid h-20 w-20 shrink-0 place-items-center">
          <svg viewBox="0 0 44 44" className="h-20 w-20 -rotate-90">
            <circle cx="22" cy="22" r="19" fill="none" stroke="#d6f3f0" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="#2a9d94"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 119.4} 119.4`}
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
          </svg>
          <div className="absolute grid place-items-center text-teal-700">
            {complete ? (
              <CheckCircle2 className="h-7 w-7 text-teal-500" />
            ) : (
              <span className="font-display text-sm font-bold">{total === 0 ? '0' : pct}</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium text-teal-600">
          <span>{taken} of {total} taken</span>
          <span>{Math.max(0, total - taken)} remaining</span>
        </div>
      </div>
    </div>
  );
}
