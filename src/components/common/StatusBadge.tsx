import React from 'react';
import { IntegrityStatus, DocumentStatus, CaseStatus, CasePriority } from '../../types';
import {
  VerificationStampIcon,
  AlertWarningIcon,
  LockSealIcon,
  DocumentIcon,
  EvidenceBoxIcon
} from './LegalIcons';

export const IntegrityBadge: React.FC<{
  status: IntegrityStatus;
  hash?: string;
  size?: 'sm' | 'md';
}> = ({ status, hash, size = 'sm' }) => {
  const isSm = size === 'sm';
  if (status === 'VERIFIED') {
    return (
      <span
        title={hash ? `Cryptographic Hash: ${hash}` : 'SHA-256 Checksum Verified · Cryptographically Intact'}
        className={`inline-flex items-center gap-1.5 font-mono tracking-wider border ${
          isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        } bg-[#FAF7F2] text-[#191817] border-[#DDD6CA] shadow-2xs`}
      >
        <VerificationStampIcon size={isSm ? 13 : 15} />
        <span className="font-semibold tracking-widest text-[#191817]">VERIFIED</span>
      </span>
    );
  }

  if (status === 'INTEGRITY_WARNING') {
    return (
      <span
        title="CRITICAL: Hash mismatch detected. Tampering or record corruption suspected."
        className={`inline-flex items-center gap-1.5 font-mono tracking-wider border ${
          isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        } bg-[#F7EFF1] text-[#6F263D] border-[#E5CCD4] shadow-2xs font-semibold`}
      >
        <AlertWarningIcon size={isSm ? 13 : 15} />
        <span className="tracking-widest">INTEGRITY WARNING</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono tracking-wider border ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } bg-[#FAF7F2] text-[#7A7368] border-[#E8E2D7]`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91]"></span>
      <span className="tracking-widest">UNVERIFIED</span>
    </span>
  );
};

export const DocumentStatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  const styles: Record<DocumentStatus, { bg: string; text: string; border: string; iconRender?: () => React.ReactNode }> = {
    'DRAFT': {
      bg: 'bg-[#FAF7F2]',
      text: 'text-[#645F59]',
      border: 'border-[#DDD6CA]',
      iconRender: () => <DocumentIcon size={12} className="text-[#8C8477]" />
    },
    'UNDER REVIEW': {
      bg: 'bg-[#F4EFE6]',
      text: 'text-[#191817]',
      border: 'border-[#C8BFB0]',
      iconRender: () => <span className="w-1.5 h-1.5 rounded-full bg-[#6F263D]"></span>
    },
    'VERIFIED': {
      bg: 'bg-[#191817]',
      text: 'text-[#FAF7F2]',
      border: 'border-[#191817]',
      iconRender: () => <VerificationStampIcon size={12} />
    },
    'SEALED': {
      bg: 'bg-[#F7EFF1]',
      text: 'text-[#6F263D]',
      border: 'border-[#E5CCD4]',
      iconRender: () => <LockSealIcon size={12} className="text-[#6F263D]" />
    },
    'ARCHIVED': {
      bg: 'bg-[#EAE4D7]',
      text: 'text-[#5A554D]',
      border: 'border-[#D5CDBD]',
      iconRender: () => <EvidenceBoxIcon size={12} className="text-[#7A7368]" />
    },
  };

  const current = styles[status] || styles['DRAFT'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono tracking-wide border ${current.bg} ${current.text} ${current.border}`}>
      {current.iconRender && current.iconRender()}
      <span className="uppercase">{status}</span>
    </span>
  );
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const colors: Record<CaseStatus, string> = {
    'Open': 'bg-[#FAF7F2] text-[#191817] border-[#191817]',
    'Under Investigation': 'bg-[#191817] text-[#FAF7F2] border-[#191817]',
    'Under Review': 'bg-[#F4EFE6] text-[#6F263D] border-[#E5CCD4] font-medium',
    'Submitted': 'bg-[#FAF7F2] text-[#191817] border-[#DDD6CA]',
    'Closed': 'bg-[#EAE4D7] text-[#645F59] border-[#D5CDBD]',
    'Archived': 'bg-[#E5DFD1] text-[#7A7368] border-[#DDD6CA]',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono tracking-wider uppercase border ${colors[status] || colors['Open']}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: CasePriority }> = ({ priority }) => {
  const styles: Record<CasePriority, string> = {
    'LOW': 'bg-[#FAF7F2] text-[#7A7368] border-[#DDD6CA]',
    'MEDIUM': 'bg-[#FAF7F2] text-[#191817] border-[#DDD6CA]',
    'HIGH': 'bg-[#F4EFE6] text-[#191817] border-[#191817] font-semibold',
    'CRITICAL': 'bg-[#6F263D] text-[#FAF7F2] border-[#6F263D] font-bold tracking-widest',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase border ${styles[priority] || styles['MEDIUM']}`}>
      {priority}
    </span>
  );
};
