const express = require("express");

const { userFile } = require("./fileUpload");
const { csvReadandSave } = require("./practice");

const app = express();

app.use(express.json());

const PORT = 5000;
app.use("/uploads", express.static("uploads"));
app.post("/api/csv/upload", userFile, csvReadandSave);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
