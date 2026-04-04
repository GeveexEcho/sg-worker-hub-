async function submitCompany() {
    const name = document.getElementById('company-name').value.trim();
    const activityData = document.getElementById('company-activity').value.trim();
    const statusEl = document.getElementById('submit-status');

    if (!name || !activityData) {
        alert("Please fill all fields before submitting.");
        return;
    }

    if (statusEl) statusEl.innerText = "Submitting... Please wait.";

    const actionType = (window.currentAction === 'add_review') ? 'add_review' : 'new_company';

    const payload = { action: actionType, name: name };
    
    if (actionType === 'add_review') {
        payload.review = activityData;
    } else {
        payload.activity = activityData;
    }

    try {
        const res = await fetch('/.netlify/functions/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Success! " + (data.message || "Your review has been saved."));
            if (statusEl) statusEl.innerText = "Success!";
            setTimeout(() => location.reload(), 1500);
        } else {
            alert("❌ Error: " + (data.message || "Something went wrong."));
            if (statusEl) statusEl.innerText = data.message;
        }
    } catch (error) {
        alert("⚠️ Server connection failed. Please try again.");
        if (statusEl) statusEl.innerText = "Connection failed.";
    }
}
