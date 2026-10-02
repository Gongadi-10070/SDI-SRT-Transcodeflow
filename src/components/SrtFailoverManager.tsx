import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Radio,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Settings,
  Clock,
  Download,
  Trash2,
  FileText,
  Activity,
  Zap,
  Lock,
  Music,
  Film,
  Tv,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SrtMode, EmergencyFallbackMode } from '../types/stream';

export const SrtFailoverManager: React.FC = () => {
  const {
    srtIngest,
    updateSrtIngest,
    srtFailoverConfig,
    switchSrtSource,
    updateSrtFailoverConfig,
    updateBackupSrtConfig,
    simulatePrimarySrtFailure,
    simulateBackupSrtFailure,
    restoreSrtFeeds,
    clearFailoverLogs,
    authState,
    sdiInput,
    updateSdiInput,
    emergencyFallbackConfig,
    updateEmergencyFallbackConfig,
    triggerEmergencyFallback,
    dismissEmergencyFallback,
    simulateTotalSignalLoss,
  } = useStream();

  const isReadOnly = authState.role === 'viewer';
  const [showConfigModal, setShowConfigModal] = useState(false);

  const activeSource = srtFailoverConfig.activeSource;
  const isPrimaryActive = activeSource === 'primary';

  const exportFailoverAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(srtFailoverConfig.eventsLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `srt_failover_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-950 border border-sky-800/60 text-sky-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                Automated SRT Input Failover & Seamless Hitless Redundancy
              </h3>
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                  srtFailoverConfig.autoFailoverEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {srtFailoverConfig.autoFailoverEnabled ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AUTO-FAILOVER ARMED</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
                    <span>MANUAL ONLY</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Continuous dual-path heartbeat monitoring across Primary and Secondary SRT ingest feeds with automatic millisecond protection switching.
            </p>
          </div>
        </div>

        {/* Master Auto-Failover Switch */}
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={() =>
                updateSrtFailoverConfig({
                  autoFailoverEnabled: !srtFailoverConfig.autoFailoverEnabled,
                })
              }
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shadow ${
                srtFailoverConfig.autoFailoverEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{srtFailoverConfig.autoFailoverEnabled ? 'AUTO-FAILOVER: ON' : 'AUTO-FAILOVER: OFF'}</span>
            </button>
          )}

          <button
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>CONFIGURE BACKUP FEED</span>
          </button>
        </div>
      </div>

      {/* Dual Ingest Status Display (Primary vs Backup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PRIMARY FEED CARD */}
        <div
          className={`p-4 rounded-lg border-2 transition flex flex-col justify-between gap-3 relative overflow-hidden ${
            isPrimaryActive
              ? 'bg-sky-950/30 border-sky-500 shadow-xl shadow-sky-500/10'
              : 'bg-neutral-900/40 border-neutral-800'
          }`}
        >
          {isPrimaryActive && (
            <div className="absolute top-0 right-0 bg-sky-500 text-black px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-bl">
              ON-AIR ACTIVE INGEST
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                PRIMARY SRT INGEST (PATH A)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  srtFailoverConfig.primaryHealth === 'healthy'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                }`}
              >
                {srtFailoverConfig.primaryHealth === 'healthy' ? 'SIGNAL HEALTHY' : 'SIGNAL LOST (0 KBPS)'}
              </span>
            </div>

            <div className="bg-neutral-950/80 p-2.5 rounded border border-neutral-800 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Endpoint:</span>
                <span className="text-neutral-200">{srtIngest.host}:{srtIngest.port} ({srtIngest.mode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Stream ID:</span>
                <span className="text-sky-300 font-bold">{srtIngest.streamId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Target Latency:</span>
                <span className="text-neutral-300">{srtIngest.latencyMs} ms</span>
              </div>
            </div>

            {/* Live Primary Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">BITRATE</span>
                <span className={`text-base font-bold ${srtFailoverConfig.primaryBitrateKbps > 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                  {srtFailoverConfig.primaryBitrateKbps}
                </span>
                <span className="text-[10px] text-neutral-500 block">kbps</span>
              </div>

              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">RTT</span>
                <span className="text-base font-bold text-neutral-200">
                  {srtFailoverConfig.primaryRttMs}
                </span>
                <span className="text-[10px] text-neutral-500 block">ms</span>
              </div>

              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">PKT LOSS</span>
                <span className={`text-base font-bold ${srtFailoverConfig.primaryPacketLossPercent < 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {srtFailoverConfig.primaryPacketLossPercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-neutral-500 block">drop</span>
              </div>
            </div>
          </div>

          {!isReadOnly && !isPrimaryActive && (
            <button
              onClick={() => switchSrtSource('primary', 'Manual operator protection override to Primary')}
              className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>FORCE SEAMLESS CUT TO PRIMARY</span>
            </button>
          )}
        </div>

        {/* SECONDARY / BACKUP FEED CARD */}
        <div
          className={`p-4 rounded-lg border-2 transition flex flex-col justify-between gap-3 relative overflow-hidden ${
            !isPrimaryActive
              ? 'bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-500/10'
              : 'bg-neutral-900/40 border-neutral-800'
          }`}
        >
          {!isPrimaryActive && (
            <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-bl">
              ON-AIR ACTIVE INGEST
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                SECONDARY BACKUP INGEST (PATH B)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  srtFailoverConfig.backupHealth === 'healthy'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                }`}
              >
                {srtFailoverConfig.backupHealth === 'healthy' ? 'SIGNAL HEALTHY (HOT STANDBY)' : 'SIGNAL LOST (0 KBPS)'}
              </span>
            </div>

            <div className="bg-neutral-950/80 p-2.5 rounded border border-neutral-800 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Endpoint:</span>
                <span className="text-neutral-200">{srtFailoverConfig.backupConfig.host}:{srtFailoverConfig.backupConfig.port} ({srtFailoverConfig.backupConfig.mode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Stream ID:</span>
                <span className="text-purple-300 font-bold">{srtFailoverConfig.backupConfig.streamId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Target Latency:</span>
                <span className="text-neutral-300">{srtFailoverConfig.backupConfig.latencyMs} ms</span>
              </div>
            </div>

            {/* Live Backup Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">BITRATE</span>
                <span className={`text-base font-bold ${srtFailoverConfig.backupBitrateKbps > 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                  {srtFailoverConfig.backupBitrateKbps}
                </span>
                <span className="text-[10px] text-neutral-500 block">kbps</span>
              </div>

              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">RTT</span>
                <span className="text-base font-bold text-neutral-200">
                  {srtFailoverConfig.backupRttMs}
                </span>
                <span className="text-[10px] text-neutral-500 block">ms</span>
              </div>

              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">PKT LOSS</span>
                <span className={`text-base font-bold ${srtFailoverConfig.backupPacketLossPercent < 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {srtFailoverConfig.backupPacketLossPercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-neutral-500 block">drop</span>
              </div>
            </div>
          </div>

          {!isReadOnly && isPrimaryActive && (
            <button
              onClick={() => switchSrtSource('backup', 'Manual operator protection override to Backup')}
              className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>FORCE SEAMLESS CUT TO BACKUP</span>
            </button>
          )}
        </div>
      </div>

      {/* Failover Simulation & Recovery Suite */}
      {!isReadOnly && (
        <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              SRT FAILOVER PROTECTION SIMULATION CONSOLE
            </span>
            <span className="text-[11px] text-neutral-500">
              Verify automatic hitless switching and audit logging under failure conditions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={simulatePrimarySrtFailure}
              className="px-3 py-2 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold transition flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>SIMULATE PRIMARY LINK LOSS (0 KBPS)</span>
            </button>

            <button
              onClick={simulateBackupSrtFailure}
              className="px-3 py-2 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-bold transition flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SIMULATE BACKUP LINK LOSS</span>
            </button>

            <button
              onClick={restoreSrtFeeds}
              className="px-3 py-2 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RESTORE ALL FEEDS TO HEALTHY</span>
            </button>
          </div>
        </div>
      )}

      {/* TOTAL INGEST LOSS EMERGENCY FALLBACK (STAY TUNED / MONTAGE WITH COOL MUSIC / PLAYLIST) */}
      <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-950 border border-amber-800 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                COMPLETE INGEST SIGNAL LOSS PROTECTION (SDI + ALL SRT FEEDS DOWN)
              </span>
              <span className="text-[11px] text-neutral-400">
                If baseband SDI and both Primary/Backup SRT inputs are lost, automatically insert emergency slate, animated montage with cool music, or backup playlist.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                emergencyFallbackConfig.isEngaged
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {emergencyFallbackConfig.isEngaged ? 'EMERGENCY FEED ON-AIR' : 'STANDBY ARMED'}
            </span>
          </div>
        </div>

        {/* Live Input Signal Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">BASEBAND SDI INPUT</span>
            <span className="font-bold text-neutral-200 block mt-0.5">{sdiInput.deviceName.slice(0, 22)}...</span>
            <span className={`text-[10px] font-bold block mt-1 ${sdiInput.signalLocked ? 'text-emerald-400' : 'text-rose-400'}`}>
              {sdiInput.signalLocked ? '● SIGNAL LOCKED' : '○ NO SDI SIGNAL'}
            </span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">PRIMARY SRT INGEST (PATH A)</span>
            <span className="font-bold text-neutral-200 block mt-0.5">Port {srtIngest.port}</span>
            <span className={`text-[10px] font-bold block mt-1 ${srtFailoverConfig.primaryHealth === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {srtFailoverConfig.primaryHealth === 'healthy' ? '● STREAM HEALTHY' : '○ DISCONNECTED / 0 KBPS'}
            </span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">BACKUP SRT INGEST (PATH B)</span>
            <span className="font-bold text-neutral-200 block mt-0.5">Port {srtFailoverConfig.backupConfig.port}</span>
            <span className={`text-[10px] font-bold block mt-1 ${srtFailoverConfig.backupHealth === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {srtFailoverConfig.backupHealth === 'healthy' ? '● HOT STANDBY' : '○ DISCONNECTED / 0 KBPS'}
            </span>
          </div>
        </div>

        {/* Emergency Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mode 1: Stay Tuned Slate */}
          <div
            onClick={() => !isReadOnly && updateEmergencyFallbackConfig({ activeMode: 'stay_tuned' })}
            className={`p-3 rounded-lg border cursor-pointer transition space-y-1.5 ${
              emergencyFallbackConfig.activeMode === 'stay_tuned'
                ? 'bg-amber-950/40 border-amber-500 text-neutral-100 shadow-lg shadow-amber-500/10'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
                <Tv className="w-3.5 h-3.5" />
                1. "STAY TUNED" SLATE
              </span>
              {emergencyFallbackConfig.activeMode === 'stay_tuned' && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-bold">SELECTED</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Displays "Stay Tuned, We Will Be Right Back" with Tv9 TELUGU branding, recovery status, and radar scan.
            </p>
          </div>

          {/* Mode 2: Cool Montage with Music */}
          <div
            onClick={() => !isReadOnly && updateEmergencyFallbackConfig({ activeMode: 'montage_music' })}
            className={`p-3 rounded-lg border cursor-pointer transition space-y-1.5 ${
              emergencyFallbackConfig.activeMode === 'montage_music'
                ? 'bg-purple-950/40 border-purple-500 text-neutral-100 shadow-lg shadow-purple-500/10'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-purple-300">
                <Music className="w-3.5 h-3.5" />
                2. COOL MONTAGE & MUSIC
              </span>
              {emergencyFallbackConfig.activeMode === 'montage_music' && (
                <span className="px-1.5 py-0.2 rounded bg-purple-500 text-white text-[9px] font-bold">SELECTED</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Animated audio frequency spectrum, geometric kaleidoscope trails, and live synthesized ambient chill broadcast music.
            </p>
          </div>

          {/* Mode 3: Standby Video Playlist */}
          <div
            onClick={() => !isReadOnly && updateEmergencyFallbackConfig({ activeMode: 'emergency_playlist' })}
            className={`p-3 rounded-lg border cursor-pointer transition space-y-1.5 ${
              emergencyFallbackConfig.activeMode === 'emergency_playlist'
                ? 'bg-emerald-950/40 border-emerald-500 text-neutral-100 shadow-lg shadow-emerald-500/10'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-300">
                <Film className="w-3.5 h-3.5" />
                3. EMERGENCY PLAYLIST
              </span>
              {emergencyFallbackConfig.activeMode === 'emergency_playlist' && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-bold">SELECTED</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Auto-advances through {emergencyFallbackConfig.playlist.length} standby 4K/HD video clips (promos, scenic reels, cultural filler).
            </p>
          </div>
        </div>

        {/* Emergency Trigger Controls */}
        {!isReadOnly && (
          <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => simulateTotalSignalLoss()}
                className="px-3 py-2 rounded bg-rose-950 hover:bg-rose-900 border border-rose-600/80 text-rose-200 font-bold transition flex items-center gap-1.5 shadow"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>SIMULATE TOTAL INGEST LOSS (TEST AUTO-MONTAGE)</span>
              </button>

              <button
                onClick={() => {
                  updateSdiInput({ signalLocked: true });
                  restoreSrtFeeds();
                  dismissEmergencyFallback();
                }}
                className="px-3 py-2 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTORE ALL INGEST LINKS</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerEmergencyFallback()}
                className="px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>TEST ENGAGE SLATE</span>
              </button>

              {emergencyFallbackConfig.isEngaged && (
                <button
                  onClick={() => dismissEmergencyFallback()}
                  className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>DISMISS EMERGENCY SLATE</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail Log of Failover Events */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            PROTECTION SWITCHING AUDIT TRAIL LOG ({srtFailoverConfig.eventsLog.length} EVENTS)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={exportFailoverAuditLog}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold flex items-center gap-1 text-[11px]"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>EXPORT AUDIT JSON</span>
            </button>

            {!isReadOnly && (
              <button
                onClick={clearFailoverLogs}
                className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-rose-400 font-bold flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3 h-3" />
                <span>CLEAR</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-neutral-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">TRANSITION</th>
                <th className="py-2 px-3">SWITCH LATENCY</th>
                <th className="py-2 px-3">TRIGGER REASON</th>
                <th className="py-2 px-3">TYPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 bg-neutral-950/60">
              {srtFailoverConfig.eventsLog.map((ev) => (
                <tr key={ev.id} className="hover:bg-neutral-900/40">
                  <td className="py-2 px-3 text-neutral-400 whitespace-nowrap">{ev.timestamp}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 font-bold">
                      {ev.fromSource.toUpperCase()} &rarr; {ev.toSource.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-400 whitespace-nowrap">
                    {ev.switchLatencyMs} ms
                  </td>
                  <td className="py-2 px-3 text-neutral-300 max-w-md truncate">
                    {ev.triggerReason}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.autoSwitched
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {ev.autoSwitched ? 'AUTOMATIC PROTECTION' : 'MANUAL COMMAND'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup Ingest Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                SECONDARY BACKUP SRT INGEST CONFIGURATION
              </span>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">BACKUP SRT HOST / IP</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={srtFailoverConfig.backupConfig.host}
                  onChange={(e) => updateBackupSrtConfig({ host: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">PORT</label>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={srtFailoverConfig.backupConfig.port}
                    onChange={(e) => updateBackupSrtConfig({ port: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">MODE</label>
                  <select
                    disabled={isReadOnly}
                    value={srtFailoverConfig.backupConfig.mode}
                    onChange={(e) => updateBackupSrtConfig({ mode: e.target.value as SrtMode })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 uppercase"
                  >
                    <option value="caller">Caller</option>
                    <option value="listener">Listener</option>
                    <option value="rendezvous">Rendezvous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">STREAM ID</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={srtFailoverConfig.backupConfig.streamId}
                  onChange={(e) => updateBackupSrtConfig({ streamId: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">LATENCY (MS)</label>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={srtFailoverConfig.backupConfig.latencyMs}
                    onChange={(e) => updateBackupSrtConfig({ latencyMs: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">PASSPHRASE</label>
                  <input
                    type="password"
                    disabled={isReadOnly}
                    value={srtFailoverConfig.backupConfig.passphrase}
                    onChange={(e) => updateBackupSrtConfig({ passphrase: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                APPLY & SAVE SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
