import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Radio,
  Play,
  Square,
  Activity,
  Cpu,
  Clock,
  ShieldCheck,
  Server,
  Layers,
  Zap,
  Users,
  Settings,
  FileText,
  Lock,
  Mail,
  Bell,
  Cable,
  Disc,
  Waves,
  Laptop,
  Key,
  ArrowRightLeft,
} from 'lucide-react';
import { WindowsExeModal } from './WindowsExeModal';
import { AuthKeyModal } from './AuthKeyModal';

interface HeaderNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentTab, setCurrentTab }) => {
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const {
    isStreaming,
    startStreaming,
    stopStreaming,
    inputSource,
    setInputSource,
    health,
    srtIngest,
    videoConfig,
    receivers,
    activeIncidents,
    recorderConfig,
    loudnessMetrics,
    authState,
    srtFailoverConfig,
  } = useStream();

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 text-neutral-200 sticky top-0 z-40 select-none shadow-xl">
      {/* Read-Only Wall Monitor Banner */}
      {authState.role === 'viewer' && (
        <div className="bg-amber-950/90 border-b border-amber-600/60 text-amber-200 px-4 py-1.5 text-[11px] font-mono font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            READ-ONLY WALL MONITOR DASHBOARD — CONTROLS LOCKED (TELEMETRY & MONITORING ONLY)
          </span>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="underline hover:text-white flex items-center gap-1.5 font-bold"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>ENTER PASSKEY TO UNLOCK CONTROLS (🔑)</span>
          </button>
        </div>
      )}

      {/* Top Telemetry & Control Strip */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80">
        {/* Brand & Tally Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-tight text-white text-base">
                  SRT TranscodeFlow <span className="text-sky-400 text-xs px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800">MCR</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                    isStreaming
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isStreaming ? 'bg-rose-500 animate-tally' : 'bg-neutral-500'
                    }`}
                  />
                  {isStreaming ? 'ON-AIR' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-600/50 text-amber-300 font-semibold tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Digital layout architect by GNR SMB -Tv9 TELUGU
                </span>
                <span className="text-neutral-500 hidden sm:inline">|</span>
                <span className="text-neutral-400">
                  SRT {srtIngest.mode.toUpperCase()} : {srtIngest.port} ➔ HLS / SRT / RTMP EGRESS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Telemetry Bar */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500">UPTIME:</span>
            <span className="text-neutral-200 font-bold">{formatUptime(health.uptimeSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-neutral-500">CPU LOAD:</span>
            <span className="text-sky-300 font-bold">{health.encoderCpuPercent.toFixed(1)}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-500">FPS:</span>
            <span className="text-emerald-400 font-bold">{health.encoderFps.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-500">CLIENTS:</span>
            <span className="text-amber-300 font-bold">{receivers.length}</span>
          </div>
        </div>

        {/* Master Input Source A/B Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded font-mono text-xs">
          <button
            onClick={() => setInputSource('sdi')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
              inputSource === 'sdi'
                ? 'bg-amber-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Switch Master Input to 12G-SDI Baseband with SCTE-104 VANC"
          >
            <span className={`w-2 h-2 rounded-full ${inputSource === 'sdi' ? 'bg-black' : 'bg-neutral-600'}`} />
            <span>SDI IN</span>
          </button>
          <button
            onClick={() => setInputSource('srt')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
              inputSource === 'srt'
                ? 'bg-sky-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Switch Master Input to IP SRT Stream Ingest"
          >
            <span className={`w-2 h-2 rounded-full ${inputSource === 'srt' ? 'bg-black' : 'bg-neutral-600'}`} />
            <span>SRT IN</span>
          </button>
        </div>

        {/* Master Engine Power Button & Windows .EXE button & Key Button */}
        <div className="flex items-center gap-2">
          {/* Operator Passkey / Role Lock Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold transition shadow ${
              authState.role === 'admin'
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300'
                : 'bg-amber-950/90 hover:bg-amber-900 border border-amber-600 text-amber-300 animate-pulse'
            }`}
            title="MCR Operator Passkey & Read-Only Dashboard View"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{authState.role === 'admin' ? 'KEY (🔑) ADMIN' : 'KEY (🔒) READ-ONLY'}</span>
          </button>

          <button
            onClick={() => setIsExeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-600/60 text-sky-300 font-bold transition shadow"
            title="Package and Download Windows .EXE Standalone Desktop App"
          >
            <Laptop className="w-3.5 h-3.5 text-sky-400" />
            <span>WINDOWS .EXE</span>
          </button>

          {authState.role === 'viewer' ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-neutral-800 text-neutral-400 font-mono text-xs font-bold flex items-center gap-1.5 border border-neutral-700 cursor-not-allowed"
              title="Controls locked in Read-Only Wall Monitor mode. Click to enter passkey."
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>CONTROLS LOCKED</span>
            </button>
          ) : isStreaming ? (
            <button
              onClick={stopStreaming}
              className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-rose-600/30"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP ENGINE</span>
            </button>
          ) : (
            <button
              onClick={startStreaming}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30 animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START ENGINE</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto text-xs font-mono py-1.5 bg-neutral-900/60">
        {[
          { id: 'mcr', label: 'Master Monitor & Live Telemetry', icon: Activity },
          { id: 'sdi_matrix', label: `SDI & SCTE-104 (${inputSource.toUpperCase()})`, icon: Cable },
          {
            id: 'failover',
            label: `SRT Redundancy (${srtFailoverConfig.activeSource.toUpperCase()})`,
            icon: ArrowRightLeft,
          },
          {
            id: 'recorder',
            label: recorderConfig.isRecording ? 'Stream Recorder (● REC)' : 'Stream Recorder',
            icon: Disc,
          },
          {
            id: 'loudness',
            label: `EBU R128 (${loudnessMetrics.integratedLufs.toFixed(1)} LUFS)`,
            icon: Waves,
          },
          { id: 'config', label: 'Transcoder & Ingest Config', icon: Settings },
          { id: 'hls_profiles', label: 'HLS ABR Profiles & Dolby Audio', icon: Layers },
          { id: 'ssl', label: 'HTTPS & SSL / TLS Security', icon: Lock },
          {
            id: 'smtp',
            label: activeIncidents.length > 0 ? `SMTP Alerts (${activeIncidents.length} ALARMS)` : 'SMTP Mail Alerts',
            icon: Mail,
          },
          { id: 'receivers', label: `Connected Viewers (${receivers.length})`, icon: Users },
          { id: 'scte', label: 'SCTE-35 Ad Insertion', icon: Zap },
          { id: 'lband', label: 'L-Band & Logo Inserter', icon: Layers },
          { id: 'qoe', label: 'QoE & Diagnostic Studio', icon: ShieldCheck },
          { id: 'logs', label: 'MCR Event Log', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 whitespace-nowrap transition ${
                isActive
                  ? 'bg-sky-500 text-black font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Windows .EXE Desktop App Modal */}
      <WindowsExeModal isOpen={isExeModalOpen} onClose={() => setIsExeModalOpen(false)} />

      {/* Operator Passkey / Role Auth Modal */}
      <AuthKeyModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
