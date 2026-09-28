import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCaseById,
  getDocumentsByCase,
  getEvidenceByCase,
  getAuditLogs,
  updateCaseStatus
} from '../services/dbService';
import { CaseRecord, DocumentRecord, EvidenceRecord, AuditLogRecord, CaseStatus } from '../types';
import { CaseStatusBadge, PriorityBadge, IntegrityBadge, DocumentStatusBadge } from '../components/common/StatusBadge';
import {
  CaseFileIcon,
  DocumentIcon,
  EvidenceBoxIcon,
  AuditTrailIcon,
  ShareGrantIcon,
  LegalInsightsIcon,
  UploadArchiveIcon,
  ChevronRightIcon,
  PlusFolioIcon,
  AlertWarningIcon,
  LockSealIcon,
  VerificationStampIcon
} from '../components/common/LegalIcons';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile, role } = useAuth();
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'evidence' | 'activity' | 'access' | 'timeline'>('overview');

  // AI Summary State
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCaseWorkspace() {
      if (!id) return;
      try {
        const [c, docs, evs, logs] = await Promise.all([
          getCaseById(id),
          getDocumentsByCase(id),
          getEvidenceByCase(id),
          getAuditLogs(id)
        ]);
        setCaseData(c);
        setDocuments(docs);
        setEvidence(evs);
        setAuditLogs(logs);
      } catch (err) {
        console.error('Error loading case detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCaseWorkspace();
  }, [id]);

  const handleGenerateAiSummary = async () => {
    if (!caseData) return;
    setGeneratingAiSummary(true);
    setAiSummaryError(null);
    try {
      const res = await fetch('/api/ai/case-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData,
          documents
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data);
      } else {
        setAiSummaryError(data.error || 'Failed to synthesize case summary.');
      }
    } catch (err: any) {
      setAiSummaryError(err?.message || 'Error communicating with AI analysis engine.');
    } finally {
      setGeneratingAiSummary(false);
    }
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!caseData || !userProfile) return;
    await updateCaseStatus(caseData.caseId, newStatus, userProfile);
    setCaseData(prev => prev ? { ...prev, status: newStatus } : null);
  };

  if (loading) {
    return <div className="p-12 text-center text-xs font-mono text-[#7A7368] uppercase tracking-widest">Inspecting archival case records...</div>;
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center bg-[#FAF7F2] border border-[#DDD6CA] text-[#7A7368] text-xs font-serif italic">
        Case folio not found or security clearance denied under active jurisdictional rules.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#7A7368]">
        <Link to="/cases" className="hover:text-[#191817] uppercase tracking-wider">Case Register</Link>
        <ChevronRightIcon size={12} className="text-[#A89F91]" />
        <span className="text-[#191817] font-semibold">{caseData.caseId}</span>
      </div>

      {/* Case Header Card */}
      <div className="p-6 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#191817] bg-[#F3EFE6] px-2 py-0.5 border border-[#DDD6CA] tracking-wider">
                FOLIO REF: {caseData.caseId}
              </span>
              <CaseStatusBadge status={caseData.status} />
              <PriorityBadge priority={caseData.priority} />
              <span className="text-xs font-mono text-[#7A7368]">• {caseData.department}</span>
            </div>

            <h1 className="text-3xl font-serif text-[#191817]">
              {caseData.title}
            </h1>

            <p className="text-xs font-serif italic text-[#4A453E] max-w-4xl leading-relaxed">
              {caseData.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#7A7368] pt-1">
              <span>Supervising Jurist: <strong className="text-[#191817]">{caseData.investigatingOfficer}</strong></span>
              <span>•</span>
              <span>Lodged Date: {new Date(caseData.createdDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick status updater & actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 items-start lg:items-end">
            {(role === 'SUPER ADMIN' || role === 'INVESTIGATING OFFICER') && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7368]">Mandate:</span>
                <select
                  value={caseData.status}
                  onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                  className="bg-[#F3EFE6] border border-[#DDD6CA] text-[#191817] text-xs px-2.5 py-1 focus:outline-none focus:border-[#191817] font-mono uppercase"
                >
                  <option value="Open">Open</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Closed">Closed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            )}

            {role !== 'VIEWER' && (
              <Link
                to={`/upload?caseId=${caseData.caseId}`}
                className="px-3.5 py-1.5 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 border border-[#191817]"
              >
                <UploadArchiveIcon size={14} />
                <span>Lodge Document</span>
              </Link>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mt-6 pt-4 border-t border-[#DDD6CA] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left font-mono">
          <div className="p-3 bg-[#F3EFE6] border border-[#DDD6CA]">
            <div className="text-[9px] uppercase tracking-widest text-[#7A7368]">RECORDS FILED</div>
            <div className="text-2xl font-serif font-bold text-[#191817] mt-0.5">{documents.length}</div>
          </div>
          <div className="p-3 bg-[#F3EFE6] border border-[#DDD6CA]">
            <div className="text-[9px] uppercase tracking-widest text-[#7A7368]">EVIDENTIARY EXHIBITS</div>
            <div className="text-2xl font-serif font-bold text-[#191817] mt-0.5">{evidence.length}</div>
          </div>
          <div className="p-3 bg-[#F3EFE6] border border-[#DDD6CA]">
            <div className="text-[9px] uppercase tracking-widest text-[#7A7368]">AUDIT ACTIVITIES</div>
            <div className="text-2xl font-serif font-bold text-[#191817] mt-0.5">{auditLogs.length}</div>
          </div>
          <div className="p-3 bg-[#F3EFE6] border border-[#DDD6CA]">
            <div className="text-[9px] uppercase tracking-widest text-[#7A7368]">VERIFIED INTACT</div>
            <div className="text-2xl font-serif font-bold text-[#191817] mt-0.5">
              {documents.filter(d => d.integrityStatus === 'VERIFIED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#DDD6CA] flex gap-2 overflow-x-auto text-xs font-mono uppercase tracking-wider">
        {[
          { key: 'overview', label: 'Briefing & AI Synthesis', icon: LegalInsightsIcon },
          { key: 'documents', label: `Documents (${documents.length})`, icon: DocumentIcon },
          { key: 'evidence', label: `Evidence (${evidence.length})`, icon: EvidenceBoxIcon },
          { key: 'activity', label: `Audit Log (${auditLogs.length})`, icon: AuditTrailIcon },
          { key: 'access', label: 'Jurisdiction Access', icon: ShareGrantIcon },
          { key: 'timeline', label: 'Milestone Timeline', icon: CaseFileIcon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#6F263D] text-[#191817] bg-[#F3EFE6] font-bold'
                  : 'border-transparent text-[#7A7368] hover:text-[#191817]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Case Summary Module */}
          <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 border border-[#DDD6CA] bg-[#F3EFE6] flex items-center justify-center text-[#6F263D]">
                  <LegalInsightsIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[#191817] font-bold flex items-center gap-2">
                    <span>AI Case Intelligence Synthesis</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#F3EFE6] text-[#6F263D] border border-[#DDD6CA]">
                      GEMINI-3.8 FLASH
                    </span>
                  </h3>
                  <p className="text-[11px] font-serif italic text-[#4A453E]">
                    Synthesizes authorized case documents, key dates, forensic findings, and pending investigation steps.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAiSummary}
                disabled={generatingAiSummary}
                className="px-4 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5 self-start sm:self-auto border border-[#191817]"
              >
                <LegalInsightsIcon size={13} />
                <span>{generatingAiSummary ? 'Analyzing Case Records...' : 'Synthesize Case Brief'}</span>
              </button>
            </div>

            {aiSummaryError && (
              <div className="p-3 bg-[#F7EFF1] border border-[#E5CCD4] text-[#6F263D] text-xs flex items-center gap-2 font-mono">
                <AlertWarningIcon size={14} />
                <span>{aiSummaryError}</span>
              </div>
            )}

            {aiSummary && (
              <div className="mt-4 pt-4 border-t border-[#DDD6CA] space-y-4 text-xs">
                <div className="p-4 bg-[#F3EFE6] border border-[#DDD6CA] text-[#191817] leading-relaxed">
                  <span className="text-[#6F263D] font-mono text-[10px] tracking-widest uppercase font-bold block mb-1">
                    § Executive Juridical Brief:
                  </span>
                  <p className="font-serif text-sm italic">{aiSummary.caseOverview}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F3EFE6] border border-[#DDD6CA] space-y-1.5">
                    <span className="font-mono text-[10px] uppercase text-[#7A7368] font-bold tracking-widest block">
                      Key Evidentiary Documents:
                    </span>
                    <ul className="list-disc list-inside space-y-1 font-serif text-xs text-[#4A453E]">
                      {aiSummary.keyDocuments?.map((doc: string, idx: number) => (
                        <li key={idx} className="line-clamp-1">{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-[#F3EFE6] border border-[#DDD6CA] space-y-1.5">
                    <span className="font-mono text-[10px] uppercase text-[#7A7368] font-bold tracking-widest block">
                      Critical Procedural Dates:
                    </span>
                    <ul className="list-disc list-inside space-y-1 font-mono text-xs text-[#4A453E]">
                      {aiSummary.importantDates?.map((dt: string, idx: number) => (
                        <li key={idx}>{dt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-[#F3EFE6] border border-[#DDD6CA] space-y-1.5">
                  <span className="font-mono text-[10px] uppercase text-[#6F263D] font-bold tracking-widest block">
                    Outstanding Procedural Inquiries:
                  </span>
                  <ul className="list-disc list-inside space-y-1 font-serif italic text-xs text-[#4A453E]">
                    {aiSummary.outstandingDocuments?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="p-2.5 bg-[#FAF7F2] border border-[#DDD6CA] text-[10px] text-[#7A7368] font-mono text-center">
                  ARCHIVAL NOTICE: AI-generated synthesis. Must be cross-referenced with source-sealed records prior to courtroom submission.
                </div>
              </div>
            )}
          </div>

          {/* Case Metadata Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] space-y-3 shadow-2xs">
              <h4 className="text-xs font-mono uppercase text-[#191817] font-bold tracking-widest">
                Case Classification & Jurisdiction
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#EAE4D7]">
                  <span className="text-[#7A7368]">Department:</span>
                  <span className="font-semibold text-[#191817]">{caseData.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE4D7]">
                  <span className="text-[#7A7368]">Classification:</span>
                  <span className="font-semibold text-[#191817]">{caseData.caseType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE4D7]">
                  <span className="text-[#7A7368]">Filing Date:</span>
                  <span className="font-mono text-[#191817]">{new Date(caseData.createdDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#7A7368]">Security Indexing:</span>
                  <div className="flex flex-wrap gap-1">
                    {caseData.tags?.map(t => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F3EFE6] text-[#191817] border border-[#DDD6CA]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] space-y-3 shadow-2xs">
              <h4 className="text-xs font-mono uppercase text-[#191817] font-bold tracking-widest">
                Investigation Supervision
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#EAE4D7]">
                  <span className="text-[#7A7368]">Supervising Jurist:</span>
                  <span className="font-semibold text-[#191817]">{caseData.investigatingOfficer}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE4D7]">
                  <span className="text-[#7A7368]">Procedural Mandate:</span>
                  <CaseStatusBadge status={caseData.status} />
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE4D7]">
                  <span className="text-[#7A7368]">Case Priority:</span>
                  <PriorityBadge priority={caseData.priority} />
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#7A7368]">Last Ledger Activity:</span>
                  <span className="font-mono text-[#191817]">{new Date(caseData.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-[#191817]">
              Secured Case Records ({documents.length})
            </h3>
            {role !== 'VIEWER' && (
              <Link
                to={`/upload?caseId=${caseData.caseId}`}
                className="px-3 py-1.5 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 border border-[#191817]"
              >
                <PlusFolioIcon size={13} />
                <span>Lodge Document</span>
              </Link>
            )}
          </div>

          <div className="bg-[#FAF7F2] border border-[#DDD6CA] overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFE6] text-[#191817] uppercase font-mono text-[10px] tracking-wider border-b border-[#DDD6CA]">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Record Type</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Submitting Officer</th>
                  <th className="py-2.5 px-3">Integrity Digest</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7A7368] font-serif italic">
                      No documents associated with this case folio yet.
                    </td>
                  </tr>
                ) : (
                  documents.map(d => (
                    <tr key={d.documentId} className="hover:bg-[#F3EFE6]">
                      <td className="py-2.5 px-3">
                        <Link to={`/documents/${d.documentId}`} className="font-serif font-bold text-sm text-[#191817] hover:text-[#6F263D]">
                          {d.fileName}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-[#59534B]">{d.documentType}</td>
                      <td className="py-2.5 px-3 font-mono text-[#191817] font-semibold">v{d.version}</td>
                      <td className="py-2.5 px-3 text-[#59534B] font-mono text-[11px]">{d.uploadedBy}</td>
                      <td className="py-2.5 px-3">
                        <IntegrityBadge status={d.integrityStatus} hash={d.originalHash} />
                      </td>
                      <td className="py-2.5 px-3">
                        <DocumentStatusBadge status={d.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/documents/${d.documentId}`}
                          className="px-2 py-1 bg-[#FAF7F2] hover:bg-[#191817] hover:text-[#FAF7F2] text-[#191817] border border-[#DDD6CA] text-[10px] font-mono uppercase tracking-widest transition-colors inline-block"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-[#191817]">
              Physical & Digital Exhibits ({evidence.length})
            </h3>
            <Link
              to="/evidence"
              className="text-xs text-[#6F263D] hover:underline font-mono uppercase tracking-wider"
            >
              Custody Registry →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidence.length === 0 ? (
              <div className="p-8 col-span-2 text-center text-[#7A7368] text-xs bg-[#FAF7F2] border border-[#DDD6CA] font-serif italic">
                No physical or digital exhibits cataloged under this case folio yet.
              </div>
            ) : (
              evidence.map(e => (
                <div key={e.evidenceId} className="p-4 bg-[#FAF7F2] border border-[#DDD6CA] space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-[#191817]">{e.evidenceId}</span>
                    <span className="px-2 py-0.5 bg-[#F3EFE6] text-[#191817] border border-[#DDD6CA] text-[10px] font-semibold uppercase">
                      {e.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#191817]">{e.description}</h4>
                  <div className="text-[11px] text-[#59534B] space-y-1 pt-1 border-t border-[#EAE4D7] font-sans">
                    <div>Type: <span className="text-[#191817] font-semibold">{e.evidenceType}</span></div>
                    <div>Depository: <span className="text-[#191817]">{e.location}</span></div>
                    <div>Authorized Custodian: <strong className="text-[#191817]">{e.currentCustodian}</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY (AUDIT LOGS) */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-[#191817]">
            Case Activity Audit Trail ({auditLogs.length} Events)
          </h3>

          <div className="bg-[#FAF7F2] border border-[#DDD6CA] divide-y divide-[#EAE4D7] shadow-2xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-[#7A7368] text-xs font-serif italic">
                No events recorded for this case folio yet.
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log.logId} className="p-3.5 hover:bg-[#F3EFE6] flex items-start justify-between gap-4 text-xs transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#191817] font-mono">{log.action}</span>
                      <span className="text-[10px] text-[#7A7368] font-mono">• {log.userName} ({log.userRole})</span>
                    </div>
                    <p className="text-[#4A453E] text-[11px] font-serif italic">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[10px] text-[#7A7368]">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ACCESS */}
      {activeTab === 'access' && (
        <div className="space-y-4 text-xs">
          <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-[#191817]">
            Compartmentalized Jurisdictional Access
          </h3>
          <div className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] space-y-4 shadow-2xs">
            <p className="text-[#4A453E] font-serif text-sm italic leading-relaxed">
              This case is assigned to <strong>{caseData.department}</strong>. In accordance with NyayaVault security rules, only authorized officers within this department and users with explicit share grants may view confidential filings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#F3EFE6] border border-[#DDD6CA]">
                <span className="text-[#7A7368] font-mono text-[10px] uppercase tracking-wider">Default Read Access</span>
                <div className="font-bold text-[#191817] mt-1 font-serif text-base">{caseData.department}</div>
              </div>
              <div className="p-3 bg-[#F3EFE6] border border-[#DDD6CA]">
                <span className="text-[#7A7368] font-mono text-[10px] uppercase tracking-wider">Supervisory Clearance</span>
                <div className="font-bold text-[#191817] mt-1 font-serif text-base">Super Admin & Lead Investigator</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-[#191817]">
            Milestone Chronology & Custodial Deeds
          </h3>

          <div className="relative pl-6 border-l-2 border-[#DDD6CA] space-y-6">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 bg-[#6F263D] border-2 border-[#FAF7F2]" />
              <div className="text-xs font-bold text-[#191817] font-mono">
                {new Date(caseData.createdDate).toLocaleDateString()}
              </div>
              <div className="font-serif font-bold text-base text-[#191817] mt-0.5">
                Case Initiated & Sealed Under Jurisdictional Authority
              </div>
              <p className="text-xs text-[#59534B] font-serif italic mt-1">
                Investigation file formally registered by {caseData.investigatingOfficer}.
              </p>
            </div>

            {documents.slice(0, 4).map(d => (
              <div key={d.documentId} className="relative">
                <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 bg-[#191817] border-2 border-[#FAF7F2]" />
                <div className="text-xs font-semibold text-[#191817] font-mono">
                  {new Date(d.uploadTimestamp).toLocaleDateString()}
                </div>
                <div className="font-serif font-bold text-base text-[#191817] mt-0.5">
                  Record Filed: {d.fileName}
                </div>
                <p className="text-xs text-[#59534B] font-serif italic mt-1">
                  SHA-256 baseline hash registered. Document status: {d.status}.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
