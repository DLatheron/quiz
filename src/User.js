/* globals module */
'use strict';

class User {
    constructor(values) {
        this.username = values.username;
        this.password = values.password;
        this.email = values.email;
        this.firstName = values.firstName || '';
        this.lastName = values.lastName || '';
    }
}


module.exports = User;