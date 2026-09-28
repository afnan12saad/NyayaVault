import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, revokeShare, getAllDocuments, shareDocument } from '../services/dbService';
import { DocumentShareRecord, DocumentRecord } from '../types';

export const SharesPage: React.FC = () => {
  const { userProfile, role } = useAuth();
  const [shares, setShares] = useState<DocumentShareRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // New Share form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [targetType, setTargetType] = useState<'department' | 'role' | 'user'>('department');
  const [recipient, setRecipient] = useState('Legal Department');
  const [permission, setPermission] = useState<'VIEW' | 'VIEW_DOWNLOAD' | 'VIEW_DOWNLOAD_COMMENT'>('VIEW_DOWNLOAD');
  const [expiry, setExpiry] = useState('2026-10-20');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [sharesSnap, docs] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.DOCUMENT_SHARES)),
        getAllDocuments()
      ]);
      const s = sharesSnap.docs.map(d => ({ ...d.data(), id: d.id } as DocumentShareRecord));
      setShares(s);
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].documentId);
      }
    } catch (err) {
      console.error('Error loading shares:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async (share: DocumentShareRecord) => {
    if (!userProfile) return;
    try {
      await revokeShare(share.shareId, share.documentName, share.caseId, userProfile);
      setShares(prev => prev.map(s => s.shareId === share.shareId ? { ...s, revoked: true } : s));
    } catch (err) {
      console.error('Revoke failed:', err);
    }
  };

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !recipient || !userProfile) return;
    setSubmitting(true);
    try {
      const doc = documents.find(d => d.documentId === selectedDocId);
      const shareId = `SHARE-${Date.now()}`;
      const newShare: DocumentShareRecord = {
        shareId,
        documentId: selectedDocId,
        documentName: doc?.fileName || 'Document',
        caseId: doc?.caseId || 'Case',
        sharedByUid: userProfile.uid,
        sharedByName: userProfile.fullName,
        targetType,
        recipientTarget: recipient,
        permission,
        expiresAt: new Date(expiry).toISOString(),
        revoked: false,
        createdAt: new Date().toISOString()
      };
      await shareDocument(newShare, userProfile);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D7DFE4]">
        <div>
          <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
            Access Governance & Collaboration
          </div>
          <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#29323A]" />
            <span>Authorized Document Sharing</span>
          </h1>
          <p className="text-xs text-[#5C6A76] mt-1">
            Time-bound, role-restricted document sharing with immediate revocation control and immutable audit logging.
          </p>
        </div>

        {role !== 'VIEWER' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Document Access</span>
          </button>
        )}
      </div>

      {/* Active Shares Table */}
      <div className="bg-white border border-[#D7DFE4] rounded overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#E7EBEE] text-[#29323A] uppercase font-mono text-[10px] border-b border-[#D7DFE4]">
            <tr>
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Recipient Target</th>
              <th className="py-3 px-4">Scope</th>
              <th className="py-3 px-4">Granted By</th>
              <th className="py-3 px-4">Expires</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7EBEE] font-sans">
            {shares.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#6A7885]">
                  No active or past document shares recorded in vault.
                </td>
              </tr>
            ) : (
              shares.map((s) => (
                <tr key={s.shareId} className="hover:bg-[#F4F6F8] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#29323A]">
                    <Link to={`/documents/${s.documentId}`} className="hover:underline">
                      {s.documentName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#29323A] font-semibold">{s.caseId}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#29323A]">{s.recipientTarget}</span>
                    <span className="text-[10px] text-[#6A7885] font-mono block">({s.targetType})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#29323A] font-medium">
                    {s.permission}
                  </td>
                  <td className="py-3 px-4 text-[#5C6A76]">{s.sharedByName}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#6A7885]">
                    {new Date(s.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {s.revoked ? (
                      <span className="px-2 py-0.5 rounded bg-[#29323A] text-white text-[10px] font-mono">
                        REVOKED
                      </span>
                    ) : new Date(s.expiresAt) < new Date() ? (
                      <span className="px-2 py-0.5 rounded bg-[#E7EBEE] text-[#5C6A76] border border-[#CBD4DA] text-[10px] font-mono">
                        EXPIRED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA] font-semibold text-[10px] font-mono">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!s.revoked && role !== 'VIEWER' && (
                      <button
                        onClick={() => handleRevoke(s)}
                        className="px-2.5 py-1 bg-white hover:bg-[#E7EBEE] border border-[#CBD4DA] text-[#29323A] rounded text-[11px] font-semibold transition-colors"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29323A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD4DA] rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 text-[#29323A]">
            <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#29323A]" />
                <h3 className="text-base font-bold text-[#29323A]">
                  Grant Document Access
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8695A2] hover:text-[#29323A]">✕</button>
            </div>

            <form onSubmit={handleCreateShare} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Target Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  {documents.map(d => (
                    <option key={d.documentId} value={d.documentId}>
                      {d.fileName} ({d.caseId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Recipient Categorization
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  <option value="department">Department</option>
                  <option value="role">Role</option>
                  <option value="user">Specific Officer (Email / ID)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Recipient Identity
                </label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Legal Department or forensic.lab@nic.in"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#29323A] font-semibold mb-1">
                    Permissions
                  </label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as any)}
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                  >
                    <option value="VIEW">View Only</option>
                    <option value="VIEW_DOWNLOAD">View + Download</option>
                    <option value="VIEW_DOWNLOAD_COMMENT">View + Download + Annotate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#29323A] font-semibold mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7EBEE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#F4F6F8] text-[#5C6A76] border border-[#CBD4DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold uppercase tracking-wider shadow-2xs"
                >
                  {submitting ? 'Registering Grant...' : 'Authorize Share Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
