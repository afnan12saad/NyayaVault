import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  NyayaVaultMark,
  CaseFileIcon,
  DocumentIcon,
  StatutesIcon,
  LegalInsightsIcon,
  SearchInspectionIcon,
  EvidenceBoxIcon,
  VerificationStampIcon,
  ShareGrantIcon,
  AuditTrailIcon,
  ComplianceIcon,
  AdminConsoleIcon,
  SettingsIcon,
  UserOfficerIcon,
  UploadArchiveIcon
} from '../common/LegalIcons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER ADMIN';

  const sections = [
    {
      title: '01 · ARCHIVAL REPOSITORY',
      items: [
        { to: '/dashboard', label: 'Archival Overview', icon: StatutesIcon, exact: true },
        { to: '/cases', label: 'Case Folios', icon: CaseFileIcon },
        { to: '/documents', label: 'Archived Documents', icon: DocumentIcon },
        { to: '/upload', label: 'Lodge New Record', icon: UploadArchiveIcon, hide: role === 'VIEWER' },
        { to: '/search', label: 'Inspection Search', icon: SearchInspectionIcon },
      ]
    },
    {
      title: '02 · FORENSIC & INTEGRITY',
      items: [
        { to: '/evidence', label: 'Custody Chain & Seals', icon: EvidenceBoxIcon },
        { to: '/verify', label: 'Cryptographic Audit', icon: VerificationStampIcon },
        { to: '/shares', label: 'Jurisdictional Grants', icon: ShareGrantIcon },
        { to: '/ai-intelligence', label: 'Judicial Intelligence', icon: LegalInsightsIcon },
      ]
    },
    {
      title: '03 · GOVERNANCE & AUDIT',
      items: [
        { to: '/audit', label: 'Immutable Audit Trail', icon: AuditTrailIcon },
        { to: '/compliance', label: 'Statutory Compliance', icon: ComplianceIcon },
        ...(isSuperAdmin ? [
          { to: '/admin', label: 'Chief Admin Console', icon: AdminConsoleIcon },
          { to: '/admin/users', label: 'Officer Credentials', icon: UserOfficerIcon },
        ] : []),
        { to: '/settings', label: 'Registry Settings', icon: SettingsIcon },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#191817]/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#191817] text-[#E8E2D7] border-r border-[#2C2926] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Officer Credential Badge */}
        <div className="p-4 border-b border-[#2C2926] bg-[#141312]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-[#8F877B] uppercase">
              MEMBER JURISDICTION
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6F263D]"></span>
          </div>
          <div className="text-xs font-serif font-medium text-[#FAF7F2] mt-1 tracking-wide truncate">
            {role}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 font-mono text-[9px] tracking-widest text-[#7A7368] uppercase flex items-center gap-1.5">
                <span>{section.title}</span>
              </div>

              {section.items.filter(item => !item.hide).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    end={item.exact}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 text-xs transition-colors rounded-none border-l-2 ${
                        isActive
                          ? 'border-[#6F263D] bg-[#22201D] text-[#FAF7F2] font-medium'
                          : 'border-transparent text-[#B5AEA2] hover:text-[#FAF7F2] hover:bg-[#1E1C1A]'
                      }`
                    }
                  >
                    <Icon className="shrink-0 transition-colors" size={16} />
                    <span className="tracking-wide text-xs truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Archival Ledger Status Footer */}
        <div className="p-3 border-t border-[#2C2926] text-[10px] text-[#8F877B] font-mono space-y-1 bg-[#141312]">
          <div className="flex items-center justify-between">
            <span className="tracking-wider">REGISTER:</span>
            <span className="text-[#FAF7F2] font-semibold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="tracking-wider">SEAL STANDARD:</span>
            <span className="text-[#E8E2D7]">SHA-256</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="tracking-wider">INTELLIGENCE:</span>
            <span className="text-[#E8E2D7]">GEMINI 3.8</span>
          </div>
        </div>
      </aside>
    </>
  );
};
