// 41-Byte SCTE-35 Digital Program Insertion Cue Generator & MPEG-2 CRC-32 Engine
// Compliant with ANSI/SCTE 35 2022 / SCTE 35 2019 standards

export interface Scte35ByteField {
  offset: number;
  byteCount: number;
  hex: string;
  name: string;
  value: string;
  desc: string;
}

export interface Scte35_41ByteResult {
  hex: string;          // 82 hex characters (41 bytes)
  base64: string;       // 56 base64 characters
  byteLength: 41;
  tableId: '0xFC';
  sectionLength: 38;    // 38 bytes after section_length field
  protocolVersion: 0;
  eventId: number;
  commandType: 'time_signal' | 'splice_insert';
  segmentationType: string;
  segmentationTypeId: number;
  durationSec: number;
  ptsTimecode: string;
  ptsTicks: number;
  crc32Hex: string;
  breakdown: Scte35ByteField[];
}

export const SCTE35_SEGMENTATION_TYPES = {
  provider_ad_start: { id: 0x34, label: 'Provider Advertisement Start (Placement Opportunity)', durationFlag: true },
  provider_ad_end: { id: 0x35, label: 'Provider Advertisement End', durationFlag: false },
  program_break: { id: 0x22, label: 'Program Break / Chapter Start', durationFlag: true },
  program_resume: { id: 0x23, label: 'Program Break End / Chapter Resume', durationFlag: false },
  network_break: { id: 0x30, label: 'Network Placement Opportunity Start', durationFlag: true },
  distributor_ad_start: { id: 0x36, label: 'Distributor Placement Opportunity Start', durationFlag: true },
} as const;

export type Scte35SegmentationKey = keyof typeof SCTE35_SEGMENTATION_TYPES;

export function crc32Mpeg2(bytes: Uint8Array, len: number): number {
  let crc = 0xffffffff;
  for (let i = 0; i < len; i++) {
    crc ^= bytes[i] << 24;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x80000000) !== 0) {
        crc = ((crc << 1) ^ 0x04c11db7) >>> 0;
      } else {
        crc = (crc << 1) >>> 0;
      }
    }
  }
  return crc >>> 0;
}

