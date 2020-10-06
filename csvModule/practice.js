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
    csvData.push(data);
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
          if (row.length !== 0) {
            if (row.length > coloumNumber) {
              throw new Error(
                `Your data is inserted till row number: ${rowCount}. Found extra data in row no: ${rowCount}. Please Correct the data and remove all data before ${rowCount}`
              );
            }

            for (let i = 0; i < coloumNumber; i++) {
              row[i] = row[i] ? row[i] : null;
            }

            //   row[1] = row[1] ? row[1] : null;
            client.query(query, row, (err, res) => {
              if (err) {
                console.log(err.stack);
              }
            });
            rowCount++;
          }
        });
      } catch (error) {
        console.log(error);
      } finally {
        done();
      }
    });
  });

stream.pipe(csvStream);
