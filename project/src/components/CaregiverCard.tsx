import { useState } from 'react';
import { Phone, User, Pencil, Save, X, ShieldAlert, Check } from 'lucide-react';
import type { Caregiver } from '@/types';

interface CaregiverCardProps {
  caregiver: Caregiver | null;
  onSave: (data: { name: string; relationship: string | null; phone: string }) => Promise<void>;
}

export default function CaregiverCard({ caregiver, onSave }: CaregiverCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setError(null);
    if (caregiver) {
      setName(caregiver.name);
      setRelationship(caregiver.relationship ?? '');
      setPhone(caregiver.phone);
    } else {
      setName('');
      setRelationship('');
      setPhone('');
    }
    setEditing(true);
  }

  async function save() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        relationship: relationship.trim() || null,
        phone: phone.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save caregiver.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white px-5 py-4 sm:px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-base font-bold text-teal-900">Emergency Caregiver</h2>
          <p className="text-xs text-rose-700/80">One tap to call when you need help</p>
        </div>
        {!editing && (
          <button onClick={startEdit} className="btn-ghost text-rose-600 hover:bg-rose-50">
            <Pencil className="h-4 w-4" /> {caregiver ? 'Edit' : 'Add'}
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {editing ? (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="label" htmlFor="cg-name">Name</label>
              <input id="cg-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Johnson" maxLength={80} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="cg-rel">Relationship</label>
                <input id="cg-rel" className="input" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. Daughter" maxLength={40} />
              </div>
              <div>
                <label className="label" htmlFor="cg-phone">Phone</label>
                <input id="cg-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +1 555 0100" maxLength={30} />
              </div>
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{error}</p>}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setEditing(false)} className="btn-ghost">
                <X className="h-4 w-4" /> Cancel
              </button>
              <button onClick={save} disabled={saving} className="btn-primary">
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : caregiver ? (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-teal-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-teal-900">{caregiver.name}</p>
                <p className="text-sm text-teal-600">
                  {caregiver.relationship ? `${caregiver.relationship} · ` : ''}
                  <span className="font-medium">{caregiver.phone}</span>
                </p>
              </div>
            </div>
            <a
              href={`tel:${caregiver.phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-600 active:scale-[0.98]"
            >
              <Phone className="h-4 w-4 animate-pulse" /> Call Now
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50/60 px-4 py-3.5 text-sm text-rose-700">
            <Check className="h-4 w-4 shrink-0 text-rose-500" />
            No caregiver set yet. Tap “Add” to save an emergency contact for one-tap calling.
          </div>
        )}
      </div>
    </section>
  );
}
