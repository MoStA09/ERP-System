const pdfmake = require('pdfmake');
const {reverseString} = require('./reverseString');
const path = require('path');
 
let fonts = { 
  MyFontName: {
    normal: path.join(__dirname, '..', 'data', '/fonts/arabic.ttf'),
    bold:  path.join(__dirname, '..', 'data', '/fonts/arabic.ttf'),
    italics:  path.join(__dirname, '..', 'data', '/fonts/arabic.ttf'),
    bolditalics:  path.join(__dirname, '..', 'data', '/fonts/arabic.ttf'),
  } 
}
 

exports.generatePdf = (docDefinition, res) => { 
  try {
    
    docDefinition = {
      ...docDefinition,
      defaultStyle: {
        font: 'MyFontName'
      },
      info: {
        title: 'document',
      },
      pageMargins: [ 40, 60, 40, 60 ],
    };


 
        docDefinition.content.unshift({
            table: {
              widths: [ 470,100 ],   
              body: [
                [{text: `${reverseString('بدر الدين للاستيراد والتصدير')}` , style:[{
                  fontSize: 10, 
                  color : '#444444'
                }]},{image:path.join(__dirname, '..', 'data', '/images/companyLogo.png'),width: 40,}], 
                [{text : `${reverseString(`10  كورنيش النيل`)}` , margin: [38, -25, 0, 0], style:[{
                  fontSize: 10, 
                  color : '#444444'
                }] }, ''],

                [{text : `${reverseString('المعادي،  محافظة القاهرة')}` , margin: [6, -13, 0, 0], style:[{
                  fontSize: 10, 
                  color : '#444444'
                }] }, ''], 
              ]
            },
            layout: 'noBorders'
		});


    let pdfDoc = new pdfmake(fonts);
 
    let chunks = []; 


    const doc = pdfDoc.createPdfKitDocument(docDefinition);    
  
  //  doc.on('data', (chunk) => {
  //     chunks.push(chunk);
  //   });  
  
  //   doc.on('end', () => {
  //     const result = Buffer.concat(chunks);
  //     callback('data:application/pdf;base64,' + result.toString('base64'));  
  //   });  
      
    doc.pipe(res);
    doc.end();  
    return doc;
  } catch(err) {
    callback(err);
  }
};   
