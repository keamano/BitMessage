"use strict";
exports.__esModule = true;
var WebSocket = require("ws");
var block_1 = require("./block");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["QUERY_LATEST"] = 0] = "QUERY_LATEST";
    MessageType[MessageType["QUERY_ALL"] = 1] = "QUERY_ALL";
    MessageType[MessageType["RESPONSE_BLOCKCHAIN"] = 2] = "RESPONSE_BLOCKCHAIN";
})(MessageType || (MessageType = {}));
var Message = /** @class */ (function () {
    function Message() {
    }
    return Message;
}());
var P2P = /** @class */ (function () {
    function P2P() {
        this.sockets = [];
    }
    P2P.prototype.init = function (blockChain, callback) {
        this.blockChain = blockChain;
        this.callback = callback;
    };
    P2P.prototype.getSockets = function () {
        return this.sockets;
    };
    // WebSocket用のServerを初期化
    P2P.prototype.initP2PServer = function (p2pPort) {
        var _this = this;
        var server = new WebSocket.Server({ port: p2pPort });
        server.on('connection', function (ws) {
            _this.initConnection(ws);
        });
        console.log('listening websocket p2p port on: ' + p2pPort);
    };
    // WebSocketのコネクションを初期化
    P2P.prototype.initConnection = function (ws) {
        this.sockets.push(ws);
        this.callback(this.sockets);
        // ハンドラーの設定
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        // 接続元へ最新のブロックを返するように要求
        this.write(ws, this.queryChainLengthMsg());
    };
    ;
    // Jsonから指定の型へ変換
    P2P.prototype.JSONToObject = function (data) {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    };
    P2P.prototype.initMessageHandler = function (ws) {
        var _this = this;
        ws.on('message', function (data) {
            var message = _this.JSONToObject(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('Received message' + JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    // 最新のブロックの取得依頼があった
                    _this.write(ws, _this.responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    // 全てのブロックの取得依頼があった
                    _this.write(ws, _this.responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    // ブロックチェーンの返却があった
                    var receivedBlocks = _this.JSONToObject(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received:');
                        console.log(message.data);
                        break;
                    }
                    _this.handleBlockchainResponse(receivedBlocks);
                    break;
            }
        });
    };
    P2P.prototype.write = function (ws, message) {
        ws.send(JSON.stringify(message));
    };
    P2P.prototype.broadcast = function (message) {
        var _this = this;
        this.sockets.forEach(function (socket) { return _this.write(socket, message); });
    };
    P2P.prototype.queryChainLengthMsg = function () {
        return ({ 'type': MessageType.QUERY_LATEST, 'data': null });
    };
    P2P.prototype.queryAllMsg = function () {
        return ({ 'type': MessageType.QUERY_ALL, 'data': null });
    };
    P2P.prototype.responseChainMsg = function () {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify(this.blockChain.getBlockchain())
        });
    };
    P2P.prototype.responseLatestMsg = function () {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([this.blockChain.getLatestBlock()])
        });
    };
    P2P.prototype.initErrorHandler = function (ws) {
        var _this = this;
        var closeConnection = function (myWs) {
            console.log('connection failed to peer: ' + myWs.url);
            _this.sockets.splice(_this.sockets.indexOf(myWs), 1);
            _this.callback(_this.sockets);
        };
        ws.on('close', function () { return closeConnection(ws); });
        ws.on('error', function () { return closeConnection(ws); });
    };
    P2P.prototype.handleBlockchainResponse = function (receivedBlocks) {
        if (receivedBlocks.length === 0) {
            console.log('received block chain size of 0');
            return;
        }
        var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        if (!block_1.Block.isValidBlockStructure(latestBlockReceived)) {
            console.log('block structuture not valid');
            return;
        }
        var latestBlockHeld = this.blockChain.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            // 受信したブロックチェインの長さが保持しているブロックチェインの長さより多い
            console.log('blockchain possibly behind. We got: '
                + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                // ブロックが１つだけ多い
                if (this.blockChain.addBlockToChain(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            }
            else if (receivedBlocks.length === 1) {
                // 持っているブロックが0こ
                console.log('We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            }
            else {
                // ブロックが２つ以上多い
                console.log('Received blockchain is longer than current blockchain');
                this.blockChain.replaceChain(receivedBlocks);
            }
        }
        else {
            console.log('received blockchain is not longer than received blockchain. Do nothing');
        }
    };
    P2P.prototype.broadcastLatest = function () {
        this.broadcast(this.responseLatestMsg());
    };
    P2P.prototype.connectToPeers = function (newPeer) {
        var _this = this;
        var ws = new WebSocket(newPeer);
        ws.on('open', function () {
            _this.initConnection(ws);
        });
        ws.on('error', function () {
            console.log('connection failed');
        });
    };
    return P2P;
}());
exports.P2P = P2P;
