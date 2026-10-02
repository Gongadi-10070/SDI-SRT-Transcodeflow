import React from 'react';
import { useStream } from '../context/StreamContext';
import { Radio, Zap, Layers, Users, Activity, ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react';

export const MCRStatusBar: React.FC = () => {
  const {
    isStreaming,
    srtIngest,
    videoConfig,
    hlsEgress,
    srtEgress,
    rtmpEgress,
    httpsSslConfig,
    lbandConfig,
    activeAdBreak,
    receivers,
    health,
  } = useStream();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800/90 py-1.5 px-4 text-xs font-mono text-neutral-400 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left side: Ingest & Egress pipeline state */}
      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        {/* SRT Ingest State */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isStreaming ? 'bg-sky-400 animate-pulse' : 'bg-neutral-600'
            }`}
          />
          <span className="text-neutral-500">SRT IN:</span>
          <span className="text-neutral-200 font-bold uppercase">
            {srtIngest.mode}:{srtIngest.port}
          </span>
          <span className="text-sky-400">({(health.ingestBitrateKbps / 1000).toFixed(1)}M)</span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">|</span>

        {/* Transcoder Profile */}
        <div className="flex items-center gap-1.5 hidden md:flex">
          <span className="text-neutral-500">XCODE:</span>
          <span className="text-neutral-200 uppercase font-semibold">
            {videoConfig.codec} {videoConfig.profile}
          </span>
          <span className="text-neutral-400">
            {videoConfig.resolution} @ {videoConfig.fps}fps
          </span>
        </div>

        <span className="text-neutral-700 hidden md:inline">|</span>

        {/* Egress Pipelines Status */}
        <div className="flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
              httpsSslConfig.enabled
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                : 'bg-neutral-900 text-neutral-600'
            }`}
          >
            <Lock className="w-2.5 h-2.5" />
            HTTPS :{httpsSslConfig.port} {httpsSslConfig.minTlsVersion}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              hlsEgress.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-neutral-900 text-neutral-600'
            }`}
          >
            HLS {hlsEgress.chunkDurationSec}s
          </span>

          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              srtEgress.enabled ? 'bg-purple-950 text-purple-400 border border-purple-800/50' : 'bg-neutral-900 text-neutral-600'
            }`}
          >
            SRT OUT :{srtEgress.port}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              rtmpEgress.enabled ? 'bg-pink-950 text-pink-400 border border-pink-800/50' : 'bg-neutral-900 text-neutral-600'
            }`}
          >
            RTMP
          </span>
        </div>
      </div>

      {/* Right side: Graphics & Ad break & Downlinks */}
      <div className="flex items-center gap-4 text-[11px]">
        {/* L-Band State */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span className="text-neutral-500">L-BAND:</span>
          <span
            className={`font-bold ${
              lbandConfig.active ? 'text-cyan-400 animate-pulse' : 'text-neutral-500'
            }`}
          >
            {lbandConfig.active ? 'ON-AIR' : 'OFF'}
          </span>
        </div>

        {/* SCTE Ad Break State */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-neutral-500">SCTE-35:</span>
          <span
            className={`font-bold ${
              activeAdBreak?.active ? 'text-amber-400 animate-pulse' : 'text-neutral-400'
            }`}
          >
            {activeAdBreak?.active ? `AD (${activeAdBreak.remainingSec}s)` : 'ARMED'}
          </span>
        </div>

        {/* Connected Viewers */}
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-sky-400" />
          <span className="text-neutral-500">VIEWERS:</span>
          <span className="text-neutral-200 font-bold">{receivers.length}</span>
        </div>

        {/* QoE VMAF quick index */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-neutral-500">VMAF:</span>
          <span className="text-emerald-400 font-bold">{health.vmafScore.toFixed(1)}</span>
        </div>
      </div>
    </footer>
  );
};
