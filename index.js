const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { BulkActionController } = require("./controllers/bulkAction");

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

app.use(express.json());
mongoose
  .connect(`${process.env.MONGO_URI}/crm?authSource=admin`)
  .then(() => console.log("connected successfully"))
  .catch((err) => console.log("MONGO ERROR", err));
const redisConfig = {
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
};

const bulkActionController = new BulkActionController(redisConfig);

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

app.post(
  "/bulk-actions/upload",
  upload.single("file"),
  bulkActionController.uploadFile.bind(bulkActionController)
);

app.get(
  "/bulk-actions/:id",
  bulkActionController.getStatus.bind(bulkActionController)
);

app.get(
  "/bulk-actions-by-account/:accountId",
  bulkActionController.getStatusByAccountId.bind(bulkActionController)
);

app.get("/bulk-actions", bulkActionController.list.bind(bulkActionController));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
