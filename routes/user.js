var express = require('express');
var router = express.Router();
var conn = require(process.env.PWD + '/conn');
var moment = require('moment');

/* GET users listing. */
router.get('/', function(req, res, next) {
  conn.acquire(function(err,con){
    con.query('SELECT * FROM User WHERE Active = 0', function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        result.map((el) => el.DateBirth = moment(el.DateBirth).format("DD/MM/YYYY"))
        res.render('user', {data:result});
      }
    });
  });
});

router.get('/disable/:UserID', function(req, res, next) {

  //req.params.UserID para recuperar o :UserID
  //Em URL = users/disable/2?pais=brasil&mundo=terra , req.query retorna o objeto da querystring
  let UserID = req.params.UserID
  conn.acquire(function(err,con){
    con.query('UPDATE User SET Active = 1 WHERE UserId = ?', [UserID],function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        console.log(result);
        res.redirect('/user');
      }
    });
  });
});

router.post('/edit', function(req, res, next) {
  let user = req.body
  conn.acquire(function(err,con){
    con.query('UPDATE User SET ? WHERE UserID = ?', [user,user.UserID], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        res.redirect('/user');
      }
    });
  });
});

router.post('/save', function(req, res, next) {

  let user = req.body
  conn.acquire(function(err,con){
    con.query('INSERT INTO User SET ?', [user], function(err, result) {
      console.log(this.sql);
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        console.log(result);
        res.redirect('/user');
      }
    });
  });
});

module.exports = router;
