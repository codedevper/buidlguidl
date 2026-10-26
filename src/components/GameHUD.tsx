import React from 'react';
import { Volume2, VolumeX, Shield, Award, Terminal, Code } from 'lucide-react';
import { EVMState, ChallengeId } from '../types/game';
import { CHALLENGES } from '../solidity/contractsData';
import { sound } from '../audio/soundSynth';

interface GameHUDProps {
  evmState: EVMState;
  nearStationId: ChallengeId | null;
  onOpenStation: (id: ChallengeId) => void;
  onOpenTerminal: () => void;
  onOpenSolidity: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  evmState,
  nearStationId,
  onOpenStation,
  onOpenTerminal,
  onOpenSolidity,
  onToggleMute,
  isMuted,
}) => {
  const completedCount = Object.values(evmState.completedChallenges).filter(Boolean).length;
  const nearChallenge = nearStationId ? CHALLENGES[nearStationId] : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Perimeter Cluster */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left: Network & Node Stats */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-md">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              Localhost:8545
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              Block <span className="tabular-nums font-bold text-white">#{evmState.blockNumber}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              Gas <span className="tabular-nums text-cyan-400">{evmState.gasPriceGwei} Gwei</span>
            </span>
          </div>

          {/* Quick Tools buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenTerminal();
              }}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              title="Open simulated Hardhat Node terminal logs"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hardhat Node</span>
              {evmState.transactions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px] tabular-nums font-bold">
                  {evmState.transactions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSolidity();
              }}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              title="Inspect Solidity contracts & explanations"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>Solidity Contracts</span>
            </button>
          </div>
        </div>

        {/* Top-Right: Wallet & Guild Reputation */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Guild Progress Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-md">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">BUIDL:</span>
            <span className="tabular-nums font-bold text-amber-300">{evmState.buidlReputation} XP</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium">
              <span className="text-cyan-400 tabular-nums">{completedCount}</span>/6 Solved
            </span>
          </div>

          {/* User Balance */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-md">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 truncate max-w-[90px] sm:max-w-none">
              {evmState.userAddress.slice(0, 6)}...{evmState.userAddress.slice(-4)}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-bold tabular-nums">
              {evmState.userBalanceEth.toFixed(3)} ETH
            </span>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
            }}
            className="cursor-pointer p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound Synth' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Proximity Interaction Prompt (Center Overlay) */}
      {nearChallenge && (
        <div className="pointer-events-auto mx-auto mb-20 animate-bounce">
          <button
            onClick={() => {
              sound.playClick();
              onOpenStation(nearChallenge.meta.id);
            }}
            className="cursor-pointer flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-900/95 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.45)] text-white hover:bg-cyan-950 transition-colors"
          >
            <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black text-xs font-mono tracking-wider">
              PRESS E
            </span>
            <div className="text-left">
              <div className="text-xs text-cyan-300 font-mono font-semibold uppercase tracking-wider">
                {nearChallenge.meta.badge}
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{nearChallenge.meta.title}</span>
                {evmState.completedChallenges[nearChallenge.meta.id] && (
                  <span className="text-xs text-emerald-400 font-mono font-normal">✓ Completed</span>
                )}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
