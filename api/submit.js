exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const { action, name, activity, review } = payload;

        const cleanName = name ? name.trim() : "";
        if (!cleanName) throw new Error("Company name is required");

        const firstChar = cleanName.charAt(0).toLowerCase();
        let fileName = '0-9-special_character.json';
        if (firstChar >= 'a' && firstChar <= 'b') fileName = 'a-b.json';
        else if (firstChar >= 'c' && firstChar <= 'd') fileName = 'c-d.json';
        else if (firstChar >= 'e' && firstChar <= 'f') fileName = 'e-f.json';
        else if (firstChar >= 'g' && firstChar <= 'h') fileName = 'g-h.json';
        else if (firstChar >= 'i' && firstChar <= 'j') fileName = 'i-j.json';
        else if (firstChar >= 'k' && firstChar <= 'l') fileName = 'k-l.json';
        else if (firstChar >= 'm' && firstChar <= 'n') fileName = 'm-n.json';
        else if (firstChar >= 'o' && firstChar <= 'p') fileName = 'o-p.json';
        else if (firstChar >= 'q' && firstChar <= 'r') fileName = 'q-r.json';
        else if (firstChar >= 's' && firstChar <= 't') fileName = 's-t.json';
        else if (firstChar >= 'u' && firstChar <= 'v') fileName = 'u-v.json';
        else if (firstChar >= 'w' && firstChar <= 'x') fileName = 'w-x.json';
        else if (firstChar >= 'y' && firstChar <= 'z') fileName = 'y-z.json';

        const GITHUB_TOKEN = process.env.GITHUB_PAT || process.env.PAT; 
        const REPO_OWNER = 'GeveexEcho';
        const REPO_NAME = 'sg-worker-hub-'; 
        const FILE_PATH = `data/${fileName}`;
        
        const contentsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        
        const headers = {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SG-Worker-Hub-App'
        };

        const getRes = await fetch(contentsUrl, { headers });
        
        if (!getRes.ok) {
            const errorText = await getRes.text();
            throw new Error(`GitHub API Error: ${getRes.status} - ${errorText}`);
        }
        
        const fileData = await getRes.json();
        
        const blobUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs/${fileData.sha}`;
        const blobRes = await fetch(blobUrl, { headers });
        
        if (!blobRes.ok) throw new Error("Failed to fetch file content from Blob API");
        
        const blobData = await blobRes.json();
        const content = Buffer.from(blobData.content, 'base64').toString('utf-8');
        
        let db = JSON.parse(content || "[]");

        if (action === 'new_company') {
            const exists = db.find(c => c.name.toLowerCase().trim() === cleanName.toLowerCase());
            if (exists) {
                return { statusCode: 400, body: JSON.stringify({ message: "This company is already reported! Please search for it and add a review instead." }) };
            }
            db.push({ name: cleanName, activity: activity.trim(), reviews: [], timestamp: new Date().toISOString() });
        } else if (action === 'add_review') {
            const companyIndex = db.findIndex(c => c.name.toLowerCase().trim() === cleanName.toLowerCase());
            if (companyIndex !== -1) {
                db[companyIndex].reviews.push(`${new Date().toLocaleDateString()}: ${review.trim()}`);
            }
        }

        const updatedContentBase64 = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
        
        const putRes = await fetch(contentsUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ message: `Update by User: ${cleanName}`, content: updatedContentBase64, sha: fileData.sha })
        });

        if (!putRes.ok) throw new Error("GitHub Save Failed");

        return { statusCode: 200, body: JSON.stringify({ message: "Success! Data saved." }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
