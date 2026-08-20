const mongoose = require('mongoose');

/**
 * @typedef {Object} Package
 * @property {string} package_title - The title of the package. Must be alphanumeric and between 3 and 15 characters long.
 * @property {number} package_weight - The weight of the package. Must be a positive non-zero number.
 * @property {string} package_destination - The destination of the package. Must be alphanumeric and between 5 and 15 characters long.
 * @property {boolean} isAllocated - The allocation status of the package.
 * @property {string} driver_id - The ID of the driver. Must be a string with length 10.
 * @property {string} description - The description of the package. Must be a string with length between 0 and 30 characters.
 * @property {Date} createdAt - The creation date of the package record. Defaults to the current date.
 * @property {string} package_id - The ID of the package. Generated automatically.
 */

// Define the Package schema
const packageSchema = new mongoose.Schema({
    package_title: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9 ]{3,15}$/.test(v);
            },
            message: 'Package title must be alphanumeric (spaces allowed) and between 3 and 15 characters long.'
        }
    },
    package_weight: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v > 0;
            },
            message: 'Package weight must be a positive non-zero number.'
        }
    },
    package_destination: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9 ]{5,15}$/.test(v);
            },
            message: 'Package destination must be alphanumeric (spaces allowed) and between 5 and 15 characters long.'
        }
    },
    isAllocated: {
        type: Boolean,
        required: true
    },
    driver_id: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return v.length === 10;
            },
            message: 'Driver ID must be a string with length 10.'
        }
    },
    description: {
        type: String,
        validate: {
            validator: function (v) {
                return v.length <= 30;
            },
            message: 'Description must be a string with length between 0 and 30 characters.'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    package_id: {
        type: String,
        default: function () {
            return this.generatePackageId();
        }
    }
});

/**
 * Generates a package ID.
 * @function generatePackageId
 * @memberof Package
 * @returns {string} The generated package ID.
 */
packageSchema.methods.generatePackageId = function () {
    const initials = 'YK';
    const randomChars = this.getRandomChars(2);
    const randomDigits = this.getRandomDigits(3);
    return `P${randomChars}-${initials}-${randomDigits}`;
};

/**
 * Generates random uppercase letters.
 * @function getRandomChars
 * @memberof Package
 * @param {number} length - The number of random characters to generate.
 * @returns {string} The generated random characters.
 */
packageSchema.methods.getRandomChars = function (length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generates random digits.
 * @function getRandomDigits
 * @memberof Package
 * @param {number} length - The number of random digits to generate.
 * @returns {string} The generated random digits.
 */
packageSchema.methods.getRandomDigits = function (length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

// Export the Package model
module.exports = mongoose.model('Package', packageSchema);