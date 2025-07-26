Bank Lending System
A comprehensive full-stack web application designed for banks to manage customer loans efficiently. This system facilitates loan origination, processes various types of payments (EMI and lump sum), provides detailed loan ledgers, and offers a holistic account overview for customers.

Table of Contents
Features

System Architecture

Technologies Used

Setup and Run Locally

Prerequisites

Backend Setup

Frontend Setup

API Endpoints

Project Structure

Future Enhancements

Author

Features
This application provides the following core functionalities:

Lend: Create new loans for customers with specified principal amount, loan period, and interest rate. Calculates total payable amount and monthly EMI.

Payment: Record payments against existing loans, supporting both EMI and lump-sum payments. Automatically recalculates remaining balance and EMIs left.

Ledger: View a complete transaction history and current status for any specific loan, including principal, total amount paid, balance, and remaining EMIs.

Account Overview: Get a summary of all loans associated with a particular customer, displaying key details for each loan.

Intuitive Dashboard: A clean, modern dashboard providing an overview of the system's capabilities and direct navigation to each core feature.

System Architecture
The application follows a standard three-tier architecture:

Presentation Layer (Frontend): Built with React (Class Components) for a sleek, modern user interface, handling all user interactions and data presentation.

Application Layer (Backend): A Node.js with Express.js server, exposing a RESTful API. It handles all business logic, data validation, and communication with the database.

Data Layer (Database): SQLite3 is used as a lightweight, file-based relational database for persistent storage of customer, loan, and payment data.

Technologies Used
Frontend:

React (Class Components)

React Router DOM (v6) for navigation

Standard CSS (for custom styling following a Swiss design aesthetic)

fetch API for HTTP requests

Backend:

Node.js

Express.js

SQLite3 database

sqlite (promise-based wrapper for sqlite3)

cors for cross-origin resource sharing

uuid for generating unique IDs

Setup and Run Locally
Follow these steps to get the project up and running on your local machine.

Prerequisites
Node.js (LTS version recommended) and npm (comes with Node.js) installed on your system.

Verify by running node -v and npm -v in your terminal.

Git (for cloning the repository).

Backend Setup
Clone the repository:

git clone https://github.com/YOUR_GITHUB_USERNAME/bank-lending-system.git
cd bank-lending-system

Navigate to the backend directory:

cd backend

Install backend dependencies:

npm install

Start the backend server:

node server.js

The server will start on http://localhost:5000. It will also initialize the bank.db SQLite database file and create necessary tables (Customers, Loans, Payments), adding some sample customer data on the first run.

Frontend Setup
Open a new terminal window.

Navigate to the frontend directory:

cd bank-lending-system/frontend

Install frontend dependencies:

npm install

(If you previously installed create-react-app globally, this step might be quicker as some dependencies might be cached)

Start the React development server:

npm start

The frontend application will open in your browser at http://localhost:3000.

API Endpoints
The backend exposes the following RESTful API endpoints:

Endpoint

Method

Description

/api/v1/loans

POST

Creates a new loan.

/api/v1/loans/active

GET

Retrieves a list of all active loans (for dropdowns).

/api/v1/loans/all

GET

Retrieves a list of all loans (active and paid-off).

/api/v1/loans/:loanId/payments

POST

Records a payment for a specific loan.

/api/v1/loans/:loanId/ledger

GET

Retrieves details and transaction history for a specific loan.

/api/v1/customers

GET

Retrieves a list of all customers (for dropdowns).

/api/v1/customers/:customerId/overview

GET

Provides an overview of all loans for a specific customer.

Project Structure
bank-lending-system/
├── backend/
│   ├── node_modules/
│   ├── routes/
│   │   ├── customers.js      # Customer-related API routes
│   │   └── loans.js          # Loan and Payment related API routes
│   ├── bank.db               # SQLite database file (generated on first run)
│   ├── database.js           # Database connection and table creation logic
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main backend server entry point
└── frontend/
    ├── node_modules/
    ├── public/
    │   └── index.html        # Main HTML file
    ├── src/
    │   ├── App.js            # Main React App component with routing
    │   ├── index.js          # React entry point with ReactDOM.createRoot and BrowserRouter
    │   ├── index.css         # Global styles for the application
    │   └── components/       # Individual React components
    │       ├── AccountOverview/
    │       │   ├── index.js
    │       │   └── AccountOverview.css
    │       ├── LoanCreationForm/
    │       │   ├── index.js
    │       │   └── LoanCreationForm.css
    │       ├── LoanLedger/
    │       │   ├── index.js
    │       │   └── LoanLedger.css
    │       └── PaymentForm/
    │           ├── index.js
    │           └── PaymentForm.css
    ├── package.json          # Frontend dependencies
    └── .env                  # (Optional) Environment variables for frontend

Future Enhancements (Ideas for further development)
User Authentication/Authorization: Implement login/signup and secure routes.

Advanced Loan Calculations: Support compound interest, different repayment schedules (e.g., amortization tables).

Customer Creation API: Add a backend endpoint and frontend form to create new customers.

Dynamic Dashboard Metrics: Implement backend APIs to fetch actual aggregate data (total loans, total disbursed, etc.) for the dashboard.

Filtering and Sorting: Add options to filter and sort loans/payments in the ledger and overview.

Pagination: For large datasets, implement pagination for API responses.

Visualizations: Use charting libraries (e.g., D3.js, Chart.js) to visualize loan data.

Notifications: Implement in-app notifications for successful payments or loan creations.

Search Functionality: Enhance search for loans and customers.

Error Boundaries: Implement React error boundaries for more graceful error handling in the UI.

Author
Chetan Kumar Patruni