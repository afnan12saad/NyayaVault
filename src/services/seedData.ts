import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from './dbService';
import {
  UserProfile,
  CaseRecord,
  DocumentRecord,
  DocumentVersionRecord,
  EvidenceRecord,
  CustodyTransferRecord,
  AuditLogRecord
} from '../types';

export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    uid: 'demo-super-admin',
    fullName: 'Shri Vikram Malhotra',
    email: 'admin@nyayavault.gov.in',
    officerId: 'IPS-78401',
    department: 'Administration',
    designation: 'Director General & System Controller',
    role: 'SUPER ADMIN',
    isActive: true,
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  investigator: {
    uid: 'demo-investigating-officer',
    fullName: 'Insp. Rajesh Verma',
    email: 'r.verma@police.gov.in',
    officerId: 'DL-90422',
    department: 'Police Investigation',
    designation: 'Senior Investigating Officer',
    role: 'INVESTIGATING OFFICER',
    isActive: true,
    createdAt: '2026-02-01T09:30:00.000Z'
  },
  legal: {
    uid: 'demo-legal-officer',
    fullName: 'Adv. Ananya Deshmukh',
    email: 'ananya.legal@nyayavault.gov.in',
    officerId: 'BAR-44910',
    department: 'Legal Department',
    designation: 'Chief Public Prosecutor',
    role: 'LEGAL OFFICER',
    isActive: true,
    createdAt: '2026-02-15T11:00:00.000Z'
  },
  forensics: {
    uid: 'demo-forensic-officer',
    fullName: 'Dr. Kabir Sen',
    email: 'kabir.sen@cfsl.gov.in',
    officerId: 'CFSL-1029',
    department: 'Forensics',
    designation: 'Chief Forensic Cyber & Chemical Examiner',
    role: 'FORENSIC OFFICER',
    isActive: true,
    createdAt: '2026-02-20T10:15:00.000Z'
  },
  auditor: {
    uid: 'demo-auditor',
    fullName: 'Smt. Deepa Nair',
    email: 'audit.nair@cag.gov.in',
    officerId: 'CAG-8812',
    department: 'Court',
    designation: 'Independent Judicial Compliance Auditor',
    role: 'AUDITOR',
    isActive: true,
    createdAt: '2026-03-01T12:00:00.000Z'
  },
  viewer: {
    uid: 'demo-viewer',
    fullName: 'Pooja Iyer',
    email: 'p.iyer@registry.gov.in',
    officerId: 'REG-3310',
    department: 'Court',
    designation: 'Court Registry Clerk',
    role: 'VIEWER',
    isActive: true,
    createdAt: '2026-03-10T14:00:00.000Z'
  }
};

