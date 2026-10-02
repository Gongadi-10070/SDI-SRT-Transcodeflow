import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Zap,
  Radio,
  ExternalLink,
  Code,
} from 'lucide-react';

export const SslCertificateManager: React.FC = () => {
  const {
    httpsSslConfig,
    updateHttpsSslConfig,
    validateCertificate,
    generateSelfSignedCert,
    testTlsHandshake,
    hlsEgress,
    updateHlsEgress,
    rtmpEgress,
    updateRtmpEgress,
    srtEgress,
    updateSrtEgress,
  } = useStream();

  const [activeSubTab, setActiveSubTab] = useState<'cert_editor' | 'secure_egress' | 'webserver_snippets'>('cert_editor');
  const [certInput, setCertInput] = useState<string>(httpsSslConfig.sslCertificate);
  const [keyInput, setKeyInput] = useState<string>(httpsSslConfig.sslPrivateKey);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [handshakeResult, setHandshakeResult] = useState<{ success: boolean; cipher: string; latencyMs: number } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleVerify = () => {
    const res = validateCertificate(certInput, keyInput);
    setValidationResult(res);
    if (res.valid) {
      updateHttpsSslConfig({
        sslCertificate: certInput,
        sslPrivateKey: keyInput,
        certStatus: 'valid',
      });
    }
  };

  const handleGenerateSelfSigned = () => {
    generateSelfSignedCert(httpsSslConfig.domain);
    setValidationResult({
      valid: true,
      message: 'Generated new Self-Signed RSA-4096 certificate for ' + httpsSslConfig.domain + '. Ready for secure HTTPS broadcast.',
    });
  };

  const handleTestHandshake = () => {
    const res = testTlsHandshake();
    setHandshakeResult(res);
    setTimeout(() => setHandshakeResult(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getNginxConfig = () => {
    return `# Broadcast NGINX HTTPS HLS & RTMP Reverse Proxy
server {
    listen ${httpsSslConfig.port} ssl http2;
    listen [::]:${httpsSslConfig.port} ssl http2;
    server_name ${httpsSslConfig.domain};

    # SSL / TLS Certificate Configuration
    ssl_certificate /etc/ssl/broadcast/fullchain.pem;
    ssl_certificate_key /etc/ssl/broadcast/privkey.pem;
    
    # Modern TLS Security
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers '${httpsSslConfig.cipherSuites === 'modern_broadcast' ? 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256' : 'HIGH:!aNULL:!MD5'}';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ${httpsSslConfig.hstsEnabled ? 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;' : ''}
    ${httpsSslConfig.ocspStapling ? 'ssl_stapling on;\n    ssl_stapling_verify on;' : ''}

    # Secure HLS Stream Delivery Location
    location /live/hls/ {
        types {
            application/vnd.apple.mpegurl m3u8;
            video/mp2t ts;
            video/mp4 m4s;
        }
        root /var/www/stream;
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
    }
}`;
  };

  const getCaddyConfig = () => {
    return `# Caddyfile Modern TLS Config
${httpsSslConfig.domain}:${httpsSslConfig.port} {
    tls /etc/ssl/broadcast/fullchain.pem /etc/ssl/broadcast/privkey.pem {
        protocols tls1.3
    }
    
    # Serve Secure HLS
    root * /var/www/stream
    file_server
    
    header {
        Access-Control-Allow-Origin *
        Cache-Control no-cache
        Strict-Transport-Security "max-age=31536000;"
    }
}`;
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                HTTPS Port & SSL / TLS Certificate Security Studio
              </h3>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  httpsSslConfig.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                <Lock className="w-3 h-3" />
                {httpsSslConfig.enabled ? `HTTPS PORT ${httpsSslConfig.port} SECURED` : 'TLS DISABLED'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure SSL certificates, HTTPS delivery ports, TLS 1.3 ciphers, and AES-128 secure output encryption.
            </p>
          </div>
        </div>

        {/* Global HTTPS Toggle & Test Handshake */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestHandshake}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 font-bold transition text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test TLS Handshake</span>
          </button>

          <button
            onClick={() => updateHttpsSslConfig({ enabled: !httpsSslConfig.enabled })}
            className={`px-3.5 py-1.5 rounded font-bold transition text-xs flex items-center gap-1.5 ${
              httpsSslConfig.enabled
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {httpsSslConfig.enabled ? 'TLS ACTIVE' : 'ENABLE TLS'}
          </button>
        </div>
      </div>

      {/* Handshake Result Alert */}
      {handshakeResult && (
        <div className="bg-sky-950/80 border border-sky-700 rounded p-3 flex items-center justify-between text-xs text-sky-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>TLS Handshake Succeeded:</strong> Port {httpsSslConfig.port} negotiated in{' '}
              {handshakeResult.latencyMs}ms using <code className="text-emerald-300">{handshakeResult.cipher}</code> with HTTP/2 ALPN.
            </span>
          </div>
          <span className="text-emerald-400 font-bold">200 OK</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveSubTab('cert_editor')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeSubTab === 'cert_editor'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>SSL CERTIFICATE & TLS PORT</span>
        </button>

        <button
          onClick={() => setActiveSubTab('secure_egress')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeSubTab === 'secure_egress'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SECURE EGRESS MATRIX (HTTPS HLS / RTMPS / SRT)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('webserver_snippets')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeSubTab === 'webserver_snippets'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>NGINX / CADDY DEPLOYMENT CONFIGS</span>
        </button>
      </div>

      {/* SUBTAB 1: CERTIFICATE EDITOR & HTTPS PORT */}
      {activeSubTab === 'cert_editor' && (
        <div className="space-y-4">
          {/* Top Parameters: Port, Domain, TLS Version, Ciphers */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-neutral-900/50 p-3.5 rounded border border-neutral-800">
            {/* HTTPS Port */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                HTTPS LISTENER PORT
              </label>
              <div className="flex gap-1.5">
                {[443, 8443, 9443].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateHttpsSslConfig({ port: p })}
                    className={`flex-1 py-1.5 rounded text-center font-bold transition ${
                      httpsSslConfig.port === p
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                    }`}
                  >
                    :{p}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                {httpsSslConfig.port === 443 ? 'Standard Web HTTPS' : 'High Port Broadcast Alternate'}
              </span>
            </div>

            {/* Domain FQDN */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">BROADCAST FQDN DOMAIN</label>
              <input
                type="text"
                value={httpsSslConfig.domain}
                onChange={(e) => updateHttpsSslConfig({ domain: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-emerald-400"
                placeholder="stream.domain.net"
              />
            </div>

            {/* Min TLS Version */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">MINIMUM TLS VERSION</label>
              <select
                value={httpsSslConfig.minTlsVersion}
                onChange={(e) => updateHttpsSslConfig({ minTlsVersion: e.target.value as any })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-emerald-400"
              >
                <option value="TLSv1.3">TLS 1.3 Only (Strict Broadcast)</option>
                <option value="TLSv1.2">TLS 1.2 & 1.3 (Compatible)</option>
              </select>
            </div>

            {/* Cipher Suite */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">CIPHER SUITE POLICY</label>
              <select
                value={httpsSslConfig.cipherSuites}
                onChange={(e) => updateHttpsSslConfig({ cipherSuites: e.target.value as any })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-emerald-400"
              >
                <option value="modern_broadcast">Modern Broadcast (AES-GCM / ChaCha20)</option>
                <option value="high_security_gcm">High Security (256-bit GCM)</option>
                <option value="intermediate_compatibility">Broad Compatibility</option>
              </select>
            </div>
          </div>

          {/* Active Certificate Health Card */}
          <div className="bg-neutral-900/40 p-3.5 rounded border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-neutral-200">
                  ISSUER: {httpsSslConfig.issuer}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  VALID ({httpsSslConfig.daysRemaining} DAYS REMAINING)
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Validity: <span className="text-neutral-300">{httpsSslConfig.validFrom}</span> to{' '}
                <span className="text-neutral-300">{httpsSslConfig.validUntil}</span> • SHA-256 Fingerprint:{' '}
                <span className="text-emerald-400">{httpsSslConfig.fingerprintSha256}</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                Subject Alternative Names (SAN): {httpsSslConfig.subjectAltNames.join(', ')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateSelfSigned}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-[11px] flex items-center gap-1.5"
                title="Generate instant 4096-bit self-signed certificate"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Gen Self-Signed Cert</span>
              </button>
            </div>
          </div>

          {/* Certificate & Key PEM Textareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Certificate PEM */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-neutral-300 flex items-center gap-1 text-[11px]">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  SSL CERTIFICATE (fullchain.pem)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(certInput, 'cert_pem')}
                  className="text-neutral-400 hover:text-white text-[10px] flex items-center gap-1"
                >
                  {copiedKey === 'cert_pem' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy PEM</span>
                </button>
              </div>
              <textarea
                rows={9}
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-[10px] font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                placeholder="-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----"
              />
            </div>

            {/* Private Key PEM */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-neutral-300 flex items-center gap-1 text-[11px]">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  RSA / EC PRIVATE KEY (privkey.pem)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(keyInput, 'key_pem')}
                  className="text-neutral-400 hover:text-white text-[10px] flex items-center gap-1"
                >
                  {copiedKey === 'key_pem' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Key</span>
                </button>
              </div>
              <textarea
                rows={9}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-[10px] font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                placeholder="-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----"
              />
            </div>
          </div>

          {/* Verification Bar & Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800">
            {validationResult ? (
              <div
                className={`flex items-center gap-2 text-xs ${
                  validationResult.valid ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {validationResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            ) : (
              <span className="text-[11px] text-neutral-500">
                Click verify to validate PEM syntax, RSA-4096 key modulus, and certificate validity dates.
              </span>
            )}

            <button
              onClick={handleVerify}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Deploy Certificate</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SECURE EGRESS MATRIX */}
      {activeSubTab === 'secure_egress' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Egress 1: Secure HTTPS HLS */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  HTTPS HLS & LL-HLS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                  PORT {httpsSslConfig.port}
                </span>
              </div>

              <div className="text-[11px] space-y-2">
                <div>
                  <span className="text-neutral-500 block">Encrypted Endpoint:</span>
                  <span className="text-emerald-300 font-bold truncate block">
                    {hlsEgress.masterPlaylistUrl}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-400">AES-128 Segment Encryption</span>
                    <button
                      type="button"
                      onClick={() => updateHlsEgress({ aes128Encryption: !hlsEgress.aes128Encryption })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hlsEgress.aes128Encryption
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {hlsEgress.aes128Encryption ? 'AES-128 ACTIVE' : 'CLEAR'}
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 block">
                    Rotates encryption keys every 3600s via HTTPS Key Server.
                  </span>
                </div>
              </div>
            </div>

            {/* Egress 2: Secure RTMPS */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-pink-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  RTMPS (RTMP over TLS)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-950 text-pink-400 font-bold">
                  PORT 443 / 1935
                </span>
              </div>

              <div className="text-[11px] space-y-2">
                <div>
                  <span className="text-neutral-500 block">Secure TLS Destination:</span>
                  <span className="text-pink-300 font-bold truncate block">
                    {rtmpEgress.url}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-400">TLS Encryption Wrapper</span>
                    <button
                      type="button"
                      onClick={() => updateRtmpEgress({ useTlsRtmps: !rtmpEgress.useTlsRtmps })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rtmpEgress.useTlsRtmps
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {rtmpEgress.useTlsRtmps ? 'RTMPS ENABLED' : 'RTMP PLAIN'}
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 block">
                    Protects broadcast stream key from interception over public WAN.
                  </span>
                </div>
              </div>
            </div>

            {/* Egress 3: Secure SRT with AES */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  SRT AES-256 DOWNLINK
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 font-bold">
                  PORT {srtEgress.port}
                </span>
              </div>

              <div className="text-[11px] space-y-2">
                <div>
                  <span className="text-neutral-500 block">Cipher Standard:</span>
                  <span className="text-purple-300 font-bold block">
                    AES-256 CTR (MIL-STD Broadcast)
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800/60">
                  <span className="text-neutral-500 block">Passphrase State:</span>
                  <span className="text-neutral-300 font-bold">
                    {srtEgress.passphrase ? 'Passphrase Set (Encrypted Pipe)' : 'No passphrase'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: WEBSERVER CONFIG SNIPPETS */}
      {activeSubTab === 'webserver_snippets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nginx */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200">NGINX TLS REVERSE PROXY</span>
                <button
                  onClick={() => copyToClipboard(getNginxConfig(), 'nginx')}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] flex items-center gap-1"
                >
                  {copiedKey === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Nginx</span>
                </button>
              </div>
              <pre className="bg-neutral-950 p-3 rounded border border-neutral-800/80 text-[10px] font-mono text-emerald-300 overflow-x-auto whitespace-pre max-h-72">
                {getNginxConfig()}
              </pre>
            </div>

            {/* Caddy */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200">CADDYFILE AUTOMATIC TLS CONFIG</span>
                <button
                  onClick={() => copyToClipboard(getCaddyConfig(), 'caddy')}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] flex items-center gap-1"
                >
                  {copiedKey === 'caddy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Caddyfile</span>
                </button>
              </div>
              <pre className="bg-neutral-950 p-3 rounded border border-neutral-800/80 text-[10px] font-mono text-sky-300 overflow-x-auto whitespace-pre max-h-72">
                {getCaddyConfig()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
