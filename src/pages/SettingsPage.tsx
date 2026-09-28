import React from 'react';
import {
  Settings,
  Lock,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { userProfile, role, department } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D7DFE4]">
        <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
          System Configuration & Standards
        </div>
        <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#29323A]" />
          <span>Security & System Settings</span>
        </h1>
        <p className="text-xs text-[#5C6A76] mt-1">
          Cryptographic standards, statutory retention policies, and jurisdictional network configuration.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBEE]">
          <UserCheck className="w-5 h-5 text-[#29323A]" />
          <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
            Active Officer Credential Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#6A7885] block">Full Legal Name:</span>
            <span className="text-[#29323A] font-semibold text-sm">{userProfile?.fullName}</span>
          </div>
          <div>
            <span className="text-[#6A7885] block">Official Badge / Officer ID:</span>
            <span className="text-[#29323A] font-mono font-semibold text-sm">{userProfile?.officerId}</span>
          </div>
          <div>
            <span className="text-[#6A7885] block">Department Jurisdiction:</span>
            <span className="text-[#29323A] font-medium">{department}</span>
          </div>
          <div>
            <span className="text-[#6A7885] block">Assigned RBAC Role:</span>
            <span className="text-[#29323A] font-mono font-semibold">{role}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[#6A7885] block">Official Government Email:</span>
            <span className="text-[#29323A] font-mono">{userProfile?.email}</span>
          </div>
        </div>
      </div>

      {/* Cryptographic Standards */}
      <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBEE]">
          <Lock className="w-5 h-5 text-[#29323A]" />
          <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
            Cryptographic Integrity Standard
          </h2>
        </div>

        <div className="space-y-3 text-[#5C6A76]">
          <div className="flex items-center justify-between p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <div>
              <div className="font-semibold text-[#29323A]">Primary Digest Algorithm</div>
              <div className="text-[11px] text-[#6A7885]">Native Web Cryptography API & Node.js Crypto</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA] font-mono font-semibold">
              SHA-256 (256-bit)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <div>
              <div className="font-semibold text-[#29323A]">Audit Trail Storage Architecture</div>
              <div className="text-[11px] text-[#6A7885]">Strictly append-only write rules (update/delete blocked)</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA] font-mono font-semibold">
              IMMUTABLE FIRESTORE
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
            <div>
              <div className="font-semibold text-[#29323A]">Neural Intelligence Provider</div>
              <div className="text-[11px] text-[#6A7885]">Server-side proxy strictly isolating API credentials</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA] font-mono font-semibold">
              GEMINI-3.8-FLASH
            </span>
          </div>
        </div>
      </div>

      {/* Retention Policy Guidelines */}
      <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBEE]">
          <Clock className="w-5 h-5 text-[#29323A]" />
          <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
            Document Lifecycle & Statutory Retention
          </h2>
        </div>

        <p className="text-[#5C6A76] leading-relaxed">
          In accordance with Section 28 of the system charter, documents are never automatically deleted based on arbitrary AI decisions. Explicit retention policies apply:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-1">
            <span className="font-mono text-[#29323A] uppercase text-[10px] font-bold">ACTIVE CASING</span>
            <div className="font-semibold text-[#29323A]">Indefinite Retention</div>
            <p className="text-[11px] text-[#6A7885]">Available to investigating officers and trial prosecutors.</p>
          </div>

          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-1">
            <span className="font-mono text-[#29323A] uppercase text-[10px] font-bold">PERMANENT RECORD</span>
            <div className="font-semibold text-[#29323A]">Judicial Archive</div>
            <p className="text-[11px] text-[#6A7885]">FIRs, judgments, and sealed forensic reports preserved permanently.</p>
          </div>

          <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-1">
            <span className="font-mono text-[#29323A] uppercase text-[10px] font-bold">SEALED EXCLUSION</span>
            <div className="font-semibold text-[#29323A]">Court Order Required</div>
            <p className="text-[11px] text-[#6A7885]">Unsealing requires affirmative magistrate warrant.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
