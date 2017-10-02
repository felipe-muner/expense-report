const conn = require(process.env.PWD + '/conn');
const moment = require('moment')
const cheerio = require('cheerio')
const fs = require('fs')
const Styliner = require('styliner')
const Util = require(process.env.PWD + '/util/Util.js')
var styliner = new Styliner(__dirname);
var pdf = require('html-pdf');
var A4option = require(process.env.PWD + '/views/report/A4config')

function HtmlPDF(){
  this.REPexpenseReport = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/report/expense-report.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            console.log('____expensereport no htmlpdf')
            console.log(req.ExpenseReport)
            console.log('____expensereport no htmlpdf')
            console.log('___items');
            console.log(req.listItem);
            console.log('___items');
            // $('#Code').text(Util.toTitleCase(req.findEventByCode.title || 'Not Reported'))
            $('#Code').text( req.ExpenseReport.Code )
            $('#CreatedAt').text( req.ExpenseReport.CreatedAt )
            $('#Type').text( req.ExpenseReport.NameType )
            $('#Budget').text( req.ExpenseReport.Budget )
            $('#RequestedBy').text( req.ExpenseReport.RequestedBy )
            $('#AuthorizedBy').text( req.ExpenseReport.AuthorizedBy )
            $('#Currency').text( req.ExpenseReport.Currency )
            $('#CurrencyQuotation').text( req.ExpenseReport.CurrencyQuotation )
            $('#EventName').text( req.ExpenseReport.EventName )

            let header = ''
            if('001 001 00WS' === req.ExpenseReport.Budget && 'BRL' === req.ExpenseReport.Currency){
              console.log('header whole school brl');
              header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;">'+
                          '<td style="width:10%;">Date</td>'+
                          '<td style="width:60%;">Description</td>'+
                          '<td style="width:10%;">CC</td>'+
                          '<td style="width:20%;">Value</td>'+
                        '</tr>'
              let items = req.listItem.reduce(function(acc, e){
                acc.total += e.Value
                acc.tabelaItem = acc.tabelaItem + '<tr style="">'+
                                            '<td style="padding:3px;border:1px solid black;text-align:center;">'+ moment(e.PaymentDate).format('DD/MM/YYYY') + '</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:left;">'+ e.Description +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:center;">'+ e.CostCenter +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.Value.toFixed(2) +'</td>'+
                                          '</tr>'
                return acc
              }, {tabelaItem:'',total:0})

              $('#headerItem').append(header)
              $('#bodyItem').append(items.tabelaItem)
              $('#bodyItem').append('<tr><td colspan="4" style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td></tr>')

            }else if('001 001 00WS' === req.ExpenseReport.Budget && 'BRL' !== req.ExpenseReport.Currency){
              console.log('header whole e nao real');
              // header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;"><td>Payment Date</td><td>Description</td><td>Cost Center</td><td>Value BRL</td><td>Value '+ req.ExpenseReport.Currency +'</td></tr>'
              header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;">'+
                          '<td style="width:10%;">Date</td>'+
                          '<td style="width:50%;">Description</td>'+
                          '<td style="width:10%;">CC</td>'+
                          '<td style="width:15%;">Value '+ req.ExpenseReport.Currency +'</td>'+
                          '<td style="width:15%;">Value BRL</td>'+
                        '</tr>'
              let items = req.listItem.reduce(function(acc, e){
                acc.total += e.Value
                acc.totalEstrangeiro += e.ValueConverted
                acc.tabelaItem = acc.tabelaItem + '<tr style="">'+
                                            '<td style="padding:3px;border:1px solid black;text-align:center;">'+ moment(e.PaymentDate).format('DD/MM/YYYY') + '</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:left;">'+ e.Description +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:center;">'+ e.CostCenter +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.Value.toFixed(2) +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.ValueConverted.toFixed(2) +'</td>'+
                                          '</tr>'
                return acc
              }, {tabelaItem:'', total: 0,totalEstrangeiro:0})

              $('#headerItem').append(header)
              $('#bodyItem').append(items.tabelaItem)
              $('#bodyItem').append('<tr>'+
                                      '<td colspan="3"></td>'+
                                      '<td style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td>'+
                                      '<td style="text-align:right;padding:3px;">'+ items.totalEstrangeiro.toFixed(2)+'</td>'+
                                    '</tr>')
            }else if('001 001 00WS' !== req.ExpenseReport.Budget && 'BRL' === req.ExpenseReport.Currency){
              console.log('header nao whole e real');
              header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;">'+
                          '<td style="width:10%;">Date</td>'+
                          '<td style="width:70%;">Description</td>'+
                          '<td style="width:20%;">Value</td>'+
                        '</tr>'
              let items = req.listItem.reduce(function(acc, e){
                acc.total += e.Value
                acc.tabelaItem = acc.tabelaItem + '<tr style="">'+
                                            '<td style="padding:3px;border:1px solid black;text-align:center;">'+ moment(e.PaymentDate).format('DD/MM/YYYY') + '</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:left;">'+ e.Description +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.Value.toFixed(2) +'</td>'+
                                          '</tr>'
                return acc
              }, {tabelaItem:'',total:0})

              $('#headerItem').append(header)
              $('#bodyItem').append(items.tabelaItem)
              $('#bodyItem').append('<tr><td colspan="4" style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td></tr>')
            }else if('001 001 00WS' !== req.ExpenseReport.Budget && 'BRL' !== req.ExpenseReport.Currency){
              console.log('header nao whole nao real');
              header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;">'+
                          '<td style="width:10%;">Date</td>'+
                          '<td style="width:50%;">Description</td>'+
                          '<td style="width:15%;">Value '+ req.ExpenseReport.Currency +'</td>'+
                          '<td style="width:15%;">Value BRL</td>'+
                        '</tr>'
              let items = req.listItem.reduce(function(acc, e){
                acc.total += e.Value
                acc.totalEstrangeiro += e.ValueConverted
                acc.tabelaItem = acc.tabelaItem + '<tr style="">'+
                                            '<td style="padding:3px;border:1px solid black;text-align:center;">'+ moment(e.PaymentDate).format('DD/MM/YYYY') + '</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:left;">'+ e.Description +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.Value.toFixed(2) +'</td>'+
                                            '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.ValueConverted.toFixed(2) +'</td>'+
                                          '</tr>'
                return acc
              }, {tabelaItem:'', total: 0,totalEstrangeiro:0})

              $('#headerItem').append(header)
              $('#bodyItem').append(items.tabelaItem)
              $('#bodyItem').append('<tr>'+
                                      '<td colspan="3"></td>'+
                                      '<td style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td>'+
                                      '<td style="text-align:right;padding:3px;">'+ items.totalEstrangeiro.toFixed(2)+'</td>'+
                                    '</tr>')
            }

            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              console.log(pdfFile);
              req.REPexpenseReport = pdfFile.filename
              next()
            })
          })
      }
    })
  }

  this.REPaccountability = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/report/accountability.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            console.log('PDF rota aaa accountability')
            console.log(req.ExpenseReport)
            console.log('PDF rota aaa accountability')
            console.log(req.listItemCashAdvanced)
            console.log('PDF rota aaa accountability')
            $('#Code').text( req.ExpenseReport.Code )
            $('#CreatedAt').text( moment(req.ExpenseReport.CreatedAt).format('DD/MM/YYYY') )
            $('#Type').text( req.ExpenseReport.NameType )
            $('#Budget').text( req.ExpenseReport.Budget )
            $('#RequestedBy').text( req.ExpenseReport.RequestedBy )
            $('#AuthorizedBy').text( req.ExpenseReport.AuthorizedBy )
            $('#Currency').text( req.ExpenseReport.Currency )
            $('#CurrencyQuotation').text( req.ExpenseReport.CurrencyQuotation )
            $('#EventName').text( req.ExpenseReport.EventName )

            let header = ''
            if('BRL' === req.ExpenseReport.Currency){
              console.log('brl');
              header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;">'+
                          '<td style="width:10%;">Date</td>'+
                          '<td style="width:60%;">Description</td>'+
                          '<td style="width:20%;">Value</td>'+
                        '</tr>'
              // let items = req.listItem.reduce(function(acc, e){
              //   acc.total += e.Value
              //   acc.tabelaItem = acc.tabelaItem + '<tr style="">'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:center;">'+ moment(e.PaymentDate).format('DD/MM/YYYY') + '</td>'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:left;">'+ e.Description +'</td>'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.Value.toFixed(2) +'</td>'+
              //                             '</tr>'
              //   return acc
              // }, {tabelaItem:'',total:0})

              $('#headerItem').append(header)
              // $('#bodyItem').append(items.tabelaItem)
              // $('#bodyItem').append('<tr><td colspan="4" style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td></tr>')

            }else{
              console.log('nao real');
              // header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;"><td>Payment Date</td><td>Description</td><td>Cost Center</td><td>Value BRL</td><td>Value '+ req.ExpenseReport.Currency +'</td></tr>'
              header = '<tr style="background-color:#ddd;line-height: 18px;text-align:center;">'+
                          '<td style="width:10%;">Date</td>'+
                          '<td style="width:50%;">Description</td>'+
                          '<td style="width:15%;">Value '+ req.ExpenseReport.Currency +'</td>'+
                          '<td style="width:15%;">Value BRL</td>'+
                        '</tr>'
              // let items = req.listItem.reduce(function(acc, e){
              //   acc.total += e.Value
              //   acc.totalEstrangeiro += e.ValueConverted
              //   acc.tabelaItem = acc.tabelaItem + '<tr style="">'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:center;">'+ moment(e.PaymentDate).format('DD/MM/YYYY') + '</td>'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:left;">'+ e.Description +'</td>'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.Value.toFixed(2) +'</td>'+
              //                               '<td style="padding:3px;border:1px solid black;text-align:right;">'+ e.ValueConverted.toFixed(2) +'</td>'+
              //                             '</tr>'
              //   return acc
              // }, {tabelaItem:'', total: 0,totalEstrangeiro:0})

              $('#headerItem').append(header)
              // $('#bodyItem').append(items.tabelaItem)
              // $('#bodyItem').append('<tr>'+
              //                         '<td colspan="3"></td>'+
              //                         '<td style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td>'+
              //                         '<td style="text-align:right;padding:3px;">'+ items.totalEstrangeiro.toFixed(2)+'</td>'+
              //                       '</tr>')
            }


            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              console.log(pdfFile);
              // res.download(pdfFile.filename, new Date() + 'report.pdf')
              req.REPaccountability = pdfFile.filename
              next()
            })
          })
      }
    })
  }

}

module.exports = new HtmlPDF()
