import type { Caregiver, IntakeLog, Medicine } from '@/types';

// Per-user localStorage data layer. Every record is namespaced by the signed-in
// user's id, so each account has its own fully isolated medicine list, intake
// history, and caregiver contact. Data never leaves the browser, so actions on
// one device never affect another.

function key(userId: string, kind: string): string {
  return `medminder:${kind}:${userId}`;
}

function read<T>(userId: string, kind: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(userId, kind));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(userId: string, kind: string, value: T): void {
  localStorage.setItem(key(userId, kind), JSON.stringify(value));
}

export interface AllData {
  medicines: Medicine[];
  logs: IntakeLog[]; // already filtered to today
  caregiver: Caregiver | null;
}

export function loadAll(userId: string, today: string): AllData {
  const medicines = read<Medicine[]>(userId, 'medicines', []);
  const logs = read<IntakeLog[]>(userId, 'logs', []).filter((l) => l.taken_date === today);
  const caregiver = read<Caregiver | null>(userId, 'caregiver', null);
  return { medicines, logs, caregiver };
}

export async function toggleIntake(
  userId: string,
  medicineId: string,
  date: string,
  taken: boolean,
): Promise<void> {
  const logs = read<IntakeLog[]>(userId, 'logs', []);
  let next: IntakeLog[];
  if (taken) {
    const exists = logs.some((l) => l.medicine_id === medicineId && l.taken_date === date);
    next = exists
      ? logs
      : [
          ...logs,
          {
            id: crypto.randomUUID(),
            medicine_id: medicineId,
            taken_date: date,
            created_at: new Date().toISOString(),
          },
        ];
  } else {
    next = logs.filter((l) => !(l.medicine_id === medicineId && l.taken_date === date));
  }
  write(userId, 'logs', next);
}

export async function saveMedicine(
  userId: string,
  data: Omit<Medicine, 'id' | 'created_at'>,
  editingId?: string,
): Promise<void> {
  const medicines = read<Medicine[]>(userId, 'medicines', []);
  if (editingId) {
    write(
      userId,
      'medicines',
      medicines.map((m) => (m.id === editingId ? { ...m, ...data } : m)),
    );
  } else {
    const med: Medicine = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...data,
    };
    write(userId, 'medicines', [...medicines, med]);
  }
}

export async function deleteMedicine(userId: string, id: string): Promise<void> {
  write(
    userId,
    'medicines',
    read<Medicine[]>(userId, 'medicines', []).filter((m) => m.id !== id),
  );
  write(
    userId,
    'logs',
    read<IntakeLog[]>(userId, 'logs', []).filter((l) => l.medicine_id !== id),
  );
}

export async function saveCaregiver(
  userId: string,
  data: { name: string; relationship: string | null; phone: string },
  existingId?: string,
): Promise<void> {
  if (existingId) {
    const cg = read<Caregiver | null>(userId, 'caregiver', null);
    if (cg) write(userId, 'caregiver', { ...cg, ...data });
  } else {
    const cg: Caregiver = {
      id: crypto.randomUUID(),
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      created_at: new Date().toISOString(),
    };
    write(userId, 'caregiver', cg);
  }
}
