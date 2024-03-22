const { ethers, upgrades } = require("hardhat");
const {expect} = require('chai')
var colors = require('colors')
const keccak256 = require('keccak256');
const provider = waffle.provider;

require("@nomiclabs/hardhat-ethers");

describe("Test Token", async function () {
    let owner, accounts;
    let ;
    before(async () => {
        [owner, ...accounts] = await ethers.getSigners();


    });
    
    it("Staking lp", async function () {
        
    });

    it("Vest", async function () {

    });
});