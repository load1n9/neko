# Neko Core 🐈

core renderer

### Usage

#### Using Methods

```typescript
import { Neko, World } from "https://deno.land/x/neko/mod.ts";

const width = 800;
const height = 600;

const neko = new Neko({
  title: "Neko",
  width,
  height,
});
const frame = new Uint8Array(width * height * 4).fill(0x000000);
class Instance extends World {
  update() {
    frame[Math.round(Math.random() * frame.length)] = Math.round(
      Math.random() * 0xffffff,
    );
    neko.setFrameBuffer(frame);
  }
}

new Instance().start(neko, 60);
```

#### Using Functions

```typescript
import { Neko, World } from "https://deno.land/x/neko/mod.ts";

const width = 800;
const height = 600;

const neko = new Neko({
  title: "Neko",
  width,
  height,
});
const frame = new Uint8Array(width * height * 4).fill(0x000000);
new World().start(neko, {
  fps: 60,
  update: () => {
    frame[Math.round(Math.random() * frame.length)] = Math.round(
      Math.random() * 0xffffff,
    );
    neko.setFrameBuffer(frame);
  },
});
```

### Maintainers

- Loading ([@load1n9](https://github.com/load1n9))
