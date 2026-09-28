import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllDocuments, getCases } from '../services/dbService';
import { DocumentRecord, CaseRecord } from '../types';
import { IntegrityBadge } from '../components/common/StatusBadge';

export const SearchPage: React.FC = () => {
  const { role } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Criteria
  const [keyword, setKeyword] = useState('');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [integrityFilter, setIntegrityFilter] = useState('ALL');

  // AI Search Assistant state
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiParseExplanation, setAiParseExplanation] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, c] = await Promise.all([
          getAllDocuments(),
          getCases()
        ]);
        setDocuments(docs);
        setCases(c);
      } catch (err) {
        console.error('Failed to load search data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAiSearchAssist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageQuery.trim()) return;
    setAiParsing(true);
    setAiParseExplanation(null);
    try {
      const res = await fetch('/api/ai/search-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const parsed = data.data;
        if (parsed.searchTerm) setKeyword(parsed.searchTerm);
        if (parsed.caseId) setCaseFilter(parsed.caseId);
        if (parsed.documentType) setTypeFilter(parsed.documentType);
        if (parsed.department) setDeptFilter(parsed.department);
        if (parsed.status) setStatusFilter(parsed.status);

        setAiParseExplanation(`Interpreted Criteria: ${parsed.intent || 'Keyword & entity extraction applied.'}`);
      }
    } catch (err) {
      console.error('AI search parse failed:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (role !== 'SUPER ADMIN' && role !== 'AUDITOR') {
      if (doc.accessLevel === 'TOP SECRET' && role !== 'INVESTIGATING OFFICER') {
        return false;
      }
    }

    const matchesKeyword =
      !keyword ||
      doc.fileName.toLowerCase().includes(keyword.toLowerCase()) ||
      doc.documentId.toLowerCase().includes(keyword.toLowerCase()) ||
      doc.caseId.toLowerCase().includes(keyword.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(keyword.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(keyword.toLowerCase())) ||
      (doc.tags && doc.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase())));

    const matchesCase = caseFilter === 'ALL' || doc.caseId === caseFilter;
    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
    const matchesDept = deptFilter === 'ALL' || doc.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesIntegrity = integrityFilter === 'ALL' || doc.integrityStatus === integrityFilter;

    return matchesKeyword && matchesCase && matchesType && matchesDept && matchesStatus && matchesIntegrity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D7DFE4]">
        <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
          Judicial Evidence Query Engine
        </div>
        <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
          <Search className="w-6 h-6 text-[#29323A]" />
          <span>Document Search & Discovery</span>
        </h1>
        <p className="text-xs text-[#5C6A76] mt-1">
          High-performance search across case documents, forensic exhibits, and judicial records with strict RBAC enforcement.
        </p>
      </div>

      {/* AI Intelligent Search Assistant Panel */}
      <div className="p-5 rounded bg-white border border-[#CBD4DA] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#29323A]" />
          <h2 className="text-xs font-mono font-bold uppercase text-[#29323A]">
            Natural Language AI Search Assistant
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA] rounded">
            GEMINI-3.8
          </span>
        </div>

        <form onSubmit={handleAiSearchAssist} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={naturalLanguageQuery}
            onChange={(e) => setNaturalLanguageQuery(e.target.value)}
            placeholder='e.g. "Find forensic reports associated with Case NYV-2026-00124"'
            className="flex-1 bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-sans"
          />
          <button
            type="submit"
            disabled={aiParsing || !naturalLanguageQuery.trim()}
            className="px-5 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{aiParsing ? 'Interpreting...' : 'Parse & Query'}</span>
          </button>
        </form>

        {aiParseExplanation && (
          <div className="text-[11px] font-mono text-[#29323A] bg-[#E7EBEE] p-2 rounded border border-[#CBD4DA]">
            {aiParseExplanation}
          </div>
        )}
      </div>

      {/* Manual Search Filters Toolbar */}
      <div className="bg-white border border-[#D7DFE4] rounded p-4 space-y-3 text-xs shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search keywords, persons, file names, or summary..."
            className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 pl-9 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8695A2]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <select
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-2.5 py-1.5 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
          >
            <option value="ALL">All Cases</option>
            {cases.map(c => (
              <option key={c.caseId} value={c.caseId}>{c.caseId}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-2.5 py-1.5 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="FIR">FIR</option>
            <option value="Police Report">Police Report</option>
            <option value="Investigation Record">Investigation Record</option>
            <option value="Witness Statement">Witness Statement</option>
            <option value="Charge Sheet">Charge Sheet</option>
            <option value="Forensic Report">Forensic Report</option>
            <option value="Court Filing">Court Filing</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-2.5 py-1.5 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
          >
            <option value="ALL">All Departments</option>
            <option value="Police Investigation">Police Investigation</option>
            <option value="Legal Department">Legal Department</option>
            <option value="Forensics">Forensics</option>
            <option value="Court">Court</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-2.5 py-1.5 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="UNDER REVIEW">UNDER REVIEW</option>
            <option value="SEALED">SEALED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <select
            value={integrityFilter}
            onChange={(e) => setIntegrityFilter(e.target.value)}
            className="bg-[#F4F6F8] border border-[#D7DFE4] rounded px-2.5 py-1.5 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
          >
            <option value="ALL">All Integrity States</option>
            <option value="VERIFIED">Checksum Verified</option>
            <option value="INTEGRITY_WARNING">Integrity Warning</option>
          </select>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#6A7885]">
          <span className="font-semibold text-[#29323A] uppercase tracking-wider">
            SEARCH RESULTS: {filteredDocuments.length} DOCUMENTS FOUND
          </span>
          <span>Access Authorization Filter: ACTIVE</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6A7885] text-xs font-mono">
            Executing cryptographic index search...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#D7DFE4] rounded text-[#6A7885] text-xs">
            No authorized documents found matching specified search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc.documentId}
                className="p-5 rounded bg-white hover:border-[#29323A] border border-[#D7DFE4] transition-all flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#29323A] font-semibold">{doc.caseId}</span>
                    <IntegrityBadge status={doc.integrityStatus} hash={doc.originalHash} />
                  </div>

                  <div>
                    <Link
                      to={`/documents/${doc.documentId}`}
                      className="text-base font-bold text-[#29323A] hover:underline transition-colors block"
                    >
                      {doc.fileName}
                    </Link>
                    <div className="text-[11px] text-[#6A7885] font-mono mt-0.5">
                      Type: <span className="text-[#29323A]">{doc.documentType}</span> • Access: <span className="text-[#29323A] font-medium">Authorized</span>
                    </div>
                  </div>

                  {doc.summary && (
                    <p className="text-xs text-[#5C6A76] line-clamp-2 leading-relaxed">
                      {doc.summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E7EBEE] flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-[#8695A2]">
                    Uploaded by {doc.uploadedBy}
                  </span>
                  <Link
                    to={`/documents/${doc.documentId}`}
                    className="text-[#29323A] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Open →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
