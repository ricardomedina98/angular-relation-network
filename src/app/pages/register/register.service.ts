import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { RegisterUser } from "./register.model";
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    constructor(
        private readonly _httpClient: HttpClient
    ) { }

    registerUser(user: RegisterUser) {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environment.api_url}/auth/signup`, user)
            .subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }
}
