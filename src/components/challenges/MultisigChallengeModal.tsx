import React, { useState } from 'react';
import { X, Code, CheckCircle2, ShieldCheck, Key, Plus, Send } from 'lucide-react';
import { EVMState } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { sound } from '../../audio/soundSynth';

interface MultisigChallengeModalProps {
  evmState: EVMState;
  onPropose: (to: string, amount: number, reason: string) => void;
  onSign: (txId: number, signer: string) => void;
  onExecute: (txId: number) => void;
  onClose: () => void;
  onOpenSolidity: () => void;
}

export const MultisigChallengeModal: React.FC<MultisigChallengeModalProps> = ({
  evmState,
  onPropose,
  onSign,
  onExecute,
  onClose,
  onOpenSolidity,
}) => {
  const meta = CHALLENGES.c5_multisig.meta;
  const isCompleted = evmState.completedChallenges.c5_multisig;

  const [toAddress, setToAddress] = useState(evmState.userAddress);
  const [amount, setAmount] = useState('2.5');
  const [reason, setReason] = useState('BuidlGuidl Odyssey Grant');
  const [showProposeForm, setShowProposeForm] = useState(false);

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0 && toAddress) {
      sound.playClick();
      onPropose(toAddress, val, reason);
      setShowProposeForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-pink-500/20 text-pink-400 font-mono text-xs font-bold border border-pink-500/40">
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
              <span>MetaMultiSigWallet.sol</span>
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
          {/* Treasury Vault Status */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Multisig Vault Balance</span>
              <span className="text-pink-400 font-bold text-sm tabular-nums">
                {evmState.multisigVaultBalanceEth.toFixed(1)} ETH
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Required Quorum</span>
              <span className="text-white font-bold text-sm">
                2 of 3 Signatures
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Signers</span>
              <span className="text-cyan-400 font-bold text-sm">Austin, Vitalik, You</span>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Treasury Transactions ({evmState.multisigTxs.length})
            </h3>
            <button
              onClick={() => {
                sound.playClick();
                setShowProposeForm(!showProposeForm);
              }}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs font-mono tracking-wider transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Propose Transaction</span>
            </button>
          </div>

          {/* Propose Form Drawer */}
          {showProposeForm && (
            <form onSubmit={handleProposeSubmit} className="p-4 rounded-xl bg-slate-950 border border-pink-900/50 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono">New Treasury Transfer Proposal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Recipient Address</label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Grant Reason / Memo</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeForm(false)}
                  className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-1.5 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs font-mono"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          )}

          {/* Proposals List */}
          <div className="space-y-3">
            {evmState.multisigTxs.map((tx) => {
              const hasUserSigned = tx.signatures.includes(evmState.userAddress);
              const hasAustinSigned = tx.signatures.includes('0x34aA3F359A9D6142327c5421c9c41E66A122E1A8');
              const hasVitalikSigned = tx.signatures.includes('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
              const canExecute = tx.signatures.length >= evmState.multisigRequiredSignatures && !tx.executed;

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-pink-400">Tx #{tx.id}</span>
                      <span className="font-bold text-white text-sm">{tx.amount} ETH</span>
                      <span className="text-slate-500 font-mono text-xs">→ {tx.to.slice(0, 8)}...</span>
                      {tx.executed && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold">
                          EXECUTED ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{tx.reason}</p>

                    {/* Signers list */}
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-500">
                        Signatures ({tx.signatures.length}/2):
                      </span>
                      {hasUserSigned && <span className="text-cyan-400">You ✓</span>}
                      {hasAustinSigned && <span className="text-amber-400">Austin ✓</span>}
                      {hasVitalikSigned && <span className="text-purple-400">Vitalik ✓</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!tx.executed && !hasUserSigned && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSign(tx.id, evmState.userAddress);
                        }}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Sign as You</span>
                      </button>
                    )}

                    {!tx.executed && !hasVitalikSigned && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSign(tx.id, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
                        }}
                        className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-purple-300 border border-slate-700 transition-colors"
                        title="Simulate co-signer Vitalik's cryptographic approval"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Vitalik Sign</span>
                      </button>
                    )}

                    <button
                      disabled={!canExecute}
                      onClick={() => {
                        sound.playClick();
                        onExecute(tx.id);
                      }}
                      className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-bold text-xs font-mono tracking-wider transition-colors shadow active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>EXECUTE()</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
