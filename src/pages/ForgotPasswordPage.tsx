import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
export function ForgotPasswordPage(){const{resetPassword}=useAuth();const[email,setEmail]=useState('');const[message,setMessage]=useState('');return <div className="auth-page"><form className="card auth-card form-stack" onSubmit={async(e)=>{e.preventDefault();try{await resetPassword(email);setMessage('Tautan reset password telah dikirim.');}catch(err){setMessage(err instanceof Error?err.message:'Gagal mengirim email.');}}}><h1>Reset Password</h1>{message&&<div className="alert success-box">{message}</div>}<div className="field"><label>Email akun</label><input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/></div><Button type="submit">Kirim Tautan Reset</Button><Link className="gold" to="/login">Kembali ke login</Link></form></div>}
