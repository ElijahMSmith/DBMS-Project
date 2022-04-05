const sql = require('mssql');
const config = require('./config').dbconfig;
const express = require('express');

const app = express();

// Import routes
const authRoutes = require('./routes/authentication');

// Middlewares
app.use(express.json());
app.use('/auth', authRoutes);

sql.connect(config)
    .then(async (pool) => {
        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U') 
            CREATE TABLE Users (uid CHAR(36) PRIMARY KEY, username CHAR(20), email CHAR(30) UNIQUE, pass CHAR(20), unid CHAR(36), permLevel TINYINT)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Universities' and xtype='U') 
            CREATE TABLE Universities (unid CHAR(36) PRIMARY KEY, name CHAR(40) UNIQUE, description CHAR(300), numStudents INTEGER)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RSOs' and xtype='U') 
            CREATE TABLE RSOs (rsoid CHAR(36) PRIMARY KEY, name CHAR(40) UNIQUE, description CHAR(300), numMembers INTEGER)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Manages' and xtype='U') 
            CREATE TABLE Manages (unid CHAR(36) PRIMARY KEY, uid CHAR(36), FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (unid) REFERENCES Universities)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Affiliated' and xtype='U') 
                CREATE TABLE Affiliated (unid CHAR(36), uid CHAR(36) PRIMARY KEY, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (unid) REFERENCES Universities)
`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Owns' and xtype='U') 
                CREATE TABLE Owns(rsoid CHAR(36) PRIMARY KEY, uid CHAR(36), FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (rsoid) REFERENCES RSOs)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MemberOf' and xtype='U') 
                CREATE TABLE MemberOf (rsoid CHAR(36), uid CHAR(36), FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (rsoid) REFERENCES RSOs)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PictureOf' and xtype='U') 
                CREATE TABLE PictureOf (unid CHAR(36) PRIMARY KEY, url CHAR(150), FOREIGN KEY (unid) REFERENCES Universities)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UniversityRSOs' and xtype='U') 
                CREATE TABLE UniversityRSOs (rsoid CHAR(36) PRIMARY KEY, unid CHAR(36), FOREIGN KEY (rsoid) REFERENCES RSOs, FOREIGN KEY (unid) REFERENCES Universities)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' and xtype='U') 
                        CREATE TABLE Comments (cid CHAR(36) PRIMARY KEY, description CHAR(300), date DATE)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' and xtype='U') 
                CREATE TABLE Comments (cid CHAR(36) PRIMARY KEY, description CHAR(300), date DATE)`
        );

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CommentsOn' and xtype='U') 
                CREATE TABLE CommentsOn (cid CHAR(36) PRIMARY KEY, uid CHAR(36), eid CHAR(36), FOREIGN KEY (cid) REFERENCES Comments, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (eid) REFERENCES Events)`
        );
    })
    .catch((err) => console.error(err));

app.listen(config.port, () => {
    console.log(`App is listening at http://localhost:${config.port}`);
});
