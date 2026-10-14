import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { db, isFirebaseConfigured } from "./firebase.js";

const bannerElement = document.getElementById("custom-tour-banner");

if (bannerElement && isFirebaseConfigured) {
  loadHomepageBanner();
}

async function loadHomepageBanner() {
  try {
    const bannerRef = doc(db, "homeBanner", "custom-tour-banner");
    const bannerSnapshot = await getDoc(bannerRef);

    // Keep the original HTML content if no saved banner exists.
    if (!bannerSnapshot.exists()) return;

    const data = bannerSnapshot.data();

    // The document stays publicly readable, while this flag controls visibility.
    if (data.isPublished === false) {
      bannerElement.hidden = true;
      return;
    }

    const read = (...keys) => {
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          return data[key] == null ? "" : String(data[key]);
        }
      }
      return undefined;
    };

    const setText = (selector, value) => {
      const element = bannerElement.querySelector(selector);
      if (element && value !== undefined) {
        element.textContent = value;
      }
    };

    // Badges and heading
    setText(".ctb-live-text", read("liveBadge"));
    setText(".ctb-season-badge span", read("seasonBadge"));
    setText(".ctb-cursive", read("tagline"));
    setText(".ctb-title", read("title", "mainHeadline"));

    // Description: preserve the bold highlighted phrase.
    const before = read("descriptionBefore");
    const highlight = read("descriptionHighlight");
    const after = read("descriptionAfter");
    const description = bannerElement.querySelector(".ctb-desc");

    if (
      description &&
      before !== undefined &&
      highlight !== undefined &&
      after !== undefined
    ) {
      const strong = document.createElement("strong");
      strong.textContent = highlight;

      description.replaceChildren(
        document.createTextNode(before + " "),
        strong,
        document.createTextNode(" " + after)
      );
    }

    // Four feature cards. Support the common feature/perk field names.
    const featureCards = bannerElement.querySelectorAll(".ctb-perk-item");

    featureCards.forEach((card, index) => {
      const number = index + 1;

      const icon = read(
        `feature${number}Icon`,
        `perk${number}Icon`
      );

      const title = read(
        `feature${number}Title`,
        `perk${number}Title`
      );

      const descriptionText = read(
        `feature${number}Description`,
        `feature${number}Desc`,
        `perk${number}Description`,
        `perk${number}Desc`
      );

      const iconElement = card.querySelector(".ctb-perk-icon");
      const titleElement = card.querySelector(".ctb-perk-text strong");
      const descriptionElement = card.querySelector(".ctb-perk-text span");

      if (iconElement && icon !== undefined) iconElement.textContent = icon;
      if (titleElement && title !== undefined) titleElement.textContent = title;
      if (descriptionElement && descriptionText !== undefined) {
        descriptionElement.textContent = descriptionText;
      }
    });

    // Popular circuits and their enquiry prompts.
    setText(".ctb-chips-label", read("circuitsLabel"));

    const routeButtons = bannerElement.querySelectorAll(".ctb-chip");

    routeButtons.forEach((button, index) => {
      const number = index + 1;

      const label = read(
        `route${number}Label`,
        `route${number}Text`,
        `circuit${number}Label`,
        `circuit${number}Text`
      );

      const prompt = read(
        `route${number}Prompt`,
        `circuit${number}Prompt`
      );

      if (label !== undefined) button.textContent = label;

      if (prompt !== undefined) {
        button.removeAttribute("onclick");
        button.onclick = () => {
          if (typeof window.openCustomTrip === "function") {
            window.openCustomTrip(prompt);
          }
        };
      }
    });

    // Main call-to-action button.
    const primaryButton = bannerElement.querySelector(".ctb-primary-btn");
    const primaryText = read(
      "primaryButtonText",
      "primaryButtonLabel",
      "mainButtonText",
      "mainButtonLabel"
    );
    const primaryPrompt = read(
      "primaryButtonPrompt",
      "mainButtonPrompt",
      "customTourPrompt"
    );

    if (primaryButton) {
      const labelElement = primaryButton.querySelector("span");

      if (labelElement && primaryText !== undefined) {
        labelElement.textContent = primaryText;
      }

      if (primaryPrompt !== undefined) {
        primaryButton.removeAttribute("onclick");
        primaryButton.onclick = () => {
          if (typeof window.openCustomTrip === "function") {
            window.openCustomTrip(primaryPrompt);
          }
        };
      }
    }

    // WhatsApp button.
    const whatsappButton = bannerElement.querySelector(".ctb-whatsapp-btn");
    const whatsappText = read("whatsappButtonText", "whatsappText");
    const whatsappUrl = read("whatsappUrl", "whatsappButtonUrl");

    if (whatsappButton) {
      const labelElement = whatsappButton.querySelector("span");
      if (labelElement && whatsappText !== undefined) {
        labelElement.textContent = whatsappText;
      }
      if (whatsappUrl !== undefined) {
        whatsappButton.href = whatsappUrl;
      }
    }

    // Browse packages link.
    const browseLink = bannerElement.querySelector(".ctb-browse-link");
    const browseText = read("browsePackagesText", "browseText");
    const browseUrl = read("browsePackagesUrl", "browseUrl");

    if (browseLink) {
      if (browseText !== undefined) browseLink.textContent = browseText;
      if (browseUrl !== undefined) browseLink.href = browseUrl;
    }

    // Three trust notes, leaving their existing layout intact.
    const trustNotes = bannerElement.querySelectorAll(".ctb-trust-note > span:not(.ctb-dot-sep)");
    const trustValues = [
      read("trustNote1", "trust1"),
      read("trustNote2", "trust2"),
      read("trustNote3", "trust3")
    ];

    trustNotes.forEach((element, index) => {
      if (trustValues[index] !== undefined) {
        element.textContent = trustValues[index];
      }
    });

    console.info("CallingHills homepage banner loaded from Firebase.");
  } catch (error) {
    console.error("Could not load the homepage banner from Firebase:", error);
  }
}