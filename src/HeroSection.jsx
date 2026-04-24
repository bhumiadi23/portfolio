import React, { useRef, useState, useEffect, Suspense } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import { Zap, Mail, Terminal as TermIcon, Code2, ChevronDown } from 'lucide-react';
import './HeroSection.css';

/* ── 3D Mesh ─────────────────────────────────────────────────────────────── */
function AvatarMesh({ mouseRef }) {
  const meshRef  = useRef();
  const ringRef  = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!meshRef.current) return;
    meshRef.current.rotation.y += (mouseRef.current.x * 0.5 - meshRef.current.rotation.y) * 0.06;
    meshRef.current.rotation.x += (-mouseRef.current.y * 0.3 - meshRef.current.rotation.x) * 0.06;
    meshRef.current.position.y = Math.sin(t * 0.9) * 0.1;
    if (ringRef.current) ringRef.current.rotation.y = t * 0.4;
  });

  return (
    <group>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -1.25, 0]}>
        <torusGeometry args={[1.1, 0.035, 16, 100]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.5} transparent opacity={0.65} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.6, 0]} position={[0, -1.25, 0]}>
        <torusGeometry args={[1.45, 0.018, 16, 100]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} transparent opacity={0.3} />
      </mesh>
      <Float speed={2.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <mesh ref={meshRef} castShadow>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#6d28d9"
            emissive="#4c1d95"
            emissiveIntensity={0.5}
            roughness={0.08}
            metalness={0.85}
            distort={0.38}
            speed={2.5}
          />
        </mesh>
      </Float>
      {[
        { pos: [1.55, 0.4, 0.1],  col: '#ec4899', r: 0.17, spd: 2.8 },
        { pos: [-1.5, -0.2, 0.2], col: '#22d3ee', r: 0.13, spd: 2.1 },
        { pos: [0.7, -1.1, 0.5],  col: '#f59e0b', r: 0.1,  spd: 3.2 },
      ].map((o, i) => (
        <Float key={i} speed={o.spd} floatIntensity={1.1}>
          <mesh position={o.pos}>
            <sphereGeometry args={[o.r, 32, 32]} />
            <meshStandardMaterial color={o.col} emissive={o.col} emissiveIntensity={2.5} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene({ mouseRef }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.3} />
      <pointLight position={[-3, 2, 2]} intensity={2}   color="#a855f7" />
      <pointLight position={[3, -2, 2]} intensity={1.2} color="#22d3ee" />
      <AvatarMesh mouseRef={mouseRef} />
      <OrbitControls enableZoom={false} enablePan={false}
        maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 3} rotateSpeed={0.35} />
    </>
  );
}

/* ── Particles ───────────────────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top:  `${Math.random() * 100}%`,
  size: Math.random() * 2.5 + 1,
  delay:    Math.random() * 7,
  duration: Math.random() * 9 + 7,
  opacity:  Math.random() * 0.45 + 0.08,
}));

/* ── Code snippets ───────────────────────────────────────────────────────── */
const CODE = [
  [{ t:'const ',  c:'#c792ea' },{ t:'aditya', c:'#82aaff' },{ t:' = {', c:'#89ddff' }],
  [{ t:'  role',  c:'#f07178' },{ t:': ',     c:'#89ddff' },{ t:'"Full Stack Developer"',  c:'#c3e88d' },{ t:',', c:'#89ddff' }],
  [{ t:'  skills',c:'#f07178' },{ t:': [',    c:'#89ddff' },{ t:'"React"', c:'#c3e88d' },{ t:', ', c:'#89ddff' },{ t:'"Node"', c:'#c3e88d' },{ t:', ', c:'#89ddff' },{ t:'"AI"', c:'#c3e88d' },{ t:', ', c:'#89ddff' },{ t:'"DSA"',  c:'#c3e88d' },{ t:'],', c:'#89ddff' }],
  [{ t:'  cgpa',  c:'#f07178' },{ t:': ',     c:'#89ddff' },{ t:'8.33', c:'#f78c6c' },{ t:',', c:'#89ddff' }],
  [{ t:'  problems',c:'#f07178'},{ t:': ',     c:'#89ddff' },{ t:'"600+"',  c:'#c3e88d' },{ t:',', c:'#89ddff' }],
  [{ t:'  status', c:'#f07178' },{ t:': ',     c:'#89ddff' },{ t:'"Open to Work 🚀"', c:'#c3e88d' }],
  [{ t:'};',       c:'#89ddff' }],
];

const TERMINAL = [
  { prompt:true, cmd:'whoami' },
  { out:'Aditya Roy  —  Full Stack Developer' },
  { prompt:true, cmd:'skills' },
  { out:'React  ·  Node.js  ·  Python  ·  AI/ML  ·  DSA' },
  { prompt:true, cmd:'stats' },
  { out:'600+ problems  ·  15+ certs  ·  CGPA 8.33  ·  SAIL intern' },
  { prompt:true, cmd:'status' },
  { out:'✅  Available for work 🚀' },
];

const STATS = [
  { icon:'🏆', val:'600+', label:'Problems Solved', color:'#FFA116' },
  { icon:'📜', val:'15+',  label:'Certifications',  color:'#a855f7' },
  { icon:'⭐', val:'8.33', label:'CGPA',             color:'#22d3ee' },
];

/* ── Blinking cursor ─────────────────────────────────────────────────────── */
const Cursor = () => <span className="hs-cursor" />;

/* ── Animated counter ────────────────────────────────────────────────────── */
function Counter({ target }) {
  const [n, setN] = useState(0);
  const num = parseInt(target);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(num / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= num) { setN(num); clearInterval(t); }
      else setN(start);
    }, 40);
    return () => clearInterval(t);
  }, [num]);
  return <>{n}{isNaN(num) ? '' : target.replace(String(num), '')}</>;
}

