const { reverseString } = require('../utils/reverseString');
const { getDate } = require('../utils/getDate');

exports.invoiceTable = (invoice)=> {
    let taxSum  = 0 , sum = 0 , discountSum = 0 , sumBeforeTax = 0 ;

  const invoiceBody =  invoice.products.map(e=>{
    let productName = Object.entries(e.productId)[5][1].productName;
    let price  =  e.productId.price ,
    tax = e.tax , quantity = e.quantity,
    totalPrice = price * quantity + tax ,
    discount = e.discountPercentage;

    
    if(discount){
        totalPrice = totalPrice - ((totalPrice * discount )/ 100); 
        discountSum += discount;
    }

    taxSum += tax ;
    sum += totalPrice ;  
    sumBeforeTax += price * quantity;


    return [{text:reverseString(`${totalPrice} ج.م`) , style:'fontdefault'}, {text:reverseString(`${e.discountPercentage || 0}%`) , style:'fontdefault'},{text:reverseString(`${tax} ج.م`) , style:'fontdefault'}, {text:reverseString(`${e.productId.price * e.quantity} ج.م`) , style:'fontdefault'} ,{text:reverseString(`${e.productId.price} ج.م`) , style:'fontdefault'} , {text:e.quantity , style:'fontdefault'} , {text:productName , style:'fontdefault'}]; 
  });
  return {
    content: [  
      {    
          text : 'فاتورة',
          // margin: [left, top, right, bottom]
          margin: [ 0, 50, 0, 0 ],
          style:[   
              {
                  alignment:'right',
                  fontSize: 15
              }
          ]
      },
      {
          canvas:[
              {
                  type: 'line',
                  x1: 0, y1: 10,
                  x2: 520, y2: 10,
                  lineWidth: 0.5
              }
          ]

      }, 
      {
        columns:[
            {  

                text: " ",
                style:[
                    {
                        alignment:'right', 
                        fontSize: 10, 
                        color : '#444444'
                    } 
                ]
            },
            {
                text: " ",
                style:[
                    {
                        alignment:'right',
                        fontSize: 10, 
                        color : '#444444'  
                    } 
                ]
            }  
        ]

      },   
      {
          columns:[
              {  
                  text: reverseString(`اسم  العميل : ${invoice.clientId.name}`),
                  style:[
                      {
                          alignment:'right',
                          fontSize: 10, 
                          color : '#444444'
                          
                      } 
                  ]
              },
              {
                  text: reverseString(`رقم  الفاتورة : ${invoice.invoiceNumber}`),
                  style:[
                      {
                          alignment:'right',
                          fontSize: 10, 
                          color : '#444444'
                      } 
                  ]
              }  
          ]

      },  
      {
          columns:[
              {  
                  text: reverseString(`المندوب : ${invoice.userId.username}`),
                  style:[
                      {
                          alignment:'right',
                          fontSize: 10, 
                          color : '#444444'
                      } 
                  ]
              },
              {
                  text: reverseString(`التاريخ : ${getDate(invoice.creationDate)}`),
                  style:[
                      {
                          alignment:'right',  
                          fontSize: 10, 
                          color : '#444444'
                      } 
                  ]
              }  
          ]

      },
      {  
          columns:[
              {  
                  text: reverseString(`المنشئ : ${invoice.userId.username}`),
                  style:[
                      {
                          alignment:'right',
                          fontSize: 10, 
                          color : '#444444'
                      }   
                  ]
              },
              {
                  text: reverseString(`المبلغ  المطلوب : ${invoice.totalPrice}`),
                  style:[
                      {
                          alignment:'right',
                          fontSize: 10, 
                          color : '#444444'
                      } 
                  ]
              }  
          ], 
      },
      {
          canvas:[
              {
                  type: 'line',
                  x1: 0, y1: 10, 
                  x2: 520, y2: 10,
                  lineWidth: 0.5
              }
          ] 
      },
      {
          margin: [0, 30, 0, 0],
          table: { 
              widths: [ 50,50,50,50,50,50,'*' ],  
              body: [   
                  [{text:'المنتج', style:'fontdefault'},{text:'الكمية', style:'fontdefault'},{text:'السعر', style:'fontdefault'},{text:'إجمالي', style:'fontdefault'},{text:'الضريبة', style:'fontdefault'},{text:'الخصم', style:'fontdefault'},{text:'المجموع', style:'fontdefault'}].reverse(),
                  ...invoiceBody,  
                  [' ' , ' ' , ' ' , ' ', ' ' , ' ',' ']
                  // ['One value goes here', 'Another one here', 'OK?','c','h','f']
              ],
          },
          layout: 'lightHorizontalLines',
          style:[{alignment:'right'}],  
      }, 
      {
          margin: [0, 0, 0, 15],
          table: {
              widths: [ 55,55,55,55,90,'*' ],   
              body: [   
                   [{text:reverseString(`${sum} ج.م `) , style:'fontdefault'},{text:reverseString(`${discountSum}%`), style:'fontdefault'},{text:reverseString(`${taxSum} ج.م`) , style:'fontdefault'},{text: reverseString(`${sumBeforeTax} ج.م`) , style : 'fontdefault'},{text:reverseString('المبلغ  الاجمالي :') , style:'fontdefault'},{text: ' ' , style : 'fontdefault'}],

                   [{text:' ' , style:'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text: ' ' , style : 'fontdefault'}, {text:' ' , style:'fontdefault'},{text: ' ' , style : 'fontdefault'}],

                //    [{text:reverseString(`-20 ج.م`) , style:'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text: ' ' , style : 'fontdefault'}, {text: reverseString(`الخصم : 5%`) , style:'fontdefault'},{text: ' ' , style : 'fontdefault'}],

                //    [{text:reverseString(`${invoice.totalPrice}  ج.م`)  ,style:'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text: ' ' , style : 'fontdefault'} , {text:reverseString(`المبلغ  المطلوب : `), style: 'fontdefault'} , {text: ' ' , style : 'fontdefault'}], 
              ],
          },  
          layout: 'noBorders',
          style:[{alignment:'right'}],    
      }, 
  ],
  styles: { 
    fontdefault: {
        fontSize: 10, 
        color : '#444444'
    }, 
    },
  }
 
};