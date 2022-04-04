const dotenv = require('dotenv');
dotenv.config();

exports.dbconfig = {
    server: process.env.SERVER,
    user: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASS,
    database: process.env.DB,
    port: process.env.PORT || 1433,
    options: {
        encrypt: true,
    },
};
