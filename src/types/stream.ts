export type SrtMode = 'caller' | 'listener' | 'rendezvous';
export type InputSourceType = 'sdi' | 'srt';
export type SdiStandard = '12G-SDI' | '6G-SDI' | '3G-SDI-LevelA' | '3G-SDI-LevelB' | 'HD-SDI';

export type SdiVideoFormat =
  | 'auto_detect'
  | '2160p60'
  | '2160p59.94'
  | '2160p50'
  | '2160p30'
  | '2160p29.97'
  | '2160p25'
  | '2160p24'
  | '2160p23.98'
  | '1080p60'
  | '1080p59.94'
  | '1080p50'
  | '1080p30'
  | '1080p29.97'
  | '1080p25'
  | '1080p24'
  | '1080p23.98'
  | '1080i60'
  | '1080i59.94'
  | '1080i50'
  | '1080PsF25'
  | '1080PsF24'
  | '1080PsF23.98'
  | '720p60'
  | '720p59.94'
  | '720p50'
  | '720p30'
  | '720p25'
  | '576i50'
  | '576p50'
  | '480i59.94'
  | '480p59.94';

export interface SdiInputConfig {
  enabled: boolean;
  deviceName: string;
  deviceIndex: number;
  standard: SdiStandard;
  videoFormat: SdiVideoFormat;
  autoDetectFormat: boolean;
  detectedFormat: string;
  pixelFormat: 'YUV-422-10bit' | 'RGB-444-10bit' | 'YUV-422-8bit';
  audioChannels: 8 | 16;
  audioSampleRateHz: 48000;
  genlockStatus: 'locked' | 'free_run' | 'unlocked';
  genlockRef: 'Tri-Level Sync' | 'Black Burst' | 'Internal';
  vancEnabled: boolean;
  scte104Did: string;
  scte104Sdid: string;
  vancLine: number;
  signalLocked: boolean;
  inputTimecode: string;
  scte104PacketsReceived: number;
}

export interface SdiOutputConfig {
  enabled: boolean;
  deviceName: string;
  standard: SdiStandard;
  videoFormat: SdiVideoFormat;
  pixelFormat: 'YUV-422-10bit' | 'RGB-444-10bit';
  audioChannels: 8 | 16;
  scte104Passthrough: boolean;
  vancLine: number;
  scte104Did: string;
  scte104Sdid: string;
  genlockSyncToInput: boolean;
  colorRange: 'legal' | 'full';
  scte104PacketsTransmitted: number;
}

export interface Scte104Message {
  id: string;
  source: 'sdi_vanc_in' | 'manual_injected' | 'scte35_converted';
  timestamp: string;
  line: number;
  did: string;
  sdid: string;
  operationId: number;
  operationName: string;
  spliceEventId: number;
  durationSec: number;
  hexPayload: string;
  relayedToOutput: boolean;
}

export type VideoCodec = 'h264' | 'h265' | 'av1' | 'prores' | 'vp9' | 'mpeg2';
export type AudioCodec = 'aac-lc' | 'he-aac-v1' | 'he-aac-v2' | 'ac3' | 'eac3' | 'ac4' | 'opus' | 'pcm_s24le';
export type RateControl = 'cbr' | 'vbr' | 'capped-vbr';
export type VideoProfile = 'baseline' | 'main' | 'high' | 'high422' | 'main10';
export type VideoPreset = 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
export type VideoTune = 'zerolatency' | 'film' | 'animation' | 'grain' | 'fastdecode';
export type Resolution = '3840x2160' | '1920x1080' | '1920x1080i' | '1280x720' | '960x540' | '854x480' | '720x576' | '720x480' | '640x360';
export type FrameRate = 60 | 59.94 | 50 | 30 | 29.97 | 25 | 24 | 23.98;

export interface SrtIngestConfig {
  mode: SrtMode;
  host: string;
  port: number;
  latencyMs: number;
  passphrase: string;
  pbKeyLen: 0 | 16 | 24 | 32;
  streamId: string;
  maxBandwidthMbps: number;
  overheadBandwidthPercent: number;
  bufferSizeBytes: number;
  peerIdleTimeoutMs: number;
}

