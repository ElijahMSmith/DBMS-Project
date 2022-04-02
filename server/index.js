const mysql = require("mysql");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

var config = {
	host: "univents.database.windows.net",
	user: process.env.ADMIN_LOGIN,
	password: process.env.ADMIN_PASS,
	database: "DBMS",
	port: 1433,
	ssl: {
		ca: fs.readFileSync("./BaltimoreCyberTrustRoot.crt.pem"),
	},
};

console.log(config);

const conn = new mysql.createConnection(config);

conn.connect(function (err) {
	if (err) {
		console.log("!!! Cannot connect !!! Error:");
		throw err;
	} else {
		console.log("Connection established.");
		queryDatabase();
	}
});

function queryDatabase() {
	conn.query(
		"DROP TABLE IF EXISTS inventory;",
		function (err, results, fields) {
			if (err) throw err;
			console.log("Dropped inventory table if existed.");
		}
	);
	conn.query(
		"CREATE TABLE inventory (id serial PRIMARY KEY, name VARCHAR(50), quantity INTEGER);",
		function (err, results, fields) {
			if (err) throw err;
			console.log("Created inventory table.");
		}
	);
	conn.query(
		"INSERT INTO inventory (name, quantity) VALUES (?, ?);",
		["banana", 150],
		function (err, results, fields) {
			if (err) throw err;
			else console.log("Inserted " + results.affectedRows + " row(s).");
		}
	);
	conn.query(
		"INSERT INTO inventory (name, quantity) VALUES (?, ?);",
		["orange", 154],
		function (err, results, fields) {
			if (err) throw err;
			console.log("Inserted " + results.affectedRows + " row(s).");
		}
	);
	conn.query(
		"INSERT INTO inventory (name, quantity) VALUES (?, ?);",
		["apple", 100],
		function (err, results, fields) {
			if (err) throw err;
			console.log("Inserted " + results.affectedRows + " row(s).");
		}
	);
	conn.end(function (err) {
		if (err) throw err;
		else console.log("Done.");
	});
}
