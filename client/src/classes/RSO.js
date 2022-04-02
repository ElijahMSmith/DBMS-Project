export default class RSO {
    rsoid;
    desc;
    numMembers;
    name;
    approved;
    constructor(rsoid, name, desc, numMembers, approved) {
        this.rsoid = rsoid;
        this.name = name;
        this.desc = desc;
        this.numMembers = numMembers;
        this.approved = approved ?? false;
    }
}
