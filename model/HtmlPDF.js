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
            $('#CreatedAt').text( moment(req.ExpenseReport.CreatedAt).format('DD/MM/YYYY') )
            $('#Type').text( req.ExpenseReport.NameType )
            $('#Budget').text( req.ExpenseReport.Budget )
            $('#RequestedBy').text( req.ExpenseReport.RequestedBy )
            $('#AuthorizedBy').text( req.ExpenseReport.AuthorizedBy )
            $('#Currency').text( req.ExpenseReport.Currency )
            $('#CurrencyQuotation').text( req.ExpenseReport.CurrencyQuotation )
            $('#EventName').text( req.ExpenseReport.EventName )
            $('#PaymentType').text( req.ExpenseReport.PaymentTypeName )

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
              $('#bodyItem').append('<tr><td colspan="3" style="text-align:right;padding:3px;">'+ items.total.toFixed(2) +'</td></tr>')
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
                                      '<td colspan="2"></td>'+
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

              let contentHTML = ''
              let totalAccountability = 0
              req.listItemCashAdvanced.map(function(itemER){
                contentHTML += '<table cellspacing="0" style="width:100%;">'
                contentHTML += '<tr style="background-color:#aaa;"><td style="padding:7px;"> ' + itemER.Description +'</td><td style="text-align:right;">'+ itemER.Value + '('+ req.ExpenseReport.Currency +')' +'</td></tr>'
                contentHTML += '<tr style="background-color:#ddd;text-align:right;"><td style="padding:4px;text-align:left;">Description</td><td style="padding:4px;">Value BRL</td></tr>'
                let totalAccItem = 0
                itemER.listItemAccountability.map(function(a){
                  totalAccountability += parseFloat(a.Value)
                  totalAccItem += parseFloat(a.Value)
                  contentHTML += '<tr>'
                    contentHTML += '<td style="width:80%;">'+ a.DescriptionAcc +'</td>'
                    contentHTML += '<td style="width:20%;text-align:right;">'+ a.Value +'</td>'
                  contentHTML += '</tr>'
                })
                contentHTML += '<tr><td style="width:80%;"></td><td style="text-align:right;width:20%;background-color:#ddd;">'+ totalAccItem.toFixed(2) +'</td></tr>'
                contentHTML += '</table>'
                contentHTML += '<br />'
              })

              console.log(totalAccountability + 'total na moeda')

              $('#Resume').text( ' You spent ' + totalAccountability + ' of ' + req.ExpenseReportBrother_Code.TotalValue + ' requested from Expense Report Nº ' + req.ExpenseReport.Brother_Code)

              $('#accountabilityItem').append(contentHTML)
            }else{
              console.log('nao real');
              let contentHTML = ''
              let totalAccountability = 0
              let totalAccountabilityConverted = 0
              req.listItemCashAdvanced.map(function(itemER){
                console.log('itemer')
                console.log(itemER)
                console.log('itemer')

                contentHTML += '<table cellspacing="0" style="width:100%;">'
                contentHTML += '<tr style="background-color:#aaa;"><td style="padding:7px;"> ' + itemER.Description +'</td><td style="text-align:right;">'+ itemER.Value + '('+ req.ExpenseReport.Currency +')' +'</td><td style="text-align:right;">'+ itemER.ValueConverted + '(BRL)' +'</td></tr>'
                contentHTML += '<tr style="background-color:#ddd;text-align:right;"><td style="padding:4px;text-align:left;">Description</td><td style="padding:4px;">Value '+ req.ExpenseReport.Currency +'</td><td style="padding:4px;">Value BRL</td></tr>'
                let totalAccItem = 0
                let totalAccItemConverted = 0
                itemER.listItemAccountability.map(function(a){
                  console.log(a)
                  totalAccountability += parseFloat(a.Value)
                  totalAccountabilityConverted += parseFloat(a.Value) * parseFloat(req.ExpenseReport.CurrencyQuotation)
                  totalAccItem += parseFloat(a.Value)
                  totalAccItemConverted += parseFloat(a.Value) * parseFloat(req.ExpenseReport.CurrencyQuotation)
                  contentHTML += '<tr>'
                    contentHTML += '<td style="width:60%;">'+ a.DescriptionAcc +'</td>'
                    contentHTML += '<td style="width:20%;text-align:right;">'+ a.Value +'</td>'
                    contentHTML += '<td style="width:20%;text-align:right;">'+ a.ValueConverted +'</td>'
                  contentHTML += '</tr>'
                })
                contentHTML += '<tr><td style="width:60%;"></td><td style="background-color:#ddd;text-align:right;width:20%;">'+ totalAccItem.toFixed(2) +'</td><td style="background-color:#ddd;text-align:right;width:20%;">'+ totalAccItemConverted.toFixed(2) +'</td></tr>'
                contentHTML += '</table>'
                contentHTML += '<br />'
              })

              console.log(totalAccountability + 'total na moeda');
              console.log(totalAccountabilityConverted + 'total na moeda convertido');

              $('#Resume').text( ' You spent ' + totalAccountability + ' of ' + req.ExpenseReportBrother_Code.TotalValue + ' requested from Expense Report Nº ' + req.ExpenseReport.Brother_Code)

              $('#accountabilityItem').append(contentHTML)
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
