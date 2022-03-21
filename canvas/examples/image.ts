import { Canvas, loadImage } from "../mod.ts";

const canvas = new Canvas({
    title: "Neko",
    width: 500,
    height: 500,
});

const ctx = canvas.getContext("2d");
// image created by Hashrock (https://hashrock.studio.site)
const img = await loadImage("https://deno.land/images/artwork/hashrock_simple.png");
ctx.drawImage(img, 0, 0);