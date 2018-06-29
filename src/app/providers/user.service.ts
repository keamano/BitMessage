import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private meSubject = new BehaviorSubject<string>('');
  me$: Observable<string> = this.meSubject.asObservable();
  
  constructor(private electronService: ElectronService) {

    this.electronService.ipcRenderer.on("/onMe", (event, args) => {
      this.meSubject.next(args);
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
