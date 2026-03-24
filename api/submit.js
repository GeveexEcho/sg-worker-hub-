exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const { action, name, activity, review } = payload;

        const GITHUB_TOKEN = process.env.PAT; 
        const REPO_OWNER = 'GeveexEcho';
        const REPO_NAME = 'sg-worker-hub';
        const FILE_PATH = 'data/data.json';
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        
        const headers = {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SG-Worker-Hub-App' // REQUIRED by GitHub API
        };

        // 1. Get current data.json
        const getRes = await fetch(url, { headers });
        if (!getRes.ok) throw new Error("Could not find database file on GitHub");
        
        const fileData = await getRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        
        // Handle potentially empty or malformed JSON
        let db = [];
        try {
            db = JSON.parse(content);
        } catch (e) {
            db = [];
        }

        // 2. Logic: Add Company or Add Review
        if (action === 'new_company') {
            const exists = db.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                return { 
                    statusCode: 400, 
                    body: JSON.stringify({ message: "Company already exists! Search it to add a review." }) 
                };
            }
            db.push({ name, activity, reviews: [], timestamp: new Date().toISOString() });
        } 
        else if (action === 'add_review') {
            const companyIndex = db.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
            if (companyIndex === -1) {
                return { statusCode: 404, body: JSON.stringify({ message: "Company not found" }) };
            }
            db[companyIndex].reviews.push(`${new Date().toLocaleDateString()}: ${review}`);
        }

        // 3. Push back to GitHub
        const updatedContentBase64 = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
        
        const putRes = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Community Update: ${name}`,
                content: updatedContentBase64,
                sha: fileData.sha // Required to overwrite the file
            })
        });

        if (!putRes.ok) {
            const errorMsg = await putRes.text();
            throw new Error(`GitHub Save Failed: ${errorMsg}`);
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: "Success! Data sent to database." }) 
        };

    } catch (error) {
        console.error(error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: "Server Error: " + error.message }) 
        };
    }
};
