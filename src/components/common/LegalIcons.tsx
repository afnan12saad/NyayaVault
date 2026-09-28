import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * NYAYAVAULT SIGNATURE SYMBOL
 * Abstract proprietary visual mark inspired by the legal section symbol "§",
 * subtly combining ideas of legal section/reference, document folio, archival record, and vault.
 */
export const NyayaVaultMark: React.FC<IconProps & { accent?: boolean }> = ({
  className = '',
  size = 24,
  accent = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Outer archival folio perimeter with legal notch */}
    <path
      d="M4 3.5C4 2.67157 4.67157 2 5.5 2H15.5L20 6.5V20.5C20 21.3284 19.3284 22 18.5 22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Editorial corner fold */}
    <path
      d="M15 2V7H20"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    {/* Abstract § legal vault ligature */}
    <path
      d="M14 9.5C14 8.4 13.1 7.5 12 7.5C10.6 7.5 9.5 8.6 9.5 10C9.5 11.5 11 12 12 12.5C13 13 14.5 13.5 14.5 15C14.5 16.4 13.4 17.5 12 17.5C10.9 17.5 10 16.6 10 15.5"
      stroke={accent ? '#6F263D' : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Core archival vault anchor dot */}
    <circle
      cx="12"
      cy="12.5"
      r="1"
      fill={accent ? '#6F263D' : 'currentColor'}
    />
  </svg>
);

/**
 * CASE FILE ICON
 * Stylized archival document with asymmetric edge, filing tab, and horizontal docket reference lines.
 */
export const CaseFileIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Archival folder tab */}
    <path
      d="M2.5 4.5V16C2.5 16.8284 3.17157 17.5 4 17.5H16C16.8284 17.5 17.5 16.8284 17.5 16V6.5C17.5 5.67157 16.8284 5 16 5H10.5L8.75 3H4C3.17157 3 2.5 3.67157 2.5 4.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* Case reference docket lines */}
    <line x1="6" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6" y1="12" x2="11.5" y2="12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Subtle archival index notch */}
    <rect x="13" y="11.5" width="1.5" height="1.5" fill="currentColor" />
  </svg>
);

/**
 * DOCUMENT ICON
 * Editorial page shape with distinctive folded/marked corner and ruled lines.
 */
export const DocumentIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M4.5 2.5H12.5L16 6V16.5C16 17.0523 15.5523 17.5 15 17.5H4.5C3.94772 17.5 3.5 17.0523 3.5 16.5V3.5C3.5 2.94772 3.94772 2.5 4.5 2.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M12 2.5V6.5H16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <line x1="6.5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6.5" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * STATUTES ICON
 * Numbered legal folio with highlighted section paragraph (§) mark and rule.
 */
export const StatutesIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect x="3" y="2.5" width="14" height="15" rx="0.5" stroke="currentColor" strokeWidth={strokeWidth} />
    {/* Section glyph inside folio */}
    <path
      d="M10 5.5C10 4.8 9.4 4.5 8.8 4.5C8 4.5 7.5 5 7.5 5.8C7.5 6.6 8.2 7 9 7.3C9.8 7.6 10.5 8 10.5 8.9C10.5 9.8 9.8 10.3 9 10.3C8.3 10.3 7.8 9.9 7.8 9.3"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <line x1="12" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="12" y1="8.5" x2="14.5" y2="8.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="5.5" y1="13.5" x2="14.5" y2="13.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * LEGAL INSIGHTS / COGNITIVE ICON
 * Quotation marks combined with an archival marginal annotation rule (NO AI sparkles!).
 */
export const LegalInsightsIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Marginal note bracket */}
    <path d="M4 4.5H2.5V15.5H4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
    {/* Quotation / editorial glyphs */}
    <path d="M7 8V6.5C7 5.7 7.6 5 8.5 5V6C7.9 6 7.6 6.3 7.6 6.8H8.5V8.5H7V8Z" fill="currentColor" />
    <path d="M10.5 8V6.5C10.5 5.7 11.1 5 12 5V6C11.4 6 11.1 6.3 11.1 6.8H12V8.5H10.5V8Z" fill="currentColor" />
    <line x1="6.5" y1="11.5" x2="16.5" y2="11.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6.5" y1="14" x2="13.5" y2="14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * SEARCH / INSPECTION ICON
 * Archival document fragment with a partial circular inspection/lens mark and text reference.
 */
