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
      { key: "displayOrder", label: "Display order", type: "number", min: 0 },
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
      { key: "displayOrder", label: "Display order", type: "number", min: 0 },
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
  $("form-fields").replaceChildren();
  pendingFile = null;
  originalImagePath = data.imagePath || "";
  $("image-preview-row").hidden = true;
  $("image-preview").removeAttribute("src");
  config.fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = `field${field.full ? " field-full" : ""}`;
    const label = document.createElement("label");
    label.htmlFor = `field-${field.key}`;
    label.textContent = field.label;
    wrapper.append(label);
    let input;
    if (field.image) {
      input = document.createElement("input");
      input.type = "url";
      input.placeholder =
        field.placeholder || "https://… or ./images/photo.jpg";
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = field.key.toLowerCase().includes("json")
        ? 3
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
      wrapper.append(input, fileLabel, fileInput);
      if (input.value) {
        $("image-preview").src = input.value;
        $("image-name").textContent = "Current image";
        $("image-preview-row").hidden = false;
      }
    } else wrapper.append(input);
    $("form-fields").append(wrapper);
    if (field.key === "name" || field.key === "title")
      input.addEventListener("input", () => {
        const slug = $("form-fields").querySelector('[name="slug"]');
        if (slug && (!slug.dataset.edited || !slug.value))
          slug.value = normaliseSlug(input.value);
      });
    if (field.key === "slug")
      input.addEventListener("input", () => {
        input.dataset.edited = "true";
        input.value = normaliseSlug(input.value);
      });
  });
  $("published").checked = data.published !== false;
  $("record-id").value = data.id || "";
  $("form-message").textContent = "";
  $("form-message").className = "form-message";
  $("form-title").textContent = data.id
    ? `Edit ${config.singular}`
    : config.heading;
  $("form-kicker").textContent = config.kicker;
  $("save-btn").textContent = data.id
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

async function loadRecords() {
  const config = COLLECTIONS[activeType];
  $("records-list").innerHTML =
    '<div class="empty-state">Loading entries…</div>';
  try {
    // Avoid an orderBy query so older documents without createdAt also display.
    const snapshot = await getDocs(collection(db, config.collection));
    records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    records.sort(
      (a, b) =>
        (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999) ||
        String(a.name || a.title || "").localeCompare(
          String(b.name || b.title || ""),
        ),
    );
    renderRecords();
    setNotice(
      `Loaded ${records.length} ${config.singular}${records.length === 1 ? "" : "s"}.`,
      "success",
    );
  } catch (error) {
    console.error("Firestore read failed", error);
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
    ])
      .join(" ")
      .toLowerCase()
      .includes(search),
  );
  $("record-count").textContent = String(records.length);
  $("records-list").replaceChildren();
  if (!list.length) {
    const p = document.createElement("div");
    p.className = "empty-state";
    p.textContent = search
      ? "No matching entries."
      : "No entries yet. Use the form to create the first one.";
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
    subtitle.textContent =
      [
        record.location ||
          record.destination ||
          record.category ||
          record.regionSlug,
        record.slug,
      ]
        .filter(Boolean)
        .join(" · ") || "No additional details";
    const status = document.createElement("span");
    status.className = `record-status ${record.published === false ? "draft" : "live"}`;
    status.textContent = record.published === false ? "DRAFT" : "PUBLISHED";
    info.append(title, subtitle, status);
    card.append(info);
    const actions = document.createElement("div");
    actions.className = "record-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "mini-btn";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => renderFields(record));
    const del = document.createElement("button");
    del.type = "button";
    del.className = "mini-btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteRecord(record));
    actions.append(edit, del);
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
  let record;
  try {
    const formData = new FormData(event.currentTarget);
    record = buildRecord(formData);
    if (activeType === "regions") record.heroImage = record.heroImage || "";
    if (activeType !== "regions") record.image = record.image || "";
    const imageField = COLLECTIONS[activeType].fields.find(
      (field) => field.image,
    )?.key;
    if (pendingFile) {
      if (
        !pendingFile.type.startsWith("image/") ||
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
      const path = `content/${COLLECTIONS[activeType].collection}/${slug}/${Date.now()}-${normaliseSlug(pendingFile.name) || "image"}`;
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
    const id = $("record-id").value;
    if (id)
      await updateDoc(doc(db, COLLECTIONS[activeType].collection, id), record);
    else
      await addDoc(collection(db, COLLECTIONS[activeType].collection), record);
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
  $("admin-email").textContent = user.email || "Administrator";
  if (!isFirebaseConfigured)
    setNotice(
      "Firebase setup is incomplete. Fill in js/firebase-config.js first.",
      "error",
    );
  await loadRecords();
});
