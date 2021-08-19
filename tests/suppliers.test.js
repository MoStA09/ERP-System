const suppliers = require("./suppliers");
const Product = require("./product");
const utils = require("./utils");

test("Create supplier", async () => {
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    var adminToken = await utils.loginAdmin();
    const createSupplier = { name: "Supplier54$!@#FASD$!@#" };
    const res = await suppliers.createSupplier(createSupplier, adminToken.data);
    await suppliers.deleteTest(res.data.data._id);
    expect(res).toHaveProperty('data.data');
    expect(res.data.data.name).toBe(createSupplier.name);
    expect(res.status).toEqual(200);


});

test("Add products to supplier", async () => {
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000); 
    var adminToken = await utils.loginAdmin();
    adminToken = adminToken.data;
    const Supplier = { name: "Supplier411@#!@GJGJEL" };
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

    var createdProduct1 = await Product.addProduct(Product1, adminToken);
    var createdProduct2 = await Product.addProduct(Product2, adminToken);
    var createdProduct3 = await Product.addProduct(Product3, adminToken);
    //remove response wrappers since we're only interested in the actual data
    createdProduct1 = createdProduct1.data.data;
    createdProduct2 = createdProduct2.data.data;
    createdProduct3 = createdProduct3.data.data;

    const products = {
        "products": [{ "price": createdProduct1.price, "productId": createdProduct1._id },
        { "price": createdProduct2.price, "productId": createdProduct2._id },
        { "price": createdProduct3.price, "productId": createdProduct3._id }]
    };
    const createdSupplier = await suppliers.createSupplier(Supplier, adminToken);
    const updatedSupplier = await suppliers.addProductsToSupplier(products, createdSupplier.data.data._id, adminToken);

    expect(updatedSupplier).toHaveProperty('data.data');
    expect(updatedSupplier.status).toEqual(200);

    for (var i = 0; i < updatedSupplier.data.data.products.length; i++) {
        expect(updatedSupplier.data.data.products[i].price).toBe(products.products[i].price);
        expect(updatedSupplier.data.data.products[i].productId).toBe(products.products[i].productId);
    }
    await suppliers.deleteTest(createdSupplier.data.data._id);
    for (var i = 0; i < products.products.length; i++) {
        await Product.deleteTest(products.products[i].productId);
    }


});

test("remove products from supplier", async () => {
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    var adminToken = await utils.loginAdmin();
    adminToken = adminToken.data;
    const Supplier = { name: "Supplier411@#!@GJGJEL" };
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
    var createdProduct1 = await Product.addProduct(Product1, adminToken);
    var createdProduct2 = await Product.addProduct(Product2, adminToken);
    var createdProduct3 = await Product.addProduct(Product3, adminToken);
    //remove response wrappers since we're only interested in the actual data
    createdProduct1 = createdProduct1.data.data;
    createdProduct2 = createdProduct2.data.data;
    createdProduct3 = createdProduct3.data.data;

    var products = {
        "products": [{ "price": createdProduct1.price, "productId": createdProduct1._id },
        { "price": createdProduct2.price, "productId": createdProduct2._id },
        { "price": createdProduct3.price, "productId": createdProduct3._id }]
    };
    var createdSupplier = await suppliers.createSupplier(Supplier, adminToken);
    var updatedSupplier = await suppliers.addProductsToSupplier(products, createdSupplier.data.data._id, adminToken);
    expect(updatedSupplier).toHaveProperty('data.data');
    expect(updatedSupplier.status).toEqual(200);

    updatedSupplier = updatedSupplier.data.data;


    for (var i = 0; i < updatedSupplier.products.length; i++) {
        expect(updatedSupplier.products[i].price).toBe(products.products[i].price);
        expect(updatedSupplier.products[i].productId).toBe(products.products[i].productId);

    }

    //removing all products by using 'all' as products
    updatedSupplier = await suppliers.removeProductsFromSupplier({ "products": "all" }, updatedSupplier._id, adminToken);
    expect(updatedSupplier.status).toEqual(200);

    updatedSupplier = updatedSupplier.data.data;
    expect(updatedSupplier.products.length).toBe(0);

    //removing some products
    updatedSupplier = await suppliers.addProductsToSupplier(products, createdSupplier.data.data._id, adminToken);
    expect(updatedSupplier.status).toEqual(200);

    updatedSupplier = updatedSupplier.data.data;
    updatedSupplier.products.splice(2);
    //productsToBeRemoved is updatedSupplier.products after splicing the array to remove some elements not all
    var productsToBeRemoved = updatedSupplier.products;

    updatedSupplier = await suppliers.removeProductsFromSupplier({ "products": updatedSupplier.products }, updatedSupplier._id, adminToken);
    expect(updatedSupplier.status).toEqual(200);

    updatedSupplier = updatedSupplier.data.data;

    expect(updatedSupplier.products.length).toBe(products.products.length - productsToBeRemoved.length);
    await suppliers.deleteTest(createdSupplier.data.data._id);
    for (var i = 0; i < products.products.length; i++) {
        await Product.deleteTest(products.products[i].productId);
    }

});

