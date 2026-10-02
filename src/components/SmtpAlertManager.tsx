import React, { useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Mail,
  Send,
  AlertTriangle,
  ShieldAlert,
  Bell,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  Eye,
  Settings,
  Server,
  Key,
  Inbox,
  Flame,
  WifiOff,
  Tv2,
  Zap,
} from 'lucide-react';
import { AlertFaultType, DispatchedEmailAlert } from '../types/stream';

export const SmtpAlertManager: React.FC = () => {
  const {
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
    srtIngest,
  } = useStream();

  const [activeTab, setActiveTab] = useState<'smtp_settings' | 'fault_rules' | 'simulation_console' | 'email_log'>('smtp_settings');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmailAlert | null>(null);

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await sendTestSmtpEmail();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'SMTP Handshake Error' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const getFaultIcon = (faultType: AlertFaultType) => {
    switch (faultType) {
      case 'input_signal_loss':
        return <WifiOff className="w-4 h-4 text-rose-400" />;
      case 'output_blank':
        return <Tv2 className="w-4 h-4 text-amber-400" />;
      case 'video_freeze':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'video_glitches':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'scte_missing':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'scte104_signal_loss':
        return <Zap className="w-4 h-4 text-rose-400" />;
      case 'internet_loss':
        return <Flame className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-rose-950 border border-rose-800/60 text-rose-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                SMTP Mail Alert Dispatcher & Broadcast Fault Engine
              </h3>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  smtpConfig.enabled
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                <Bell className="w-3 h-3" />
                {smtpConfig.enabled ? 'ALERTS ACTIVE' : 'ALERTS DISABLED'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Automated email notifications for signal loss, blackout, freeze, glitches, SCTE missing, and network drop.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {activeIncidents.length > 0 && (
            <button
              onClick={clearIncidents}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold transition text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Clear Incidents ({activeIncidents.length})</span>
            </button>
          )}

          <button
            onClick={() => updateSmtpConfig({ enabled: !smtpConfig.enabled })}
            className={`px-3.5 py-1.5 rounded font-bold transition text-xs flex items-center gap-1.5 ${
              smtpConfig.enabled
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            {smtpConfig.enabled ? 'SMTP ACTIVE' : 'ENABLE SMTP'}
          </button>
        </div>
      </div>

      {/* Active Incidents Banner if any active fault */}
      {activeIncidents.length > 0 && (
        <div className="bg-rose-950/80 border-2 border-rose-600 rounded-lg p-3.5 flex flex-col gap-2.5 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-300 flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              ACTIVE MCR BROADCAST INCIDENTS ({activeIncidents.length})
            </span>
            <span className="text-[11px] text-rose-400">
              ALERT EMAILS DISPATCHED TO: {smtpConfig.toEmails}
            </span>
          </div>

          <div className="space-y-1.5">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-neutral-950/90 border border-rose-800/80 rounded p-2 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {getFaultIcon(inc.faultType)}
                  <div>
                    <span className="font-bold text-rose-200">{inc.title}</span>
                    <span className="text-[11px] text-neutral-400 block">{inc.details}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400">{inc.startedAt}</span>
                  {!inc.acknowledged ? (
                    <button
                      onClick={() => acknowledgeIncident(inc.id)}
                      className="px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold">ACKNOWLEDGED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('smtp_settings')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'smtp_settings'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>SMTP SERVER & RECIPIENTS</span>
        </button>

        <button
          onClick={() => setActiveTab('fault_rules')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'fault_rules'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>FAULT TRIGGER RULES (6 RULES)</span>
        </button>

        <button
          onClick={() => setActiveTab('simulation_console')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'simulation_console'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>FAULT SIMULATION RACK</span>
        </button>

        <button
          onClick={() => setActiveTab('email_log')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
            activeTab === 'email_log'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>DISPATCHED ALERTS LOG ({dispatchedAlerts.length})</span>
        </button>
      </div>

      {/* TAB 1: SMTP SETTINGS */}
      {activeTab === 'smtp_settings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Server Host & Auth */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-rose-400" />
                SMTP SERVER CREDENTIALS
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-neutral-400 text-[11px] block mb-1">SMTP SERVER HOST</label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => updateSmtpConfig({ host: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-rose-400"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">SMTP PORT</label>
                  <div className="flex gap-1">
                    {[587, 465, 25].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          updateSmtpConfig({
                            port: p,
                            secureMode: p === 465 ? 'ssl_tls' : p === 587 ? 'starttls' : 'plain',
                          })
                        }
                        className={`flex-1 py-1.5 rounded text-center font-bold text-xs ${
                          smtpConfig.port === p
                            ? 'bg-rose-600 text-white'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                        }`}
                      >
                        :{p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">SECURITY / TLS</label>
                  <select
                    value={smtpConfig.secureMode}
                    onChange={(e) => updateSmtpConfig({ secureMode: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 uppercase"
                  >
                    <option value="starttls">STARTTLS (Port 587 Standard)</option>
                    <option value="ssl_tls">SSL / TLS (Port 465 Implicit)</option>
                    <option value="plain">Plain / Internal Relay</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 text-[11px] block mb-1">ALERT COOLDOWN</label>
                  <select
                    value={smtpConfig.cooldownMinutes}
                    onChange={(e) => updateSmtpConfig({ cooldownMinutes: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value={2}>2 minutes</option>
                    <option value={5}>5 minutes (Recommended)</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">SMTP USERNAME / AUTH</label>
                <input
                  type="text"
                  value={smtpConfig.username}
                  onChange={(e) => updateSmtpConfig({ username: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  SMTP PASSWORD / APP PASSWORD
                </label>
                <input
                  type="password"
                  value={smtpConfig.password}
                  onChange={(e) => updateSmtpConfig({ password: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  placeholder="App password or secret"
                />
              </div>
            </div>

            {/* Right Column: From / To Email Routing */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-3">
              <span className="font-bold text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                EMAIL ADDRESS ROUTING (FROM / TO CONFIG)
              </span>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  FROM SENDER EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => updateSmtpConfig({ fromEmail: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-rose-400"
                  placeholder="mcr-alerts@yourdomain.com"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  FROM SENDER DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={smtpConfig.fromName}
                  onChange={(e) => updateSmtpConfig({ fromName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-rose-400"
                  placeholder="SRT TranscodeFlow MCR Alert Engine"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1 font-bold text-rose-300">
                  PRIMARY RECIPIENT EMAIL(S) (TO:)
                </label>
                <input
                  type="text"
                  value={smtpConfig.toEmails}
                  onChange={(e) => updateSmtpConfig({ toEmails: e.target.value })}
                  className="w-full bg-neutral-950 border-2 border-rose-500/60 rounded px-2.5 py-1.5 text-white font-bold focus:border-rose-400"
                  placeholder="lohiraju10070@gmail.com, oncall@domain.com"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Supports multiple comma-separated email addresses for on-call engineer notification.
                </span>
              </div>

              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  CARBON COPY RECIPIENTS (CC:)
                </label>
                <input
                  type="text"
                  value={smtpConfig.ccEmails || ''}
                  onChange={(e) => updateSmtpConfig({ ccEmails: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  placeholder="broadcast-team@domain.com"
                />
              </div>
            </div>
          </div>

          {/* Test Dispatch Bar */}
          <div className="bg-neutral-900/40 p-3.5 rounded border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-neutral-200">VERIFY LIVE SMTP CONNECTIVITY</div>
              <div className="text-[11px] text-neutral-400">
                Dispatches a live test alert to <strong className="text-rose-300">{smtpConfig.toEmails}</strong> via{' '}
                <strong className="text-neutral-200">{smtpConfig.host}:{smtpConfig.port}</strong>.
              </div>
            </div>

            <button
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingSmtp ? 'DISPATCHING TEST...' : 'SEND TEST SMTP EMAIL NOW'}</span>
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-700 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAULT TRIGGER RULES */}
      {activeTab === 'fault_rules' && (
        <div className="space-y-3">
          <div className="text-neutral-400 text-xs">
            Configure automated alarm thresholds. When a trigger condition is met, an email is dispatched instantly.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertRules.map((rule) => {
              const isCrit = rule.severity === 'EMERGENCY' || rule.severity === 'CRITICAL';
              return (
                <div
                  key={rule.id}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 flex flex-col justify-between gap-3 hover:border-neutral-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                        {getFaultIcon(rule.id)}
                        <span>{rule.name}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          isCrit
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400">{rule.description}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Threshold:</span>
                      <span className="text-sky-300 font-bold">{rule.thresholdText}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Triggers Count:</span>
                      <span className="text-neutral-200 font-bold">{rule.triggerCount} times</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => updateAlertRule(rule.id, { enabled: !rule.enabled })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.enabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {rule.enabled ? 'TRIGGER ENABLED' : 'MUTED'}
                      </button>

                      <button
                        onClick={() => triggerFaultSimulation(rule.id)}
                        className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5 text-rose-400" />
                        <span>Test Alarm</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FAULT SIMULATION CONSOLE */}
      {activeTab === 'simulation_console' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/40 p-3.5 rounded border border-neutral-800 space-y-2">
            <span className="font-bold text-rose-400 block text-xs">
              MCR BROADCAST FAILURE INJECTION & RESILIENCE TESTING
            </span>
            <p className="text-xs text-neutral-400">
              Click any fault simulation below to test automated alarm detection, monitor video slate reactions,
              and live dispatch of formatted email notifications to <strong className="text-white">{smtpConfig.toEmails}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                id: 'input_signal_loss' as AlertFaultType,
                title: 'Simulate Input Signal Loss',
                desc: 'Simulates SRT ingest link loss (0 kbps)',
                btnClass: 'bg-rose-900/60 hover:bg-rose-800 border-rose-700',
              },
              {
                id: 'output_blank' as AlertFaultType,
                title: 'Simulate Output Blackout',
                desc: 'Simulates video renderer solid black frames',
                btnClass: 'bg-amber-900/60 hover:bg-amber-800 border-amber-700',
              },
              {
                id: 'video_freeze' as AlertFaultType,
                title: 'Simulate Video Freeze',
                desc: 'Simulates 3.5s frame stagnation stall',
                btnClass: 'bg-sky-900/60 hover:bg-sky-800 border-sky-700',
              },
              {
                id: 'video_glitches' as AlertFaultType,
                title: 'Simulate Video Glitches',
                desc: 'Simulates high macroblocking and VMAF drop',
                btnClass: 'bg-purple-900/60 hover:bg-purple-800 border-purple-700',
              },
              {
                id: 'scte_missing' as AlertFaultType,
                title: 'Simulate SCTE-35 Missing',
                desc: 'Simulates missing ad break splice markers',
                btnClass: 'bg-orange-900/60 hover:bg-orange-800 border-orange-700',
              },
              {
                id: 'scte104_signal_loss' as AlertFaultType,
                title: 'Simulate SCTE-104 VANC Packet Loss',
                desc: 'Monitors SCTE-104 input signal status and triggers email alerts on SDI VANC loss',
                btnClass: 'bg-rose-900/60 hover:bg-rose-800 border-rose-700',
              },
              {
                id: 'internet_loss' as AlertFaultType,
                title: 'Simulate Internet Loss',
                desc: 'Simulates complete WAN uplink outage',
                btnClass: 'bg-red-900/60 hover:bg-red-800 border-red-700',
              },
            ].map((sim) => (
              <div
                key={sim.id}
                className="bg-neutral-900/60 border border-neutral-800 rounded p-3 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
                    {getFaultIcon(sim.id)}
                    <span>{sim.title}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">{sim.desc}</div>
                </div>

                <button
                  onClick={() => triggerFaultSimulation(sim.id)}
                  className={`py-2 px-3 rounded font-bold text-xs text-white border transition flex items-center justify-center gap-1.5 shadow ${sim.btnClass}`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>TRIGGER FAULT</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISPATCHED EMAIL ALERTS LOG */}
      {activeTab === 'email_log' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-bold text-neutral-200">
              AUDIT TRAIL OF DISPATCHED EMAIL NOTIFICATIONS
            </span>
            <span>{dispatchedAlerts.length} EMAILS DELIVERED</span>
          </div>

          <div className="overflow-x-auto rounded border border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">SEVERITY</th>
                  <th className="py-2 px-3">EMAIL SUBJECT</th>
                  <th className="py-2 px-3">RECIPIENT (TO:)</th>
                  <th className="py-2 px-3">SMTP STATUS</th>
                  <th className="py-2 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950">
                {dispatchedAlerts.map((email) => (
                  <tr
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className="hover:bg-neutral-900/50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 text-neutral-400">{email.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          email.severity === 'EMERGENCY'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {email.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-200 max-w-xs truncate">
                      {email.subject}
                    </td>
                    <td className="py-2.5 px-3 text-sky-400">{email.to}</td>
                    <td className="py-2.5 px-3 text-emerald-400 text-[11px] truncate max-w-xs">
                      {email.smtpResponse}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmail(email);
                        }}
                        className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
                      >
                        View Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400" />
                <h4 className="font-bold text-sm text-neutral-100">Dispatched Alert Email Preview</h4>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-neutral-950 p-3 rounded border border-neutral-800 text-[11px]">
              <div>
                <span className="text-neutral-500">Subject:</span>{' '}
                <strong className="text-white">{selectedEmail.subject}</strong>
              </div>
              <div>
                <span className="text-neutral-500">From:</span>{' '}
                <span className="text-neutral-300">{selectedEmail.from}</span>
              </div>
              <div>
                <span className="text-neutral-500">To:</span>{' '}
                <span className="text-rose-300 font-bold">{selectedEmail.to}</span>
              </div>
              <div>
                <span className="text-neutral-500">Timestamp:</span>{' '}
                <span className="text-neutral-300">{selectedEmail.timestamp}</span>
              </div>
              <div>
                <span className="text-neutral-500">SMTP Handshake Response:</span>{' '}
                <span className="text-emerald-400">{selectedEmail.smtpResponse}</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded border border-neutral-800 text-neutral-300 text-xs space-y-2">
              <div className="text-rose-400 font-bold border-b border-neutral-800 pb-1">
                INCIDENT DIAGNOSTIC SNAPSHOT
              </div>
              <p>{selectedEmail.contentSnippet}</p>
              <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
                SRT Ingest Mode: {srtIngest.mode.toUpperCase()} • Port: {srtIngest.port} • StreamID: {srtIngest.streamId}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
