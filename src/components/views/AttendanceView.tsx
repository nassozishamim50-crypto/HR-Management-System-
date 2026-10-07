import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  Compass,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AttendanceView: React.FC = () => {
  const { attendance, currentUser, recordAttendance, employees } = useApp();

  const [selectedStation, setSelectedStation] = useState('Kampala HQ');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceRecord['status']>('Present');
  const [remarks, setRemarks] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const userTodayAttendance = attendance.find(
    (a) => a.employeeId === currentUser.id && a.date === today
  );
  const isCheckedIn = !!(userTodayAttendance?.checkInTime || userTodayAttendance?.checkIn) && !(userTodayAttendance?.checkOutTime || userTodayAttendance?.checkOut);

  const handlePunch = () => {
    recordAttendance(selectedStatus, 'Office', selectedStation, remarks);
    setRemarks('');
  };

  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const fieldWorkCount = attendance.filter((a) => (a.status as string) === 'Field Work' || a.workMode === 'Field').length;
  const travelCount = attendance.filter((a) => (a.status as string) === 'Official Travel' || (a.status as string) === 'Official Duty').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Punch Widget */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Daily Attendance & Field Duty Station Tracking</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track presence, field missions, official travel and remote work without expensive biometric hardware
            </p>
          </div>

          {/* Interactive Check-in / Out action card */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Kampala HQ">Kampala HQ</option>
              <option value="Gulu Field Base">Gulu Field Base</option>
              <option value="Moroto Karamoja Base">Moroto Karamoja Base</option>
              <option value="Arua Refugee Settlement Office">Arua Refugee Settlement Office</option>
              <option value="Jinja Office">Jinja Office</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Present">Present in Base</option>
              <option value="Field Work">Field Work / Mission</option>
              <option value="Official Travel">Official Travel</option>
              <option value="Remote Work">Remote Work</option>
            </select>

            <button
              onClick={handlePunch}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer ${
                isCheckedIn
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'btn-sct-primary'
              }`}
            >
              {isCheckedIn
                ? `Clock Out (${userTodayAttendance?.checkInTime})`
                : 'Clock In Now'}
            </button>
          </div>
        </div>

        {/* Attendance KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500">In Compound / Office</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">
              {presentCount} Staff
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Physical HQ and field base presence</div>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <div className="text-[11px] font-semibold text-emerald-800">Field Work & Community Missions</div>
            <div className="text-xl font-bold text-emerald-950 mt-0.5 tabular-nums">
              {fieldWorkCount} Staff
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Boreholes, settlements and outreaches</div>
          </div>
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <div className="text-[11px] font-semibold text-blue-800">Official Travel & Missions</div>
            <div className="text-xl font-bold text-blue-950 mt-0.5 tabular-nums">
              {travelCount} Staff
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5">District coordination & donor assemblies</div>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Attendance Register</h3>
            <span className="text-xs text-slate-400">({attendance.length} records)</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Date: {formatDate(today)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Duty Station</th>
                <th className="px-4 py-3">Check-In Time</th>
                <th className="px-4 py-3">Check-Out Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Field Coordinates & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{rec.employeeName}</span>
                    <span className="text-[11px] text-slate-500">{rec.jobTitle || rec.entity}</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{rec.dutyStation || rec.location || rec.entity}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {rec.checkInTime || rec.checkIn || '08:30'}
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-600">
                    {rec.checkOutTime || rec.checkOut || 'On Duty'}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        rec.status === 'Present'
                          ? 'bg-slate-100 text-slate-800'
                          : (rec.status as string) === 'Field Work' || rec.workMode === 'Field'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 max-w-sm">
                    {rec.locationCoordinates && (
                      <div className="font-mono text-[10px] text-slate-400">
                        {rec.locationCoordinates}
                      </div>
                    )}
                    <div className="text-[11px]">{rec.remarks || 'Standard duty'}</div>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No attendance records logged for today. Check-ins will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