test("edit supplier name", async () => {
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    var adminToken = await utils.loginAdmin();
    adminToken = adminToken.data;
    const Supplier = { name: "Supplier-Philo-1" };
    var createdSupplier = await suppliers.createSupplier(Supplier, adminToken);
    createdSupplier = createdSupplier.data.data;
    expect(createdSupplier.name).toBe(Supplier.name);
    const newSupplierName = { name: "NewSupplier name !@#MRAF" };
    var updatedSupplier = await suppliers.editSupplierName(newSupplierName, createdSupplier._id, adminToken);
    expect(updatedSupplier.status).toEqual(200);
    expect(updatedSupplier).toHaveProperty('data.data');
    updatedSupplier = updatedSupplier.data.data;
    expect(updatedSupplier.name).toBe(newSupplierName.name);
    expect(updatedSupplier._id).toBe(createdSupplier._id);
    await suppliers.deleteTest(updatedSupplier._id);
});

test("edit price of suppliers' product(s)", async () => {
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    var adminToken = await utils.loginAdmin();
    adminToken = adminToken.data;
    const Supplier = { name: "Supplier411@#!@GJGJEL" };
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

    var createdProduct1 = await Product.addProduct(Product1, adminToken);
    var createdProduct2 = await Product.addProduct(Product2, adminToken);
    var createdProduct3 = await Product.addProduct(Product3, adminToken);
    //remove response wrappers since we're only interested in the actual data
    createdProduct1 = createdProduct1.data.data;
    createdProduct2 = createdProduct2.data.data;
    createdProduct3 = createdProduct3.data.data;

    const products = {
        "products": [{ "price": createdProduct1.price, "productId": createdProduct1._id },
        { "price": createdProduct2.price, "productId": createdProduct2._id },
        { "price": createdProduct3.price, "productId": createdProduct3._id }]
    };
    const createdSupplier = await suppliers.createSupplier(Supplier, adminToken);
    var updatedSupplier = await suppliers.addProductsToSupplier(products, createdSupplier.data.data._id, adminToken);
    //Until here we are just adding products to the supplier , now we need to change the price of some products
    const product1NewPrice = Math.floor((Math.random() * 30) + 1);
    const product2NewPrice = Math.floor((Math.random() * 20) + 1);
    const product3NewPrice = Math.floor((Math.random() * 50) + 1);


    const editProductsPriceBody = {
        "products": [{ "productId": createdProduct1._id, price: product1NewPrice },
        { "productId": createdProduct2._id, "price": product2NewPrice }, { "productId": createdProduct3._id, "price": product3NewPrice }]
    };
    var updatedSupplier = await suppliers.editPriceOfSpecifiedProducts(editProductsPriceBody, createdSupplier.data.data._id, adminToken)
    expect(updatedSupplier).toHaveProperty('data.data');
    expect(updatedSupplier.status).toEqual(200);
    updatedSupplier = updatedSupplier.data.data;
    expect(updatedSupplier.products[0].price).toBe(product1NewPrice);
    expect(updatedSupplier.products[1].price).toBe(product2NewPrice);
    expect(updatedSupplier.products[2].price).toBe(product3NewPrice);
    await suppliers.deleteTest(createdSupplier.data.data._id);
    for (var i = 0; i < products.products.length; i++) {
        await Product.deleteTest(products.products[i].productId);
    }

});