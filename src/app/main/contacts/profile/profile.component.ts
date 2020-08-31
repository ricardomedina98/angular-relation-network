import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';
import { ProfileService } from './profile.service';
import { Contact } from '../contact.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContactsService } from '../contacts.service';

@Component({
    selector     : 'profile',
    templateUrl  : './profile.component.html',
    styleUrls    : ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ProfileComponent implements OnInit, OnDestroy
{
    pageType: string;
    contact: Contact;
    newContact: Contact;
    user: any;

    // Private
    private _unsubscribeAll: Subject<any>;


    constructor( 
        private _profileService: ProfileService,
        private _contactsService: ContactsService,
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }


    ngOnInit() {
        this._profileService.contactOnChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(contact => {
            if(contact) {
                this.pageType = 'edit';
                this.contact = new Contact(contact);
            } else {
                this.pageType = 'new';
                this.contact = new Contact();
            }
        });

        this._profileService.newContactOnChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(contact => {
            this.newContact = new Contact(contact);
        });

        this._contactsService.onUserDataChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(user => {
            this.user = user;
        });
    }

    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleStar(id_contact: number): void {

        if ( this.user.starredContacts.includes(id_contact) )
        {
            this._contactsService.unToggleStar(id_contact);
        }
        else
        {
            this._contactsService.toggleStar(id_contact);
        }
        
    }
}
