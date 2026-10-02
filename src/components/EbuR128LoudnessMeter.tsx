import React from 'react';
import { useStream } from '../context/StreamContext';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Sliders,
  Sparkles,
  BarChart3,
  Waves,
  Zap,
} from 'lucide-react';
import { EbuR128LoudnessMetrics } from '../types/stream';

export const EbuR128LoudnessMeter: React.FC = () => {
  const {
    loudnessMetrics,
    resetLoudnessMeter,
    updateTargetLoudnessStandard,
    audioConfig,
    inputSource,
  } = useStream();

  const targetLufs = loudnessMetrics.targetStandard.includes('-24') ? -24.0 : -23.0;
  const deviation = (loudnessMetrics.integratedLufs - targetLufs).toFixed(1);
  const deviationNum = parseFloat(deviation);

  // Helper for meter position (scale from -45 LUFS to -5 LUFS)
  const getMeterPercent = (lufs: number) => {
    const min = -45;
    const max = -5;
    const clamped = Math.max(min, Math.min(max, lufs));
    return ((clamped - min) / (max - min)) * 100;
  };

  // Helper for true peak position (scale from -24 dBTP to +3 dBTP)
  const getPeakPercent = (dbtp: number) => {
    const min = -24;
    const max = 3;
    const clamped = Math.max(min, Math.min(max, dbtp));
    return ((clamped - min) / (max - min)) * 100;
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                EBU R128 & ITU-R BS.1770-4 Audio Loudness Compliance Meter
              </h3>
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                  loudnessMetrics.complianceStatus === 'compliant'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : loudnessMetrics.complianceStatus === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                }`}
              >
                {loudnessMetrics.complianceStatus === 'compliant' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BROADCAST COMPLIANT</span>
                  </>
                ) : loudnessMetrics.complianceStatus === 'warning' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>TOLERANCE WARNING</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>LOUDNESS VIOLATION</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Real-time gated multi-channel loudness analysis for primary {inputSource.toUpperCase()} ingest, ensuring CALM Act / EBU R128 compliance across HLS & SRT downlinks.
            </p>
          </div>
        </div>

        {/* Standard Selector & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={loudnessMetrics.targetStandard}
            onChange={(e) => updateTargetLoudnessStandard(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-bold focus:border-emerald-500 text-xs"
          >
            <option value="EBU R128 (-23 LUFS)">EBU R128 (-23.0 LUFS Target)</option>
            <option value="ATSC A/85 (-24 LKFS)">ATSC A/85 / CALM Act (-24.0 LKFS)</option>
            <option value="EBU R128 Live (-23 ±0.5 LU)">EBU R128 Live Broadcast (±0.5 LU)</option>
          </select>

          <button
            onClick={resetLoudnessMeter}
            className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition flex items-center gap-1.5 font-bold"
            title="Reset integrated loudness integration counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET INTEGRATION</span>
          </button>
        </div>
      </div>

      {/* Main Numerical Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Integrated Loudness */}
        <div className="bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold block">INTEGRATED (I)</span>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {loudnessMetrics.integratedLufs.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400 ml-1">LUFS</span>
          </div>
          <div className="text-[10px] flex justify-between text-neutral-400">
            <span>Target: {targetLufs} LUFS</span>
            <span className={deviationNum > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {deviationNum > 0 ? `+${deviation}` : deviation} LU
            </span>
          </div>
        </div>

        {/* Short-Term Loudness */}
        <div className="bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold block">SHORT-TERM (S, 3s)</span>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-sky-400">
              {loudnessMetrics.shortTermLufs.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400 ml-1">LUFS</span>
          </div>
          <span className="text-[10px] text-neutral-400 block">Sliding 3-sec window</span>
        </div>

        {/* Momentary Loudness */}
        <div className="bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold block">MOMENTARY (M, 400ms)</span>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {loudnessMetrics.momentaryLufs.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400 ml-1">LUFS</span>
          </div>
          <span className="text-[10px] text-neutral-400 block">Fast 400ms sliding</span>
        </div>

        {/* Loudness Range (LRA) */}
        <div className="bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold block">LOUDNESS RANGE (LRA)</span>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {loudnessMetrics.loudnessRangeLu.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400 ml-1">LU</span>
          </div>
          <span className="text-[10px] text-neutral-400 block">Dynamic span (Target &lt; 15 LU)</span>
        </div>

        {/* Maximum True Peak */}
        <div className="bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold block">MAX TRUE PEAK (TP)</span>
          <div className="my-1">
            <span
              className={`text-2xl font-bold font-mono ${
                loudnessMetrics.truePeakDbtp > -1.0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {loudnessMetrics.truePeakDbtp.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400 ml-1">dBTP</span>
          </div>
          <div className="text-[10px] flex justify-between text-neutral-400">
            <span>L: {loudnessMetrics.truePeakLeftDbtp}</span>
            <span>R: {loudnessMetrics.truePeakRightDbtp}</span>
          </div>
        </div>
      </div>

      {/* Visual Loudness Bars & Target Scale */}
      <div className="bg-neutral-900/40 p-4 rounded-lg border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
          <span>REAL-TIME LOUDNESS BAR & EBU R128 TARGET NOTCH</span>
          <span className="text-[11px] text-neutral-500">
            Audio Stream: {audioConfig.codec.toUpperCase()} ({audioConfig.sampleRateHz}Hz / {audioConfig.channels})
          </span>
        </div>

        {/* Bar Scale */}
        <div className="relative pt-6 pb-2">
          {/* Scale Labels */}
          <div className="absolute top-0 inset-x-0 flex justify-between text-[10px] font-mono text-neutral-500 px-1">
            <span>-45 LUFS</span>
            <span>-36</span>
            <span>-30</span>
            <span className="text-emerald-400 font-bold">-23 (TARGET)</span>
            <span>-18</span>
            <span>-12</span>
            <span className="text-rose-400 font-bold">-5 LUFS</span>
          </div>

          {/* Bar Background Track */}
          <div className="h-6 w-full bg-neutral-950 rounded border border-neutral-800 relative overflow-hidden flex">
            {/* Zones */}
            <div className="w-[45%] h-full bg-sky-950/30 border-r border-neutral-800" />
            <div className="w-[25%] h-full bg-emerald-950/40 border-r border-neutral-800" />
            <div className="w-[15%] h-full bg-amber-950/40 border-r border-neutral-800" />
            <div className="w-[15%] h-full bg-rose-950/50" />

            {/* Momentary Bar Fill */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-600 via-emerald-500 to-amber-500 transition-all duration-300 opacity-75"
              style={{ width: `${getMeterPercent(loudnessMetrics.momentaryLufs)}%` }}
            />

            {/* Short Term Needle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-300 z-10"
              style={{ left: `${getMeterPercent(loudnessMetrics.shortTermLufs)}%` }}
              title={`Short-term: ${loudnessMetrics.shortTermLufs} LUFS`}
            />

            {/* Target Line (-23 LUFS) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-20 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              style={{ left: `${getMeterPercent(targetLufs)}%` }}
            />
          </div>
        </div>

        {/* True Peak Dual Meter Bars (Left & Right) */}
        <div className="space-y-2 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>TRUE PEAK INTERSAMPLE DETECTION (dBTP)</span>
            <span>Limit: -1.0 dBTP (EBU R128 compliant)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            {/* Left Channel */}
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-400">
                <span>CHANNEL 1 (LEFT):</span>
                <span className="font-bold text-white">{loudnessMetrics.truePeakLeftDbtp} dBTP</span>
              </div>
              <div className="h-3 w-full bg-neutral-950 rounded border border-neutral-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-200 ${
                    loudnessMetrics.truePeakLeftDbtp > -1.0 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${getPeakPercent(loudnessMetrics.truePeakLeftDbtp)}%` }}
                />
              </div>
            </div>

            {/* Right Channel */}
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-400">
                <span>CHANNEL 2 (RIGHT):</span>
                <span className="font-bold text-white">{loudnessMetrics.truePeakRightDbtp} dBTP</span>
              </div>
              <div className="h-3 w-full bg-neutral-950 rounded border border-neutral-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-200 ${
                    loudnessMetrics.truePeakRightDbtp > -1.0 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${getPeakPercent(loudnessMetrics.truePeakRightDbtp)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Loudness Trend Timeline (SVG) */}
      <div className="bg-neutral-900/40 p-3.5 rounded-lg border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-300">
          <span className="font-bold flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            LOUDNESS TIMELINE (30-SECOND AUDIT TRACE)
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-purple-400" />
              <span>Momentary</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-sky-400" />
              <span>Short-Term</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-400" />
              <span>Target (-23 LUFS)</span>
            </span>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="h-28 w-full bg-neutral-950 rounded border border-neutral-800 p-2 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible">
            {/* Target line at -23 */}
            <line
              x1="0"
              y1="56"
              x2="100%"
              y2="56"
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Momentary plot */}
            <polyline
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.5"
              points={loudnessMetrics.history
                .map((pt, i) => {
                  const x = (i / 29) * 1000;
                  const y = Math.max(10, Math.min(100, 56 + (pt.momentary - targetLufs) * -8));
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Short-term plot */}
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              points={loudnessMetrics.history
                .map((pt, i) => {
                  const x = (i / 29) * 1000;
                  const y = Math.max(10, Math.min(100, 56 + (pt.shortTerm - targetLufs) * -8));
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
