import { EVMState, NFTItem, TransactionReceipt, ChallengeId, MultisigTx } from '../types/game';
import { sound } from '../audio/soundSynth';

// Helper to generate dynamic SVG for on-chain Loogies
export function generateLoogieSvg(
  color: string,
  eyeType: 'normal' | 'cool' | 'laser' | 'derp',
  accessory: 'hardhat' | 'party_hat' | 'headphones' | 'crown' | 'none',
  chonkiness: number
): string {
  const rx = 100 + chonkiness * 14;
  const ry = 90 + chonkiness * 10;

  // Eye renderers
  let eyesSvg = '';
  if (eyeType === 'laser') {
    eyesSvg = `
      <circle cx="160" cy="180" r="16" fill="#ef4444" />
      <circle cx="240" cy="180" r="16" fill="#ef4444" />
      <line x1="160" y1="180" x2="60" y2="280" stroke="#f87171" stroke-width="6" stroke-linecap="round" />
      <line x1="240" y1="180" x2="340" y2="280" stroke="#f87171" stroke-width="6" stroke-linecap="round" />
    `;
  } else if (eyeType === 'cool') {
    eyesSvg = `
      <!-- Sunglasses -->
      <path d="M 130 170 L 185 170 L 175 200 L 140 200 Z" fill="#0f172a" />
      <path d="M 215 170 L 270 170 L 260 200 L 225 200 Z" fill="#0f172a" />
      <line x1="185" y1="175" x2="215" y2="175" stroke="#0f172a" stroke-width="5" />
      <line x1="145" y1="176" x2="165" y2="194" stroke="#ffffff" stroke-width="2" stroke-opacity="0.8" />
      <line x1="230" y1="176" x2="250" y2="194" stroke="#ffffff" stroke-width="2" stroke-opacity="0.8" />
    `;
  } else if (eyeType === 'derp') {
    eyesSvg = `
      <circle cx="155" cy="180" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
      <circle cx="245" cy="180" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
      <circle cx="148" cy="174" r="8" fill="#1e293b" />
      <circle cx="254" cy="188" r="8" fill="#1e293b" />
    `;
  } else {
    // Normal friendly eyes
    eyesSvg = `
      <circle cx="160" cy="180" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
      <circle cx="240" cy="180" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
      <circle cx="165" cy="178" r="9" fill="#1e293b" />
      <circle cx="245" cy="178" r="9" fill="#1e293b" />
      <circle cx="168" cy="175" r="3" fill="#ffffff" />
      <circle cx="248" cy="175" r="3" fill="#ffffff" />
    `;
  }

  // Accessories
  let accSvg = '';
  if (accessory === 'hardhat') {
    accSvg = `
      <path d="M 120 120 Q 200 40 280 120 L 290 135 L 110 135 Z" fill="#f59e0b" stroke="#78350f" stroke-width="5" />
      <rect x="185" y="65" width="30" height="25" rx="3" fill="#ffffff" stroke="#78350f" stroke-width="3" />
      <text x="200" y="83" font-size="14" font-weight="bold" fill="#78350f" text-anchor="middle" font-family="sans-serif">🏗</text>
    `;
  } else if (accessory === 'party_hat') {
    accSvg = `
      <polygon points="200,40 160,120 240,120" fill="#ec4899" stroke="#be185d" stroke-width="4" />
      <circle cx="200" cy="38" r="10" fill="#fbbf24" />
      <circle cx="190" cy="80" r="5" fill="#38bdf8" />
      <circle cx="210" cy="100" r="5" fill="#a855f7" />
    `;
  } else if (accessory === 'headphones') {
    accSvg = `
      <path d="M 105 200 A 95 95 0 0 1 295 200" fill="none" stroke="#1e293b" stroke-width="12" stroke-linecap="round" />
      <rect x="92" y="175" width="24" height="48" rx="8" fill="#3b82f6" stroke="#1e293b" stroke-width="4" />
      <rect x="284" y="175" width="24" height="48" rx="8" fill="#3b82f6" stroke="#1e293b" stroke-width="4" />
    `;
  } else if (accessory === 'crown') {
    accSvg = `
      <polygon points="140,125 155,75 180,105 200,65 220,105 245,75 260,125" fill="#fbbf24" stroke="#b45309" stroke-width="4" />
      <circle cx="155" cy="73" r="5" fill="#ef4444" />
      <circle cx="200" cy="63" r="6" fill="#3b82f6" />
      <circle cx="245" cy="73" r="5" fill="#10b981" />
    `;
  }

  return `
<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_${color.replace('#', '')}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="60%" stop-color="${color}" />
      <stop offset="100%" stop-color="${adjustBrightness(color, -40)}" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Ground contact shadow -->
  <ellipse cx="200" cy="350" rx="110" ry="22" fill="#000000" fill-opacity="0.15" />
  
  <!-- Main Loogie Body -->
  <g filter="url(#shadow)">
    <ellipse cx="200" cy="220" rx="${rx}" ry="${ry}" fill="url(#grad_${color.replace('#', '')})" stroke="#0f172a" stroke-width="6" />
  </g>
  
  <!-- Antennae / cute blips -->
  <path d="M 175 140 Q 160 95 145 105" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
  <circle cx="145" cy="105" r="10" fill="${color}" stroke="#0f172a" stroke-width="4" />
  
  <path d="M 225 140 Q 240 95 255 105" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
  <circle cx="255" cy="105" r="10" fill="${color}" stroke="#0f172a" stroke-width="4" />

  <!-- Eyes -->
  ${eyesSvg}

  <!-- Mouth -->
  <path d="M 180 235 Q 200 255 220 235" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
  <ellipse cx="145" cy="225" rx="12" ry="8" fill="#f43f5e" fill-opacity="0.4" />
  <ellipse cx="255" cy="225" rx="12" ry="8" fill="#f43f5e" fill-opacity="0.4" />

  <!-- Accessory -->
  ${accSvg}
</svg>
`.trim();
}

