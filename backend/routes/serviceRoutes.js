const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

function buildServiceSearchQuery(rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!value) {
    return null;
  }

  const keywords = value
    .toLowerCase()
    .split(/\s+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  if (keywords.length === 0) {
    return null;
  }

  const orQueries = [];
  for (const keyword of keywords) {
    orQueries.push(
      { wasteTypes: { $regex: keyword, $options: "i" } },
      { name: { $regex: keyword, $options: "i" } },
      { type: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } }
    );
  }

  return { $or: orQueries };
}

function getServiceKeyword(item) {
  const lowerItem = String(item || "").toLowerCase();
  if (lowerItem.includes("clothes") || lowerItem.includes("fabric")) return "tailor";
  if (lowerItem.includes("plastic")) return "plastic recycling center";
  if (lowerItem.includes("glass")) return "glass recycling";
  if (lowerItem.includes("metal") || lowerItem.includes("tin") || lowerItem.includes("can")) return "scrap dealer";
  if (lowerItem.includes("paper") || lowerItem.includes("newspaper") || lowerItem.includes("cardboard")) return "paper recycling";
  if (lowerItem.includes("electronics") || lowerItem.includes("e-waste") || lowerItem.includes("battery")) return "e-waste recycling";
  return "waste management";
}

function extractCoordinates(service) {
  const directLat = service?.lat ?? service?.latitude;
  const directLng = service?.lng ?? service?.longitude;
  if (Number.isFinite(Number(directLat)) && Number.isFinite(Number(directLng))) {
    return { lat: Number(directLat), lng: Number(directLng) };
  }

  const nestedLat = service?.location?.lat ?? service?.coordinates?.lat;
  const nestedLng = service?.location?.lng ?? service?.coordinates?.lng;
  if (Number.isFinite(Number(nestedLat)) && Number.isFinite(Number(nestedLng))) {
    return { lat: Number(nestedLat), lng: Number(nestedLng) };
  }

  return null;
}

function distanceKm(from, to) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(startLat) * Math.cos(endLat) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getFallbackPhone(service) {
  const name = String(service?.name || "").toLowerCase();
  const address = String(service?.address || "").toLowerCase();
  const text = `${name} ${address}`;

  if (text.includes("mumbai") || text.includes("andheri")) return "9876500011";
  if (text.includes("thane")) return "9876500022";
  if (text.includes("navi mumbai") || text.includes("vashi")) return "9876500033";
  if (text.includes("pune")) return "9876500044";

  return service?.phone || "";
}

function serializeService(service, userCoords) {
  const coordinates = extractCoordinates(service);
  const payload = {
    name: service.name,
    address: service.address,
    phone: getFallbackPhone(service),
    type: service.type,
    wasteTypes: service.wasteTypes,
    description: service.description,
    icon: service.icon,
    mapUrl: service.mapUrl,
  };

  if (coordinates && userCoords) {
    payload.distance = `${distanceKm(userCoords, coordinates).toFixed(1)} km away`;
  } else if (service.distance) {
    payload.distance = service.distance;
  }

  return payload;
}

/**
 * Service / collector routes.
 * GET /api/services      - list all services
 * GET /api/services/search - search services by waste type
 * POST /api/services/add - add a new service / collector
 */
// Get all services
router.get("/", async (req, res) => {
  try {
    const data = await Service.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filter services by waste type
// Enhanced multi-keyword search for services
router.get("/search", async (req, res) => {
  try {
    const { type } = req.query;
    const query = buildServiceSearchQuery(type);
    if (!query) {
      return res.status(400).json({ error: "Please enter a valid recyclable item." });
    }

    // Find all matching services (deduplicated)
    const data = await Service.find(query);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No recycling options found for this item. Please try a different keyword." });
    }

    // Only return relevant fields (name + contact)
    const result = data.map(s => ({
      name: s.name,
      address: s.address,
      phone: s.phone,
      type: s.type,
      wasteTypes: s.wasteTypes,
      description: s.description,
      icon: s.icon
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor lookup used by the frontend home page.
// Returns an empty list instead of a 404 so the UI can show fallback data.
router.get("/vendors", async (req, res) => {
  try {
    const queryValue = req.query.item || req.query.type || "";
    const userLat = Number(req.query.lat);
    const userLng = Number(req.query.lng);
    const userCoords = Number.isFinite(userLat) && Number.isFinite(userLng)
      ? { lat: userLat, lng: userLng }
      : null;

    const allServices = await Service.find();
    const primaryQuery = buildServiceSearchQuery(queryValue);
    const matchedServices = primaryQuery ? await Service.find(primaryQuery) : [];

    let selectedServices = matchedServices;

    if (!selectedServices || selectedServices.length === 0) {
      const serviceKeyword = getServiceKeyword(queryValue);
      const fallbackQuery = buildServiceSearchQuery(serviceKeyword);
      if (fallbackQuery) {
        const fallbackServices = await Service.find(fallbackQuery);
        if (fallbackServices && fallbackServices.length > 0) {
          selectedServices = fallbackServices;
        }
      }
    }

    if (!selectedServices || selectedServices.length === 0) {
      const servicesWithCoords = (allServices || [])
        .map((service) => ({ service, coordinates: extractCoordinates(service) }))
        .filter((entry) => entry.coordinates);

      if (userCoords && servicesWithCoords.length > 0) {
        const nearbyServices = servicesWithCoords
          .map((entry) => ({
            ...(typeof entry.service.toObject === "function" ? entry.service.toObject() : entry.service),
            distanceValue: distanceKm(userCoords, entry.coordinates),
          }))
          .sort((a, b) => a.distanceValue - b.distanceValue)
          .slice(0, 10)
          .map((service) => ({
            ...service,
            distance: `${service.distanceValue.toFixed(1)} km away`,
          }));

        selectedServices = nearbyServices;
      } else {
        selectedServices = allServices;
      }
    }

    const result = (selectedServices || []).map((service) => serializeService(service, userCoords));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ADD COLLECTOR/SERVICE ROUTE
// POST /api/services/add
// ─────────────────────────────────────────────
router.post("/add", async (req, res) => {
  try {
    const { name, type, address, phone, icon, wasteTypes, description } = req.body;

    if (!name || !type || !address || !phone) {
      return res.status(400).json({ message: "name, type, address, and phone are required" });
    }

    const newService = new Service({
      name,
      type,
      address,
      phone,
      icon: icon || "♻️",
      wasteTypes: wasteTypes || [],
      description: description || ""
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);

  } catch (err) {
    console.error("Add Service Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;