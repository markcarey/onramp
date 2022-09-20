// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
}

contract Airdropper is Ownable {
    using SafeMath for uint256;

    IERC721 public nft;
    uint256 public factor;
    IERC20 public token1;
    IERC20 public token2;

    event Claimed(
        address indexed owner,
        uint256 amount  
    );
    
    constructor(
        IERC721 _nft,
        uint256 _factor,
        IERC20 _token1,
        IERC20 _token2
    ) {
        nft = _nft;
        factor = _factor;
        token1 = _token1;
        token2 = _token2;
    }

    function claim() external {
        uint256 amount = nft.balanceOf(msg.sender).mul(factor);
        require(amount > 0, "need NFT in your wallet");
        if ( address(token1) != address(0) ) {
            token1.transfer(msg.sender, amount);
        }
        if ( address(token2) != address(0) ) {
            token2.transfer(msg.sender, amount);
        }
        emit Claimed(msg.sender, amount);
    }

}