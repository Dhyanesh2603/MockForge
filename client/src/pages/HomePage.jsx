import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const SunIcon  = () => <Icon d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" size={18}/>;
const MoonIcon = () => <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" size={18}/>;
const ArrowRight = () => <Icon d="M5 12h14M12 5l7 7-7 7" size={16}/>;
const CheckIcon  = () => <Icon d="M20 6L9 17l-5-5" size={15}/>;

/* ── Navbar ─────────────────────────────────────── */
function Navbar({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position:"fixed",top:0,left:0,right:0,zIndex:50,
      transition:"all 0.3s",
      background: scrolled ? "var(--surface)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.12)" : "none",
    }}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
          <div className="bg-forge-gradient" style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:700,fontSize:14}}>M</span>
          </div>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18,color:"var(--text)"}}>
            Mock<span style={{color:"var(--forge)"}}>Forge</span>
          </span>
        </Link>

        <div style={{display:"flex",alignItems:"center",gap:32}}>
          {["Features","How It Works","Why Us"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g,"-")}`}
              style={{color:"var(--text2)",textDecoration:"none",fontSize:14,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="var(--text)"}
              onMouseLeave={e=>e.target.style.color="var(--text2)"}
            >{item}</a>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setDark(!dark)} style={{width:36,height:36,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
            {dark ? <SunIcon/> : <MoonIcon/>}
          </button>
          <Link to="/login" style={{color:"var(--text2)",textDecoration:"none",fontSize:14,padding:"6px 12px"}}>Sign in</Link>
          <Link to="/login" className="bg-forge-gradient glow-blue-sm btn-press" style={{color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600,padding:"8px 18px",borderRadius:10,transition:"opacity 0.2s"}}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",paddingTop:80}}>
      <div className="bg-grid" style={{position:"absolute",inset:0,opacity:1,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(11,165,236,0.12),transparent 70%)",pointerEvents:"none"}}/>

      <div style={{position:"relative",maxWidth:900,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
        {/* Badge */}
        <div className="animate-fade-up" style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:999,padding:"6px 16px",marginBottom:32}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"var(--forge)"}} className="animate-pulse-slow"/>
          <span style={{fontSize:12,fontWeight:600,color:"var(--forge)",letterSpacing:"0.08em",textTransform:"uppercase"}}>AI-Powered Interview Prep</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-100" style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(2.5rem,7vw,5rem)",lineHeight:1.05,marginBottom:24,color:"var(--text)"}}>
          Forge Your<br/>
          <span className="gradient-text">Interview Edge</span>
        </h1>

        <p className="animate-fade-up delay-200" style={{fontSize:18,color:"var(--text2)",maxWidth:560,margin:"0 auto 40px",lineHeight:1.7}}>
          Practice with AI-generated mock interviews tailored to your role, tech stack, and difficulty. Get scored, get feedback, get hired.
        </p>

        <div className="animate-fade-up delay-300" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,flexWrap:"wrap",marginBottom:64}}>
          <Link to="/login" className="bg-forge-gradient glow-blue btn-press" style={{display:"flex",alignItems:"center",gap:8,color:"#fff",textDecoration:"none",fontWeight:600,fontSize:16,padding:"14px 28px",borderRadius:12,transition:"opacity 0.2s"}}>
            Start Practicing Free <ArrowRight/>
          </Link>
          <a href="#how-it-works" style={{color:"var(--text2)",textDecoration:"none",fontSize:15,fontWeight:500}}>See how it works →</a>
        </div>

        {/* Mock terminal */}
        <div className="animate-fade-up delay-400 glass glow-blue" style={{maxWidth:640,margin:"0 auto",borderRadius:20,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.3)"}}>
          {/* Bar */}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,0.05)"}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:"#f87171"}}/>
            <div style={{width:12,height:12,borderRadius:"50%",background:"#fbbf24"}}/>
            <div style={{width:12,height:12,borderRadius:"50%",background:"#34d399"}}/>
            <span style={{marginLeft:12,fontSize:12,color:"var(--text3)",fontFamily:"monospace"}}>MockForge Interview Session</span>
            <span style={{marginLeft:"auto",fontSize:11,background:"rgba(52,211,153,0.12)",color:"#34d399",padding:"2px 10px",borderRadius:999,border:"1px solid rgba(52,211,153,0.25)"}}>● Live</span>
          </div>
          {/* Body */}
          <div style={{padding:24,textAlign:"left"}}>
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#fff",fontSize:11,fontWeight:700}}>AI</span>
              </div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"0 12px 12px 12px",padding:"10px 14px",fontSize:13,color:"var(--text)",lineHeight:1.6,maxWidth:380}}>
                Explain the difference between <code style={{background:"var(--border)",padding:"1px 6px",borderRadius:4,color:"var(--forge)",fontFamily:"monospace",fontSize:12}}>useEffect</code> and <code style={{background:"var(--border)",padding:"1px 6px",borderRadius:4,color:"var(--forge)",fontFamily:"monospace",fontSize:12}}>useLayoutEffect</code> in React.
              </div>
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginBottom:20}}>
              <div style={{background:"rgba(11,165,236,0.08)",border:"1px solid rgba(11,165,236,0.2)",borderRadius:"12px 0 12px 12px",padding:"10px 14px",fontSize:13,color:"var(--text)",lineHeight:1.6,maxWidth:360}}>
                <span style={{color:"var(--forge)"}}>useEffect</span> runs after paint, while <span style={{color:"var(--forge)"}}>useLayoutEffect</span> fires before the browser paints, blocking visually...
              </div>
              <div style={{width:28,height:28,borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--text2)",flexShrink:0}}>U</div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--text3)",display:"flex",justifyContent:"space-between"}}>
                <span>Type your answer...</span>
                <span style={{fontFamily:"monospace",fontSize:12,color:"var(--forge)"}}>28:42</span>
              </div>
              <button className="bg-forge-gradient" style={{color:"#fff",border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Next →</button>
            </div>
          </div>
        </div>

        {/* Score pills */}
        <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16,flexWrap:"wrap"}}>
          {[["92","Technical"],["88","Communication"],["95","Clarity"]].map(([s,l])=>(
            <div key={l} className="glass" style={{borderRadius:999,padding:"6px 16px",display:"flex",alignItems:"center",gap:8}}>
              <span className="gradient-text" style={{fontFamily:"monospace",fontWeight:700,fontSize:14}}>{s}</span>
              <span style={{fontSize:12,color:"var(--text3)"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Logos ───────────────────────────────────────── */
function LogosStrip() {
  return (
    <section style={{padding:"56px 24px",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
      <p style={{textAlign:"center",fontSize:11,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:28}}>Trusted by engineers interviewing at</p>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"12px 40px"}}>
        {["Google","Meta","Amazon","Apple","Microsoft","Stripe","Vercel","Figma"].map(c=>(
          <span key={c} style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:14,color:"var(--text3)",letterSpacing:"0.05em"}}>{c}</span>
        ))}
      </div>
    </section>
  );
}

/* ── Features ────────────────────────────────────── */
const features = [
  {icon:"🧠",title:"AI Question Generation",desc:"Tailored questions for your exact role, stack, and experience level — never the same twice.",grad:"135deg,#3b82f6,#06b6d4"},
  {icon:"🎯",title:"Real-Time Scoring",desc:"Every answer is evaluated by AI. Get a score out of 100 with clear reasoning.",grad:"135deg,#8b5cf6,#a855f7"},
  {icon:"📈",title:"Progress Tracking",desc:"See improvement across sessions with a dashboard that highlights your growth.",grad:"135deg,#10b981,#14b8a6"},
  {icon:"💬",title:"Deep Feedback",desc:"Strengths and weaknesses broken down — not just a number, actionable insights.",grad:"135deg,#f59e0b,#ef4444"},
  {icon:"⚡",title:"Multi-Stack Support",desc:"React, Python, System Design, DevOps — MockForge handles any technology.",grad:"135deg,#ec4899,#f43f5e"},
  {icon:"⏱️",title:"Exam-Grade Pressure",desc:"Timed sessions with auto-submit simulate real interview conditions.",grad:"135deg,#64748b,#475569"},
];

function Features() {
  return (
    <section id="features" style={{padding:"96px 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Features</span>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(2rem,4vw,3rem)",color:"var(--text)",margin:"12px 0 12px",lineHeight:1.15}}>
            Everything you need to <span className="gradient-text">nail it</span>
          </h2>
          <p style={{color:"var(--text2)",maxWidth:480,margin:"0 auto",fontSize:15}}>A complete interview prep system, not just a Q&A generator.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
          {features.map(f=>(
            <div key={f.title} className="glass" style={{borderRadius:20,padding:24,border:"1px solid var(--border)",transition:"all 0.3s",cursor:"default"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,0.2)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
            >
              <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(${f.grad})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:16}}>{f.icon}</div>
              <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,color:"var(--text)",marginBottom:8,fontSize:16}}>{f.title}</h3>
              <p style={{color:"var(--text2)",fontSize:14,lineHeight:1.6,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ────────────────────────────────── */
const steps=[
  {num:"01",icon:"⚙️",title:"Create Your Interview",desc:"Pick your target role, tech stack, and difficulty. MockForge generates the questions."},
  {num:"02",icon:"💬",title:"Answer AI Questions",desc:"Work through a timed session of tailored questions in an exam-like interface."},
  {num:"03",icon:"📊",title:"Get Your Score",desc:"Submit and receive instant AI evaluation with score, strengths, and weaknesses."},
  {num:"04",icon:"🚀",title:"Level Up",desc:"Review feedback, identify gaps, and repeat until you're interview-ready."},
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{padding:"96px 24px",background:"var(--bg2)"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Process</span>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(2rem,4vw,3rem)",color:"var(--text)",margin:"12px 0",lineHeight:1.15}}>
            How it <span className="gradient-text">works</span>
          </h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:24}}>
          {steps.map(s=>(
            <div key={s.num} style={{textAlign:"center",padding:"8px 0"}}
              onMouseEnter={e=>e.currentTarget.querySelector(".step-card").style.transform="scale(1.06)"}
              onMouseLeave={e=>e.currentTarget.querySelector(".step-card").style.transform="scale(1)"}
            >
              <div className="step-card glass" style={{width:72,height:72,borderRadius:18,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,transition:"transform 0.3s",border:"1px solid var(--border)"}}>
                {s.icon}
              </div>
              <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",fontWeight:700,letterSpacing:"0.1em"}}>{s.num}</span>
              <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,color:"var(--text)",margin:"4px 0 8px",fontSize:15}}>{s.title}</h3>
              <p style={{color:"var(--text2)",fontSize:13,lineHeight:1.6,margin:0}}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:56}}>
          <Link to="/login" className="bg-forge-gradient glow-blue btn-press" style={{display:"inline-flex",alignItems:"center",gap:8,color:"#fff",textDecoration:"none",fontWeight:600,fontSize:16,padding:"14px 32px",borderRadius:12}}>
            Start Your First Interview <ArrowRight/>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ──────────────────────────────────────── */
function WhyUs() {
  const pts=[
    {e:"⚡",t:"Instant setup",d:"Sign in with Google and start your first interview in under 60 seconds."},
    {e:"🎯",t:"Role-specific",d:"Not generic — your exact role, stack, and difficulty level every time."},
    {e:"🤖",t:"Frontier AI",d:"Built on cutting-edge language models for accurate, nuanced evaluation."},
    {e:"📈",t:"Progress tracking",d:"Every session is logged. Watch your scores improve over time."},
    {e:"🔒",t:"Private & secure",d:"Your answers and results protected behind Firebase authentication."},
    {e:"💸",t:"Free to start",d:"Create your first mock interviews at no cost, upgrade when needed."},
  ];
  return (
    <section id="why-us" style={{padding:"96px 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Why MockForge</span>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(2rem,4vw,3rem)",color:"var(--text)",margin:"12px 0",lineHeight:1.15}}>
            Built different. <span className="gradient-text">Designed to win.</span>
          </h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {pts.map(p=>(
            <div key={p.t} className="glass" style={{borderRadius:18,padding:"20px 24px",border:"1px solid var(--border)",display:"flex",gap:16,alignItems:"flex-start",transition:"all 0.3s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="rgba(11,165,236,0.3)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="var(--border)"}}
            >
              <span style={{fontSize:22,flexShrink:0,marginTop:2}}>{p.e}</span>
              <div>
                <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,color:"var(--text)",margin:"0 0 6px",fontSize:15}}>{p.t}</h3>
                <p style={{color:"var(--text2)",fontSize:13,lineHeight:1.6,margin:0}}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────── */
function CTA() {
  return (
    <section style={{padding:"64px 24px"}}>
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <div className="bg-forge-gradient glow-blue" style={{borderRadius:28,padding:"64px 40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div className="bg-grid" style={{position:"absolute",inset:0,opacity:0.15,pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.8rem)",color:"#fff",margin:"0 0 16px",lineHeight:1.15}}>
              Ready to ace your next interview?
            </h2>
            <p style={{color:"rgba(255,255,255,0.75)",fontSize:16,marginBottom:32}}>
              Join thousands of engineers who use MockForge to prepare smarter, not harder.
            </p>
            <Link to="/login" className="btn-press" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#fff",color:"#065986",textDecoration:"none",fontWeight:700,fontSize:16,padding:"14px 32px",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",transition:"all 0.2s"}}>
              Get Started — It's Free <ArrowRight/>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{borderTop:"1px solid var(--border)",padding:"40px 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:700,fontSize:12}}>M</span>
          </div>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"var(--text)"}}>Mock<span style={{color:"var(--forge)"}}>Forge</span></span>
        </div>
        <div style={{display:"flex",gap:28,flexWrap:"wrap"}}>
          {["Features","How It Works","Dashboard","Login"].map(l=>(
            <a key={l} href="#" style={{color:"var(--text3)",textDecoration:"none",fontSize:13,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="var(--text)"}
              onMouseLeave={e=>e.target.style.color="var(--text3)"}
            >{l}</a>
          ))}
        </div>
        <p style={{fontSize:12,color:"var(--text3)",margin:0}}>© {new Date().getFullYear()} MockForge</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const { dark, setDark } = useTheme();
  return (
    <div style={{background:"var(--bg)",minHeight:"100vh",color:"var(--text)"}}>
      <Navbar dark={dark} setDark={setDark}/>
      <Hero/>
      <LogosStrip/>
      <Features/>
      <HowItWorks/>
      <WhyUs/>
      <CTA/>
      <Footer/>
    </div>
  );
}
