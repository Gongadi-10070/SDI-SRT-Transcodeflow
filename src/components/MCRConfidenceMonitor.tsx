import React, { useEffect, useRef, useState } from 'react';
import { useStream } from '../context/StreamContext';
import {
  Maximize2,
  Volume2,
  VolumeX,
  Layers,
  Radio,
  Sparkles,
  Tv,
  Clock,
  Activity,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Music,
  ListMusic,
  Film,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import {
  startAmbientBroadcastMusic,
  stopAmbientBroadcastMusic,
  setAmbientMusicVolume,
} from '../utils/broadcastAudioSynth';

export const MCRConfidenceMonitor: React.FC = () => {
  const {
    isStreaming,
    inputSource,
    setInputSource,
    sdiInput,
    videoConfig,
    srtIngest,
    lbandConfig,
    triggerLBand,
    triggerAstronBand,
    logoConfig,
    activeAdBreak,
    videoSourceSlate,
    setVideoSourceSlate,
    health,
    triggerScteCue,
    activeIncidents,
    emergencyFallbackConfig,
    updateEmergencyFallbackConfig,
    triggerEmergencyFallback,
    dismissEmergencyFallback,
  } = useStream();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const [showOverlays, setShowOverlays] = useState(true);
  const [fpsCounter, setFpsCounter] = useState(60);

  // Ambient broadcast music playback for Emergency Fallback / Montage
  useEffect(() => {
    const shouldPlayMusic =
      isStreaming &&
      !isMuted &&
      (videoSourceSlate === 'montage_music' ||
        (videoSourceSlate === 'stay_tuned' && emergencyFallbackConfig.musicEnabled) ||
        (emergencyFallbackConfig.isEngaged && emergencyFallbackConfig.musicEnabled));

    if (shouldPlayMusic) {
      startAmbientBroadcastMusic(volume);
    } else {
      stopAmbientBroadcastMusic();
    }

    return () => {
      stopAmbientBroadcastMusic();
    };
  }, [isStreaming, isMuted, videoSourceSlate, emergencyFallbackConfig.isEngaged, emergencyFallbackConfig.musicEnabled, volume]);

  // Canvas render loop for high-performance broadcast simulation
  useEffect(() => {
    let animId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      // Calculate FPS
      frameCount++;
      if (time - lastTime >= 1000) {
        setFpsCounter(frameCount);
        frameCount = 0;
        lastTime = time;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Base background
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, w, h);

      if (!isStreaming) {
        // Stream Off state
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4b5563';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STREAM ENGINE OFFLINE / STANDBY', w / 2, h / 2 - 20);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`SRT PORT ${srtIngest.port} • READY FOR INGEST`, w / 2, h / 2 + 20);
        animId = requestAnimationFrame(render);
        return;
      }

      // Check if L-Band squeeze is active
      const squeezeActive = lbandConfig.active;
      const scale = squeezeActive ? lbandConfig.squeezeScale : 1.0;
      
      const videoW = w * scale;
      const videoH = h * scale;
      // Position top-right if squeeze active, else fill
      const videoX = squeezeActive ? (lbandConfig.position === 'top-right' ? w - videoW - 16 : 16) : 0;
      const videoY = squeezeActive ? 16 : 0;

      // Draw L-Band Background & Astron Band if squeezed
      if (squeezeActive) {
        // High-tech dark gradient for L-band zone
        const lGrad = ctx.createLinearGradient(0, 0, w, h);
        lGrad.addColorStop(0, '#0a0f1d');
        lGrad.addColorStop(0.5, '#070b14');
        lGrad.addColorStop(1, '#05080f');
        ctx.fillStyle = lGrad;
        ctx.fillRect(0, 0, w, h);

        // Technical graticule / grid in background
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // L-Band Bottom Banner Area
        const bottomH = h - (videoY + videoH) - 8;
        const bottomY = h - bottomH;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(0, bottomY, w, bottomH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, bottomY, w, 2);

        // Astron satellite telemetry band
        if (lbandConfig.astronBandActive) {
          // Left side: Astron Sat icon & frequency radar
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(16, bottomY + 12, 6, bottomH - 24);

          ctx.font = 'bold 15px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(`[ASTRON-SAT LINK] ${lbandConfig.astronTitle}`, 32, bottomY + 12);

          ctx.font = '12px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`${lbandConfig.astronSubtitle} • Q: ${lbandConfig.astronSignalQualityPercent}% • LOCK: OK`, 32, bottomY + 34);

          // Mini RF Spectrum wave on bottom right
          const specW = 180;
          const specH = bottomH - 28;
          const specX = w - specW - 24;
          const specY = bottomY + 14;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(specX, specY, specW, specH);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.strokeRect(specX, specY, specW, specH);

          ctx.beginPath();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < specW; i += 4) {
            const freqVal = Math.sin((i + time * 0.1) * 0.1) * Math.cos(i * 0.05) * (specH * 0.38) + (specH * 0.5);
            if (i === 0) ctx.moveTo(specX + i, specY + specH - freqVal);
            else ctx.lineTo(specX + i, specY + specH - freqVal);
          }
          ctx.stroke();

          ctx.font = '9px monospace';
          ctx.fillStyle = '#64748b';
          ctx.fillText('KU-BAND 11.7 GHz RF SPECTRUM', specX + 8, specY + 10);
        }

        // Ticker tape across the very bottom
        const tickerY = h - 22;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, tickerY, w, 22);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, tickerY, 90, 22);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('LIVE MCR', 14, tickerY + 15);

        // Moving ticker text
        ctx.font = '12px monospace';
        ctx.fillStyle = '#e2e8f0';
        const tickerOffset = (time * (lbandConfig.tickerSpeed * 0.04)) % (w * 1.5);
        ctx.fillText(lbandConfig.tickerText, w - tickerOffset, tickerY + 15);

        // Left vertical panel if video is parked right
        if (lbandConfig.position === 'top-right') {
          const leftW = videoX - 24;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
          ctx.fillRect(16, 16, leftW, videoH);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.strokeRect(16, 16, leftW, videoH);

          // Sponsor / Breaking card
          ctx.fillStyle = '#e11d48';
          ctx.fillRect(24, 24, leftW - 16, 26);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('BROADCAST NOTIFICATION', 32, 41);

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 13px Inter, sans-serif';
          ctx.fillText('SPECIAL PROGRAM REPORT', 26, 75);

          ctx.font = '11px Inter, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('SRT Ingest: Synchronized', 26, 100);
          ctx.fillText(`Target Bitrate: ${videoConfig.targetBitrateKbps} kbps`, 26, 118);
          ctx.fillText(`Keyframe GOP: ${videoConfig.gopSizeFrames}f (${videoConfig.keyframeIntervalSec}s)`, 26, 136);
          ctx.fillText(`HLS Packaging: ${health.hlsBitrateKbps > 0 ? 'Active' : 'Muted'}`, 26, 154);
          ctx.fillText(`SCTE-35: ${health.status}`, 26, 172);

          // Mini radar orbit
          const radarCX = 16 + leftW / 2;
          const radarCY = 230;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(radarCX, radarCY, 36, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(radarCX, radarCY, 20, 0, Math.PI * 2);
          ctx.stroke();

          // Sweep
          const sweepAngle = (time * 0.003) % (Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(radarCX, radarCY);
          ctx.lineTo(radarCX + Math.cos(sweepAngle) * 36, radarCY + Math.sin(sweepAngle) * 36);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw Main Video Frame (clipped to videoX, videoY, videoW, videoH)
      ctx.save();
      ctx.beginPath();
      ctx.rect(videoX, videoY, videoW, videoH);
      ctx.clip();

      if (videoSourceSlate === 'bars') {
        // SMPTE HD 75% Color Bars
        const barColors = ['#bfbfbf', '#bfbf00', '#00bfbf', '#00bf00', '#bf00bf', '#bf0000', '#0000bf'];
        const barW = videoW / barColors.length;
        for (let i = 0; i < barColors.length; i++) {
          ctx.fillStyle = barColors[i];
          ctx.fillRect(videoX + i * barW, videoY, barW, videoH * 0.67);
        }
        // Bottom cast
        const subColors = ['#0000bf', '#000000', '#bf00bf', '#000000', '#00bfbf', '#000000', '#bfbfbf'];
        for (let i = 0; i < subColors.length; i++) {
          ctx.fillStyle = subColors[i];
          ctx.fillRect(videoX + i * barW, videoY + videoH * 0.67, barW, videoH * 0.08);
        }
        // Pluge & Blacks
        ctx.fillStyle = '#081726';
        ctx.fillRect(videoX, videoY + videoH * 0.75, videoW, videoH * 0.25);
      } else if (videoSourceSlate === 'technical_diff') {
        // Technical difficulties slate
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(videoX, videoY, videoW, videoH);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TECHNICAL DIFFICULTIES', videoX + videoW / 2, videoY + videoH / 2 - 20);
        ctx.fillStyle = '#e0e7ff';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('STANDBY • MASTER CONTROL ROOM IS RESOLVING FEED', videoX + videoW / 2, videoY + videoH / 2 + 15);
      } else if (videoSourceSlate === 'slate_break') {
        // Commercial Break slate
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(videoX, videoY, videoW, videoH);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COMMERCIAL BREAK IN PROGRESS', videoX + videoW / 2, videoY + videoH / 2 - 20);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.fillText('SCTE-35 SPLICE INSERT ACTIVE • RETURN EXPECTED SOON', videoX + videoW / 2, videoY + videoH / 2 + 15);
      } else if (videoSourceSlate === 'stay_tuned') {
        // "STAY TUNED WE WILL GET BACK" Broadcast Slate
        const grad = ctx.createLinearGradient(videoX, videoY, videoX, videoY + videoH);
        grad.addColorStop(0, '#0c1222');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(videoX, videoY, videoW, videoH);

        const cx = videoX + videoW / 2;
        const cy = videoY + videoH / 2;
        const t = time * 0.001;

        // Animated rotating gold concentric beacon rings
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1.5;
        for (let r = 60; r <= 180; r += 40) {
          ctx.beginPath();
          ctx.arc(cx, cy - 20, r + Math.sin(t * 2 + r) * 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Radar sweep line
        const beamAngle = t * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 20);
        ctx.lineTo(cx + Math.cos(beamAngle) * 180, cy - 20 + Math.sin(beamAngle) * 180);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Station Header Badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(cx - 180, cy - 140, 360, 32);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 180, cy - 140, 360, 32);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tv9 TELUGU • MASTER BROADCAST CONTROL', cx, cy - 120);

        // Main Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillText('STAY TUNED, WE WILL BE RIGHT BACK', cx, cy - 30);

        // Subtitle
        ctx.fillStyle = '#fbbf24';
        ctx.font = '15px monospace';
        ctx.fillText('TECHNICAL DIFFICULTIES / SIGNAL RECOVERY IN PROGRESS', cx, cy + 10);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Automated MCR Failover Protection • SMPTE ST 2082 / SRT Multi-Link Auto-Healing', cx, cy + 40);

        // Architect credit banner
        ctx.fillStyle = '#38bdf8';
        ctx.font = '11px monospace';
        ctx.fillText('Digital layout architect by GNR SMB -Tv9 TELUGU', cx, cy + 85);

      } else if (videoSourceSlate === 'montage_music') {
        // "COOL MONTAGE WITH MUSIC" Slate
        const grad = ctx.createLinearGradient(videoX, videoY, videoX + videoW, videoY + videoH);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.3, '#172554');
        grad.addColorStop(0.7, '#311042');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(videoX, videoY, videoW, videoH);

        const cx = videoX + videoW / 2;
        const cy = videoY + videoH / 2;
        const t = time * 0.001;

        // Animated audio spectrum frequency bars along bottom
        const numBars = 36;
        const barWidth = videoW / numBars;
        for (let i = 0; i < numBars; i++) {
          const barHeight = Math.abs(Math.sin(t * 3 + i * 0.3)) * (videoH * 0.35) + 15;
          const barHue = (i * 9 + t * 40) % 360;
          ctx.fillStyle = `hsla(${barHue}, 90%, 60%, 0.85)`;
          ctx.fillRect(videoX + i * barWidth + 2, videoY + videoH - barHeight, barWidth - 4, barHeight);
        }

        // Geometric kaleidoscope rings in center
        ctx.save();
        ctx.translate(cx, cy - 35);
        ctx.rotate(t * 0.4);
        for (let j = 0; j < 3; j++) {
          ctx.strokeStyle = j === 0 ? '#38bdf8' : j === 1 ? '#a855f7' : '#ec4899';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const sides = 6;
          const radius = 55 + j * 30;
          for (let s = 0; s <= sides; s++) {
            const angle = (s * Math.PI * 2) / sides + (j * 0.3 * Math.sin(t));
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // Montage Banner & Music Info
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tv9 TELUGU • BROADCAST CHILL MONTAGE', cx, cy - 65);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('♫ NOW PLAYING: CHILL AMBIENT BROADCAST SYNTH CHORDS', cx, cy + 60);

        ctx.fillStyle = '#a855f7';
        ctx.font = '12px monospace';
        ctx.fillText('AUTOMATED FILLER MONTAGE • DIGITAL LAYOUT ARCHITECT BY GNR SMB', cx, cy + 90);

      } else if (videoSourceSlate === 'emergency_playlist') {
        // "EMERGENCY PLAYLIST" Broadcast Loop Player
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(videoX, videoY, videoW, videoH);

        const currentItem = emergencyFallbackConfig.playlist[emergencyFallbackConfig.currentPlaylistItemIndex] || emergencyFallbackConfig.playlist[0];
        const elapsed = emergencyFallbackConfig.currentPlaylistItemElapsedSec;
        const progress = Math.min(1, elapsed / currentItem.durationSec);

        const cx = videoX + videoW / 2;
        const cy = videoY + videoH / 2;

        // Background visual simulation of video clip
        const clipGrad = ctx.createLinearGradient(videoX, videoY, videoX + videoW, videoY + videoH);
        clipGrad.addColorStop(0, '#134e4a');
        clipGrad.addColorStop(0.5, '#0f172a');
        clipGrad.addColorStop(1, '#3b0764');
        ctx.fillStyle = clipGrad;
        ctx.fillRect(videoX + 30, videoY + 30, videoW - 60, videoH - 90);

        // Animated camera sweep lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(videoX + 45, videoY + 45, videoW - 90, videoH - 120);

        // On-air playlist badge
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(videoX + 50, videoY + 50, 200, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('EMERGENCY STANDBY PLAYLIST', videoX + 58, videoY + 66);

        // Clip Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentItem.title, cx, cy - 20);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '13px monospace';
        ctx.fillText(`Category: ${currentItem.category.toUpperCase()} • Resolution: ${currentItem.resolution} • ${currentItem.codec}`, cx, cy + 15);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px monospace';
        ctx.fillText(`Audio: ${currentItem.audioTrack}`, cx, cy + 38);

        // Progress bar
        const barW = videoW - 120;
        const barY = videoY + videoH - 75;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(videoX + 60, barY, barW, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(videoX + 60, barY, barW * progress, 8);

        // Timecode
        const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`CLIP ${emergencyFallbackConfig.currentPlaylistItemIndex + 1} OF ${emergencyFallbackConfig.playlist.length} [${formatTime(elapsed)} / ${formatTime(currentItem.durationSec)}]`, videoX + 60, barY + 22);

        const nextIndex = (emergencyFallbackConfig.currentPlaylistItemIndex + 1) % emergencyFallbackConfig.playlist.length;
        const nextItem = emergencyFallbackConfig.playlist[nextIndex];
        ctx.textAlign = 'right';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`NEXT: ${nextItem.title.slice(0, 36)}...`, videoX + videoW - 60, barY + 22);

      } else {
        // Live Sports / Studio Broadcast Simulation
        const grad = ctx.createLinearGradient(videoX, videoY, videoX + videoW, videoY + videoH);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.3, '#1e293b');
        grad.addColorStop(0.7, '#1e1b4b');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(videoX, videoY, videoW, videoH);

        // Dynamic 3D Broadcast studio lighting & sports graticule
        const t = time * 0.001;
        const cx = videoX + videoW / 2;
        const cy = videoY + videoH / 2;

        // Animated neon field / studio camera motion
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(t * 0.2) * 0.05);

        // Arena pitch lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-videoW * 0.4, -videoH * 0.35, videoW * 0.8, videoH * 0.7);

        ctx.beginPath();
        ctx.arc(0, 0, videoH * 0.25, 0, Math.PI * 2);
        ctx.stroke();

        // Player / object tracking crosshairs
        for (let i = 0; i < 3; i++) {
          const px = Math.sin(t * 0.8 + i * 2) * (videoW * 0.3);
          const py = Math.cos(t * 0.6 + i * 1.5) * (videoH * 0.25);

          ctx.fillStyle = i === 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px - 14, py - 14, 28, 28);

          ctx.font = '9px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`CAM_${i + 1} [TRACK]`, px + 16, py - 6);
        }

        ctx.restore();

        // Broadcast Crosshair Graticule
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        // Center cross
        ctx.beginPath();
        ctx.moveTo(videoX + videoW / 2 - 20, videoY + videoH / 2);
        ctx.lineTo(videoX + videoW / 2 + 20, videoY + videoH / 2);
        ctx.moveTo(videoX + videoW / 2, videoY + videoH / 2 - 20);
        ctx.lineTo(videoX + videoW / 2, videoY + videoH / 2 + 20);
        ctx.stroke();

        // Safe Area Rectangles (Action Safe 90%, Title Safe 80%)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(videoX + videoW * 0.05, videoY + videoH * 0.05, videoW * 0.9, videoH * 0.9);
        ctx.strokeRect(videoX + videoW * 0.1, videoY + videoH * 0.1, videoW * 0.8, videoH * 0.8);
      }

      // Station Bug / Logo insertion
      if (logoConfig.active) {
        ctx.save();
        ctx.globalAlpha = logoConfig.opacity;
        const logoScale = logoConfig.scale;

        let lx = videoX + 24;
        let ly = videoY + 24;
        if (logoConfig.position === 'top-right') {
          lx = videoX + videoW - 140 * logoScale - 20;
          ly = videoY + 20;
        } else if (logoConfig.position === 'bottom-right') {
          lx = videoX + videoW - 140 * logoScale - 20;
          ly = videoY + videoH - 45 * logoScale - 20;
        } else if (logoConfig.position === 'bottom-left') {
          lx = videoX + 20;
          ly = videoY + videoH - 45 * logoScale - 20;
        }

        // Draw Badge
        const lw = 135 * logoScale;
        const lh = 32 * logoScale;
        ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 4 * logoScale);
        ctx.fill();
        ctx.stroke();

        // Small live red pip
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(lx + 12 * logoScale, ly + lh / 2, 4 * logoScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `bold ${Math.round(11 * logoScale)}px Inter, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(logoConfig.customText || 'MCR BROADCAST', lx + 22 * logoScale, ly + lh / 2);

        ctx.restore();
      }

      // Burned-In Timecode (SMPTE LTC HH:MM:SS:FF)
      const now = new Date();
      const frames = Math.floor((time / (1000 / 60)) % 60);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timecode = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}:${pad(frames)}`;

      // Timecode overlay box (top center of video)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(videoX + videoW / 2 - 75, videoY + 12, 150, 24);
      ctx.strokeStyle = '#374151';
      ctx.strokeRect(videoX + videoW / 2 - 75, videoY + 12, 150, 24);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`TC ${timecode}`, videoX + videoW / 2, videoY + 24);

      // Active Input Source Badge on Canvas
      ctx.fillStyle = inputSource === 'sdi' ? 'rgba(180, 83, 9, 0.9)' : 'rgba(2, 132, 199, 0.9)';
      ctx.fillRect(videoX + 16, videoY + 12, 180, 24);
      ctx.strokeStyle = inputSource === 'sdi' ? '#fcd34d' : '#7dd3fc';
      ctx.lineWidth = 1;
      ctx.strokeRect(videoX + 16, videoY + 12, 180, 24);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        inputSource === 'sdi' ? '● SDI IN [SCTE-104 VANC]' : `● SRT IN :${srtIngest.port} [SCTE-35]`,
        videoX + 16 + 90,
        videoY + 24
      );

      // SCTE-35 On-Air Ad Break Banner
      if (activeAdBreak && activeAdBreak.active) {
        ctx.fillStyle = 'rgba(234, 88, 12, 0.92)';
        ctx.fillRect(videoX + 16, videoY + videoH - 46, videoW - 32, 34);
        ctx.strokeStyle = '#fdba74';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(videoX + 16, videoY + videoH - 46, videoW - 32, 34);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⚡ SCTE-35 AD INSERTION IN PROGRESS: ${activeAdBreak.remainingSec}s REMAINING`, videoX + 32, videoY + videoH - 29);

        ctx.textAlign = 'right';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('SPLICE_INSERT / AUTO-RETURN', videoX + videoW - 32, videoY + videoH - 29);
      }

      // Active Incident Emergency Banner
      if (activeIncidents.length > 0) {
        const topInc = activeIncidents[0];
        const isBlink = Math.floor(time * 0.003) % 2 === 0;
        ctx.fillStyle = isBlink ? 'rgba(225, 29, 72, 0.95)' : 'rgba(159, 18, 57, 0.95)';
        ctx.fillRect(videoX + 16, videoY + 40, videoW - 32, 32);
        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(videoX + 16, videoY + 40, videoW - 32, 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🚨 FAULT ALARM: ${topInc.title.toUpperCase()} • SMTP ALERT DISPATCHED`, videoX + 32, videoY + 56);

        ctx.textAlign = 'right';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${topInc.severity} [${activeIncidents.length} ACTIVE]`, videoX + videoW - 32, videoY + 56);
      }

      // Dual VU PPM Audio Peak Meters (Right Edge)
      if (showOverlays) {
        const vuX = videoX + videoW - 36;
        const vuY = videoY + 45;
        const vuH = videoH - 90;
        const vuW = 8;

        // Peak heights with jitter
        const leftLevel = isMuted ? 0 : Math.min(1, Math.max(0.1, 0.75 + Math.sin(time * 0.015) * 0.2 + (Math.random() - 0.5) * 0.1));
        const rightLevel = isMuted ? 0 : Math.min(1, Math.max(0.1, 0.72 + Math.cos(time * 0.013) * 0.22 + (Math.random() - 0.5) * 0.1));

        // Background groove
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(vuX - 4, vuY - 4, vuW * 2 + 14, vuH + 8);

        const drawVuBar = (x: number, level: number) => {
          const filledH = vuH * level;
          const greenH = Math.min(filledH, vuH * 0.7);
          const yellowH = Math.min(Math.max(0, filledH - vuH * 0.7), vuH * 0.2);
          const redH = Math.max(0, filledH - vuH * 0.9);

          // Green zone (-60 to -12 dB)
          ctx.fillStyle = '#10b981';
          ctx.fillRect(x, vuY + vuH - greenH, vuW, greenH);

          // Yellow zone (-12 to 0 dB)
          if (yellowH > 0) {
            ctx.fillStyle = '#eab308';
            ctx.fillRect(x, vuY + vuH - greenH - yellowH, vuW, yellowH);
          }

          // Red clip zone (> 0 dB)
          if (redH > 0) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x, vuY + vuH - greenH - yellowH - redH, vuW, redH);
          }
        };

        drawVuBar(vuX, leftLevel);
        drawVuBar(vuX + vuW + 4, rightLevel);

        ctx.font = '8px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('L', vuX + 4, vuY + vuH + 12);
        ctx.fillText('R', vuX + vuW + 8, vuY + vuH + 12);
      }

      ctx.restore(); // Restore clip

      // Border outline for active video box
      ctx.strokeStyle = squeezeActive ? '#38bdf8' : '#1f2937';
      ctx.lineWidth = squeezeActive ? 2 : 1;
      ctx.strokeRect(videoX, videoY, videoW, videoH);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isStreaming,
    videoConfig,
    srtIngest,
    lbandConfig,
    logoConfig,
    activeAdBreak,
    videoSourceSlate,
    isMuted,
    showOverlays,
    health,
    emergencyFallbackConfig,
  ]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl"
    >
      {/* Monitor Header / Tally Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          {/* Production Tally LED */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
              isStreaming
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-rose-500 animate-tally' : 'bg-neutral-600'
              }`}
            />
            {isStreaming ? 'ON AIR • MCR CONFIDENCE' : 'STANDBY'}
          </span>

          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="font-mono text-neutral-300 hidden sm:inline">
            {videoConfig.resolution} @ {videoConfig.fps}fps
          </span>

          <span className="text-neutral-500 hidden md:inline">|</span>
          <span className="font-mono text-neutral-400 hidden md:inline">
            CODEC: <span className="text-emerald-400 uppercase">{videoConfig.codec}</span> {videoConfig.profile}
          </span>
        </div>

        {/* Telemetry quick badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>RENDER FPS:</span>
            <span className="text-emerald-400 font-bold">{fpsCounter}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300 hidden lg:flex">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>RTT:</span>
            <span className="text-amber-400">{health.rttMs.toFixed(1)}ms</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Fullscreen Monitor"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Emergency Fallback Active Banner */}
      {emergencyFallbackConfig.isEngaged && (
        <div className="bg-amber-950/95 border-b border-amber-500/80 text-amber-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              EMERGENCY AUTO-FAILOVER ON AIR: [{videoSourceSlate.replace('_', ' ').toUpperCase()}]
            </span>
            <span className="text-neutral-400 text-[11px] hidden md:inline">
              (Total signal loss detected on SDI and all SRT inputs)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateEmergencyFallbackConfig({ musicEnabled: !emergencyFallbackConfig.musicEnabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                emergencyFallbackConfig.musicEnabled
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>MUSIC: {emergencyFallbackConfig.musicEnabled ? 'PLAYING (♫)' : 'MUTED'}</span>
            </button>

            <button
              onClick={() => dismissEmergencyFallback()}
              className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition shadow"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RETURN TO LIVE</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport (16:9 ratio) */}
      <div className="relative bg-black aspect-video w-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain"
        />

        {/* Scanline subtle CRT effect overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.015] to-transparent opacity-50" />
      </div>

      {/* Broadcast Quick Action Bar */}
      <div className="p-2.5 bg-neutral-900/90 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Source Matrix & Slate Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Master A/B Input Switch */}
          <div className="flex items-center gap-1 bg-black p-0.5 rounded border border-neutral-700">
            <button
              onClick={() => setInputSource('sdi')}
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition flex items-center gap-1 ${
                inputSource === 'sdi'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Switch to 12G-SDI Input with SCTE-104 VANC"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${inputSource === 'sdi' ? 'bg-black' : 'bg-neutral-500'}`} />
              <span>SDI IN</span>
            </button>
            <button
              onClick={() => setInputSource('srt')}
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition flex items-center gap-1 ${
                inputSource === 'srt'
                  ? 'bg-sky-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Switch to IP SRT Stream Ingest"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${inputSource === 'srt' ? 'bg-black' : 'bg-neutral-500'}`} />
              <span>SRT IN</span>
            </button>
          </div>

          <span className="text-neutral-400 font-mono text-[11px] uppercase mr-1 flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-neutral-500" />
            Slate:
          </span>
          <button
            onClick={() => setVideoSourceSlate('live')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] ${
              videoSourceSlate === 'live'
                ? 'bg-sky-600 text-white font-semibold shadow'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            LIVE CAM
          </button>
          <button
            onClick={() => setVideoSourceSlate('bars')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] ${
              videoSourceSlate === 'bars'
                ? 'bg-sky-600 text-white font-semibold shadow'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            SMPTE BARS
          </button>
          <button
            onClick={() => setVideoSourceSlate('slate_break')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] ${
              videoSourceSlate === 'slate_break'
                ? 'bg-amber-600 text-white font-semibold shadow'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            AD SLATE
          </button>
          <button
            onClick={() => setVideoSourceSlate('technical_diff')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] ${
              videoSourceSlate === 'technical_diff'
                ? 'bg-rose-600 text-white font-semibold shadow'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            TECH DIFF
          </button>
          <button
            onClick={() => setVideoSourceSlate('stay_tuned')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] flex items-center gap-1 ${
              videoSourceSlate === 'stay_tuned'
                ? 'bg-amber-600 text-black font-bold shadow'
                : 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
            }`}
            title="Station emergency Stay Tuned slate with recovery messaging"
          >
            <span>STAY TUNED</span>
          </button>
          <button
            onClick={() => setVideoSourceSlate('montage_music')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] flex items-center gap-1 ${
              videoSourceSlate === 'montage_music'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'bg-neutral-800 text-purple-300 hover:bg-neutral-700'
            }`}
            title="Cool broadcast montage with synthesized background audio"
          >
            <Music className="w-3 h-3 text-purple-300" />
            <span>MONTAGE & MUSIC</span>
          </button>
          <button
            onClick={() => setVideoSourceSlate('emergency_playlist')}
            className={`px-2 py-1 rounded font-mono transition text-[11px] flex items-center gap-1 ${
              videoSourceSlate === 'emergency_playlist'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'bg-neutral-800 text-emerald-400 hover:bg-neutral-700'
            }`}
            title="Looping standby backup video playlist"
          >
            <Film className="w-3 h-3 text-emerald-400" />
            <span>PLAYLIST</span>
          </button>
        </div>

        {/* L-Band and SCTE Controls */}
        <div className="flex items-center gap-2">
          {/* L-Band Trigger */}
          <button
            onClick={() => triggerLBand()}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] font-semibold transition ${
              lbandConfig.active
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-neutral-800 text-cyan-400 hover:bg-neutral-700 border border-cyan-900/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {lbandConfig.active ? 'L-BAND ON-AIR' : 'TRIGGER L-BAND'}
          </button>

          {/* Astron Band Trigger */}
          <button
            onClick={() => triggerAstronBand()}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] font-semibold transition ${
              lbandConfig.astronBandActive
                ? 'bg-sky-700 text-sky-100 border border-sky-500'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            ASTRON BAND
          </button>

          {/* SCTE-35 Quick Ad Break */}
          <button
            onClick={() => triggerScteCue('splice_insert', 'provider_ad_start', 30)}
            disabled={Boolean(activeAdBreak?.active)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] font-semibold transition ${
              activeAdBreak?.active
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-black shadow'
            }`}
          >
            <span>⚡ SCTE CUE (30s)</span>
          </button>

          {/* Audio Controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              title={isMuted ? 'Unmute Monitor Audio' : 'Mute Monitor Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
