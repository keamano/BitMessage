export interface Block {

    // ブロックチェーン内のブロックのインデックス
    index: number;

    // ブロックの内容から取ったsha256ハッシュ
    hash: string;

    // 前のブロックのハッシュ
    previousHash: string;

    // タイムスタンプ
    timestamp: number;

    // ブロックに含まれるすべてのデータ
    data: string;

    // ブロック生成の難しさ
    difficulty: number;

    // ナンス
    // ハッシュ生成時に利用。先頭◯字0にするために必要となった数字
    nonce: number
}