export function generate41ByteScte35Cue(params: {
  eventId?: number;
  durationSec?: number;
  commandType?: 'time_signal' | 'splice_insert';
  segmentationType?: Scte35SegmentationKey;
  ptsTicks?: number;
}): Scte35_41ByteResult {
  const eventId = params.eventId ?? Math.floor(1000 + Math.random() * 8999);
  const durationSec = params.durationSec ?? 30;
  const commandType = params.commandType ?? 'time_signal';
  const segKey = params.segmentationType ?? 'provider_ad_start';
  const segMeta = SCTE35_SEGMENTATION_TYPES[segKey] || SCTE35_SEGMENTATION_TYPES.provider_ad_start;

  // 90 kHz PTS clock ticks
  const ptsTicks = params.ptsTicks ?? Math.floor(Date.now() * 90) % 8589934592; // 33-bit rollover

  // Exact 41-Byte Buffer
  const buf = new Uint8Array(41);

  // 0: Table ID = 0xFC (SCTE 35 splice_info_section)
  buf[0] = 0xfc;

  // 1-2: section_syntax_indicator(0), private_indicator(0), SAP_type(11=3), section_length(12 bits = 38)
  // 38 bytes follow section_length, making 3 + 38 = 41 bytes total!
  buf[1] = 0x30;
  buf[2] = 0x26; // 0x026 = 38 bytes

  // 3: protocol_version = 0
  buf[3] = 0x00;

  // 4-8: encrypted_packet=0, encryption_algorithm=0, pts_adjustment = 0 (33 bits)
  buf[4] = 0x00;
  buf[5] = 0x00;
  buf[6] = 0x00;
  buf[7] = 0x00;
  buf[8] = 0x00;

  // 9: cw_index = 0
  buf[9] = 0x00;

  // 10-11: tier = 0xFFF, splice_command_length = 5 bytes (0x005)
  buf[10] = 0xff;
  buf[11] = 0xf5; // 0xF tier | 0x005 splice_command_length

  if (commandType === 'time_signal') {
    // 12: splice_command_type = 0x06 (time_signal)
    buf[12] = 0x06;

    // 13-17: time_signal() body: time_specified_flag = 1, reserved (6 bits = 0x3F), pts_time (33 bits)
    buf[13] = 0xfe | ((ptsTicks >> 32) & 0x01);
    buf[14] = (ptsTicks >> 24) & 0xff;
    buf[15] = (ptsTicks >> 16) & 0xff;
    buf[16] = (ptsTicks >> 8) & 0xff;
    buf[17] = ptsTicks & 0xff;

    // 18-19: descriptor_loop_length = 17 bytes (0x0011)
    buf[18] = 0x00;
    buf[19] = 0x11;

    // 20-36: segmentation_descriptor()
    // 20: splice_descriptor_tag = 0x02 (segmentation_descriptor)
    buf[20] = 0x02;
    // 21: descriptor_length = 15 bytes (0x0F)
    buf[21] = 0x0f;
    // 22-25: identifier = 0x43554549 (ASCII "CUEI")
    buf[22] = 0x43; // C
    buf[23] = 0x55; // U
    buf[24] = 0x45; // E
    buf[25] = 0x49; // I

    // 26-29: segmentation_event_id (4 bytes)
    buf[26] = (eventId >> 24) & 0xff;
    buf[27] = (eventId >> 16) & 0xff;
    buf[28] = (eventId >> 8) & 0xff;
    buf[29] = eventId & 0xff;

    // 30: segmentation_event_cancel_indicator(0), reserved(7 bits = 0x7F)
    buf[30] = 0x7f;

    // 31: program_segmentation_flag(1), segmentation_duration_flag(1), delivery_not_restricted_flag(1), web_delivery_allowed(1), no_regional_blackout(1), archive_allowed(1), device_restrictions(11) = 0xBF
    buf[31] = 0xbf;

    // 32-35: segmentation_duration (32 bits of 90kHz ticks = durationSec * 90000)
    const durationTicks = Math.round(durationSec * 90000);
    buf[32] = (durationTicks >> 24) & 0xff;
    buf[33] = (durationTicks >> 16) & 0xff;
    buf[34] = (durationTicks >> 8) & 0xff;
    buf[35] = durationTicks & 0xff;

    // 36: segmentation_type_id (1 byte)
    buf[36] = segMeta.id;
  } else {
    // 41-byte splice_insert variant
    buf[12] = 0x05; // splice_insert
    buf[13] = (eventId >> 24) & 0xff;
    buf[14] = (eventId >> 16) & 0xff;
    buf[15] = (eventId >> 8) & 0xff;
    buf[16] = eventId & 0xff;

    buf[17] = 0x7f; // splice_event_cancel_indicator=0
    buf[18] = 0xc0; // out_of_network=1, program_splice=1, duration_flag=1
    // splice_time
    buf[19] = 0xfe | ((ptsTicks >> 32) & 0x01);
    buf[20] = (ptsTicks >> 24) & 0xff;
    buf[21] = (ptsTicks >> 16) & 0xff;
    buf[22] = (ptsTicks >> 8) & 0xff;
    buf[23] = ptsTicks & 0xff;

    // break_duration (auto_return=1, duration=durationSec*90000)
    const durationTicks = Math.round(durationSec * 90000);
    buf[24] = 0x80 | ((durationTicks >> 32) & 0x01);
    buf[25] = (durationTicks >> 24) & 0xff;
    buf[26] = (durationTicks >> 16) & 0xff;
    buf[27] = (durationTicks >> 8) & 0xff;
    buf[28] = durationTicks & 0xff;

    // unique_program_id = 1
    buf[29] = 0x00;
    buf[30] = 0x01;
    // avail_num=1, avails_expected=1
    buf[31] = 0x01;
    buf[32] = 0x01;

    // descriptor_loop_length = 3
    buf[33] = 0x00;
    buf[34] = 0x03;
    // dummy padding descriptor
    buf[35] = 0x00;
    buf[36] = 0x01;
  }

  // 37-40: 32-Bit MPEG-2 CRC
  const crc = crc32Mpeg2(buf, 37);
  buf[37] = (crc >>> 24) & 0xff;
  buf[38] = (crc >>> 16) & 0xff;
  buf[39] = (crc >>> 8) & 0xff;
  buf[40] = crc & 0xff;

  // Convert to Uppercase Hex String (82 characters)
  const hex = Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');

  // Base64 String (56 characters)
  let binaryStr = '';
  for (let i = 0; i < buf.length; i++) {
    binaryStr += String.fromCharCode(buf[i]);
  }
  const base64 = btoa(binaryStr);

  const crcHex = crc.toString(16).padStart(8, '0').toUpperCase();

  // Seconds / Milliseconds formatted PTS
  const totalSec = ptsTicks / 90000;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = (totalSec % 60).toFixed(3);
  const ptsTimecode = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.padStart(6, '0')}`;

  // Byte Breakdown for Educational / Engineering inspection
  const breakdown: Scte35ByteField[] = [
    { offset: 0, byteCount: 1, hex: buf[0].toString(16).padStart(2, '0').toUpperCase(), name: 'table_id', value: '0xFC (252)', desc: 'SCTE-35 Splice Information Table' },
    { offset: 1, byteCount: 2, hex: hex.slice(2, 6), name: 'section_length', value: '38 bytes (0x026)', desc: 'Section length (Total section = 41 bytes)' },
    { offset: 3, byteCount: 1, hex: '00', name: 'protocol_version', value: '0', desc: 'ANSI/SCTE 35 protocol version' },
    { offset: 4, byteCount: 5, hex: hex.slice(8, 18), name: 'pts_adjustment', value: '0 ticks', desc: 'PTS clock offset compensation' },
    { offset: 9, byteCount: 1, hex: '00', name: 'cw_index', value: '0', desc: 'Control word index (unencrypted)' },
    { offset: 10, byteCount: 2, hex: hex.slice(20, 24), name: 'tier & command_length', value: 'Tier 0xFFF, Len 5B', desc: 'Authorization tier & splice command length' },
    { offset: 12, byteCount: 1, hex: buf[12].toString(16).padStart(2, '0').toUpperCase(), name: 'splice_command_type', value: commandType === 'time_signal' ? '0x06 (time_signal)' : '0x05 (splice_insert)', desc: 'Command type identifier' },
    { offset: 13, byteCount: 5, hex: hex.slice(26, 36), name: 'pts_time', value: `${ptsTimecode} (${ptsTicks} ticks)`, desc: 'Exact 90 kHz presentation timestamp for splice execution' },
    { offset: 18, byteCount: 2, hex: hex.slice(36, 40), name: 'descriptor_loop_length', value: `${(buf[18] << 8) | buf[19]} bytes`, desc: 'Length of subsequent splice descriptors' },
    { offset: 20, byteCount: 2, hex: hex.slice(40, 44), name: 'descriptor_tag & length', value: 'Tag 0x02, Len 15B', desc: 'SCTE-35 segmentation_descriptor' },
    { offset: 22, byteCount: 4, hex: hex.slice(44, 52), name: 'identifier', value: '0x43554549 ("CUEI")', desc: 'Standard SCTE 35 CUEI registration identifier' },
    { offset: 26, byteCount: 4, hex: hex.slice(52, 60), name: 'segmentation_event_id', value: `#${eventId}`, desc: 'Unique advertiser / program break event ID' },
    { offset: 30, byteCount: 2, hex: hex.slice(60, 64), name: 'segmentation_flags', value: '0x7FBF', desc: 'Program segmentation, duration & delivery flags' },
    { offset: 32, byteCount: 4, hex: hex.slice(64, 72), name: 'segmentation_duration', value: `${durationSec}s (${durationSec * 90000} ticks)`, desc: 'Specified ad break / placement duration' },
    { offset: 36, byteCount: 1, hex: buf[36].toString(16).padStart(2, '0').toUpperCase(), name: 'segmentation_type_id', value: `0x${buf[36].toString(16).padStart(2, '0').toUpperCase()} (${segMeta.label})`, desc: 'UPID segmentation type identifier' },
    { offset: 37, byteCount: 4, hex: crcHex, name: 'CRC_32', value: `0x${crcHex}`, desc: 'MPEG-2 32-bit polynomial error detection checksum' },
  ];

  return {
    hex,
    base64,
    byteLength: 41,
    tableId: '0xFC',
    sectionLength: 38,
    protocolVersion: 0,
    eventId,
    commandType,
    segmentationType: segMeta.label,
    segmentationTypeId: segMeta.id,
    durationSec,
    ptsTimecode,
    ptsTicks,
    crc32Hex: crcHex,
    breakdown,
  };
}
