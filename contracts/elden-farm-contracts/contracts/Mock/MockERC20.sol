// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 supply
    ) ERC20(name, symbol) {
        _mint(msg.sender, supply);
        _decimals = decimals_;
    }

    function mintTokens(uint256 _amount) external {
        _mint(msg.sender, _amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals; // Set the number of decimal places here (e.g., 18 for 18 decimal places)
    }
}
