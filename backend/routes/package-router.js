const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Package = require('../models/Package');
const { incrementCounter } = require('../firebase');

/**
 * Add a new package.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post('/add', async (req, res) => {
    const { package_title, package_weight, package_destination, description, isAllocated, driver_id } = req.body;

    try {
        console.log(driver_id);
        const driver = await Driver.findOne({ _id: driver_id });
        if (driver == null) return res.send({ error: "Enter a valid driver id" });
        console.log(driver);

        const newPackage = new Package({
            package_title,
            package_weight: parseFloat(package_weight),
            package_destination,
            description,
            isAllocated: Boolean(isAllocated),
            driver_id: driver.driver_id
        });

        const addedPackage = await newPackage.save();
        await Driver.findOneAndUpdate(
            { _id: driver_id },
            { $push: { assigned_packages: newPackage._id } },
            { new: true }
        );

        await incrementCounter('insert');

        res.json({ id: addedPackage._id, package_id: addedPackage.package_id });
    } catch (error) {
        console.error('Error adding package:', error);
        res.json({ error: "Error adding package" });
    }
});

/**
 * Get all packages.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get('/', async function (req, res) {
    try {
        const packages = await Package.find().populate('driver_id');
        await incrementCounter('retrieve');
        res.json(packages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete a package by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
/**
 * Delete a package by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params; // Extract id from req.params

        // Validate and convert id to a Mongoose ObjectId
        const packageObjectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

        if (!packageObjectId) {
            return res.status(400).json({ error: 'Invalid package ID' });
        }

        // Check if the package exists
        const package = await Package.findById(packageObjectId);
        if (!package) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // Delete the package
        const result = await Package.deleteOne({ _id: packageObjectId });
        await incrementCounter('delete');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Update a package by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.put('/update', async (req, res) => {
    const { package_id, package_destination } = req.body;
  
    try {
      // Check if package exists and update it
      const updatedPackage = await Package.findOneAndUpdate(
        { _id: package_id }, // Find package by ID
        { package_destination }, // Update destination
        { new: true } // Return updated package
      );
  
      if (!updatedPackage) {
        return res.status(404).json({ status: 'ID not found' });
      }
  
      // Optionally, increment counter or perform other actions
      await incrementCounter('update');
  
      res.json({ status: 'Updated successfully' });
    } catch (error) {
      console.error('Error updating package destination:', error);
      res.status(500).json({ status: 'Error updating package' });
    }
  });
  
module.exports = router;