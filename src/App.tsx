import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { UploadDocumentPage } from './pages/UploadDocumentPage';
import { SearchPage } from './pages/SearchPage';
import { EvidencePage } from './pages/EvidencePage';
import { VerifyPage } from './pages/VerifyPage';
import { SharesPage } from './pages/SharesPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { AiIntelligencePage } from './pages/AiIntelligencePage';
import { CompliancePage } from './pages/CompliancePage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Workspace */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/upload" element={<UploadDocumentPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/shares" element={<SharesPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/ai-intelligence" element={<AiIntelligencePage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<AdminPage />} />
            <Route path="/admin/departments" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
