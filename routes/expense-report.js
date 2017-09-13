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

router.get('/new', er.getCurrencies, er.getTypesExpenseReport, er.getAllCostCenter, function(req, res, next) {
// router.get('/new', er.getTypesExpenseReport, er.getAllCostCenter, function(req, res, next) {
  console.log(req.currencies);
  console.log(req.allTypesExpenseReport);
  console.log(req.allCostCenter);
  res.render('expense-report/new', {
    sess: req.session,
    Currency: req.currencies,
    TypeExpenseReport: req.allTypesExpenseReport,
    allCostCenter: req.allCostCenter
  })
}).post('/create', function(req, res, next) {
  res.json({
    "req.body": req.body
  })
}).post('/approver-by-budget', er.getApproversByBudget, function(req, res, next) {
  res.json({
    "Approvers": req.ApproversByBudget
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