export interface VideoTranscodeConfig {
  codec: VideoCodec;
  profile: VideoProfile;
  level: string;
  preset: VideoPreset;
  tune: VideoTune;
  rateControl: RateControl;
  targetBitrateKbps: number;
  minBitrateKbps: number;
  maxBitrateKbps: number;
  bufferSizeKb: number;
  gopSizeFrames: number;
  keyframeIntervalSec: number;
  bFrames: number;
  closedGop: boolean;
  sceneCutThreshold: number;
  resolution: Resolution;
  fps: FrameRate;
}

export interface AudioTranscodeConfig {
  codec: AudioCodec;
  bitrateKbps: number;
  sampleRateHz: 44100 | 48000;
  channels: 'stereo' | '5.1' | '7.1' | 'mono';
}

export interface HlsRenditionProfile {
  id: string;
  name: string;
  enabled: boolean;
  resolution: Resolution;
  width: number;
  height: number;
  videoBitrateKbps: number;
  maxBitrateKbps: number;
  fps: FrameRate;
  videoCodec: VideoCodec;
  profile: VideoProfile;
  level: string;
  rfc6381Codec: string;
  audioGroupId: string;
  playlistName: string;
}

export interface HlsAudioTrackConfig {
  id: string;
  name: string;
  groupId: string;
  language: string;
  codec: AudioCodec;
  rfc6381Codec: string;
  bitrateKbps: number;
  sampleRateHz: 44100 | 48000;
  channels: 'stereo' | '5.1' | '7.1' | 'mono';
  isDefault: boolean;
  autoSelect: boolean;
  enabled: boolean;
}

export interface HlsEgressConfig {
  enabled: boolean;
  chunkDurationSec: number; // Segment chunk size
  playlistLength: number;
  lowLatency: boolean; // LL-HLS
  partDurationMs: number;
  masterPlaylistUrl: string;
  scteFormat: 'daterange' | 'oatcls' | 'cue-out';
  useHttps: boolean;
  httpsPort: number;
  aes128Encryption: boolean;
  keyRotationSec: number;
  profiles: HlsRenditionProfile[];
  audioTracks: HlsAudioTrackConfig[];
}

export interface SrtEgressConfig {
  enabled: boolean;
  mode: SrtMode;
  host: string;
  port: number;
  latencyMs: number;
  passphrase: string;
  streamId: string;
  bitrateKbps: number;
}

export interface RtmpEgressConfig {
  enabled: boolean;
  url: string;
  streamKey: string;
  chunkSizeBytes: number;
  authRequired: boolean;
  useTlsRtmps: boolean;
}

export interface HttpsSslConfig {
  enabled: boolean;
  port: number; // default 8443 or 443
  domain: string; // e.g. stream.mcr-flow.live
  certType: 'custom_pem' | 'letsencrypt_acme' | 'self_signed';
  sslCertificate: string; // PEM format fullchain.pem
  sslPrivateKey: string; // PEM format privkey.pem
  caBundle: string; // Optional intermediate CA
  passphrase?: string;
  minTlsVersion: 'TLSv1.2' | 'TLSv1.3';
  cipherSuites: 'modern_broadcast' | 'intermediate_compatibility' | 'high_security_gcm';
  hstsEnabled: boolean;
  ocspStapling: boolean;
  http2Enabled: boolean;
  http3QuicEnabled: boolean;
  // Certificate status
  certStatus: 'valid' | 'expiring_soon' | 'invalid' | 'generating';
  issuer: string;
  validFrom: string;
  validUntil: string;
  daysRemaining: number;
  fingerprintSha256: string;
  subjectAltNames: string[];
}

export interface SecureOutputSettings {
  hlsAes128Encryption: boolean;
  hlsKeyUrl: string;
  hlsKeyRotationSec: number;
  rtmpsEnabled: boolean;
  rtmpsUrl: string;
  srtEncryption: 'AES-128' | 'AES-192' | 'AES-256';
  srtPassphrase: string;
}

export type AlertFaultType =
  | 'input_signal_loss'
  | 'output_blank'
  | 'video_freeze'
  | 'video_glitches'
  | 'scte_missing'
  | 'scte104_signal_loss'
  | 'internet_loss';

export interface EbuR128LoudnessMetrics {
  integratedLufs: number; // Target -23.0 LUFS
  shortTermLufs: number; // 3-second window
  momentaryLufs: number; // 400ms window
  loudnessRangeLu: number; // LRA in LU
  truePeakDbtp: number; // Max True Peak in dBTP (Target <= -1.0 dBTP)
  truePeakLeftDbtp: number;
  truePeakRightDbtp: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  targetStandard: 'EBU R128 (-23 LUFS)' | 'ATSC A/85 (-24 LKFS)' | 'EBU R128 Live (-23 ±0.5 LU)';
  history: {
    time: string;
    momentary: number;
    shortTerm: number;
    integrated: number;
    truePeak: number;
  }[];
}

export interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secureMode: 'starttls' | 'ssl_tls' | 'plain';
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  toEmails: string;
  ccEmails?: string;
  cooldownMinutes: number;
  includeSnapshot: boolean;
  testStatus: 'untested' | 'sending' | 'success' | 'failed';
  lastTestMessage?: string;
}

export interface AlertTriggerRule {
  id: AlertFaultType;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'EMERGENCY';
  thresholdText: string;
  thresholdValue: number;
  triggerCount: number;
  lastTriggered?: string;
}

export interface DispatchedEmailAlert {
  id: string;
  timestamp: string;
  faultType: AlertFaultType;
  severity: 'CRITICAL' | 'WARNING' | 'EMERGENCY';
  subject: string;
  from: string;
  to: string;
  status: 'sent' | 'queued' | 'failed';
  smtpResponse: string;
  contentSnippet: string;
}

export interface ActiveIncident {
  id: string;
  faultType: AlertFaultType;
  title: string;
  startedAt: string;
  severity: 'CRITICAL' | 'WARNING' | 'EMERGENCY';
  details: string;
  acknowledged: boolean;
}

export interface Scte35Config {
  passthroughEnabled: boolean;
  mode: 'passthrough' | 'local_insert' | 'strip';
  autoReturn: boolean;
  prerollMs: number;
  defaultDurationSec: number;
}

export type ScteCueSource = 'input_srt_stream' | 'manual_output_trigger';

export interface Scte35Cue {
  id: string;
  source: ScteCueSource; // 'input_srt_stream' vs 'manual_output_trigger'
  timestamp: string;
  ptsTimecode?: string;
  eventId: number;
  commandType: 'splice_insert' | 'time_signal';
  segmentationType: 'provider_ad_start' | 'provider_ad_end' | 'program_break' | 'network_break';
  durationSec: number;
  prerollMs: number;
  hexPayload: string;
  base64Payload?: string;
  byteLength?: number;
  crc32Hex?: string;
  is41ByteStandard?: boolean;
  status: 'active' | 'completed' | 'queued' | 'passthrough_relayed';
  targetEgress?: string[];
  inputPid?: string;
  originSocket?: string;
}

export interface LBandConfig {
  active: boolean;
  squeezeScale: number; // e.g. 0.75 (75% screen)
  position: 'top-right' | 'top-left';
  transition: 'smooth' | 'cut' | 'zoom';
  astronBandActive: boolean;
  astronTitle: string;
  astronSubtitle: string;
  astronFrequencyGhz: number;
  astronSignalQualityPercent: number;
  sponsorBannerText: string;
  tickerText: string;
  tickerSpeed: number;
  autoTimerSec: number;
}

export interface LogoConfig {
  active: boolean;
  type: 'station_hd' | 'hdr_4k' | 'live_breaking' | 'custom';
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  opacity: number; // 0 to 1
  scale: number; // 0.5 to 1.5
  customText: string;
}

export interface StreamHealthMetrics {
  status: 'streaming' | 'standby' | 'error' | 'reconnecting';
  uptimeSeconds: number;
  // SRT Ingest Telemetry
  rttMs: number;
  jitterMs: number;
  packetLossPercent: number;
  packetsReceived: number;
  packetsLost: number;
  packetsRetransmitted: number;
  bufferOccupancyPercent: number;
  ingestBitrateKbps: number;
  // Transcoder & Output Telemetry
  encoderFps: number;
  encoderDroppedFrames: number;
  encoderCpuPercent: number;
  encodingLatencyMs: number;
  totalEgressBitrateKbps: number;
  hlsBitrateKbps: number;
  srtOutBitrateKbps: number;
  rtmpBitrateKbps: number;
  // QoE
  vmafScore: number;
  psnrDb: number;
  ssim: number;
  avSyncMs: number;
  bufferHealthPercent: number;
}

