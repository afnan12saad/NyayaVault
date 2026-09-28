export type UserRole =
  | 'SUPER ADMIN'
  | 'INVESTIGATING OFFICER'
  | 'LEGAL OFFICER'
  | 'FORENSIC OFFICER'
  | 'AUDITOR'
  | 'VIEWER';

export type DepartmentName =
  | 'Police Investigation'
  | 'Legal Department'
  | 'Forensics'
  | 'Court'
  | 'Administration';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  officerId: string;
  department: DepartmentName;
  designation: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CaseStatus =
  | 'Open'
  | 'Under Investigation'
  | 'Under Review'
  | 'Submitted'
  | 'Closed'
  | 'Archived';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CaseRecord {
  id?: string;
  caseId: string;
  title: string;
  description: string;
  caseType: string;
  department: DepartmentName;
  investigatingOfficer: string;
  investigatingOfficerId: string;
  priority: CasePriority;
  status: CaseStatus;
  createdDate: string;
  lastUpdated: string;
  documentCount?: number;
  evidenceCount?: number;
  tags?: string[];
  isDemo?: boolean;
}

export type DocumentType =
  | 'FIR'
  | 'Police Report'
  | 'Investigation Record'
  | 'Witness Statement'
  | 'Charge Sheet'
  | 'Court Filing'
  | 'Evidence Record'
  | 'Forensic Report'
  | 'Legal Notice'
  | 'Judgment'
  | 'Other';

export type DocumentStatus = 'DRAFT' | 'UNDER REVIEW' | 'VERIFIED' | 'SEALED' | 'ARCHIVED';
export type IntegrityStatus = 'VERIFIED' | 'UNVERIFIED' | 'INTEGRITY_WARNING';
export type AccessLevel = 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
export type RetentionStatus = 'ACTIVE' | 'PERMANENT_RECORD' | 'RETENTION_PENDING_REVIEW' | 'ARCHIVED';

export interface DocumentRecord {
  id?: string;
  documentId: string;
  fileName: string;
  documentType: DocumentType;
  caseId: string;
  caseTitle: string;
  uploadedBy: string;
  uploadedByUid: string;
  department: DepartmentName;
  uploadTimestamp: string;
  version: number;
  fileSize: number;
  fileType: string;
  storageUrl?: string;
  originalHash: string;
  currentHash: string;
  integrityStatus: IntegrityStatus;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  retentionStatus: RetentionStatus;
  summary?: string;
  tags?: string[];
  textContent?: string;
  isDemo?: boolean;
}

export interface DocumentVersionRecord {
  id?: string;
  versionId: string;
  documentId: string;
  caseId: string;
  versionNumber: number;
  fileName: string;
  storageUrl?: string;
  hash: string;
  uploadedBy: string;
  uploadedByUid: string;
  timestamp: string;
  changeDescription: string;
  fileSize: number;
}

export interface DocumentShareRecord {
  id?: string;
  shareId: string;
  documentId: string;
  documentName: string;
  caseId: string;
  sharedByUid: string;
  sharedByName: string;
  targetType: 'user' | 'department' | 'role';
  recipientTarget: string;
  permission: 'VIEW' | 'VIEW_DOWNLOAD' | 'VIEW_DOWNLOAD_COMMENT';
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

export type EvidenceStatus =
  | 'Collected'
  | 'Stored'
  | 'Transferred'
  | 'Examined'
  | 'Returned'
  | 'Archived';

export interface EvidenceRecord {
  id?: string;
  evidenceId: string;
  caseId: string;
  description: string;
  evidenceType: string;
  collectedBy: string;
  collectedByUid: string;
  collectionDate: string;
  location: string;
  associatedDocumentId?: string;
  currentCustodian: string;
  status: EvidenceStatus;
  integrityHash?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface CustodyTransferRecord {
  id?: string;
  transferId: string;
  evidenceId: string;
  caseId: string;
  transferredFrom: string;
  transferredTo: string;
  transferDate: string;
  purpose: string;
  verificationHash: string;
  notes: string;
  recordedByUid: string;
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_SHARE'
  | 'DOCUMENT_REVOKE_SHARE'
  | 'DOCUMENT_VERIFY'
  | 'DOCUMENT_VERSION_CREATE'
  | 'DOCUMENT_ARCHIVE'
  | 'CASE_CREATE'
  | 'CASE_UPDATE'
  | 'EVIDENCE_COLLECT'
  | 'EVIDENCE_TRANSFER'
  | 'USER_CREATE'
  | 'USER_ROLE_CHANGE'
  | 'FAILED_ACCESS_ATTEMPT';

export interface AuditLogRecord {
  id?: string;
  logId: string;
  userUid: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction | string;
  resourceType: 'DOCUMENT' | 'CASE' | 'EVIDENCE' | 'USER' | 'SYSTEM' | 'SHARE';
  resourceId: string;
  resourceName: string;
  caseId?: string;
  timestamp: string;
  ipAddress?: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED' | 'WARNING';
  details?: string;
}

export interface CommentRecord {
  id?: string;
  commentId: string;
  documentId: string;
  caseId: string;
  userUid: string;
  userName: string;
  userRole: UserRole;
  commentText: string;
  documentVersion: number;
  createdAt: string;
}

export interface NotificationRecord {
  id?: string;
  notificationId: string;
  recipientUid: string;
  type: string;
  title: string;
  message: string;
  resourceType: string;
  resourceId: string;
  isRead: boolean;
  createdAt: string;
}
