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
            CREATE TABLE Users (uid CHAR(36) PRIMARY KEY, username CHAR(64), email CHAR(64) UNIQUE, pass CHAR(64), unid CHAR(36), permLevel TINYINT)`
        ).catch((err) => console.error("Users Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Universities' and xtype='U') 
            CREATE TABLE Universities (unid CHAR(36) PRIMARY KEY, name CHAR(40) UNIQUE, description CHAR(300), numStudents INTEGER)`
        ).catch((err) => console.error("Universities Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RSOs' and xtype='U') 
            CREATE TABLE RSOs (rsoid CHAR(36) PRIMARY KEY, uid CHAR(36), unid CHAR(36), name CHAR(40) UNIQUE, description CHAR(300), numMembers INTEGER, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (unid) REFERENCES Universities)`
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
                CREATE TABLE PictureOf (unid CHAR(36) PRIMARY KEY, url CHAR(150), FOREIGN KEY (unid) REFERENCES Universities)`
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
                        CREATE TABLE Comments (cid CHAR(36) PRIMARY KEY, description CHAR(300), date DATE)`
        ).catch((err) => console.error("Comments Error: " + err));

        pool.query(
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CommentsOnEvents' and xtype='U') 
                        CREATE TABLE CommentsOnEvents (cid CHAR(36) PRIMARY KEY, uid CHAR(36), eid CHAR(36), FOREIGN KEY (cid) REFERENCES Comments, FOREIGN KEY (uid) REFERENCES Users, FOREIGN KEY (eid) REFERENCES Events)`
        ).catch((err) => console.error("CommentsOnEvents Error: " + err));

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
                            name CHAR(36),
                            description CHAR(512),
                            category CHAR(36),
                            time TIME,
                            date DATE,
                            location CHAR(64),
                            contactPhone CHAR(16),
                            contactEmail CHAR(64),
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
