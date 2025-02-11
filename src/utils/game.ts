import {
  Engine,
  Render,
  Runner,
  Composite,
  Bodies,
  Body,
  Events,
} from "matter-js";

const WHITE_DOTS_GROUP = 0b0001;
const RED_DOTS_GROUP = 0b0010;
const GROUND_GROUP = 0b0100;

export const createWorld = (container: HTMLDivElement) => {
  // create an engine
  const engine = Engine.create();

  // create a renderer
  const render = Render.create({
    element: container,
    engine: engine,
    options: {
      wireframes: false,
    },
  });
  const redDotsPosition = Array.from({ length: 20 }, (_, i) => ({
    //
    x: 375,
    // y from -400 - 0, spaced by 50
    y: -400 + 400 * Math.sin((i * Math.PI) / 5),
  }));

  const redDots = redDotsPosition.map((position) => {
    return Bodies.circle(position.x, position.y, 10, {
      render: { fillStyle: "red" },
      restitution: 0.8,
      collisionFilter: {
        category: RED_DOTS_GROUP,
        mask: WHITE_DOTS_GROUP | GROUND_GROUP,
      },
    });
  });

  //   White dots make a triangle
  const whiteDotsPosition = [];
  for (let i = 0; i < 8; i++) {
    const maxCol = i + 3;
    const leftSpace = 8 - maxCol;
    for (let j = 0; j < maxCol; j++) {
      whiteDotsPosition.push({
        x: 200 + 50 * j + leftSpace * 25,
        y: 100 + 50 * i,
      });
    }
  }
  const whiteDots = whiteDotsPosition.map((position) => {
    return Bodies.circle(position.x, position.y, 5, {
      isStatic: true,
      render: { fillStyle: "white" },
      collisionFilter: {
        category: WHITE_DOTS_GROUP,
      },
    });
  });
  const ground = Bodies.rectangle(400, 510, 810, 60, {
    isStatic: true,
    collisionFilter: {
      category: GROUND_GROUP,
    },
  });
  const leftBorder = Bodies.rectangle(210, 300, 10, 600, {
    isStatic: true,
    // render: { fillStyle: "transparent" },
  });
  const rightBorder = Bodies.rectangle(540, 300, 10, 600, {
    isStatic: true,
    // render: { fillStyle: "transparent" },
  });
  Body.rotate(leftBorder, Math.PI / 6.8);
  Body.rotate(rightBorder, -Math.PI / 6.8);

  //   Handle Collision
  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    console.log(pairs[0]);
  });
  // add all of the bodies to the world
  Composite.add(engine.world, [
    ...redDots,
    ...whiteDots,
    ground,
    leftBorder,
    rightBorder,
  ]);

  // run the renderer
  Render.run(render);

  // create runner
  const runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  const cleanup = () => {
    Render.stop(render);
    Runner.stop(runner);
    render.canvas.remove();
  };

  const addRedDot = (x: number, y: number) => {
    const redDot = Bodies.circle(x, y, 10, {
      render: { fillStyle: "red" },
      restitution: 0.8,
      collisionFilter: {
        category: RED_DOTS_GROUP,
        mask: WHITE_DOTS_GROUP | GROUND_GROUP,
      },
    });
    Composite.add(engine.world, redDot);
  };

  render.canvas.addEventListener("click", (event) => {
    const { offsetX, offsetY } = event;
    addRedDot(offsetX, offsetY);
  });

  return {
    engine,
    render,
    runner,
    cleanup,
  };
};
