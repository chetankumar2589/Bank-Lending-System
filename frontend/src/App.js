import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import LoanCreationForm from './components/LoanCreationForm';
import PaymentForm from './components/PaymentForm';
import AccountOverview from './components/AccountOverview';
import LoanLedger from './components/LoanLedger';
import './index.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="header py-4 px-8 bg-white shadow-sm flex items-center justify-between">
          <h1 style={{ margin: '0', fontSize: '1.8em', color: '#007bff', fontWeight: '700' }}>Bank Lending System</h1>
          <nav>
            <ul className="nav-list">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                  end
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/lend"
                  className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                >
                  Lend
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/pay"
                  className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                >
                  Pay
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/overview"
                  className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                >
                  Account Overview
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ledger"
                  className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                >
                  Loan Ledger
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>

        <main className="container flex-grow py-8">
          <Routes>
            <Route path="/" element={
              <React.Fragment>
                <div className="card text-center mb-8">
                  <h2>Welcome to the Bank Lending Dashboard</h2>
                  <p>
                    This system provides comprehensive tools for managing customer loans.
                    From initiating new loans to processing payments and tracking financial history,
                    it offers a streamlined approach to lending operations. Our commitment is to
                    transparency and efficient financial management.
                  </p>
                </div>


                {/* Feature Cards Section */}
                <div className="card">
                    <h2 className="mb-4">Explore Our Core Features</h2>
                    <div className="flex flex-col md:flex-row justify-center gap-4"> 
                        {/* Lend Feature Card */}
                        <div className="card feature-card">
                            <h3>Lend Money</h3>
                            <p>Facilitate new loan disbursements to customers. Define loan amount, period, and interest rate to calculate total payable and monthly EMI. Ideal for quick loan originations.</p>
                            <NavLink to="/lend" className="button nav-button">Go to Lend</NavLink>
                        </div>

                        {/* Payment Feature Card */}
                        <div className="card feature-card">
                            <h3>Record Payments</h3>
                            <p>Process customer loan repayments, whether through regular EMIs or lump sum amounts. The system automatically adjusts remaining balance and EMIs left, streamlining payment tracking.</p>
                            <NavLink to="/pay" className="button nav-button">Go to Pay</NavLink>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center mt-4 gap-4">
                        {/* Account Overview Feature Card */}
                        <div className="card feature-card">
                            <h3>Account Overview</h3>
                            <p>Get a comprehensive summary of all loans associated with a specific customer, including their current status and payment details. Perfect for customer relationship managers.</p>
                            <NavLink to="/overview" className="button nav-button">Go to Overview</NavLink>
                        </div>

                        {/* Loan Ledger Feature Card */}
                        <div className="card feature-card">
                            <h3>Loan Ledger</h3>
                            <p>Access the complete transaction history and current status for any specific loan, providing a detailed breakdown of all payments made and current balances. Full transparency at a glance.</p>
                            <NavLink to="/ledger" className="button nav-button">Go to Ledger</NavLink>
                        </div>
                    </div>
                </div> 

                
                <div className="flex flex-col md:flex-row justify-center mb-8 gap-4"> 
                  <div className="card stat-card">
                    <h3>Total Loans Processed</h3>
                    <p style={{fontSize: '2.5em', fontWeight: 'bold', color: '#007bff', marginBottom: '0.2em'}}>1,250+</p>
                    <p className="text-sm text-gray-500">Since inception. Growing daily!</p>
                  </div>
                  <div className="card stat-card">
                    <h3>Total Capital Disbursed</h3>
                    <p style={{fontSize: '2.5em', fontWeight: 'bold', color: '#007bff', marginBottom: '0.2em'}}>$12.5M</p>
                    <p className="text-sm text-gray-500">Empowering businesses and individuals.</p>
                  </div>
                  <div className="card stat-card">
                    <h3>On-Time Payment Rate</h3>
                    <p style={{fontSize: '2.5em', fontWeight: 'bold', color: '#007bff', marginBottom: '0.2em'}}>98.7%</p>
                    <p className="text-sm text-gray-500">Ensuring healthy financial ecosystem.</p>
                  </div>
                </div>


              </React.Fragment>
            } />
            <Route path="/lend" element={<LoanCreationForm />} />
            <Route path="/pay" element={<PaymentForm />} />
            <Route path="/overview" element={<AccountOverview />} />
            <Route path="/ledger" element={<LoanLedger />} />
          </Routes>
        </main>

        <footer className="footer py-4 text-center text-gray-500 text-sm">
          &copy; 2025 Bank Lending System. All rights reserved.
        </footer>
      </div>
    );
  }
}

export default App;
