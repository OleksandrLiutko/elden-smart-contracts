# Solidity API

## IEldenV3SwapCallback

Any contract that calls IEldenV3PoolActions#swap must implement this interface

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

