import { Component, OnInit } from '@angular/core';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../providers/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  userName: string;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService.me$.subscribe(me => {
      if (me.length > 0) {
        this.ngZone.run(() => {
          this.router.navigate(['/home']);
        });
      }
    });
  }

  signUp() {
    this.userService.signUp(this.userName);
  }

}
