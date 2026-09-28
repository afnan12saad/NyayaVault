import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCases, uploadDocumentFile, createDocumentRecord } from '../services/dbService';
import { CaseRecord, DocumentType, AccessLevel, DocumentRecord } from '../types';
import { calculateFileHash } from '../lib/crypto';

export const UploadDocumentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCaseId = searchParams.get('caseId') || '';

  const { userProfile } = useAuth();

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('Investigation Record');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('RESTRICTED');
  const [description, setDescription] = useState('');

  // AI Classification state
  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<any | null>(null);

  // Progress & Submission
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDocId, setSuccessDocId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCasesList() {
      try {
        const c = await getCases();
        setCases(c);
        if (c.length > 0 && !selectedCaseId) {
          setSelectedCaseId(c[0].caseId);
        }
      } catch (err) {
        console.error('Failed to load cases for upload:', err);
      }
    }
    loadCasesList();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 50 * 1024 * 1024) {
      setError('File size exceeds statutory maximum of 50MB.');
      return;
    }

    setFile(selected);
    setError(null);
    setUploadProgress(10);

    try {
      const hash = await calculateFileHash(selected);
      setFileHash(hash);
      setUploadProgress(25);
    } catch (err) {
      console.error('Hashing failed:', err);
      setError('Failed to compute cryptographic hash for file.');
    }
  };

  const handleAiAutoClassify = async () => {
    if (!file) {
      setError('Please choose a file before requesting AI classification.');
      return;
    }
    setAiClassifying(true);
    setError(null);
    try {
      let contentSample = '';
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        contentSample = await file.text();
      } else {
        contentSample = `File: ${file.name}, Size: ${file.size} bytes.`;
      }

      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          content: contentSample
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiClassificationResult(data.data);
        if (data.data.documentType) {
          setDocumentType(data.data.documentType as DocumentType);
        }
      }
    } catch (err: any) {
      setError('AI classification service unavailable.');
    } finally {
      setAiClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fileHash || !selectedCaseId || !userProfile) {
      setError('Please complete all mandatory fields and calculate file hash.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadProgress(40);

    try {
      const targetCase = cases.find(c => c.caseId === selectedCaseId);
      const documentId = `DOC-${selectedCaseId.replace('NYV-2026-', '')}-${Math.floor(100 + Math.random() * 900)}`;

      setUploadProgress(60);
      const storageUrl = await uploadDocumentFile(file, selectedCaseId, documentId);
      setUploadProgress(80);

      const docRecord: DocumentRecord = {
        documentId,
        fileName: file.name,
        documentType,
        caseId: selectedCaseId,
        caseTitle: targetCase?.title || selectedCaseId,
        uploadedBy: userProfile.fullName,
        uploadedByUid: userProfile.uid,
        department: userProfile.department,
        uploadTimestamp: new Date().toISOString(),
        version: 1,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        storageUrl,
        originalHash: fileHash,
        currentHash: fileHash,
        integrityStatus: 'VERIFIED',
        status: 'VERIFIED',
        accessLevel,
        retentionStatus: 'ACTIVE',
        summary: description || aiClassificationResult?.reason || 'Verified case record.',
        tags: aiClassificationResult?.suggestedTags || [documentType, 'Evidence']
      };

      await createDocumentRecord(docRecord, userProfile);
      setUploadProgress(100);
      setSuccessDocId(documentId);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'Secure upload procedure failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D7DFE4]">
        <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
          Ingestion & Sealing Station
        </div>
        <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-[#29323A]" />
          <span>Secure Document Ingestion</span>
        </h1>
        <p className="text-xs text-[#5C6A76] mt-1">
          Cryptographically hashes, classifies, and commits evidence records into the immutable jurisdictional repository.
        </p>
      </div>

      {successDocId ? (
        <div className="p-8 rounded bg-white border border-[#CBD4DA] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded bg-[#E7EBEE] border border-[#CBD4DA] flex items-center justify-center text-[#29323A] mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#29323A]">
            Document Ingestion & Baseline Seal Registered
          </h2>
          <p className="text-xs text-[#5C6A76] max-w-lg mx-auto">
            Document <strong className="text-[#29323A] font-mono">{file?.name}</strong> has been assigned ID{' '}
            <strong className="text-[#29323A] font-mono">{successDocId}</strong>. SHA-256 checksum has been committed to the audit register.
          </p>
          <div className="p-3 rounded bg-[#F4F6F8] font-mono text-xs text-[#29323A] break-all max-w-xl mx-auto border border-[#D7DFE4]">
            SHA-256: {fileHash}
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              to={`/documents/${successDocId}`}
              className="px-5 py-2.5 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-2xs"
            >
              Open Document Record →
            </Link>
            <button
              onClick={() => {
                setSuccessDocId(null);
                setFile(null);
                setFileHash('');
                setUploadProgress(0);
              }}
              className="px-5 py-2.5 rounded bg-white hover:bg-[#E7EBEE] text-[#29323A] text-xs font-semibold border border-[#CBD4DA]"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-[#29323A] text-white text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#E7EBEE]" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select File */}
          <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#29323A] uppercase tracking-wider flex items-center gap-2">
                <span>01.</span>
                <span>Select Legal Document File</span>
              </span>
              <span className="text-[11px] font-mono text-[#6A7885]">PDF, DOCX, TXT, JPG, PNG (Max 50MB)</span>
            </div>

            <div className="border border-dashed border-[#CBD4DA] hover:border-[#29323A] rounded p-6 text-center transition-colors bg-[#F4F6F8]">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.jpg,.png"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                <UploadCloud className="w-8 h-8 text-[#29323A] mx-auto" />
                <div className="text-xs font-semibold text-[#29323A]">
                  {file ? file.name : 'Click to select legal document file'}
                </div>
                <p className="text-[11px] text-[#6A7885]">
                  Native cryptographic hash will be calculated in memory before transmission.
                </p>
              </label>
            </div>

            {/* Hash Display */}
            {fileHash && (
              <div className="p-3 rounded bg-[#E7EBEE] border border-[#CBD4DA] font-mono text-xs text-[#29323A] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#29323A]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Calculated SHA-256 Checksum:</span>
                </div>
                <div className="break-all select-all font-semibold text-[#29323A]">{fileHash}</div>
              </div>
            )}
          </div>

          {/* Step 2: Associate with Case & Classification */}
          <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 text-xs shadow-2xs">
            <span className="text-xs font-mono font-bold text-[#29323A] uppercase tracking-wider flex items-center gap-2">
              <span>02.</span>
              <span>Case Association & Document Categorization</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Target Investigation Case
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  {cases.map(c => (
                    <option key={c.caseId} value={c.caseId}>
                      {c.caseId} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[#29323A] font-semibold">
                    Document Category
                  </label>
                  <button
                    type="button"
                    onClick={handleAiAutoClassify}
                    disabled={!file || aiClassifying}
                    className="text-[11px] text-[#29323A] hover:underline font-mono flex items-center gap-1 disabled:opacity-50 font-semibold"
                  >
                    <Sparkles className="w-3 h-3 text-[#29323A]" />
                    <span>{aiClassifying ? 'Classifying...' : 'AI Auto-Classify'}</span>
                  </button>
                </div>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-semibold"
                >
                  <option value="FIR">FIR (First Information Report)</option>
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
              </div>
            </div>

            {aiClassificationResult && (
              <div className="p-3 rounded bg-[#E7EBEE] border border-[#CBD4DA] text-[11px] text-[#29323A] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#29323A]" />
                  <span>AI Classification Result: {aiClassificationResult.documentType} (Confidence: {aiClassificationResult.confidence})</span>
                </div>
                <p className="text-[#5C6A76]">{aiClassificationResult.reason}</p>
              </div>
            )}
          </div>

          {/* Step 3: Security & Access Level */}
          <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 text-xs shadow-2xs">
            <span className="text-xs font-mono font-bold text-[#29323A] uppercase tracking-wider flex items-center gap-2">
              <span>03.</span>
              <span>Security Classification & Metadata</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Access Classification
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-semibold"
                >
                  <option value="RESTRICTED">RESTRICTED (Department & Case Team)</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL (Designated Officers Only)</option>
                  <option value="SECRET">SECRET (Judicial & Forensic Clearance Required)</option>
                  <option value="TOP SECRET">TOP SECRET (High-Security Sealed Envelope)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Brief Evidentiary Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sworn deposition regarding asset transfers..."
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-[#6A7885]">
                <span>Ingestion Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E7EBEE] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#29323A] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !file || !fileHash}
              className="px-8 py-3 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Sealing Document...' : 'Commit & Seal In Vault'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
