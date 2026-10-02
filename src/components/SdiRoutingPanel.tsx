import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Cable,
  ArrowRightLeft,
  Tv,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Scan,
} from 'lucide-react';
import { SdiStandard } from '../types/stream';

export const SdiRoutingPanel: React.FC = () => {
  const {
    inputSource,
    setInputSource,
    sdiInput,
    updateSdiInput,
    sdiOutput,
    updateSdiOutput,
    scte104Messages,
    triggerScte104Message,
    clearScte104Logs,
    srtIngest,
  } = useStream();

  const [activeTab, setActiveTab] = useState<'matrix_router' | 'sdi_input' | 'sdi_output' | 'scte104_vanc'>('matrix_router');
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  const copyPayload = (payload: string, id: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-sky-950 border border-sky-800/60 text-sky-400">
            <Cable className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                SDI Baseband & SCTE-104 VANC Matrix Router
              </h3>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ${
                  inputSource === 'sdi'
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-sky-500 text-black shadow'
                }`}
              >
                ACTIVE INPUT: {inputSource === 'sdi' ? '12G-SDI BASEBAND' : 'IP SRT INGEST'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Dual-source switching between physical SDI hardware and IP SRT streams with SCTE-104 VANC insertion and passthrough.
            </p>
          </div>
        </div>

        {/* Master Source Quick Toggle */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg">
          <button
            onClick={() => setInputSource('sdi')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition text-xs ${
              inputSource === 'sdi'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>SWITCH TO SDI INPUT</span>
          </button>

          <button
            onClick={() => setInputSource('srt')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition text-xs ${
              inputSource === 'srt'
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SWITCH TO SRT INGEST</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('matrix_router')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'matrix_router'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>A/B INPUT MATRIX ROUTER</span>
        </button>

        <button
          onClick={() => setActiveTab('sdi_input')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'sdi_input'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>SDI INPUT CONFIG (SCTE-104 VANC)</span>
        </button>

        <button
          onClick={() => setActiveTab('sdi_output')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'sdi_output'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>SDI OUTPUT (PASSTHROUGH & EMBEDDER)</span>
        </button>

        <button
          onClick={() => setActiveTab('scte104_vanc')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'scte104_vanc'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SCTE-104 VANC PACKETS ({scte104Messages.length})</span>
        </button>
      </div>

      {/* TAB 1: MASTER A/B MATRIX ROUTER */}
      {activeTab === 'matrix_router' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SDI Input Card */}
            <div
              onClick={() => setInputSource('sdi')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                inputSource === 'sdi'
                  ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-neutral-100">SOURCE A: BASEBAND SDI INPUT</span>
                  </div>
                  {inputSource === 'sdi' ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px]">
                      ON AIR / ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">
                      STANDBY
                    </span>
                  )}
                </div>

                <p className="text-neutral-400 text-[11px]">
                  Direct hardware video capture via DeckLink 12G-SDI with embedded 16-channel PCM audio and SCTE-104 VANC signaling.
                </p>

                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Hardware Interface:</span>
                    <span className="text-neutral-200">{sdiInput.deviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SDI Standard:</span>
                    <span className="text-amber-300 font-bold">{sdiInput.standard} ({sdiInput.videoFormat})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Genlock Reference:</span>
                    <span className="text-emerald-400 font-bold">{sdiInput.genlockRef} ({sdiInput.genlockStatus.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SCTE-104 Ingest:</span>
                    <span className="text-sky-300 font-bold">VANC Line {sdiInput.vancLine} (DID {sdiInput.scte104Did}, SDID {sdiInput.scte104Sdid})</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`w-full py-2 rounded font-bold transition text-center ${
                  inputSource === 'sdi'
                    ? 'bg-amber-500 text-black'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {inputSource === 'sdi' ? 'ACTIVE ENCODING SOURCE' : 'CLICK TO ROUTE SDI TO OUTPUTS'}
              </button>
            </div>

            {/* SRT Ingest Card */}
            <div
              onClick={() => setInputSource('srt')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                inputSource === 'srt'
                  ? 'bg-sky-950/30 border-sky-500 shadow-lg shadow-sky-500/10'
                  : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-sm text-neutral-100">SOURCE B: IP SRT STREAM INGEST</span>
                  </div>
                  {inputSource === 'srt' ? (
                    <span className="px-2 py-0.5 rounded bg-sky-500 text-black font-bold text-[10px]">
                      ON AIR / ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">
                      STANDBY
                    </span>
                  )}
                </div>

                <p className="text-neutral-400 text-[11px]">
                  IP-based low latency video contribution over SRT socket with ARQ error correction and MPEG-TS SCTE-35 PID 0x01E0.
                </p>

                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ingest Socket:</span>
                    <span className="text-sky-300 font-bold">{srtIngest.mode.toUpperCase()} : {srtIngest.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Stream ID:</span>
                    <span className="text-neutral-200 truncate max-w-xs">{srtIngest.streamId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Target Latency:</span>
                    <span className="text-emerald-400 font-bold">{srtIngest.latencyMs} ms buffer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SCTE-35 Ingest:</span>
                    <span className="text-purple-400 font-bold">PID 0x01E0 (stream_type 0x86)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`w-full py-2 rounded font-bold transition text-center ${
                  inputSource === 'srt'
                    ? 'bg-sky-500 text-black'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {inputSource === 'srt' ? 'ACTIVE ENCODING SOURCE' : 'CLICK TO ROUTE SRT TO OUTPUTS'}
              </button>
            </div>
          </div>

          {/* Active Signal Routing Topology Diagram */}
          <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800 space-y-3">
            <span className="font-bold text-neutral-200 block text-xs border-b border-neutral-800 pb-2">
              ACTIVE DOWNSTREAM ROUTING TOPOLOGY & SCTE TRANSLATION
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">OUTPUT 1: SDI OUT</span>
                <span className="text-emerald-400 font-bold block mt-1">12G-SDI BNC</span>
                <span className="text-[10px] text-amber-400">
                  {inputSource === 'sdi' ? 'SCTE-104 Direct Pass' : 'SCTE-35 -> SCTE-104'}
                </span>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">OUTPUT 2: HLS ABR</span>
                <span className="text-emerald-400 font-bold block mt-1">HTTPS :8443</span>
                <span className="text-[10px] text-sky-400">
                  {inputSource === 'sdi' ? 'SCTE-104 -> #EXT-X-DATERANGE' : 'SCTE-35 Passthrough'}
                </span>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">OUTPUT 3: SRT EGRESS</span>
                <span className="text-emerald-400 font-bold block mt-1">Port :9820</span>
                <span className="text-[10px] text-purple-400">MPEG-TS PID 0x01E0</span>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">OUTPUT 4: RTMP/S</span>
                <span className="text-emerald-400 font-bold block mt-1">TLS CDN Ingest</span>
                <span className="text-[10px] text-neutral-400">AMF onCuePoint Signaling</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SDI INPUT CONFIG */}
      {activeTab === 'sdi_input' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                SDI CAPTURE HARDWARE & FORMAT
              </span>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">SDI INTERFACE DEVICE</label>
                <input
                  type="text"
                  value={sdiInput.deviceName}
                  onChange={(e) => updateSdiInput({ deviceName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              {/* DeckLink Auto Detect Mode */}
              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400">
                    <Scan className="w-3.5 h-3.5" />
                    <span>DECKLINK AUTO-DETECT (bmdVideoInputEnableFormatDetection)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newAuto = !sdiInput.autoDetectFormat;
                      updateSdiInput({
                        autoDetectFormat: newAuto,
                        videoFormat: newAuto ? 'auto_detect' : '2160p59.94',
                        detectedFormat: newAuto ? '2160p59.94 (SMPTE ST 2082 12G-SDI)' : sdiInput.detectedFormat,
                      });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                      sdiInput.autoDetectFormat
                        ? 'bg-emerald-500 text-black shadow'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {sdiInput.autoDetectFormat ? 'AUTO-DETECT ENABLED' : 'MANUAL OVERRIDE'}
                  </button>
                </div>

                {sdiInput.autoDetectFormat && (
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-800/80">
                    <span className="text-neutral-400">Hardware Locked Format:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {sdiInput.detectedFormat || '2160p59.94 (SMPTE ST 2082 12G-SDI)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">SDI STANDARD</label>
                  <select
                    value={sdiInput.standard}
                    onChange={(e) => updateSdiInput({ standard: e.target.value as SdiStandard })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value="12G-SDI">12G-SDI (SMPTE ST 2082 / 4K UHD)</option>
                    <option value="6G-SDI">6G-SDI (SMPTE ST 2081)</option>
                    <option value="3G-SDI-LevelA">3G-SDI Level A (SMPTE 424M)</option>
                    <option value="3G-SDI-LevelB">3G-SDI Level B (Dual Stream)</option>
                    <option value="HD-SDI">HD-SDI (SMPTE 292M)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">DECKLINK VIDEO FORMAT</label>
                  <select
                    value={sdiInput.videoFormat}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      updateSdiInput({
                        videoFormat: val,
                        autoDetectFormat: val === 'auto_detect',
                        detectedFormat: val === 'auto_detect' ? '2160p59.94 (SMPTE ST 2082 12G-SDI)' : val,
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <optgroup label="Auto-Detection">
                      <option value="auto_detect">⚡ Auto-Detect Hardware Format (Automatic Scan)</option>
                    </optgroup>
                    <optgroup label="4K Ultra HD (SMPTE ST 2082 / 2081)">
                      <option value="2160p60">2160p 60.00 fps (4K UHD High-Motion)</option>
                      <option value="2160p59.94">2160p 59.94 fps (4K UHD Broadcast Master)</option>
                      <option value="2160p50">2160p 50.00 fps (4K UHD PAL / EBU European)</option>
                      <option value="2160p30">2160p 30.00 fps</option>
                      <option value="2160p29.97">2160p 29.97 fps</option>
                      <option value="2160p25">2160p 25.00 fps (4K UHD PAL Film)</option>
                      <option value="2160p24">2160p 24.00 fps (Cinema 4K)</option>
                      <option value="2160p23.98">2160p 23.98 fps</option>
                    </optgroup>
                    <optgroup label="1080p Full HD (SMPTE 424M / 3G-SDI)">
                      <option value="1080p60">1080p 60.00 fps (High Motion)</option>
                      <option value="1080p59.94">1080p 59.94 fps (NTSC Broadcast)</option>
                      <option value="1080p50">1080p 50.00 fps (PAL / EBU European Standard)</option>
                      <option value="1080p30">1080p 30.00 fps</option>
                      <option value="1080p29.97">1080p 29.97 fps</option>
                      <option value="1080p25">1080p 25.00 fps (PAL European Standard)</option>
                      <option value="1080p24">1080p 24.00 fps (Cinema Film)</option>
                      <option value="1080p23.98">1080p 23.98 fps</option>
                    </optgroup>
                    <optgroup label="1080i Interlaced Broadcast (SMPTE 274M)">
                      <option value="1080i60">1080i 60.00 Hz (Interlaced)</option>
                      <option value="1080i59.94">1080i 59.94 Hz (NTSC Broadcast Standard)</option>
                      <option value="1080i50">1080i 50.00 Hz (PAL / EBU European Standard)</option>
                    </optgroup>
                    <optgroup label="1080PsF Progressive Segmented Frame">
                      <option value="1080PsF25">1080PsF 25.00 fps</option>
                      <option value="1080PsF24">1080PsF 24.00 fps</option>
                      <option value="1080PsF23.98">1080PsF 23.98 fps</option>
                    </optgroup>
                    <optgroup label="720p HD (SMPTE 296M)">
                      <option value="720p60">720p 60.00 fps</option>
                      <option value="720p59.94">720p 59.94 fps</option>
                      <option value="720p50">720p 50.00 fps (EBU Standard)</option>
                      <option value="720p30">720p 30.00 fps</option>
                      <option value="720p25">720p 25.00 fps</option>
                    </optgroup>
                    <optgroup label="Standard Definition (SD)">
                      <option value="576i50">576i 50.00 Hz (PAL 625-line Broadcast)</option>
                      <option value="576p50">576p 50.00 fps</option>
                      <option value="480i59.94">480i 59.94 Hz (NTSC 525-line Broadcast)</option>
                      <option value="480p59.94">480p 59.94 fps</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">COLOR SAMPLING</label>
                  <select
                    value={sdiInput.pixelFormat}
                    onChange={(e) => updateSdiInput({ pixelFormat: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value="YUV-422-10bit">10-bit YUV 4:2:2 (Broadcast Master)</option>
                    <option value="RGB-444-10bit">10-bit RGB 4:4:4</option>
                    <option value="YUV-422-8bit">8-bit YUV 4:2:2</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">EMBEDDED AUDIO</label>
                  <select
                    value={sdiInput.audioChannels}
                    onChange={(e) => updateSdiInput({ audioChannels: Number(e.target.value) as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value={16}>16 Channels (8 Stereo Pairs @ 48kHz)</option>
                    <option value={8}>8 Channels (4 Stereo Pairs @ 48kHz)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SCTE-104 VANC Ingest Settings */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                SCTE-104 VANC ANCILLARY DATA EXTRACTION
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">VANC LINE NUMBER</label>
                  <input
                    type="number"
                    value={sdiInput.vancLine}
                    onChange={(e) => updateSdiInput({ vancLine: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Line 9 (Field 1 Standard)</span>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">GENLOCK REFERENCE</label>
                  <select
                    value={sdiInput.genlockRef}
                    onChange={(e) => updateSdiInput({ genlockRef: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value="Tri-Level Sync">Tri-Level Sync (BNC Ref)</option>
                    <option value="Black Burst">Black Burst (NTSC/PAL)</option>
                    <option value="Internal">Internal Free Run</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">SCTE-104 DID</label>
                  <input
                    type="text"
                    value={sdiInput.scte104Did}
                    onChange={(e) => updateSdiInput({ scte104Did: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">DID 0x41 (SMPTE ST 291)</span>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">SCTE-104 SDID</label>
                  <input
                    type="text"
                    value={sdiInput.scte104Sdid}
                    onChange={(e) => updateSdiInput({ scte104Sdid: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">SDID 0x07 (SMPTE 2010)</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] flex justify-between items-center">
                <span className="text-neutral-400">SMPTE 12M Timecode:</span>
                <span className="text-sky-300 font-bold">{sdiInput.inputTimecode}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SDI OUTPUT CONFIG */}
      {activeTab === 'sdi_output' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                SDI BASEBAND OUTPUT TRANSMISSION
              </span>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">OUTPUT DEVICE BNC</label>
                <input
                  type="text"
                  value={sdiOutput.deviceName}
                  onChange={(e) => updateSdiOutput({ deviceName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">OUTPUT STANDARD</label>
                  <select
                    value={sdiOutput.standard}
                    onChange={(e) => updateSdiOutput({ standard: e.target.value as SdiStandard })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value="12G-SDI">12G-SDI (4K UHD Output)</option>
                    <option value="3G-SDI-LevelA">3G-SDI Level A (1080p60)</option>
                    <option value="HD-SDI">HD-SDI (1080i59.94)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">OUTPUT FORMAT</label>
                  <select
                    value={sdiOutput.videoFormat}
                    onChange={(e) => updateSdiOutput({ videoFormat: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <optgroup label="4K Ultra HD (12G / 6G-SDI)">
                      <option value="2160p60">2160p 60.00 fps</option>
                      <option value="2160p59.94">2160p 59.94 fps</option>
                      <option value="2160p50">2160p 50.00 fps (PAL)</option>
                      <option value="2160p30">2160p 30.00 fps</option>
                      <option value="2160p25">2160p 25.00 fps</option>
                      <option value="2160p24">2160p 24.00 fps</option>
                    </optgroup>
                    <optgroup label="1080p Full HD (3G-SDI)">
                      <option value="1080p60">1080p 60.00 fps</option>
                      <option value="1080p59.94">1080p 59.94 fps</option>
                      <option value="1080p50">1080p 50.00 fps (PAL)</option>
                      <option value="1080p30">1080p 30.00 fps</option>
                      <option value="1080p25">1080p 25.00 fps</option>
                      <option value="1080p24">1080p 24.00 fps</option>
                    </optgroup>
                    <optgroup label="1080i Interlaced (HD-SDI)">
                      <option value="1080i60">1080i 60.00 Hz</option>
                      <option value="1080i59.94">1080i 59.94 Hz</option>
                      <option value="1080i50">1080i 50.00 Hz (PAL)</option>
                    </optgroup>
                    <optgroup label="720p HD (HD-SDI)">
                      <option value="720p60">720p 60.00 fps</option>
                      <option value="720p59.94">720p 59.94 fps</option>
                      <option value="720p50">720p 50.00 fps</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">SCTE-104 VANC PASSTHROUGH</label>
                <button
                  type="button"
                  onClick={() => updateSdiOutput({ scte104Passthrough: !sdiOutput.scte104Passthrough })}
                  className={`w-full py-2 rounded font-bold transition text-center ${
                    sdiOutput.scte104Passthrough
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {sdiOutput.scte104Passthrough
                    ? 'SCTE-104 VANC PASSTHROUGH & TRANSLATION ENABLED'
                    : 'PASSTHROUGH DISABLED'}
                </button>
              </div>
            </div>

            {/* Manual SCTE-104 Inserter for SDI Output */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                MANUAL SCTE-104 INJECTION FOR SDI OUTPUT
              </span>

              <p className="text-[11px] text-neutral-400">
                Embed SCTE-104 digital cue packets directly into Line {sdiOutput.vancLine} of the SDI Output baseband feed.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => triggerScte104Message('initiate_splice() [0x0101]', 30)}
                  className="w-full py-2 px-3 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>INJECT SCTE-104 initiate_splice() (30s Ad Avail)</span>
                </button>

                <button
                  onClick={() => triggerScte104Message('splice_null() [0x0102]', 0)}
                  className="w-full py-1.5 px-3 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>INJECT SCTE-104 splice_null() Heartbeat</span>
                </button>

                <button
                  onClick={() => triggerScte104Message('time_signal_request() [0x0104]', 60)}
                  className="w-full py-1.5 px-3 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>INJECT SCTE-104 time_signal_request() (60s Program Break)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCTE-104 VANC LOGS */}
      {activeTab === 'scte104_vanc' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-bold text-neutral-200">
              SCTE-104 ANCILLARY DATA PACKETS (VANC LINE {sdiInput.vancLine})
            </span>
            <div className="flex items-center gap-2">
              <span>{scte104Messages.length} PACKETS LOGGED</span>
              <button
                onClick={clearScte104Logs}
                className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 text-[10px]"
              >
                Clear Log
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">SOURCE</th>
                  <th className="py-2 px-3">VANC LINE / DID</th>
                  <th className="py-2 px-3">OPERATION</th>
                  <th className="py-2 px-3">EVENT ID</th>
                  <th className="py-2 px-3">DURATION</th>
                  <th className="py-2 px-3">HEX PAYLOAD</th>
                  <th className="py-2 px-3 text-right">RELAY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950">
                {scte104Messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-neutral-900/50 transition">
                    <td className="py-2.5 px-3 text-neutral-400">{msg.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          msg.source === 'sdi_vanc_in'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {msg.source === 'sdi_vanc_in' ? 'SDI IN VANC' : 'MANUAL INJECT'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">
                      Line {msg.line} ({msg.did}/{msg.sdid})
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{msg.operationName}</td>
                    <td className="py-2.5 px-3 text-sky-400 font-bold">#{msg.spliceEventId}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{msg.durationSec}s</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-400 max-w-xs truncate">
                      <code>{msg.hexPayload}</code>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {msg.relayedToOutput ? (
                        <span className="text-emerald-400 font-bold text-[10px]">OUTPUT PASSED</span>
                      ) : (
                        <span className="text-neutral-500 text-[10px]">LOG ONLY</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
