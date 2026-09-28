import React from 'react';
import { Link } from 'react-router-dom';
import {
  NyayaVaultMark,
  CaseFileIcon,
  DocumentIcon,
  StatutesIcon,
  LegalInsightsIcon,
  VerificationStampIcon,
  EvidenceBoxIcon,
  AuditTrailIcon,
  LockSealIcon,
  ArrowRightIcon,
  UserOfficerIcon
} from '../components/common/LegalIcons';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#191817] flex flex-col font-sans selection:bg-[#6F263D] selection:text-[#FAF7F2]">
      {/* Editorial Folio Header */}
      <header className="border-b border-[#DDD6CA] bg-[#FAF7F2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#191817] bg-[#191817] flex items-center justify-center">
              <NyayaVaultMark size={22} accent={true} className="text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl text-[#191817] tracking-wider uppercase">
                  Nyaya<span className="font-normal italic text-[#4A453E]">Vault</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 border border-[#DDD6CA] bg-[#F3EFE6] text-[#6F263D] font-mono tracking-widest uppercase">
                  LEGAL ARCHIVE
                </span>
              </div>
              <p className="text-[10px] text-[#7A7368] font-mono tracking-tight">
                National Evidentiary Repository & Statutory Chain-of-Custody
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-mono uppercase tracking-widest text-[#4A453E] hover:text-[#191817] px-3 py-2 transition-colors border border-transparent hover:border-[#DDD6CA]"
            >
              Official Log In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] text-xs font-mono tracking-widest uppercase transition-all flex items-center gap-2 border border-[#191817]"
            >
              <span>Inspect Vault</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Modern Legal Archive × Law Journal */}
      <section className="relative pt-20 pb-20 border-b border-[#DDD6CA] bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#DDD6CA] bg-[#F3EFE6] text-[#191817] text-[11px] font-mono tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F263D]"></span>
            <span>SECTION § 65B READY · STATUTORY ADMISSIBILITY ENGINE</span>
          </div>

          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7A7368] mb-3">
            THE LAW, ORGANIZED & IMMUTABLY SEALED
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#191817] tracking-tight leading-[1.1] max-w-4xl mx-auto">
            The Digital Evidence Vault for Courts, Forensic Labs & Inquest Teams.
          </h1>

          <p className="mt-8 text-base sm:text-lg text-[#4A453E] max-w-3xl mx-auto leading-relaxed font-serif italic">
            NyayaVault safeguards the evidentiary lifecycle with client-side SHA-256 integrity digests, cryptographic custody transfers, role-based jurisprudence, and judicial record intelligence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#191817]"
            >
              <span>Access Case Repository</span>
              <ArrowRightIcon size={15} />
            </Link>
            <Link
              to="/verify"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#191817] text-[#191817] font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              <VerificationStampIcon size={15} />
              <span>Verify Cryptographic Hash</span>
            </Link>
          </div>

          {/* Archival Ledger Metric Tiles */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 border border-[#DDD6CA] bg-[#F3EFE6]">
              <div className="text-[#6F263D] font-mono text-[10px] tracking-widest uppercase font-semibold">§ 01 HASH INTEGRITY</div>
              <div className="text-base font-serif font-bold text-[#191817] mt-1">SHA-256 Proofs</div>
              <div className="text-[11px] text-[#7A7368] font-sans mt-0.5">Instant tamper detection</div>
            </div>
            <div className="p-4 border border-[#DDD6CA] bg-[#F3EFE6]">
              <div className="text-[#6F263D] font-mono text-[10px] tracking-widest uppercase font-semibold">§ 02 JURISDICTION</div>
              <div className="text-base font-serif font-bold text-[#191817] mt-1">Granular RBAC</div>
              <div className="text-[11px] text-[#7A7368] font-sans mt-0.5">6 strict operational actors</div>
            </div>
            <div className="p-4 border border-[#DDD6CA] bg-[#F3EFE6]">
              <div className="text-[#6F263D] font-mono text-[10px] tracking-widest uppercase font-semibold">§ 03 CHAIN OF CUSTODY</div>
              <div className="text-base font-serif font-bold text-[#191817] mt-1">Audit Ledger</div>
              <div className="text-[11px] text-[#7A7368] font-sans mt-0.5">Non-repudiable transfer log</div>
            </div>
            <div className="p-4 border border-[#DDD6CA] bg-[#F3EFE6]">
              <div className="text-[#6F263D] font-mono text-[10px] tracking-widest uppercase font-semibold">§ 04 INTELLIGENCE</div>
              <div className="text-base font-serif font-bold text-[#191817] mt-1">Gemini AI Inquest</div>
              <div className="text-[11px] text-[#7A7368] font-sans mt-0.5">Case summaries & classification</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Archival Lifecycle Flow */}
      <section className="py-18 bg-[#F3EFE6] border-b border-[#DDD6CA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase text-[#6F263D] tracking-widest">
              ARCHIVAL LIFECYCLE
            </span>
            <h2 className="text-3xl font-serif text-[#191817] mt-2">
              From Field Acquisition to Courtroom Admissibility
            </h2>
            <p className="text-sm font-serif italic text-[#4A453E] mt-2">
              Every document is ingested, digested into cryptographic fingerprints, tracked through strict custody, and preserved for judicial presentation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: '§ I', title: 'Lodge & Ingest', desc: 'Case binding with metadata validation' },
              { step: '§ II', title: 'Digest & Hash', desc: 'SHA-256 fingerprint generation at entry' },
              { step: '§ III', title: 'AI Classify', desc: 'Auto-detection of FIRs, statements & filings' },
              { step: '§ IV', title: 'Seal & Store', desc: 'Firestore rules & access policy enforcement' },
              { step: '§ V', title: 'Index & Search', desc: 'Case metadata & deep content queries' },
              { step: '§ VI', title: 'Audit & Archive', desc: 'Immutable action trail & custody logs' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#6F263D] font-bold">{item.step}</span>
                  <h3 className="font-serif font-bold text-base text-[#191817] mt-1">{item.title}</h3>
                </div>
                <p className="text-xs text-[#59534B] mt-3 font-sans leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars & Institutional Capabilities */}
      <section className="py-20 bg-[#FAF7F2] border-b border-[#DDD6CA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#F3EFE6] border border-[#DDD6CA]">
              <div className="w-10 h-10 border border-[#191817] bg-[#191817] flex items-center justify-center text-[#FAF7F2] mb-5">
                <CaseFileIcon size={20} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#191817]">Comprehensive Legal Document Types</h3>
              <p className="text-xs text-[#59534B] font-sans mt-3 leading-relaxed">
                Dedicated support for First Information Reports (FIRs), police case diaries, forensic laboratory findings, charge sheets, witness affidavits, and judicial bail orders.
              </p>
            </div>

            <div className="p-8 bg-[#F3EFE6] border border-[#DDD6CA]">
              <div className="w-10 h-10 border border-[#191817] bg-[#191817] flex items-center justify-center text-[#FAF7F2] mb-5">
                <LockSealIcon size={20} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#191817]">Tamper-Proof Version Registry</h3>
              <p className="text-xs text-[#59534B] font-sans mt-3 leading-relaxed">
                Complete linear versioning tracks changes with uploader identity, cryptographic hashes, and strict version comparison tools preventing unauthorized alterations.
              </p>
            </div>

            <div className="p-8 bg-[#F3EFE6] border border-[#DDD6CA]">
              <div className="w-10 h-10 border border-[#191817] bg-[#191817] flex items-center justify-center text-[#FAF7F2] mb-5">
                <AuditTrailIcon size={20} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#191817]">Custody & Audit Registry</h3>
              <p className="text-xs text-[#59534B] font-sans mt-3 leading-relaxed">
                Tracks physical and digital custody transfers with millisecond timestamps, authorized receiving officers, and non-repudiable logs that withstand courtroom scrutiny.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Demonstration Console */}
      <section className="py-14 bg-[#F3EFE6] border-b border-[#DDD6CA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 bg-[#FAF7F2] border border-[#DDD6CA]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase font-semibold text-[#6F263D]">
                  <UserOfficerIcon size={14} />
                  <span>JURISDICTIONAL ACTOR PROFILES</span>
                </div>
                <h4 className="text-2xl font-serif font-bold text-[#191817] mt-1">Pre-Seeded Operational Evaluator Logins</h4>
                <p className="text-xs font-serif italic text-[#4A453E] mt-2 max-w-xl">
                  Inspect NyayaVault under the mandate of Super Admin, Investigating Officer, Legal Officer, Forensic Officer, Auditor, or Viewer with pre-seeded real cases and records.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-[#191817] hover:bg-[#2C2926] text-[#FAF7F2] text-xs font-mono tracking-widest uppercase transition-colors text-center border border-[#191817]"
                >
                  Actor Logins
                </Link>
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#191817] text-[#191817] text-xs font-mono tracking-widest uppercase transition-colors text-center"
                >
                  Repository Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archival Journal Colophon Footer */}
      <footer className="mt-auto bg-[#191817] text-[#E8E2D7] py-10 border-t border-[#2C2926]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-2 text-[#DDD6CA]">
            <NyayaVaultMark size={16} accent={true} />
            <span>NYAYAVAULT SECURE LEGAL ARCHIVE · LAW ENFORCEMENT & JUDICIAL PLATFORM</span>
          </div>
          <div className="text-[#8F877B]">
            FIRESTORE RESTRICTED · CRYPTOGRAPHIC SHA-256 LEDGER · GEMINI 3.8
          </div>
        </div>
      </footer>
    </div>
  );
};
