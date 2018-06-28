import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { BlockChainService } from '../../providers/block-chain.service';


@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.scss']
})
export class PeersComponent implements OnInit {

  peers: string[] = [];

  constructor(
    public changeDetectorRef: ChangeDetectorRef, 
    public blockChainService: BlockChainService
  ) {

   }

  ngOnInit() {
    this.blockChainService.peers$.subscribe(peers => {
      this.peers = peers;
      this.changeDetectorRef.detectChanges();
    })
  }

  addPeer(peer:string) {
    this.blockChainService.addPeer('localhost', peer);
  }

}
