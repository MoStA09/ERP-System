const { addProduct } = require("./product");
const invoices = require("./invoice");  
const { loginAdmin, createTestUser } = require("./utils");
const { addClient, addSubClient, deleteTest } = require("./client");
const products = require("./product");
const users = require("./user");  



test("should create invoice and return the invoice", async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testI",password:"test",type:"salesman"},logAdmin.data);
  const product = await addProduct({name:"testProducta",tax:50,price:800,category:"products",unit:50},logAdmin.data);
  const product2 = await addProduct({name:"testProduct2a",tax:30,price:70,category:"products",unit:10},logAdmin.data);
  const client = await addClient({name:"clientTesta"},logAdmin.data);
  const subClient = await addSubClient({name:"subTest1a"},client.data.data._id,logAdmin.data);

  const createInvoiceBody = { 
    userId: user.data2._id,  
    type: "invoice",
    products:[
      {
        productId:  product.data.data._id,
        quantity : 10  
      },
      {
        productId:  product2.data.data._id,  
        quantity : 50
      },
    ],
    comment : "none"
  };

    const res = await invoices.createInvoice(createInvoiceBody,client.data.data._id,subClient.data.data.subClients[0].name,user.data); 

    //delete invoice
    await invoices.deleteInvoice(res.data.data._id);
    //delete Client
    await deleteTest(client.data.data._id);
    //delete products
    await products.deleteTest(product.data.data._id);
    await products.deleteTest(product2.data.data._id);
    //delete user
    await users.deleteTest(user.data2._id);
   
  expect(res).toHaveProperty('data.data'); 
});  


test("should edit invoice and return the updated Invoice", async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testzs",password:"test",type:"salesman"},logAdmin.data);
  const product = await addProduct({name:"testProducts",tax:50,price:800,category:"products",unit:50},logAdmin.data);
  const product2 = await addProduct({name:"testProduct2s",tax:30,price:70,category:"products",unit:10},logAdmin.data);
  const client = await addClient({name:"clientTests"},logAdmin.data);
  const subClient = await addSubClient({name:"subTest1s"},client.data.data._id,logAdmin.data);

  const createInvoiceBody = { 
    userId: user.data2._id,  
    type: "invoice",
    products:[
      {
        productId:  product.data.data._id,
        quantity : 10  
      },
      {
        productId:  product2.data.data._id,  
        quantity : 50
      },
    ],
    comment : "none"
  };

  const invoiceBody = {
    userId: user.data2._id,  
    type: "invoice",
    products:[
      {
        productId:  product.data.data._id,
        quantity : 10  
      },
      {
        productId:  product2.data.data._id,  
        quantity : 50
      },
    ],
    comment : "edited"
  };

  const invoice = await invoices.createInvoice(createInvoiceBody,client.data.data._id,subClient.data.data.subClients[0].name,user.data); 

  const res = await invoices.editInvoice(invoiceBody,invoice.data.data._id,user.data);

  await invoices.deleteInvoice(invoice.data.data._id); 
      //delete invoice
  await invoices.deleteInvoice(res.data.data._id);
      //delete Client
  await deleteTest(client.data.data._id);
      //delete products
  await products.deleteTest(product.data.data._id);
  await products.deleteTest(product2.data.data._id);
      //delete user
  await users.deleteTest(user.data2._id);

  expect(res).toHaveProperty('data.data'); 
});


test("should schedule future invoice", async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testae",password:"test",type:"salesman"},logAdmin.data);
  const product = await addProduct({name:"testProducte",tax:50,price:800,category:"products",unit:50},logAdmin.data);
  const product2 = await addProduct({name:"testProduct2e",tax:30,price:70,category:"products",unit:10},logAdmin.data);
  const client = await addClient({name:"clientTeste"},logAdmin.data);
  const subClient = await addSubClient({name:"subTest1e"},client.data.data._id,logAdmin.data);

  const futureInvoiceBody = {
    userId: user.data2._id,  
    creationDate : new Date(Date.now() + 50000000000),
    products:[
      {
        productId:  product.data.data._id,
        quantity : 10  
      },
      {
        productId:  product2.data.data._id,  
        quantity : 50
      },
    ],
    comment : "schedule future invoice"
  };

  const res = await invoices.scheduleFutureInvoice(futureInvoiceBody,client.data.data._id,subClient.data.data.subClients[0].name,user.data); 
  
      //delete invoice
      await invoices.deleteInvoice(res.data.data._id);
      //delete Client
      await deleteTest(client.data.data._id);
      //delete products
      await products.deleteTest(product.data.data._id);
      await products.deleteTest(product2.data.data._id);
      //delete user
      await users.deleteTest(user.data2._id);

  expect(res).toHaveProperty('data.data'); 
});

