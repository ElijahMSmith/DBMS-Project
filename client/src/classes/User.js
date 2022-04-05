export class User {
    constructor(username, uid, unid, permission) {
        this.username = username;
        this.uid = uid;
        this.unid = unid;
        this.permission = permission;
    }
}

export class Student extends User {
    constructor(username, uid, unid, RSOs) {
        super(username, uid, unid, 1);
        this.RSOMembership = RSOs ?? [];
    }
}

export class Admin extends User {
    constructor(username, uid, unid, RSOs) {
        super(username, uid, unid, 2);
        this.RSOOwnership = RSOs ?? [];
    }
}

export class SuperAdmin extends User {
    constructor(username, uid, unid) {
        super(username, uid, unid, 3);
    }
}
