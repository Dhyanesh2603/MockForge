import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useState } from "react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true); setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await api.post("/auth/login", {}, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Sign-in failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",overflow:"hidden"}}>
      <div className="bg-grid" style={{position:"absolute",inset:0,opacity:1,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(11,165,236,0.1),transparent 70%)",pointerEvents:"none"}}/>

      <Link to="/" style={{position:"absolute",top:24,left:24,display:"flex",alignItems:"center",gap:8,color:"var(--text2)",textDecoration:"none",fontSize:14,transition:"color 0.2s"}}
        onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
        onMouseLeave={e=>e.currentTarget.style.color="var(--text2)"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back home
      </Link>

      <div style={{position:"relative",width:"100%",maxWidth:400}}>
        {/* Glow border */}
        <div style={{position:"absolute",inset:-1,borderRadius:20,background:"linear-gradient(135deg,rgba(11,165,236,0.4),transparent,rgba(6,89,133,0.25))",opacity:0.7}}/>
        <div className="glass" style={{position:"relative",borderRadius:20,padding:36,boxShadow:"0 24px 80px rgba(0,0,0,0.2)"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div className="bg-forge-gradient glow-blue-sm" style={{width:52,height:52,borderRadius:14,margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>M</span>
            </div>
            <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:24,color:"var(--text)",margin:"0 0 8px"}}>Welcome to MockForge</h1>
            <p style={{color:"var(--text2)",fontSize:14,margin:0}}>Sign in to start your interview prep journey</p>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
            <div style={{flex:1,height:1,background:"var(--border)"}}/>
            <span style={{fontSize:12,color:"var(--text3)"}}>continue with</span>
            <div style={{flex:1,height:1,background:"var(--border)"}}/>
          </div>

          <button onClick={handleGoogleLogin} disabled={loading} className="btn-press"
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 20px",fontSize:14,fontWeight:600,color:"var(--text)",cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1,transition:"all 0.2s"}}
            onMouseEnter={e=>!loading&&(e.currentTarget.style.borderColor="rgba(11,165,236,0.4)")}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >
            {loading ? (
              <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in...</>
            ) : (
              <><GoogleIcon/> Continue with Google</>
            )}
          </button>

          {error && (
            <div style={{marginTop:16,padding:"10px 14px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:10,color:"#f87171",fontSize:13,textAlign:"center"}}>
              {error}
            </div>
          )}

          <p style={{marginTop:24,textAlign:"center",fontSize:12,color:"var(--text3)",lineHeight:1.5}}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        <p style={{textAlign:"center",marginTop:20,fontSize:12,color:"var(--text3)"}}>
          Join 10,000+ engineers sharpening their interview skills
        </p>
      </div>
    </div>
  );
}
