import { Block } from './block';
import { Util } from './util';
import { P2P } from './p2p';


export class BlockChain {

    ////////////////////////////////////////
    // private
    ////////////////////////////////////////

    // ブロックチェーンの格納
    private blockchain: Block[] = [Block.GENESIS_BLOK];

    private addBlock(newBlock: Block) {
        if (BlockChain.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
        }
    }

    ////////////////////////////////////////
    // public
    ////////////////////////////////////////

    private p2p: P2P;

    public init(p2p: P2P): void {
        this.p2p = p2p;
    }

    // ブロックチェーンを返す
    public getBlockchain(): Block[] {
        return this.blockchain;
    }

    // 最新のブロックを返す
    public getLatestBlock(): Block {
        return this.blockchain[this.blockchain.length - 1];
    }

    // 次のブロックを生成し、ブロックチェーンに追加する
    public generateNextBlock(blockData: string) {

        // 前のブロック(現在の最新ブロック)から
        const previousBlock: Block = this.getLatestBlock();
        const nextIndex: number = previousBlock.index + 1;
        const nextPreviousBlockHash: string = previousBlock.hash;
        // タイムスタンプは現在時刻
        const nextTimestamp: number = Util.getCurrentTimestamp();
        // ブロックのデータ
        // blockData = blockData;
        // ブロック生成に置ける難しさ
        const difficulty: number = BlockChain.getDifficulty(this.getBlockchain());
        console.log('difficulty: ' + difficulty);
        // ブロックのハッシュ
        // ここでは計算しない

        // ブロックを生成し、ブロックチェーンに追加する
        const newBlock: Block = Block.findBlock(nextIndex, nextPreviousBlockHash, nextTimestamp, blockData, difficulty);
        this.addBlock(newBlock);

        this.p2p.broadcastLatest();

        return newBlock;
    }

    // ブロックをブロックチェーンへ追加する
    public addBlockToChain(newBlock: Block) {
        if (BlockChain.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
            return true;
        }
        return false;
    }

    // ブロックチェーンを置き換える
    public replaceChain(newBlocks: Block[]) {
        if (BlockChain.isValidChain(newBlocks) &&
            BlockChain.getAccumulatedDifficulty(newBlocks) > BlockChain.getAccumulatedDifficulty(this.getBlockchain())) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain = newBlocks;
            this.p2p.broadcastLatest();
        } else {
            console.log('Received blockchain invalid');
        }
    }

    ////////////////////////////////////////
    // static
    ////////////////////////////////////////

    ////////////////////
    // ブロック生成の難しさ
    ////////////////////

    // ブロックがいくつ生成されたらディフィカルティを調整するか
    private static readonly DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

    // 指定秒間に1ブロック生成されることを想定
    private static readonly BLOCK_GENERATION_INTERVAL: number = 10;

    // ブロック生成の難しさを返す
    private static getDifficulty(aBlockchain: Block[]): number {
        const latestBlock: Block = aBlockchain[aBlockchain.length - 1];
        if (
            latestBlock.index % BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
            latestBlock.index !== 0
        ) {
            // ブロックの指定の間隔でブロック生成に置ける難しさを調整
            return this.getAdjustedDifficulty(latestBlock, aBlockchain);
        } else {
            // その他は最新のブロックの難しさを引き継ぐ
            return latestBlock.difficulty;
        }
    }

    // ブロック生成の難しさを調整する
    private static getAdjustedDifficulty(latestBlock: Block, aBlockchain: Block[]): number {
        const prevAdjustmentBlock: Block = aBlockchain[aBlockchain.length - BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL];
        const timeExpected: number = BlockChain.BLOCK_GENERATION_INTERVAL * BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL;
        const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
        if (timeTaken < timeExpected / 2) {
            return prevAdjustmentBlock.difficulty + 1;
        } else if (timeTaken > timeExpected * 2) {
            return prevAdjustmentBlock.difficulty - 1;
        } else {
            return prevAdjustmentBlock.difficulty;
        }
    }

    ////////////////////
    // 新しいブロックの検証
    ////////////////////

    private static isValidNewBlock(newBlock: Block, previousBlock: Block): boolean {
        if (!Block.isValidBlockStructure(newBlock)) {
            console.log('invalid structure');
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (!this.isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        } else if (!Block.hasValidHash(newBlock)) {
            return false;
        }
        return true;
    }

    // タイムスタンプが前のブロックより１分以内なら過去でも良い
    // タイムスタンプが現在時刻より１分以内なら未来でも良い
    static isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
        return (previousBlock.timestamp - 60 < newBlock.timestamp)
            && newBlock.timestamp - 60 < Util.getCurrentTimestamp();
    }

    ////////////////////
    // ブロックチェーン関連
    ////////////////////

    // ブロックチェーンの検証
    private static isValidChain(blockchainToValidate: Block[]): boolean {
        const isValidGenesis = (block: Block): boolean => {
            return JSON.stringify(block) === JSON.stringify(Block.GENESIS_BLOK);
        };

        if (!isValidGenesis(blockchainToValidate[0])) {
            return false;
        }

        for (let i = 1; i < blockchainToValidate.length; i++) {
            if (!BlockChain.isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return false;
            }
        }
        return true;
    };

    // ブロックチェーンのブロック生成における難しさの合計を返す
    private static getAccumulatedDifficulty(aBlockchain: Block[]): number {
        return aBlockchain
            .map((block) => block.difficulty)
            .map((difficulty) => Math.pow(2, difficulty))
            .reduce((a, b) => a + b);
    }

}
