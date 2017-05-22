/* globals module */
'use strict';

class User {
    constructor(values) {
        this.email = values.email;
        this.passwordHash = values.passwordHash;
        this.firstName = values.firstName || '';
        this.lastName = values.lastName || '';
    }
}


module.exports = User;