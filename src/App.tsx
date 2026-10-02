/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StreamProvider, useStream } from './context/StreamContext';
import { HeaderNav } from './components/HeaderNav';
import { MCRStatusBar } from './components/MCRStatusBar';
import { MCRConfidenceMonitor } from './components/MCRConfidenceMonitor';
import { BandwidthGraph } from './components/BandwidthGraph';
import { QoEAnalysisPanel } from './components/QoEAnalysisPanel';
import { ConnectedReceiversTable } from './components/ConnectedReceiversTable';
import { ScteAdInsertionPanel } from './components/ScteAdInsertionPanel';
import { LBandGraphicsPanel } from './components/LBandGraphicsPanel';
import { TranscoderConfigPanel } from './components/TranscoderConfigPanel';
import { SdiRoutingPanel } from './components/SdiRoutingPanel';
import { SrtFailoverManager } from './components/SrtFailoverManager';
import { StreamRecorderPanel } from './components/StreamRecorderPanel';
import { EbuR128LoudnessMeter } from './components/EbuR128LoudnessMeter';
import { HlsProfileBuilder } from './components/HlsProfileBuilder';
import { SslCertificateManager } from './components/SslCertificateManager';
import { SmtpAlertManager } from './components/SmtpAlertManager';
import { EventLogPanel } from './components/EventLogPanel';
import {
  Activity,
  Layers,
  Zap,
  Radio,
  Sliders,
  Users,
  ShieldCheck,
  Server,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const MCRMasterView: React.FC = () => {
  const {
    isStreaming,
    srtIngest,
    videoConfig,
    health,
    receivers,
    lbandConfig,
    triggerLBand,
    triggerAstronBand,
    activeAdBreak,
    triggerScteCue,
    hlsEgress,
    srtEgress,
    rtmpEgress,
  } = useStream();

  return (
    <div className="space-y-4">
      {/* Top Grid: Video Confidence Monitor (Left/Center) + High-Density Telemetry Rack (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Confidence Monitor (8 cols on large screens) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <MCRConfidenceMonitor />
        </div>

        {/* MCR Live Quick Telemetry & Action Rack (4 cols on large screens) */}
        <div className="lg:col-span-4 flex flex-col gap-3 font-mono text-xs">
          {/* Ingest & Health Snapshot Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                SRT INGEST LINK
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-bold uppercase">
                {srtIngest.mode} : {srtIngest.port}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                <span className="text-neutral-500 block text-[10px]">INGEST BITRATE</span>
                <span className="text-sky-400 font-bold text-sm">
                  {(health.ingestBitrateKbps / 1000).toFixed(2)} Mbps
                </span>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                <span className="text-neutral-500 block text-[10px]">RECOVERY RTT</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {health.rttMs.toFixed(1)} ms
                </span>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                <span className="text-neutral-500 block text-[10px]">PACKET LOSS</span>
                <span className="text-neutral-200 font-bold text-sm">
                  {health.packetLossPercent.toFixed(2)}%
                </span>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                <span className="text-neutral-500 block text-[10px]">SRT BUFFER</span>
                <span className="text-amber-400 font-bold text-sm">
                  {srtIngest.latencyMs} ms
                </span>
              </div>
            </div>

            {/* Ingest Stream ID & Key Info */}
            <div className="text-[10px] bg-neutral-900/40 p-2 rounded border border-neutral-800/50 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">StreamID:</span>
                <span className="text-neutral-300 truncate max-w-[170px]">{srtIngest.streamId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Encryption:</span>
                <span className="text-neutral-300">
                  {srtIngest.pbKeyLen > 0 ? `AES-${srtIngest.pbKeyLen * 8}-bit` : 'Cleartext'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Production Controls Rack (L-Band, SCTE, Transcoder) */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 shadow-xl flex flex-col gap-3">
            <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5 text-xs">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              MASTER CONTROL DISPATCH
            </span>

            {/* L-Band Quick Toggle */}
            <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-cyan-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  L-Band Graphic Squeeze
                </div>
                <div className="text-[10px] text-neutral-400">
                  {lbandConfig.active ? 'Squeezed to 75% • Astron Active' : 'Off-air • Full 16:9'}
                </div>
              </div>
              <button
                onClick={() => triggerLBand()}
                className={`px-3 py-1 rounded font-bold text-[11px] transition ${
                  lbandConfig.active
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-neutral-800 text-cyan-400 hover:bg-neutral-700'
                }`}
              >
                {lbandConfig.active ? 'UNSQUEEZE' : 'SQUEEZE'}
              </button>
            </div>

            {/* SCTE-35 Quick Ad Break Trigger */}
            <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  SCTE-35 DAI Cue Avail
                </div>
                <div className="text-[10px] text-neutral-400">
                  {activeAdBreak?.active
                    ? `Ad Avail: ${activeAdBreak.remainingSec}s remaining`
                    : 'Armed • 30s Splice Insert'}
                </div>
              </div>
              <button
                onClick={() => triggerScteCue('splice_insert', 'provider_ad_start', 30)}
                disabled={Boolean(activeAdBreak?.active)}
                className={`px-3 py-1 rounded font-bold text-[11px] transition ${
                  activeAdBreak?.active
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-500 text-black shadow'
                }`}
              >
                {activeAdBreak?.active ? 'ON-AIR' : 'FIRE 30S'}
              </button>
            </div>

            {/* Active Egress Streams Summary */}
            <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800/60 space-y-1.5 text-[11px]">
              <span className="text-neutral-400 block text-[10px]">EGRESS DISTRIBUTION MATRIX</span>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400">1. HLS Chunked (LL-HLS)</span>
                <span className="text-neutral-300">{(health.hlsBitrateKbps / 1000).toFixed(1)} Mbps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400">2. SRT Out Downlinks</span>
                <span className="text-neutral-300">{(health.srtOutBitrateKbps / 1000).toFixed(1)} Mbps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-pink-400">3. RTMP Syndication</span>
                <span className="text-neutral-300">{(health.rtmpBitrateKbps / 1000).toFixed(1)} Mbps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dual Ingest vs Egress Bandwidth Oscilloscope */}
      <BandwidthGraph />

      {/* QoE Analysis Snapshot Bar */}
      <QoEAnalysisPanel />

      {/* Connected Receivers Table */}
      <ConnectedReceiversTable />
    </div>
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('mcr');

  return (
    <StreamProvider>
      <div className="min-h-screen bg-[#070a10] text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black">
        {/* Navigation & Master Telemetry Strip */}
        <HeaderNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Tab View Container */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5">
          {currentTab === 'mcr' && <MCRMasterView />}
          {currentTab === 'sdi_matrix' && <SdiRoutingPanel />}
          {currentTab === 'failover' && <SrtFailoverManager />}
          {currentTab === 'recorder' && <StreamRecorderPanel />}
          {currentTab === 'loudness' && <EbuR128LoudnessMeter />}
          {currentTab === 'config' && <TranscoderConfigPanel />}
          {currentTab === 'hls_profiles' && <HlsProfileBuilder />}
          {currentTab === 'ssl' && <SslCertificateManager />}
          {currentTab === 'smtp' && <SmtpAlertManager />}
          {currentTab === 'receivers' && <ConnectedReceiversTable />}
          {currentTab === 'scte' && <ScteAdInsertionPanel />}
          {currentTab === 'lband' && <LBandGraphicsPanel />}
          {currentTab === 'qoe' && <QoEAnalysisPanel />}
          {currentTab === 'logs' && <EventLogPanel />}
        </main>

        {/* Persistent Master Status Bar */}
        <MCRStatusBar />
      </div>
    </StreamProvider>
  );
}
