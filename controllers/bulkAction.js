const Bull = require("bull"); // Changed from Queue to Bull
const { BulkAction } = require("../models/bulkAction");
const { parseCsv } = require("../utils/csvParser");
const { RateLimiter } = require("../services/rateLimiter");

class BulkActionController {
  constructor(redisConfig) {
    this.queue = new Bull("bulk-actions", { redis: redisConfig }); // Create new Bull queue
    this.rateLimiter = new RateLimiter(redisConfig);
  }

  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { accountId } = req.body;

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const records = await parseCsv(req.file.buffer);

      if (!(await this.rateLimiter.checkLimit(accountId, records.length))) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      }

      const bulkAction = await BulkAction.create({
        fileName: req.file.originalname,
        accountId,
        metadata: {
          totalRecords: records.length,
        },
      });

      await this.queue.add("process-csv", {
        actionId: bulkAction.id,
        records,
      });

      return res.status(201).json(bulkAction);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process file" });
    }
  }

  async getStatus(req, res) {
    try {
      const bulkAction = await BulkAction.findById(req.params.id);
      if (!bulkAction) {
        return res.status(404).json({ error: "Bulk action not found" });
      }
      res.json(bulkAction);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getStatusByAccountId(req, res) {
    try {
      const bulkAction = await BulkAction.find({
        accountId: req.params.accountId,
      });
      if (!bulkAction) {
        return res.status(404).json({ error: "Bulk action not found" });
      }
      res.json(bulkAction);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async list(req, res) {
    try {
      const bulkActions = await BulkAction.find()
        .sort({ createdAt: -1 })
        .limit(100);
      res.json(bulkActions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = { BulkActionController };
