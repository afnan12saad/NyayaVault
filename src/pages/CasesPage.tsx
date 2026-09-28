import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCases, createCase } from '../services/dbService';
import { CaseRecord, CaseStatus, CasePriority, DepartmentName } from '../types';
import { CaseStatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import {
  CaseFileIcon,
  PlusFolioIcon,
  SearchInspectionIcon,
  ArrowRightIcon,
  CloseModalIcon,
  AlertWarningIcon,
  UserOfficerIcon,
  LockSealIcon
} from '../components/common/LegalIcons';

export const CasesPage: React.FC = () => {
  const { userProfile, role, department } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'create');
  const [newCaseId, setNewCaseId] = useState(`NYV-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCaseType, setNewCaseType] = useState('Economic Offences');
  const [newDepartment, setNewDepartment] = useState<DepartmentName>(department);
  const [newOfficer, setNewOfficer] = useState(userProfile?.fullName || 'Investigating Officer');
  const [newPriority, setNewPriority] = useState<CasePriority>('HIGH');
  const [newStatus, setNewStatus] = useState<CaseStatus>('Open');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canCreateCase = role === 'SUPER ADMIN' || role === 'INVESTIGATING OFFICER';

  const loadData = async () => {
    try {
      const data = await getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseId || !newTitle || !newDescription) {
      setFormError('Please enter Case Folio ID, Title, and Description.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const caseRecord: CaseRecord = {
        caseId: newCaseId,
        title: newTitle,
        description: newDescription,
        caseType: newCaseType,
        department: newDepartment,
        investigatingOfficer: newOfficer,
        investigatingOfficerId: userProfile?.uid || 'officer',
        priority: newPriority,
        status: newStatus,
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        documentCount: 0,
        evidenceCount: 0,
        tags: [newCaseType, newDepartment]
      };
      await createCase(caseRecord, userProfile!);
      setIsModalOpen(false);
      setSearchParams({});
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create case folio.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.investigatingOfficer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DDD6CA]">
        <div>
          <div className="text-xs font-mono text-[#7A7368] uppercase tracking-widest flex items-center gap-1.5">
            <span className="text-[#6F263D] font-bold">§ 01</span>
            <span>JURISDICTIONAL CASE REGISTER</span>
          </div>
          <h1 className="text-3xl font-serif text-[#191817] mt-1 flex items-center gap-2.5">
            <CaseFileIcon size={24} />
            <span>Investigation Case Folios</span>
          </h1>
          <p className="text-xs font-serif italic text-[#4A453E] mt-1">
            Centrally governed criminal and evidentiary case folios under statutory chain-of-custody.
          </p>
        </div>

        {canCreateCase && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs tracking-widest uppercase flex items-center gap-2 transition-colors self-start sm:self-auto border border-[#191817]"
          >
            <PlusFolioIcon size={14} />
            <span>Open New Case Folio</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF7F2] p-3 border border-[#DDD6CA] shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Folio ID, title, officer..."
            className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 pl-9 text-xs text-[#191817] placeholder:text-[#8C8477] focus:outline-none focus:border-[#191817] font-mono"
          />
          <span className="absolute left-3 top-2.5 text-[#7A7368]">
            <SearchInspectionIcon size={14} />
          </span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-xs text-[#191817] focus:outline-none focus:border-[#191817] font-mono uppercase"
        >
          <option value="ALL">All Case Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Under Review">Under Review</option>
          <option value="Submitted">Submitted</option>
          <option value="Closed">Closed</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-xs text-[#191817] focus:outline-none focus:border-[#191817] font-mono uppercase"
        >
          <option value="ALL">All Jurisdictional Depts</option>
          <option value="Police Investigation">Police Investigation</option>
          <option value="Legal Department">Legal Department</option>
          <option value="Forensics">Forensics</option>
          <option value="Court">Court</option>
          <option value="Administration">Administration</option>
        </select>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="p-12 text-center text-[#7A7368] text-xs font-mono tracking-widest uppercase">
          Inspecting vault catalog records...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-[#FAF7F2] border border-[#DDD6CA] text-[#7A7368] text-xs font-serif italic">
          No investigation cases matched the specified query parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.caseId}
              className="p-5 bg-[#FAF7F2] hover:bg-[#F3EFE6] hover:border-[#191817] border border-[#DDD6CA] transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#191817] tracking-wider">{c.caseId}</span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={c.priority} />
                    <CaseStatusBadge status={c.status} />
                  </div>
                </div>

                <div>
                  <Link
                    to={`/cases/${c.caseId}`}
                    className="text-lg font-serif font-bold text-[#191817] hover:text-[#6F263D] transition-colors block"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-[#59534B] mt-1 font-serif italic line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#7A7368] pt-2 border-t border-[#EAE4D7]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#6F263D]">DEP:</span>
                    <span className="truncate text-[#191817]">{c.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#6F263D]">OFF:</span>
                    <span className="truncate text-[#191817]">{c.investigatingOfficer}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE4D7] flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-[#7A7368]">
                  UPDATED: {new Date(c.lastUpdated).toLocaleDateString()}
                </span>
                <Link
                  to={`/cases/${c.caseId}`}
                  className="text-[#191817] hover:text-[#6F263D] font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider"
                >
                  <span>Open Folio</span>
                  <ArrowRightIcon size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#191817]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-[#191817]">
            <div className="flex items-center justify-between border-b border-[#DDD6CA] pb-3">
              <div className="flex items-center gap-2">
                <CaseFileIcon size={20} className="text-[#6F263D]" />
                <h3 className="text-xl font-serif font-bold text-[#191817]">
                  Register New Investigation Folio
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSearchParams({});
                }}
                className="text-[#7A7368] hover:text-[#191817]"
              >
                <CloseModalIcon size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#F7EFF1] border border-[#E5CCD4] text-[#6F263D] text-xs flex items-center gap-2 font-mono">
                <AlertWarningIcon size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                    Official Folio ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseId}
                    onChange={(e) => setNewCaseId(e.target.value)}
                    className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] font-mono focus:outline-none focus:border-[#191817]"
                  />
                </div>

                <div>
                  <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                    Classification / Type
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    placeholder="e.g. Cyber Intrusion, Financial Fraud"
                    className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] focus:outline-none focus:border-[#191817]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Folio Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inquest into Unauthorized Data Tampering"
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] font-serif text-sm focus:outline-none focus:border-[#191817]"
                />
              </div>

              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Investigation Summary & Allegation Particulars
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of initial complaint, entities involved, and statutory mandate..."
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] font-serif text-sm focus:outline-none focus:border-[#191817]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as DepartmentName)}
                    className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-2.5 py-1.5 text-[#191817] focus:outline-none focus:border-[#191817] text-[11px]"
                  >
                    <option value="Police Investigation">Police Investigation</option>
                    <option value="Legal Department">Legal Department</option>
                    <option value="Forensics">Forensics</option>
                    <option value="Court">Court</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as CasePriority)}
                    className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-2.5 py-1.5 text-[#191817] focus:outline-none focus:border-[#191817] font-mono text-[11px]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
                    className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-2.5 py-1.5 text-[#191817] focus:outline-none focus:border-[#191817] font-mono text-[11px]"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">Lead Jurist</label>
                  <input
                    type="text"
                    required
                    value={newOfficer}
                    onChange={(e) => setNewOfficer(e.target.value)}
                    className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-2.5 py-1.5 text-[#191817] focus:outline-none focus:border-[#191817] text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDD6CA] flex items-center justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F3EFE6] hover:bg-[#EAE4D7] text-[#59534B] border border-[#DDD6CA] text-xs uppercase tracking-wider"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] text-xs uppercase tracking-widest border border-[#191817]"
                >
                  {submitting ? 'Registering...' : 'Register Folio Under Seal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
