const fs = require("fs");
const Pool = require("pg").Pool;
const fastcsv = require("fast-csv");

const coloumNumber = 2;
let rowCount = 1;
let stream = fs.createReadStream("pp.csv");
let csvData = [];
let csvStream = fastcsv
  .parse()
  .on("data", function (data) {
    if (data.length !== 0) {
      if (data.length > coloumNumber) {
        throw new Error(`Found extra data in row no: ${rowCount}.`);
      }
      for (let i = 0; i < coloumNumber; i++) {
        data[i] = data[i] ? data[i] : null;
      }
      rowCount++;
      csvData.push(data);
    }
  })
  .on("end", function () {
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

    pool.connect((err, client, done) => {
      if (err) throw err;

      try {
        csvData.forEach((row) => {
          client.query(query, row, (err, res) => {
            if (err) {
              console.log(err.stack);
            }
          });
        });
      } catch (error) {
        console.log(error);
      } finally {
        done();
      }
    });
  });

stream.pipe(csvStream);
