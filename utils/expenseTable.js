const { reverseString } = require('../utils/reverseString');
const { getDate } = require('../utils/getDate');
const ExpensesTransaction = require('../models/ExpensesTransaction');

exports.expenseTable = (doc) => {
   let subCtg ,field ,comment;

   for(let i=0 ; i<doc.expensesId.subCategory.length; i++){
        if(doc.expensesId.subCategory[i]._id.toString() == doc.subCategoryId.toString()){
        
            subCtg =  doc.expensesId.subCategory[i];
            break;
        }
    }

    for(let i=0 ; i<doc.expensesId.field.length; i++){
        if(doc.expensesId.field[i]._id.toString() == doc.fieldId.toString()){
            field =  doc.expensesId.field[i];
            break;
        }
    }

    //untill we add field to expnses
    field = {name : "test1Field"}

    if(comment){
        comment = {
            text: reverseString(`تعليق : ${comment}`), 
            style:[
                {
                    alignment:'right',
                    fontSize: 10, 
                    color : '#444444'  
                } 
            ]
        }
    }


  return {
    content: [  
        {    
            text : reverseString('بيان  مصروفات'), 
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
                    text: reverseString(`اسم  المصروف : ${doc.expensesId.name}`),
                    style:[
                        {
                            alignment:'right', 
                            fontSize: 10, 
                            color : '#444444'
                        } 
                    ]
                },
                {
                    text: reverseString(`رقم  المصروف : ${doc._id}`),
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
                    text: reverseString(`تصنيف  فرعي : ${subCtg.name}`),
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
                }, 
            ]

        },  
        {
            columns:[
                {
                    text: reverseString(`اسم  البند : ${field.name}`),
                    style:[
                        {
                            alignment:'right',
                            fontSize: 10, 
                            color : '#444444'  
                        } 
                    ]
                },
                {
                    text: reverseString(`التاريخ : ${getDate(doc.date)}`),
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
                comment
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
    ],
    styles: { 
      fontdefault: {
        fontSize: 10,  
        color : '#444444'
      }, 
      },
  }

};   