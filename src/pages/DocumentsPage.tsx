import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllDocuments } from '../services/dbService';
import { DocumentRecord } from '../types';
import { IntegrityBadge, DocumentStatusBadge } from '../components/common/StatusBadge';
import { formatHash } from '../lib/crypto';
import {
  DocumentIcon,
  UploadArchiveIcon,
  SearchInspectionIcon
} from '../components/common/LegalIcons';

export const DocumentsPage: React.FC = () => {
  const { role } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadDocs() {
      try {
        const data = await getAllDocuments();
        setDocuments(data);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || d.documentType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DDD6CA]">
        <div>
          <div className="text-xs font-mono text-[#7A7368] uppercase tracking-widest flex items-center gap-1.5">
            <span className="text-[#6F263D] font-bold">§ 02</span>
            <span>CENTRAL ARCHIVAL REPOSITORY</span>
          </div>
          <h1 className="text-3xl font-serif text-[#191817] mt-1 flex items-center gap-2.5">
            <DocumentIcon size={24} />
            <span>Archived Legal Records</span>
          </h1>
          <p className="text-xs font-serif italic text-[#4A453E] mt-1">
            Tamper-evident legal documents, forensic audits, witness depositions, and charge sheets with SHA-256 integrity locks.
          </p>
        </div>

        {role !== 'VIEWER' && (
          <Link
            to="/upload"
            className="px-4 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-colors self-start sm:self-auto border border-[#191817]"
          >
            <UploadArchiveIcon size={14} />
            <span>Lodge Record</span>
          </Link>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF7F2] p-3 border border-[#DDD6CA] shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name, case ID, jurist..."
            className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 pl-9 text-xs text-[#191817] placeholder:text-[#8C8477] focus:outline-none focus:border-[#191817] font-mono"
          />
          <span className="absolute left-3 top-2.5 text-[#7A7368]">
            <SearchInspectionIcon size={14} />
          </span>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-xs text-[#191817] focus:outline-none focus:border-[#191817] font-mono uppercase"
        >
          <option value="ALL">All Categories</option>
          <option value="FIR">FIR</option>
          <option value="Police Report">Police Report</option>
          <option value="Investigation Record">Investigation Record</option>
          <option value="Witness Statement">Witness Statement</option>
          <option value="Charge Sheet">Charge Sheet</option>
          <option value="Court Filing">Court Filing</option>
          <option value="Evidence Record">Evidence Record</option>
          <option value="Forensic Report">Forensic Report</option>
          <option value="Legal Notice">Legal Notice</option>
          <option value="Judgment">Judgment</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-xs text-[#191817] focus:outline-none focus:border-[#191817] font-mono uppercase"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="UNDER REVIEW">UNDER REVIEW</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="SEALED">SEALED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="p-12 text-center text-[#7A7368] text-xs font-mono tracking-widest uppercase">
          Loading secured document register...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-[#FAF7F2] border border-[#DDD6CA] text-[#7A7368] text-xs font-serif italic">
          No archived documents matched query parameters.
        </div>
      ) : (
        <div className="bg-[#FAF7F2] border border-[#DDD6CA] overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3EFE6] text-[#191817] uppercase font-mono text-[10px] tracking-wider border-b border-[#DDD6CA]">
              <tr>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Case Folio</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Integrity Seal</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D7]">
              {filteredDocs.map((doc) => (
                <tr key={doc.documentId} className="hover:bg-[#F3EFE6] transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      to={`/documents/${doc.documentId}`}
                      className="font-serif font-bold text-sm text-[#191817] hover:text-[#6F263D] block"
                    >
                      {doc.fileName}
                    </Link>
                    <div className="text-[10px] text-[#7A7368] font-mono mt-0.5">
                      Jurist: {doc.uploadedBy} • {(doc.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/cases/${doc.caseId}`}
                      className="font-mono text-xs text-[#191817] hover:text-[#6F263D] hover:underline"
                    >
                      {doc.caseId}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-[#59534B] font-mono text-[11px]">
                    {doc.documentType}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#191817]">
                    v{doc.version}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-[#7A7368]" title={doc.originalHash}>
                    {formatHash(doc.originalHash, 14)}
                  </td>
                  <td className="py-3 px-4">
                    <IntegrityBadge status={doc.integrityStatus} hash={doc.originalHash} />
                  </td>
                  <td className="py-3 px-4">
                    <DocumentStatusBadge status={doc.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/documents/${doc.documentId}`}
                      className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#191817] hover:text-[#FAF7F2] text-[#191817] border border-[#DDD6CA] text-[10px] font-mono uppercase tracking-widest transition-colors inline-block"
                    >
                      Inspect →
                    </Link>
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
