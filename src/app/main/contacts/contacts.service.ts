import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Contact } from 'app/main/contacts/contact.model';
import { environment } from 'environments/environment';

@Injectable()
export class ContactsService implements Resolve<any>
{
    onContactsChanged: BehaviorSubject<any>;
    onSelectedContactsChanged: BehaviorSubject<any>;
    onUserDataChanged: BehaviorSubject<any>;
    onSearchTextChanged: Subject<any>;
    onFilterChanged: Subject<any>;

    contacts: Contact[];
    user: any;
    selectedContacts: string[] = [];

    searchText: string;
    filterBy: string;
    
    countries: any[];
    professions: any[];
    ocupations: any[];
    clasifications: any[];
    hobbies: any[];
    titles: any[];
    genders: any[];
    civilStatuses: any[];

    constructor(
        private _httpClient: HttpClient
    )
    {
        // Set the defaults
        this.onContactsChanged = new BehaviorSubject([]);
        this.onSelectedContactsChanged = new BehaviorSubject([]);
        this.onUserDataChanged = new BehaviorSubject([]);
        this.onSearchTextChanged = new Subject();
        this.onFilterChanged = new Subject();
    }


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getContacts(),
                this.getUserData(),
                this.getCountries(),
                this.getProfessions(),
                this.getOcupations(),
                this.getClasifications(),
                this.getHobbies(),
                this.getTitles(),
                this.getGenders(),
                this.getCivilStatuses()
            ]).then(
                ([files]) => {

                    this.onFilterChanged.subscribe(filter => {
                        this.filterBy = filter;
                    });

                    resolve();

                },
                reject
            );
        });
    }

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    getContacts(): Promise<any>
    {
        return new Promise((resolve, reject) => {
                this._httpClient.get(`${environment.api_url}/contacts/user`)
                    .subscribe((response: any) => {
                        this.contacts = response;

                        if ( this.filterBy === 'starred' )
                        {
                            this.contacts = this.contacts.filter(_contact => {
                                return this.user.starredContacts.includes(_contact.id_contact);
                            });
                        }
                        
                        this.contacts = this.contacts.map(contact => {
                            return new Contact(contact);
                        });
                        
                        console.log(this.contacts);
                        this.onContactsChanged.next(this.contacts);
                        resolve(this.contacts);
                    }, reject);
            }
        );
    }

    /**
     * Get user data
     *
     * @returns {Promise<any>}
     */
    getUserData(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/users/contacts/starred`)
            .subscribe((response: any) => {
                this.user = response;
                console.log(this.user);
                this.onUserDataChanged.next(this.user);
                resolve(response);
            }, reject);
        });
    }

    /**
     * Toggle selected contact by id
     *
     * @param id
     */
    toggleSelectedContact(id): void
    {
        // First, check if we already have that contact as selected...
        if ( this.selectedContacts.length > 0 )
        {
            const index = this.selectedContacts.indexOf(id);

            if ( index !== -1 )
            {
                this.selectedContacts.splice(index, 1);

                // Trigger the next event
                this.onSelectedContactsChanged.next(this.selectedContacts);

                // Return
                return;
            }
        }

        // If we don't have it, push as selected
        this.selectedContacts.push(id);

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll(): void
    {
        if ( this.selectedContacts.length > 0 )
        {
            this.deselectContacts();
        }
        else
        {
            this.selectContacts();
        }
    }

    /**
     * Select contacts
     *
     * @param filterParameter
     * @param filterValue
     */
    selectContacts(filterParameter?, filterValue?): void
    {
        this.selectedContacts = [];

        // If there is no filter, select all contacts
        if ( filterParameter === undefined || filterValue === undefined )
        {
            this.selectedContacts = [];
            this.contacts.map(contact => {
                this.selectedContacts.push(contact.id_contact);
            });
        }

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Update contact
     *
     * @param contact
     * @returns {Promise<any>}
     */
    updateContact(contact): Promise<any>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.put(`${environment.api_url}/users/${contact.id_contact}`, {...contact})
                .subscribe(response => {
                    this.getContacts();
                    resolve(response);
                });
        });
    }




    
    toggleStar(id_contact): Promise<any>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.put(`${environment.api_url}/contacts/starred/${id_contact}`, {})
                .subscribe(response => {
                    this.getUserData();
                    this.getContacts();
                    resolve(response);
                });
        });
    }

    unToggleStar(id_contact): Promise<any>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.delete(`${environment.api_url}/contacts/starred/${id_contact}`)
                .subscribe(response => {
                    this.getUserData();
                    this.getContacts();
                    resolve(response);
                });
        });
    }


    /**
     * Deselect contacts
     */
    deselectContacts(): void
    {
        this.selectedContacts = [];

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Delete contact
     *
     * @param contact
     */
    deleteContact(contact): void
    {
        const contactIndex = this.contacts.indexOf(contact);
        this.contacts.splice(contactIndex, 1);
        this.onContactsChanged.next(this.contacts);
    }

    /**
     * Delete selected contacts
     */
    deleteSelectedContacts(): void
    {
        for ( const contactId of this.selectedContacts )
        {
            const contact = this.contacts.find(_contact => {
                return _contact.id_contact === contactId;
            });
            const contactIndex = this.contacts.indexOf(contact);
            this.contacts.splice(contactIndex, 1);
        }
        this.onContactsChanged.next(this.contacts);
        this.deselectContacts();
    }

    createContact(contact) {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environment.api_url}/contacts`, contact)
            .subscribe((response) => {
                this.getContacts();
                resolve(response);
            });
        })
    }

    getCurrentLocation(lat: string, lng: string) {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`https://geocode.xyz/${lat},${lng}?json=1`)
            .subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    getCountries() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/world/countries`)
            .subscribe((response: any[]) => {
                this.countries = response;
                resolve(response);
            }, reject);
        });
    }

    getStatesByCountry(countryCode: string) {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/world/countries/${countryCode}/states`)
            .subscribe((response: any[]) => {
                resolve(response);
            }, reject);
        });
    }

    getCitiesByState(stateCode: string) {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/world/countries/states/${stateCode}/cities`)
            .subscribe((response: any[]) => {
                resolve(response);
            }, reject);
        });
    }

    getProfessions() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/profession`)
            .subscribe((response: any[]) => {
                this.professions = response;
                resolve(response);
            }, reject);
        });
    }

    getOcupations() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/ocupation`)
            .subscribe((response: any[]) => {
                this.ocupations = response;
                resolve(response);
            }, reject);
        });
    }

    getClasifications() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/clasification`)
            .subscribe((response: any[]) => {
                this.clasifications = response;
                resolve(response);
            }, reject);
        });
    }

    getHobbies() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/hobbie`)
            .subscribe((response: any[]) => {
                this.hobbies = response;
                resolve(response);
            }, reject);
        });
    }

    getTitles() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/title`)
            .subscribe((response: any[]) => {
                this.titles = response;
                resolve(response);
            }, reject);
        });
    }

    getGenders() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/gender`)
            .subscribe((response: any[]) => {
                this.genders = response;
                resolve(response);
            }, reject);
        });
    }

    getCivilStatuses() {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.api_url}/contacts/civil-status`)
            .subscribe((response: any[]) => {
                this.civilStatuses = response;
                resolve(response);
            }, reject);
        });
    }

}
