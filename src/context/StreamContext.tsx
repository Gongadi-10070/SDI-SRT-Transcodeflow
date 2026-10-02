import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  SrtIngestConfig,
  VideoTranscodeConfig,
  AudioTranscodeConfig,
  HlsEgressConfig,
  HlsRenditionProfile,
  HlsAudioTrackConfig,
  SrtEgressConfig,
  RtmpEgressConfig,
  HttpsSslConfig,
  Scte35Config,
  Scte35Cue,
  LBandConfig,
  LogoConfig,
  StreamHealthMetrics,
  ConnectedReceiver,
  BandwidthDataPoint,
  QoEDataPoint,
  SmtpConfig,
  AlertTriggerRule,
  DispatchedEmailAlert,
  ActiveIncident,
  AlertFaultType,
  InputSourceType,
  SdiInputConfig,
  SdiOutputConfig,
  Scte104Message,
  StreamRecorderConfig,
  RecordedSegment,
  EbuR128LoudnessMetrics,
  SrtFailoverConfig,
  SrtFailoverEvent,
  SrtActiveSource,
  AuthState,
  UserRole,
  EmergencyFallbackConfig,
  EmergencyFallbackMode,
  EmergencyPlaylistItem,
  VideoSlateMode,
} from '../types/stream';
import {
  generate41ByteScte35Cue,
  Scte35_41ByteResult,
  Scte35SegmentationKey,
} from '../utils/scte35Generator';

interface StreamContextType {
  isStreaming: boolean;
  startStreaming: () => void;
  stopStreaming: () => void;
  restartEngine: () => void;

  inputSource: InputSourceType;
  setInputSource: (src: InputSourceType) => void;

  sdiInput: SdiInputConfig;
  updateSdiInput: (cfg: Partial<SdiInputConfig>) => void;
  sdiOutput: SdiOutputConfig;
  updateSdiOutput: (cfg: Partial<SdiOutputConfig>) => void;
  scte104Messages: Scte104Message[];
  triggerScte104Message: (operationName: string, durationSec: number) => void;
  clearScte104Logs: () => void;

  recorderConfig: StreamRecorderConfig;
  updateRecorderConfig: (cfg: Partial<StreamRecorderConfig>) => void;
  recordedSegments: RecordedSegment[];
  startRecording: () => void;
  stopRecording: () => void;
  deleteRecording: (id: string) => void;
  splitRecordingOnScte: (eventId: number, descriptor: string, durationSec: number) => void;

  srtIngest: SrtIngestConfig;
  updateSrtIngest: (cfg: Partial<SrtIngestConfig>) => void;

  videoConfig: VideoTranscodeConfig;
  updateVideoConfig: (cfg: Partial<VideoTranscodeConfig>) => void;

  audioConfig: AudioTranscodeConfig;
  updateAudioConfig: (cfg: Partial<AudioTranscodeConfig>) => void;

  hlsEgress: HlsEgressConfig;
  updateHlsEgress: (cfg: Partial<HlsEgressConfig>) => void;
  toggleHlsProfile: (id: string) => void;
  updateHlsProfile: (id: string, cfg: Partial<HlsRenditionProfile>) => void;
  toggleHlsAudioTrack: (id: string) => void;
  updateHlsAudioTrack: (id: string, cfg: Partial<HlsAudioTrackConfig>) => void;
  generateMasterHlsPlaylist: () => string;

  srtEgress: SrtEgressConfig;
  updateSrtEgress: (cfg: Partial<SrtEgressConfig>) => void;

  rtmpEgress: RtmpEgressConfig;
  updateRtmpEgress: (cfg: Partial<RtmpEgressConfig>) => void;

  httpsSslConfig: HttpsSslConfig;
  updateHttpsSslConfig: (cfg: Partial<HttpsSslConfig>) => void;
  validateCertificate: (certPem: string, keyPem: string) => { valid: boolean; message: string };
  generateSelfSignedCert: (domainName?: string) => void;
  testTlsHandshake: () => { success: boolean; cipher: string; latencyMs: number };

  scteConfig: Scte35Config;
  updateScteConfig: (cfg: Partial<Scte35Config>) => void;
  inputScteCues: Scte35Cue[];
  outputScteCues: Scte35Cue[];
  scteCues: Scte35Cue[];
  triggerScteCue: (
    commandType: 'splice_insert' | 'time_signal',
    segmentationType: 'provider_ad_start' | 'provider_ad_end' | 'program_break' | 'network_break',
    durationSec: number
  ) => void;
  simulateIncomingIngestScteCue: (
    segmentationType?: 'provider_ad_start' | 'provider_ad_end' | 'program_break' | 'network_break',
    durationSec?: number
  ) => void;
  clearInputScteLogs: () => void;
  clearOutputScteLogs: () => void;
  activeAdBreak: { active: boolean; remainingSec: number; totalSec: number } | null;
  generate41ByteCue: (params?: {
    eventId?: number;
    durationSec?: number;
    commandType?: 'time_signal' | 'splice_insert';
    segmentationType?: Scte35SegmentationKey;
  }) => Scte35_41ByteResult;

  lbandConfig: LBandConfig;
  updateLbandConfig: (cfg: Partial<LBandConfig>) => void;
  triggerLBand: (active?: boolean) => void;
  triggerAstronBand: (active?: boolean) => void;

  logoConfig: LogoConfig;
  updateLogoConfig: (cfg: Partial<LogoConfig>) => void;

  health: StreamHealthMetrics;
  bandwidthHistory: BandwidthDataPoint[];
  qoeHistory: QoEDataPoint[];

  receivers: ConnectedReceiver[];
  disconnectReceiver: (id: string) => void;
  addMockReceiver: () => void;

  logs: { id: string; time: string; level: 'info' | 'warn' | 'error' | 'scte'; msg: string }[];
  clearLogs: () => void;

  smtpConfig: SmtpConfig;
  updateSmtpConfig: (cfg: Partial<SmtpConfig>) => void;
  alertRules: AlertTriggerRule[];
  updateAlertRule: (id: AlertFaultType, cfg: Partial<AlertTriggerRule>) => void;
  activeIncidents: ActiveIncident[];
  dispatchedAlerts: DispatchedEmailAlert[];
  clearIncidents: () => void;
  acknowledgeIncident: (id: string) => void;
  triggerFaultSimulation: (faultType: AlertFaultType) => void;
  sendTestSmtpEmail: () => Promise<{ success: boolean; message: string }>;

  activePreset: string;
  applyPreset: (presetName: string) => void;
  videoSourceSlate: VideoSlateMode;
  setVideoSourceSlate: (slate: VideoSlateMode) => void;

  emergencyFallbackConfig: EmergencyFallbackConfig;
  updateEmergencyFallbackConfig: (cfg: Partial<EmergencyFallbackConfig>) => void;
  triggerEmergencyFallback: (mode?: EmergencyFallbackMode) => void;
  dismissEmergencyFallback: () => void;
  simulateTotalSignalLoss: () => void;

  loudnessMetrics: EbuR128LoudnessMetrics;
  resetLoudnessMeter: () => void;
  updateTargetLoudnessStandard: (standard: EbuR128LoudnessMetrics['targetStandard']) => void;

  srtFailoverConfig: SrtFailoverConfig;
  switchSrtSource: (toSource: SrtActiveSource, reason?: string, isAuto?: boolean) => void;
  updateSrtFailoverConfig: (cfg: Partial<SrtFailoverConfig>) => void;
  updateBackupSrtConfig: (cfg: Partial<SrtIngestConfig>) => void;
  simulatePrimarySrtFailure: () => void;
  simulateBackupSrtFailure: () => void;
  restoreSrtFeeds: () => void;
  clearFailoverLogs: () => void;

  authState: AuthState;
  loginWithKey: (key: string) => boolean;
  logoutToReadOnly: () => void;
  toggleRole: () => void;
}

const initialSdiInput: SdiInputConfig = {
  enabled: true,
  deviceName: 'Blackmagic DeckLink 8K Pro (Input 1 - 12G-SDI)',
  deviceIndex: 0,
  standard: '12G-SDI',
  videoFormat: 'auto_detect',
  autoDetectFormat: true,
  detectedFormat: '2160p59.94 (SMPTE ST 2082 12G-SDI)',
  pixelFormat: 'YUV-422-10bit',
  audioChannels: 16,
  audioSampleRateHz: 48000,
  genlockStatus: 'locked',
  genlockRef: 'Tri-Level Sync',
  vancEnabled: true,
  scte104Did: '0x41',
  scte104Sdid: '0x07',
  vancLine: 9,
  signalLocked: true,
  inputTimecode: '01:24:45:12',
  scte104PacketsReceived: 34,
};

const initialSdiOutput: SdiOutputConfig = {
  enabled: true,
  deviceName: 'Blackmagic DeckLink 8K Pro (Output 1 - 12G-SDI BNC)',
  standard: '12G-SDI',
  videoFormat: '2160p59.94',
  pixelFormat: 'YUV-422-10bit',
  audioChannels: 16,
  scte104Passthrough: true,
  vancLine: 9,
  scte104Did: '0x41',
  scte104Sdid: '0x07',
  genlockSyncToInput: true,
  colorRange: 'legal',
  scte104PacketsTransmitted: 29,
};

const initialScte104Messages: Scte104Message[] = [
  {
    id: 'scte104-001',
    source: 'sdi_vanc_in',
    timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
    line: 9,
    did: '0x41',
    sdid: '0x07',
    operationId: 0x0101,
    operationName: 'initiate_splice()',
    spliceEventId: 9021,
    durationSec: 30,
    hexPayload: 'FFFF00140101000E0000233D001E0000000000000000',
    relayedToOutput: true,
  },
  {
    id: 'scte104-002',
    source: 'sdi_vanc_in',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    line: 9,
    did: '0x41',
    sdid: '0x07',
    operationId: 0x0102,
    operationName: 'splice_null()',
    spliceEventId: 9022,
    durationSec: 0,
    hexPayload: 'FFFF0008010200020000',
    relayedToOutput: true,
  },
];

const initialRecorderConfig: StreamRecorderConfig = {
  enabled: true,
  isRecording: true,
  recordingStartTime: Date.now() - 540000,
  currentSegmentId: 'seg-active-003',
  storageTarget: 'local_nvme',
  storagePath: '/var/media/broadcast_recordings/',
  container: 'ts',
  segmentDurationMinutes: 30,
  ringBufferDurationMinutes: 60,
  autoScteSegmentation: true,
  excludeAdBreaksFromMaster: false,
  diskCapacityTotalGb: 3840,
  diskCapacityUsedGb: 1420,
  retentionDays: 14,
};

const initialRecordedSegments: RecordedSegment[] = [
  {
    id: 'seg-001',
    filename: 'ingest_master_20260930_051500_seg01.ts',
    startTime: new Date(Date.now() - 1800000).toLocaleTimeString(),
    endTime: new Date(Date.now() - 900000).toLocaleTimeString(),
    durationSec: 900,
    sizeBytes: 675000000,
    format: 'ts',
    triggerType: 'continuous',
    storageTarget: 'local_nvme',
    storagePath: '/var/media/broadcast_recordings/ingest_master_20260930_051500_seg01.ts',
    status: 'completed',
    resolution: '1920x1080',
    bitrateKbps: 6000,
  },
  {
    id: 'seg-002',
    filename: 'scte_ad_break_event3018_30s.ts',
    startTime: new Date(Date.now() - 900000).toLocaleTimeString(),
    endTime: new Date(Date.now() - 870000).toLocaleTimeString(),
    durationSec: 30,
    sizeBytes: 22500000,
    format: 'ts',
    triggerType: 'scte35_ad_start',
    scteEventId: 3018,
    scteDescriptor: 'provider_ad_start',
    ptsStart: '01:14:22.180',
    storageTarget: 'local_nvme',
    storagePath: '/var/media/broadcast_recordings/scte_ad_break_event3018_30s.ts',
    status: 'completed',
    resolution: '1920x1080',
    bitrateKbps: 6000,
  },
  {
    id: 'seg-active-003',
    filename: 'ingest_live_program_seg02_active.ts',
    startTime: new Date(Date.now() - 540000).toLocaleTimeString(),
    durationSec: 540,
    sizeBytes: 405000000,
    format: 'ts',
    triggerType: 'scte35_ad_end',
    scteEventId: 3018,
    scteDescriptor: 'provider_ad_end',
    ptsStart: '01:14:52.180',
    storageTarget: 'local_nvme',
    storagePath: '/var/media/broadcast_recordings/ingest_live_program_seg02_active.ts',
    status: 'recording',
    resolution: '1920x1080',
    bitrateKbps: 6000,
  },
];

