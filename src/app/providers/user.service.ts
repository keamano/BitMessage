import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

import { ElectronService } from './electron.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private meSubject = new BehaviorSubject<string>('');
  me$: Observable<string> = this.meSubject.asObservable();

  private usersSubject = new BehaviorSubject<string[]>([]);
  users$: Observable<string[]> = this.usersSubject.asObservable();

  constructor(
    private electronService: ElectronService,
    private messageService: MessageService
  ) {

    this.electronService.ipcRenderer.on("/onMe", (event, args) => {
      const name = args;
      this.meSubject.next(name);
    });

    this.messageService.messages$.subscribe(messages => {
      let users: string[] = [];
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].from && users.indexOf(messages[i].from) == -1) {
          users.push(messages[i].from);
        }
        if (messages[i].to && users.indexOf(messages[i].to) == -1) {
          users.push(messages[i].to);
        }
      }

      this.usersSubject.next(users);
    });

    this.me();
  }

  me() {
    this.electronService.ipcRenderer.send("/me");
  }

  signUp(name: string) {
    this.electronService.ipcRenderer.send("/signUp", name);
  }

}
