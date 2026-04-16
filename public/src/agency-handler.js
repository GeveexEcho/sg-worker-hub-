let agencyData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 20;

async function init() {
    try {
        const response = await fetch('../data/updated-agency.json');
        agencyData = await response.json();
        filteredData = [...agencyData];
        
        if (document.getElementById('agencyList')) {
            renderList();
            setupSearch();
        } else if (document.getElementById('detailsContainer')) {
            renderDetails();
        }
    } catch (e) { console.error("Data load failed", e); }
}

function renderList() {
    const listDiv = document.getElementById('agencyList');
    listDiv.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredData.slice(start, start + itemsPerPage);

    paginatedItems.forEach(item => {
        const link = document.createElement('a');
        link.href = `agency-details.html?rl=${item.rlNo.replace('RL No: ', '').trim()}`;
        link.className = 'agency-item';
        link.innerHTML = `
            <div>
                <div style="font-weight:bold; color:#00f3ff;">${item.agency}</div>
                <div style="font-size:12px; opacity:0.7;">${item.rlNo}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        listDiv.appendChild(link);
    });

    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${Math.ceil(filteredData.length / itemsPerPage)}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === Math.ceil(filteredData.length / itemsPerPage);
}

function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredData = agencyData.filter(item => 
            item.agency.toLowerCase().includes(term) || item.rlNo.toLowerCase().includes(term)
        );
        currentPage = 1;
        renderList();
    });
    
    document.getElementById('prevBtn').onclick = () => { if(currentPage > 1) { currentPage--; renderList(); } };
    document.getElementById('nextBtn').onclick = () => { if(currentPage * itemsPerPage < filteredData.length) { currentPage++; renderList(); } };
}

async function renderDetails() {
    const params = new URLSearchParams(window.location.search);
    const rl = params.get('rl');
    const agency = agencyData.find(a => a.rlNo.includes(rl));

    if (!agency) return;

    const reviewsRes = await fetch('../data/agency_review.json');
    const allReviews = await reviewsRes.json();
    const agencyReviews = allReviews.filter(r => r.agency_rl === rl);

    document.getElementById('detailsContainer').innerHTML = `
        <div class="detail-card">
            <img src="${agency.photo.replace('./', '../')}" class="profile-img" onerror="this.src='https://via.placeholder.com/150'">
            <h1 style="color:#00f3ff;">${agency.agency}</h1>
            <p>${agency.rlNo}</p>
            <div class="info-grid">
                <div><strong>Owner:</strong> ${agency.owner}</div>
                <div><strong>Email:</strong> ${agency.email}</div>
                <div style="grid-column: span 2;"><strong>Address:</strong> ${agency.address}</div>
                <div style="grid-column: span 2;"><strong>Contact:</strong> ${agency.contact}</div>
            </div>
        </div>
        <div class="review-section">
            <h3>Reviews</h3>
            <div id="reviewList">${agencyReviews.map(r => `<div class="review-card"><strong>${r.user}:</strong> ${r.comment}</div>`).join('')}</div>
            <div class="glass-card" style="margin-top:20px;">
                <h4>Add a Review</h4>
                <input id="revUser" class="input-glass" placeholder="Your Name">
                <textarea id="revComment" class="input-glass" placeholder="Your Experience"></textarea>
                <button onclick="submitReview('${rl}')" class="btn-neon">Submit Review</button>
            </div>
        </div>
    `;
}

async function submitReview(rl) {
    const user = document.getElementById('revUser').value;
    const comment = document.getElementById('revComment').value;
    const res = await fetch('/api/submit-review', {
        method: 'POST',
        body: JSON.stringify({ rl, user, comment })
    });
    if (res.ok) alert("Review Submitted!");
}

init();
