const Bull = require("bull");
const mongoose = require("mongoose");
const { BulkAction } = require("../models/bulkAction");
const { ContactProcessor } = require("./methods");

async function startWorker() {
  await mongoose
    .connect(`${process.env.MONGO_URI}/crm?authSource=admin`)
    .then(() => console.log("worker and mongo connected successfully"))
    .catch((err) => console.log("MONGO ERROR", err));

  const redisConfig = {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  };
  const queue = new Bull("bulk-actions", { redis: redisConfig });
  const contactProcessor = new ContactProcessor();

  // Process jobs
  queue.process("process-csv", async (job) => {
    const { actionId, records } = job.data;
    const bulkAction = await BulkAction.findById(actionId);

    if (!bulkAction) {
      throw new Error("Bulk action not found");
    }

    try {
      bulkAction.status = "processing";
      await bulkAction.save();

      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        try {
          if (record.entity !== "contact") {
            throw new Error(`Unsupported entity type: ${record.entity}`);
          }

          switch (record.action) {
            case "create":
              await contactProcessor.create(record.phoneNumber, record.fields);
              break;
            case "update":
              await contactProcessor.update(record.phoneNumber, record.fields);
              break;
            case "delete":
              await contactProcessor.delete(record.phoneNumber);
              break;
            default:
              throw new Error(`Unsupported action: ${record.action}`);
          }

          bulkAction.metadata.processed++;
        } catch (error) {
          bulkAction.metadata.failed++;
          bulkAction.errorLogs.push({
            row: i + 1,
            errormsg: error.message,
          });
        }

        await bulkAction.save();
      }

      bulkAction.status = "completed";
      await bulkAction.save();
    } catch (error) {
      bulkAction.status = "failed";
      await bulkAction.save();
      throw error;
    }
  });

  queue.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  queue.on("failed", (job, error) => {
    console.error(`Job ${job.id} failed:`, error);
  });
}

startWorker().catch(console.error);
