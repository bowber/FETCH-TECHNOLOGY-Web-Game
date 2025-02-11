import { useEffect, useRef, useState } from 'react'
import './App.css'
import { createWorld } from './utils/game'

const scoreBoxesInfo = [
  { value: "29x", color: "#EA0235" },
  { value: "4x", color: "#F52827" },
  { value: "1.5x", color: "#F0551E" },
  { value: "0.3x", color: "#F28412" },
  { value: "0.2x", color: "#F6B601" },
  { value: "0.3x", color: "#F28412" },
  { value: "1.5x", color: "#F0551E" },
  { value: "4x", color: "#F52827" },
  { value: "29x", color: "#EA0235" },
]

function App() {
  const container = useRef<HTMLDivElement>(null)
  const scoreBoxes = useRef<Array<HTMLDivElement | null>>([])
  const [scoreBoxHistory, setScoreBoxHistory] = useState<Array<{ value: string, color: string }>>([])
  useEffect(() => {
    if (container.current === null) return;
    if (scoreBoxes.current.length === 0) return;
    if (scoreBoxes.current.some(scoreBox => scoreBox === null)) return;
    const world = createWorld(container.current, scoreBoxes.current as HTMLDivElement[]);
    return world.cleanup;
  }, []);
  return (
    <>
      <div ref={container} style={{ position: "relative" }}>
        {scoreBoxesInfo.map((scoreBox, index) => (
          <div
            key={index}
            ref={el => { scoreBoxes.current[index] = el }}
            // Add animate-scoring class to animate the scoreBox
            // className='animate-scoring' 
            style={{
              backgroundColor: scoreBox.color,
              color: 'black',
              position: 'absolute',
              borderRadius: '3px',
              borderBottom: '2px solid rgba(0, 0, 0, 0.5)',
              width: '45px',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px',
            }}
          >
            {scoreBox.value}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
