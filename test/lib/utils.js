function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function serializeDrugName(name) {
    return name.toLowerCase().replace(/\ |\/|-+/g, '').replace('/', '-');
}

module.exports = {
    sleep: sleep,
    serializeDrugName: serializeDrugName
}