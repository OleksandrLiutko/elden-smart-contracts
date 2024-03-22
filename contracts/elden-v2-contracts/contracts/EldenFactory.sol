// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.5.16;

import './interfaces/IEldenFactory.sol';
import './EldenPair.sol';

contract EldenFactory is IEldenFactory {
    bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(abi.encodePacked(type(EldenPair).creationCode));

    address public owner;
    address public feePercentOwner;
    address public feeTo;

    //uint public constant FEE_DENOMINATOR = 100000;
    uint public constant OWNER_FEE_SHARE_MAX = 100000; // 100%
    uint public ownerFeeShare = 50000; // default value = 50%

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event FeeToTransferred(address indexed prevFeeTo, address indexed newFeeTo);
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    event OwnerFeeShareUpdated(uint prevOwnerFeeShare, uint ownerFeeShare);
    event OwnershipTransferred(address indexed prevOwner, address indexed newOwner);
    event FeePercentOwnershipTransferred(address indexed prevOwner, address indexed newOwner);
    event ReferrerFeeShareUpdated(address referrer, uint prevReferrerFeeShare, uint referrerFeeShare);

    constructor(address feeTo_) public {
        owner = msg.sender;
        feePercentOwner = msg.sender;
        feeTo = feeTo_;

        emit OwnershipTransferred(address(0), msg.sender);
        emit FeePercentOwnershipTransferred(address(0), msg.sender);
        emit FeeToTransferred(address(0), feeTo_);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "EldenFactory: caller is not the owner");
        _;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'Elden: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'Elden: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'Elden: PAIR_EXISTS'); // single check is sufficient
        bytes memory bytecode = type(EldenPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IEldenPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setOwner(address _owner) external onlyOwner {
        require(_owner != address(0), "EldenFactory: zero address");
        emit OwnershipTransferred(owner, _owner);
        owner = _owner;
    }

    function setFeePercentOwner(address _feePercentOwner) external onlyOwner {
        require(_feePercentOwner != address(0), "EldenFactory: zero address");
        emit FeePercentOwnershipTransferred(feePercentOwner, _feePercentOwner);
        feePercentOwner = _feePercentOwner;
    }

    function setFeeTo(address _feeTo) external onlyOwner {
        emit FeeToTransferred(feeTo, _feeTo);
        feeTo = _feeTo;
    }

    /**
     * @dev Updates the share of fees attributed to the owner
     *
     * Must only be called by owner
     */
    function setOwnerFeeShare(uint newOwnerFeeShare) external onlyOwner {
        require(newOwnerFeeShare > 0, "EldenFactory: ownerFeeShare mustn't exceed minimum");
        require(newOwnerFeeShare <= OWNER_FEE_SHARE_MAX, "EldenFactory: ownerFeeShare mustn't exceed maximum");
        emit OwnerFeeShareUpdated(ownerFeeShare, newOwnerFeeShare);
        ownerFeeShare = newOwnerFeeShare;
    }

    function feeInfo() external view returns (uint _ownerFeeShare, address _feeTo) {
        _ownerFeeShare = ownerFeeShare;
        _feeTo = feeTo;
    }
}
