const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // API 4: ACCOUNT OVERVIEW: View all loans for a customer
    // Endpoint: GET /api/v1/customers/{customer_id}/overview
    // This route should match '/:customerId/overview' because the router is mounted at '/api/v1/customers'
    router.get('/:customerId/overview', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit /customers/:customerId/overview for ID: ${req.params.customerId}`); // Debug log
        try {
            const { customerId } = req.params;

            // --- Check if customer exists ---
            const customer = await db.get(`SELECT customer_id, name FROM Customers WHERE customer_id = ?;`, [customerId]);
            if (!customer) {
                console.log(`[DEBUG] Customer ID '${customerId}' not found.`); // Debug log
                return res.status(404).json({ message: `Customer with ID '${customerId}' not found.` });
            }

            // --- Fetch all loans for the customer ---
            const customerLoans = await db.all(
                `SELECT loan_id, principal_amount, total_amount, interest_rate, loan_period_years, monthly_emi, status 
                 FROM Loans 
                 WHERE customer_id = ? ORDER BY created_at DESC;`,
                [customerId]
            );

            if (customerLoans.length === 0) {
                // If customer exists but has no loans
                console.log(`[DEBUG] No loans found for customer ID '${customerId}'.`); // Debug log
                return res.status(404).json({ message: `No loans found for customer with ID '${customerId}'.` });
            }

            // --- Process each loan to add 'amount_paid' and 'emis_left' ---
            const loansWithDetails = [];
            for (const loan of customerLoans) {
                // Fetch payments for the current loan
                const payments = await db.all(
                    `SELECT amount FROM Payments WHERE loan_id = ?;`,
                    [loan.loan_id]
                );

                const amountPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
                const currentBalance = parseFloat(loan.total_amount); 

                let emisLeft = 0;
                const monthlyEmi = parseFloat(loan.monthly_emi);
                if (currentBalance > 0 && monthlyEmi > 0) {
                    emisLeft = Math.ceil(currentBalance / monthlyEmi);
                }

                const originalTotalInterest = parseFloat((parseFloat(loan.principal_amount) * parseInt(loan.loan_period_years) * parseFloat(loan.interest_rate) / 100).toFixed(2));
                const originalTotalAmount = parseFloat((parseFloat(loan.principal_amount) + originalTotalInterest).toFixed(2));


                loansWithDetails.push({
                    loan_id: loan.loan_id,
                    principal: parseFloat(loan.principal_amount.toFixed(2)),
                    total_amount: originalTotalAmount, 
                    total_interest: originalTotalInterest, 
                    emi_amount: parseFloat(monthlyEmi.toFixed(2)),
                    amount_paid: parseFloat(amountPaid.toFixed(2)),
                    emis_left: emisLeft,
                    status: loan.status 
                });
            }

            // --- Success Response ---
            console.log(`[DEBUG] Successfully fetched overview for customer ID '${customerId}'.`); // Debug log
            res.status(200).json({
                customer_id: customerId,
                total_loans: loansWithDetails.length,
                loans: loansWithDetails
            });

        } catch (error) {
            console.error('Error fetching customer overview:', error.message);
            next(error); // Pass the error to the global error handling middleware
        }
    });

    // API: GET /api/v1/customers - Get all customers (for LoanCreationForm dropdown)
    // This route is specifically for fetching a list of all customers.
    router.get('/', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit /customers/ (get all customers)`); 
        try {
            const customers = await db.all(`SELECT customer_id, name FROM Customers ORDER BY name ASC;`);
            console.log(`[DEBUG] Successfully fetched ${customers.length} customers.`); 
            res.status(200).json(customers);
        } catch (error) {
            console.error('Error fetching all customers:', error);
            next(error); 
        }
    });

    return router; 
};
