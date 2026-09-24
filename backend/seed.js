const mongoose = require("mongoose");
require("dotenv").config();

const Provider = require("./models/Provider");
const Service = require("./models/Service");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected for seeding");

    // Remove old sample data
    await Service.deleteMany({});
    await Provider.deleteMany({});

    // Create Provider
    const provider = await Provider.create({
      name: "Tharindu Perera",
      profileImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
      coverImage:
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      profession: "Professional Home Service Provider",
      bio:
        "Experienced and trusted service provider offering quality home and maintenance services with a professional approach.",
      email: "tharindu@clickcart.lk",
      phone: "+94 77 123 4567",
      location: "Colombo, Sri Lanka",
      experience: "5+ Years",
      rating: 4.8,
      reviewCount: 126,
      verified: true,
      workingHours: {
        monday: "08:00 AM - 06:00 PM",
        tuesday: "08:00 AM - 06:00 PM",
        wednesday: "08:00 AM - 06:00 PM",
        thursday: "08:00 AM - 06:00 PM",
        friday: "08:00 AM - 06:00 PM",
        saturday: "09:00 AM - 04:00 PM",
        sunday: "Closed",
      },
    });

    // Create Service 1
    const service1 = await Service.create({
      title: "Professional Home Cleaning Service",
      description:
        "Reliable and professional home cleaning service for apartments, houses and offices. Our trained team provides deep cleaning and regular cleaning services.",
      category: "Home Cleaning",
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
      ],
      price: 3500,
      duration: "2 - 3 Hours",
      rating: 4.9,
      reviewCount: 84,
      location: "Colombo",
      provider: provider._id,
      packages: [
        {
          name: "Basic Cleaning",
          description: "Standard home cleaning service",
          price: 3500,
          duration: "2 Hours",
        },
        {
          name: "Deep Cleaning",
          description: "Complete deep cleaning service",
          price: 6500,
          duration: "4 Hours",
        },
        {
          name: "Premium Cleaning",
          description: "Full premium cleaning package",
          price: 9500,
          duration: "6 Hours",
        },
      ],
      availability: "Available Today",
      status: "active",
    });

    // Create Service 2
    const service2 = await Service.create({
      title: "AC Repair & Maintenance",
      description:
        "Professional air conditioner repair, maintenance and cleaning service for home and office environments.",
      category: "AC & Electrical",
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=80",
      ],
      price: 4500,
      duration: "1 - 2 Hours",
      rating: 4.7,
      reviewCount: 52,
      location: "Colombo",
      provider: provider._id,
      packages: [
        {
          name: "AC Inspection",
          description: "Complete AC inspection",
          price: 2500,
          duration: "1 Hour",
        },
        {
          name: "AC Cleaning",
          description: "Indoor unit cleaning",
          price: 4500,
          duration: "1.5 Hours",
        },
        {
          name: "Full Maintenance",
          description: "Complete AC maintenance",
          price: 7500,
          duration: "2 Hours",
        },
      ],
      availability: "Available Tomorrow",
      status: "active",
    });

    // Add services to provider
    provider.services = [service1._id, service2._id];
    await provider.save();

    console.log("Sample data inserted successfully!");
    console.log("Provider ID:", provider._id);
    console.log("Service 1 ID:", service1._id);
    console.log("Service 2 ID:", service2._id);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();