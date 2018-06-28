import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Block } from './block';

@Injectable({
  providedIn: 'root'
})
export class BlockChainService {

  private blocksSubject = new BehaviorSubject<Block[]>([]);
  blocks$: Observable<Block[]> = this.blocksSubject.asObservable();

  private peersSubject = new BehaviorSubject<string[]>([]);
  peers$: Observable<string[]> = this.peersSubject.asObservable();

  // private blocksSubject = new Subject<Block[]>();
  // blocks$: Observable<Block[]> = this.blocksSubject.asObservable();

  // private peersSubject = new Subject<string[]>();
  // peers$: Observable<string[]> = this.peersSubject.asObservable();

  constructor(private electronService: ElectronService) {

    this.electronService.ipcRenderer.on("/onBlocks", (event, args) => {
      this.blocksSubject.next(args);
    });

    this.electronService.ipcRenderer.on("/onPeers", (event, args) => {
      this.peersSubject.next(args);
    });

    this.blocks();
    this.peers();
  }

  blocks() {
    // const blocks = this.electronService.ipcRenderer.sendSync("/blocks");
    // this.blocksSubject.next(blocks);
    this.electronService.ipcRenderer.send("/blocks");
  }

  mineBlock(data: String) {
    this.electronService.ipcRenderer.send("/mineBlock", data);
  }

  peers() {
    // const peers = this.electronService.ipcRenderer.sendSync("/peers");
    // this.peersSubject.next(peers);
    this.electronService.ipcRenderer.send("/peers");
  }

  addPeer(ip: string, port: string) {
    this.electronService.ipcRenderer.send("/addPeer", `ws://${ip}:${port}`);
  }
}
