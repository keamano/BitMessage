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

  // Subscription
  meSubscription : Subscription;
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
        this.messages = messages.filter(message => {
          
          // ユーザーリストを更新
          if (this.me !== message.from && this.users.indexOf(message.from) < 0) {
            this.users.push(message.from);
          }
          if (this.me !== message.to && this.users.indexOf(message.to) < 0) {
            this.users.push(message.to);
          }

          // 自分へと自分からのメッセージのみ
          return (message.to === this.me || message.from === this.me);
          // 自分へのメッセージのみ
          // return (message.to === this.me);
        });
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  ngOnDestroy(): void {
    this.meSubscription.unsubscribe();
    this.meSubscription.unsubscribe();
  }
}
