import React from 'react';
import { X, Terminal, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { EVMState } from '../types/game';
import { sound } from '../audio/soundSynth';

interface HardhatConsoleModalProps {
  evmState: EVMState;
  onClose: () => void;
}

export const HardhatConsoleModal: React.FC<HardhatConsoleModalProps> = ({
  evmState,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl flex flex-col font-mono text-slate-300">
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">
              Hardhat Localhost RPC Node (127.0.0.1:8545)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ChainID: 31337
              </span>
              <span className="text-slate-600">|</span>
              <span>Block #{evmState.blockNumber}</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="cursor-pointer p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Logs Window */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs leading-relaxed bg-black/80 font-mono">
          {evmState.terminalLogs.map((log, index) => {
            let color = 'text-slate-300';
            if (log.includes('[Block')) color = 'text-cyan-400 font-bold';
            else if (log.includes('Deployed')) color = 'text-emerald-400';
            else if (log.includes('WINNER') || log.includes('ACHIEVEMENT') || log.includes('Success')) color = 'text-amber-300 font-bold';
            else if (log.includes('REVERT') || log.includes('Lost')) color = 'text-rose-400';

            return (
              <div key={index} className={`${color} flex items-start gap-2`}>
                <span className="text-slate-600 select-none">&gt;</span>
                <span className="break-all">{log}</span>
              </div>
            );
          })}
        </div>

        {/* Transactions Summary Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mined Transactions: <b className="text-white">{evmState.transactions.length}</b></span>
          </div>
          <span className="text-slate-500">Automined in ~0ms on Hardhat node</span>
        </div>
      </div>
    </div>
  );
};
