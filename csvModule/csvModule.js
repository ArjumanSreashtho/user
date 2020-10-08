const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Pool = require("pg").Pool;
const fastcsv = require("fast-csv");

const { CustomError } = require("./CustomError");

exports.csvReadandSave = (req, res) => {
  if (!req.file) {
    return res.json(400).send(false);
  }
  const errorDataArray = [];
  const coloumNumber = 2;
  let rowCount = 1;
  let stream = fs.createReadStream(req.file.path);
  let csvData = [];
  let csvStream = fastcsv
    .parse()
    .on("data", function (data) {
      try {
        if (data.length !== 0) {
          if (data.length > coloumNumber) {
            errorDataArray.push(rowCount);
          }
          for (let i = 0; i < coloumNumber; i++) {
            data[i] = data[i] ? data[i] : null;
          }

          csvData.push(data);
        }
        rowCount++;
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    })
    .on("end", async function () {
      try {
        if (errorDataArray.length > 0) {
          throw new CustomError("Found extra data on: ", errorDataArray);
        }
        // remove the first line: header
        csvData.shift();
        // create a new connection to the database
        const pool = new Pool({
          host: "localhost",
          user: "postgres",
          database: "test",
          password: "",
        });

        const query = "INSERT INTO test (username, email) VALUES ($1, $2)";

        pool.connect(async (err, client, done) => {
          if (err) throw new Error(err);

          csvData.forEach((row) => {
            client.query(query, row, (err, res) => {
              if (err) {
                throw new Error(err.stack);
              }
            });
          });
          await unlinkAsync(req.file.path);
          done();
        });
      } catch (error) {
        await unlinkAsync(req.file.path);
        return res.status(400).json(error);
      }
      res.status(200).send("File data has been uploaded");
    });
  stream.pipe(csvStream);
};

exports.downloadDemoCsv = (req, res) => {
  res.download(__dirname + "/downloads/demoCsvFile.csv", function (error) {
    if (error) {
      res.status(400).json("Server problem. File not found");
    }
  });
};
