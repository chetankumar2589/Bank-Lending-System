const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { v4: uuidv4 } = require('uuid'); 

const dbPath = path.join(__dirname, 'bank.db'); 
let db = null;

const initializeDbAndTables = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

    
        await db.run('PRAGMA foreign_keys = ON;');

        // Create Customers Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS Customers (
                customer_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Loans Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS Loans (
                loan_id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                principal_amount DECIMAL(10, 2) NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                interest_rate DECIMAL(5, 2) NOT NULL,
                loan_period_years INTEGER NOT NULL,
                monthly_emi DECIMAL(10, 2) NOT NULL,
                status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAID_OFF'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
            );
        `);

        // Create Payments Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS Payments (
                payment_id TEXT PRIMARY KEY,
                loan_id TEXT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_type TEXT NOT NULL, -- 'EMI', 'LUMP_SUM'
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (loan_id) REFERENCES Loans(loan_id)
            );
        `);

        console.log('Database initialized and tables created successfully.');

       
        await addSampleData();

        return db; 

    } catch (error) {
        console.error(`DB Initialization Error: ${error.message}`);
        process.exit(1); 
    }
};

const addSampleData = async () => {
    
    const existingCustomers = await db.all('SELECT * FROM Customers;');
    if (existingCustomers.length === 0) {
        console.log('Adding sample customer data...');
        await db.run(
            `INSERT INTO Customers (customer_id, name) VALUES (?, ?), (?, ?);`,
            [uuidv4(), 'Alice Smith', uuidv4(), 'Bob Johnson']
        );
        console.log('Sample customers added.');
    } else {
        console.log('Customers already exist, skipping sample data insertion.');
    }

    
};

module.exports = initializeDbAndTables; 