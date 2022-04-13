const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
    // POST - Create / Update event details
    let {
        eid,
        uid,
        unid,
        rsoid,
        name,
        description,
        category,
        datetime,
        location,
        lat,
        lng,
        contactPhone,
        contactEmail,
        published,
        approved,
    } = req.body;

    return sql
        .connect(config)
        .then(async (pool) => {
            // First: Find out if we're overlapping times & locations
            let query = `SELECT COUNT(*) As ConflictingEvents FROM Events WHERE eid != '${eid}' AND location='${location}' AND ABS(DATEDIFF(hour, datetime, '${datetime}')) < 1`;
            let result = await pool.query(query);
            if (result.recordset[0]['ConflictingEvents'] > 0) {
                // There's an overlapping event!
                return res.status(406).send({
                    error: 'That event takes place within an hour of another event at the same location',
                });
            }

            // Check for nullable items
            !rsoid ? (rsoid = 'NULL') : (rsoid = `'${rsoid}'`);
            !unid ? (unid = 'NULL') : (unid = `'${unid}'`);

            // Determine the behavior we're doing - are we updating or creating?
            if (eid) {
                // The event exists - we're trying to update an event

                // Build the query
                query = `UPDATE Events 
                SET uid='${uid}', unid=${unid}, rsoid=${rsoid}, name='${name}',
                    description='${description}', category='${category}',
                    datetime='${datetime}', location='${location}',
                    contactPhone='${contactPhone}', contactEmail='${contactEmail}',
                    published='${published}', approved='${approved}', lat='${lat}', lng='${lng}' 
                WHERE eid='${eid}'`;
            } else {
                // The event does not exist. We're trying to create an event

                // Create our event id
                eid = uuidv4();

                // Build the query
                query = `INSERT INTO Events VALUES ('${eid}', '${uid}', ${unid},
                ${rsoid}, '${name}', '${description}', '${category}', 
                '${location}', '${contactPhone}', '${contactEmail}',
                '${published}', '${approved}', '${datetime}', '${lat}', '${lng}')`;
            }

            // Dispatch the query
            result = await pool.query(query);
            if (result.rowsAffected <= 0)
                return res.status(406).send({
                    error: 'No changes made. Either failed to insert a new event, or failed to find an event with this ID',
                });

            // Return success / event information
            return res.status(200).send({
                eid,
                uid,
                unid,
                rsoid,
                name,
                description,
                category,
                datetime,
                location,
                lat,
                lng,
                contactPhone,
                contactEmail,
                published,
                approved,
            });
        })
        .catch((e) => {
            return res
                .status(500)
                .send({ error: 'An unexpected error occurred: ' + e });
        });
});

router.delete('/', async (req, res) => {
    // DELETE - Delete an event
    const { eid } = req.body;

    return sql
        .connect(config)
        .then(async (pool) => {
            // Perform delete operation
            const query = `DELETE FROM Events WHERE eid='${eid}'`;
            const result = await pool.query(query);

            // Return result
            if (result.rowsAffected >= 1)
                return res
                    .status(200)
                    .send({ message: 'Event deleted successfully' });

            return res
                .status(404)
                .send({ error: 'No event found with given EID' });
        })
        .catch((e) => {
            return res
                .status(500)
                .send({ error: 'An unexpected error occurred: ' + e });
        });
});

router.get('/owned', async (req, res) => {
    const { uid, unid, rsoid, all } = req.query;

    return sql
        .connect(config)
        .then(async (pool) => {
            // Determine what we're fetching
            let query = 'SELECT * FROM Events ';

            // 1: All events for a given university
            if (unid) {
                query += `WHERE unid='${unid}' `;
            }

            // 2: All events for a given RSO
            else if (rsoid) {
                query += `WHERE rsoid='${rsoid}' `;
            }

            // 3: All events for a given User
            else if (uid) {
                // Only return this specific user's events
                query += `WHERE uid='${uid}' `;
            } else {
                query += `WHERE eid!=''`;
            }

            // If the user doesn't want all events, only get the upcoming events
            if (!all)
                query += `AND DATEDIFF(hour, SYSDATETIME(), datetime) > 0 `;

            // Order the events by "soonest first"
            query += `ORDER BY CONVERT(date, datetime) asc`;

            // Get our data, returns
            const result = await pool.query(query);
            return res.status(200).send({ events: result.recordset });
        })
        .catch((e) => {
            return res
                .status(500)
                .send({ error: 'An unexpected error occurred: ' + e });
        });
});

router.get('/', async (req, res) => {
    // GET - List of events for a user, a university, or an RSO
    const { uid, all } = req.query;

    return sql
        .connect(config)
        .then(async (pool) => {
            // Determine what we're fetching
            let query = 'SELECT * FROM Events ';

            // 3: All events for a given User
            if (uid) {
                // Users can have events:
                // 1: That are from an RSO they are a part of
                // 2: That are from a University they are a part of
                // 3: That are public
                query += `WHERE (
                    (
                        (
                            rsoid IN (SELECT rsoid FROM MemberOf WHERE uid='${uid}') OR
                            unid = (SELECT unid FROM Users WHERE uid='${uid}')
                        )
                        AND published='TRUE'
                    ) 
                    OR 
                    (
                        rsoid IS NULL AND 
                        unid IS NULL AND 
                        approved='TRUE' AND published='TRUE'
                    )
                ) `;
            } else {
                query += `WHERE rsoid IS NULL AND unid IS NULL AND approved='TRUE' AND published='TRUE'`;
            }

            // If the user doesn't want all events, only get the upcoming events
            if (!all)
                query += `AND DATEDIFF(hour, SYSDATETIME(), datetime) > 0 `;

            // Order the events by "soonest first"
            query += `ORDER BY CONVERT(date, datetime) asc`;

            // Get our data, returns
            const result = await pool.query(query);
            return res.status(200).send({ events: result.recordset });
        })
        .catch((e) => {
            return res
                .status(500)
                .send({ error: 'An unexpected error occurred: ' + e });
        });
});

router.get('/details', async (req, res) => {
    // Get details about a specific event
    const {
        eid
    } = req.query;

    if(!eid)
        return res.status(406).send({"error": "No event ID provided"});

    return sql.connect(config).then(async(pool) => {
        // Get the event's information
        let request = `SELECT * FROM Events WHERE eid='${eid}'`;
        let results = await pool.query(request);

        if(results.recordset.length <= 0)
            return res.status(404).send({"error": "Event information not found"});

        // Store our event information
        const eventInformation = results.recordset[0];
        
        // Get ratings
        request = `SELECT AVG(Cast(numStars AS FLOAT)) AS avgRating FROM Ratings WHERE eid='${eid}'`;
        results = await pool.query(request);

        eventInformation["averageRating"] = results.recordset[0]["avgRating"] ?? 0;

        // Get comments
        request = `SELECT c.cid, c.uid, c.description, c.created, u.username FROM Comments c, CommentsOnEvents coe, Users u WHERE c.cid=coe.cid AND coe.eid='${eid}' AND coe.cid=c.cid AND c.uid=u.uid ORDER BY created asc`
        results = await pool.query(request);

        eventInformation["comments"] = results.recordset;

        return res.status(200).send(eventInformation);
    });
});

router.get('/queue', async (req, res) => {
    // Get the queue of events to approve
    return sql.connect(config).then(async(pool) => {
        const request = `SELECT * FROM Events WHERE approved='FALSE'`
        return (await pool.query(request)).recordset;
    });
});

module.exports = router;
