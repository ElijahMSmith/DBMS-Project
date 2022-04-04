const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

/*
app.get('/test', (req, res) => {
    // These are our 'stored procedures'
    const query = `SELECT * FROM DBMS`;
    const request = new sql.Request();
    request.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.send(result);
    });
});
*/

// Registration route
router.post('/register', async (req, res) => {
    const {
        email,
        username,
        password,
        uniName,
        userType, // 1 = student, 2 = admin, 3 = superadmin
    } = req.body;

    // Check if email already exists in any tables
    // Insert user into the table according to userType
    // Get unid from university table if that uniName already exists,
    // Otherwise give a new random id using
    // uuidv4() // ⇨ '630eb68f-e0fa-5ecc-887a-7c7a62614681'

    // Return the user object needed

    sql.connect(config)
        .then(async (pool) => {
            const request = `SELECT * FROM Student S WHERE S.email = '${email}'`;
            console.log(request);
            const result = await pool.query(request);
            console.dir(result);
            return res.status(200).send({ result });
        })
        .catch((error) => res.status(400).send({ error }));
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req;

    return res.status(200).send({
        // uid, username, password, all the info based on their user type
    });
});

module.exports = router;
