import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subject, merge, BehaviorSubject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { UsersService } from 'app/main/users/users.service';
import { UsersUserFormDialogComponent } from 'app/main/users/user-form/user-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseUtils } from '@fuse/utils';
import { User } from '../user.model';

@Component({
    selector     : 'users-user-list',
    templateUrl  : './user-list.component.html',
    styleUrls    : ['./user-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class UsersUserListComponent implements OnInit, OnDestroy
{
    @ViewChild('dialogContent', {static: false})
    dialogContent: TemplateRef<any>;

    users: any;
    userData: any;
    dataSource: FilesDataSource | null;
    displayedColumns = ['checkbox', 'avatar', 'name', 'username', 'email', 'role', 'buttons'];
    selectedUsers: any[];
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
     * @param {UsersService} _usersService
     * @param {MatDialog} _matDialog
     */
    constructor(
        private _usersService: UsersService,
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
        this.dataSource = new FilesDataSource(this._usersService, this.paginator);

        this._usersService.onUsersChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(users => {
                this.users = users;

                this.checkboxes = {};
                users.map(user => {
                    this.checkboxes[user.id] = false;
                });
            });

        this._usersService.onSelectedUsersChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(selectedUsers => {
                for ( const id in this.checkboxes )
                {
                    if ( !this.checkboxes.hasOwnProperty(id) )
                    {
                        continue;
                    }
                    this.checkboxes[id] = selectedUsers.includes(id);
                }
                this.selectedUsers = selectedUsers;
            });

        this._usersService.onUserDataChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(user => {
                this.userData = user;
            });

        this._usersService.onFilterChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((filter) => {
                this._usersService.filterBy = filter;
                this._usersService.getRoles();
                this._usersService.getUsers();
                this._usersService.deselectUsers();
                this.dataSource.filter = filter;
            });

        this._usersService.onSearchTextChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((searchText) => {
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
     * Edit user
     *
     * @param user
     */
    editContact(user: User): void
    {
        this.dialogRef = this._matDialog.open(UsersUserFormDialogComponent, {
            panelClass: 'user-form-dialog',
            data      : {
                user,
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
                switch ( actionType )
                {
                    /**
                     * Delete
                     */
                    case 'delete':

                        this.deleteUser(user);

                        break;
                }
            });
    }

    /**
     * Delete User
     */
    deleteUser(user: User): void
    {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.beforeClose().subscribe(result => {
            if ( result )
            {
                this._usersService.deleteUser(user);
            }
            this.confirmDialogRef = null;
        });

    }

    /**
     * On selected change
     *
     * @param userId
     */
    onSelectedChange(userId: string): void
    {   
        this._usersService.toggleSelectedUser(userId.toString());
    }

    /**
     * Toggle star
     *
     * @param userId
     */
    // toggleStar(userId): void
    // {
    //     if ( this.userData.starred.includes(userId) )
    //     {
    //         this.userData.starred.splice(this.userData.starred.indexOf(userId), 1);
    //     }
    //     else
    //     {
    //         this.userData.starred.push(userId);
    //     }

    //     this._usersService.updateUserData(this.userData);
    // }
}

export class FilesDataSource extends DataSource<any>
{

    private _filterChange = new BehaviorSubject('');
    private _filterSearchTextChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');
    
    /**
     * Constructor
     *
     * @param {UsersService} _usersService
     */
    constructor(
        private _usersService: UsersService,
        private _matPaginator: MatPaginator
    )
    {
        super();

        this.filteredData = this._usersService.users;

    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {

        const displayDataChanges = [
            this._usersService.onUsersChanged,
            this._matPaginator.page,
            this._filterChange,
            this._filterSearchTextChange
        ];
        
        return merge(...displayDataChanges)
            .pipe(
                map(() => {

                    let data = this._usersService.users.slice();

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
