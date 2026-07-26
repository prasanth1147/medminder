import { BellRing, BellOff } from 'lucide-react';
import {
  requestNotificationPermission,
  setNotificationsEnabled,
  notificationsGranted,
} from '@/hooks/useReminders';

interface NotificationBannerProps {
  onDismiss: () => void;
}

export default function NotificationBanner({ onDismiss }: NotificationBannerProps) {
  async function enable() {
    const ok = await requestNotificationPermission();
    if (ok) {
      setNotificationsEnabled(true);
      onDismiss();
    }
  }

  function dismissSilently() {
    // User declined notifications; sound alerts still work.
    setNotificationsEnabled(false);
    onDismiss();
  }

  return (
    <div className="card flex items-start gap-3 p-4 sm:p-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
        {notificationsGranted() ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-teal-900">Turn on reminder alerts</p>
        <p className="mt-0.5 text-sm text-teal-600">
          Get a browser notification and a gentle sound when it&apos;s time to take your medicine.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={enable} className="btn-primary">
            <BellRing className="h-4 w-4" /> Enable alerts
          </button>
          <button onClick={dismissSilently} className="btn-ghost">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
