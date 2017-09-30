const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const request = require('request')
const async = require('async')

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
      con.query('SELECT ExpenseReportTypeID, NameType FROM ExpenseReportType WHERE ShowInCreation = 1', function(err, result) {
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

    console.log('estou na lista item');
    console.log(req.listItem)
    console.log('estou na lista item');

    let expenseReport = {
      Code: req.Code,
      ExpenseReportType_ID: req.body.ExpenseReportType_ID,
      Status: (1 === parseInt(req.body.ExpenseReportType_ID)) ? 0 : null,
      Budget: req.Budget,
      RequestedBy: req.body.RequestedBy,
      AuthorizedBy: req.body.AuthorizeBy,
      CreatedByMatricula: req.session.matricula,
      EventName: req.body.EventName,
      Currency: req.body.CurrencyName,
      CurrencyQuotation: req.body.CurrencyQuotation,
      TotalValue: req.listItem.reduce((acc,e) => acc += parseFloat(e.ValueExpense), 0),
      TotalValueConverted: req.listItem.reduce((acc,e) => acc += parseFloat(e.ValueExpense) * parseFloat(req.CurrencyQuotation), 0)
    }

    console.log('sou um report')
    console.log(expenseReport)
    console.log('sou um report')


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

  this.saveListItem = function(req, res, next){
    console.log('savelistitem')
    console.log(req.listItem)
    console.log(req.Code)

    async.forEach((req.listItem), function (item, callback){
      let newItem = {
        PaymentDate: item.DatePayment,
        Budget: req.Budget,
        Description: item.Description,
        CostCenter: item.CostCenter || null,
        Value: item.ValueExpense,
        ValueConverted: (parseFloat(item.ValueExpense) * parseFloat(req.CurrencyQuotation)),
        Currency: req.Currency,
        CurrencyQuotation: req.CurrencyQuotation,
        ExpenseReport_ID: req.Code
      }

      console.log('item_______')
      console.log(item)
      console.log('item_______')
      // console.log('_______newItem')
      // console.log(newItem)
      // console.log('_______newItem')

      conn.acquire(function(err,con){
        con.query('INSERT INTO ExpenseReportItem SET ?', [newItem],function(err, result) {
          con.release()
          if(err){
            console.log(err);
            res.render('error', { error: err } )
          }else{
            console.log('gravado com sucesso')
            callback()
          }
        })
      })
    }, function(err) {
      console.log('savelistitem---INDOEMBORA')
      next()
    })
  }

  this.updateStatusCashAdvanced = function(req, res, next){
    console.log('Vou alterar o status do cash advanced')
    next()
  }

  this.createAccountabilityER = function(req, res, next){
    console.log('vou criar um novo expense report type accountability')
    console.log(req.ExpenseReport)
    console.log('0000000')
    console.log(req.listItem)
    console.log('vou criar um novo expense report type accountability')


    let expenseReport = {
      Code: req.Code,
      ExpenseReportType_ID: req.body.ExpenseReportType_ID,
      Status: (1 === parseInt(req.body.ExpenseReportType_ID)) ? 0 : null,
      Budget: req.Budget,
      CreatedByMatricula: req.session.matricula,
      EventName: req.body.EventName,
      Currency: req.body.CurrencyName,
      CurrencyQuotation: req.body.CurrencyQuotation,
      TotalValue: req.listItem.reduce((acc,e) => acc += parseFloat(e.ValueExpense), 0),
      TotalValueConverted: req.listItem.reduce((acc,e) => acc += parseFloat(e.ValueExpense) * parseFloat(req.CurrencyQuotation), 0)
    }
    next()
  }


  this.saveAccountability = function(req, res, next){
    console.log('savelistitem')
    console.log(req.Code)

    next()
    // async.forEach((req.listItem), function (item, callback){
    //   let newItem = {
    //     PaymentDate: item.DatePayment,
    //     Budget: req.Budget,
    //     Description: item.Description,
    //     Description: item.Description
    //   }
    //
    //   conn.acquire(function(err,con){
    //     con.query('INSERT INTO ExpenseReportItem SET ?', [newItem],function(err, result) {
    //       con.release()
    //       if(err){
    //         console.log(err);
    //         res.render('error', { error: err } )
    //       }else{
    //         console.log('gravado com sucesso')
    //         callback()
    //       }
    //     })
    //   })
    // }, function(err) {
    //   console.log('savelistitem---INDOEMBORA')
    //   next()
    // })
  }


  this.myExpenseReport = function(req, res, next){
    console.log('qwe');
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'er.Code, '+
                  'er.CreatedAt, '+
                  'er.ExpenseReportType_ID, '+
                  'ert.NameType, '+
                  'er.Budget, '+
                  'er.RequestedBy, '+
                  'er.AuthorizedBy, '+
                  'er.EventName, '+
                  'er.Currency, '+
                  'er.CurrencyQuotation '+
                'FROM ExpenseReport er Inner Join ExpenseReportType ert ON er.ExpenseReportType_ID = ert.ExpenseReportTypeID '+
                'WHERE CreatedByMatricula = ? ORDER BY Code DESC',
        [req.session.matricula], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.myExpenseReport = result
          next()
        }
      })
    })
  }

  this.findExpenseReport = function(req, res, next){
    console.log('findExpenseReport----')
    console.log(req.body)
    console.log('findExpenseReport----')
    req.Code = req.body.Code
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'er.Code, '+
                  'er.CreatedAt, '+
                  'er.ExpenseReportType_ID, '+
                  'ert.NameType, '+
                  'er.Budget, '+
                  'er.RequestedBy, '+
                  'er.AuthorizedBy, '+
                  'er.EventName, '+
                  'er.Currency, '+
                  'er.CurrencyQuotation, '+
                  'er.TotalValue, '+
                  'er.TotalValueConverted '+
                'FROM ExpenseReport er Inner Join ExpenseReportType ert ON er.ExpenseReportType_ID = ert.ExpenseReportTypeID '+
                'WHERE Code = ?',
        [parseInt(req.Code)], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.ExpenseReport = result[0]
          next()
        }
      })
    })
  }

  this.findItem = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'ItemID, '+
                  'PaymentDate, '+
                  'Budget, '+
                  'Description, '+
                  'CostCenter, '+
                  'Value, '+
                  'ValueConverted, '+
                  'Currency, '+
                  'CurrencyQuotation, '+
                  'ExpenseReport_ID '+
                'FROM ExpenseReportItem '+
                'WHERE ExpenseReport_ID = ?',
        [parseInt(req.Code)], function(err, result) {
        con.release()
        if(err){
          console.log(this.sql);
          console.log('entrei aquierro');
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.listItem = result
          next()
        }
      })
    })
  }

  this.findAccountability = function(req, res, next){
    req.accountabilityItem = []
    console.log('findAccountability')
    next()
  }

  this.getCashAdvancedOpen = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'er.Code, '+
                  'er.CreatedAt, '+
                  'er.ExpenseReportType_ID, '+
                  'ert.NameType, '+
                  'er.Budget, '+
                  'er.RequestedBy, '+
                  'er.AuthorizedBy, '+
                  'er.EventName, '+
                  'er.Currency, '+
                  'er.CurrencyQuotation '+
                'FROM ExpenseReport er Inner Join ExpenseReportType ert ON er.ExpenseReportType_ID = ert.ExpenseReportTypeID '+
                'WHERE CreatedByMatricula = ? AND Status = ? AND ExpenseReportType_ID = ? ORDER BY Code DESC',
        [req.session.matricula, 0, 1], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.listCashAdvancedOpen = result
          next()
        }
      })
    })
  }


  this.adjustBody = function(req, res, next){
    console.log('qwe')
    req.Budget = req.body.ContaOrca
    req.Currency = req.body.CurrencyName
    req.CurrencyQuotation = req.body.CurrencyQuotation
    req.listItem = JSON.parse(req.body.listExpense)
    console.log('qwe')
    next()
  }

}

module.exports = new ExpenseReport()
