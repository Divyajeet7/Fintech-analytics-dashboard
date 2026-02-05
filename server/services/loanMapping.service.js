/**
 * Dummy getAllLoansByMapping Service
 * ----------------------------------------------------
 * Returns loans accessible to a given user.
 * This is a placeholder implementation for demo / open-source repo.
 *
 * Replace with real DB mapping logic in production.
 */

async function getAllLoansByMapping(user) {
  try {
    // ---- Demo role-based mock logic ----

    // Example: Admin gets all loans
    if (user?.role === "Admin") {
      return generateMockLoans(50);
    }

    // Example: Collection Agent gets subset
    if (user?.role === "Agent") {
      return generateMockLoans(20);
    }

    // Default user
    return generateMockLoans(10);

  } catch (error) {
    console.error("getAllLoansByMapping error:", error);
    return [];
  }
}


/**
 * Generates mock loan objects
 */
function generateMockLoans(count) {
  return Array.from({ length: count }, (_, index) => ({
    Loan_ID: index + 1,
    Borrower_Name: `Demo Borrower ${index + 1}`,
    Borrower_Branch: "Demo Branch",
    NBFC_name: "Demo Lender",
    Product_type: "Demo Product"
  }));
}


module.exports = getAllLoansByMapping;
