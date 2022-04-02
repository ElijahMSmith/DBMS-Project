const dotenv = require('dotenv');
const sql = require('mssql');

const express = require('express');
const app = express();

dotenv.config();
const port = process.env.PORT || 1433;

var config = {
    server: process.env.SERVER,
    user: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASS,
    database: process.env.DB,
    port,
    options: {
        encrypt: true,
    },
};

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

sql.connect(config)
    .then(() => {
        console.log('Connected to database successfully!');
        // TODO: Drop tables if they exist
        // TODO: Create all tables
        // TODO: Insert dummy data for each table
        app.listen(port, () => {
            console.log(`App is listening at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log('Failed to open a SQL Database connection.', err.stack);
        process.exit(1);
    });
