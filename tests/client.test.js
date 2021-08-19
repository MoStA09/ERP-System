const client = require("./client");
const product = require("./product");
const utils = require("./utils");

test("Create client",async()=>{
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    const testClient = {
        name: "addClientTestClient"
    }

    const adminToken = await utils.loginAdmin();
    const res = await client.addClient(testClient,adminToken.data);

    expect(typeof(res)).not.toBe('undefined');
    
    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.name).toEqual('addClientTestClient');
    expect(res.data.data.products).toEqual([]);
    expect(res.data.data.subClients).toEqual([]);
    expect(res.data.data.deleted).toBe(false);

    await client.deleteTest(res.data.data._id);
});

test("Add subClient",async()=>{
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    const testClient = {
        name: "addSubClientTestClient"
    }
    const testSubClient = {
        name: "addSubClientTestSubClient"
    } 

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;

    const res = await client.addSubClient(testSubClient,clientId,adminToken.data);

    expect(typeof(res)).not.toBe('undefined');
    
    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.name).toEqual('addSubClientTestClient');
    expect(res.data.data.products).toEqual([]);
    expect(res.data.data.subClients).toHaveLength(1);
    expect(res.data.data.subClients[0].name).toEqual('addSubClientTestSubClient');
    expect(res.data.data.subClients[0].deleted).toBe(false);
    expect(res.data.data.deleted).toBe(false);

    await client.deleteTest(res.data.data._id);
});

test("Edit subClient",async()=>{
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    const testClient = {
        name: "editSubClientTestClient"
    }
    const testSubClient = {
        name: "editSubClientTestSubClient"
    } 

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;
    const addSubClientRes = await client.addSubClient(testSubClient,clientId,adminToken.data);
    const subClientId = addSubClientRes.data.data.subClients[0]._id;
    const newSubClient = {name:"updatedTestSubClient",id:subClientId};

    const res = await client.editSubClient(newSubClient,clientId,adminToken.data);

    expect(typeof(res)).not.toBe('undefined');
    
    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.name).toEqual('editSubClientTestClient');
    expect(res.data.data.products).toEqual([]);
    expect(res.data.data.subClients).toHaveLength(1);
    expect(res.data.data.subClients[0].name).toEqual('updatedTestSubClient');
    expect(res.data.data.subClients[0].deleted).toBe(false);
    expect(res.data.data.deleted).toBe(false);

    await client.deleteTest(res.data.data._id);
});

test("Edit Client",async()=>{
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
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
    const addProductRes = await product.addProduct(testProduct,adminToken.data);
    const productId = addProductRes.data.data._id;
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;

    const newClient = {
        name:"updatedTestClient",
        newProducts:[{productId:productId}]
    };

    const res = await client.editClient(newClient,clientId,adminToken.data);

    expect(typeof(res)).not.toBe('undefined');
    
    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.name).toEqual('updatedTestClient');
    expect(res.data.data.subClients).toEqual([]);
    expect(res.data.data.products).toHaveLength(1);
    expect(res.data.data.products[0].productId).toEqual(productId);
    expect(res.data.data.deleted).toBe(false);

    await client.deleteTest(res.data.data._id);
    await product.deleteTest(productId);
});

test("Delete client",async()=>{
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    const testClient = {
        name: "deleteClientTestClient"
    }

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;

    const res = await client.deleteClient(clientId,adminToken.data);

    expect(typeof(res)).not.toBe('undefined');
    
    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.name).toEqual('deleteClientTestClient');
    expect(res.data.data.products).toEqual([]);
    expect(res.data.data.subClients).toEqual([]);
    expect(res.data.data.deleted).toBe(true);

    await client.deleteTest(res.data.data._id);
});

test("Delete subClient",async()=>{
    //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
    jest.setTimeout(500000);
    const testClient = {
        name: "deleteSubClientTestClient"
    }
    const testSubClient = {
        name: "deleteSubClientTestSubClient"
    } 

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;
    const addSubClientRes = await client.addSubClient(testSubClient,clientId,adminToken.data);
    const subClientId = addSubClientRes.data.data.subClients[0]._id;

    const res = await client.deleteSubClient({subClientId: subClientId},clientId,adminToken.data)

    expect(typeof(res)).not.toBe('undefined');
    
    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.name).toEqual('deleteSubClientTestClient');
    expect(res.data.data.products).toEqual([]);
    expect(res.data.data.subClients).toHaveLength(1);
    expect(res.data.data.subClients[0].name).toEqual('deleteSubClientTestSubClient');
    expect(res.data.data.subClients[0].deleted).toBe(true);
    expect(res.data.data.deleted).toBe(false);

    await client.deleteTest(res.data.data._id);
});