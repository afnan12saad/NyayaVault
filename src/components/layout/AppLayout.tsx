import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { NyayaVaultMark } from '../common/LegalIcons';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDemoMode, role, switchDemoRole } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#191817] flex flex-col font-sans selection:bg-[#6F263D] selection:text-[#FAF7F2]">
      <Navbar />

      {/* Evaluator / Demo Role Quick Ribbon */}
      {isDemoMode && (
        <div className="bg-[#FAF7F2] border-b border-[#DDD6CA] px-4 py-2 flex flex-wrap items-center justify-between text-xs text-[#191817]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F263D]" />
            <span className="font-mono text-[10px] tracking-widest text-[#7A7368] uppercase">
              INSTITUTIONAL EVALUATOR JURISDICTION:
            </span>
            <span className="text-[#4A453E] font-serif text-sm">
              Current Mandate: <strong className="text-[#191817] font-semibold">{role}</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] mt-1 sm:mt-0">
            <span className="text-[#7A7368] font-mono text-[10px] tracking-widest uppercase mr-1">Switch:</span>
            {(['admin', 'investigator', 'legal', 'forensics', 'auditor', 'viewer'] as const).map(k => (
              <button
                key={k}
                onClick={() => switchDemoRole(k)}
                className="px-2 py-0.5 border border-[#DDD6CA] bg-[#FAF7F2] hover:bg-[#191817] hover:text-[#FAF7F2] hover:border-[#191817] text-[#191817] capitalize text-[10px] font-mono transition-colors"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Mobile subheader */}
          <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-[#FAF7F2] border-b border-[#DDD6CA]">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 border border-[#DDD6CA] bg-[#FAF7F2] text-[#191817]"
            >
              <NyayaVaultMark size={16} />
            </button>
            <span className="text-[11px] font-mono text-[#7A7368] uppercase tracking-widest">
              {location.pathname.replace('/', '') || 'ARCHIVE'}
            </span>
            <div className="w-5" />
          </div>

          {/* Dynamic Page Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Legal Compliance Archival Colophon */}
          <footer className="mt-auto border-t border-[#DDD6CA] bg-[#FAF7F2] px-6 py-6 text-center text-xs text-[#7A7368]">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono tracking-widest uppercase">
                <span className="text-[#191817] font-semibold">NYAYAVAULT RECORD REPOSITORY</span>
                <span className="text-[#DDD6CA]">•</span>
                <span>CRYPTOGRAPHIC LEDGER SEAL SHA-256</span>
                <span className="text-[#DDD6CA]">•</span>
                <span className="text-[#6F263D]">STATUTORY ADMISSIBILITY READY</span>
              </div>
              <p className="font-serif italic text-xs text-[#4A453E]">
                All evidentiary submissions, chain-of-custody transfer deeds, and document inspection hashes are permanently committed to the immutable audit register under supervisory oversight.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
