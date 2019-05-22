/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
    // Your code here
    app.log('Yay, the app was loaded!')

    app.on('*', async context => {
        const pr = context.payload.pull_request;
        const head = pr.head
        if (!pr || pr.state !== "open") {
            // don't do anything with closed PR
            return;
        }

        const sha = head.sha;
        const number = context.payload.number;
        const issue = context.issue({sha: sha});

        const org = pr.base.repo.owner.login;
        const repo = pr.base.repo.name
        const conclusion = "success"
        const title = "GarnetFlow Check"

        console.log(repo);

        let summary = "";
        return context.github.checks.create({
            owner: org,
            repo: repo,
            name: "GarnetFlow",
            head_sha: pr.head.sha,
            status: 'completed',
            conclusion: conclusion,
            completed_at: new Date().toISOString(),
            output: {
                title: title,
                summary: summary
            }
        })
    })

    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
}
