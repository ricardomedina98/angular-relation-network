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

import { ContactsComponent } from 'app/main/contacts/contacts.component';
import { ContactsService } from 'app/main/contacts/contacts.service';
import { ContactsContactListComponent } from 'app/main/contacts/contact-list/contact-list.component';
import { ContactsSelectedBarComponent } from 'app/main/contacts/selected-bar/selected-bar.component';
import { ContactsMainSidebarComponent } from 'app/main/contacts/sidebars/main/main.component';
import { ContactsContactFormDialogComponent } from 'app/main/contacts/contact-form/contact-form.component';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { ProfileService } from './profile/profile.service';
import { ProfileComponent } from './profile/profile.component';
import { ProfileAboutComponent } from './profile/tabs/about/about.component';
import { ProfileEditComponent } from "./profile/tabs/edit/edit.component";

const routes: Routes = [
    {
        path     : '',
        component: ContactsComponent,
        resolve  : {
            contacts: ContactsService
        }
    },
    {
        path     : 'profile/:id',
        component: ProfileComponent,
        resolve  : {
            profile: ProfileService
        }
    }
];

@NgModule({
    declarations   : [
        ContactsComponent,
        ContactsContactListComponent,
        ContactsSelectedBarComponent,
        ContactsMainSidebarComponent,
        ContactsContactFormDialogComponent,


        ProfileComponent,
        ProfileAboutComponent,
        ProfileEditComponent
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
        MatDividerModule,
        MomentDateModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTabsModule,

        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseSidebarModule
    ],
    providers      : [
        ContactsService,
        ProfileService
    ],
    entryComponents: [
        ContactsContactFormDialogComponent
    ]
})
export class ContactsModule
{
}
