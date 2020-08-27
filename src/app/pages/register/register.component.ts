import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Location } from '@angular/common';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { RegisterService } from './register.service';
import { RegisterUser } from './register.model';
import { AuthenticationService } from 'app/services/authentification.service';
import { Router } from '@angular/router';
import { isString, isArray } from 'util';

import { toArray } from 'lodash';


@Component({
    selector     : 'register',
    templateUrl  : './register.component.html',
    styleUrls    : ['./register.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RegisterComponent implements OnInit, OnDestroy
{
    registerForm: FormGroup;

    submitted: boolean;
    loading = false;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,

        private _authService: AuthenticationService,
        private _registerService: RegisterService,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

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
        this.registerForm = this._formBuilder.group({

            username           : ['', Validators.required],
            name           : ['', Validators.required],
            email          : ['', [Validators.required, Validators.email]],
            password       : ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]],
            termsandconditions: [false, [Validators.required]]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
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

    get f() { return this.registerForm.controls; }

    async onSubmit() {

        this.submitted = true;

        if(this.registerForm.invalid) {
            return;
        }

        this.loading = true;

        const data: RegisterUser = {
            username: this.f.username.value,
            email: this.f.email.value,
            name: this.f.name.value,
            password: this.f.password.value
        };
        
        await this._registerService.registerUser(data)
        .then(async (response) => {
            console.log(response);
            this.submitted = false;
            this.loading = false;


            this._matSnackBar.open('INICIANDO SESION...', 'OK', {
                verticalPosition: 'bottom',
                duration        : 1000
            });

            if(response) {
                await this._authService.login(data.username, this.f.password.value)
                    .then(() => {
                        this._router.navigate(['dashboard']);
                    });
            }
            
        })
        .catch((error: any) => {

            this.submitted = false;
            this.loading = false;

            if(isString(error)) {

                if(error.toLowerCase().includes('username')) {
                    this._matSnackBar.open('USUARIO YA REGISTRADO', 'OK', {
                        verticalPosition: 'bottom',
                        duration        : 4000
                    });
                } else if(error.toLowerCase().includes('email')) {
                    this._matSnackBar.open('CORREO ELECTRÓNICO YA REGISTRADO', 'OK', {
                        verticalPosition: 'bottom',
                        duration        : 4000
                    });
                } else {
                    this._matSnackBar.open('HUBO UN ERROR AL PROCESAR LA INFORMACION', 'OK', {
                        verticalPosition: 'bottom',
                        duration        : 5000
                    });
                }

            } else if (isArray(error)) {
                if(toArray(error)[0].toLowerCase().includes('email')) {
                    this._matSnackBar.open('CORREO ELECTRÓNICO NO VALIDO', 'OK', {
                        verticalPosition: 'bottom',
                        duration        : 4000
                    });
                }
            }

            

        });

    }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if ( !control.parent || !control )
    {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if ( !password || !passwordConfirm )
    {
        return null;
    }

    if ( passwordConfirm.value === '' )
    {
        return null;
    }

    if ( password.value === passwordConfirm.value )
    {
        return null;
    }

    return {passwordsNotMatching: true};
};
