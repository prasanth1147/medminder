import { useEffect, useState } from 'react';
import { Pill, Bell, Trash2 } from 'lucide-react';
import Modal from './Modal';
import type { Frequency, Medicine } from '@/types';
import { WEEKDAYS_SHORT } from '@/lib/time';

interface AddMedicineModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    dosage: string;
    time: string;
    frequency: Frequency;
    day_of_week: number | null;
    notes: string;
  }) => Promise<void>;
  editing?: Medicine | null;
  onDelete?: (id: string) => Promise<void>;
}

const DAYS = WEEKDAYS_SHORT;

export default function AddMedicineModal({
  open,
  onClose,
  onSave,
  editing,
  onDelete,
}: AddMedicineModalProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setName(editing.name);
      setDosage(editing.dosage);
      setTime(editing.time.slice(0, 5));
      setFrequency(editing.frequency);
      setDayOfWeek(editing.day_of_week ?? 1);
      setNotes(editing.notes ?? '');
    } else {
      setName('');
      setDosage('');
      setTime('08:00');
      setFrequency('daily');
      setDayOfWeek(1);
      setNotes('');
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !dosage.trim() || !time) {
      setError('Please fill in the medicine name, dosage, and time.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        dosage: dosage.trim(),
        time: time.length === 5 ? `${time}:00` : time,
        frequency,
        day_of_week: frequency === 'weekly' ? dayOfWeek : null,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(editing.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const isEdit = Boolean(editing);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Medicine' : 'Add Medicine'}
      subtitle={isEdit ? 'Update the reminder details below.' : 'Set up a new daily or weekly reminder.'}
      icon={<Pill className="h-6 w-6" />}
      footer={
        <>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mr-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" form="add-medicine-form" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Medicine'}
          </button>
        </>
      }
    >
      <form id="add-medicine-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="med-name">Medicine Name</label>
          <input
            id="med-name"
            className="input"
            placeholder="e.g. Metformin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="med-dosage">Dosage</label>
            <input
              id="med-dosage"
              className="input"
              placeholder="e.g. 1 tablet"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              maxLength={40}
            />
          </div>
          <div>
            <label className="label" htmlFor="med-time">Time</label>
            <input
              id="med-time"
              type="time"
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <span className="label">Frequency</span>
          <div className="grid grid-cols-2 gap-2">
            {(['daily', 'weekly'] as Frequency[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                  frequency === f
                    ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-200'
                    : 'border-teal-200 bg-white text-teal-600 hover:border-teal-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {frequency === 'weekly' && (
          <div className="animate-fade-in">
            <span className="label">Day of Week</span>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDayOfWeek(i)}
                  className={`rounded-lg py-2 text-xs font-semibold transition ${
                    dayOfWeek === i
                      ? 'bg-teal-500 text-white'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label" htmlFor="med-notes">Notes (optional)</label>
          <textarea
            id="med-notes"
            className="input min-h-[72px] resize-none"
            placeholder="e.g. Take with food"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 rounded-xl bg-teal-50/70 px-3.5 py-3 text-xs text-teal-700">
          <Bell className="h-4 w-4 shrink-0 text-teal-500" />
          A browser notification and gentle sound will alert you when it&apos;s time to take this medicine.
        </div>
      </form>
    </Modal>
  );
}
