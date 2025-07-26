const express = require('express');
const cors = require('cors');
const initializeDbAndTables = require('./database'); 


const loansRouter = require('./routes/loans');
const customersRouter = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(cors());

let dbInstance; 

const startServer = async () => {
    try {
        dbInstance = await initializeDbAndTables(); // Initialize DB and get the db object
        console.log('Database connection established. Tables verified/created.');

        // Mount the routers with their base paths
        // These paths determine how requests are prefixed before hitting the router's internal routes.
        app.use('/api/v1', loansRouter(dbInstance));    // Handles /api/v1/loans, /api/v1/loans/active, /api/v1/loans/:loanId/payments, /api/v1/loans/:loanId/ledger
        app.use('/api/v1/customers', customersRouter(dbInstance)); // Handles /api/v1/customers, /api/v1/customers/:customerId/overview

        // Basic health check route
        app.get('/', (req, res) => {
            res.send('Bank Lending System API is running!');
        });

        // Global error handling middleware 
        app.use((err, req, res, next) => {
            console.error('Global Error Handler caught an error:', err.stack);
            res.status(500).json({ message: 'Something went wrong on the server.', error: err.message });
        });

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log('Backend setup complete and running!');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