export interface ConnectedReceiver {
  id: string;
  name: string;
  ipAddress: string;
  country: string;
  countryCode: string;
  city: string;
  protocol: 'SRT-Listener' | 'SRT-Caller' | 'HLS' | 'LL-HLS' | 'HTTPS-HLS' | 'RTMP' | 'RTMPS';
  connectedAt: string;
  durationSeconds: number;
  bitrateKbps: number;
  rttMs: number;
  packetLossPercent: number;
  status: 'healthy' | 'choked' | 'warning';
  asn: string;
  isTlsSecured?: boolean;
  tlsCipher?: string;
}

export interface BandwidthDataPoint {
  time: string;
  timestamp: number;
  ingestBitrateKbps: number;
  hlsBitrateKbps: number;
  srtOutBitrateKbps: number;
  rtmpBitrateKbps: number;
  totalEgressKbps: number;
}

export interface QoEDataPoint {
  time: string;
  vmaf: number;
  psnr: number;
  avSync: number;
}

export type StorageTargetType = 'local_nvme' | 'ring_buffer' | 'aws_s3' | 'gcp_storage' | 'nas_nfs';
export type RecordingContainer = 'ts' | 'mp4' | 'mkv';

export interface RecordedSegment {
  id: string;
  filename: string;
  startTime: string;
  endTime?: string;
  durationSec: number;
  sizeBytes: number;
  format: RecordingContainer;
  triggerType: 'manual' | 'continuous' | 'scte35_ad_start' | 'scte35_ad_end' | 'scte35_program_break';
  scteEventId?: number;
  scteDescriptor?: string;
  ptsStart?: string;
  storageTarget: StorageTargetType;
  storagePath: string;
  status: 'recording' | 'completed' | 'uploaded';
  resolution: string;
  bitrateKbps: number;
}

export interface StreamRecorderConfig {
  enabled: boolean;
  isRecording: boolean;
  recordingStartTime?: number;
  currentSegmentId?: string;
  storageTarget: StorageTargetType;
  storagePath: string;
  container: RecordingContainer;
  segmentDurationMinutes: number;
  ringBufferDurationMinutes: number;
  autoScteSegmentation: boolean;
  excludeAdBreaksFromMaster: boolean;
  diskCapacityTotalGb: number;
  diskCapacityUsedGb: number;
  retentionDays: number;
}

export type SrtActiveSource = 'primary' | 'backup';

export interface SrtFailoverEvent {
  id: string;
  timestamp: string;
  fromSource: SrtActiveSource;
  toSource: SrtActiveSource;
  triggerReason: string;
  switchLatencyMs: number;
  autoSwitched: boolean;
}

export interface SrtFailoverConfig {
  autoFailoverEnabled: boolean;
  activeSource: SrtActiveSource;
  primaryHealth: 'healthy' | 'degraded' | 'offline';
  backupHealth: 'healthy' | 'degraded' | 'offline';
  primaryBitrateKbps: number;
  backupBitrateKbps: number;
  primaryRttMs: number;
  backupRttMs: number;
  primaryPacketLossPercent: number;
  backupPacketLossPercent: number;
  failoverThresholdSec: number;
  autoRevertToPrimary: boolean;
  revertStabilitySec: number;
  backupConfig: SrtIngestConfig;
  eventsLog: SrtFailoverEvent[];
}

export type UserRole = 'admin' | 'viewer';

export interface AuthState {
  role: UserRole;
  isLocked: boolean;
  operatorName: string;
  accessKey?: string;
}

export type EmergencyFallbackMode = 'stay_tuned' | 'montage_music' | 'emergency_playlist';
export type VideoSlateMode = 'live' | 'bars' | 'slate_break' | 'technical_diff' | 'stay_tuned' | 'montage_music' | 'emergency_playlist';

export interface EmergencyPlaylistItem {
  id: string;
  title: string;
  category: 'promo' | 'cultural' | 'commercial' | 'standby';
  durationSec: number;
  resolution: string;
  codec: string;
  aspectRatio: string;
  audioTrack: string;
}

export interface EmergencyFallbackConfig {
  autoEngageOnTotalLoss: boolean;
  activeMode: EmergencyFallbackMode;
  triggerDelaySec: number;
  autoRecoverOnSignalRestored: boolean;
  isEngaged: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  slateMessage: string;
  stationName: string;
  currentPlaylistItemIndex: number;
  currentPlaylistItemElapsedSec: number;
  playlist: EmergencyPlaylistItem[];
  lastEngagedTimestamp?: string;
  engagementCount: number;
}


