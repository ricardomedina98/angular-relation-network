import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { ProfileService } from 'app/main/contacts/profile/profile.service';
import { Contact } from 'app/main/contacts/contact.model';
import * as moment from 'moment';

@Component({
    selector     : 'profile-about',
    templateUrl  : './about.component.html',
    styleUrls    : ['./about.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ProfileAboutComponent implements OnInit, OnDestroy
{
    contact: Contact;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _profileService: ProfileService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._profileService.contactOnChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(contact => {
            this.contact = new Contact(contact);
        });
    }

    calculateDiff(): string {
        let date = moment().diff(moment(this.contact.timeMeet));
        let duration = moment.duration(date);

        if(duration.years() > 0) {
            return `${duration.years()} años ${duration.months()} meses`;
        } else {
            return `${duration.months()} meses`;
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
