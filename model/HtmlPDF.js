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
            $('#Type').text( req.ExpenseReport.ExpenseReportType_ID )
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

            // //prod
            // let items = req.listItem.reduce(function(acc, ele){
            //   acc.total = acc.total + (ele.Price * ele.Amount * 1.14)
            //   acc.tabelaProd = acc.tabelaProd + '<tr style="line-height: 15px;">'+
            //                             '  <td style="border:1px solid black;">'+ ele.ProductNameEnglish + '/' + ele.ProductNamePort + '(' + ele.UnitInEnglish + '/' + ele.UnitInPort + ')' + '</td>'+
            //                             '  <td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Amount + '</td>'+
            //                               '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Price.toFixed(2) +' </td>'+
            //                               '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ (ele.Price * ele.Amount * 1.14).toFixed(2) +'</td>'+
            //                             '</tr>'
            //   return acc
            // }, {tabelaProd:'',total:0})
            //
            // products.tabelaProd = products.tabelaProd + '<tr style="line-height: 15px;"><td colspan="4" style="padding-right:3px;text-align:right;">'+ (products.total).toFixed(2) +'</td></tr>'

            // $('#bodyProducts').html(products.tabelaProd)

            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              console.log(pdfFile);
              // res.download(pdfFile.filename, new Date() + 'report.pdf')
              req.REPexpenseReport = pdfFile.filename
              next()
            })
          })
      }
    })
  }
  this.REPaccountability = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/report/external-event.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err
          callback(err)
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            console.log('____event printado')
            console.log(req.findEventByCode)
            console.log('____event printado')

            $('#eventName').text(Util.toTitleCase(req.findEventByCode.title || 'Not Reported'))
            $('#Type').text('External')
            $('#eventcode').text(req.findEventByCode.EventCode)
            $('#eventstatus').text(Util.toTitleCase(req.findEventByCode.StatusName || 'Not Reported'))
            $('#createdBy').text(Util.toTitleCase(req.findEventByCode.CreatedByName || 'Not Reported'))
            $('#responsibleBy').text(Util.toTitleCase(req.findEventByCode.ResponsibleByName || 'Not Reported'))
            $('#departamento').text(Util.toTitleCase('departamento buscar'))

            $('#startTime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm'))
            $('#endTime').text(moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))
            // $('#startendtime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm') + '\n' +  moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))

            $('#LeavingTheEvent').text(Util.toTitleCase(moment(req.findEventByCode.LeavingFromEvent).format('DD/MM/YYYY HH:mm') || 'Not Reported'))
            $('#LocationName').text(Util.toTitleCase(req.findEventByCode.LocationEvent || 'Not Reported'))

            $('#DepartureLocation').text(req.findEventByCode.DepartureFrom || 'Not Reported')
            $('#NPassenger').text(req.findEventByCode.AmountPerson || 'Not Reported')

            if(req.findEventByCode.MeansOfTransport){
              $('#MeansOfTransport').text(req.findEventByCode.TypeVehicleEnglish + '/' + req.findEventByCode.TypeVehiclePort)
            }else{
              $('#MeansOfTransport').text('Not Reported')
            }

            $('#WaitInAvenue').text(req.findEventByCode.TransportWaitAvenue || 'Not Reported')

            if(req.findEventByCode.setor){
              $('#Budget').text(req.findEventByCode.setor + ' ' + req.findEventByCode.grupo + ' ' + req.findEventByCode.conta)
            }else{
              $('#Budget').text('Not Reported')
            }


            $('#Nparent').text(req.findEventByCode.Nparent || 'Not Reported')
            $('#Npupil').text(req.findEventByCode.Npupil || 'Not Reported')
            $('#Nstaff').text(req.findEventByCode.Nstaff || 'Not Reported')
            $('#Nvisitor').text(req.findEventByCode.Nvisitor || 'Not Reported')

            $('#AdditionalInformation').text(Util.toTitleCase(req.findEventByCode.AdditionalInformation || 'Not Reported'))

            //prod
            let products = req.findEventByCode.products.reduce(function(acc,ele){
              acc.total = acc.total + (ele.Price * ele.Amount * 1.14)
              acc.tabelaProd = acc.tabelaProd + '<tr style="line-height: 15px;">'+
                                        '  <td style="border:1px solid black;">'+ ele.ProductNameEnglish + '/' + ele.ProductNamePort + '(' + ele.UnitInEnglish + '/' + ele.UnitInPort + ')' + '</td>'+
                                        '  <td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Amount + '</td>'+
                                          '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Price.toFixed(2) +' </td>'+
                                          '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ (ele.Price * ele.Amount * 1.14).toFixed(2) +'</td>'+
                                        '</tr>'
              return acc
            },{tabelaProd:'',total:0})

            let footerTableProd = '<tr style="line-height: 15px;"><td colspan="4" style="padding-right:3px;text-align:right;">'+ (products.total).toFixed(2) +'</td></tr>'
            products.tabelaProd = products.tabelaProd + footerTableProd

            if(req.findEventByCode.products.length > 0){
              $('#bodyProducts').html(products.tabelaProd)
            }else{
              $('#bodyProducts').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have products</td></tr>')
            }

            //guest
            console.log(req.findEventByCode.guests)
            console.log('________________________')
            let guests = req.findEventByCode.guests.reduce(function(acc,ele){
              acc.tabelaGuest = acc.tabelaGuest + '<tr style="line-height: 15px;">'+
                                                  '<td style="border:1px solid black;">'+ ele.Type +' </td>'+
                                                  '<td style="border:1px solid black;">'+ ele.NameGuest +'</td>'+
                                                '</tr>'
              return acc
            },{tabelaGuest:''})

            if(req.findEventByCode.guests.length > 0){
              $('#bodyGuests').html(guests.tabelaGuest)
            }else{
              $('#bodyGuests').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have guests</td></tr>')
            }

            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              console.log(pdfFile);
              res.download(pdfFile.filename, new Date() + 'report.pdf')
            })
          })
      }
    })
  }
}

module.exports = new HtmlPDF()
