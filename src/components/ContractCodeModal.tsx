import React, { useState } from 'react';
import { X, Code, Info, FileCode, CheckCircle2 } from 'lucide-react';
import { ChallengeId } from '../types/game';
import { CHALLENGES } from '../solidity/contractsData';
import { sound } from '../audio/soundSynth';

interface ContractCodeModalProps {
  initialChallengeId: ChallengeId;
  onClose: () => void;
}

export const ContractCodeModal: React.FC<ContractCodeModalProps> = ({
  initialChallengeId,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<ChallengeId>(initialChallengeId);
  const challenge = CHALLENGES[selectedId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Solidity Smart Contract Inspector</span>
                <span className="text-xs font-mono font-normal text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                  {challenge.contractName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{challenge.meta.title} — {challenge.meta.subtitle}</p>
            </div>
          </div>

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

        {/* Contract Selector Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/90 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {Object.values(CHALLENGES).map((ch) => (
            <button
              key={ch.meta.id}
              onClick={() => {
                sound.playClick();
                setSelectedId(ch.meta.id);
              }}
              className={`cursor-pointer shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                selectedId === ch.meta.id
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{ch.contractName}</span>
            </button>
          ))}
        </div>

        {/* Code Content & Walkthrough */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Conceptual Summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Contract Architecture:</span>
            </div>
            <p className="leading-relaxed">{challenge.explanation}</p>
          </div>

          {/* Interactive Annotated Lines */}
          {challenge.annotatedLines.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Critical Solidity Patterns in this Contract:
              </h3>
              <div className="space-y-2">
                {challenge.annotatedLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono ${
                      line.isImportant
                        ? 'bg-cyan-950/30 border-cyan-700/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-white mb-1">
                      <span className="text-slate-500 mr-2">Line {line.lineNum}:</span>
                      <code>{line.code}</code>
                    </div>
                    {line.annotation && (
                      <p className="text-[11px] text-slate-400 pl-4 border-l-2 border-cyan-500 mt-1">
                        {line.annotation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Raw Code Box */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Full Contract Source:
            </h3>
            <pre className="p-4 rounded-xl bg-black border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
              <code>{challenge.sourceCode}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Goal: {challenge.checkpointGoal}</span>
          </div>
          <a
            href="https://buidlguidl.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Learn more at BuidlGuidl ↗
          </a>
        </div>
      </div>
    </div>
  );
};
