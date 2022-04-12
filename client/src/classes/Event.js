const DefaultLocation = { lat: 28.602307480049603, lng: -81.20016915689729 };

class Event {
    eid = '';
    unid = '';
    uniName = '';
    rsoid = '';
    rsoName = '';
    uid = '';
    name = '';
    description = '';
    category = '';
    dateTime = new Date();
    location = '';
    lat = DefaultLocation.lat;
    lng = DefaultLocation.lng;
    contactPhone = '';
    contactEmail = '';
    published = false;
    approved = false;

    constructor(
        eid,
        unid,
        uniName,
        rsoid,
        rsoName,
        uid,
        name,
        description,
        category,
        dateTime,
        location,
        contactPhone,
        contactEmail,
        published,
        approved,
        lat,
        lng
    ) {
        this.eid = eid;
        this.unid = unid;
        this.uniName = uniName;
        this.rsoid = rsoid;
        this.rsoName = rsoName;
        this.uid = uid;
        this.name = name;
        this.description = description;
        this.category = category;
        this.dateTime = dateTime;
        this.location = location;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.published = published;
        this.approved = approved;
        this.lat = lat;
        this.lng = lng;
    }
}

export default Event;
