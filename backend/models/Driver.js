const mongoose = require('mongoose');

/**
 * @typedef {Object} Driver
 * @property {string} driver_name - The name of the driver. Must be alphabetic and between 3 and 20 characters long.
 * @property {string} driver_department - The department of the driver.
 * @property {string} driver_licence - The licence of the driver. Must be alphanumeric and exactly 5 characters long.
 * @property {boolean} driver_isActive - The active status of the driver.
 * @property {string} driver_id - The ID of the driver. Generated automatically.
 * @property {Date} driver_createdAt - The creation date of the driver record. Defaults to the current date.
 * @property {Array} assigned_packages - The packages assigned to the driver.
 */

// Define the Driver schema
const driverSchema = new mongoose.Schema({
    driver_name: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]{3,20}$/.test(v);
            },
            message: 'Driver name must be alphabetic and between 3 and 20 characters long.'
        }
    },
    driver_department: {
        type: String,
        required: true
    },
    driver_licence: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]{5}$/.test(v);
            },
            message: 'Driver licence must be alphanumeric and exactly 5 characters long.'
        }
    },
    driver_isActive: {
        type: Boolean,
        required: true
    },
    driver_id: {
        type: String,
        default: function () {
            return this.generateDriverId();
        }
    },
    driver_createdAt: {
        type: Date,
        default: Date.now
    },
    assigned_packages: {
        type: Array
    }
});

/**
 * Generates a driver ID.
 * @function generateDriverId
 * @memberof Driver
 * @returns {string} The generated driver ID.
 */
driverSchema.methods.generateDriverId = function () {
    let driver_id = "D";
    driver_id += Math.floor(Math.random() * 100).toString().padStart(2, "0");
    driver_id += "-";
    driver_id += "32";
    driver_id += "-";
    driver_id += this.generateRandomLetters();
    return driver_id;
};

/**
 * Generates three random uppercase letters.
 * @function generateRandomLetters
 * @memberof Driver
 * @returns {string} The generated random letters.
 */
driverSchema.methods.generateRandomLetters = function () {
    let randomLetters = "";
    for (let i = 0; i < 3; i++) {
        randomLetters += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return randomLetters;
};

// Export the Driver model
module.exports = mongoose.model('Driver', driverSchema);