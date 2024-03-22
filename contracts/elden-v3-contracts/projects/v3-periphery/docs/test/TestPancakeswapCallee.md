# Solidity API

## TestEldenCallee

### swapExact0For1

```solidity
function swapExact0For1(address pool, uint256 amount0In, address recipient, uint160 sqrtPriceLimitX96) external
```

### swap0ForExact1

```solidity
function swap0ForExact1(address pool, uint256 amount1Out, address recipient, uint160 sqrtPriceLimitX96) external
```

### swapExact1For0

```solidity
function swapExact1For0(address pool, uint256 amount1In, address recipient, uint160 sqrtPriceLimitX96) external
```

### swap1ForExact0

```solidity
function swap1ForExact0(address pool, uint256 amount0Out, address recipient, uint160 sqrtPriceLimitX96) external
```

### eldenV3SwapCallback

```solidity
function eldenV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes data) external
```

Called to `msg.sender` after executing a swap via IEldenV3Pool#swap.

_In the implementation you must pay the pool tokens owed for the swap.
The caller of this method must be checked to be a EldenV3Pool deployed by the canonical EldenV3Factory.
amount0Delta and amount1Delta can both be 0 if no tokens were swapped._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0Delta | int256 | The amount of token0 that was sent (negative) or must be received (positive) by the pool by the end of the swap. If positive, the callback must send that amount of token0 to the pool. |
| amount1Delta | int256 | The amount of token1 that was sent (negative) or must be received (positive) by the pool by the end of the swap. If positive, the callback must send that amount of token1 to the pool. |
| data | bytes | Any data passed through by the caller via the IEldenV3PoolActions#swap call |

