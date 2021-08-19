const cheque = {
    amount: 100,
    clientId: "5f46650ebd98031f9013b4ae",
    userId: "5f46650ebd98031f9013b4ae",
    safeId: "5f46650ebd98031f9013b4ae",
    bankId: "5f46650ebd98031f9013b4ae",
    history: [
      {
        date: new Date(),
        comment: "created cheque"
      },
    ],
    state: 'on hold', //enum: ["on hold", "rejected", "in safe", "in bank"]
    creationDate: new Date(),
    collectionDate: new Date()
};

const client = {
    name: 'client1',
    products: [
        {
            productId: "5f46650ebd98031f9013b4ae"                   
        },
        {
            productId: "5f46650ebd98031f9013b4ae"                   
        },
    ],
    subClients:    
    [
        {
            name: 'subClient1',
            deleted: false  
        },
    ],
    deleted: false
};

const collectionStatement = {
  clientId: "5f46650ebd98031f9013b4ae",
  userId: "5f46650ebd98031f9013b4ae",
  amount: 100,
  state: 'on hold', //enum: ['on hold', 'accepted', 'rejected']
  creationDate: new Date(),
  history: [
    {
      date: new Date(),
      comment: "created collection statement"
    }
  ]
};

const discount = {
  clientId: "5f46650ebd98031f9013b4ae",
  productId: "5f46650ebd98031f9013b4ae",
  startDate: new Date(),
  endDate: new Date(),
  percentage: 90,
};

const expenses = {
  name: 'expenses1',
  subCategory: [
    {
      name: 'subCateg1',
    },
  ],
  field: [
    {
      name: 'field1',
    },
  ],
};

const expensesTransaction = {
    expensesId: "5f46650ebd98031f9013b4ae",
      subCategoryId: "5f46650ebd98031f9013b4ae",
      fieldId: "5f46650ebd98031f9013b4ae",
      date: new Date(),
      amount: 100,
      comment: "created expenses transaction"
};

const invoice = {
    invoiceNumber: 1,
    type: 'invoice', //enum:["invoice","returnInvoice","future","emptyCharge","emptyDischarge"] 
    //In case of emptyCharge or emptyDischarge invoices cliendId could be used as a supplierId
    clientId: "5f46650ebd98031f9013b4ae",
    userId: "5f46650ebd98031f9013b4ae",
    products:[
        {
            productId: "5f46650ebd98031f9013b4ae",
            quantity: 5,
            unitPrice: 5,
            tax: 5,
            discounts: [
                {
                    discountId: "5f46650ebd98031f9013b4ae"
                },
            ],
            discountPercentage: 90,
        }
    ],
    totalPrice: 100,
    creationDate: new Date(),
    history: [
        {
            date: new Date(),
            comment: "created invoice"
        },
    ]
};

const product = {
  name: 'product1',
  price: 5,
  tax: 10,
  category: 'category1',
  unit: 5,
  deleted: false
};

const safe = {
  name: 'safe1',
  currency: 'EGP', //enum: ["EGP", "USD", "EUR"],
  amount: 100,
  type: 'Safe', //enum: ["Safe", "Bank"]
  deleted: false
};

const safeBankTransaction = {
  safeId: "5f46650ebd98031f9013b4ae",
  userId: "5f46650ebd98031f9013b4ae",
  direction: 'in', //enum: ["in", "out"]
    
  type: 'cash', //enum: ["cash", "cheque"]
  comment: 'created safe Bank Transaction',
  creationDate: new Date(),
  amount: 100,
};

const store = {
  name: 'store1',
  products: [
    {
      productId: "5f46650ebd98031f9013b4ae",
      quantity: 5
    },
  ],
  deleted: false
};

const storeTransaction = {
  storeId: '5f46650ebd98031f9013b4ae',
  subStoreId: '5f46650ebd98031f9013b4ae', //can be removed
  direction: 'in', //enum: ['in', 'out']
  products: [
    {
      productId: '5f46650ebd98031f9013b4ae',
      quantity: 5,
    },
  ],
  comment: 'created store transaction',
  creationDate: new Date(),
  supplierId: '5f46650ebd98031f9013b4ae', //can be removed
  storeDirectorId: '5f46650ebd98031f9013b4ae',
  price: 50
};

const subStore = {
  name: 'subStore1',
  products: [
    {
      productId: '5f46650ebd98031f9013b4ae',
      quantity: 50,
    },
  ],
  storeId: '5f46650ebd98031f9013b4ae',
  deleted: false
};

const supplier = {
  name: 'supplier1',
  products: [
    {
      productId: '5f46650ebd98031f9013b4ae',
      price: 50,
    },
  ],
};

const user = {
  username: 'user1',
  password: 'user1',
  type: 'it', //enum: ['it', 'store director', 'salesman','sales supervisor','sales director','financial director',
  //'accounting supervisor','accountant','collector','general manager'
  deleted: false,
  teamMembers: [
    {
      type: '5f46650ebd98031f9013b4ae'
    },
 ]
};