import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Disc,
  Play,
  Square,
  HardDrive,
  Clock,
  Scissors,
  Zap,
  Folder,
  Download,
  Trash2,
  Copy,
  Check,
  Cloud,
  Layers,
  FileVideo,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Server,
  Database,
} from 'lucide-react';
import { StorageTargetType, RecordingContainer } from '../types/stream';

export const StreamRecorderPanel: React.FC = () => {
  const {
    inputSource,
    videoConfig,
    recorderConfig,
    updateRecorderConfig,
    recordedSegments,
    startRecording,
    stopRecording,
    deleteRecording,
    triggerScteCue,
    activeAdBreak,
  } = useStream();

  const [activeTab, setActiveTab] = useState<'recordings' | 'storage_config' | 'scte_settings'>('recordings');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSegment = recordedSegments.find((s) => s.status === 'recording');
  const completedSegments = recordedSegments.filter((s) => s.status !== 'recording');

  const copyPath = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadSegment = (seg: (typeof recordedSegments)[0]) => {
    // Generate dummy downloadable file representing the captured video stream segment
    const dummyContent = `MPEG-TS DUMMY BROADCAST RECORDING CONTAINER
Segment ID: ${seg.id}
File Name: ${seg.filename}
Ingest Source: ${inputSource.toUpperCase()}
Resolution: ${seg.resolution}
Bitrate: ${seg.bitrateKbps} kbps
Duration: ${seg.durationSec}s
Trigger: ${seg.triggerType}
SCTE-35 Event: ${seg.scteEventId ? `#${seg.scteEventId} (${seg.scteDescriptor})` : 'None'}
Timestamp: ${seg.startTime}
Verification Hash: SHA256-${btoa(seg.id + seg.filename).substring(0, 16)}`;

    const blob = new Blob([dummyContent], { type: 'video/mp2t' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = seg.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Disk capacity statistics
  const diskUsedPercent = Math.round((recorderConfig.diskCapacityUsedGb / recorderConfig.diskCapacityTotalGb) * 100);
  const diskFreeGb = recorderConfig.diskCapacityTotalGb - recorderConfig.diskCapacityUsedGb;
  const gbPerHour = (videoConfig.targetBitrateKbps * 3600) / (8 * 1024 * 1024);
  const hoursRemaining = Math.floor(diskFreeGb / (gbPerHour || 2.7));

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header & Recording Tally Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg border transition ${
              recorderConfig.isRecording
                ? 'bg-rose-950/80 border-rose-600 text-rose-400 shadow-lg shadow-rose-950/50 animate-pulse'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                MCR Ingest Stream Recorder & SCTE-35 Segmenter
              </h3>
              {recorderConfig.isRecording ? (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>ON-AIR RECORDING • {activeSegment ? `${activeSegment.durationSec}s` : 'ACTIVE'}</span>
                </span>
              ) : (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                  RECORDER IDLE
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Continuous master recording to high-speed NVMe/Cloud storage with automatic SCTE-35 break boundary segmentation.
            </p>
          </div>
        </div>

        {/* Master Recording Trigger Buttons */}
        <div className="flex items-center gap-2">
          {recorderConfig.isRecording ? (
            <button
              onClick={stopRecording}
              className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>STOP RECORDING</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
            >
              <Disc className="w-4 h-4" />
              <span>START RECORDING</span>
            </button>
          )}

          {/* Test SCTE Splice Trigger */}
          <button
            onClick={() => triggerScteCue('splice_insert', 'provider_ad_start', 30)}
            className="px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold flex items-center gap-1.5 transition shadow"
            title="Trigger a 30s SCTE-35 break to test automatic file segmentation"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>TEST SCTE SPLIT (30s)</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Card Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Source Ingest */}
        <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800">
          <span className="text-neutral-500 text-[10px] block">CAPTURING INGEST SOURCE</span>
          <span className="text-sky-300 font-bold block mt-1">
            {inputSource === 'sdi' ? '12G-SDI Baseband' : 'IP SRT Contribution'}
          </span>
          <span className="text-[10px] text-neutral-400">
            {videoConfig.resolution} @ {videoConfig.fps}fps ({videoConfig.targetBitrateKbps} kbps)
          </span>
        </div>

        {/* Storage Target */}
        <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800">
          <span className="text-neutral-500 text-[10px] block">STORAGE DESTINATION</span>
          <span className="text-emerald-400 font-bold block mt-1 uppercase">
            {recorderConfig.storageTarget.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-neutral-400 truncate block">
            {recorderConfig.storagePath}
          </span>
        </div>

        {/* SCTE-35 Auto-Segmentation */}
        <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800">
          <span className="text-neutral-500 text-[10px] block">SCTE-35 AUTO-SPLIT</span>
          <span className="text-amber-400 font-bold block mt-1 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" />
            {recorderConfig.autoScteSegmentation ? 'ENABLED (FRAME ACCURATE)' : 'DISABLED'}
          </span>
          <span className="text-[10px] text-neutral-400">
            {activeAdBreak?.active ? `AD BREAK IN PROGRESS (${activeAdBreak.remainingSec}s)` : 'Awaiting Splice Point'}
          </span>
        </div>

        {/* Storage Remaining */}
        <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-neutral-500">STORAGE REMAINING</span>
            <span className="text-neutral-300 font-bold">{diskUsedPercent}% USED</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full ${diskUsedPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${diskUsedPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            {diskFreeGb} GB free (~{hoursRemaining} hours buffer)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('recordings')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'recordings'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <FileVideo className="w-3.5 h-3.5" />
          <span>CAPTURED SEGMENTS ({recordedSegments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storage_config')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'storage_config'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>STORAGE TARGETS & RING BUFFER</span>
        </button>

        <button
          onClick={() => setActiveTab('scte_settings')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'scte_settings'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>SCTE-35 SEGMENTATION RULES</span>
        </button>
      </div>

      {/* TAB 1: CAPTURED SEGMENTS TABLE */}
      {activeTab === 'recordings' && (
        <div className="space-y-3">
          {/* Active Recording Banner */}
          {activeSegment && (
            <div className="bg-rose-950/30 border border-rose-600/60 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <span className="text-rose-400 font-bold block text-xs">
                    ACTIVE RECORDING FILE: {activeSegment.filename}
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    Started at {activeSegment.startTime} • Duration: {activeSegment.durationSec}s • Size: {(activeSegment.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                  {activeSegment.triggerType.toUpperCase()}
                </span>
                <button
                  onClick={stopRecording}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                >
                  Finalize Segment
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded border border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">FILENAME / CONTAINER</th>
                  <th className="py-2 px-3">TRIGGER REASON</th>
                  <th className="py-2 px-3">DURATION</th>
                  <th className="py-2 px-3">FILE SIZE</th>
                  <th className="py-2 px-3">DESTINATION</th>
                  <th className="py-2 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950">
                {recordedSegments.map((seg) => (
                  <tr key={seg.id} className="hover:bg-neutral-900/50 transition">
                    <td className="py-2.5 px-3">
                      {seg.status === 'recording' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] animate-pulse">
                          RECORDING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 font-bold text-[10px]">
                          SAVED
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <FileVideo className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-bold text-white">{seg.filename}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block">
                        Start: {seg.startTime} {seg.endTime ? `• End: ${seg.endTime}` : ''}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          seg.triggerType.startsWith('scte35')
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {seg.scteEventId
                          ? `SCTE-35 #${seg.scteEventId} (${seg.scteDescriptor})`
                          : seg.triggerType.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-neutral-200 font-bold">
                      {Math.floor(seg.durationSec / 60)}m {seg.durationSec % 60}s
                    </td>

                    <td className="py-2.5 px-3 text-neutral-300">
                      {(seg.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </td>

                    <td className="py-2.5 px-3 text-neutral-400 text-[10px]">
                      <span className="uppercase text-neutral-300 font-bold block">
                        {seg.storageTarget.replace('_', ' ')}
                      </span>
                      <span className="truncate max-w-xs block">{seg.storagePath}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => downloadSegment(seg)}
                          className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-sky-400 hover:text-sky-300 transition"
                          title="Download recorded file segment"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => copyPath(seg.storagePath, seg.id)}
                          className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          title="Copy file storage URI"
                        >
                          {copiedId === seg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {seg.status !== 'recording' && (
                          <button
                            onClick={() => deleteRecording(seg.id)}
                            className="p-1.5 rounded bg-neutral-900 hover:bg-rose-950 text-neutral-500 hover:text-rose-400 transition"
                            title="Delete segment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STORAGE TARGETS & RING BUFFER */}
      {activeTab === 'storage_config' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                STORAGE TARGET CONFIGURATION
              </span>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">TARGET STORAGE BACKEND</label>
                <select
                  value={recorderConfig.storageTarget}
                  onChange={(e) => updateRecorderConfig({ storageTarget: e.target.value as StorageTargetType })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                >
                  <option value="local_nvme">Local High-Performance NVMe (/var/media/broadcast_recordings/)</option>
                  <option value="ring_buffer">In-Memory / SSD Circular Ring Buffer</option>
                  <option value="aws_s3">Cloud Object Store: AWS S3 Bucket</option>
                  <option value="gcp_storage">Cloud Object Store: Google Cloud Storage</option>
                  <option value="nas_nfs">Network Attached Storage (NAS / NFS / SMB)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">STORAGE PATH / S3 BUCKET URI</label>
                <input
                  type="text"
                  value={recorderConfig.storagePath}
                  onChange={(e) => updateRecorderConfig({ storagePath: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">CONTAINER FORMAT</label>
                  <select
                    value={recorderConfig.container}
                    onChange={(e) => updateRecorderConfig({ container: e.target.value as RecordingContainer })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value="ts">MPEG-TS (.ts) - Broadcast Master</option>
                    <option value="mp4">MPEG-4 (.mp4) - Fast Streaming</option>
                    <option value="mkv">Matroska (.mkv) - Crash Resilient</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">RETENTION PERIOD</label>
                  <select
                    value={recorderConfig.retentionDays}
                    onChange={(e) => updateRecorderConfig({ retentionDays: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value={7}>7 Days Rolling Retention</option>
                    <option value={14}>14 Days Rolling Retention</option>
                    <option value={30}>30 Days Rolling Retention</option>
                    <option value={90}>90 Days Archive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Circular Buffer Settings */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                CIRCULAR RING BUFFER & REWIND TIME-SHIFT
              </span>

              <p className="text-[11px] text-neutral-400">
                Maintains a continuous in-memory and NVMe circular buffer allowing instant clip exports of live broadcast moments.
              </p>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  RING BUFFER CAPACITY: {recorderConfig.ringBufferDurationMinutes} MINUTES
                </label>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={recorderConfig.ringBufferDurationMinutes}
                  onChange={(e) => updateRecorderConfig({ ringBufferDurationMinutes: Number(e.target.value) })}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>15 min</span>
                  <span>60 min (Standard)</span>
                  <span>180 min (3 hr)</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ring Buffer RAM Footprint:</span>
                  <span className="text-sky-300 font-bold">~2.7 GB in Cache</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Time-Shift Rewind Availability:</span>
                  <span className="text-emerald-400 font-bold">Instant Clip Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCTE-35 SEGMENTATION RULES */}
      {activeTab === 'scte_settings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                AUTOMATIC SCTE-35 SPLIT ENGINE
              </span>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">AUTO-SPLIT ON SCTE-35 BREAKS</label>
                <button
                  type="button"
                  onClick={() => updateRecorderConfig({ autoScteSegmentation: !recorderConfig.autoScteSegmentation })}
                  className={`w-full py-2 rounded font-bold transition text-center ${
                    recorderConfig.autoScteSegmentation
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {recorderConfig.autoScteSegmentation
                    ? 'AUTOMATIC SCTE-35 SEGMENTATION ACTIVE'
                    : 'AUTOMATIC SEGMENTATION DISABLED'}
                </button>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">SEPARATE PROGRAM FROM AD PODS</label>
                <button
                  type="button"
                  onClick={() => updateRecorderConfig({ excludeAdBreaksFromMaster: !recorderConfig.excludeAdBreaksFromMaster })}
                  className={`w-full py-2 rounded font-bold transition text-center ${
                    recorderConfig.excludeAdBreaksFromMaster
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {recorderConfig.excludeAdBreaksFromMaster
                    ? 'AD PODS ROUTED TO DEDICATED FOLDER'
                    : 'ALL BREAKS RECORDED CONTIGUOUSLY'}
                </button>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">CONTINUOUS CHUNK INTERVAL (WITHOUT SCTE)</label>
                <select
                  value={recorderConfig.segmentDurationMinutes}
                  onChange={(e) => updateRecorderConfig({ segmentDurationMinutes: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                >
                  <option value={15}>15 Minutes per file</option>
                  <option value={30}>30 Minutes per file (Standard)</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                  <option value={120}>120 Minutes (2 Hours)</option>
                </select>
              </div>
            </div>

            {/* SCTE-35 Split Simulation & Diagnostics */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                SPLICE BOUNDARY VERIFICATION
              </span>

              <p className="text-[11px] text-neutral-400">
                When a SCTE-35 splice point arrives (MPEG-TS PID 0x01E0 or SDI Line 9 VANC), the recording pipeline immediately finalizes the current file on the exact PTS timecode and opens a new segment tagged with the ANSI/SCTE 35 Event ID.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => triggerScteCue('splice_insert', 'provider_ad_start', 30)}
                  className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>SIMULATE SCTE-35 PROVIDER AD START (30s)</span>
                </button>

                <button
                  onClick={() => triggerScteCue('time_signal', 'program_break', 60)}
                  className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>SIMULATE SCTE-35 PROGRAM BREAK (60s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