export const INITIAL_CASES: CaseRecord[] = [
  {
    caseId: 'NYV-2026-00124',
    title: 'Financial Investigation - Shell Conglomerate Fraud',
    description: 'Investigation into misappropriation of banking consortium funds exceeding 450 Crores across fictitious vendor shell corporations.',
    caseType: 'Economic Offences / Corporate Fraud',
    department: 'Police Investigation',
    investigatingOfficer: 'Insp. Rajesh Verma',
    investigatingOfficerId: 'demo-investigating-officer',
    priority: 'HIGH',
    status: 'Under Investigation',
    createdDate: '2026-04-12T05:30:00.000Z',
    lastUpdated: '2026-09-28T02:15:00.000Z',
    documentCount: 6,
    evidenceCount: 4,
    tags: ['Financial Crime', 'Banking Consortium', 'Shell Companies', 'High Priority'],
    isDemo: true
  },
  {
    caseId: 'NYV-2026-00125',
    title: 'Cybercrime Investigation - Critical Infrastructure Intrusion',
    description: 'Detection of advanced persistent threat targeting state power grid SCADA servers and unauthorized privilege escalation.',
    caseType: 'Cyber Warfare & Critical IT Infrastructure',
    department: 'Police Investigation',
    investigatingOfficer: 'Insp. Rajesh Verma',
    investigatingOfficerId: 'demo-investigating-officer',
    priority: 'CRITICAL',
    status: 'Under Review',
    createdDate: '2026-06-01T10:00:00.000Z',
    lastUpdated: '2026-09-27T18:40:00.000Z',
    documentCount: 4,
    evidenceCount: 3,
    tags: ['Cybercrime', 'SCADA', 'Malware Analysis', 'State Security'],
    isDemo: true
  },
  {
    caseId: 'NYV-2026-00126',
    title: 'Forensic Investigation - High-Profile Evidence Tampering Probe',
    description: 'Comprehensive digital and physical chain-of-custody examination of seized biometric servers and hard drives.',
    caseType: 'Forensic Evidence Verification',
    department: 'Forensics',
    investigatingOfficer: 'Dr. Kabir Sen',
    investigatingOfficerId: 'demo-forensic-officer',
    priority: 'CRITICAL',
    status: 'Under Investigation',
    createdDate: '2026-07-15T08:00:00.000Z',
    lastUpdated: '2026-09-28T01:30:00.000Z',
    documentCount: 5,
    evidenceCount: 5,
    tags: ['Forensics', 'Biometrics', 'Chain of Custody', 'Integrity'],
    isDemo: true
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    documentId: 'DOC-124-01',
    fileName: 'FIR_2026_00124_Consortium_Fraud.pdf',
    documentType: 'FIR',
    caseId: 'NYV-2026-00124',
    caseTitle: 'Financial Investigation - Shell Conglomerate Fraud',
    uploadedBy: 'Insp. Rajesh Verma',
    uploadedByUid: 'demo-investigating-officer',
    department: 'Police Investigation',
    uploadTimestamp: '2026-04-12T06:00:00.000Z',
    version: 1,
    fileSize: 1845200,
    fileType: 'application/pdf',
    originalHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    integrityStatus: 'VERIFIED',
    status: 'VERIFIED',
    accessLevel: 'RESTRICTED',
    retentionStatus: 'PERMANENT_RECORD',
    summary: 'First Information Report lodged under IPC Section 420, 467, 471 detailing illegal siphoning of credit facility.',
    tags: ['FIR', 'Financial Crime', 'Primary Complaint'],
    textContent: 'FIRST INFORMATION REPORT\nUnder Section 154 Cr.P.C.\nPolice Station: Economic Offences Wing\nDistrict: Central Financial District\nComplainant: National Banking Consortium representative.\nAccused: Directors of Zenith Global Holdings.\nAllegation: Conspiracy, fraudulent balance sheets, diverting public consortium borrowings into offshore tax havens.\nStatus: Registered under official seal.',
    isDemo: true
  },
  {
    documentId: 'DOC-124-02',
    fileName: 'ChargeSheet_v3.pdf',
    documentType: 'Charge Sheet',
    caseId: 'NYV-2026-00124',
    caseTitle: 'Financial Investigation - Shell Conglomerate Fraud',
    uploadedBy: 'Insp. Rajesh Verma',
    uploadedByUid: 'demo-investigating-officer',
    department: 'Police Investigation',
    uploadTimestamp: '2026-09-28T01:45:00.000Z',
    version: 3,
    fileSize: 3410500,
    fileType: 'application/pdf',
    originalHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    integrityStatus: 'VERIFIED',
    status: 'SEALED',
    accessLevel: 'CONFIDENTIAL',
    retentionStatus: 'ACTIVE',
    summary: 'Final Charge Sheet v3 submitted before the Special Sessions Court enumerating 14 primary accused and money trail.',
    tags: ['Charge Sheet', 'Court Submission', 'Judicial Record'],
    textContent: 'IN THE COURT OF THE SPECIAL JUDGE FOR ECONOMIC OFFENCES\nPOLICE FINAL REPORT / CHARGE SHEET UNDER SECTION 173 Cr.P.C.\nState vs. Zenith Global Holdings & Ors.\nInvestigating Agency: EOW Special Team.\nAccused Charges: Section 120B r/w 409, 420, 468, 471 IPC and Prevention of Corruption Act.\nList of Witnesses: 42 examined.\nList of Exhibits: 180 documentary records, forensic audit reports, signed confessions.',
    isDemo: true
  },
  {
    documentId: 'DOC-124-03',
    fileName: 'Forensic_Audit_Report_KPMG_Ex.pdf',
    documentType: 'Forensic Report',
    caseId: 'NYV-2026-00124',
    caseTitle: 'Financial Investigation - Shell Conglomerate Fraud',
    uploadedBy: 'Dr. Kabir Sen',
    uploadedByUid: 'demo-forensic-officer',
    department: 'Forensics',
    uploadTimestamp: '2026-08-14T11:20:00.000Z',
    version: 1,
    fileSize: 5210000,
    fileType: 'application/pdf',
    originalHash: 'b5665893a618d36371c4c7c8c3683f1e944e83769188e6a575e9f826315d97f2',
    currentHash: 'b5665893a618d36371c4c7c8c3683f1e944e83769188e6a575e9f826315d97f2',
    integrityStatus: 'VERIFIED',
    status: 'VERIFIED',
    accessLevel: 'SECRET',
    retentionStatus: 'ACTIVE',
    summary: 'Independent forensic accounting ledger reconciliation demonstrating circular routing of Rs 312 Cr.',
    tags: ['Forensic Audit', 'Financial Ledger', 'Evidence'],
    textContent: 'FORENSIC ACCOUNTING & ASSET TRACING REPORT\nPrepared by Forensic Investigation Wing\nSubject: Fund Flow Analysis of Zenith Global Accounts (FY 2023 - 2026)\nKey Observation: Funds disbursed under letter of credit for machinery import were systematically redirected into 7 layer-1 dummy firms with identical registered addresses.\nCryptographic verification token: FSL-AU-2026-889.',
    isDemo: true
  },
  {
    documentId: 'DOC-125-01',
    fileName: 'SCADA_Memory_Dump_Analysis.pdf',
    documentType: 'Forensic Report',
    caseId: 'NYV-2026-00125',
    caseTitle: 'Cybercrime Investigation - Critical Infrastructure Intrusion',
    uploadedBy: 'Dr. Kabir Sen',
    uploadedByUid: 'demo-forensic-officer',
    department: 'Forensics',
    uploadTimestamp: '2026-06-10T14:30:00.000Z',
    version: 2,
    fileSize: 4120000,
    fileType: 'application/pdf',
    originalHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    currentHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    integrityStatus: 'VERIFIED',
    status: 'VERIFIED',
    accessLevel: 'TOP SECRET',
    retentionStatus: 'PERMANENT_RECORD',
    summary: 'Volatile RAM acquisition and reverse engineering of kernel module injected into transmission relay PLC controllers.',
    tags: ['SCADA', 'Memory Forensics', 'Cyber Incident'],
    textContent: 'STATE FORENSIC SCIENCE LABORATORY - CYBER DIVISION\nEXHIBIT EVALUATION REPORT: SCADA CONTROL UNIT A-4\nAnalysis of RAM image indicates lateral movement utilizing zero-day privilege escalation against Modbus telemetry protocols.\nIndicators of Compromise (IoCs) compiled and isolated into air-gapped forensic repository.',
    isDemo: true
  },
  {
    documentId: 'DOC-126-01',
    fileName: 'Witness_Deposition_Officer_Rao.pdf',
    documentType: 'Witness Statement',
    caseId: 'NYV-2026-00126',
    caseTitle: 'Forensic Investigation - High-Profile Evidence Tampering Probe',
    uploadedBy: 'Insp. Rajesh Verma',
    uploadedByUid: 'demo-investigating-officer',
    department: 'Police Investigation',
    uploadTimestamp: '2026-07-20T10:15:00.000Z',
    version: 1,
    fileSize: 920400,
    fileType: 'application/pdf',
    originalHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    currentHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    integrityStatus: 'VERIFIED',
    status: 'VERIFIED',
    accessLevel: 'CONFIDENTIAL',
    retentionStatus: 'ACTIVE',
    summary: 'Sworn deposition of senior evidence room custodian documenting tamper-evident bag seal numbers.',
    tags: ['Witness', 'Custody', 'Deposition'],
    textContent: 'STATEMENT RECORDED UNDER SECTION 161 Cr.P.C.\nWitness: Head Constable M. Rao, Evidence Room Custodian #4.\nStatement: I solemnly attest that Exhibit EV-1045 was received in an unbroken security envelope with wax seal #902 on 15 July 2026.\nSigned under supervision of Investigating Officer.',
    isDemo: true
  }
];

