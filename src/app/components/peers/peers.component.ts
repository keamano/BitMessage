import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { ElectronService } from '../../providers/electron.service'
import { IpService } from '../../providers/ip.service';
import { BlockChainService } from '../../providers/block-chain.service';


@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.scss']
})
export class PeersComponent implements OnInit {

  ips: string[] = [];
  peers: string[] = [];

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public electronService: ElectronService,
    public ipService: IpService,
    public blockChainService: BlockChainService
  ) {
  }

  ngOnInit() {

    // IP
    this.ipService.ip$.subscribe(ips => {
      this.ips = ips;
      this.changeDetectorRef.detectChanges();
    });

    // Peer
    this.blockChainService.peers$.subscribe(peers => {
      this.peers = peers;
      this.changeDetectorRef.detectChanges();
    });
  }

  // IP
  ipToClipboard(ip: string) {
    this.electronService.clipboard.writeText(ip);
  }

  // Peer
  addPeer(hostname: string, port: string) {
    this.blockChainService.addPeer(hostname, port);
  }

}
