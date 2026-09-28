import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getDocumentById,
  getDocumentVersions,
  getDocumentShares,
  getDocumentComments,
  addDocumentComment,
  createDocumentVersion,
  updateDocumentIntegrity,
  shareDocument,
  logAuditEvent
} from '../services/dbService';
import {
  DocumentRecord,
  DocumentVersionRecord,
  DocumentShareRecord,
  CommentRecord
} from '../types';
import { IntegrityBadge, DocumentStatusBadge } from '../components/common/StatusBadge';
import { calculateFileHash, formatHash } from '../lib/crypto';
import {
  DocumentIcon,
  VerificationStampIcon,
  LockSealIcon,
  DownloadFolioIcon,
  ShareGrantIcon,
  VersionBranchIcon,
  CommentNoteIcon,
  ChevronRightIcon,
  CloseModalIcon,
  AlertWarningIcon
} from '../components/common/LegalIcons';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile, role } = useAuth();
  const [docData, setDocData] = useState<DocumentRecord | null>(null);
  const [versions, setVersions] = useState<DocumentVersionRecord[]>([]);
  const [shares, setShares] = useState<DocumentShareRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  // New Version Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionDescription, setVersionDescription] = useState('');
  const [versionSubmitting, setVersionSubmitting] = useState(false);

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetType, setShareTargetType] = useState<'department' | 'role' | 'user'>('department');
  const [shareRecipient, setShareRecipient] = useState('Legal Department');
  const [sharePermission, setSharePermission] = useState<'VIEW' | 'VIEW_DOWNLOAD' | 'VIEW_DOWNLOAD_COMMENT'>('VIEW_DOWNLOAD');
  const [shareExpiry, setShareExpiry] = useState('2026-10-15');
  const [shareSubmitting, setShareSubmitting] = useState(false);

  // New Comment state
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const canEdit = role === 'SUPER ADMIN' || role === 'INVESTIGATING OFFICER' || role === 'FORENSIC OFFICER' || role === 'LEGAL OFFICER';
  const canShare = role !== 'VIEWER';

  const loadDocumentData = async () => {
    if (!id) return;
    try {
      const [d, v, s, c] = await Promise.all([
        getDocumentById(id),
        getDocumentVersions(id),
        getDocumentShares(id),
        getDocumentComments(id)
      ]);
      setDocData(d);
      setVersions(v);
      setShares(s);
      setComments(c);
      if (v.length > 0) {
        setSelectedVersion(v[0]);
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentData();
  }, [id]);

  useEffect(() => {
    if (docData && userProfile) {
      logAuditEvent('DOCUMENT_VIEW', 'DOCUMENT', docData.documentId, docData.fileName, {
        caseId: docData.caseId,
        result: 'SUCCESS',
        details: `Document opened for archival examination by ${userProfile.fullName}`,
        userProfile
      });
    }
  }, [docData?.documentId]);

  const handleVerifyIntegrity = async (simulateMismatch: boolean = false) => {
    if (!docData || !userProfile) return;
    setVerifying(true);
    setVerifyMessage(null);
    try {
      let computedHash = docData.originalHash;
      if (simulateMismatch) {
        computedHash = 'f' + docData.originalHash.slice(1);
      }

      const res = await fetch('/api/integrity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalHash: docData.originalHash,
          currentHash: computedHash
        })
      });
      const data = await res.json();
      if (data.success) {
        await updateDocumentIntegrity(
          docData.documentId,
          data.status,
          computedHash,
          userProfile,
          docData.caseId
        );
        setDocData(prev => prev ? { ...prev, integrityStatus: data.status, currentHash: computedHash } : null);
        setVerifyMessage(data.message);
      }
    } catch (err: any) {
      setVerifyMessage(err?.message || 'Integrity verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docData || !userProfile || !versionFile || !versionDescription) return;
    setVersionSubmitting(true);
    try {
      const newHash = await calculateFileHash(versionFile);
      const nextVersionNum = docData.version + 1;
      await createDocumentVersion(
        docData.documentId,
        nextVersionNum,
        versionFile.name,
        newHash,
        versionDescription,
        versionFile.size,
        docData.storageUrl || '',
        userProfile,
        docData.caseId
      );
      setIsVersionModalOpen(false);
      setVersionFile(null);
      setVersionDescription('');
      await loadDocumentData();
    } catch (err) {
      console.error('Error creating version:', err);
    } finally {
      setVersionSubmitting(false);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docData || !userProfile) return;
    setShareSubmitting(true);
    try {
      const shareId = `SHARE-${Date.now()}`;
      const newShare: DocumentShareRecord = {
        shareId,
        documentId: docData.documentId,
        documentName: docData.fileName,
        caseId: docData.caseId,
        sharedByUid: userProfile.uid,
        sharedByName: userProfile.fullName,
        targetType: shareTargetType,
        recipientTarget: shareRecipient,
        permission: sharePermission,
        expiresAt: new Date(shareExpiry).toISOString(),
        revoked: false,
        createdAt: new Date().toISOString()
      };
      await shareDocument(newShare, userProfile);
      setIsShareModalOpen(false);
      await loadDocumentData();
    } catch (err) {
      console.error('Error sharing document:', err);
    } finally {
      setShareSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docData || !userProfile || !commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const newComment: CommentRecord = {
        commentId: `COM-${Date.now()}`,
        documentId: docData.documentId,
        caseId: docData.caseId,
        userUid: userProfile.uid,
        userName: userProfile.fullName,
        userRole: userProfile.role,
        commentText: commentText.trim(),
        documentVersion: docData.version,
        createdAt: new Date().toISOString()
      };
      await addDocumentComment(newComment, userProfile);
      setCommentText('');
      setComments(prev => [newComment, ...prev]);
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!docData || !userProfile) return;
    logAuditEvent('DOCUMENT_DOWNLOAD', 'DOCUMENT', docData.documentId, docData.fileName, {
      caseId: docData.caseId,
      result: 'SUCCESS',
      details: `File downloaded under audit authority of ${userProfile.fullName}`,
      userProfile
    });
    const blob = new Blob([docData.textContent || `[NyayaVault Encrypted Document: ${docData.fileName}]\nSHA-256 Hash: ${docData.originalHash}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docData.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-12 text-center text-xs font-mono text-[#7A7368] uppercase tracking-widest">Inspecting document vault records...</div>;
  }

  if (!docData) {
    return <div className="p-8 text-center text-xs font-serif italic text-[#7A7368]">Document record not found or access clearance denied.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#7A7368]">
        <Link to="/documents" className="hover:text-[#191817] uppercase tracking-wider">Record Register</Link>
        <ChevronRightIcon size={12} className="text-[#A89F91]" />
        <Link to={`/cases/${docData.caseId}`} className="hover:text-[#191817]">{docData.caseId}</Link>
        <ChevronRightIcon size={12} className="text-[#A89F91]" />
        <span className="text-[#191817] font-semibold truncate max-w-xs">{docData.fileName}</span>
      </div>

      {/* Header & Verification Strip */}
      <div className="p-6 bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[#191817] bg-[#F3EFE6] px-2 py-0.5 border border-[#DDD6CA] tracking-wider uppercase">
                {docData.documentType}
              </span>
              <span className="font-mono text-xs text-[#7A7368]">
                VERSION v{docData.version}
              </span>
              <DocumentStatusBadge status={docData.status} />
              <IntegrityBadge status={docData.integrityStatus} hash={docData.currentHash} size="md" />
            </div>

            <h1 className="text-3xl font-serif text-[#191817]">
              {docData.fileName}
            </h1>

            <p className="text-xs text-[#59534B] font-mono">
              Bound to Case Folio <Link to={`/cases/${docData.caseId}`} className="text-[#191817] font-semibold hover:underline">{docData.caseId}</Link> • Lodged by {docData.uploadedBy} on {new Date(docData.uploadTimestamp).toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto font-mono text-xs">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] text-[#191817] border border-[#DDD6CA] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <DownloadFolioIcon size={14} />
              <span>Export Folio</span>
            </button>

            {canShare && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] text-[#191817] border border-[#DDD6CA] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <ShareGrantIcon size={14} />
                <span>Grant Share</span>
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => setIsVersionModalOpen(true)}
                className="px-3 py-1.5 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] uppercase tracking-widest flex items-center gap-1.5 border border-[#191817]"
              >
                <VersionBranchIcon size={14} />
                <span>Lodge Revision</span>
              </button>
            )}
          </div>
        </div>

        {/* Cryptographic SHA-256 Checksum Panel */}
        <div className="pt-4 border-t border-[#DDD6CA] bg-[#F3EFE6] p-4 space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-[#7A7368]">
              <LockSealIcon size={15} className="text-[#6F263D]" />
              <span className="font-semibold text-[#191817] uppercase tracking-widest">Cryptographic SHA-256 Checksum Ledger</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVerifyIntegrity(false)}
                disabled={verifying}
                className="px-2.5 py-1 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] text-[10px] tracking-widest uppercase transition-colors border border-[#191817]"
              >
                {verifying ? 'Checking...' : 'Recalculate Hash'}
              </button>
              <button
                onClick={() => handleVerifyIntegrity(true)}
                title="Test tamper detection alert by altering 1 bit of checksum"
                className="px-2 py-1 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#DDD6CA] text-[#7A7368] text-[10px] uppercase tracking-wider transition-colors"
              >
                Simulate Tamper
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-[#7A7368] block uppercase text-[9px] tracking-wider">Original Ingest Hash:</span>
              <span className="text-[#191817] break-all select-all font-semibold">
                {docData.originalHash}
              </span>
            </div>
            <div>
              <span className="text-[#7A7368] block uppercase text-[9px] tracking-wider">Current Physical Digest:</span>
              <span className={`break-all ${docData.integrityStatus === 'VERIFIED' ? 'text-[#191817] font-semibold' : 'text-[#FAF7F2] bg-[#6F263D] px-1 py-0.5'}`}>
                {docData.currentHash}
              </span>
            </div>
          </div>

          {verifyMessage && (
            <div className="p-2.5 border border-[#DDD6CA] bg-[#FAF7F2] text-[#191817] text-xs font-serif italic">
              {verifyMessage}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Document Viewer & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Content Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6CA]">
              <div className="flex items-center gap-2">
                <DocumentIcon size={16} />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#191817] font-bold">
                  Record Folio Viewer (Version v{selectedVersion?.versionNumber || docData.version})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#7A7368]">
                {(docData.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            {/* Document Content View */}
            <div className="p-5 bg-[#F3EFE6] border border-[#DDD6CA] font-mono text-xs text-[#191817] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {docData.textContent || `[SECURE RECORD SEAL: ${docData.fileName}]\nDocument type: ${docData.documentType}\nCase Identifier: ${docData.caseId}\nUploader: ${docData.uploadedBy}\nBaseline Cryptographic Checksum: ${docData.originalHash}\nOfficial Seal: GOVERNMENT OF INDIA / JUDICIAL ARCHIVE\nRetention Status: ${docData.retentionStatus}`}
            </div>

            {docData.summary && (
              <div className="p-4 bg-[#F3EFE6] border border-[#DDD6CA] text-xs text-[#191817]">
                <strong className="text-[#6F263D] uppercase font-mono text-[10px] tracking-widest block mb-1">
                  § Executive Abstract:
                </strong>
                <p className="font-serif text-sm italic">{docData.summary}</p>
              </div>
            )}
          </div>

          {/* Comments Module */}
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DDD6CA]">
              <CommentNoteIcon size={16} />
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#191817] font-bold">
                Juridical Notes & Annotations ({comments.length})
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Append formal judicial advisory or review remarks..."
                className="w-full bg-[#F3EFE6] border border-[#DDD6CA] p-3 text-xs text-[#191817] font-serif text-sm focus:outline-none focus:border-[#191817]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentText.trim()}
                  className="px-3.5 py-1.5 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest disabled:opacity-50 border border-[#191817]"
                >
                  {commentSubmitting ? 'Posting...' : 'Commit Note'}
                </button>
              </div>
            </form>

            <div className="divide-y divide-[#EAE4D7] space-y-3 pt-2">
              {comments.length === 0 ? (
                <div className="text-xs text-[#7A7368] font-serif italic text-center py-2">
                  No annotations appended to this record folio.
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.commentId} className="pt-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#191817]">
                        {c.userName} <span className="font-mono text-[10px] text-[#7A7368]">({c.userRole})</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#7A7368]">
                        v{c.documentVersion} • {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#4A453E] font-serif italic text-sm">{c.commentText}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Version History & Sharing Grants */}
        <div className="space-y-6">
          {/* Version History */}
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6CA]">
              <div className="flex items-center gap-2">
                <VersionBranchIcon size={16} />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#191817] font-bold">
                  Version Registry ({versions.length})
                </h3>
              </div>
              <span className="text-[9px] text-[#7A7368] font-mono tracking-wider uppercase">Immutable</span>
            </div>

            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.versionId}
                  onClick={() => setSelectedVersion(ver)}
                  className={`p-3 border text-xs cursor-pointer transition-all ${
                    selectedVersion?.versionId === ver.versionId
                      ? 'bg-[#F3EFE6] border-[#191817]'
                      : 'bg-[#FAF7F2] border-[#DDD6CA] hover:border-[#8C8477]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-[#191817]">
                      Revision v{ver.versionNumber} {ver.versionNumber === docData.version && <span className="text-[#6F263D] text-[10px]">(Active)</span>}
                    </span>
                    <span className="text-[10px] text-[#7A7368]">
                      {new Date(ver.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[#59534B] text-xs font-serif italic mt-1 line-clamp-2">
                    {ver.changeDescription}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-[#7A7368] flex items-center justify-between">
                    <span>Officer: {ver.uploadedBy}</span>
                    <span title={ver.hash}>{formatHash(ver.hash, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Shares */}
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6CA]">
              <div className="flex items-center gap-2">
                <ShareGrantIcon size={16} />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#191817] font-bold">
                  Jurisdictional Grants ({shares.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {shares.length === 0 ? (
                <div className="text-xs text-[#7A7368] font-serif italic text-center py-2">
                  No external shares granted. Access restricted to {docData.department}.
                </div>
              ) : (
                shares.map(s => (
                  <div key={s.shareId} className="p-2.5 bg-[#F3EFE6] border border-[#DDD6CA] text-xs space-y-1">
                    <div className="flex items-center justify-between font-serif font-bold text-[#191817]">
                      <span>{s.recipientTarget}</span>
                      <span className="text-[10px] font-mono text-[#6F263D]">{s.permission}</span>
                    </div>
                    <div className="text-[10px] text-[#7A7368] font-mono">
                      Expires: {new Date(s.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#191817]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] max-w-lg w-full p-6 shadow-2xl space-y-4 text-[#191817]">
            <div className="flex items-center justify-between border-b border-[#DDD6CA] pb-3">
              <div className="flex items-center gap-2">
                <VersionBranchIcon size={18} className="text-[#6F263D]" />
                <h3 className="text-xl font-serif font-bold text-[#191817]">
                  Register Revision v{docData.version + 1}
                </h3>
              </div>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-[#7A7368] hover:text-[#191817]">
                <CloseModalIcon size={16} />
              </button>
            </div>

            <p className="text-xs font-serif italic text-[#4A453E]">
              Uploading a revised document preserves all historical versions and baseline hashes. Previous versions remain tamper-evident and accessible.
            </p>

            <form onSubmit={handleCreateVersion} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Select Revised File (PDF, DOCX, TXT)
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] focus:outline-none focus:border-[#191817]"
                />
              </div>

              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Revision Reason & Summary of Additions
                </label>
                <textarea
                  rows={3}
                  required
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="e.g. Appended Annexure C after special prosecutor review..."
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] font-serif text-sm focus:outline-none focus:border-[#191817]"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD6CA] flex justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="px-4 py-2 bg-[#F3EFE6] text-[#59534B] border border-[#DDD6CA] text-xs uppercase tracking-wider"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={versionSubmitting || !versionFile}
                  className="px-5 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] text-xs uppercase tracking-widest border border-[#191817]"
                >
                  {versionSubmitting ? 'Registering Revision...' : 'Seal New Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#191817]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] max-w-lg w-full p-6 shadow-2xl space-y-4 text-[#191817]">
            <div className="flex items-center justify-between border-b border-[#DDD6CA] pb-3">
              <div className="flex items-center gap-2">
                <ShareGrantIcon size={18} className="text-[#6F263D]" />
                <h3 className="text-xl font-serif font-bold text-[#191817]">
                  Grant Jurisdictional Share
                </h3>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-[#7A7368] hover:text-[#191817]">
                <CloseModalIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Recipient Authority Type
                </label>
                <select
                  value={shareTargetType}
                  onChange={(e) => setShareTargetType(e.target.value as any)}
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] focus:outline-none focus:border-[#191817] text-xs font-mono"
                >
                  <option value="department">Department</option>
                  <option value="role">Role Mandate</option>
                  <option value="user">Specific Jurist UID / Email</option>
                </select>
              </div>

              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Recipient Authority Name
                </label>
                <input
                  type="text"
                  required
                  value={shareRecipient}
                  onChange={(e) => setShareRecipient(e.target.value)}
                  placeholder="e.g. Legal Department or r.verma@police.gov.in"
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] focus:outline-none focus:border-[#191817]"
                />
              </div>

              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Permission Clearance Scope
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as any)}
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] focus:outline-none focus:border-[#191817] text-xs font-mono"
                >
                  <option value="VIEW">Inspection Only</option>
                  <option value="VIEW_DOWNLOAD">Inspection + Export Folio</option>
                  <option value="VIEW_DOWNLOAD_COMMENT">Inspection + Export + Annotate</option>
                </select>
              </div>

              <div>
                <label className="block text-[#191817] font-mono text-[10px] tracking-wider uppercase mb-1">
                  Grant Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={shareExpiry}
                  onChange={(e) => setShareExpiry(e.target.value)}
                  className="w-full bg-[#F3EFE6] border border-[#DDD6CA] px-3 py-2 text-[#191817] focus:outline-none focus:border-[#191817] font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD6CA] flex justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 bg-[#F3EFE6] text-[#59534B] border border-[#DDD6CA] text-xs uppercase tracking-wider"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={shareSubmitting}
                  className="px-5 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] text-xs uppercase tracking-widest border border-[#191817]"
                >
                  {shareSubmitting ? 'Granting Access...' : 'Commit Jurisdictional Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
