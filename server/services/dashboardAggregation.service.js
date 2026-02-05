function buildLoanMatch({ allowedLoanIds, filters }) {
  const match = {
    Loan_ID: { $in: allowedLoanIds }
  };

  if (filters.location && filters.location !== 'All Locations') {
    match.Borrower_Branch = filters.location;
  }

  if (filters.salesPerson && filters.salesPerson !== 'All Sales People') {
    match.Collection_agent_name = filters.salesPerson;
  }

  if (filters.lender && filters.lender !== 'All Lenders') {
    match.NBFC_name = filters.lender;
  }

  if (filters.loanProduct && filters.loanProduct !== 'All Products') {
    match.Product_type = filters.loanProduct;
  }

  return match;
}

module.exports = buildLoanMatch;
