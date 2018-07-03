import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { Subscription } from 'rxjs';

import { MessageService } from '../../providers/message.service';
import { Message } from '../../interfaces/message';
import { UserService } from '../../providers/user.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit, OnDestroy {

  // Data
  me: string = "";
  users: string[] = [];
  messages: Message[] = [];

  // Sub Data
  toMeMessageLenght: number;

  // Subscription
  meSubscription: Subscription;
  messageSubscription: Subscription;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private userSerivce: UserService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    this.meSubscription = this.userSerivce.me$.subscribe(me => {
      this.me = me;
      if (this.messageSubscription !== undefined) {
        return;
      }

      this.messageSubscription = this.messageService.messages$.subscribe(messages => {
        let toMeMessageLenght = 0;
        this.messages = messages.filter(message => {

          // ユーザーリストを更新
          if (this.me !== message.from && this.users.indexOf(message.from) < 0) {
            this.users.push(message.from);
          }
          if (this.me !== message.to && this.users.indexOf(message.to) < 0) {
            this.users.push(message.to);
          }

          let isToMeMessage = message.to === this.me;
          let isFromMeMessage = message.from === this.me;

          if (isToMeMessage) {
            toMeMessageLenght++;
          }

          // 自分へと自分からのメッセージのみ
          return isToMeMessage || isFromMeMessage;
          // 自分へのメッセージのみ
          // return isToMeMessage;
        });

        this.changeDetectorRef.detectChanges();

        if (toMeMessageLenght > 0 && toMeMessageLenght > this.toMeMessageLenght) {
          const lastMessage = this.messages[this.messages.length -1];

          // 現在時刻から１０秒以内のメッセージの場合、通知
          const nowTime = Date.parse((new Date().toString()));
          const lastTime = Date.parse(lastMessage.date);
          if (nowTime - lastTime > 0) {
            return;
          }

          this.messageService.nofity(lastMessage);
        }
        this.toMeMessageLenght = toMeMessageLenght;
      });
    });
  }

  ngOnDestroy(): void {
    this.meSubscription.unsubscribe();
    this.meSubscription.unsubscribe();
  }
}
