const sql = require('mssql');
const config = require('./config').dbconfig;
const express = require('express');

const app = express();

const cors = require('cors');
app.use(
    cors({
        origin: '*',
    })
);

// Import routes
const authRoutes = require('./routes/authentication');
const uniRoutes = require('./routes/university');
const rsoRoutes = require('./routes/rso');
const eventRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback');

// Import tables
const initializeTables = require('./tables/tables');

// Middlewares
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/universities', uniRoutes);
app.use('/rsos', rsoRoutes);
app.use('/events', eventRoutes);
app.use('/feedback', feedbackRoutes);

sql.connect(config)
    .then(async (pool) => {
        initializeTables(pool);
    })
    .catch((err) => console.error('Total Error: ' + err));

app.listen(config.port, () => {
    console.log(`App is listening at http://localhost:${config.port}`);
});
