import React, { useState, useEffect } from 'react';
import { X, Code, CheckCircle2, AlertTriangle, Users, Clock, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { EVMState } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { sound } from '../../audio/soundSynth';

interface StakingChallengeModalProps {
  evmState: EVMState;
  onStake: (amount: number) => void;
  onSimulateStakers: () => void;
  onExecute: () => void;
  onWithdrawRefund: () => void;
  onReset: () => void;
  onClose: () => void;
  onOpenSolidity: () => void;
}

export const StakingChallengeModal: React.FC<StakingChallengeModalProps> = ({
  evmState,
  onStake,
  onSimulateStakers,
  onExecute,
  onWithdrawRefund,
  onReset,
  onClose,
  onOpenSolidity,
}) => {
  const meta = CHALLENGES.c1_staking.meta;
  const [stakeAmount, setStakeAmount] = useState('1.0');
  const [timeLeft, setTimeLeft] = useState(evmState.stakingDeadlineSeconds);

  useEffect(() => {
    if (evmState.stakingEnded) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [evmState.stakingEnded]);

  const pool = evmState.stakingPoolBalance;
  const target = evmState.stakingThreshold;
  const pct = Math.min(100, (pool / target) * 100);
  const isCompleted = evmState.completedChallenges.c1_staking;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40">
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
              <span>Staker.sol</span>
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
          {/* Progress Banner */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Staking Pool Progress</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Deadline:</span>
                <span className={`font-bold tabular-nums ${timeLeft <= 20 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Current Pool:{' '}
                <span className="font-bold text-white tabular-nums">{pool.toFixed(2)} ETH</span>
              </span>
              <span className="text-amber-400 font-bold">Target: {target.toFixed(1)} ETH</span>
              <span className="text-slate-400">
                Your Deposit: <span className="text-cyan-400 font-bold tabular-nums">{evmState.userStakedEth.toFixed(2)} ETH</span>
              </span>
            </div>
          </div>

          {/* Coordination Game Theory Explainer Box */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>Cooperate or Defect Mechanism:</span>
            </p>
            <p>
              • If the group deposits <span className="text-amber-400 font-semibold">&gt;= 5.0 ETH</span> before the deadline, calling <code className="text-cyan-300">execute()</code> transfers the pool into the external contract (Coordination Win!).
            </p>
            <p>
              • If the group defects and the deadline expires with &lt; 5.0 ETH, the contract trustlessly enables <code className="text-cyan-300">withdraw()</code> so every depositor retrieves their exact ETH safely.
            </p>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stake Input */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="block text-xs font-mono text-slate-400">Deposit Amount (ETH)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="10"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  disabled={evmState.stakingEnded}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  disabled={evmState.stakingEnded}
                  onClick={() => {
                    const amt = parseFloat(stakeAmount);
                    if (amt > 0) onStake(amt);
                  }}
                  className="cursor-pointer shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono tracking-wider transition-colors"
                >
                  STAKE()
                </button>
              </div>

              <button
                disabled={evmState.stakingEnded}
                onClick={() => {
                  sound.playClick();
                  onSimulateStakers();
                }}
                className="w-full cursor-pointer py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Other Guild Stakers</span>
              </button>
            </div>

            {/* Execute / Withdraw Outcome */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <span className="block text-xs font-mono text-slate-400 mb-1">Contract State</span>
                {evmState.stakingEnded ? (
                  evmState.isStakingCompleted ? (
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Threshold Met! Transferred to ExternalContract.
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Threshold missed. Open for refund withdraw!
                    </div>
                  )
                ) : (
                  <div className="text-xs font-mono text-amber-300">
                    Staking active. Ready to evaluate at or past deadline.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={evmState.stakingEnded}
                  onClick={() => {
                    sound.playClick();
                    onExecute();
                  }}
                  className="flex-1 cursor-pointer py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs font-mono tracking-wider transition-colors"
                >
                  EXECUTE()
                </button>

                <button
                  disabled={!evmState.stakingEnded || evmState.isStakingCompleted || evmState.userStakedEth <= 0}
                  onClick={() => {
                    sound.playClick();
                    onWithdrawRefund();
                  }}
                  className="flex-1 cursor-pointer py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>WITHDRAW()</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                sound.playClick();
                setTimeLeft(120);
                onReset();
              }}
              className="cursor-pointer flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Challenge Arena</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
