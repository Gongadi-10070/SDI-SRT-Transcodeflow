import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Sliders,
  Settings,
  Radio,
  Video,
  Music,
  Share2,
  HardDrive,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { SrtMode, VideoCodec, VideoProfile, VideoPreset, VideoTune, RateControl, FrameRate, Resolution } from '../types/stream';

export const TranscoderConfigPanel: React.FC = () => {
  const {
    srtIngest,
    updateSrtIngest,
    videoConfig,
    updateVideoConfig,
    audioConfig,
    updateAudioConfig,
    hlsEgress,
    updateHlsEgress,
    srtEgress,
    updateSrtEgress,
    rtmpEgress,
    updateRtmpEgress,
    httpsSslConfig,
    updateHttpsSslConfig,
    activePreset,
    applyPreset,
    restartEngine,
  } = useStream();

  const [activeTab, setActiveTab] = useState<'srt_ingest' | 'video_codec' | 'egress_matrix' | 'audio' | 'commands'>('srt_ingest');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Generate real FFmpeg command matching exact UI parameters
  const generateFfmpegCommand = () => {
    const srtInUrl = `srt://${srtIngest.host}:${srtIngest.port}?mode=${srtIngest.mode}&latency=${srtIngest.latencyMs * 1000}&overheadbandwidth=${srtIngest.overheadBandwidthPercent}${srtIngest.passphrase ? `&passphrase=${srtIngest.passphrase}&pbkeylen=${srtIngest.pbKeyLen}` : ''}${srtIngest.streamId ? `&streamid=${encodeURIComponent(srtIngest.streamId)}` : ''}`;

    const vCodecParam =
      videoConfig.codec === 'h264'
        ? 'libx264'
        : videoConfig.codec === 'h265'
        ? 'libx265'
        : videoConfig.codec === 'av1'
        ? 'libsvtav1'
        : 'prores_ks';

    return `ffmpeg -re -i "${srtInUrl}" \\
  -c:v ${vCodecParam} -profile:v ${videoConfig.profile} -preset ${videoConfig.preset} -tune ${videoConfig.tune} \\
  -b:v ${videoConfig.targetBitrateKbps}k -minrate ${videoConfig.minBitrateKbps}k -maxrate ${videoConfig.maxBitrateKbps}k -bufsize ${videoConfig.bufferSizeKb}k \\
  -g ${videoConfig.gopSizeFrames} -keyint_min ${videoConfig.gopSizeFrames} ${videoConfig.closedGop ? '-flags +cgop' : ''} -bf ${videoConfig.bFrames} \\
  -s ${videoConfig.resolution} -r ${videoConfig.fps} \\
  -c:a ${audioConfig.codec === 'aac-lc' ? 'aac' : audioConfig.codec} -b:a ${audioConfig.bitrateKbps}k -ar ${audioConfig.sampleRateHz} \\
  -f hls -hls_time ${hlsEgress.chunkDurationSec} -hls_list_size ${hlsEgress.playlistLength} -hls_flags independent_segments /var/www/hls/live.m3u8 \\
  -f flv "${rtmpEgress.url}/${rtmpEgress.streamKey}"`;
  };

  const copyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header with Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-sky-950 border border-sky-800/60 text-sky-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                Broadcast Matrix & Transcoder Architecture
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                PRO CONFIG
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Fine-tune latency, GOP cadence, chunk slicing, rate control, and multi-egress distribution.
            </p>
          </div>
        </div>

        {/* Quick Production Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-neutral-500 text-[11px] mr-1 hidden sm:inline">Presets:</span>
          {[
            { id: '1080p60_broadcast', label: '1080p60 Broadcast' },
            { id: '4k_hevc_master', label: '4K HEVC Master' },
            { id: 'low_latency_esports', label: 'Esports Ultra-Low' },
            { id: 'satellite_robust', label: 'Satellite Robust' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`px-2 py-1 rounded text-[11px] transition ${
                activePreset === preset.id
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('srt_ingest')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'srt_ingest'
              ? 'bg-sky-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>SRT INGEST ({srtIngest.mode.toUpperCase()})</span>
        </button>

        <button
          onClick={() => setActiveTab('video_codec')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'video_codec'
              ? 'bg-sky-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>VIDEO CODEC & GOP</span>
        </button>

        <button
          onClick={() => setActiveTab('egress_matrix')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'egress_matrix'
              ? 'bg-sky-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>EGRESS (HLS / SRT / RTMP)</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'audio'
              ? 'bg-sky-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>AUDIO CONTROL</span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'commands'
              ? 'bg-sky-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>ENGINE COMMAND PIPELINE</span>
        </button>
      </div>

      {/* TAB 1: SRT INGEST CONFIGURATION */}
      {activeTab === 'srt_ingest' && (
        <div className="space-y-4">
          <div className="bg-sky-950/20 border border-sky-800/40 rounded p-3 text-neutral-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sky-300">SRT Protocol (Secure Reliable Transport):</span> Select{' '}
              <strong className="text-white">Caller</strong> when connecting out to a remote OB van, cloud edge, or transmitter.{' '}
              Select <strong className="text-white">Listener</strong> to bind to a local MCR port and wait for incoming camera or master feed.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mode */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">SRT SOCKET MODE</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['listener', 'caller', 'rendezvous'] as SrtMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateSrtIngest({ mode })}
                    className={`py-1.5 rounded uppercase font-bold text-center transition ${
                      srtIngest.mode === mode
                        ? 'bg-sky-600 text-white'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Host */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                {srtIngest.mode === 'listener' ? 'BIND ADDRESS' : 'TARGET HOST / IP'}
              </label>
              <input
                type="text"
                value={srtIngest.host}
                onChange={(e) => updateSrtIngest({ host: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              />
            </div>

            {/* Port */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">SRT UDP PORT</label>
              <input
                type="number"
                value={srtIngest.port}
                onChange={(e) => updateSrtIngest({ port: Number(e.target.value) })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              />
            </div>
          </div>

          {/* Latency & Overhead Bandwidth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900/40 p-3.5 rounded border border-neutral-800/80">
            {/* Latency */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-neutral-400 text-[11px]">
                  SRT RECOVERY BUFFER LATENCY: <strong className="text-sky-400">{srtIngest.latencyMs} ms</strong>
                </span>
                <div className="flex gap-1 text-[10px]">
                  <button
                    onClick={() => updateSrtIngest({ latencyMs: 20 })}
                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                  >
                    LAN (20ms)
                  </button>
                  <button
                    onClick={() => updateSrtIngest({ latencyMs: 120 })}
                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                  >
                    WAN (120ms)
                  </button>
                  <button
                    onClick={() => updateSrtIngest({ latencyMs: 800 })}
                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                  >
                    Sat (800ms)
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="20"
                max="2000"
                step="10"
                value={srtIngest.latencyMs}
                onChange={(e) => updateSrtIngest({ latencyMs: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-sky-400"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Recommendation: Set to 2.5x to 4x of measured RTT ({srtIngest.latencyMs}ms buffer absorbs burst jitter).
              </p>
            </div>

            {/* Overhead Bandwidth */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-neutral-400 text-[11px]">
                  OVERHEAD BANDWIDTH % (NAK RE-SENDS):{' '}
                  <strong className="text-emerald-400">{srtIngest.overheadBandwidthPercent}%</strong>
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={srtIngest.overheadBandwidthPercent}
                onChange={(e) => updateSrtIngest({ overheadBandwidthPercent: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-400"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Dedicated pipe headroom reserved exclusively for packet recovery retransmissions.
              </p>
            </div>
          </div>

          {/* Encryption Passphrase & StreamID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">AES KEY LENGTH</label>
              <select
                value={srtIngest.pbKeyLen}
                onChange={(e) => updateSrtIngest({ pbKeyLen: Number(e.target.value) as any })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              >
                <option value={0}>Disabled (Cleartext)</option>
                <option value={16}>AES-128 bit</option>
                <option value={24}>AES-192 bit</option>
                <option value={32}>AES-256 bit (Broadcast Tier)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">AES PASSPHRASE</label>
              <input
                type="text"
                value={srtIngest.passphrase}
                onChange={(e) => updateSrtIngest({ passphrase: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
                placeholder="Minimum 10 characters"
              />
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">STREAM ID (SRT ROUTING)</label>
              <input
                type="text"
                value={srtIngest.streamId}
                onChange={(e) => updateSrtIngest({ streamId: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIDEO CODEC, BITRATE, GOP & PROFILE SETTINGS */}
      {activeTab === 'video_codec' && (
        <div className="space-y-4">
          {/* Codec, Profile, Preset, Tune */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Codec */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">VIDEO CODEC</label>
              <select
                value={videoConfig.codec}
                onChange={(e) => updateVideoConfig({ codec: e.target.value as VideoCodec })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400 uppercase"
              >
                <option value="h264">H.264 / AVC (Broadcast Standard)</option>
                <option value="h265">H.265 / HEVC (UHD 4K Main10)</option>
                <option value="av1">AOMedia AV1 (Next-Gen Royalty-Free)</option>
                <option value="prores">Apple ProRes 422 HQ (Master Baseband)</option>
                <option value="vp9">Google VP9 (WebM High Profile)</option>
                <option value="mpeg2">MPEG-2 Video (ATSC / DVB Legacy Broadcast)</option>
              </select>
            </div>

            {/* Profile */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">ENCODING PROFILE</label>
              <select
                value={videoConfig.profile}
                onChange={(e) => updateVideoConfig({ profile: e.target.value as VideoProfile })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400 uppercase"
              >
                <option value="baseline">Baseline (Low Complexity)</option>
                <option value="main">Main Profile</option>
                <option value="high">High Profile (4:2:0)</option>
                <option value="high422">High 4:2:2 (Production Master)</option>
                <option value="main10">Main 10 (10-bit HDR)</option>
              </select>
            </div>

            {/* Preset */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">CPU SPEED PRESET</label>
              <select
                value={videoConfig.preset}
                onChange={(e) => updateVideoConfig({ preset: e.target.value as VideoPreset })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400 uppercase"
              >
                <option value="ultrafast">Ultrafast (&lt;5ms latency)</option>
                <option value="superfast">Superfast</option>
                <option value="veryfast">Veryfast (Balanced Live)</option>
                <option value="faster">Faster</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium (Archival Master)</option>
                <option value="slow">Slow</option>
              </select>
            </div>

            {/* Tune */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">ENCODER TUNE</label>
              <select
                value={videoConfig.tune}
                onChange={(e) => updateVideoConfig({ tune: e.target.value as VideoTune })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400 uppercase"
              >
                <option value="zerolatency">zerolatency (Instant Slice)</option>
                <option value="film">film (Smooth gradients)</option>
                <option value="animation">animation</option>
                <option value="grain">grain (Preserve noise)</option>
              </select>
            </div>
          </div>

          {/* Bitrate Control (Target, Min, Max, Buffer Size) */}
          <div className="bg-neutral-900/40 p-3.5 rounded border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200">RATE CONTROL & BITRATE LADDER</span>
              <div className="flex gap-2">
                {(['cbr', 'vbr', 'capped-vbr'] as RateControl[]).map((rc) => (
                  <button
                    key={rc}
                    onClick={() => updateVideoConfig({ rateControl: rc })}
                    className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                      videoConfig.rateControl === rc
                        ? 'bg-amber-600 text-black font-bold'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {rc}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  TARGET BITRATE: <strong className="text-sky-400">{videoConfig.targetBitrateKbps} kbps</strong>
                </label>
                <input
                  type="range"
                  min="1500"
                  max="25000"
                  step="250"
                  value={videoConfig.targetBitrateKbps}
                  onChange={(e) => updateVideoConfig({ targetBitrateKbps: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  MAX BITRATE CAP: <strong className="text-amber-400">{videoConfig.maxBitrateKbps} kbps</strong>
                </label>
                <input
                  type="range"
                  min="2000"
                  max="35000"
                  step="500"
                  value={videoConfig.maxBitrateKbps}
                  onChange={(e) => updateVideoConfig({ maxBitrateKbps: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  VBV BUFFER SIZE: <strong className="text-emerald-400">{videoConfig.bufferSizeKb} kb</strong>
                </label>
                <input
                  type="range"
                  min="3000"
                  max="40000"
                  step="1000"
                  value={videoConfig.bufferSizeKb}
                  onChange={(e) => updateVideoConfig({ bufferSizeKb: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* GOP (Group of Pictures) & Keyframe Cadence */}
          <div className="bg-neutral-900/40 p-3.5 rounded border border-neutral-800 space-y-3">
            <span className="font-bold text-neutral-200 block">
              GOP (GROUP OF PICTURES) & KEYFRAME INTERVAL
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">GOP SIZE (FRAMES)</label>
                <input
                  type="number"
                  value={videoConfig.gopSizeFrames}
                  onChange={(e) => {
                    const gop = Number(e.target.value);
                    updateVideoConfig({
                      gopSizeFrames: gop,
                      keyframeIntervalSec: parseFloat((gop / videoConfig.fps).toFixed(2)),
                    });
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  = {(videoConfig.gopSizeFrames / videoConfig.fps).toFixed(2)}s per IDR keyframe
                </span>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">B-FRAMES COUNT</label>
                <select
                  value={videoConfig.bFrames}
                  onChange={(e) => updateVideoConfig({ bFrames: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
                >
                  <option value={0}>0 (Ultra-low latency / I-P only)</option>
                  <option value={1}>1 B-frame</option>
                  <option value={2}>2 B-frames (Broadcast standard)</option>
                  <option value={3}>3 B-frames (High efficiency)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">GOP STRUCTURE</label>
                <button
                  type="button"
                  onClick={() => updateVideoConfig({ closedGop: !videoConfig.closedGop })}
                  className={`w-full py-1.5 rounded font-bold transition text-center ${
                    videoConfig.closedGop
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {videoConfig.closedGop ? 'CLOSED GOP (HLS SAFE)' : 'OPEN GOP'}
                </button>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">SCENE CUT DETECTION</label>
                <input
                  type="number"
                  value={videoConfig.sceneCutThreshold}
                  onChange={(e) => updateVideoConfig({ sceneCutThreshold: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Resolution & Frame Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">MASTER RESOLUTION</label>
              <select
                value={videoConfig.resolution}
                onChange={(e) => updateVideoConfig({ resolution: e.target.value as Resolution })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              >
                <option value="3840x2160">3840 x 2160 (4K UHD Broadcast)</option>
                <option value="1920x1080">1920 x 1080 (1080p FHD Progressive)</option>
                <option value="1920x1080i">1920 x 1080i (1080i Interlaced Broadcast)</option>
                <option value="1280x720">1280 x 720 (720p HD Standard)</option>
                <option value="960x540">960 x 540 (540p qHD Mobile)</option>
                <option value="720x576">720 x 576 (576i / 576p PAL Broadcast)</option>
                <option value="720x480">720 x 480 (480i / 480p NTSC Broadcast)</option>
                <option value="854x480">854 x 480 (480p Wide SD)</option>
                <option value="640x360">640 x 360 (360p Low Bandwidth)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">FRAME RATE (FPS)</label>
              <select
                value={videoConfig.fps}
                onChange={(e) => {
                  const fps = Number(e.target.value) as FrameRate;
                  updateVideoConfig({
                    fps,
                    gopSizeFrames: Math.round(fps * videoConfig.keyframeIntervalSec),
                  });
                }}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              >
                <option value={60}>60.00 fps (High Motion / Esports)</option>
                <option value={59.94}>59.94 fps (NTSC Broadcast Master)</option>
                <option value={50}>50.00 fps (PAL / EBU European Broadcast Standard)</option>
                <option value={30}>30.00 fps (Standard Web Video)</option>
                <option value={29.97}>29.97 fps (NTSC Standard Telecine)</option>
                <option value={25}>25.00 fps (PAL European Film & Television)</option>
                <option value={24}>24.00 fps (Cinematic Film 24p)</option>
                <option value={23.98}>23.98 fps (Cinema NTSC 23.976)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-EGRESS (HLS, SRT EGRESS, RTMP) */}
      {activeTab === 'egress_matrix' && (
        <div className="space-y-4">
          {/* Egress 1: HLS Stream Packaging */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                DESTINATION 1: HLS & LL-HLS CHUNK PACKAGER
              </span>
              <button
                type="button"
                onClick={() => updateHlsEgress({ enabled: !hlsEgress.enabled })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  hlsEgress.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {hlsEgress.enabled ? 'ONLINE' : 'DISABLED'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  CHUNK / SEGMENT SIZE: <strong className="text-emerald-400">{hlsEgress.chunkDurationSec}s</strong>
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 4, 6].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => updateHlsEgress({ chunkDurationSec: sec })}
                      className={`flex-1 py-1 rounded text-center transition ${
                        hlsEgress.chunkDurationSec === sec
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">PLAYLIST WINDOW SIZE</label>
                <input
                  type="number"
                  value={hlsEgress.playlistLength}
                  onChange={(e) => updateHlsEgress({ playlistLength: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">LL-HLS CHUNKED TRANSFER</label>
                <button
                  type="button"
                  onClick={() => updateHlsEgress({ lowLatency: !hlsEgress.lowLatency })}
                  className={`w-full py-1.5 rounded font-bold transition text-center ${
                    hlsEgress.lowLatency
                      ? 'bg-sky-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {hlsEgress.lowLatency ? 'LL-HLS (250ms Parts)' : 'Standard HLS'}
                </button>
              </div>
            </div>

            {/* HTTPS Port, SSL & AES-128 Encryption */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-800/60">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  HTTPS DELIVERY PORT
                </label>
                <div className="flex gap-1">
                  {[443, 8443, 9443].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateHttpsSslConfig({ port: p })}
                      className={`flex-1 py-1 rounded text-center text-xs font-bold transition ${
                        httpsSslConfig.port === p
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                      }`}
                    >
                      :{p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  SSL CERTIFICATE STATUS
                </label>
                <div className="flex items-center gap-1.5 py-1 px-2 rounded bg-neutral-950 border border-neutral-800 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold truncate">
                    {httpsSslConfig.issuer.split('/')[0]}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  AES-128 SEGMENT ENCRYPTION
                </label>
                <button
                  type="button"
                  onClick={() => updateHlsEgress({ aes128Encryption: !hlsEgress.aes128Encryption })}
                  className={`w-full py-1 rounded font-bold transition text-center text-xs ${
                    hlsEgress.aes128Encryption
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                  }`}
                >
                  {hlsEgress.aes128Encryption ? 'AES-128 ENCRYPTED' : 'CLEAR TS/CMAF'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                SECURE HTTPS MASTER PLAYLIST URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={hlsEgress.masterPlaylistUrl}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-emerald-300 font-bold"
                />
                <button
                  onClick={() => copyCommand(hlsEgress.masterPlaylistUrl, 'hls_url')}
                  className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 shrink-0"
                >
                  {copiedCmd === 'hls_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Egress 2: SRT Egress Stream */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                DESTINATION 2: SRT EGRESS FEED (DOWNLINKS)
              </span>
              <button
                type="button"
                onClick={() => updateSrtEgress({ enabled: !srtEgress.enabled })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  srtEgress.enabled
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {srtEgress.enabled ? 'ONLINE' : 'DISABLED'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">SRT OUT MODE</label>
                <select
                  value={srtEgress.mode}
                  onChange={(e) => updateSrtEgress({ mode: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                >
                  <option value="listener">Listener (Distribution Hub)</option>
                  <option value="caller">Caller (Push to Cloud)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">EGRESS PORT</label>
                <input
                  type="number"
                  value={srtEgress.port}
                  onChange={(e) => updateSrtEgress({ port: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">EGRESS LATENCY (MS)</label>
                <input
                  type="number"
                  value={srtEgress.latencyMs}
                  onChange={(e) => updateSrtEgress({ latencyMs: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">PASSPHRASE</label>
                <input
                  type="text"
                  value={srtEgress.passphrase}
                  onChange={(e) => updateSrtEgress({ passphrase: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>
            </div>
          </div>

          {/* Egress 3: RTMP Stream */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-pink-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                DESTINATION 3: RTMP / RTMPS SYNDICATION
              </span>
              <button
                type="button"
                onClick={() => updateRtmpEgress({ enabled: !rtmpEgress.enabled })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rtmpEgress.enabled
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {rtmpEgress.enabled ? 'ONLINE' : 'DISABLED'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">RTMP ENDPOINT URL</label>
                <input
                  type="text"
                  value={rtmpEgress.url}
                  onChange={(e) => updateRtmpEgress({ url: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">STREAM KEY</label>
                <input
                  type="password"
                  value={rtmpEgress.streamKey}
                  onChange={(e) => updateRtmpEgress({ streamKey: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIO CONTROL */}
      {activeTab === 'audio' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">AUDIO CODEC</label>
              <select
                value={audioConfig.codec}
                onChange={(e) => updateAudioConfig({ codec: e.target.value as any })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 uppercase"
              >
                <option value="aac-lc">AAC-LC (Low Complexity Standard)</option>
                <option value="he-aac-v1">HE-AAC v1 (Spectral Band Replication)</option>
                <option value="he-aac-v2">HE-AAC v2 (Parametric Stereo)</option>
                <option value="ac3">Dolby Digital (AC-3)</option>
                <option value="eac3">Dolby Digital Plus (E-AC-3 / Atmos)</option>
                <option value="ac4">Dolby AC-4 (Next-Gen Audio)</option>
                <option value="opus">Opus Audio (Low-latency Interactive)</option>
                <option value="pcm_s24le">Uncompressed Linear PCM (24-bit s24le @ 48kHz)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">AUDIO BITRATE</label>
              <select
                value={audioConfig.bitrateKbps}
                onChange={(e) => updateAudioConfig({ bitrateKbps: Number(e.target.value) })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
              >
                <option value={128}>128 kbps</option>
                <option value={192}>192 kbps (Studio Quality)</option>
                <option value={256}>256 kbps</option>
                <option value={320}>320 kbps (Audiophile)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">SAMPLE RATE & LAYOUT</label>
              <select
                value={audioConfig.sampleRateHz}
                onChange={(e) => updateAudioConfig({ sampleRateHz: Number(e.target.value) as any })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
              >
                <option value={48000}>48.0 kHz (Broadcast Standard)</option>
                <option value={44100}>44.1 kHz (CD Audio)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ENGINE COMMAND PIPELINE (FFmpeg / OBS / GStreamer) */}
      {activeTab === 'commands' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">
              PRODUCTION FFmpeg / HARDWARE COMMAND STRING
            </span>
            <button
              onClick={() => copyCommand(generateFfmpegCommand(), 'ffmpeg')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold"
            >
              {copiedCmd === 'ffmpeg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy FFmpeg CLI</span>
            </button>
          </div>

          <pre className="bg-neutral-950 p-3 rounded border border-neutral-800 text-[11px] text-sky-300 overflow-x-auto whitespace-pre font-mono">
            {generateFfmpegCommand()}
          </pre>
        </div>
      )}

      {/* Footer / Apply changes */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
        <span className="text-[11px] text-neutral-500">
          Parameters are hot-reloaded automatically. Click restart if video sync slips.
        </span>
        <button
          onClick={restartEngine}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition border border-neutral-700"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Restart Transcoder Pipeline</span>
        </button>
      </div>
    </div>
  );
};
