const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const { incrementCounter } = require('../firebase');

/**
 * Add a new driver.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post('/add', async function (req, res) {
    try {
        console.log('Received data:', req.body);  // Log incoming data

        const { driver_name, driver_department, driver_licence, driver_isActive } = req.body;

        if (!driver_name || !driver_department || !driver_licence || typeof driver_isActive !== 'boolean') {
            return res.status(400).json({ error: 'Missing or invalid required fields' });
        }

        let newDriver = new Driver({
            driver_name,
            driver_department,
            driver_licence,
            driver_isActive
        });

        await newDriver.save();
        await incrementCounter('create');

        console.log('Driver added successfully:', newDriver);  // Log the created driver

        res.status(201).json({
            id: newDriver._id,
            driver_id: newDriver.driver_id
        });
    } catch (err) {
        console.error('Error adding driver:', err);  // Log any error
        res.status(500).json({ error: err.message });
    }
});


/**
 * Get all drivers.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get('/', async function (req, res) {
    try {
        const drivers = await Driver.find().populate('assigned_packages');
        await incrementCounter('retrieve');
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete a driver by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.delete('/delete', async function (req, res) {
    try {
        const { id } = req.query; 

        // Validate and convert id to a Mongoose ObjectId
        const driverObjectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

        if (!driverObjectId) {
            return res.status(400).json({ error: 'Invalid driver ID' });
        }

        // Check if the driver exists
        const driver = await Driver.findById(driverObjectId);
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Delete the driver
        const result = await Driver.deleteOne({ _id: driverObjectId });
        await incrementCounter('delete');
        res.json({ status: 'Driver deleted successfully', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Update a driver by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.put('/update', async (req, res) => {
    const { _id, driver_licence, driver_department } = req.body;
    console.log(req.body);

    try {
        // Find driver by ID and update licence and department
        const updatedDriver = await Driver.findByIdAndUpdate(
            _id, 
            { driver_licence, driver_department },
            { new: true } 
        );

        // Check if the driver was found and updated
        if (!updatedDriver) {
            return res.json({ status: "ID not found" }); 
        }

        // If the update was successful, return a success message
        await incrementCounter('update');
        res.json({ status: "Driver updated successfully" });

    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ status: "Error updating driver" });
    }
});

module.exports = router;