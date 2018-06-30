import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { BlockChainService } from './block-chain.service';
import { Message } from '../interfaces/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // メッセージリストのObservable
  messages$: Observable<Message[]> = this.blockChainService.blocks$.pipe(
    map(blocks =>
      blocks
        .map(block => {
          let data = {};
          try {
            data = JSON.parse(block.data);
          } catch (e) {
            data = null;
          }
          return data;
        })
        .filter(block => block !== null)
        .map(block => <Message>block)
    )
  );

  // コンストラクタ
  constructor(
    private blockChainService: BlockChainService
  ) {

  }

  // メッセージを送信する
  send(message: Message) {
    const data = JSON.stringify(message);
    this.blockChainService.mineBlock(data);
  }

}
