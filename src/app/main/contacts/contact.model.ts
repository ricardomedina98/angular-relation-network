import * as moment from 'moment';

export class Contact
{
    id_contact: string;
    avatar: string;
    name: string;
    firstSurname: string;
    secondSurname: string;
    phone: string;
    age: number;
    alias: string;
    email:string;
    timeMeet: moment.Moment;
    have_you_referred: boolean;
    you_have_referred_contact: any;
    has_referred_you: boolean;
    has_referred_you_contact: any;
    title: any;
    gender: any;
    civilstatus: any;
    profession: any;
    ocupation: any;
    clasification: any;
    hobbie: any;
    type_relationship: any;
    quality_relationship: any;
    address: {
        country: {
            id: number;
            name: string;
            iso2: string;
        },
        state: {
            id: number;
            name: string;
            iso2: string;
        },
        city: {
            id: number;
            name: string;
            stateCode: string;
        },
        postalCode: number;
    };
    createdAt: moment.Moment;
    updatedAt: Date;
    


    constructor(contact?)
    {
        {
            contact = contact || {};
            this.id_contact = contact.id_contact || "";
            this.avatar = contact.avatar || 'assets/images/avatars/profile.jpg';
            this.name = contact.name || "";
            this.firstSurname = contact.firstSurname || "";
            this.secondSurname = contact.secondSurname || "";
            this.phone = contact.phone || "";
            this.age = contact.age || "";
            this.alias = contact.alias || "";
            this.email = contact.email || "";
            this.timeMeet = moment(contact.timeMeet) || moment();
            this.have_you_referred = contact.have_you_referred || "";
            this.you_have_referred_contact = contact.you_have_referred_contact || "";
            this.has_referred_you = contact.has_referred_you || "";
            this.has_referred_you_contact = contact.has_referred_you_contact || "";
            this.title = contact.title || "";
            this.gender = contact.gender || "";
            this.civilstatus = contact.civilstatus || "";
            this.profession = contact.profession || "";
            this.ocupation = contact.ocupation || "";
            this.clasification = contact.clasification || "";
            this.hobbie = contact.hobbie || "";
            this.type_relationship = contact.type_relationship || "";
            this.quality_relationship = contact.quality_relationship || "";
            //Address
            this.address  = {
                country: {
                    id: this.getSafe(() => contact.address.country.id, null),
                    name: this.getSafe(() => contact.address.country.name, null),
                    iso2: this.getSafe(() => contact.address.country.iso2, null),
                },
                postalCode: this.getSafe(() => contact.address.postalCode, null),
                state: {
                    id: this.getSafe(() => contact.address.state.id, null),
                    name: this.getSafe(() => contact.address.state.name, null),
                    iso2: this.getSafe(() => contact.address.state.iso2, null),
                },
                city: {
                    id: this.getSafe(() => contact.address.city.id, null),
                    name: this.getSafe(() => contact.address.city.name, null),
                    stateCode: this.getSafe(() => contact.address.city.stateCode, null)
                }
            };

            this.createdAt = moment(contact.createdAt) || moment();
            this.updatedAt = contact.updatedAt || "";
        }
    }

    getSafe(fn: Function, defaultVal: any) {
        try {
            return fn();
        } catch (e) {
            return defaultVal;
        }
    }
}


