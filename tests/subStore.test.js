const subStores = require("./subStore");
const stores = require("./store");
const utils = require("./utils");
const products = require("./product");
const users = require("./user");
const createStoreDirector =
{
    username: "ADJSKSKSK",
    password: "AMDSKS",
    type: "store director"
};
const createSubStore = { name: "subStore$!@#FASD$!@#" };
const createStore = { name: "TEST_STORE" };

//to get the index of a specific key in an array of json objects

test("Create subStore", async () => {
    jest.setTimeout(500000);
    var adminToken = await utils.loginAdmin();
    const createdStoreDirector = await utils.createTestUser(createStoreDirector, adminToken.data);
    var responseStore = await stores.createStore(createStore, createdStoreDirector.data);
    expect(responseStore.status).toEqual(200);
    expect(responseStore).toHaveProperty('data.data');
    responseStore = responseStore.data.data;
    var responseSubStore = await subStores.createSubStore(createSubStore, responseStore._id, createdStoreDirector.data);
    expect(responseSubStore.status).toEqual(200);
    expect(responseSubStore).toHaveProperty('data.data');
    responseSubStore = responseSubStore.data.data;
    await subStores.deleteTest(responseSubStore._id);
    await stores.deleteTest(responseStore._id);
    await users.deleteTest(createdStoreDirector.data2._id);
    expect(responseSubStore.name).toBe(createSubStore.name);
    expect(responseSubStore.storeId).toBe(responseStore._id);
});

addProductQuantityFromStoreHelper = async function () {
    var adminToken = await utils.loginAdmin();
    const createdStoreDirector = await utils.createTestUser(createStoreDirector, adminToken.data);
    var responseStore = await stores.createStore(createStore, createdStoreDirector.data);
    responseStore = responseStore.data.data;
    var responseSubStore = await subStores.createSubStore(createSubStore, responseStore._id, createdStoreDirector.data);
    const Product1 = {
        "name": "Juice",
        "price": 5,
        "tax": 3,
        "category": "Drinks",
        "unit": 50
    };
    const Product2 = {
        "name": "Yogurt",
        "price": 7.5,
        "tax": 10,
        "category": "Dairy",
        "unit": 10
    };
    const Product3 = {
        "name": "Chicken Tenders",
        "price": 123,
        "tax": 10,
        "category": "Frozen Food",
        "unit": 10
    };
    var createdProduct1 = await products.addProduct(Product1, adminToken.data);
    var createdProduct2 = await products.addProduct(Product2, adminToken.data);
    var createdProduct3 = await products.addProduct(Product3, adminToken.data);
    createdProduct1 = createdProduct1.data.data;
    createdProduct2 = createdProduct2.data.data;
    createdProduct3 = createdProduct3.data.data;
    //the following random works as following : var x= Math.random() *(max-min)+min  x>=min , x<max
    var product1Quantity = Math.floor(Math.random() * (2500 - 1000) + 1000);
    var product2Quantity = Math.floor(Math.random() * (2500 - 1000) + 1000);
    var product3Quantity = Math.floor(Math.random() * (2500 - 1000) + 1000);
    var addProductQuantityToStoreBody =
    {
        "products": [
            { "productId": createdProduct1._id, "quantity": product1Quantity },
            { "productId": createdProduct2._id, "quantity": product2Quantity },
            { "productId": createdProduct3._id, "quantity": product3Quantity }
        ],
        "comment": "this is a test commentntntnt",
        "storeDirectorId": createdStoreDirector.data2._id
    };
    //responseStore = response of store.addProductsWithQuantity
    responseStore = await stores.addProductsWithQuantity(addProductQuantityToStoreBody, responseStore._id, createdStoreDirector.data);
    responseStore = responseStore.data.data;
    responseSubStore = responseSubStore.data.data;
    var product1QuantitySubStore = Math.floor(Math.random() * (500 - 150) + 150);
    var product2QuantitySubStore = Math.floor(Math.random() * (500 - 150) + 150);
    var product3QuantitySubStore = Math.floor(Math.random() * (500 - 150) + 150);
    var addProductQuantityFromStoreBody =
    {
        "products": [
            { "productId": createdProduct1._id, "quantity": product1QuantitySubStore },
            { "productId": createdProduct2._id, "quantity": product2QuantitySubStore },
            { "productId": createdProduct3._id, "quantity": product3QuantitySubStore }
        ],
        "comment": "this is a test commentntntnt",
        "storeDirectorId": createdStoreDirector.data2._id
    };

    var res = await subStores.addProductQuantityFromStore(addProductQuantityFromStoreBody, responseStore._id, responseSubStore._id, createdStoreDirector.data);
    return { data: res, addProductQuantityFromStoreBody: addProductQuantityFromStoreBody, addProductQuantityToStoreBody: addProductQuantityToStoreBody, responseStore: responseStore, createdStoreDirector: createdStoreDirector };
};

