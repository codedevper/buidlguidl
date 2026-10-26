import React, { useState } from 'react';
import { X, Code, CheckCircle2, Dice5, ShieldAlert, Cpu, Award } from 'lucide-react';
import { EVMState } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { sound } from '../../audio/soundSynth';

interface DiceChallengeModalProps {
  evmState: EVMState;
  onDeployAttacker: () => void;
  onRollBlind: () => void;
  onExecuteRiggedRoll: () => void;
  onClose: () => void;
  onOpenSolidity: () => void;
}

export const DiceChallengeModal: React.FC<DiceChallengeModalProps> = ({
  evmState,
  onDeployAttacker,
  onRollBlind,
  onExecuteRiggedRoll,
  onClose,
  onOpenSolidity,
}) => {
  const meta = CHALLENGES.c3_dice.meta;
  const isCompleted = evmState.completedChallenges.c3_dice;
  const [animating, setAnimating] = useState(false);

  const handleBlindRoll = () => {
    setAnimating(true);
    sound.playClick();
    setTimeout(() => {
      onRollBlind();
      setAnimating(false);
    }, 350);
  };

  const handleRiggedRoll = () => {
    setAnimating(true);
    sound.playClick();
    setTimeout(() => {
      onExecuteRiggedRoll();
      setAnimating(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold border border-rose-500/40">
              {meta.badge}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{meta.title}</span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-normal">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenSolidity();
              }}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-300 border border-slate-700 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>RiggedRoll.sol</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Game Rules & Vulnerability Explainer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Deterministic Pseudo-Random Vulnerability</span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                DiceGame generates rolls with <code className="text-rose-300">blockhash(block.number - 1) % 16</code>.
                Any roll <span className="text-emerald-400 font-bold">&lt;= 5 wins 0.005 ETH</span> (37.5% odds).
                A smart contract attacker can compute the result in advance and abort losing transactions!
              </p>
            </div>

            <div className="shrink-0 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[140px]">
              <span className="text-[11px] font-mono text-slate-400 block">Prize Vault</span>
              <span className="text-lg font-black text-amber-400 tabular-nums">
                {evmState.dicePrizePoolEth.toFixed(3)} ETH
              </span>
              <span className="text-[10px] font-mono text-slate-500 block">Roll: 0.002 ETH</span>
            </div>
          </div>

          {/* Dual Paths: Gambler vs Attacker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Normal Gambler */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Dice5 className="w-4 h-4 text-slate-400" />
                  <span>Honest Gambler Mode</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Sends 0.002 ETH blindly to the DiceGame contract. High risk of losing.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>Normal Rolls: <b className="text-white">{evmState.normalRollsCount}</b></span>
                  <span>Cost: <b className="text-rose-400">0.002 ETH</b></span>
                </div>

                <button
                  disabled={animating}
                  onClick={handleBlindRoll}
                  className="w-full cursor-pointer py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs font-mono tracking-wider transition-colors active:scale-95"
                >
                  ROLL BLINDLY (msg.value)
                </button>
              </div>
            </div>

            {/* 2. Attacker Contract (RiggedRoll) */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-rose-900/50 flex flex-col justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl bg-rose-600/30 text-rose-300 font-mono text-[10px]">
                Exploit Contract
              </div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-rose-400" />
                  <span>RiggedRoll Attacker</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-computes hash before transferring funds. Reverts if roll &gt; 5. 100% win rate!
                </p>
              </div>

              <div className="space-y-3">
                {!evmState.attackerContractDeployed ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onDeployAttacker();
                    }}
                    className="w-full cursor-pointer py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs font-mono tracking-wider transition-all shadow-lg active:scale-95"
                  >
                    DEPLOY RIGGEDROLL.SOL
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-300 flex justify-between">
                      <span className="text-emerald-400">Contract Deployed ✓</span>
                      <span>Guaranteed Wins: <b className="text-amber-400">{evmState.attackerWinsCount}</b></span>
                    </div>

                    <button
                      disabled={animating}
                      onClick={handleRiggedRoll}
                      className="w-full cursor-pointer py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs font-mono tracking-wider transition-colors shadow-lg shadow-rose-600/30 active:scale-95"
                    >
                      EXECUTE RIGGED ROLL
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Roll Result Display */}
          {evmState.lastDiceRoll !== null && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-sm font-mono ${
                evmState.lastDiceWin
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>
                  Last Roll Result: <b className="text-white text-base">#{evmState.lastDiceRoll}</b>{' '}
                  ({evmState.lastDiceRoll <= 5 ? 'Winner! <= 5' : 'Loss > 5'})
                </span>
              </div>
              <span className="font-bold">
                {evmState.lastDiceWin ? '+0.005 ETH Jackpoted' : '-0.002 ETH Lost'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
