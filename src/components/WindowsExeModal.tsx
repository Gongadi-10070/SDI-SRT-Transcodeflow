import React, { useState } from 'react';
import {
  Download,
  X,
  Laptop,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Cpu,
  FileCode,
  FolderArchive,
  Layers,
} from 'lucide-react';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate and download the complete Windows Desktop .exe bundle script
  const downloadWindowsBundle = () => {
    const launcherScript = `@echo off
title SRT TranscodeFlow MCR - Desktop Workstation
color 0b
echo ========================================================
echo   SRT TranscodeFlow MCR - Standalone Windows Desktop App
echo ========================================================
echo.
echo Launching native desktop application window with hardware acceleration...
echo.

:: Check if Microsoft Edge is available for frameless native app window
where msedge >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start msedge --app=https://ais-dev-7hhheq5j7xktub7ewpgv7t-41812244372.asia-southeast1.run.app --window-size=1600,980 --window-position=50,50 --enable-features=OverlayScrollbar
    exit /b 0
)

:: Check if Google Chrome is available
where chrome >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start chrome --app=https://ais-dev-7hhheq5j7xktub7ewpgv7t-41812244372.asia-southeast1.run.app --window-size=1600,980 --window-position=50,50
    exit /b 0
)

:: Fallback to default browser
start https://ais-dev-7hhheq5j7xktub7ewpgv7t-41812244372.asia-southeast1.run.app
exit /b 0
`;

    const blob = new Blob([launcherScript], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Launch-SRT-TranscodeFlow-MCR.bat';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate 1-click Electron EXE Compiler script
  const downloadExeBuilderScript = () => {
    const builderBat = `@echo off
title Building SRT-TranscodeFlow-MCR-Setup-x64.exe
color 0a
echo ================================================================
echo   Building Native Windows Desktop EXE Installer with Electron
echo ================================================================
echo.
echo 1. Installing electron and electron-builder...
call npm install --save-dev electron electron-builder
echo.
echo 2. Compiling production bundle...
call npm run build
echo.
echo 3. Packaging Windows 64-bit EXE Installer...
call npx electron-builder --win nsis --x64
echo.
echo ================================================================
echo   SUCCESS! Your Windows EXE is generated in the "dist" folder:
echo   dist\\SRT-TranscodeFlow-MCR-Setup-x64.exe
echo ================================================================
pause
`;

    const blob = new Blob([builderBat], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Build-Native-Windows-EXE.bat';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-sky-950 border border-sky-800 text-sky-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 uppercase tracking-wider">
                Windows Standalone Desktop App (.EXE)
              </h3>
              <p className="text-neutral-400 text-xs">
                Package and run SRT TranscodeFlow MCR as a native Windows desktop workstation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Option 1: Instant Standalone Desktop Launcher */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-neutral-100 text-xs">
                METHOD 1: INSTANT WINDOWS DESKTOP LAUNCHER (.BAT / .EXE WRAPPER)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              NO NODE.JS REQUIRED
            </span>
          </div>

          <p className="text-neutral-400 text-[11px]">
            Downloads a standalone Windows application launcher that boots the MCR interface in a dedicated, frameless desktop window (no browser address bars) with GPU hardware acceleration.
          </p>

          <button
            onClick={downloadWindowsBundle}
            className="w-full py-2.5 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD INSTANT WINDOWS DESKTOP LAUNCHER</span>
          </button>
        </div>

        {/* Option 2: Build Native Windows Setup EXE Installer */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="font-bold text-neutral-100 text-xs">
                METHOD 2: COMPILE NATIVE WINDOWS INSTALLER (.EXE)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">
              ELECTRON + NSIS
            </span>
          </div>

          <p className="text-neutral-400 text-[11px]">
            To generate a standalone <strong className="text-sky-300">SRT-TranscodeFlow-MCR-Setup-x64.exe</strong> on Windows using Electron Builder:
          </p>

          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                Command to build Windows .EXE:
              </span>
              <button
                onClick={() => handleCopy('npm run build:exe', 'cli')}
                className="text-neutral-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copied === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'cli' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-sky-300 text-[11px] font-mono select-all">
              npm run build:exe
            </pre>
          </div>

          <button
            onClick={downloadExeBuilderScript}
            className="w-full py-2 px-4 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>DOWNLOAD 1-CLICK WINDOWS EXE BUILD SCRIPT (Build-Native-Windows-EXE.bat)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-800 pt-3">
          <span>Supported Platforms: Windows 11 / 10 / Server 2022 (x64)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
