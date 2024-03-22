// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

import "./RunePool.sol";
import "./interfaces/IRunePoolFactory.sol";
import "./interfaces/tokens/IEldenToken.sol";
import "./interfaces/tokens/ISEldenToken.sol";


contract RunePoolFactory is Ownable, IRunePoolFactory {
  using EnumerableSet for EnumerableSet.AddressSet;

  IEldenToken public eldenToken; // ELDENToken contract's address
  ISEldenToken public sEldenToken; // SEldenToken contract's address

  EnumerableSet.AddressSet internal _runePools; // all rune pools
  EnumerableSet.AddressSet private _publishedRunePools; // all published rune pools
  mapping(address => EnumerableSet.AddressSet) private _nftPoolPublishedRunePools; // published rune pools per NFTPool
  mapping(address => EnumerableSet.AddressSet) internal _ownerRunePools; // rune pools per owner

  uint256 public constant MAX_DEFAULT_FEE = 100; // (1%) max authorized default fee
  uint256 public defaultFee; // default fee for rune pools (*1e2)
  address public override feeAddress; // to receive fees when defaultFee is set
  EnumerableSet.AddressSet internal _exemptedAddresses; // owners or rune addresses exempted from default fee

  address public override emergencyRecoveryAddress; // to recover rewards from emergency closed rune pools


  constructor(IEldenToken eldenToken_, ISEldenToken sEldenToken_, address emergencyRecoveryAddress_, address feeAddress_){
    require(emergencyRecoveryAddress_ != address(0) && feeAddress_ != address(0), "invalid");

    eldenToken = eldenToken_;
    sEldenToken = sEldenToken_;
    emergencyRecoveryAddress = emergencyRecoveryAddress_;
    feeAddress = feeAddress_;
  }


  /********************************************/
  /****************** EVENTS ******************/
  /********************************************/

  event CreateRunePool(address indexed runeAddress, address owner, address nftPoolAddress, IERC20 rewardsToken1, IERC20 rewardsToken2, RunePool.Settings settings);
  event PublishRunePool(address runeAddress);
  event SetDefaultFee(uint256 fee);
  event SetFeeAddress(address feeAddress);
  event SetEmergencyRecoveryAddress(address emergencyRecoveryAddress);
  event SetExemptedAddress(address exemptedAddress, bool isExempted);
  event SetRunePoolOwner(address previousOwner, address newOwner);


  /***********************************************/
  /****************** MODIFIERS ******************/
  /***********************************************/

  modifier runePoolExists(address runePoolAddress) {
    require(_runePools.contains(runePoolAddress), "unknown runePool");
    _;
  }


  /**************************************************/
  /****************** PUBLIC VIEWS ******************/
  /**************************************************/

  /**
   * @dev Returns the number of runePools
   */
  function runePoolsLength() external view returns (uint256) {
    return _runePools.length();
  }

  /**
   * @dev Returns a runePool from its "index"
   */
  function getRunePool(uint256 index) external view returns (address) {
    return _runePools.at(index);
  }

  /**
   * @dev Returns the number of published runePools
   */
  function publishedRunePoolsLength() external view returns (uint256) {
    return _publishedRunePools.length();
  }

  /**
   * @dev Returns a published runePool from its "index"
   */
  function getPublishedRunePool(uint256 index) external view returns (address) {
    return _publishedRunePools.at(index);
  }

  /**
   * @dev Returns the number of published runePools linked to "nftPoolAddress" NFTPool
   */
  function nftPoolPublishedRunePoolsLength(address nftPoolAddress) external view returns (uint256) {
    return _nftPoolPublishedRunePools[nftPoolAddress].length();
  }

  /**
   * @dev Returns a published runePool linked to "nftPoolAddress" from its "index"
   */
  function getNftPoolPublishedRunePool(address nftPoolAddress, uint256 index) external view returns (address) {
    return _nftPoolPublishedRunePools[nftPoolAddress].at(index);
  }

  /**
   * @dev Returns the number of runePools owned by "userAddress"
   */
  function ownerRunePoolsLength(address userAddress) external view returns (uint256) {
    return _ownerRunePools[userAddress].length();
  }

  /**
   * @dev Returns a runePool owned by "userAddress" from its "index"
   */
  function getOwnerRunePool(address userAddress, uint256 index) external view returns (address) {
    return _ownerRunePools[userAddress].at(index);
  }

  /**
   * @dev Returns the number of exemptedAddresses
   */
  function exemptedAddressesLength() external view returns (uint256) {
    return _exemptedAddresses.length();
  }

  /**
   * @dev Returns an exemptedAddress from its "index"
   */
  function getExemptedAddress(uint256 index) external view returns (address) {
    return _exemptedAddresses.at(index);
  }

  /**
   * @dev Returns if a given address is in exemptedAddresses
   */
  function isExemptedAddress(address checkedAddress) external view returns (bool) {
    return _exemptedAddresses.contains(checkedAddress);
  }

  /**
   * @dev Returns the fee for "runePoolAddress" address
   */
  function getRunePoolFee(address runePoolAddress, address ownerAddress) external view override returns (uint256) {
    if(_exemptedAddresses.contains(runePoolAddress) || _exemptedAddresses.contains(ownerAddress)) {
      return 0;
    }
    return defaultFee;
  }


  /*****************************************************************/
  /******************  EXTERNAL PUBLIC FUNCTIONS  ******************/
  /*****************************************************************/

  /**
   * @dev Deploys a new Rune Pool
   */
  function createRunePool(
    address nftPoolAddress, IERC20 rewardsToken1, IERC20 rewardsToken2, RunePool.Settings calldata settings
  ) external virtual returns (address runePool) {

    // Initialize new rune pool
    runePool = address(
      new RunePool(
        eldenToken, sEldenToken, msg.sender, INFTPool(nftPoolAddress),
          rewardsToken1, rewardsToken2, settings
      )
    );

    // Add new rune
    _runePools.add(runePool);
    _ownerRunePools[msg.sender].add(runePool);

    emit CreateRunePool(runePool, msg.sender, nftPoolAddress, rewardsToken1, rewardsToken2, settings);
  }

  /**
   * @dev Publish a Rune Pool
   *
   * Must only be called by the Rune Pool contract
   */
  function publishRunePool(address nftAddress) external override runePoolExists(msg.sender) {
    _publishedRunePools.add(msg.sender);

    _nftPoolPublishedRunePools[nftAddress].add(msg.sender);

    emit PublishRunePool(msg.sender);
  }

  /**
   * @dev Transfers a Rune Pool's ownership
   *
   * Must only be called by the RunePool contract
   */
  function setRunePoolOwner(address previousOwner, address newOwner) external override runePoolExists(msg.sender) {
    require(_ownerRunePools[previousOwner].remove(msg.sender), "invalid owner");
    _ownerRunePools[newOwner].add(msg.sender);

    emit SetRunePoolOwner(previousOwner, newOwner);
  }

  /**
   * @dev Set runePools default fee (when adding rewards)
   *
   * Must only be called by the owner
   */
  function setDefaultFee(uint256 newFee) external onlyOwner {
    require(newFee <= MAX_DEFAULT_FEE, "invalid amount");

    defaultFee = newFee;
    emit SetDefaultFee(newFee);
  }

  /**
   * @dev Set fee address
   *
   * Must only be called by the owner
   */
  function setFeeAddress(address feeAddress_) external onlyOwner {
    require(feeAddress_ != address(0), "zero address");

    feeAddress = feeAddress_;
    emit SetFeeAddress(feeAddress_);
  }

  /**
   * @dev Add or remove exemptedAddresses
   *
   * Must only be called by the owner
   */
  function setExemptedAddress(address exemptedAddress, bool isExempted) external onlyOwner {
    require(exemptedAddress != address(0), "zero address");

    if(isExempted) _exemptedAddresses.add(exemptedAddress);
    else _exemptedAddresses.remove(exemptedAddress);

    emit SetExemptedAddress(exemptedAddress, isExempted);
  }

  /**
   * @dev Set emergencyRecoveryAddress
   *
   * Must only be called by the owner
   */
  function setEmergencyRecoveryAddress(address emergencyRecoveryAddress_) external onlyOwner {
    require(emergencyRecoveryAddress_ != address(0), "zero address");

    emergencyRecoveryAddress = emergencyRecoveryAddress_;
    emit SetEmergencyRecoveryAddress(emergencyRecoveryAddress_);
  }


  /********************************************************/
  /****************** INTERNAL FUNCTIONS ******************/
  /********************************************************/

  /**
   * @dev Utility function to get the current block timestamp
   */
  function _currentBlockTimestamp() internal view virtual returns (uint256) {
    /* solhint-disable not-rely-on-time */
    return block.timestamp;
  }
}