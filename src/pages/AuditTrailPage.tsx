import React, { useState, useEffect } from 'react';
import {
  History,
  Search
} from 'lucide-react';
import { getAuditLogs } from '../services/dbService';
import { AuditLogRecord } from '../types';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      (l.caseId && l.caseId.toLowerCase().includes(search.toLowerCase())) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchesResult = resultFilter === 'ALL' || l.result === resultFilter;

    return matchesSearch && matchesAction && matchesResult;
  });

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const dateKey = new Date(log.timestamp).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, AuditLogRecord[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D7DFE4]">
        <div>
          <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
            Immutable Activity Ledger
          </div>
          <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-[#29323A]" />
            <span>Forensic Audit Trail & Timeline</span>
          </h1>
          <p className="text-xs text-[#5C6A76] mt-1">
            Tamper-proof record of every document upload, viewing, cryptographic verification, sharing, and case alteration.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#CBD4DA] rounded self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded transition-colors ${
              viewMode === 'timeline'
                ? 'bg-[#29323A] text-white font-semibold'
                : 'text-[#5C6A76] hover:text-[#29323A]'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded transition-colors ${
              viewMode === 'table'
                ? 'bg-[#29323A] text-white font-semibold'
                : 'text-[#5C6A76] hover:text-[#29323A]'
            }`}
          >
            Table Register
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded border border-[#D7DFE4] text-xs shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, resource, details..."
            className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 pl-9 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8695A2]" />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
        >
          <option value="ALL">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
          <option value="DOCUMENT_VIEW">DOCUMENT_VIEW</option>
          <option value="DOCUMENT_DOWNLOAD">DOCUMENT_DOWNLOAD</option>
          <option value="DOCUMENT_VERIFY">DOCUMENT_VERIFY</option>
          <option value="DOCUMENT_SHARE">DOCUMENT_SHARE</option>
          <option value="DOCUMENT_VERSION_CREATE">DOCUMENT_VERSION_CREATE</option>
          <option value="CASE_CREATE">CASE_CREATE</option>
          <option value="EVIDENCE_TRANSFER">EVIDENCE_TRANSFER</option>
        </select>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
        >
          <option value="ALL">All Outcomes</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="DENIED">DENIED</option>
          <option value="WARNING">WARNING</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#6A7885]">Loading audit trail...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D7DFE4] rounded text-[#6A7885] text-xs">
          No audit entries match filter parameters.
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="space-y-6 bg-white border border-[#D7DFE4] rounded p-6 shadow-2xs">
          {Object.entries(groupedLogs).map(([dateLabel, dateLogs]) => (
            <div key={dateLabel} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#29323A] px-3 py-1 rounded bg-[#E7EBEE] border border-[#CBD4DA]">
                  {dateLabel}
                </span>
                <div className="h-[1px] flex-1 bg-[#E7EBEE]" />
              </div>

              <div className="relative pl-6 border-l-2 border-[#CBD4DA] ml-3 space-y-4">
                {dateLogs.map((log) => (
                  <div key={log.logId} className="relative text-xs space-y-1">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#29323A] border-2 border-white" />

                    <div className="flex flex-wrap items-center justify-between font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#29323A] font-semibold">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[#29323A] font-bold">{log.action}</span>
                        <span className="text-[#A0AEBA]">•</span>
                        <span className="text-[#5C6A76]">{log.userName} ({log.userRole})</span>
                      </div>
                      <span className="font-semibold text-[#29323A]">
                        {log.result}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] text-[#29323A]">
                      <div className="font-semibold text-[#29323A] flex items-center justify-between">
                        <span>{log.resourceName}</span>
                        {log.caseId && (
                          <span className="text-[#29323A] font-mono text-[10px]">
                            Case: {log.caseId}
                          </span>
                        )}
                      </div>
                      <p className="text-[#5C6A76] text-[11px] mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#D7DFE4] rounded overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E7EBEE] text-[#29323A] uppercase font-mono text-[10px] border-b border-[#D7DFE4]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Officer / User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">IP / Gateway</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBEE] font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-[#F4F6F8]">
                  <td className="py-2.5 px-4 text-[#5C6A76]">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-4 text-[#29323A]">
                    <div className="font-semibold">{log.userName}</div>
                    <span className="text-[10px] text-[#6A7885]">{log.userRole}</span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#29323A]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 text-[#5C6A76] max-w-xs truncate">
                    {log.resourceName}
                  </td>
                  <td className="py-2.5 px-4 text-[#29323A] font-semibold">
                    {log.caseId || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-[#8695A2] text-[10px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA]">
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