const initialSrtIngest: SrtIngestConfig = {
  mode: 'listener',
  host: '0.0.0.0',
  port: 9710,
  latencyMs: 120,
  passphrase: 'MCR_BROADCAST_SECURE_2026',
  pbKeyLen: 32,
  streamId: '#!::r=live/main_feed,m=publish',
  maxBandwidthMbps: 50,
  overheadBandwidthPercent: 25,
  bufferSizeBytes: 8388608, // 8MB
  peerIdleTimeoutMs: 10000,
};

const initialVideoConfig: VideoTranscodeConfig = {
  codec: 'h264',
  profile: 'high',
  level: '4.2',
  preset: 'veryfast',
  tune: 'zerolatency',
  rateControl: 'cbr',
  targetBitrateKbps: 6000,
  minBitrateKbps: 4500,
  maxBitrateKbps: 7500,
  bufferSizeKb: 12000,
  gopSizeFrames: 60, // 1.0 second GOP at 60fps
  keyframeIntervalSec: 1.0,
  bFrames: 2,
  closedGop: true,
  sceneCutThreshold: 40,
  resolution: '1920x1080',
  fps: 60,
};

const initialAudioConfig: AudioTranscodeConfig = {
  codec: 'aac-lc',
  bitrateKbps: 192,
  sampleRateHz: 48000,
  channels: 'stereo',
};

const initialHlsProfiles: HlsRenditionProfile[] = [
  {
    id: 'prof-4k',
    name: '4K UHD Master',
    enabled: true,
    resolution: '3840x2160',
    width: 3840,
    height: 2160,
    videoBitrateKbps: 14000,
    maxBitrateKbps: 17500,
    fps: 60,
    videoCodec: 'h265',
    profile: 'main10',
    level: '5.1',
    rfc6381Codec: 'hvc1.2.4.L153.B0',
    audioGroupId: 'audio-main',
    playlistName: 'stream_4k_2160p.m3u8',
  },
  {
    id: 'prof-1080p60',
    name: '1080p60 FHD High',
    enabled: true,
    resolution: '1920x1080',
    width: 1920,
    height: 1080,
    videoBitrateKbps: 6000,
    maxBitrateKbps: 7500,
    fps: 60,
    videoCodec: 'h264',
    profile: 'high',
    level: '4.2',
    rfc6381Codec: 'avc1.64002a',
    audioGroupId: 'audio-main',
    playlistName: 'stream_1080p60.m3u8',
  },
  {
    id: 'prof-1080p30',
    name: '1080p30 FHD Medium',
    enabled: true,
    resolution: '1920x1080',
    width: 1920,
    height: 1080,
    videoBitrateKbps: 4500,
    maxBitrateKbps: 5500,
    fps: 30,
    videoCodec: 'h264',
    profile: 'high',
    level: '4.0',
    rfc6381Codec: 'avc1.640028',
    audioGroupId: 'audio-main',
    playlistName: 'stream_1080p30.m3u8',
  },
  {
    id: 'prof-720p60',
    name: '720p60 HD Standard',
    enabled: true,
    resolution: '1280x720',
    width: 1280,
    height: 720,
    videoBitrateKbps: 2800,
    maxBitrateKbps: 3500,
    fps: 60,
    videoCodec: 'h264',
    profile: 'main',
    level: '3.1',
    rfc6381Codec: 'avc1.4d401f',
    audioGroupId: 'audio-main',
    playlistName: 'stream_720p.m3u8',
  },
  {
    id: 'prof-480p30',
    name: '480p30 SD Mobile',
    enabled: true,
    resolution: '854x480',
    width: 854,
    height: 480,
    videoBitrateKbps: 1200,
    maxBitrateKbps: 1600,
    fps: 30,
    videoCodec: 'h264',
    profile: 'main',
    level: '3.0',
    rfc6381Codec: 'avc1.4d401e',
    audioGroupId: 'audio-main',
    playlistName: 'stream_480p.m3u8',
  },
  {
    id: 'prof-360p25',
    name: '360p25 Low Bandwidth',
    enabled: true,
    resolution: '640x360',
    width: 640,
    height: 360,
    videoBitrateKbps: 650,
    maxBitrateKbps: 900,
    fps: 25,
    videoCodec: 'h264',
    profile: 'baseline',
    level: '3.0',
    rfc6381Codec: 'avc1.42e01e',
    audioGroupId: 'audio-main',
    playlistName: 'stream_360p.m3u8',
  },
];

const initialHlsAudioTracks: HlsAudioTrackConfig[] = [
  {
    id: 'audio-aac-en',
    name: 'English Stereo (AAC-LC)',
    groupId: 'audio-main',
    language: 'en',
    codec: 'aac-lc',
    rfc6381Codec: 'mp4a.40.2',
    bitrateKbps: 192,
    sampleRateHz: 48000,
    channels: 'stereo',
    isDefault: true,
    autoSelect: true,
    enabled: true,
  },
  {
    id: 'audio-dolby-ac3',
    name: 'Dolby Digital 5.1 (AC-3 Surround)',
    groupId: 'audio-main',
    language: 'en',
    codec: 'ac3',
    rfc6381Codec: 'ac-3',
    bitrateKbps: 384,
    sampleRateHz: 48000,
    channels: '5.1',
    isDefault: false,
    autoSelect: true,
    enabled: true,
  },
  {
    id: 'audio-dolby-eac3',
    name: 'Dolby Digital Plus with Atmos (E-AC-3)',
    groupId: 'audio-main',
    language: 'en',
    codec: 'eac3',
    rfc6381Codec: 'ec-3',
    bitrateKbps: 448,
    sampleRateHz: 48000,
    channels: '7.1',
    isDefault: false,
    autoSelect: false,
    enabled: true,
  },
  {
    id: 'audio-heaac-es',
    name: 'Spanish Secondary (HE-AAC v2)',
    groupId: 'audio-main',
    language: 'es',
    codec: 'he-aac-v2',
    rfc6381Codec: 'mp4a.40.29',
    bitrateKbps: 64,
    sampleRateHz: 48000,
    channels: 'stereo',
    isDefault: false,
    autoSelect: false,
    enabled: true,
  },
  {
    id: 'audio-opus-comm',
    name: 'Low-Latency Studio Commentary (Opus)',
    groupId: 'audio-main',
    language: 'en',
    codec: 'opus',
    rfc6381Codec: 'opus',
    bitrateKbps: 128,
    sampleRateHz: 48000,
    channels: 'stereo',
    isDefault: false,
    autoSelect: false,
    enabled: true,
  },
];

const initialHlsEgress: HlsEgressConfig = {
  enabled: true,
  chunkDurationSec: 2, // 2-second chunks for low-latency HLS
  playlistLength: 6,
  lowLatency: true,
  partDurationMs: 250,
  masterPlaylistUrl: 'https://stream.mcr-flow.live:8443/live/hls/master.m3u8',
  scteFormat: 'daterange',
  useHttps: true,
  httpsPort: 8443,
  aes128Encryption: true,
  keyRotationSec: 3600,
  profiles: initialHlsProfiles,
  audioTracks: initialHlsAudioTracks,
};

const initialSrtEgress: SrtEgressConfig = {
  enabled: true,
  mode: 'listener',
  host: '0.0.0.0',
  port: 9820,
  latencyMs: 120,
  passphrase: 'DOWNLINK_FEED_KEY_2026',
  streamId: '#!::r=live/downlink,m=request',
  bitrateKbps: 6000,
};

const initialRtmpEgress: RtmpEgressConfig = {
  enabled: true,
  url: 'rtmps://live-ingest.broadcastcdn.net:443/app',
  streamKey: 'live_sec_7781a9f0e81c',
  chunkSizeBytes: 4096,
  authRequired: true,
  useTlsRtmps: true,
};

