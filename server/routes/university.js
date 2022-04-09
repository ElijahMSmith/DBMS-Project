const config = require('../config').dbconfig;
const router = require('express').Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

router.post('/', async(req, res) => {
    let {
        unid,
        name,
        description,
        numStudents
    } = req.body;
    // Edit / Create a university
    console.log(unid);

    const connectionPromise = sql.connect(config);
    return connectionPromise.then(async (pool) => {
        // Determine if this is an INSERT or UPDATE
        // If unid is defined, then we're UPDATE
        // If unid is undefined, then we're INSERT
        
        let request = '';
        if(unid == null) {
            // Generate a UUID for this university
            unid = uuidv4();
            
            // Update our request with INSERT Information
            request = `INSERT INTO Universities VALUES
                ('${unid}', '${name}', '${description}', '${numStudents}')`;
        } else {
            request = `UPDATE Universities
                SET name='${name}', description='${description}', numStudents='${numStudents}'
                WHERE unid='${unid}'`;
        }

        // Dispatch the query
        const result = await pool.query(request);
        if(result.rowsAffected <= 0)
            return res.status(406).send({"error": "No Changes Made. University ID might not be found, or, some issue with the input data"})

        return res.status(200).send({
            "unid": unid,
            "name": name,
            "description": description,
            "numStudents": numStudents
        });
    }).catch((err) => {
        return res.status(500).send({"error": err});
    });
});

router.get('/', async(req, res) => {
    // Get a specific univeristy's information
    const unid = req.query.unid;

    const connectionPromise = sql.connect(config);
    return connectionPromise.then(async (pool) => {
        // Get all universities
        if(unid == undefined)
        {
            // Get the list of all universities
            const request = 'SELECT * FROM Universities';
            const response = await pool.query(request);

            // Return the result
            return res.status(200).send({"universities": response.recordset});
        }

        // Get a specific university's information
        let request = `SELECT * FROM Universities WHERE unid='${unid}'`
        let response = await pool.query(request);

        // Respond with a 404 if no data found.
        if(response.recordset.length <= 0)
            return res.status(404).send({"error": "No University Found with that UNID"});

        const universityData = response.recordset[0];

        // Get that University's photos
        request = `SELECT url FROM PictureOf WHERE unid='${unid}'`
        response = await pool.query(request);

        const photoArray = response.recordset.map((value) => value["url"]);
        universityData["photos"] = photoArray;

        // Return the result
        return res.status(200).send(universityData);
    }).catch((error) => {
        return res.status(500).send({"error": error});
    });
});

router.post('/photo', async(req, res) => {
    const {
        imageURL,
        unid
    } = req.body;

    return sql.connect(config).then(async(pool) => {
        // See if the URL and university is already in the database
        let query = `SELECT * FROM PictureOf WHERE unid='${unid}' AND url='${imageURL}'`;
        let result = await pool.query(query);

        // If so, do nothing
        if(result.recordset.length > 0)
            return res.status(406).send({"error": "An image with that URL already exists for that university"});
        
        // Otherwise, add the relation
        query = `INSERT INTO PictureOf VALUES ('${unid}', '${imageURL}')`;
        result = await pool.query(query);

        if(result.rowsAffected > 0)
            return res.status(200).send({"message": "URL added successfully"});
        
        return res.status(500).send({"error": "Failed to add that URL"});
    }).catch((error) => {
        return res.status(500).send({"error": error});
    });
});

router.delete('/photo', async(req, res) => {
    const {
        imageURL,
        unid
    } = req.body;

    return sql.connect.then(async(pool) => {
        // See if the URL and university is already in the database
        let query = `SELECT * FROM PictureOf WHERE unid='${unid}' AND url='${imageURL}'`;
        let result = await pool.query(query);

        // If not, do nothing
        if(result.recordset.length == 0)
            return res.status(404).send({"error": "An image with that URL already does not exist for that university"});
        
        // Otherwise, delete the relation
        query = `DELETE FROM PictureOf WHERE unid='${unid}' AND url='${imageURL}'`;
        result = await pool.query(query);

        if(result.rowsAffected > 0)
            return res.status(200).send({"message": "URL removed successfully"});
        
        return res.status(500).send({"error": "Failed to remove that URL"});
    }).catch((error) => {
        return res.status(500).send({"error": error});
    });
});

module.exports = router;