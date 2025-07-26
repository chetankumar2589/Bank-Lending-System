import React from 'react';
import './AccountOverview.css'; 

class AccountOverview extends React.Component {
  state = {
    customerId: '',
    customerName: '', 
    loans: [],
    responseMessage: null,
    errorMessage: null,
    isLoading: false,
    allCustomers: [], 
    selectedCustomerId: '', 
  };

  async componentDidMount() {
    
    await this.fetchCustomersForDropdown();
  }

  fetchCustomersForDropdown = async () => {
    this.setState({ isLoading: true, errorMessage: null });
    try {
      const response = await fetch('http://localhost:5000/api/v1/customers'); // Use the GET /api/v1/customers endpoint
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.setState({
        allCustomers: data,
        isLoading: false,
        errorMessage: null,
        
        selectedCustomerId: data.length > 0 ? data[0].customer_id : '',
      }, () => {
        // Once customers are loaded and selectedCustomerId is set, fetch the overview for the default customer
        if (this.state.selectedCustomerId) {
          this.fetchAccountOverview(this.state.selectedCustomerId);
        }
      });
    } catch (error) {
      console.error("Error fetching customers for dropdown:", error);
      this.setState({
        errorMessage: `Failed to load customers: ${error.message}`,
        isLoading: false,
      });
    }
  };

  fetchAccountOverview = async (customerId) => {
    this.setState({ isLoading: true, errorMessage: null, responseMessage: null });
    try {
      const response = await fetch(`http://localhost:5000/api/v1/customers/${customerId}/overview`);
      const data = await response.json();

      if (!response.ok) {
        // Handle 404 specifically for "no loans found" vs. "customer not found"
        if (response.status === 404 && data.message.includes('No loans found')) {
            this.setState({
                loans: [],
                totalLoans: 0,
                errorMessage: null, // No error, just empty state
                responseMessage: data.message, // Display "No loans found" as a message
            });
        } else {
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }
      } else {
        this.setState({
          customerId: data.customer_id,
          loans: data.loans,
          responseMessage: null,
          errorMessage: null,
        });
      }
    } catch (error) {
      console.error("Error fetching account overview:", error);
      this.setState({
        errorMessage: `Failed to load account overview: ${error.message}`,
        responseMessage: null,
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleCustomerSelectChange = (event) => {
    const newCustomerId = event.target.value;
    this.setState({
      selectedCustomerId: newCustomerId,
      customerId: newCustomerId, // Update customerId in state
      responseMessage: null,
      errorMessage: null,
    }, () => {
      // Fetch overview for the newly selected customer
      if (newCustomerId) {
        this.fetchAccountOverview(newCustomerId);
      }
    });
  };

  render() {
    const {
      loans,
      responseMessage,
      errorMessage,
      isLoading,
      allCustomers,
      selectedCustomerId,
    } = this.state;

    return (
      <div className="card account-overview-card">
        <h2>Customer Account Overview</h2>
        {isLoading && <p className="info-message">Loading customer data...</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {responseMessage && <p className="info-message">{responseMessage}</p>}

        <div className="form-group">
          <label htmlFor="customerSelect">Select Customer:</label>
          <select
            id="customerSelect"
            name="customerSelect"
            value={selectedCustomerId}
            onChange={this.handleCustomerSelectChange}
            required
            disabled={allCustomers.length === 0 && isLoading}
          >
            <option value="" disabled>Select a customer</option>
            {isLoading && allCustomers.length === 0 ? (
              <option value="" disabled>Loading customers...</option>
            ) : allCustomers.length === 0 ? (
              <option value="" disabled>No customers available</option>
            ) : (
              allCustomers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.name} ({customer.customer_id.substring(0, 8)}...)
                </option>
              ))
            )}
          </select>
        </div>

        {!isLoading && !errorMessage && selectedCustomerId && (
          <div className="loans-list">
            <h3>Loans for Selected Customer:</h3>
            {loans.length === 0 ? (
              <p className="info-message">No active loans for this customer.</p>
            ) : (
              loans.map(loan => (
                <div key={loan.loan_id} className="loan-item">
                  <h4>Loan ID: {loan.loan_id.substring(0, 8)}...</h4>
                  <p><strong>Principal:</strong> ${loan.principal}</p>
                  <p><strong>Total Amount Payable:</strong> ${loan.total_amount}</p>
                  <p><strong>Total Interest:</strong> ${loan.total_interest}</p>
                  <p><strong>EMI Amount:</strong> ${loan.emi_amount}</p>
                  <p><strong>Amount Paid Till Date:</strong> ${loan.amount_paid}</p>
                  <p><strong>EMIs Left:</strong> {loan.emis_left}</p>
                  <p><strong>Status:</strong> {loan.status}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
}

export default AccountOverview;
