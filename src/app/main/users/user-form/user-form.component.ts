import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { User, Role } from 'app/main/users/user.model';
import { UsersService } from '../users.service';
import { MatSnackBar } from '@angular/material/snack-bar';


interface IRole {
    value: string;
    viewValue: string;
}

@Component({
    selector     : 'users-user-form-dialog',
    templateUrl  : './user-form.component.html',
    styleUrls    : ['./user-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class UsersUserFormDialogComponent
{
    action: string;
    user: User;
    userForm: FormGroup;
    dialogTitle: string;
    roles: IRole[];
    requiredPassword: boolean = false;

    /**
     * Constructor
     *
     * @param {MatDialogRef<UsersUserFormDialogComponent>} matDialogRef
     * @param _data
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        public matDialogRef: MatDialogRef<UsersUserFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _userService: UsersService,
        private _matSnackBar: MatSnackBar,
    )
    {
        this.roles = this._userService.roles.map(role => {
            return {
                value: role.name,
                viewValue: role.name
            }
        });

        // Set the defaults
        this.action = _data.action;

        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Editar Usuario';
            this.user = _data.user;
            this.requiredPassword = false;
        }
        else
        {
            this.dialogTitle = 'Nuevo Usuario';
            this.user = new User({});
            this.requiredPassword = true;
        }

        this.userForm = this.createContactForm();

        if(this.action !== 'edit'){
            if(this._userService.filterBy !== undefined || this._userService.filterBy !== 'all')
                this.userForm.controls.role.setValue(this._userService.filterBy);
        }

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create user form
     *
     * @returns {FormGroup}
     */
    createContactForm(): FormGroup
    {
        return this._formBuilder.group({
            id: [this.user.id],
            username: [this.user.username, Validators.required],
            password: ['', (this.action === 'edit') ? [] : Validators.required],
            email: [this.user.email, [Validators.required, Validators.email]],
            name: [this.user.name, Validators.required],
            firstName: [this.user.firstName, Validators.required],
            secondName: [this.user.secondName],
            role: [this.user.role, Validators.required]
        });
    }

    onSubmitAddUser(): void {

            this._userService.addUser(this.userForm.getRawValue()).then(response => {

                this._matSnackBar.open('Usuario guardado correctamente', 'OK', {
                    verticalPosition: 'bottom',
                    duration        : 4000
                });
                
                this.matDialogRef.close()
    
            }, error => {

                this._matSnackBar.open('Hubo un error al guardar el usuario', 'OK', {
                    verticalPosition: 'bottom',
                    duration        : 4000
                });

            })
        
    }

    onSubmitUpdateUser(): void {
        this._userService.updateUser(this.userForm.getRawValue())
        .then((response) => {

            this._matSnackBar.open('Usuario actualizado correctamente', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });
            
            this.matDialogRef.close()

        })
        .catch(error => {

            this._matSnackBar.open('Hubo un error al actualizar el usuario', 'OK', {
                verticalPosition: 'bottom',
                duration        : 4000
            });

        });
    }
}
