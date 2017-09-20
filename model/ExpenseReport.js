const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const fetch = require('node-fetch');
const request = require('request')

function ExpenseReport(){

  this.getApproversByBudget = function(req, res, next){
    connPurchasing.acquire(function(err,con){
      con.query('SELECT u.ID_USER, u.Fname, u.LName FROM user_approve_budget AS uab Inner Join tblusers AS u ON u.ID_USER = uab.id_user WHERE u.Failed = 2 AND uab.id_budget = ?', [parseInt(req.body.id_budget)], function(err, result) {
        con.release();
        if(err){
          console.log(this.sql)
          res.render('error', { error: err } );
        }else{
          console.log(this.sql)
          req.ApproversByBudget = result
          next()
        }
      })
    })
  }

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

        arrayCurrency.push({
          "code":"BRL",
          "completeName":"BRL",
          "quotation":"1.0000"
        })

        arrayCurrency.sort((a,b) => {
          if (a.code < b.code)
            return -1;
          if (a.code > b.code)
            return 1;
          return 0;
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
      })
    })
  }

  this.getAllCostCenter = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT Number, Name FROM CostCenter', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allCostCenter = result
          next()
        }
      })
    })
  }

  this.nextCode = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT Code FROM ExpenseReport WHERE YEAR(CreatedAt) = ? order by ExpenseReportID desc limit 1', [new Date().getFullYear()], function(err, result) {
        con.release()
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(this.sql);
          let Code = '';
          (result.length === 0) ? Code = parseInt(new Date().getFullYear() + '0001') : Code = result[0].Code + 1
          console.log('____________________' + Code)
          req.Code = Code
          next()
        }
      })
    })
  }

  this.createER = function(req, res, next){

    let expenseReport = {
      Code: req.Code,
      ExpenseReportType_ID: req.body.ExpenseReportType_ID,
      Status: 0,
      Budget_ID: req.body.id_budget,
      RequestedBy: req.body.RequestedBy,
      AuthorizedBy: req.body.AuthorizeBy,
      CreatedByMatricula: req.session.matricula,
      EventName: req.body.EventName,
      Currency: req.body.CurrencyName,
      CurrencyQuotation: req.body.CurrencyQuotation
    }

    conn.acquire(function(err,con){
      con.query('INSERT INTO ExpenseReport SET ?', [expenseReport], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.resultCreated = result          
          next()
        }
      })
    })
  }

  this.createItemExpenseReport = function(req, res, next){

    let expenseReport = {
      Code: req.Code,
      ExpenseReportType_ID: req.body.ExpenseReportType_ID,
      Status: 0,
      Budget_ID: req.body.id_budget,
      RequestedBy: req.body.RequestedBy,
      AuthorizedBy: req.body.AuthorizeBy,
      CreatedByMatricula: req.session.matricula,
      EventName: req.body.EventName,
      Currency: req.body.CurrencyName,
      CurrencyQuotation: req.body.CurrencyQuotation
    }

    conn.acquire(function(err,con){
      con.query('INSERT INTO ExpenseReportItem SET ?', [expenseReport], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.resultCreated = result
          next()
        }
      })
    })
  }

}

module.exports = new ExpenseReport()
