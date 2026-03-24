async function submitCompany() {
    const name = document.getElementById('company-name').value.trim();
    const activity = document.getElementById('company-activity').value.trim();
    const statusEl = document.getElementById('submit-status');

    if (!name || !activity) return alert("Please fill all fields");

    statusEl.innerText = "Submitting...";
    
    const res = await fetch('/.netlify/functions/submit', {
        method: 'POST',
        body: JSON.stringify({ action: 'new_company', name, activity })
    });

    const data = await res.json();
    statusEl.innerText = data.message;
    if (res.ok) setTimeout(() => location.reload(), 2000);
}

async function submitReview(companyName) {
    const review = document.getElementById(`review-${companyName}`).value.trim();
    if (!review) return alert("Review cannot be empty");

    const res = await fetch('/.netlify/functions/submit', {
        method: 'POST',
        body: JSON.stringify({ action: 'add_review', name: companyName, review })
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) location.reload();
}

