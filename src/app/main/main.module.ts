import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { AuthGuard } from 'app/guards/auth.guard';

const routes: Routes = [
    {
        path: 'dashboard',
        canActivate: [AuthGuard],
        children: [
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            },
            {
                path: 'home',
                loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
            },
            {
                path: 'contacts',
                loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule)
            }

        ]
    }

];

@NgModule({
    imports     : [
        RouterModule.forChild(routes),
        FuseSharedModule
    ]
})
export class MainModule
{
}
