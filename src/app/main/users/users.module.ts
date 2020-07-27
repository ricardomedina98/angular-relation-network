import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseSidebarModule } from '@fuse/components';
import { MatPaginatorModule } from '@angular/material/paginator';

import { UsersComponent } from 'app/main/users/users.component';
import { UsersService } from 'app/main/users/users.service';
import { UsersUserListComponent } from 'app/main/users/user-list/user-list.component';
import { UsersSelectedBarComponent } from 'app/main/users/selected-bar/selected-bar.component';
import { UsersMainSidebarComponent } from 'app/main/users/sidebars/main/main.component';
import { UsersUserFormDialogComponent } from 'app/main/users/user-form/user-form.component';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Routes = [
    {
        path     : '**',
        component: UsersComponent,
        resolve  : {
            users: UsersService
        }
    }
];

@NgModule({
    declarations   : [
        UsersComponent,
        UsersUserListComponent,
        UsersSelectedBarComponent,
        UsersMainSidebarComponent,
        UsersUserFormDialogComponent
    ],
    imports        : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTableModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatSortModule,
        MatSelectModule,
        MatSnackBarModule,

        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseSidebarModule
    ],
    providers      : [
        UsersService
    ],
    entryComponents: [
        UsersUserFormDialogComponent
    ]
})
export class UsersModule
{
}
