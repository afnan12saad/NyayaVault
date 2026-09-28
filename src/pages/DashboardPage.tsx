import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCases, getAllDocuments, getAuditLogs } from '../services/dbService';
import { CaseRecord, DocumentRecord, AuditLogRecord } from '../types';
import { IntegrityBadge, DocumentStatusBadge, CaseStatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import {
  CaseFileIcon,
  DocumentIcon,
  StatutesIcon,
  VerificationStampIcon,
  AuditTrailIcon,
  UploadArchiveIcon,
  PlusFolioIcon,
  LockSealIcon,
  ArrowRightIcon
} from '../components/common/LegalIcons';

export const DashboardPage: React.FC = () => {
  const { userProfile, role, department } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, d, a] = await Promise.all([
          getCases(),
          getAllDocuments(),
          getAuditLogs()
        ]);
        setCases(c);
        setDocuments(d);
        setAuditLogs(a);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCasesCount = cases.filter(c => c.status !== 'Closed' && c.status !== 'Archived').length;
  const verifiedDocsCount = documents.filter(d => d.integrityStatus === 'VERIFIED').length;
  const pendingReviewsCount = documents.filter(d => d.status === 'UNDER REVIEW' || d.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Archival Folio Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#7A7368] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F263D]" />
            <span>MANDATE DISPATCH • {department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#191817] mt-1">
            Archival Registry Overview
          </h1>
          <p className="text-xs font-serif italic text-[#4A453E] mt-1">
            Authorized Jurist: <span className="font-sans font-semibold text-[#191817] not-italic">{userProfile?.fullName}</span> (Badge: <span className="font-mono text-[#6F263D]">{userProfile?.officerId}</span>) • Mandate: <strong className="text-[#191817] not-italic">{role}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {role !== 'VIEWER' && (
            <Link
              to="/upload"
              className="px-3.5 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs tracking-widest uppercase flex items-center gap-2 transition-colors border border-[#191817]"
            >
              <UploadArchiveIcon size={14} />
              <span>Lodge Record</span>
            </Link>
          )}

          {(role === 'SUPER ADMIN' || role === 'INVESTIGATING OFFICER') && (
            <Link
              to="/cases?action=create"
              className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#DDD6CA] text-[#191817] font-mono text-xs tracking-widest uppercase flex items-center gap-2 transition-colors"
            >
              <PlusFolioIcon size={14} />
              <span>Open Folio</span>
            </Link>
          )}

          <Link
            to="/verify"
            className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#DDD6CA] text-[#191817] font-mono text-xs tracking-widest uppercase flex items-center gap-2 transition-colors"
          >
            <VerificationStampIcon size={14} />
            <span>Cryptographic Check</span>
          </Link>
        </div>
      </div>

      {/* Primary Archival Ledger KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#7A7368] uppercase tracking-widest">Active Cases</div>
            <div className="text-3xl font-serif font-bold text-[#191817] mt-1">{activeCasesCount}</div>
            <div className="text-[11px] text-[#59534B] mt-1 font-serif italic">
              {cases.length} Total Case Folios
            </div>
          </div>
          <div className="w-11 h-11 border border-[#DDD6CA] bg-[#F3EFE6] flex items-center justify-center text-[#191817]">
            <CaseFileIcon size={20} />
          </div>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#7A7368] uppercase tracking-widest">Archived Records</div>
            <div className="text-3xl font-serif font-bold text-[#191817] mt-1">{documents.length}</div>
            <div className="text-[11px] text-[#59534B] mt-1 font-serif italic">
              Sealed & Indexed
            </div>
          </div>
          <div className="w-11 h-11 border border-[#DDD6CA] bg-[#F3EFE6] flex items-center justify-center text-[#191817]">
            <DocumentIcon size={20} />
          </div>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#7A7368] uppercase tracking-widest">Pending Review</div>
            <div className="text-3xl font-serif font-bold text-[#191817] mt-1">{pendingReviewsCount}</div>
            <div className="text-[11px] text-[#59534B] mt-1 font-serif italic">
              Awaiting Inquest Seal
            </div>
          </div>
          <div className="w-11 h-11 border border-[#DDD6CA] bg-[#F3EFE6] flex items-center justify-center text-[#6F263D]">
            <StatutesIcon size={20} />
          </div>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#7A7368] uppercase tracking-widest">Verified Intact</div>
            <div className="text-3xl font-serif font-bold text-[#191817] mt-1">{verifiedDocsCount}</div>
            <div className="text-[11px] text-[#59534B] mt-1 font-serif italic flex items-center gap-1">
              <span>SHA-256 Intact Proofs</span>
            </div>
          </div>
          <div className="w-11 h-11 border border-[#DDD6CA] bg-[#F3EFE6] flex items-center justify-center text-[#191817]">
            <VerificationStampIcon size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Case Folios & Document Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD6CA] pb-2">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#191817] flex items-center gap-2 font-bold">
              <span className="text-[#6F263D]">§ 01</span>
              <span>ACTIVE INVESTIGATION FOLIOS</span>
            </h2>
            <Link to="/cases" className="text-xs text-[#6F263D] hover:underline flex items-center gap-1 font-mono tracking-wider">
              <span>Full Archive</span>
              <ArrowRightIcon size={12} />
            </Link>
          </div>

          <div className="bg-[#FAF7F2] border border-[#DDD6CA] divide-y divide-[#EAE4D7] shadow-2xs">
            {cases.slice(0, 4).map((c) => (
              <div key={c.caseId} className="p-4 hover:bg-[#F3EFE6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#191817]">{c.caseId}</span>
                    <CaseStatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <Link
                    to={`/cases/${c.caseId}`}
                    className="font-serif font-bold text-base text-[#191817] hover:text-[#6F263D] transition-colors block"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-[#59534B] font-serif italic line-clamp-1">{c.description}</p>
                </div>
                <div className="text-left sm:text-right shrink-0 text-xs text-[#7A7368] font-mono">
                  <div>Assigned: {c.investigatingOfficer}</div>
                  <div className="text-[10px] text-[#8C8477] mt-0.5">
                    Updated: {new Date(c.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Documents Table */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDD6CA] pb-2">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#191817] flex items-center gap-2 font-bold">
                <span className="text-[#6F263D]">§ 02</span>
                <span>RECENTLY LODGED & SEALED RECORDS</span>
              </h2>
              <Link to="/documents" className="text-xs text-[#6F263D] hover:underline flex items-center gap-1 font-mono tracking-wider">
                <span>View Register</span>
                <ArrowRightIcon size={12} />
              </Link>
            </div>

            <div className="bg-[#FAF7F2] border border-[#DDD6CA] overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EFE6] text-[#191817] uppercase font-mono text-[10px] tracking-wider border-b border-[#DDD6CA]">
                  <tr>
                    <th className="py-2.5 px-3">Record Title</th>
                    <th className="py-2.5 px-3">Folio ID</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Submitting Officer</th>
                    <th className="py-2.5 px-3">Cryptographic Seal</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D7]">
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.documentId} className="hover:bg-[#F3EFE6]">
                      <td className="py-2.5 px-3">
                        <Link to={`/documents/${doc.documentId}`} className="font-serif font-bold text-sm text-[#191817] hover:text-[#6F263D]">
                          {doc.fileName}
                        </Link>
                        <div className="text-[10px] font-mono text-[#7A7368]">Folio Version: v{doc.version}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#191817]">{doc.caseId}</td>
                      <td className="py-2.5 px-3">
                        <DocumentStatusBadge status={doc.status} />
                      </td>
                      <td className="py-2.5 px-3 text-[#59534B] font-mono text-[11px]">{doc.uploadedBy}</td>
                      <td className="py-2.5 px-3">
                        <IntegrityBadge status={doc.integrityStatus} hash={doc.originalHash} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/documents/${doc.documentId}`}
                          className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#191817] hover:text-[#FAF7F2] text-[#191817] border border-[#DDD6CA] text-[10px] font-mono uppercase tracking-widest transition-colors inline-block"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Security Activity Stream & Statutory Guarantees */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD6CA] pb-2">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#191817] flex items-center gap-2 font-bold">
              <span className="text-[#6F263D]">§ 03</span>
              <span>AUDIT TRAIL LOG</span>
            </h2>
            <Link to="/audit" className="text-xs text-[#6F263D] hover:underline font-mono">
              All Entries →
            </Link>
          </div>

          <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-4 space-y-4 shadow-2xs">
            <div className="text-[10px] font-mono text-[#7A7368] uppercase tracking-widest pb-2 border-b border-[#DDD6CA] flex items-center justify-between">
              <span>Custody Operations</span>
              <span className="text-[#6F263D] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6F263D]" />
                Live Register
              </span>
            </div>

            <div className="space-y-3.5">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.logId} className="flex items-start gap-2.5 text-xs">
                  <div className="mt-1">
                    <span className="w-1.5 h-1.5 rounded-full block bg-[#191817]" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-[#191817]">{log.action}</span>
                      <span className="text-[10px] font-mono text-[#7A7368]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#59534B] text-[11px] truncate font-sans">{log.resourceName}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#7A7368] font-mono">
                      <span>{log.userName}</span>
                      <span className="font-semibold text-[#191817]">
                        {log.result}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Guarantees Panel */}
          <div className="p-4 bg-[#F3EFE6] border border-[#DDD6CA] space-y-3 text-xs">
            <div className="font-mono text-[#191817] uppercase tracking-widest font-bold flex items-center gap-2">
              <LockSealIcon size={14} className="text-[#6F263D]" />
              <span>Statutory Admissibility Proofs</span>
            </div>
            <ul className="space-y-2 text-[#4A453E] text-xs font-serif italic">
              <li className="flex items-start gap-2">
                <span className="text-[#6F263D] font-mono not-italic text-[10px] font-bold mt-0.5">§</span>
                <span>Records sealed at point-of-entry with client-side SHA-256 digests.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6F263D] font-mono not-italic text-[10px] font-bold mt-0.5">§</span>
                <span>Non-repudiable custodial timeline meets Indian Evidence Act § 65B standards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6F263D] font-mono not-italic text-[10px] font-bold mt-0.5">§</span>
                <span>Temporal sharing grants automatically expire with immediate revocation.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