test("should schedule future invoice to a sales man", async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const salesman = await createTestUser({username:"testaef",password:"test",type:"salesman"},logAdmin.data);
  const supervisor = await createTestUser({username:"test2f",password:"test",type:"sales supervisor"},logAdmin.data);
  const product = await addProduct({name:"testProductf",tax:50,price:800,category:"products",unit:50},logAdmin.data);
  const product2 = await addProduct({name:"testProduct2f",tax:30,price:70,category:"products",unit:10},logAdmin.data);
  const client = await addClient({name:"clientTestf"},logAdmin.data);
  const subClient = await addSubClient({name:"subTest1f"},client.data.data._id,logAdmin.data);

  const invoiceBody = {
    userId: salesman.data2._id,  
    creationDate : new Date(Date.now() + 50000000000),
    products:[
      {
        productId:  product.data.data._id,
        quantity : 10  
      },
      {
        productId:  product2.data.data._id,  
        quantity : 50
      },
    ],
    comment : "schedule future invoice"
  }; 

   
  const res = await invoices.scheduleInvoiceToSalesman(invoiceBody,client.data.data._id,subClient.data.data.subClients[0].name,supervisor.data2._id, supervisor.data); 


        //delete invoice
        await invoices.deleteInvoice(res.data.data._id);
        //delete Client
        await deleteTest(client.data.data._id);
        //delete products
        await products.deleteTest(product.data.data._id);
        await products.deleteTest(product2.data.data._id);
        //delete user
        await users.deleteTest(salesman.data2._id);
        await users.deleteTest(supervisor.data2._id);

  expect(res).toHaveProperty('data.data'); 
});


test("should edit future invoice", async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testbv",password:"test",type:"sales supervisor"},logAdmin.data);
  const salesman = await createTestUser({username:"test2v",password:"test",type:"salesman"},logAdmin.data);
  const product = await addProduct({name:"testProductv",tax:50,price:800,category:"products",unit:50},logAdmin.data);
  const product2 = await addProduct({name:"testProduct2v",tax:30,price:70,category:"products",unit:10},logAdmin.data);
  const client = await addClient({name:"clientTestv"},logAdmin.data);
  const subClient = await addSubClient({name:"subTest1v"},client.data.data._id,logAdmin.data);

  const futureInvoiceBody = {
    userId: salesman.data2._id,  
    creationDate : new Date(Date.now() + 50000000000),
    products:[
      {
        productId:  product.data.data._id,
        quantity : 10  
      },
      {
        productId:  product2.data.data._id,  
        quantity : 50
      },
    ],
    comment : "schedule future invoice"
  };
  
  const invoiceBody = {
    userId: user.data2._id,  
    type:"invoice",
    comment : "edit future invoice"
  };

  
  const invoice = await invoices.scheduleFutureInvoice(futureInvoiceBody,client.data.data._id,subClient.data.data.subClients[0].name,salesman.data); 

  const res = await invoices.editFutureInvoice(invoiceBody,invoice.data.data._id,user.data);

  //delete invoice
  await invoices.deleteInvoice(invoice.data.data._id); 
  //delete Client
  await deleteTest(client.data.data._id);
  //delete products
  await products.deleteTest(product.data.data._id);
  await products.deleteTest(product2.data.data._id);
  //delete user    
  await users.deleteTest(user.data2._id);  
  await users.deleteTest(salesman.data2._id); 

  expect(res).toHaveProperty('data.error'); 
});

test("should create empty invoice", async () => {

  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testnn",password:"test",type:"accounting supervisor"},logAdmin.data);
  const client = await addClient({name:"clientTestn"},logAdmin.data);

  const invoiceBody = {      
    userId: user.data2._id,  
    totalPrice : 450,
    comment : "create empty invoice" 
  };
   
  const res = await invoices.createEmptyInvoice(invoiceBody,client.data.data._id,user.data);
  
    //delete invoice
  await invoices.deleteInvoice(res.data.data._id);  
  //delete Client
  await deleteTest(client.data.data._id);
  //delete user
  await users.deleteTest(user.data2._id);

  expect(res).toHaveProperty('data.data'); 
});   

test("should create empty return invoice", async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"test2u",password:"test2",type:"accounting supervisor"},logAdmin.data);

  const client = await addClient({name:"clientTestu"},logAdmin.data);

  const invoiceBody = {
    userId: user.data2._id,  
    totalPrice : 450,
    comment : "create empty return invoice" 
  };
   
  const res = await invoices.createEmptyReturnInvoice(invoiceBody,client.data.data._id,user.data); 

      //delete invoice  
      await invoices.deleteInvoice(res.data.data._id);  
      //delete Client
      await deleteTest(client.data.data._id);
      //delete user
      await users.deleteTest(user.data2._id);

  expect(res).toHaveProperty('data.data'); 
}); 

 
    