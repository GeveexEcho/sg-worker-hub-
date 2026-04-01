const loadedFiles = {};

function getFileName(query) {
    if (!query) return '0-9-special_character.json';
    const firstChar = query.charAt(0).toLowerCase();
    if (firstChar >= 'a' && firstChar <= 'b') return 'a-b.json';
    if (firstChar >= 'c' && firstChar <= 'd') return 'c-d.json';
    if (firstChar >= 'e' && firstChar <= 'f') return 'e-f.json';
    if (firstChar >= 'g' && firstChar <= 'h') return 'g-h.json';
    if (firstChar >= 'i' && firstChar <= 'j') return 'i-j.json';
    if (firstChar >= 'k' && firstChar <= 'l') return 'k-l.json';
    if (firstChar >= 'm' && firstChar <= 'n') return 'm-n.json';
    if (firstChar >= 'o' && firstChar <= 'p') return 'o-p.json';
    if (firstChar >= 'q' && firstChar <= 'r') return 'q-r.json';
    if (firstChar >= 's' && firstChar <= 't') return 's-t.json';
    if (firstChar >= 'u' && firstChar <= 'v') return 'u-v.json';
    if (firstChar >= 'w' && firstChar <= 'x') return 'w-x.json';
    if (firstChar >= 'y' && firstChar <= 'z') return 'y-z.json';
    return '0-9-special_character.json';
}

async function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const container = document.getElementById('results-container');
    
    if (query.length < 2) {
        container.innerHTML = '';
        return;
    }

    const fileName = getFileName(query);

    if (!loadedFiles[fileName]) {
        container.innerHTML = '<p>Loading database...</p>';
        try {
            const res = await fetch(`https://raw.githubusercontent.com/GeveexEcho/sg-worker-hub-/main/data/${fileName}?nocache=${new Date().getTime()}`);
            if (res.ok) {
                loadedFiles[fileName] = await res.json();
            } else {
                loadedFiles[fileName] = [];
            }
        } catch (err) {
            loadedFiles[fileName] = [];
        }
    }

    const results = loadedFiles[fileName].filter(company => 
        company.name.toLowerCase().includes(query)
    ).slice(0, 15);

    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = `<p style="color: red; padding: 10px;">No company found in database.</p>`;
        return;
    }

    results.forEach(company => {
        const safeId = company.name.replace(/[^a-zA-Z0-9]/g, ''); 
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `
            <div style="border-bottom: 2px solid #ffcc00; margin-bottom: 10px; padding-bottom: 5px;">
                <h3 style="margin: 0; color: #111;">${company.name}</h3>
            </div>
            <p style="white-space: pre-line;"><strong>Company Info:</strong>\n${company.activity}</p>
            
            <div class="review-section" style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
                <h4>Worker Reviews:</h4>
                <div class="review-list">
                    ${company.reviews && company.reviews.length > 0 
                        ? company.reviews.map(r => `<p style="border-left: 3px solid #111; padding-left: 10px;">• ${r}</p>`).join('') 
                        : "<p style='color: #666;'>No reviews yet. Be the first to share experience.</p>"}
                </div>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                <textarea id="review-input-${safeId}" placeholder="আপনার অভিজ্ঞতা লিখুন (বাংলা বা ইংরেজি)..." rows="2" style="width: 100%; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                <button id="review-btn-${safeId}" onclick="addReviewProcess('${company.name}', '${safeId}')" style="background: #111; color: #fff; width: 100%; margin-top: 8px; padding: 10px; font-weight: bold; cursor: pointer;">Add Review</button>
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
            body: JSON.stringify({ action: 'add_review', name: companyName, review: reviewValue })
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
    
