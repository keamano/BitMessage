import { Component, OnInit } from '@angular/core';

import { UserService } from '../../providers/user.service';
import { MessageService } from '../../providers/message.service';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  readonly FONTS = Array(7);
  readonly CARDS = Array(30);

  message: Message = {
    from: "",
    to: "",
    text: "",
    card: 0,
    font: 0,
    date: ""
  };

  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // 自分の名前を取得する
    this.userService.me$.subscribe(name => {
      this.message.from = name;
    });
  }

  // メッセージを送信する
  send() {
    this.message.date = new Date().toString();

    this.messageService.send(this.message);
  }

}
