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
        const request = `SELECT * FROM Universities WHERE unid='${unid}'`
        const response = await pool.query(request);

        // Respond with a 404 if no data found.
        if(response.recordset.length <= 0)
            return res.status(404).send({"error": "No University Found with that UNID"});

        // Return the result
        return res.status(200).send(response.recordset[0]);
    }).catch((error) => {
        return res.status(500).send({"error": error});
    });
});

module.exports = router;