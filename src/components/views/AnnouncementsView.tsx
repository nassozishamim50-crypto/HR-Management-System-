import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HRAnnouncement, TrustEntity } from '../../types';
import {
  Bell,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  User,
  Building2,
  Search,
  Filter,
  CheckCircle,
  Pin,
  Sparkles,
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    selectedEntityFilter,
    entities,
    currentUser,
    permissions,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);

  // New notice form
  const [form, setForm] = useState({
    title: '',
    entity: 'All Entities' as TrustEntity | 'All Entities',
    category: 'General' as 'Safeguarding' | 'Policy' | 'Health & Safety' | 'General' | 'Training',
    content: '',
    isImportant: false,
  });

  const categories = ['all', 'Safeguarding', 'Policy', 'Health & Safety', 'General', 'Training'];

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesEntity =
      selectedEntityFilter === 'All Entities' ||
      a.entity === 'All Entities' ||
      a.entity === selectedEntityFilter;
    const matchesCategory =
      selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      `${a.title} ${a.content} ${a.author}`.toLowerCase().includes(search.toLowerCase());
    return matchesEntity && matchesCategory && matchesSearch;
  });

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    addAnnouncement({
      title: form.title,
      entity: form.entity,
      category: form.category as any,
      content: form.content,
      isImportant: form.isImportant,
    });
    setIsAddNoticeOpen(false);
    setForm({
      title: '',
      entity: 'All Entities',
      category: 'General',
      content: '',
      isImportant: false,
    });
  };

  const getCategoryBadge = (cat: string, isImportant: boolean) => {
    if (isImportant || cat === 'Safeguarding') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Safeguarding / Urgent</span>
        </span>
      );
    }
    if (cat === 'Health & Safety') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Health & Safety</span>
        </span>
      );
    }
    if (cat === 'Policy') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <span>Official HR Policy</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <span>{cat}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B1A30] mb-1">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Internal Communications & Governance</span>
            </div>
            <h1 className="text-2xl font-black text-[#0B1A30]">
              Special Children's Trust HR Notice Board
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Official circulars, safeguarding updates, health bulletins, and trust announcements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {permissions.canManageAnnouncements && (
              <button
                onClick={() => setIsAddNoticeOpen(true)}
                className="btn-sct-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Notice</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and search */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars, directives, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                  selectedCategory === c
                    ? 'bg-[#0B1A30] text-amber-400 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? 'All Notices' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>No notices found matching current search or filters.</p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
                item.isImportant
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {getCategoryBadge(item.category, !!item.isImportant)}
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                    {item.entity}
                  </span>
                  {item.isImportant && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                      <Pin className="w-3 h-3" />
                      <span>Pinned Priority</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.publishedDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.author}</span>
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {item.title}
              </h3>

              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {item.content}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Special Children's Trust Official HR Directive</span>
                <span className="text-emerald-700 font-medium">Compliance Mandatory for all Target Entities</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Publish Notice */}
      {isAddNoticeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Publish Official HR Circular
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Disseminate policy notices, safeguarding bulletins, or administrative alerts to staff.
            </p>

            <form onSubmit={handleSubmitNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory PSEA Annual Re-Certification Drive 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Entity
                  </label>
                  <select
                    value={form.entity}
                    onChange={(e) => setForm({ ...form, entity: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                  >
                    <option value="All Entities">All Entities (Trust-Wide)</option>
                    {entities.map((ent) => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notice Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Safeguarding">Safeguarding & Child Protection</option>
                    <option value="Health & Safety">Health & Clinical Safety</option>
                    <option value="Policy">HR Policy</option>
                    <option value="Training">Training & Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Content & Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="State the guidelines, timelines, contact person, and compliance directives..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={form.isImportant}
                  onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
                  className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-800"
                />
                <label htmlFor="isImportant" className="text-xs font-semibold text-slate-700">
                  Mark as High Priority / Pin to Top of Notice Board
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-sct-primary px-4 py-2 text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