/* ── Code card ───────────────────────────────────────────────────────────── */
function CodeCard({ rotX, rotY }) {
  const [lines, setLines] = useState(0);
  useEffect(() => {
    setLines(0);
    const id = setInterval(() => setLines(v => { if (v >= CODE.length) { clearInterval(id); return v; } return v+1; }), 260);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div className="hs-card" style={{ rotateX:rotY, rotateY:rotX, transformStyle:'preserve-3d' }}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
      <div className="hs-card-glow" />
      <div className="hs-bar">
        <span className="hs-dot r"/><span className="hs-dot y"/><span className="hs-dot g"/>
        <span className="hs-filename">aditya.js</span><span className="hs-lang">JavaScript</span>
      </div>
      <div className="hs-body">
        {CODE.slice(0, lines).map((ln, li) => (
          <motion.div key={li} className="hs-line" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.15 }}>
            <span className="hs-ln">{li+1}</span>
            <span>{ln.map((t, ti) => <span key={ti} style={{ color:t.c }}>{t.t}</span>)}
              {li === lines-1 && <Cursor />}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Terminal card ───────────────────────────────────────────────────────── */
function TermCard({ rotX, rotY }) {
  const [lines, setLines] = useState(0);
  useEffect(() => {
    setLines(0);
    const id = setInterval(() => setLines(v => { if (v >= TERMINAL.length) { clearInterval(id); return v; } return v+1; }), 380);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div className="hs-card hs-term-card" style={{ rotateX:rotY, rotateY:rotX, transformStyle:'preserve-3d' }}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
      <div className="hs-card-glow hs-card-glow-cyan" />
      <div className="hs-bar">
        <span className="hs-dot r"/><span className="hs-dot y"/><span className="hs-dot g"/>
        <span className="hs-filename">terminal — zsh</span>
      </div>
      <div className="hs-body hs-term-body">
        {TERMINAL.slice(0, lines).map((ln, i) =>
          ln.prompt
            ? <motion.div key={i} className="hs-tprompt" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <span className="hs-tsign">❯</span>
                <span className="hs-tcmd">{ln.cmd}</span>
                {i === lines-1 && <Cursor />}
              </motion.div>
            : <motion.div key={i} className="hs-tout" initial={{ opacity:0 }} animate={{ opacity:1 }}>{ln.out}</motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const [termMode, setTermMode] = useState(false);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const cardAreaRef = useRef();

  const onMouseMove = (e) => {
    const { innerWidth: W, innerHeight: H } = window;
    mouseRef.current = { x: (e.clientX/W - 0.5) * 2, y: (e.clientY/H - 0.5) * 2 };
    if (cardAreaRef.current) {
      const r  = cardAreaRef.current.getBoundingClientRect();
      rotX.set(((e.clientX - r.left - r.width/2)  / r.width)  * 14);
      rotY.set(-((e.clientY - r.top  - r.height/2) / r.height) * 14);
    }
  };
  const onMouseLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <section className="hs-section" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} id="about">
      {/* Particles */}
      <div className="hs-particles">
        {PARTICLES.map(p => (
          <div key={p.id} className="hs-particle" style={{
            left:p.left, top:p.top, width:p.size, height:p.size,
            animationDelay:`${p.delay}s`, animationDuration:`${p.duration}s`, opacity:p.opacity,
          }}/>
        ))}
      </div>

      {/* Background blobs */}
      <div className="hs-blob hs-blob-1" />
      <div className="hs-blob hs-blob-2" />
      <div className="hs-blob hs-blob-3" />

      <div className="hs-grid">
        {/* ── LEFT: 3D canvas ── */}
        <motion.div className="hs-canvas-col"
          initial={{ opacity:0, x:-60 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.9, type:'spring', bounce:0.25 }}>
          <div className="hs-canvas-glow" />
          <Canvas camera={{ position:[0,0,4], fov:50 }} shadows dpr={[1,2]} style={{ width:'100%', height:'100%', position:'relative', zIndex:1 }}>
            <Suspense fallback={null}>
              <Scene mouseRef={mouseRef} />
            </Suspense>
          </Canvas>
          <div className="hs-name-tag">
            <div className="hs-name">Aditya Roy</div>
            <div className="hs-subtitle-tag">Full Stack · AI · Competitive Dev</div>
          </div>
        </motion.div>

        {/* ── RIGHT ── */}
        <motion.div className="hs-right-col"
          initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.9, type:'spring', bounce:0.25, delay:0.15 }}>

          {/* Tagline */}
          <motion.p className="hs-tagline"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
            I build scalable systems, solve{' '}
            <span className="hs-accent">600+ problems</span>, and ship real products.
          </motion.p>

          {/* Toggle */}
          <motion.button className="hs-toggle" onClick={() => setTermMode(m => !m)}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }}
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
            {termMode ? <><Code2 size={14}/> Code View</> : <><TermIcon size={14}/> Terminal Mode</>}
          </motion.button>

          {/* Card */}
          <div ref={cardAreaRef} style={{ perspective:'1000px' }}>
            <AnimatePresence mode="wait">
              {termMode
                ? <TermCard key="term" rotX={rotX} rotY={rotY} />
                : <CodeCard key="code" rotX={rotX} rotY={rotY} />}
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div className="hs-stats">
            {STATS.map((s, i) => (
              <motion.div key={i} className="hs-stat"
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:[0,-7,0] }}
                transition={{ delay:0.9+i*0.2, y:{ repeat:Infinity, duration:2.5+i*0.4, ease:'easeInOut' } }}
                whileHover={{ scale:1.1, boxShadow:`0 0 24px ${s.color}55` }}
                style={{ borderColor:`${s.color}44` }}>
                <span className="hs-stat-ico">{s.icon}</span>
                <div>
                  <div className="hs-stat-val" style={{ color:s.color }}>
                    <Counter target={s.val}/>
                  </div>
                  <div className="hs-stat-lbl">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <motion.div className="hs-ctas"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.3 }}>
            <motion.a href="#projects" className="hs-btn-primary" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
              <Zap size={16}/> View Projects
            </motion.a>
            <motion.a href="mailto:adityakumarroy401@gmail.com" className="hs-btn-ghost" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
              <Mail size={16}/> Hire Me
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a href="#experience" className="hs-scroll" animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:2 }}>
        <ChevronDown size={26}/>
      </motion.a>
    </section>
  );
}
