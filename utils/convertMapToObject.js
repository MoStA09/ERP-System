//Object.fromEntries(iterable): does the same thing but requires Node v12
exports.convertMapToObject = (inputMap) => {
    let obj = {};
    inputMap.forEach(function(value, key){
        obj[key] = value;
    });
    return obj;
}