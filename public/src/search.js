let database = [];

// Fetch the database on load
fetch('https://raw.githubusercontent.com/GeveexEcho/sg-worker-hub-/main/data/data.json')
    .then(res => res.json())
    .then(data => database = data)
    .catch(err => console.error("Could not load data", err));

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const container = document.getElementById('results-container');
    container.innerHTML = '';

    if (!query) return;

    const results = database.filter(company => company.name.toLowerCase().includes(query));

    if (results.length === 0) {
        container.innerHTML = `<p>${currentLang === 'en' ? 'No company found. You can submit it above.' : 'কোনো কোম্পানি পাওয়া যায়নি। আপনি উপরে জমা দিতে পারেন।'}</p>`;
        return;
    }

    results.forEach(company => {
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `
            <h3>${company.name}</h3>
            <p><strong>Initial Report:</strong> ${company.activity}</p>
            <h4>Reviews/Reports:</h4>
            <ul class="review-list">
                ${company.reviews.map(r => `<li>${r}</li>`).join('')}
            </ul>
            <textarea id="review-${company.name}" placeholder="Add your review..."></textarea>
            <button onclick="submitReview('${company.name}')">Add Review</button>
        `;
        container.appendChild(div);
    });
}

