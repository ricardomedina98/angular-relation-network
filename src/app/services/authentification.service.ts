import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";

import { environment } from 'environments/environment';
import { UserAuth } from 'app/models/user.auth';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<UserAuth>;
    public currentUser: Observable<UserAuth>;
    
    constructor(
        private readonly _httpClient: HttpClient
    ) {
        this.currentUserSubject = new BehaviorSubject<UserAuth>(this.getToken());
        this.currentUser = this.currentUserSubject.asObservable();
        
    }

    public get currentUserValue(): UserAuth {
        return this.currentUserSubject.value;
    }


    login(username: string, password: string): Promise<any> {

        return new Promise((resolve, reject) => {
            this._httpClient.post<any>(`${environment.api_url}/auth/signin`, { username, password })
            .subscribe((token) => {
                localStorage.setItem('rpt_currentUser', this.toToken(token));
                this.currentUserSubject.next(this.getToken());
                resolve(token);
            }, reject);
        });

    }

    logout() {
        localStorage.removeItem('rpt_currentUser');
        this.currentUserSubject.next(null);
    }

    private toToken(token: any) {
        return JSON.parse(JSON.stringify(token)).token;
    }

    private getToken(): UserAuth {
        
        if(!localStorage.getItem('rpt_currentUser')) {
            return null;
        }

        const jwtHeperService = new JwtHelperService();

        const decodetoken = jwtHeperService.decodeToken(localStorage.getItem('rpt_currentUser').toString());

        if(!decodetoken) {
            return null;
        }

        const user: UserAuth = {
            id_user: decodetoken.id,
            username: decodetoken.username,
            email: decodetoken.email,
            name: decodetoken.name,
            firstName: decodetoken.firstName || '',
            secondName: decodetoken.secondName || '',
            role: decodetoken.role,
            token: localStorage.getItem('rpt_currentUser').toString()
        };

        return user;
    }

    isAuthenticated(): boolean {
        return localStorage.getItem('rpt_currentUser') != null
    }
}
