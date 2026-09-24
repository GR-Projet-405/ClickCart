const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    gallery: [
      {
        type: String,
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    packages: [
      {
        name: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },

        price: {
          type: Number,
          required: true,
        },

        duration: {
          type: String,
          default: "",
        },
      },
    ],

    availability: {
      type: String,
      default: "Available",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);