function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function serializeDrugName(name) {
    return name.toLowerCase().replace(/\ |\/|-+/g, '').replace('/', '-');
}

function generateRandomAccount() {
    var name = '';
    var email = '';
    var password = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // name
    for ( var i = 0; i < 10; i++ ) {
        name += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // email
    for (var j = 0; j < 6; j++) {
        email += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    email += "@test.com";

    // password
    for (var k = 0; k < 8; k++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return {
        name: name,
        email: email,
        password: password,
        role: 'user'
    }
}

module.exports = {
    sleep: sleep,
    serializeDrugName: serializeDrugName,
    randomUser: generateRandomAccount
}