import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { COLLECTIONS, InAppNotification } from '../../services/firebaseService';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Calendar,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser || !isOpen) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: InAppNotification[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              recipientUid: data.recipientUid,
              title: data.title,
              message: data.message,
              type: data.type || 'info',
              read: data.read || false,
              createdAt: data.createdAt,
              link: data.link,
            });
          });
          setNotifications(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Notifications listener error:', err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Notifications setup error:', e);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    for (const n of notifications) {
      if (!n.read) {
        markAsRead(n.id);
      }
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'leave') return <Calendar className="w-4 h-4 text-amber-600" />;
    if (type === 'contract' || type === 'safeguarding') return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    return <Info className="w-4 h-4 text-[#0B1A30]" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0B1A30]" />
            <h3 className="font-extrabold text-[#0B1A30] text-sm">Notifications & Alerts</h3>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <span>No notifications at this time.</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-xs transition-all relative ${
                  n.read
                    ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                    : 'bg-white border-amber-400 shadow-2xs text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    {getIcon(n.type)}
                    <span>{n.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                        className="text-amber-600 hover:text-amber-800 p-0.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      title="Dismiss"
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed mb-1.5">
                  {n.message}
                </p>

                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  <span className="capitalize text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100">
                    {n.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
