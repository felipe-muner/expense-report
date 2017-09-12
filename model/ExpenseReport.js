const conn = require(process.env.PWD + '/conn');
const fetch = require('node-fetch');
const request = require('request')

function ExpenseReport(){
  this.getCurrencies = function(req, res, next){
    request('http://api.fixer.io/latest?base=BRL', function (error, response, body) {
      if(error){
        next(error)
      }else{
        let parseURLCurrency = (JSON.parse(body).rates);
        let arrayCurrency = Object.keys(parseURLCurrency).map(function(key){
          let newCurrency = {}
          newCurrency.code = key
          newCurrency.completeName = key
          newCurrency.quotation = (1 / parseURLCurrency[key]).toFixed(4)
          return newCurrency
        })
        req.currencies = arrayCurrency
        next()
      }
    })
  }

  this.getTypesExpenseReport = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT ExpenseReportTypeID, NameType FROM ExpenseReportType', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allTypesExpenseReport = result
          next()
        }
      });
    });
  }
}

module.exports = new ExpenseReport()
