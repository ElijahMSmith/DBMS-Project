function initializeTriggers(pool) {
    pool.query(
        `
        CREATE TRIGGER TR_UniversityCount on Users
        AFTER INSERT, UPDATE, DELETE
        AS
            UPDATE Universities
            SET numStudents = (
                SELECT COUNT(*) FROM Users usr 
                WHERE Universities.unid = usr.unid
            );`
    ).catch((err) => console.error('Users Error: ' + err));

    pool.query(`
        CREATE TRIGGER TR_MemberCount on [dbo].[MemberOf]
        AFTER INSERT, UPDATE, DELETE
        AS
        UPDATE [dbo].[RSOs] 
        SET numMembers = (
            SELECT COUNT(*) FROM [dbo].[MemberOf] member
            WHERE member.rsoid = [dbo].[RSOs].rsoid
        );
    `);
}

function dropTriggers(pool) {
    pool.query(`DROP TRIGGER TR_MemberCount;`);
}

module.exports = initializeTriggers;
