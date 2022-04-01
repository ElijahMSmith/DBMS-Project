import { typeImplementation } from '@testing-library/user-event/dist/type/typeImplementation';

export class Event {
    eid;
    name;
    desc;
    category;
    time;
    date;
    location;
    contactPhone;
    contactEmail;
    published;
    owner;
    ratings;
    comments;
    constructor(
        eid,
        name,
        desc,
        category,
        time,
        date,
        location,
        contactPhone,
        contactEmail,
        published,
        owner,
        comments,
        ratings
    ) {
        this.eid = eid;
        this.name = name;
        this.desc = desc;
        this.category = category;
        this.time = time;
        this.date = date;
        this.location = location;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.published = published;
        this.owner = owner;
        this.comments = comments ?? [];
        this.ratings = ratings ?? [];
    }
}

export class RSOEvent {
    constructor(
        rsoid, // RSO hosting event
        eid,
        name,
        desc,
        category,
        time,
        date,
        location,
        contactPhone,
        contactEmail,
        published,
        owner,
        comments,
        ratings
    ) {
        super(
            eid,
            name,
            desc,
            category,
            time,
            date,
            location,
            contactPhone,
            contactEmail,
            published,
            owner,
            comments,
            ratings
        );
        this.rsoid = rsoid;
    }
}

export class PrivateEvent {
    constructor(
        uid, // University hosting event
        eid,
        name,
        desc,
        category,
        time,
        date,
        location,
        contactPhone,
        contactEmail,
        published,
        owner,
        comments,
        ratings
    ) {
        super(
            eid,
            name,
            desc,
            category,
            time,
            date,
            location,
            contactPhone,
            contactEmail,
            published,
            owner,
            comments,
            ratings
        );
        this.uid = uid;
    }
}

export class PublicEvent {
    constructor(
        approved,
        eid,
        name,
        desc,
        category,
        time,
        date,
        location,
        contactPhone,
        contactEmail,
        published,
        owner,
        comments,
        ratings
    ) {
        super(
            eid,
            name,
            desc,
            category,
            time,
            date,
            location,
            contactPhone,
            contactEmail,
            published,
            owner,
            comments,
            ratings
        );
        this.approved = approved;
    }
}
