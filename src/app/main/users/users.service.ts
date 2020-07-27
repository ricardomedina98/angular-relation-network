import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'environments/environment';

import { User, Role } from 'app/main/users/user.model';
import { AuthenticationService } from 'app/services/authentification.service';


export enum ERoles {
    MASTER = "MASTER",
    ADMIN = "ADMIN",
    STUDENT = "STUDENT"
}
@Injectable()
export class UsersService implements Resolve<any>
{
    onUsersChanged: BehaviorSubject<any>;
    onSelectedUsersChanged: BehaviorSubject<any>;
    onUserDataChanged: BehaviorSubject<any>;
    onSearchTextChanged: Subject<any>;
    onFilterChanged: Subject<any>;

    users: User[];
    roles: Role[];
    user: User;
    selectedUsers: string[] = [];

    searchText: string;
    filterBy: string;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthenticationService
    )
    {
        // Set the defaults
        this.onUsersChanged = new BehaviorSubject([]);
        this.onSelectedUsersChanged = new BehaviorSubject([]);
        this.onUserDataChanged = new BehaviorSubject([]);
        this.onSearchTextChanged = new Subject();
        this.onFilterChanged = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getRoles(),
                this.getUserData(),
                this.getUsers(),
            ]).then(
                ([files]) => {

                    // this.onFilterChanged.subscribe(filter => {
                    //     this.filterBy = filter;
                    //     this.getRoles();
                    //     this.getUsers();
                    // });

                    resolve();

                },
                reject
            );
        });
    }

    /**
     * Get users
     *
     * @returns {Promise<any>}
     */
    getUsers(): Promise<any>
    {
        return new Promise((resolve, reject) => {
                this._httpClient.get(`${environment.api_url}/users`)
                    .subscribe((response: any) => {

                        this.users = response;

                        if ( this.filterBy === ERoles.MASTER )
                        {
                            let role = this.roles.find(role => {
                                return role.name === ERoles.MASTER
                            });

                            this.users = role.users;
                        }

                        if ( this.filterBy === ERoles.ADMIN )
                        {
                            let role = this.roles.find(role => {
                                return role.name === ERoles.ADMIN
                            });

                            this.users = role.users;
                        }

                        if ( this.filterBy === ERoles.STUDENT )
                        {
                            let role = this.roles.find(role => {
                                return role.name === ERoles.STUDENT
                            });

                            this.users = role.users;
                        }

                        //Exclude current user logged
                        this.users = this.users.filter(user => {
                            return user.id !== this._authService.currentUserValue.id_user;
                        });

                        this.users = this.users.map(user => {
                            return new User(user);
                        });

                        this.onUsersChanged.next(this.users);
                        resolve(this.users);
                    }, reject);
            }
        );
    }

    /**
     * Get user data
     *
     * @returns {Promise<any>}
     */
    getUserData(): Promise<any>
    {
        return new Promise((resolve, reject) => {
                this._httpClient.get(`${environment.api_url}/users/${this._authService.currentUserValue.id_user}`)
                    .subscribe((response: any) => {
                        this.user = new User(response);
                        this.onUserDataChanged.next(this.user);
                        resolve(this.user);
                    }, reject);
            }
        );
    }

    /**
     * Get roles
     *
     * @returns {Promise<any>}
     */
    getRoles(): Promise<any>
    {
        return new Promise((resolve, reject) => {
                this._httpClient.get(`${environment.api_url}/roles/users`)
                    .subscribe((response: any) => {
                        this.roles = response.map(role => {

                            let users = role.users.map(user => {
                                return new User(user);
                            });
                            
                            return new Role({
                                name: role.name,
                                description: role.description,
                                users
                            });
                        });
                        
                        resolve(this.roles);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected contact by id
     *
     * @param id
     */
    toggleSelectedUser(id): void
    {
        // First, check if we already have that contact as selected...
        if ( this.selectedUsers.length > 0 )
        {
            const index = this.selectedUsers.indexOf(id);

            if ( index !== -1 )
            {
                this.selectedUsers.splice(index, 1);

                // Trigger the next event
                this.onSelectedUsersChanged.next(this.selectedUsers);

                // Return
                return;
            }
        }

        // If we don't have it, push as selected
        this.selectedUsers.push(id);

        // Trigger the next event
        this.onSelectedUsersChanged.next(this.selectedUsers);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll(): void
    {
        if ( this.selectedUsers.length > 0 )
        {
            this.deselectUsers();
        }
        else
        {
            this.selectUsers();
        }
    }

    /**
     * Select users
     *
     * @param filterParameter
     * @param filterValue
     */
    selectUsers(filterParameter?, filterValue?): void
    {
        this.selectedUsers = [];

        // If there is no filter, select all users
        if ( filterParameter === undefined || filterValue === undefined )
        {
            this.selectedUsers = [];
            this.users.map(user => {
                this.selectedUsers.push(user.id.toString());
            });
        }

        // Trigger the next event
        this.onSelectedUsersChanged.next(this.selectedUsers);
    }

    /**
     * Update user
     *
     * @param user
     * @returns {Promise<any>}
     */
    updateUser(user: User): Promise<any>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.put(`${ environment.api_url }/users/${ user.id }`, {...user})
                .subscribe(async response => {
                    await this.getRoles();
                    await this.getUsers();
                    resolve(response);
                }, reject);

        });
    }

    addUser(user: User): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${ environment.api_url }/users`, {...user})
                .subscribe(async response => {
                    await this.getRoles();
                    await this.getUsers();
                    resolve(response);
                }, reject);
        });
    }

    // /**
    //  * Update user data
    //  *
    //  * @param userData
    //  * @returns {Promise<any>}
    //  */
    // updateUserData(userData): Promise<any>
    // {
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.post('api/users-user/' + this.user.id, {...userData})
    //             .subscribe(response => {
    //                 this.getUserData();
    //                 this.getUsers();
    //                 resolve(response);
    //             });
    //     });
    // }

    /**
     * Deselect users
     */
    deselectUsers(): void
    {
        this.selectedUsers = [];

        // Trigger the next event
        this.onSelectedUsersChanged.next(this.selectedUsers);
    }

    /**
     * Delete contact
     *
     * @param contact
     */
    deleteUser(user: User): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.delete(`${ environment.api_url }/users/${user.id}`)
                .subscribe(response => {
                    const userIndex = this.users.indexOf(user);
                    this.users.splice(userIndex, 1);
                    this.onUsersChanged.next(this.users);            
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Delete selected users
     */
    deleteSelectedUsers(): void
    {
        for ( const userId of this.selectedUsers )
        {
            const contact = this.users.find(_contact => {
                return _contact.id === userId;
            });
            const userIndex = this.users.indexOf(contact);
            this.users.splice(userIndex, 1);
        }
        this.onUsersChanged.next(this.users);
        this.deselectUsers();
    }

}
