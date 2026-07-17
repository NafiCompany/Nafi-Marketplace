import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const destination = (location.state as {from?:string}|null)?.from || '/account';
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');try{await login(email,password);navigate(destination);}catch(err){setError(err instanceof Error?err.message:'Login gagal.');}finally{setLoading(false);}};
  return <div className="auth-page"><form className="card auth-card form-stack" onSubmit={submit}><div className="auth-brand"><img src="/assets/logo-main.png" alt="NAFI.COMPANY"/><h1>Masuk ke NAFI</h1><p className="muted">Akses pesanan dan produk digital Anda.</p></div>{error&&<div className="alert">{error}</div>}<div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/></div><div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/></div><Button type="submit" disabled={loading}><LogIn size={18}/>{loading?'Memproses...':'Masuk'}</Button><Button type="button" variant="secondary" onClick={async()=>{setLoading(true);setError('');try{await loginWithGoogle();navigate(destination);}catch(err){setError(err instanceof Error?err.message:'Login Google gagal.');}finally{setLoading(false);}}}>Masuk dengan Google</Button><div style={{display:'flex',justifyContent:'space-between',gap:12,fontSize:'.9rem'}}><Link className="gold" to="/forgot-password">Lupa password?</Link><Link className="gold" to="/register">Daftar akun</Link></div></form></div>;
}
