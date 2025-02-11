import { useEffect, useRef, useState } from 'react'
import './App.css'
import { createWorld } from './utils/game'

function App() {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (container.current === null) return;
    const world = createWorld(container.current);
    return world.cleanup;
  }, []);
  return (
    <>
      <div ref={container}></div>
    </>
  )
}

export default App
