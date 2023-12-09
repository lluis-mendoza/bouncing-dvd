import { useEffect, useMemo, useRef, useState } from 'react';
import { FaFastBackward, FaFastForward, FaPause, FaPlay } from 'react-icons/fa';
import Confetti from 'react-confetti';
import './App.css';

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const lcm = (a: number, b: number): number => {
  return (Math.abs(a) * Math.abs(b)) / gcd(a, b);
};

const height = 200;
const width = height * 2;
const stepSize = 10;
const colorList = [
  '#ffffff',
  '#898588',
  '#daf6f0',
  '#c6ec61',
  '#cf967c',
  '#f69b90',
  '#bcf5c3',
  '#52907e',
  '#595685',
  '#dca3a2',
  '#559c9c',
  '#e5d793',
  '#74ea8d',
];
const REMAINING_STEPS_ZOOM = 20
const DEFAULT_INTERVAL_SPEED = 40
const DEFAULT_FACTOR = 1
function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [screenSize, setScreenSize] = useState(getScreenSize())
  const [factor, setFactor] = useState(DEFAULT_FACTOR)
  const lastFactor = useRef(DEFAULT_FACTOR)
  const [movesLeft, setMovesLeft] = useState<number>(-1)
  const [color, setColor] = useState(getRandomColor())
  const [showConfetti, setShowConfetti] = useState(false)
  const direction = useRef({ dx: 1, dy: 1})
  const [zoomOrigin, setZoomOrigin] = useState({x: 0, y: 0})
  const intervalSpeed = useMemo(() => DEFAULT_INTERVAL_SPEED  * factor, [factor])
  const showZoom = useMemo(() => movesLeft > 0 && movesLeft < REMAINING_STEPS_ZOOM, [movesLeft])
  const [isPaused, setIsPaused] = useState(false)
  const snowCanvasRef = useRef<HTMLCanvasElement>(null)
  const vcrCanvasRef = useRef<HTMLCanvasElement>(null)

  function getRandomColor(){
    const randomIndex = Math.round(Math.random() * (colorList.length - 1))
    return colorList[randomIndex]
  }
  function getScreenSize(){
    const width = Math.floor(window.innerWidth / stepSize) * stepSize
    const height = Math.floor(window.innerHeight / stepSize) * stepSize
    return { width, height }
  }

  useEffect(() => {
    if (movesLeft >= 0) return
    const M = screenSize.width / stepSize
    const N = screenSize.height / stepSize
    const n = height / stepSize
    const m = width / stepSize
    const a = M-m
    const b = N-n
    const res = lcm(a, b)
    setMovesLeft(res - 1)
  },[movesLeft, screenSize])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused === true) return
      setMovesLeft(_movesLeft => _movesLeft - 1)
      setPosition(_position => {
        const newDirection = { ...direction.current };
        const newPosition = {..._position}
        if (_position.x + width + direction.current.dx * stepSize > screenSize.width ||
          _position.x + direction.current.dx * stepSize < 0) {
          newDirection.dx = -direction.current.dx;
          setColor(getRandomColor())
        }
  
        if (_position.y + height + direction.current.dy * stepSize > screenSize.height ||
          _position.y + direction.current.dy * stepSize < 0) {
          newDirection.dy = -direction.current.dy
          setColor(getRandomColor())
        }
  
        newPosition.x += newDirection.dx * stepSize;
        newPosition.y += newDirection.dy * stepSize;
  
        if ((newPosition.x == 0 || newPosition.x + width == screenSize.width) &&
            (newPosition.y == 0 || newPosition.y + height == screenSize.height)) console.log("Esquinaa")
        direction.current = newDirection
        
        return newPosition
      })
    }, intervalSpeed)
    return () => clearInterval(interval)
  },[intervalSpeed, isPaused, screenSize])

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize(getScreenSize())
      setPosition({ x: 0, y: 0 })
      setMovesLeft(-1)
      direction.current = { dx: 1, dy: 1}
    }
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])
  useEffect(() => {
    if (movesLeft == 0){
      setShowConfetti(true)
    }
  },[movesLeft])
  useEffect(() => {
    if (showZoom){
      const x = direction.current.dx < 0 ? 0 : 100
      const y = direction.current.dy < 0 ? 0 : 100
      setZoomOrigin({x, y})
      setFactor(_factor => {
        lastFactor.current = _factor
        return 1.5
      })
    }
    else setFactor(lastFactor.current)
  },[showZoom])
  useEffect(() => {
    const intervalSnow = setInterval(() => {
      generateSnow()
    }, 100)
    const intervalVcr = setInterval(() => {
      renderTrackingNoise()
    }, 50)
    return () => {
      clearInterval(intervalSnow)
      clearInterval(intervalVcr)
    }
  },[])
  const handleFastBackward = () => {    
    setFactor(_factor => Math.min(_factor + 0.2, 1.8))
  }
  const handleFastForward = () => {
    setFactor(_factor => Math.max(_factor - 0.2, 0.2))
  }
  const getTime = (movesLeft: number):string => {
    const miliSeconds = movesLeft * intervalSpeed
    return `${(miliSeconds/1000).toFixed(2)}S`
  }
  const getZoom = () => {
    return showZoom ? 5 : 1
  }
  const generateSnow = () => {
    if (snowCanvasRef.current == null) return
    const canvas = snowCanvasRef.current
    const ctx = canvas.getContext("2d")!
    const w = ctx.canvas.width,
    h = ctx.canvas.height,
    d = ctx.createImageData(w, h),
    b = new Uint32Array(d.data.buffer),
    len = b.length;

    for (var i = 0; i < len; i++) {
      b[i] = ((255 * Math.random()) | 0) << 24;
    }

    ctx.putImageData(d, 0, 0);
  }
  const renderTrackingNoise = (radius = 1) => {
    if (vcrCanvasRef.current == null) return
    const canvas = vcrCanvasRef.current
    const ctx = canvas.getContext("2d")!
		let posy1 = 0;
		let posy2 = canvas.height;
		let posy3 = 0;
		const num = 60;
		
		canvas.style.filter = `blur(2px)`;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = `#fff`;

		ctx.beginPath();
		for (var i = 0; i <= num; i++) {
			var x = Math.random() * canvas.width;
			var y1 = getRandomInt(posy1+=3, posy2);
			var y2 = getRandomInt(0, posy3-=3);
			ctx.fillRect(x, y1, radius, radius);
			ctx.fillRect(x, y2, radius, radius);
			ctx.fill();

			renderTail(ctx, x, y1, radius);
			renderTail(ctx, x, y2, radius);
		}
		ctx.closePath();
	}

	const renderTail = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
		const n = getRandomInt(1, 50);
		const dirs = [1, -1];
		let rd = radius;
		const dir = dirs[Math.floor(Math.random() * dirs.length)];
		for (let i = 0; i < n; i++) {
			const step = 0.01;
			let r = getRandomInt((rd -= step), radius);
			let dx = getRandomInt(1, 4);
			radius -= 0.1;
			dx *= dir;
			ctx.fillRect((x += dx), y, r, r);
			ctx.fill();
		}
	}
  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const handlePause = () => {
    setIsPaused(isPaused => !isPaused)
  }
  return (
    <>
      <div className="screen wobbley" style={{ width: screenSize.width, height: screenSize.height }}>
        <div id="interlaced"></div>
        <div className='wave-wrapper'>
          <div className='wave'></div>
        </div>
        {
          !showZoom ?
          <div className='info-display'>
            <span>{`X${(2-factor).toFixed(2)}`}</span>
            <div className='buttons-container'>
              <button onClick={handleFastBackward}>
                <FaFastBackward/>
              </button>
              <button onClick={handlePause}>
                {
                  isPaused ?
                  <FaPlay /> :
                  <FaPause/>                    
                }
              </button>
              <button onClick={handleFastForward}>
                <FaFastForward/>
              </button>
            </div>
            <span>{getTime(movesLeft)}</span>
          </div> 
          : null
        }
        <div className='zoom-container' style={{transform: `scale(${getZoom()})`, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`}}>
          <svg viewBox="0 0 210 107" width={width} height={height} fill={color} style={{position: "absolute", top: position.y, left: position.x}}>
            <path d="M118.895,20.346c0,0-13.743,16.922-13.04,18.001c0.975-1.079-4.934-18.186-4.934-18.186s-1.233-3.597-5.102-15.387H81.81H47.812H22.175l-2.56,11.068h19.299h4.579c12.415,0,19.995,5.132,17.878,14.225c-2.287,9.901-13.123,14.128-24.665,14.128H32.39l5.552-24.208H18.647l-8.192,35.368h27.398c20.612,0,40.166-11.067,43.692-25.288c0.617-2.614,0.53-9.185-1.054-13.053c0-0.093-0.091-0.271-0.178-0.537c-0.087-0.093-0.178-0.722,0.178-0.814c0.172-0.092,0.525,0.271,0.525,0.358c0,0,0.179,0.456,0.351,0.813l17.44,50.315l44.404-51.216l18.761-0.092h4.579c12.424,0,20.09,5.132,17.969,14.225c-2.29,9.901-13.205,14.128-24.75,14.128h-4.405L161,19.987h-19.287l-8.198,35.368h27.398c20.611,0,40.343-11.067,43.604-25.288c3.347-14.225-11.101-25.293-31.89-25.293h-18.143h-22.727C120.923,17.823,118.895,20.346,118.895,20.346L118.895,20.346z"/>
            <path d="M99.424,67.329C47.281,67.329,5,73.449,5,81.012c0,7.558,42.281,13.678,94.424,13.678c52.239,0,94.524-6.12,94.524-13.678C193.949,73.449,151.664,67.329,99.424,67.329z M96.078,85.873c-11.98,0-21.58-2.072-21.58-4.595c0-2.523,9.599-4.59,21.58-4.59c11.888,0,21.498,2.066,21.498,4.59C117.576,83.801,107.966,85.873,96.078,85.873z"/>
          </svg>
          <div className='vignette'></div>
        </div>
        <canvas id="vcr" width={screenSize.width} height={screenSize.height} ref={vcrCanvasRef}></canvas>
        <canvas id="snow" width={screenSize.width} height={screenSize.height} ref={snowCanvasRef}></canvas>
      </div>
      <Confetti
        numberOfPieces={showConfetti ? 500: 0}
        width={screenSize.width}
        height={screenSize.height}
        recycle={false}
        onConfettiComplete={confetti => {
          setShowConfetti(false)
          confetti?.reset()
        }}
        />
    </>
  )
}

export default App
