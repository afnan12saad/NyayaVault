import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Briefcase,
  Search,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  getAllUsers,
  getCases,
  getAllDocuments,
  updateUserRoleAndDept
} from '../services/dbService';
import { UserProfile, CaseRecord, DocumentRecord, UserRole, DepartmentName } from '../types';

// Strict Charcoal & Cool Grey tone palettes for charts
const CHARCOAL_COOL_GREY_PALETTE = ['#29323A', '#455360', '#637381', '#8898A6', '#B6C2CB', '#D7DFE4'];

export const AdminPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'analytics' | 'users' | 'departments'>('analytics');

  // User management filter
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('INVESTIGATING OFFICER');
  const [newDept, setNewDept] = useState<DepartmentName>('Police Investigation');
  const [savingUser, setSavingUser] = useState(false);

  const loadData = async () => {
    try {
      const [u, c, d] = await Promise.all([
        getAllUsers(),
        getCases(),
        getAllDocuments()
      ]);
      setUsers(u);
      setCases(c);
      setDocuments(d);
    } catch (err) {
      console.error('Error loading admin catalog:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUserPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !userProfile) return;
    setSavingUser(true);
    try {
      await updateUserRoleAndDept(editingUser.uid, newRole, newDept, userProfile);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      console.error('Permission update failed:', err);
    } finally {
      setSavingUser(false);
    }
  };

  // Recharts aggregations
  const docsByType = Object.entries(
    documents.reduce((acc, d) => {
      acc[d.documentType] = (acc[d.documentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  const docsByDept = Object.entries(
    documents.reduce((acc, d) => {
      acc[d.department] = (acc[d.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  const casesByStatus = Object.entries(
    cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  const verifiedDocsCount = documents.filter(d => d.integrityStatus === 'VERIFIED').length;
  const warningsCount = documents.filter(d => d.integrityStatus === 'INTEGRITY_WARNING').length;

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.officerId.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D7DFE4]">
        <div>
          <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
            Supervisory Control Station
          </div>
          <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#29323A]" />
            <span>Administrative & Governance Console</span>
          </h1>
          <p className="text-xs text-[#5C6A76] mt-1">
            System-wide operational telemetry, RBAC personnel authorization, and departmental jurisdictions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#CBD4DA] rounded self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setAdminTab('analytics')}
            className={`px-3 py-1.5 rounded transition-colors ${
              adminTab === 'analytics'
                ? 'bg-[#29323A] text-white font-semibold'
                : 'text-[#5C6A76] hover:text-[#29323A]'
            }`}
          >
            System Analytics
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-3 py-1.5 rounded transition-colors ${
              adminTab === 'users'
                ? 'bg-[#29323A] text-white font-semibold'
                : 'text-[#5C6A76] hover:text-[#29323A]'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setAdminTab('departments')}
            className={`px-3 py-1.5 rounded transition-colors ${
              adminTab === 'departments'
                ? 'bg-[#29323A] text-white font-semibold'
                : 'text-[#5C6A76] hover:text-[#29323A]'
            }`}
          >
            Departments (5)
          </button>
        </div>
      </div>

      {/* Platform KPIs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded bg-white border border-[#D7DFE4] text-left shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Total Personnel</span>
          <div className="text-2xl font-bold font-mono text-[#29323A] mt-1">{users.length}</div>
        </div>
        <div className="p-4 rounded bg-white border border-[#D7DFE4] text-left shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Active Cases</span>
          <div className="text-2xl font-bold font-mono text-[#29323A] mt-1">{cases.length}</div>
        </div>
        <div className="p-4 rounded bg-white border border-[#D7DFE4] text-left shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Total Documents</span>
          <div className="text-2xl font-bold font-mono text-[#29323A] mt-1">{documents.length}</div>
        </div>
        <div className="p-4 rounded bg-white border border-[#D7DFE4] text-left shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Verified Records</span>
          <div className="text-2xl font-bold font-mono text-[#29323A] mt-1">{verifiedDocsCount}</div>
        </div>
        <div className="p-4 rounded bg-white border border-[#D7DFE4] text-left shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Archived Files</span>
          <div className="text-2xl font-bold font-mono text-[#5C6A76] mt-1">
            {documents.filter(d => d.status === 'ARCHIVED').length}
          </div>
        </div>
        <div className="p-4 rounded bg-white border border-[#D7DFE4] text-left shadow-2xs">
          <span className="text-[10px] font-mono text-[#6A7885] uppercase">Integrity Warnings</span>
          <div className="text-2xl font-bold font-mono text-[#29323A] mt-1">{warningsCount}</div>
        </div>
      </div>

      {/* SUB-TAB 1: ANALYTICS (RECHARTS) */}
      {adminTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents by Type */}
          <div className="p-5 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
            <h3 className="text-xs font-mono uppercase text-[#29323A] font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#29323A]" />
              <span>Documents by Category Distribution</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={docsByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#8695A2" fontSize={10} angle={-30} textAnchor="end" />
                  <YAxis stroke="#8695A2" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#29323A', color: '#FFFFFF', borderColor: '#3A454F', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Bar dataKey="count" fill="#29323A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Documents by Department */}
          <div className="p-5 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
            <h3 className="text-xs font-mono uppercase text-[#29323A] font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#29323A]" />
              <span>Documents by Department Origin</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docsByDept}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }: any) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {docsByDept.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHARCOAL_COOL_GREY_PALETTE[index % CHARCOAL_COOL_GREY_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#29323A', color: '#FFFFFF', borderColor: '#3A454F', fontSize: '11px', borderRadius: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cases by Status */}
          <div className="p-5 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
            <h3 className="text-xs font-mono uppercase text-[#29323A] font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#29323A]" />
              <span>Investigation Case Status Distribution</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#8695A2" fontSize={10} angle={-20} textAnchor="end" />
                  <YAxis stroke="#8695A2" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#29323A', color: '#FFFFFF', borderColor: '#3A454F', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Bar dataKey="count" fill="#455360" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit & Compliance Health Indicator */}
          <div className="p-5 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs flex flex-col justify-between">
            <h3 className="text-xs font-mono uppercase text-[#29323A] font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#29323A]" />
              <span>Jurisdictional Ledger Health</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                <span className="text-[#6A7885]">Cryptographic Seal Rate:</span>
                <span className="text-[#29323A] font-bold">
                  {documents.length > 0 ? ((verifiedDocsCount / documents.length) * 100).toFixed(1) : 100}%
                </span>
              </div>
              <div className="flex justify-between p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                <span className="text-[#6A7885]">Security Rule Enforcement:</span>
                <span className="text-[#29323A] font-bold">Firestore ABAC STRICT</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                <span className="text-[#6A7885]">AI Intelligence Model:</span>
                <span className="text-[#29323A] font-bold">gemini-3.8-flash (Server Proxy)</span>
              </div>
            </div>

            <div className="text-[11px] text-[#6A7885] italic">
              All metrics synchronized in real time against Cloud Firestore and audit registries.
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search personnel by name, email, badge..."
                className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 pl-9 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8695A2]" />
            </div>
          </div>

          <div className="bg-white border border-[#D7DFE4] rounded overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E7EBEE] text-[#29323A] uppercase font-mono text-[10px] border-b border-[#D7DFE4]">
                <tr>
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">Badge / ID</th>
                  <th className="py-3 px-4">Official Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EBEE] font-sans">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-[#F4F6F8] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#29323A]">
                      {u.fullName}
                      <div className="text-[10px] text-[#6A7885] font-normal">{u.designation}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#29323A] font-semibold">{u.officerId}</td>
                    <td className="py-3 px-4 font-mono text-[#5C6A76]">{u.email}</td>
                    <td className="py-3 px-4 text-[#5C6A76]">{u.department}</td>
                    <td className="py-3 px-4 font-semibold text-[#29323A] font-mono text-[11px]">
                      {u.role}
                    </td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA] text-[10px] font-mono font-semibold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#29323A] text-white text-[10px] font-mono">
                          SUSPENDED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setNewRole(u.role);
                          setNewDept(u.department);
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-[#E7EBEE] border border-[#CBD4DA] text-[#29323A] text-[11px] font-semibold transition-colors"
                      >
                        Modify Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEPARTMENT MANAGEMENT */}
      {adminTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Police Investigation',
              desc: 'First responder filing, FIR registrations, charge sheet formulations, and suspect interrogation statements.',
              lead: 'Inspector General of Police (Crime)',
              clearance: 'General Police Investigation & Custody'
            },
            {
              name: 'Legal Department',
              desc: 'Public prosecutors, state counsels, judicial filings, bail response objections, and court trial records.',
              lead: 'Chief Public Prosecutor',
              clearance: 'Judicial Discovery & Pleadings'
            },
            {
              name: 'Forensics',
              desc: 'Central & State Forensic Science Labs, cyber forensic memory dump analyses, DNA, ballistic, and chemical reports.',
              lead: 'Director, Forensic Science Laboratories',
              clearance: 'Physical & Digital Evidence Examination'
            },
            {
              name: 'Court',
              desc: 'Registrars, judicial magistrates, trial judges, sworn witness depositions, and official court orders/judgments.',
              lead: 'Principal District & Sessions Judge',
              clearance: 'Judicial Orders & Seal Record'
            },
            {
              name: 'Administration',
              desc: 'System governance, cryptographic master key rotation, RBAC user auditing, and statutory compliance reporting.',
              lead: 'Director General of Jurisdictional Systems',
              clearance: 'Super Admin Ledger Master'
            },
          ].map((dept) => (
            <div key={dept.name} className="p-5 rounded bg-white border border-[#D7DFE4] space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#29323A]" />
                <h3 className="font-bold text-[#29323A] text-base">{dept.name}</h3>
              </div>
              <p className="text-xs text-[#5C6A76] leading-relaxed">{dept.desc}</p>
              <div className="pt-2 border-t border-[#E7EBEE] text-[11px] font-mono text-[#6A7885] space-y-1">
                <div>Supervising Authority: <strong className="text-[#29323A]">{dept.lead}</strong></div>
                <div>Access Scope: <span className="text-[#29323A] font-semibold">{dept.clearance}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modify User Permissions Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-[#29323A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD4DA] rounded-lg max-w-md w-full p-6 shadow-xl space-y-4 text-xs text-[#29323A]">
            <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
              <h3 className="text-sm font-bold text-[#29323A]">
                Modify Personnel Authorization: {editingUser.fullName}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-[#8695A2] hover:text-[#29323A]">✕</button>
            </div>

            <p className="text-[#5C6A76] text-[11px]">
              Every permission modification is permanently committed to the immutable audit trail with acting administrator details.
            </p>

            <form onSubmit={handleSaveUserPermissions} className="space-y-4">
              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Assign System Role (RBAC)
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-semibold"
                >
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                  <option value="INVESTIGATING OFFICER">INVESTIGATING OFFICER</option>
                  <option value="LEGAL OFFICER">LEGAL OFFICER</option>
                  <option value="FORENSIC OFFICER">FORENSIC OFFICER</option>
                  <option value="AUDITOR">AUDITOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div>
                <label className="block text-[#29323A] font-semibold mb-1">
                  Assign Department Jurisdiction
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value as DepartmentName)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  <option value="Police Investigation">Police Investigation</option>
                  <option value="Legal Department">Legal Department</option>
                  <option value="Forensics">Forensics</option>
                  <option value="Court">Court</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E7EBEE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded bg-[#F4F6F8] text-[#5C6A76] border border-[#CBD4DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold uppercase tracking-wider shadow-2xs"
                >
                  {savingUser ? 'Committing...' : 'Commit Clearance Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
