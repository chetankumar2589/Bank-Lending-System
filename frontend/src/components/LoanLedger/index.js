import React from 'react';
import './LoanLedger.css';

class LoanLedger extends React.Component {
  state = {
    selectedLoanId: '',
    allLoans: [], // To populate the dropdown (all loans, active or paid off)
    loanDetails: null, // Stores the fetched ledger details
    responseMessage: null,
    errorMessage: null,
    isLoading: false,
  };

  async componentDidMount() {
    // Fetch all loans (active and paid off) for the dropdown
    // We need a new backend endpoint for this or modify the existing /loans/active
    // Let's create a new backend endpoint /loans/all for this
    await this.fetchAllLoansForDropdown();
  }

  fetchAllLoansForDropdown = async () => {
    this.setState({ isLoading: true, errorMessage: null, responseMessage: null });
    try {
      // New backend endpoint for all loans (active or paid off)
      const response = await fetch('http://localhost:5000/api/v1/loans/all');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.setState({
        allLoans: data,
        isLoading: false,
        errorMessage: null,
        selectedLoanId: data.length > 0 ? data[0].loan_id : '', // Pre-select first loan if available
      }, () => {
        // Fetch ledger for the default selected loan
        if (this.state.selectedLoanId) {
          this.fetchLoanLedger(this.state.selectedLoanId);
        }
      });
    } catch (error) {
      console.error("Error fetching all loans for ledger dropdown:", error);
      this.setState({
        errorMessage: `Failed to load loans for ledger: ${error.message}`,
        isLoading: false,
      });
    }
  };

  fetchLoanLedger = async (loanId) => {
    this.setState({ isLoading: true, errorMessage: null, responseMessage: null });
    try {
      const response = await fetch(`http://localhost:5000/api/v1/loans/${loanId}/ledger`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }

      this.setState({
        loanDetails: data,
        responseMessage: null,
        errorMessage: null,
      });
    } catch (error) {
      console.error("Error fetching loan ledger:", error);
      this.setState({
        errorMessage: `Failed to load loan ledger: ${error.message}`,
        responseMessage: null,
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleLoanSelectChange = (event) => {
    const newLoanId = event.target.value;
    this.setState({
      selectedLoanId: newLoanId,
      loanDetails: null, // Clear previous details
      responseMessage: null,
      errorMessage: null,
    }, () => {
      if (newLoanId) {
        this.fetchLoanLedger(newLoanId);
      }
    });
  };

  formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  render() {
    const {
      selectedLoanId,
      allLoans,
      loanDetails,
      responseMessage,
      errorMessage,
      isLoading,
    } = this.state;

    return (
      <div className="card loan-ledger-card">
        <h2>Loan Ledger & Transaction History</h2>
        {isLoading && <p className="info-message">Loading loan data...</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {responseMessage && <p className="info-message">{responseMessage}</p>}

        <div className="form-group">
          <label htmlFor="loanSelect">Select Loan ID:</label>
          <select
            id="loanSelect"
            name="loanSelect"
            value={selectedLoanId}
            onChange={this.handleLoanSelectChange}
            required
            disabled={allLoans.length === 0 && isLoading}
          >
            <option value="" disabled>Select a loan</option>
            {isLoading && allLoans.length === 0 ? (
              <option value="" disabled>Loading loans...</option>
            ) : allLoans.length === 0 ? (
              <option value="" disabled>No loans available</option>
            ) : (
              allLoans.map(loan => (
                <option key={loan.loan_id} value={loan.loan_id}>
                  {loan.loan_id.substring(0, 8)}... (Customer: {loan.customer_id.substring(0, 8)}...)
                </option>
              ))
            )}
          </select>
        </div>

        {loanDetails && !isLoading && !errorMessage && (
          <div className="ledger-details">
            <h3>Loan Details</h3>
            <div className="loan-summary">
              <p><strong>Loan ID:</strong> {loanDetails.loan_id.substring(0, 8)}...</p>
              <p><strong>Customer ID:</strong> {loanDetails.customer_id.substring(0, 8)}...</p>
              <p><strong>Principal Amount:</strong> ${loanDetails.principal}</p>
              <p><strong>Original Total Payable:</strong> ${loanDetails.total_amount}</p>
              <p><strong>Monthly EMI:</strong> ${loanDetails.monthly_emi}</p>
              <p><strong>Amount Paid Till Date:</strong> ${loanDetails.amount_paid}</p>
              <p><strong>Remaining Balance:</strong> ${loanDetails.balance_amount}</p>
              <p><strong>EMIs Left:</strong> {loanDetails.emis_left}</p>
              <p><strong>Status:</strong> <span className={`loan-status ${loanDetails.balance_amount <= 0 ? 'paid-off' : 'active'}`}>
                {loanDetails.balance_amount <= 0 ? 'PAID OFF' : 'ACTIVE'}
              </span></p>
            </div>

            <h3>Transaction History</h3>
            {loanDetails.transactions.length === 0 ? (
              <p className="info-message">No transactions recorded for this loan.</p>
            ) : (
              <ul className="transaction-list">
                {loanDetails.transactions.map((tx) => (
                  <li key={tx.transaction_id} className="transaction-item">
                    <p><strong>ID:</strong> {tx.transaction_id.substring(0, 8)}...</p>
                    <p><strong>Date:</strong> {this.formatDate(tx.date)}</p>
                    <p><strong>Amount:</strong> ${tx.amount}</p>
                    <p><strong>Type:</strong> {tx.type}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default LoanLedger;
