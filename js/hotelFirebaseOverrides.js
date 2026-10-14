import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { db, isFirebaseConfigured } from "./firebase.js";

function formatHotelPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Price on request";
  }

  const amount = Number(String(value).replace(/[₹,/\\s]/g, ""));

  return Number.isFinite(amount) && amount >= 0
    ? `₹${amount}/-`
    : "Price on request";
}

function applyHotelOverride(hotel, override) {
  // Keep the original hotel object so existing filters still work.
  hotel.publicHidden = override.isPublished === false;

  if (override.name) hotel.name = override.name;
  if (override.slug) hotel.slug = override.slug;

  if (override.location !== undefined) {
    hotel.distance = override.location;
  }

  if (
    override.pricePerNight !== undefined &&
    override.pricePerNight !== null &&
    override.pricePerNight !== ""
  ) {
    hotel.price = formatHotelPrice(override.pricePerNight);
  }

  if (Array.isArray(override.amenities)) {
    hotel.meals = override.amenities[0] || hotel.meals;
    hotel.view = override.amenities[1] || hotel.view;
  }

  if (override.image) {
    hotel.overrideImage = override.image;
  }

  if (override.enquiryUrl) {
    hotel.enquiryUrl = override.enquiryUrl;
  }
}

async function loadHotelFirebaseData() {
  if (!isFirebaseConfigured || !db) {
    console.info("Hotel Firebase integration skipped: Firebase is not configured.");
    return;
  }

  const originalHotels = window.callingHillsHotelData;

  if (!Array.isArray(originalHotels)) {
    throw new Error("Hotel catalogue not found. Check that hotelsData.js is loaded.");
  }

  const [hotelsSnapshot, overridesSnapshot] = await Promise.all([
    getDocs(
      query(collection(db, "hotels"), where("published", "==", true))
    ),
    getDocs(
      query(collection(db, "hotelOverrides"), where("published", "==", true))
    ),
  ]);

  // Overrides are matched using the original catalogue's hotel ID.
  const overrideMap = new Map();

  overridesSnapshot.forEach((item) => {
    const data = item.data();
    overrideMap.set(String(data.baseKey || item.id), data);
  });

  // Apply edits to the original 55 catalogue entries.
  originalHotels.forEach((hotel) => {
    const override = overrideMap.get(String(hotel.id));

    if (override) {
      applyHotelOverride(hotel, override);
    }
  });

  // Add hotels created directly through the admin dashboard.
  const existingIds = new Set(
    originalHotels.map((hotel) => String(hotel.id))
  );

  hotelsSnapshot.forEach((item) => {
    const data = item.data();

    if (existingIds.has(`fb-${item.id}`)) return;

    const amenities = Array.isArray(data.amenities)
      ? data.amenities
      : String(data.amenitiesText || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

    const location = data.location || "North Bengal";
    const region = /kalimpong/i.test(location)
      ? "Kalimpong"
      : "Darjeeling";

    originalHotels.push({
      id: `fb-${item.id}`,
      name: data.name || "Hotel",
      slug: data.slug || "",
      price: formatHotelPrice(data.pricePerNight),
      meals: amenities[0] || data.description || "Details available on enquiry",
      view: amenities[1] || "Contact us for details",
      distance: location,
      region,
      subRegion: location,
      premium: false,
      imageCount: 0,
      ext: "jpg",
      overrideImage: data.image || "",
      enquiryUrl: data.enquiryUrl || "./contact.html",
      publicHidden: false,
    });
  });

  // Tell the existing hotel page to refresh its display.
  window.dispatchEvent(new CustomEvent("callinghills:hotels-updated"));

  console.info("CallingHills hotel data loaded from Firebase.");
}

window.callingHillsHotelReady = loadHotelFirebaseData().catch((error) => {
  console.error("Could not load hotel data from Firebase:", error);
});