export const SearchInspectionIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Partial document substrate */}
    <path d="M3.5 16V4C3.5 3.44772 3.94772 3 4.5 3H12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M3.5 16.5H11" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Archival inspection circle & handle */}
    <circle cx="11.5" cy="9.5" r="5" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="15" y1="13.5" x2="17.5" y2="16.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="11.5" cy="9.5" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * VERIFIED / STAMP ICON
 * Archival octagonal / circular legal verification seal with centered confirmation strike.
 */
export const VerificationStampIcon: React.FC<IconProps & { warning?: boolean }> = ({
  className = '',
  size = 18,
  strokeWidth = 1.5,
  warning = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Geometric archival seal perimeter */}
    <polygon
      points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {warning ? (
      <>
        {/* Warning exclamation pillar */}
        <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </>
    ) : (
      <>
        {/* Archival strike / checkmark */}
        <path
          d="M6.5 10L9 12.5L13.5 7.5"
          stroke="currentColor"
          strokeWidth={strokeWidth + 0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

/**
 * EVIDENCE BOX ICON
 * Archival evidence specimen container with security binding band.
 */
export const EvidenceBoxIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Box outline */}
    <path
      d="M3 6.5L10 3L17 6.5V14.5L10 18L3 14.5V6.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* Central seam and security band */}
    <line x1="10" y1="3" x2="10" y2="18" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="3" y1="6.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="17" y1="6.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth={strokeWidth} />
    {/* Evidence tag seal */}
    <rect x="8.5" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1" fill="currentColor" />
  </svg>
);

/**
 * SHARE / ACCESS GRANT ICON
 * Two overlapping archival document slips with an authorized junction mark.
 */
export const ShareGrantIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Primary docket */}
    <rect x="2.5" y="4" width="9" height="12" rx="0.5" stroke="currentColor" strokeWidth={strokeWidth} />
    {/* Recipient slip */}
    <path d="M7 2.5H16.5C17.0523 2.5 17.5 2.94772 17.5 3.5V13.5H13.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Authorized transfer junction */}
    <circle cx="11.5" cy="10" r="1.5" fill="currentColor" />
    <line x1="11.5" y1="8.5" x2="14.5" y2="8.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * AUDIT TRAIL ICON
 * Chronological manuscript ledger entry / immutable chain knot.
 */
export const AuditTrailIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Vertical timeline spine */}
    <line x1="6" y1="3" x2="6" y2="17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Chronological knot 1 */}
    <circle cx="6" cy="5.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} fill="#F3EFE6" />
    <line x1="10" y1="5.5" x2="16.5" y2="5.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Chronological knot 2 */}
    <circle cx="6" cy="10.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} fill="currentColor" />
    <line x1="10" y1="10.5" x2="14.5" y2="10.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Chronological knot 3 */}
    <circle cx="6" cy="15.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} fill="#F3EFE6" />
    <line x1="10" y1="15.5" x2="17" y2="15.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * COMPLIANCE ICON
 * Statutory register folio with formal stamped approval.
 */
export const ComplianceIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect x="3.5" y="3.5" width="13" height="14" rx="0.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M7 2V4.5H13V2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M6.5 8L8.5 10L13 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="6.5" y1="13" x2="13.5" y2="13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * UPLOAD / INGESTION ICON
 * Archival ingestion into permanent folio.
 */
export const UploadArchiveIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Archival vault slot / tray */}
    <path d="M3 12V16.5C3 17.0523 3.44772 17.5 4 17.5H16C16.5523 17.5 17 17.0523 17 16.5V12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Upward ingestion mark */}
    <path d="M10 3V12M10 3L6.5 6.5M10 3L13.5 6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * LOCK / WAX SEAL ICON
 * Archival legal seal lock.
 */
export const LockSealIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Shackle */}
    <path d="M6 8V5.5C6 3.567 7.79 2 10 2C12.21 2 14 3.567 14 5.5V8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Seal body */}
    <rect x="4" y="8" width="12" height="10" rx="0.5" stroke="currentColor" strokeWidth={strokeWidth} />
    {/* Keyhole / Seal impression */}
    <circle cx="10" cy="12" r="1.5" fill="currentColor" />
    <path d="M10 13.5V15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * ADMIN CONSOLE ICON
 * Calibrated ledger gauge / supervisor rule.
 */
