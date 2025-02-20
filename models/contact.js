const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    phoneNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

exports.Contact = mongoose.model("Contact", contactSchema);
