export class User {
    constructor(username, uid) {
        this.username = username;
        this.uid = uid;
        this.ratings = [];
        this.comments = [];
    }
}

export class Student extends User {
    constructor(username, uid, RSOs) {
        super(username, uid);
        this.RSOs = RSOs ?? [];
    }
}

export class Admin extends User {
    constructor(username, uid, university, RSOs, events) {
        super(username, uid);
        this.university = university;
        this.RSOs = RSOs ?? [];
        this.events = events ?? [];
    }
}

export class SuperAdmin extends User {
    constructor(username, uid, university) {
        super(username, uid);
        this.university = university;
    }
}
