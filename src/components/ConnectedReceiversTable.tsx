import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Globe,
  Radio,
  Download,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { ConnectedReceiver } from '../types/stream';

export const ConnectedReceiversTable: React.FC = () => {
  const { receivers, disconnectReceiver, addMockReceiver, videoConfig } = useStream();
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [selectedReceiver, setSelectedReceiver] = useState<ConnectedReceiver | null>(null);

  // Filter receivers
  const filteredReceivers = receivers.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ipAddress.includes(searchTerm) ||
      r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.asn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProtocol =
      protocolFilter === 'all' ||
      (protocolFilter === 'srt' && r.protocol.startsWith('SRT')) ||
      (protocolFilter === 'hls' && r.protocol.includes('HLS')) ||
      (protocolFilter === 'rtmp' && r.protocol === 'RTMP');

    return matchesSearch && matchesProtocol;
  });

  // Calculate totals
  const totalBitrateKbps = receivers.reduce((acc, r) => acc + r.bitrateKbps, 0);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'IP Address', 'Country', 'City', 'Protocol', 'Bitrate(kbps)', 'RTT(ms)', 'PacketLoss(%)', 'ConnectedAt', 'ASN'];
    const rows = receivers.map((r) => [
      r.id,
      `"${r.name}"`,
      r.ipAddress,
      r.country,
      `"${r.city}"`,
      r.protocol,
      r.bitrateKbps,
      r.rttMs,
      r.packetLossPercent,
      r.connectedAt,
      `"${r.asn}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `srt_mcr_active_receivers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4">
      {/* Header & Aggregates */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-sky-950 border border-sky-800/60 text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                Connected Downlinks & Viewer IP Directory
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                {receivers.length} ACTIVE CLIENTS
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live socket tracking for all SRT callers, LL-HLS pull clients, and RTMP downlinks.
            </p>
          </div>
        </div>

        {/* Aggregate Bandwidth & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono">
            <span className="text-neutral-500">AGGREGATE EGRESS:</span>
            <span className="text-amber-400 font-bold">
              {(totalBitrateKbps / 1000).toFixed(2)} Mbps
            </span>
          </div>

          <button
            onClick={addMockReceiver}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono transition"
            title="Simulate a new incoming client connection"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Simulate Client</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono transition"
            title="Export full client list to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by IP, client name, city, ASN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none text-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-neutral-500 hover:text-neutral-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Protocol Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setProtocolFilter('all')}
            className={`px-2.5 py-1 rounded text-[11px] transition ${
              protocolFilter === 'all'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            All Protocols ({receivers.length})
          </button>
          <button
            onClick={() => setProtocolFilter('srt')}
            className={`px-2.5 py-1 rounded text-[11px] transition ${
              protocolFilter === 'srt'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            SRT Downlinks
          </button>
          <button
            onClick={() => setProtocolFilter('hls')}
            className={`px-2.5 py-1 rounded text-[11px] transition ${
              protocolFilter === 'hls'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            HLS / LL-HLS
          </button>
          <button
            onClick={() => setProtocolFilter('rtmp')}
            className={`px-2.5 py-1 rounded text-[11px] transition ${
              protocolFilter === 'rtmp'
                ? 'bg-pink-600 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            RTMP Out
          </button>
        </div>
      </div>

      {/* Table of Receivers */}
      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800">
            <tr>
              <th className="py-2.5 px-3">RECEIVER / CLIENT ID</th>
              <th className="py-2.5 px-3">IP ADDRESS & GEO</th>
              <th className="py-2.5 px-3">PROTOCOL</th>
              <th className="py-2.5 px-3">BITRATE</th>
              <th className="py-2.5 px-3">RTT / LATENCY</th>
              <th className="py-2.5 px-3">LOSS %</th>
              <th className="py-2.5 px-3">DURATION</th>
              <th className="py-2.5 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 bg-neutral-950">
            {filteredReceivers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-500">
                  No connected receivers match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredReceivers.map((r) => {
                const isHealthy = r.status === 'healthy';
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-neutral-900/40 transition group cursor-pointer"
                    onClick={() => setSelectedReceiver(r)}
                  >
                    {/* Name & ID */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHealthy ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        <div>
                          <div className="font-bold text-neutral-200 group-hover:text-sky-300 transition">
                            {r.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">{r.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* IP & Country */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-sky-400">{r.ipAddress}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-neutral-500" />
                        <span>{r.city}, {r.country}</span>
                        <span className="text-[9px] px-1 rounded bg-neutral-800 text-neutral-400 ml-1">
                          {r.countryCode}
                        </span>
                      </div>
                    </td>

                    {/* Protocol & TLS Status */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.protocol.startsWith('SRT')
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                              : r.protocol.includes('HLS')
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : 'bg-pink-950/80 text-pink-300 border border-pink-800/60'
                          }`}
                        >
                          {r.protocol}
                        </span>
                        {r.isTlsSecured && (
                          <span
                            className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80"
                            title={`Encrypted Connection: ${r.tlsCipher || 'TLS 1.3'}`}
                          >
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Bitrate */}
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-neutral-200">
                        {(r.bitrateKbps / 1000).toFixed(2)}
                      </span>{' '}
                      <span className="text-neutral-500 text-[10px]">Mbps</span>
                    </td>

                    {/* RTT */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`${
                          r.rttMs < 50
                            ? 'text-emerald-400'
                            : r.rttMs < 120
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        } font-bold`}
                      >
                        {r.rttMs} ms
                      </span>
                    </td>

                    {/* Loss */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`${
                          r.packetLossPercent < 0.05 ? 'text-neutral-300' : 'text-rose-400 font-bold'
                        }`}
                      >
                        {r.packetLossPercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-2.5 px-3 text-neutral-400">
                      {formatDuration(r.durationSeconds)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => disconnectReceiver(r.id)}
                        className="p-1 rounded bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 border border-neutral-800 hover:border-rose-800 transition"
                        title="Disconnect receiver socket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Receiver Detailed Diagnostic Modal */}
      {selectedReceiver && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm text-neutral-100">Receiver Telemetry Detail</h4>
              </div>
              <button
                onClick={() => setSelectedReceiver(null)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Client Name:</span>
                <span className="text-neutral-200 font-bold">{selectedReceiver.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">IP Address:</span>
                <span className="text-sky-400 font-bold">{selectedReceiver.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Autonomous System:</span>
                <span className="text-neutral-300">{selectedReceiver.asn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Location:</span>
                <span className="text-neutral-300">
                  {selectedReceiver.city}, {selectedReceiver.country} ({selectedReceiver.countryCode})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Ingest Protocol:</span>
                <span className="text-emerald-400 font-bold">{selectedReceiver.protocol}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Consuming Bitrate:</span>
                <span className="text-amber-400 font-bold">
                  {(selectedReceiver.bitrateKbps / 1000).toFixed(2)} Mbps
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Round Trip Time (RTT):</span>
                <span className="text-neutral-200 font-bold">{selectedReceiver.rttMs} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Packet Loss Rate:</span>
                <span className="text-emerald-400 font-bold">{selectedReceiver.packetLossPercent}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Connected Since:</span>
                <span className="text-neutral-300">{selectedReceiver.connectedAt} ({formatDuration(selectedReceiver.durationSeconds)})</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  disconnectReceiver(selectedReceiver.id);
                  setSelectedReceiver(null);
                }}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition"
              >
                Disconnect Receiver
              </button>
              <button
                onClick={() => setSelectedReceiver(null)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
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