export const INITIAL_EVIDENCE: EvidenceRecord[] = [
  {
    evidenceId: 'EV-1045',
    caseId: 'NYV-2026-00124',
    description: 'Encrypted Solid State Drive (Samsung 980 Pro 2TB) recovered from corporate server rack.',
    evidenceType: 'Digital Storage Media',
    collectedBy: 'Insp. Rajesh Verma',
    collectedByUid: 'demo-investigating-officer',
    collectionDate: '2026-04-12T09:30:00.000Z',
    location: 'Headquarters Server Room, Floor 14',
    associatedDocumentId: 'DOC-124-03',
    currentCustodian: 'Dr. Kabir Sen (Forensics Lab)',
    status: 'Examined',
    integrityHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    createdAt: '2026-04-12T10:00:00.000Z',
    isDemo: true
  },
  {
    evidenceId: 'EV-1046',
    caseId: 'NYV-2026-00124',
    description: 'Physical Ledger of Cash Transactions & Offshore Account Hand-Written Notes (182 Pages).',
    evidenceType: 'Physical Document Exhibit',
    collectedBy: 'Insp. Rajesh Verma',
    collectedByUid: 'demo-investigating-officer',
    collectionDate: '2026-04-12T11:00:00.000Z',
    location: 'Residence of Key Director, Safe #2',
    associatedDocumentId: 'DOC-124-02',
    currentCustodian: 'Special Sessions Court Vault',
    status: 'Stored',
    integrityHash: '3b907293a6c2f3274de451e041935e40e698888aa38084dd36894c264a9386c1',
    createdAt: '2026-04-12T12:00:00.000Z',
    isDemo: true
  },
  {
    evidenceId: 'EV-2099',
    caseId: 'NYV-2026-00125',
    description: 'Hardware Security Module (HSM) and Network Packet Capture Dongle.',
    evidenceType: 'Network Hardware Appliance',
    collectedBy: 'Dr. Kabir Sen',
    collectedByUid: 'demo-forensic-officer',
    collectionDate: '2026-06-02T15:00:00.000Z',
    location: 'Transmission Control Center Node 7',
    associatedDocumentId: 'DOC-125-01',
    currentCustodian: 'National Cyber Forensic Center',
    status: 'Transferred',
    integrityHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    createdAt: '2026-06-02T16:00:00.000Z',
    isDemo: true
  }
];

