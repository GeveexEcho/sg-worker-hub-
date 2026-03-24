let database = [];

// Function to fetch the latest data
async function loadDatabase() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/GeveexEcho/sg-worker-hub-/main/data/data.json?nocache=' + new Date().getTime());
        database = await res.json();
    } catch (err) {
        console.error("Could not load data", err);
    }
}

// Initial load
loadDatabase();

async function handleSearch() {
    // Re-fetch database to get the very latest submissions
    await loadDatabase();

    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const container = document.getElementById('results-container');
    container.innerHTML = '';

    if (!query) return;

    // Filter all matching companies
    const results = database.filter(company => 
        company.name.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        // Simple check for currentLang, defaults to 'en' if not defined
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        container.innerHTML = `<p style="color: red; padding: 10px;">${lang === 'en' ? 'No company found. You can submit it above.' : 'কোনো কোম্পানি পাওয়া যায়নি। আপনি উপরে জমা দিতে পারেন।'}</p>`;
        return;
    }

    // Display all matching results
    results.forEach(company => {
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
            <textarea id="review-${company.name.replace(/\s+/g, '-')}" placeholder="Add your review..."></textarea>
            <button onclick="submitReview('${company.name}')">Add Review</button>
        `;
        container.appendChild(div);
    });
}
