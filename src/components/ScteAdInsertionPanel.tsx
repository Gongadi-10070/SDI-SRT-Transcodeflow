import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Zap,
  Play,
  CheckCircle,
  Radio,
  Clock,
  Code,
  AlertCircle,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Columns,
  ListFilter,
  Eye,
  Layers,
  Sparkles,
  Search,
  FileCode,
  Binary,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Scte35Cue } from '../types/stream';
import {
  generate41ByteScte35Cue,
  Scte35_41ByteResult,
  Scte35SegmentationKey,
  SCTE35_SEGMENTATION_TYPES,
} from '../utils/scte35Generator';

export const ScteAdInsertionPanel: React.FC = () => {
  const {
    scteConfig,
    updateScteConfig,
    inputScteCues,
    outputScteCues,
    triggerScteCue,
    simulateIncomingIngestScteCue,
    clearInputScteLogs,
    clearOutputScteLogs,
    activeAdBreak,
    srtIngest,
  } = useStream();

  const [activeLogTab, setActiveLogTab] = useState<'input_srt_logs' | 'output_manual_logs' | 'side_by_side'>('input_srt_logs');
  const [commandType, setCommandType] = useState<'splice_insert' | 'time_signal'>('time_signal');
  const [segType, setSegType] = useState<
    'provider_ad_start' | 'provider_ad_end' | 'program_break' | 'network_break'
  >('provider_ad_start');
  const [duration, setDuration] = useState<number>(30);
  const [preroll, setPreroll] = useState<number>(4000);
  const [copiedHexId, setCopiedHexId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCueDetail, setSelectedCueDetail] = useState<Scte35Cue | null>(null);

  // Dedicated 41-Byte SCTE-35 Generator State
  const [cue41EventId, setCue41EventId] = useState<number>(1001);
  const [cue41Duration, setCue41Duration] = useState<number>(30);
  const [cue41Command, setCue41Command] = useState<'time_signal' | 'splice_insert'>('time_signal');
  const [cue41SegType, setCue41SegType] = useState<Scte35SegmentationKey>('provider_ad_start');
  const [show41ByteBreakdown, setShow41ByteBreakdown] = useState<boolean>(true);

  const active41Result = generate41ByteScte35Cue({
    eventId: cue41EventId,
    durationSec: cue41Duration,
    commandType: cue41Command,
    segmentationType: cue41SegType,
  });

  const handleTriggerManual41 = () => {
    triggerScteCue(cue41Command, cue41SegType as any, cue41Duration);
  };

  const handleSimulateIncoming41 = () => {
    simulateIncomingIngestScteCue(cue41SegType as any, cue41Duration);
  };

  const handleTriggerManual = () => {
    triggerScteCue(commandType, segType, duration);
  };

  const handleSimulateIncoming = () => {
    simulateIncomingIngestScteCue(segType, duration);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHexId(id);
    setTimeout(() => setCopiedHexId(null), 2000);
  };

  const exportCuesCsv = (cues: Scte35Cue[], filename: string) => {
    const headers = ['ID', 'Source', 'Timestamp', 'PTS Timecode', 'Event ID', 'Command Type', 'Segmentation Type', 'Duration(s)', 'Status', 'Payload'];
    const rows = cues.map((c) => [
      c.id,
      c.source,
      c.timestamp,
      c.ptsTimecode || 'N/A',
      c.eventId,
      c.commandType,
      c.segmentationType,
      c.durationSec,
      c.status,
      `"${c.hexPayload}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterCues = (cues: Scte35Cue[]) => {
    if (!searchTerm) return cues;
    return cues.filter(
      (c) =>
        c.eventId.toString().includes(searchTerm) ||
        c.segmentationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.commandType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.hexPayload.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredInputCues = filterCues(inputScteCues);
  const filteredOutputCues = filterCues(outputScteCues);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-950 border border-amber-800/60 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                SCTE-35 Stream Demux & Egress Cue Generator
              </h3>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                  scteConfig.passthroughEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {scteConfig.passthroughEnabled ? 'PASSTHROUGH ACTIVE' : 'PASSTHROUGH MUTED'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Decodes incoming SRT Ingest SCTE-35 cues separately and records manual output cues sent to HLS / SRT / RTMP.
            </p>
          </div>
        </div>

        {/* Global Passthrough Mode Switch */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-neutral-400 text-[11px]">RELAY MODE:</span>
          <select
            value={scteConfig.mode}
            onChange={(e) => updateScteConfig({ mode: e.target.value as any })}
            className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="passthrough">Transparent Ingest Passthrough & Injection</option>
            <option value="local_insert">Operator Manual Injection Only</option>
            <option value="strip">Strip / Filter Ingest SCTE PIDs</option>
          </select>
        </div>
      </div>

      {/* Active Ad Break Banner */}
      {activeAdBreak && activeAdBreak.active && (
        <div className="bg-amber-950/80 border border-amber-700 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div>
              <div className="font-bold text-amber-300 text-xs">
                ON-AIR SCTE-35 SPLICE AD BREAK RUNNING
              </div>
              <div className="text-[11px] text-amber-400/80 mt-0.5">
                Downstream ad insertion servers (SSAI/DAI) receiving `#EXT-X-DATERANGE` / SCTE splice tags.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-xs">REMAINING:</span>
            <span className="text-2xl font-bold text-amber-300">{activeAdBreak.remainingSec}s</span>
            <span className="text-xs text-neutral-500">/ {activeAdBreak.totalSec}s</span>
          </div>
        </div>
      )}

      {/* 41-BYTE SCTE-35 CUE GENERATOR & STRUCTURAL INSPECTOR */}
      <div className="bg-neutral-900/80 border border-amber-500/40 rounded-lg p-4 shadow-2xl flex flex-col gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-neutral-100 uppercase tracking-wide">
                  41-Byte SCTE-35 Cue Generator & Bit-Level Inspector
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  EXACT 41 BYTES (328 BITS)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  CRC-32: 0x{active41Result.crc32Hex}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Standard broadcast Digital Program Insertion cue table (table_id 0xFC, section_length 38). ANSI/SCTE 35 compliant.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(active41Result.hex, '41-hex')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1 transition text-[11px]"
              title="Copy 82-character Hexadecimal string"
            >
              {copiedHexId === '41-hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedHexId === '41-hex' ? 'COPIED 82 HEX!' : 'COPY 41-BYTE HEX (82 Chars)'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(active41Result.base64, '41-b64')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1 transition text-[11px]"
              title="Copy 56-character Base64 string"
            >
              {copiedHexId === '41-b64' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
              <span>{copiedHexId === '41-b64' ? 'COPIED BASE64!' : 'COPY BASE64 (56 Chars)'}</span>
            </button>
          </div>
        </div>

        {/* 41-Byte Parameters Configurator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">EVENT ID</label>
            <input
              type="number"
              value={cue41EventId}
              onChange={(e) => setCue41EventId(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 font-bold focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">COMMAND TYPE</label>
            <select
              value={cue41Command}
              onChange={(e) => setCue41Command(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 uppercase focus:border-amber-500"
            >
              <option value="time_signal">time_signal (0x06) - Recommended</option>
              <option value="splice_insert">splice_insert (0x05)</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">SEGMENTATION TYPE</label>
            <select
              value={cue41SegType}
              onChange={(e) => setCue41SegType(e.target.value as Scte35SegmentationKey)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 focus:border-amber-500"
            >
              <option value="provider_ad_start">Provider Ad Start (0x34)</option>
              <option value="provider_ad_end">Provider Ad End (0x35)</option>
              <option value="program_break">Program Break / Chapter (0x22)</option>
              <option value="program_resume">Program Resume (0x23)</option>
              <option value="network_break">Network Placement Opportunity (0x30)</option>
              <option value="distributor_ad_start">Distributor Ad Opportunity (0x36)</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">DURATION (SECONDS)</label>
            <input
              type="number"
              value={cue41Duration}
              onChange={(e) => setCue41Duration(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 font-bold focus:border-amber-500"
            />
          </div>
        </div>

        {/* Live 41-Byte Encoded Hex & Base64 Payload Display */}
        <div className="bg-neutral-950 rounded border border-neutral-800 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-[11px] font-bold flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-amber-400" />
              HEXADECIMAL ENCODING (82 CHARACTERS / 41 BYTES):
            </span>
            <span className="text-[10px] text-neutral-500">
              Byte Offsets 0x00 to 0x28 • MPEG-2 CRC-32 Verified
            </span>
          </div>

          <div className="font-mono text-xs text-amber-300 bg-black/60 p-2.5 rounded border border-neutral-800 break-all select-all tracking-wider font-semibold">
            {active41Result.hex}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-neutral-400 text-[11px] font-bold flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              BASE64 STRING (56 CHARACTERS):
            </span>
            <span className="text-[10px] text-neutral-500">
              Used in HLS #EXT-X-DATERANGE:SCTE35-CMD
            </span>
          </div>

          <div className="font-mono text-xs text-sky-300 bg-black/60 p-2 rounded border border-neutral-800 break-all select-all font-semibold">
            {active41Result.base64}
          </div>
        </div>

        {/* Injection Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerManual41}
              className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center gap-1.5 transition shadow"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>INJECT 41-BYTE CUE INTO EGRESS (HLS / SRT / RTMP)</span>
            </button>

            <button
              onClick={handleSimulateIncoming41}
              className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1.5 transition border border-neutral-700"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>SIMULATE 41-BYTE CUE ON SRT INGEST</span>
            </button>
          </div>

          <button
            onClick={() => setShow41ByteBreakdown(!show41ByteBreakdown)}
            className="px-2.5 py-1.5 rounded bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold flex items-center gap-1 text-[11px]"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>{show41ByteBreakdown ? 'HIDE 41-BYTE BREAKDOWN' : 'INSPECT 41 BYTES BIT-LEVEL SPEC'}</span>
            {show41ByteBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* 41-Byte Breakdown Table */}
        {show41ByteBreakdown && (
          <div className="overflow-x-auto rounded border border-neutral-800 mt-1">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-1.5 px-2.5">OFFSET</th>
                  <th className="py-1.5 px-2.5">BYTES</th>
                  <th className="py-1.5 px-2.5">HEX</th>
                  <th className="py-1.5 px-2.5">FIELD NAME</th>
                  <th className="py-1.5 px-2.5">DECODED VALUE</th>
                  <th className="py-1.5 px-2.5">SPECIFICATION DESCRIPTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 bg-neutral-950/60">
                {active41Result.breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/40">
                    <td className="py-1.5 px-2.5 text-neutral-400 font-bold">0x{row.offset.toString(16).padStart(2, '0').toUpperCase()}</td>
                    <td className="py-1.5 px-2.5 text-neutral-500">{row.byteCount} B</td>
                    <td className="py-1.5 px-2.5 font-bold text-amber-300">{row.hex}</td>
                    <td className="py-1.5 px-2.5 text-neutral-200 font-semibold">{row.name}</td>
                    <td className="py-1.5 px-2.5 text-sky-300 font-bold">{row.value}</td>
                    <td className="py-1.5 px-2.5 text-neutral-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trigger & Ingest Simulator Action Rack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Manual Output Trigger Box */}
        <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-lg p-3.5 flex flex-col gap-3 font-mono text-xs">
          <div className="font-bold text-neutral-200 text-xs flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
              TRIGGER MANUAL SCTE-35 FOR OUTPUT EGRESS
            </span>
            <span className="text-[10px] text-neutral-400">
              DESTINATIONS: HLS / SRT OUT / RTMP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Command Type */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">COMMAND TYPE</label>
              <select
                value={commandType}
                onChange={(e) => setCommandType(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-amber-500"
              >
                <option value="splice_insert">splice_insert() [0x05] (Direct Ad Break)</option>
                <option value="time_signal">time_signal() [0x06] (Segmentation Descriptor)</option>
              </select>
            </div>

            {/* Segmentation Type */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">SEGMENTATION TYPE</label>
              <select
                value={segType}
                onChange={(e) => setSegType(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-amber-500"
              >
                <option value="provider_ad_start">Provider Ad Start (0x30)</option>
                <option value="provider_ad_end">Provider Ad End (0x31)</option>
                <option value="program_break">Program Break (0x22)</option>
                <option value="network_break">Network Break (0x20)</option>
              </select>
            </div>
          </div>

          {/* Duration & Preroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                SPLICE BREAK DURATION ({duration}s)
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 30, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDuration(sec)}
                    className={`flex-1 py-1 rounded text-center text-xs transition ${
                      duration === sec
                        ? 'bg-amber-600 text-black font-bold'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                PREROLL ANTICIPATION ({preroll} ms)
              </label>
              <input
                type="range"
                min="1000"
                max="8000"
                step="500"
                value={preroll}
                onChange={(e) => setPreroll(Number(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-500 mt-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <button
              onClick={handleTriggerManual}
              disabled={Boolean(activeAdBreak?.active)}
              className={`py-2 px-3 rounded font-bold flex items-center justify-center gap-2 transition ${
                activeAdBreak?.active
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-[0.99]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>DISPATCH MANUAL SCTE TO OUTPUT ({duration}s)</span>
            </button>

            <button
              onClick={handleSimulateIncoming}
              className="py-2 px-3 rounded font-bold flex items-center justify-center gap-2 transition bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 shadow"
              title="Simulates incoming SCTE packet detected on SRT Ingest socket"
            >
              <ArrowDownLeft className="w-4 h-4 text-sky-400 stroke-[3]" />
              <span>SIMULATE INCOMING SRT INGEST CUE</span>
            </button>
          </div>
        </div>

        {/* Architecture & PID Mapping Summary */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between font-mono text-xs">
          <div className="space-y-2.5">
            <div className="font-bold text-neutral-300 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              SCTE DEMUX PIPELINE
            </div>
            <div className="space-y-2 text-[11px] text-neutral-400">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-500">SRT Ingest Socket:</span>
                <span className="text-sky-300 font-bold">{srtIngest.host}:{srtIngest.port}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-500">MPEG-TS Ingest PID:</span>
                <span className="text-neutral-200">0x01E0 (PID 480 / SCTE-35)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-500">Output HLS Manifest:</span>
                <span className="text-emerald-400 font-bold">#EXT-X-DATERANGE</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-500">Separation Storage:</span>
                <span className="text-amber-400 font-bold">INDEPENDENT LOG TABLES</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
            Ingest cues from SRT and manual operator triggers are stored in isolated databases for complete broadcast audit.
          </div>
        </div>
      </div>

      {/* SEPARATE SCTE LOGS SECTION */}
      <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800">
        {/* Navigation & Controls for Separate Logs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Selector */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveLogTab('input_srt_logs')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition text-xs font-bold ${
                activeLogTab === 'input_srt_logs'
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>CHANNEL A: INPUT SRT INGEST LOGS ({inputScteCues.length})</span>
            </button>

            <button
              onClick={() => setActiveLogTab('output_manual_logs')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition text-xs font-bold ${
                activeLogTab === 'output_manual_logs'
                  ? 'bg-amber-600 text-black shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              <span>CHANNEL B: MANUAL OUTPUT LOGS ({outputScteCues.length})</span>
            </button>

            <button
              onClick={() => setActiveLogTab('side_by_side')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition text-xs font-bold hidden md:flex ${
                activeLogTab === 'side_by_side'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>SIDE-BY-SIDE MATRIX</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search Event ID, descriptor, hex..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none text-xs w-48"
            />
          </div>
        </div>

        {/* VIEW 1: CHANNEL A - INPUT SRT INGEST SCTE LOGS */}
        {activeLogTab === 'input_srt_logs' && (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="font-bold text-sky-300">
                  INPUT SRT STREAM SCTE-35 INGEST LOGS (DECODED FROM MPEG-TS PID 0x01E0)
                </span>
                <span className="text-[10px] text-neutral-500">SAVED SEPARATELY</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCuesCsv(inputScteCues, 'srt_input_ingest_scte_log')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px]"
                >
                  <Download className="w-3 h-3 text-sky-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={clearInputScteLogs}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Input Logs</span>
                </button>
              </div>
            </div>

            {filteredInputCues.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No SCTE-35 cues recorded on SRT Ingest stream yet. Click &quot;Simulate Incoming SRT Ingest Cue&quot; to test.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredInputCues.map((cue) => (
                  <div
                    key={cue.id}
                    onClick={() => setSelectedCueDetail(cue)}
                    className="bg-neutral-950/80 border border-sky-900/50 hover:border-sky-500 rounded p-2.5 flex flex-col gap-1.5 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                          INGEST EVENT #{cue.eventId}
                        </span>
                        <span className="text-neutral-400 uppercase font-semibold">{cue.commandType}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-200">{cue.segmentationType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
                        <span>PTS: {cue.ptsTimecode}</span>
                        <span>{cue.timestamp}</span>
                        {cue.hexPayload.length === 82 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            41 BYTES
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                          {cue.durationSec}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-400 bg-neutral-900/80 p-1.5 rounded">
                      <span className="truncate text-sky-300 font-mono">
                        RAW PAYLOAD: {cue.hexPayload}
                      </span>
                      <span className="text-neutral-500 shrink-0">
                        {cue.inputPid} • {cue.originSocket}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CHANNEL B - MANUAL OUTPUT TRIGGER SCTE LOGS */}
        {activeLogTab === 'output_manual_logs' && (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-bold text-amber-300">
                  MANUAL OUTPUT TRIGGER SCTE-35 LOGS (DISPATCHED TO HLS / SRT / RTMP EGRESS)
                </span>
                <span className="text-[10px] text-neutral-500">SAVED SEPARATELY</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCuesCsv(outputScteCues, 'manual_output_egress_scte_log')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px]"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={clearOutputScteLogs}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Output Logs</span>
                </button>
              </div>
            </div>

            {filteredOutputCues.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No manual output SCTE cues triggered yet. Click &quot;DISPATCH MANUAL SCTE TO OUTPUT&quot; to test.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredOutputCues.map((cue) => (
                  <div
                    key={cue.id}
                    onClick={() => setSelectedCueDetail(cue)}
                    className="bg-neutral-950/80 border border-amber-900/50 hover:border-amber-500 rounded p-2.5 flex flex-col gap-1.5 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                          OUTPUT EVENT #{cue.eventId}
                        </span>
                        <span className="text-neutral-400 uppercase font-semibold">{cue.commandType}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-200">{cue.segmentationType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
                        <span>PTS: {cue.ptsTimecode}</span>
                        <span>{cue.timestamp}</span>
                        {cue.hexPayload.length === 82 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            41 BYTES
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-amber-600 text-black font-bold">
                          {cue.durationSec}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-400 bg-neutral-900/80 p-1.5 rounded">
                      <span className="truncate text-amber-300 font-mono">
                        TRANSMITTED PAYLOAD: {cue.hexPayload}
                      </span>
                      <span className="text-neutral-400 shrink-0 font-semibold">
                        EGRESS: HLS / SRT / RTMP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: DUAL SIDE-BY-SIDE MATRIX */}
        {activeLogTab === 'side_by_side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Left */}
            <div className="bg-neutral-900/40 border border-sky-900/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                <span className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  SRT INGEST SCTE LOGS ({inputScteCues.length})
                </span>
                <button
                  onClick={() => exportCuesCsv(inputScteCues, 'srt_ingest_scte')}
                  className="text-[10px] text-sky-400 hover:underline"
                >
                  Export CSV
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredInputCues.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCueDetail(c)}
                    className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[11px] hover:border-sky-500 cursor-pointer space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-sky-300">EVENT #{c.eventId}</span>
                      <span className="text-emerald-400">{c.durationSec}s</span>
                    </div>
                    <div className="text-neutral-400 text-[10px] flex justify-between">
                      <span>{c.segmentationType}</span>
                      <span>{c.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Right */}
            <div className="bg-neutral-900/40 border border-amber-900/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  MANUAL OUTPUT SCTE LOGS ({outputScteCues.length})
                </span>
                <button
                  onClick={() => exportCuesCsv(outputScteCues, 'manual_output_scte')}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  Export CSV
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredOutputCues.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCueDetail(c)}
                    className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[11px] hover:border-amber-500 cursor-pointer space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-300">EVENT #{c.eventId}</span>
                      <span className="text-amber-400">{c.durationSec}s</span>
                    </div>
                    <div className="text-neutral-400 text-[10px] flex justify-between">
                      <span>{c.segmentationType}</span>
                      <span>{c.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCTE-35 Detailed Cue Inspector Modal */}
      {selectedCueDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-neutral-100">
                  {selectedCueDetail.source === 'input_srt_stream'
                    ? 'SRT Ingest SCTE-35 Decoded Cue Detail'
                    : 'Manual Output Injected SCTE-35 Cue Detail'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedCueDetail(null)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Log Channel:</span>
                <span
                  className={`font-bold ${
                    selectedCueDetail.source === 'input_srt_stream' ? 'text-sky-400' : 'text-amber-400'
                  }`}
                >
                  {selectedCueDetail.source === 'input_srt_stream'
                    ? 'CHANNEL A: Input SRT Ingest'
                    : 'CHANNEL B: Manual Output Egress'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Splice Event ID:</span>
                <span className="text-neutral-100 font-bold">#{selectedCueDetail.eventId}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Command Type:</span>
                <span className="text-neutral-200">{selectedCueDetail.commandType}()</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Segmentation Descriptor:</span>
                <span className="text-emerald-400 font-bold">{selectedCueDetail.segmentationType}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Duration:</span>
                <span className="text-neutral-100 font-bold">{selectedCueDetail.durationSec} seconds</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">PTS Timecode:</span>
                <span className="text-neutral-300">{selectedCueDetail.ptsTimecode || 'N/A'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Capture Timestamp:</span>
                <span className="text-neutral-300">{selectedCueDetail.timestamp}</span>
              </div>

              {selectedCueDetail.targetEgress && (
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-500">Target Downstream Feeds:</span>
                  <span className="text-amber-300">{selectedCueDetail.targetEgress.join(', ')}</span>
                </div>
              )}

              <div>
                <span className="text-neutral-500 block mb-1">Base64 / Hex SCTE-35 Payload:</span>
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800 text-sky-300 text-[10px] break-all">
                  {selectedCueDetail.hexPayload}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => copyToClipboard(selectedCueDetail.hexPayload, selectedCueDetail.id)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-xs flex items-center gap-1.5"
              >
                {copiedHexId === selectedCueDetail.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Payload</span>
              </button>
              <button
                onClick={() => setSelectedCueDetail(null)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
