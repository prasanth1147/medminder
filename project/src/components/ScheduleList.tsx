import { Clock, CalendarDays, Check, Bell } from 'lucide-react';
import type { MedicineWithStatus } from '@/types';
import { formatTime12h, WEEKDAYS_SHORT } from '@/lib/time';

interface ScheduleListProps {
  medicines: MedicineWithStatus[];
  onToggle: (medicine: MedicineWithStatus) => void;
  onEdit: (medicine: MedicineWithStatus) => void;
}

function statusBadge(med: MedicineWithStatus) {
  if (med.takenToday) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
        <Check className="h-3 w-3" /> Taken
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Bell className="h-3 w-3" /> Due
    </span>
  );
}

export default function ScheduleList({ medicines, onToggle, onEdit }: ScheduleListProps) {
  if (medicines.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-400">
          <Clock className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-teal-900">No medicines yet</h3>
        <p className="mt-1 max-w-xs text-sm text-teal-600">
          Tap “Add Medicine” to set up your first reminder and start tracking today&apos;s doses.
        </p>
      </div>
    );
  }

  const sorted = [...medicines].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-teal-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-500" />
          <h2 className="font-display text-base font-bold text-teal-900">Today&apos;s Schedule</h2>
        </div>
        <span className="text-xs font-medium text-teal-500">{sorted.length} reminder{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      <ul className="divide-y divide-teal-50">
        {sorted.map((med) => (
          <li key={med.id}>
            <div className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-teal-50/40 sm:px-6">
              <button
                onClick={() => onToggle(med)}
                role="checkbox"
                aria-checked={med.takenToday}
                aria-label={`Mark ${med.name} as ${med.takenToday ? 'not taken' : 'taken'}`}
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition active:scale-90 ${
                  med.takenToday
                    ? 'border-teal-500 bg-teal-500 text-white'
                    : 'border-teal-300 bg-white text-transparent hover:border-teal-500'
                }`}
              >
                <Check className="h-4 w-4" />
              </button>

              <div className="min-w-0 flex-1">
                <button onClick={() => onEdit(med)} className="block w-full text-left">
                  <div className="flex items-center gap-2">
                    <p className={`truncate font-semibold ${med.takenToday ? 'text-teal-400 line-through' : 'text-teal-900'}`}>
                      {med.name}
                    </p>
                    {statusBadge(med)}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-teal-600">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" /> {formatTime12h(med.time)}
                    </span>
                    <span>{med.dosage}</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {med.frequency === 'daily'
                        ? 'Every day'
                        : `Every ${WEEKDAYS_SHORT[med.day_of_week ?? 0]}`}
                    </span>
                  </div>
                  {med.notes && (
                    <p className="mt-1 truncate text-xs italic text-teal-500">{med.notes}</p>
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
