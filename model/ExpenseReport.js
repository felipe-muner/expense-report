const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const request = require('request')
const async = require('async')

function ExpenseReport(){

  let nameCurrency = [
    {code: "AUD", name: "Australian Dollar"},
    {code: "BGN", name: "Bulgarian Lev"},
    {code: "CAD", name: "Canadian Dollar"},
    {code: "CHF", name: "Swiss Franc"},
    {code: "CNY", name: "Chinese Yuan"},
    {code: "CZK", name: "Czech Koruna"},
    {code: "DKK", name: "Danish Krone"},
    {code: "GBP", name: "British Pound"},
    {code: "HKD", name: "Hong Kong Dollar"},
    {code: "HRK", name: "Croatian Kuna"},
    {code: "HUF", name: "Hungarian Forint"},
    {code: "IDR", name: "Indonesian Rupiah"},
    {code: "ILS", name: "Israeli New Shekel"},
    {code: "INR", name: "Indian Rupee"},
    {code: "JPY", name: "Japanese Yen"},
    {code: "KRW", name: "South Korean Won"},
    {code: "MXN", name: "Mexican Peso"},
    {code: "MYR", name: "Malaysian Ringgit"},
    {code: "NOK", name: "Norwegian Krone"},
    {code: "NZD", name: "New Zealand Dollar"},
    {code: "PHP", name: "Philippine Peso"},
    {code: "PLN", name: "Polish Zloty"},
    {code: "RON", name: "Romanian Leu"},
    {code: "RUB", name: "Russian ruble"},
    {code: "SEK", name: "Swedish Krona"},
    {code: "SGD", name: "Singapore Dollar"},
    {code: "THB", name: "Thai Baht"},
    {code: "TRY", name: "Turkish Lira"},
    {code: "USD", name: "US Dollar"},
    {code: "ZAR", name: "South African Rand"},
    {code: "EUR", name: "Euro"}
  ]

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
    // select * from currency where Date in(select min(Date) from currency) group by code;
    // SELECT * FROM CURRENCY WHERE Date IN(SELECT MAX(Date) FROM CURRENCY) GROUP BY CODE;
    conn.acquire(function(err,con){
      con.query('SELECT * FROM CURRENCY WHERE Date IN(SELECT MAX(Date) FROM CURRENCY) GROUP BY CODE;', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(result)

          let arrayCurrency = result.map((e)=>{
            let newCurrency = {}
            newCurrency.code = e.Code
            newCurrency.completeName = e.Name
            newCurrency.quotation = e.ValueConverted.toFixed(4)
            return newCurrency
          })

          arrayCurrency.push({
            "code":"BRL",
            "completeName":"Real",
            "quotation":"1.0000"
          })

          arrayCurrency.sort((a,b) => {
            if (a.completeName < b.completeName)
              return -1;
            if (a.completeName > b.completeName)
              return 1;
            return 0;
          })

          console.log('muner');
          console.log(arrayCurrency)
          console.log('muner');
          req.currencies = arrayCurrency
          next()
        }
      })
    })
  }

  // this.getCurrencies = function(req, res, next){
  //   request('http://api.fixer.io/latest?base=BRL', function (error, response, body) {
  //     if(error){
  //       next(error)
  //     }else{
  //       let parseURLCurrency = (JSON.parse(body).rates);
  //       let arrayCurrency = Object.keys(parseURLCurrency).map(function(key){
  //         let newCurrency = {}
  //         newCurrency.code = key
  //         newCurrency.completeName = nameCurrency.find(e => e.code === key).name
  //         newCurrency.quotation = (1 / parseURLCurrency[key]).toFixed(4)
  //         return newCurrency
  //       })
  //
  //       arrayCurrency.push({
  //         "code":"BRL",
  //         "completeName":"BRL",
  //         "quotation":"1.0000"
  //       })
  //
  //       arrayCurrency.sort((a,b) => {
  //         if (a.code < b.code)
  //           return -1;
  //         if (a.code > b.code)
  //           return 1;
  //         return 0;
  //       })
  //
  //       req.currencies = arrayCurrency
  //       next()
  //     }
  //   })
  // }

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
    // console.log(req.listItem)
    console.log(req.body)
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

    expenseReport.PaymentType = parseInt(req.body.PaymentType)

    if(2 === parseInt(req.body.PaymentType)){
      console.log('boleto')
      expenseReport.BankSlipSupplier_ID = req.body.BankSlipSupplier_ID
    }else if(3 === parseInt(req.body.PaymentType)){
      expenseReport.NationalSupplier_ID = req.body.NationalSupplier_ID || null
      expenseReport.NationalAccountType = req.body.AccountType
      expenseReport.NationalName = req.body.NationalName
      expenseReport.NationalBankName = req.body.NationalBankName
      expenseReport.NationalAgency = req.body.NationalAgency
      expenseReport.NationalAccount = req.body.NationalAccount
      console.log('naci')
    }else if(4 === parseInt(req.body.PaymentType)){
      expenseReport.InternationalSupplier_ID = req.body.InternationalSupplier_ID || null
      expenseReport.InternationalBankName = req.body.InternationalBankName
      expenseReport.InternationalAccount = req.body.InternationalAccount
      expenseReport.InternationalSortCode = req.body.InternationalSortCode
      expenseReport.InternationalIBAN = req.body.InternationalIBAN
      expenseReport.InternationalSwiftBic = req.body.InternationalSwiftBic
      expenseReport.InternationalAba = req.body.InternationalAba
      expenseReport.InternationalRouting = req.body.InternationalRouting
      console.log('inter')
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
    conn.acquire(function(err,con){
      con.query('UPDATE ExpenseReport SET Status = 1, Brother_Code = ? WHERE Code = ?', [req.Code, req.ExpenseReport.Code], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          next()
        }
      })
    })
  }

  this.cancelExpenseReport = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('UPDATE ExpenseReport SET Status = ?, CanceledAt = ?, CanceledBy_Matricula = ?, CanceledReason = ? WHERE Code = ?', [10, new Date(), req.session.matricula, req.body.Reason, req.body.Code], function(err, result) {
        con.release()

        if(err){
          console.log(err);
          console.log('entrei no erro');
          res.render('error', { error: err } );
        }else{
          console.log('nao entrei no erro');
          console.log(result);
          next()
        }
      })
    })
  }

  this.createAccountabilityER = function(req, res, next){
    console.log('vou criar um novo expense report type accountability')
    console.log(req.ExpenseReport)
    console.log('0000000')
    console.log(req.listItem)
    console.log('vou criar um novo expense report type accountability')


    let Accountability = {
      Code: req.Code,
      ExpenseReportType_ID: 2,
      Budget: req.ExpenseReport.Budget,
      RequestedBy: req.ExpenseReport.RequestedBy,
      AuthorizedBy: req.ExpenseReport.AuthorizedBy,
      CreatedByMatricula: req.session.matricula,
      EventName: req.ExpenseReport.EventName,
      Currency: req.ExpenseReport.Currency,
      CurrencyQuotation: req.ExpenseReport.CurrencyQuotation,
      TotalValue: req.listAccountability.reduce((acc,e) => acc += parseFloat(e.Value), 0),
      TotalValueConverted: req.listAccountability.reduce((acc,e) => acc += parseFloat(e.Value) * parseFloat(req.ExpenseReport.CurrencyQuotation), 0),
      Brother_Code: req.ExpenseReport.Code
    }
    console.log('nova contabilidade');
    console.log(Accountability);
    console.log('nova contabilidade');

    conn.acquire(function(err,con){
      con.query('INSERT INTO ExpenseReport SET ?', [Accountability], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.resultCreatedAccountability = result
          // console.log('salvei e to indo embora')
          // console.log(req.resultCreatedAccountability)
          // console.log('salvei e to indo embora')
          next()
        }
      })
    })
  }


  this.saveAccountability = function(req, res, next){
    async.forEach((req.listAccountability), function (item, callback){

      let newAcc = {
        DescriptionAcc: item.DescriptionAcc,
        Value: item.Value,
        ValueConverted: (parseFloat(item.Value) * parseFloat(req.ExpenseReport.CurrencyQuotation)),
        ExpenseReportItem_ID: item.ExpenseReportItem_ID,
        ExpenseReportCA_ID: item.ExpenseReport_ID,
        ExpenseReportACC_ID: req.Code
      }

      conn.acquire(function(err,con){
        con.query('INSERT INTO ExpenseReportAccountability SET ?', [newAcc],function(err, result) {
          con.release()
          if(err){
            console.log(err);
            res.render('error', { error: err } )
          }else{
            console.log('item acconutability com sucesso')
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })
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

  this.findAll = function(req, res, next){
    //maximo 500
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'er.Code, '+
                  'er.CreatedAt, '+
                  'er.Status, '+
                  'er.ExpenseReportType_ID, '+
                  'ert.NameType, '+
                  'er.Budget, '+
                  'er.RequestedBy, '+
                  'er.AuthorizedBy, '+
                  'er.EventName, '+
                  'er.Currency, '+
                  'er.CurrencyQuotation, '+
                  'er.TotalValue '+
                'FROM ExpenseReport er Inner Join ExpenseReportType ert ON er.ExpenseReportType_ID = ert.ExpenseReportTypeID '+
                'WHERE er.ExpenseReportType_ID <> 2 ORDER BY ExpenseReportID DESC LIMIT 1000', function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          console.log(result);
          req.findAll = result
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
                  'er.TotalValueConverted, '+
                  'er.Brother_Code, '+
                  'erpt.ExpenseReportPaymentTypeID, '+
                  'erpt.Name as PaymentTypeName '+
                'FROM ExpenseReport er '+
                'Inner Join ExpenseReportType ert ON er.ExpenseReportType_ID = ert.ExpenseReportTypeID '+
                'Inner Join ExpenseReportPaymentType erpt ON er.PaymentType = erpt.ExpenseReportPaymentTypeID '+
                'WHERE Code = ?',
        [parseInt(req.Code)], function(err, result) {
        con.release()
        console.log(this.sql);
        console.log('printei');
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

  this.findExpenseReportByBrother_Code = function(req, res, next){
    console.log('findExpenseReport----BROTHER CODE')
    console.log(req.ExpenseReport);
    console.log('findExpenseReport----BROTHER CODE')
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
                  'er.TotalValueConverted, '+
                  'er.Brother_Code '+
                'FROM ExpenseReport er Inner Join ExpenseReportType ert ON er.ExpenseReportType_ID = ert.ExpenseReportTypeID '+
                'WHERE Code = ?',
        [parseInt(req.ExpenseReport.Brother_Code)], function(err, result) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.ExpenseReportBrother_Code = result[0]
          console.log('brothercode de fato');
          console.log(req.ExpenseReportBrother_Code);
          console.log('brothercode de fato');
          next()
        }
      })
    })
  }

  this.findItem = function(req, res, next){

    console.log('vou achar finditem');
    console.log(req.Code)
    console.log('vou achar finditem');

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
          console.log(err)
          res.render('error', { error: err } );
        }else{
          console.log(this.sql);
          console.log('lista completa')
          console.log(result)
          console.log('lista completa')
          req.listItem = result
          next()
        }
      })
    })
  }

  this.findItemERAcc = function(req, res, next){

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
        [parseInt(req.ExpenseReport.Brother_Code)], function(err, result) {
        con.release()
        if(err){
          console.log(err)
          res.render('error', { error: err } );
        }else{
          req.listItemCashAdvanced = result
          next()
        }
      })
    })
  }

  this.findAccountability = function(req, res, next){
    async.forEach((req.listItemCashAdvanced), function (item, callback){
      conn.acquire(function(err,con){
        con.query('SELECT * FROM ExpenseReportAccountability WHERE ExpenseReportItem_ID = ?', [item.ItemID],function(err, result) {
          con.release()
          if(err){
            console.log(err);
            res.render('error', { error: err } )
          }else{
            item.listItemAccountability = result
            callback()
          }
        })
      })
    }, function(err) {
      console.log('getlistindoembora---INDOEMBORA')
      next()
    })

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

  this.getAllSupplier = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT s.codigo, s.razao, s.cnpj, s.banco, s.agencia, s.conta, b.title FROM Supplier s INNER JOIN Bank b ON s.banco = b.code', function(err, result) {
        con.release();
        if(err){
          console.log(this.sql)
          res.render('error', { error: err } );
        }else{
          req.allSupplier = result
          next()
        }
      })
    })
  }

  this.getAllBank = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT code, title FROM Bank', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allBank = result
          next()
        }
      })
    })
  }


  this.adjustBodyER = function(req, res, next){
    console.log('qwe')
    req.Budget = req.body.ContaOrca
    req.Currency = req.body.CurrencyName
    req.CurrencyQuotation = req.body.CurrencyQuotation
    req.listItem = JSON.parse(req.body.listExpense)
    console.log('qwe')
    next()
  }

  this.adjustBodyCreateAccountability = function(req, res, next){
    console.log('qwe')
    req.Budget = req.body.ContaOrca
    req.Currency = req.body.CurrencyName
    req.CurrencyQuotation = req.body.CurrencyQuotation
    req.listAccountability = JSON.parse(req.body.listAccountability)
    console.log('qwe')
    next()
  }

  this.adjustBodyAccountability = function(req, res, next){
    console.log('qwe')
    req.Budget = req.body.ContaOrca
    req.Currency = req.body.CurrencyName
    req.CurrencyQuotation = req.body.CurrencyQuotation
    req.listAccountability = JSON.parse(req.body.listAccountability)
    console.log('qwe')
    next()
  }

}

module.exports = new ExpenseReport()
