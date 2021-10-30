kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

const MOVE_SPEED = 120;
const JUMP_FORCE = 360;
const BIG_JUMP_FORCE = 550;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
const ENEMY_SPEED = 20;
let is_jumping = true;
const FALL_DEATH = 400;

loadRoot("./assets/");

loadSprite("coin", "coin.png");
loadSprite("evil-shroom", "evil-shroom.png");
loadSprite("brick", "brick.png");
loadSprite("block", "block.png");
loadSprite("mario", "mario_standing.png");
loadSprite("mashroom", "mashroom.png");
loadSprite("surprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("pipe-top-left", "pipe-top-left.png");
loadSprite("pipe-top-right", "pipe-top-right.png");
loadSprite("pipe-bottom-left", "pipe-bottom-left.png");
loadSprite("pipe-bottom-right", "pipe-bottom-right.png");

/* level 2 Stripes */

loadSprite("blue-block", "blueblock.png");
loadSprite("blue-brick", "bluebrick.png");
loadSprite("blue-steel", "bluesteel.png");
loadSprite("blue-evil-shroom", "blueevilshroom.png");
loadSprite("blue-surprise", "bluesurprise.png");

scene("game", ({ level, score }) => {
  layers(["bg", "obj", "ui"], "obj");

  const maps = [
    [
      "                                ",
      "                                ",
      "                                ",
      "                                ",
      "     %  =*=%=                   ",
      "                                ",
      "                        -+      ",
      "            ^  ^        ()      ",
      "==========================  ====",
    ],
    [
      "£                                     £",
      "£                                     £",
      "£                                     £",
      "£                                     £",
      "£     @@@@@@             x x          £",
      "£                      x x x          £",
      "£                    x x x x x      -+£",
      "£            z  z  x x x x x x      ()£",
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    ],
  ];

  const levelCfg = {
    width: 20,
    height: 20,

    /* level 1 elments */

    "=": [sprite("block"), solid()],
    "~": [sprite("coin"), "coin"],
    "%": [sprite("surprise"), solid(), "coin-surprise"],
    "*": [sprite("surprise"), solid(), "mushroom-surprise"],
    "}": [sprite("unboxed"), solid()],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5), "pipe"],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5), "pipe"],
    "-": [sprite("pipe-top-left"), solid(), scale(0.5)],
    "+": [sprite("pipe-top-right"), solid(), scale(0.5)],
    "^": [sprite("evil-shroom"), solid(), "dangerous"],
    "#": [sprite("mashroom"), solid(), "mashroom", body()],

    /* level 2 elments */

    "!": [sprite("blue-block"), solid(), scale(0.5)],
    "£": [sprite("blue-brick"), solid(), scale(0.5)],
    z: [sprite("blue-evil-shroom"), solid(), scale(0.5), "dangerous"],
    "@": [sprite("blue-surprise"), solid(), scale(0.5), "coin-surprise"],
    x: [sprite("blue-steel"), solid(), scale(0.5)],
  };
  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
    text(`score ${score}`),
    pos(40, 40),
    layer("ui"),
    { value: score },
  ]);

  add([text("level " + parseInt(level + 1)), pos(40, 6)]);

  function big() {
    let timer = 0;
    let isBig = false;

    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        this.scale = vec2(1);
        timer = 0;
        isBig = false;
      },
      biggify(time) {
        this.scale = vec2(2);
        timer = time;
        isBig = true;
      },
    };
  }

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin("bot"),
  ]);

  action("mashroom", (m) => {
    m.move(ENEMY_SPEED, 0);
  });

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("~", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("#", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
  });

  player.collides("mashroom", (m) => {
    destroy(m);
    player.biggify(6);
  });

  player.collides("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  action("dangerous", (d) => {
    d.move(-20, 0);
  });

  player.collides("dangerous", (d) => {
    if (is_jumping) {
      destroy(d);
    } else {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= FALL_DEATH) {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.collides("pipe", () => {
    keyPress("down", () => {
      go("game", {
        level: level + 1,
        score: scoreLabel.value,
      });
    });
  });

  keyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
  });
  keyDown("right", () => {
    player.move(MOVE_SPEED, 0);
  });

  player.action(() => {
    if (player.grounded()) {
      is_jumping = false;
    }
  });

  keyPress("space", () => {
    if (player.grounded()) {
      is_jumping = true;
      player.jump(CURRENT_JUMP_FORCE);
    }
  });
});

scene("lose", ({ score }) => {
  add([
    text(`YOUR SCOURE: ${score}`, 32),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
});

start("game", { level: 0, score: 0 });
