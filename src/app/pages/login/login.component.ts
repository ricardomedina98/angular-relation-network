import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'app/services/authentification.service';
import { first } from 'rxjs/operators';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LoginComponent implements OnInit
{
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _authenticationService: AuthenticationService,
        private _matSnackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
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

        if (this._authenticationService.currentUserValue) { 
            this._router.navigate(['/dashboard']);
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.loginForm = this._formBuilder.group({
            username   : ['', Validators.required],
            password: ['', Validators.required],
            rememberme: [false]
        });

        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

        if(localStorage.getItem('remember_username') != null) {
            this.f.rememberme.setValue(true);
            this.focusPassword();
        } else {
            this.f.rememberme.setValue(false);
            this.focusUsername();
        } 
        this.f.username.setValue(localStorage.getItem('remember_username'));
    }

    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        if(this.loginForm.invalid) {
            return;
        }
        this.loading = true;

        this._authenticationService.login(this.f.username.value, this.f.password.value)
        .then((data) => {

            localStorage.removeItem('remember_username');
            if(this.f.rememberme.value) {
                localStorage.setItem('remember_username', this.f.username.value);
            };
            this._router.navigate([this.returnUrl]);

        })
        .catch((error) => {

            this._matSnackBar.open('USUARIO O CONTRASEÑA INCORRECTO', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });

            this.loading = false;

        });
    }

    @ViewChild("username", { static: true }) usernameField: ElementRef;
    focusUsername(): void {
        this.usernameField.nativeElement.focus();
    }

    @ViewChild("password", { static: true }) passwordField: ElementRef;
    focusPassword(): void {
        this.passwordField.nativeElement.focus();
    }
}
