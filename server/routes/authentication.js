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
            if (result.rowsAffected.length <= 0)
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

// Update user information from the account page
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

// Get a user's account by either their uid or email
router.get('/find', async (req, res) => {
    // Extract the uid of the user from the query
    const { uid, email, emailList, uidList } = req.query;

    if (!uid && !email && !emailList && !uidList) {
        // 500 if nothing is provided
        return res.status(500).send({
            error: 'No uid, email, or email/uid list provided in the request query.',
        });
    }

    return sql.connect(config).then(async (pool) => {
        if (emailList) {
            const emailArray = JSON.parse(emailList);
            const users = [];
            for (let email of emailArray) {
                let query = `SELECT * FROM Users WHERE email='${email}'`;
                const result = await pool.query(query);

                // Only return the uid for safety concerns
                if (result.recordset.length > 0)
                    users.push(result.recordset[0].uid);
            }

            return res.status(200).send({ users });
        } else if (uidList) {
            const users = [];
            for (let iuid of JSON.parse(uidList)) {
                let query = `SELECT * FROM Users WHERE uid='${iuid}'`;
                const result = await pool.query(query);

                // Only return the username for safety concerns
                if (result.recordset.length > 0)
                    users.push({
                        uid: result.recordset[0].uid,
                        username: result.recordset[0].username,
                    });
            }

            return res.status(200).send({ users });
        } else {
            // Get one user by either uid or email, whichever is provided
            let query = uid
                ? `SELECT * FROM Users WHERE uid='${uid}'`
                : `SELECT * FROM Users WHERE email='${email}'`;
            const result = await pool.query(query);

            // Return the specific record found, if any
            if (result.recordset.length > 0)
                return res.status(200).send(result.recordset[0]);
            else return res.status(404).set({ error: 'User not found.' });
        }
    });
});

module.exports = router;
