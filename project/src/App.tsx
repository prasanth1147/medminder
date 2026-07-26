import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, BellRing } from 'lucide-react';
import Header from '@/components/Header';
import AdherenceTracker from '@/components/AdherenceTracker';
import ScheduleList from '@/components/ScheduleList';
import CaregiverCard from '@/components/CaregiverCard';
import AddMedicineModal from '@/components/AddMedicineModal';
import NotificationBanner from '@/components/NotificationBanner';
import AuthPage from '@/components/AuthPage';
import type { AuthUser, Caregiver, Frequency, IntakeLog, Medicine, MedicineWithStatus } from '@/types';
import { getSession, signOut } from '@/lib/auth';
import { loadAll, saveCaregiver as storeCaregiver, saveMedicine as storeMedicine, deleteMedicine as storeDeleteMedicine, toggleIntake as storeToggleIntake } from '@/lib/store';
import { todayISO } from '@/lib/time';
import { useReminders } from '@/hooks/useReminders';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => getSession());
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [activeAlert, setActiveAlert] = useState<MedicineWithStatus | null>(null);

  const today = todayISO();

  // ---- Load all data for the signed-in user ----
  const loadData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = loadAll(user.id, today);
      setMedicines(data.medicines);
      setLogs(data.logs);
      setCaregiver(data.caregiver);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your data.');
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  useEffect(() => {
    if (!user) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('medminder:notif-dismissed');
      if (!dismissed) setShowBanner(true);
    }
  }, [user]);

  // ---- Derived: today's medicines with taken status ----
  const todaysMedicines: MedicineWithStatus[] = useMemo(() => {
    const todayIdx = new Date().getDay();
    const takenIds = new Set(logs.map((l) => l.medicine_id));
    return medicines
      .filter((m) => m.frequency === 'daily' || m.day_of_week === todayIdx)
      .map((m) => ({ ...m, takenToday: takenIds.has(m.id) }));
  }, [medicines, logs]);

  const takenCount = todaysMedicines.filter((m) => m.takenToday).length;

  // ---- Reminders hook ----
  const handleDue = useCallback((med: MedicineWithStatus) => {
    setActiveAlert(med);
    window.setTimeout(() => setActiveAlert((cur) => (cur?.id === med.id ? null : cur)), 25_000);
  }, []);
  useReminders({ medicines: todaysMedicines, onDue: handleDue });

  // ---- Toggle taken ----
  const toggleTaken = useCallback(
    async (med: MedicineWithStatus) => {
      if (!user) return;
      const alreadyTaken = med.takenToday;
      if (alreadyTaken) {
        setLogs((cur) => cur.filter((l) => l.medicine_id !== med.id));
        setActiveAlert((cur) => (cur?.id === med.id ? null : cur));
      } else {
        setLogs((cur) => [...cur, {
          id: crypto.randomUUID(),
          medicine_id: med.id,
          taken_date: today,
          created_at: new Date().toISOString(),
        }]);
      }
      try {
        await storeToggleIntake(user.id, med.id, today, !alreadyTaken);
      } catch (err) {
        loadData();
        setError(err instanceof Error ? err.message : 'Could not update. Please retry.');
      }
    },
    [user, today, loadData],
  );

  // ---- Add / edit medicine ----
  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (med: MedicineWithStatus) => {
    setEditing(med);
    setModalOpen(true);
  };

  const saveMedicine = useCallback(
    async (data: {
      name: string;
      dosage: string;
      time: string;
      frequency: Frequency;
      day_of_week: number | null;
      notes: string;
    }) => {
      if (!user) throw new Error('Not signed in.');
      await storeMedicine(user.id, data, editing?.id);
      loadData();
    },
    [user, editing, loadData],
  );

  const deleteMedicine = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Not signed in.');
      await storeDeleteMedicine(user.id, id);
      loadData();
    },
    [user, loadData],
  );

  const saveCaregiver = useCallback(
    async (data: { name: string; relationship: string | null; phone: string }) => {
      if (!user) throw new Error('Not signed in.');
      await storeCaregiver(user.id, data, caregiver?.id);
      loadData();
    },
    [user, caregiver, loadData],
  );

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setMedicines([]);
    setLogs([]);
    setCaregiver(null);
    setActiveAlert(null);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('medminder:notif-dismissed', '1');
  };

  if (!user) {
    return <AuthPage onAuthed={setUser} />;
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onAddMedicine={openAdd} onSignOut={handleSignOut} />

      <main className="relative z-10 mx-auto -mt-20 max-w-5xl px-4 pb-28 sm:px-6 sm:pb-16">
        {/* Active alert — appears when a reminder fires */}
        {activeAlert && (
          <div className="mb-4 animate-slide-up">
            <div className="card flex items-center gap-3 border-teal-300 bg-teal-50/80 p-4 sm:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-500 text-white">
                <BellRing className="h-6 w-6 animate-ring" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-teal-900">Time for {activeAlert.name}</p>
                <p className="text-sm text-teal-700">{activeAlert.dosage} — tap to confirm you&apos;ve taken it.</p>
              </div>
              <button
                onClick={() => toggleTaken(activeAlert)}
                className="btn-primary shrink-0"
              >
                Mark as taken
              </button>
            </div>
          </div>
        )}

        {showBanner && (
          <div className="mb-4">
            <NotificationBanner onDismiss={dismissBanner} />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:gap-5">
          <AdherenceTracker taken={takenCount} total={todaysMedicines.length} />

          {loading ? (
            <div className="card flex items-center justify-center px-6 py-16 text-sm text-teal-500">
              Loading your schedule…
            </div>
          ) : (
            <ScheduleList medicines={todaysMedicines} onToggle={toggleTaken} onEdit={openEdit} />
          )}

          <CaregiverCard caregiver={caregiver} onSave={saveCaregiver} />
        </div>

        {/* Mobile floating add button — bottom-right, full safe-area clearance */}
        <button
          onClick={openAdd}
          aria-label="Add medicine"
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-teal-500 text-white shadow-cardHover transition hover:bg-teal-600 active:scale-95 sm:hidden"
          style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      <AddMedicineModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveMedicine}
        editing={editing}
        onDelete={deleteMedicine}
      />
    </div>
  );
}
