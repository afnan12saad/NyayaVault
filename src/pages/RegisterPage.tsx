import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, User, Mail, KeyRound, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DepartmentName, UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [department, setDepartment] = useState<DepartmentName>('Police Investigation');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('INVESTIGATING OFFICER');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !officerId || !designation || !password) {
      setError('All credential and organizational fields are strictly mandatory.');
      return;
    }
    if (password !== confirmPass) {
      setError('Password authentication confirmation mismatch.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUp({
        fullName,
        email,
        pass: password,
        officerId,
        department,
        designation,
        role
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#29323A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex w-12 h-12 rounded bg-[#29323A] border border-[#29323A] items-center justify-center shadow-xs mb-3">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-wider uppercase text-[#29323A]">
          Officer & Stakeholder Registration
        </h2>
        <p className="mt-1 text-xs text-[#6A7885] font-mono">
          NyayaVault Jurisdictional Credential Provisioning
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#D7DFE4] rounded-lg shadow-sm">
          {error && (
            <div className="mb-6 p-3 rounded bg-[#29323A] text-white text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E7EBEE]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Insp. Vikram Verma"
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                  />
                  <User className="absolute right-3 top-2.5 w-4 h-4 text-[#8695A2]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Official Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="v.verma@police.gov.in"
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
                  />
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-[#8695A2]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Employee / Officer ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. DL-88492"
                    className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
                  />
                  <BadgeCheck className="absolute right-3 top-2.5 w-4 h-4 text-[#8695A2]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Designation / Post
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Investigating Officer"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Assigned Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white"
                >
                  <option value="Police Investigation">Police Investigation</option>
                  <option value="Legal Department">Legal Department</option>
                  <option value="Forensics">Forensics</option>
                  <option value="Court">Court</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  System Role (RBAC)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-semibold"
                >
                  <option value="INVESTIGATING OFFICER">INVESTIGATING OFFICER</option>
                  <option value="LEGAL OFFICER">LEGAL OFFICER</option>
                  <option value="FORENSIC OFFICER">FORENSIC OFFICER</option>
                  <option value="AUDITOR">AUDITOR</option>
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Security Passkey
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29323A] mb-1">
                  Confirm Passkey
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-xs text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7EBEE]">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Credentials...' : 'Register Official Profile'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-[#6A7885]">
            Already have an authorized profile?{' '}
            <Link to="/login" className="text-[#29323A] font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
