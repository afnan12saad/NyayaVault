import React, { useState, useEffect } from 'react';
import {
  Box,
  Plus,
  ArrowRight,
  History,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAllEvidence,
  getCustodyTransfers,
  transferCustody,
  createEvidenceItem,
  getCases
} from '../services/dbService';
import { EvidenceRecord, CustodyTransferRecord, CaseRecord } from '../types';

export const EvidencePage: React.FC = () => {
  const { userProfile, role } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  const [custodyHistory, setCustodyHistory] = useState<CustodyTransferRecord[]>([]);

  // New Evidence Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCaseId, setNewCaseId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('Digital Storage Media');
  const [newLocation, setNewLocation] = useState('');
  const [newCustodian, setNewCustodian] = useState('');

  // Transfer Custody Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('Forensic Lab Analysis');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const canManageEvidence = role === 'SUPER ADMIN' || role === 'FORENSIC OFFICER' || role === 'INVESTIGATING OFFICER';

  const loadData = async () => {
    try {
      const [e, c] = await Promise.all([
        getAllEvidence(),
        getCases()
      ]);
      setEvidenceList(e);
      setCases(c);
      if (c.length > 0 && !newCaseId) {
        setNewCaseId(c[0].caseId);
      }
      if (e.length > 0 && !selectedEvidence) {
        setSelectedEvidence(e[0]);
        const transfers = await getCustodyTransfers(e[0].evidenceId);
        setCustodyHistory(transfers);
      }
    } catch (err) {
      console.error('Error loading evidence:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectEvidence = async (ev: EvidenceRecord) => {
    setSelectedEvidence(ev);
    const transfers = await getCustodyTransfers(ev.evidenceId);
    setCustodyHistory(transfers);
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseId || !newDesc || !newLocation || !userProfile) return;
    try {
      const evId = `EV-${Math.floor(1000 + Math.random() * 9000)}`;
      const evRecord: EvidenceRecord = {
        evidenceId: evId,
        caseId: newCaseId,
        description: newDesc,
        evidenceType: newType,
        collectedBy: userProfile.fullName,
        collectedByUid: userProfile.uid,
        collectionDate: new Date().toISOString(),
        location: newLocation,
        currentCustodian: newCustodian || userProfile.fullName,
        status: 'Collected',
        integrityHash: `SEAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };
      await createEvidenceItem(evRecord, userProfile);
      setIsNewModalOpen(false);
      setNewDesc('');
      setNewLocation('');
      await loadData();
    } catch (err) {
      console.error('Create evidence error:', err);
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvidence || !userProfile || !transferTo) return;
    setTransferSubmitting(true);
    try {
      const transferId = `CUST-${Date.now()}`;
      const tokenRes = await fetch('/api/custody/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId: selectedEvidence.evidenceId,
          from: selectedEvidence.currentCustodian,
          to: transferTo
        })
      });
      const tokenData = await tokenRes.json();

      const transferRecord: CustodyTransferRecord = {
        transferId,
        evidenceId: selectedEvidence.evidenceId,
        caseId: selectedEvidence.caseId,
        transferredFrom: selectedEvidence.currentCustodian,
        transferredTo: transferTo,
        transferDate: new Date().toISOString(),
        purpose: transferPurpose,
        verificationHash: tokenData.token || `TOK-${Math.random().toString(36).substring(2, 8)}`,
        notes: transferNotes || 'Formal transfer between authorized custodians.',
        recordedByUid: userProfile.uid
      };

      await transferCustody(
        transferRecord,
        transferTo,
        transferPurpose.includes('Lab') ? 'Examined' : 'Transferred',
        userProfile
      );

      setIsTransferModalOpen(false);
      setTransferTo('');
      setTransferNotes('');
      setSelectedEvidence(prev => prev ? { ...prev, currentCustodian: transferTo, status: 'Transferred' } : null);
      const updatedTransfers = await getCustodyTransfers(selectedEvidence.evidenceId);
      setCustodyHistory(updatedTransfers);
      await loadData();
    } catch (err) {
      console.error('Custody transfer failed:', err);
    } finally {
      setTransferSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D7DFE4]">
        <div>
          <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
            Evidence Vault & Chain of Custody
          </div>
          <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
            <Box className="w-6 h-6 text-[#29323A]" />
            <span>Forensic Evidence & Chain of Custody</span>
          </h1>
          <p className="text-xs text-[#5C6A76] mt-1">
            Traceable physical and digital evidence items with immutable handover logs.
          </p>
        </div>

        {canManageEvidence && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Evidence</span>
          </button>
        )}
      </div>

      {/* Main Split: Evidence Catalog & Chain of Custody Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Evidence Items List */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-[#29323A] font-bold block">
            Cataloged Exhibits ({evidenceList.length})
          </span>

          <div className="space-y-3">
            {evidenceList.map(ev => (
              <div
                key={ev.evidenceId}
                onClick={() => handleSelectEvidence(ev)}
                className={`p-4 rounded border cursor-pointer transition-all text-xs space-y-2 shadow-2xs ${
                  selectedEvidence?.evidenceId === ev.evidenceId
                    ? 'bg-[#E7EBEE] border-[#29323A]'
                    : 'bg-white border-[#D7DFE4] hover:border-[#BAC6CE]'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-[#29323A]">{ev.evidenceId}</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[#29323A] border border-[#CBD4DA] text-[10px] font-semibold">
                    {ev.status}
                  </span>
                </div>
                <h4 className="font-semibold text-[#29323A] line-clamp-2">{ev.description}</h4>
                <div className="pt-2 border-t border-[#D7DFE4] text-[11px] text-[#5C6A76] space-y-0.5 font-mono">
                  <div>Case: <span className="text-[#29323A] font-semibold">{ev.caseId}</span></div>
                  <div>Custodian: <strong className="text-[#29323A]">{ev.currentCustodian}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chain of Custody Detail & Handover Workflow */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEvidence ? (
            <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-6 shadow-2xs">
              {/* Evidence Detail Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-[#E7EBEE]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold text-[#29323A] bg-[#E7EBEE] px-2 py-0.5 rounded border border-[#CBD4DA]">
                      EXHIBIT #{selectedEvidence.evidenceId}
                    </span>
                    <span className="text-[#6A7885]">• Case {selectedEvidence.caseId}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#29323A]">
                    {selectedEvidence.description}
                  </h2>
                  <div className="text-xs text-[#5C6A76] space-y-1 pt-1 font-mono">
                    <div>Type: <strong className="text-[#29323A]">{selectedEvidence.evidenceType}</strong></div>
                    <div>Recovery Location: {selectedEvidence.location}</div>
                    <div>Collected By: {selectedEvidence.collectedBy} on {new Date(selectedEvidence.collectionDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {canManageEvidence && (
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-4 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Transfer Custody</span>
                  </button>
                )}
              </div>

              {/* Chain of Custody Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase text-[#29323A] font-bold tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-[#29323A]" />
                    <span>Chain of Custody Handover Log ({custodyHistory.length} Events)</span>
                  </h3>
                  <span className="text-[10px] text-[#6A7885] font-mono">Append-Only Immutability</span>
                </div>

                <div className="relative pl-6 border-l-2 border-[#CBD4DA] space-y-6">
                  {custodyHistory.map((t) => (
                    <div key={t.transferId} className="relative space-y-1 text-xs">
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-[#29323A] border-4 border-white" />
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-semibold text-[#29323A]">
                          {new Date(t.transferDate).toLocaleDateString()} • {new Date(t.transferDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[#8695A2]">{t.transferId}</span>
                      </div>

                      <div className="font-semibold text-[#29323A] text-xs">
                        From: <span className="text-[#5C6A76]">{t.transferredFrom}</span> → To:{' '}
                        <span className="text-[#29323A] font-bold">{t.transferredTo}</span>
                      </div>

                      <p className="text-[#5C6A76] text-[11px]">{t.purpose}</p>
                      {t.notes && <p className="text-[#8695A2] text-[10px] italic">{t.notes}</p>}

                      <div className="pt-1 font-mono text-[10px] text-[#29323A] font-semibold">
                        Token Seal: {t.verificationHash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-[#D7DFE4] rounded text-[#6A7885] text-xs">
              Select an evidence exhibit to view its complete chain-of-custody transfer log.
            </div>
          )}
        </div>
      </div>

      {/* Transfer Custody Modal */}
      {isTransferModalOpen && selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-[#29323A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD4DA] rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 text-[#29323A]">
            <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-[#29323A]" />
                <h3 className="text-base font-bold text-[#29323A]">
                  Execute Chain of Custody Handover
                </h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-[#8695A2] hover:text-[#29323A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#5C6A76] mb-1">Current Custodian:</label>
                <div className="p-2.5 rounded bg-[#F4F6F8] font-semibold text-[#29323A] border border-[#D7DFE4]">
                  {selectedEvidence.currentCustodian}
                </div>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Receiving Custodian / Institution
                </label>
                <input
                  type="text"
                  required
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="e.g. Dr. Sen (CFSL) or Special Sessions Court Vault"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Purpose of Transfer
                </label>
                <select
                  value={transferPurpose}
                  onChange={(e) => setTransferPurpose(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  <option value="Forensic Lab Analysis">Forensic Lab Analysis</option>
                  <option value="Court Exhibit Production">Court Exhibit Production</option>
                  <option value="Secure Repository Custody">Secure Repository Custody</option>
                  <option value="Investigation Officer Inspection">Investigation Officer Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Physical Seal Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Verification of unbroken security seal, barcode check..."
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-[#E7EBEE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#F4F6F8] text-[#5C6A76] border border-[#CBD4DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  className="px-5 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold uppercase tracking-wider shadow-2xs"
                >
                  {transferSubmitting ? 'Signing Handover...' : 'Sign & Record Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record New Evidence Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29323A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD4DA] rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 text-[#29323A]">
            <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-[#29323A]" />
                <h3 className="text-base font-bold text-[#29323A]">
                  Log Evidence Exhibit
                </h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-[#8695A2] hover:text-[#29323A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Investigation Case
                </label>
                <select
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  {cases.map(c => (
                    <option key={c.caseId} value={c.caseId}>
                      {c.caseId} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Exhibit Description
                </label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Encrypted SSD recovered from server rack..."
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#29323A] font-semibold mb-1">
                    Evidence Type
                  </label>
                  <input
                    type="text"
                    required
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="e.g. Digital Storage Media"
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[#29323A] font-semibold mb-1">
                    Location Recovered
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Corporate HQ, Room 402"
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7EBEE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#F4F6F8] text-[#5C6A76] border border-[#CBD4DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold uppercase tracking-wider shadow-2xs"
                >
                  Record Exhibit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
