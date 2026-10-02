import React, { useRef, useEffect, useState } from 'react';
import { useStream } from '../context/StreamContext';
import { ArrowDownLeft, ArrowUpRight, Activity, Eye, RefreshCw, BarChart2 } from 'lucide-react';

export const BandwidthGraph: React.FC = () => {
  const { bandwidthHistory, health, srtIngest, videoConfig } = useStream();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [visibleSeries, setVisibleSeries] = useState({
    ingest: true,
    totalEgress: true,
    hls: true,
    srtOut: true,
    rtmp: true,
  });

  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    data: any;
  } | null>(null);

  // Render high-framerate dynamic graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    const padLeft = 55;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Clear
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    if (bandwidthHistory.length < 2) return;

    // Determine max bitrate value for dynamic auto-scaling
    let maxVal = 1000;
    bandwidthHistory.forEach((pt) => {
      if (pt.ingestBitrateKbps > maxVal) maxVal = pt.ingestBitrateKbps;
      if (pt.totalEgressKbps > maxVal) maxVal = pt.totalEgressKbps;
    });
    // Add 20% headroom
    maxVal = Math.ceil((maxVal * 1.25) / 1000) * 1000;

    // Draw background grid & Y-axis labels
    const ySteps = 4;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal / ySteps) * i;
      const y = padTop + plotH - (val / maxVal) * plotH;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const mbps = (val / 1000).toFixed(1);
      ctx.fillText(`${mbps}M`, padLeft - 8, y);
    }

    // Draw X-axis timestamps
    const count = bandwidthHistory.length;
    const xStep = plotW / (count - 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < count; i += Math.ceil(count / 6)) {
      const x = padLeft + i * xStep;
      const pt = bandwidthHistory[i];
      if (pt) {
        ctx.fillText(pt.time, x, h - padBottom + 8);
      }
    }

    // Helper to draw a data curve
    const drawCurve = (
      getValue: (pt: any) => number,
      color: string,
      fillColor?: string | CanvasGradient,
      isDashed = false
    ) => {
      ctx.beginPath();
      if (isDashed) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let i = 0; i < count; i++) {
        const val = getValue(bandwidthHistory[i]);
        const x = padLeft + i * xStep;
        const y = padTop + plotH - (val / maxVal) * plotH;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Optional gradient fill under curve
      if (fillColor) {
        ctx.lineTo(padLeft + (count - 1) * xStep, padTop + plotH);
        ctx.lineTo(padLeft, padTop + plotH);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      ctx.setLineDash([]);
    };

    // 1. Total Egress (Amber/Orange)
    if (visibleSeries.totalEgress) {
      const gradEgress = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      gradEgress.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      gradEgress.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
      drawCurve((pt) => pt.totalEgressKbps, '#f59e0b', gradEgress);
    }

    // 2. Ingest SRT Stream (Cyan/Sky)
    if (visibleSeries.ingest) {
      const gradIngest = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      gradIngest.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      gradIngest.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      drawCurve((pt) => pt.ingestBitrateKbps, '#38bdf8', gradIngest);
    }

    // 3. Sub-egress: HLS (Emerald)
    if (visibleSeries.hls) {
      drawCurve((pt) => pt.hlsBitrateKbps, '#10b981', undefined, true);
    }

    // 4. Sub-egress: SRT Out (Purple)
    if (visibleSeries.srtOut) {
      drawCurve((pt) => pt.srtOutBitrateKbps, '#a855f7', undefined, true);
    }

    // 5. Sub-egress: RTMP Out (Pink)
    if (visibleSeries.rtmp) {
      drawCurve((pt) => pt.rtmpBitrateKbps, '#ec4899', undefined, true);
    }

    // Hover vertical marker
    if (hoveredPoint && hoveredPoint.index >= 0 && hoveredPoint.index < count) {
      const hx = padLeft + hoveredPoint.index * xStep;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle for Ingest
      const pt = bandwidthHistory[hoveredPoint.index];
      const iy = padTop + plotH - (pt.ingestBitrateKbps / maxVal) * plotH;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(hx, iy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Point circle for Egress
      const ey = padTop + plotH - (pt.totalEgressKbps / maxVal) * plotH;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(hx, ey, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [bandwidthHistory, visibleSeries, hoveredPoint]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 55;
    const padRight = 20;
    const plotW = rect.width - padLeft - padRight;

    if (x < padLeft || x > rect.width - padRight) {
      setHoveredPoint(null);
      return;
    }

    const relX = x - padLeft;
    const count = bandwidthHistory.length;
    const idx = Math.round((relX / plotW) * (count - 1));

    if (idx >= 0 && idx < count) {
      setHoveredPoint({
        index: idx,
        x,
        y: e.clientY - rect.top,
        data: bandwidthHistory[idx],
      });
    }
  };

  const handleMouseLeave = () => setHoveredPoint(null);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 shadow-xl flex flex-col gap-3">
      {/* Title & Live Bitrate Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-sky-400" />
          <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
            Real-Time Bandwidth Oscilloscope
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
            60s SLIDING WINDOW
          </span>
        </div>

        {/* Real-time Values & Status */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/50">
            <ArrowDownLeft className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-neutral-400">SRT INGEST:</span>
            <span className="text-sky-300 font-bold">
              {(health.ingestBitrateKbps / 1000).toFixed(2)} Mbps
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/50">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-400">TOTAL EGRESS:</span>
            <span className="text-amber-300 font-bold">
              {(health.totalEgressBitrateKbps / 1000).toFixed(2)} Mbps
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px]">
            <span>OVERHEAD:</span>
            <span className="text-emerald-400 font-semibold">{srtIngest.overheadBandwidthPercent}%</span>
          </div>
        </div>
      </div>

      {/* Series Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-neutral-500 text-[11px] uppercase mr-1">Trace Toggles:</span>

        <button
          onClick={() => setVisibleSeries((p) => ({ ...p, ingest: !p.ingest }))}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition text-[11px] ${
            visibleSeries.ingest
              ? 'bg-sky-500/20 border-sky-500 text-sky-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          SRT Ingest ({srtIngest.mode.toUpperCase()})
        </button>

        <button
          onClick={() => setVisibleSeries((p) => ({ ...p, totalEgress: !p.totalEgress }))}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition text-[11px] ${
            visibleSeries.totalEgress
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Aggregate Egress
        </button>

        <button
          onClick={() => setVisibleSeries((p) => ({ ...p, hls: !p.hls }))}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition text-[11px] ${
            visibleSeries.hls
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          HLS Chunks ({(health.hlsBitrateKbps / 1000).toFixed(1)}M)
        </button>

        <button
          onClick={() => setVisibleSeries((p) => ({ ...p, srtOut: !p.srtOut }))}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition text-[11px] ${
            visibleSeries.srtOut
              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          SRT Egress ({(health.srtOutBitrateKbps / 1000).toFixed(1)}M)
        </button>

        <button
          onClick={() => setVisibleSeries((p) => ({ ...p, rtmp: !p.rtmp }))}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition text-[11px] ${
            visibleSeries.rtmp
              ? 'bg-pink-500/20 border-pink-500 text-pink-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-pink-400" />
          RTMP Egress ({(health.rtmpBitrateKbps / 1000).toFixed(1)}M)
        </button>
      </div>

      {/* Main Canvas Graph */}
      <div className="relative h-56 w-full rounded bg-neutral-950 overflow-hidden border border-neutral-800/80">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair"
        />

        {/* Interactive Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-neutral-900/95 border border-neutral-700 rounded p-2 text-xs font-mono shadow-xl backdrop-blur z-20"
            style={{
              left: Math.min(hoveredPoint.x + 12, 380),
              top: Math.max(10, Math.min(hoveredPoint.y - 40, 120)),
            }}
          >
            <div className="text-neutral-400 border-b border-neutral-800 pb-1 mb-1 font-bold">
              TIME: {hoveredPoint.data.time}
            </div>
            <div className="flex items-center justify-between gap-3 text-sky-400">
              <span>SRT INGEST:</span>
              <span className="font-bold">{(hoveredPoint.data.ingestBitrateKbps / 1000).toFixed(2)} Mbps</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-amber-400">
              <span>TOTAL OUT:</span>
              <span className="font-bold">{(hoveredPoint.data.totalEgressKbps / 1000).toFixed(2)} Mbps</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-emerald-400 text-[11px]">
              <span>HLS STREAM:</span>
              <span>{(hoveredPoint.data.hlsBitrateKbps / 1000).toFixed(2)} Mbps</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-purple-400 text-[11px]">
              <span>SRT OUT:</span>
              <span>{(hoveredPoint.data.srtOutBitrateKbps / 1000).toFixed(2)} Mbps</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-pink-400 text-[11px]">
              <span>RTMP OUT:</span>
              <span>{(hoveredPoint.data.rtmpBitrateKbps / 1000).toFixed(2)} Mbps</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
