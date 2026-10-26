import { ChallengeId, ChallengeMeta } from '../types/game';

export interface ContractAnnotatedLine {
  lineNum: number;
  code: string;
  isImportant?: boolean;
  annotation?: string;
}

export interface ChallengeDetail {
  meta: ChallengeMeta;
  contractName: string;
  sourceCode: string;
  annotatedLines: ContractAnnotatedLine[];
  explanation: string;
  hints: string[];
  checkpointGoal: string;
}

export const CHALLENGES: Record<ChallengeId, ChallengeDetail> = {
  c0_nft: {
    meta: {
      id: 'c0_nft',
      number: 0,
      title: '🎟 Simple NFT Example',
      subtitle: 'Mint customizable on-chain & IPFS NFTs with ERC721',
      badge: 'Challenge 0',
      icon: 'Ticket',
      difficulty: 'Beginner',
      description: 'Create and deploy a simple NFT to learn the basics of Scaffold-ETH. Mint dynamic procedural Loogie collectibles directly from a simulated Hardhat smart contract.',
      skills: ['ERC721', 'OpenZeppelin', 'Hardhat Deploy', 'TokenURI'],
      stationPosition: [-16, 0, -12],
      color: '#38bdf8',
    },
    contractName: 'YourItem.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract YourItem is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("YourItem", "YITM") {}

    function mintItem(address to, string memory uri) public returns (uint256) {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(to, id);
        _setTokenURI(id, uri);

        return id;
    }
}`,
    annotatedLines: [
      { lineNum: 4, code: 'import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";', annotation: 'Inherits ERC721 standard with dynamic token URI storage.' },
      { lineNum: 10, code: 'constructor() ERC721("YourItem", "YITM") {}', annotation: 'Initializes the NFT collection with Name and Symbol.' },
      { lineNum: 12, code: 'function mintItem(address to, string memory uri) public returns (uint256) {', isImportant: true, annotation: 'Callable by anyone to mint a new token to the recipient address.' },
      { lineNum: 16, code: '_safeMint(to, id);', isImportant: true, annotation: 'Checks if receiver is an ERC721Receiver contract to prevent locked tokens.' },
      { lineNum: 17, code: '_setTokenURI(id, uri);', annotation: 'Stores metadata JSON or on-chain data pointing to the NFT image & attributes.' },
    ],
    explanation: 'Scaffold-ETH lets you immediately test contracts locally. With YourItem.sol, every time you call mintItem(), the token ID increments and the ERC721 contract records ownership on-chain.',
    hints: [
      'Customize your Loogie traits (color, sunglasses, chonkiness).',
      'Click "Mint NFT" to trigger a simulated Ethereum transaction with 0 gas overhead.',
      'Check your collection in the Loogie Tank at Challenge 6!',
    ],
    checkpointGoal: 'Mint at least 1 custom Loogie NFT to complete Challenge 0.',
  },

  c1_staking: {
    meta: {
      id: 'c1_staking',
      number: 1,
      title: '🥩 Decentralized Staking',
      subtitle: 'Coordinate group funding with trustless game theory',
      badge: 'Challenge 1',
      icon: 'Coins',
      difficulty: 'Beginner',
      description: 'A superpower of Ethereum is allowing players to cooperate trustlessly. If the community hits the staking threshold before time expires, funds execute into an external contract. If not, everyone safely withdraws their deposit!',
      skills: ['payable', 'Block Timestamp', 'Coordination Games', 'External Calls'],
      stationPosition: [-18, 0, 14],
      color: '#f59e0b',
    },
    contractName: 'Staker.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./ExampleExternalContract.sol";

contract Staker {
    ExampleExternalContract public exampleExternalContract;
    mapping(address => uint256) public balances;
    uint256 public constant threshold = 5.0 ether;
    uint256 public deadline = block.timestamp + 120 seconds;
    bool public openForWithdraw = false;

    event Stake(address indexed sender, uint256 amount);

    function stake() public payable {
        require(block.timestamp < deadline, "Staking period has ended");
        balances[msg.sender] += msg.value;
        emit Stake(msg.sender, msg.value);
    }

    function execute() public {
        require(block.timestamp >= deadline, "Deadline not reached yet");
        if (address(this).balance >= threshold) {
            exampleExternalContract.complete{value: address(this).balance}();
        } else {
            openForWithdraw = true;
        }
    }

    function withdraw() public {
        require(openForWithdraw, "Withdraw not open");
        uint256 userBalance = balances[msg.sender];
        require(userBalance > 0, "No balance to withdraw");
        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: userBalance}("");
        require(sent, "Failed to send Ether");
    }
}`,
    annotatedLines: [
      { lineNum: 8, code: 'uint256 public constant threshold = 5.0 ether;', annotation: 'Coordination goal: minimum funding threshold required.' },
      { lineNum: 9, code: 'uint256 public deadline = block.timestamp + 120 seconds;', annotation: 'Countdown clock enforced by miners using block.timestamp.' },
      { lineNum: 14, code: 'function stake() public payable {', isImportant: true, annotation: 'Accepts ETH and records each individual depositor balance.' },
      { lineNum: 20, code: 'function execute() public {', isImportant: true, annotation: 'Checks if balance >= threshold; routes to external contract or opens refund.' },
      { lineNum: 33, code: 'balances[msg.sender] = 0;', isImportant: true, annotation: 'Checks-Effects-Interactions pattern protects against reentrancy.' },
    ],
    explanation: 'Demonstrates decentralized coordination: users do not need to trust a centralized escrow holder. If the team cooperates and reaches >= 5 ETH, the contract locks in victory. If they defect, the code guarantees full refunds.',
    hints: [
      'Deposit ETH to push the pool closer to the 5.0 ETH threshold.',
      'Simulated guild builders will stake with you.',
      'Execute the contract once deadline hits to see the coordination outcome.',
    ],
    checkpointGoal: 'Participate in the staking pool and trigger execution or refund.',
  },

  c2_vendor: {
    meta: {
      id: 'c2_vendor',
      number: 2,
      title: '🏵 Token Vendor',
      subtitle: 'ERC20 token vending machine & approve pattern',
      badge: 'Challenge 2',
      icon: 'Store',
      difficulty: 'Intermediate',
      description: 'Smart contracts are like 24/7 autonomous vending machines. Mint your own digital currency ($GLD) and master the ERC20 approve() and transferFrom() patterns.',
      skills: ['ERC20', 'approve pattern', 'transferFrom', 'Automated Liquidity'],
      stationPosition: [-2, 0, 20],
      color: '#10b981',
    },
    contractName: 'Vendor.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./YourToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vendor is Ownable {
    YourToken public yourToken;
    uint256 public constant tokensPerEth = 100;

    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(address seller, uint256 amountOfTokens, uint256 amountOfETH);

    constructor(address tokenAddress) {
        yourToken = YourToken(tokenAddress);
    }

    function buyTokens() public payable {
        uint256 amountToBuy = msg.value * tokensPerEth;
        require(yourToken.balanceOf(address(this)) >= amountToBuy, "Vendor out of stock");
        yourToken.transfer(msg.sender, amountToBuy);
        emit BuyTokens(msg.sender, msg.value, amountToBuy);
    }

    function sellTokens(uint256 tokenAmountToSell) public {
        require(tokenAmountToSell > 0, "Specify token amount");
        uint256 userBalance = yourToken.balanceOf(msg.sender);
        require(userBalance >= tokenAmountToSell, "Not enough tokens");

        uint256 ethAmountToTransfer = tokenAmountToSell / tokensPerEth;
        require(address(this).balance >= ethAmountToTransfer, "Vendor has not enough ETH");

        bool sent = yourToken.transferFrom(msg.sender, address(this), tokenAmountToSell);
        require(sent, "Failed to transfer tokens");

        (bool ethSent, ) = msg.sender.call{value: ethAmountToTransfer}("");
        require(ethSent, "Failed to send ETH");
        emit SellTokens(msg.sender, tokenAmountToSell, ethAmountToTransfer);
    }
}`,
    annotatedLines: [
      { lineNum: 8, code: 'uint256 public constant tokensPerEth = 100;', annotation: 'Fixed exchange rate: 1 ETH buys 100 GLD tokens.' },
      { lineNum: 17, code: 'function buyTokens() public payable {', isImportant: true, annotation: 'User sends native ETH; Vendor dispenses ERC20 tokens.' },
      { lineNum: 24, code: 'function sellTokens(uint256 tokenAmountToSell) public {', isImportant: true, annotation: 'User sells tokens back to get ETH refund.' },
      { lineNum: 32, code: 'bool sent = yourToken.transferFrom(msg.sender, address(this), tokenAmountToSell);', isImportant: true, annotation: 'Crucial: Requires user to have called yourToken.approve(vendor, amount) first!' },
    ],
    explanation: 'The ERC20 "approve" pattern is one of the most fundamental concepts in Web3. A contract cannot take tokens from your wallet unless you explicitly approve an allowance first.',
    hints: [
      'Buy 100 GLD tokens for 1 ETH from the machine.',
      'Before selling back, click "Approve Vendor" to grant allowance.',
      'Then click "Sell Tokens" to receive your ETH back.',
    ],
    checkpointGoal: 'Successfully complete both Buy and Sell flows with ERC20 approval.',
  },

  c3_dice: {
    meta: {
      id: 'c3_dice',
      number: 3,
      title: '🎲 Dice Game Exploit',
      subtitle: 'Break pseudo-randomness with a smart contract attack',
      badge: 'Challenge 3',
      icon: 'Dice5',
      difficulty: 'Intermediate',
      description: 'Randomness is notoriously tricky on a public deterministic blockchain! The vulnerable DiceGame rolls using the previous blockhash. Deploy the RiggedRoll contract to calculate the roll beforehand and only roll when guaranteed to WIN!',
      skills: ['blockhash', 'Determinism Exploits', 'MEV / Flashbots', 'Internal Contract Calls'],
      stationPosition: [16, 0, 14],
      color: '#ef4444',
    },
    contractName: 'RiggedRoll.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./DiceGame.sol";

contract RiggedRoll {
    DiceGame public diceGame;

    constructor(address payable diceGameAddress) {
        diceGame = DiceGame(diceGameAddress);
    }

    // Exploit: Recreate the pseudo-random calculation locally!
    function riggedRoll() public {
        require(address(this).balance >= 0.002 ether, "Not enough ETH to roll");

        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, address(diceGame), diceGame.nonce()));
        uint256 roll = uint256(hash) % 16;

        // Only call rollTheDice if roll <= 5 (Winner!)
        require(roll <= 5, "Predicted a loss! Aborting transaction.");

        diceGame.rollTheDice{value: 0.002 ether}();
    }

    receive() external payable {}
}`,
    annotatedLines: [
      { lineNum: 14, code: 'bytes32 prevHash = blockhash(block.number - 1);', isImportant: true, annotation: 'The flaw: blockhash of previous block is 100% known to contracts!' },
      { lineNum: 15, code: 'bytes32 hash = keccak256(abi.encodePacked(prevHash, address(diceGame), diceGame.nonce()));', annotation: 'Identical algorithm used by the vulnerable DiceGame.' },
      { lineNum: 19, code: 'require(roll <= 5, "Predicted a loss! Aborting transaction.");', isImportant: true, annotation: 'If it would lose, the transaction reverts, saving the 0.002 ETH!' },
      { lineNum: 21, code: 'diceGame.rollTheDice{value: 0.002 ether}();', isImportant: true, annotation: 'Only triggers the roll when 100% guaranteed to hit a jackpot payout.' },
    ],
    explanation: 'Because Ethereum is completely deterministic, no standard smart contract can generate true on-chain randomness without an oracle like Chainlink VRF. The RiggedRoll contract proves how predictable hashes can be exploited.',
    hints: [
      'Try rolling manually as a gambler - see how often you lose.',
      'Deploy the "RiggedRoll Attacker Contract".',
      'Execute the exploit: it skips losing blocks and rolls only on winning hashes for 100% profit!',
    ],
    checkpointGoal: 'Deploy RiggedRoll and execute at least 2 guaranteed jackpot rolls.',
  },

  c4_dex: {
    meta: {
      id: 'c4_dex',
      number: 4,
      title: '⚖️ Build a DEX (Uniswap AMM)',
      subtitle: 'Constant Product x * y = k Automated Market Maker',
      badge: 'Challenge 4',
      icon: 'ArrowLeftRight',
      difficulty: 'Advanced',
      description: 'Build a decentralized exchange that swaps ETH to tokens and tokens to ETH. Uses liquidity reserves with 0.3% LP fees and automated price determination based on ratio changes.',
      skills: ['Automated Market Makers', 'x * y = k', 'Liquidity Pools', 'Slippage Math'],
      stationPosition: [18, 0, -12],
      color: '#8b5cf6',
    },
    contractName: 'DEX.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    IERC20 public token;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    function price(uint256 xInput, uint256 xReserves, uint256 yReserves) public pure returns (uint256 yOutput) {
        uint256 xInputWithFee = xInput * 997; // 0.3% fee
        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = (xReserves * 1000) + xInputWithFee;
        return numerator / denominator;
    }

    function ethToToken() public payable returns (uint256 tokenOutput) {
        require(msg.value > 0, "Cannot swap 0 ETH");
        uint256 tokenReserve = token.balanceOf(address(this));
        tokenOutput = price(msg.value, address(this).balance - msg.value, tokenReserve);
        require(token.transfer(msg.sender, tokenOutput), "ethToToken transfer failed");
    }

    function deposit() public payable returns (uint256 tokensDeposited) {
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokenAmount = (msg.value * tokenReserve / ethReserve) + 1;
        require(token.transferFrom(msg.sender, address(this), tokenAmount));
        // Mint LP tokens proportional to share of pool...
    }
}`,
    annotatedLines: [
      { lineNum: 10, code: 'uint256 xInputWithFee = xInput * 997;', isImportant: true, annotation: 'Applies 99.7% multiplier (0.3% trading fee rewarded to liquidity providers).' },
      { lineNum: 13, code: 'return numerator / denominator;', isImportant: true, annotation: 'Calculates price slippage based on the constant product formula.' },
      { lineNum: 18, code: 'tokenOutput = price(msg.value, address(this).balance - msg.value, tokenReserve);', annotation: 'Determines tokens to pay out given current pool balances.' },
    ],
    explanation: 'Uniswap v1 popularized the constant product invariant (x * y = k). As one asset gets depleted from the pool, its relative price automatically scales up without any central orderbook.',
    hints: [
      'Swap 0.5 ETH for tokens and observe the resulting price impact/slippage.',
      'Deposit liquidity to earn trading fees from future traders.',
      'Observe how larger trades suffer greater slippage on shallow liquidity.',
    ],
    checkpointGoal: 'Perform at least one swap and deposit liquidity into the AMM pool.',
  },

  c5_multisig: {
    meta: {
      id: 'c5_multisig',
      number: 5,
      title: '👛 Multisig Wallet',
      subtitle: 'N-of-M multi-signature treasury security',
      badge: 'Challenge 5',
      icon: 'ShieldCheck',
      difficulty: 'Advanced',
      description: 'Secure DAO and protocol treasuries by requiring multiple signers to approve a transaction before execution. Propose payments, collect threshold signatures, and trigger safe transfers.',
      skills: ['ECDSA Signatures', 'Multi-sig Wallets', 'Governance', 'Access Control'],
      stationPosition: [0, 0, -22],
      color: '#ec4899',
    },
    contractName: 'MetaMultiSigWallet.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract MetaMultiSigWallet {
    event ExecuteTransaction(address indexed owner, address payable to, uint256 value, bytes data);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public signaturesRequired = 2; // 2-of-3 quorum
    uint256 public nonce;

    function executeTransaction(
        address payable to,
        uint256 value,
        bytes memory data,
        bytes[] memory signatures
    ) public returns (bool success) {
        require(signatures.length >= signaturesRequired, "Not enough signers");
        // Verify valid recovered signatures...
        (bool sent, ) = to.call{value: value}(data);
        require(sent, "Transaction execution failed");
        emit ExecuteTransaction(msg.sender, to, value, data);
        return true;
    }
}`,
    annotatedLines: [
      { lineNum: 8, code: 'uint256 public signaturesRequired = 2;', annotation: 'Quorum threshold: requires 2 approvals out of 3 authorized signers.' },
      { lineNum: 17, code: 'require(signatures.length >= signaturesRequired, "Not enough signers");', isImportant: true, annotation: 'Guards against unauthorized unilateral asset movement.' },
      { lineNum: 19, code: '(bool sent, ) = to.call{value: value}(data);', isImportant: true, annotation: 'Executes transaction payload with funds from vault.' },
    ],
    explanation: 'Multisig wallets like Safe (formerly Gnosis Safe) secure billions of dollars in Ethereum. By requiring consensus among multiple private keys, single-point-of-failure hacks are eliminated.',
    hints: [
      'Propose a treasury grant to a BuidlGuidl project.',
      'Sign with your own wallet key.',
      'Obtain approval from co-owner Austin or Vitalik to hit the 2-of-3 quorum.',
      'Execute transaction and confirm funds are released!',
    ],
    checkpointGoal: 'Propose and execute a multisig transaction with 2-of-3 approvals.',
  },

  c6_svg: {
    meta: {
      id: 'c6_svg',
      number: 6,
      title: '🧫 SVG NFT Building Cohort',
      subtitle: 'Fully on-chain SVG rendering with pure Solidity',
      badge: 'Challenge 6',
      icon: 'Palette',
      difficulty: 'Intermediate',
      description: 'Why rely on external IPFS servers when Solidity can render SVGs dynamically on-chain? Tinker with contracts that generate vector art directly from EVM bytecode and watch them swim in the 3D Loogie Tank!',
      skills: ['On-Chain SVG', 'Base64 Encoding', 'String Manipulation', 'Procedural Art'],
      stationPosition: [0, 0, 10],
      color: '#06b6d4',
    },
    contractName: 'Loogie.sol',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Base64.sol";

contract Loogie is ERC721 {
    function render(uint256 id) public view returns (string memory) {
        bytes memory svg = abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<circle cx="200" cy="200" r="120" fill="url(#grad)" />',
            '<ellipse cx="160" cy="170" rx="20" ry="30" fill="white" />',
            '<ellipse cx="240" cy="170" rx="20" ry="30" fill="white" />',
            '</svg>'
        );
        return string(svg);
    }
}`,
    annotatedLines: [
      { lineNum: 7, code: 'function render(uint256 id) public view returns (string memory) {', isImportant: true, annotation: 'Public render function allows other smart contracts to read and compose SVGs!' },
      { lineNum: 8, code: 'bytes memory svg = abi.encodePacked(...);', isImportant: true, annotation: 'EVM concatenates raw XML vector tags on-chain without any server.' },
    ],
    explanation: 'On-chain SVG NFTs are permanent and immutable. In Scaffold-ETH cohorts, builders create Loogies that can swim, change expressions, and even wear SVG accessories owned by other NFTs.',
    hints: [
      'Inspect the on-chain SVG code generated by the EVM.',
      'Watch your minted Loogies swimming together in the real-time 3D Loogie Tank.',
    ],
    checkpointGoal: 'Inspect the on-chain SVG renderer and view your Loogie cohort.',
  },
};
