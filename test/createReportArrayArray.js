require('dotenv').config();
var mysql      = require('mysql');
var connection = mysql.createConnection({
  connectionLimit: process.env.DB_POOL,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_BASE
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  for (var i = 0; i < 5200; i++) {

    connection.query('INSERT INTO User SET `Matricula` = ?, `Name` = ?, `DateBirth` = ?, `QtdChild` = ?',
    [i+901000,'felipe', new Date(),321], function (error, results, fields) {
      if (error) throw error;
      // connected!
    });

  }

  console.log('connected as id ' + connection.threadId);
});
