import { useEffect, useRef } from 'react';
import type { MedicineWithStatus } from '@/types';
import { nowMinutes, timeToMinutes, todayISO } from '@/lib/time';
import { playAlert } from '@/lib/sound';

interface UseRemindersProps {
  medicines: MedicineWithStatus[];
  onDue: (medicine: MedicineWithStatus) => void;
}

interface NotifPermission {
  granted: boolean;
  enabled: boolean;
}

let notifState: NotifPermission = {
  granted: typeof Notification !== 'undefined' && Notification.permission === 'granted',
  enabled: true,
};

/**
 * Fires a browser notification + sound when a medicine's scheduled time is
 * reached and it hasn't been marked as taken. Checks once per minute and also
 * catches any due time that passed while the tab was inactive.
 */
export function useReminders({ medicines, onDue }: UseRemindersProps) {
  const firedRef = useRef<Set<string>>(new Set()); // key: `${medicineId}|${date}`

  useEffect(() => {
    function fire(med: MedicineWithStatus) {
      const key = `${med.id}|${todayISO()}`;
      if (firedRef.current.has(key)) return;
      if (med.takenToday) return;
      firedRef.current.add(key);

      if (notifState.granted && notifState.enabled) {
        try {
          new Notification('Time to take your medicine', {
            body: `${med.name} — ${med.dosage}`,
            icon: '/favicon.ico',
            tag: key,
          });
        } catch {
          // Some browsers require a service worker; fall back to sound only.
        }
      }
      playAlert();
      onDue(med);
    }

    function tick() {
      const now = nowMinutes();
      const todayIdx = new Date().getDay();
      medicines.forEach((med) => {
        if (med.takenToday) return;
        if (med.frequency === 'weekly' && med.day_of_week !== todayIdx) return;
        const due = timeToMinutes(med.time);
        // Fire within the reminder minute, or immediately if the time already
        // passed while the tab was closed (only for the current session catch-up).
        if (now === due || (now > due && now <= due + 1)) {
          fire(med);
        }
      });
    }

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicines]);

  // Reset fired set at midnight rollover is handled by date in the key.
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') {
    notifState = { ...notifState, granted: true };
    return true;
  }
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  notifState = { ...notifState, granted: result === 'granted' };
  return result === 'granted';
}

export function setNotificationsEnabled(enabled: boolean) {
  notifState = { ...notifState, enabled };
}

export function notificationsGranted(): boolean {
  return notifState.granted;
}
