const express = require("express");

const { userFile } = require("./fileUpload");
const { csvReadandSave, downloadDemoCsv } = require("./csvModule");

const app = express();

app.use(express.json());

const PORT = 5000;
app.use("/uploads", express.static("uploads"));
app.post("/api/csv/upload", userFile, csvReadandSave);
app.get("/api/csv/download", downloadDemoCsv);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
