"use strict";
exports.__esModule = true;
var CryptoJS = require("crypto-js");
var util_1 = require("./util");
var Block = /** @class */ (function () {
    function Block(
    // ブロックチェーン内のブロックのインデックス
    index, 
    // ブロックの内容から取ったsha256ハッシュ
    hash, 
    // 前のブロックのハッシュ
    previousHash, 
    // タイムスタンプ
    timestamp, 
    // ブロックに含まれるすべてのデータ
    data, 
    // ブロック生成の難しさ
    difficulty, 
    // ナンス
    // ハッシュ生成時に利用。先頭◯字0にするために必要となった数字
    nonce) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
    /////////////////////////
    // ハッシュ関連
    /////////////////////////
    // ブロックハッシュを計算する
    // ブロック内の全てのデータから計算する
    Block.calculateHash = function (index, previousHash, timestamp, data, difficulty, nonce) {
        return CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();
    };
    // ブロックからブロックのハッシュを計算
    Block.calculateHashForBlock = function (block) {
        return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);
    };
    /////////////////////////
    // Proof of Work
    /////////////////////////
    Block.findBlock = function (index, previousHash, timestamp, data, difficulty) {
        var nonce = 0;
        while (true) {
            var hash = this.calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
            if (this.hashMatchesDifficulty(hash, difficulty)) {
                return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
            }
            nonce++;
        }
    };
    /////////////////////////
    // ブロックの検証
    /////////////////////////
    // ブロックの構造が正しいか
    Block.isValidBlockStructure = function (block) {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
            && typeof block.data === 'string';
    };
    // ブロックのハッシュ関連が正しいか
    Block.hasValidHash = function (block) {
        if (!this.hashMatchesBlockContent(block)) {
            console.log('invalid hash, got:' + block.hash);
            return false;
        }
        if (!this.hashMatchesDifficulty(block.hash, block.difficulty)) {
            console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
        }
        return true;
    };
    // ブロックのハッシュが正しいか
    Block.hashMatchesBlockContent = function (block) {
        var blockHash = Block.calculateHashForBlock(block);
        return blockHash === block.hash;
    };
    // ハッシュがブロック生成の難しさの指定に則っているか
    Block.hashMatchesDifficulty = function (hash, difficulty) {
        var hashInBinary = util_1.Util.hexToBinary(hash);
        // const requiredPrefix: string = '0'.repeat(difficulty);
        // return hashInBinary.startsWith(requiredPrefix);
        console.log(hashInBinary);
        var equiredPrefix = '';
        for (var i = 0; i < difficulty; i++) {
            equiredPrefix += '0';
        }
        return (hashInBinary.indexOf(equiredPrefix) == 0);
    };
    ////////////////////////////////////////
    // static
    ////////////////////////////////////////
    // ジェネシスブロック
    // ブロックチェーンの最初のブロック
    Block.GENESIS_BLOK = new Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, 'my genesis block!!', 0, 0);
    return Block;
}());
exports.Block = Block;
