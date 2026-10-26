import React from 'react';
import { X, Code, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { EVMState } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { sound } from '../../audio/soundSynth';

interface LoogieTankModalProps {
  evmState: EVMState;
  onClose: () => void;
  onOpenSolidity: () => void;
  onOpenNFTMinter: () => void;
}

export const LoogieTankModal: React.FC<LoogieTankModalProps> = ({
  evmState,
  onClose,
  onOpenSolidity,
  onOpenNFTMinter,
}) => {
  const meta = CHALLENGES.c6_svg.meta;
  const isCompleted = evmState.completedChallenges.c6_svg;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/40">
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
              <span>Loogie.sol</span>
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
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>The Magic of Public On-Chain SVG Renderers</span>
            </h3>
            <p>
              In traditional NFTs, image files live on central AWS servers or IPFS gateways. In Scaffold-ETH Cohort 6,
              the smart contract contains the full SVG XML string inside EVM bytecodes!
            </p>
            <p>
              By marking <code className="text-cyan-300 font-mono">render(uint256 id) public view</code>, other smart contracts
              can read your NFT’s vector code and combine them. An Optimistic Loogie can hold a Fancy Loogie, wear hats owned
              by other NFTs, and swim together in the tank!
            </p>
          </div>

          {/* The Tank Aquarium Showcase */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Active Cohort Tank ({evmState.nfts.length} Loogies Swimming)</span>
              </h3>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenNFTMinter();
                }}
                className="cursor-pointer text-xs font-mono text-cyan-400 hover:underline"
              >
                + Mint Another Loogie
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-950 border border-cyan-800/40 relative overflow-hidden min-h-[260px] flex items-center justify-center">
              {/* Water bubbles overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />

              <div className="flex flex-wrap items-center justify-center gap-6 z-10">
                {evmState.nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-lg flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <div
                      className="w-28 h-28"
                      dangerouslySetInnerHTML={{ __html: nft.svgContent }}
                    />
                    <div className="text-center font-mono">
                      <div className="text-xs font-bold text-white">{nft.name}</div>
                      <div className="text-[10px] text-cyan-400">Token ID #{nft.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {nft.eyeType} · {nft.accessory}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
