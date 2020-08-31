import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contact } from '../contact.model';
import { environment } from 'environments/environment';
import { ContactsService } from '../contacts.service';

@Injectable()
export class ProfileService implements Resolve<any>
{
    routeParams: any;
    contact: Contact;

    contactOnChanged: BehaviorSubject<any>;
    newContactOnChanged: BehaviorSubject<any>;
    

    constructor(
        private _httpClient: HttpClient,
        private readonly _contactService: ContactsService
    )
    {
        // Set the defaults
        this.contactOnChanged = new BehaviorSubject({});
        this.newContactOnChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getContact(),
                this._contactService.getContacts(),
                this._contactService.getUserData(),
                this._contactService.getCountries(),
                this._contactService.getProfessions(),
                this._contactService.getOcupations(),
                this._contactService.getClasifications(),
                this._contactService.getHobbies(),
                this._contactService.getTitles(),
                this._contactService.getGenders(),
                this._contactService.getCivilStatuses(),
                this._contactService.getTypesRelationships(),
                this._contactService.getQualityRelationships()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get timeline
     */
    getContact(): Promise<any>
    {
        return new Promise((resolve, reject) => {

            if(this.routeParams.id === 'new') {

                this.contactOnChanged.next(false);
                resolve(false);

            } else {

                this._httpClient.get(`${ environment.api_url }/contacts/${this.routeParams.id}`)
                .subscribe((contact: any) => {
                    this.contact = contact;
                    this.contactOnChanged.next(this.contact);
                    resolve(this.contact);
                }, reject);

            }

            
        });
    }

    

}
