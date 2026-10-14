import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { db, isFirebaseConfigured } from "./firebase.js";

const grid = document.querySelector(".blog-grid");

if (grid && isFirebaseConfigured) {
  loadPublicBlogs();
}

function normaliseBlogSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBlogDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? `${text}T12:00:00`
      : text,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatBlogDate(value) {
  const date = parseBlogDate(value);

  return date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "";
}

function setText(element, value) {
  if (element && value != null) {
    element.textContent = String(value);
  }
}

function updateExistingCard(card, blog) {
  const title = blog.title || blog.name;

  setText(card.querySelector(".blog-title"), title);
  setText(card.querySelector(".blog-category"), blog.category);
  setText(card.querySelector(".blog-excerpt"), blog.excerpt);

  const dateText = formatBlogDate(blog.publicationDate);
  if (dateText) {
    setText(card.querySelector(".blog-date"), dateText);
  }

  const image = card.querySelector(".blog-img-wrapper img");

  if (image && blog.image) {
    image.setAttribute("src", blog.image);
    image.setAttribute("alt", title || "Blog story");
  }

  const date = parseBlogDate(blog.publicationDate);

  if (date) {
    card.dataset.blogDate = date.toISOString();
  }

  card.dataset.blogSlug = blog.slug || normaliseBlogSlug(title);
}

function createBlogCard(blog) {
  const card = document.createElement("article");
  card.className = "blog-card";
  card.dataset.blogSlug =
    blog.slug || normaliseBlogSlug(blog.title || blog.name);

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "blog-img-wrapper";

  if (blog.category) {
    const category = document.createElement("div");
    category.className = "blog-category";
    category.textContent = blog.category;
    imageWrapper.append(category);
  }

  const image = document.createElement("img");
  image.src = blog.image || "./dest-darjeeling.png";
  image.alt = blog.title || blog.name || "Travel story";
  image.loading = "lazy";
  imageWrapper.append(image);

  const content = document.createElement("div");
  content.className = "blog-content";

  const date = document.createElement("div");
  date.className = "blog-date";
  date.textContent = formatBlogDate(blog.publicationDate);

  const title = document.createElement("h2");
  title.className = "blog-title";
  title.textContent = blog.title || blog.name || "Untitled story";

  const excerpt = document.createElement("p");
  excerpt.className = "blog-excerpt";
  excerpt.textContent = blog.excerpt || "";

  const link = document.createElement("a");
  link.className = "blog-read-more";
  link.href = "#";
  link.textContent = "READ STORY →";

  content.append(date, title, excerpt, link);
  card.append(imageWrapper, content);

  const parsedDate = parseBlogDate(blog.publicationDate);
  if (parsedDate) {
    card.dataset.blogDate = parsedDate.toISOString();
  }

  return card;
}

async function loadPublicBlogs() {
  try {
    // Only request published documents, as required by Firestore rules.
    const publishedQuery = query(
      collection(db, "blog"),
      where("published", "==", true),
    );

    const snapshot = await getDocs(publishedQuery);

    const firebaseBlogs = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    // Existing HTML articles are matched to their saved Firebase overrides.
    const overrides = new Map(
      firebaseBlogs
        .filter((blog) => blog.source === "html")
        .map((blog) => [
          blog.slug || normaliseBlogSlug(blog.title || blog.name),
          blog,
        ]),
    );

    const handledSlugs = new Set();

    Array.from(grid.querySelectorAll(".blog-card")).forEach((card) => {
      const originalTitle =
        card.querySelector(".blog-title")?.textContent.trim() || "";

      const slug = normaliseBlogSlug(originalTitle);
      const override = overrides.get(slug);

      if (!override) {
        const date = parseBlogDate(
          card.querySelector(".blog-date")?.textContent,
        );

        if (date) card.dataset.blogDate = date.toISOString();

        card.dataset.blogSlug = slug;
        return;
      }

      handledSlugs.add(slug);

      // Preserve the existing HTML card but hide it when unpublished.
      if (override.isPublished === false) {
        card.remove();
        return;
      }

      updateExistingCard(card, override);
    });

    // Add new Firebase stories that do not correspond to original HTML cards.
    const newBlogs = firebaseBlogs
      .filter((blog) => blog.source !== "html")
      .filter((blog) => {
        const slug =
          blog.slug || normaliseBlogSlug(blog.title || blog.name);

        return !handledSlugs.has(slug);
      })
      .sort((a, b) => {
        const dateA = parseBlogDate(a.publicationDate)?.getTime() || 0;
        const dateB = parseBlogDate(b.publicationDate)?.getTime() || 0;

        return dateB - dateA;
      });

    newBlogs.forEach((blog) => {
      grid.append(createBlogCard(blog));
    });

    // Keep the latest dated articles first.
    const cards = Array.from(grid.querySelectorAll(".blog-card"));

    cards.sort((a, b) => {
      const dateA =
        Date.parse(a.dataset.blogDate || "") || 0;
      const dateB =
        Date.parse(b.dataset.blogDate || "") || 0;

      return dateB - dateA;
    });

    cards.forEach((card) => grid.append(card));

    console.info("CallingHills blog content loaded from Firebase.");
  } catch (error) {
    console.error(
      "Could not load CallingHills blog content from Firebase:",
      error,
    );
  }
}