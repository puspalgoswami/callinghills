import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { db, isFirebaseConfigured } from "./firebase.js";

function getOrder(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function compareDisplayOrder(a, b) {
    const ao = getOrder(a.displayOrder);
    const bo = getOrder(b.displayOrder);

    const bucket = value => value > 0 ? 0 : value < 0 ? 2 : 1;

    if (bucket(ao) !== bucket(bo)) {
        return bucket(ao) - bucket(bo);
    }

    if (bucket(ao) === 0) return ao - bo;
    if (bucket(ao) === 2) return bo - ao;

    return (a._sourceOrder ?? 999999) - (b._sourceOrder ?? 999999);
}

function makePlace(record, sourceOrder = 999999) {
    return {
        name: record.name || "",
        slug: record.slug || "",
        tagline: record.tagline || "",
        location: record.location || "",
        altitude: record.altitude || "",
        bestTime: record.bestTime || "",
        famousFor: record.famousFor || "",
        description: record.description || "",
        image: record.image || "",
        attractions: Array.isArray(record.attractions) ? record.attractions : [],
        highlights: Array.isArray(record.highlights) ? record.highlights : [],
        thingsToDo: Array.isArray(record.thingsToDo) ? record.thingsToDo : [],
        howToReach: record.howToReach || {},
        packages: Array.isArray(record.packages) ? record.packages : [],
        stays: Array.isArray(record.stays) ? record.stays : [],
        displayOrder: getOrder(record.displayOrder),
        _isPublished: record.published !== false,
        _sourceOrder: sourceOrder
    };
}

function applyRegionOverride(region, override) {
    if (override.name !== undefined) region.title = override.name;
    else if (override.title !== undefined) region.title = override.title;

    if (override.subtitle !== undefined) region.subtitle = override.subtitle;
    if (override.location !== undefined) region.location = override.location;
    if (override.heroImage !== undefined) region.heroImage = override.heroImage;

    if (override.description !== undefined) {
        region.regionDescription = override.description;
    }

    if (override.displayOrder !== undefined) {
        region.displayOrder = getOrder(override.displayOrder);
    }

    region._isPublished = override.isPublished !== false;
}

function applyPlaceOverride(region, originalSlug, override) {
    if (!Array.isArray(region.places)) return;

    const place = region.places.find(item => item.slug === originalSlug);
    if (!place) return;

    const editableFields = [
        "name",
        "slug",
        "tagline",
        "location",
        "altitude",
        "bestTime",
        "famousFor",
        "image",
        "description",
        "attractions",
        "highlights",
        "thingsToDo",
        "howToReach",
        "packages",
        "stays",
        "displayOrder"
    ];

    for (const field of editableFields) {
        if (override[field] !== undefined) {
            place[field] = override[field];
        }
    }

    place._isPublished = override.isPublished !== false;
}

function createRegionCard(regionKey, region) {
    const card = document.createElement("a");
    card.className = "dh-region-card";
    card.id = `card-${regionKey}`;
    card.href = `destination-region.html?region=${encodeURIComponent(regionKey)}`;

    const background = document.createElement("div");
    background.className = "dh-region-card-bg";

    const content = document.createElement("div");
    content.className = "dh-region-card-content";

    const textContainer = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = region.title || regionKey;

    const subtitle = document.createElement("div");
    subtitle.className = "card-subtitle";
    subtitle.textContent = region.subtitle || "";

    textContainer.append(title, subtitle);

    const arrow = document.createElement("div");
    arrow.className = "card-arrow";

    const arrowText = document.createElement("span");
    arrowText.setAttribute("aria-hidden", "true");
    arrowText.textContent = "→";
    arrow.append(arrowText);

    content.append(textContainer, arrow);
    card.append(background, content);

    return card;
}

function updateDestinationHubCards(data) {
    const grid = document.getElementById("regions-grid");
    if (!grid) return;

    const existingCards = Array.from(
        grid.querySelectorAll(".dh-region-card")
    );

    for (const card of existingCards) {
        const regionKey = card.id.startsWith("card-")
            ? card.id.slice("card-".length)
            : "";

        const region = data[regionKey];

        if (!region || region._isPublished === false) {
            card.hidden = true;
        }
    }

    const regions = Object.entries(data)
        .map(([key, region], index) => ({
            key,
            region,
            _sourceOrder: index,
            displayOrder: region.displayOrder
        }))
        .filter(item => item.region._isPublished !== false)
        .sort(compareDisplayOrder);

    for (const item of regions) {
        const { key, region } = item;
        let card = document.getElementById(`card-${key}`);

        if (!card) {
            card = createRegionCard(key, region);
        }

        card.hidden = false;
        card.href = `destination-region.html?region=${encodeURIComponent(key)}`;

        const background = card.querySelector(".dh-region-card-bg");
        const title = card.querySelector(".dh-region-card-content h3");
        const subtitle = card.querySelector(".card-subtitle");

        if (background) {
            const image = region.heroImage || "";
            background.style.backgroundImage = image
                ? `url("${image.replace(/"/g, '\\"')}")`
                : "";
        }

        if (title) title.textContent = region.title || key;
        if (subtitle) subtitle.textContent = region.subtitle || "";

        // Append in managed order; appending an existing element moves it.
        grid.append(card);
    }
}

async function loadDestinationOverrides() {
    if (!isFirebaseConfigured || !db) {
        console.warn(
            "CallingHills destination overrides: Firebase is not configured."
        );
        return;
    }

    const data = window.destinationsData;

    if (!data || typeof data !== "object") {
        console.warn(
            "CallingHills destination overrides: destinationsData.js was not loaded."
        );
        return;
    }

    try {
        // Keep all public queries compatible with rules requiring published == true.
        const publishedQuery = name =>
            getDocs(
                query(
                    collection(db, name),
                    where("published", "==", true)
                )
            );

        const [
            regionsSnapshot,
            placesSnapshot,
            regionOverridesSnapshot,
            placeOverridesSnapshot
        ] = await Promise.all([
            publishedQuery("regions"),
            publishedQuery("places"),
            publishedQuery("regionOverrides"),
            publishedQuery("placeOverrides")
        ]);

        // Add newly created published regions without replacing original regions.
        regionsSnapshot.forEach(snapshot => {
            const record = snapshot.data();
            const slug = String(record.slug || "").trim();

            if (!slug || data[slug]) return;

            data[slug] = {
                title: record.name || slug,
                subtitle: record.subtitle || "",
                description: record.description || "",
                regionDescription: record.description || "",
                heroImage: record.heroImage || "",
                location: record.location || "",
                places: [],
                displayOrder: getOrder(record.displayOrder),
                _isPublished: true
            };
        });

        // Add newly created published places to their parent region.
        placesSnapshot.forEach(snapshot => {
            const record = snapshot.data();
            const regionKey = String(record.regionSlug || "").trim();
            const slug = String(record.slug || "").trim();
            const region = data[regionKey];

            if (!region || !slug) return;

            if (!Array.isArray(region.places)) {
                region.places = [];
            }

            const alreadyExists = region.places.some(
                place => place.slug === slug
            );

            if (!alreadyExists) {
                region.places.push(
                    makePlace(record, region.places.length)
                );
            }
        });

        // Apply saved edits to original destination regions.
        regionOverridesSnapshot.forEach(snapshot => {
            const override = snapshot.data();
            const regionKey = override.baseKey || snapshot.id;
            const region = data[regionKey];

            if (region) {
                applyRegionOverride(region, override);
            }
        });

        // Apply saved edits to original places.
        placeOverridesSnapshot.forEach(snapshot => {
            const override = snapshot.data();
            const baseKey = override.baseKey || snapshot.id;
            const separator = baseKey.indexOf("--");

            if (separator < 0) return;

            const regionKey = baseKey.slice(0, separator);
            const originalSlug = baseKey.slice(separator + 2);
            const region = data[regionKey];

            if (region) {
                applyPlaceOverride(region, originalSlug, override);
            }
        });

        // Hide unpublished places and apply their display order.
        Object.values(data).forEach(region => {
            if (!Array.isArray(region.places)) {
                region.places = [];
            }

            region.places.forEach((place, index) => {
                if (place._sourceOrder === undefined) {
                    place._sourceOrder = index;
                }

                if (place.displayOrder === undefined) {
                    place.displayOrder = 0;
                }
            });

            region.places = region.places
                .filter(place => place._isPublished !== false)
                .sort(compareDisplayOrder);
        });

        updateDestinationHubCards(data);

        // destinationPage.js can listen for this after we wire its refresh handler.
        window.dispatchEvent(
            new CustomEvent("callinghills:destinations-updated")
        );

        console.info("CallingHills destination data loaded from Firebase.");
    } catch (error) {
        console.error(
            "Could not load CallingHills destination overrides:",
            error
        );
    }
}

loadDestinationOverrides();