import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { UserService } from '../../providers/user.service';
import { MessageService } from '../../providers/message.service';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  myForm: FormGroup;

  public message: Message = {
    from: "",
    to: "",
    text: "",
    card: 0,
    font: 0,
    date: 0
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
    this.message.date = new Date().getTime() / 1000;
    this.messageService.send(this.message);
  }

}
