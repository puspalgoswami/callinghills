# Calling Hills — Content Update Batch #1
**Prepared:** 18 Aug 2026
**For:** Coding agent (VS Code) — Calling Hills 2 (React/Vite modern stack), unless confirmed otherwise
**Status:** Planning complete. Location content NOT yet written into site — this file is the spec/index for the agent to implement against.

---

## 0. What this batch covers

1. New **district/sub-destination content** for 8 regions, sourced from 8 client PDFs (229 locations total)
2. Special handling for **Sandakphu region** — same location data must appear twice: once inside the Darjeeling district destination page, and again as its own standalone Sandakphu Trekking page/section
3. New **Hotels page** — Darjeeling hotels (9 confirmed, images pending)

---

## 1. Source PDFs — inventory

| PDF File | District/Region | Pages | Unique Locations Extracted |
|---|---|---|---|
| `Darjeeling_DIST_WEBSITE.pdf` | Darjeeling district | 132 | 35 |
| `sandakphu_reg_WEB.pdf` | Sandakphu / Singalila trekking belt (part of Darjeeling district) | 100 | 29 |
| `kalimpong_WEBSITE_INFO.pdf` | Kalimpong district | 218 | 37 |
| `DOOARS_WEB_INFO.pdf` | Dooars region | 178 | 29 |
| `EAST_SIKKIM_FINAL.pdf` | East Sikkim | 115 | 25 |
| `WEST_SIKKIM.pdf` | West Sikkim | 134 | 25 |
| `NORTH_SIKKIM.pdf` | North Sikkim | 119 | 24 |
| `SOUTH_SIKKIM.pdf` | South Sikkim | 140 | 25 |

**Total: 229 individual location writeups** (each includes: intro, "at a Glance" quick-facts box, geography/climate, biodiversity, culture, major attractions, experiences, nearby destinations, a "why visit" close, and a ~15-question FAQ block).

Each PDF is already on disk at `/mnt/user-data/uploads/`. Plain-text extractions are also available (used to build the index below) — the agent should re-extract per-location content directly from the PDFs when writing actual page copy, since this file only indexes *where things go*, not the full copy.

---

## 2. Content architecture decision (confirmed with client)

- **District/region pages** (Destinations section) get the general write-ups for every location in their PDF.
- **Sandakphu region is a special case**: its 29 locations belong to Darjeeling district geographically, but because Sandakphu is also a flagship **trek product**, the same location set is duplicated onto a dedicated **Sandakphu Trekking page** (matches the existing "Sandakphu–Phalut Trek" card already live on the homepage under Himalayan Treks).
- **Hotels get their own new page** (`hotels.html` / `/hotels` route) — booking-card style, grouped by district, image galleries with 4–5 photos per hotel (placeholders until client sends photos).

### Recommended page/route structure

```
/destinations
  /destinations/darjeeling        → 35 locations (Darjeeling_DIST_WEBSITE.pdf)
  /destinations/kalimpong         → 37 locations (kalimpong_WEBSITE_INFO.pdf)
  /destinations/dooars            → 29 locations (DOOARS_WEB_INFO.pdf)
  /destinations/sikkim/east       → 25 locations (EAST_SIKKIM_FINAL.pdf)
  /destinations/sikkim/west       → 25 locations (WEST_SIKKIM.pdf)
  /destinations/sikkim/north      → 24 locations (NORTH_SIKKIM.pdf)
  /destinations/sikkim/south      → 25 locations (SOUTH_SIKKIM.pdf)

/treks/sandakphu                  → 29 locations (sandakphu_reg_WEB.pdf) — duplicated content, trek-framed

/hotels                           → NEW page
  /hotels/darjeeling              → 9 hotels (this batch)
```

Each location entry should follow the PDF's consistent internal structure, which maps cleanly to reusable components:
- `HeroIntro` (name + 1-line tagline + intro paragraph)
- `AtAGlanceBox` (altitude, district, region, best time, famous-for — key:value pairs)
- `GeographyClimate` (prose)
- `BiodiversityWildlife` (flora/fauna bullet lists)
- `CultureLocalLife` (prose)
- `MajorAttractions` (bullet list)
- `Experiences` (bullet list / tag chips)
- `NearbyDestinations` (bullet list — could auto-link to other location pages in the same PDF)
- `WhyVisit` (closing prose)
- `FAQAccordion` (~15 Q&As)

