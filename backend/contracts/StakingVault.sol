// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

error StakingVault__ZeroAmount();
error StakingVault__InsufficientBalance();
error StakingVault__CannotTakeStakingToken();
error StakingVault__ZeroAddress();

contract StakingVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    /* =================== STATE VARIABLES =================== */

    IERC20 public immutable i_stakingToken;
    IERC20 public immutable i_rewardToken;

    // Rewards for Reward Pool (static)
    uint256 public s_rewardRate;

    // Last time rewards logic were updated
    uint256 public s_lastUpdateTime;

    // Reward per Token stored (dynamically updated)
    uint256 public s_rewardPerTokenStored;

    // Check user balance
    mapping(address => uint256) public s_balances;
    // CheckPoint of user's reward per token
    mapping(address => uint256) public s_userRewardPerTokenPaid;
    // Rewards that have been collected but not yet claimed
    mapping(address => uint256) public s_rewards;

    uint256 private s_totalSupply;

    /* =================== EVENTS =================== */
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event Recovered(address token, uint256 amount);

    /* =================== CONSTRUCTOR =================== */
    constructor(
        address _stakingToken,
        address _rewardToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        // Safety Check: Prevent deploying to empty addresses
        if (_stakingToken == address(0) || _rewardToken == address(0)) {
            revert StakingVault__ZeroAddress();
        }
        i_stakingToken = IERC20(_stakingToken);
        i_rewardToken = IERC20(_rewardToken);
    }

    /* =================== MODIFIERS =================== */
    /**
     * @dev Core logic: Updating reward state before doing any action
     * It is crucial to maintain mathematical accuracy.
     */
    modifier updateReward(address account) {
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            s_rewards[account] = earned(account);
            s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored;
        }
        _;
    }

    /* =================== VIEWS (MATHEMATICS) =================== */
    function totalSupply() external view returns (uint256) {
        return s_totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return s_balances[account];
    }

    /**
     * @dev Calculate the accumulated reward per 1 token from the beginning until now
     * Formula: Stored + (Time * Rate * 1e18 / TotalSupply)
     */
    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }
        return
            s_rewardPerTokenStored +
            ((block.timestamp - s_lastUpdateTime) * s_rewardRate * 1e18) /
            s_totalSupply;
    }

    /**
     * @dev Calculate how many rewards the user can claim at this time
     *
     */
    function earned(address account) public view returns (uint256) {
        return
            ((s_balances[account] *
                (rewardPerToken() - s_userRewardPerTokenPaid[account])) /
                1e18) + s_rewards[account];
    }

    /* =================== USER FUNCTIONS =================== */
    /**
     * @notice Deposit Token to start get reward
     * @param amount: the amount of token you want to lock
     */
    function stake(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) {
            revert StakingVault__ZeroAmount();
        }

        // GAS OPTIMIZATION: Eliminate double verification by solidity
        // wrap with unchecked to save gas - Update State
        unchecked {
            s_totalSupply += amount;
            s_balances[msg.sender] += amount;
        }

        // Transfer Token
        i_stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Withdraw capital + claim rewards at once.
     * @param amount The amount of capital you want to withdraw.
     */
    function withdraw(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) {
            revert StakingVault__ZeroAmount();
        }

        if (amount > s_balances[msg.sender]) {
            revert StakingVault__InsufficientBalance();
        }

        unchecked {
            s_totalSupply -= amount;
            s_balances[msg.sender] -= amount;
        }

        i_stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);

        // If user want to claim Reward at the sam time with withdraw capital
        _claimReward();
    }

    /**
     * @notice EMERGENCY ONLY: Withdraw capital WITHOUT rewards
     * Can only be called when contract is PAUSED
     * Bypasses updateReward modifier to prevent math errors
     */
    function emergencyWithdraw() external nonReentrant whenPaused {
        uint256 amount = s_balances[msg.sender];
        if (amount == 0) {
            revert StakingVault__ZeroAmount();
        }

        // 1. Reset State User (Effect)
        s_balances[msg.sender] = 0;
        s_totalSupply -= amount;

        // Note: we do NOT reset s_rewards because the system is paused/broken.
        i_stakingToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Only take reward without withdrawing capital.
     */
    function claimReward()
        external
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {
        _claimReward();
    }
    // Internal function for claim logic to re-usable
    function _claimReward() internal {
        uint256 reward = s_rewards[msg.sender];

        if (reward > 0) {
            s_rewards[msg.sender] = 0;
            i_rewardToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /* =================== ADMIN FUNCTIONS =================== */
    /**
     * @dev set how many reward tokens are distributed per second to the pool
     * Be Careful: Make sure the contract has sufficient reward token balance
     */
    function setRewardRate(
        uint256 _rewardRate
    ) external onlyOwner updateReward(address(0)) {
        s_rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    // Circuit Breaker
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev A rescue feature if there are lost tokens (e.g., the user sends the wrong USDC).
     * CANNOT take user Staking Tokens (secured funds).
     */
    function recoverERC20(
        address tokenAddress,
        uint256 tokenAmount
    ) external onlyOwner {
        // Owner/Admin cannot take staking token from the contract
        if (tokenAddress == address(i_stakingToken)) {
            revert StakingVault__CannotTakeStakingToken();
        }

        // Execution: Send stray token to Owner/Admin
        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }
}