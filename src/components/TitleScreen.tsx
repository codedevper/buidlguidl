import React, { useEffect } from 'react';
import { Play, Sparkles, Terminal, Shield, Zap } from 'lucide-react';
import { sound } from '../audio/soundSynth';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto flex flex-col justify-between p-8 sm:p-12 select-none">
      {/* Top Bar / Brand Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-cyan-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>SCAFFOLD-ETH 2 × BUIDLGUIDL</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">HARDHAT SIMULATOR</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">r160+ WebGL</span>
          <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-amber-400">EVM v0.8.20</span>
        </div>
      </div>

      {/* Hero Center Lockup with Bespoke SVG */}
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Inline SVG Title Graphic */}
        <div className="w-28 h-28 mb-4 drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,6 88,48 50,62 12,48" fill="#38bdf8" fillOpacity="0.85" stroke="#0284c7" strokeWidth="2" />
            <polygon points="50,66 88,52 50,94 12,52" fill="#0284c7" fillOpacity="0.85" stroke="#0369a1" strokeWidth="2" />
            <polygon points="50,14 78,48 50,58 22,48" fill="#bae6fd" />
            <polygon points="50,64 78,54 50,86 22,54" fill="#0ea5e9" />
            <circle cx="50" cy="50" r="14" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
            <text x="50" y="55" fontSize="11" fontWeight="bold" fill="#78350f" textAnchor="middle" fontFamily="monospace">🏗</text>
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-md">
          Scaffold<span className="text-cyan-400">-ETH</span> 3D
        </h1>
        <p className="mt-2 text-lg sm:text-xl font-medium text-slate-300">
          The BuidlGuidl Web3 Odyssey
        </p>

        <p className="mt-3 text-sm text-slate-400 max-w-lg leading-relaxed">
          Explore an interactive 3D Ethereum sandbox. Conquer the legendary Scaffold-ETH challenges:
          NFT Minter, Decentralized Staking, Token Vendors, Dice Exploit, AMM DEX, and Multisig Vaults.
        </p>

        {/* Start Button */}
        <button
          onClick={() => {
            sound.playClick();
            onStart();
          }}
          className="mt-8 group cursor-pointer flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          <Play className="w-5 h-5 fill-white group-hover:translate-x-0.5 transition-transform" />
          <span>ENTER BUIDLGUIDL</span>
          <span className="ml-2 text-xs font-mono font-normal px-2 py-0.5 rounded bg-white/20 text-white">
            Space / Enter
          </span>
        </button>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>6 Interactive Challenges</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real x*y=k & Pseudo-Random Exploits</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Annotated Solidity Walkthroughs</span>
          </div>
        </div>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="text-center font-mono text-xs text-slate-400 tracking-wider">
        <span>WASD Move</span>
        <span className="mx-2.5 text-slate-600">·</span>
        <span>Click / E Interact</span>
        <span className="mx-2.5 text-slate-600">·</span>
        <span>H Toggle Controls</span>
        <span className="mx-2.5 text-slate-600">·</span>
        <span>Esc Close Windows</span>
      </div>
    </div>
  );
};
