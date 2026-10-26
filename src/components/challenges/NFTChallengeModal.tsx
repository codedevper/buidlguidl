import React, { useState } from 'react';
import { X, Sparkles, Code, CheckCircle2 } from 'lucide-react';
import { EVMState, NFTItem } from '../../types/game';
import { CHALLENGES } from '../../solidity/contractsData';
import { generateLoogieSvg } from '../../blockchain/simulatedEVM';
import { sound } from '../../audio/soundSynth';

interface NFTChallengeModalProps {
  evmState: EVMState;
  onMint: (name: string, color: string, eyeType: NFTItem['eyeType'], accessory: NFTItem['accessory'], chonkiness: number) => void;
  onClose: () => void;
  onOpenSolidity: () => void;
}

export const NFTChallengeModal: React.FC<NFTChallengeModalProps> = ({
  evmState,
  onMint,
  onClose,
  onOpenSolidity,
}) => {
  const meta = CHALLENGES.c0_nft.meta;
  const [name, setName] = useState('My Buidl Loogie');
  const [color, setColor] = useState('#38bdf8');
  const [eyeType, setEyeType] = useState<NFTItem['eyeType']>('cool');
  const [accessory, setAccessory] = useState<NFTItem['accessory']>('hardhat');
  const [chonkiness, setChonkiness] = useState(3);
  const [isMinting, setIsMinting] = useState(false);

  const previewSvg = generateLoogieSvg(color, eyeType, accessory, chonkiness);

  const handleMint = () => {
    setIsMinting(true);
    sound.playClick();
    setTimeout(() => {
      onMint(name, color, eyeType, accessory, chonkiness);
      setIsMinting(false);
    }, 400);
  };

  const isCompleted = evmState.completedChallenges.c0_nft;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold border border-sky-500/40">
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
              <span>YourItem.sol</span>
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Live On-Chain SVG Preview */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square max-w-[280px] rounded-2xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-center shadow-inner relative overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
              <div className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-slate-800">
                100% On-Chain SVG
              </div>
            </div>

            <p className="mt-3 text-xs text-center text-slate-400 font-mono max-w-[280px]">
              Dynamic vector traits generated via pure EVM byte-strings & base64 encoding.
            </p>
          </div>

          {/* Right Column: Customizer & Mint Form */}
          <div className="md:col-span-7 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Loogie Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  maxLength={24}
                />
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Color Finish</label>
                <div className="flex items-center gap-2.5">
                  {['#38bdf8', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        sound.playClick();
                        setColor(c);
                      }}
                      className={`cursor-pointer w-8 h-8 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Eye Types */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Expression</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['cool', 'normal', 'laser', 'derp'] as NFTItem['eyeType'][]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        sound.playClick();
                        setEyeType(type);
                      }}
                      className={`cursor-pointer py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
                        eyeType === type
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Gear Accessory</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['hardhat', 'party_hat', 'headphones', 'crown', 'none'] as NFTItem['accessory'][]).map(
                    (acc) => (
                      <button
                        key={acc}
                        onClick={() => {
                          sound.playClick();
                          setAccessory(acc);
                        }}
                        className={`cursor-pointer py-1.5 px-2 rounded-lg text-xs font-mono capitalize border truncate transition-colors ${
                          accessory === acc
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {acc.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Chonkiness Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Chonkiness Scale</span>
                  <span className="text-cyan-400 font-bold">{chonkiness}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={chonkiness}
                  onChange={(e) => setChonkiness(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Mint CTA Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs font-mono text-slate-400">
                <span>Contract Gas: </span>
                <span className="text-emerald-400">0.00 ETH (Free Local Mint)</span>
              </div>

              <button
                disabled={isMinting}
                onClick={handleMint}
                className="cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isMinting ? 'Mining NFT Block...' : 'Mint Item to Localhost'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Minted Collection Carousel */}
        {evmState.nfts.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/40">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Your Minted NFT Tokens ({evmState.nfts.length})
            </h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
              {evmState.nfts.map((nft) => (
                <div
                  key={nft.id}
                  className="shrink-0 w-36 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-20 h-20"
                    dangerouslySetInnerHTML={{ __html: nft.svgContent }}
                  />
                  <div className="text-xs font-bold text-white truncate max-w-full">{nft.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400">Token ID #{nft.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