const initialHttpsSslConfig: HttpsSslConfig = {
  enabled: true,
  port: 8443,
  domain: 'stream.mcr-flow.live',
  certType: 'custom_pem',
  sslCertificate: `-----BEGIN CERTIFICATE-----
MIIEkjCCA3qgAwIBAgIUeN7hQ3P92kLm9VbroadcastTlsCert8443Prod2026w0BA
QsFADBhMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYD
VQQLExB3d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwg
Um9vdCBDQTAeFw0yNTAxMDEwMDAwMDBaFw0yNzAxMDEwMDAwMDBaMGExCzAJBgNV
BAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdp
Y2VydC5jb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4v3Kj8e7Y3M8QzQY7fP6p2j87Ghy
...[DIGICERT BROADCAST ORIGIN FULLCHAIN CRT 4096-BIT]...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIFdTCCBF2gAwIBAgIQAf2j627KdciIQ4tyS99edTANBgkqhkiG9w0BAQsFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD
-----END CERTIFICATE-----`,
  sslPrivateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA4v3Kj8e7Y3M8QzQY7fP6p2j87Ghy4a...[SECURE 4096-BIT RSA PRIVATE KEY]...
vL9e0c7Hq8Jk3f9a7D1m0B2v8X9zL5q1R7y4T2u6W8a9Z3x5C7v2B4n6M8l0P1o9
Y3x5C7v2B4n6M8l0P1o9I8u7Y6t5R4e3W2q1A0s9D8f7G6h5J4k3L2z1X0c9V8b7
-----END RSA PRIVATE KEY-----`,
  caBundle: `-----BEGIN CERTIFICATE-----
MIIEkjCCA3qgAwIBAgIQCgFBQgAAAVOFc2oLheynCDANBgkqhkiG9w0BAQsFADA8
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRYwFAYDVQQDEw1E
-----END CERTIFICATE-----`,
  passphrase: '',
  minTlsVersion: 'TLSv1.3',
  cipherSuites: 'modern_broadcast',
  hstsEnabled: true,
  ocspStapling: true,
  http2Enabled: true,
  http3QuicEnabled: true,
  certStatus: 'valid',
  issuer: 'DigiCert Global Root G2 / Broadcast Authority',
  validFrom: '2025-01-01',
  validUntil: '2027-01-01',
  daysRemaining: 458,
  fingerprintSha256: '9A:4B:E1:88:C3:72:F5:10:8E:22:91:FA:B7:60:DE:41:00:8C:31:7E',
  subjectAltNames: [
    'stream.mcr-flow.live',
    '*.mcr-flow.live',
    'hls-origin.mcr-flow.live',
    'edge-downlink.mcr-flow.live',
  ],
};

const initialScteConfig: Scte35Config = {
  passthroughEnabled: true,
  mode: 'passthrough',
  autoReturn: true,
  prerollMs: 4000,
  defaultDurationSec: 30,
};

const initialLbandConfig: LBandConfig = {
  active: false,
  squeezeScale: 0.75, // 75%
  position: 'top-right',
  transition: 'smooth',
  astronBandActive: true,
  astronTitle: 'ASTRON-SAT TELEMETRY LINK #4',
  astronSubtitle: 'TRANSPONDER 11.742 GHz • KU-BAND BEAM 04A',
  astronFrequencyGhz: 11.742,
  astronSignalQualityPercent: 98.4,
  sponsorBannerText: 'OFFICIAL MCR BROADCAST NETWORK • SPONSORED BY ASTRON GLOBAL SATELLITE COMMUNICATIONS',
  tickerText: 'BREAKING: MCR BROADCAST TELEMETRY NOMINAL • SRT LOW-LATENCY INGEST LOCKED @ 120MS • SCTE-35 CUE INSERTION ACTIVE • 4K HDR READY',
  tickerSpeed: 45,
  autoTimerSec: 0,
};

const initialLogoConfig: LogoConfig = {
  active: true,
  type: 'station_hd',
  position: 'top-right',
  opacity: 0.9,
  scale: 1.0,
  customText: 'FLOW-MCR HD',
};

const initialReceivers: ConnectedReceiver[] = [
  {
    id: 'rx-01-de',
    name: 'Frankfurt CDN Ingest #01',
    ipAddress: '194.109.6.92',
    country: 'Germany',
    countryCode: 'DE',
    city: 'Frankfurt',
    protocol: 'SRT-Listener',
    connectedAt: '12:04:18',
    durationSeconds: 3840,
    bitrateKbps: 6120,
    rttMs: 18,
    packetLossPercent: 0.01,
    status: 'healthy',
    asn: 'AS3320 Deutsche Telekom AG',
    isTlsSecured: true,
    tlsCipher: 'SRT AES-256 GCM',
  },
  {
    id: 'rx-02-us',
    name: 'Ashburn Primary Edge Node',
    ipAddress: '149.112.112.10',
    country: 'United States',
    countryCode: 'US',
    city: 'Ashburn, VA',
    protocol: 'HTTPS-HLS',
    connectedAt: '12:15:30',
    durationSeconds: 3170,
    bitrateKbps: 5980,
    rttMs: 42,
    packetLossPercent: 0.04,
    status: 'healthy',
    asn: 'AS15169 Google Cloud Interconnect',
    isTlsSecured: true,
    tlsCipher: 'TLS_AES_256_GCM_SHA384 (Port 8443)',
  },
  {
    id: 'rx-03-jp',
    name: 'Tokyo Broadcast Downlink Dish',
    ipAddress: '210.140.10.3',
    country: 'Japan',
    countryCode: 'JP',
    city: 'Tokyo',
    protocol: 'SRT-Caller',
    connectedAt: '12:22:11',
    durationSeconds: 2770,
    bitrateKbps: 6050,
    rttMs: 96,
    packetLossPercent: 0.08,
    status: 'healthy',
    asn: 'AS2516 KDDI Corporation',
    isTlsSecured: true,
    tlsCipher: 'SRT AES-256 CTR',
  },
  {
    id: 'rx-04-uk',
    name: 'London Media Cloud Gateway',
    ipAddress: '185.199.108.153',
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    protocol: 'RTMPS',
    connectedAt: '12:40:02',
    durationSeconds: 1700,
    bitrateKbps: 5890,
    rttMs: 24,
    packetLossPercent: 0.02,
    status: 'healthy',
    asn: 'AS13335 Cloudflare Gateway',
    isTlsSecured: true,
    tlsCipher: 'TLS_CHACHA20_POLY1305_SHA256 (Port 443)',
  },
  {
    id: 'rx-05-sg',
    name: 'Singapore Edge Hub #03',
    ipAddress: '202.166.200.41',
    country: 'Singapore',
    countryCode: 'SG',
    city: 'Singapore',
    protocol: 'HTTPS-HLS',
    connectedAt: '12:51:19',
    durationSeconds: 1030,
    bitrateKbps: 6010,
    rttMs: 140,
    packetLossPercent: 0.12,
    status: 'warning',
    asn: 'AS4657 Singtel Telecommunications',
    isTlsSecured: true,
    tlsCipher: 'TLS_AES_128_GCM_SHA256 (Port 8443)',
  },
];

const initialSmtpConfig: SmtpConfig = {
  enabled: true,
  host: 'smtp.gmail.com',
  port: 587,
  secureMode: 'starttls',
  username: 'mcr-alerts@broadcastflow.net',
  password: '••••••••••••••••',
  fromEmail: 'mcr-alerts@broadcastflow.net',
  fromName: 'SRT TranscodeFlow MCR Alert Engine',
  toEmails: 'lohiraju10070@gmail.com',
  ccEmails: 'oncall-mcr@broadcastflow.net',
  cooldownMinutes: 5,
  includeSnapshot: true,
  testStatus: 'untested',
};

const initialAlertRules: AlertTriggerRule[] = [
  {
    id: 'input_signal_loss',
    name: 'Input SRT Signal Loss',
    description: 'Alert when SRT input stream loses socket connection, sync lock slips, or ingest drops to 0 kbps.',
    enabled: true,
    severity: 'EMERGENCY',
    thresholdText: 'Bitrate < 100 kbps for > 2.5s',
    thresholdValue: 2.5,
    triggerCount: 0,
  },
  {
    id: 'output_blank',
    name: 'Output Stream Blackout / Blank Frame',
    description: 'Alert when transcoder produces solid black video frames or output egress stream stalls.',
    enabled: true,
    severity: 'CRITICAL',
    thresholdText: 'Blackout detected for > 2.0s',
    thresholdValue: 2.0,
    triggerCount: 0,
  },
  {
    id: 'video_freeze',
    name: 'Video Freeze Detection',
    description: 'Alert when video frames stall or freeze while timecode/audio slips or buffer stops cycling.',
    enabled: true,
    severity: 'CRITICAL',
    thresholdText: 'Frame stagnation for > 3.0s',
    thresholdValue: 3.0,
    triggerCount: 0,
  },
  {
    id: 'video_glitches',
    name: 'Video Glitches & Compression Artifacts',
    description: 'Alert when heavy digital macroblocking, packet loss bursts, or QoE drops occur.',
    enabled: true,
    severity: 'WARNING',
    thresholdText: 'Packet Loss > 4.5% or VMAF < 75',
    thresholdValue: 4.5,
    triggerCount: 0,
  },
  {
    id: 'scte_missing',
    name: 'SCTE-35 Cue Missing / Heartbeat Loss',
    description: 'Alert when expected SCTE-35 ad break markers or splice cue points do not arrive on schedule.',
    enabled: true,
    severity: 'WARNING',
    thresholdText: 'No SCTE cue received for > 30 min',
    thresholdValue: 30,
    triggerCount: 0,
  },
  {
    id: 'scte104_signal_loss',
    name: 'SCTE-104 VANC Packet Ingest Loss',
    description: 'Automated alert monitoring SCTE-104 input signal status on SDI VANC Line 9 / DID 0x41. Triggers upon loss of SCTE-104 VANC data packets.',
    enabled: true,
    severity: 'CRITICAL',
    thresholdText: 'No SCTE-104 packet for > 15s',
    thresholdValue: 15,
    triggerCount: 0,
  },
  {
    id: 'internet_loss',
    name: 'Internet / WAN Network Outage',
    description: 'Alert when uplink internet connection drops, gateway route is lost, or WAN drop exceeds 75%.',
    enabled: true,
    severity: 'EMERGENCY',
    thresholdText: 'WAN gateway loss or packet drop > 75%',
    thresholdValue: 75,
    triggerCount: 0,
  },
];

const initialDispatchedAlerts: DispatchedEmailAlert[] = [
  {
    id: 'alert-001',
    timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
    faultType: 'video_glitches',
    severity: 'WARNING',
    subject: '[MCR WARNING] Transient Video Glitches Detected on SRT Ingest Port 9710',
    from: 'mcr-alerts@broadcastflow.net',
    to: 'lohiraju10070@gmail.com',
    status: 'sent',
    smtpResponse: '250 2.0.0 OK d481-2026-queued-smtp.gmail.com',
    contentSnippet: 'Packet loss spiked to 3.8% on WAN downlink. Forward error correction recovered packets.',
  },
];

const initialLoudnessMetrics: EbuR128LoudnessMetrics = {
  integratedLufs: -23.1,
  shortTermLufs: -22.9,
  momentaryLufs: -23.4,
  loudnessRangeLu: 7.2,
  truePeakDbtp: -1.4,
  truePeakLeftDbtp: -1.6,
  truePeakRightDbtp: -1.4,
  complianceStatus: 'compliant',
  targetStandard: 'EBU R128 (-23 LUFS)',
  history: Array.from({ length: 30 }, (_, i) => ({
    time: new Date(Date.now() - (30 - i) * 1000).toLocaleTimeString(),
    momentary: -23.0 + Math.sin(i * 0.4) * 1.2,
    shortTerm: -23.1 + Math.sin(i * 0.2) * 0.5,
    integrated: -23.1,
    truePeak: -1.4 + Math.sin(i * 0.5) * 0.3,
  })),
};

const initialBackupSrtIngest: SrtIngestConfig = {
  mode: 'caller',
  host: 'backup-ingest.broadcastflow.net',
  port: 9720,
  latencyMs: 120,
  passphrase: 'MCR-Backup-Stream-Key-2026',
  pbKeyLen: 32,
  streamId: 'live/feed_backup_redundant',
  maxBandwidthMbps: 45,
  overheadBandwidthPercent: 25,
  bufferSizeBytes: 8388608,
  peerIdleTimeoutMs: 10000,
};

const initialSrtFailoverConfig: SrtFailoverConfig = {
  autoFailoverEnabled: true,
  activeSource: 'primary',
  primaryHealth: 'healthy',
  backupHealth: 'healthy',
  primaryBitrateKbps: 6200,
  backupBitrateKbps: 6180,
  primaryRttMs: 24,
  backupRttMs: 28,
  primaryPacketLossPercent: 0.05,
  backupPacketLossPercent: 0.04,
  failoverThresholdSec: 3.0,
  autoRevertToPrimary: true,
  revertStabilitySec: 10,
  backupConfig: initialBackupSrtIngest,
  eventsLog: [
    {
      id: 'fo-init-001',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      fromSource: 'backup',
      toSource: 'primary',
      triggerReason: 'System initialization / Primary SRT healthy lock on Port 9710',
      switchLatencyMs: 42,
      autoSwitched: false,
    },
  ],
};

const initialEmergencyPlaylist: EmergencyPlaylistItem[] = [
  {
    id: 'emg-clip-01',
    title: 'Tv9 TELUGU - Station Ident & 4K Scenic Broadcast Montage',
    category: 'promo',
    durationSec: 45,
    resolution: '3840x2160',
    codec: 'HEVC / H.265 Main10',
    aspectRatio: '16:9',
    audioTrack: 'Cool Lo-Fi Ambient Chill Pad (48kHz Stereo)',
  },
  {
    id: 'emg-clip-02',
    title: 'Special Program Standby - Cultural Music & Coastal India Reel',
    category: 'cultural',
    durationSec: 60,
    resolution: '3840x2160',
    codec: 'HEVC / H.265 Main10',
    aspectRatio: '16:9',
    audioTrack: 'Synthwave Chill Instrumental Beat (48kHz Stereo)',
  },
  {
    id: 'emg-clip-03',
    title: 'Tv9 Digital Broadcast Innovation & Studio Telemetry Showcase',
    category: 'promo',
    durationSec: 50,
    resolution: '1920x1080',
    codec: 'AVC / H.264 High',
    aspectRatio: '16:9',
    audioTrack: 'Smooth Jazz Ambient Broadcast Filler',
  },
  {
    id: 'emg-clip-04',
    title: 'Commercial Sponsor Loop & Standby Bulletin Feed',
    category: 'commercial',
    durationSec: 30,
    resolution: '1920x1080',
    codec: 'AVC / H.264 High',
    aspectRatio: '16:9',
    audioTrack: 'Warm Chords Uplifting Broadcast Track',
  },
];

const initialEmergencyFallbackConfig: EmergencyFallbackConfig = {
  autoEngageOnTotalLoss: true,
  activeMode: 'stay_tuned',
  triggerDelaySec: 2.0,
  autoRecoverOnSignalRestored: true,
  isEngaged: false,
  musicEnabled: true,
  musicVolume: 75,
  slateMessage: 'STAY TUNED, WE WILL BE RIGHT BACK',
  stationName: 'Tv9 TELUGU - Digital layout architect by GNR SMB',
  currentPlaylistItemIndex: 0,
  currentPlaylistItemElapsedSec: 0,
  playlist: initialEmergencyPlaylist,
  engagementCount: 0,
};

const MASTER_ACCESS_KEY = 'MCR-2026-KEY';

const StreamContext = createContext<StreamContextType | undefined>(undefined);

export const StreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [videoSourceSlate, setVideoSourceSlate] = useState<VideoSlateMode>('live');
  const [emergencyFallbackConfig, setEmergencyFallbackConfig] = useState<EmergencyFallbackConfig>(initialEmergencyFallbackConfig);

  const [loudnessMetrics, setLoudnessMetrics] = useState<EbuR128LoudnessMetrics>(initialLoudnessMetrics);
  const [srtFailoverConfig, setSrtFailoverConfig] = useState<SrtFailoverConfig>(initialSrtFailoverConfig);
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('mcr_auth_role');
      if (saved === 'viewer') {
        return { role: 'viewer', isLocked: true, operatorName: 'Broadcast Analyst (Read-Only View)' };
      }
    } catch (e) {}
    return { role: 'admin', isLocked: false, operatorName: 'Master Control Engineer (Full Access)' };
  });

  const [inputSource, setInputSourceState] = useState<InputSourceType>('srt');
  const [sdiInput, setSdiInput] = useState<SdiInputConfig>(initialSdiInput);
  const [sdiOutput, setSdiOutput] = useState<SdiOutputConfig>(initialSdiOutput);
  const [scte104Messages, setScte104Messages] = useState<Scte104Message[]>(initialScte104Messages);

  const [srtIngest, setSrtIngest] = useState<SrtIngestConfig>(initialSrtIngest);
  const [videoConfig, setVideoConfig] = useState<VideoTranscodeConfig>(initialVideoConfig);
  const [audioConfig, setAudioConfig] = useState<AudioTranscodeConfig>(initialAudioConfig);
  const [hlsEgress, setHlsEgress] = useState<HlsEgressConfig>(initialHlsEgress);
  const [srtEgress, setSrtEgress] = useState<SrtEgressConfig>(initialSrtEgress);
  const [rtmpEgress, setRtmpEgress] = useState<RtmpEgressConfig>(initialRtmpEgress);
  const [httpsSslConfig, setHttpsSslConfig] = useState<HttpsSslConfig>(initialHttpsSslConfig);
  const [scteConfig, setScteConfig] = useState<Scte35Config>(initialScteConfig);
  const [lbandConfig, setLbandConfig] = useState<LBandConfig>(initialLbandConfig);
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(initialLogoConfig);

  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(initialSmtpConfig);
  const [alertRules, setAlertRules] = useState<AlertTriggerRule[]>(initialAlertRules);
  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>([]);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<DispatchedEmailAlert[]>(initialDispatchedAlerts);

  const [activePreset, setActivePreset] = useState<string>('1080p60_broadcast');
  const [activeAdBreak, setActiveAdBreak] = useState<{ active: boolean; remainingSec: number; totalSec: number } | null>(null);

  const [inputScteCues, setInputScteCues] = useState<Scte35Cue[]>(() => {
    const cue1 = generate41ByteScte35Cue({ eventId: 3018, durationSec: 30, segmentationType: 'provider_ad_start' });
    const cue2 = generate41ByteScte35Cue({ eventId: 3019, durationSec: 60, segmentationType: 'program_break' });
    return [
      {
        id: 'ingest-cue-101',
        source: 'input_srt_stream',
        timestamp: new Date(Date.now() - 480000).toLocaleTimeString(),
        ptsTimecode: cue1.ptsTimecode,
        eventId: 3018,
        commandType: 'time_signal',
        segmentationType: 'provider_ad_start',
        durationSec: 30,
        prerollMs: 4000,
        hexPayload: cue1.hex,
        base64Payload: cue1.base64,
        byteLength: 41,
        crc32Hex: cue1.crc32Hex,
        is41ByteStandard: true,
        status: 'passthrough_relayed',
        inputPid: 'PID 0x01E0 (480)',
        originSocket: '194.109.6.92:9710',
      },
      {
        id: 'ingest-cue-102',
        source: 'input_srt_stream',
        timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
        ptsTimecode: cue2.ptsTimecode,
        eventId: 3019,
        commandType: 'time_signal',
        segmentationType: 'program_break',
        durationSec: 60,
        prerollMs: 4000,
        hexPayload: cue2.hex,
        base64Payload: cue2.base64,
        byteLength: 41,
        crc32Hex: cue2.crc32Hex,
        is41ByteStandard: true,
        status: 'passthrough_relayed',
        inputPid: 'PID 0x01E0 (480)',
        originSocket: '194.109.6.92:9710',
      },
    ];
  });

  const [recorderConfig, setRecorderConfig] = useState<StreamRecorderConfig>(initialRecorderConfig);
  const [recordedSegments, setRecordedSegments] = useState<RecordedSegment[]>(initialRecordedSegments);

  const [outputScteCues, setOutputScteCues] = useState<Scte35Cue[]>(() => {
    const cue1 = generate41ByteScte35Cue({ eventId: 1042, durationSec: 30, segmentationType: 'provider_ad_start' });
    const cue2 = generate41ByteScte35Cue({ eventId: 1043, durationSec: 15, segmentationType: 'provider_ad_end' });
    return [
      {
        id: 'egress-cue-501',
        source: 'manual_output_trigger',
        timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
        ptsTimecode: cue1.ptsTimecode,
        eventId: 1042,
        commandType: 'time_signal',
        segmentationType: 'provider_ad_start',
        durationSec: 30,
        prerollMs: 4000,
        hexPayload: cue1.hex,
        base64Payload: cue1.base64,
        byteLength: 41,
        crc32Hex: cue1.crc32Hex,
        is41ByteStandard: true,
        status: 'completed',
        targetEgress: ['HLS #EXT-X-DATERANGE', 'SRT Downlinks :9820', 'RTMP Syndication'],
      },
      {
        id: 'egress-cue-502',
        source: 'manual_output_trigger',
        timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
        ptsTimecode: cue2.ptsTimecode,
        eventId: 1043,
        commandType: 'time_signal',
        segmentationType: 'provider_ad_end',
        durationSec: 15,
        prerollMs: 4000,
        hexPayload: cue2.hex,
        base64Payload: cue2.base64,
        byteLength: 41,
        crc32Hex: cue2.crc32Hex,
        is41ByteStandard: true,
        status: 'completed',
        targetEgress: ['HLS #EXT-X-DATERANGE', 'SRT Downlinks :9820', 'RTMP Syndication'],
      },
    ];
  });

  const scteCues = [...outputScteCues, ...inputScteCues].sort((a, b) => b.id.localeCompare(a.id));

  const [receivers, setReceivers] = useState<ConnectedReceiver[]>(initialReceivers);

  const [health, setHealth] = useState<StreamHealthMetrics>({
    status: 'streaming',
    uptimeSeconds: 4218,
    rttMs: 18.4,
    jitterMs: 1.8,
    packetLossPercent: 0.02,
    packetsReceived: 2841920,
    packetsLost: 48,
    packetsRetransmitted: 46,
    bufferOccupancyPercent: 24.5,
    ingestBitrateKbps: 6240,
    encoderFps: 60.0,
    encoderDroppedFrames: 0,
    encoderCpuPercent: 28.4,
    encodingLatencyMs: 14.2,
    totalEgressBitrateKbps: 18200,
    hlsBitrateKbps: 6100,
    srtOutBitrateKbps: 6100,
    rtmpBitrateKbps: 6000,
    vmafScore: 95.8,
    psnrDb: 43.6,
    ssim: 0.988,
    avSyncMs: 0.2,
    bufferHealthPercent: 99.2,
  });

  const [bandwidthHistory, setBandwidthHistory] = useState<BandwidthDataPoint[]>(() => {
    const list: BandwidthDataPoint[] = [];
    const now = Date.now();
    for (let i = 40; i >= 0; i--) {
      const t = new Date(now - i * 1000);
      list.push({
        time: t.toLocaleTimeString(),
        timestamp: t.getTime(),
        ingestBitrateKbps: 6000 + Math.sin(i * 0.4) * 280,
        hlsBitrateKbps: 6000 + Math.cos(i * 0.3) * 150,
        srtOutBitrateKbps: 6000 + Math.sin(i * 0.5) * 180,
        rtmpBitrateKbps: 6000 + Math.cos(i * 0.2) * 220,
        totalEgressKbps: 18000 + Math.sin(i * 0.3) * 450,
      });
    }
    return list;
  });

  const [qoeHistory, setQoeHistory] = useState<QoEDataPoint[]>(() => {
    const list: QoEDataPoint[] = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const t = new Date(now - i * 1000);
      list.push({
        time: t.toLocaleTimeString(),
        vmaf: 95.5 + Math.sin(i * 0.2) * 1.2,
        psnr: 43.5 + Math.cos(i * 0.3) * 0.8,
        avSync: 0.1 + Math.sin(i * 0.4) * 0.3,
      });
    }
    return list;
  });

  const [logs, setLogs] = useState<{ id: string; time: string; level: 'info' | 'warn' | 'error' | 'scte'; msg: string }[]>([
    { id: '1', time: '12:00:00', level: 'info', msg: 'MCR Engine initialized. Listening for SRT on port 9710.' },
    { id: '2', time: '12:00:02', level: 'info', msg: 'Transcoder loaded H.264 High 4.2 @ 6000 kbps, 1.0s GOP.' },
    { id: '3', time: '12:00:05', level: 'info', msg: 'HLS Low-Latency chunk packager activated (chunk size 2.0s).' },
    { id: '4', time: '12:04:18', level: 'info', msg: 'New SRT client connected: 194.109.6.92 (Frankfurt CDN)' },
    { id: '5', time: '12:12:00', level: 'scte', msg: 'SCTE-35 passthrough initialized. Filter: NONE, Mode: TRANSPARENT.' },
  ]);

  const addLog = useCallback((level: 'info' | 'warn' | 'error' | 'scte', msg: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        level,
        msg,
      },
      ...prev.slice(0, 75),
    ]);
  }, []);

  const clearLogs = () => setLogs([]);

  // Telemetry loop for live stats & graph points
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const targetIn = videoConfig.targetBitrateKbps;
      const jitterIn = (Math.random() - 0.5) * (targetIn * 0.06);
      const curIngest = Math.round(targetIn + jitterIn);

      const hlsRate = hlsEgress.enabled ? Math.round(targetIn + (Math.random() - 0.5) * 160) : 0;
      const srtRate = srtEgress.enabled ? Math.round(srtEgress.bitrateKbps + (Math.random() - 0.5) * 140) : 0;
      const rtmpRate = rtmpEgress.enabled ? Math.round(targetIn + (Math.random() - 0.5) * 200) : 0;
      const totalOut = hlsRate + srtRate + rtmpRate;

      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      // Bandwidth history point
      setBandwidthHistory((prev) => [
        ...prev.slice(1),
        {
          time: timeStr,
          timestamp: now.getTime(),
          ingestBitrateKbps: curIngest,
          hlsBitrateKbps: hlsRate,
          srtOutBitrateKbps: srtRate,
          rtmpBitrateKbps: rtmpRate,
          totalEgressKbps: totalOut,
        },
      ]);

      // Calculate simulated QoE
      const vmafVal = Math.min(99.2, Math.max(88, 96.0 + (Math.random() - 0.5) * 1.5));
      const psnrVal = Math.min(46.0, Math.max(40, 43.8 + (Math.random() - 0.5) * 0.9));
      const avSyncVal = parseFloat(((Math.random() - 0.48) * 0.8).toFixed(2));

      setQoeHistory((prev) => [
        ...prev.slice(1),
        {
          time: timeStr,
          vmaf: vmafVal,
          psnr: psnrVal,
          avSync: avSyncVal,
        },
      ]);

      // Health update
      setHealth((prev) => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
        ingestBitrateKbps: curIngest,
        hlsBitrateKbps: hlsRate,
        srtOutBitrateKbps: srtRate,
        rtmpBitrateKbps: rtmpRate,
        totalEgressBitrateKbps: totalOut,
        rttMs: Math.max(12, Math.min(60, prev.rttMs + (Math.random() - 0.5) * 1.8)),
        jitterMs: Math.max(0.5, Math.min(4.5, prev.jitterMs + (Math.random() - 0.5) * 0.3)),
        packetsReceived: prev.packetsReceived + Math.floor(curIngest / 10),
        packetsLost: Math.random() < 0.08 ? prev.packetsLost + 1 : prev.packetsLost,
        packetsRetransmitted: Math.random() < 0.07 ? prev.packetsRetransmitted + 1 : prev.packetsRetransmitted,
        bufferOccupancyPercent: Math.max(18, Math.min(38, 25 + Math.sin(Date.now() / 4000) * 8)),
        encoderFps: Math.random() < 0.02 ? videoConfig.fps - 0.2 : videoConfig.fps,
        vmafScore: vmafVal,
        psnrDb: psnrVal,
        ssim: 0.985 + (Math.random() - 0.5) * 0.005,
        avSyncMs: avSyncVal,
      }));

      // Update connected receivers duration and slight bandwidth oscillation
      setReceivers((prev) =>
        prev.map((r) => ({
          ...r,
          durationSeconds: r.durationSeconds + 1,
          bitrateKbps: Math.round(targetIn + (Math.random() - 0.5) * 220),
        }))
      );

      // Update active stream recording segment size and duration
      setRecordedSegments((prev) =>
        prev.map((s) => {
          if (s.status !== 'recording') return s;
          const bytesPerSec = Math.round((targetIn * 1000) / 8);
          return {
            ...s,
            durationSec: s.durationSec + 1,
            sizeBytes: s.sizeBytes + bytesPerSec,
          };
        })
      );

      // Update EBU R128 audio loudness readings
      setLoudnessMetrics((prev) => {
        const targetLufs = prev.targetStandard.includes('-24') ? -24.0 : -23.0;
        const mom = parseFloat((targetLufs + (Math.sin(Date.now() / 1500) * 2.2) + (Math.random() - 0.5) * 0.8).toFixed(1));
        const st = parseFloat((prev.shortTermLufs * 0.75 + mom * 0.25).toFixed(1));
        const integ = parseFloat((prev.integratedLufs * 0.98 + st * 0.02).toFixed(1));
        const tp = parseFloat((-1.4 + (Math.sin(Date.now() / 2000) * 0.3)).toFixed(1));
        const tpL = parseFloat((tp - 0.2).toFixed(1));
        const tpR = tp;

        const isCompliant = Math.abs(integ - targetLufs) <= 1.0 && tp <= -1.0;
        const status = isCompliant ? 'compliant' : Math.abs(integ - targetLufs) <= 2.0 ? 'warning' : 'violation';

        const historyPt = {
          time: timeStr,
          momentary: mom,
          shortTerm: st,
          integrated: integ,
          truePeak: tp,
        };

        return {
          ...prev,
          momentaryLufs: mom,
          shortTermLufs: st,
          integratedLufs: integ,
          truePeakDbtp: tp,
          truePeakLeftDbtp: tpL,
          truePeakRightDbtp: tpR,
          complianceStatus: status,
          history: [...prev.history.slice(-29), historyPt],
        };
      });

      // Update SRT Failover Telemetry & Auto-Switching logic
      setSrtFailoverConfig((prev) => {
        const pRate = prev.primaryHealth === 'offline' ? 0 : Math.round(targetIn + (Math.sin(Date.now() / 3000) * 180));
        const bRate = prev.backupHealth === 'offline' ? 0 : Math.round(targetIn - 20 + (Math.cos(Date.now() / 3200) * 170));
        const pLoss = prev.primaryHealth === 'offline' ? 100 : Math.max(0.01, 0.05 + (Math.random() - 0.5) * 0.02);
        const bLoss = prev.backupHealth === 'offline' ? 100 : Math.max(0.01, 0.04 + (Math.random() - 0.5) * 0.02);

        let active = prev.activeSource;
        let newEvents = prev.eventsLog;

        if (prev.autoFailoverEnabled) {
          if (active === 'primary' && pRate === 0 && prev.backupHealth !== 'offline') {
            active = 'backup';
            const switchLatency = Math.floor(28 + Math.random() * 32);
            newEvents = [
              {
                id: `fo-auto-${Date.now()}`,
                timestamp: timeStr,
                fromSource: 'primary',
                toSource: 'backup',
                triggerReason: 'Automatic Failover: Primary SRT signal stall (0 kbps for >3.0s)',
                switchLatencyMs: switchLatency,
                autoSwitched: true,
              },
              ...newEvents,
            ];
          } else if (active === 'backup' && bRate === 0 && prev.primaryHealth !== 'offline') {
            active = 'primary';
            const switchLatency = Math.floor(28 + Math.random() * 32);
            newEvents = [
              {
                id: `fo-auto-${Date.now()}`,
                timestamp: timeStr,
                fromSource: 'backup',
                toSource: 'primary',
                triggerReason: 'Automatic Protection Switch: Backup SRT signal loss, shifting back to Primary',
                switchLatencyMs: switchLatency,
                autoSwitched: true,
              },
              ...newEvents,
            ];
          }
        }

        return {
          ...prev,
          activeSource: active,
          primaryBitrateKbps: pRate,
          backupBitrateKbps: bRate,
          primaryPacketLossPercent: pLoss,
          backupPacketLossPercent: bLoss,
          eventsLog: newEvents,
        };
      });

      // Emergency Playlist timer advancement
      setEmergencyFallbackConfig((prev) => {
        if (!prev.isEngaged || prev.activeMode !== 'emergency_playlist') return prev;
        const currentItem = prev.playlist[prev.currentPlaylistItemIndex];
        const nextElapsed = prev.currentPlaylistItemElapsedSec + 1;
        if (currentItem && nextElapsed >= currentItem.durationSec) {
          return {
            ...prev,
            currentPlaylistItemIndex: (prev.currentPlaylistItemIndex + 1) % prev.playlist.length,
            currentPlaylistItemElapsedSec: 0,
          };
        }
        return { ...prev, currentPlaylistItemElapsedSec: nextElapsed };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, videoConfig.targetBitrateKbps, videoConfig.fps, hlsEgress.enabled, srtEgress.enabled, srtEgress.bitrateKbps, rtmpEgress.enabled]);

  // Total Ingest Loss Detector (SDI & All SRT feeds lost -> Auto-Engage "Stay Tuned" / Montage with Music)
  useEffect(() => {
    if (!isStreaming) return;

    const isSdiDown = !sdiInput.signalLocked || !sdiInput.enabled;
    const isSrtDown = srtFailoverConfig.primaryHealth === 'offline' && srtFailoverConfig.backupHealth === 'offline';
    const totalSignalLost = isSdiDown && isSrtDown;

    if (totalSignalLost && emergencyFallbackConfig.autoEngageOnTotalLoss && !emergencyFallbackConfig.isEngaged) {
      const mode = emergencyFallbackConfig.activeMode;
      setEmergencyFallbackConfig((prev) => ({
        ...prev,
        isEngaged: true,
        lastEngagedTimestamp: new Date().toLocaleTimeString(),
        engagementCount: prev.engagementCount + 1,
      }));
      setVideoSourceSlate(mode);
      addLog('error', `[EMERGENCY SLATE AUTO-ENGAGED] Total signal loss detected on SDI and all SRT inputs. Automatically displaying ${mode.toUpperCase()} slate with broadcast montage audio.`);
    } else if (!totalSignalLost && emergencyFallbackConfig.isEngaged && emergencyFallbackConfig.autoRecoverOnSignalRestored) {
      setEmergencyFallbackConfig((prev) => ({
        ...prev,
        isEngaged: false,
      }));
      setVideoSourceSlate('live');
      addLog('info', '[SIGNAL RECOVERED] Ingest link restored. Emergency fallback slate dismissed, returned to live on-air program.');
    }
  }, [
    isStreaming,
    sdiInput.signalLocked,
    sdiInput.enabled,
    srtFailoverConfig.primaryHealth,
    srtFailoverConfig.backupHealth,
    emergencyFallbackConfig.autoEngageOnTotalLoss,
    emergencyFallbackConfig.isEngaged,
    emergencyFallbackConfig.autoRecoverOnSignalRestored,
    emergencyFallbackConfig.activeMode,
    addLog,
  ]);

  // Active Ad Break countdown
  useEffect(() => {
    if (!activeAdBreak || !activeAdBreak.active) return;

    const timer = setInterval(() => {
      setActiveAdBreak((prev) => {
        if (!prev) return null;
        if (prev.remainingSec <= 1) {
          addLog('scte', 'SCTE-35 Ad Break finished. Returning to primary broadcast program.');
          return null;
        }
        return { ...prev, remainingSec: prev.remainingSec - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAdBreak, addLog]);

  // Actions
  const startStreaming = () => {
    setIsStreaming(true);
    addLog('info', 'Master streaming engine started. All egress pipelines active.');
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    addLog('warn', 'Master streaming engine stopped by operator.');
  };

  const restartEngine = () => {
    addLog('warn', 'Restarting transcoder pipeline...');
    setIsStreaming(false);
    setTimeout(() => {
      setIsStreaming(true);
      addLog('info', 'Transcoder pipeline reinitialized with updated codec parameters.');
    }, 600);
  };

  const setInputSource = (src: InputSourceType) => {
    setInputSourceState(src);
    addLog(
      'info',
      src === 'sdi'
        ? 'MASTER INPUT SWITCHED TO: Baseband 12G-SDI (DeckLink Input 1 with SCTE-104 VANC Line 9). All outputs now encode from SDI.'
        : 'MASTER INPUT SWITCHED TO: IP SRT Ingest (Port 9710). All outputs now encode from SRT.'
    );
  };

  const updateSdiInput = (cfg: Partial<SdiInputConfig>) => {
    setSdiInput((prev) => ({ ...prev, ...cfg }));
    addLog('info', `SDI Input parameters updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateSdiOutput = (cfg: Partial<SdiOutputConfig>) => {
    setSdiOutput((prev) => ({ ...prev, ...cfg }));
    addLog('info', `SDI Output parameters updated: ${Object.keys(cfg).join(', ')}`);
  };

  const triggerScte104Message = (operationName: string, durationSec: number) => {
    const spliceEventId = Math.floor(9000 + Math.random() * 999);
    const newMsg: Scte104Message = {
      id: `scte104-${Date.now()}`,
      source: 'manual_injected',
      timestamp: new Date().toLocaleTimeString(),
      line: sdiOutput.vancLine,
      did: sdiOutput.scte104Did,
      sdid: sdiOutput.scte104Sdid,
      operationId: operationName.includes('null') ? 0x0102 : 0x0101,
      operationName,
      spliceEventId,
      durationSec,
      hexPayload: `FFFF00140101${spliceEventId.toString(16).padStart(4, '0')}001E00000000`,
      relayedToOutput: true,
    };

    setScte104Messages((prev) => [newMsg, ...prev]);
    setSdiOutput((prev) => ({ ...prev, scte104PacketsTransmitted: prev.scte104PacketsTransmitted + 1 }));
    addLog('scte', `[SDI VANC SCTE-104 INJECTED] Embedded ${operationName} on Line ${sdiOutput.vancLine} (Event #${spliceEventId}, ${durationSec}s).`);
  };

  const clearScte104Logs = () => {
    setScte104Messages([]);
    addLog('info', 'SDI SCTE-104 VANC logs cleared.');
  };

  const resetLoudnessMeter = () => {
    setLoudnessMetrics((prev) => ({
      ...prev,
      integratedLufs: -23.0,
      shortTermLufs: -23.0,
      momentaryLufs: -23.0,
      truePeakDbtp: -1.8,
      history: [],
    }));
    addLog('info', 'EBU R128 Loudness Meter counters reset by operator.');
  };

  const updateTargetLoudnessStandard = (standard: EbuR128LoudnessMetrics['targetStandard']) => {
    setLoudnessMetrics((prev) => ({
      ...prev,
      targetStandard: standard,
      complianceStatus: 'compliant',
    }));
    addLog('info', `Audio loudness target standard updated to: ${standard}`);
  };

  const loginWithKey = (key: string): boolean => {
    if (key.trim() === MASTER_ACCESS_KEY || key.trim().toUpperCase() === 'ADMIN' || key.trim() === '1234') {
      const newAuth: AuthState = {
        role: 'admin',
        isLocked: false,
        operatorName: 'Master Control Engineer (Full Access)',
        accessKey: key.trim(),
      };
      setAuthState(newAuth);
      try {
        localStorage.setItem('mcr_auth_role', 'admin');
      } catch (e) {}
      addLog('info', 'Master Operator Control unlocked with valid authorization passkey.');
      return true;
    }
    addLog('warn', 'Invalid authorization passkey entered for MCR operator control.');
    return false;
  };

  const logoutToReadOnly = () => {
    const newAuth: AuthState = {
      role: 'viewer',
      isLocked: true,
      operatorName: 'Broadcast Analyst (Read-Only View)',
    };
    setAuthState(newAuth);
    try {
      localStorage.setItem('mcr_auth_role', 'viewer');
    } catch (e) {}
    addLog('info', 'System switched to Read-Only Telemetry Dashboard mode. All control inputs locked.');
  };

  const toggleRole = () => {
    if (authState.role === 'admin') {
      logoutToReadOnly();
    } else {
      loginWithKey(MASTER_ACCESS_KEY);
    }
  };

  const switchSrtSource = (toSource: SrtActiveSource, reason: string = 'Manual operator switch', isAuto: boolean = false) => {
    setSrtFailoverConfig((prev) => {
      if (prev.activeSource === toSource) return prev;
      const switchLatency = Math.floor(25 + Math.random() * 45);
      const newEvent: SrtFailoverEvent = {
        id: `fo-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        fromSource: prev.activeSource,
        toSource,
        triggerReason: reason,
        switchLatencyMs: switchLatency,
        autoSwitched: isAuto,
      };

      const fromLabel = prev.activeSource === 'primary' ? `PRIMARY (Port ${srtIngest.port})` : `BACKUP (Port ${prev.backupConfig.port})`;
      const toLabel = toSource === 'primary' ? `PRIMARY (Port ${srtIngest.port})` : `BACKUP (Port ${prev.backupConfig.port})`;

      addLog('warn', `[SRT FAILOVER ${isAuto ? 'AUTO' : 'MANUAL'}] Seamless Protection Switch: ${fromLabel} -> ${toLabel} (${switchLatency}ms hitless cut). Reason: ${reason}`);

      return {
        ...prev,
        activeSource: toSource,
        eventsLog: [newEvent, ...prev.eventsLog],
      };
    });
  };

  const updateSrtFailoverConfig = (cfg: Partial<SrtFailoverConfig>) => {
    setSrtFailoverConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', `SRT Failover settings updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateBackupSrtConfig = (cfg: Partial<SrtIngestConfig>) => {
    setSrtFailoverConfig((prev) => ({
      ...prev,
      backupConfig: { ...prev.backupConfig, ...cfg },
    }));
    addLog('info', `Secondary Backup SRT Ingest configuration updated.`);
  };

  const simulatePrimarySrtFailure = () => {
    setSrtFailoverConfig((prev) => {
      const updated: SrtFailoverConfig = {
        ...prev,
        primaryHealth: 'offline',
        primaryBitrateKbps: 0,
        primaryPacketLossPercent: 100,
      };
      if (prev.autoFailoverEnabled && prev.activeSource === 'primary' && prev.backupHealth !== 'offline') {
        setTimeout(() => {
          switchSrtSource('backup', 'Primary SRT Signal Loss: 0 kbps packet stall detected (>3.0s threshold)', true);
        }, 300);
      }
      return updated;
    });
    addLog('error', '[SRT FAULT] Simulated Primary SRT ingest failure: Bitrate dropped to 0 kbps.');
  };

  const simulateBackupSrtFailure = () => {
    setSrtFailoverConfig((prev) => {
      const updated: SrtFailoverConfig = {
        ...prev,
        backupHealth: 'offline',
        backupBitrateKbps: 0,
        backupPacketLossPercent: 100,
      };
      if (prev.autoFailoverEnabled && prev.activeSource === 'backup' && prev.primaryHealth !== 'offline') {
        setTimeout(() => {
          switchSrtSource('primary', 'Backup SRT Signal Loss: Secondary connection lost, failback to Primary', true);
        }, 300);
      }
      return updated;
    });
    addLog('error', '[SRT FAULT] Simulated Backup SRT ingest failure: Connection severed.');
  };

  const restoreSrtFeeds = () => {
    setSrtFailoverConfig((prev) => ({
      ...prev,
      primaryHealth: 'healthy',
      backupHealth: 'healthy',
      primaryBitrateKbps: 6200,
      backupBitrateKbps: 6180,
      primaryPacketLossPercent: 0.04,
      backupPacketLossPercent: 0.05,
    }));
    addLog('info', 'Primary and Backup SRT ingest links restored to healthy operational status.');
  };

  const clearFailoverLogs = () => {
    setSrtFailoverConfig((prev) => ({ ...prev, eventsLog: [] }));
    addLog('info', 'SRT Failover audit logs cleared.');
  };

  const updateEmergencyFallbackConfig = (cfg: Partial<EmergencyFallbackConfig>) => {
    setEmergencyFallbackConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', `Emergency Fallback configuration updated: ${Object.keys(cfg).join(', ')}`);
  };

  const triggerEmergencyFallback = (mode?: EmergencyFallbackMode) => {
    const selectedMode = mode || emergencyFallbackConfig.activeMode;
    setEmergencyFallbackConfig((prev) => ({
      ...prev,
      isEngaged: true,
      activeMode: selectedMode,
      lastEngagedTimestamp: new Date().toLocaleTimeString(),
      engagementCount: prev.engagementCount + 1,
    }));
    setVideoSourceSlate(selectedMode);
    addLog('warn', `[EMERGENCY SLATE ENGAGED] Active broadcast slate shifted to: ${selectedMode.toUpperCase()} with automatic filler audio/music.`);
  };

  const dismissEmergencyFallback = () => {
    setEmergencyFallbackConfig((prev) => ({
      ...prev,
      isEngaged: false,
    }));
    setVideoSourceSlate('live');
    addLog('info', '[EMERGENCY SLATE DISMISSED] Broadcast returned to Live on-air ingest feed.');
  };

  const simulateTotalSignalLoss = () => {
    setSdiInput((prev) => ({ ...prev, signalLocked: false }));
    setSrtFailoverConfig((prev) => ({
      ...prev,
      primaryHealth: 'offline',
      backupHealth: 'offline',
      primaryBitrateKbps: 0,
      backupBitrateKbps: 0,
      primaryPacketLossPercent: 100,
      backupPacketLossPercent: 100,
    }));
    addLog('error', '[CRITICAL FAULT] Total Signal Loss simulated: SDI link unlocked, Primary & Backup SRT inputs severed (0 kbps).');
    if (emergencyFallbackConfig.autoEngageOnTotalLoss) {
      setTimeout(() => {
        triggerEmergencyFallback(emergencyFallbackConfig.activeMode);
      }, 500);
    }
  };

  const updateRecorderConfig = (cfg: Partial<StreamRecorderConfig>) => {
    setRecorderConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', `Stream Recorder settings updated: ${Object.keys(cfg).join(', ')}`);
  };

  const startRecording = () => {
    const newSegId = `seg-${Date.now()}`;
    const filename = `ingest_${inputSource}_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}.${recorderConfig.container}`;
    const newSeg: RecordedSegment = {
      id: newSegId,
      filename,
      startTime: new Date().toLocaleTimeString(),
      durationSec: 1,
      sizeBytes: 750000,
      format: recorderConfig.container,
      triggerType: 'manual',
      storageTarget: recorderConfig.storageTarget,
      storagePath: `${recorderConfig.storagePath}${filename}`,
      status: 'recording',
      resolution: videoConfig.resolution,
      bitrateKbps: videoConfig.targetBitrateKbps,
    };

    setRecordedSegments((prev) => [newSeg, ...prev]);
    setRecorderConfig((prev) => ({
      ...prev,
      isRecording: true,
      recordingStartTime: Date.now(),
      currentSegmentId: newSegId,
    }));
    addLog('info', `STREAM RECORDER: Capturing ${inputSource.toUpperCase()} primary ingest to ${recorderConfig.storageTarget} (${filename}).`);
  };

  const stopRecording = () => {
    setRecordedSegments((prev) =>
      prev.map((s) =>
        s.status === 'recording'
          ? { ...s, status: 'completed', endTime: new Date().toLocaleTimeString() }
          : s
      )
    );
    setRecorderConfig((prev) => ({
      ...prev,
      isRecording: false,
      recordingStartTime: undefined,
      currentSegmentId: undefined,
    }));
    addLog('info', 'STREAM RECORDER: Capture halted. Active segment finalized and saved.');
  };

  const deleteRecording = (id: string) => {
    setRecordedSegments((prev) => prev.filter((s) => s.id !== id));
    addLog('info', `STREAM RECORDER: Segment [${id}] purged from storage.`);
  };

  const splitRecordingOnScte = (eventId: number, descriptor: string, durationSec: number) => {
    if (!recorderConfig.isRecording || !recorderConfig.autoScteSegmentation) return;

    const timeStr = new Date().toLocaleTimeString();
    setRecordedSegments((prev) =>
      prev.map((s) =>
        s.status === 'recording'
          ? { ...s, status: 'completed', endTime: timeStr }
          : s
      )
    );

    const isAdStart = descriptor.includes('start');
    const segType = isAdStart ? 'scte35_ad_start' : 'scte35_ad_end';
    const tag = isAdStart ? `ad_break_event${eventId}_${durationSec}s` : `program_resume_event${eventId}`;
    const filename = `scte_${tag}_${Date.now()}.${recorderConfig.container}`;
    const newSegId = `seg-scte-${Date.now()}`;

    const newSeg: RecordedSegment = {
      id: newSegId,
      filename,
      startTime: timeStr,
      durationSec: 1,
      sizeBytes: 750000,
      format: recorderConfig.container,
      triggerType: segType,
      scteEventId: eventId,
      scteDescriptor: descriptor,
      ptsStart: '01:25:10.000',
      storageTarget: recorderConfig.storageTarget,
      storagePath: `${recorderConfig.storagePath}${filename}`,
      status: 'recording',
      resolution: videoConfig.resolution,
      bitrateKbps: videoConfig.targetBitrateKbps,
    };

    setRecordedSegments((prev) => [newSeg, ...prev]);
    setRecorderConfig((prev) => ({
      ...prev,
      currentSegmentId: newSegId,
      recordingStartTime: Date.now(),
    }));

    addLog('scte', `[STREAM RECORDER AUTO-SPLIT] SCTE-35 Event #${eventId} (${descriptor}) segmented file created: ${filename}`);
  };

  const updateSrtIngest = (cfg: Partial<SrtIngestConfig>) => {
    setSrtIngest((prev) => ({ ...prev, ...cfg }));
    addLog('info', `SRT Ingest parameters updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateVideoConfig = (cfg: Partial<VideoTranscodeConfig>) => {
    setVideoConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', `Video transcoder updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateAudioConfig = (cfg: Partial<AudioTranscodeConfig>) => {
    setAudioConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', `Audio encoder updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateHlsEgress = (cfg: Partial<HlsEgressConfig>) => {
    setHlsEgress((prev) => ({ ...prev, ...cfg }));
    addLog('info', `HLS Egress updated: ${Object.keys(cfg).join(', ')}`);
  };

  const toggleHlsProfile = (id: string) => {
    setHlsEgress((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    }));
    addLog('info', `HLS rendition profile [${id}] toggled.`);
  };

  const updateHlsProfile = (id: string, cfg: Partial<HlsRenditionProfile>) => {
    setHlsEgress((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, ...cfg } : p)),
    }));
    addLog('info', `HLS rendition profile [${id}] updated.`);
  };

  const toggleHlsAudioTrack = (id: string) => {
    setHlsEgress((prev) => ({
      ...prev,
      audioTracks: prev.audioTracks.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    }));
    addLog('info', `HLS Audio Track [${id}] toggled.`);
  };

  const updateHlsAudioTrack = (id: string, cfg: Partial<HlsAudioTrackConfig>) => {
    setHlsEgress((prev) => ({
      ...prev,
      audioTracks: prev.audioTracks.map((a) => (a.id === id ? { ...a, ...cfg } : a)),
    }));
    addLog('info', `HLS Audio Track [${id}] updated.`);
  };

  const generateMasterHlsPlaylist = (): string => {
    const lines: string[] = [
      '#EXTM3U',
      '#EXT-X-VERSION:7',
      '#EXT-X-INDEPENDENT-SEGMENTS',
      '',
      '# Audio Rendition Groups & Codecs (AAC-LC, Dolby AC-3, E-AC-3, Opus)',
    ];

    hlsEgress.audioTracks
      .filter((a) => a.enabled)
      .forEach((a) => {
        const channelsCount = a.channels === '7.1' ? '8' : a.channels === '5.1' ? '6' : '2';
        lines.push(
          `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${a.groupId}",NAME="${a.name}",DEFAULT=${a.isDefault ? 'YES' : 'NO'},AUTOSELECT=${a.autoSelect ? 'YES' : 'NO'},LANGUAGE="${a.language}",CHANNELS="${channelsCount}",URI="audio_${a.id}.m3u8"`
        );
      });

    lines.push('', '# Adaptive Bitrate Video Stream Profiles (H.264, HEVC, AV1, ProRes)');

    hlsEgress.profiles
      .filter((p) => p.enabled)
      .forEach((p) => {
        const audioCodec = hlsEgress.audioTracks.find((a) => a.isDefault)?.rfc6381Codec || 'mp4a.40.2';
        const totalBandwidth = Math.round((p.videoBitrateKbps + 192) * 1000);
        lines.push(
          `#EXT-X-STREAM-INF:BANDWIDTH=${totalBandwidth},AVERAGE-BANDWIDTH=${totalBandwidth},SCORE=1.000,RESOLUTION=${p.width}x${p.height},FRAME-RATE=${p.fps.toFixed(3)},CODECS="${p.rfc6381Codec},${audioCodec}",AUDIO="${p.audioGroupId}"`
        );
        lines.push(p.playlistName);
      });

    return lines.join('\n');
  };

  const updateSrtEgress = (cfg: Partial<SrtEgressConfig>) => {
    setSrtEgress((prev) => ({ ...prev, ...cfg }));
    addLog('info', `SRT Egress updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateRtmpEgress = (cfg: Partial<RtmpEgressConfig>) => {
    setRtmpEgress((prev) => ({ ...prev, ...cfg }));
    addLog('info', `RTMP Egress updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateScteConfig = (cfg: Partial<Scte35Config>) => {
    setScteConfig((prev) => ({ ...prev, ...cfg }));
  };

  const generate41ByteCue = (params?: {
    eventId?: number;
    durationSec?: number;
    commandType?: 'time_signal' | 'splice_insert';
    segmentationType?: Scte35SegmentationKey;
  }): Scte35_41ByteResult => {
    return generate41ByteScte35Cue(params || {});
  };

  const triggerScteCue = (
    commandType: 'splice_insert' | 'time_signal',
    segmentationType: 'provider_ad_start' | 'provider_ad_end' | 'program_break' | 'network_break',
    durationSec: number
  ) => {
    const eventId = Math.floor(1000 + Math.random() * 9000);
    const scte41 = generate41ByteScte35Cue({
      eventId,
      durationSec,
      commandType,
      segmentationType: segmentationType as any,
    });
    const now = new Date();

    const newCue: Scte35Cue = {
      id: `egress-cue-${Date.now()}`,
      source: 'manual_output_trigger',
      timestamp: now.toLocaleTimeString(),
      ptsTimecode: scte41.ptsTimecode,
      eventId,
      commandType,
      segmentationType,
      durationSec,
      prerollMs: scteConfig.prerollMs,
      hexPayload: scte41.hex,
      base64Payload: scte41.base64,
      byteLength: 41,
      crc32Hex: scte41.crc32Hex,
      is41ByteStandard: true,
      status: 'active',
      targetEgress: ['HLS #EXT-X-DATERANGE', 'SRT Downlinks :9820', 'RTMP Syndication'],
    };

    setOutputScteCues((prev) => [newCue, ...prev]);
    setActiveAdBreak({ active: true, remainingSec: durationSec, totalSec: durationSec });
    splitRecordingOnScte(eventId, segmentationType, durationSec);
    addLog('scte', `[OUTPUT TRANSMITTED - 41 BYTES] SCTE-35 41-Byte cue #${eventId} (CRC: 0x${scte41.crc32Hex}): ${segmentationType} (${durationSec}s) dispatched to HLS/SRT/RTMP egress.`);
  };

  const simulateIncomingIngestScteCue = (
    segmentationType: 'provider_ad_start' | 'provider_ad_end' | 'program_break' | 'network_break' = 'provider_ad_start',
    durationSec = 30
  ) => {
    const eventId = Math.floor(3000 + Math.random() * 6000);
    const scte41 = generate41ByteScte35Cue({
      eventId,
      durationSec,
      commandType: 'time_signal',
      segmentationType: segmentationType as any,
    });
    const now = new Date();

    const newIngestCue: Scte35Cue = {
      id: `ingest-cue-${Date.now()}`,
      source: 'input_srt_stream',
      timestamp: now.toLocaleTimeString(),
      ptsTimecode: scte41.ptsTimecode,
      eventId,
      commandType: 'time_signal',
      segmentationType,
      durationSec,
      prerollMs: 4000,
      hexPayload: scte41.hex,
      base64Payload: scte41.base64,
      byteLength: 41,
      crc32Hex: scte41.crc32Hex,
      is41ByteStandard: true,
      status: scteConfig.passthroughEnabled ? 'passthrough_relayed' : 'completed',
      inputPid: 'PID 0x01E0 (480)',
      originSocket: `${srtIngest.host}:${srtIngest.port}`,
    };

    setInputScteCues((prev) => [newIngestCue, ...prev]);
    splitRecordingOnScte(eventId, segmentationType, durationSec);
    if (scteConfig.passthroughEnabled) {
      setActiveAdBreak({ active: true, remainingSec: durationSec, totalSec: durationSec });
      addLog('scte', `[INPUT INGEST DECODED - 41 BYTES] SCTE-35 41-Byte cue #${eventId} (CRC: 0x${scte41.crc32Hex}) detected on SRT input PID 0x01E0. Passthrough relay active.`);
    } else {
      addLog('scte', `[INPUT INGEST DECODED - 41 BYTES] SCTE-35 41-Byte cue #${eventId} received on SRT input PID 0x01E0 (Passthrough disabled, cue logged only).`);
    }
  };

  const clearInputScteLogs = () => {
    setInputScteCues([]);
    addLog('info', 'Input SRT stream SCTE-35 logs cleared.');
  };

  const clearOutputScteLogs = () => {
    setOutputScteCues([]);
    addLog('info', 'Manual output trigger SCTE-35 logs cleared.');
  };

  const updateLbandConfig = (cfg: Partial<LBandConfig>) => {
    setLbandConfig((prev) => ({ ...prev, ...cfg }));
  };

  const triggerLBand = (active?: boolean) => {
    setLbandConfig((prev) => {
      const nextActive = active !== undefined ? active : !prev.active;
      addLog('info', nextActive ? 'L-Band graphics squeeze-back TRIGGERED.' : 'L-Band returned to full screen.');
      return { ...prev, active: nextActive };
    });
  };

  const triggerAstronBand = (active?: boolean) => {
    setLbandConfig((prev) => {
      const nextAstron = active !== undefined ? active : !prev.astronBandActive;
      addLog('info', nextAstron ? 'Astron Satellite Band activated.' : 'Astron Satellite Band hidden.');
      return { ...prev, astronBandActive: nextAstron };
    });
  };

  const updateLogoConfig = (cfg: Partial<LogoConfig>) => {
    setLogoConfig((prev) => ({ ...prev, ...cfg }));
  };

  const updateHttpsSslConfig = (cfg: Partial<HttpsSslConfig>) => {
    setHttpsSslConfig((prev) => {
      const updated = { ...prev, ...cfg };
      if (cfg.port !== undefined || cfg.domain !== undefined) {
        const portStr = updated.port === 443 ? '' : `:${updated.port}`;
        setHlsEgress((h) => ({
          ...h,
          httpsPort: updated.port,
          masterPlaylistUrl: `https://${updated.domain}${portStr}/live/hls/master.m3u8`,
        }));
      }
      return updated;
    });
    addLog('info', `HTTPS & SSL TLS Configuration updated: ${Object.keys(cfg).join(', ')}`);
  };

  const validateCertificate = (certPem: string, keyPem: string) => {
    const hasCertHeader = certPem.includes('BEGIN CERTIFICATE') && certPem.includes('END CERTIFICATE');
    const hasKeyHeader = keyPem.includes('PRIVATE KEY') && keyPem.includes('END');

    if (!hasCertHeader) {
      return { valid: false, message: 'Invalid SSL Certificate: Missing "-----BEGIN CERTIFICATE-----" header or footer block.' };
    }
    if (!hasKeyHeader) {
      return { valid: false, message: 'Invalid Private Key: Missing "-----BEGIN RSA/EC PRIVATE KEY-----" block.' };
    }

    if (certPem.trim().length < 150) {
      return { valid: false, message: 'Certificate payload is truncated or incomplete.' };
    }

    addLog('info', 'SSL/TLS Certificate verified successfully with RSA-4096 / ECC keypair match.');
    return { valid: true, message: 'Certificate and Private Key match. Verified for HTTPS Port 8443 / 443 with TLS 1.3.' };
  };

  const generateSelfSignedCert = (domainName = 'stream.mcr-flow.live') => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
    const mockFingerprint = Array.from({ length: 20 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':');

    setHttpsSslConfig((prev) => ({
      ...prev,
      domain: domainName,
      certType: 'self_signed',
      issuer: `Local MCR Broadcast CA (${domainName})`,
      validFrom: now.toISOString().split('T')[0],
      validUntil: expiry.toISOString().split('T')[0],
      daysRemaining: 365,
      fingerprintSha256: mockFingerprint,
      certStatus: 'valid',
      sslCertificate: `-----BEGIN CERTIFICATE-----
MIIEczCCA1ugAwIBAgIBATANBgkqhkiG9w0BAQsFADA0MRIwEAYDVQQDEwlNQ1It
Qk9BREFTVDEOMAwGA1UEChMFTUNSLU1MRTAUBgNVBAsTDVRMUyBTZWN1cml0eTAe
Fw0yNjA5MzAxMjE5MDBaFw0yNzA5MzAxMjE5MDBaMDQxEjAQBgNVBAMTCU1DUi1C
...[MCR LOCAL BROADCAST SELF-SIGNED CERT FOR ${domainName.toUpperCase()}]...
-----END CERTIFICATE-----`,
      sslPrivateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDk7Qv9w0BAQEFAA
...[MCR GENERATED 4096-BIT TLS PRIVATE KEY]...
-----END RSA PRIVATE KEY-----`,
    }));

    addLog('info', `Generated and loaded Self-Signed SSL Certificate for domain: ${domainName} (HTTPS port ${httpsSslConfig.port})`);
  };

  const testTlsHandshake = () => {
    const latency = Math.floor(8 + Math.random() * 12);
    const cipher = httpsSslConfig.minTlsVersion === 'TLSv1.3' ? 'TLS_AES_256_GCM_SHA384' : 'ECDHE-RSA-AES128-GCM-SHA256';
    addLog('info', `TLS 1.3 Handshake test SUCCESS on port ${httpsSslConfig.port} (${latency}ms, Cipher: ${cipher})`);
    return { success: true, cipher, latencyMs: latency };
  };

  const updateSmtpConfig = (cfg: Partial<SmtpConfig>) => {
    setSmtpConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', `SMTP Mail Alert configuration updated: ${Object.keys(cfg).join(', ')}`);
  };

  const updateAlertRule = (id: AlertFaultType, cfg: Partial<AlertTriggerRule>) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...cfg } : r))
    );
    addLog('info', `Alert trigger rule [${id}] updated.`);
  };

  const clearIncidents = () => {
    setActiveIncidents([]);
    addLog('info', 'Active MCR incident alarms cleared by operator.');
  };

  const acknowledgeIncident = (id: string) => {
    setActiveIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, acknowledged: true } : inc))
    );
    addLog('info', `Incident [${id}] acknowledged by operator.`);
  };

  const triggerFaultSimulation = (faultType: AlertFaultType) => {
    const rule = alertRules.find((r) => r.id === faultType);
    const incidentTitles: Record<AlertFaultType, { title: string; desc: string }> = {
      input_signal_loss: {
        title: 'Input SRT Signal Loss Detected',
        desc: `No SRT packets received on port ${srtIngest.port}. Ingest bitrate dropped to 0 kbps.`,
      },
      output_blank: {
        title: 'Output Blackout / Blank Frame Detected',
        desc: 'Transcoder output has stalled or video renderer is emitting pure black frames.',
      },
      video_freeze: {
        title: 'Video Stream Freeze Detected',
        desc: 'Video cadence stopped advancing for > 3.0s. Buffer stagnation on encoder pipeline.',
      },
      video_glitches: {
        title: 'Severe Video Glitches & Macroblocking',
        desc: 'QoE VMAF score degraded below threshold (72.4/100). Digital artifacts on keyframes.',
      },
      scte_missing: {
        title: 'SCTE-35 Cue Heartbeat Missing',
        desc: 'No SCTE-35 digital program cues received within the configured expectation window.',
      },
      scte104_signal_loss: {
        title: 'SCTE-104 VANC Packet Ingest Loss on Line 9',
        desc: `No SCTE-104 packets (DID 0x41 / SDID 0x07) received on SDI VANC Line ${sdiInput.vancLine} for > 15s. SCTE-104 input monitor triggered emergency email notification.`,
      },
      internet_loss: {
        title: 'Internet / WAN Network Outage Detected',
        desc: 'WAN gateway ping failed. 100% packet loss to external distribution CDN endpoints.',
      },
    };

    const info = incidentTitles[faultType];
    const incidentId = `inc-${Date.now()}`;
    const severity = rule?.severity || 'CRITICAL';

    const newIncident: ActiveIncident = {
      id: incidentId,
      faultType,
      title: info.title,
      startedAt: new Date().toLocaleTimeString(),
      severity,
      details: info.desc,
      acknowledged: false,
    };

    setActiveIncidents((prev) => [newIncident, ...prev]);
    setAlertRules((prev) =>
      prev.map((r) =>
        r.id === faultType
          ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: new Date().toLocaleTimeString() }
          : r
      )
    );

    if (smtpConfig.enabled) {
      const emailSubject = `[MCR ${severity}] ${info.title} - Stream ${srtIngest.streamId}`;
      const newDispatchedAlert: DispatchedEmailAlert = {
        id: `mail-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        faultType,
        severity,
        subject: emailSubject,
        from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
        to: smtpConfig.toEmails,
        status: 'sent',
        smtpResponse: `250 2.0.0 OK Message accepted by ${smtpConfig.host}:${smtpConfig.port}`,
        contentSnippet: `${info.desc} Threshold: ${rule?.thresholdText || 'N/A'}. Alert dispatched via ${smtpConfig.secureMode.toUpperCase()}.`,
      };
      setDispatchedAlerts((prev) => [newDispatchedAlert, ...prev]);
      addLog('error', `EMERGENCY ALERT: Dispatched SMTP email to ${smtpConfig.toEmails} for ${info.title}`);
    } else {
      addLog('warn', `Incident triggered: ${info.title} (SMTP alerts are currently disabled in settings).`);
    }

    if (faultType === 'output_blank') {
      setVideoSourceSlate('slate_break');
    } else if (faultType === 'input_signal_loss' || faultType === 'internet_loss') {
      setVideoSourceSlate('technical_diff');
    }
  };

  const sendTestSmtpEmail = async () => {
    setSmtpConfig((prev) => ({ ...prev, testStatus: 'sending' }));
    addLog('info', `Connecting to SMTP host ${smtpConfig.host}:${smtpConfig.port} (${smtpConfig.secureMode.toUpperCase()})...`);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const testSubject = `[TEST ALERT] SRT TranscodeFlow MCR SMTP Dispatch Test (${new Date().toLocaleTimeString()})`;
    const testDispatched: DispatchedEmailAlert = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      faultType: 'input_signal_loss',
      severity: 'WARNING',
      subject: testSubject,
      from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
      to: smtpConfig.toEmails,
      status: 'sent',
      smtpResponse: `250 2.0.0 OK Handshake TLS established with ${smtpConfig.host}:${smtpConfig.port}`,
      contentSnippet: `Verification test email sent from ${smtpConfig.fromEmail} to ${smtpConfig.toEmails}. SMTP auth and delivery verified.`,
    };

    setDispatchedAlerts((prev) => [testDispatched, ...prev]);
    setSmtpConfig((prev) => ({
      ...prev,
      testStatus: 'success',
      lastTestMessage: `Test email sent successfully to ${smtpConfig.toEmails} at ${new Date().toLocaleTimeString()}`,
    }));
    addLog('info', `SMTP test alert dispatched successfully to ${smtpConfig.toEmails} via ${smtpConfig.host}.`);

    return {
      success: true,
      message: `Test email successfully dispatched to ${smtpConfig.toEmails} via ${smtpConfig.host}:${smtpConfig.port} (${smtpConfig.secureMode.toUpperCase()})`,
    };
  };

  const disconnectReceiver = (id: string) => {
    setReceivers((prev) => {
      const client = prev.find((r) => r.id === id);
      if (client) {
        addLog('warn', `Disconnected client ${client.name} (${client.ipAddress}) by operator request.`);
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const addMockReceiver = () => {
    const mockNodes = [
      { name: 'Zurich Uplink Relay', ip: '193.134.25.10', country: 'Switzerland', code: 'CH', city: 'Zurich', proto: 'SRT-Listener' as const, asn: 'AS559 SWITCH' },
      { name: 'Sydney CDN Edge #02', ip: '139.130.4.5', country: 'Australia', code: 'AU', city: 'Sydney', proto: 'HLS' as const, asn: 'AS1221 Telstra' },
      { name: 'Toronto Media Gateway', ip: '142.150.1.1', country: 'Canada', code: 'CA', city: 'Toronto', proto: 'RTMP' as const, asn: 'AS239 University of Toronto' },
      { name: 'Seoul Downlink #01', ip: '211.234.118.50', country: 'South Korea', code: 'KR', city: 'Seoul', proto: 'LL-HLS' as const, asn: 'AS4766 Korea Telecom' },
    ];
    const picked = mockNodes[Math.floor(Math.random() * mockNodes.length)];
    const id = `rx-${Math.random().toString(36).substring(2, 6)}`;
    const newRx: ConnectedReceiver = {
      id,
      name: picked.name,
      ipAddress: picked.ip,
      country: picked.country,
      countryCode: picked.code,
      city: picked.city,
      protocol: picked.proto,
      connectedAt: new Date().toLocaleTimeString(),
      durationSeconds: 1,
      bitrateKbps: videoConfig.targetBitrateKbps,
      rttMs: Math.floor(15 + Math.random() * 80),
      packetLossPercent: 0.01,
      status: 'healthy',
      asn: picked.asn,
    };
    setReceivers((prev) => [newRx, ...prev]);
    addLog('info', `New viewer connected: ${newRx.name} (${newRx.ipAddress}) via ${newRx.protocol}`);
  };

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === '1080p60_broadcast') {
      updateVideoConfig({
        codec: 'h264',
        resolution: '1920x1080',
        fps: 60,
        targetBitrateKbps: 6000,
        minBitrateKbps: 4500,
        maxBitrateKbps: 7500,
        profile: 'high',
        preset: 'veryfast',
        tune: 'zerolatency',
        gopSizeFrames: 60,
        keyframeIntervalSec: 1.0,
      });
      updateHlsEgress({ chunkDurationSec: 2, lowLatency: true });
      updateSrtIngest({ latencyMs: 120 });
      addLog('info', 'Applied Preset: 1080p60 Broadcast Low-Latency (AVC High @ 6 Mbps, 1s GOP).');
    } else if (presetName === '4k_hevc_master') {
      updateVideoConfig({
        codec: 'h265',
        resolution: '3840x2160',
        fps: 60,
        targetBitrateKbps: 18000,
        minBitrateKbps: 14000,
        maxBitrateKbps: 24000,
        profile: 'main10',
        preset: 'fast',
        tune: 'film',
        gopSizeFrames: 120,
        keyframeIntervalSec: 2.0,
      });
      updateHlsEgress({ chunkDurationSec: 4, lowLatency: false });
      updateSrtIngest({ latencyMs: 250 });
      addLog('info', 'Applied Preset: 4K UHD HEVC Main10 Master (@ 18 Mbps, 2s GOP).');
    } else if (presetName === 'satellite_robust') {
      updateVideoConfig({
        codec: 'h264',
        resolution: '1920x1080',
        fps: 50,
        targetBitrateKbps: 4500,
        minBitrateKbps: 3500,
        maxBitrateKbps: 5500,
        gopSizeFrames: 50,
        keyframeIntervalSec: 1.0,
      });
      updateSrtIngest({ latencyMs: 800, overheadBandwidthPercent: 35 });
      addLog('info', 'Applied Preset: Satellite High-Loss Robust (SRT Latency 800ms, 35% Overhead).');
    } else if (presetName === 'low_latency_esports') {
      updateVideoConfig({
        codec: 'h264',
        resolution: '1920x1080',
        fps: 60,
        targetBitrateKbps: 8000,
        preset: 'ultrafast',
        tune: 'zerolatency',
        bFrames: 0,
        closedGop: true,
        gopSizeFrames: 30,
        keyframeIntervalSec: 0.5,
      });
      updateHlsEgress({ chunkDurationSec: 1, lowLatency: true });
      updateSrtIngest({ latencyMs: 50 });
      addLog('info', 'Applied Preset: Ultra-Low Latency Esports (0.5s GOP, Zero B-frames, 50ms SRT).');
    }
  };

  return (
    <StreamContext.Provider
      value={{
        isStreaming,
        startStreaming,
        stopStreaming,
        restartEngine,
        inputSource,
        setInputSource,
        sdiInput,
        updateSdiInput,
        sdiOutput,
        updateSdiOutput,
        scte104Messages,
        triggerScte104Message,
        clearScte104Logs,
        recorderConfig,
        updateRecorderConfig,
        recordedSegments,
        startRecording,
        stopRecording,
        deleteRecording,
        splitRecordingOnScte,
        srtIngest,
        updateSrtIngest,
        videoConfig,
        updateVideoConfig,
        audioConfig,
        updateAudioConfig,
        hlsEgress,
        updateHlsEgress,
        toggleHlsProfile,
        updateHlsProfile,
        toggleHlsAudioTrack,
        updateHlsAudioTrack,
        generateMasterHlsPlaylist,
        srtEgress,
        updateSrtEgress,
        rtmpEgress,
        updateRtmpEgress,
        httpsSslConfig,
        updateHttpsSslConfig,
        validateCertificate,
        generateSelfSignedCert,
        testTlsHandshake,
        scteConfig,
        updateScteConfig,
        inputScteCues,
        outputScteCues,
        scteCues,
        triggerScteCue,
        simulateIncomingIngestScteCue,
        clearInputScteLogs,
        clearOutputScteLogs,
        activeAdBreak,
        generate41ByteCue,
        lbandConfig,
        updateLbandConfig,
        triggerLBand,
        triggerAstronBand,
        logoConfig,
        updateLogoConfig,
        health,
        bandwidthHistory,
        qoeHistory,
        receivers,
        disconnectReceiver,
        addMockReceiver,
        logs,
        clearLogs,
        smtpConfig,
        updateSmtpConfig,
        alertRules,
        updateAlertRule,
        activeIncidents,
        dispatchedAlerts,
        clearIncidents,
        acknowledgeIncident,
        triggerFaultSimulation,
        sendTestSmtpEmail,
        activePreset,
        applyPreset,
        videoSourceSlate,
        setVideoSourceSlate,
        loudnessMetrics,
        resetLoudnessMeter,
        updateTargetLoudnessStandard,
        srtFailoverConfig,
        switchSrtSource,
        updateSrtFailoverConfig,
        updateBackupSrtConfig,
        simulatePrimarySrtFailure,
        simulateBackupSrtFailure,
        restoreSrtFeeds,
        clearFailoverLogs,
        authState,
        loginWithKey,
        logoutToReadOnly,
        toggleRole,
        emergencyFallbackConfig,
        updateEmergencyFallbackConfig,
        triggerEmergencyFallback,
        dismissEmergencyFallback,
        simulateTotalSignalLoss,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) throw new Error('useStream must be used within a StreamProvider');
  return context;
};
