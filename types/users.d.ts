export type UserRole = {
    Owner: 13,
    Admin: 2,
    Member: 3,
    FreeAgent: 222,
    Hypno: 0,
}

enum UserType {
    Free,
    Creator,
    Studio,
    Partner, // Agency/Verified
    Enterprise,
}

export interface NewUser {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
}

// If hashed will be a string
// If sending invite, will be decrypted version
export interface UserInvite {
    inviter_user_id: string | number;
    organization_id: string | number;
    role: string | number;
}