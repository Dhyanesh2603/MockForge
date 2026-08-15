import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, Clock, Star, Lightbulb, Check, TrendingUp, TrendingDown, Brain, Sparkles } from "lucide-react";
import MotionIcon from "../../components/common/MotionIcon";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavBar from "../../components/NavBar";

const S=(d,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const PlusI=()=>S("M12 5v14M5 12h14",15);
const ArrR =()=>S("M5 12h14M12 5l7 7-7 7",13);

/* ── Mini trend sparkline ──────────────────── */
function Spark({ scores }) {
  if(!scores||scores.length<2) return null;
  const w=80,h=28,pad=3;
  const min=Math.min(...scores),max=Math.max(...scores);
  const range=max-min||1;
  const pts=scores.map((s,i)=>{
    const x=pad+(i/(scores.length-1))*(w-pad*2);
    const y=pad+(1-(s-min)/range)*(h-pad*2);
    return `${x},${y}`;
  }).join(" ");
  const trend=scores[scores.length-1]>scores[0];
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={trend?"#34d399":"#f87171"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Skill radar (mini) ─────────────────────── */
function MiniRadar({ barItems }) {
  const [anim,setAnim]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnim(true),500);return()=>clearTimeout(t);},[]);
  const labels=barItems.map(b=>b.label.split(" ")[0]);
  const vals=barItems.map(b=>b.value/100);
  const cx=100,cy=100,R=78;
  const angle=(i)=>((i/labels.length)*2*Math.PI)-Math.PI/2;
  const pt=(i,r)=>{const a=angle(i);return[cx+r*Math.cos(a),cy+r*Math.sin(a)];};
  const poly=(points)=>points.map(p=>p.join(",")).join(" ");
  const filledPts=vals.map((v,i)=>pt(i,anim?v*R:0));
  return(
    <svg viewBox="0 0 200 200" width="100%" style={{maxWidth:200,display:"block",margin:"0 auto"}}>
      {[.25,.5,.75,1].map(l=>(
        <polygon key={l} points={poly(labels.map((_,i)=>pt(i,l*R)))} fill="none" stroke="var(--border)" strokeWidth="1"/>
      ))}
      {labels.map((_,i)=>{const[x,y]=pt(i,R);return<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1"/>;} )}
      <polygon points={poly(filledPts)} fill="rgba(var(--forge-rgb),.15)" stroke="var(--forge)" strokeWidth="2"
        style={{transition:"all 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      {filledPts.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--forge)" stroke="var(--bg)" strokeWidth="1.5"
          style={{transition:"all 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      ))}
      {labels.map((l,i)=>{const[x,y]=pt(i,R+13);return<text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--text3)" fontFamily="DM Sans,sans-serif">{l}</text>;})}
    </svg>
  );
}

/* ── Stat card ───────────────────────────────── */
function Stat({icon: Icon,label,value,sub,ac}){
  const bg={blue:"rgba(56,189,248,.1)",green:"rgba(52,211,153,.1)",amber:"rgba(251,191,36,.1)",violet:"rgba(167,139,250,.1)"};
  const br={blue:"rgba(56,189,248,.22)",green:"rgba(52,211,153,.22)",amber:"rgba(251,191,36,.22)",violet:"rgba(167,139,250,.22)"};
  const tc={blue:"#38bdf8",green:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};
  return(
    <div className="glass btn-press" style={{borderRadius:18,padding:"18px 20px",border:`1px solid ${br[ac]}`,background:bg[ac],transition:"all .3s",cursor:"default"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(0,0,0,.15)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}
    >
      <div style={{marginBottom:10}}><MotionIcon icon={Icon} size={22} color={tc[ac]} animate="hover" /></div>
      <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 4px"}}>{label}</p>
      <p style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:26,color:tc[ac],margin:"0 0 2px"}}>{value}</p>
      {sub&&<p style={{fontSize:11,color:"var(--text3)",margin:0}}>{sub}</p>}
    </div>
  );
}

/* ── Interview card ──────────────────────────── */
function Card({interview}){
  const done=interview.status==="completed";
  const s=interview.overall_score;
  const sc=s>=75?"#34d399":s>=50?"#fbbf24":"#f87171";
  const sb=s>=75?"rgba(52,211,153,.1)":s>=50?"rgba(251,191,36,.1)":"rgba(248,113,113,.1)";
  const sbr=s>=75?"rgba(52,211,153,.25)":s>=50?"rgba(251,191,36,.25)":"rgba(248,113,113,.25)";
  const dc=interview.difficulty==="Hard"?"#f87171":interview.difficulty==="Medium"?"#fbbf24":"#34d399";
  return(
    <div className="glass" style={{borderRadius:20,padding:20,border:"1px solid var(--border)",display:"flex",flexDirection:"column",transition:"all .3s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="rgba(var(--forge-rgb),.3)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,.18)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none"}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:16,color:"var(--text)",margin:"0 0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{interview.role}</h3>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            <span style={{fontSize:11,padding:"2px 9px",borderRadius:999,background:`${dc}18`,color:dc,border:`1px solid ${dc}38`,fontWeight:600}}>{interview.difficulty}</span>
            <span style={{fontSize:11,padding:"2px 9px",borderRadius:999,background:done?"rgba(52,211,153,.1)":"rgba(251,191,36,.1)",color:done?"#34d399":"#fbbf24",border:done?"1px solid rgba(52,211,153,.28)":"1px solid rgba(251,191,36,.28)",fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>
              {done ? <><MotionIcon icon={Check} size={11} color="#34d399" /> Done</> : <><MotionIcon icon={Clock} size={11} color="#fbbf24" /> Progress</>}
            </span>
          </div>
        </div>
        {done&&typeof s==="number"&&(
          <div style={{textAlign:"center",background:sb,border:`1px solid ${sbr}`,borderRadius:12,padding:"7px 11px",marginLeft:12,flexShrink:0}}>
            <p style={{fontFamily:"monospace",fontWeight:700,fontSize:20,color:sc,margin:0,lineHeight:1}}>{s}</p>
            <p style={{fontSize:10,color:"var(--text3)",margin:"2px 0 0"}}>/100</p>
          </div>
        )}
      </div>
      <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 3px",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{interview.tech_stack}</p>
      <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 14px"}}>{new Date(interview.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</p>
      {done&&typeof s==="number"&&(
        <div style={{height:4,background:"var(--border)",borderRadius:999,marginBottom:14,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${s}%`,background:sc,borderRadius:999,transition:"width 1s ease"}}/>
        </div>
      )}
      <div style={{marginTop:"auto"}}>
        {done?(
          <Link to={`/results/${interview.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"9px",borderRadius:12,background:"rgba(var(--forge-rgb),.09)",border:"1px solid rgba(var(--forge-rgb),.22)",color:"var(--forge)",textDecoration:"none",fontSize:13,fontWeight:600,transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(var(--forge-rgb),.16)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(var(--forge-rgb),.09)"}
          >View Report <ArrR/></Link>
        ):(
          <Link to={`/interviews/${interview.id}`} className="bg-forge-gradient" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"9px",borderRadius:12,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:600,transition:"opacity .2s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".88"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >Continue <ArrR/></Link>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────── */
const Skel=()=><div className="glass shimmer-bg" style={{borderRadius:20,height:200,border:"1px solid var(--border)"}}/>;

/* ── Main ────────────────────────────────────── */
export default function DashboardPage(){
  const {user,loading}=useAuth(); const navigate=useNavigate();
  const [interviews,setInterviews]=useState([]);
  const [pageLoading,setPageLoading]=useState(true);
  const [filter,setFilter]=useState("all");

  useEffect(()=>{if(!loading&&!user)navigate("/login");},[user,loading,navigate]);
  useEffect(()=>{
    const fetch=async()=>{
      try{const token=await user.getIdToken();const r=await api.get("/interviews",{headers:{Authorization:`Bearer ${token}`}});setInterviews(r.data.interviews);}
      catch(e){console.error(e);}finally{setPageLoading(false);}
    };
    if(user)fetch();
  },[user]);

  const total=interviews.length;
  const completed=interviews.filter(i=>i.status==="completed").length;
  const inProg=total-completed;
  const scored=interviews.filter(i=>i.status==="completed"&&typeof i.overall_score==="number");
  const avg=scored.length>0?Math.round(scored.reduce((a,i)=>a+i.overall_score,0)/scored.length):0;
  const trend=scored.slice(-5).map(i=>i.overall_score);
  const filtered=filter==="all"?interviews:interviews.filter(i=>i.status===filter);

  // Synthetic skill data from avg
  const skillBars=[
    {label:"Technical",value:Math.min(Math.round(avg*.95+3),100),color:"#38bdf8"},
    {label:"Communication",value:Math.min(Math.round(avg*.9+5),100),color:"#34d399"},
    {label:"Clarity",value:Math.min(Math.round(avg*1.02+1),100),color:"#a78bfa"},
    {label:"Depth",value:Math.min(Math.round(avg*.88+6),100),color:"#fbbf24"},
    {label:"Examples",value:Math.min(Math.round(avg*.92+2),100),color:"#fb923c"},
  ];

  if(loading) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:40,height:40,borderRadius:"50%",border:"2px solid var(--forge)",borderTopColor:"transparent"}} className="asp"/>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <NavBar/>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"36px 24px 80px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:36,flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:".1em",margin:"0 0 8px"}}>Dashboard</p>
            <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(1.7rem,3vw,2.4rem)",color:"var(--text)",margin:"0 0 6px",display:"flex",alignItems:"center",gap:8}}>
              Hey, {user?.displayName?.split(" ")[0]} <MotionIcon icon={Sparkles} size={24} color="var(--forge)" animate="hover" />
            </h1>
            <p style={{color:"var(--text2)",fontSize:14,margin:0}}>
              {avg>0?`Your average score is ${avg}/100. `:""}Track progress and jump back in.
            </p>
          </div>
          <Link to="/create-interview" className="bg-forge-gradient glow-blue-sm btn-press"
            style={{display:"flex",alignItems:"center",gap:8,color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600,padding:"11px 22px",borderRadius:14,whiteSpace:"nowrap",transition:"opacity .2s"}}>
            <PlusI/> New Interview
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14,marginBottom:36}}>
          <Stat icon={FileText} label="Total" value={total} ac="blue"/>
          <Stat icon={CheckCircle2} label="Completed" value={completed} sub={total>0?`${Math.round((completed/total)*100)}%`:""} ac="green"/>
          <Stat icon={Clock} label="In Progress" value={inProg} ac="amber"/>
          <Stat icon={Star} label="Avg Score" value={avg>0?avg:"—"} sub={avg>0?"/100":""} ac="violet"/>
        </div>

        {/* Skills + trend row */}
        {avg>0&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:36}}>
            {/* Skill overview */}
            <div className="glass" style={{borderRadius:22,padding:24,border:"1px solid var(--border)"}}>
              <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 6px"}}>Skill Profile</p>
              <p style={{fontSize:13,color:"var(--text3)",margin:"0 0 16px"}}>Based on your {scored.length} completed interview{scored.length!==1?"s":""}</p>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                <div style={{flexShrink:0}}>
                  <MiniRadar barItems={skillBars}/>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                  {skillBars.map(({label,value,color})=>(
                    <div key={label}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:12,color:"var(--text2)"}}>{label}</span>
                        <span style={{fontSize:12,fontFamily:"monospace",fontWeight:700,color}}>{value}</span>
                      </div>
                      <div style={{height:5,background:"var(--bg3)",borderRadius:999,overflow:"hidden"}}>
                        <div className="chart-bar" style={{height:"100%",background:color,borderRadius:999,width:`${value}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score trend */}
            <div className="glass" style={{borderRadius:22,padding:24,border:"1px solid var(--border)"}}>
              <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 6px"}}>Score Trend</p>
              <p style={{fontSize:13,color:"var(--text3)",margin:"0 0 20px"}}>Last {trend.length} sessions</p>
              {trend.length>=2?(
                <>
                  <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80,marginBottom:12}}>
                    {trend.map((s,i)=>{
                      const col=s>=75?"#34d399":s>=50?"#fbbf24":"#f87171";
                      return(
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                          <span style={{fontSize:11,fontFamily:"monospace",fontWeight:700,color:col}}>{s}</span>
                          <div style={{width:"100%",background:col,borderRadius:"6px 6px 0 0",height:`${(s/100)*64}px`,transition:`height 1s cubic-bezier(.4,0,.2,1) ${i*.1}s`,minHeight:4}}/>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:"var(--text3)",display:"inline-flex",alignItems:"center",gap:4}}>
                      {trend[trend.length-1]>trend[0]?<><MotionIcon icon={TrendingUp} size={13} color="#34d399" /> Improving!</>:<><MotionIcon icon={TrendingDown} size={13} color="#f87171" /> Keep practicing</>}
                    </span>
                    <span style={{fontSize:12,fontFamily:"monospace",color:"var(--text2)"}}>
                      Δ {trend[trend.length-1]-trend[0]>0?"+":""}{trend[trend.length-1]-trend[0]}
                    </span>
                  </div>
                </>
              ):(
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:80}}>
                  <p style={{color:"var(--text3)",fontSize:13}}>Complete 2+ interviews to see trend</p>
                </div>
              )}

              {/* Weakest skill callout */}
              {skillBars.length>0&&(
                <div style={{marginTop:20,padding:"12px 14px",borderRadius:14,background:"rgba(var(--forge-rgb),.07)",border:"1px solid rgba(var(--forge-rgb),.18)"}}>
                  <p style={{fontSize:13,color:"var(--forge)",margin:"0 0 4px",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                    <MotionIcon icon={Lightbulb} size={14} color="var(--forge)" /> Top improvement area
                  </p>
                  <p style={{fontSize:13,color:"var(--text2)",margin:0}}>
                    {skillBars.sort((a,b)=>a.value-b.value)[0].label} — score {skillBars.sort((a,b)=>a.value-b.value)[0].value}/100
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview list */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:20,color:"var(--text)",margin:0}}>Interview History</h2>
          <div style={{display:"flex",gap:4,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:4}}>
            {[["all","All"],["completed","Completed"],["started","In Progress"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} className={filter===v?"bg-forge-gradient btn-press":"btn-press"}
                style={{padding:"6px 14px",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                        color:filter===v?"#fff":"var(--text2)",background:filter===v?"":"transparent",transition:"all .2s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {pageLoading?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
            {[1,2,3].map(i=><Skel key={i}/>)}
          </div>
        ):filtered.length===0?(
          <div className="glass" style={{borderRadius:22,padding:"60px 24px",textAlign:"center",border:"1px solid var(--border)"}}>
            <div style={{marginBottom:16}}><MotionIcon icon={Brain} size={48} color="var(--forge)" animate="pulse" /></div>
            <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:20,color:"var(--text)",marginBottom:8}}>No interviews yet</h3>
            <p style={{color:"var(--text2)",fontSize:14,marginBottom:24,maxWidth:320,margin:"0 auto 24px"}}>Create your first mock interview and start sharpening your skills.</p>
            <Link to="/create-interview" className="bg-forge-gradient btn-press"
              style={{display:"inline-flex",alignItems:"center",gap:8,color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600,padding:"10px 22px",borderRadius:12}}>
              <PlusI/> Create First Interview
            </Link>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
            {filtered.map(i=><Card key={i.id} interview={i}/>)}
          </div>
        )}
      </main>
    </div>
  );
}
