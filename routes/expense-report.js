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
const HtmlPDF = require(process.env.PWD + '/model/HtmlPDF')

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
}).post('/create', er.adjustBodyER, er.nextCode, er.createER, er.saveListItem, function(req, res, next) {
  console.log(req.body)
  console.log('----')
  console.log(req.listItem)
  res.json({
    "redirect":"/expense-report/my",
    "ExpenseReportedCreated": req.Code
  })
}).post('/approver-by-budget', er.getApproversByBudget, function(req, res, next) {
  res.json({
    "Approvers": req.ApproversByBudget
  })
}).get('/my', er.myExpenseReport , function(req, res, next) {
  req.myExpenseReport.map(function(e){
    e.pdf = (2 !== e.ExpenseReportType_ID) ? '<a class="no-loading" onclick="downloadPDF(this);"><i class="fa fa-file-pdf-o" aria-hidden="true"></i></a>' : '<a class="no-loading" onclick="downloadPDFAccountability(this);"><i class="fa fa-file-pdf-o" aria-hidden="true"></i></a>'
    e.MoreInfo = (2 !== e.ExpenseReportType_ID) ? '<i onclick="moreInfo('+ e.Code +');" class="fa fa-info-circle" aria-hidden="true"></i></a>' : '<i onclick="moreInfoAccountability('+ e.Code +');" class="fa fa-info-circle" aria-hidden="true"></i></a>'
    e.CreatedAt = moment(e.CreatedAt).format('DD/MM/YYYY HH:mm')

    console.log(e.pdf + e.Code)
  })
  res.render('expense-report/my', {
    sess: req.session,
    myExpenseReport: req.myExpenseReport
  })
}).get('/cancel', function(req, res, next) {
  console.log('cancel');
  res.render('expense-report/cancel', {
    sess: req.session
  })
}).post('/download-pdf', er.findExpenseReport, er.findItem, HtmlPDF.REPexpenseReport, function(req, res, next) {
  res.download(req.REPexpenseReport, new Date() + 'report.pdf')
  // res.send('vou realizar download pdf')
}).post('/download-pdf-accountability', er.findExpenseReport, er.findItem, er.findAccountability, function(req, res, next) {
  console.log('ultima rota accountability')
  console.log(req.ExpenseReport)
  res.send('vou realizar download pdf accountability')
}).get('/accountability', er.getCashAdvancedOpen ,function(req, res, next) {
  res.render('expense-report/accountability', {
    sess: req.session,
    listCashAdvancedOpen: req.listCashAdvancedOpen
  })
}).post('/open-cash-advanced', er.findExpenseReport, er.findItem, function(req, res, next) {
  console.log('-----');
  console.log(req.ExpenseReport)
  console.log('-----');
  console.log(req.listItem)
  console.log('-----');
  res.render('expense-report/cash-advanced-to-accountability', {
    sess: req.session,
    ExpenseReport: req.ExpenseReport,
    listItem: req.listItem
  })
}).post('/close-cash-advanced', er.adjustBodyAccountability, er.findExpenseReport, er.findItem, er.nextCode, er.createAccountabilityER, er.updateStatusCashAdvanced, er.saveAccountability, function(req, res, next) {

  console.log('____')
  console.log(req.body);
  console.log(JSON.parse(req.body.listAccountability))
  console.log('____')

  res.json(req.body)
})


// .post('/more-info', function(req, res, next) {
//   console.log('more-info')
//   console.log(req.body.Code)
//   res.render('expense-report/more-info', {
//     sess: req.session
//   })
// }).post('/more-info-accontability', function(req, res, next) {
//   console.log('more-info-accontability')
//   console.log(req.body.Code)
//   res.render('expense-report/more-info-accountability', {
//     sess: req.session
//   })
// })

module.exports = router;
