// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Snapshot.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/ISEldenTokenUsage.sol";
import "./interfaces/ISEldenToken.sol";


/*
 * This contract is a sELDEN Usage (plugin) made to receive perks and benefits from Elden's launchpad
 */
contract Launchpad is Ownable, ReentrancyGuard, ERC20("Elden launchpad receipt", "sELDENreceipt"), ERC20Snapshot, ISEldenTokenUsage {
  using SafeMath for uint256;

  struct UserInfo {
    uint256 allocation;
    uint256 allocationTime;
  }

  ISEldenToken public immutable sEldenToken; // SEldenToken contract

  mapping(address => UserInfo) public usersAllocation; // User's sElden allocation info
  uint256 public totalAllocation; // Contract's total sElden allocation

  uint256 public deallocationCooldown = 2592000; // 30 days

  constructor(ISEldenToken sEldenToken_) {
    sEldenToken = sEldenToken_;
  }

  /********************************************/
  /****************** EVENTS ******************/
  /********************************************/

  event Allocate(address indexed userAddress, uint256 amount);
  event Deallocate(address indexed userAddress, uint256 amount);
  event UpdateDeallocationCooldown(uint256 newDuration);


  /***********************************************/
  /****************** MODIFIERS ******************/
  /***********************************************/

  /**
   * @dev Checks if caller is the SEldenToken contract
   */
  modifier sEldenTokenOnly() {
    require(msg.sender == address(sEldenToken), "sEldenTokenOnly: caller should be sEldenToken");
    _;
  }


  /*******************************************/
  /****************** VIEWS ******************/
  /*******************************************/

  /**
   * @dev Returns total sELDEN allocated to this contract by "userAddress"
   */
  function getUserInfo(address userAddress) external view returns (uint256 allocation, uint256 allocationTime) {
    UserInfo storage userInfo = usersAllocation[userAddress];
    allocation = userInfo.allocation;
    allocationTime = userInfo.allocationTime;
  }


  /****************************************************/
  /****************** OWNABLE FUNCTIONS ***************/
  /****************************************************/

  /**
   * @dev Updates deallocationCooldown value
   *
   * Can only be called by owner
   */
  function updateDeallocationCooldown(uint256 duration) external onlyOwner {
    deallocationCooldown = duration;
    emit UpdateDeallocationCooldown(duration);
  }


  function snapshot() external onlyOwner {
    ERC20Snapshot._snapshot();
  }

  /*****************************************************************/
  /****************** EXTERNAL PUBLIC FUNCTIONS  *******************/
  /*****************************************************************/

  /**
   * Allocates "userAddress" user's "amount" of sElden to this launchpad contract
   *
   * Can only be called by sEldenToken contract, which is trusted to verify amounts
   * "data" is only here for compatibility reasons (IsEldenTokenUsage)
   */
  function allocate(address userAddress, uint256 amount, bytes calldata /*data*/) external override nonReentrant sEldenTokenOnly {
    UserInfo storage userInfo = usersAllocation[userAddress];

    userInfo.allocation = userInfo.allocation.add(amount);
    userInfo.allocationTime = _currentBlockTimestamp();
    totalAllocation = totalAllocation.add(amount);
    _mint(userAddress, amount);

    emit Allocate(userAddress, amount);
  }

  /**
   * Deallocates "userAddress" user's "amount" of sElden allocation from this launchpad contract
   *
   * Can only be called by sEldenToken contract, which is trusted to verify amounts
   * "data" is only here for compatibility reasons (IsEldenTokenUsage)
   */
  function deallocate(address userAddress, uint256 amount, bytes calldata /*data*/) external override nonReentrant sEldenTokenOnly {
    UserInfo storage userInfo = usersAllocation[userAddress];
    require(userInfo.allocation >= amount, "deallocate: non authorized amount");
    require(_currentBlockTimestamp() >= userInfo.allocationTime.add(deallocationCooldown), "deallocate: cooldown not reached");

    userInfo.allocation = userInfo.allocation.sub(amount);
    totalAllocation = totalAllocation.sub(amount);
    _burn(userAddress, amount);

    emit Deallocate(userAddress, amount);
  }


  /*****************************************************************/
  /********************* INTERNAL FUNCTIONS  ***********************/
  /*****************************************************************/

  /**
   * @dev Hook override to forbid transfers except from minting and burning
   */
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Snapshot) {
    require(from == address(0) || to == address(0), "transfer: not allowed");
    ERC20Snapshot._beforeTokenTransfer(from, to, amount);
  }

  /**
   * @dev Utility function to get the current block timestamp
   */
  function _currentBlockTimestamp() internal view virtual returns (uint256) {
    /* solhint-disable not-rely-on-time */
    return block.timestamp;
  }

}