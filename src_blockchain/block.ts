import * as CryptoJS from 'crypto-js';
import { Util } from './util';

export class Block {
    constructor(

        // ブロックチェーン内のブロックのインデックス
        public index: number,

        // ブロックの内容から取ったsha256ハッシュ
        public hash: string,

        // 前のブロックのハッシュ
        public previousHash: string,

        // タイムスタンプ
        public timestamp: number,

        // ブロックに含まれるすべてのデータ
        public data: string,

        // ブロック生成の難しさ
        public difficulty: number,

        // ナンス
        // ハッシュ生成時に利用。先頭◯字0にするために必要となった数字
        public nonce: number
    ) { }

    ////////////////////////////////////////
    // static
    ////////////////////////////////////////

    // ジェネシスブロック
    // ブロックチェーンの最初のブロック
    static readonly GENESIS_BLOK: Block = new Block(
        0,
        '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627',
        '',
        1465154705,
        'my genesis block!!',
        0,
        0
    );

    /////////////////////////
    // ハッシュ関連
    /////////////////////////

    // ブロックハッシュを計算する
    // ブロック内の全てのデータから計算する
    static calculateHash(index: number, previousHash: string, timestamp: number, data: string,
        difficulty: number, nonce: number): string {
        return CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();
    }

    // ブロックからブロックのハッシュを計算
    static calculateHashForBlock(block: Block): string {
        return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);
    }

    /////////////////////////
    // Proof of Work
    /////////////////////////

    static findBlock(index: number, previousHash: string, timestamp: number, data: string, difficulty: number): Block {
        let nonce = 0;
        while (true) {
            const hash: string = this.calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
            if (this.hashMatchesDifficulty(hash, difficulty)) {
                return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
            }
            nonce++;
        }
    }

    /////////////////////////
    // ブロックの検証
    /////////////////////////

    // ブロックの構造が正しいか
    static isValidBlockStructure(block: Block): boolean {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
            && typeof block.data === 'string';
    }

    // ブロックのハッシュ関連が正しいか
    static hasValidHash(block: Block): boolean {

        if (!this.hashMatchesBlockContent(block)) {
            console.log('invalid hash, got:' + block.hash);
            return false;
        }

        if (!this.hashMatchesDifficulty(block.hash, block.difficulty)) {
            console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
        }
        return true;
    }

    // ブロックのハッシュが正しいか
    static hashMatchesBlockContent(block: Block): boolean {
        const blockHash: string = Block.calculateHashForBlock(block);
        return blockHash === block.hash;
    }

    // ハッシュがブロック生成の難しさの指定に則っているか
    static hashMatchesDifficulty(hash: string, difficulty: number): boolean {
        const hashInBinary: string = Util.hexToBinary(hash);
        // const requiredPrefix: string = '0'.repeat(difficulty);
        // return hashInBinary.startsWith(requiredPrefix);

        let equiredPrefix: string = '';
        for (let i = 0; i < difficulty; i++) {
            equiredPrefix += '0';
        }
        return (hashInBinary.indexOf(equiredPrefix) == 0);
    }
}