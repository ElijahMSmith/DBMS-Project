export class User {
    constructor(username, uid, permission) {
        this.username = username;
        this.uid = uid;
        this.permission = permission;
        this.ratings = [];
        this.comments = [];
    }
}

export class Student extends User {
    constructor(username, uid, RSOs) {
        super(username, uid, 1);
        this.RSOMembership = RSOs ?? [];
    }
}

export class Admin extends User {
    constructor(username, uid, RSOs) {
        super(username, uid, 2);
        this.RSOOwnership = RSOs ?? [];
    }
}

export class SuperAdmin extends User {
    constructor(username, uid) {
        super(username, uid, 3);
    }
}
