import {
  Engine,
  Render,
  Runner,
  Composite,
  Bodies,
  Body,
  Events,
  IEventCollision,
} from "matter-js";
import gsap from "gsap";

const WHITE_DOTS_CATEGORY = 0b0001;
const RED_DOTS_CATEGORY = 0b0010;
const GROUND_CATEGORY = 0b0100;
const SCOREBOX_CATEGORY = 0b1000;

export const createWorld = (
  container: HTMLDivElement,
  scoreBoxElems: HTMLDivElement[],
  addScoreHistory: (scoreBox: { value: string; color: string }) => void
) => {
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
  const whiteDots = whiteDotsPosition.map((position, index) => {
    return Bodies.circle(position.x, position.y, 5, {
      isStatic: true,
      render: { fillStyle: "white" },
      label: "whiteDot_" + index,
      collisionFilter: {
        category: WHITE_DOTS_CATEGORY,
      },
    });
  });
  const whiteDotVFX = whiteDotsPosition.map((position) => {
    return Bodies.circle(position.x, position.y, 10, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: "white", opacity: 0 },
    });
  });
  const ground = Bodies.rectangle(400, 510, 810, 60, {
    isStatic: true,
    collisionFilter: {
      category: GROUND_CATEGORY,
    },
  });
  const leftBorder = Bodies.rectangle(185, 370, 10, 600, {
    isStatic: true,
    render: { fillStyle: "transparent" },
  });
  const rightBorder = Bodies.rectangle(565, 370, 10, 600, {
    isStatic: true,
    render: { fillStyle: "transparent" },
  });
  Body.rotate(leftBorder, Math.PI / 6.8);
  Body.rotate(rightBorder, -Math.PI / 6.8);

  const scoreBoxes = Array.from({ length: 9 }, (_, i) => ({
    x: 170 + 51 * i,
    y: 470,
    id: `scoreBox_${i}`,
  }));
  const scoreBoxBodies = scoreBoxes.map((box) => {
    return Bodies.rectangle(box.x, box.y, 45, 20, {
      isStatic: true,
      render: { fillStyle: "transparent" },
      label: box.id,
      collisionFilter: {
        category: SCOREBOX_CATEGORY,
      },
    });
  });
  // Setup the scoreBoxElems position
  scoreBoxBodies.forEach((scoreBox, index) => {
    const scoreBoxElem = scoreBoxElems[index];
    if (!scoreBoxElem) return;
    const { x, y } = scoreBox.position;
    scoreBoxElem.style.left = `${x - 45 / 2}px`;
    scoreBoxElem.style.top = `${y - 20 / 2}px`;
  });

  //   Handle Collision
  const handleReddotCollision = (
    _event: IEventCollision<Engine>,
    redDotBody: Body,
    otherBody: Body
  ) => {
    // Remove reddot on collide with GROUND_CATEGORY
    if (otherBody.collisionFilter.category === GROUND_CATEGORY) {
      Composite.remove(engine.world, redDotBody);
    }
    // Blink the white dot VFX on collide with WHITE_DOTS_CATEGORY
    if (otherBody.collisionFilter.category === WHITE_DOTS_CATEGORY) {
      const index = parseInt(otherBody.label.split("_")[1]);
      const whiteDotVFXBody = whiteDotVFX[index];
      if (!whiteDotVFXBody) return;
      whiteDotVFXBody.circleRadius = 0;
      gsap.to(whiteDotVFXBody, {
        circleRadius: 12,
        duration: 0.2,
      });
      gsap.to(whiteDotVFXBody.render, {
        opacity: 0.7,
        scale: 1.5,
        duration: 0.3,
        onComplete: () => {
          gsap.to(whiteDotVFXBody.render, {
            opacity: 0,
            duration: 0.3,
          });
        },
      });
    }
    // Animate the scoreBox on collide with scoreBox & remove the redDot
    if (otherBody.collisionFilter.category === SCOREBOX_CATEGORY) {
      const scoreBoxIndex = parseInt(otherBody.label.split("_")[1]);
      const scoreBoxElem = scoreBoxElems[scoreBoxIndex];
      if (!scoreBoxElem) return;
      scoreBoxElem.classList.remove("animate-scoring");
      addScoreHistory({
        value: scoreBoxElem.innerText,
        color: scoreBoxElem.style.backgroundColor,
      });
      setTimeout(() => {
        scoreBoxElem.classList.add("animate-scoring");
      }, 100);
      Composite.remove(engine.world, redDotBody);
    }
  };

  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    pairs.forEach(({ bodyA, bodyB }) => {
      if (bodyA.collisionFilter.category === RED_DOTS_CATEGORY) {
        handleReddotCollision(event, bodyA, bodyB);
      }
      if (bodyB.collisionFilter.category === RED_DOTS_CATEGORY) {
        handleReddotCollision(event, bodyB, bodyA);
      }
    });
  });
  // add all of the bodies to the world
  Composite.add(engine.world, [
    ...whiteDots,
    ...whiteDotVFX,
    ground,
    leftBorder,
    rightBorder,
    ...scoreBoxBodies,
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
        category: RED_DOTS_CATEGORY,
        mask: WHITE_DOTS_CATEGORY | GROUND_CATEGORY | SCOREBOX_CATEGORY,
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
