const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

// Registration route
router.post('/register', async (req, res) => {
    const {
        email,
        username,
        password,
        unid,
    } = req.body;
    
    // Connect to DB
    const connectionPromise = sql.connect(config);

    return connectionPromise.then(async(pool) => {
        // Check if email already exists in the Users table
        let request = `SELECT * FROM Users WHERE email = '${email}'`;
        let result = await pool.query(request);

        // If result contains any data, then we return with some information about incorrect things
        if(result.recordset.length > 0)
            return res.status(406).send({"error": "An account with that email already exists"});
        
        // Next: Generate the user's uuid
        const newUserID = uuidv4();

        // Push this user information into our database
        request = `INSERT INTO Users VALUES ('${newUserID}', '${username}', '${email}', '${password}', '${unid}', 1)`;
        result = await pool.query(request);

        // Something wrong happened!
        if(result.rowsAffected != 1)
            return res.status(500).send({"error": "An unknown internal server error occured during account creation"});
        
        // Return the newly-created user object
        return res.status(200).send({
            "uid": newUserID,
            "username": username,
            "email": email,
            "unid": unid,
            "permLevel": 1
        });
    }).catch((err) => res.status(500).send(err));
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req;

    return res.status(200).send({
        // uid, username, password, all the info based on their user type
    });
});

module.exports = router;
