import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  ShieldAlert,
  Share2
} from 'lucide-react';
import { getAllDocuments, getAuditLogs } from '../services/dbService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../services/dbService';
import { DocumentRecord, AuditLogRecord, DocumentShareRecord } from '../types';

export const CompliancePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [shares, setShares] = useState<DocumentShareRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, logs, sharesSnap] = await Promise.all([
          getAllDocuments(),
          getAuditLogs(),
          getDocs(collection(db, COLLECTIONS.DOCUMENT_SHARES))
        ]);
        setDocuments(docs);
        setAuditLogs(logs);
        setShares(sharesSnap.docs.map(d => ({ ...d.data(), id: d.id } as DocumentShareRecord)));
      } catch (err) {
        console.error('Failed to load compliance data:', err);
      }
    }
    loadData();
  }, []);

  const pendingVerificationDocs = documents.filter(d => d.integrityStatus !== 'VERIFIED');
  const integrityWarningDocs = documents.filter(d => d.integrityStatus === 'INTEGRITY_WARNING');
  const missingMetadataDocs = documents.filter(d => !d.summary || d.tags?.length === 0);
  const expiringShares = shares.filter(s => !s.revoked && new Date(s.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const failedAccessAttempts = auditLogs.filter(l => l.result === 'DENIED' || l.result === 'FAILED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D7DFE4]">
        <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
          Judicial & Regulatory Oversight
        </div>
        <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-[#29323A]" />
          <span>Statutory Compliance & Risk Dashboard</span>
        </h1>
        <p className="text-xs text-[#5C6A76] mt-1">
          Monitor chain-of-custody lapses, checksum discrepancies, metadata omissions, and unauthorized permission attempts.
        </p>
      </div>

      {/* Compliance Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded bg-white border border-[#D7DFE4] shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Documents Requiring Review</span>
          <div className="text-3xl font-bold font-mono text-[#29323A] mt-1">
            {pendingVerificationDocs.length}
          </div>
          <p className="text-[11px] text-[#5C6A76] mt-1">Pending verification</p>
        </div>

        <div className="p-5 rounded bg-white border border-[#D7DFE4] shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Expiring Shared Access</span>
          <div className="text-3xl font-bold font-mono text-[#29323A] mt-1">
            {expiringShares.length}
          </div>
          <p className="text-[11px] text-[#5C6A76] mt-1">Within 7 calendar days</p>
        </div>

        <div className="p-5 rounded bg-white border border-[#D7DFE4] shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Integrity Warnings</span>
          <div className="text-3xl font-bold font-mono text-[#29323A] mt-1">
            {integrityWarningDocs.length}
          </div>
          <p className="text-[11px] text-[#5C6A76] mt-1">Critical checksum discrepancies</p>
        </div>

        <div className="p-5 rounded bg-white border border-[#D7DFE4] shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Missing Metadata Records</span>
          <div className="text-3xl font-bold font-mono text-[#5C6A76] mt-1">
            {missingMetadataDocs.length}
          </div>
          <p className="text-[11px] text-[#5C6A76] mt-1">Requires entity tagging</p>
        </div>
      </div>

      {/* Compliance Risk Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Access Attempts */}
        <div className="p-5 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EBEE]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#29323A]" />
              <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
                Failed Access & Clearance Breaches ({failedAccessAttempts.length})
              </h2>
            </div>
            <span className="text-[10px] text-[#8695A2] font-mono">Real-Time</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto divide-y divide-[#E7EBEE] text-xs">
            {failedAccessAttempts.length === 0 ? (
              <div className="p-6 text-center text-[#6A7885]">
                ✓ Zero failed access attempts or unauthorized permission violations recorded.
              </div>
            ) : (
              failedAccessAttempts.map(l => (
                <div key={l.logId} className="pt-2.5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#29323A] font-mono">{l.action}</div>
                    <p className="text-[#5C6A76]">{l.resourceName}</p>
                    <div className="text-[10px] text-[#8695A2] font-mono">By {l.userName} ({l.userRole})</div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#6A7885]">
                    <div>{new Date(l.timestamp).toLocaleDateString()}</div>
                    <div className="text-[#29323A] font-bold">{l.result}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Shares Table */}
        <div className="p-5 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EBEE]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#29323A]" />
              <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
                Expiring Shared Access Grants ({expiringShares.length})
              </h2>
            </div>
            <Link to="/shares" className="text-xs text-[#29323A] hover:underline font-semibold">
              Manage →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs">
            {expiringShares.length === 0 ? (
              <div className="p-6 text-center text-[#6A7885]">
                No active document shares expiring within the next 7 days.
              </div>
            ) : (
              expiringShares.map(s => (
                <div key={s.shareId} className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-1">
                  <div className="flex items-center justify-between font-semibold text-[#29323A]">
                    <span>{s.documentName}</span>
                    <span className="text-[#29323A] font-mono text-[10px]">
                      Expires: {new Date(s.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5C6A76]">
                    Recipient: <strong className="text-[#29323A]">{s.recipientTarget}</strong> ({s.permission})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
