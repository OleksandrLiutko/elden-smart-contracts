import { ether, time, constants, BN, expectRevert, expectEvent, balance } from "@openzeppelin/test-helpers";
import { advanceBlock, advanceBlockTo } from "@openzeppelin/test-helpers/src/time";
import { artifacts, contract, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { assert, expect } from "chai";

const EldenStableSwapFactory = artifacts.require("stable-swap/contracts/EldenStableSwapFactory.sol");
const EldenStableSwapLPFactory = artifacts.require("stable-swap/contracts/EldenStableSwapLPFactory.sol");
const EldenStableSwapTwoPoolDeployer = artifacts.require("stable-swap/contracts/EldenStableSwapTwoPoolDeployer.sol");
const EldenStableSwapThreePoolDeployer = artifacts.require("stable-swap/contracts/EldenStableSwapThreePoolDeployer.sol");
const EldenStableSwapTwoPool = artifacts.require("stable-swap/contracts/EldenStableSwapTwoPool.sol");
const EldenStableSwapThreePool = artifacts.require("stable-swap/contracts/EldenStableSwapThreePool.sol");
const EldenStableSwapTwoPoolInfo = artifacts.require("stable-swap/contracts/utils/EldenStableSwapTwoPoolInfo.sol");
const EldenStableSwapThreePoolInfo = artifacts.require("stable-swap/contracts/utils/EldenStableSwapThreePoolInfo.sol");
const EldenStableSwapInfo = artifacts.require("stable-swap/contracts/utils/EldenStableSwapInfo.sol");
const LPToken = artifacts.require("stable-swap/contracts/EldenStableSwapLP.sol");
const Token = artifacts.require("stable-swap/contracts/test/Token.sol");
const FeeOnTransferToken = artifacts.require("exchange-protocol/contracts/test/FeeOnTransferToken.sol");
const EldenFactory = artifacts.require("exchange-protocol/contracts/EldenFactory.sol");
const EldenPair = artifacts.require("exchange-protocol/contracts/EldenPair.sol");
const EldenRouter = artifacts.require("exchange-protocol/contracts/EldenRouter.sol");
const WrappedETH = artifacts.require("exchange-protocol/contracts/libraries/WETH.sol");
const StableSwapRouterHelper = artifacts.require("./libraries/StableSwapRouterHelper.sol");
const SmartRouter = artifacts.require("./SmartRouter.sol");



contract("SmartRouter", ([admin, bob, carol]) => {
    let stableSwapLPFactory;
    let stableSwapFactory;
    let stableSwap2PoolDeployer;
    let stableSwap3PoolDeployer;
    let stableSwap2PoolInfo;
    let stableSwap3PoolInfo;
    let stableSwapPoolInfo;
    let DAI;
    let USDC
    let USDT;
    let FeeToken;
    let stable2Pool_DAI_USDC;
    let stable2Pool_LP_DAI_USDC;
    let stable2Pool_token0;
    let stable2Pool_token1;
    let stable2PoolInfo;
    let stable2Pool_WETH_DAI;
    let stable2Pool_LP_WETH_DAI;
    let stable2Pool_WETH_DAI_token0;
    let stable2Pool_WETH_DAI_token1;
    let stable2PoolInfo_WETH_DAI;
    let stableETH2PoolInfo;
    let stable3Pool_DAI_USDC_USDT;
    let stable3Pool_LP_DAI_USDC_USDT;
    let stable3Pool_token0;
    let stable3Pool_token1;
    let stable3Pool_token2;
    let stable3PoolInfo;
    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    let EldenFactory;
    let EldenRouter;
    let WETH;
    let pool_WETH_DAI;
    let pool_DAI_USDC;
    let pool_WETH_USDC;
    let pool_DAI_FeeToken;
    let stableSwapRouterHelper;
    let smartRouter;
    const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';



    before(async () => {
        /** Tokens */
        WETH = await WrappedETH.new( { from: admin } );
        DAI = await Token.new("DAI", "DAI", 18, { from: admin });
        USDC = await Token.new("USD Coin", "USDC", 18, { from: admin });
        USDT = await Token.new("Tether USD", "USDT", 18, { from: admin });
        FeeToken = await FeeOnTransferToken.new("Fee On Transfer Token", "FeeToken", 18, { from: admin });

        await DAI.mint(bob, parseEther("3000000"), { from: bob });
        await DAI.mint(carol, parseEther("3000000"), { from: carol });
        await USDC.mint(bob, parseEther("3000000"), { from: bob });
        await USDC.mint(carol, parseEther("3000000"), { from: carol });
        await USDT.mint(bob, parseEther("3000000"), { from: bob });
        await USDT.mint(carol, parseEther("3000000"), { from: carol });
        await FeeToken.mint(bob, parseEther("3000000"), { from: bob });
        await FeeToken.mint(carol, parseEther("3000000"), { from: carol });
        await WETH.deposit({ from: bob, value:  parseEther("300")});
        await WETH.deposit({ from: carol, value:  parseEther("300")});


        /** Create Stable Swap */
        stableSwapLPFactory = await EldenStableSwapLPFactory.new({ from: admin });
        stableSwap2PoolDeployer = await EldenStableSwapTwoPoolDeployer.new({ from: admin });
        stableSwap3PoolDeployer = await EldenStableSwapThreePoolDeployer.new({ from: admin });
        stableSwapFactory = await EldenStableSwapFactory.new(stableSwapLPFactory.address, stableSwap2PoolDeployer.address, stableSwap3PoolDeployer.address, {
            from: admin,
        });
        stableSwap2PoolInfo = await EldenStableSwapTwoPoolInfo.new({ from: admin });
        stableSwap3PoolInfo = await EldenStableSwapThreePoolInfo.new({ from: admin });
        stableSwapPoolInfo = await EldenStableSwapInfo.new(stableSwap2PoolInfo.address, stableSwap3PoolInfo.address, { from: admin });

        await stableSwapLPFactory.transferOwnership(stableSwapFactory.address, { from: admin });
        await stableSwap2PoolDeployer.transferOwnership(stableSwapFactory.address, { from: admin });
        await stableSwap3PoolDeployer.transferOwnership(stableSwapFactory.address, { from: admin });

        await stableSwapFactory.createSwapPair(DAI.address, USDC.address, A, Fee, AdminFee, { from: admin });
        stable2PoolInfo = await stableSwapFactory.getPairInfo(DAI.address, USDC.address);
        stable2Pool_DAI_USDC = await EldenStableSwapTwoPool.at(stable2PoolInfo.swapContract);
        stable2Pool_LP_DAI_USDC = await LPToken.at(stable2PoolInfo.LPContract);
        stable2Pool_token0 = await Token.at(stable2PoolInfo.token0);
        stable2Pool_token1 = await Token.at(stable2PoolInfo.token1);
        await stableSwapFactory.createSwapPair(WETH.address, DAI.address, A, Fee, AdminFee, { from: admin });
        stable2PoolInfo_WETH_DAI = await stableSwapFactory.getPairInfo(WETH.address, DAI.address);
        stable2Pool_WETH_DAI = await EldenStableSwapTwoPool.at(stable2PoolInfo_WETH_DAI.swapContract);
        stable2Pool_LP_WETH_DAI = await LPToken.at(stable2PoolInfo_WETH_DAI.LPContract);
        stable2Pool_WETH_DAI_token0 = await Token.at(stable2PoolInfo_WETH_DAI.token0);
        stable2Pool_WETH_DAI_token1 = await Token.at(stable2PoolInfo_WETH_DAI.token1);
        await stableSwapFactory.createThreePoolPair(DAI.address, USDC.address, USDT.address, A, Fee, AdminFee, { from: admin });
        stable3PoolInfo = await stableSwapFactory.getThreePoolPairInfo(DAI.address, USDC.address);
        stable3Pool_DAI_USDC_USDT = await EldenStableSwapThreePool.at(stable3PoolInfo.swapContract);
        stable3Pool_LP_DAI_USDC_USDT = await LPToken.at(stable3PoolInfo.LPContract);
        stable3Pool_token0 = await Token.at(stable3PoolInfo.token0);
        stable3Pool_token1 = await Token.at(stable3PoolInfo.token1);
        stable3Pool_token2 = await Token.at(stable3PoolInfo.token2);


        /** Initialize Stable Swap */
        await DAI.approve(stable2Pool_DAI_USDC.address, parseEther("1000000"), { from: bob });
        await USDC.approve(stable2Pool_DAI_USDC.address, parseEther("1000000"), { from: bob });

        await expectRevert(
            stable2Pool_DAI_USDC.add_liquidity([0, parseEther("1")], 0, { from: bob }),
            "Initial deposit requires all coins"
        );

        await expectRevert(
            stable2Pool_DAI_USDC.add_liquidity([parseEther("1"), 0], 0, { from: bob }),
            "Initial deposit requires all coins"
        );
    
        await stable2Pool_DAI_USDC.add_liquidity(
            [parseEther("1000000"), parseEther("1000000")],
            parseEther("2000000"),
            {
                from: bob,
            }
        );

        await WETH.approve(stable2Pool_WETH_DAI.address, parseEther("100"), { from: bob });
        await DAI.approve(stable2Pool_WETH_DAI.address, parseEther("20000"), { from: bob });
    
        await stable2Pool_WETH_DAI.add_liquidity(
            [parseEther("100"), parseEther("20000")],
            parseEther("0"),
            {
                from: bob,
            }
        );

        await DAI.approve(stable3Pool_DAI_USDC_USDT.address, parseEther("1000000"), { from: bob });
        await USDC.approve(stable3Pool_DAI_USDC_USDT.address, parseEther("1000000"), { from: bob });
        await USDT.approve(stable3Pool_DAI_USDC_USDT.address, parseEther("1000000"), { from: bob });

        await expectRevert(
            stable3Pool_DAI_USDC_USDT.add_liquidity([0, parseEther("1"), 0], 0, { from: bob }),
            "Initial deposit requires all coins"
        );

        await expectRevert(
            stable3Pool_DAI_USDC_USDT.add_liquidity([parseEther("1"), 0, 0], 0, { from: bob }),
            "Initial deposit requires all coins"
        );
    
        await expectRevert(
            stable3Pool_DAI_USDC_USDT.add_liquidity([0, 0, parseEther("1")], 0, { from: bob }),
            "Initial deposit requires all coins"
        );

        await stable3Pool_DAI_USDC_USDT.add_liquidity(
            [parseEther("1000000"), parseEther("1000000"), parseEther("1000000")],
            parseEther("3000000"),
            {
                from: bob,
            }
        );


        /** Create Smart Router */
        stableSwapRouterHelper = await StableSwapRouterHelper.new({ from: admin });
        SmartRouter.link(stableSwapRouterHelper);
        smartRouter = await SmartRouter.new(
            constants.ZERO_ADDRESS, // 
            constants.ZERO_ADDRESS, //
            constants.ZERO_ADDRESS, //
            stableSwapFactory.address, 
            stableSwapPoolInfo.address, 
            WETH.address, 
            { from: admin, }
        );


        /** Initialize Smart Router */
        for (let thisUser of [bob, carol]) {
            await DAI.approve(smartRouter.address, constants.MAX_UINT256, {
                from: thisUser,
            });

            await USDC.approve(smartRouter.address, constants.MAX_UINT256, {
                from: thisUser,
            });

            await USDT.approve(smartRouter.address, constants.MAX_UINT256, {
                from: thisUser,
            });

            await WETH.approve(smartRouter.address, constants.MAX_UINT256, {
                from: thisUser,
            });

            await FeeToken.approve(smartRouter.address, constants.MAX_UINT256, {
                from: thisUser,
            });
        }
    });



    describe("Check setups and info", () => {
        it("Check Stable Swap", async () => {
            assert.equal(stable2PoolInfo.swapContract, stable2Pool_DAI_USDC.address);
            assert.equal(stable2PoolInfo.token0, stable2Pool_token0.address);
            assert.equal(stable2PoolInfo.token1, stable2Pool_token1.address);
            assert.equal(stable2PoolInfo.LPContract, stable2Pool_LP_DAI_USDC.address);

            assert.equal(stable3PoolInfo.swapContract, stable3Pool_DAI_USDC_USDT.address);
            assert.equal(stable3PoolInfo.token0, stable3Pool_token0.address);
            assert.equal(stable3PoolInfo.token1, stable3Pool_token1.address);
            assert.equal(stable3PoolInfo.token2, stable3Pool_token2.address);
            assert.equal(stable3PoolInfo.LPContract, stable3Pool_LP_DAI_USDC_USDT.address);

            await expectRevert(
                stable2Pool_DAI_USDC.add_liquidity([parseEther("1"), parseEther("1")], parseEther("2.1"), {
                  from: bob,
                }),
                "Slippage screwed you"
            );
        
            await expectRevert(
                stable2Pool_DAI_USDC.add_liquidity([parseEther("1"), parseEther("1")], 0, {
                  from: bob,
                  value: ether("1"),
                }),
                "Inconsistent quantity"
            );
        
            let LP_balance = await stable2Pool_LP_DAI_USDC.balanceOf(bob);
            let LP_totalSupply = await stable2Pool_LP_DAI_USDC.totalSupply();
            assert.equal(parseEther("2000000").toString(), LP_balance.toString()); 
            assert.equal(LP_totalSupply.toString(), LP_balance.toString());

            await expectRevert(
                stable3Pool_DAI_USDC_USDT.add_liquidity([parseEther("1"), parseEther("1"), parseEther("1")], parseEther("3.1"), {
                  from: bob,
                }),
                "Slippage screwed you"
            );
        
            await expectRevert(
                stable3Pool_DAI_USDC_USDT.add_liquidity([parseEther("1"), parseEther("1"), parseEther("1")], 0, {
                  from: bob,
                  value: ether("1"),
                }),
                "Inconsistent quantity"
            );
        
            LP_balance = await stable3Pool_LP_DAI_USDC_USDT.balanceOf(bob);
            LP_totalSupply = await stable3Pool_LP_DAI_USDC_USDT.totalSupply();
            assert.equal(parseEther("3000000").toString(), LP_balance.toString());
            assert.equal(LP_totalSupply.toString(), LP_balance.toString());
        });
    });


    
    describe("User swap via SmartRouter", () => {
        it("Carol exact output swap DAI -> USDC on stable 2pool & exact output swap USDC -> 100 USDT on stable 3pool", async () => {
            const deadline = new BN(await time.latest()).add(new BN("100"));

            const usdtBalanceBefore = await USDT.balanceOf(carol);

            const exactOnputData = smartRouter.contract.methods.exactOutputStableSwap([DAI.address, USDC.address, USDT.address], [2, 3], parseEther("100"), parseEther("105")).encodeABI();
            const result = await smartRouter.multicall(deadline, [exactOnputData], {from: carol});

            const usdtBalanceAfter = await USDT.balanceOf(carol);
            assert.equal((usdtBalanceAfter.sub(usdtBalanceBefore)).toString(), parseEther("100").toString());
        });

        it("Carol exact input swap 100 DAI -> USDC on stable 2pool & exact output swap USDC -> 100 USDT on stable 3pool", async () => {
            const deadline = new BN(await time.latest()).add(new BN("100"));

            const DAIBalanceBefore = await DAI.balanceOf(carol);
            const usdtBalanceBefore = await USDT.balanceOf(carol);

            const exactInput2PoolData = smartRouter.contract.methods.exactInputStableSwap([DAI.address, USDC.address], [2], parseEther("100"), 0).encodeABI();
            const exactOnput3PoolData = smartRouter.contract.methods.exactOutputStableSwap([USDC.address, USDT.address], [3], parseEther("100"), parseEther("105")).encodeABI();
            const result = await smartRouter.multicall(deadline, [exactInput2PoolData, exactOnput3PoolData], {from: carol});

            const DAIBalanceAfter = await DAI.balanceOf(carol);
            const usdtBalanceAfter = await USDT.balanceOf(carol);
            assert.equal((DAIBalanceBefore.sub(DAIBalanceAfter)).toString(), parseEther("100").toString());
            assert.equal((usdtBalanceAfter.sub(usdtBalanceBefore)).toString(), parseEther("100").toString());
        });

        it("Carol exact output swap DAI -> 100 USDC on stable 2pool & exact output swap DAI -> 100 USDC on stable 3pool", async () => {
            const deadline = new BN(await time.latest()).add(new BN("100"));

            const usdcBalanceBefore = await USDC.balanceOf(carol);

            const exactOutput2PoolData = smartRouter.contract.methods.exactOutputStableSwap([DAI.address, USDC.address], [2], parseEther("100"), parseEther("105")).encodeABI();
            const exactOnput3PoolData = smartRouter.contract.methods.exactOutputStableSwap([DAI.address, USDC.address], [3], parseEther("100"), parseEther("105")).encodeABI();
            const result = await smartRouter.multicall(deadline, [exactOutput2PoolData, exactOnput3PoolData], {from: carol});

            const usdcBalanceAfter = await USDC.balanceOf(carol);
            assert.equal((usdcBalanceAfter.sub(usdcBalanceBefore)).toString(), parseEther("200").toString());
        });

        it("Carol exact input swap 100 DAI -> USDC on stable 2pool & exact output swap DAI -> USDT -> 100 USDC on stable 3pool", async () => {
            const deadline = new BN(await time.latest()).add(new BN("100"));

            const exactInput2PoolData = smartRouter.contract.methods.exactInputStableSwap([DAI.address, USDC.address], [2], parseEther("100"), 0).encodeABI();
            const exactOnput3PoolData = smartRouter.contract.methods.exactOutputStableSwap([DAI.address, USDT.address, USDC.address], [3, 3], parseEther("100"), parseEther("105")).encodeABI();
            const result = await smartRouter.multicall(deadline, [exactInput2PoolData, exactOnput3PoolData], {from: carol});
        });

        it("Carol exact output swap DAI -> 1 ETH on stable 2pool", async () => {            
            const deadline = new BN(await time.latest()).add(new BN("100"));

            const tracker = await balance.tracker(carol);

            const exactOutput2PoolData = smartRouter.contract.methods.exactOutputStableSwap([DAI.address, WETH.address], [2], parseEther("1"), parseEther("10")).encodeABI();
            const unwrapWETH9Data = smartRouter.contract.methods.unwrapWETH9(parseEther("1")).encodeABI();
            const result = await smartRouter.multicall(deadline, [exactOutput2PoolData, unwrapWETH9Data], {from: carol, gasPrice: 339817});

            const gasCost = result.receipt.gasUsed * 339817;
            assert.equal((await tracker.delta()).toString(), parseEther("1").sub(gasCost).toString());
            assert.equal((await WETH.balanceOf(carol)).toString(), parseEther("300").toString());
        });

        it("Carol exact output swap ETH -> 100 DAI on stable 2pool", async () => {
            const amounts = await stableSwapRouterHelper.getAmountsIn(
                stableSwapFactory.address, 
                stableSwapPoolInfo.address, 
                [WETH.address, DAI.address], 
                [2], 
                parseEther("100")
            );
            const inputETHAmount = amounts[0];
            
            const deadline = new BN(await time.latest()).add(new BN("100"));

            const tracker = await balance.tracker(carol);
            const DAIBalanceBefore = await DAI.balanceOf(carol);

            const exactOutputData = smartRouter.contract.methods.exactOutputStableSwap([WETH.address, DAI.address], [2], parseEther("100"), parseEther("100")).encodeABI();
            const result = await smartRouter.multicall(deadline, [exactOutputData], {from: carol, value: inputETHAmount, gasPrice: 260991});

            const gasCost = result.receipt.gasUsed * 260991;
            const DAIBalanceAfter = await DAI.balanceOf(carol);

            assert.equal((await tracker.delta()).abs().toString(), BigNumber.from(inputETHAmount.toString()).add(gasCost).toString());
            assert.equal((DAIBalanceAfter.sub(DAIBalanceBefore)).toString(), parseEther("100").toString());
            assert.equal(await balance.current(smartRouter.address), 0);
            assert.equal(await WETH.balanceOf(smartRouter.address), 0);
        });
    });



    describe("Owner operation", () => {
        it("Update StableSwapRouter", async () => {
            const oldStableSwapFactory = await smartRouter.stableSwapFactory();
            const oldStableSwapInfo = await smartRouter.stableSwapInfo();

            const result = await smartRouter.setStableSwap(constants.ZERO_ADDRESS, constants.ZERO_ADDRESS, { from: admin });

            const newStableSwapFactory = await smartRouter.stableSwapFactory();
            const newStableSwapInfo = await smartRouter.stableSwapInfo();

            assert.notEqual(oldStableSwapFactory, newStableSwapFactory);
            assert.notEqual(oldStableSwapInfo, newStableSwapInfo);
        });
    });
});
