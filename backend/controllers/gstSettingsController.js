const GstSettings = require("../models/GstSettings");

const getGstSettings = async (req, res) => {
  try {
    let settings = await GstSettings.findOne();
    
    if (!settings) {
      settings = await GstSettings.create({});
    }

    res.json({ settings });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching GST settings",
      error: error.message,
    });
  }
};

const updateGstSettings = async (req, res) => {
  try {
    const {
      business_name,
      gstin,
      address,
      city,
      state,
      state_code,
      pincode,
      phone,
      email,
      bank_name,
      account_number,
      ifsc_code,
      pan_number,
      invoice_prefix,
      terms_and_conditions,
    } = req.body;

    let settings = await GstSettings.findOne();

    if (!settings) {
      settings = await GstSettings.create({
        business_name,
        gstin,
        address,
        city,
        state,
        state_code,
        pincode,
        phone,
        email,
        bank_name,
        account_number,
        ifsc_code,
        pan_number,
        invoice_prefix,
        terms_and_conditions,
      });
    } else {
      settings.business_name = business_name || settings.business_name;
      settings.gstin = gstin || settings.gstin;
      settings.address = address || settings.address;
      settings.city = city || settings.city;
      settings.state = state || settings.state;
      settings.state_code = state_code || settings.state_code;
      settings.pincode = pincode || settings.pincode;
      settings.phone = phone || settings.phone;
      settings.email = email || settings.email;
      settings.bank_name = bank_name || settings.bank_name;
      settings.account_number = account_number || settings.account_number;
      settings.ifsc_code = ifsc_code || settings.ifsc_code;
      settings.pan_number = pan_number || settings.pan_number;
      settings.invoice_prefix = invoice_prefix || settings.invoice_prefix;
      settings.terms_and_conditions = terms_and_conditions || settings.terms_and_conditions;

      await settings.save();
    }

    res.json({
      message: "GST settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating GST settings",
      error: error.message,
    });
  }
};

module.exports = {
  getGstSettings,
  updateGstSettings,
};
