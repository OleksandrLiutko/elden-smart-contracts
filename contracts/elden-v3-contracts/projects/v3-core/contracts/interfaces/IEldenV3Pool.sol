// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/IEldenV3PoolImmutables.sol';
import './pool/IEldenV3PoolState.sol';
import './pool/IEldenV3PoolDerivedState.sol';
import './pool/IEldenV3PoolActions.sol';
import './pool/IEldenV3PoolOwnerActions.sol';
import './pool/IEldenV3PoolEvents.sol';

/// @title The interface for a EldenSwap V3 Pool
/// @notice A EldenSwap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IEldenV3Pool is
    IEldenV3PoolImmutables,
    IEldenV3PoolState,
    IEldenV3PoolDerivedState,
    IEldenV3PoolActions,
    IEldenV3PoolOwnerActions,
    IEldenV3PoolEvents
{

}
