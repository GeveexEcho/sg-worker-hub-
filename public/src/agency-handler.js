let agencyData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 20;

async function init() {
    try {
        // '../data/' এর পরিবর্তে সরাসরি '/data/' ব্যবহার করা হয়েছে
        const response = await fetch('/data/updated-agency.json');
        if (!response.ok) throw new Error('JSON file not found');
        
        agencyData = await response.json();
        filteredData = [...agencyData];
        
        if (document.getElementById('agencyList')) {
            renderList();
            setupSearch();
        } else if (document.getElementById('detailsContainer')) {
            renderDetails();
        }
    } catch (e) { 
        console.error("Data load failed:", e); 
        const container = document.getElementById('agencyList') || document.getElementById('detailsContainer');
        if(container) container.innerHTML = `<p style="color:red; text-align:center;">ডেটা লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে পরে চেষ্টা করুন।</p>`;
    }
}

function renderList() {
    const listDiv = document.getElementById('agencyList');
    listDiv.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredData.slice(start, start + itemsPerPage);

    paginatedItems.forEach(item => {
        const link = document.createElement('a');
        // RL নম্বর থেকে 'RL No: ' অংশটি বাদ দিয়ে শুধুমাত্র নম্বরটি পাঠানো হচ্ছে
        const cleanRL = item.rlNo.replace('RL No: ', '').trim();
        link.href = `agency-details.html?rl=${cleanRL}`;
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

async function renderDetails() {
    const params = new URLSearchParams(window.location.search);
    const rl = params.get('rl');
    const container = document.getElementById('detailsContainer');

    if (!rl) {
        container.innerHTML = "<h2>Agency not found!</h2>";
        return;
    }

    // নির্দিষ্ট RL অনুযায়ী এজেন্সি খুঁজে বের করা
    const agency = agencyData.find(a => a.rlNo.includes(rl));

    if (!agency) {
        container.innerHTML = "<h2>Agency Details Not Found!</h2>";
        return;
    }

    // রিভিউ ডেটা লোড করা (পাথ আপডেট করা হয়েছে)
    let agencyReviews = [];
    try {
        const reviewsRes = await fetch('/data/agency_review.json');
        if (reviewsRes.ok) {
            const allReviews = await reviewsRes.json();
            agencyReviews = allReviews.filter(r => r.agency_rl === rl);
        }
    } catch (e) { console.log("No reviews found or error loading reviews"); }

    // ইমেজ পাথ আপডেট করা হয়েছে (./ থেকে / এ রূপান্তর)
    const imagePath = agency.photo && agency.photo !== 'N/A' 
                      ? agency.photo.replace('./', '/') 
                      : 'https://via.placeholder.com/150';

    container.innerHTML = `
        <div class="detail-card">
            <img src="${imagePath}" class="profile-img" onerror="this.src='https://via.placeholder.com/150'">
            <h1 style="color:#00f3ff;">${agency.agency}</h1>
            <p><strong>${agency.rlNo}</strong></p>
            <div class="info-grid">
                <div><strong>Owner:</strong> ${agency.owner}</div>
                <div><strong>Email:</strong> ${agency.email}</div>
                <div style="grid-column: span 2;"><strong>Address:</strong> ${agency.address}</div>
                <div style="grid-column: span 2;"><strong>Contact:</strong> ${agency.contact}</div>
            </div>
        </div>
        <div class="review-section">
            <h3>Reviews</h3>
            <div id="reviewList">
                ${agencyReviews.length > 0 
                    ? agencyReviews.map(r => `<div class="review-card"><strong>${r.user}:</strong> ${r.comment}</div>`).join('')
                    : '<p style="opacity:0.6;">No reviews yet.</p>'}
            </div>
            <div class="glass-card" style="margin-top:20px;">
                <h4>Add a Review</h4>
                <input id="revUser" class="input-glass" placeholder="Your Name" style="width:100%; margin-bottom:10px; padding:8px; border-radius:5px; border:1px solid #333; background:#1e293b; color:white;">
                <textarea id="revComment" class="input-glass" placeholder="Your Experience" style="width:100%; margin-bottom:10px; padding:8px; border-radius:5px; border:1px solid #333; background:#1e293b; color:white; min-height:80px;"></textarea>
                <button onclick="submitReview('${rl}')" class="btn-neon">Submit Review</button>
            </div>
        </div>
    `;
}

// অন্যান্য ফাংশনগুলো আগের মতোই থাকবে (setupSearch, changePage, submitReview)
function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredData = agencyData.filter(a => 
            a.agency.toLowerCase().includes(term) || 
            a.rlNo.toLowerCase().includes(term)
        );
        currentPage = 1;
        renderList();
    });
}

function changePage(step) {
    currentPage += step;
    renderList();
    window.scrollTo(0, 0);
}

async function submitReview(rl) {
    const user = document.getElementById('revUser').value;
    const comment = document.getElementById('revComment').value;
    
    if(!user || !comment) {
        alert("Please fill both name and comment.");
        return;
    }

    try {
        const res = await fetch('/.netlify/functions/submit-review', {
            method: 'POST',
            body: JSON.stringify({ rl, user, comment })
        });
        if (res.ok) {
            alert("Review Submitted! It will appear after update.");
            document.getElementById('revUser').value = '';
            document.getElementById('revComment').value = '';
        } else {
            alert("Failed to submit review.");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
}

// স্ক্রিপ্ট শুরু করা
init();
