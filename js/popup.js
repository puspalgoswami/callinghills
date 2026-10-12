function openRegionPopup(regionKey) {
    const data = window.destinationsData[regionKey];
    if (!data) return;

    const popup = document.getElementById('region-popup');
    const overlay = document.getElementById('region-popup-overlay');
    const title = document.getElementById('region-popup-title');
    const desc = document.getElementById('region-popup-desc');
    const sidebar = document.getElementById('region-popup-sidebar');
    const body = document.getElementById('region-popup-body');

    // Set Header
    title.innerText = data.title;
    desc.innerText = data.description;

    // Clear previous
    sidebar.innerHTML = '';
    body.innerHTML = '';

    // Populate content
    data.places.forEach((place, index) => {
        // Sidebar link
        const link = document.createElement('a');
        link.href = `#place-${index}`;
        link.className = 'region-sidebar-link';
        link.innerText = place.name;
        link.onclick = (e) => {
            e.preventDefault();
            const target = document.getElementById(`place-${index}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                document.querySelectorAll('.region-sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        };
        if (index === 0) link.classList.add('active');
        sidebar.appendChild(link);

        // Body Content
        const placeDiv = document.createElement('div');
        placeDiv.className = 'region-place-item';
        placeDiv.id = `place-${index}`;

        let attractionsHTML = '';
        if (place.attractions && place.attractions.length > 0) {
            attractionsHTML = `
                <div class="place-attractions">
                    <strong>Major Attractions:</strong>
                    <ul>
                        ${place.attractions.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        placeDiv.innerHTML = `
            <h3>${place.name}</h3>
            <p class="place-tagline"><em>${place.tagline}</em></p>
            <div class="place-meta">
                <span class="meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg> <strong>Altitude:</strong> ${place.altitude}</span>
                <span class="meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> <strong>Best Time:</strong> ${place.bestTime}</span>
                <span class="meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> <strong>Famous For:</strong> ${place.famousFor}</span>
            </div>
            <p class="place-desc">${place.description}</p>
            ${attractionsHTML}
        `;
        body.appendChild(placeDiv);
    });

    // Show popup
    overlay.classList.add('show');
    popup.classList.add('show');

    // Setup scroll spy for sidebar
    body.onscroll = () => {
        let currentActive = null;
        const placeItems = document.querySelectorAll('.region-place-item');
        placeItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            // If top of element is within the top half of the body container
            if (rect.top <= body.getBoundingClientRect().top + 100) {
                currentActive = index;
            }
        });
        
        if (currentActive !== null) {
            document.querySelectorAll('.region-sidebar-link').forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelectorAll('.region-sidebar-link')[currentActive];
            if (activeLink) activeLink.classList.add('active');
        }
    };
}

function closeRegionPopup() {
    const popup = document.getElementById('region-popup');
    const overlay = document.getElementById('region-popup-overlay');
    popup.classList.remove('show');
    overlay.classList.remove('show');
}
