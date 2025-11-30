import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const IntroAnimation = () => {
  const [showIntro, setShowIntro] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [terminalText, setTerminalText] = useState('')
  const terminalCommands = useRef([
    '> Initializing system...',
    '> Checking dependencies...',
    '> Loading assets...',
    '> Compiling components...',
    '> Optimizing performance...',
    '> Building UI framework...',
    '> Applying neon theme...',
    '> Finalizing animations...',
    '> System ready!',
  ])
  const commandIndex = useRef(0)
  const terminalStarted = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    life: number
  }>>([])

  useEffect(() => {
    const introShown = localStorage.getItem('intro_seen')
    
    if (introShown === 'true') {
      return
    }
    setShowIntro(true)
    document.body.style.overflow = 'hidden'

    // Fases de la animación (total ~25 segundos)
    const phases = [
      { start: 0, end: 2, name: 'blue-screen' },      // 0-2s: Pantalla azul
      { start: 2, end: 4, name: 'glitch' },         // 2-4s: Efecto glitch
      { start: 4, end: 12, name: 'terminal' },      // 4-12s: Terminal
      { start: 12, end: 14, name: 'explosion' },    // 12-14s: Explosión
      { start: 14, end: 20, name: 'loading-3d' },  // 14-20s: Carga 3D
      { start: 20, end: 25, name: 'final-text' }    // 20-25s: Texto final
    ]

    const startTime = performance.now()
    const startTimeRef = useRef(startTime)

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current

      const currentPhaseIndex = phases.findIndex(
        phase => elapsed >= phase.start * 1000 && elapsed < phase.end * 1000
      )

      if (currentPhaseIndex !== -1 && currentPhaseIndex !== currentPhase) {
        setCurrentPhase(currentPhaseIndex)
      }

      if (elapsed < 25000) {
        requestAnimationFrame(animate)
      } else {
        localStorage.setItem('intro_seen', 'true')
        setTimeout(() => {
          setShowIntro(false)
          document.body.style.overflow = ''
        }, 500)
      }
    }

    requestAnimationFrame(animate)

    // Terminal typing effect
    let terminalTimeout: NodeJS.Timeout | null = null
    const startTerminalTyping = () => {
      if (commandIndex.current < terminalCommands.current.length) {
        const command = terminalCommands.current[commandIndex.current]
        let charIndex = 0
        const typeCommand = () => {
          if (charIndex < command.length) {
            setTerminalText(prev => prev + command[charIndex])
            charIndex++
            terminalTimeout = setTimeout(typeCommand, 50)
          } else {
            setTerminalText(prev => prev + '\n')
            commandIndex.current++
            if (commandIndex.current < terminalCommands.current.length) {
              terminalTimeout = setTimeout(() => {
                setTerminalText('')
                startTerminalTyping()
              }, 500)
            }
          }
        }
        typeCommand()
      }
    }

    // Iniciar typing cuando entre en fase de terminal
    const checkPhase = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current
      const currentPhaseValue = phases.findIndex(
        phase => elapsed >= phase.start * 1000 && elapsed < phase.end * 1000
      )
      if (currentPhaseValue === 2 && !terminalStarted.current) {
        terminalStarted.current = true
        commandIndex.current = 0
        setTerminalText('')
        startTerminalTyping()
      }
    }, 100)

    // Canvas particles para explosión y efectos
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      const colors = ['#00F0FF', '#BD00FF', '#00FF94', '#FF0055', '#FFD600', '#FFFFFF']

      const createParticle = (x: number, y: number, color?: string, speed?: number) => {
        const angle = Math.random() * Math.PI * 2
        const velocity = speed || (Math.random() * 10 + 5)
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 6 + 3,
          color: color || colors[Math.floor(Math.random() * colors.length)],
          life: 1
        })
      }

      // Explosión grande
      const explode = (x: number, y: number, count: number) => {
        for (let i = 0; i < count; i++) {
          createParticle(x, y, undefined, Math.random() * 15 + 8)
        }
      }

      let lastTime = 0
      const targetFPS = 60
      const frameInterval = 1000 / targetFPS

      const animateCanvas = (currentTime: number) => {
        const deltaTime = currentTime - lastTime

        if (deltaTime >= frameInterval) {
          lastTime = currentTime - (deltaTime % frameInterval)

          ctx.fillStyle = 'rgba(5, 5, 5, 0.15)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Limitar partículas
          if (particlesRef.current.length > 300) {
            particlesRef.current = particlesRef.current.slice(-300)
          }

          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i]
            p.x += p.vx
            p.y += p.vy
            p.vx *= 0.98
            p.vy *= 0.98
            p.life -= 0.015

            if (p.life <= 0 || p.x < -100 || p.x > canvas.width + 100 || p.y < -100 || p.y > canvas.height + 100) {
              particlesRef.current.splice(i, 1)
              continue
            }

            ctx.globalAlpha = p.life
            ctx.fillStyle = p.color
            ctx.shadowBlur = 30
            ctx.shadowColor = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.globalAlpha = 1
          ctx.shadowBlur = 0
        }

        requestAnimationFrame(animateCanvas)
      }

      requestAnimationFrame(animateCanvas)

      // Explosión en fase de explosión
      setTimeout(() => {
        explode(canvas.width / 2, canvas.height / 2, 200)
      }, 12000)

      return () => {
        clearInterval(checkPhase)
        if (terminalTimeout) clearTimeout(terminalTimeout)
        window.removeEventListener('resize', resizeCanvas)
      }
    }
  }, [])

  if (!showIntro) return null

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] overflow-hidden"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen', zIndex: 1 }}
          />

          {/* Fase 1: Pantalla Azul (0-2s) */}
          {currentPhase === 0 && (
            <motion.div
              key="blue-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0066FF] flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 md:w-24 md:h-24 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
                />
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-xl md:text-3xl font-bold font-pixel"
                >
                  INICIANDO SISTEMA...
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {/* Fase 2: Glitch (2-4s) */}
          {currentPhase === 1 && (
            <motion.div
              key="glitch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              <div className="relative">
                {/* RGB Split Glitch */}
                {['#FF0000', '#00FF00', '#0000FF'].map((color, i) => (
                  <motion.h1
                    key={i}
                    className="absolute text-4xl md:text-7xl lg:text-9xl font-black font-pixel"
                    style={{
                      color: color,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      textShadow: `0 0 40px ${color}`,
                    }}
                    animate={{
                      x: [
                        `calc(-50% + ${i === 0 ? -5 : i === 1 ? 0 : 5}px)`,
                        `calc(-50% + ${i === 0 ? 5 : i === 1 ? 0 : -5}px)`,
                        `calc(-50% + ${i === 0 ? -5 : i === 1 ? 0 : 5}px)`,
                      ],
                      y: [
                        `calc(-50% + ${i === 0 ? -3 : i === 1 ? 0 : 3}px)`,
                        `calc(-50% + ${i === 0 ? 3 : i === 1 ? 0 : -3}px)`,
                        `calc(-50% + ${i === 0 ? -3 : i === 1 ? 0 : 3}px)`,
                      ],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 0.1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    ERROR
                  </motion.h1>
                ))}
                <motion.h1
                  className="relative text-4xl md:text-7xl lg:text-9xl font-black text-white font-pixel"
                  style={{
                    textShadow: '0 0 60px rgba(255,255,255,0.8)',
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 0.15,
                    repeat: Infinity,
                  }}
                >
                  ERROR
                </motion.h1>
              </div>

              {/* Scanlines */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full h-px bg-white"
                    style={{ top: `${(i * 100) / 20}%` }}
                    animate={{
                      opacity: [0.1, 0.5, 0.1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Fase 3: Terminal (4-12s) */}
          {currentPhase === 2 && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex items-center justify-center p-4 md:p-8"
              style={{ zIndex: 10 }}
            >
              <div className="w-full max-w-4xl bg-[#0A0A0A] border-2 border-neon-green rounded-lg p-4 md:p-6 font-mono">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-text-secondary text-xs md:text-sm ml-4">terminal@gamesfullz:~$</span>
                </div>
                <div className="text-neon-green text-xs md:text-sm lg:text-base h-64 md:h-80 overflow-y-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap font-mono">
                    {terminalText}
                    {currentPhase === 2 && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-neon-green"
                      >
                        ▊
                      </motion.span>
                    )}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* Fase 4: Explosión (12-14s) */}
          {currentPhase === 3 && (
            <motion.div
              key="explosion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              {/* Flash blanco */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 3, 3],
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-white"
              />
              
              {/* Círculos expandiéndose */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border-2 rounded-full"
                  style={{
                    borderColor: ['#00F0FF', '#BD00FF', '#00FF94', '#FF0055', '#FFD600'][i],
                    width: 100 + i * 150,
                    height: 100 + i * 150,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 2, 2.5],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Fase 5: Carga 3D (14-20s) */}
          {currentPhase === 4 && (
            <motion.div
              key="loading-3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              <div className="relative">
                {/* Cubo 3D rotando */}
                <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64" style={{ perspective: '1000px' }}>
                  <motion.div
                    animate={{
                      rotateX: [0, 360],
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {/* Caras del cubo */}
                    {[
                      { rotate: 'rotateY(0deg)', color: '#00F0FF' },
                      { rotate: 'rotateY(90deg)', color: '#BD00FF' },
                      { rotate: 'rotateY(180deg)', color: '#00FF94' },
                      { rotate: 'rotateY(-90deg)', color: '#FF0055' },
                      { rotate: 'rotateX(90deg)', color: '#FFD600' },
                      { rotate: 'rotateX(-90deg)', color: '#FFFFFF' },
                    ].map((face, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-full border-2"
                        style={{
                          background: `linear-gradient(135deg, ${face.color}20, ${face.color}40)`,
                          borderColor: face.color,
                          transform: `${face.rotate} translateZ(calc(50% - 2px))`,
                          backfaceVisibility: 'hidden',
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Texto de carga */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-8 text-white text-lg md:text-2xl font-pixel"
                  style={{ textShadow: '0 0 20px rgba(0,240,255,0.8)' }}
                >
                  CARGANDO...
                </motion.p>

                {/* Barra de progreso */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'easeInOut' }}
                  className="h-2 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green rounded-full mt-4"
                  style={{ boxShadow: '0 0 20px rgba(0,240,255,0.5)' }}
                />
              </div>
            </motion.div>
          )}

          {/* Fase 6: Texto Final (20-25s) */}
          {currentPhase === 5 && (
            <motion.div
              key="final-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              <div className="text-center">
                {/* GAMESFULLZ */}
                <motion.h1
                  initial={{ opacity: 0, y: 100, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    opacity: { duration: 0.8 },
                    y: { type: 'spring', stiffness: 100, damping: 15 },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="text-5xl md:text-7xl lg:text-9xl font-black font-pixel mb-4 md:mb-6 relative"
                  style={{
                    background: 'linear-gradient(45deg, #00F0FF, #BD00FF, #00FF94, #FF0055, #00F0FF)',
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 30px rgba(0,240,255,0.8))',
                  }}
                >
                  <motion.span
                    animate={{
                      backgroundPosition: ['0%', '100%', '0%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      background: 'linear-gradient(45deg, #00F0FF, #BD00FF, #00FF94, #FF0055, #00F0FF)',
                      backgroundSize: '300% 300%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    GAMESFULLZ
                  </motion.span>
                  {/* Glow effect behind text */}
                  <motion.div
                    className="absolute inset-0 blur-2xl -z-10"
                    style={{
                      background: 'linear-gradient(45deg, #00F0FF, #BD00FF, #00FF94)',
                      opacity: 0.6,
                    }}
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.h1>

                {/* V2 Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{
                    opacity: 1,
                    scale: [0, 1.3, 1],
                    rotate: [180, 0],
                  }}
                  transition={{
                    delay: 0.5,
                    duration: 1,
                    type: 'spring',
                    stiffness: 150,
                  }}
                  className="inline-block"
                >
                  <motion.span
                    className="text-3xl md:text-5xl lg:text-7xl font-black text-neon-blue font-pixel"
                    animate={{
                      textShadow: [
                        '0 0 30px rgba(0,240,255,0.6)',
                        '0 0 60px rgba(0,240,255,1)',
                        '0 0 30px rgba(0,240,255,0.6)',
                      ],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    V2.0
                  </motion.span>
                </motion.div>

                {/* Subtítulo */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1,
                  }}
                  className="mt-6 md:mt-8 text-neon-blue text-lg md:text-2xl lg:text-3xl font-pixel"
                  style={{ textShadow: '0 0 40px rgba(0,240,255,0.8)' }}
                >
                  Next Level Gaming
                </motion.p>

                {/* Partículas orbitando */}
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full"
                    style={{
                      background: ['#00F0FF', '#BD00FF', '#00FF94'][i % 3],
                      boxShadow: `0 0 10px ${['#00F0FF', '#BD00FF', '#00FF94'][i % 3]}`,
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [
                        Math.cos((i / 16) * Math.PI * 2) * 150,
                        Math.cos((i / 16) * Math.PI * 2 + Math.PI) * 200,
                        Math.cos((i / 16) * Math.PI * 2) * 150,
                      ],
                      y: [
                        Math.sin((i / 16) * Math.PI * 2) * 150,
                        Math.sin((i / 16) * Math.PI * 2 + Math.PI) * 200,
                        Math.sin((i / 16) * Math.PI * 2) * 150,
                      ],
                      scale: [0.5, 1.5, 0.5],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default IntroAnimation
