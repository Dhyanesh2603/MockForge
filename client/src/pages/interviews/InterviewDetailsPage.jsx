import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const ArrowLeft = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const ArrowRight=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const SendIcon = ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
const CheckIcon=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;

function ConfirmModal({onConfirm,onCancel}){
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)"}} onClick={onCancel}/>
      <div className="glass" style={{position:"relative",borderRadius:20,padding:36,maxWidth:380,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.4)",border:"1px solid var(--border)"}}>
        <div style={{textAlign:"center",fontSize:40,marginBottom:16}}>⚠️</div>
        <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:20,color:"var(--text)",textAlign:"center",margin:"0 0 10px"}}>Submit Interview?</h3>
        <p style={{color:"var(--text2)",fontSize:14,textAlign:"center",lineHeight:1.6,marginBottom:24}}>You won't be able to edit your answers after submission. Make sure you're ready.</p>
        <div style={{display:"flex",gap:12}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:14,fontWeight:600,cursor:"pointer"}}>Go Back</button>
          <button onClick={onConfirm} className="bg-forge-gradient btn-press" style={{flex:1,padding:"11px",borderRadius:12,border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>Submit Now</button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewDetailsPage(){
  const {id}=useParams(); const navigate=useNavigate(); const {user}=useAuth();
  const textareaRef=useRef(null);
  const [interview,setInterview]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [submitting,setSubmitting]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [saveStatus,setSaveStatus]=useState("idle");
  const [timeLeft,setTimeLeft]=useState(()=>{const s=localStorage.getItem(`timer-${id}`);return s?Number(s):30*60;});

  useEffect(()=>{
    const fetch=async()=>{
      try{
        const token=await user.getIdToken();
        const ir=await api.get(`/interviews/${id}`,{headers:{Authorization:`Bearer ${token}`}});
        setInterview(ir.data.interview); setQuestions(ir.data.questions);
        const ar=await api.get(`/answers/${id}`,{headers:{Authorization:`Bearer ${token}`}});
        const map={}; ar.data.answers.forEach(a=>{map[a.question_id]=a.answer_text;}); setAnswers(map);
      }catch(e){console.error(e);} finally{setLoading(false);}
    };
    if(user) fetch();
  },[id,user]);

  useEffect(()=>{if(!loading&&textareaRef.current) setTimeout(()=>textareaRef.current?.focus(),100);},[idx,loading]);

  useEffect(()=>{
    if(submitted) return;
    const t=setInterval(()=>{
      setTimeLeft(prev=>{
        const u=prev-1; localStorage.setItem(`timer-${id}`,u);
        if(u<=0){clearInterval(t);doSubmit();localStorage.removeItem(`timer-${id}`);return 0;}
        return u;
      });
    },1000);
    return ()=>clearInterval(t);
  },[submitted,id]);

  const cur=questions[idx];
  const pct=questions.length>0?((idx+1)/questions.length)*100:0;

  const saveAnswer=async(qid,text)=>{
    try{const token=await user.getIdToken();await api.post("/answers",{interviewId:id,questionId:qid,answerText:text},{headers:{Authorization:`Bearer ${token}`}});}catch(e){console.error(e);}
  };

  const handleChange=async(val)=>{
    setAnswers(p=>({...p,[cur.id]:val}));
    setSaveStatus("saving");
    await saveAnswer(cur.id,val);
    setSaveStatus("saved"); setTimeout(()=>setSaveStatus("idle"),2000);
  };

  const doSubmit=async()=>{
    try{
      setSubmitting(true);
      const token=await user.getIdToken();
      await api.post("/results/submit",{interviewId:id},{headers:{Authorization:`Bearer ${token}`}});
      setSubmitted(true); localStorage.removeItem(`timer-${id}`);
      navigate(`/results/${id}`);
    }catch(e){console.error(e);alert("Failed to evaluate interview.");}
    finally{setSubmitting(false);}
  };

  const fmt=s=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  if(loading) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"2px solid var(--forge)",borderTopColor:"transparent",margin:"0 auto 12px"}} className="animate-spin"/>
        <p style={{color:"var(--text2)",fontSize:14}}>Loading interview...</p>
      </div>
    </div>
  );

  const timerColor = timeLeft<300?"#f87171":timeLeft<600?"#fbbf24":"var(--forge)";
  const timerBg   = timeLeft<300?"rgba(248,113,113,0.1)":timeLeft<600?"rgba(251,191,36,0.1)":"rgba(11,165,236,0.08)";

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {showConfirm&&<ConfirmModal onConfirm={()=>{setShowConfirm(false);doSubmit();}} onCancel={()=>setShowConfirm(false)}/>}

      {/* Progress bar top */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"var(--border)",zIndex:50}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(135deg,#0ba5ec,#065986)",transition:"width 0.5s ease"}}/>
      </div>

      {/* Header */}
      <header style={{position:"sticky",top:3,zIndex:40,background:"var(--surface)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
            <button onClick={()=>navigate("/dashboard")} style={{width:32,height:32,borderRadius:9,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <ArrowLeft/>
            </button>
            <div style={{minWidth:0}}>
              <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{interview?.role}</p>
              <p style={{fontSize:11,color:"var(--text3)",margin:0,fontFamily:"monospace"}}>{interview?.tech_stack} · {interview?.difficulty}</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            {saveStatus==="saving"&&<span style={{fontSize:12,color:"var(--text3)"}}>Saving...</span>}
            {saveStatus==="saved"&&<span style={{fontSize:12,color:"#34d399",display:"flex",alignItems:"center",gap:4}}><CheckIcon/>Saved</span>}
            <span style={{fontSize:12,color:"var(--text3)"}}>{Object.keys(answers).length}/{questions.length} done</span>
            <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13,padding:"5px 12px",borderRadius:999,background:timerBg,color:timerColor,border:`1px solid ${timerColor}40`}} className={timeLeft<300?"animate-pulse-slow":""}>
              {timeLeft<300?"⚠️ ":""}{fmt(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <main style={{flex:1,maxWidth:800,width:"100%",margin:"0 auto",padding:"40px 24px"}}>
        {/* Q number + progress */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"monospace",fontSize:12,color:"var(--forge)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Question {idx+1}</span>
            <span style={{fontSize:12,color:"var(--text3)"}}>of {questions.length}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:100,height:5,background:"var(--border)",borderRadius:999,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(135deg,#0ba5ec,#065986)",borderRadius:999,transition:"width 0.5s"}}/>
            </div>
            <span style={{fontSize:11,color:"var(--text3)",fontFamily:"monospace"}}>{Math.round(pct)}%</span>
          </div>
        </div>

        {/* Question card */}
        <div className="glass glow-blue-sm" style={{borderRadius:20,padding:32,marginBottom:24,border:"1px solid var(--border)"}}>
          <div style={{display:"flex",gap:12,marginBottom:24}}>
            <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:"#fff",fontSize:11,fontWeight:700}}>Q</span>
            </div>
            <p style={{fontSize:17,fontWeight:500,color:"var(--text)",lineHeight:1.65,margin:0}}>{cur?.question_text}</p>
          </div>
          <div style={{position:"relative"}}>
            <textarea
              ref={textareaRef}
              rows={8}
              placeholder="Type your answer here... Be clear, structured, and concise."
              value={answers[cur?.id]||""}
              disabled={submitted}
              onChange={e=>handleChange(e.target.value)}
              style={{width:"100%",borderRadius:14,border:"1px solid var(--border)",background:"var(--bg2)",color:"var(--text)",padding:"16px",fontSize:14,lineHeight:1.65,resize:"none",transition:"border-color 0.2s",opacity:submitted?0.5:1,cursor:submitted?"not-allowed":"text",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.target.style.borderColor="rgba(11,165,236,0.5)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <span style={{position:"absolute",bottom:12,right:14,fontSize:11,color:"var(--text3)",fontFamily:"monospace"}}>
              {(answers[cur?.id]||"").length} chars
            </span>
          </div>
        </div>

        {/* Nav buttons */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>setIdx(i=>i-1)} disabled={idx===0} className="btn-press" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",fontSize:14,fontWeight:600,cursor:idx===0?"not-allowed":"pointer",opacity:idx===0?0.3:1}}>
            <ArrowLeft/> Previous
          </button>
          <button onClick={()=>setShowConfirm(true)} disabled={submitted||submitting} className="btn-press" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,border:"1px solid rgba(52,211,153,0.3)",background:"rgba(52,211,153,0.1)",color:"#34d399",fontSize:14,fontWeight:600,cursor:submitted||submitting?"not-allowed":"pointer",opacity:submitted||submitting?0.5:1}}>
            {submitting?<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Evaluating...</>:submitted?<><CheckIcon/>Submitted</>:<><SendIcon/>Submit Interview</>}
          </button>
          <button onClick={()=>setIdx(i=>i+1)} disabled={idx===questions.length-1} className="bg-forge-gradient btn-press" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:idx===questions.length-1?"not-allowed":"pointer",opacity:idx===questions.length-1?0.3:1}}>
            Next <ArrowRight/>
          </button>
        </div>

        {/* Thumbnail grid */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:32}}>
          {questions.map((q,i)=>(
            <button key={q.id} onClick={()=>setIdx(i)} className={i===idx?"bg-forge-gradient":""}
              style={{width:34,height:34,borderRadius:10,border:i===idx?"none":answers[q.id]?"1px solid rgba(11,165,236,0.4)":"1px solid var(--border)",background:i===idx?"":"answers[q.id]"?answers[q.id]?"rgba(11,165,236,0.12)":"var(--surface)":"var(--surface)",color:i===idx?"#fff":answers[q.id]?"var(--forge)":"var(--text3)",fontSize:12,fontFamily:"monospace",fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}
            >{i+1}</button>
          ))}
        </div>
      </main>
    </div>
  );
}
