import React from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Home, 
  Video, 
  Compass, 
  Eye, 
  CheckCircle2, 
  Circle
} from 'lucide-react';
import { ChallengeId, CameraMode, EVMState } from '../types/game';
import { CHALLENGES } from '../solidity/contractsData';
import { sound } from '../audio/soundSynth';

interface ControlDockProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onTeleportStation: (id: ChallengeId) => void;
  onTeleportCastle: () => void;
  onOpenStationModal: (id: ChallengeId) => void;
  onRequestFaucet: () => void;
  cameraMode: CameraMode;
  onChangeCameraMode: (mode: CameraMode) => void;
  evmState: EVMState;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  isCollapsed,
  onToggleCollapse,
  onTeleportStation,
  onTeleportCastle,
  onOpenStationModal,
  onRequestFaucet,
  cameraMode,
  onChangeCameraMode,
  evmState,
}) => {
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[920px] transition-transform duration-300 pointer-events-auto select-none ${
        isCollapsed ? 'bottom-0 translate-y-[calc(100%-32px)]' : 'bottom-3'
      }`}
    >
      {/* Collapse/Expand Tab Header */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            sound.playClick();
            onToggleCollapse();
          }}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-1 rounded-t-xl bg-slate-900/95 border-t border-x border-slate-700/80 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors shadow-lg"
          title="Press H to toggle dock visibility"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>▴ Show Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>▾ Hide Controls (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-3 flex flex-col gap-2.5">
        {/* Row 1: Challenge Station Teleports & Quick Modals */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Castle / Center Hub */}
          <button
            onClick={() => {
              sound.playWarp();
              onTeleportCastle();
            }}
            className="cursor-pointer shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
            title="Teleport to BuidlGuidl Castle Center"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span>Castle Hub</span>
          </button>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          {/* 6 Challenges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {Object.values(CHALLENGES).map((ch) => {
              const isCompleted = evmState.completedChallenges[ch.meta.id];
              return (
                <div key={ch.meta.id} className="flex items-center">
                  <button
                    onClick={() => {
                      sound.playWarp();
                      onTeleportStation(ch.meta.id);
                    }}
                    onDoubleClick={() => {
                      sound.playClick();
                      onOpenStationModal(ch.meta.id);
                    }}
                    className={`cursor-pointer group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/70 hover:text-white'
                    }`}
                    title={`${ch.meta.title} (Single click to warp, double click to open)`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    )}
                    <span className="font-semibold text-slate-400 group-hover:text-white">
                      #{ch.meta.number}
                    </span>
                    <span className="truncate max-w-[85px] sm:max-w-none">
                      {ch.meta.title.split(' ')[1] || ch.meta.title}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Camera Modes & Faucet utility */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs font-mono">
          {/* Camera View Mode Toggles */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mr-1">Camera:</span>
            
            <button
              onClick={() => {
                sound.playClick();
                onChangeCameraMode('follow');
              }}
              className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                cameraMode === 'follow'
                  ? 'bg-cyan-500/20 border-cyan-500/70 text-cyan-300 font-bold'
                  : 'bg-slate-800/40 border-slate-700/70 text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Follow</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onChangeCameraMode('orbit');
              }}
              className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                cameraMode === 'orbit'
                  ? 'bg-cyan-500/20 border-cyan-500/70 text-cyan-300 font-bold'
                  : 'bg-slate-800/40 border-slate-700/70 text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Orbit</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onChangeCameraMode('flyover');
              }}
              className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                cameraMode === 'flyover'
                  ? 'bg-cyan-500/20 border-cyan-500/70 text-cyan-300 font-bold'
                  : 'bg-slate-800/40 border-slate-700/70 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Flyover</span>
            </button>
          </div>

          {/* Quick Faucet & Tip */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 hidden sm:inline">Need gas?</span>
            <button
              onClick={() => {
                onRequestFaucet();
              }}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 font-bold transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>Faucet (+10 ETH)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
