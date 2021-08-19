const store = require("./store");
const subStore = require("./subStore");
const user = require("./user");
const product = require("./product");
const { createTestUser, loginAdmin} = require("./utils");
const suppliers = require("./suppliers");

const storeDirector = {
    password : "test",
    type : "store director"
  };  
  const createdProduct = {
    price: 5,
    tax: 3,
    category: "cat1",
    unit: 50
};

test("create store", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const admin = await loginAdmin(); //it
  storeDirector.username = "storeTest";
  const sDirector = await createTestUser(storeDirector, admin.data);
  const createdStore = { name: 'store1' };
  const res = await store.createStore(createdStore, sDirector.data);
  expect(res.status).toEqual(200);
  expect(res).toHaveProperty('data.data');
  expect(typeof(res)).not.toBe('undefined');
  expect(res.data.data.name).toEqual(createdStore.name);
  await store.deleteTest(res.data.data._id);
  await user.deleteTest(sDirector.data2._id);  
});

test("Add products with their quantities to store", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const admin = await loginAdmin(); //it
  storeDirector.username = "director@s";
  const sDirector = await createTestUser(storeDirector, admin.data);
  const createdStore = { name: 'storeXZ' };
  const resCreatedStore = await store.createStore(createdStore, sDirector.data);
  createdProduct.name = 'productw';
  const resProduct1 = await product.addProduct(createdProduct, admin.data);
  createdProduct.name = 'productz';
  const resProduct2 = await product.addProduct(createdProduct, admin.data);
  const body = { products: [ 
      { productId: resProduct1.data.data._id, quantity: 5 },
      { productId: resProduct2.data.data._id, quantity: 10 } 
    ], comment: 'added products',
  };
  const resUpdatedStore = await store.addProductsWithQuantity(body, resCreatedStore.data.data._id, sDirector.data);
  expect(resUpdatedStore.status).toEqual(200);
  expect(resUpdatedStore).toHaveProperty('data.data');
  expect(resUpdatedStore).toHaveProperty('data.data2');
  expect(resUpdatedStore.data.data.products.length).toBe(2);
  for (let i = 0; i < resUpdatedStore.data.data.products.length; i++) {
    expect(resUpdatedStore.data.data.products[i].quantity).toBe(body.products[i].quantity);
    expect(resUpdatedStore.data.data.products[i].productId).toBe(body.products[i].productId);
  }

  for (let i = 0; i < body.products.length; i++) {
    await product.deleteTest(body.products[i].productId);
  }
  await product.deleteTest(resProduct1.data.data._id);
  await product.deleteTest(resProduct2.data.data._id);
  await store.deleteTest(resCreatedStore.data.data._id);
  await user.deleteTest(sDirector.data2._id);  
});

test("remove products with their quantities from store", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const admin = await loginAdmin(); //it
  storeDirector.username = "directorSr";
  const sDirector = await createTestUser(storeDirector, admin.data);
  const createdStore = { name: 'storeRr' };
  const resCreatedStore = await store.createStore(createdStore, sDirector.data);
  createdProduct.name = 'productr1';
  const resProduct1 = await product.addProduct(createdProduct, admin.data);
  createdProduct.name = 'productr2';
  const resProduct2 = await product.addProduct(createdProduct, admin.data);
  const body = { products: [ 
      { productId: resProduct1.data.data._id, quantity: 5 },
      { productId: resProduct2.data.data._id, quantity: 10 } 
    ], comment: 'removed products',
  };
  //adding products and checking that quantity is as expected
  let resUpdatedStore = await store.addProductsWithQuantity(body, resCreatedStore.data.data._id, sDirector.data);
  expect(resUpdatedStore.data.data.products.length).toBe(2);
  for (let i = 0; i < resUpdatedStore.data.data.products.length; i++) {
    expect(resUpdatedStore.data.data.products[i].quantity).toBe(body.products[i].quantity);
    expect(resUpdatedStore.data.data.products[i].productId).toBe(body.products[i].productId);
  }
  //removing products and checking that quantity is as expected
  resUpdatedStore = await store.removeProductsWithQuantity(body, resCreatedStore.data.data._id, sDirector.data);
  expect(resUpdatedStore.status).toEqual(200);
  expect(resUpdatedStore).toHaveProperty('data.data');
  expect(resUpdatedStore).toHaveProperty('data.data2');
  expect(resUpdatedStore.data.data.products.length).toBe(2);
  for (let i = 0; i < resUpdatedStore.data.data.products.length; i++) {
    expect(resUpdatedStore.data.data.products[i].quantity).toBe(0);
    expect(resUpdatedStore.data.data.products[i].productId).toBe(body.products[i].productId);
  }

  for (let i = 0; i < body.products.length; i++) {
    await product.deleteTest(body.products[i].productId);
  }
  await product.deleteTest(resProduct1.data.data._id);
  await product.deleteTest(resProduct2.data.data._id);
  await store.deleteTest(resCreatedStore.data.data._id);
  await user.deleteTest(sDirector.data2._id);  
});

