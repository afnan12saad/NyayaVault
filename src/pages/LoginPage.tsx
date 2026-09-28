import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Mail, ArrowRight, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../services/seedData';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, resetPassword, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide official email and credentials.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (roleKey: keyof typeof DEMO_USERS) => {
    switchDemoRole(roleKey);
    navigate('/dashboard');
  };

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email address above to receive reset instructions.');
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Password reset request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#29323A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded bg-[#29323A] border border-[#29323A] items-center justify-center shadow-xs mb-3">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-wider uppercase text-[#29323A]">
          Nyaya<span className="text-[#6A7885]">Vault</span> Access
        </h2>
        <p className="mt-1 text-xs text-[#6A7885] font-mono">
          Jurisdictional Document Security & Chain of Custody System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#D7DFE4] rounded-lg shadow-sm">
          {error && (
            <div className="mb-6 p-3 rounded bg-[#29323A] text-white text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E7EBEE]" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 p-3 rounded bg-[#E7EBEE] border border-[#CBD4DA] text-[#29323A] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#29323A]" />
              <span>Password recovery transmission dispatched to specified email.</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#29323A] mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@police.gov.in"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-sm text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
                />
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-[#8695A2]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#29323A]">
                  Security Passkey / Password
                </label>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-[#5C6A76] hover:underline"
                >
                  Reset Passkey?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-sm text-[#29323A] focus:outline-none focus:border-[#29323A] focus:bg-white font-mono"
                />
                <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-[#8695A2]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Authenticate & Enter Vault'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-[#E7EBEE]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#29323A] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#29323A]" />
                Evaluation Persona Mode
              </span>
              <span className="text-[10px] text-[#6A7885]">1-Click instant login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('investigator')}
                className="p-2.5 rounded bg-[#F4F6F8] hover:bg-[#E7EBEE] border border-[#D7DFE4] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-[#29323A]">Investigating Officer</div>
                <div className="text-[10px] text-[#6A7885] truncate">Insp. Verma (Police)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('legal')}
                className="p-2.5 rounded bg-[#F4F6F8] hover:bg-[#E7EBEE] border border-[#D7DFE4] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-[#29323A]">Legal Officer</div>
                <div className="text-[10px] text-[#6A7885] truncate">Adv. Deshmukh (Prosecutor)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('forensics')}
                className="p-2.5 rounded bg-[#F4F6F8] hover:bg-[#E7EBEE] border border-[#D7DFE4] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-[#29323A]">Forensic Officer</div>
                <div className="text-[10px] text-[#6A7885] truncate">Dr. Kabir Sen (CFSL)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('auditor')}
                className="p-2.5 rounded bg-[#F4F6F8] hover:bg-[#E7EBEE] border border-[#D7DFE4] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-[#29323A]">Auditor</div>
                <div className="text-[10px] text-[#6A7885] truncate">Smt. Nair (Compliance)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                className="p-2.5 rounded bg-[#F4F6F8] hover:bg-[#E7EBEE] border border-[#BAC6CE] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-[#29323A]">Super Admin</div>
                <div className="text-[10px] text-[#6A7885] truncate">Shri Malhotra (Controller)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('viewer')}
                className="p-2.5 rounded bg-[#F4F6F8] hover:bg-[#E7EBEE] border border-[#D7DFE4] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-[#5C6A76]">Viewer</div>
                <div className="text-[10px] text-[#8695A2] truncate">Court Registry Clerk</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#6A7885]">
            Don't have an officer profile?{' '}
            <Link to="/register" className="text-[#29323A] font-semibold hover:underline">
              Register Credentials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
