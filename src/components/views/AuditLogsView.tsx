import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../services/firebaseService';
import { AuditLog } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { currentRole, authUser, setIsAuthModalOpen } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.AUDIT_LOGS),
        orderBy('timestamp', 'desc'),
        limit(150)
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const loaded: AuditLog[] = [];
          snap.forEach((doc) => {
            loaded.push({ id: doc.id, ...(doc.data() as any) });
          });
          setLogs(loaded);
          setLoading(false);
        },
        (err) => {
          console.error('Audit logs subscription error:', err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  const categories = ['all', 'Auth', 'Employee', 'Leave', 'Document', 'Security', 'Department', 'System'];

  const filteredLogs = logs.filter((log) => {
    const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSearch =
      search === '' ||
      `${log.action} ${log.details} ${log.actorName} ${log.actorEmail} ${log.targetResource}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!authUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-2xs my-12">
        <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Administrator Authentication Required</h2>
        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          The Audit Trail is protected by Firestore Security Rules. Only authenticated System Administrators can inspect immutable security event records.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
              <Lock className="w-4 h-4" />
              <span>Immutable Governance & Compliance Assurance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tamper-Resistant Security Audit Trail
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Cryptographically enforced write-only audit logs recording authentication, employee lifecycle mutations, leave decisions, and credential access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Zero-Delete Firestore Rules Enforced</span>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions, operators, emails, resource IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800 bg-slate-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  categoryFilter === c
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? 'All Events' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor / Responsible User</th>
                <th className="py-3 px-4">Details & Mutation Scope</th>
                <th className="py-3 px-4">Security Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading cryptographic logs from Cloud Firestore...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No security events recorded yet under current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.category === 'Auth'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : log.category === 'Employee'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.category === 'Security'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.actorName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.actorEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      {log.details}
                      {log.targetResource && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Target: {log.targetResource} {log.targetId ? `(${log.targetId})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" /> Immutable
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
