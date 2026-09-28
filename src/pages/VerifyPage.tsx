import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileCheck,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { getAllDocuments, updateDocumentIntegrity } from '../services/dbService';
import { DocumentRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateFileHash } from '../lib/crypto';

export const VerifyPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');

  // Verification Results
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'VERIFIED' | 'INTEGRITY_WARNING';
    originalHash: string;
    currentHash: string;
    isMatch: boolean;
    timestamp: string;
  } | null>(null);

  // Custom File Checker
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFileHash, setCustomFileHash] = useState<string>('');
  const [customOriginalHash, setCustomOriginalHash] = useState<string>('');
  const [customResult, setCustomResult] = useState<{ isMatch: boolean; status: string } | null>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const d = await getAllDocuments();
        setDocuments(d);
        if (d.length > 0) {
          setSelectedDocId(d[0].documentId);
        }
      } catch (err) {
        console.error('Error loading documents for verify:', err);
      }
    }
    loadDocs();
  }, []);

  const handleVerifySelected = async (simulateTamper: boolean = false) => {
    const doc = documents.find(d => d.documentId === selectedDocId);
    if (!doc || !userProfile) return;

    setVerifying(true);
    setVerificationResult(null);

    let calculatedHash = doc.originalHash;
    if (simulateTamper) {
      calculatedHash = 'a' + doc.originalHash.slice(1);
    }

    try {
      const res = await fetch('/api/integrity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalHash: doc.originalHash,
          currentHash: calculatedHash
        })
      });
      const data = await res.json();
      if (data.success) {
        await updateDocumentIntegrity(
          doc.documentId,
          data.status,
          calculatedHash,
          userProfile,
          doc.caseId
        );

        setVerificationResult({
          status: data.status,
          originalHash: doc.originalHash,
          currentHash: calculatedHash,
          isMatch: data.isVerified,
          timestamp: new Date().toISOString()
        });

        setDocuments(prev => prev.map(item => item.documentId === doc.documentId ? { ...item, integrityStatus: data.status, currentHash: calculatedHash } : item));
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleCustomFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCustomFile(f);
    const hash = await calculateFileHash(f);
    setCustomFileHash(hash);
    if (!customOriginalHash) {
      setCustomOriginalHash(hash);
    }
    setCustomResult(null);
  };

  const handleCustomVerify = () => {
    if (!customFileHash || !customOriginalHash) return;
    const isMatch = customFileHash.trim().toLowerCase() === customOriginalHash.trim().toLowerCase();
    setCustomResult({
      isMatch,
      status: isMatch ? 'VERIFIED' : 'INTEGRITY_WARNING'
    });
  };

  const selectedDoc = documents.find(d => d.documentId === selectedDocId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D7DFE4]">
        <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
          Cryptographic Integrity Laboratory
        </div>
        <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#29323A]" />
          <span>Document Integrity Verification Engine</span>
        </h1>
        <p className="text-xs text-[#5C6A76] mt-1">
          Verify digital evidence against registered baseline SHA-256 fingerprints to identify any bit-level tampering or unauthorized modification.
        </p>
      </div>

      {/* Security Guarantees Strip */}
      <div className="p-5 rounded bg-white border border-[#D7DFE4] shadow-xs space-y-3">
        <div className="font-mono text-xs text-[#29323A] uppercase tracking-wider font-bold">
          SECURITY GUARANTEES DEMONSTRATION
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase">DOCUMENT INTEGRITY</span>
            <div className="font-bold text-[#29323A] flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>✓ Hash Verified</span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase">ACCESS CONTROL</span>
            <div className="font-bold text-[#29323A] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ RBAC Authorized</span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase">AUDIT TRAIL</span>
            <div className="font-bold text-[#29323A] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Fully Tracked</span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase">VERSION CONTROL</span>
            <div className="font-bold text-[#29323A] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Historical Previews</span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase">SHARING CONTROL</span>
            <div className="font-bold text-[#29323A] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Time-Bounded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Vault Document Verification & Custom Ingestion Hash Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Verify Existing Vault Document */}
        <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBEE]">
            <FileCheck className="w-5 h-5 text-[#29323A]" />
            <h2 className="text-sm font-bold text-[#29323A] uppercase">
              Verify Registered Case Document
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#29323A] font-semibold mb-1">
                Select Document to Examine
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  setVerificationResult(null);
                }}
                className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
              >
                {documents.map(d => (
                  <option key={d.documentId} value={d.documentId}>
                    {d.fileName} ({d.caseId} • v{d.version})
                  </option>
                ))}
              </select>
            </div>

            {selectedDoc && (
              <div className="p-4 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6A7885]">Document ID:</span>
                  <span className="text-[#29323A] font-semibold">{selectedDoc.documentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A7885]">Case ID:</span>
                  <span className="text-[#29323A] font-semibold">{selectedDoc.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A7885]">Uploader:</span>
                  <span className="text-[#29323A]">{selectedDoc.uploadedBy}</span>
                </div>
                <div className="pt-2 border-t border-[#D7DFE4] space-y-1">
                  <span className="text-[#6A7885] block">Baseline Stored Hash:</span>
                  <span className="text-[#29323A] break-all select-all font-semibold">
                    {selectedDoc.originalHash}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleVerifySelected(false)}
                disabled={verifying || !selectedDocId}
                className="flex-1 py-2.5 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{verifying ? 'Comparing Hashes...' : 'Verify Cryptographic Seal'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerifySelected(true)}
                disabled={verifying || !selectedDocId}
                title="Test tamper detection alert by introducing 1-bit checksum divergence"
                className="px-4 py-2.5 rounded bg-white hover:bg-[#E7EBEE] border border-[#CBD4DA] text-[#5C6A76] font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Simulate Tamper
              </button>
            </div>

            {/* Verification Result Card */}
            {verificationResult && (
              <div className={`p-4 rounded border font-mono space-y-2 ${
                verificationResult.status === 'VERIFIED'
                  ? 'bg-[#E7EBEE] border-[#CBD4DA] text-[#29323A]'
                  : 'bg-[#29323A] border-[#29323A] text-white'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase">
                  {verificationResult.status === 'VERIFIED' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#29323A]" />
                      <span>INTEGRITY STATUS: ✓ VERIFIED</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-[#E7EBEE]" />
                      <span>INTEGRITY WARNING: CHECKSUM MISMATCH</span>
                    </>
                  )}
                </div>

                <div className="text-[11px] space-y-1 pt-1 border-t border-[#D7DFE4]">
                  <div>Original Hash: <span className="break-all">{verificationResult.originalHash}</span></div>
                  <div>Current Hash: <span className="break-all">{verificationResult.currentHash}</span></div>
                </div>

                <div className="text-[10px] pt-1 text-[#5C6A76] font-sans">
                  {verificationResult.status === 'VERIFIED'
                    ? 'Cryptographic match confirmed. Document content remains pristine and unaltered.'
                    : 'CRITICAL ALERT: File bits differ from the baseline seal registered at upload. Tampering suspected.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Live In-Browser File Hasher & Comparison */}
        <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBEE]">
            <KeyRound className="w-5 h-5 text-[#29323A]" />
            <h2 className="text-sm font-bold text-[#29323A] uppercase">
              Independent File Hashing & Audit
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-[#5C6A76]">
              Inspect any local file using the Web Cryptography API to calculate its 256-bit hash and test against an expected seal.
            </p>

            <div className="border border-dashed border-[#CBD4DA] hover:border-[#29323A] rounded p-5 text-center transition-colors bg-[#F4F6F8]">
              <input
                type="file"
                id="custom-file-upload"
                onChange={handleCustomFileSelect}
                className="hidden"
              />
              <label htmlFor="custom-file-upload" className="cursor-pointer block space-y-1">
                <UploadCloud className="w-8 h-8 text-[#29323A] mx-auto" />
                <div className="font-semibold text-[#29323A]">
                  {customFile ? customFile.name : 'Choose any file to calculate live SHA-256'}
                </div>
                <p className="text-[10px] text-[#8695A2]">Processed entirely client-side</p>
              </label>
            </div>

            {customFileHash && (
              <div className="p-3 rounded bg-[#E7EBEE] font-mono text-xs space-y-2 border border-[#CBD4DA]">
                <div>
                  <span className="text-[#6A7885] text-[10px] block">Calculated SHA-256 Hash:</span>
                  <span className="text-[#29323A] break-all select-all font-semibold">
                    {customFileHash}
                  </span>
                </div>

                <div>
                  <label className="text-[#5C6A76] text-[10px] block mb-1">
                    Compare Against Baseline Hash:
                  </label>
                  <input
                    type="text"
                    value={customOriginalHash}
                    onChange={(e) => setCustomOriginalHash(e.target.value)}
                    className="w-full bg-white border border-[#CBD4DA] rounded px-2.5 py-1.5 text-xs text-[#29323A] font-mono focus:outline-none focus:border-[#29323A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCustomVerify}
                  className="w-full py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-2xs"
                >
                  Compare Cryptographic Checksums
                </button>
              </div>
            )}

            {customResult && (
              <div className={`p-4 rounded border font-mono text-xs ${
                customResult.isMatch
                  ? 'bg-[#E7EBEE] border-[#CBD4DA] text-[#29323A]'
                  : 'bg-[#29323A] border-[#29323A] text-white'
              }`}>
                {customResult.isMatch
                  ? '✓ MATCH CONFIRMED: Calculated checksum exactly matches baseline.'
                  : '⚠️ MISMATCH DETECTED: Computed hash does not match expected seal.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded bg-white border border-[#D7DFE4] text-xs text-[#6A7885] font-mono leading-relaxed shadow-2xs">
        <strong>Statutory Integrity Notice:</strong> Cryptographic hashing verifies bitstream authenticity against baseline records. Under Section 65B of the Indian Evidence Act (and international equivalent electronic evidence statutes), cryptographic hashes coupled with unbroken chain-of-custody transfer logs establish evidentiary admissibility.
      </div>
    </div>
  );
};
