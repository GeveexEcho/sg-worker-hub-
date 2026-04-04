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
        container.innerHTML = '<p style="text-align: center; color: white;">Loading database...</p>';
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
        container.innerHTML = `<p style="color: #ff9800; padding: 10px; text-align: center; font-weight: bold;">No company found in database.</p>`;
        return;
    }

    results.forEach(company => {
        const div = document.createElement('div');
        div.className = 'result-card';
        
        // Reviews display logic
        const reviewsHtml = (company.reviews && company.reviews.length > 0) 
            ? company.reviews.map(r => `
                <p style="border-left: 3px solid #ff9800; padding-left: 10px; background: #f0f0f0; padding: 8px; border-radius: 4px; font-size: 13px; color: #333; margin-bottom: 5px;">
                    ${r}
                </p>`).join('') 
            : "<p style='color: #666; font-size: 13px;'>No reviews yet. Be the first to share experience.</p>";

        div.innerHTML = `
            <div style="border-bottom: 2px solid #ff9800; margin-bottom: 10px; padding-bottom: 5px;">
                <h3 style="margin: 0; color: #111;">${company.name}</h3>
            </div>
            
            <p style="white-space: pre-line; font-size: 14px; color: #444;">
                <strong>Company Info:</strong>\n${company.activity}
            </p>
            
            <div class="review-section" style="margin-top: 15px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #111;">Worker Reviews:</h4>
                <div class="review-list">
                    ${reviewsHtml}
                </div>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                <button class="review-btn" 
                    onclick="openReviewForm('${company.name.replace(/'/g, "\\'")}')" 
                    style="background: #ff9800; color: #fff; width: 100%; padding: 12px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 15px;">
                    ⭐ Add Your Review
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}
