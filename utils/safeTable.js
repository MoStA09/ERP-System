const { reverseString } = require('../utils/reverseString');
const { getDate } = require('../utils/getDate');

exports.safeTable = (doc) => {
    let safeType ; 
    if(doc.safeId.type === 'safe'){
        state = 'خزنه'
    }else if(doc.safeId.type === 'bank'){
        state = 'بنك'
    };

    let direction ; 
    if(doc.direction === 'in'){
        direction = 'دخول الخزنه'
    }else if(doc.direction === 'out'){
        direction = 'خروج من الخزنه'
    };

  return {
    content: [  
        {    
            text : reverseString('تحويل  اموال'),
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
                    text: reverseString(`اسم  الخزنه : ${doc.safeId.name}`),
                    style:[
                        {
                            alignment:'right', 
                            fontSize: 10, 
                            color : '#444444'
                        } 
                    ]
                },
                {
                    text: reverseString(`رقم  التحويل : ${doc._id}`),
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
                    text: reverseString(`المستخدم : ${doc.userId.username}`),
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
                    text :  reverseString(`الاتجاه :  ${direction}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        }   
                    ]
                },
                {
                    text: reverseString(`المبلغ  : ${doc.amount}`),
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
                    text :  reverseString(`النوع :  ${doc.type === 'cash' ? "كاش" : "شيك"}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'
                        }   
                    ]
                },
                {
                    text: reverseString(`تعليق  : ${doc.comment}`),
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
    ],
    styles: { 
      fontdefault: {
        fontSize: 10,  
        color : '#444444'
      }, 
      },
  }

}; 