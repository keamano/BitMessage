"use strict";
exports.__esModule = true;
var block_1 = require("./block");
var util_1 = require("./util");
var BlockChain = /** @class */ (function () {
    function BlockChain() {
        ////////////////////////////////////////
        // private
        ////////////////////////////////////////
        // ブロックチェーンの格納
        this.blockchain = [block_1.Block.GENESIS_BLOK];
    }
    BlockChain.prototype.addBlock = function (newBlock) {
        if (BlockChain.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
        }
    };
    BlockChain.prototype.init = function (p2p) {
        this.p2p = p2p;
    };
    // ブロックチェーンを返す
    BlockChain.prototype.getBlockchain = function () {
        return this.blockchain;
    };
    // 最新のブロックを返す
    BlockChain.prototype.getLatestBlock = function () {
        return this.blockchain[this.blockchain.length - 1];
    };
    // 次のブロックを生成し、ブロックチェーンに追加する
    BlockChain.prototype.generateNextBlock = function (blockData) {
        // 前のブロック(現在の最新ブロック)から
        var previousBlock = this.getLatestBlock();
        var nextIndex = previousBlock.index + 1;
        var nextPreviousBlockHash = previousBlock.hash;
        // タイムスタンプは現在時刻
        var nextTimestamp = util_1.Util.getCurrentTimestamp();
        // ブロックのデータ
        // blockData = blockData;
        // ブロック生成に置ける難しさ
        var difficulty = BlockChain.getDifficulty(this.getBlockchain());
        console.log('difficulty: ' + difficulty);
        // ブロックのハッシュ
        // ここでは計算しない
        // ブロックを生成し、ブロックチェーンに追加する
        var newBlock = block_1.Block.findBlock(nextIndex, nextPreviousBlockHash, nextTimestamp, blockData, difficulty);
        this.addBlock(newBlock);
        this.p2p.broadcastLatest();
        return newBlock;
    };
    // ブロックをブロックチェーンへ追加する
    BlockChain.prototype.addBlockToChain = function (newBlock) {
        if (BlockChain.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
            return true;
        }
        return false;
    };
    // ブロックチェーンを置き換える
    BlockChain.prototype.replaceChain = function (newBlocks) {
        if (BlockChain.isValidChain(newBlocks) &&
            BlockChain.getAccumulatedDifficulty(newBlocks) > BlockChain.getAccumulatedDifficulty(this.getBlockchain())) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain = newBlocks;
            this.p2p.broadcastLatest();
        }
        else {
            console.log('Received blockchain invalid');
        }
    };
    // ブロック生成の難しさを返す
    BlockChain.getDifficulty = function (aBlockchain) {
        var latestBlock = aBlockchain[aBlockchain.length - 1];
        if (latestBlock.index % BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
            latestBlock.index !== 0) {
            // ブロックの指定の間隔でブロック生成に置ける難しさを調整
            return this.getAdjustedDifficulty(latestBlock, aBlockchain);
        }
        else {
            // その他は最新のブロックの難しさを引き継ぐ
            return latestBlock.difficulty;
        }
    };
    // ブロック生成の難しさを調整する
    BlockChain.getAdjustedDifficulty = function (latestBlock, aBlockchain) {
        var prevAdjustmentBlock = aBlockchain[aBlockchain.length - BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL];
        var timeExpected = BlockChain.BLOCK_GENERATION_INTERVAL * BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL;
        var timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
        if (timeTaken < timeExpected / 2) {
            return prevAdjustmentBlock.difficulty + 1;
        }
        else if (timeTaken > timeExpected * 2) {
            return prevAdjustmentBlock.difficulty - 1;
        }
        else {
            return prevAdjustmentBlock.difficulty;
        }
    };
    ////////////////////
    // 新しいブロックの検証
    ////////////////////
    BlockChain.isValidNewBlock = function (newBlock, previousBlock) {
        if (!block_1.Block.isValidBlockStructure(newBlock)) {
            console.log('invalid structure');
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        }
        else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        }
        else if (!this.isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        }
        else if (!block_1.Block.hasValidHash(newBlock)) {
            return false;
        }
        return true;
    };
    // タイムスタンプが前のブロックより１分以内なら過去でも良い
    // タイムスタンプが現在時刻より１分以内なら未来でも良い
    BlockChain.isValidTimestamp = function (newBlock, previousBlock) {
        return (previousBlock.timestamp - 60 < newBlock.timestamp)
            && newBlock.timestamp - 60 < util_1.Util.getCurrentTimestamp();
    };
    ////////////////////
    // ブロックチェーン関連
    ////////////////////
    // ブロックチェーンの検証
    BlockChain.isValidChain = function (blockchainToValidate) {
        var isValidGenesis = function (block) {
            return JSON.stringify(block) === JSON.stringify(block_1.Block.GENESIS_BLOK);
        };
        if (!isValidGenesis(blockchainToValidate[0])) {
            return false;
        }
        for (var i = 1; i < blockchainToValidate.length; i++) {
            if (!BlockChain.isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return false;
            }
        }
        return true;
    };
    ;
    // ブロックチェーンのブロック生成における難しさの合計を返す
    BlockChain.getAccumulatedDifficulty = function (aBlockchain) {
        return aBlockchain
            .map(function (block) { return block.difficulty; })
            .map(function (difficulty) { return Math.pow(2, difficulty); })
            .reduce(function (a, b) { return a + b; });
    };
    ////////////////////////////////////////
    // static
    ////////////////////////////////////////
    ////////////////////
    // ブロック生成の難しさ
    ////////////////////
    // ブロックがいくつ生成されたらディフィカルティを調整するか
    BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
    // 指定秒間に1ブロック生成されることを想定
    BlockChain.BLOCK_GENERATION_INTERVAL = 10;
    return BlockChain;
}());
exports.BlockChain = BlockChain;
