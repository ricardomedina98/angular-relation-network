import { FuseUtils } from '@fuse/utils';

export class User
{
    id: string;
    username: string;
    password: string;
    email: string;
    name: string;
    firstName: string;
    secondName: string;
    role: string;
    avatar: string;

    /**
     * Constructor
     *
     * @param user
     */
    constructor(user)
    {
        {
            this.id = user.id || '';
            this.username = user.username || '';
            this.password = user.password || '';
            this.email = user.email || '';
            this.name = user.name || '';
            this.firstName = user.firstName || '';
            this.secondName = user.secondName || '';
            this.role = user.role || '';
            this.avatar = user.avatar || 'assets/images/avatars/profile.jpg';
        }
    }
}

export class Role {
    name: string;
    description: string;
    users: User[];

    /**
     * Constructor
     *
     * @param role
     */
    
    constructor(role) {
        this.name = role.name || '';
        this.description = role.description || '';
        this.users = role.users || [];
    }
}
