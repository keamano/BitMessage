import * as WebSocket from 'ws';
import { Server } from 'ws';

import { Block } from './block';
import { BlockChain } from './blockchain';

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
}

class Message {
    public type: MessageType;
    public data: any;
}

export class P2P {
    private sockets: WebSocket[] = [];

    private blockChain: BlockChain;

    public init(blockChain: BlockChain) {
        this.blockChain = blockChain;
    }

    public getSockets() {
        return this.sockets;
    }

    // WebSocket用のServerを初期化
    public initP2PServer(p2pPort: number) {
        const server: Server = new WebSocket.Server({ port: p2pPort });
        server.on('connection', (ws: WebSocket) => {
            this.initConnection(ws);
        });
        console.log('listening websocket p2p port on: ' + p2pPort);
    }

    // WebSocketのコネクションを初期化
    private initConnection(ws: WebSocket) {
        this.sockets.push(ws);

        // ハンドラーの設定
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);

        // 接続元へ最新のブロックを返するように要求
        this.write(ws, this.queryChainLengthMsg());
    };

    // Jsonから指定の型へ変換
    private JSONToObject<T>(data: string): T {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    initMessageHandler(ws: WebSocket) {
        ws.on('message', (data: string) => {
            const message: Message = this.JSONToObject<Message>(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('Received message' + JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    // 最新のブロックの取得依頼があった
                    this.write(ws, this.responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    // 全てのブロックの取得依頼があった
                    this.write(ws, this.responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    // ブロックチェーンの返却があった
                    const receivedBlocks: Block[] = this.JSONToObject<Block[]>(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received:');
                        console.log(message.data)
                        break;
                    }
                    this.handleBlockchainResponse(receivedBlocks);
                    break;
            }
        });
    }

    write(ws: WebSocket, message: Message): void {
        ws.send(JSON.stringify(message));
    }

    broadcast(message: Message): void {
        this.sockets.forEach((socket) => this.write(socket, message));
    }

    queryChainLengthMsg(): Message {
        return ({ 'type': MessageType.QUERY_LATEST, 'data': null });
    }

    queryAllMsg(): Message {
        return ({ 'type': MessageType.QUERY_ALL, 'data': null });
    }

    responseChainMsg(): Message {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify(this.blockChain.getBlockchain())
        });
    }

    responseLatestMsg(): Message {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([this.blockChain.getLatestBlock()])
        });
    }

    initErrorHandler(ws: WebSocket) {
        const closeConnection = (myWs: WebSocket) => {
            console.log('connection failed to peer: ' + myWs.url);
            this.sockets.splice(this.sockets.indexOf(myWs), 1);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    }

    handleBlockchainResponse (receivedBlocks: Block[]) {
        if (receivedBlocks.length === 0) {
            console.log('received block chain size of 0');
            return;
        }
        const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
        if (!Block.isValidBlockStructure(latestBlockReceived)) {
            console.log('block structuture not valid');
            return;
        }
        const latestBlockHeld: Block = this.blockChain.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            // 受信したブロックチェインの長さが保持しているブロックチェインの長さより多い
            console.log('blockchain possibly behind. We got: '
                + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                // ブロックが１つだけ多い
                if (this.blockChain.addBlockToChain(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            } else if (receivedBlocks.length === 1) {
                // 持っているブロックが0こ
                console.log('We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            } else {
                // ブロックが２つ以上多い
                console.log('Received blockchain is longer than current blockchain');
                this.blockChain.replaceChain(receivedBlocks);
            }
        } else {
            console.log('received blockchain is not longer than received blockchain. Do nothing');
        }
    }

    broadcastLatest (): void {
        this.broadcast(this.responseLatestMsg());
    }
    
    connectToPeers (newPeer: string): void {
        const ws: WebSocket = new WebSocket(newPeer);
        ws.on('open', () => {
            this.initConnection(ws);
        });
        ws.on('error', () => {
            console.log('connection failed');
        });
    }
    




}