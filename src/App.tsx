/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SceneManager, StationHitInfo } from './three/SceneManager';
import { evm } from './blockchain/simulatedEVM';
import { sound } from './audio/soundSynth';
import { ChallengeId, CameraMode, EVMState } from './types/game';

// Components
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { ControlDock } from './components/ControlDock';
import { HardhatConsoleModal } from './components/HardhatConsoleModal';
import { ContractCodeModal } from './components/ContractCodeModal';

// Challenge Modals
import { NFTChallengeModal } from './components/challenges/NFTChallengeModal';
import { StakingChallengeModal } from './components/challenges/StakingChallengeModal';
import { VendorChallengeModal } from './components/challenges/VendorChallengeModal';
import { DiceChallengeModal } from './components/challenges/DiceChallengeModal';
import { DEXChallengeModal } from './components/challenges/DEXChallengeModal';
import { MultisigChallengeModal } from './components/challenges/MultisigChallengeModal';
import { LoogieTankModal } from './components/challenges/LoogieTankModal';

export default function App() {
  // Game Lifecycle State
  const [gameState, setGameState] = useState<'title' | 'playing'>('title');
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('flyover');

  // Active Modals
  const [activeChallengeModal, setActiveChallengeModal] = useState<ChallengeId | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSolidityOpen, setIsSolidityOpen] = useState(false);
  const [solidityInspectId, setSolidityInspectId] = useState<ChallengeId>('c0_nft');

  // EVM Simulation State
  const [evmState, setEvmState] = useState<EVMState>(evm.getState());
  const [nearStation, setNearStation] = useState<StationHitInfo | null>(null);

  // Three.js References
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Subscribe to EVM updates
  useEffect(() => {
    const unsubscribe = evm.subscribe((nextState) => {
      setEvmState(nextState);
    });
    return unsubscribe;
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new SceneManager(canvasMountRef.current);
    sceneManagerRef.current = manager;

    // Callbacks from 3D world
    manager.onNearStationChange = (hit) => {
      setNearStation(hit);
    };

    manager.onStationClicked = (id) => {
      sound.playClick();
      setActiveChallengeModal(id);
    };

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync camera mode with SceneManager
  const handleCameraModeChange = (mode: CameraMode) => {
    setCameraMode(mode);
    sceneManagerRef.current?.setCameraMode(mode);
  };

  // Keyboard Shortcuts: E for interact, H for dock collapse, Esc for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      // Close open modals on Esc
      if (e.code === 'Escape') {
        if (activeChallengeModal || isTerminalOpen || isSolidityOpen) {
          sound.playClick();
          setActiveChallengeModal(null);
          setIsTerminalOpen(false);
          setIsSolidityOpen(false);
        }
        return;
      }

      // Interact with near station on Key E
      if (e.code === 'KeyE' && !activeChallengeModal && !isTerminalOpen && !isSolidityOpen) {
        if (nearStation) {
          sound.playClick();
          setActiveChallengeModal(nearStation.challengeId);
        }
      }

      // Toggle Dock on Key H
      if (e.code === 'KeyH') {
        setIsDockCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, nearStation, activeChallengeModal, isTerminalOpen, isSolidityOpen]);

  // Start Game transition
  const handleStartGame = () => {
    setGameState('playing');
    handleCameraModeChange('follow');
    sceneManagerRef.current?.teleportToCastle();
  };

  // Teleportation handlers
  const handleTeleportStation = (id: ChallengeId) => {
    sceneManagerRef.current?.teleportToStation(id);
  };

  const handleTeleportCastle = () => {
    sceneManagerRef.current?.teleportToCastle();
  };

  // Sound toggle
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Open Solidity viewer for specific challenge
  const handleOpenSolidityWithId = (id: ChallengeId) => {
    setSolidityInspectId(id);
    setIsSolidityOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Isolated 3D Canvas Mount (Zero Re-render tearing) */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2. Title Screen Shell */}
      {gameState === 'title' && (
        <TitleScreen onStart={handleStartGame} />
      )}

      {/* 3. Playing HUD & Controls */}
      {gameState === 'playing' && (
        <>
          <GameHUD
            evmState={evmState}
            nearStationId={nearStation?.challengeId || null}
            onOpenStation={(id) => setActiveChallengeModal(id)}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenSolidity={() => handleOpenSolidityWithId(nearStation?.challengeId || 'c0_nft')}
            onToggleMute={handleToggleMute}
            isMuted={isMuted}
          />

          <ControlDock
            isCollapsed={isDockCollapsed}
            onToggleCollapse={() => setIsDockCollapsed(!isDockCollapsed)}
            onTeleportStation={handleTeleportStation}
            onTeleportCastle={handleTeleportCastle}
            onOpenStationModal={(id) => setActiveChallengeModal(id)}
            onRequestFaucet={() => evm.requestFaucet()}
            cameraMode={cameraMode}
            onChangeCameraMode={handleCameraModeChange}
            evmState={evmState}
          />
        </>
      )}

      {/* 4. Challenge Workspaces Modals */}
      {activeChallengeModal === 'c0_nft' && (
        <NFTChallengeModal
          evmState={evmState}
          onMint={(name, color, eye, acc, chonk) => evm.mintNFT(name, color, eye, acc, chonk)}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c0_nft')}
        />
      )}

      {activeChallengeModal === 'c1_staking' && (
        <StakingChallengeModal
          evmState={evmState}
          onStake={(amt) => evm.stakeEth(amt)}
          onSimulateStakers={() => evm.simulateOtherStakers()}
          onExecute={() => evm.executeStaking()}
          onWithdrawRefund={() => evm.withdrawStakingRefund()}
          onReset={() => evm.resetStakingPool()}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c1_staking')}
        />
      )}

      {activeChallengeModal === 'c2_vendor' && (
        <VendorChallengeModal
          evmState={evmState}
          onBuy={(amt) => evm.buyTokensFromVendor(amt)}
          onApprove={(amt) => evm.approveVendor(amt)}
          onSell={(amt) => evm.sellTokensToVendor(amt)}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c2_vendor')}
        />
      )}

      {activeChallengeModal === 'c3_dice' && (
        <DiceChallengeModal
          evmState={evmState}
          onDeployAttacker={() => evm.deployAttackerContract()}
          onRollBlind={() => evm.rollDiceBlind()}
          onExecuteRiggedRoll={() => evm.executeRiggedRoll()}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c3_dice')}
        />
      )}

      {activeChallengeModal === 'c4_dex' && (
        <DEXChallengeModal
          evmState={evmState}
          onSwapEthForTokens={(amt) => evm.swapEthForTokens(amt)}
          onSwapTokensForEth={(amt) => evm.swapTokensForEth(amt)}
          onDepositLiquidity={(amt) => evm.depositLiquidity(amt)}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c4_dex')}
        />
      )}

      {activeChallengeModal === 'c5_multisig' && (
        <MultisigChallengeModal
          evmState={evmState}
          onPropose={(to, amt, reason) => evm.proposeMultisigTx(to, amt, reason)}
          onSign={(txId, signer) => evm.signMultisigTx(txId, signer)}
          onExecute={(txId) => evm.executeMultisigTx(txId)}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c5_multisig')}
        />
      )}

      {activeChallengeModal === 'c6_svg' && (
        <LoogieTankModal
          evmState={evmState}
          onClose={() => setActiveChallengeModal(null)}
          onOpenSolidity={() => handleOpenSolidityWithId('c6_svg')}
          onOpenNFTMinter={() => setActiveChallengeModal('c0_nft')}
        />
      )}

      {/* 5. Hardhat Console Terminal Modal */}
      {isTerminalOpen && (
        <HardhatConsoleModal
          evmState={evmState}
          onClose={() => setIsTerminalOpen(false)}
        />
      )}

      {/* 6. Solidity Source & Walkthrough Modal */}
      {isSolidityOpen && (
        <ContractCodeModal
          initialChallengeId={solidityInspectId}
          onClose={() => setIsSolidityOpen(false)}
        />
      )}
    </div>
  );
}
