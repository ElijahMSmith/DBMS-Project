const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

router.post('/', async(req, res) => {
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
        contactPhone,
        contactEmail,
        published,
        approved
    } = req.body;

    return sql.connect(config).then(async(pool) => {

        // First: Find out if we're overlapping times & locations
        let query = `SELECT COUNT(*) As ConflictingEvents FROM Events WHERE eid != '${eid}' AND location='${location}' AND ABS(DATEDIFF(hour, datetime, '${datetime}')) < 1`;
        console.log(query);
        let result = await pool.query(query);
        if(result.recordset[0]['ConflictingEvents'] > 0) {
            // There's an overlapping event!
            return res.status(406).send({"error": "That event takes place within an hour of another event at the same location"});
        }
        
        // Check for nullable items
        (!rsoid) ? rsoid = "NULL" : rsoid = `'${rsoid}'`;
        (!unid)  ? unid  = "NULL" : unid  = `'${unid}'`;

        // Determine the behavior we're doing - are we updating or creating?
        if(eid) {
            // The event exists - we're trying to update an event

            // Build the query
            query = `UPDATE Events 
                SET uid='${uid}', unid=${unid}, rsoid=${rsoid}, name='${name}',
                    description='${description}', category='${category}',
                    datetime='${datetime}', location='${location}',
                    contactPhone='${contactPhone}', contactEmail='${contactEmail}',
                    published='${published}', approved='${approved}'
                WHERE eid='${eid}'`;
        } else {
            // The event does not exist. We're trying to create an event
            
            // Create our event id
            eid = uuidv4();

            // Build the query
            query = `INSERT INTO Events VALUES ('${eid}', '${uid}', ${unid},
                ${rsoid}, '${name}', '${description}', '${category}', 
                '${location}', '${contactPhone}', '${contactEmail}',
                '${published}', '${approved}', '${datetime}')`;
        }

        // Dispatch the query
        result = await pool.query(query);
        if(result.rowsAffected <= 0)
            return res.status(406).send({"error": "No changes made. Either failed to insert a new event, or failed to find an event with this ID"});
        
        // Return success / event information
        return res.status(200).send({
            eid, uid, unid, rsoid, name, description, category, datetime, 
            location, contactPhone, contactEmail, published, approved
        });
    }).catch((e) => {
        return res.status(500).send({"error": "An unexpected error occured: " + e});
    });
});

router.delete('/', async(req, res) => {
    // DELETE - Delete an event
    const {
        eid
    } = req.body;

    return sql.connect(config).then(async(pool) => {
        // Perform delete operation
        const query = `DELETE FROM Events WHERE eid='${eid}'`;
        const result = await pool.query(query);

        // Return result
        if(result.rowsAffected >= 1)
            return res.status(200).send({"message": "Event deleted successfully"});

        return res.status(404).send({"error": "No event found with given EID"});
    }).catch((e) => {
        return res.status(500).send({"error": "An unexpected error occured: "+ e});
    });
});

router.get('/', async(req, res) => {
    // GET - List of events for a user, a university, or an RSO
    const {
        uid,
        unid,
        rsoid,
        all
    } = req.query;

    return sql.connect(config).then(async(pool) => {
        // Determine what we're fetching
        let query = 'SELECT * FROM Events ';

        // 1: All events for a given university
        if(unid) {
            query += `WHERE unid='${unid}' AND published='TRUE' `
        }

        // 2: All events for a given RSO
        else if(rsoid) {
            query += `WHERE rsoid='${rsoid}' AND published='TRUE' `
        }

        // 3: All events for a given User
        else if(uid) {
            // Users can have events:
            // 1: That they own (published/unpublished)
            // 2: That are from an RSO they are a part of
            // 3: That are from a University they are a part of
            // 4: That are public
            query += 
                `WHERE 
                    (uid='${uid}' OR (
                        (rsoid IN (SELECT rsoid FROM MemberOf WHERE uid='${uid}') OR
                        unid = (SELECT unid FROM Users WHERE uid='${uid}'))
                        AND published='TRUE'
                    ) OR (rsoid IS NULL AND unid IS NULL)) `;
        }

        // If the user doesn't want all events, only get the upcoming events
        if(!all)
            query += `AND DATEDIFF(hour, SYSDATETIME(), datetime) > 0 `
        
        // Order the events by "soonest first"
        query += `ORDER BY CONVERT(date, datetime) asc`

        // Get our data, returns
        const result = await pool.query(query);
        return res.status(200).send({"events": result.recordset});
    }).catch((e) => {
        return res.status(500).send({"error": "An unexpected error occured: " + e});
    });
})

router.get('/details', async(req, res) => {
    // Get details about a specific event

    // TODO: Include information about comments + rating
})

router.get('/queue', async(req, res) => {
    // Get the queue of events to approve

})

router.post('/approve', async(req, res) => {
    // POST - Approve a given event
})

module.exports = router;