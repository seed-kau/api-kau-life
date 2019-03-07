var express = require('express');
var mysql = require('mysql');
var router = express.Router();

const dbConfig = require('../config/config.json');

const conn = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database
});

conn.connect();

/**
 * DB 생성 API
 */
router.get('/database', function(req, res) {
  var sqlDelTable = 'DROP TABLE IF EXISTS scheduledata';

  conn.query(sqlDelTable, function(err, result) {
    if (err) throw err;
    console.log('Table deleted');
  });

  var sqlNewTable =
    'CREATE TABLE scheduledata (subject varchar(30), professor varchar(30), major varchar(20), time varchar(40), room varchar(30))';

  conn.query(sqlNewTable, function(err, result) {
    if (err) throw err;
    console.log('Table created');
  });

  var sqlLoad =
    "load data local infile 'list_timetable.txt' into table scheduledata fields terminated by '//' lines terminated by '\n'";

  conn.query(sqlLoad, function(err, result) {
    if (err) throw err;
    console.log('data load --> complete');
  });

  res.send('done');
});

/**
 * 모든 강의 전송 API
 */
router.get('/classes', function(req, res) {
  console.log('@' + req.method + ' ' + req.url);

  var sqlSchedule = 'SELECT * FROM scheduledata';

  conn.query(sqlSchedule, function(err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

module.exports = router;
