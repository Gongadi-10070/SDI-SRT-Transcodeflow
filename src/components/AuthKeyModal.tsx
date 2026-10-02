import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Key,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface AuthKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthKeyModal: React.FC<AuthKeyModalProps> = ({ isOpen, onClose }) => {
  const { authState, loginWithKey, logoutToReadOnly } = useStream();
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginWithKey(inputKey);
    if (success) {
      setInputKey('');
      onClose();
    } else {
      setErrorMsg('Invalid Authorization Passkey. Default key is: MCR-2026-KEY');
    }
  };

  const handleLockDashboard = () => {
    logoutToReadOnly();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded ${authState.role === 'admin' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-amber-950 border border-amber-800 text-amber-400'}`}>
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 uppercase tracking-wider">
                MCR Security & Wall Monitor Passkey (🔑)
              </h3>
              <p className="text-neutral-400 text-xs">
                Role-based access: Switch between Master Control and Read-Only Wall Monitor mode.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="p-3 rounded bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {authState.role === 'admin' ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="text-[10px] text-neutral-500 block">CURRENT MODE</span>
              <span className="font-bold text-neutral-100">
                {authState.role === 'admin' ? 'ENGINEER MASTER CONTROL (UNLOCKED)' : 'READ-ONLY WALL MONITOR (LOCKED)'}
              </span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              authState.role === 'admin'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {authState.role}
          </span>
        </div>

        {/* View-Only Mode Explanation */}
        <div className="text-[11px] text-neutral-400 space-y-1">
          <p>
            • <strong className="text-amber-300">Read-Only Wall Monitor</strong>: Anyone can open this dashboard anywhere to view telemetry, live video preview, loudness, and QoE charts without ability to stop streams or modify transcoders.
          </p>
          <p>
            • <strong className="text-emerald-300">Full Engineer Control</strong>: Requires authorization passkey <code className="bg-neutral-900 px-1 py-0.5 rounded text-sky-300">MCR-2026-KEY</code>.
          </p>
        </div>

        {/* Action Form */}
        {authState.role === 'viewer' ? (
          <form onSubmit={handleLogin} className="space-y-3 pt-1">
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1 font-bold">
                ENTER ENGINEER PASSKEY TO UNLOCK CONTROLS (🔑):
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Enter MCR-2026-KEY"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white pr-10 focus:border-emerald-500 font-mono text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Default Master Passkey: <strong className="text-neutral-300">MCR-2026-KEY</strong>
              </span>
            </div>

            {errorMsg && (
              <div className="p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <Unlock className="w-4 h-4" />
              <span>UNLOCK FULL OPERATOR CONTROL</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONTROLS FULLY OPERATIONAL
              </span>
              <p className="text-neutral-400">
                You can lock this workstation into Read-Only Wall Monitor mode before displaying on public monitors or sharing with remote analysts.
              </p>
            </div>

            <button
              onClick={handleLockDashboard}
              className="w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <Lock className="w-4 h-4" />
              <span>LOCK WORKSTATION TO READ-ONLY DASHBOARD VIEW</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
