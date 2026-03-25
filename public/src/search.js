let database = [];

// Function to fetch the latest data from GitHub
async function loadDatabase() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/GeveexEcho/sg-worker-hub-/main/data/data.json?nocache=' + new Date().getTime());
        database = await res.json();
    } catch (err) {
        console.error("Could not load data", err);
    }
}

// Initial load on page startup
loadDatabase();

async function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const container = document.getElementById('results-container');
    
    if (!query) {
        container.innerHTML = '';
        return;
    }

    // Re-fetch database to ensure we have the latest reviews/reports
    await loadDatabase();

    const results = database.filter(company => 
        company.name.toLowerCase().includes(query)
    );

    container.innerHTML = '';

    if (results.length === 0) {
        // Simple language check for the error message
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        container.innerHTML = `<p style="color: red; padding: 10px;">${lang === 'en' ? 'No company found. You can submit it above.' : 'কোনো কোম্পানি পাওয়া যায়নি। আপনি উপরে জমা দিতে পারেন।'}</p>`;
        return;
    }

    // Generate result cards for each matching company
    results.forEach(company => {
        // Create a safe ID for the DOM elements by replacing spaces with dashes
        const safeId = company.name.replace(/\s+/g, '-'); 
        
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `
            <h3>${company.name}</h3>
            <p><strong>Activity:</strong> ${company.activity}</p>
            <h4>Reviews/Reports:</h4>
            <div class="review-list">
                ${company.reviews && company.reviews.length > 0 
                    ? company.reviews.map(r => `<p>• ${r}</p>`).join('') 
                    : "<p>No reviews yet.</p>"}
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                <textarea id="review-${safeId}" placeholder="Add your review or report here..." rows="2"></textarea>
                <button id="btn-${safeId}" onclick="submitReview('${company.name}')" style="background: #111; color: #fff; width: auto; margin-top: 5px;">Add Review</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Function to handle adding a new review to an existing company
async function submitReview(companyName) {
    const safeId = companyName.replace(/\s+/g, '-');
    const reviewInput = document.getElementById(`review-${safeId}`);
    const reviewBtn = document.getElementById(`btn-${safeId}`);
    const reviewText = reviewInput.value.trim();

    if (!reviewText) {
        alert("Please write your review before clicking submit.");
        return;
    }

    // Disable button to prevent multiple submissions
    reviewBtn.disabled = true;
    reviewBtn.innerText = "Sending...";

    try {
        const response = await fetch('/.netlify/functions/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'add_review',
                name: companyName,
                review: reviewText
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Review added successfully!");
            reviewInput.value = ''; // Clear the input field
            await handleSearch();   // Refresh the UI to show the new review
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Review submission error:", error);
        alert("Failed to connect to the server. Please try again.");
    } finally {
        reviewBtn.disabled = false;
        reviewBtn.innerText = "Add Review";
    }
}