export const AdminConsoleIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect x="2.5" y="3" width="15" height="14" rx="0.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="2.5" y1="8" x2="17.5" y2="8" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
    <circle cx="8.5" cy="5.5" r="1" fill="currentColor" />
    <line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6" y1="14.5" x2="10.5" y2="14.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * SETTINGS ICON
 * Precision registry gauge / mechanical indexer.
 */
export const SettingsIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.3 4.3L5.7 5.7M14.3 14.3L15.7 15.7M4.3 15.7L5.7 14.3M14.3 5.7L15.7 4.3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * USER / OFFICER ICON
 * Archival credential folio badge.
 */
export const UserOfficerIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M4 16.5C4 13.5 6.7 12 10 12C13.3 12 16 13.5 16 16.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * BELL / MARGINAL ALERT FLAG ICON
 */
export const BellAlertIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M10 3.5C7.5 3.5 5.5 5.5 5.5 8V12.5L4 14.5H16L14.5 12.5V8C14.5 5.5 12.5 3.5 10 3.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M8.5 16.5C8.8 17.4 9.3 18 10 18C10.7 18 11.2 17.4 11.5 16.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * VERSION BRANCH ICON
 * Archival manuscript amendment branch.
 */
export const VersionBranchIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <line x1="5.5" y1="4" x2="5.5" y2="16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth={strokeWidth} fill="#F3EFE6" />
    <circle cx="5.5" cy="15" r="2" stroke="currentColor" strokeWidth={strokeWidth} fill="currentColor" />
    <path d="M5.5 10C8.5 10 10.5 8.5 12 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth={strokeWidth} fill="#F3EFE6" />
  </svg>
);

/**
 * ANNOTATION / COMMENT NOTE ICON
 */
export const CommentNoteIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M3.5 4C3.5 3.44772 3.94772 3 4.5 3H15.5C16.0523 3 16.5 3.44772 16.5 4V13C16.5 13.5523 16.0523 14 15.5 14H8L4.5 17V4.5C4.5 4.22386 4.05228 4 3.5 4Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <line x1="6.5" y1="7" x2="13.5" y2="7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6.5" y1="10" x2="11.5" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * DOWNLOAD FOLIO ICON
 */
export const DownloadFolioIcon: React.FC<IconProps> = ({ className = '', size = 18, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path d="M4 14V16.5C4 17.0523 4.44772 17.5 5 17.5H15C15.5523 17.5 16 17.0523 16 16.5V14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="10" y1="3" x2="10" y2="12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M6.5 8.5L10 12L13.5 8.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M7.5 4.5L13 10L7.5 15.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M4.5 7.5L10 13L15.5 7.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <line x1="3.5" y1="10" x2="15.5" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M11 5.5L15.5 10L11 14.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FilterArchivalIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <line x1="3" y1="5.5" x2="17" y2="5.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="7" cy="5.5" r="1.75" fill="#FAF7F2" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="3" y1="14.5" x2="17" y2="14.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="13" cy="14.5" r="1.75" fill="#FAF7F2" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const PlusFolioIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const CheckmarkSealIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M4.5 10.5L8.5 14.5L15.5 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AlertWarningIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M10 2.5L18 16.5H2L10 2.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <line x1="10" y1="7.5" x2="10" y2="11.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="10" cy="14" r="0.75" fill="currentColor" />
  </svg>
);

export const EyeFolioIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M2.5 10C2.5 10 5.5 4.5 10 4.5C14.5 4.5 17.5 10 17.5 10C17.5 10 14.5 15.5 10 15.5C5.5 15.5 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const CopySealIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect x="6.5" y="6.5" width="10" height="11" rx="1" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M4 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H11.5C12.0523 2.5 12.5 2.94772 12.5 3.5V4" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const TrashFolioIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M3.5 5.5H16.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M5.5 5.5V15.5C5.5 16.0523 5.94772 16.5 6.5 16.5H13.5C14.0523 16.5 14.5 16.0523 14.5 15.5V5.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M8 5.5V3.5C8 3.22386 8.22386 3 8.5 3H11.5C11.7761 3 12 3.22386 12 3.5V5.5" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const CloseModalIcon: React.FC<IconProps> = ({ className = '', size = 16, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