test(" Add product quantity from store to substore", async () => {
    jest.setTimeout(500000);
    var res = await addProductQuantityFromStoreHelper();
    var addProductQuantityFromStoreBody = res.addProductQuantityFromStoreBody;
    var addProductQuantityToStoreBody = res.addProductQuantityToStoreBody;
    var createdStoreDirector = res.createdStoreDirector;
    res = res.data;
    var responseStore = res.data.data2;
    var responseSubStore = res.data.data;
    expect(res.status).toEqual(200);
    expect(res).toHaveProperty('data.data');
    //checking if quantities in stores' product array was decremented by the correct amount
    for (var i = 0; i < responseStore.products.length; i++)
        for (var j = 0; j < addProductQuantityToStoreBody.products.length; j++)
            if (responseStore.products[i].productId === addProductQuantityToStoreBody.products[j].productId)
                expect(responseStore.products[i].quantity).
                    toBe(addProductQuantityToStoreBody.products[j].quantity - addProductQuantityFromStoreBody.products[j].quantity);

    //checking if quantities in subStores' product array was incremented by the correct amount
    for (var i = 0; i < responseSubStore.products.length; i++)
        for (var j = 0; j < addProductQuantityFromStoreBody.products.length; j++)
            if (responseSubStore.products[i].productId === addProductQuantityFromStoreBody.products[j].productId)
                expect(responseSubStore.products[i].quantity).
                    toBe(addProductQuantityFromStoreBody.products[j].quantity);

    await stores.deleteTest(responseStore._id);
    await subStores.deleteTest(responseSubStore._id);
    for (var i = 0; i < addProductQuantityToStoreBody.products.length; i++)
        await products.deleteTest(addProductQuantityToStoreBody.products[i].productId);
    await users.deleteTest(createdStoreDirector.data2._id);
});

test("return product quantity from substore to store", async () => {
    jest.setTimeout(500000);
    var res = await addProductQuantityFromStoreHelper();
    var addProductQuantityFromStoreBody = res.addProductQuantityFromStoreBody;
    var addProductQuantityToStoreBody = res.addProductQuantityToStoreBody;
    var createdStoreDirector = res.createdStoreDirector;
    res = res.data;
    var responseStore = res.data.data2;
    var responseSubStore = res.data.data;
    expect(res.status).toEqual(200);
    expect(res).toHaveProperty('data.data');
    var returnProductQuantityToStoreBody = addProductQuantityFromStoreBody;
    for (var i = 0; i < returnProductQuantityToStoreBody.products.length; i++)
        returnProductQuantityToStoreBody.products[i].quantity = Math.floor(Math.random() * (130 - 10) + 10);

    var newResponse = await subStores.returnProductQuantity(returnProductQuantityToStoreBody, responseStore._id, responseSubStore._id, createdStoreDirector.data);
    for (var i = 0; i < responseSubStore.products.length; i++) {
        for (var j = 0; j < returnProductQuantityToStoreBody.products.length; j++)
            if (responseSubStore.products[i].productId === returnProductQuantityToStoreBody.products[j].productId)
                expect(newResponse.data.data.products[i].quantity).
                    toBe(responseSubStore.products[j].quantity - returnProductQuantityToStoreBody.products[j].quantity);
    }

    for (var i = 0; i < responseStore.products.length; i++) {
        for (var j = 0; j < returnProductQuantityToStoreBody; j++)
            if (responseStore.products[i].productId === returnProductQuantityToStoreBody.products[i].productId)
                expect(newResponse.data.data2.products[i].quantity).
                    toBe(responseStore.products[i].quantity + returnProductQuantityToStoreBody.products[i].quantity);
    }

    expect(newResponse).toHaveProperty('data.data');
    expect(newResponse.status).toEqual(200);
    await stores.deleteTest(responseStore._id);
    await subStores.deleteTest(responseSubStore._id);
    for (var i = 0; i < addProductQuantityToStoreBody.products.length; i++)
        await products.deleteTest(addProductQuantityToStoreBody.products[i].productId);
    await users.deleteTest(createdStoreDirector.data2._id);
});

