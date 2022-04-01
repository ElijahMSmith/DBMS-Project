export default class University {
    unid;
    name;
    desc;
    numStudents;
    pictureURL;
    superAdmin;
    adminsList;
    RSOsList;
    constructor(
        unid,
        name,
        desc,
        numStudents,
        pictureURL,
        superAdmin,
        adminsList,
        RSOsList
    ) {
        this.unid = unid;
        this.name = name;
        this.desc = desc;
        this.numStudents = numStudents;
        this.pictureURL = pictureURL;
        this.superAdmin = superAdmin;
        this.adminsList = adminsList ?? [];
        this.RSOsList = RSOsList ?? [];
    }
}
