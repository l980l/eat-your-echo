import {cp, mkdir, readdir, rm} from "node:fs/promises";
import {join} from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});
for (const file of ["index.html", "style.css", "game.js"]) {
  await cp(join(root, file), join(dist, file));
}
await cp(join(root, "assets"), join(dist, "assets"), {recursive: true});

const required = ["index.html", "style.css", "game.js", "assets"];
const present = new Set(await readdir(dist));
for (const item of required) {
  if (!present.has(item)) throw new Error(`Android web build missing: ${item}`);
}
console.log("Prepared offline web bundle in dist/");