test("remove product quantity from substore", async () => {
    jest.setTimeout(500000);
    var res = await addProductQuantityFromStoreHelper();
    var addProductQuantityFromStoreBody = res.addProductQuantityFromStoreBody;
    var addProductQuantityToStoreBody = res.addProductQuantityToStoreBody;
    var createdStoreDirector = res.createdStoreDirector;
    res = res.data;
    var responseSubStore = res.data.data;
    var responseStore = res.data.data2;
    expect(res.status).toEqual(200);
    expect(res).toHaveProperty('data.data');
    var removeProductQuantityFromSubStoreBody = addProductQuantityFromStoreBody;
    for (var i = 0; i < removeProductQuantityFromSubStoreBody.products.length; i++)
        removeProductQuantityFromSubStoreBody.products[i].quantity = Math.floor(Math.random() * (130 - 10) + 10);

    var newResponse = await subStores.removeQuantitySubStore(removeProductQuantityFromSubStoreBody, responseSubStore._id,responseStore._id,createdStoreDirector.data);
    expect(newResponse.status).toEqual(200);
    expect(newResponse).toHaveProperty('data.data');

    for (var i = 0; i < responseSubStore.products.length; i++)
        for (var j = 0; j < removeProductQuantityFromSubStoreBody.products.length; j++)
            if (responseSubStore.products[i].productId === removeProductQuantityFromSubStoreBody.products[j].productId)
                expect(newResponse.data.data.products[i].quantity).toBe(responseSubStore.products[i].quantity - removeProductQuantityFromSubStoreBody.products[i].quantity);

                
    await stores.deleteTest(responseStore._id);
    await subStores.deleteTest(responseSubStore._id);
    for (var i = 0; i < addProductQuantityToStoreBody.products.length; i++)
        await products.deleteTest(addProductQuantityToStoreBody.products[i].productId);
    await users.deleteTest(createdStoreDirector.data2._id);

});

test("delete an empty subStore with an array of products but quantity =0",async()=>{

    jest.setTimeout(500000);
    var res = await addProductQuantityFromStoreHelper();
    var addProductQuantityFromStoreBody = res.addProductQuantityFromStoreBody;
    var addProductQuantityToStoreBody = res.addProductQuantityToStoreBody;
    var createdStoreDirector = res.createdStoreDirector;
    res = res.data;
    var responseStore = res.data.data2;
    var responseSubStore = res.data.data;
    var removeProductQuantityFromSubStoreBody = addProductQuantityFromStoreBody;
    for (var i = 0; i < removeProductQuantityFromSubStoreBody.products.length; i++)
        for(var j =0;j<responseSubStore.products.length;j++)
            if(removeProductQuantityFromSubStoreBody.products[i].productId===responseSubStore.products[j].productId)
                removeProductQuantityFromSubStoreBody.products[i].quantity=responseSubStore.products[j].quantity;

    var removeAllProductsFromSubStoreResponse =await subStores.removeQuantitySubStore(removeProductQuantityFromSubStoreBody,responseSubStore._id,responseStore._id,createdStoreDirector.data);
    expect(removeAllProductsFromSubStoreResponse.status).toEqual(200);
    expect(removeAllProductsFromSubStoreResponse).toHaveProperty('data.data');
    var deleteEmptySubStoreResponse= await subStores.deleteAnEmptySubStore({},responseSubStore._id);
    expect(deleteEmptySubStoreResponse.status).toEqual(200);
    expect(deleteEmptySubStoreResponse).toHaveProperty('data.data');
    expect(deleteEmptySubStoreResponse.data.data.deleted).toBe(true);


    await stores.deleteTest(responseStore._id);
    await subStores.deleteTest(responseSubStore._id);
    for (var i = 0; i < addProductQuantityToStoreBody.products.length; i++)
        await products.deleteTest(addProductQuantityToStoreBody.products[i].productId);
    await users.deleteTest(createdStoreDirector.data2._id);

});

test("delete an empty subStore with an empty products array",async()=>{
    jest.setTimeout(500000);
    var adminToken = await utils.loginAdmin();
    const createdStoreDirector = await utils.createTestUser(createStoreDirector, adminToken.data);
    var responseStore = await stores.createStore(createStore, createdStoreDirector.data);
    expect(responseStore.status).toEqual(200);
    expect(responseStore).toHaveProperty('data.data');
    responseStore = responseStore.data.data;
    var responseSubStore = await subStores.createSubStore(createSubStore, responseStore._id, createdStoreDirector.data);
    expect(responseSubStore.status).toEqual(200);
    expect(responseSubStore).toHaveProperty('data.data');
    responseSubStore = responseSubStore.data.data;
    expect(responseSubStore.name).toBe(createSubStore.name);
    expect(responseSubStore.storeId).toBe(responseStore._id);
    var deleteEmptySubStoreResponse= await subStores.deleteAnEmptySubStore({},responseSubStore._id);
    expect(deleteEmptySubStoreResponse.status).toEqual(200);
    expect(deleteEmptySubStoreResponse).toHaveProperty('data.data');
    expect(deleteEmptySubStoreResponse.data.data.deleted).toBe(true);

    await subStores.deleteTest(responseSubStore._id);
    await stores.deleteTest(responseStore._id);
    await users.deleteTest(createdStoreDirector.data2._id);
});