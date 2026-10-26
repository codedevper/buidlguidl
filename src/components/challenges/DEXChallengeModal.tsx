import React, { useState } from 'react';
import { X, Code, CheckCircle2, ArrowLeftRight, Droplet } from 'lucide-react';
import { EVMState } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { sound } from '../../audio/soundSynth';

interface DEXChallengeModalProps {
  evmState: EVMState;
  onSwapEthForTokens: (ethAmount: number) => void;
  onSwapTokensForEth: (tokenAmount: number) => void;
  onDepositLiquidity: (ethAmount: number) => void;
  onClose: () => void;
  onOpenSolidity: () => void;
}

export const DEXChallengeModal: React.FC<DEXChallengeModalProps> = ({
  evmState,
  onSwapEthForTokens,
  onSwapTokensForEth,
  onDepositLiquidity,
  onClose,
  onOpenSolidity,
}) => {
  const meta = CHALLENGES.c4_dex.meta;
  const [tab, setTab] = useState<'swap' | 'pool'>('swap');
  const [swapDirection, setSwapDirection] = useState<'ethToToken' | 'tokenToEth'>('ethToToken');
  const [amountIn, setAmountIn] = useState('0.5');
  const [depositEth, setDepositEth] = useState('1.0');

  const x = evmState.dexEthReserve;
  const y = evmState.dexTokenReserve;
  const k = x * y;
  const isCompleted = evmState.completedChallenges.c4_dex;

  // Real Uniswap v1 formula with 0.3% fee:
  // dy = (y * 997 * dx) / (x * 1000 + 997 * dx)
  const calcOutput = (inputVal: number, isEthInput: boolean) => {
    if (inputVal <= 0) return 0;
    const reserveIn = isEthInput ? x : y;
    const reserveOut = isEthInput ? y : x;
    const inWithFee = inputVal * 997;
    const num = inWithFee * reserveOut;
    const den = reserveIn * 1000 + inWithFee;
    return num / den;
  };

  const estOut = calcOutput(parseFloat(amountIn) || 0, swapDirection === 'ethToToken');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 font-mono text-xs font-bold border border-purple-500/40">
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
              <span>DEX.sol</span>
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
          {/* AMM Pool Reserves & Constant Product */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">ETH Reserve (x)</span>
              <span className="text-blue-400 font-bold text-sm tabular-nums">{x.toFixed(2)} ETH</span>
            </div>
            <div>
              <span className="text-slate-500 block">Token Reserve (y)</span>
              <span className="text-purple-400 font-bold text-sm tabular-nums">{y.toFixed(2)} Tokens</span>
            </div>
            <div>
              <span className="text-slate-500 block">Invariant (k = x * y)</span>
              <span className="text-amber-400 font-bold text-sm tabular-nums">{k.toFixed(0)}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setTab('swap');
              }}
              className={`cursor-pointer pb-2.5 px-4 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors ${
                tab === 'swap'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              SWAP TOKENS
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('pool');
              }}
              className={`cursor-pointer pb-2.5 px-4 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors ${
                tab === 'pool'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              LIQUIDITY POOL (LP)
            </button>
          </div>

          {tab === 'swap' ? (
            /* Swap Interface */
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Trading Pair: <b className="text-white">ETH / BALLOONS</b>
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setSwapDirection((prev) => (prev === 'ethToToken' ? 'tokenToEth' : 'ethToToken'));
                  }}
                  className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Reverse Direction</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    You Pay ({swapDirection === 'ethToToken' ? 'ETH' : 'Tokens'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Estimated Output (0.3% LP fee):</span>
                  <span className="text-purple-300 font-bold text-sm tabular-nums">
                    {estOut.toFixed(3)} {swapDirection === 'ethToToken' ? 'Tokens' : 'ETH'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const amt = parseFloat(amountIn);
                    if (amt > 0) {
                      if (swapDirection === 'ethToToken') {
                        onSwapEthForTokens(amt);
                      } else {
                        onSwapTokensForEth(amt);
                      }
                    }
                  }}
                  className="w-full cursor-pointer py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono tracking-wider transition-all shadow-lg active:scale-95"
                >
                  EXECUTE AMM SWAP
                </button>
              </div>
            </div>
          ) : (
            /* Liquidity Pool Interface */
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                <Droplet className="w-4 h-4 text-purple-400" />
                <span>Provide Liquidity to Earn 0.3% Protocol Trading Fees</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">ETH to Deposit</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={depositEth}
                    onChange={(e) => setDepositEth(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="mt-1 text-[11px] font-mono text-slate-500">
                    Required matching tokens:{' '}
                    <span className="text-purple-400 font-bold">
                      {(((parseFloat(depositEth) || 0) * y) / x).toFixed(2)} Tokens
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Your Current LP Tokens:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {evmState.userLpTokens.toFixed(2)} LP
                  </span>
                </div>

                <button
                  onClick={() => {
                    const amt = parseFloat(depositEth);
                    if (amt > 0) onDepositLiquidity(amt);
                  }}
                  className="w-full cursor-pointer py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono tracking-wider transition-colors shadow-lg active:scale-95"
                >
                  DEPOSIT LIQUIDITY & MINT LP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
