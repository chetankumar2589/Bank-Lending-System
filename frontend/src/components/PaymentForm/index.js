import React from 'react';
import './PaymentForm.css'; // Import component-specific CSS

class PaymentForm extends React.Component {
  state = {
    loan_id: '',
    amount: '',
    payment_type: 'EMI', // Default to EMI
    responseMessage: null,
    errorMessage: null,
    isLoading: false,
    loans: [], // To store fetched loans for the dropdown
    selectedLoanId: '', // For the dropdown value
  };

  async componentDidMount() {
    await this.fetchAllActiveLoans();
  }

  fetchAllActiveLoans = async () => {
    this.setState({ isLoading: true, errorMessage: null });
    try {
      // CONFIRMED URL: This MUST match the backend's /loans/active endpoint
      const response = await fetch('http://localhost:5000/api/v1/loans/active'); 
      if (!response.ok) {
        const errorData = await response.json(); // Attempt to parse error as JSON
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.setState({
        loans: data,
        isLoading: false,
        errorMessage: null,
        selectedLoanId: data.length > 0 ? data[0].loan_id : '', // Pre-select first loan if available
      });
    } catch (error) {
      console.error("Error fetching loans:", error);
      this.setState({
        errorMessage: `Failed to load loans: ${error.message}`,
        isLoading: false,
      });
    }
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      responseMessage: null, // Clear messages on input change
      errorMessage: null,
    });
  };

  handleLoanSelectChange = (event) => {
    this.setState({
      selectedLoanId: event.target.value,
      loan_id: event.target.value, // Also update loan_id for submission
      responseMessage: null,
      errorMessage: null,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ isLoading: true, responseMessage: null, errorMessage: null });

    const { selectedLoanId, amount, payment_type } = this.state;

    // Input Validation
    if (!selectedLoanId) {
      this.setState({ errorMessage: 'Please select a loan.', isLoading: false });
      return;
    }
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      this.setState({ errorMessage: 'Payment amount must be a positive number.', isLoading: false });
      return;
    }
    if (!['EMI', 'LUMP_SUM'].includes(payment_type)) {
      this.setState({ errorMessage: 'Payment type must be EMI or LUMP_SUM.', isLoading: false });
      return;
    }

    const paymentData = {
      amount: paymentAmount,
      payment_type: payment_type,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/v1/loans/${selectedLoanId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({
          responseMessage: `Payment recorded successfully! Remaining Balance: $${data.remaining_balance}, EMIs Left: ${data.emis_left}`,
          errorMessage: null,
          amount: '', // Clear amount field after successful submission
        });
        // After payment, refresh the loan list as a loan might become PAID_OFF
        await this.fetchAllActiveLoans(); // Re-fetch active loans to update dropdown
      } else {
        this.setState({ errorMessage: data.message || 'Failed to record payment. Please try again.', responseMessage: null });
      }
    } catch (error) {
      console.error('Network error during payment:', error);
      this.setState({ errorMessage: `Network error: ${error.message}`, responseMessage: null });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const {
      amount,
      payment_type,
      responseMessage,
      errorMessage,
      isLoading,
      loans,
      selectedLoanId,
    } = this.state;

    return (
      <div className="card payment-form-card">
        <h2>Record Payment</h2>
        {isLoading && <p className="info-message">Loading loans...</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {responseMessage && <p className="success-message">{responseMessage}</p>}

        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="loan_id">Loan ID:</label>
            <select
              id="loan_id"
              name="loan_id"
              value={selectedLoanId}
              onChange={this.handleLoanSelectChange}
              required
              disabled={loans.length === 0 && isLoading}
            >
              <option value="" disabled>Select a loan</option>
              {isLoading && loans.length === 0 ? (
                <option value="" disabled>Loading loans...</option>
              ) : loans.length === 0 ? (
                <option value="" disabled>No active loans available</option>
              ) : (
                loans.map(loan => (
                  <option key={loan.loan_id} value={loan.loan_id}>
                    Loan: {loan.loan_id.substring(0, 8)}... (Cust: {loan.customer_id.substring(0, 8)}...) - EMI: ${loan.monthly_emi.toFixed(2)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Payment Amount ($):</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={this.handleChange}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="payment_type">Payment Type:</label>
            <select
              id="payment_type"
              name="payment_type"
              value={payment_type}
              onChange={this.handleChange}
              required
            >
              <option value="EMI">EMI</option>
              <option value="LUMP_SUM">LUMP SUM</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Recording Payment...' : 'Record Payment'}
          </button>
        </form>
      </div>
    );
  }
}

export default PaymentForm;
