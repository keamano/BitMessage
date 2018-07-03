import { HomeComponent } from './components/home/home.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { BlocksComponent } from './components/blocks/blocks.component';
import { PeersComponent } from './components/peers/peers.component';


const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        children: [
            {
                path: 'home',
                component: HomeComponent
            }
        ]
    },
    {
        path: 'signup',
        component: SignUpComponent
    },
    {
        path: 'explore',
        component: BlocksComponent
    },
    {
        path: 'peer',
        component: PeersComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
