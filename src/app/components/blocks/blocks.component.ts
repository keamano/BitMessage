import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { BlockChainService } from '../../providers/block-chain.service';
import { Block } from '../../providers/block';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnInit {
  blocks: Block[] = [];

  constructor(
    public changeDetectorRef: ChangeDetectorRef, 
    public blockChainService: BlockChainService
  ) {
   }

  ngOnInit() {
      this.blockChainService.blocks$.subscribe(blocks => {
      this.blocks = blocks;
      this.changeDetectorRef.detectChanges();
    })
  }

  mineBlock(data: String) {
    this.blockChainService.mineBlock(data);
  }

}