test("Add products with their quantities to store with supplier", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const admin = await loginAdmin(); //it
  storeDirector.username = "director@asar3";
  const sDirector = await createTestUser(storeDirector, admin.data);
  const createdStore = { name: 'storesra3' };
  const resCreatedStore = await store.createStore(createdStore, sDirector.data);
  const createdSupplier = { name: "SupplierE#ra4" };
  let rescreatedSupplier = await suppliers.createSupplier(createdSupplier, admin.data);
  createdProduct.name = 'productr2a';
  const resProduct1 = await product.addProduct(createdProduct, admin.data);
  createdProduct.name = 'producte1a';
  const resProduct2 = await product.addProduct(createdProduct, admin.data);
  const products = {
    products: [ 
      { productId: resProduct1.data.data._id, price: 5 },
      { productId: resProduct2.data.data._id, price: 10 } 
    ] };
  rescreatedSupplier = await suppliers.addProductsToSupplier(products, rescreatedSupplier.data.data._id, admin.data);
  expect(rescreatedSupplier.data.data.products.length).toBe(2);
  const body = { products: [ 
      { productId: resProduct1.data.data._id, quantity: 5 },
      { productId: resProduct2.data.data._id, quantity: 10 } 
    ], comment: 'added products with supplier',
    supplierId: rescreatedSupplier.data.data._id,
  };
  const resUpdatedStore = await store.addProductQuantityWithSupplier(body, resCreatedStore.data.data._id, sDirector.data);
  expect(resUpdatedStore.status).toEqual(200);
  expect(resUpdatedStore).toHaveProperty('data.data');
  expect(resUpdatedStore).toHaveProperty('data.data2');
  expect(resUpdatedStore.data.data.products.length).toBe(2);
  for (let i = 0; i < resUpdatedStore.data.data.products.length; i++) {
    expect(resUpdatedStore.data.data.products[i].quantity).toBe(body.products[i].quantity);
    expect(resUpdatedStore.data.data.products[i].productId).toBe(body.products[i].productId);
  }
  //price returned in store transaction should equal price of products sent * their quantities
  expect(resUpdatedStore.data.data2.price).toEqual(125);
  for (let i = 0; i < body.products.length; i++) {
    await product.deleteTest(body.products[i].productId);
  }
  await product.deleteTest(resProduct1.data.data._id);
  await product.deleteTest(resProduct2.data.data._id);
  await store.deleteTest(resCreatedStore.data.data._id);
  await suppliers.deleteTest(rescreatedSupplier.data.data._id);
  await user.deleteTest(sDirector.data2._id);  
});

