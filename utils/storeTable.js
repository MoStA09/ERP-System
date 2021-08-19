const { reverseString } = require('../utils/reverseString');
const { getDate } = require('../utils/getDate');

exports.storeTable = (doc) => {

    let supplier  = undefined , subStore = undefined;
    if(doc.supplierId){
        supplier = {  
            text: reverseString(`اسم المورد: ${doc.supplierId.name}`),
                style:[
                    {
                        alignment:'right',
                        fontSize: 10, 
                        color : '#444444'
                    } 
                ]
            }
    }
    if(doc.subStoreId){
        subStore = {  
            text: reverseString(`اسم المتجر الفرعي : ${doc.subStoreId.name}`),
                style:[
                    {
                        alignment:'right',
                        fontSize: 10, 
                        color : '#444444'
                    } 
                ]
            }
    }
    



    const docBody = doc.products.map(e=>{
      let productName = Object.entries(e.productId)[5][1].productName;

        return[{text:`${reverseString(productName)}`, style:'fontdefault'},
        {text : `${e.productId.category}` , style:'fontdefault'},
        {text : `${e.quantity}` , style:'fontdefault'},{text : `${e.productId.price}` , style:'fontdefault'},
        {text : `${e.productId.tax}` , style:'fontdefault'}].reverse(); 
    });
  return {
    content: [  

        {    
            text : reverseString(`تحويل  منتجات`),
            // margin: [left, top, right, bottom]
            margin: [ 0, 30, 0, 0 ],
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
                    text: reverseString(`اسم  المتجر : ${doc.storeId.name}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        } 
                    ]
                },
                {  
                    text: reverseString(`رقم  المتجر : ${doc.storeId._id}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        } 
                    ]
                },
 
            ]
  
        },  
        {
            columns:[
                subStore,
                supplier
            ]
  
        },  
        {
            columns:[
                {  
                    text: reverseString(`الاتجاه : ${doc.direction === 'in' ? 'دخول' : 'خروج'}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10,  

                            color : '#444444'
                        } 
                    ]
                },
                {
                    text: reverseString(`التاريخ : ${getDate(doc.creationDate)}`),
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
                    text: reverseString(`تعليق : ${doc.comment}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        }   
                    ]
                },
                {
                    text: reverseString(`المبلغ : ${doc.price}`),
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
          margin: [0, 20, 0, 0],
          table: { 
              widths: [ 50,50,50,50,'*' ],  
              body: [   
                  [{text:'المنتج', style:'fontdefault'},{text:'التصنيف', style:'fontdefault'},{text:'الكمية', style:'fontdefault'},{text:'السعر', style:'fontdefault'},{text:'الضريبة', style:'fontdefault'}].reverse(),
                  ...docBody,    
                  [' ' , ' ' , ' ' , ' ', ' ' ]
              ],
          }, 
          layout: 'lightHorizontalLines',
          style:[{alignment:'right'}],  
      }, 
    ],
    styles: { 
      fontdefault: {
          fontSize: 9,
          color : '#444444'
      }, 
      },
  }

};   