export const INITIAL_CUSTODY_TRANSFERS: CustodyTransferRecord[] = [
  {
    transferId: 'CUST-001',
    evidenceId: 'EV-1045',
    caseId: 'NYV-2026-00124',
    transferredFrom: 'Insp. Rajesh Verma (Investigating Officer)',
    transferredTo: 'Central Evidence Locker Custodian',
    transferDate: '2026-04-12T12:10:00.000Z',
    purpose: 'Initial intake into secure evidence locker under official tamper seal #A-901',
    verificationHash: '9f835438e310921f68b8a76cac2fb29cfd7b83d0bc32430ac7004f70ab12d121',
    notes: 'Seal intact. Tamper-evident barcode attached.',
    recordedByUid: 'demo-investigating-officer'
  },
  {
    transferId: 'CUST-002',
    evidenceId: 'EV-1045',
    caseId: 'NYV-2026-00124',
    transferredFrom: 'Central Evidence Locker Custodian',
    transferredTo: 'Dr. Kabir Sen (Forensics Lab)',
    transferDate: '2026-04-13T10:30:00.000Z',
    purpose: 'Transfer for forensic bitstream disk imaging and write-blocker analysis',
    verificationHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    notes: 'Received at CFSL Digital Wing. Write-blocker hardware attached.',
    recordedByUid: 'demo-forensic-officer'
  },
  {
    transferId: 'CUST-003',
    evidenceId: 'EV-1045',
    caseId: 'NYV-2026-00124',
    transferredFrom: 'Dr. Kabir Sen (Forensics Lab)',
    transferredTo: 'Special Evidence Repository Room B',
    transferDate: '2026-05-18T16:00:00.000Z',
    purpose: 'Post-examination permanent forensic custody awaiting trial court summon',
    verificationHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    notes: 'Master bit-for-bit image verified against original SHA-256 hash.',
    recordedByUid: 'demo-forensic-officer'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    logId: 'LOG-INIT-01',
    userUid: 'demo-investigating-officer',
    userName: 'Insp. Rajesh Verma',
    userRole: 'INVESTIGATING OFFICER',
    action: 'CASE_CREATE',
    resourceType: 'CASE',
    resourceId: 'NYV-2026-00124',
    resourceName: 'Financial Investigation - Shell Conglomerate Fraud',
    caseId: 'NYV-2026-00124',
    timestamp: '2026-04-12T05:30:00.000Z',
    result: 'SUCCESS',
    details: 'Initiated new criminal investigation file under official seal.'
  },
  {
    logId: 'LOG-INIT-02',
    userUid: 'demo-investigating-officer',
    userName: 'Insp. Rajesh Verma',
    userRole: 'INVESTIGATING OFFICER',
    action: 'DOCUMENT_UPLOAD',
    resourceType: 'DOCUMENT',
    resourceId: 'DOC-124-01',
    resourceName: 'FIR_2026_00124_Consortium_Fraud.pdf',
    caseId: 'NYV-2026-00124',
    timestamp: '2026-04-12T06:00:00.000Z',
    result: 'SUCCESS',
    details: 'Cryptographic baseline seal generated: SHA-256 e3b0c44298fc1c14...'
  },
  {
    logId: 'LOG-INIT-03',
    userUid: 'demo-forensic-officer',
    userName: 'Dr. Kabir Sen',
    userRole: 'FORENSIC OFFICER',
    action: 'DOCUMENT_VERIFY',
    resourceType: 'DOCUMENT',
    resourceId: 'DOC-124-03',
    resourceName: 'Forensic_Audit_Report_KPMG_Ex.pdf',
    caseId: 'NYV-2026-00124',
    timestamp: '2026-08-14T11:22:00.000Z',
    result: 'SUCCESS',
    details: 'Integrity check verified. Calculated SHA-256 matched baseline record.'
  },
  {
    logId: 'LOG-INIT-04',
    userUid: 'demo-investigating-officer',
    userName: 'Insp. Rajesh Verma',
    userRole: 'INVESTIGATING OFFICER',
    action: 'DOCUMENT_VERSION_CREATE',
    resourceType: 'DOCUMENT',
    resourceId: 'DOC-124-02',
    resourceName: 'ChargeSheet_v3.pdf',
    caseId: 'NYV-2026-00124',
    timestamp: '2026-09-28T01:45:00.000Z',
    result: 'SUCCESS',
    details: 'Version v3 uploaded following Special Prosecutor review. Previous versions preserved.'
  },
  {
    logId: 'LOG-INIT-05',
    userUid: 'demo-legal-officer',
    userName: 'Adv. Ananya Deshmukh',
    userRole: 'LEGAL OFFICER',
    action: 'DOCUMENT_VIEW',
    resourceType: 'DOCUMENT',
    resourceId: 'DOC-124-02',
    resourceName: 'ChargeSheet_v3.pdf',
    caseId: 'NYV-2026-00124',
    timestamp: '2026-09-28T02:30:00.000Z',
    result: 'SUCCESS',
    details: 'Document opened for judicial review before filing with Registrar.'
  }
];

