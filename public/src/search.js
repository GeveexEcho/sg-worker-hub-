let database = [];

async function loadDatabase() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/GeveexEcho/sg-worker-hub-/main/data/data.json?nocache=' + new Date().getTime());
        database = await res.json();
    } catch (err) {
        console.error(err);
    }
}

loadDatabase();

async function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const container = document.getElementById('results-container');
    
    if (!query) {
        container.innerHTML = '';
        return;
    }

    await loadDatabase();

    const results = database.filter(company => 
        company.name.toLowerCase().includes(query)
    );

    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = `<p style="color: red; padding: 10px;">No company found.</p>`;
        return;
    }

    results.forEach(company => {
        const safeId = company.name.replace(/[^a-zA-Z0-9]/g, ''); 
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
                <textarea id="review-input-${safeId}" placeholder="Add your review here..." rows="2"></textarea>
                <button id="review-btn-${safeId}" onclick="addReviewProcess('${company.name}', '${safeId}')" style="background: #111; color: #fff; width: auto; margin-top: 5px;">Add Review</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function addReviewProcess(companyName, safeId) {
    const inputField = document.getElementById(`review-input-${safeId}`);
    const actionBtn = document.getElementById(`review-btn-${safeId}`);
    const reviewValue = inputField.value.trim();

    if (!reviewValue) {
        alert("Please write something first!");
        return;
    }

    actionBtn.disabled = true;
    actionBtn.innerText = "Processing...";

    try {
        const response = await fetch('/.netlify/functions/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'add_review',
                name: companyName,
                review: reviewValue
            })
        });

        if (response.ok) {
            alert("Success! Your review has been added.");
            inputField.value = ''; 
            await handleSearch(); 
        } else {
            const result = await response.json();
            alert("Error: " + result.message);
        }
    } catch (error) {
        alert("Server connection failed.");
    } finally {
        actionBtn.disabled = false;
        actionBtn.innerText = "Add Review";
    }
}
