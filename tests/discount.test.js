const product = require("./product");
const discount = require("./discount");
const client = require("./client");
const utils = require("./utils")


const financialDirectorBody = {
    username: "testD",
    password: "test",
    type: "financial director"
};
test("add discount on a clients' product", async () => {
    jest.setTimeout(500000);

    const logAdmin = await utils.loginAdmin(); //it
    const registerUser = await utils.createTestUser(financialDirectorBody, logAdmin.data);
  const testClient = {
        name: "editClientTestClient"
    };
    const testProduct = {
        name: "editClientTestProduct",
        price: 50,
        tax: 10,
        category: "testing",
        unit: 10
    };

    const adminToken = await utils.loginAdmin();
    const addProductRes = await product.addProduct(testProduct, adminToken.data);
    const productId = addProductRes.data.data._id;
    const addClientRes = await client.addClient(testClient, adminToken.data);
    const clientId = addClientRes.data.data._id;
    
    const newClient = {
        name:"updatedTestClient",
        newProducts:[{productId:productId}]
    };
    const res = await client.editClient(newClient, clientId, adminToken.data);
    const createDiscountBody = {
        startDate: "9-20-2020",
        endDate: "9-30-2020",
        percentage: "80"

    }
    const createDiscountRes = await discount.createDiscount(createDiscountBody, clientId, productId, registerUser.data);
    expect(createDiscountRes.data.data.productId).toBe(productId);
    expect(createDiscountRes.data.data.clientId).toBe(clientId);
    
    await client.deleteTest(clientId);
    await product.deleteTest(productId);
    await discount.deleteTest(createDiscountRes.data.data._id);
});