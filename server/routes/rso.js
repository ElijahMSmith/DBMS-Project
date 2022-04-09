const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
    // POST - updating or creating an RSO
    let { rsoid, uid, unid, name, description, numMembers } = req.body;

    // Establish database connection
    return sql
        .connect(config)
        .then(async (pool) => {
            // Once we have our database connection, we need to check
            // and see what kind of operation we're performing.
            let query = '';
            if (!rsoid) {
                // RSOID does not exist - this is creating an RSO
                // Create the RSOID
                rsoid = uuidv4();

                // Build our query
                query = `INSERT INTO RSOs VALUES
            ('${rsoid}', '${uid}', '${unid}', '${name}', '${description}', '${numMembers}')`;
            } else {
                // RSOID does exist - this is updating an RSO
                query = `UPDATE RSOs
            SET uid='${uid}', unid='${unid}', name='${name}', description='${description}', numMembers='${numMembers}'
            WHERE rsoid='${rsoid}'`;
            }

            // Perform our query
            const result = await pool.query(query);

            // Check to see if the change occurred
            if (result.rowsAffected <= 0)
                return res.status(406).send({
                    error: 'No Changes Made. Either insertion failed, or no matching RSOID exists.',
                });

            return res.status(200).send({
                rsoid,
                uid,
                unid,
                name,
                description,
                numMembers,
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ error: err });
        });
});

router.get('/', async (req, res) => {
    // GET - getting a specific RSO, all RSOs for a given user, or all RSOs for a given university
    // Determine which case we're evaluating:
    const { unid, uid, rsoid } = req.query;

    return sql.connect(config).then(async (pool) => {
        // Case 1: UNID is provided
        if (unid) {
            // UNID is provided, which means we're looking for all of the RSOs
            // that are part of the given university
            const query = `SELECT * FROM RSOs WHERE unid='${unid}'`;
            const result = await pool.query(query);

            return res.status(200).send({ rsos: result.recordset });
        }

        // Case 2: UID is provided
        if (uid) {
            // UID is provided, which means we're looking for all of the RSOs
            // that is user is a part of.
            const query = `SELECT r.* FROM RSOs r, MemberOf m WHERE m.uid='${uid}' AND r.rsoid=m.rsoid`;
            const result = await pool.query(query);

            return res.status(200).send({ rsos: result.recordset });
        }

        // Case 3: Fetch a specific RSO
        if (rsoid) {
            // RSOID is provided, which means we're looking for just one specific
            // RSO
            const query = `SELECT * FROM RSOs WHERE rsoid='${rsoid}'`;
            const result = await pool.query(query);

            return res.status(200).send(result.recordset[0]);
        }

        // Case 4: Just give them everything
        const query = `SELECT * FROM RSOs`;
        const result = await pool.query(query);

        return res.status(200).send({ rsos: result.recordset });
    });
});

router.post('/membership', async (req, res) => {
    // POST - Adjust a user's membership for a given RSO
    const { uid, rsoid } = req.body;

    // Connect, check to see if the relationship exists, if so, do nothing.
    // If it doesn't, post it.
    return sql
        .connect(config)
        .then(async (pool) => {
            let query = `SELECT * FROM MemberOf WHERE rsoid='${rsoid}' AND uid='${uid}'`;
            let result = await pool.query(query);

            // If there is already a relationship... do nothing
            if (result.recordset.length > 0)
                return res.status(406).send({
                    error: 'A relationship between that student and RSO already exists',
                });

            // If there isn't, we need to create it
            query = `INSERT INTO MemberOf VALUES ('${rsoid}', '${uid}')`;
            result = await pool.query(query);

            // Check that a change was made
            if (result.rowsAffected > 0)
                return res.status(200).send({ rsoid, uid });

            // Otherwise...
            return res
                .status(500)
                .send({ error: 'An unknown internal server error occured.' });
        })
        .catch((err) => {
            return res.status(500).send({ error: err });
        });
});

router.delete('/membership', async (req, res) => {
    // POST - Delete a user's membership for a given RSO
    const { uid, rsoid } = req.body;

    // Connect, check to see if the relationship exists, if so, kill it
    // If it doesn't, do nothing
    return sql
        .connect(config)
        .then(async (pool) => {
            let query = `SELECT * FROM MemberOf WHERE rsoid='${rsoid}' AND uid='${uid}'`;
            let result = await pool.query(query);

            // If there is already a relationship... do nothing
            if (result.recordset.length <= 0)
                return res.status(406).send({
                    error: 'A relationship between that student and RSO does not exist',
                });

            // If there isn't, we need to create it
            query = `DELETE FROM MemberOf WHERE rsoid='${rsoid}' AND uid='${uid}'`;
            result = await pool.query(query);

            // Check that a change was made
            if (result.rowsAffected > 0)
                return res
                    .status(200)
                    .send({ message: 'Relationship Deleted' });

            // Otherwise...
            return res
                .status(500)
                .send({ error: 'An unknown internal server error occured.' });
        })
        .catch((err) => {
            return res.status(500).send({ error: err });
        });
});

module.exports = router;
