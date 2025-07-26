const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
    const router = express.Router();

    // API: GET /api/v1/loans/all - Get all loans (active and paid off) for Ledger dropdown
    router.get('/loans/all', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit /loans/all`);
        try {
            const allLoans = await db.all(
                `SELECT loan_id, customer_id, principal_amount, total_amount, monthly_emi, status FROM Loans ORDER BY created_at DESC;`
            );
            console.log(`[DEBUG] Successfully fetched ${allLoans.length} total loans.`);
            res.status(200).json(allLoans.map(loan => ({
                loan_id: loan.loan_id,
                customer_id: loan.customer_id,
                principal_amount: parseFloat(loan.principal_amount),
                total_amount: parseFloat(loan.total_amount), // Current remaining balance
                monthly_emi: parseFloat(loan.monthly_emi),
                status: loan.status
            })));
        } catch (error) {
            console.error('Error fetching all loans for ledger dropdown:', error);
            next(error);
        }
    });

    // Existing: API: GET /api/v1/loans/active - Get all active loans for PaymentForm dropdown
    router.get('/loans/active', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit /loans/active`);
        try {
            const activeLoans = await db.all(
                `SELECT loan_id, customer_id, principal_amount, total_amount, monthly_emi FROM Loans WHERE status = 'ACTIVE' ORDER BY created_at DESC;`
            );
            console.log(`[DEBUG] Successfully fetched ${activeLoans.length} active loans.`);
            res.status(200).json(activeLoans.map(loan => ({
                loan_id: loan.loan_id,
                customer_id: loan.customer_id,
                principal_amount: parseFloat(loan.principal_amount),
                total_amount: parseFloat(loan.total_amount), // Current remaining balance
                monthly_emi: parseFloat(loan.monthly_emi)
            })));
        } catch (error) {
            console.error('Error fetching all active loans:', error);
            next(error);
        }
    });

    // Existing: API 1: LEND: Create a new loan (POST /api/v1/loans)
    router.post('/loans', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit POST /loans`);
        try {
            const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

            // Input Validation
            if (!customer_id || typeof customer_id !== 'string') {
                return res.status(400).json({ message: 'Invalid customer_id.' });
            }
            if (isNaN(loan_amount) || loan_amount <= 0 || isNaN(loan_period_years) || loan_period_years <= 0 || isNaN(interest_rate_yearly) || interest_rate_yearly < 0) {
                return res.status(400).json({ message: 'Invalid input data. Please provide valid customer_id, positive loan_amount, positive loan_period_years, and non-negative interest_rate_yearly.' });
            }

            // Check if customer exists
            const customer = await db.get(`SELECT customer_id FROM Customers WHERE customer_id = ?`, [customer_id]);
            if (!customer) {
                return res.status(404).json({ message: `Customer with ID '${customer_id}' not found.` });
            }

            // Calculations
            const principal = parseFloat(loan_amount);
            const years = loan_period_years;
            const rate = interest_rate_yearly;

            const totalInterest = parseFloat((principal * years * (rate / 100)).toFixed(2));
            const totalAmountPayable = parseFloat((principal + totalInterest).toFixed(2));
            const totalMonths = years * 12;
            const monthlyEmi = totalMonths > 0 ? parseFloat((totalAmountPayable / totalMonths).toFixed(2)) : 0;

            const loan_id = uuidv4();

            await db.run(
                `INSERT INTO Loans (
                    loan_id, customer_id, principal_amount, total_amount, 
                    interest_rate, loan_period_years, monthly_emi, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [loan_id, customer_id, principal, totalAmountPayable, rate, years, monthlyEmi, 'ACTIVE']
            );

            res.status(201).json({
                loan_id: loan_id,
                customer_id: customer_id,
                total_amount_payable: totalAmountPayable,
                monthly_emi: monthlyEmi,
            });

        } catch (error) {
            console.error('Error in LEND API:', error);
            next(error);
        }
    });

    // Existing: API 2: PAYMENT: Record a payment for a loan (POST /api/v1/loans/{loan_id}/payments)
    router.post('/loans/:loanId/payments', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit POST /loans/:loanId/payments for ID: ${req.params.loanId}`);
        try {
            const { loanId } = req.params;
            const { amount, payment_type } = req.body;

            // Input validation
            const paymentAmount = parseFloat(amount);
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
                return res.status(400).json({ message: 'Invalid amount. Payment amount must be a positive number.' });
            }
            if (!['EMI', 'LUMP_SUM'].includes(payment_type)) {
                return res.status(400).json({ message: 'Invalid payment_type. Must be "EMI" or "LUMP_SUM".' });
            }

            const loan = await db.get(`SELECT total_amount, monthly_emi, status FROM Loans WHERE loan_id = ?`, [loanId]);

            if (!loan) {
                return res.status(404).json({ message: `Loan with ID '${loanId}' not found.` });
            }
            if (loan.status === 'PAID_OFF') {
                return res.status(400).json({ message: `Loan with ID '${loanId}' is already paid off.` });
            }

            let newRemainingBalance = parseFloat((loan.total_amount - paymentAmount).toFixed(2));
            let newLoanStatus = loan.status;

            if (newRemainingBalance < 0) {
                newRemainingBalance = 0;
            }

            if (newRemainingBalance === 0) {
                newLoanStatus = 'PAID_OFF';
            }

            const emisLeft = loan.monthly_emi > 0 ? Math.ceil(newRemainingBalance / loan.monthly_emi) : 0;

            const payment_id = uuidv4();

            await db.run('BEGIN TRANSACTION;');

            try {
                await db.run(
                    `INSERT INTO Payments (payment_id, loan_id, amount, payment_type, payment_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [payment_id, loanId, paymentAmount, payment_type]
                );

                await db.run(
                    `UPDATE Loans SET total_amount = ?, status = ? WHERE loan_id = ?`,
                    [newRemainingBalance, newLoanStatus, loanId]
                );

                await db.run('COMMIT;');

                res.status(200).json({
                    payment_id: payment_id,
                    loan_id: loanId,
                    message: 'Payment recorded successfully.',
                    remaining_balance: newRemainingBalance,
                    emis_left: emisLeft,
                });

            } catch (transactionError) {
                await db.run('ROLLBACK;');
                throw transactionError;
            }

        } catch (error) {
            console.error('Error in PAYMENT API:', error);
            next(error);
        }
    });

    // Existing: API 3: LEDGER: View loan details and transaction history (GET /api/v1/loans/{loan_id}/ledger)
    router.get('/loans/:loanId/ledger', async (req, res, next) => {
        console.log(`[DEBUG] Attempting to hit GET /loans/:loanId/ledger for ID: ${req.params.loanId}`);
        try {
            const { loanId } = req.params;

            const loan = await db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loanId]);
            if (!loan) {
                return res.status(404).json({ message: `Loan with ID '${loanId}' not found.` });
            }

            const payments = await db.all(
                `SELECT payment_id AS transaction_id, amount, payment_type AS type, payment_date AS date FROM Payments WHERE loan_id = ? ORDER BY payment_date ASC;`,
                [loanId]
            );

            const amountPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
            const balanceAmount = parseFloat(loan.total_amount);
            let emisLeft = 0;
            const monthlyEmi = parseFloat(loan.monthly_emi);
            if (balanceAmount > 0 && monthlyEmi > 0) {
                emisLeft = Math.ceil(balanceAmount / monthlyEmi);
            }

            const originalTotalInterest = parseFloat((loan.principal_amount * loan.loan_period_years * loan.interest_rate / 100).toFixed(2));
            const originalTotalAmountPayable = parseFloat((loan.principal_amount + originalTotalInterest).toFixed(2));

            res.status(200).json({
                loan_id: loan.loan_id,
                customer_id: loan.customer_id,
                principal: parseFloat(loan.principal_amount.toFixed(2)),
                total_amount: originalTotalAmountPayable,
                monthly_emi: monthlyEmi,
                amount_paid: parseFloat(amountPaid.toFixed(2)),
                balance_amount: balanceAmount,
                emis_left: emisLeft,
                transactions: payments.map(p => ({
                    transaction_id: p.transaction_id,
                    date: p.date,
                    amount: parseFloat(p.amount.toFixed(2)),
                    type: p.type
                })),
            });

        } catch (error) {
            console.error('Error in LEDGER API:', error.message);
            next(error);
        }
    });
    
    return router;
};
