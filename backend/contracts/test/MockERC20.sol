// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Minting 1 Billion tokens
        _mint(msg.sender, 1000000000 * 1e18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
