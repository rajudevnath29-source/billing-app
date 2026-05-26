const Customer = require("../models/Customer");


// CREATE CUSTOMER
const createCustomer = async (req, res) => {

  try {

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      customer
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


// GET CUSTOMERS
const getCustomers = async (req, res) => {

  try {

    const customers = await Customer.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      customers
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


// GET SINGLE CUSTOMER
const getCustomerById = async (req, res) => {

  try {

    const customer = await Customer.findById(
      req.params.id
    );

    res.json({
      success: true,
      customer
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {

  try {

    const customer =
      await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json({
      success: true,
      customer
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {

  try {

    await Customer.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Customer deleted"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};