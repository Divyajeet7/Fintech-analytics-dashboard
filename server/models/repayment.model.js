const mongoose = require("mongoose");

const collectionEntrySchema = new mongoose.Schema(
  {
    collectionDate: Date,

    collectedPrinciple: {
      type: Number,
      default: 0
    },

    collectedIntrest: {
      type: Number,
      default: 0
    },

    collectedLpc: {
      type: Number,
      default: 0
    },

    collectedNbc: {
      type: Number,
      default: 0
    },

    collectedRoc: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const repaymentSchema = new mongoose.Schema(
  {
    Loan_ID: {
      type: Number,
      required: true
    },

    EMI_Unique_No: String,

    EMI_Status: {
      type: String,
      enum: ["PAID", "PART", "UNPAID"],
      default: "UNPAID"
    },

    EMI_dpd: {
      type: Number,
      default: 0
    },

    EMI_Principle: {
      type: Number,
      default: 0
    },

    EMI_Intrest: {
      type: Number,
      default: 0
    },

    EMI_LPC: {
      type: Number,
      default: 0
    },

    EMI_NACH_Charge: {
      type: Number,
      default: 0
    },

    EMI_Roll_Over_Charge: {
      type: Number,
      default: 0
    },

    EMI_Date: Date,

    EMI_Collection_Date: Date,

    collectionArray: [collectionEntrySchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Repayment", repaymentSchema);
