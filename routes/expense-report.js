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
}).post('/create', er.adjustBody, er.nextCode, er.createER, er.saveListItem, function(req, res, next) {
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
    e.pdf = (2 !== e.ExpenseReportType_ID) ? '<a class="no-loading" onclick="downloadPDF(this);" target="_blank"><i class="fa fa-file-pdf-o" aria-hidden="true"></i></a>' : '<a class="no-loading" onclick="downloadPDFAccountability(this);" target="_blank"><i class="fa fa-file-pdf-o" aria-hidden="true"></i></a>'
    e.MoreInfo = (2 !== e.ExpenseReportType_ID) ? '<i onclick="moreInfo('+ e.Code +');" class="fa fa-info-circle" aria-hidden="true"></i></a>' : '<i onclick="moreInfoAccountability('+ e.Code +');" class="fa fa-info-circle" aria-hidden="true"></i></a>'
    e.CreatedAt = moment(e.CreatedAt).format('DD/MM/YYYY HH:mm')
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
}).get('/download-pdf', function(req, res, next) {
  console.log('download-pdf');
  res.render('expense-report/cancel', {
    sess: req.session
  })
}).get('/download-pdf-accountability', function(req, res, next) {
  console.log('download-pdf-accountability');
  console.log('cancel');
  res.render('expense-report/cancel', {
    sess: req.session
  })
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
