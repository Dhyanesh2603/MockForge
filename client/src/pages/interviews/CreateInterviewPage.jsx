import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const ROLES=["Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Data Scientist","Machine Learning Engineer","Mobile Developer","Product Manager"];
const STACKS=["React, Node.js","Vue.js, Django","Angular, Spring Boot","Python, FastAPI","React Native","Flutter, Firebase","AWS, Docker, Kubernetes","TensorFlow, PyTorch"];

export default function CreateInterviewPage(){
  const navigate=useNavigate(); const {user}=useAuth();
  const [role,setRole]=useState(""); const [techStack,setTechStack]=useState(""); const [difficulty,setDifficulty]=useState("Medium");
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");

  const handleSubmit=async(e)=>{
    e.preventDefault();
    try{
      setLoading(true);setError("");
      const token=await user.getIdToken();
      const r=await api.post("/interviews",{role,techStack,difficulty},{headers:{Authorization:`Bearer ${token}`}});
      navigate(`/interviews/${r.data.interview.id}`);
    }catch(err){console.error(err);setError("Failed to create interview. Please try again.");}
    finally{setLoading(false);}
  };

  const dc={Easy:{color:"#34d399",bg:"rgba(52,211,153,0.1)",br:"rgba(52,211,153,0.3)",desc:"5 questions · ~15 min"},Medium:{color:"#fbbf24",bg:"rgba(251,191,36,0.1)",br:"rgba(251,191,36,0.3)",desc:"8 questions · ~25 min"},Hard:{color:"#f87171",bg:"rgba(248,113,113,0.1)",br:"rgba(248,113,113,0.3)",desc:"10 questions · ~30 min"}};

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",position:"relative"}}>
      <div className="bg-grid" style={{position:"fixed",inset:0,opacity:1,pointerEvents:"none"}}/>
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:500,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(11,165,236,0.08),transparent 70%)",pointerEvents:"none"}}/>

      <header style={{position:"sticky",top:0,zIndex:40,background:"var(--surface)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:700,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link to="/dashboard" style={{display:"flex",alignItems:"center",gap:8,color:"var(--text2)",textDecoration:"none",fontSize:14}}
            onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text2)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Dashboard
          </Link>
          <Link to="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
            <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:700,fontSize:12}}>M</span>
            </div>
            <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"var(--text)"}}>Mock<span style={{color:"var(--forge)"}}>Forge</span></span>
          </Link>
        </div>
      </header>

      <main style={{position:"relative",maxWidth:560,margin:"0 auto",padding:"48px 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:"0.1em"}}>New Session</span>
          <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(1.6rem,3vw,2.2rem)",color:"var(--text)",margin:"10px 0 8px"}}>Create Interview</h1>
          <p style={{color:"var(--text2)",fontSize:14,margin:0}}>Configure your mock interview session</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass" style={{borderRadius:20,padding:28,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:24}}>

            {/* Role */}
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:8}}>Target Role <span style={{color:"var(--forge)"}}>*</span></label>
              <input type="text" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Frontend Developer" required
                style={{width:"100%",boxSizing:"border-box",borderRadius:12,border:"1px solid var(--border)",background:"var(--bg2)",color:"var(--text)",padding:"11px 14px",fontSize:14,transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(11,165,236,0.5)"}
                onBlur={e=>e.target.style.borderColor="var(--border)"}
              />
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                {ROLES.map(r=>(
                  <button key={r} type="button" onClick={()=>setRole(r)} className={role===r?"bg-forge-gradient":""}
                    style={{padding:"4px 12px",borderRadius:999,border:role===r?"none":"1px solid var(--border)",background:role===r?"":"var(--surface)",color:role===r?"#fff":"var(--text3)",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
                  >{r}</button>
                ))}
              </div>
            </div>

            {/* Stack */}
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:8}}>Tech Stack <span style={{color:"var(--forge)"}}>*</span></label>
              <input type="text" value={techStack} onChange={e=>setTechStack(e.target.value)} placeholder="e.g. React, Node.js, PostgreSQL" required
                style={{width:"100%",boxSizing:"border-box",borderRadius:12,border:"1px solid var(--border)",background:"var(--bg2)",color:"var(--text)",padding:"11px 14px",fontSize:14,transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(11,165,236,0.5)"}
                onBlur={e=>e.target.style.borderColor="var(--border)"}
              />
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                {STACKS.map(s=>(
                  <button key={s} type="button" onClick={()=>setTechStack(s)} className={techStack===s?"bg-forge-gradient":""}
                    style={{padding:"4px 12px",borderRadius:999,border:techStack===s?"none":"1px solid var(--border)",background:techStack===s?"":"var(--surface)",color:techStack===s?"#fff":"var(--text3)",fontSize:11,fontFamily:"monospace",cursor:"pointer",transition:"all 0.2s"}}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:10}}>Difficulty Level</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {Object.entries(dc).map(([lvl,cfg])=>(
                  <button key={lvl} type="button" onClick={()=>setDifficulty(lvl)}
                    style={{padding:"12px 8px",borderRadius:12,border:`1px solid ${difficulty===lvl?cfg.br:"var(--border)"}`,background:difficulty===lvl?cfg.bg:"var(--surface)",color:difficulty===lvl?cfg.color:"var(--text2)",cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}
                  >
                    <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:14,margin:"0 0 4px"}}>{lvl}</p>
                    <p style={{fontSize:11,margin:0,opacity:0.7}}>{cfg.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error&&<div style={{marginTop:16,padding:"10px 16px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:12,color:"#f87171",fontSize:13,textAlign:"center"}}>{error}</div>}

          <button type="submit" disabled={loading||!role||!techStack} className="bg-forge-gradient glow-blue-sm btn-press"
            style={{width:"100%",marginTop:20,display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px",borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:loading||!role||!techStack?"not-allowed":"pointer",opacity:loading||!role||!techStack?0.5:1,transition:"opacity 0.2s"}}
          >
            {loading?(<><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.3"/><path fill="white" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating Questions...</>):(<>✦ Create Interview Session</>)}
          </button>
          <p style={{textAlign:"center",fontSize:12,color:"var(--text3)",marginTop:12}}>AI will generate tailored questions based on your selections</p>
        </form>
      </main>
    </div>
  );
}
