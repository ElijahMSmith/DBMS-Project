const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

/**
 * feedback.js contains routes pertaining to ratings and comments
 */

router.post('/comment', async (req, res) => {
    // Create / edit a comment for an event
    let { cid, uid, eid, description } = req.body;

    return sql
        .connect(config)
        .then(async (pool) => {
            // Creating a new comment requires uid, description
            if (!cid && uid && eid && description) {
                // Create a new entry in the COMMENTS table, then create
                // a new entry in the commentsOnEvents table
                cid = uuidv4();

                let request = `INSERT INTO Comments VALUES ('${cid}', '${eid}', '${description}', '${uid}', SYSUTCDATETIME())`;
                let result = await pool.query(request);
                if (result.rowsAffected <= 0)
                    return res.status(500).send({
                        error: 'Failed to create a comment with that information',
                    });

                // Insert into the commentsOnEvents table
                request = `INSERT INTO CommentsOnEvents VALUES ('${cid}', '${eid}')`;
                result = await pool.query(request);
                if (result.rowsAffected <= 0)
                    return res.status(500).send({
                        error: 'Failed to create a comment with that information',
                    });

                // return a positive result
                return res.status(200).send({
                    cid,
                    uid,
                    description,
                });
            } else if (cid && description) {
                // Updating a comment requires cid, description
                // Update the entry in the comments table
                const request = `UPDATE Comments SET description='${description}' WHERE cid='${cid}'`;
                const result = await pool.query(request);
                if (result.rowsAffected <= 0)
                    return res.status(406).send({
                        error: 'Failed to update a comment with that CID',
                    });

                return res
                    .status(200)
                    .send({ message: 'Comment updated successfully' });
            }

            return res.status(500).send({
                error: 'One or more of cid or description not provided.',
            });
        })
        .catch((err) => {
            return res.status(500).send({ error: err });
        });
});

router.post('/rating', async (req, res) => {
    // Create / edit a rating for an event
    const { eid, uid, numStars } = req.body;

    return sql
        .connect(config)
        .then(async (pool) => {
            // First: check to see if a rating exists for this user/event pair.
            let request = `SELECT * FROM Ratings WHERE uid='${uid}' AND eid='${eid}'`;
            if ((await pool.query(request)).recordset.length > 0) {
                // We're updating a rating
                request = `UPDATE Ratings SET numStars='${numStars}' WHERE uid='${uid}' AND eid='${eid}'`;
                const result = await pool.query(request);

                if (result.rowsAffected <= 0)
                    return res.status(406).send({
                        error: 'Failed to update a rating with that UID and EID',
                    });

                return res
                    .status(200)
                    .send({ message: 'Rating updated successfully' });
            } else {
                // We're creating a rating
                request = `INSERT INTO Ratings VALUES ('${uid}', '${eid}', '${numStars}')`;
                const result = await pool.query(request);

                if (result.rowsAffected <= 0)
                    return res.status(406).send({
                        error: 'Failed to create a rating with that UID and EID',
                    });

                return res
                    .status(200)
                    .send({ message: 'Rating created successfully' });
            }
        })
        .catch((err) => {
            return res.status(500).send({ error: err });
        });
});

module.exports = router;
