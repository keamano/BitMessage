import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import {MatSnackBar} from '@angular/material';

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

  usersControl = new FormControl();
  users: string[] = [];
  usersFilteredOptions: Observable<string[]>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public snackBar: MatSnackBar,
    private userService: UserService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    // 自分の名前を取得する
    this.userService.me$.subscribe(name => {
      this.message.from = name;
    });

    // 友達の名前を取得する
    this.userService.users$.subscribe(users => {
      this.users = users;
      this.changeDetectorRef.detectChanges();
    });

    this.usersFilteredOptions = this.usersControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(user => user.toLowerCase().includes(filterValue));
  }

  // メッセージを送信する
  send() {
    this.message.date = new Date().toString();
    this.message.to = this.usersControl.value;

    if (
      this.message.to == "" || this.message.text == "" ||
      this.message.card == 0 || this.message.font == 0
    ) {
      let snackMessage = "メッセージを送ることができませんでした。";
      this.snackBar.open(snackMessage, null, {
        duration: 2000,
      });
    } else {
      this.messageService.send(this.message);
    }

  }

}
