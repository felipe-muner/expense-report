const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const mailSender = require(process.env.PWD + '/model/MailSender')
const er = require(process.env.PWD + '/model/ExpenseReport')
const fs = require('fs')
const moment = require('moment')
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/new', er.getCurrencies, er.getTypesExpenseReport, function(req, res, next) {
  console.log(req.currencies);
  console.log(req.allTypesExpenseReport);
  res.render('expense-report/new', {
    sess: req.session,
    Currency: req.currencies,
    TypeExpenseReport: req.allTypesExpenseReport
  })
}).get('/my', function(req, res, next) {
  console.log('myyyy');
  res.render('expense-report/my', {
    sess: req.session,
    nome: "felipe"
  })
}).get('/cancel', function(req, res, next) {
  console.log('cancel');
  res.render('expense-report/cancel', {
    sess: req.session,
    nome: "felipe"
  })
})

module.exports = router;
