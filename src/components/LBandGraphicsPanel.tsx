import React from 'react';
import { useStream } from '../context/StreamContext';
import { Layers, Sparkles, Image, Tv, Sliders, ToggleLeft, ToggleRight, Radio, Move } from 'lucide-react';

export const LBandGraphicsPanel: React.FC = () => {
  const {
    lbandConfig,
    updateLbandConfig,
    triggerLBand,
    triggerAstronBand,
    logoConfig,
    updateLogoConfig,
  } = useStream();

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                L-Band Squeeze, Astron Satellite Band & Logo Insertion
              </h3>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                  lbandConfig.active
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {lbandConfig.active ? 'SQUEEZE ACTIVE ON-AIR' : 'FULL SCREEN'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live broadcast DVE squeeze-back engine with Astron RF telemetry banner & station watermark bug.
            </p>
          </div>
        </div>

        {/* Master On-Air Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerLBand()}
            className={`px-4 py-2 rounded font-mono text-xs font-bold flex items-center gap-2 transition ${
              lbandConfig.active
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lbandConfig.active ? 'RETURN TO FULL FRAME' : 'TRIGGER L-BAND SQUEEZE'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
        {/* Section 1: L-Band Squeeze-Back & Astron Configuration */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              L-BAND SQUEEZE GEOMETRY
            </span>
            <span className="text-[11px] text-cyan-400">
              SCALE: {Math.round(lbandConfig.squeezeScale * 100)}%
            </span>
          </div>

          {/* Squeeze Scale Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Main Video Scaling Ratio</span>
              <span>{Math.round(lbandConfig.squeezeScale * 100)}% of 16:9</span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.85"
              step="0.05"
              value={lbandConfig.squeezeScale}
              onChange={(e) => updateLbandConfig({ squeezeScale: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Park Position */}
          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">VIDEO PARK POSITION</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateLbandConfig({ position: 'top-right' })}
                className={`py-1.5 px-3 rounded text-center transition ${
                  lbandConfig.position === 'top-right'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                }`}
              >
                Top-Right (Left + Bottom L-Frame)
              </button>
              <button
                type="button"
                onClick={() => updateLbandConfig({ position: 'top-left' })}
                className={`py-1.5 px-3 rounded text-center transition ${
                  lbandConfig.position === 'top-left'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                }`}
              >
                Top-Left (Right + Bottom L-Frame)
              </button>
            </div>
          </div>

          {/* Astron Satellite Band Section */}
          <div className="border-t border-neutral-800 pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                LOCAL ASTRON SATELLITE BAND
              </span>
              <button
                onClick={() => triggerAstronBand()}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  lbandConfig.astronBandActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {lbandConfig.astronBandActive ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">ASTRON SATELLITE HEADER</label>
              <input
                type="text"
                value={lbandConfig.astronTitle}
                onChange={(e) => updateLbandConfig({ astronTitle: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                TELEMETRY TRANSPONDER SUBTITLE
              </label>
              <input
                type="text"
                value={lbandConfig.astronSubtitle}
                onChange={(e) => updateLbandConfig({ astronSubtitle: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-cyan-400"
              />
            </div>

            {/* Ticker Text */}
            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">L-BAND TICKER TAPE TEXT</label>
              <input
                type="text"
                value={lbandConfig.tickerText}
                onChange={(e) => updateLbandConfig({ tickerText: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Channel Logo / Station Bug Watermark */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              STATION BUG / WATERMARK LOGO
            </span>
            <button
              onClick={() => updateLogoConfig({ active: !logoConfig.active })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                logoConfig.active
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-500'
              }`}
            >
              {logoConfig.active ? 'OVERLAY ON' : 'OVERLAY OFF'}
            </button>
          </div>

          {/* Logo Text / Station Call Sign */}
          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">
              WATERMARK BADGE TEXT
            </label>
            <input
              type="text"
              value={logoConfig.customText}
              onChange={(e) => updateLogoConfig({ customText: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:border-sky-400"
              placeholder="e.g. FLOW-MCR HD"
            />
          </div>

          {/* Corner Position */}
          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">SCREEN CORNER</label>
            <div className="grid grid-cols-2 gap-2">
              {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => updateLogoConfig({ position: pos })}
                  className={`py-1.5 px-2 rounded text-center transition capitalize ${
                    logoConfig.position === pos
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {pos.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Watermark Opacity</span>
              <span>{Math.round(logoConfig.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={logoConfig.opacity}
              onChange={(e) => updateLogoConfig({ opacity: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Scale Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Watermark Scale</span>
              <span>{Math.round(logoConfig.scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={logoConfig.scale}
              onChange={(e) => updateLogoConfig({ scale: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Preset Bug Types */}
          <div>
            <label className="text-neutral-400 text-[11px] block mb-1">BUG STYLE PRESETS</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateLogoConfig({ customText: 'MCR 1080p LIVE' })}
                className="py-1 px-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 text-[10px]"
              >
                1080p Live
              </button>
              <button
                type="button"
                onClick={() => updateLogoConfig({ customText: '4K UHD HDR' })}
                className="py-1 px-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 text-[10px]"
              >
                4K HDR
              </button>
              <button
                type="button"
                onClick={() => updateLogoConfig({ customText: 'BREAKING NEWS' })}
                className="py-1 px-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 text-[10px]"
              >
                Breaking News
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