Since this structure repeats identically across all 229 locations, the agent should build **one reusable `DestinationDetail` component/template** driven by a data file (JSON/MD frontmatter) per location, rather than hand-coding 229 pages.

---

## 3. Full location index (by district → target page)

### Darjeeling district → `/destinations/darjeeling`
Bara Mangwa, Bijanbari, Chatakpur, Chimney Village, Chota Mangwa, Darjeeling (town), Dawaipani, Dudhia, Ghoom, Jogighat, Kurseong, Lamahatta, Latpanchar, Lebong, Lepchajagat, Mim Tea Garden, Mineral Spring, Mirik, Mungpoo, Rampuria, Rangaroon, Rangli Rangliot, Rishihaat, Rohini, Senchal Wildlife Sanctuary, Shivakhola, Siksin, Sittong, Sonada, Sukhiapokhri, Tabakoshi, Takdah, Tinchuley, Triveni *(35 total — one extra generic "Destination" heading in source, verify against PDF)*

### Sandakphu Trekking Region → `/treks/sandakphu` (ALSO cross-linked from Darjeeling district page)
Singalila National Park, Sandakphu, Phalut, Manebhanjan, Tonglu, Tumling, Kalipokhri, Dhotrey, Chitrey, Meghma, Gairibas, Kaiyakatta, Bikhebhanjang, Sabarkum, Gurdum, Srikhola, Ramam, Rimbik, Gorkhey, Samanden, Rangeet Majuwa, Palmajua, Lodhoma, Chewabhanjang, Sepi, Timburey, Bhareng, Uttarey, Jawbari *(29 total)*

### Kalimpong district → `/destinations/kalimpong`
Kalimpong (town), Lava, Loleygaon, Rishop, Kolakham, Pedong, Algarah, Icchegaon, Sillery Gaon, Ramdhura, Kaffergaon, Santook, Mairung Gaon, Fikkalay Gaon, Mulkharka, Sangsey, Charkhole, Lingsey, Sherpa Gaon, Pabong, Kagey, Rikisum, Samthar, Yangmakum, Munsong, Chibo, Relli, Sakiyong, Kashyong, Jhandi, Bidyang, Yelbong, Kharka Gaon, Rongo Valley, Duka Valley, Chuikhim, Nimbong, Reshikhola, Deolo Hill *(37 total)*

### Dooars region → `/destinations/dooars`
Jaldapara National Park, Gorumara National Park, Buxa Tiger Reserve, Jayanti, Chilapata Forest, Lataguri, Murti, Samsing, Suntalekhola, Rocky Island, Bindu, Jhalong, Chapramari Wildlife Sanctuary, Rajabhatkhawa, Buxa Fort, Mahakal Cave, Lepchakha, South Khayerbari Leopard Rescue Centre, Totopara, Cooch Behar Palace, Raimatang, Rasikbil, Phuentsholing (Bhutan Border), Paren, Gajoldoba, Hollong Tourist Lodge, Khunia Watch Tower, Medla Watch Tower, Chandrachur Watch Tower *(29 total)*

### East Sikkim → `/destinations/sikkim/east`
Gangtok, Tsomgo (Changu) Lake, Nathula Pass, Baba Harbhajan Singh Mandir, Zuluk, Gnathang Valley (Nathang), Aritar, Rolep, Rongli, Kupup, Padamchen, Lungthung, Thambi View Point, Old Silk Route, Lampokhari Lake, Mankhim, Lingtham, Reshikhola, Pakyong, Rorathang, Assam Lingzey, Kabi Lungchok, Yakten, Zeropoint, Sumin *(25 total)*

### North Sikkim → `/destinations/sikkim/north`
Lachung, Lachen, Yumthang Valley, Zero Point (Yumesamdong), Gurudongmar Lake, Thangu, Chopta Valley, Kala Patthar, Chungthang, Dzongu, Mangan, Singhik, Seven Sisters Waterfall, Shingba Rhododendron Sanctuary, Phensang, Tingvong, Passingdang, Ringhim, Hee Gyathang, Pentong, Khangchendzonga National Park, Toong, Sipgyer, Rakdong, Lingdem *(24 total)*

