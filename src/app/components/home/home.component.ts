import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private electronService: ElectronService ) { }

  ngOnInit() {
    // this.electronService.ipcRenderer.on("/blocks", (event, args) => {
    //   console.log(args);
    // });
    // this.electronService.ipcRenderer.on("/mineBlock", (event, args) => {
    //   console.log(args);
    // });
    // this.electronService.ipcRenderer.on("/peers", (event, args) => {
    //   console.log(args);
    // });
    // this.electronService.ipcRenderer.on("/addPeer", (event, args) => {
    //   console.log(args);
    // });
  }

  blocks() {
    const blocks = this.electronService.ipcRenderer.sendSync("/blocks");
    console.log(blocks);
  }

  mineBlock(data: String) {
    this.electronService.ipcRenderer.sendSync("/mineBlock", data);
  }

  peers() {
    const peers = this.electronService.ipcRenderer.sendSync("/peers");
    console.log(peers);
  }

  addPeer(ip: string, port: string) {
    this.electronService.ipcRenderer.sendSync("/addPeer", `${ip}:${port}`);
  }

}
