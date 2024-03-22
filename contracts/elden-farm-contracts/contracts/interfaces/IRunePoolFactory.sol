// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

interface IRunePoolFactory {
  function emergencyRecoveryAddress() external view returns (address);
  function feeAddress() external view returns (address);
  function getRunePoolFee(address runePoolAddress, address ownerAddress) external view returns (uint256);
  function publishRunePool(address nftAddress) external;
  function setRunePoolOwner(address previousOwner, address newOwner) external;
}