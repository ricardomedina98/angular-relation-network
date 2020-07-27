export class RegisterUser {


    username: string;
    name: string;
    email: string;
    password: string;

    /**
    * Constructor
    *
    * @param User
    */
    constructor(user?) {
        user = user || {};

        this.username = user.username || '';
        this.name = user.name || '';
        this.email = user.email || '';
        this.password = user.password || '';
    }
}