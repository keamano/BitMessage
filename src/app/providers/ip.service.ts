import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpService {

  private ipSubject = new BehaviorSubject<string[]>([]);
  ip$: Observable<string[]> = this.ipSubject.asObservable();

  constructor(private electronService: ElectronService) { 
    this.electronService.ipcRenderer.on("/onIP", (event, args) => {
      this.ipSubject.next(args);
    });

    this.ip();
  }

  ip() {
    this.electronService.ipcRenderer.send("/ip");
  }
}
