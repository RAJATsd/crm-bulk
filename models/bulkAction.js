const mongoose = require("mongoose");

const bulkActionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    fileName: { type: String, required: true },
    accountId: { type: String, required: true },
    metadata: {
      totalRecords: { type: Number, default: 0 },
      processed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    errorLogs: [
      {
        row: Number,
        errormsg: String,
      },
    ],
  },
  { timestamps: true }
);

exports.BulkAction = mongoose.model("BulkAction", bulkActionSchema);
