import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function ScoreRing({score,size=160}){
  const r=54, C=2*Math.PI*r;
  const [offset,setOffset]=useState(C);
  useEffect(()=>{const t=setTimeout(()=>setOffset(C-(score/100)*C),400);return()=>clearTimeout(t);},[score,C]);
  const color=score>=75?"#34d399":score>=50?"#fbbf24":"#f87171";
  const label=score>=75?"Excellent":score>=50?"Good":"Needs Work";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8"/>
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset}
            style={{transformOrigin:"center",transform:"rotate(-90deg)",transition:"stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:32,color:"var(--text)",lineHeight:1}}>{score}</span>
          <span style={{fontSize:12,color:"var(--text3)",marginTop:2}}>/100</span>
        </div>
      </div>
      <span style={{fontSize:13,fontWeight:600,padding:"4px 14px",borderRadius:999,background:`${color}18`,border:`1px solid ${color}40`,color}}>{label}</span>
    </div>
  );
}

function Section({icon,title,content,accent}){
  const map={
    green:{bg:"rgba(52,211,153,0.08)",br:"rgba(52,211,153,0.2)",hbg:"rgba(52,211,153,0.12)",tc:"#34d399"},
    red:  {bg:"rgba(248,113,113,0.08)",br:"rgba(248,113,113,0.2)",hbg:"rgba(248,113,113,0.12)",tc:"#f87171"},
    blue: {bg:"rgba(11,165,236,0.08)", br:"rgba(11,165,236,0.2)", hbg:"rgba(11,165,236,0.12)",tc:"var(--forge)"},
  };
  const s=map[accent];
  return(
    <div className="glass" style={{borderRadius:18,border:`1px solid ${s.br}`,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:s.hbg,borderBottom:`1px solid ${s.br}`}}>
        <span style={{fontSize:18}}>{icon}</span>
        <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:s.tc,margin:0}}>{title}</h3>
      </div>
      <div style={{padding:20}}>
        <p style={{fontSize:14,color:"var(--text2)",lineHeight:1.75,margin:0,whiteSpace:"pre-line"}}>{content||"No data available."}</p>
      </div>
    </div>
  );
}

export default function ResultPage(){
  const {interviewId}=useParams(); const navigate=useNavigate(); const {user}=useAuth();
  const [result,setResult]=useState(null); const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const fetch=async()=>{
      try{const token=await user.getIdToken();const r=await api.get(`/results/${interviewId}`,{headers:{Authorization:`Bearer ${token}`}});setResult(r.data.result);}
      catch(e){console.error(e);}finally{setLoading(false);}
    };
    if(user) fetch();
  },[user,interviewId]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"2px solid var(--forge)",borderTopColor:"transparent",margin:"0 auto 12px"}} className="animate-spin"/>
        <p style={{color:"var(--text2)",fontSize:14}}>Loading your results...</p>
      </div>
    </div>
  );

  const score=result?.overall_score??0;
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <div className="bg-grid" style={{position:"fixed",inset:0,opacity:1,pointerEvents:"none"}}/>
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:600,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(11,165,236,0.08),transparent 70%)",pointerEvents:"none"}}/>

      <header style={{position:"sticky",top:0,zIndex:40,background:"var(--surface)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link to="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
            <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:700,fontSize:12}}>M</span>
            </div>
            <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"var(--text)"}}>Mock<span style={{color:"var(--forge)"}}>Forge</span></span>
          </Link>
          <button onClick={()=>navigate("/dashboard")} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px",borderRadius:10,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Dashboard
          </button>
        </div>
      </header>

      <main style={{position:"relative",maxWidth:800,margin:"0 auto",padding:"48px 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:"0.1em"}}>AI Evaluation Report</span>
          <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",color:"var(--text)",margin:"12px 0 8px",lineHeight:1.1}}>
            Interview <span className="gradient-text">Results</span>
          </h1>
          <p style={{color:"var(--text2)",fontSize:14}}>Here's a detailed breakdown of your performance</p>
        </div>

        {/* Score hero */}
        <div className="glass glow-blue-sm" style={{borderRadius:24,padding:"40px 32px",marginBottom:24,border:"1px solid var(--border)"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:32}}>
            <ScoreRing score={score}/>
            <div style={{textAlign:"center",maxWidth:480}}>
              <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:22,color:"var(--text)",margin:"0 0 10px"}}>Overall Performance</h2>
              <p style={{color:"var(--text2)",fontSize:14,lineHeight:1.7,margin:"0 0 20px"}}>
                {score>=75?"Outstanding! You demonstrated strong knowledge and clear communication throughout."
                :score>=50?"Good effort! Solid understanding but there's room to go deeper on some topics."
                :"Keep practicing! Focus on the feedback below to identify your key improvement areas."}
              </p>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                {[["Technical",Math.min(Math.round(score*0.95+2),100)],["Communication",Math.min(Math.round(score*0.9+4),100)],["Clarity",Math.min(Math.round(score*1.02+1),100)]].map(([l,v])=>(
                  <div key={l} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:999,padding:"5px 14px",fontSize:12}}>
                    <span style={{color:"var(--text2)"}}>{l}: </span>
                    <span style={{fontFamily:"monospace",fontWeight:700,color:"var(--text)"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Section icon="💪" title="Strengths" content={result?.strengths} accent="green"/>
          <Section icon="📍" title="Areas to Improve" content={result?.weaknesses} accent="red"/>
          <Section icon="🤖" title="AI Feedback" content={result?.feedback} accent="blue"/>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:40,flexWrap:"wrap"}}>
          <button onClick={()=>navigate("/dashboard")} className="btn-press" style={{display:"flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:12,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",fontSize:14,fontWeight:600,cursor:"pointer"}}>
            ← Back to Dashboard
          </button>
          <Link to="/create-interview" className="bg-forge-gradient glow-blue-sm btn-press" style={{display:"flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:12,color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600}}>
            Try Another Interview →
          </Link>
        </div>
      </main>
    </div>
  );
}
