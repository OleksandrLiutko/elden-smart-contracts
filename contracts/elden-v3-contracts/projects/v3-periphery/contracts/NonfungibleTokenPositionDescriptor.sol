// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@elden/v3-core/contracts/interfaces/IEldenV3Pool.sol';
import '@uniswap/lib/contracts/libraries/SafeERC20Namer.sol';

import './libraries/ChainId.sol';
import './interfaces/INonfungiblePositionManager.sol';
import './interfaces/INonfungibleTokenPositionDescriptor.sol';
import './interfaces/IERC20Metadata.sol';
import './libraries/PoolAddress.sol';
import './libraries/NFTDescriptor.sol';
import './libraries/TokenRatioSortOrder.sol';
import './NFTDescriptorEx.sol';

/// @title Describes NFT token positions
/// @notice Produces a string containing the data URI for a JSON metadata string
contract NonfungibleTokenPositionDescriptor is INonfungibleTokenPositionDescriptor {
    address private constant DAI = 0x789C767251c2185310B5F3De9A7e1aB7dC5B4F2E;
    address private constant USDC = 0x633a39b7347610E2CcEd559c579a69cf82126119;
    address private constant USDT = 0xa2EB04Bff2Ac8b9EFa47403F8dA213aCa809cECE;
    address private constant TBTC = 0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa;
    address private constant WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    address public immutable WETH9;
    /// @dev A null-terminated string
    bytes32 public immutable nativeCurrencyLabelBytes;

    /// @dev A NFTDescriptorEx address
    address public immutable nftDescriptorEx;

    constructor(address _WETH9, bytes32 _nativeCurrencyLabelBytes, address _nftDescriptorEx) {
        WETH9 = _WETH9;
        nativeCurrencyLabelBytes = _nativeCurrencyLabelBytes;
        nftDescriptorEx = _nftDescriptorEx;
    }

    /// @notice Returns the native currency label as a string
    function nativeCurrencyLabel() public view returns (string memory) {
        uint256 len = 0;
        while (len < 32 && nativeCurrencyLabelBytes[len] != 0) {
            len++;
        }
        bytes memory b = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            b[i] = nativeCurrencyLabelBytes[i];
        }
        return string(b);
    }

    /// @inheritdoc INonfungibleTokenPositionDescriptor
    function tokenURI(INonfungiblePositionManager positionManager, uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        (, , address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, , , , , ) =
            positionManager.positions(tokenId);

        IEldenV3Pool pool =
            IEldenV3Pool(
                PoolAddress.computeAddress(
                    positionManager.deployer(),
                    PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
                )
            );

        bool _flipRatio = flipRatio(token0, token1, ChainId.get());
        address quoteTokenAddress = !_flipRatio ? token1 : token0;
        address baseTokenAddress = !_flipRatio ? token0 : token1;
        (, int24 tick, , , , , ) = pool.slot0();

        return
            NFTDescriptorEx(nftDescriptorEx).constructTokenURI(
                NFTDescriptorEx.ConstructTokenURIParams({
                    tokenId: tokenId,
                    quoteTokenAddress: quoteTokenAddress,
                    baseTokenAddress: baseTokenAddress,
                    quoteTokenSymbol: quoteTokenAddress == WETH9
                        ? nativeCurrencyLabel()
                        : SafeERC20Namer.tokenSymbol(quoteTokenAddress),
                    baseTokenSymbol: baseTokenAddress == WETH9
                        ? nativeCurrencyLabel()
                        : SafeERC20Namer.tokenSymbol(baseTokenAddress),
                    quoteTokenDecimals: IERC20Metadata(quoteTokenAddress).decimals(),
                    baseTokenDecimals: IERC20Metadata(baseTokenAddress).decimals(),
                    flipRatio: _flipRatio,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    tickCurrent: tick,
                    tickSpacing: pool.tickSpacing(),
                    fee: fee,
                    poolAddress: address(pool)
                })
            );
    }

    function flipRatio(
        address token0,
        address token1,
        uint256 chainId
    ) public view returns (bool) {
        return tokenRatioPriority(token0, chainId) > tokenRatioPriority(token1, chainId);
    }

    function tokenRatioPriority(address token, uint256 chainId) public view returns (int256) {
        if (token == WETH9) {
            return TokenRatioSortOrder.DENOMINATOR;
        }
        if (chainId == 534351) {
            if (token == USDC) {
                return TokenRatioSortOrder.NUMERATOR_MOST;
            } else if (token == USDT) {
                return TokenRatioSortOrder.NUMERATOR_MORE;
            } else if (token == DAI) {
                return TokenRatioSortOrder.NUMERATOR;
            } else if (token == TBTC) {
                return TokenRatioSortOrder.DENOMINATOR_MORE;
            } else if (token == WBTC) {
                return TokenRatioSortOrder.DENOMINATOR_MOST;
            } else {
                return 0;
            }
        }
        return 0;
    }
}
