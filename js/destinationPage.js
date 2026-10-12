/* ═══════════════════════════════════════════════════════════
   CallingHills — Destination Page Logic
   Handles routing and rendering for Level 2 (Region) & Level 3 (Location Detail)
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── URL Param Helpers ───
    function getParam(key) {
        return new URLSearchParams(window.location.search).get(key);
    }
    function setParams(params) {
        const url = new URL(window.location);
        Object.entries(params).forEach(([k, v]) => {
            if (v === null || v === undefined) url.searchParams.delete(k);
            else url.searchParams.set(k, v);
        });
        window.history.pushState({}, '', url);
    }

    // ─── SVG Icons Library ───
    const icons = {
        hiking: '<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>',
        camera: '<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
        binoculars: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="15" y2="14"/></svg>',
        food: '<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        tea: '<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>',
        village: '<svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>',
        temple: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7h20L12 2z"/><rect x="4" y="10" width="16" height="10"/><path d="M8 22V14h8v8"/><line x1="12" y1="10" x2="12" y2="14"/></svg>',
        train: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="19" r="2"/><circle cx="16" cy="19" r="2"/></svg>',
        safari: '<svg viewBox="0 0 24 24"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>',
        shopping: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
        mountain: '<svg viewBox="0 0 24 24"><path d="M8 21l4-10 4 10"/><path d="M2 21l5-7 3 3"/><path d="M22 21l-5-7-3 3"/></svg>',
        road: '<svg viewBox="0 0 24 24"><path d="M4 19L8 5"/><path d="M20 19L16 5"/><line x1="12" y1="5" x2="12" y2="7"/><line x1="12" y1="11" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="19"/></svg>',
        forest: '<svg viewBox="0 0 24 24"><path d="M12 2L7 10h10L12 2z"/><path d="M12 8L5 18h14L12 8z"/><rect x="10" y="18" width="4" height="4"/></svg>',
        arrow: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        arrowLeft: '<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        pin: '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
        altimeter: '<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>',
        calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        star: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
        plane: '<svg viewBox="0 0 24 24"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.2l5.6 4-2 2.5-2.8-.5c-.3-.1-.6 0-.8.2l-.3.3c-.2.3-.1.7.1.9l2.8 2.1 2.1 2.8c.2.3.6.4.9.1l.3-.3c.2-.2.3-.5.2-.8l-.5-2.8 2.5-2 4 5.6c.3.4.8.5 1.2.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>',
        trainTransport: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><circle cx="8" cy="19" r="2"/><circle cx="16" cy="19" r="2"/></svg>',
        car: '<svg viewBox="0 0 24 24"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
        share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
        heart: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
        chevDown: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>'
    };

    function getIcon(name) {
        return icons[name] || icons.binoculars;
    }

    // ─── Gallery Image Helper ───
    function getGalleryImage(index) {
        const num = ((index - 1) % 24) + 1;
        return `images/gallery (${num}).jpg`;
    }

    // ─── Initialize Page ───
    function init() {
        const regionKey = getParam('region');
        const subKey = getParam('sub');
        const placeSlug = getParam('place');

        if (!regionKey) {
            window.location.href = 'destinations.html';
            return;
        }

        const regionData = window.destinationsData[regionKey];
        if (!regionData) {
            window.location.href = 'destinations.html';
            return;
        }

        const mainContent = document.getElementById('dest-main-content');
        if (!mainContent) return;

        if (placeSlug) {
            // Level 3: Location Detail
            const place = regionData.places.find(p => p.slug === placeSlug);
            if (place) {
                renderLocationDetail(mainContent, regionData, regionKey, place, subKey);
            } else {
                renderRegionPage(mainContent, regionData, regionKey, subKey);
            }
        } else if (regionData.hasSubRegions && !subKey) {
            // Sikkim main — show sub-region chooser
            renderRegionWithSubRegions(mainContent, regionData, regionKey);
        } else if (regionData.hasSubRegions && subKey) {
            // Sikkim sub-region — filter places by subRegion
            renderRegionPage(mainContent, regionData, regionKey, subKey);
        } else {
            // Level 2: Region page
            renderRegionPage(mainContent, regionData, regionKey, null);
        }
    }

    // ═══════════════════════════════════════════
    // LEVEL 2 — REGION PAGE
    // ═══════════════════════════════════════════
    function renderRegionPage(container, regionData, regionKey, subKey) {
        const places = subKey
            ? regionData.places.filter(p => p.subRegion === subKey)
            : regionData.places;

        const subRegionData = subKey && regionData.subRegions
            ? regionData.subRegions.find(s => s.key === subKey)
            : null;

        const title = subRegionData ? subRegionData.title : regionData.title;
        const subtitle = subRegionData ? subRegionData.subtitle : regionData.subtitle;
        const desc = regionData.regionDescription || regionData.description;

        // Breadcrumb
        let breadcrumbHTML = `
            <nav class="dest-breadcrumb">
                <a href="index.html">Home</a>
                <span class="bc-sep">›</span>
                <a href="destinations.html">Destinations</a>
                <span class="bc-sep">›</span>`;
        if (subKey) {
            breadcrumbHTML += `
                <a href="destination-region.html?region=${regionKey}">${regionData.title}</a>
                <span class="bc-sep">›</span>
                <span class="bc-current">${title}</span>`;
        } else {
            breadcrumbHTML += `<span class="bc-current">${title}</span>`;
        }
        breadcrumbHTML += `</nav>`;

        // Build HTML
        container.innerHTML = `
            ${breadcrumbHTML}
            <!-- Hero -->
            <div class="dr-hero">
                <div class="dr-hero-bg" style="background-image: url('${regionData.heroImage}')"></div>
                <div class="dr-hero-content">
                    <h1>${title}</h1>
                    <div class="dr-hero-subtitle">${subtitle}</div>
                    <p class="dr-hero-desc">${desc}</p>
                </div>
            </div>

            <!-- Places Grid -->
            <div class="dr-places">
                <h2 class="dr-places-title">Explore <span>${title}'s</span> Hidden Gems</h2>
                <div class="dr-places-grid" id="places-grid">
                    ${places.map((place, i) => `
                        <a class="dr-place-card" href="destination-region.html?region=${regionKey}${subKey ? '&sub=' + subKey : ''}&place=${place.slug}" data-index="${i}">
                            <div class="dr-place-card-img-wrapper">
                                <img class="dr-place-card-img" src="${place.image || getGalleryImage(i + 1)}" alt="${place.name}" loading="lazy" onerror="this.parentElement.classList.add('img-placeholder'); this.style.display='none';">
                            </div>
                            <div class="dr-place-card-body">
                                <h4>${place.name}</h4>
                                <div class="place-arrow">
                                    ${getIcon('arrow')}
                                </div>
                            </div>
                        </a>
                    `).join('')}
                </div>
                <div style="margin-top: 32px;">
                    ${subKey ? `
                        <a href="destination-region.html?region=${regionKey}" class="dr-back-link">
                            ${getIcon('arrowLeft')} ← Back to ${regionData.title}
                        </a>
                    ` : `
                        <a href="destinations.html" class="dr-back-link">
                            ${getIcon('arrowLeft')} ← Back to Destinations
                        </a>
                    `}
                </div>
            </div>
        `;

        // Animate cards
        animateCards();
        document.title = `${title} — CallingHills`;
    }

    // ═══════════════════════════════════════════
    // SIKKIM SUB-REGION CHOOSER
    // ═══════════════════════════════════════════
    function renderRegionWithSubRegions(container, regionData, regionKey) {
        container.innerHTML = `
            <nav class="dest-breadcrumb">
                <a href="index.html">Home</a>
                <span class="bc-sep">›</span>
                <a href="destinations.html">Destinations</a>
                <span class="bc-sep">›</span>
                <span class="bc-current">${regionData.title}</span>
            </nav>

            <!-- Hero -->
            <div class="dr-hero">
                <div class="dr-hero-bg" style="background-image: url('${regionData.heroImage}')"></div>
                <div class="dr-hero-content">
                    <h1>${regionData.title}</h1>
                    <div class="dr-hero-subtitle">${regionData.subtitle}</div>
                    <p class="dr-hero-desc">${regionData.regionDescription || regionData.description}</p>
                </div>
            </div>

            <!-- Sub Regions -->
            <div class="dr-subregions">
                <h2 class="dr-subregions-title">Explore ${regionData.title}</h2>
                <div class="dr-subregions-grid">
                    ${regionData.subRegions.map(sr => {
                        const srPlaces = regionData.places.filter(p => p.subRegion === sr.key);
                        const srImage = srPlaces.length > 0 ? (srPlaces[0].image || getGalleryImage(1)) : getGalleryImage(1);
                        return `
                        <a class="dr-subregion-card" href="destination-region.html?region=${regionKey}&sub=${sr.key}">
                            <div class="dr-subregion-card-bg" style="background-image: url('${srImage}')"></div>
                            <div class="sr-icon">${getIcon(sr.icon)}</div>
                            <h4>${sr.title}</h4>
                        </a>`;
                    }).join('')}
                </div>

                <div style="margin-top: 32px;">
                    <a href="destinations.html" class="dr-back-link">
                        ${getIcon('arrowLeft')} ← Back to Destinations
                    </a>
                </div>
            </div>
        `;

        animateCards();
        document.title = `${regionData.title} — CallingHills`;
    }

    // ═══════════════════════════════════════════
    // LEVEL 3 — LOCATION DETAIL
    // ═══════════════════════════════════════════
    function renderLocationDetail(container, regionData, regionKey, place, subKey) {
        const famousTags = (place.famousFor || '').split(',').map(t => t.trim()).slice(0, 3);

        // Breadcrumb
        let breadcrumbHTML = `
            <nav class="dest-breadcrumb">
                <a href="index.html">Home</a>
                <span class="bc-sep">›</span>
                <a href="destinations.html">Destinations</a>
                <span class="bc-sep">›</span>`;
        if (regionData.hasSubRegions && subKey) {
            breadcrumbHTML += `
                <a href="destination-region.html?region=${regionKey}">${regionData.title}</a>
                <span class="bc-sep">›</span>
                <a href="destination-region.html?region=${regionKey}&sub=${subKey}">${regionData.subRegions.find(s => s.key === subKey)?.title || subKey}</a>
                <span class="bc-sep">›</span>`;
        } else {
            breadcrumbHTML += `
                <a href="destination-region.html?region=${regionKey}">${regionData.title}</a>
                <span class="bc-sep">›</span>`;
        }
        breadcrumbHTML += `<span class="bc-current">${place.name}</span></nav>`;

        // Tab definitions
        const tabs = [
            { id: 'overview', label: 'Overview', icon: 'binoculars' },
            { id: 'things-to-do', label: 'Things to Do', icon: 'hiking' },
            { id: 'packages', label: 'Packages', icon: 'star' },
            { id: 'stays', label: 'Stay', icon: 'village' },
            { id: 'gallery', label: 'Gallery', icon: 'camera' }
        ];
        if (place.faqs && place.faqs.length > 0) {
            tabs.push({ id: 'faqs', label: 'FAQs', icon: 'food' });
        }

        container.innerHTML = `
            ${breadcrumbHTML}

            <!-- Hero -->
            <div class="dl-hero">
                <div class="dl-hero-bg" style="background-image: url('${place.image || getGalleryImage(1)}')"></div>
                <div class="dl-hero-actions">
                    <button onclick="shareLocation()" title="Share">
                        ${getIcon('share')}
                        <span>Share</span>
                    </button>
                    <button onclick="saveLocation()" title="Save">
                        ${getIcon('heart')}
                        <span>Save</span>
                    </button>
                </div>
                <div class="dl-hero-content">
                    <h1>${place.name}</h1>
                    <div class="dl-hero-location">
                        ${getIcon('pin')}
                        <span>${place.location || regionData.location}</span>
                    </div>
                    <div class="dl-hero-tags">
                        ${famousTags.map(t => `<span class="dl-hero-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="dl-tabs" id="dl-tabs">
                ${tabs.map((tab, i) => `
                    <button class="dl-tab ${i === 0 ? 'active' : ''}" data-tab="${tab.id}">
                        ${getIcon(tab.icon)}
                        ${tab.label}
                    </button>
                `).join('')}
            </div>

            <!-- Content -->
            <div class="dl-content" id="dl-content">
                ${renderOverviewTab(place, regionData)}
                ${renderThingsToDoTab(place)}
                ${renderPackagesTab(place)}
                ${renderStaysTab(place)}
                ${renderGalleryTab(place)}
                ${place.faqs ? renderFaqsTab(place) : ''}
            </div>

            <!-- Back Link -->
            <div style="padding: 0 clamp(20px, 5vw, 80px) 40px;">
                <a href="destination-region.html?region=${regionKey}${subKey ? '&sub=' + subKey : ''}" class="dr-back-link">
                    ${getIcon('arrowLeft')} ← Back to ${subKey && regionData.subRegions ? regionData.subRegions.find(s => s.key === subKey)?.title : regionData.title}
                </a>
            </div>
        `;

        // Setup tabs
        setupTabs();
        animateCards();
        document.title = `${place.name} — ${regionData.title} — CallingHills`;
    }

    // ─── Tab Content Renderers ───

    function renderOverviewTab(place, regionData) {
        const highlights = place.highlights || place.attractions || [];
        const howr = place.howToReach || {};

        return `
        <div class="dl-tab-panel active" id="tab-overview">
            <div class="dl-overview">
                <div class="dl-overview-main">
                    <h2>About ${place.name}</h2>
                    <div class="dl-description-text">${place.description}</div>

                    <!-- Info Items -->
                    <div class="dl-info-list">
                        <div class="dl-info-item">
                            <div class="info-icon">${getIcon('pin')}</div>
                            <div>
                                <div class="info-label">Location</div>
                                <div class="info-value">${place.location || regionData.location}</div>
                            </div>
                        </div>
                        <div class="dl-info-item">
                            <div class="info-icon">${getIcon('altimeter')}</div>
                            <div>
                                <div class="info-label">Altitude</div>
                                <div class="info-value">${place.altitude}</div>
                            </div>
                        </div>
                        <div class="dl-info-item">
                            <div class="info-icon">${getIcon('calendar')}</div>
                            <div>
                                <div class="info-label">Best Time to Visit</div>
                                <div class="info-value">${place.bestTime}</div>
                            </div>
                        </div>
                        <div class="dl-info-item">
                            <div class="info-icon">${getIcon('star')}</div>
                            <div>
                                <div class="info-label">Famous For</div>
                                <div class="info-value">${place.famousFor}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Highlights -->
                    ${highlights.length > 0 ? `
                    <div class="dl-highlights">
                        <h3>Highlights</h3>
                        <div class="dl-highlights-list">
                            ${highlights.map(h => `
                                <div class="dl-highlight-item">
                                    <div class="check-icon">${getIcon('check')}</div>
                                    <span>${h}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="dl-overview-side">
                    <!-- Weather Widget -->
                    <div class="dl-weather">
                        <h4>Current Weather</h4>
                        <div class="weather-temp">18°C</div>
                        <div class="weather-desc">Partly Cloudy</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #6b7c69;">
                            Humidity: 72% · Wind: 8 km/h
                        </div>
                    </div>

                    <!-- How to Reach -->
                    ${Object.keys(howr).length > 0 ? `
                    <div class="dl-reach">
                        <h4>How to Reach</h4>
                        ${howr.byAir ? `
                        <div class="dl-reach-item">
                            <div class="reach-icon">${getIcon('plane')}</div>
                            <div>
                                <div class="reach-label">By Air</div>
                                <div class="reach-value">${howr.byAir}</div>
                            </div>
                        </div>` : ''}
                        ${howr.byTrain ? `
                        <div class="dl-reach-item">
                            <div class="reach-icon">${getIcon('trainTransport')}</div>
                            <div>
                                <div class="reach-label">By Train</div>
                                <div class="reach-value">${howr.byTrain}</div>
                            </div>
                        </div>` : ''}
                        ${howr.byRoad ? `
                        <div class="dl-reach-item">
                            <div class="reach-icon">${getIcon('car')}</div>
                            <div>
                                <div class="reach-label">By Road</div>
                                <div class="reach-value">${howr.byRoad}</div>
                            </div>
                        </div>` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>`;
    }

    function renderThingsToDoTab(place) {
        const activities = place.thingsToDo || [];
        const attractions = place.attractions || [];

        return `
        <div class="dl-tab-panel" id="tab-things-to-do">
            <div class="dl-things-todo">
                <h3>Things to Do in ${place.name}</h3>
                <div class="dl-activities-grid">
                    ${activities.map(act => `
                        <div class="dl-activity-item">
                            <div class="dl-activity-icon">${getIcon(act.icon)}</div>
                            <span>${act.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${attractions.length > 0 ? `
            <div style="margin-top: 32px;">
                <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--ch-text-dark); margin-bottom: 16px;">Key Attractions</h3>
                <div class="dl-highlights-list">
                    ${attractions.map(a => `
                        <div class="dl-highlight-item">
                            <div class="check-icon">${getIcon('check')}</div>
                            <span>${a}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>`;
    }

    function renderPackagesTab(place) {
        const packages = place.packages || [];

        if (packages.length === 0) {
            return `
            <div class="dl-tab-panel" id="tab-packages">
                <div class="dl-packages-header">
                    <h2>Packages for ${place.name}</h2>
                </div>
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🏔️</div>
                    <h3 style="font-family: var(--font-heading); font-size: 20px; color: var(--ch-text-dark); margin-bottom: 8px;">Custom Packages Available</h3>
                    <p style="font-family: var(--font-body); color: #6b7c69; max-width: 400px; margin: 0 auto 24px; line-height: 1.6;">We craft personalized packages for ${place.name}. Contact us to plan your perfect trip!</p>
                    <a href="contact.html" style="display: inline-block; padding: 12px 28px; border-radius: 8px; background: var(--ch-green-deep); color: #fff; text-decoration: none; font-family: var(--font-body); font-weight: 600;">Enquire Now →</a>
                </div>
            </div>`;
        }

        return `
        <div class="dl-tab-panel" id="tab-packages">
            <div class="dl-packages-header">
                <h2>Best Packages for ${place.name}</h2>
                <a href="packages.html">View All Packages →</a>
            </div>
            <div class="dl-packages-grid">
                ${packages.map(pkg => `
                    <div class="dl-package-card">
                        <img class="dl-package-card-img" src="${pkg.image || getGalleryImage(1)}" alt="${pkg.title}" loading="lazy" onerror="this.parentElement.querySelector('.dl-package-card-img').style.display='none';">
                        <div class="dl-package-card-body">
                            <h4>${pkg.title}</h4>
                            <div class="pkg-includes">${pkg.includes}</div>
                            <div class="pkg-price">
                                <span class="price-amount">₹${pkg.price.toLocaleString('en-IN')}</span>
                                <span class="price-unit">/ per person</span>
                            </div>
                            <a href="contact.html" class="pkg-btn">View Details</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    function renderStaysTab(place) {
        const stays = place.stays || [];

        if (stays.length === 0) {
            return `
            <div class="dl-tab-panel" id="tab-stays">
                <div class="dl-stays-header">
                    <h2>Stay & Homestays in ${place.name}</h2>
                </div>
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🏡</div>
                    <h3 style="font-family: var(--font-heading); font-size: 20px; color: var(--ch-text-dark); margin-bottom: 8px;">Handpicked Stays Available</h3>
                    <p style="font-family: var(--font-body); color: #6b7c69; max-width: 400px; margin: 0 auto 24px; line-height: 1.6;">We partner with verified homestays and hotels in ${place.name}. Contact us for recommendations!</p>
                    <a href="contact.html" style="display: inline-block; padding: 12px 28px; border-radius: 8px; background: var(--ch-green-deep); color: #fff; text-decoration: none; font-family: var(--font-body); font-weight: 600;">Find Stays →</a>
                </div>
            </div>`;
        }

        return `
        <div class="dl-tab-panel" id="tab-stays">
            <div class="dl-stays-header">
                <div>
                    <h2>Stay & Homestays in ${place.name}</h2>
                    <div class="stays-sub">Handpicked stays for a comfortable experience</div>
                </div>
            </div>
            <div class="dl-stays-grid">
                ${stays.map(stay => `
                    <div class="dl-stay-card">
                        <div class="dl-stay-card-img-wrapper">
                            <img class="dl-stay-card-img" src="${stay.image || getGalleryImage(1)}" alt="${stay.name}" loading="lazy">
                            <button class="save-btn" title="Save">${getIcon('heart')}</button>
                        </div>
                        <div class="dl-stay-card-body">
                            <h4>${stay.name}</h4>
                            <div class="stay-rating">
                                <span class="stars">★★★★${stay.rating >= 4.5 ? '★' : '☆'}</span>
                                <span class="rating-num">${stay.rating}</span>
                                <span class="review-count">(${stay.reviews} reviews)</span>
                            </div>
                            <div class="stay-type-tags">
                                <span class="stay-type-tag">${stay.type}</span>
                            </div>
                            <div class="stay-price">
                                <div>
                                    <span class="price-amount">₹${stay.price.toLocaleString('en-IN')}</span>
                                    <span class="price-unit"> / night</span>
                                </div>
                                <button class="stay-view-btn" onclick="window.location.href='contact.html'">View Details</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    function renderGalleryTab(place) {
        // Generate gallery images from multiple sources
        const galleryImages = [];
        if (place.image) galleryImages.push(place.image);
        if (place.packages) place.packages.forEach(p => { if (p.image) galleryImages.push(p.image); });
        if (place.stays) place.stays.forEach(s => { if (s.image) galleryImages.push(s.image); });
        // Fill with more gallery images
        for (let i = 1; i <= 8; i++) {
            galleryImages.push(getGalleryImage(i));
        }
        // Deduplicate
        const uniqueImages = [...new Set(galleryImages)].slice(0, 12);

        return `
        <div class="dl-tab-panel" id="tab-gallery">
            <div class="dl-gallery-header">
                <h2>Gallery — ${place.name}</h2>
            </div>
            <div class="dl-gallery-grid">
                ${uniqueImages.map((img, i) => `
                    <div class="dl-gallery-item">
                        <img src="${img}" alt="${place.name} - Photo ${i + 1}" loading="lazy">
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    function renderFaqsTab(place) {
        const faqs = place.faqs || [];
        return `
        <div class="dl-tab-panel" id="tab-faqs">
            <div class="dl-faqs">
                <h2>Frequently Asked Questions — ${place.name}</h2>
                ${faqs.map((faq, i) => `
                    <div class="dl-faq-item" id="faq-${i}">
                        <button class="dl-faq-question" onclick="toggleFaq(${i})">
                            <span>Q${i + 1}. ${faq.q}</span>
                            ${getIcon('chevDown')}
                        </button>
                        <div class="dl-faq-answer">
                            <p>${faq.a}</p>
                        </div>
                    </div>
                `).join('')}

                <div class="dl-faq-contact">
                    <div>
                        <div class="faq-contact-text">Still have questions?</div>
                        <div class="faq-contact-sub">Call/WhatsApp: +91 91234 56789</div>
                    </div>
                    <a href="https://wa.me/919051966561" target="_blank">
                        ${getIcon('whatsapp')}
                        WhatsApp Us
                    </a>
                </div>
            </div>
        </div>`;
    }

    // ─── Tab Switching ───
    function setupTabs() {
        const tabs = document.querySelectorAll('.dl-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show correct panel
                document.querySelectorAll('.dl-tab-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(`tab-${tabId}`);
                if (panel) {
                    panel.classList.add('active');
                    // Smooth scroll to tabs
                    const tabBar = document.getElementById('dl-tabs');
                    if (tabBar) {
                        const tabBarTop = tabBar.getBoundingClientRect().top + window.pageYOffset - 72;
                        window.scrollTo({ top: tabBarTop, behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // ─── Animate Cards ───
    function animateCards() {
        const cards = document.querySelectorAll('.dr-place-card, .dr-subregion-card, .dl-package-card, .dl-stay-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, idx * 60);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }

    // ─── Global Functions ───
    window.toggleFaq = function (index) {
        const faqItem = document.getElementById(`faq-${index}`);
        if (faqItem) {
            faqItem.classList.toggle('open');
        }
    };

    window.shareLocation = function () {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    window.saveLocation = function () {
        alert('Location saved to your favorites!');
    };

    // ─── Browser Back/Forward ───
    window.addEventListener('popstate', init);

    // ─── Run ───
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
