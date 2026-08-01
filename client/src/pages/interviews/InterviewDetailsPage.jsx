import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useAdvancedProctoring } from "../../hooks/useAdvancedProctoring";
import ProctoringOverlay from "../../components/proctoring/ProctoringOverlay";
import ProctoringPauseOverlay from "../../components/proctoring/ProctoringPauseOverlay";
import DeviceCheckModal from "../../components/proctoring/DeviceCheckModal";
import VoiceInterviewerControls from "../../components/voice/VoiceInterviewerControls";

/* ── icons ── */
const Svg = (d,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const ArrL  = ()=>Svg("M19 12H5M12 19l-7-7 7-7");
const ArrR  = ()=>Svg("M5 12h14M12 5l7 7-7 7");
const SendI = ()=>Svg("M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",15);
const ChkI  = ()=>Svg("M20 6L9 17l-5-5",14);

/* ── Countdown ── */
function Countdown({ role, onDone }) {
  const [n, setN] = useState(3);
  useEffect(()=>{
    if(n===0){ setTimeout(onDone,700); return; }
    const t = setTimeout(()=>setN(p=>p-1),900);
    return ()=>clearTimeout(t);
  },[n,onDone]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div className="bg-grid" style={{position:"absolute",inset:0,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(var(--forge-rgb),.12),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",textAlign:"center"}}>
        <p style={{fontFamily:"monospace",fontSize:13,color:"var(--forge)",textTransform:"uppercase",letterSpacing:".15em",marginBottom:28}}>
          Interview starting in
        </p>
        {n>0?(
          <div key={n} className="count-anim" style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(5rem,18vw,9rem)",lineHeight:1,
            background:"linear-gradient(135deg,#38bdf8,#0ba5ec)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {n}
          </div>
        ):(
          <div className="count-anim" style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(2rem,7vw,4rem)",color:"var(--green)"}}>
            Go! 🚀
          </div>
        )}
        {role && <p style={{marginTop:20,fontSize:14,color:"var(--text2)"}}>{role}</p>}
      </div>
    </div>
  );
}

/* ── Pause modal ── */
function PauseModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)"}} onClick={onCancel}/>
      <div className="glass afu" style={{position:"relative",borderRadius:22,padding:32,maxWidth:400,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,.5)",border:"1px solid var(--border)",textAlign:"center"}}>
        <div style={{fontSize:42,marginBottom:14}}>⏸️</div>
        <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20,color:"var(--text)",margin:"0 0 10px"}}>
          Pause Interview Session?
        </h3>
        <p style={{color:"var(--text2)",fontSize:14,lineHeight:1.6,marginBottom:24}}>
          Are you sure you want to pause this test? Your answers and remaining time will be saved, and you can resume anytime from your dashboard.
        </p>
        <div style={{display:"flex",gap:12}}>
          <button onClick={onCancel} className="btn-press" style={{flex:1,padding:"12px 14px",borderRadius:12,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:14,fontWeight:600,cursor:"pointer"}}>
            Continue Test
          </button>
          <button onClick={onConfirm} className="bg-forge-gradient btn-press" style={{flex:1,padding:"12px 14px",borderRadius:12,border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>
            Pause & Exit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm modal ── */
function ConfirmModal({ flagCount, onConfirm, onCancel }) {
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)"}} onClick={onCancel}/>
      <div className="glass afu" style={{position:"relative",borderRadius:22,padding:36,maxWidth:380,width:"100%",
                                         boxShadow:"0 24px 80px rgba(0,0,0,.4)",border:"1px solid var(--border)"}}>
        <div style={{textAlign:"center",fontSize:40,marginBottom:16}}>⚠️</div>
        <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:20,color:"var(--text)",textAlign:"center",margin:"0 0 10px"}}>Submit Interview?</h3>
        <p style={{color:"var(--text2)",fontSize:14,textAlign:"center",lineHeight:1.6,marginBottom:6}}>
          You cannot edit answers after submission.
        </p>
        {flagCount>0&&(
          <p style={{color:"#fbbf24",fontSize:13,textAlign:"center",marginBottom:18}}>
            🚩 You have {flagCount} flagged question{flagCount>1?"s":""} — review before submitting?
          </p>
        )}
        <div style={{display:"flex",gap:12,marginTop:20}}>
          <button onClick={onCancel} className="btn-press" style={{flex:1,padding:12,borderRadius:12,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:14,fontWeight:600,cursor:"pointer"}}>Back</button>
          <button onClick={onConfirm} className="bg-forge-gradient btn-press" style={{flex:1,padding:12,borderRadius:12,border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>Submit Now</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function InterviewDetailsPage() {
  const {id}=useParams(); const navigate=useNavigate(); const {user}=useAuth();
  const textareaRef=useRef(null);
  const saveTimer=useRef(null);

  const [interview,setInterview]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [started,setStarted]=useState(false);
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [flagged,setFlagged]=useState(new Set());
  const [reviewLater,setReviewLater]=useState(new Set());
  const [submitting,setSubmitting]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [showPause,setShowPause]=useState(false);
  const [saveStatus,setSaveStatus]=useState("idle"); // idle | saving | saved
  const [timeLeft,setTimeLeft]=useState(()=>{
    const s=localStorage.getItem(`mf-timer-${id}`); return s?Number(s):30*60;
  });
  const [deviceCheckDone, setDeviceCheckDone] = useState(false);
  const isProctored = interview ? Boolean(interview.proctored) : false;
  const proctoring = useAdvancedProctoring(isProctored && started && !submitted);

  /* fetch */
  useEffect(()=>{
    if(!user) return;
    (async()=>{
      try{
        const tok=await user.getIdToken();
        const [ir,ar]=await Promise.all([
          api.get(`/interviews/${id}`,{headers:{Authorization:`Bearer ${tok}`}}),
          api.get(`/answers/${id}`,  {headers:{Authorization:`Bearer ${tok}`}}),
        ]);
        setInterview(ir.data.interview);
        setQuestions(ir.data.questions||[]);
        const map={};
        (ar.data.answers||[]).forEach(a=>{map[a.question_id]=a.answer_text;});
        setAnswers(map);
      }catch(e){
        console.error(e);
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          if (typeof document !== "undefined" && document.body) document.body.style.display = "none";
          window.location.href = "/";
        } else {
          navigate("/dashboard");
        }
      }finally{setLoading(false);}
    })();
  },[id,user,navigate]);

  /* timer — pauses when proctoring isPaused */
  useEffect(()=>{
    if(!started||submitted||proctoring.isPaused) return;
    const t=setInterval(()=>{
      setTimeLeft(prev=>{
        const u=prev-1;
        localStorage.setItem(`mf-timer-${id}`,u);
        if(u<=0){clearInterval(t);doSubmit();localStorage.removeItem(`mf-timer-${id}`);return 0;}
        return u;
      });
    },1000);
    return()=>clearInterval(t);
  },[started,submitted,proctoring.isPaused]);

  /* auto-focus textarea */
  useEffect(()=>{
    if(started&&!loading&&textareaRef.current)
      setTimeout(()=>textareaRef.current?.focus(),80);
  },[idx,started,loading]);

  const cur = questions[idx];

  const saveToBackend = useCallback(async(qid,text)=>{
    if(!user) return;
    try{
      const tok=await user.getIdToken();
      await api.post("/answers",{interviewId:id,questionId:qid,answerText:text},{headers:{Authorization:`Bearer ${tok}`}});
    }catch(e){console.error(e);}
  },[user,id]);

  const handleChange=(val)=>{
    setAnswers(p=>({...p,[cur.id]:val}));
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      saveToBackend(cur.id,val).then(()=>{
        setSaveStatus("saved");
        setTimeout(()=>setSaveStatus("idle"),2000);
      });
    },700);
  };


  // Auto-submit on disqualification (3 tab switches)
  useEffect(() => {
    if (proctoring.isDisqualified && !submitted && !submitting) {
      doSubmit();
    }
  }, [proctoring.isDisqualified, submitted, submitting]);

  const doSubmit=useCallback(async()=>{
    if(submitting||submitted) return;
    try{
      setSubmitting(true);
      const tok=await user.getIdToken();

      // Ensure all current candidate answers are flushed and saved to backend
      const entries = Object.entries(answers);
      await Promise.all(
        entries.map(([qid, text]) => {
          if (text && text.trim()) {
            return api.post(
              "/answers",
              { interviewId: id, questionId: qid, answerText: text },
              { headers: { Authorization: `Bearer ${tok}` } }
            );
          }
          return Promise.resolve();
        })
      );

      await api.post("/results/submit", {
        interviewId: id,
        proctoringData: {
          warningCount: proctoring.warningCount,
          maxWarnings: proctoring.maxWarnings,
          tabSwitchCount: proctoring.tabSwitchCount,
          isDisqualified: proctoring.isDisqualified,
          eyeTrackingActive: proctoring.eyeTrackingActive,
          incidents: proctoring.incidents,
        },
      }, { headers: { Authorization: `Bearer ${tok}` } });

      setSubmitted(true);
      localStorage.removeItem(`mf-timer-${id}`);
      navigate(`/results/${id}`);
    }catch(e){console.error(e);alert("Submission failed. Please try again.");}
    finally{setSubmitting(false);}
  },[user,id,submitting,submitted,navigate,answers,proctoring.warningCount,proctoring.incidents]);

  const toggleFlag=()=>{
    if(!cur) return;
    setFlagged(s=>{const n=new Set(s);n.has(cur.id)?n.delete(cur.id):n.add(cur.id);return n;});
  };
  const toggleReview=()=>{
    if(!cur) return;
    setReviewLater(s=>{const n=new Set(s);n.has(cur.id)?n.delete(cur.id):n.add(cur.id);return n;});
  };

  const fmt=s=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
  const pct=questions.length>0?((idx+1)/questions.length)*100:0;
  const answeredCount=Object.keys(answers).length;

  if(loading) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"2px solid var(--forge)",borderTopColor:"transparent",margin:"0 auto 12px"}} className="asp"/>
        <p style={{color:"var(--text2)",fontSize:14}}>Loading session…</p>
      </div>
    </div>
  );

  if (!interview || !questions || questions.length === 0) return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:24}}>
        <p style={{color:"#f87171",fontSize:16,fontWeight:600,marginBottom:12}}>Interview session not found or has no questions.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-press" style={{padding:"8px 18px",borderRadius:12,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",fontSize:14,fontWeight:600,cursor:"pointer"}}>
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );

  if(!started) {
    if (isProctored && !deviceCheckDone) {
      return (
        <DeviceCheckModal
          onReady={() => setDeviceCheckDone(true)}
          onCancel={() => navigate("/dashboard")}
        />
      );
    }
    return <Countdown role={interview?.role} onDone={() => setStarted(true)} />;
  }

  const timerC=timeLeft<300?"#f87171":timeLeft<600?"#fbbf24":"var(--forge)";
  const timerBg=timeLeft<300?"rgba(248,113,113,.1)":timeLeft<600?"rgba(251,191,36,.1)":"rgba(var(--forge-rgb),.07)";
  const isFlagged=flagged.has(cur?.id);
  const isReview=reviewLater.has(cur?.id);

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {showPause && <PauseModal onConfirm={() => { setShowPause(false); navigate("/dashboard"); }} onCancel={() => setShowPause(false)} />}
      {showConfirm && <ConfirmModal flagCount={flagged.size} onConfirm={() => { setShowConfirm(false); doSubmit(); }} onCancel={() => setShowConfirm(false)} />}

      {/* top progress bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"var(--border)",zIndex:60}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(135deg,#0ba5ec,#065986)",transition:"width .5s"}}/>
      </div>

      {/* header */}
      <header style={{position:"sticky",top:3,zIndex:50,background:"var(--surface)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
            <button
              onClick={() => {
                if (started && !submitted) {
                  setShowPause(true);
                } else {
                  navigate("/dashboard");
                }
              }}
              style={{width:32,height:32,borderRadius:9,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
              title="Back to Dashboard"
            >
              <ArrL/>
            </button>
            <div style={{minWidth:0}}>
              <p style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:14,color:"var(--text)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{interview?.role}</p>
              <p style={{fontSize:11,color:"var(--text3)",margin:0,fontFamily:"monospace"}}>{interview?.tech_stack} · {interview?.difficulty}</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            {saveStatus==="saving"&&<span style={{fontSize:11,color:"var(--text3)"}}>Saving…</span>}
            {saveStatus==="saved"&&<span style={{fontSize:11,color:"var(--green)",display:"flex",alignItems:"center",gap:3}}><ChkI/>Saved</span>}
            {(() => {
              const maxScorePerQ = questions.length > 0 ? 100 / questions.length : 10;
              const currentScore = Math.round(answeredCount * maxScorePerQ);
              return (
                <span style={{fontSize:12,fontWeight:700,color:"var(--forge)",fontFamily:"monospace",background:"rgba(var(--forge-rgb),.1)",padding:"4px 10px",borderRadius:999,border:"1px solid rgba(var(--forge-rgb),.25)"}}>
                  Score: {currentScore}/100 pts
                </span>
              );
            })()}
            
            {started && !submitted && (
              <button
                type="button"
                onClick={() => {
                  setShowPause(false);
                  navigate("/dashboard");
                }}
                className="btn-press"
                style={{
                  padding: "5px 12px", borderRadius: 999, border: "1px solid var(--border)",
                  background: "var(--surface)", color: "var(--text2)", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
                title="Pause and return to dashboard"
              >
                ⏸️ Pause
              </button>
            )}

            <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13,padding:"5px 12px",borderRadius:999,
                         background:timerBg,color:timerC,border:`1px solid ${timerC}35`}}
                 className={timeLeft<300?"aps":""}>
              {timeLeft<300?"⚠ ":""}{fmt(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* main two-column layout */}
      <main style={{flex:1,maxWidth:960,width:"100%",margin:"0 auto",padding:"28px 20px 60px",display:"flex",gap:22,alignItems:"flex-start"}}>

        {/* Left: question + answer */}
        <div style={{flex:1,minWidth:0}}>
          {/* progress label */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"monospace",fontSize:12,color:"var(--forge)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Q {idx+1}</span>
              <span style={{fontSize:12,color:"var(--text3)"}}>of {questions.length}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:88,height:4,background:"var(--border)",borderRadius:999,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(135deg,#0ba5ec,#065986)",borderRadius:999,transition:"width .5s"}}/>
              </div>
              <span style={{fontSize:11,color:"var(--text3)",fontFamily:"monospace"}}>{Math.round(pct)}%</span>
            </div>
          </div>

          {/* Question card */}
          <div className="glass glow-blue-sm" style={{borderRadius:22,padding:28,marginBottom:18,border:"1px solid var(--border)"}}>
            {/* status badges */}
            {(isFlagged||isReview)&&(
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                {isFlagged&&<span className="flag-badge" style={{fontSize:11,padding:"2px 10px",borderRadius:999,fontWeight:600}}>🚩 Flagged</span>}
                {isReview&&<span style={{fontSize:11,padding:"2px 10px",borderRadius:999,fontWeight:600,background:"rgba(167,139,250,.12)",border:"1px solid rgba(167,139,250,.3)",color:"#a78bfa"}}>📖 Review Later</span>}
              </div>
            )}

            {/* question text */}
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <div className="bg-forge-gradient" style={{width:28,height:28,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#fff",fontSize:11,fontWeight:700}}>Q</span>
              </div>
              <p style={{fontSize:16,fontWeight:500,color:"var(--text)",lineHeight:1.7,margin:0}}>{cur?.question_text}</p>
            </div>

            {/* Voice Interviewer Controls (TTS & STT) */}
            <VoiceInterviewerControls
              questionText={cur?.question_text || ""}
              onTranscript={(spokenText) => {
                if (typeof spokenText === "string" && spokenText.trim()) {
                  const existing = answers[cur?.id] || "";
                  const updated = existing.trim() ? `${existing.trim()} ${spokenText.trim()}` : spokenText.trim();
                  handleChange(updated);
                }
              }}
              currentAnswer={answers[cur?.id] || ""}
            />

            {/* textarea */}
            <textarea
              ref={textareaRef}
              rows={8}
              placeholder="Type your answer here… Be structured and specific. Use real examples where possible."
              value={answers[cur?.id]||""}
              disabled={submitted}
              onChange={e=>handleChange(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",borderRadius:14,border:"1px solid var(--border)",
                      background:"var(--bg2)",color:"var(--text)",padding:16,fontSize:14,lineHeight:1.7,
                      resize:"none",fontFamily:"inherit",opacity:submitted?.5:1,cursor:submitted?"not-allowed":"text"}}
              onFocus={e=>e.target.style.borderColor="rgba(var(--forge-rgb),.45)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />

            {/* toolbar below textarea */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {/* Flag */}
                <button onClick={toggleFlag} className="btn-press"
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",
                          border:isFlagged?"1px solid rgba(251,191,36,.45)":"1px solid var(--border)",
                          background:isFlagged?"rgba(251,191,36,.1)":"var(--surface)",
                          color:isFlagged?"#fbbf24":"var(--text3)",transition:"all .2s"}}>
                  🚩 {isFlagged?"Flagged":"Flag"}
                </button>
                {/* Review Later */}
                <button onClick={toggleReview} className="btn-press"
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",
                          border:isReview?"1px solid rgba(167,139,250,.45)":"1px solid var(--border)",
                          background:isReview?"rgba(167,139,250,.1)":"var(--surface)",
                          color:isReview?"#a78bfa":"var(--text3)",transition:"all .2s"}}>
                  📖 {isReview?"Remove":"Review Later"}
                </button>
              </div>
              <span style={{fontSize:11,color:"var(--text3)",fontFamily:"monospace"}}>{(answers[cur?.id]||"").length} chars</span>
            </div>
          </div>

          {/* navigation row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <button onClick={()=>setIdx(i=>i-1)} disabled={idx===0} className="btn-press"
              style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:12,border:"1px solid var(--border)",
                      background:"var(--surface)",color:"var(--text2)",fontSize:13,fontWeight:600,
                      cursor:idx===0?"not-allowed":"pointer",opacity:idx===0?.3:1}}>
              <ArrL/> Prev
            </button>

            <button onClick={()=>setShowConfirm(true)} disabled={submitted||submitting} className="btn-press"
              style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:12,
                      border:"1px solid rgba(52,211,153,.3)",background:"rgba(52,211,153,.1)",color:"var(--green)",
                      fontSize:13,fontWeight:600,cursor:submitted||submitting?"not-allowed":"pointer",
                      opacity:submitted||submitting?.4:1}}>
              {submitting?(
                <><svg className="asp" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/>
                  <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Evaluating…</>
              ):submitted?(
                <><ChkI/>Submitted</>
              ):(
                <><SendI/>Submit</>
              )}
            </button>

            <button onClick={()=>setIdx(i=>i+1)} disabled={idx===questions.length-1} className="bg-forge-gradient btn-press"
              style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:12,border:"none",
                      color:"#fff",fontSize:13,fontWeight:600,
                      cursor:idx===questions.length-1?"not-allowed":"pointer",
                      opacity:idx===questions.length-1?.3:1}}>
              Next <ArrR/>
            </button>
          </div>
        </div>

        {/* Right sidebar: question grid */}
        <div style={{width:176,flexShrink:0}}>
          <div className="glass" style={{borderRadius:18,padding:16,border:"1px solid var(--border)",position:"sticky",top:76}}>
            <p style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",margin:"0 0 12px"}}>Questions</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
              {questions.map((q,i)=>{
                const ans=!!answers[q.id];
                const flg=flagged.has(q.id);
                const rev=reviewLater.has(q.id);
                const cur=i===idx;
                return(
                  <button key={q.id} onClick={()=>setIdx(i)} className={cur?"bg-forge-gradient btn-press":"btn-press"}
                    style={{width:"100%",aspectRatio:"1",borderRadius:8,fontSize:11,fontFamily:"monospace",fontWeight:700,cursor:"pointer",
                            border:cur?"none":flg?"1px solid rgba(251,191,36,.4)":rev?"1px solid rgba(167,139,250,.4)":ans?"1px solid rgba(var(--forge-rgb),.35)":"1px solid var(--border)",
                            background:cur?"":flg?"rgba(251,191,36,.08)":rev?"rgba(167,139,250,.08)":ans?"rgba(var(--forge-rgb),.08)":"var(--surface)",
                            color:cur?"#fff":flg?"#fbbf24":rev?"#a78bfa":ans?"var(--forge)":"var(--text3)",
                            transition:"all .18s",position:"relative"}}>
                    {i+1}
                    {flg&&<span style={{position:"absolute",top:1,right:1,width:4,height:4,borderRadius:"50%",background:"#fbbf24"}}/>}
                    {rev&&!flg&&<span style={{position:"absolute",top:1,right:1,width:4,height:4,borderRadius:"50%",background:"#a78bfa"}}/>}
                  </button>
                );
              })}
            </div>

            {/* legend */}
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:4}}>
              {[["var(--forge)","Answered"],["#fbbf24","Flagged"],["#a78bfa","Review Later"],["var(--text3)","Not done"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
                  <span style={{fontSize:10,color:"var(--text3)"}}>{l}</span>
                </div>
              ))}
            </div>

            {/* stats */}
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:4}}>
              {[[answeredCount,"Done","var(--forge)"],[flagged.size,"Flagged","#fbbf24"],[reviewLater.size,"Review","#a78bfa"]].map(([v,l,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:"var(--text3)"}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:"monospace"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Proctoring Overlay */}
      {isProctored && started && !submitted && (
        <ProctoringOverlay
          videoRef={proctoring.videoRef}
          cameraActive={proctoring.cameraActive}
          warningCount={proctoring.warningCount}
          maxWarnings={proctoring.maxWarnings}
          warningToast={proctoring.warningToast}
          tabSwitchCount={proctoring.tabSwitchCount}
          visibilityStatus={proctoring.visibilityStatus}
          eyeTrackingActive={proctoring.eyeTrackingActive}
        />
      )}

      {/* Auto-Pause Overlay — blocks test when visibility/audio is lost */}
      {isProctored && started && !submitted && proctoring.isPaused && (
        <ProctoringPauseOverlay
          reason={proctoring.pauseReason}
          visibilityStatus={proctoring.visibilityStatus}
          warningCount={proctoring.warningCount}
          maxWarnings={proctoring.maxWarnings}
        />
      )}
    </div>
  );
}
