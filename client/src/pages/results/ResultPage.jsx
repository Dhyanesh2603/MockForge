import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavBar from "../../components/NavBar";
import ProctoringAuditCard from "../../components/proctoring/ProctoringAuditCard";

/* ── Score Ring ─────────────────────────────── */
function ScoreRing({score,size=148}){
  const r=52,C=2*Math.PI*r;
  const [off,setOff]=useState(C);
  useEffect(()=>{const t=setTimeout(()=>setOff(C-(score/100)*C),500);return()=>clearTimeout(t);},[score,C]);
  const col=score>=75?"#34d399":score>=50?"#fbbf24":"#f87171";
  const lbl=score>=75?"Excellent":score>=50?"Good":"Needs Work";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg3)" strokeWidth="9"/>
          <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={off}
            style={{transformOrigin:"center",transform:"rotate(-90deg)",transition:"stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:30,color:"var(--text)",lineHeight:1}}>{score}</span>
          <span style={{fontSize:11,color:"var(--text3)",marginTop:2}}>/100</span>
        </div>
      </div>
      <span style={{fontSize:12,fontWeight:700,padding:"3px 14px",borderRadius:999,background:`${col}18`,border:`1px solid ${col}30`,color:col}}>{lbl}</span>
    </div>
  );
}

/* ── Horizontal bar ─────────────────────────── */
function Bar({label,value,color,delay=0}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(value),400+delay);return()=>clearTimeout(t);},[value,delay]);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:13,color:"var(--text2)"}}>{label}</span>
        <span style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color}}>{value}</span>
      </div>
      <div style={{height:8,background:"var(--bg3)",borderRadius:999,overflow:"hidden"}}>
        <div className="chart-bar" style={{height:"100%",background:color,borderRadius:999,width:`${w}%`}}/>
      </div>
    </div>
  );
}

