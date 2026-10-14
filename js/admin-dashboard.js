import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { auth, db, storage, isFirebaseConfigured } from "./firebase.js";
const $ = (id) => document.getElementById(id);
const COLLECTIONS = {
  regions: {
    collection: "regions",
    singular: "region",
    heading: "Destination regions management",
    kicker: "DESTINATION REGIONS",
    fields: [
      { key: "name", label: "Region name", required: true },
      { key: "slug", label: "URL slug (e.g. darjeeling)", required: true },
      { key: "subtitle", label: "Short subtitle" },
      { key: "location", label: "Location / district" },
      {
        key: "heroImage",
        label: "Hero image URL / path",
        placeholder: "./images/photo.jpg or https://…",
        full: true,
        image: true,
      },
      {
        key: "description",
        label: "Region description (HTML allowed)",
        type: "textarea",
        full: true,
      },
      {
        key: "displayOrder",
        label: "Display order (lower comes first)",
        type: "number",
        min: 0,
      },
    ],
  },
  places: {
    collection: "places",
    singular: "place",
    heading: "Destination places management",
    kicker: "DESTINATION PLACES",
    fields: [
      { key: "name", label: "Place name", required: true },
      { key: "slug", label: "Place URL slug", required: true },
      {
        key: "regionSlug",
        label: "Parent region slug (e.g. darjeeling)",
        required: true,
      },
      { key: "tagline", label: "Tagline" },
      { key: "location", label: "Location / district" },
      { key: "altitude", label: "Altitude" },
      { key: "bestTime", label: "Best time to visit" },
      { key: "famousFor", label: "Famous for" },
      {
        key: "image",
        label: "Image URL / path",
        placeholder: "./images/photo.jpg or https://…",
        full: true,
        image: true,
      },
      {
        key: "description",
        label: "Full place description (HTML allowed)",
        type: "textarea",
        full: true,
      },
      {
        key: "attractionsText",
        label: "Attractions (one item per line)",
        type: "textarea",
      },
      {
        key: "highlightsText",
        label: "Highlights (one item per line)",
        type: "textarea",
      },
      {
        key: "thingsToDoJson",
        label: "Things to do (JSON array, optional)",
        type: "textarea",
        placeholder: '[{"icon":"hiking","label":"Trekking"}]',
      },
      {
        key: "howToReachJson",
        label: "How to reach (JSON object, optional)",
        type: "textarea",
        placeholder: '{"byAir":"Bagdogra Airport"}',
      },
      {
        key: "packagesJson",
        label: "Place-specific packages (JSON array, optional)",
        type: "textarea",
        placeholder: "[]",
      },
      {
        key: "staysJson",
        label: "Place-specific stays (JSON array, optional)",
        type: "textarea",
        placeholder: "[]",
      },
      {
        key: "displayOrder",
        label: "Display order (positive = top, negative = bottom, 0 = default)",
        type: "number",
        min: -9999,
        max: 9999,
      },
    ],
  },
  packages: {
    collection: "packages",
    singular: "package",
    heading: "Packages management",
    kicker: "TRAVEL PACKAGES",
    fields: [
      { key: "name", label: "Package name", required: true },
      { key: "slug", label: "URL slug", required: true },
      { key: "destination", label: "Destination", required: true },
      { key: "duration", label: "Duration (e.g. 4 Nights / 5 Days)" },
      {
        key: "startingPrice",
        label: "Starting price (INR)",
        type: "number",
        min: 0,
      },
      {
        key: "image",
        label: "Image URL / path",
        placeholder: "./images/photo.jpg or https://…",
        full: true,
        image: true,
      },
      {
        key: "description",
        label: "Package description",
        type: "textarea",
        full: true,
      },
      { key: "route", label: "Route", full: true },
      {
        key: "inclusionsText",
        label: "Inclusions (one per line)",
        type: "textarea",
      },
      {
        key: "highlightsText",
        label: "Highlights (one per line)",
        type: "textarea",
      },
      {
        key: "itineraryJson",
        label: "Itinerary (JSON array, optional)",
        type: "textarea",
        placeholder: "[]",
      },
      {
        key: "displayOrder",
        label: "Display order (positive = top, 0 = default, negative = bottom)",
        type: "number",
        min: -9999,
        max: 9999,
      },
    ],
  },
  hotels: {
    collection: "hotels",
    singular: "hotel",
    heading: "Hotels management",
    kicker: "STAYS & HOMESTAYS",
    fields: [
      { key: "name", label: "Hotel / homestay name", required: true },
      { key: "slug", label: "URL slug", required: true },
      { key: "location", label: "Location", required: true },
      {
        key: "pricePerNight",
        label: "Price per night (INR)",
        type: "number",
        min: 0,
      },
      {
        key: "rating",
        label: "Rating (e.g. 4.5)",
        type: "number",
        min: 0,
        max: 5,
        step: "0.1",
      },
      {
        key: "image",
        label: "Image URL / path",
        placeholder: "./images/photo.jpg or https://…",
        full: true,
        image: true,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        full: true,
      },
      {
        key: "amenitiesText",
        label: "Amenities (one per line)",
        type: "textarea",
        full: true,
      },
      { key: "enquiryUrl", label: "Enquiry URL (optional)", full: true },
    ],
  },
  carRentals: {
    collection: "carRentals",
    singular: "car rental",
    heading: "Car rentals management",
    kicker: "VEHICLES & TRANSFERS",
    fields: [
      { key: "name", label: "Vehicle name", required: true },
      { key: "slug", label: "URL slug", required: true },
      { key: "vehicleType", label: "Vehicle type", required: true },
      {
        key: "seatingCapacity",
        label: "Seating capacity",
        type: "number",
        min: 1,
      },
      {
        key: "startingPricePerDay",
        label: "Starting price per day (INR)",
        type: "number",
        min: 0,
      },
      {
        key: "image",
        label: "Image URL / path",
        placeholder: "./images/photo.jpg or https://…",
        full: true,
        image: true,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        full: true,
      },
      {
        key: "serviceNotes",
        label: "Routes / service notes",
        type: "textarea",
        full: true,
      },
      { key: "enquiryUrl", label: "Enquiry URL (optional)", full: true },
    ],
  },
  blog: {
    collection: "blog",
    singular: "story",
    heading: "Write a story",
    kicker: "CALLINGHILLS JOURNAL",
    fields: [
      { key: "title", label: "Title", required: true },
      {
        key: "category",
        label: "Category",
        placeholder: "Trekking, Culture, Wildlife",
      },
      {
        key: "publicationDate",
        label: "Publication date",
        type: "date",
        required: true,
      },
      {
        key: "image",
        label: "Story image URL / path",
        placeholder: "./dest-darjeeling.png or https://…",
        full: true,
        image: true,
      },
      { key: "excerpt", label: "Excerpt", type: "textarea", full: true },
      {
        key: "story",
        label: "Full story",
        type: "textarea",
        full: true,
        placeholder: "Write the full article here…",
      },
      { key: "slug", label: "URL slug", full: true },
      { key: "displayOrder", label: "Display order", type: "number", min: 0 },
    ],
  },
};
let activeType = "regions";
let records = [];
let htmlPackages = [];
let packageOverrides = [];
let currentUser = null;
let pendingFile = null;
let originalImagePath = "";
const normaliseSlug = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const linesToArray = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
const arrayToLines = (value) => (Array.isArray(value) ? value.join("\n") : "");
const setNotice = (message, kind = "") => {
  $("dashboard-message").textContent = message;
  $("dashboard-message").className = `notice ${kind}`;
};
const friendlyError = (error) => {
  if (error?.code === "permission-denied")
    return "Firestore denied this request. Check the published rules and make sure your signed-in account is allow-listed as an admin.";
  if (error?.code === "storage/unauthorized")
    return "Storage denied the upload. Confirm the Blaze plan is active and Storage rules are published.";
  if (error?.code === "storage/quota-exceeded")
    return "Firebase Storage quota was exceeded.";
  return (
    error?.message ||
    "Something went wrong. Check the browser console for details."
  );
};
function renderFields(data = {}) {
  const config = COLLECTIONS[activeType];
  const isHtmlPackage = activeType === "packages" && data.source === "html";
  const standardFields = $("form-fields");
  const htmlFields = $("html-package-fields");
  standardFields.replaceChildren();
  if (htmlFields) {
    htmlFields.replaceChildren();
    htmlFields.hidden = !isHtmlPackage;
  }
  pendingFile = null;
  originalImagePath = data.imagePath || "";
  $("image-preview-row").hidden = true;
  $("image-preview").removeAttribute("src");

  [...config.fields]
    .sort((a, b) => Number(!!b.image) - Number(!!a.image))
    .forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = `field${field.full ? " field-full" : ""}`;
      const label = document.createElement("label");
      label.htmlFor = `field-${field.key}`;
      label.textContent = field.label;
      wrapper.append(label);
      let input;
      if (field.image) {
        input = document.createElement("input");
        input.type = "text";
        input.placeholder =
          field.placeholder || "https://… or ./images/photo.jpg";
      } else if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = field.key.toLowerCase().includes("json")
          ? 4
          : field.key === "story" || field.key === "description"
            ? 6
            : 3;
        if (field.placeholder) input.placeholder = field.placeholder;
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step) input.step = field.step;
        if (field.placeholder) input.placeholder = field.placeholder;
      }
      input.id = `field-${field.key}`;
      input.name = field.key;
      input.required = !!field.required;
      const value = data[field.key];
      if (value !== undefined && value !== null)
        input.value =
          Array.isArray(value) ||
          (typeof value === "object" && field.key.endsWith("Json"))
            ? JSON.stringify(value, null, 2)
            : String(value);
      if (field.key === "slug" && data.id && !input.value)
        input.value = data.slug || "";
      if (field.key === "attractionsText")
        input.value = arrayToLines(data.attractions);
      if (field.key === "highlightsText")
        input.value = arrayToLines(data.highlights);
      if (field.key === "inclusionsText")
        input.value = arrayToLines(data.inclusions);
      if (field.key === "amenitiesText")
        input.value = arrayToLines(data.amenities);
      if (field.key === "thingsToDoJson")
        input.value = JSON.stringify(data.thingsToDo || [], null, 2);
      if (field.key === "howToReachJson")
        input.value = JSON.stringify(data.howToReach || {}, null, 2);
      if (field.key === "packagesJson")
        input.value = JSON.stringify(data.packages || [], null, 2);
      if (field.key === "staysJson")
        input.value = JSON.stringify(data.stays || [], null, 2);
      if (field.key === "itineraryJson")
        input.value = JSON.stringify(data.itinerary || [], null, 2);
      if (field.key === "publicationDate" && !input.value)
        input.value = new Date().toISOString().slice(0, 10);
      if (field.key === "image") input.value = data.image || "";
      if (field.image) {
        const fileLabel = document.createElement("label");
        fileLabel.className = "upload-label";
        fileLabel.textContent = "Upload image (optional)";
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/jpeg,image/png,image/webp,image/avif";
        fileInput.id = "image-file";
        fileInput.addEventListener("change", () => {
          const file = fileInput.files?.[0];
          pendingFile = file || null;
          if (file) {
            $("image-preview").src = URL.createObjectURL(file);
            $("image-name").textContent =
              `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
            $("image-preview-row").hidden = false;
          }
        });
        wrapper.append(fileLabel, fileInput, input);
        if (input.value) {
          $("image-preview").src = input.value;
          $("image-name").textContent = "Current image";
          $("image-preview-row").hidden = false;
        }
      } else wrapper.append(input);
      standardFields.append(wrapper);
      if (field.key === "name" || field.key === "title")
        input.addEventListener("input", () => {
          const slug = standardFields.querySelector('[name="slug"]');
          if (slug && (!slug.dataset.edited || !slug.value))
            slug.value = normaliseSlug(input.value);
        });
      if (field.key === "slug")
        input.addEventListener("input", () => {
          input.dataset.edited = "true";
          input.value = normaliseSlug(input.value);
        });
    });

  if (isHtmlPackage && htmlFields) {
    const note = document.createElement("p");
    note.className = "field field-full";
    note.textContent =
      "Complete original package card HTML. This advanced field includes the itinerary, inclusions/exclusions, booking policies, FAQs, and buttons. Edit carefully; valid HTML is required.";
    const wrapper = document.createElement("div");
    wrapper.className = "field field-full";
    const label = document.createElement("label");
    label.htmlFor = "field-full-package-html";
    label.textContent = "Full package card HTML";
    const textarea = document.createElement("textarea");
    textarea.id = "field-full-package-html";
    textarea.name = "fullPackageHtml";
    textarea.rows = 24;
    textarea.spellcheck = false;
    textarea.value = data.overrideHtml || data.originalHtml || "";
    wrapper.append(label, textarea);
    htmlFields.append(note, wrapper);
  }

  $("published").checked = data.published !== false;
  $("record-id").value = isHtmlPackage
    ? `html:${data.slug || data.id}`
    : data.id || "";
  $("form-message").textContent = "";
  $("form-message").className = "form-message";
  $("form-title").textContent = isHtmlPackage
    ? `Edit HTML package: ${data.name}`
    : data.id
      ? `Edit ${config.singular}`
      : config.heading;
  $("form-kicker").textContent = isHtmlPackage
    ? "ORIGINAL HTML PACKAGE"
    : config.kicker;
  $("save-btn").textContent = isHtmlPackage
    ? "SAVE PACKAGE OVERRIDE"
    : data.id
      ? `UPDATE ${config.singular.toUpperCase()}`
      : `SAVE ${config.singular.toUpperCase()}`;
}
function parseOptionalJson(formData, key, fallback) {
  const value = formData.get(key)?.trim();
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`The “${key}” field must contain valid JSON.`);
  }
}
function buildRecord(formData) {
  const config = COLLECTIONS[activeType],
    result = {};
  for (const field of config.fields) {
    const raw = formData.get(field.key);
    if (field.key.endsWith("Json")) continue;
    if (
      [
        "attractionsText",
        "highlightsText",
        "inclusionsText",
        "amenitiesText",
      ].includes(field.key)
    )
      continue;
    if (
      field.type === "number" ||
      [
        "startingPrice",
        "pricePerNight",
        "rating",
        "seatingCapacity",
        "startingPricePerDay",
        "displayOrder",
      ].includes(field.key)
    )
      result[field.key] = raw === "" || raw == null ? null : Number(raw);
    else result[field.key] = typeof raw === "string" ? raw.trim() : raw;
  }
  result.published = $("published").checked;
  if (activeType === "places") {
    result.attractions = linesToArray(formData.get("attractionsText"));
    result.highlights = linesToArray(formData.get("highlightsText"));
    result.thingsToDo = parseOptionalJson(formData, "thingsToDoJson", []);
    result.howToReach = parseOptionalJson(formData, "howToReachJson", {});
    result.packages = parseOptionalJson(formData, "packagesJson", []);
    result.stays = parseOptionalJson(formData, "staysJson", []);
  }
  if (activeType === "packages") {
    result.inclusions = linesToArray(formData.get("inclusionsText"));
    result.highlights = linesToArray(formData.get("highlightsText"));
    result.itinerary = parseOptionalJson(formData, "itineraryJson", []);
  }
  if (activeType === "hotels")
    result.amenities = linesToArray(formData.get("amenitiesText"));
  if (activeType === "blog")
    result.slug = result.slug || normaliseSlug(result.title);
  if (!result.slug && result.name) result.slug = normaliseSlug(result.name);
  result.updatedAt = serverTimestamp();
  if (!$("record-id").value) result.createdAt = serverTimestamp();
  result.updatedBy = currentUser?.uid || "";
  return result;
}
function packageOrderValue(record) {
  const value = Number(record.displayOrder);
  return Number.isFinite(value) ? value : 0;
}
function comparePackageOrder(a, b) {
  const ao = packageOrderValue(a),
    bo = packageOrderValue(b);
  const bucket = (v) => (v > 0 ? 0 : v < 0 ? 2 : 1);
  const ab = bucket(ao),
    bb = bucket(bo);
  if (ab !== bb) return ab - bb;
  if (ab === 0)
    return ao - bo || (a.originalIndex ?? 99999) - (b.originalIndex ?? 99999);
  if (ab === 2)
    return bo - ao || (a.originalIndex ?? 99999) - (b.originalIndex ?? 99999);
  return (
    (a.originalIndex ?? 99999) - (b.originalIndex ?? 99999) ||
    String(a.name || "").localeCompare(String(b.name || ""))
  );
}
async function loadOriginalHtmlPackages() {
  const response = await fetch("./packages.html", { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "Could not load packages.html. Start Live Server from the website root.",
    );
  const parsed = new DOMParser().parseFromString(
    await response.text(),
    "text/html",
  );
  const used = new Set();
  return Array.from(parsed.querySelectorAll(".pkg-grid .pkg-card")).map(
    (card, index) => {
      const name =
        card.querySelector(".pkg-title")?.textContent.trim() ||
        `Package ${index + 1}`;
      let id =
        card.dataset.slug ||
        card.dataset.packageId ||
        normaliseSlug(name) ||
        `html-package-${index + 1}`;
      if (used.has(id)) id = `${id}-${index + 1}`;
      used.add(id);
      const priceText = card.querySelector(".pkg-price-tag")?.textContent || "";
      const priceMatch = priceText.replace(/,/g, "").match(/\d+/);
      return {
        id,
        slug: id,
        name,
        destination: card.dataset.region || "",
        image: card.querySelector(".pkg-image")?.getAttribute("src") || "",
        duration: card.querySelector(".pkg-duration")?.textContent.trim() || "",
        description:
          card.querySelector(".pkg-teaser")?.textContent.trim() || "",
        route: card.querySelector(".pkg-route")?.textContent.trim() || "",
        startingPrice: priceMatch ? Number(priceMatch[0]) : null,
        highlights: Array.from(
          card.querySelectorAll(".pkg-highlight-pill"),
        ).map((item) => item.textContent.trim()),
        displayOrder: 0,
        published: true,
        originalHtml: card.outerHTML,
        originalIndex: index,
        source: "html",
      };
    },
  );
}

function getOriginalHtmlRegions() {
  const data = window.destinationsData;

  if (!data || typeof data !== "object") {
    throw new Error(
      "Destination data is missing. Check the destinationsData.js script in admin-dashboard.html.",
    );
  }

  return Object.entries(data).map(([key, region], index) => ({
    id: `html-region:${key}`,
    source: "html",
    sourceKey: key,
    slug: key,
    name: region.title || key,
    subtitle: region.subtitle || "",
    location: region.location || "",
    heroImage: region.heroImage || "",
    description: region.regionDescription || region.description || "",
    displayOrder: 0,
    published: true,
    originalIndex: index,
    originalData: region,
  }));
}

function getOriginalHtmlPlaces() {
  const data = window.destinationsData;

  if (!data || typeof data !== "object") {
    throw new Error("Destination data is missing.");
  }

  return Object.entries(data).flatMap(([regionKey, region]) =>
    (Array.isArray(region.places) ? region.places : []).map((place, index) => ({
      id: `html-place:${regionKey}--${place.slug || normaliseSlug(place.name)}`,
      source: "html",
      sourceKey: `${regionKey}--${place.slug || normaliseSlug(place.name)}`,
      regionSlug: regionKey,
      name: place.name || "",
      slug: place.slug || normaliseSlug(place.name),
      tagline: place.tagline || "",
      location: place.location || "",
      altitude: place.altitude || "",
      bestTime: place.bestTime || "",
      famousFor: place.famousFor || "",
      image: place.image || "",
      description: place.description || "",
      attractions: place.attractions || [],
      highlights: place.highlights || [],
      thingsToDo: place.thingsToDo || [],
      howToReach: place.howToReach || {},
      packages: place.packages || [],
      stays: place.stays || [],
      displayOrder: 0,
      published: true,
      originalIndex: index,
      originalData: place,
    })),
  );
}

async function getOriginalHtmlCarRentals() {
  const response = await fetch("./car-rental.html");

  if (!response.ok) {
    throw new Error(
      "Could not load car-rental.html. Start Live Server from the website root.",
    );
  }

  const parsed = new DOMParser().parseFromString(
    await response.text(),
    "text/html",
  );

  const used = new Set();

  return Array.from(parsed.querySelectorAll(".hotels-grid .htl-card")).map(
    (card, index) => {
      const name =
        card.querySelector(".htl-name")?.textContent.trim() ||
        `Car ${index + 1}`;

      let slug = normaliseSlug(name) || `car-${index + 1}`;

      if (used.has(slug)) {
        slug = `${slug}-${index + 1}`;
      }

      used.add(slug);

      const priceText = card.querySelector(".htl-price-amt")?.textContent || "";

      const priceMatch = priceText.replace(/,/g, "").match(/\d+/);

      const features =
        card
          .querySelector(".htl-features")
          ?.textContent.trim()
          .replace(/\s+/g, " ") || "";

      const seatingMatch = features.match(/(\d+)\s*(?:seats?|adults?)/i);

      let vehicleType = "Car";

      if (/traveller|cruiser/i.test(name)) {
        vehicleType = "Van / Traveller";
      } else if (/innova|zylo|sumo|bolero|bollero/i.test(name)) {
        vehicleType = "SUV / MUV";
      } else if (/wagonr/i.test(name)) {
        vehicleType = "Hatchback";
      }

      return {
        id: `html-car:${slug}`,
        source: "html",
        sourceKey: slug,
        slug,
        name,
        vehicleType,
        seatingCapacity: seatingMatch ? Number(seatingMatch[1]) : null,
        startingPricePerDay: priceMatch ? Number(priceMatch[0]) : null,
        image: card.querySelector(".htl-slide img")?.getAttribute("src") || "",
        description: "",
        serviceNotes: features,
        enquiryUrl:
          card.querySelector(".htl-btn")?.getAttribute("href") ||
          "./contact.html",
        displayOrder: 0,
        published: true,
        originalIndex: index,
      };
    },
  );
}

function compareManagedOrder(a, b) {
  const order = (item) => {
    const value = Number(item.displayOrder);
    return Number.isFinite(value) ? value : 0;
  };

  const bucket = (value) => (value > 0 ? 0 : value < 0 ? 2 : 1);
  const ao = order(a);
  const bo = order(b);

  if (bucket(ao) !== bucket(bo)) {
    return bucket(ao) - bucket(bo);
  }

  if (bucket(ao) === 0) {
    return ao - bo;
  }

  if (bucket(ao) === 2) {
    return bo - ao;
  }

  const aIndex = a.originalIndex ?? 999999;
  const bIndex = b.originalIndex ?? 999999;

  if (a.source === "html" && b.source === "html") {
    return aIndex - bIndex;
  }

  if (a.source === "html") return -1;
  if (b.source === "html") return 1;

  return String(a.name || "").localeCompare(String(b.name || ""));
}

function getOriginalHtmlHotels() {
  const data = window.callingHillsHotelData;

  if (!Array.isArray(data)) {
    throw new Error(
      "Hotel data is missing. Check that hotelsData.js is loaded before admin-dashboard.js."
    );
  }

  return data.map((hotel, index) => {
    const id = String(hotel.id ?? index + 1);
    const priceText = String(hotel.price || "");
    const priceMatch = priceText.replace(/,/g, "").match(/\d+/);

    return {
      id: `html-hotel:${id}`,
      source: "html",
      sourceKey: id,
      slug: normaliseSlug(hotel.name),
      name: hotel.name || "",
      location: hotel.distance || hotel.region || "",
      pricePerNight: priceMatch ? Number(priceMatch[0]) : null,
      rating: null,
      image: "",
      description: "",
      amenities: [hotel.meals, hotel.view].filter(Boolean),
      displayOrder: 0,
      published: true,
      originalIndex: index,
      originalData: hotel
    };
  });
}

async function loadRecords() {
  const config = COLLECTIONS[activeType];

  $("records-list").innerHTML =
    '<div class="empty-state">Loading entries…</div>';

  try {
    if (activeType === "packages") {
      // Preserve the existing Packages integration.
      if (!htmlPackages.length) {
        htmlPackages = await loadOriginalHtmlPackages();
      }

      const [packageSnapshot, overrideSnapshot] = await Promise.all([
        getDocs(collection(db, "packages")),
        getDocs(collection(db, "packageOverrides")),
      ]);

      const firebasePackages = packageSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        source: "firebase",
      }));

      packageOverrides = overrideSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const overrideMap = new Map(
        packageOverrides.map((item) => [item.id, item]),
      );

      const originals = htmlPackages.map((original) => {
        const override = overrideMap.get(original.id) || {};

        return {
          ...original,
          ...override,
          id: original.id,
          slug: original.id,
          source: "html",
          originalHtml: original.originalHtml,
          overrideHtml: override.cardHtml || original.originalHtml,
          hasOverride: !!override.cardHtml,
          originalIndex: original.originalIndex,
          name: override.name || original.name,
          image: override.image || original.image,
          displayOrder: override.displayOrder ?? 0,
          published: override.published !== false,
        };
      });

      records = [...originals, ...firebasePackages];
      records.sort(compareManagedOrder);
    } else if (activeType === "hotels") {
      const [hotelSnapshot, overrideSnapshot] = await Promise.all([
        getDocs(collection(db, "hotels")),
        getDocs(collection(db, "hotelOverrides")),
      ]);

      const firebaseHotels = hotelSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        source: "firebase",
      }));

      const hotelOverrides = overrideSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const overrideMap = new Map(
        hotelOverrides.map((item) => [item.baseKey || item.id, item]),
      );

      const originals = getOriginalHtmlHotels().map((original) => {
        const override = overrideMap.get(original.sourceKey) || {};

        return {
          ...original,
          ...override,

          // Keep the original catalogue identity stable.
          id: original.id,
          source: "html",
          sourceKey: original.sourceKey,
          originalData: original.originalData,
          originalIndex: original.originalIndex,

          name: override.name || original.name,
          slug: override.slug || original.slug,
          location: override.location ?? original.location,
          pricePerNight: override.pricePerNight ?? original.pricePerNight,
          rating: override.rating ?? original.rating,
          image: override.image || original.image,
          description: override.description ?? original.description,
          amenities: override.amenities ?? original.amenities,
          displayOrder: override.displayOrder ?? 0,

          published:
            override.isPublished !== undefined ? override.isPublished : true,

          imagePath: override.imagePath || "",
          hasOverride: Object.keys(override).length > 0,
        };
      });

      records = [...originals, ...firebaseHotels];
      records.sort(compareManagedOrder);
    } else if (activeType === "regions" || activeType === "places") {
      const isRegions = activeType === "regions";

      const overrideCollection = isRegions
        ? "regionOverrides"
        : "placeOverrides";

      const [contentSnapshot, overrideSnapshot] = await Promise.all([
        getDocs(collection(db, config.collection)),
        getDocs(collection(db, overrideCollection)),
      ]);

      const firebaseRecords = contentSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        source: "firebase",
      }));

      const overrideMap = new Map(
        overrideSnapshot.docs.map((item) => {
          const value = item.data();
          return [value.baseKey || item.id, value];
        }),
      );

      const originals = isRegions
        ? getOriginalHtmlRegions()
        : getOriginalHtmlPlaces();

      const staticRecords = originals.map((original) => {
        const override = overrideMap.get(original.sourceKey) || {};

        return {
          ...original,
          ...override,

          // Keep the static HTML identity stable.
          id: original.id,
          source: "html",
          sourceKey: original.sourceKey,
          originalData: original.originalData,
          originalIndex: original.originalIndex,

          name: override.name || override.title || original.name,
          slug: override.slug || original.slug,
          displayOrder: override.displayOrder ?? 0,

          published:
            override.isPublished !== undefined ? override.isPublished : true,

          imagePath: override.imagePath || "",
          hasOverride: Object.keys(override).length > 0,

          ...(isRegions
            ? {
                subtitle: override.subtitle ?? original.subtitle,
                location: override.location ?? original.location,
                heroImage: override.heroImage ?? original.heroImage,
                description: override.description ?? original.description,
              }
            : {
                regionSlug: override.regionSlug ?? original.regionSlug,
                tagline: override.tagline ?? original.tagline,
                location: override.location ?? original.location,
                altitude: override.altitude ?? original.altitude,
                bestTime: override.bestTime ?? original.bestTime,
                famousFor: override.famousFor ?? original.famousFor,
                image: override.image ?? original.image,
                description: override.description ?? original.description,
                attractions: override.attractions ?? original.attractions,
                highlights: override.highlights ?? original.highlights,
                thingsToDo: override.thingsToDo ?? original.thingsToDo,
                howToReach: override.howToReach ?? original.howToReach,
                packages: override.packages ?? original.packages,
                stays: override.stays ?? original.stays,
              }),
        };
      });

      const staticSlugs = new Set(staticRecords.map((item) => item.slug));

      const additionalRecords = firebaseRecords.filter((item) => {
        const slug = item.slug || normaliseSlug(item.name);
        return !staticSlugs.has(slug);
      });

      records = [...staticRecords, ...additionalRecords];
      records.sort(compareManagedOrder);
    } else if (activeType === "carRentals") {
      const [carSnapshot, overrideSnapshot] = await Promise.all([
        getDocs(collection(db, "carRentals")),
        getDocs(collection(db, "carRentalOverrides")),
      ]);

      const firebaseCars = carSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        source: "firebase",
      }));

      const overrideMap = new Map(
        overrideSnapshot.docs.map((item) => {
          const data = item.data();
          return [String(data.baseKey || item.id), data];
        }),
      );

      const originals = (await getOriginalHtmlCarRentals()).map((original) => {
        const override = overrideMap.get(original.sourceKey) || {};

        return {
          ...original,
          ...override,

          // Keep the original HTML record linked to its stable identity.
          id: original.id,
          source: "html",
          sourceKey: original.sourceKey,
          originalIndex: original.originalIndex,

          name: override.name || original.name,
          slug: override.slug || original.slug,
          vehicleType: override.vehicleType || original.vehicleType,
          seatingCapacity: override.seatingCapacity ?? original.seatingCapacity,
          startingPricePerDay:
            override.startingPricePerDay ?? original.startingPricePerDay,
          image: override.image || original.image,
          description: override.description ?? original.description,
          serviceNotes: override.serviceNotes ?? original.serviceNotes,
          enquiryUrl: override.enquiryUrl || original.enquiryUrl,

          // Admin visibility is separate from public-read permission.
          published:
            override.isPublished !== undefined ? override.isPublished : true,

          hasOverride: Object.keys(override).length > 0,
        };
      });

      records = [...originals, ...firebaseCars];
      records.sort(compareManagedOrder);
    } else {
      const snapshot = await getDocs(collection(db, config.collection));
    }

    renderRecords();

    setNotice(
      `Loaded ${records.length} ${config.singular}${
        records.length === 1 ? "" : "s"
      }.`,
      "success",
    );
  } catch (error) {
    console.error("Content read failed", error);

    records = [];
    renderRecords();
    setNotice(friendlyError(error), "error");
  }
}

function renderRecords() {
  const search = $("record-search").value.trim().toLowerCase();
  const list = records.filter((record) =>
    JSON.stringify([
      record.name,
      record.title,
      record.slug,
      record.location,
      record.destination,
      record.regionSlug,
      record.category,
      record.source,
    ])
      .toLowerCase()
      .includes(search),
  );
  $("record-count").textContent = String(records.length);
  $("records-list").replaceChildren();
  if (!list.length) {
    const p = document.createElement("div");
    p.className = "empty-state";
    p.textContent = search ? "No matching entries." : "No entries yet.";
    $("records-list").append(p);
    return;
  }
  for (const record of list) {
    const card = document.createElement("article");
    card.className = "record-item";
    if (record.image || record.heroImage) {
      const img = document.createElement("img");
      img.className = "record-thumb";
      img.alt = "";
      img.src = record.image || record.heroImage;
      img.onerror = () => {
        img.hidden = true;
      };
      card.append(img);
    }
    const info = document.createElement("div");
    info.className = "record-info";
    const title = document.createElement("strong");
    title.textContent = record.name || record.title || "Untitled entry";
    const subtitle = document.createElement("span");
    subtitle.textContent = [
      record.source === "html"
        ? "Original HTML package"
        : record.location ||
          record.destination ||
          record.category ||
          record.regionSlug,
      record.slug,
    ]
      .filter(Boolean)
      .join(" · ");
    const status = document.createElement("span");
    status.className = `record-status ${record.published === false ? "draft" : "live"}`;
    status.textContent =
      record.source === "html"
        ? record.hasOverride
          ? "HTML · OVERRIDDEN"
          : "HTML · ORIGINAL"
        : record.published === false
          ? "DRAFT"
          : "PUBLISHED";
    info.append(title, subtitle, status);
    card.append(info);
    const actions = document.createElement("div");
    actions.className = "record-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "mini-btn";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => renderFields(record));
    actions.append(edit);
    if (record.source !== "html") {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "mini-btn danger";
      del.textContent = "Delete";
      del.addEventListener("click", () => deleteRecord(record));
      actions.append(del);
    }
    card.append(actions);
    $("records-list").append(card);
  }
}
async function deleteRecord(record) {
  const label = record.name || record.title || "this entry";
  if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS[activeType].collection, record.id));
    if (record.imagePath) {
      try {
        await deleteObject(ref(storage, record.imagePath));
      } catch (error) {
        console.warn("Could not remove associated image", error);
      }
    }
    setNotice(`${label} was deleted.`, "success");
    if ($("record-id").value === record.id) renderFields();
    await loadRecords();
  } catch (error) {
    console.error(error);
    setNotice(friendlyError(error), "error");
  }
}
$("content-tabs").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-type]");
  if (!button) return;
  activeType = button.dataset.type;
  document
    .querySelectorAll(".tab-btn")
    .forEach((tab) => tab.classList.toggle("active", tab === button));
  $("records-title").textContent = button.textContent;
  $("record-search").value = "";
  renderFields();
  if (activeType === "packages") {
    try {
      htmlPackages = await loadOriginalHtmlPackages();
    } catch (error) {
      console.error("Original package loading failed:", error);
      htmlPackages = [];
      setNotice(error.message, "error");
    }
  }
  await loadRecords();
});
$("record-search").addEventListener("input", renderRecords);
$("reset-form").addEventListener("click", () => renderFields());
$("clear-btn").addEventListener("click", () => renderFields());
$("sign-out").addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("./admin-login.html");
});
$("content-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const saveButton = $("save-btn");
  saveButton.disabled = true;
  saveButton.textContent = "SAVING…";
  $("form-message").textContent = "";
  $("form-message").className = "form-message";
  try {
    const formData = new FormData(event.currentTarget);

    const recordId = $("record-id").value;

    const isHtmlPackage =
      activeType === "packages" && recordId.startsWith("html:");

    const isHtmlRegion =
      activeType === "regions" && recordId.startsWith("html-region:");

    const isHtmlPlace =
      activeType === "places" && recordId.startsWith("html-place:");

    const isHtmlHotel =
      activeType === "hotels" && recordId.startsWith("html-hotel:");

    const isHtmlCarRental =
      activeType === "carRentals" && recordId.startsWith("html-car:");

    let record = buildRecord(formData);
    if (activeType === "regions") record.heroImage = record.heroImage || "";
    if (activeType !== "regions") record.image = record.image || "";
    const imageField = COLLECTIONS[activeType].fields.find(
      (field) => field.image,
    )?.key;
    if (pendingFile) {
      if (
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          pendingFile.type,
        )
      )
        throw new Error("Choose a JPG, PNG, WebP, or AVIF image.");
      if (pendingFile.size > 8 * 1024 * 1024)
        throw new Error("Image must be 8 MB or smaller.");
      const oldPath = originalImagePath;
      const slug =
        normaliseSlug(
          record.slug || record.name || record.title || activeType,
        ) || "content";
      const collectionName = isHtmlPackage
        ? "packageOverrides"
        : isHtmlHotel
          ? "hotelOverrides"
          : isHtmlCarRental
            ? "carRentalOverrides"
            : isHtmlRegion
              ? "regionOverrides"
              : isHtmlPlace
                ? "placeOverrides"
                : COLLECTIONS[activeType].collection;
      const path = `content/${collectionName}/${slug}/${Date.now()}-${normaliseSlug(pendingFile.name) || "image"}`;
      const uploaded = await uploadBytes(ref(storage, path), pendingFile, {
        contentType: pendingFile.type,
        cacheControl: "public,max-age=3600",
      });
      record[imageField] = await getDownloadURL(uploaded.ref);
      record.imagePath = path;
      if (oldPath && oldPath !== path) {
        try {
          await deleteObject(ref(storage, oldPath));
        } catch (error) {
          console.warn("Old image cleanup failed", error);
        }
      }
    } else if (originalImagePath) record.imagePath = originalImagePath;

    if (isHtmlPackage) {
      const slug = recordId.slice("html:".length);
      const fullHtml = $("field-full-package-html")?.value || "";
      if (!fullHtml.trim())
        throw new Error("The full package HTML cannot be empty.");
      const parsed = new DOMParser().parseFromString(fullHtml, "text/html");
      const card = parsed.body.firstElementChild;
      if (!card || !card.classList.contains("pkg-card"))
        throw new Error(
          "The full HTML must start with the original .pkg-card element.",
        );
      // Keep the ordinary fields and the full HTML editor in sync for the most-used card fields.
      const titleNode = card.querySelector(".pkg-title");
      if (titleNode && record.name) titleNode.textContent = record.name;
      const imageNode = card.querySelector(".pkg-image");
      if (imageNode && record.image)
        imageNode.setAttribute("src", record.image);
      const durationNode = card.querySelector(".pkg-duration");
      if (durationNode && record.duration)
        durationNode.textContent = record.duration;
      const teaserNode = card.querySelector(".pkg-teaser");
      if (teaserNode && record.description)
        teaserNode.textContent = record.description;
      const routeNode = card.querySelector(".pkg-route");
      if (routeNode && record.route) routeNode.textContent = record.route;
      if (record.destination)
        card.dataset.region = normaliseSlug(record.destination);
      const priceNode = card.querySelector(".pkg-price-tag");
      if (priceNode && record.startingPrice != null) {
        const firstText = Array.from(priceNode.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE,
        );
        if (firstText)
          firstText.textContent = `Starting @ ₹${Number(record.startingPrice).toLocaleString("en-IN")}/- `;
        else
          priceNode.prepend(
            document.createTextNode(
              `Starting @ ₹${Number(record.startingPrice).toLocaleString("en-IN")}/- `,
            ),
          );
      }
      const highlightList = card.querySelector(".pkg-highlights-list");
      if (highlightList && Array.isArray(record.highlights)) {
        highlightList.replaceChildren(
          ...record.highlights.map((text) => {
            const pill = document.createElement("span");
            pill.className = "pkg-highlight-pill";
            pill.textContent = text;
            return pill;
          }),
        );
      }
      card.dataset.displayOrder = String(record.displayOrder ?? 0);
      // The public page will use this exact card HTML for the matching original package.
      await setDoc(
        doc(db, "packageOverrides", slug),
        {
          ...record,
          slug,
          source: "html",
          cardHtml: card.outerHTML,
          originalIndex:
            htmlPackages.find((item) => item.id === slug)?.originalIndex ??
            99999,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid || "",
        },
        { merge: true },
      );
    } else if (isHtmlHotel) {
      const baseKey = recordId.slice("html-hotel:".length);
      const { published: isPublished, ...overrideFields } = record;

      await setDoc(
        doc(db, "hotelOverrides", baseKey),
        {
          ...overrideFields,
          baseKey,
          source: "html",
          published: true,
          isPublished: isPublished !== false,
          originalIndex:
            records.find((item) => item.id === recordId)?.originalIndex ??
            999999,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid || "",
        },
        { merge: true },
      );
    } else if (isHtmlCarRental) {
      const baseKey = recordId.slice("html-car:".length);
      const { published: isPublished, ...overrideFields } = record;

      await setDoc(
        doc(db, "carRentalOverrides", baseKey),
        {
          ...overrideFields,
          baseKey,
          source: "html",
          published: true,
          isPublished: isPublished !== false,
          originalIndex:
            records.find((item) => item.id === recordId)?.originalIndex ??
            999999,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid || "",
        },
        { merge: true },
      );
    } else if (isHtmlRegion || isHtmlPlace) {
      const prefix = isHtmlRegion ? "html-region:" : "html-place:";
      const baseKey = recordId.slice(prefix.length);

      const overrideCollection = isHtmlRegion
        ? "regionOverrides"
        : "placeOverrides";

      const { published: isPublished, ...overrideFields } = record;

      await setDoc(
        doc(db, overrideCollection, baseKey),
        {
          ...overrideFields,
          baseKey,
          source: "html",

          // Keep the override readable under the current Firestore rules.
          published: true,

          // Actual visibility on the public website.
          isPublished: isPublished !== false,

          originalIndex:
            records.find((item) => item.id === recordId)?.originalIndex ??
            999999,

          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid || "",
        },
        { merge: true },
      );
    } else {
      const id = recordId;

      if (id) {
        await updateDoc(
          doc(db, COLLECTIONS[activeType].collection, id),
          record,
        );
      } else {
        await addDoc(
          collection(db, COLLECTIONS[activeType].collection),
          record,
        );
      }
    }
    setNotice(
      `${COLLECTIONS[activeType].singular[0].toUpperCase()}${COLLECTIONS[activeType].singular.slice(1)} saved successfully.`,
      "success",
    );
    renderFields();
    await loadRecords();
  } catch (error) {
    console.error("Content save failed", error);
    $("form-message").textContent = friendlyError(error);
    $("form-message").className = "form-message error";
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = $("record-id").value
      ? `UPDATE ${COLLECTIONS[activeType].singular.toUpperCase()}`
      : `SAVE ${COLLECTIONS[activeType].singular.toUpperCase()}`;
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("./admin-login.html");
    return;
  }
  currentUser = user;
  $("auth-loading").hidden = true;
  $("dashboard").hidden = false;
  if (!isFirebaseConfigured)
    setNotice(
      "Firebase setup is incomplete. Fill in js/firebase-config.js first.",
      "error",
    );
  // Initialize the form when the dashboard first loads.
  renderFields();
  // Load the existing content from Firestore.
  await loadRecords();
});
