import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Contact } from 'app/main/contacts/contact.model';
import { ContactsService } from '../contacts.service';
import { MatDatepicker } from '@angular/material/datepicker';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const moment = _moment;

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
    selector: 'contacts-contact-form-dialog',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ],
    encapsulation: ViewEncapsulation.None
})

export class ContactsContactFormDialogComponent implements OnInit {
    action: string;
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
    
    constructor(
        public matDialogRef: MatDialogRef<ContactsContactFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _contactService: ContactsService,
        private _matSnackBar: MatSnackBar,
    ) {
        // Set the defaults
        this.action = _data.action;

        if (this.action === 'edit') {
            this.dialogTitle = 'Edit Contact';
            this.contact = _data.contact;
            console.log(_data.contact);
        }
        else {
            this.dialogTitle = 'New Contact';
            this.contact = new Contact({});
        }

        
        this.countries = this._contactService.countries.map(country => {
            return {
                viewValue: country.name,
                value: country.iso2
            }
        });

        this.contacts = this._contactService.contacts.filter(contact => contact.id_contact !== this.contact.id_contact);
        this.professions = this._contactService.professions;
        this.ocupations = this._contactService.ocupations;
        this.clasifications = this._contactService.clasifications;
        this.hobbies = this._contactService.hobbies;
        this.titles = this._contactService.titles;
        this.genders = this._contactService.genders;
        this.civilStatuses = this._contactService.civilStatuses;

        this.contactForm = this.createContactForm();


        //Set default control values
        this.contactForm.get('state').disable();
        this.contactForm.get('city').disable();

        if(!this.contact.you_have_referred_contact.id_contact) {
            this.contactForm.get('you_have_referred_contact').disable();
        }
        
        if(!this.contact.has_referred_you_contact.id_contact) {
            this.contactForm.get('has_referred_you_contact').disable();
        }


    }

    ngOnInit(): void {


        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(this.displayLocationInfo.bind(this));
        // }
    }

    displayLocationInfo(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log(`longitude: ${lng} | latitude: ${lat}`);

        this._contactService.getCurrentLocation(lat, lng).then(response => {
            console.log(response);
        });
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
                this.contactForm.get('state').setValue(null);
                (this.states.length > 0) ? this.contactForm.get('state').enable() : this.contactForm.get('state').disable();
            });
    }

    onChangeCities(stateCode: string) {
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
                this.contactForm.get('city').setValue(null);
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
            timeMeet: [this.contact.timeMeet || moment()],
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
        console.log(contact);
        this._contactService.createContact(contact)
        .then(response => {

            this._matSnackBar.open('Contacto guardado correctamente', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });
            
            this.matDialogRef.close()

        })
        .catch(error => {

            this._matSnackBar.open('Hubo un error al guardar al contacto', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });
            console.log(error);
            
        });
        //this.matDialogRef.close();
    }

}
