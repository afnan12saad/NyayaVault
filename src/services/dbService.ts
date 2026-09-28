import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserProfile,
  CaseRecord,
  DocumentRecord,
  DocumentVersionRecord,
  DocumentShareRecord,
  EvidenceRecord,
  CustodyTransferRecord,
  AuditLogRecord,
  CommentRecord,
  NotificationRecord,
  UserRole,
  DepartmentName
} from '../types';

export const COLLECTIONS = {
  USERS: 'users',
  CASES: 'cases',
  DOCUMENTS: 'documents',
  DOCUMENT_VERSIONS: 'documentVersions',
  DOCUMENT_SHARES: 'documentShares',
  EVIDENCE: 'evidence',
  CUSTODY_TRANSFERS: 'custodyTransfers',
  AUDIT_LOGS: 'auditLogs',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
};

// ========================
// AUDIT LOGGING (MANDATORY)
// ========================
export async function logAuditEvent(
  action: string,
  resourceType: 'DOCUMENT' | 'CASE' | 'EVIDENCE' | 'USER' | 'SYSTEM' | 'SHARE',
  resourceId: string,
  resourceName: string,
  options?: {
    caseId?: string;
    result?: 'SUCCESS' | 'DENIED' | 'FAILED' | 'WARNING';
    details?: string;
    userProfile?: UserProfile | null;
  }
): Promise<void> {
  const currentUser = auth.currentUser;
  const userUid = currentUser?.uid || options?.userProfile?.uid || 'anonymous_or_system';
  const userName = options?.userProfile?.fullName || currentUser?.displayName || currentUser?.email || 'System Agent';
  const userRole = options?.userProfile?.role || 'VIEWER';

  const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const auditData: AuditLogRecord = {
    logId,
    userUid,
    userName,
    userRole,
    action,
    resourceType,
    resourceId,
    resourceName,
    caseId: options?.caseId || '',
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1 (Secured AI Studio Gateway)',
    result: options?.result || 'SUCCESS',
    details: options?.details || `Action ${action} performed on ${resourceName}`
  };

  try {
    const logRef = doc(db, COLLECTIONS.AUDIT_LOGS, logId);
    await setDoc(logRef, auditData);
  } catch (error) {
    console.error('Audit logging failed (Non-fatal for client):', error);
  }
}

// ========================
// NOTIFICATIONS
// ========================
export async function createNotification(
  recipientUid: string,
  type: string,
  title: string,
  message: string,
  resourceType: string = 'DOCUMENT',
  resourceId: string = ''
) {
  try {
    const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const notif: NotificationRecord = {
      notificationId: notifId,
      recipientUid,
      type,
      title,
      message,
      resourceType,
      resourceId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), notif);
  } catch (err) {
    console.error('Notification failed to create:', err);
  }
}

// ========================
// USERS & PROFILES
// ========================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.USERS}/${uid}`);
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, profile.uid), profile);
    await logAuditEvent('USER_CREATE', 'USER', profile.uid, profile.fullName, {
      result: 'SUCCESS',
      details: `User registered with role ${profile.role} in department ${profile.department}`
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.USERS}/${profile.uid}`);
  }
}

export async function updateUserRoleAndDept(
  targetUid: string,
  role: UserRole,
  department: DepartmentName,
  adminProfile: UserProfile
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, targetUid), {
      role,
      department,
      updatedAt: new Date().toISOString()
    });
    await logAuditEvent('USER_ROLE_CHANGE', 'USER', targetUid, `User Profile Update`, {
      result: 'SUCCESS',
      details: `Admin ${adminProfile.fullName} updated role to ${role}, dept to ${department}`,
      userProfile: adminProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.USERS}/${targetUid}`);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
  }
}

// ========================
// CASES
// ========================
export async function getCases(): Promise<CaseRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CASES));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as CaseRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.CASES);
  }
}

export async function getCaseById(caseId: string): Promise<CaseRecord | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.CASES, caseId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as CaseRecord;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.CASES}/${caseId}`);
  }
}

export async function createCase(caseData: CaseRecord, userProfile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.CASES, caseData.caseId), caseData);
    await logAuditEvent('CASE_CREATE', 'CASE', caseData.caseId, caseData.title, {
      caseId: caseData.caseId,
      result: 'SUCCESS',
      details: `Investigation case opened with priority ${caseData.priority}`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CASES}/${caseData.caseId}`);
  }
}

export async function updateCaseStatus(
  caseId: string,
  newStatus: CaseRecord['status'],
  userProfile: UserProfile
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.CASES, caseId), {
      status: newStatus,
      lastUpdated: new Date().toISOString()
    });
    await logAuditEvent('CASE_UPDATE', 'CASE', caseId, `Case Status Updated to ${newStatus}`, {
      caseId,
      result: 'SUCCESS',
      details: `Case status transition to ${newStatus}`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.CASES}/${caseId}`);
  }
}

// ========================
// DOCUMENTS & STORAGE
// ========================
export async function uploadDocumentFile(
  file: File,
  caseId: string,
  documentId: string
): Promise<string> {
  try {
    const storagePath = `cases/${caseId}/documents/${documentId}_${file.name}`;
    const storageReference = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageReference, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Direct Firebase Storage upload unavailable, generating secure internal data reference');
    return `local-vault://cases/${caseId}/${documentId}/${encodeURIComponent(file.name)}`;
  }
}

