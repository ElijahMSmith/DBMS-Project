const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

// Registration route
router.post('/register', async (req, res) => {
    const { email, username, password, unid } = req.body;

    // Connect to DB
    const connectionPromise = sql.connect(config);

    return connectionPromise
        .then(async (pool) => {
            // Check if email already exists in the Users table
            let request = `SELECT * FROM Users WHERE email = '${email}'`;
            let result = await pool.query(request);

            // If result contains any data, then we return with some information about incorrect things
            if (result.recordset.length > 0)
                return res.status(406).send({
                    error: 'An account with that email already exists',
                });

            // Next: Generate the user's uuid
            const newUserID = uuidv4();

            // Push this user information into our database
            request = `INSERT INTO Users VALUES ('${newUserID}', '${username}', '${email}', '${password}', '${unid}', 1)`;
            result = await pool.query(request);

            // Something wrong happened!
            if (result.rowsAffected[0] !== 1)
                return res.status(500).send({
                    error: 'An unknown internal server error occurred during account creation',
                });

            // Return the newly-created user object
            return res.status(200).send({
                uid: newUserID,
                username: username,
                email: email,
                unid: unid,
                permLevel: 1,
            });
        })
        .catch((err) => res.status(500).send(err));
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Connect to DB
    const connectionPromise = sql.connect(config);
    return connectionPromise
        .then(async (pool) => {
            // Get the user information from the server
            const request = `SELECT * FROM Users WHERE username='${username}'`;
            const result = await pool.query(request);

            // Check if user data exists
            if (result.recordset.length <= 0)
                return res.status(406).send({ error: 'Unknown Username' });

            const userData = result.recordset[0];

            // Check if password matches
            if (userData['pass'] !== password)
                return res.status(406).send({ error: 'Incorrect Password' });

            delete userData['pass'];

            // Otherwise, return user data
            return res.status(200).send(userData);
        })
        .catch((err) => {
            return res.status(500).send({ error: err });
        });
});

// Update user information
router.post('/update', async (req, res) => {
    const { uid, username, email, unid, permLevel } = req.body;

    // Connect to DB
    const connectionPromise = sql.connect(config);
    return connectionPromise
        .then(async (pool) => {
            let request = '';
            if (unid == null) {
                return res.status(500).send({ error: 'No uid provided' });
            } else {
                if (!permLevel)
                    request = `UPDATE Users
                    SET username='${username}', email='${email}', unid='${unid}'
                    WHERE uid='${uid}'`;
                else
                    request = `UPDATE Users
                    SET permLevel='${permLevel ?? 1}'
                    WHERE uid='${uid}'`;

                // Dispatch the query
                const result = await pool.query(request);
                if (result.rowsAffected <= 0)
                    return res.status(406).send({
                        error: 'No Changes Made. The User ID or other inputs were invalid.',
                    });

                return res.status(200).send();
            }
        })
        .catch((err) => {
            return res.status(500).send({ error: err });
        });
});

module.exports = router;
