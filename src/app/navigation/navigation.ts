import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id       : 'applications',
        title    : 'Applications',
        translate: 'NAV.MODULES',
        type     : 'group',
        children : [
            {
                id       : 'home',
                title    : 'Home',
                translate: 'NAV.HOME.TITLE',
                type     : 'item',
                icon     : 'home',
                url      : '/dashboard/home',
            },
            {
                id       : 'contacts',
                title    : 'Contacts',
                translate: 'NAV.CONTACTS.TITLE',
                type     : 'item',
                icon     : 'group',
                url      : '/dashboard/contacts',
            }
        ]
    }
];
