import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Layers,
  Music,
  Video,
  FileCode,
  Copy,
  Check,
  Settings,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  Sliders,
  Volume2,
  HardDrive,
  Info,
} from 'lucide-react';
import { VideoCodec, VideoProfile, AudioCodec, Resolution, FrameRate } from '../types/stream';

export const HlsProfileBuilder: React.FC = () => {
  const {
    hlsEgress,
    updateHlsEgress,
    toggleHlsProfile,
    updateHlsProfile,
    toggleHlsAudioTrack,
    updateHlsAudioTrack,
    generateMasterHlsPlaylist,
    httpsSslConfig,
  } = useStream();

  const [activeTab, setActiveTab] = useState<'video_profiles' | 'audio_renditions' | 'master_playlist' | 'ffmpeg_pipeline'>('video_profiles');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeProfiles = hlsEgress.profiles.filter((p) => p.enabled);
  const activeAudioTracks = hlsEgress.audioTracks.filter((a) => a.enabled);
  const totalVideoBandwidthKbps = activeProfiles.reduce((acc, p) => acc + p.videoBitrateKbps, 0);
  const totalAudioBandwidthKbps = activeAudioTracks.reduce((acc, a) => acc + a.bitrateKbps, 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate multi-variant FFmpeg command
  const generateFfmpegAbrCommand = () => {
    const streamMap = activeProfiles
      .map((p, idx) => `v:${idx},a:0,name:${p.height}p`)
      .join(' ');

    return `ffmpeg -re -i "srt://0.0.0.0:9710?mode=listener" \\
  -filter_complex "[0:v]split=${activeProfiles.length}${activeProfiles.map((_, i) => `[v${i}]`).join('')}; \\
  ${activeProfiles
    .map((p, i) => `[v${i}]scale=w=${p.width}:h=${p.height}:force_original_aspect_ratio=decrease[v${i}out]`)
    .join('; ')}" \\
  ${activeProfiles
    .map(
      (p, i) =>
        `-map "[v${i}out]" -c:v:${i} ${p.videoCodec === 'h265' ? 'libx265' : p.videoCodec === 'av1' ? 'libsvtav1' : 'libx264'} ` +
        `-b:v:${i} ${p.videoBitrateKbps}k -maxrate:v:${i} ${p.maxBitrateKbps}k -bufsize:v:${i} ${p.maxBitrateKbps * 2}k -profile:v:${i} ${p.profile}`
    )
    .join(' \\\n  ')} \\
  ${activeAudioTracks
    .map(
      (a, i) =>
        `-map 0:a -c:a:${i} ${a.codec === 'ac3' ? 'ac3' : a.codec === 'eac3' ? 'eac3' : a.codec === 'opus' ? 'libopus' : 'aac'} ` +
        `-b:a:${i} ${a.bitrateKbps}k -ar:a:${i} ${a.sampleRateHz}`
    )
    .join(' \\\n  ')} \\
  -f hls -hls_time ${hlsEgress.chunkDurationSec} -hls_list_size ${hlsEgress.playlistLength} -hls_flags independent_segments \\
  -master_pl_name master.m3u8 -var_stream_map "${streamMap}" \\
  /var/www/hls/stream_%v.m3u8`;
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                HLS Adaptive Bitrate (ABR) Multi-Profile Ladder & Audio Studio
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {activeProfiles.length} VIDEO RENDITIONS • {activeAudioTracks.length} AUDIO TRACKS
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Standard RFC 8216 / RFC 6381 multivariant HLS delivery with AVC, HEVC, AV1 video and AAC-LC, Dolby Digital, Opus audio.
            </p>
          </div>
        </div>

        {/* Aggregate Bandwidth Badge */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded flex items-center gap-2">
            <span className="text-neutral-500">AGGREGATE PIPE:</span>
            <span className="text-emerald-400 font-bold">
              {((totalVideoBandwidthKbps + totalAudioBandwidthKbps) / 1000).toFixed(2)} Mbps
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('video_profiles')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'video_profiles'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>VIDEO PROFILES LADDER ({activeProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audio_renditions')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'audio_renditions'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>AUDIO CODECS & DOLBY ({activeAudioTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('master_playlist')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'master_playlist'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>MASTER MANIFEST (master.m3u8)</span>
        </button>

        <button
          onClick={() => setActiveTab('ffmpeg_pipeline')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'ffmpeg_pipeline'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>FFMPEG MULTI-VAR PIPELINE</span>
        </button>
      </div>

      {/* TAB 1: VIDEO PROFILES LADDER */}
      {activeTab === 'video_profiles' && (
        <div className="space-y-3">
          <div className="bg-sky-950/20 border border-sky-800/40 rounded p-2.5 text-[11px] text-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Adaptive Bitrate Ladder automatically switches renditions based on client network bandwidth.
              </span>
            </div>
            <span className="text-emerald-400 font-bold">
              Total Video Pipe: {(totalVideoBandwidthKbps / 1000).toFixed(2)} Mbps
            </span>
          </div>

          <div className="overflow-x-auto rounded border border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">PROFILE NAME</th>
                  <th className="py-2 px-3">RESOLUTION</th>
                  <th className="py-2 px-3">BITRATE (TARGET / MAX)</th>
                  <th className="py-2 px-3">FPS</th>
                  <th className="py-2 px-3">VIDEO CODEC & PROFILE</th>
                  <th className="py-2 px-3">RFC 6381 CODEC STRING</th>
                  <th className="py-2 px-3 text-right">PLAYLIST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950">
                {hlsEgress.profiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className={`transition hover:bg-neutral-900/60 ${
                      profile.enabled ? 'text-neutral-200' : 'text-neutral-600 bg-neutral-950/40'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggleHlsProfile(profile.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          profile.enabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {profile.enabled ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-white">
                      {profile.name}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-sky-300 font-bold">{profile.resolution}</span>
                      <span className="text-[10px] text-neutral-500 block">
                        ({profile.width} x {profile.height})
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-emerald-400 font-bold">
                        {(profile.videoBitrateKbps / 1000).toFixed(1)} Mbps
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        Cap: {(profile.maxBitrateKbps / 1000).toFixed(1)} Mbps
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-semibold">{profile.fps} fps</td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          profile.videoCodec === 'h265'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : profile.videoCodec === 'av1'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}
                      >
                        {profile.videoCodec.toUpperCase()} {profile.profile}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-400">
                      <code>{profile.rfc6381Codec}</code>
                    </td>

                    <td className="py-2.5 px-3 text-right text-[11px] text-neutral-400 font-mono">
                      {profile.playlistName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIO CODECS & DOLBY RENDITIONS */}
      {activeTab === 'audio_renditions' && (
        <div className="space-y-3">
          <div className="bg-purple-950/20 border border-purple-800/40 rounded p-2.5 text-[11px] text-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Standard HLS audio tracks signaled via <code>#EXT-X-MEDIA:TYPE=AUDIO</code>. Supports multi-channel Dolby and multi-language stereo.
              </span>
            </div>
            <span className="text-purple-400 font-bold">
              Total Audio Pipe: {totalAudioBandwidthKbps} kbps
            </span>
          </div>

          <div className="overflow-x-auto rounded border border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">AUDIO TRACK NAME</th>
                  <th className="py-2 px-3">CODEC STANDARD</th>
                  <th className="py-2 px-3">CHANNELS</th>
                  <th className="py-2 px-3">BITRATE</th>
                  <th className="py-2 px-3">SAMPLE RATE</th>
                  <th className="py-2 px-3">LANG</th>
                  <th className="py-2 px-3 text-right">DEFAULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950">
                {hlsEgress.audioTracks.map((track) => (
                  <tr
                    key={track.id}
                    className={`transition hover:bg-neutral-900/60 ${
                      track.enabled ? 'text-neutral-200' : 'text-neutral-600 bg-neutral-950/40'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggleHlsAudioTrack(track.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          track.enabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {track.enabled ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>{track.name}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          track.codec.includes('ac3') || track.codec.includes('eac3')
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : track.codec === 'opus'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {track.codec.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-amber-300">{track.channels}</td>

                    <td className="py-2.5 px-3 font-semibold text-neutral-200">
                      {track.bitrateKbps} kbps
                    </td>

                    <td className="py-2.5 px-3 text-neutral-400">
                      {(track.sampleRateHz / 1000).toFixed(1)} kHz
                    </td>

                    <td className="py-2.5 px-3 text-neutral-300 uppercase font-bold">
                      {track.language}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {track.isDefault ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                          PRIMARY
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[10px]">SECONDARY</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MASTER MULTIVARIANT MANIFEST */}
      {activeTab === 'master_playlist' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-200">
                GENERATED MASTER MULTIVARIANT PLAYLIST (master.m3u8)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                RFC 8216 HLS v7
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(generateMasterHlsPlaylist(), 'master_m3u8')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {copiedKey === 'master_m3u8' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Master Playlist</span>
            </button>
          </div>

          <pre className="bg-neutral-950 p-3.5 rounded border border-neutral-800 text-[11px] text-emerald-300 overflow-x-auto whitespace-pre font-mono leading-relaxed max-h-80">
            {generateMasterHlsPlaylist()}
          </pre>

          <div className="text-[11px] text-neutral-400 flex items-center justify-between bg-neutral-900/40 p-2 rounded border border-neutral-800">
            <span>
              Direct Stream URL: <strong className="text-white">{hlsEgress.masterPlaylistUrl}</strong>
            </span>
            <span className="text-emerald-400 font-bold">HTTPS PORT {httpsSslConfig.port} ACTIVE</span>
          </div>
        </div>
      )}

      {/* TAB 4: FFMPEG ABR ENCODING COMMAND PIPELINE */}
      {activeTab === 'ffmpeg_pipeline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">
              PRODUCTION MULTI-RENDITION FFMPEG ENCODING COMMAND
            </span>
            <button
              onClick={() => copyToClipboard(generateFfmpegAbrCommand(), 'ffmpeg_abr')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold"
            >
              {copiedKey === 'ffmpeg_abr' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy FFmpeg Filter Complex</span>
            </button>
          </div>

          <pre className="bg-neutral-950 p-3.5 rounded border border-neutral-800 text-[10px] text-sky-300 overflow-x-auto whitespace-pre font-mono max-h-80 leading-relaxed">
            {generateFfmpegAbrCommand()}
          </pre>
        </div>
      )}
    </div>
  );
};
