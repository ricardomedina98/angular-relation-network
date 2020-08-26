import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subject, merge, BehaviorSubject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ContactsService } from 'app/main/contacts/contacts.service';
import { ContactsContactFormDialogComponent } from 'app/main/contacts/contact-form/contact-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseUtils } from '@fuse/utils';
import { M } from '@angular/cdk/keycodes';
import { Contact } from '../contact.model';

@Component({
    selector     : 'contacts-contact-list',
    templateUrl  : './contact-list.component.html',
    styleUrls    : ['./contact-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ContactsContactListComponent implements OnInit, OnDestroy
{
    @ViewChild('dialogContent', {static: false})
    dialogContent: TemplateRef<any>;

    contacts: Contact[];
    user: any;
    dataSource: FilesDataSource | null;
    displayedColumns = ['checkbox', 'avatar', 'name', 'email', 'phone', 'typeRelationship', 'buttons'];
    selectedContacts: any[];
    checkboxes: {};
    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;


    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    @ViewChild(MatSort, {static: true})
    sort: MatSort;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService
     * @param {MatDialog} _matDialog
     */
    constructor(
        private _contactsService: ContactsService,
        public _matDialog: MatDialog
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
        this.dataSource = new FilesDataSource(this._contactsService, this.paginator);

        this._contactsService.onContactsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(contacts => {
                this.contacts = contacts;

                this.checkboxes = {};
                contacts.map(contact => {
                    this.checkboxes[contact.id] = false;
                });
            });

        this._contactsService.onSelectedContactsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(selectedContacts => {
                for ( const id in this.checkboxes )
                {
                    if ( !this.checkboxes.hasOwnProperty(id) )
                    {
                        continue;
                    }

                    this.checkboxes[id] = selectedContacts.includes(id);
                }
                this.selectedContacts = selectedContacts;
            });

        this._contactsService.onUserDataChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(user => {
                this.user = user;
            });

        this._contactsService.onFilterChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((filter) => {
                this._contactsService.deselectContacts();
                this._contactsService.getContacts();
                this.dataSource.filter = filter;
            });

        this._contactsService.onSearchTextChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((searchText) => {
                console.log(searchText);
                this.dataSource.filterSearchText = searchText;
            });
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Edit contact
     *
     * @param contact
     */
    editContact(contact): void
    {
        this.dialogRef = this._matDialog.open(ContactsContactFormDialogComponent, {
            panelClass: 'contact-form-dialog',
            data      : {
                contact: contact,
                action : 'edit'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(response => {
                if ( !response )
                {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];
                switch ( actionType )
                {
                    /**
                     * Save
                     */
                    case 'save':

                        this._contactsService.updateContact(formData.getRawValue());

                        break;
                    /**
                     * Delete
                     */
                    case 'delete':

                        this.deleteContact(contact);

                        break;
                }
            });
    }

    /**
     * Delete Contact
     */
    deleteContact(contact): void
    {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this._contactsService.deleteContact(contact);
            }
            this.confirmDialogRef = null;
        });

    }

    /**
     * On selected change
     *
     * @param contactId
     */
    onSelectedChange(contactId): void
    {
        this._contactsService.toggleSelectedContact(contactId);
    }

    /**
     * Toggle star
     *
     * @param contactId
     */
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

export class FilesDataSource extends DataSource<any>
{

    private _filterChange = new BehaviorSubject('');
    private _filterSearchTextChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');
    
    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService
     */
    constructor(
        private _contactsService: ContactsService,
        private _matPaginator: MatPaginator
    )
    {
        super();

        this.filteredData = this._contactsService.contacts;

    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {

        const displayDataChanges = [
            this._contactsService.onContactsChanged,
            this._matPaginator.page,
            this._filterChange,
            this._filterSearchTextChange
        ];
        
        return merge(...displayDataChanges)
            .pipe(
                map(() => {

                    let data = this._contactsService.contacts.slice();

                    data = this.filterDataText(data);

                    this.filteredData = [...data];

                    const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;

                    return data.splice(startIndex, this._matPaginator.pageSize);
                    
                }
            ));
    }

    // Filtered data
    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._matPaginator.firstPage();
        this._filterChange.next(filter);
    }

    // Filter Search Text
    get filterSearchText(): string
    {
        return this._filterSearchTextChange.value;
    }

    set filterSearchText(filter: string)
    {
        this._matPaginator.firstPage();
        this._filterSearchTextChange.next(filter);
    }


    filterDataText(data): any {

        if ( this.filterSearchText && this.filterSearchText !== '' ) {
            return FuseUtils.filterArrayByString(data, this.filterSearchText);
        }
        return data;
    }


    /**
     * Disconnect
     */
    disconnect(): void
    {
    }
}
