const product = require("./product");
const { loginAdmin } = require("./utils");

const createdProduct = {
  price: 5,
  tax: 10,
  category: 'category1',
  unit: 5,
};

test("add product to the system", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const logAdmin = await loginAdmin(); //it
  createdProduct.name = 'product1a';
  const res = await product.addProduct(createdProduct, logAdmin.data);
  expect(res.status).toEqual(200);
  expect(res).toHaveProperty('data.data');
  expect(typeof(res)).not.toBe('undefined');
  expect(res.data.data.name).toEqual(createdProduct.name);
  await product.deleteTest(res.data.data._id);
});

test("delete product from the system", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const logAdmin = await loginAdmin(); //it
  //changing the name so in case any tests failed before this one and 
  //didn't delete the product created,we don't have duplicate key error in the db
  createdProduct.name = 'product2a'; 
  const resAddedProduct = await product.addProduct(createdProduct, logAdmin.data);
  const resDeletedProduct = await product.deleteProduct(resAddedProduct.data.data._id, logAdmin.data);
  expect(resDeletedProduct.status).toEqual(200);
  expect(resDeletedProduct.data.data).toEqual("تم مسح المنتج بنجاح");
  await product.deleteTest(resAddedProduct.data.data._id);
}); 