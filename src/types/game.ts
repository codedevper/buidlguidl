export type ChallengeId = 
  | 'c0_nft'
  | 'c1_staking'
  | 'c2_vendor'
  | 'c3_dice'
  | 'c4_dex'
  | 'c5_multisig'
  | 'c6_svg';

export interface ChallengeMeta {
  id: ChallengeId;
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  skills: string[];
  stationPosition: [number, number, number]; // x, y, z in 3D world
  color: string;
}

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  method: string;
  status: 'success' | 'reverted';
  logs: string[];
  timestamp: number;
}

export interface NFTItem {
  id: number;
  name: string;
  owner: string;
  color: string;
  eyeType: 'normal' | 'cool' | 'laser' | 'derp';
  accessory: 'hardhat' | 'party_hat' | 'headphones' | 'crown' | 'none';
  chonkiness: number; // 1 to 5
  svgContent: string;
  mintedAtBlock: number;
}

export interface MultisigTx {
  id: number;
  to: string;
  amount: number;
  reason: string;
  executed: boolean;
  signatures: string[];
}

export interface EVMState {
  blockNumber: number;
  gasPriceGwei: number;
  userAddress: string;
  userBalanceEth: number;
  buidlReputation: number;
  completedChallenges: Record<ChallengeId, boolean>;
  
  // Challenge 0: NFT
  nfts: NFTItem[];
  
  // Challenge 1: Staking
  stakingPoolBalance: number;
  stakingThreshold: number;
  stakingDeadlineSeconds: number;
  stakingEnded: boolean;
  userStakedEth: number;
  isStakingCompleted: boolean;
  
  // Challenge 2: Vendor
  vendorEthBalance: number;
  vendorTokenBalance: number;
  userTokenBalance: number;
  userTokenAllowance: number;
  tokenPricePerEth: number; // 100 GLD per 1 ETH
  
  // Challenge 3: Dice
  dicePrizePoolEth: number;
  diceRollCostEth: number;
  lastDiceRoll: number | null;
  lastDiceWin: boolean | null;
  attackerContractDeployed: boolean;
  attackerWinsCount: number;
  normalRollsCount: number;
  
  // Challenge 4: DEX AMM
  dexEthReserve: number;
  dexTokenReserve: number;
  userLpTokens: number;
  totalLpSupply: number;
  
  // Challenge 5: Multisig
  multisigOwners: string[];
  multisigRequiredSignatures: number;
  multisigVaultBalanceEth: number;
  multisigTxs: MultisigTx[];
  
  // Global Mempool & Console logs
  transactions: TransactionReceipt[];
  terminalLogs: string[];
}

export type CameraMode = 'follow' | 'orbit' | 'flyover';