export async function seedDemoDataIfEmpty() {
  try {
    // Check if initial case exists
    const testDoc = await getDoc(doc(db, COLLECTIONS.CASES, 'NYV-2026-00124'));
    if (!testDoc.exists()) {
      console.log('Seeding initial NyayaVault demo cases and security records into Firestore...');

      // Seed Users
      for (const [key, user] of Object.entries(DEMO_USERS)) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), user);
      }

      // Seed Cases
      for (const item of INITIAL_CASES) {
        await setDoc(doc(db, COLLECTIONS.CASES, item.caseId), item);
      }

      // Seed Documents and Version 1 records
      for (const item of INITIAL_DOCUMENTS) {
        await setDoc(doc(db, COLLECTIONS.DOCUMENTS, item.documentId), item);

        // Also create version record
        const vRec: DocumentVersionRecord = {
          versionId: `VER-${item.documentId}-${item.version}`,
          documentId: item.documentId,
          caseId: item.caseId,
          versionNumber: item.version,
          fileName: item.fileName,
          storageUrl: item.storageUrl,
          hash: item.originalHash,
          uploadedBy: item.uploadedBy,
          uploadedByUid: item.uploadedByUid,
          timestamp: item.uploadTimestamp,
          changeDescription: `Version v${item.version} registered. Baseline cryptographic verification hash stored.`,
          fileSize: item.fileSize
        };
        await setDoc(doc(db, COLLECTIONS.DOCUMENT_VERSIONS, vRec.versionId), vRec);
      }

      // Seed Evidence
      for (const item of INITIAL_EVIDENCE) {
        await setDoc(doc(db, COLLECTIONS.EVIDENCE, item.evidenceId), item);
      }

      // Seed Custody Transfers
      for (const item of INITIAL_CUSTODY_TRANSFERS) {
        await setDoc(doc(db, COLLECTIONS.CUSTODY_TRANSFERS, item.transferId), item);
      }

      // Seed Audit Logs
      for (const item of INITIAL_AUDIT_LOGS) {
        await setDoc(doc(db, COLLECTIONS.AUDIT_LOGS, item.logId), item);
      }

      console.log('NyayaVault demo records successfully seeded into Firestore.');
    }
  } catch (error) {
    console.error('Error during demo data check/seeding:', error);
  }
}
