/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
	// Your code here
	app.log('Yay, the app was loaded!')
    var webhook_token = "1";

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

	// this is standard express route to receive buildkite hooks
	const router = app.route("/flow");
	router.use(require("express"));

	router.get("/", async (req, res) => {
    });

	// add a route
	router.post("/hook", async (req, res) => {
		// copied from https://github.com/buildkite/lifx-buildkite-build-light-node/
		// Verify token
		if (req.headers['x-buildkite-token'] != webhook_token) {
			console.log("Invalid webhook token");
			return res.status(401).send('Invalid token');
		}

		var buildkiteEvent = req.headers['x-buildkite-event'];

		if (buildkiteEvent == 'build.running') {
			console.log('Build running');
			post_to_lifx("/v1beta1/lights/" + bulb_selector + "/effects/breathe.json", {
				power_on:   false,
				color:      "yellow brightness:5%",
				from_color: "yellow brightness:35%",
				period:     5,
				cycles:     9999,
				persist:    true
			});
		}

		if (buildkiteEvent == 'build.finished') {
			if (req.body.build.state == 'passed') {
				console.log("Build passed");
				post_to_lifx("/v1/lights/" + bulb_selector + "/effects/breathe.json", {
					power_on:   false,
					color:      "green brightness:75%",
					from_color: "green brightness:10%",
					period:     0.45,
					cycles:     3,
					persist:    true,
					peak:       0.2
				});
			} else {
				console.log("Build failed");
				post_to_lifx("/v1/lights/" + bulb_selector + "/effects/breathe.json", {
					power_on:   false,
					color:      "red brightness:60%",
					from_color: "red brightness:25%",
					period:     0.1,
					cycles:     20,
					persist:    true,
					peak:       0.2
				});
			}
		}

		res.send('AOK');
	});
}