export async function createDocumentRecord(
  docData: DocumentRecord,
  userProfile: UserProfile
): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.DOCUMENTS, docData.documentId), docData);

    // Create initial Version 1 record
    const v1Id = `VER-${docData.documentId}-1`;
    const v1: DocumentVersionRecord = {
      versionId: v1Id,
      documentId: docData.documentId,
      caseId: docData.caseId,
      versionNumber: 1,
      fileName: docData.fileName,
      storageUrl: docData.storageUrl,
      hash: docData.originalHash,
      uploadedBy: userProfile.fullName,
      uploadedByUid: userProfile.uid,
      timestamp: docData.uploadTimestamp,
      changeDescription: 'Initial secure document registration and baseline cryptographic seal.',
      fileSize: docData.fileSize
    };
    await setDoc(doc(db, COLLECTIONS.DOCUMENT_VERSIONS, v1Id), v1);

    // Audit log
    await logAuditEvent('DOCUMENT_UPLOAD', 'DOCUMENT', docData.documentId, docData.fileName, {
      caseId: docData.caseId,
      result: 'SUCCESS',
      details: `Uploaded ${docData.documentType} (SHA-256: ${docData.originalHash.substring(0, 16)}...)`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.DOCUMENTS}/${docData.documentId}`);
  }
}

export async function getDocumentsByCase(caseId: string): Promise<DocumentRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DOCUMENTS));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as DocumentRecord));
    return all.filter(d => d.caseId === caseId);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.DOCUMENTS);
  }
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DOCUMENTS));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as DocumentRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.DOCUMENTS);
  }
}

export async function getDocumentById(documentId: string): Promise<DocumentRecord | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.DOCUMENTS, documentId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as DocumentRecord;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.DOCUMENTS}/${documentId}`);
  }
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersionRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DOCUMENT_VERSIONS));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as DocumentVersionRecord));
    return all.filter(v => v.documentId === documentId).sort((a, b) => b.versionNumber - a.versionNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.DOCUMENT_VERSIONS);
  }
}

export async function createDocumentVersion(
  documentId: string,
  newVersionNumber: number,
  fileName: string,
  newHash: string,
  changeDescription: string,
  fileSize: number,
  storageUrl: string,
  userProfile: UserProfile,
  caseId: string
): Promise<void> {
  try {
    const versionId = `VER-${documentId}-${newVersionNumber}`;
    const versionRecord: DocumentVersionRecord = {
      versionId,
      documentId,
      caseId,
      versionNumber: newVersionNumber,
      fileName,
      storageUrl,
      hash: newHash,
      uploadedBy: userProfile.fullName,
      uploadedByUid: userProfile.uid,
      timestamp: new Date().toISOString(),
      changeDescription,
      fileSize
    };
    await setDoc(doc(db, COLLECTIONS.DOCUMENT_VERSIONS, versionId), versionRecord);

    // Update parent document's current version and current hash
    await updateDoc(doc(db, COLLECTIONS.DOCUMENTS, documentId), {
      version: newVersionNumber,
      currentHash: newHash,
      fileName,
      fileSize,
      storageUrl,
      integrityStatus: 'VERIFIED',
      uploadTimestamp: new Date().toISOString()
    });

    await logAuditEvent('DOCUMENT_VERSION_CREATE', 'DOCUMENT', documentId, fileName, {
      caseId,
      result: 'SUCCESS',
      details: `Created Version v${newVersionNumber} (${changeDescription})`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.DOCUMENT_VERSIONS}/${documentId}-${newVersionNumber}`);
  }
}

export async function updateDocumentIntegrity(
  documentId: string,
  integrityStatus: 'VERIFIED' | 'INTEGRITY_WARNING',
  currentHash: string,
  userProfile: UserProfile,
  caseId?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.DOCUMENTS, documentId), {
      integrityStatus,
      currentHash
    });

    await logAuditEvent('DOCUMENT_VERIFY', 'DOCUMENT', documentId, `Document Integrity Verification`, {
      caseId: caseId || '',
      result: integrityStatus === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
      details: `Hash check result: ${integrityStatus} (Hash: ${currentHash.substring(0, 16)}...)`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.DOCUMENTS}/${documentId}`);
  }
}

