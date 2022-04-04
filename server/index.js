const sql = require('mssql');
const config = require('./config').dbconfig;
const express = require('express');

const app = express();

// Import routes
const authRoutes = require('./routes/authentication');

// Middlewares
app.use(express.json());
app.use('/auth', authRoutes);

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
/*
        CREATE TABLE if not exists Admin (
            uid CHAR(36),
            username CHAR(20),
            email CHAR(30),
            password CHAR(20),
            unid CHAR(36)
        )


        CREATE TABLE if not exists SuperAdmin (
            uid CHAR(36),
            username CHAR(20),
            email CHAR(30),
            password CHAR(20),
            unid CHAR(36)
        )
    */

// TODO: CREATE ALL TABLES IF THEY DON'T EXIST
sql.connect(config)
    .then(async (pool) => {
        await pool.query('DROP TABLE IF EXISTS Student')

        const result = await pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Student' and xtype='U') 
            CREATE TABLE Student (uid CHAR(36) PRIMARY KEY, username CHAR(20), email CHAR(30) UNIQUE, pass CHAR(20), unid CHAR(36))`
        );

        console.dir(result);
    })
    .catch((err) => console.error(err));

app.listen(config.port, () => {
    console.log(`App is listening at http://localhost:${config.port}`);
});
