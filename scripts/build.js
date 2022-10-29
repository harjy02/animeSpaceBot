const { execSync } = require("child_process");
const { existsSync, rmSync, mkdirSync } = require("fs");
const { copySync } = require("fs-extra");

if (existsSync("./dist")) {
	console.log("dist dir found, removing...");

	rmSync("./dist", { recursive: true, force: true });
	console.log("dist dir removed.");
}

mkdirSync("./dist");
console.log("created new dist directory");

copySync("./package.json", "./dist/package.json");
console.log("copied package.json in dist");

copySync("./package-lock.json", "./dist/package-lock.json");
console.log("copied package-lock in dist");

console.log("executing tsc...");
execSync("tsc", (error, stdout, stderr) => {
	console.log(stdout);
	console.log(stderr);
	if (error !== null)
		console.log(`exec error: ${error}`);

});

if (process.argv.includes("-r")) {
	console.log("Done!");
	return;
}

console.log("installing node_modules...");
execSync("cd dist\n npm install --omit=dev", (error, stdout, stderr) => {
	console.log(stdout);
	console.log(stderr);
	if (error !== null)
		console.log(`exec error: ${error}`);

});

console.log("removing package.json and package-lock.json");
rmSync("./dist/package.json", { recursive: true, force: true });
rmSync("./dist/package-lock.json", { recursive: true, force: true });

if (process.argv.includes("-c")) {

	console.log("packing everything...");

	execSync("cd dist\n zip dist_content.zip * -r -q", (error, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		if (error !== null)
			console.log(`exec error: ${error}`);

	});


} else {

	console.log("packing nodeModules...");
	execSync("cd dist\n zip node_modules.zip node_modules -r -q", (error, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		if (error !== null)
			console.log(`exec error: ${error}`);

	});

}


console.log("Done!");