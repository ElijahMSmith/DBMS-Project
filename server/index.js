const sql = require('mssql');
const config = require('./config').dbconfig;
const express = require('express');

const app = express();

// Import routes
const authRoutes = require('./routes/authentication');
const uniRoutes  = require('./routes/university');

// Middlewares
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/universities', uniRoutes);

sql.connect(config)
    .then(async (pool) => {
        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U') 
            CREATE TABLE Users (uid CHAR(36) PRIMARY KEY, username VARCHAR(64), email VARCHAR(64) UNIQUE, pass VARCHAR(64), unid CHAR(36), permLevel TINYINT)`
        ).catch((err) => console.error("Users Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Universities' and xtype='U') 
            CREATE TABLE Universities (unid CHAR(36) PRIMARY KEY, name VARCHAR(40) UNIQUE, description VARCHAR(300), numStudents INTEGER)`
        ).catch((err) => console.error("Universities Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RSOs' and xtype='U') 
            CREATE TABLE RSOs (rsoid CHAR(36) PRIMARY KEY, uid CHAR(36), unid CHAR(36), name VARCHAR(40) UNIQUE, description VARCHAR(300), numMembers INTEGER, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (unid) REFERENCES Universities)`
        ).catch((err) => console.error("RSOs Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Manages' and xtype='U') 
            CREATE TABLE Manages (unid CHAR(36) PRIMARY KEY, uid CHAR(36), FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (unid) REFERENCES Universities)`
        ).catch((err) => console.error("Manages Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Affiliated' and xtype='U') 
                CREATE TABLE Affiliated (unid CHAR(36), uid CHAR(36) PRIMARY KEY, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (unid) REFERENCES Universities)`
        ).catch((err) => console.error("Affiliated Error: " + err));

        /*

        // Collapsed into RSO data directly - an RSO contains information about its owner. An RSO can only have one owner.

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Owns' and xtype='U') 
                CREATE TABLE Owns(rsoid CHAR(36) PRIMARY KEY, uid CHAR(36), FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (rsoid) REFERENCES RSOs)`
        );*/

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MemberOf' and xtype='U') 
                CREATE TABLE MemberOf (rsoid CHAR(36), uid CHAR(36), FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (rsoid) REFERENCES RSOs)`
        ).catch((err) => console.error("MemeberOf Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PictureOf' and xtype='U') 
                CREATE TABLE PictureOf (unid CHAR(36) PRIMARY KEY, url VARCHAR(150), FOREIGN KEY (unid) REFERENCES Universities)`
        ).catch((err) => console.error("PictureOf Error: " + err));

        /*
        
        // Collapsed into RSO data directly - an RSO contains the information about what univerisity is is a part of. An RSO can only be part of one university.

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UniversityRSOs' and xtype='U') 
                CREATE TABLE UniversityRSOs (rsoid CHAR(36) PRIMARY KEY, unid CHAR(36), FOREIGN KEY (rsoid) REFERENCES RSOs, FOREIGN KEY (unid) REFERENCES Universities)`
        );*/

        // Comment-Related Tables

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' and xtype='U') 
                        CREATE TABLE Comments (cid CHAR(36) PRIMARY KEY, eid CHAR(36), description VARCHAR(300), date DATE, FOREIGN KEY (eid) REFERENCES Events)`
        ).catch((err) => console.error("Comments Error: " + err));

        // Ratings

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Ratings' and xtype='U') 
                        CREATE TABLE Ratings (uid CHAR(36) PRIMARY KEY, eid CHAR(36), numStars INTEGER, date DATE, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (eid) REFERENCES Events)`
        ).catch((err) => console.error("Ratings Error: " + err));

        // Event Tables

        /*
         - Event type (public/private/rso) is determined by which field isn't null
         - Notable Fields:
           - uid (Creator of Event)
           - unid (University hosting event): if not null, then is private event
           - rsoid (RSO hosting event): if not null, then is RSO event
           - if both above are null, is public event.
        */

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Events' and xtype='U') 
                        CREATE TABLE Events (
                            eid CHAR(36) PRIMARY KEY,
                            uid CHAR(36),
                            unid CHAR(36),
                            rsoid CHAR(36),
                            name VARCHAR(36),
                            description VARCHAR(512),
                            category VARCHAR(36),
                            time TIME,
                            date DATE,
                            location VARCHAR(64),
                            contactPhone VARCHAR(16),
                            contactEmail VARCHAR(64),
                            published BIT,
                            approved BIT,
                            FOREIGN KEY (uid) REFERENCES Users,
                            FOREIGN KEY (unid) REFERENCES Universities,
                            FOREIGN KEY (rsoid) REFERENCES RSOs,
                            )`
        ).catch((err) => console.error("Events Error: " + err));
    })
    .catch((err) => console.error("Total Error: " + err));

app.listen(config.port, () => {
    console.log(`App is listening at http://localhost:${config.port}`);
});
