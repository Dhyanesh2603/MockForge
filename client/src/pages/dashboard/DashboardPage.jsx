import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

const Icon = ({d,size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const SunIcon  = ()=><Icon d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" size={16}/>;
const MoonIcon = ()=><Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" size={16}/>;
const PlusIcon = ()=><Icon d="M12 5v14M5 12h14" size={16}/>;
const ArrowRight=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

function StatCard({emoji,label,value,sub,accent}){
  const bg={blue:"rgba(11,165,236,0.1)",green:"rgba(52,211,153,0.1)",amber:"rgba(251,191,36,0.1)",violet:"rgba(167,139,250,0.1)"};
  const br={blue:"rgba(11,165,236,0.25)",green:"rgba(52,211,153,0.25)",amber:"rgba(251,191,36,0.25)",violet:"rgba(167,139,250,0.25)"};
  const tc={blue:"#36bffa",green:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};
  return (
    <div className="glass" style={{borderRadius:16,padding:20,border:`1px solid ${br[accent]}`,background:bg[accent],transition:"all 0.3s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.15)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
    >
      <div style={{fontSize:22,marginBottom:10}}>{emoji}</div>
      <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 4px"}}>{label}</p>
      <p style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:26,color:tc[accent],margin:"0 0 2px"}}>{value}</p>
      {sub&&<p style={{fontSize:11,color:"var(--text3)",margin:0}}>{sub}</p>}
    </div>
  );
}

function InterviewCard({interview}){
  const done = interview.status==="completed";
  const score = interview.overall_score;
  const sc = score>=75?"#34d399":score>=50?"#fbbf24":"#f87171";
  const sb = score>=75?"rgba(52,211,153,0.1)":score>=50?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)";
  const sbr= score>=75?"rgba(52,211,153,0.25)":score>=50?"rgba(251,191,36,0.25)":"rgba(248,113,113,0.25)";
  const dc = interview.difficulty==="Hard"?"#f87171":interview.difficulty==="Medium"?"#fbbf24":"#34d399";
  return (
    <div className="glass" style={{borderRadius:20,padding:20,border:"1px solid var(--border)",display:"flex",flexDirection:"column",transition:"all 0.3s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="rgba(11,165,236,0.3)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,0.2)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none"}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:17,color:"var(--text)",margin:"0 0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{interview.role}</h3>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:999,background:`${dc}18`,color:dc,border:`1px solid ${dc}40`,fontWeight:600}}>{interview.difficulty}</span>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:999,background:done?"rgba(52,211,153,0.1)":"rgba(251,191,36,0.1)",color:done?"#34d399":"#fbbf24",border:done?"1px solid rgba(52,211,153,0.3)":"1px solid rgba(251,191,36,0.3)",fontWeight:600}}>
              {done?"✓ Completed":"⏳ In Progress"}
            </span>
          </div>
        </div>
        {done&&typeof score==="number"&&(
          <div style={{textAlign:"center",background:sb,border:`1px solid ${sbr}`,borderRadius:12,padding:"8px 12px",marginLeft:12,flexShrink:0}}>
            <p style={{fontFamily:"monospace",fontWeight:700,fontSize:20,color:sc,margin:0,lineHeight:1}}>{score}</p>
            <p style={{fontSize:11,color:"var(--text3)",margin:"2px 0 0"}}>/100</p>
          </div>
        )}
      </div>
      <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 4px",fontFamily:"monospace"}}>{interview.tech_stack}</p>
      <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 14px"}}>{new Date(interview.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</p>
      {done&&typeof score==="number"&&(
        <div style={{height:4,background:"var(--border)",borderRadius:999,marginBottom:14,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${score}%`,background:sc,borderRadius:999,transition:"width 1s ease"}}/>
        </div>
      )}
      <div style={{marginTop:"auto"}}>
        {done?(
          <Link to={`/results/${interview.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px",borderRadius:12,background:"rgba(11,165,236,0.1)",border:"1px solid rgba(11,165,236,0.25)",color:"var(--forge)",textDecoration:"none",fontSize:13,fontWeight:600,transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(11,165,236,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(11,165,236,0.1)"}
          >View Full Report <ArrowRight/></Link>
        ):(
          <Link to={`/interviews/${interview.id}`} className="bg-forge-gradient" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px",borderRadius:12,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:600,transition:"opacity 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >Continue Interview <ArrowRight/></Link>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage(){
  const { user, loading } = useAuth();
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(()=>{ if(!loading&&!user) navigate("/login"); },[user,loading,navigate]);

  useEffect(()=>{
    const fetch = async()=>{
      try {
        const token = await user.getIdToken();
        const r = await api.get("/interviews",{headers:{Authorization:`Bearer ${token}`}});
        setInterviews(r.data.interviews);
      } catch(e){console.error(e);}
      finally{setPageLoading(false);}
    };
    if(user) fetch();
  },[user]);

  const total=interviews.length;
  const completed=interviews.filter(i=>i.status==="completed").length;
  const inProgress=total-completed;
  const scored=interviews.filter(i=>i.status==="completed"&&typeof i.overall_score==="number");
  const avg=scored.length>0?Math.round(scored.reduce((a,i)=>a+i.overall_score,0)/scored.length):0;
  const filtered=filter==="all"?interviews:interviews.filter(i=>i.status===filter);

  if(loading){
    return <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"2px solid var(--forge)",borderTopColor:"transparent",margin:"0 auto 12px"}} className="animate-spin"/>
        <p style={{color:"var(--text2)",fontSize:14}}>Loading...</p>
      </div>
    </div>;
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      {/* Navbar */}
      <header style={{position:"sticky",top:0,zIndex:40,background:"var(--surface)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link to="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
            <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:700,fontSize:12}}>M</span>
            </div>
            <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"var(--text)"}}>Mock<span style={{color:"var(--forge)"}}>Forge</span></span>
          </Link>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setDark(!dark)} style={{width:34,height:34,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {dark?<SunIcon/>:<MoonIcon/>}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:999,padding:"4px 12px 4px 6px"}}>
              <div className="bg-forge-gradient" style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700}}>
                {user?.displayName?.[0]||"U"}
              </div>
              <span style={{fontSize:13,color:"var(--text2)",fontWeight:500}}>{user?.displayName?.split(" ")[0]}</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"40px 24px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:40,flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 8px"}}>Dashboard</p>
            <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(1.8rem,3vw,2.4rem)",color:"var(--text)",margin:"0 0 6px"}}>Hey, {user?.displayName?.split(" ")[0]} 👋</h1>
            <p style={{color:"var(--text2)",fontSize:14,margin:0}}>Track your progress and continue where you left off.</p>
          </div>
          <Link to="/create-interview" className="bg-forge-gradient glow-blue-sm btn-press" style={{display:"flex",alignItems:"center",gap:8,color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600,padding:"10px 20px",borderRadius:12,whiteSpace:"nowrap",transition:"opacity 0.2s"}}>
            <PlusIcon/> New Interview
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16,marginBottom:40}}>
          <StatCard emoji="📋" label="Total Interviews" value={total} accent="blue"/>
          <StatCard emoji="✅" label="Completed" value={completed} sub={`${total>0?Math.round((completed/total)*100):0}% done`} accent="green"/>
          <StatCard emoji="⏳" label="In Progress" value={inProgress} accent="amber"/>
          <StatCard emoji="⭐" label="Avg Score" value={avg>0?`${avg}`:"—"} sub={avg>0?"out of 100":"No data yet"} accent="violet"/>
        </div>

        {/* Filter + list */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:20,color:"var(--text)",margin:0}}>Interview History</h2>
          <div style={{display:"flex",gap:4,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:4}}>
            {[["all","All"],["completed","Completed"],["started","In Progress"]].map(([val,lbl])=>(
              <button key={val} onClick={()=>setFilter(val)} className={filter===val?"bg-forge-gradient":""} style={{padding:"6px 14px",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:filter===val?"#fff":"var(--text2)",background:filter===val?"":"transparent",transition:"all 0.2s"}}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {pageLoading?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
            {[1,2,3].map(i=>(
              <div key={i} className="glass" style={{borderRadius:20,padding:20,border:"1px solid var(--border)",height:180}}>
                <div style={{height:18,background:"var(--border)",borderRadius:8,width:"60%",marginBottom:12,animation:"pulse 1.5s infinite"}}/>
                <div style={{height:12,background:"var(--border)",borderRadius:8,width:"40%",marginBottom:10}}/>
                <div style={{height:10,background:"var(--border)",borderRadius:8,width:"80%"}}/>
              </div>
            ))}
          </div>
        ):filtered.length===0?(
          <div className="glass" style={{borderRadius:20,padding:"64px 24px",textAlign:"center",border:"1px solid var(--border)"}}>
            <div style={{fontSize:48,marginBottom:16}}>🧠</div>
            <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:20,color:"var(--text)",marginBottom:8}}>No interviews yet</h3>
            <p style={{color:"var(--text2)",fontSize:14,marginBottom:24}}>Create your first mock interview and start sharpening your skills.</p>
            <Link to="/create-interview" className="bg-forge-gradient btn-press" style={{display:"inline-flex",alignItems:"center",gap:8,color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600,padding:"10px 20px",borderRadius:12}}>
              <PlusIcon/> Create Your First Interview
            </Link>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
            {filtered.map(i=><InterviewCard key={i.id} interview={i}/>)}
          </div>
        )}
      </main>
    </div>
  );
}
