import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../../services/dbService';
import { DEMO_USERS } from '../../services/seedData';
import { NotificationRecord } from '../../types';
import {
  NyayaVaultMark,
  UserOfficerIcon,
  BellAlertIcon,
  ChevronDownIcon,
  CloseModalIcon,
  LockSealIcon
} from '../common/LegalIcons';

export const Navbar: React.FC = () => {
  const { userProfile, role, department, signOut, switchDemoRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.uid) {
      getUserNotifications(userProfile.uid).then(setNotifications).catch(() => {});
    }
  }, [userProfile?.uid]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: NotificationRecord) => {
    await markNotificationAsRead(notif.notificationId);
    setNotifications(prev => prev.map(n => n.notificationId === notif.notificationId ? { ...n, isRead: true } : n));
    if (notif.resourceType === 'DOCUMENT' && notif.resourceId) {
      navigate(`/documents/${notif.resourceId}`);
    } else if (notif.resourceType === 'CASE' && notif.resourceId) {
      navigate(`/cases/${notif.resourceId}`);
    }
    setNotifsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#191817] border-b border-[#2C2926] text-[#FAF7F2] shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Archival Identity */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 border border-[#3E3933] bg-[#22201D] flex items-center justify-center transition-colors group-hover:border-[#6F263D]">
              <NyayaVaultMark size={20} accent={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold tracking-wider text-lg text-[#FAF7F2]">
                  Nyaya<span className="text-[#DDD6CA] font-normal italic">Vault</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#22201D] text-[#DDD6CA] border border-[#3E3933] font-mono tracking-widest uppercase">
                  LEGAL ARCHIVE
                </span>
              </div>
              <p className="text-[10px] text-[#8F877B] tracking-wide font-sans hidden sm:block">
                Judicial Records & Tamper-Evident Evidence System
              </p>
            </div>
          </Link>

          {/* Archival Ledger Status Tag */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#22201D] border border-[#332F2A] text-[10px] font-mono text-[#B5AEA2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F263D]" />
            <span className="tracking-widest">RECORD CHAIN SEALED</span>
          </div>
        </div>

        {/* Right Actions & Institutional Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Role Context Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#22201D] hover:bg-[#2A2723] border border-[#38332E] text-xs transition-colors"
              title="Switch user role for testing"
            >
              <UserOfficerIcon className="text-[#DDD6CA]" size={15} />
              <div className="text-left hidden md:block">
                <div className="text-[9px] uppercase font-mono tracking-wider text-[#8F877B] leading-none">Role Context</div>
                <div className="font-medium text-[#FAF7F2] text-xs leading-tight font-serif">{role}</div>
              </div>
              <ChevronDownIcon size={14} className="text-[#8F877B]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#FAF7F2] border border-[#DDD6CA] shadow-xl p-2 z-50 text-[#191817]">
                <div className="px-2 py-1.5 border-b border-[#DDD6CA] mb-1">
                  <p className="text-xs font-serif font-bold text-[#191817]">Switch Institutional Role</p>
                  <p className="text-[10px] font-sans text-[#7A7368]">Audit role-based permissions & custody rules</p>
                </div>
                <div className="space-y-1">
                  {Object.entries(DEMO_USERS).map(([key, u]) => (
                    <button
                      key={key}
                      onClick={() => {
                        switchDemoRole(key as any);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 text-xs transition-colors flex items-start gap-2.5 border-l-2 ${
                        role === u.role
                          ? 'border-[#6F263D] bg-[#EFE9DD] text-[#191817]'
                          : 'border-transparent hover:bg-[#F3EFE6] text-[#4A453E]'
                      }`}
                    >
                      <div className="mt-0.5">
                        <span className={`w-2 h-2 rounded-full inline-block ${role === u.role ? 'bg-[#6F263D]' : 'bg-[#DDD6CA]'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-serif font-semibold text-xs flex items-center justify-between text-[#191817]">
                          <span>{u.role}</span>
                          <span className="text-[9px] font-mono text-[#7A7368]">{u.officerId}</span>
                        </div>
                        <div className="text-[11px] font-sans text-[#4A453E]">{u.fullName}</div>
                        <div className="text-[10px] italic font-serif text-[#7A7368]">{u.department}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Folio */}
          <div className="relative">
            <button
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="relative p-2 text-[#DDD6CA] hover:text-[#FAF7F2] bg-[#22201D] hover:bg-[#2A2723] border border-[#38332E] transition-colors"
              title="Archival Dispatch & Alerts"
            >
              <BellAlertIcon size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6F263D] text-[#FAF7F2] text-[9px] font-mono font-bold flex items-center justify-center border border-[#191817]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#FAF7F2] border border-[#DDD6CA] shadow-xl p-2 z-50 text-[#191817]">
                <div className="px-3 py-2 border-b border-[#DDD6CA] flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-[#191817]">Archival Alerts & Log</span>
                  <span className="text-[10px] font-mono text-[#7A7368]">{unreadCount} UNREAD</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#EAE4D7]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#7A7368] font-serif italic">
                      No pending dispatch or integrity notifications.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.notificationId}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 text-xs hover:bg-[#F3EFE6] cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-[#F5EFE3]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-semibold text-[#191817]">{n.title}</span>
                          <span className="text-[9px] text-[#7A7368] font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#4A453E] text-[11px] font-sans mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Officer Identity & Sign Out */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[#38332E]">
            <div className="text-right">
              <div className="text-xs font-serif font-medium text-[#FAF7F2] leading-tight">
                {userProfile?.fullName || 'Authorized Jurist'}
              </div>
              <div className="text-[9px] font-mono text-[#8F877B] leading-none tracking-wider">
                {userProfile?.officerId || 'ID #00'} • {department}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-[#DDD6CA] hover:text-[#FAF7F2] hover:bg-[#2A2723] bg-[#22201D] border border-[#38332E] transition-colors"
              title="Sign Out / Seal Session"
            >
              <LockSealIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
