const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    EmailID: {
      type: String,
      required: true,
      unique: true
    },

    FirstName: {
      type: String,
      default: "Demo"
    },

    LastName: {
      type: String,
      default: "User"
    },

    Role: {
      type: String,
      enum: ["Admin", "Agent", "User"],
      default: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