test("remove products with their quantities from store with supplier", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const admin = await loginAdmin(); //it
  storeDirector.username = "director@sar3";
  const sDirector = await createTestUser(storeDirector, admin.data);
  const createdStore = { name: 'stores@a3' };
  const resCreatedStore = await store.createStore(createdStore, sDirector.data);
  const createdSupplier = { name: "SupplierE#wa4" };
  let rescreatedSupplier = await suppliers.createSupplier(createdSupplier, admin.data);
  createdProduct.name = 'productr2aa';
  const resProduct1 = await product.addProduct(createdProduct, admin.data);
  createdProduct.name = 'producte1aa';
  const resProduct2 = await product.addProduct(createdProduct, admin.data);
  const products = {
    products: [ 
      { productId: resProduct1.data.data._id, price: 5 },
      { productId: resProduct2.data.data._id, price: 10 } 
    ] };
  rescreatedSupplier = await suppliers.addProductsToSupplier(products, rescreatedSupplier.data.data._id, admin.data);
  expect(rescreatedSupplier.data.data.products.length).toBe(2);
  const body = { products: [ 
      { productId: resProduct1.data.data._id, quantity: 5 },
      { productId: resProduct2.data.data._id, quantity: 10 } 
    ], comment: 'removed products with supplier',
    supplierId: rescreatedSupplier.data.data._id,
  };
  //adding products and checking that quantity is as expected
  let resUpdatedStore = await store.addProductQuantityWithSupplier(body, resCreatedStore.data.data._id, sDirector.data);
  expect(resUpdatedStore.status).toEqual(200);
  expect(resUpdatedStore).toHaveProperty('data.data');
  expect(resUpdatedStore).toHaveProperty('data.data2');
  expect(resUpdatedStore.data.data.products.length).toBe(2);
  for (let i = 0; i < resUpdatedStore.data.data.products.length; i++) {
    expect(resUpdatedStore.data.data.products[i].quantity).toBe(body.products[i].quantity);
    expect(resUpdatedStore.data.data.products[i].productId).toBe(body.products[i].productId);
  }
  //removing products and checking that quantity is as expected
  resUpdatedStore = await store.removeProductQuantityWithSupplier(body, resCreatedStore.data.data._id, sDirector.data);
  expect(resUpdatedStore.status).toEqual(200);
  expect(resUpdatedStore).toHaveProperty('data.data');
  expect(resUpdatedStore).toHaveProperty('data.data2');
  expect(resUpdatedStore.data.data.products.length).toBe(2);
  for (let i = 0; i < resUpdatedStore.data.data.products.length; i++) {
    expect(resUpdatedStore.data.data.products[i].quantity).toBe(0);
    expect(resUpdatedStore.data.data.products[i].productId).toBe(body.products[i].productId);
  }
  //price returned in store transaction should equal price of products sent * their quantities
  expect(resUpdatedStore.data.data2.price).toEqual(125);
  for (let i = 0; i < body.products.length; i++) {
    await product.deleteTest(body.products[i].productId);
  }
  await product.deleteTest(resProduct1.data.data._id);
  await product.deleteTest(resProduct2.data.data._id);
  await store.deleteTest(resCreatedStore.data.data._id);
  await suppliers.deleteTest(rescreatedSupplier.data.data._id);
  await user.deleteTest(sDirector.data2._id); 
});

test("delete an empty store", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const admin = await loginAdmin(); //it
  storeDirector.username = "director@st";
  const sDirector = await createTestUser(storeDirector, admin.data);
  const createdStore = { name: 'storeX' };
  const resCreatedStore = await store.createStore(createdStore, sDirector.data);
  const createdSubStore1 = { name: 'sstoreX' };
  const createdSubStore2 = { name: 'sstoreX1' };

  const resCreatedSubStore1 = await subStore.createSubStore(createdSubStore1, resCreatedStore.data.data._id, sDirector.data);
  const resCreatedSubStore2 = await subStore.createSubStore(createdSubStore2, resCreatedStore.data.data._id, sDirector.data);
  const resDeletedStore = await store.deleteStore(resCreatedStore.data.data._id, sDirector.data);
  expect(resDeletedStore.status).toEqual(200);
  expect(resDeletedStore.data.data.deleted).toEqual(true);
  for (let i = 0; i < resDeletedStore.data.data2.length; i++) {
    expect(resDeletedStore.data.data2[i].deleted).toBe(true);
}
  await store.deleteTest(resCreatedStore.data.data._id);
  await subStore.deleteTest(resCreatedSubStore1.data.data._id);
  await subStore.deleteTest(resCreatedSubStore2.data.data._id);
  await user.deleteTest(sDirector.data2._id);  
  });