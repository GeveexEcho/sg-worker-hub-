const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
    const { rl, user, comment } = JSON.parse(event.body);
    const octokit = new Octokit({ auth: process.env.PAT });
    const repoOwner = "GeveexEcho";
    const repoName = "sg-worker-hub-";
    const filePath = "data/agency_review.json";

    const { data: fileData } = await octokit.repos.getContent({ owner: repoOwner, repo: repoName, path: filePath });
    const currentReviews = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    
    currentReviews.push({ agency_rl: rl, user, comment, date: new Date() });

    await octokit.repos.createOrUpdateFileContents({
        owner: repoOwner, repo: repoName, path: filePath,
        message: `New review for RL ${rl}`,
        content: Buffer.from(JSON.stringify(currentReviews, null, 2)).toString('base64'),
        sha: fileData.sha
    });

    return { statusCode: 200, body: "Success" };
};

