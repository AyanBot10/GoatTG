const { spawn } = require("child_process");
const log = require("./Classes/Console/log.js");

function startProject() {
	const child = spawn("node", ["Core.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();