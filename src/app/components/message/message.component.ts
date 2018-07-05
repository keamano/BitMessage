import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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

  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) {
   }

   private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnInit() {
    // 自分の名前を取得する
    this.userService.me$.subscribe(name => {
      this.message.from = name;
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  // メッセージを送信する
  send() {
    this.message.date = new Date().toString();

    this.messageService.send(this.message);
  }

}
