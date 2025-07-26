import React from 'react';
import './LoanCreationForm.css'; 

class LoanCreationForm extends React.Component {
  state = {
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate_yearly: '',
    responseMessage: null,
    errorMessage: null,
    isLoading: false,
    customers: [], 
    selectedCustomerId: '', 
  };

  async componentDidMount() {
    
    await this.fetchCustomers();
  }

  fetchCustomers = async () => {
    this.setState({ isLoading: true, errorMessage: null });
    try {
      const response = await fetch('http://localhost:5000/api/v1/customers'); // Assuming a simple GET /customers endpoint
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.setState({
        customers: data,
        isLoading: false,
        errorMessage: null,
        selectedCustomerId: data.length > 0 ? data[0].customer_id : '', // Pre-select first customer
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      this.setState({
        errorMessage: `Failed to load customers: ${error.message}`,
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

  handleCustomerSelectChange = (event) => {
    this.setState({
      selectedCustomerId: event.target.value,
      customer_id: event.target.value, // Also update customer_id for submission
      responseMessage: null,
      errorMessage: null,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    this.setState({ isLoading: true, responseMessage: null, errorMessage: null });

    const { selectedCustomerId, loan_amount, loan_period_years, interest_rate_yearly } = this.state;

    // Input Validation
    if (!selectedCustomerId) {
      this.setState({ errorMessage: 'Please select a customer.', isLoading: false });
      return;
    }
    const amount = parseFloat(loan_amount);
    const period = parseInt(loan_period_years);
    const rate = parseFloat(interest_rate_yearly);

    if (isNaN(amount) || amount <= 0) {
      this.setState({ errorMessage: 'Loan amount must be a positive number.', isLoading: false });
      return;
    }
    if (isNaN(period) || period <= 0) {
      this.setState({ errorMessage: 'Loan period must be a positive number of years.', isLoading: false });
      return;
    }
    if (isNaN(rate) || rate < 0) {
      this.setState({ errorMessage: 'Interest rate must be a non-negative number.', isLoading: false });
      return;
    }

    const loanData = {
      customer_id: selectedCustomerId,
      loan_amount: amount,
      loan_period_years: period,
      interest_rate_yearly: rate,
    };

    try {
      const response = await fetch('http://localhost:5000/api/v1/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({
          responseMessage: `Loan Created! ID: ${data.loan_id}, Total Payable: $${data.total_amount_payable}, Monthly EMI: $${data.monthly_emi}`,
          errorMessage: null,
          // Clear form fields after successful submission
          loan_amount: '',
          loan_period_years: '',
          interest_rate_yearly: '',
          // Keep selectedCustomerId as it might be needed for more loans
        });
      } else {
        // Backend returns error messages in data.message for 4xx/5xx responses
        this.setState({ errorMessage: data.message || 'Failed to create loan. Please try again.', responseMessage: null });
      }
    } catch (error) {
      console.error('Network error during loan creation:', error);
      this.setState({ errorMessage: `Network error: ${error.message}`, responseMessage: null });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const {
      loan_amount,
      loan_period_years,
      interest_rate_yearly,
      responseMessage,
      errorMessage,
      isLoading,
      customers,
      selectedCustomerId,
    } = this.state;

    return (
      <div className="card loan-creation-form-card"> {/* Added specific class for card */}
        <h2>Create New Loan</h2>
        {isLoading && <p>Loading...</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {responseMessage && <p className="success-message">{responseMessage}</p>}

        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer_id">Customer:</label>
            <select
              id="customer_id"
              name="customer_id"
              value={selectedCustomerId}
              onChange={this.handleCustomerSelectChange}
              required
            >
              <option value="" disabled>Select a customer</option>
              {customers.length === 0 ? (
                <option value="" disabled>Loading customers...</option>
              ) : (
                customers.map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.name} ({customer.customer_id.substring(0, 8)}...)
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="loan_amount">Loan Amount ($):</label>
            <input
              type="number"
              id="loan_amount"
              name="loan_amount"
              value={loan_amount}
              onChange={this.handleChange}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="loan_period_years">Loan Period (Years):</label>
            <input
              type="number"
              id="loan_period_years"
              name="loan_period_years"
              value={loan_period_years}
              onChange={this.handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="interest_rate_yearly">Interest Rate (Yearly %):</label>
            <input
              type="number"
              id="interest_rate_yearly"
              name="interest_rate_yearly"
              value={interest_rate_yearly}
              onChange={this.handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Loan...' : 'Lend Money'}
          </button>
        </form>
      </div>
    );
  }
}

export default LoanCreationForm;
