var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "asusvivobook.4",
    database: "courses"
});

connection.connect((err) => {
    if(err) throw err;
    console.log("Connected");
});

module.exports = connection;