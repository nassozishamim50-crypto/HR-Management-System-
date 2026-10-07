import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Organization, DUTY_STATIONS } from '../../types';
import {
  Settings,
  Building2,
  Plus,
  Check,
  Shield,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentOrg, updateOrganization, createOrganization, permissions, purgeDemoData } = useApp();

  const [formData, setFormData] = useState<Organization>({
    ...currentOrg,
    customFields: (currentOrg as any).customFields || [
      { id: 'cf-1', name: 'Uganda Allied Health Council Reg No.', type: 'text' },
      { id: 'cf-2', name: 'Ministry of Education Teacher Reg No.', type: 'text' },
      { id: 'cf-3', name: 'Safeguarding & PSEA Background Check ID', type: 'text' },
    ],
  });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'select'>('text');
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    acronym: '',
    regNumber: '',
    district: 'Kampala',
    currency: 'UGX' as 'UGX' | 'USD',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization(formData);
    alert('Organization configuration updated successfully!');
  };

  const handleAddCustomField = () => {
    if (!newFieldName) return;
    const newField = {
      id: `cf-${Date.now()}`,
      name: newFieldName,
      type: newFieldType,
    };
    const updated = {
      ...formData,
      customFields: [...(formData.customFields || []), newField],
    };
    setFormData(updated);
    updateOrganization(updated);
    setNewFieldName('');
  };

  const handleCreateNewOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgData.name || !newOrgData.acronym) return;

    const orgId = `org-${newOrgData.acronym.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newOrg: Organization = {
      id: orgId,
      name: newOrgData.name,
      acronym: newOrgData.acronym,
      regNumber: newOrgData.regNumber || 'PENDING-REG',
      headquarters: `${newOrgData.district} Operations Office, Uganda`,
      country: 'Uganda',
      district: newOrgData.district,
      address: `${newOrgData.district}, Uganda`,
      phone: '+256 414 000 000',
      email: `admin@${newOrgData.acronym.toLowerCase()}.org`,
      website: `https://${newOrgData.acronym.toLowerCase()}.org`,
      timezone: 'Africa/Kampala (EAT UTC+3)',
      currency: newOrgData.currency,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      leavePolicies: {
        annualLeaveDays: 24,
        sickLeaveDays: 14,
        maternityLeaveDays: 60,
        paternityLeaveDays: 7,
        fieldRRDays: 5,
      },
      customFields: [],
    };

    createOrganization(newOrg);
    setShowNewOrgModal(false);
    alert(`New workspace for [${newOrg.name}] created and activated!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Organization Configuration & Policies</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-organization workspace profile, legal NGO permits, currency, leave rules, and custom employee fields
            </p>
          </div>

          <button
            onClick={() => setShowNewOrgModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New NGO Workspace</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Institutional Identity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Institutional Identity</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Organization Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Acronym / Abbreviation *</label>
                  <input
                    type="text"
                    required
                    value={formData.acronym}
                    onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Uganda NGO Bureau Permit No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Headquarters District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Physical Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Telephone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currency, Timezone & Statutory Leave Rules */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Currency & Leave Entitlements</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Operational Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none font-bold"
                  >
                    <option value="UGX">UGX (Uganda Shillings)</option>
                    <option value="USD">USD (United States Dollars)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Timezone</label>
                  <input
                    type="text"
                    disabled
                    value={formData.timezone}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-800 text-xs mb-2">Annual Leave Entitlements (Days)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Annual Leave</label>
                    <input
                      type="number"
                      value={formData.leavePolicies.annualLeaveDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leavePolicies: { ...formData.leavePolicies, annualLeaveDays: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Sick Leave</label>
                    <input
                      type="number"
                      value={formData.leavePolicies.sickLeaveDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leavePolicies: { ...formData.leavePolicies, sickLeaveDays: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Field R&R (Hardship)</label>
                    <input
                      type="number"
                      value={formData.leavePolicies.fieldRRDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leavePolicies: { ...formData.leavePolicies, fieldRRDays: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Maternity Leave</label>
                    <input
                      type="number"
                      value={formData.leavePolicies.maternityLeaveDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leavePolicies: { ...formData.leavePolicies, maternityLeaveDays: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Paternity Leave</label>
                    <input
                      type="number"
                      value={formData.leavePolicies.paternityLeaveDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leavePolicies: { ...formData.leavePolicies, paternityLeaveDays: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Employee Fields Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Custom NGO Employee Fields</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Define specialized attributes needed for humanitarian operations (e.g. Refugee Settlement Passes, Blood Groups)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(formData.customFields || []).map((field: any) => (
              <div key={field.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{field.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">Type: {field.type}</div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>

          {/* Add custom field */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 text-xs">
            <input
              type="text"
              placeholder="New field label (e.g. UN Camp Clearance ID)"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            />
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none"
            >
              <option value="text">Text Field</option>
              <option value="number">Numeric Field</option>
              <option value="date">Date Field</option>
            </select>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors"
            >
              Add Field
            </button>
          </div>
        </div>

        {/* Official SCT Duty Stations & Branches */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Official SCT Duty Stations & Branches</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Designated operation bases and centers for personnel deployment across Uganda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DUTY_STATIONS.map((station, idx) => (
              <div key={station} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{station}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Official Branch #{idx + 1}</div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active Station
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Database Maintenance */}
        {permissions.canManageSettings && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-900">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>Production Database Integrity & Clean Status</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ensure the production database contains only authentic Special Children’s Trust records. This action permanently deletes any residual demo or placeholder employees and associated test records while preserving organizational settings and structure.
            </p>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Purge all demo and sample records from Special Children\'s Trust HR system?')) {
                  await purgeDemoData();
                  alert('All demo records have been successfully purged from the database.');
                }
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors border border-rose-200 text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Purge Demo & Sample Data</span>
            </button>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn-sct-primary px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Organization Settings</span>
          </button>
        </div>
      </form>

      {/* New Organization Workspace Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Provision New Isolated NGO Workspace
            </h3>
            <p className="text-slate-500 text-xs">
              Creates a dedicated, isolated workspace with independent departments, staff, contracts and policies.
            </p>

            <form onSubmit={handleCreateNewOrg} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karamoja Pastoralist Relief Alliance"
                  value={newOrgData.name}
                  onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Acronym *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KPRA"
                    value={newOrgData.acronym}
                    onChange={(e) => setNewOrgData({ ...newOrgData, acronym: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={newOrgData.district}
                    onChange={(e) => setNewOrgData({ ...newOrgData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Permit Number</label>
                  <input
                    type="text"
                    placeholder="INDR..."
                    value={newOrgData.regNumber}
                    onChange={(e) => setNewOrgData({ ...newOrgData, regNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Currency</label>
                  <select
                    value={newOrgData.currency}
                    onChange={(e) => setNewOrgData({ ...newOrgData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    <option value="UGX">UGX</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-sct-primary px-4 py-2 rounded-lg cursor-pointer"
                >
                  Create & Switch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
