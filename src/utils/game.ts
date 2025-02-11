import { Engine, Render, Runner, Composite, Bodies } from "matter-js";

export const createWorld = (container: HTMLDivElement) => {
  // create an engine
  const engine = Engine.create();

  // create a renderer
  const render = Render.create({
    element: container,
    engine: engine,
  });

  // create two boxes and a ground
  const redDotA = Bodies.circle(470, 50, 10, { collisionFilter: { group: 1 } });
  const redDotB = Bodies.circle(450, 50, 10, { collisionFilter: { group: 1 } });
  const whiteDots = [
    Bodies.circle(400, 50, 10, { isStatic: true }),
    Bodies.circle(450, 50, 10, { isStatic: true }),
  ];
  const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  Composite.add(engine.world, [redDotA, redDotB, ...whiteDots, ground]);

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

  return {
    engine,
    render,
    runner,
    boxA: redDotA,
    cleanup,
  };
};
