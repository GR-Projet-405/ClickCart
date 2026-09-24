const express = require("express");
const mongoose = require("mongoose");
const Provider = require("../models/Provider");

const router = express.Router();

// Get all providers
router.get("/", async (req, res) => {
  try {
    const providers = await Provider.find()
      .populate("services")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message,
    });
  }
});

// Get single provider
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID",
      });
    }

    const provider = await Provider.findById(id).populate("services");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
      error: error.message,
    });
  }
});

module.exports = router;