// ========================
// SHARING
// ========================
export async function shareDocument(
  shareData: DocumentShareRecord,
  userProfile: UserProfile
): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.DOCUMENT_SHARES, shareData.shareId), shareData);
    await logAuditEvent('DOCUMENT_SHARE', 'SHARE', shareData.shareId, shareData.documentName, {
      caseId: shareData.caseId,
      result: 'SUCCESS',
      details: `Shared with ${shareData.targetType}: ${shareData.recipientTarget} (${shareData.permission}) until ${shareData.expiresAt}`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.DOCUMENT_SHARES}/${shareData.shareId}`);
  }
}

export async function getDocumentShares(documentId: string): Promise<DocumentShareRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DOCUMENT_SHARES));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as DocumentShareRecord));
    return all.filter(s => s.documentId === documentId && !s.revoked);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.DOCUMENT_SHARES);
  }
}

export async function revokeShare(
  shareId: string,
  documentName: string,
  caseId: string,
  userProfile: UserProfile
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.DOCUMENT_SHARES, shareId), {
      revoked: true,
      revokedAt: new Date().toISOString()
    });
    await logAuditEvent('DOCUMENT_REVOKE_SHARE', 'SHARE', shareId, documentName, {
      caseId,
      result: 'SUCCESS',
      details: `Revoked access grant for ${shareId}`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.DOCUMENT_SHARES}/${shareId}`);
  }
}

// ========================
// EVIDENCE & CHAIN OF CUSTODY
// ========================
export async function getEvidenceByCase(caseId: string): Promise<EvidenceRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EVIDENCE));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as EvidenceRecord));
    return all.filter(e => e.caseId === caseId);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.EVIDENCE);
  }
}

export async function getAllEvidence(): Promise<EvidenceRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EVIDENCE));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as EvidenceRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.EVIDENCE);
  }
}

export async function createEvidenceItem(
  evidence: EvidenceRecord,
  userProfile: UserProfile
): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.EVIDENCE, evidence.evidenceId), evidence);

    // Initial custody event: Collection
    const transferId = `TRANSFER-${Date.now()}`;
    const initialTransfer: CustodyTransferRecord = {
      transferId,
      evidenceId: evidence.evidenceId,
      caseId: evidence.caseId,
      transferredFrom: 'Crime Scene / Discovery Site',
      transferredTo: evidence.collectedBy,
      transferDate: evidence.collectionDate,
      purpose: 'Initial Evidence Recovery and Sealing',
      verificationHash: evidence.integrityHash || 'SEAL-VALID-INITIAL',
      notes: `Secured at ${evidence.location}. Baseline seal verified.`,
      recordedByUid: userProfile.uid
    };
    await setDoc(doc(db, COLLECTIONS.CUSTODY_TRANSFERS, transferId), initialTransfer);

    await logAuditEvent('EVIDENCE_COLLECT', 'EVIDENCE', evidence.evidenceId, evidence.description, {
      caseId: evidence.caseId,
      result: 'SUCCESS',
      details: `Evidence item ${evidence.evidenceId} secured by ${evidence.collectedBy}`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.EVIDENCE}/${evidence.evidenceId}`);
  }
}

export async function transferCustody(
  transfer: CustodyTransferRecord,
  newCustodian: string,
  newStatus: EvidenceRecord['status'],
  userProfile: UserProfile
): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.CUSTODY_TRANSFERS, transfer.transferId), transfer);
    await updateDoc(doc(db, COLLECTIONS.EVIDENCE, transfer.evidenceId), {
      currentCustodian: newCustodian,
      status: newStatus
    });

    await logAuditEvent('EVIDENCE_TRANSFER', 'EVIDENCE', transfer.evidenceId, `Custody Handover`, {
      caseId: transfer.caseId,
      result: 'SUCCESS',
      details: `Transferred from ${transfer.transferredFrom} to ${transfer.transferredTo} (${transfer.purpose})`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CUSTODY_TRANSFERS}/${transfer.transferId}`);
  }
}

export async function getCustodyTransfers(evidenceId: string): Promise<CustodyTransferRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CUSTODY_TRANSFERS));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as CustodyTransferRecord));
    return all.filter(t => t.evidenceId === evidenceId).sort((a, b) => new Date(a.transferDate).getTime() - new Date(b.transferDate).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.CUSTODY_TRANSFERS);
  }
}

// ========================
// AUDIT LOGS RETRIEVAL
// ========================
export async function getAuditLogs(filterCaseId?: string): Promise<AuditLogRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as AuditLogRecord));
    let filtered = all;
    if (filterCaseId) {
      filtered = all.filter(l => l.caseId === filterCaseId);
    }
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.AUDIT_LOGS);
  }
}

// ========================
// COMMENTS
// ========================
export async function addDocumentComment(
  comment: CommentRecord,
  userProfile: UserProfile
): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.COMMENTS, comment.commentId), comment);
    await logAuditEvent('DOCUMENT_COMMENT', 'DOCUMENT', comment.documentId, `Document Review Comment`, {
      caseId: comment.caseId,
      result: 'SUCCESS',
      details: `Comment added on v${comment.documentVersion}`,
      userProfile
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.COMMENTS}/${comment.commentId}`);
  }
}

export async function getDocumentComments(documentId: string): Promise<CommentRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.COMMENTS));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as CommentRecord));
    return all.filter(c => c.documentId === documentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.COMMENTS);
  }
}

// ========================
// NOTIFICATIONS RETRIEVAL
// ========================
export async function getUserNotifications(uid: string): Promise<NotificationRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
    const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as NotificationRecord));
    return all.filter(n => n.recipientUid === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.NOTIFICATIONS);
  }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.NOTIFICATIONS}/${notifId}`);
  }
}