### South Sikkim → `/destinations/sikkim/south`
Ravangla, Namchi, Temi Tea Garden, Borong, Ralang, Kewzing, Chalamthang, Maenam Hill, Samdruptse, Siddhesvara Dham (Char Dham), Tarey Bhir, Yangang, Namthang, Tendong Hill, Jorethang, Kitam Bird Sanctuary, Damthang, Sikip, Tarku, Barfung, Assangthang, Zoom, Mamley, Poklok, Payong *(25 total)*

### West Sikkim → `/destinations/sikkim/west`
Pelling, Yuksom, Geyzing (Gyalshing), Khecheopalri Lake, Pemayangtse Monastery, Rabdentse Ruins, Kanchenjunga Falls, Rinchenpong, Uttarey, Kaluk, Hee Bermiok, Dentam, Okhrey, Darap, Singshore Bridge, Rimbi, Sewaro Rock Garden, Sombaria, Chayatal, Daramdin, Biksthang, Martam, Yangsum, Kongri, Labdang *(25 total)*

> Note: **Uttarey** appears in both the West Sikkim PDF and the Sandakphu region PDF (it sits near the West Bengal–Sikkim border and is a gateway to both). Agent should treat these as two distinct pages with a cross-link, not a duplicate/conflict.

---

## 4. Hotels — Darjeeling (new `/hotels` page)

Booking-card layout, grouped by district. **Client will provide 4–5 photos per hotel directly — build gallery components with placeholder slots now, swap in real images later, no code changes needed then.**

| # | Starting Price (per person) | Meal Plan | Room Feature | Distance to Mall Road |
|---|---|---|---|---|
| Darjeeling Hotel 1 🍁 | ₹1399/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 2 min walk |
| Darjeeling Hotel 2 | ₹1499/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 5–6 min walk |
| Darjeeling Hotel 3 | ₹1599/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 3–4 min walk |
| Darjeeling Hotel 4 | ₹1299/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 6–7 min walk |
| Darjeeling Hotel 5 | ₹1399/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 3–4 min walk |
| Darjeeling Hotel 6 | ₹2299/- | Breakfast + Lunch/Dinner | *Kanchanjunga View Room Available | 2 min walk |
| Darjeeling Hotel 7 | ₹1299/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 3 min walk |
| Darjeeling Hotel 8 | ₹2999/- | Breakfast + Lunch/Dinner | *Kanchanjunga View Room Available | 3 min walk |
| Darjeeling Hotel 9 | ₹1299/- | Breakfast + Lunch/Dinner | Kanchanjunga View Room Available | 3–4 min walk |

**Still needed from client:** actual hotel names (currently placeholder "Darjeeling Hotel 1–9"), 4–5 photos each, and confirmation on the `*` (hotels 6 & 8) — flagged differently in the client note, possibly meaning "premium/select rooms only," to confirm before publishing.

Card fields per hotel: name, image gallery (4–5), starting price, meal plan, room feature, walking distance to Mall Road, "Enquire Now" / "Add to Trip List" CTA (reuse existing trip-list cart component already on site).

---

## 5. Open items / pending from client

- [ ] Confirm actual hotel names for Darjeeling Hotels 1–9 (currently numbered placeholders)
- [ ] Hotel photos (4–5 per hotel) — to be sent directly, build with placeholder slots
- [ ] Clarify `*` marking on Hotel 6 & Hotel 8 room availability
- [ ] Confirm whether Kalimpong/Dooars/Sikkim regions will also get hotel sections later (same page pattern can extend)
- [ ] Confirm target codebase: this spec assumes **Calling Hills 2** (React/Vite/TS) — flag if v1 static site is the actual target

---

## 6. Next step

Agent should pull full copy for each of the 229 locations directly from the source PDFs at `/mnt/user-data/uploads/`, using the "at a Glance" heading as the per-location anchor (confirmed consistent across all 8 files), and populate the `DestinationDetail` template per the field breakdown in Section 2.