function adjustBrightness(col: string, percent: number) {
  const num = parseInt(col.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
}

export function createInitialEVMState(): EVMState {
  const initialNfts: NFTItem[] = [
    {
      id: 1,
      name: 'Genesis Loogie #1',
      owner: '0x34aA3F359A9D6142327c5421c9c41E66A122E1A8',
      color: '#06b6d4',
      eyeType: 'cool',
      accessory: 'hardhat',
      chonkiness: 3,
      svgContent: generateLoogieSvg('#06b6d4', 'cool', 'hardhat', 3),
      mintedAtBlock: 104,
    },
    {
      id: 2,
      name: 'Cyber Loogie #2',
      owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      color: '#ec4899',
      eyeType: 'laser',
      accessory: 'headphones',
      chonkiness: 4,
      svgContent: generateLoogieSvg('#ec4899', 'laser', 'headphones', 4),
      mintedAtBlock: 110,
    },
  ];

  return {
    blockNumber: 120,
    gasPriceGwei: 15,
    userAddress: '0xa5D1b8973E8A9872eFfD72A317aB91f5e2E3b401',
    userBalanceEth: 10.0,
    buidlReputation: 42,
    completedChallenges: {
      c0_nft: false,
      c1_staking: false,
      c2_vendor: false,
      c3_dice: false,
      c4_dex: false,
      c5_multisig: false,
      c6_svg: false,
    },
    nfts: initialNfts,
    // Staking
    stakingPoolBalance: 2.5,
    stakingThreshold: 5.0,
    stakingDeadlineSeconds: 120,
    stakingEnded: false,
    userStakedEth: 0,
    isStakingCompleted: false,
    // Vendor
    vendorEthBalance: 15.0,
    vendorTokenBalance: 2000,
    userTokenBalance: 0,
    userTokenAllowance: 0,
    tokenPricePerEth: 100,
    // Dice
    dicePrizePoolEth: 0.1,
    diceRollCostEth: 0.002,
    lastDiceRoll: null,
    lastDiceWin: null,
    attackerContractDeployed: false,
    attackerWinsCount: 0,
    normalRollsCount: 0,
    // DEX AMM
    dexEthReserve: 10.0,
    dexTokenReserve: 1000.0,
    userLpTokens: 0,
    totalLpSupply: 100.0,
    // Multisig
    multisigOwners: [
      '0xa5D1b8973E8A9872eFfD72A317aB91f5e2E3b401', // Player
      '0x34aA3F359A9D6142327c5421c9c41E66A122E1A8', // Austin Griffith
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik Buterin
    ],
    multisigRequiredSignatures: 2,
    multisigVaultBalanceEth: 50.0,
    multisigTxs: [
      {
        id: 1,
        to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        amount: 5.0,
        reason: 'Scaffold-ETH 2 Developer Grant',
        executed: false,
        signatures: ['0x34aA3F359A9D6142327c5421c9c41E66A122E1A8'],
      },
    ],
    transactions: [
      {
        hash: '0x8f2d...c301',
        blockNumber: 119,
        from: '0x34aA3F359A9D6142327c5421c9c41E66A122E1A8',
        to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        value: '2.5 ETH',
        gasUsed: 42100,
        method: 'stake()',
        status: 'success',
        logs: ['Staked 2.5 ETH into Staker.sol'],
        timestamp: Date.now() - 35000,
      },
    ],
    terminalLogs: [
      '[Hardhat Node v2.22.0] Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/',
      'Network: localhost (ChainId: 31337)',
      'Deployed YourItem (0x5FbDB2315678afecb367f032d93F642f64180aa3)',
      'Deployed Staker (0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)',
      'Deployed Vendor (0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0)',
      'Deployed DiceGame (0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9)',
      'Ready for Scaffold-ETH challenge interactions.',
    ],
  };
}

export class BlockchainSimulator {
  private state: EVMState;
  private listeners: Array<(state: EVMState) => void> = [];

  constructor() {
    this.state = createInitialEVMState();
  }

  public getState(): EVMState {
    return this.state;
  }

  public subscribe(cb: (state: EVMState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  private addReceipt(method: string, to: string, value: string, gasUsed: number, logs: string[]): TransactionReceipt {
    this.state.blockNumber += 1;
    const randomHex = Math.random().toString(16).substring(2, 8);
    const hash = `0x${randomHex}${Date.now().toString(16).slice(-6)}...${Math.random().toString(16).slice(2, 6)}`;
    const receipt: TransactionReceipt = {
      hash,
      blockNumber: this.state.blockNumber,
      from: this.state.userAddress,
      to,
      value,
      gasUsed,
      method,
      status: 'success',
      logs,
      timestamp: Date.now(),
    };
    this.state.transactions = [receipt, ...this.state.transactions.slice(0, 40)];
    this.state.terminalLogs = [
      `[Block #${this.state.blockNumber}] tx ${hash.slice(0, 10)} (${method}) gas:${gasUsed}`,
      ...logs.map(l => `  ➜ ${l}`),
      ...this.state.terminalLogs.slice(0, 60),
    ];
    return receipt;
  }

  // FAUCET: +10 ETH to user wallet
  public requestFaucet() {
    this.state.userBalanceEth += 10.0;
    this.addReceipt('faucet()', this.state.userAddress, '10.0 ETH', 21000, [
      `Dispensed 10.0 ETH to ${this.state.userAddress}`,
    ]);
    sound.playTxSuccess();
    this.notify();
  }

  // MARK CHALLENGE COMPLETED
  public markCompleted(id: ChallengeId) {
    if (!this.state.completedChallenges[id]) {
      this.state.completedChallenges[id] = true;
      this.state.buidlReputation += 100;
      this.state.terminalLogs = [
        `🏆 [ACHIEVEMENT] Challenge ${id} completed! Earned +100 BUIDL Reputation.`,
        ...this.state.terminalLogs,
      ];
      sound.playTxSuccess();
      this.notify();
    }
  }

  // CHALLENGE 0: MINT NFT
  public mintNFT(name: string, color: string, eyeType: NFTItem['eyeType'], accessory: NFTItem['accessory'], chonkiness: number): NFTItem {
    const nextId = this.state.nfts.length + 1;
    const svg = generateLoogieSvg(color, eyeType, accessory, chonkiness);
    const newNft: NFTItem = {
      id: nextId,
      name: name || `Loogie #${nextId}`,
      owner: this.state.userAddress,
      color,
      eyeType,
      accessory,
      chonkiness,
      svgContent: svg,
      mintedAtBlock: this.state.blockNumber + 1,
    };

    this.state.nfts = [newNft, ...this.state.nfts];
    this.addReceipt('mintItem(address,string)', '0x5FbDB2315678afecb367f032d93F642f64180aa3', '0 ETH', 78400, [
      `Minted TokenId #${nextId} to ${this.state.userAddress.slice(0, 8)}...`,
      `TokenURI: data:image/svg+xml;base64,...`,
    ]);

    this.markCompleted('c0_nft');
    sound.playMintSparkle();
    this.notify();
    return newNft;
  }

  // CHALLENGE 1: STAKING
  public stakeEth(amount: number) {
    if (this.state.stakingEnded) return;
    if (this.state.userBalanceEth < amount) {
      sound.playRevert();
      return;
    }
    this.state.userBalanceEth -= amount;
    this.state.userStakedEth += amount;
    this.state.stakingPoolBalance += amount;

    this.addReceipt('stake()', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', `${amount.toFixed(2)} ETH`, 45200, [
      `User staked ${amount.toFixed(2)} ETH. Total Pool: ${this.state.stakingPoolBalance.toFixed(2)} / ${this.state.stakingThreshold} ETH`,
    ]);

    sound.playStakingPulse();
    this.notify();
  }

  public simulateOtherStakers() {
    if (this.state.stakingEnded) return;
    const increment = 0.5 + Math.random() * 0.5;
    this.state.stakingPoolBalance += increment;
    this.addReceipt('stake()', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', `${increment.toFixed(2)} ETH`, 42100, [
      `Simulated builder deposited ${increment.toFixed(2)} ETH into pool!`,
    ]);
    this.notify();
  }

  public executeStaking() {
    this.state.stakingEnded = true;
    if (this.state.stakingPoolBalance >= this.state.stakingThreshold) {
      this.state.isStakingCompleted = true;
      this.addReceipt('execute()', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', '0 ETH', 89000, [
        `THRESHOLD REACHED (${this.state.stakingPoolBalance.toFixed(2)} >= ${this.state.stakingThreshold} ETH)!`,
        `Transferred funds to ExampleExternalContract.complete(). Coordination Success!`,
      ]);
      this.markCompleted('c1_staking');
      sound.playTxSuccess();
    } else {
      this.state.isStakingCompleted = false;
      this.addReceipt('execute()', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', '0 ETH', 54000, [
        `Threshold NOT met before deadline. Open for withdraw refunds!`,
      ]);
      sound.playRevert();
    }
    this.notify();
  }

  public withdrawStakingRefund() {
    if (!this.state.stakingEnded || this.state.isStakingCompleted) return;
    if (this.state.userStakedEth <= 0) return;

    const refund = this.state.userStakedEth;
    this.state.userBalanceEth += refund;
    this.state.stakingPoolBalance -= refund;
    this.state.userStakedEth = 0;

    this.addReceipt('withdraw()', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', '0 ETH', 32000, [
      `Refunded ${refund.toFixed(2)} ETH back to ${this.state.userAddress}`,
    ]);
    this.markCompleted('c1_staking');
    sound.playTxSuccess();
    this.notify();
  }

  public resetStakingPool() {
    this.state.stakingPoolBalance = 1.0;
    this.state.userStakedEth = 0;
    this.state.stakingEnded = false;
    this.state.isStakingCompleted = false;
    this.state.stakingDeadlineSeconds = 120;
    this.notify();
  }

  // CHALLENGE 2: TOKEN VENDOR
  public buyTokensFromVendor(ethAmount: number) {
    if (this.state.userBalanceEth < ethAmount) {
      sound.playRevert();
      return;
    }
    const tokenAmount = ethAmount * this.state.tokenPricePerEth;
    if (this.state.vendorTokenBalance < tokenAmount) {
      sound.playRevert();
      return;
    }

    this.state.userBalanceEth -= ethAmount;
    this.state.vendorEthBalance += ethAmount;
    this.state.vendorTokenBalance -= tokenAmount;
    this.state.userTokenBalance += tokenAmount;

    this.addReceipt('buyTokens()', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', `${ethAmount.toFixed(2)} ETH`, 68000, [
      `Purchased ${tokenAmount} GLD tokens for ${ethAmount} ETH`,
    ]);
    sound.playCoin();
    this.notify();
  }

  public approveVendor(tokenAmount: number) {
    this.state.userTokenAllowance = tokenAmount;
    this.addReceipt('approve(address,uint256)', '0xYourTokenAddress', '0 ETH', 45000, [
      `Approved Vendor contract for ${tokenAmount} GLD tokens`,
    ]);
    sound.playTxSuccess();
    this.notify();
  }

  public sellTokensToVendor(tokenAmount: number) {
    if (this.state.userTokenBalance < tokenAmount) {
      sound.playRevert();
      return;
    }
    if (this.state.userTokenAllowance < tokenAmount) {
      this.state.terminalLogs = [
        '❌ [REVERT] ERC20: insufficient allowance! You must approve Vendor first.',
        ...this.state.terminalLogs,
      ];
      sound.playRevert();
      this.notify();
      return;
    }

    const ethRefund = tokenAmount / this.state.tokenPricePerEth;
    if (this.state.vendorEthBalance < ethRefund) {
      sound.playRevert();
      return;
    }

    this.state.userTokenBalance -= tokenAmount;
    this.state.userTokenAllowance -= tokenAmount;
    this.state.vendorTokenBalance += tokenAmount;
    this.state.vendorEthBalance -= ethRefund;
    this.state.userBalanceEth += ethRefund;

    this.addReceipt('sellTokens(uint256)', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', '0 ETH', 72000, [
      `Sold ${tokenAmount} GLD for ${ethRefund.toFixed(3)} ETH`,
      `Vendor transferred tokens via transferFrom()`,
    ]);
    this.markCompleted('c2_vendor');
    sound.playCoin();
    this.notify();
  }

  // CHALLENGE 3: DICE GAME EXPLOIT
  public deployAttackerContract() {
    this.state.attackerContractDeployed = true;
    this.addReceipt('deploy(RiggedRoll)', '0xNewContractAddress', '0.01 ETH', 145000, [
      `Deployed RiggedRoll attack contract. Pre-funded with 0.01 ETH.`,
      `Ready to exploit pseudo-random blockhash!`,
    ]);
    sound.playTxSuccess();
    this.notify();
  }

  public rollDiceBlind(): { roll: number; isWin: boolean } {
    if (this.state.userBalanceEth < this.state.diceRollCostEth) {
      sound.playRevert();
      return { roll: 0, isWin: false };
    }

    this.state.userBalanceEth -= this.state.diceRollCostEth;
    this.state.dicePrizePoolEth += this.state.diceRollCostEth;

    // Pseudo-random hash simulation: (blockNumber + nonce) % 16
    const roll = Math.floor(Math.random() * 16);
    const isWin = roll <= 5; // Win condition in Scaffold-ETH challenge 3

    this.state.lastDiceRoll = roll;
    this.state.lastDiceWin = isWin;
    this.state.normalRollsCount += 1;

    if (isWin) {
      const payout = 0.005;
      this.state.userBalanceEth += payout;
      this.state.dicePrizePoolEth = Math.max(0.01, this.state.dicePrizePoolEth - payout);
      this.addReceipt('rollTheDice()', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', `${this.state.diceRollCostEth} ETH`, 42000, [
        `🎲 Rolled ${roll} <= 5! WINNER! Won ${payout} ETH!`,
      ]);
    } else {
      this.addReceipt('rollTheDice()', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', `${this.state.diceRollCostEth} ETH`, 42000, [
        `🎲 Rolled ${roll} > 5. Lost 0.002 ETH to the prize pool.`,
      ]);
    }

    sound.playDiceRoll(isWin);
    this.notify();
    return { roll, isWin };
  }

  public executeRiggedRoll(): { roll: number; isWin: boolean; skipped: boolean } {
    if (!this.state.attackerContractDeployed) {
      sound.playRevert();
      return { roll: 0, isWin: false, skipped: true };
    }

    // The attacker computes the roll before sending the transaction
    const predictedRoll = Math.floor(Math.random() * 16);
    if (predictedRoll > 5) {
      // Reverts locally, saving gas and value!
      this.state.terminalLogs = [
        `🛡️ [RiggedRoll.sol] Pre-computed roll is ${predictedRoll} > 5. Aborted roll. 0 ETH lost!`,
        ...this.state.terminalLogs,
      ];
      this.notify();
      return { roll: predictedRoll, isWin: false, skipped: true };
    }

    // Winning block!
    const payout = 0.005;
    this.state.userBalanceEth += payout - this.state.diceRollCostEth;
    this.state.dicePrizePoolEth = Math.max(0.01, this.state.dicePrizePoolEth - payout);
    this.state.lastDiceRoll = predictedRoll;
    this.state.lastDiceWin = true;
    this.state.attackerWinsCount += 1;

    this.addReceipt('riggedRoll()', '0xAttackerContract', '0.002 ETH', 65000, [
      `🎯 Exploit triggered! Predicted winning roll ${predictedRoll} <= 5!`,
      `Internal call: diceGame.rollTheDice{value: 0.002 ether}()`,
      `Jackpot extracted: +${payout} ETH!`,
    ]);

    this.markCompleted('c3_dice');
    sound.playDiceRoll(true);
    this.notify();
    return { roll: predictedRoll, isWin: true, skipped: false };
  }

  // CHALLENGE 4: DEX AMM (x * y = k)
  public swapEthForTokens(ethIn: number) {
    if (this.state.userBalanceEth < ethIn || ethIn <= 0) {
      sound.playRevert();
      return;
    }
    // Formula with 0.3% fee: dy = (y * 997 * dx) / (x * 1000 + 997 * dx)
    const x = this.state.dexEthReserve;
    const y = this.state.dexTokenReserve;
    const dxWithFee = ethIn * 997;
    const tokenOut = (y * dxWithFee) / (x * 1000 + dxWithFee);

    this.state.userBalanceEth -= ethIn;
    this.state.dexEthReserve += ethIn;
    this.state.dexTokenReserve -= tokenOut;
    this.state.userTokenBalance += tokenOut;

    this.addReceipt('ethToToken()', '0xDEXAddress', `${ethIn.toFixed(2)} ETH`, 85000, [
      `Swapped ${ethIn.toFixed(2)} ETH for ${tokenOut.toFixed(2)} Tokens`,
      `AMM Reserves: ${this.state.dexEthReserve.toFixed(2)} ETH | ${this.state.dexTokenReserve.toFixed(2)} Tokens`,
    ]);

    this.markCompleted('c4_dex');
    sound.playCoin();
    this.notify();
  }

  public swapTokensForEth(tokensIn: number) {
    if (this.state.userTokenBalance < tokensIn || tokensIn <= 0) {
      sound.playRevert();
      return;
    }
    const x = this.state.dexTokenReserve;
    const y = this.state.dexEthReserve;
    const dxWithFee = tokensIn * 997;
    const ethOut = (y * dxWithFee) / (x * 1000 + dxWithFee);

    this.state.userTokenBalance -= tokensIn;
    this.state.dexTokenReserve += tokensIn;
    this.state.dexEthReserve -= ethOut;
    this.state.userBalanceEth += ethOut;

    this.addReceipt('tokenToEth()', '0xDEXAddress', '0 ETH', 82000, [
      `Swapped ${tokensIn.toFixed(2)} Tokens for ${ethOut.toFixed(3)} ETH`,
      `AMM Reserves: ${this.state.dexEthReserve.toFixed(2)} ETH | ${this.state.dexTokenReserve.toFixed(2)} Tokens`,
    ]);

    this.markCompleted('c4_dex');
    sound.playCoin();
    this.notify();
  }

  public depositLiquidity(ethAmount: number) {
    if (this.state.userBalanceEth < ethAmount || ethAmount <= 0) {
      sound.playRevert();
      return;
    }
    const tokenAmount = (ethAmount * this.state.dexTokenReserve) / this.state.dexEthReserve;
    if (this.state.userTokenBalance < tokenAmount) {
      sound.playRevert();
      return;
    }

    const mintedLp = (ethAmount * this.state.totalLpSupply) / this.state.dexEthReserve;

    this.state.userBalanceEth -= ethAmount;
    this.state.userTokenBalance -= tokenAmount;
    this.state.dexEthReserve += ethAmount;
    this.state.dexTokenReserve += tokenAmount;
    this.state.userLpTokens += mintedLp;
    this.state.totalLpSupply += mintedLp;

    this.addReceipt('deposit()', '0xDEXAddress', `${ethAmount.toFixed(2)} ETH`, 98000, [
      `Supplied ${ethAmount.toFixed(2)} ETH + ${tokenAmount.toFixed(2)} Tokens`,
      `Minted ${mintedLp.toFixed(2)} LP Tokens to provider`,
    ]);

    this.markCompleted('c4_dex');
    sound.playTxSuccess();
    this.notify();
  }

  // CHALLENGE 5: MULTISIG
  public proposeMultisigTx(to: string, amount: number, reason: string) {
    const newTx: MultisigTx = {
      id: this.state.multisigTxs.length + 1,
      to,
      amount,
      reason,
      executed: false,
      signatures: [this.state.userAddress], // Creator auto-signs
    };

    this.state.multisigTxs = [...this.state.multisigTxs, newTx];
    this.addReceipt('proposeTransaction()', '0xMultisigVault', '0 ETH', 60000, [
      `Proposal #${newTx.id} created: Send ${amount} ETH to ${to.slice(0, 8)}... (${reason})`,
      `Signed by Player (1/${this.state.multisigRequiredSignatures})`,
    ]);

    sound.playTxSuccess();
    this.notify();
  }

  public signMultisigTx(txId: number, signerAddress: string) {
    const tx = this.state.multisigTxs.find(t => t.id === txId);
    if (!tx || tx.executed || tx.signatures.includes(signerAddress)) return;

    tx.signatures.push(signerAddress);
    this.addReceipt('signTransaction()', '0xMultisigVault', '0 ETH', 35000, [
      `Signature added by ${signerAddress.slice(0, 8)}... for Tx #${txId}`,
      `Total signatures: ${tx.signatures.length}/${this.state.multisigRequiredSignatures}`,
    ]);

    sound.playTxSuccess();
    this.notify();
  }

  public executeMultisigTx(txId: number) {
    const tx = this.state.multisigTxs.find(t => t.id === txId);
    if (!tx || tx.executed) return;
    if (tx.signatures.length < this.state.multisigRequiredSignatures) {
      sound.playRevert();
      return;
    }

    if (this.state.multisigVaultBalanceEth < tx.amount) {
      sound.playRevert();
      return;
    }

    tx.executed = true;
    this.state.multisigVaultBalanceEth -= tx.amount;
    if (tx.to === this.state.userAddress) {
      this.state.userBalanceEth += tx.amount;
    }

    this.addReceipt('executeTransaction()', '0xMultisigVault', `${tx.amount} ETH`, 110000, [
      `Quorum confirmed (${tx.signatures.length}/${this.state.multisigRequiredSignatures}). Transferred ${tx.amount} ETH to ${tx.to}!`,
    ]);

    this.markCompleted('c5_multisig');
    sound.playTxSuccess();
    this.notify();
  }
}

export const evm = new BlockchainSimulator();