/* ── Radar SVG ──────────────────────────────── */
function Radar({scores,labels}){
  const vals=labels.map((_,i)=>(scores[i]||0)/100);
  const [anim,setAnim]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnim(true),600);return()=>clearTimeout(t);},[]);
  const cx=100,cy=100,R=78;
  const a=(i)=>((i/labels.length)*2*Math.PI)-Math.PI/2;
  const pt=(i,r)=>{const x=cx+r*Math.cos(a(i)),y=cy+r*Math.sin(a(i));return[x,y];};
  const poly=(pts)=>pts.map(p=>p.join(",")).join(" ");
  const filled=vals.map((v,i)=>pt(i,anim?v*R:0));
  return(
    <svg viewBox="0 0 200 200" width="100%" style={{maxWidth:200,display:"block",margin:"0 auto"}}>
      {[.25,.5,.75,1].map(l=>(
        <polygon key={l} points={poly(labels.map((_,i)=>pt(i,l*R)))} fill="none" stroke="var(--border)" strokeWidth="1"/>
      ))}
      {labels.map((_,i)=>{const[x,y]=pt(i,R);return<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1"/>;} )}
      <polygon points={poly(filled)} fill="rgba(var(--forge-rgb),.16)" stroke="var(--forge)" strokeWidth="2"
        style={{transition:"all 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      {filled.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="var(--forge)" stroke="var(--bg)" strokeWidth="2"
          style={{transition:"all 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      ))}
      {labels.map((l,i)=>{const[x,y]=pt(i,R+14);return(
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--text3)" fontFamily="DM Sans,sans-serif">{l}</text>
      );})}
    </svg>
  );
}

/* ── Per-question strip ─────────────────────── */
function QStrip({questions,scores,critiques,answers}){
  const [sel,setSel]=useState(null);
  if(!scores?.length) return null;

  // Build a map from question_id -> answer_text
  const answerMap = {};
  if (answers) {
    answers.forEach((a) => {
      answerMap[String(a.question_id)] = a.answer_text;
    });
  }

  return(
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:sel!==null?12:0}}>
        {scores.map((s,i)=>{
          const col=s>=75?"#34d399":s>=50?"#fbbf24":"#f87171";
          return(
            <button key={i} onClick={()=>setSel(sel===i?null:i)} className="btn-press"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"7px 10px",
                      borderRadius:11,border:sel===i?`1px solid ${col}`:"1px solid var(--border)",
                      background:sel===i?`${col}14`:"var(--surface)",cursor:"pointer",minWidth:50,transition:"all .2s"}}>
              <span style={{fontSize:10,color:"var(--text3)",fontFamily:"monospace"}}>Q{i+1}</span>
              <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:16,color:col,lineHeight:1}}>{s}</span>
            </button>
          );
        })}
      </div>
      {sel!==null&&(
        <div style={{borderRadius:16,padding:16,background:"var(--bg2)",border:"1px solid var(--border)",marginTop:8}}>
          <p style={{fontSize:11,color:"var(--text3)",margin:"0 0 6px",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Q{sel+1} · Score {scores[sel]}/100</p>
          {questions[sel]&&<p style={{fontSize:14,color:"var(--text)",margin:"0 0 10px",lineHeight:1.6,fontWeight:600}}>{questions[sel].question_text}</p>}

          {/* Show candidate answer */}
          {questions[sel]&&(
            <div style={{padding:"10px 14px",borderRadius:12,background:"var(--bg3)",border:"1px solid var(--border)",marginBottom:10}}>
              <p style={{fontSize:11,color:"var(--text3)",margin:"0 0 4px",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Your Answer</p>
              <p style={{fontSize:13,color:"var(--text2)",margin:0,lineHeight:1.65,whiteSpace:"pre-wrap"}}>
                {answerMap[String(questions[sel].id)] || "No answer provided"}
              </p>
            </div>
          )}

          {critiques?.[sel]&&(
            <div style={{padding:"10px 14px",borderRadius:12,background:"rgba(var(--forge-rgb),.07)",border:"1px solid rgba(var(--forge-rgb),.2)"}}>
              <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 4px",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>AI Critique</p>
              <p style={{fontSize:13,color:"var(--text2)",margin:0,lineHeight:1.65}}>{critiques[sel]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section card ───────────────────────────── */
function Sec({icon,title,content,accent}){
  const m={
    green:{br:"rgba(52,211,153,.2)",hbg:"rgba(52,211,153,.1)",tc:"#34d399"},
    red:  {br:"rgba(248,113,113,.2)",hbg:"rgba(248,113,113,.1)",tc:"#f87171"},
    blue: {br:"rgba(var(--forge-rgb),.2)",hbg:"rgba(var(--forge-rgb),.1)",tc:"var(--forge)"},
    violet:{br:"rgba(167,139,250,.2)",hbg:"rgba(167,139,250,.1)",tc:"#a78bfa"},
  };
  const s=m[accent];
  return(
    <div className="glass" style={{borderRadius:18,border:`1px solid ${s.br}`,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 20px",background:s.hbg,borderBottom:`1px solid ${s.br}`}}>
        <span style={{fontSize:16}}>{icon}</span>
        <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:14,color:s.tc,margin:0}}>{title}</h3>
      </div>
      <div style={{padding:"16px 20px"}}>
        <p style={{fontSize:14,color:"var(--text2)",lineHeight:1.75,margin:0,whiteSpace:"pre-line"}}>{content||"Not available."}</p>
      </div>
    </div>
  );
}

/* ── Answer card for Answers tab ────────────── */
function AnswerCard({index,question,answerText,score,critique}){
  const col=score>=75?"#34d399":score>=50?"#fbbf24":"#f87171";
  const [open,setOpen]=useState(false);
  return(
    <div className="glass" style={{borderRadius:16,border:"1px solid var(--border)",overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)} className="btn-press"
        style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 18px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left"}}>
        <div style={{width:36,height:36,borderRadius:10,background:`${col}18`,border:`1px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:col}}>{score}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:11,color:"var(--text3)",margin:"0 0 2px",fontWeight:600}}>Question {index+1}</p>
          <p style={{fontSize:14,color:"var(--text)",margin:0,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:open?"normal":"nowrap"}}>{question}</p>
        </div>
        <span style={{fontSize:18,color:"var(--text3)",transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}>▾</span>
      </button>
      {open&&(
        <div style={{padding:"0 18px 18px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:"12px 14px",borderRadius:12,background:"var(--bg3)",border:"1px solid var(--border)"}}>
            <p style={{fontSize:11,color:"var(--text3)",margin:"0 0 6px",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Your Answer</p>
            <p style={{fontSize:13,color:answerText?"var(--text2)":"var(--text3)",margin:0,lineHeight:1.65,whiteSpace:"pre-wrap",fontStyle:answerText?"normal":"italic"}}>
              {answerText || "No answer provided"}
            </p>
          </div>
          {critique&&(
            <div style={{padding:"12px 14px",borderRadius:12,background:"rgba(var(--forge-rgb),.07)",border:"1px solid rgba(var(--forge-rgb),.2)"}}>
              <p style={{fontSize:11,color:"var(--forge)",margin:"0 0 6px",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>AI Critique</p>
              <p style={{fontSize:13,color:"var(--text2)",margin:0,lineHeight:1.65}}>{critique}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── MAIN ───────────────────────────────────── */
export default function ResultPage(){
  const {interviewId}=useParams(); const navigate=useNavigate(); const {user}=useAuth();
  const [result,setResult]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("overview");

  useEffect(()=>{
    if(!user) return;
    (async()=>{
      try{
        const tok=await user.getIdToken();
        const [rr,ir]=await Promise.all([
          api.get(`/results/${interviewId}`,{headers:{Authorization:`Bearer ${tok}`}}),
          api.get(`/interviews/${interviewId}`,{headers:{Authorization:`Bearer ${tok}`}}),
        ]);
        setResult(rr.data.result);
        setQuestions(ir.data.questions||[]);
      }catch(e){console.error(e);}finally{setLoading(false);}
    })();
  },[user,interviewId]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"2px solid var(--forge)",borderTopColor:"transparent",margin:"0 auto 12px"}} className="asp"/>
        <p style={{color:"var(--text2)",fontSize:14}}>Generating your report…</p>
      </div>
    </div>
  );

  // All data from the API — no hardcoded formulas
  const s=result?.overallScore??result?.overall_score??0;
  const tech=result?.technicalScore??0;
  const comm=result?.communicationScore??0;
  const clar=result?.clarityScore??0;
  const qScores=result?.questionScores||[];
  const critiques=result?.questionCritiques||[];
  const skillGaps=result?.skillGaps||[];
  const strongTopics=result?.strongTopics||[];
  const candidateAnswers=result?.answers||[];

  // Build answer map for quick lookup
  const answerMap = {};
  candidateAnswers.forEach((a) => {
    answerMap[String(a.question_id)] = a.answer_text;
  });

  const bars=[
    {label:"Technical Knowledge",value:tech,color:"#38bdf8"},
    {label:"Communication",value:comm,color:"#34d399"},
    {label:"Clarity",value:clar,color:"#a78bfa"},
  ];

  const tabs=[["overview","Overview"],["answers","Answers"],["analysis","Deep Analysis"],["skills","Skill Gaps"]];

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <div className="bg-grid" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1}}>
        <NavBar showLogout={false}
          rightSlot={
            <div style={{display:"flex",gap:3,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:3}}>
              {tabs.map(([k,l])=>(
                <button key={k} onClick={()=>setTab(k)} className={tab===k?"bg-forge-gradient btn-press":"btn-press"}
                  style={{padding:"5px 13px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                          color:tab===k?"#fff":"var(--text2)",background:tab===k?"":"transparent",transition:"all .2s"}}>
                  {l}
                </button>
              ))}
            </div>
          }
        />

        <main style={{maxWidth:860,margin:"0 auto",padding:"36px 24px 80px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <span style={{fontFamily:"monospace",fontSize:11,color:"var(--forge)",textTransform:"uppercase",letterSpacing:".1em"}}>AI Evaluation Report</span>
            <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.6rem)",
                        background:"linear-gradient(135deg,#38bdf8,#0ba5ec,#7dd3fc)",
                        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"10px 0 0",lineHeight:1.1}}>
              Interview Results
            </h1>
          </div>

          {/* ── OVERVIEW ── */}
          {tab==="overview"&&(
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:18}}>
                <div className="glass glow-blue-sm" style={{borderRadius:22,padding:28,border:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:196}}>
                  <ScoreRing score={s}/>
                  <p style={{fontSize:12,color:"var(--text3)",margin:"14px 0 4px",textAlign:"center"}}>Overall Score</p>
                  <p style={{fontSize:13,color:"var(--text2)",textAlign:"center",margin:0}}>{s>=75?"Top performance!":s>=50?"Good effort":s>0?"Keep going!":"No answers submitted"}</p>
                </div>
                <div className="glass" style={{borderRadius:22,padding:24,border:"1px solid var(--border)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 16px"}}>Score Breakdown</p>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {bars.map((b,i)=><Bar key={b.label} {...b} delay={i*80}/>)}
                  </div>
                </div>
              </div>

              {qScores.length>0&&(
                <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid var(--border)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 6px"}}>Per-Question Scores</p>
                  <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 14px"}}>Click any question to see your answer + AI critique</p>
                  <QStrip questions={questions} scores={qScores} critiques={critiques} answers={candidateAnswers}/>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <Sec icon="💪" title="Strengths" content={result?.strengths} accent="green"/>
                <Sec icon="📍" title="Areas to Improve" content={result?.weaknesses} accent="red"/>
              </div>
              <Sec icon="🤖" title="AI Feedback" content={result?.feedback} accent="blue"/>
              <ProctoringAuditCard proctoringData={result?.proctoringData} />
            </div>
          )}

          {/* ── ANSWERS ── */}
          {tab==="answers"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:17,color:"var(--text)",margin:0}}>
                  Question-by-Question Review
                </p>
                <span style={{fontSize:12,color:"var(--text3)",fontFamily:"monospace"}}>
                  {candidateAnswers.length} answered / {questions.length} total
                </span>
              </div>
              {questions.map((q,i)=>(
                <AnswerCard
                  key={q.id||i}
                  index={i}
                  question={q.question_text}
                  answerText={answerMap[String(q.id)]||""}
                  score={qScores[i]??0}
                  critique={critiques[i]||""}
                />
              ))}
              {questions.length===0&&(
                <div className="glass" style={{borderRadius:18,padding:32,border:"1px solid var(--border)",textAlign:"center"}}>
                  <p style={{color:"var(--text3)",fontSize:14}}>No questions found for this interview.</p>
                </div>
              )}
            </div>
          )}

          {/* ── DEEP ANALYSIS ── */}
          {tab==="analysis"&&(
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid var(--border)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 14px",textAlign:"center"}}>Performance Radar</p>
                  <Radar scores={[tech,comm,clar]} labels={["Technical","Communication","Clarity"]}/>
                </div>
                <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid var(--border)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 16px"}}>Detailed Metrics</p>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {bars.map((b,i)=><Bar key={b.label} {...b} delay={i*80}/>)}
                  </div>
                </div>
              </div>

              {qScores.length>0&&(
                <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid var(--border)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 6px"}}>Question-by-Question</p>
                  <p style={{fontSize:12,color:"var(--text3)",margin:"0 0 14px"}}>Click a score to view question details and AI critique</p>
                  <QStrip questions={questions} scores={qScores} critiques={critiques} answers={candidateAnswers}/>
                  {/* mini bar chart */}
                  <div style={{display:"flex",alignItems:"flex-end",gap:3,height:56,marginTop:16,paddingTop:8,borderTop:"1px solid var(--border)"}}>
                    {qScores.map((sc,i)=>{
                      const col=sc>=75?"#34d399":sc>=50?"#fbbf24":"#f87171";
                      return(
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                          <div style={{width:"100%",background:col,borderRadius:"3px 3px 0 0",
                                       height:`${(sc/100)*46}px`,minHeight:3,
                                       transition:`height 1s cubic-bezier(.4,0,.2,1) ${i*.06}s`}}/>
                          <span style={{fontSize:8,color:"var(--text3)",fontFamily:"monospace"}}>{i+1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <Sec icon="🤖" title="Detailed AI Feedback" content={result?.feedback} accent="blue"/>
            </div>
          )}

          {/* ── SKILL GAPS ── */}
          {tab==="skills"&&(
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid rgba(52,211,153,.25)",background:"rgba(52,211,153,.04)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"#34d399",margin:"0 0 14px"}}>✅ Strong Topics</p>
                  {strongTopics.length>0?strongTopics.map(t=>(
                    <div key={t} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:"#34d399",flexShrink:0}}/>
                      <span style={{fontSize:14,color:"var(--text2)"}}>{t}</span>
                    </div>
                  )):<p style={{fontSize:13,color:"var(--text3)"}}>No strong topics identified yet.</p>}
                </div>
                <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid rgba(248,113,113,.25)",background:"rgba(248,113,113,.04)"}}>
                  <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"#f87171",margin:"0 0 14px"}}>⚠️ Skill Gaps</p>
                  {skillGaps.length>0?skillGaps.map(t=>(
                    <div key={t} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:"#f87171",flexShrink:0}}/>
                      <span style={{fontSize:14,color:"var(--text2)"}}>{t}</span>
                    </div>
                  )):<p style={{fontSize:13,color:"var(--text3)"}}>No major skill gaps found!</p>}
                </div>
              </div>

              {/* Full skill bars */}
              <div className="glass" style={{borderRadius:22,padding:22,border:"1px solid var(--border)"}}>
                <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:"0 0 18px"}}>All Skill Areas</p>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {bars.map(({label,value,color},i)=>{
                    const tier=value>=75?"Strong":value>=50?"Developing":"Needs Focus";
                    const tc=value>=75?"#34d399":value>=50?"#fbbf24":"#f87171";
                    return(
                      <div key={label}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <span style={{fontSize:14,color:"var(--text)",fontWeight:500}}>{label}</span>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:11,padding:"2px 9px",borderRadius:999,background:`${tc}18`,border:`1px solid ${tc}30`,color:tc,fontWeight:600}}>{tier}</span>
                            <span style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color}}>{value}/100</span>
                          </div>
                        </div>
                        <div style={{height:9,background:"var(--bg3)",borderRadius:999,overflow:"hidden"}}>
                          <div className="chart-bar" style={{height:"100%",background:`linear-gradient(90deg,${color}99,${color})`,borderRadius:999,width:`${value}%`}}/>
                        </div>
                        {value<60&&<p style={{fontSize:12,color:"var(--text3)",margin:"5px 0 0"}}>💡 Practice more {label.toLowerCase()} in your next session</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Improvement plan */}
              <div style={{borderRadius:22,padding:22,background:"rgba(var(--forge-rgb),.07)",border:"1px solid rgba(var(--forge-rgb),.2)"}}>
                <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--forge)",margin:"0 0 14px"}}>🎯 Recommended Improvement Plan</p>
                {bars.filter(b=>b.value<75).sort((a,b)=>a.value-b.value).slice(0,3).map((b,i)=>(
                  <div key={b.label} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                    <div className="bg-forge-gradient" style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",fontWeight:700}}>{i+1}</div>
                    <p style={{fontSize:13,color:"var(--text2)",margin:0,lineHeight:1.55}}>
                      <span style={{color:"var(--text)",fontWeight:600}}>{b.label}:</span> At {b.value}/100. Target 80+ by practising dedicated {b.label.toLowerCase()} questions in your next {b.value<50?"2-3 sessions":"session"}.
                    </p>
                  </div>
                ))}
                {bars.filter(b=>b.value<75).length===0&&<p style={{fontSize:13,color:"var(--green)"}}>🎉 You're above 75 in all areas!</p>}
              </div>
            </div>
          )}

          {/* actions */}
          <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:36,flexWrap:"wrap"}}>
            <button onClick={()=>navigate("/dashboard")} className="btn-press"
              style={{display:"flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",fontSize:14,fontWeight:600,cursor:"pointer"}}>
              ← Dashboard
            </button>
            <Link to="/create-interview" className="bg-forge-gradient glow-blue-sm btn-press"
              style={{display:"flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,color:"#fff",textDecoration:"none",fontSize:14,fontWeight:600}}>
              Try Again →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

