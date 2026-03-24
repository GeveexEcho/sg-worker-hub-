exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const { action, name, activity, review } = payload;

        const GITHUB_TOKEN = process.env.GITHUB_PAT || process.env.PAT; 
        const REPO_OWNER = 'GeveexEcho';
        const REPO_NAME = 'sg-worker-hub'; 
        const FILE_PATH = 'data/data.json';
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        
        const headers = {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SG-Worker-Hub-App'
        };

        const getRes = await fetch(url, { headers });
        
        if (!getRes.ok) {
            const errorText = await getRes.text();
            throw new Error(`GitHub API Error: ${getRes.status} - ${errorText}`);
        }
        
        const fileData = await getRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        
        let db = JSON.parse(content || "[]");

        if (action === 'new_company') {
            const exists = db.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                return { statusCode: 400, body: JSON.stringify({ message: "Company already exists!" }) };
            }
            db.push({ name, activity, reviews: [], timestamp: new Date().toISOString() });
        } 
        else if (action === 'add_review') {
            const companyIndex = db.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
            if (companyIndex !== -1) {
                db[companyIndex].reviews.push(`${new Date().toLocaleDateString()}: ${review}`);
            }
        }

        const updatedContentBase64 = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
        
        const putRes = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Update by User: ${name}`,
                content: updatedContentBase64,
                sha: fileData.sha
            })
        });

        if (!putRes.ok) throw new Error("GitHub Save Failed");

        return { statusCode: 200, body: JSON.stringify({ message: "Success! Data saved to GitHub." }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
