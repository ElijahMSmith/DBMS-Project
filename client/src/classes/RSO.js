export default class RSO {
    rsoid;
    uid;
    unid;
    uname;
    name;
    desc;
    numMembers;
    constructor(rsoid, uid, unid, name, description, numMembers) {
        this.rsoid = rsoid;
        this.uid = uid;
        this.unid = unid;
        this.name = name;
        this.description = description;
        this.numMembers = numMembers;
    }
}
