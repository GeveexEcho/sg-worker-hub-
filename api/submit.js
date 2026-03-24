exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const payload = JSON.parse(event.body);
    const { action, name, activity, review } = payload;

    // --- SETUP YOUR REPO DETAILS HERE ---
    const GITHUB_TOKEN = process.env.GITHUB_PAT; 
    const REPO_OWNER = 'GeveexEcho';
    const REPO_NAME = 'sg-worker-hub';
    const FILE_PATH = 'data/data.json';
    
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        // 1. Get current data.json and its SHA (required to update files in GitHub)
        const getRes = await fetch(url, { headers });
        const fileData = await getRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let db = JSON.parse(content);

        // 2. Process logic based on action
        if (action === 'new_company') {
            const exists = db.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                return { statusCode: 400, body: JSON.stringify({ message: "Company already exists! Please search and add a review instead." }) };
            }
            db.push({ name, activity, reviews: [] });
        } 
        else if (action === 'add_review') {
            const companyIndex = db.findIndex(c => c.name === name);
            if (companyIndex === -1) return { statusCode: 404, body: JSON.stringify({ message: "Company not found" }) };
            db[companyIndex].reviews.push(review);
        }

        // 3. Commit back to GitHub
        const newContent = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
        const putRes = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Update ${name}`,
                content: newContent,
                sha: fileData.sha
            })
        });

        if (!putRes.ok) throw new Error("GitHub commit failed");

        return { statusCode: 200, body: JSON.stringify({ message: "Successfully saved! It may take a minute to appear on the site." }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};

