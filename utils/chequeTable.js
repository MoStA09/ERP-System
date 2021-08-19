const { reverseString } = require('../utils/reverseString');
const { getDate } = require('../utils/getDate');

exports.chequeTable = (doc) => {

    let state ; 
    if(doc.state === 'on hold'){
        state = 'في الانتظار'
    }else if(doc.state === 'in safe'){
        state = 'في الخزنة'
    }else if(doc.state=== 'rejected'){
        state = 'مرفوض'
    }else if(doc.state=== 'in bank'){
        state = 'في البنك'

    };

    const DocBody = doc.history.map(e=>{
        return [
            {text : `${e.comment}` , style : 'fontdefault' },{text:getDate(e.date) , style:'fontdefault'}
        ]
    })   
  return {
    content: [  
        {    
            text : 'شيك',
            // margin: [left, top, right, bottom]
            margin: [ 0, 10, 0, 0 ],

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
                    text: reverseString(`اسم  العميل : ${doc.clientId.name}`),
                    style:[
                        {
                            alignment:'right', 
                            fontSize: 10, 
                            color : '#444444'
                        } 
                    ]
                },
                {
                    text: reverseString(`رقم  الشيك : ${doc._id}`),
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
                    text: reverseString(`المندوب : ${doc.userId.username}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        } 
                    ]
                },
                {
                    text: reverseString(`تاريخ  الصدور : ${getDate(doc.creationDate)}`),
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
                    text :  reverseString(`الحالة :  ${state}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        }   
                    ]
                },
                {
                    text: reverseString(`المبلغ  المطلوب : ${doc.amount}`),
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
            columns:[
                {  
                    text :  reverseString(`تاريخ  الاستلام :  ${getDate(doc.collectionDate)}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        }   
                    ]
                },
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
                widths: [ 400,100 ],  
                body: [   
                    [{text:'التاريخ', style:'fontdefault'},{text:'تعليق', style:'fontdefault'}].reverse(), 
                    ...DocBody,
                    [' ' , ' ']

                    // ['One value goes here', 'Another one here', 'OK?','c','h','f']
                ],
            },
            layout: 'lightHorizontalLines',
            style:[{alignment:'right'}],  
        }
    ],
    styles: { 
      fontdefault: {
        fontSize: 10, 
        color : '#444444'
      }, 
      },
  }
 
}; 
