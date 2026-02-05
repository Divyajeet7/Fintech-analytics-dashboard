const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    Loan_ID: {
      type: Number,
      required: true,
      unique: true
    },

    Borrower_Name: {
      type: String,
      default: "Demo Borrower"
    },

    Borrower_Branch: {
      type: String,
      default: "Demo Branch"
    },

    Collection_agent_name: {
      type: String,
      default: "Demo Agent"
    },

    NBFC_name: {
      type: String,
      default: "Demo Lender"
    },

    Product_type: {
      type: String,
      default: "Demo Product"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Loan", loanSchema);
