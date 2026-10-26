import React, { useState } from 'react';
import { X, Code, CheckCircle2, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import { EVMState } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { sound } from '../../audio/soundSynth';

interface VendorChallengeModalProps {
  evmState: EVMState;
  onBuy: (ethAmount: number) => void;
  onApprove: (tokenAmount: number) => void;
  onSell: (tokenAmount: number) => void;
  onClose: () => void;
  onOpenSolidity: () => void;
}

export const VendorChallengeModal: React.FC<VendorChallengeModalProps> = ({
  evmState,
  onBuy,
  onApprove,
  onSell,
  onClose,
  onOpenSolidity,
}) => {
  const meta = CHALLENGES.c2_vendor.meta;
  const [buyEthAmount, setBuyEthAmount] = useState('1.0');
  const [sellTokenAmount, setSellTokenAmount] = useState('100');

  const isCompleted = evmState.completedChallenges.c2_vendor;
  const allowance = evmState.userTokenAllowance;
  const tokenBal = evmState.userTokenBalance;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40">
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
              <span>Vendor.sol</span>
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
          {/* Machine Inventory & Exchange Rate */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Vendor Stock</span>
              <span className="text-emerald-400 font-bold text-sm tabular-nums">
                {evmState.vendorTokenBalance} GLD
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Vendor ETH Vault</span>
              <span className="text-white font-bold text-sm tabular-nums">
                {evmState.vendorEthBalance.toFixed(2)} ETH
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Exchange Rate</span>
              <span className="text-amber-400 font-bold text-sm">1 ETH = 100 GLD</span>
            </div>
          </div>

          {/* Interactive Trade Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Buy Tokens */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>1. Buy GLD Tokens</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Sends native ETH to Vendor; the contract transfers GLD tokens to your wallet.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">ETH to Spend</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={buyEthAmount}
                    onChange={(e) => setBuyEthAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="mt-1 text-[11px] font-mono text-slate-500">
                    You receive:{' '}
                    <span className="text-emerald-400 font-bold">
                      {(parseFloat(buyEthAmount) || 0) * 100} GLD
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const amt = parseFloat(buyEthAmount);
                    if (amt > 0) onBuy(amt);
                  }}
                  className="w-full cursor-pointer py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono tracking-wider transition-colors shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  BUY TOKENS (ETH)
                </button>
              </div>
            </div>

            {/* 2. Sell Tokens & Approve Pattern */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>2. Sell Tokens (Approve Pattern)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ERC20 rule: Vendor cannot withdraw tokens without prior <code className="text-cyan-300">approve()</code>.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Your GLD: <b className="text-white">{tokenBal}</b></span>
                  <span className="text-slate-400">Allowance: <b className="text-cyan-400">{allowance}</b></span>
                </div>

                <div>
                  <input
                    type="number"
                    step="50"
                    min="1"
                    value={sellTokenAmount}
                    onChange={(e) => setSellTokenAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="mt-1 text-[11px] font-mono text-slate-500">
                    ETH Refund:{' '}
                    <span className="text-cyan-400 font-bold">
                      {((parseFloat(sellTokenAmount) || 0) / 100).toFixed(2)} ETH
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const amt = parseFloat(sellTokenAmount);
                      if (amt > 0) onApprove(amt);
                    }}
                    className="cursor-pointer py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs font-mono tracking-wider transition-colors"
                  >
                    1. APPROVE()
                  </button>

                  <button
                    disabled={allowance < parseFloat(sellTokenAmount) || tokenBal < parseFloat(sellTokenAmount)}
                    onClick={() => {
                      const amt = parseFloat(sellTokenAmount);
                      if (amt > 0) onSell(amt);
                    }}
                    className="cursor-pointer py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs font-mono tracking-wider transition-colors"
                  >
                    2. SELL()
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
