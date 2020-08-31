import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';

import { fuseAnimations } from '@fuse/animations';
import { ProfileService } from 'app/main/contacts/profile/profile.service';
import { Contact } from 'app/main/contacts/contact.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactsService } from 'app/main/contacts/contacts.service';
import { MatDatepicker } from '@angular/material/datepicker';

export const MY_FORMATS = {
    parse: {
        dateInput: 'MM/YYYY',
    },
    display: {
        dateInput: 'MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

interface ICountries {
    value: string;
    viewValue: string;
}

interface IStates {
    value: string;
    viewValue: string;
}

interface ICities {
    value: string;
    viewValue: string;
}

@Component({
    selector     : 'profile-edit',
    templateUrl  : './edit.component.html',
    styleUrls    : ['./edit.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ],
})
export class ProfileEditComponent implements OnInit, OnDestroy
{
    pageType: string;
    contact: Contact;
    contactForm: FormGroup;
    dialogTitle: string;
    disabled_you_have_referred: boolean;
    countries: ICountries[];
    states: IStates[];
    cities: ICities[];

    contacts: Contact[];
    professions: any[];
    ocupations: any[];
    clasifications: any[];
    hobbies: any[];
    titles: any[];
    genders: any[];
    civilStatuses: any[];
    typesRelationships: any[];
    qualitiesRelationships: any[];

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _profileService: ProfileService,
        private _formBuilder: FormBuilder,
        private _contactService: ContactsService,
        private _matSnackBar: MatSnackBar,
        private _location: Location,
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.countries = this._contactService.countries.map(country => {
            return {
                viewValue: country.name,
                value: country.iso2
            }
        });

        
        this.professions = this._contactService.professions;
        this.ocupations = this._contactService.ocupations;
        this.clasifications = this._contactService.clasifications;
        this.hobbies = this._contactService.hobbies;
        this.titles = this._contactService.titles;
        this.genders = this._contactService.genders;
        this.civilStatuses = this._contactService.civilStatuses;
        this.typesRelationships = this._contactService.typesRelationships;
        this.qualitiesRelationships = this._contactService.qualitiesRelationships;

        this._profileService.contactOnChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(contact => {
            console.log(contact);
            if(contact){
                this.pageType = 'edit';
                this.contact = new Contact(contact);
                this.contacts = this._contactService.contacts.filter(contact => contact.id_contact !== this.contact.id_contact);
            } else {
                this.pageType = 'new';
                this.contact = new Contact();
            }

            this.contactForm = this.createContactForm();
            
        });

        this.contactForm.valueChanges
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(contactForm => {
            this._profileService.newContactOnChanged.next(contactForm);
        });
    }

    ngOnInit(): void
    {

        if(!this.contact.you_have_referred_contact.id_contact) {
            this.contactForm.get('you_have_referred_contact').disable();
        }

        if(!this.contact.has_referred_you_contact.id_contact) {
            this.contactForm.get('has_referred_you_contact').disable();
        }
        
        this.onChangeCountries(this.contact.address.country.iso2);
        this.onChangeStates(this.contact.address.state.iso2);
      
    }

    onChangeCountries(countryCode: string) {
        if (!countryCode) {
            this.states = [];
            this.contactForm.get('state').setValue(null);
            this.contactForm.get('city').setValue(null);
            this.contactForm.get('state').disable();
            this.contactForm.get('city').disable();
            return;
        }

        this._contactService.getStatesByCountry(countryCode)
            .then((states: any[]) => {
                this.states = states.map(state => {
                    return {
                        viewValue: state.name,
                        value: state.iso2
                    }
                });

                this.contactForm.get('state').setValue(this.contact.address.state.iso2);
                
                (this.states.length > 0) ? this.contactForm.get('state').enable() : this.contactForm.get('state').disable();
            });
    }

    onChangeStates(stateCode: string) {
        if (!stateCode) {
            this.cities = [];
            this.contactForm.get('city').setValue(null);
            this.contactForm.get('city').disable();
            return;
        }

        this._contactService.getCitiesByState(stateCode)
            .then((cities: any[]) => {
                this.cities = cities.map(city => {
                    return {
                        viewValue: city.name,
                        value: city.id
                    }
                });

                this.contactForm.get('city').setValue(this.contact.address.city.id);
                
                (this.states.length > 0) ? this.contactForm.get('city').enable() : this.contactForm.get('city').disable();
            });

    }

    

    createContactForm(): FormGroup {
        return this._formBuilder.group({
            id_contact: [this.contact.id_contact],
            name: [this.contact.name, Validators.required],
            firstSurname: [this.contact.firstSurname, Validators.required],
            secondSurname: [this.contact.secondSurname],
            phone: [this.contact.phone],
            age: [this.contact.age],
            alias: [this.contact.alias],
            email: [this.contact.email],
            timeMeet: [this.contact.timeMeet, Validators.required],
            have_you_referred: [this.contact.have_you_referred || false],
            you_have_referred_contact: [this.contact.you_have_referred_contact.id_contact],
            has_referred_you: [this.contact.has_referred_you || false],
            has_referred_you_contact: [this.contact.has_referred_you_contact.id_contact],
            title: [this.contact.title.id_title],
            gender: [this.contact.gender.id_gender],
            civilstatus: [this.contact.civilstatus.id_civilstatus],
            profession: [this.contact.profession.id_profession],
            ocupation: [this.contact.ocupation.id_ocupation],
            clasification: [this.contact.clasification.id_clasification],
            hobbie: [this.contact.hobbie.id_hobbie],
            type_relationship: [this.contact.type_relationship.id_type_relationship],
            quality_relationship: [this.contact.quality_relationship.id_quality_relationship],
            country: [this.contact.address.country.iso2],
            state: [this.contact.address.state.iso2],
            city: [this.contact.address.city.id],
            postalCode: [this.contact.address.postalCode],

        });
    }

    chosenYearHandler(normalizedYear: Moment) {
        console.log(normalizedYear);
        const ctrlValue = this.contactForm.get('timeMeet').value;
        ctrlValue.year(normalizedYear.year());
        this.contactForm.get('timeMeet').setValue(ctrlValue);
    }

    chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
        const ctrlValue = this.contactForm.get('timeMeet').value;
        ctrlValue.month(normalizedMonth.month());
        this.contactForm.get('timeMeet').setValue(ctrlValue);
        datepicker.close();
    }

    onChangeYouHaveRegerred(value: boolean) {
        if(value) {
            this.contactForm.controls.you_have_referred_contact.setValue(null);
            this.contactForm.controls.you_have_referred_contact.enable();
        } else {
            this.contactForm.controls.you_have_referred_contact.setValue(null);
            this.contactForm.controls.you_have_referred_contact.disable();
        }
    }

    onChangeHasReferredYouContact(value: boolean) {
        if(value) {
            this.contactForm.controls.has_referred_you_contact.setValue(null);
            this.contactForm.controls.has_referred_you_contact.enable();
        } else {
            this.contactForm.controls.has_referred_you_contact.setValue(null);
            this.contactForm.controls.has_referred_you_contact.disable();
        }
    }

    onSubmitAdd() {
        const contact = this.contactForm.getRawValue();
        this._contactService.createContact(contact)
        .then((contact: any) => {

            this._matSnackBar.open('Contacto guardado correctamente', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });

            this._profileService.contactOnChanged.next(contact);
            this._location.go('/dashboard/contacts/profile/' + contact.id_contact);

        })
        .catch(error => {

            this._matSnackBar.open('Hubo un error al guardar el contacto', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });
            console.log(error);
            
        });
    }

    onSubmitUpdate() {
        const contact = this.contactForm.getRawValue();

        this._contactService.updateContact(contact)
        .then(response => {
            this._profileService.contactOnChanged.next(response);
            this._matSnackBar.open('Contacto actualizado correctamente', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });

        })
        .catch(error => {
            this._matSnackBar.open('Hubo un error al actualizar el contacto', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });
            console.log(error);
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
}
