if (__dirname.endsWith("dist")) process.env.NODE_PATH = "./dist";
else if (__dirname.endsWith("src")) process.env.NODE_PATH = "./src";
else process.env.NODE_PATH = "./";
require("module").Module._initPaths();

import "@sapphire/plugin-logger/register";

import { AnimeSpaceClient } from "client";
import { inspect } from "util";
import { getAllFiles } from "lib/tools/getAllFiles";

const tasksFiles = getAllFiles(__dirname + "/" + "tasks/");
const filteredTaskFiles = tasksFiles.filter((value) => !value.endsWith(".map"));
filteredTaskFiles.forEach((each) => require(each));

// Set default inspection depth
inspect.defaultOptions.depth = 1;

require("source-map-support").install({
   environment: "node",
});

//__Client

const ASClient = new AnimeSpaceClient();

ASClient.login();
