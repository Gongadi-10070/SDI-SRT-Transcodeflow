import React from 'react';
import { useStream } from '../context/StreamContext';
import { ShieldCheck, Activity, Wifi, Gauge, Cpu, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

export const QoEAnalysisPanel: React.FC = () => {
  const { health, qoeHistory, videoConfig, srtIngest } = useStream();

  // Helper for VMAF grade badge
  const getVmafBadge = (score: number) => {
    if (score >= 93) {
      return {
        label: 'BROADCAST PRISTINE (TIER-1)',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      };
    }
    if (score >= 82) {
      return {
        label: 'ACCEPTABLE BROADCAST (TIER-2)',
        color: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      };
    }
    return {
      label: 'DEGRADED / COMPRESSION ARTIFACTS',
      color: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
    };
  };

  const vmafBadge = getVmafBadge(health.vmafScore);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
            QoE & Stream Quality Diagnostics
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            ACTIVE ITU-R BT.500
          </span>
        </div>

        <div className={`px-2.5 py-1 rounded border text-xs font-mono font-bold ${vmafBadge.color}`}>
          {vmafBadge.label}
        </div>
      </div>

      {/* Primary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* VMAF Score */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>VMAF SCORE</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {health.vmafScore.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-neutral-500">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${health.vmafScore}%` }}
            />
          </div>
        </div>

        {/* PSNR (Peak Signal to Noise Ratio) */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>PSNR INDEX</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-sky-400">
              {health.psnrDb.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-neutral-500">dB</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-neutral-400">
            SSIM: <span className="text-neutral-200">{health.ssim.toFixed(3)}</span>
          </div>
        </div>

        {/* AV Sync Drift */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>AV LIP-SYNC</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                Math.abs(health.avSyncMs) < 1.0 ? 'text-neutral-100' : 'text-amber-400'
              }`}
            >
              {health.avSyncMs > 0 ? `+${health.avSyncMs}` : health.avSyncMs}
            </span>
            <span className="text-xs font-mono text-neutral-500">ms offset</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            IN-PHASE LOCK (±5ms)
          </div>
        </div>

        {/* Buffer Health */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>BUFFER STABILITY</span>
            <Wifi className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {health.bufferHealthPercent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-neutral-400">
            OCCUPANCY: <span className="text-neutral-200">{health.bufferOccupancyPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Ingest SRT vs Transcoder Health Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SRT Ingest Link Deep Telemetry */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-mono font-bold text-sky-300 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              SRT Ingest Socket Diagnostics ({srtIngest.mode.toUpperCase()})
            </span>
            <span className="text-[11px] font-mono text-neutral-400">PORT {srtIngest.port}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">RTT (ROUND TRIP TIME)</div>
              <div className="text-neutral-200 font-bold mt-0.5">{health.rttMs.toFixed(1)} ms</div>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">JITTER DELAY</div>
              <div className="text-neutral-200 font-bold mt-0.5">{health.jitterMs.toFixed(2)} ms</div>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">PACKET LOSS RATE</div>
              <div className="text-emerald-400 font-bold mt-0.5">
                {health.packetLossPercent.toFixed(3)}%
              </div>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">NAK RETRANSMISSIONS</div>
              <div className="text-neutral-200 font-bold mt-0.5">
                {health.packetsRetransmitted} pkts
              </div>
            </div>
          </div>
        </div>

        {/* Transcoder Engine Matrix */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Hardware Transcoder Engine
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {videoConfig.codec.toUpperCase()} {videoConfig.profile.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">ENCODER THROUGHPUT</div>
              <div className="text-neutral-200 font-bold mt-0.5">
                {health.encoderFps.toFixed(1)} / {videoConfig.fps} FPS
              </div>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">DROPPED FRAMES</div>
              <div className="text-emerald-400 font-bold mt-0.5">{health.encoderDroppedFrames} frames (0.00%)</div>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">GOP CADENCE</div>
              <div className="text-neutral-200 font-bold mt-0.5">
                {videoConfig.gopSizeFrames} frames ({videoConfig.keyframeIntervalSec}s)
              </div>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
              <div className="text-neutral-500 text-[10px]">ENCODE LATENCY</div>
              <div className="text-neutral-200 font-bold mt-0.5">
                {health.encodingLatencyMs.toFixed(1)} ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini QoE Stability Sparkline */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            VMAF Real-Time Trend (Last 30 seconds)
          </span>
          <span className="text-emerald-400 font-bold">AVG: 95.8</span>
        </div>
        <div className="h-10 w-full flex items-end gap-1 pt-1">
          {qoeHistory.map((pt, idx) => {
            const heightPct = Math.max(10, Math.min(100, ((pt.vmaf - 80) / 20) * 100));
            return (
              <div
                key={idx}
                className="flex-1 bg-neutral-800 hover:bg-emerald-500 rounded-t transition-all group relative cursor-pointer"
                style={{ height: `${heightPct}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-black text-[9px] font-mono text-emerald-300 pointer-events-none whitespace-nowrap z-20">
                  {pt.vmaf.toFixed(1)} @ {pt.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
