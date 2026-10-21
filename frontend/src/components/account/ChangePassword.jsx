import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../services/authService";
import { validateNewPassword } from "../../pages/auth/validation";
import PasswordField from "../../pages/auth/components/PasswordField";
import Button from "../common/Button";
import Card from "../common/Card";
import "../../pages/auth/auth.css";
export default function ChangePassword() {
 const {user}=useAuth(); const navigate=useNavigate();
 const [values,setValues]=useState({currentPassword:"",newPassword:"",confirmPassword:""});
 const [error,setError]=useState(""),[busy,setBusy]=useState(false);
 const submit=async e=>{
  e.preventDefault();setError("");
  const validation=validateNewPassword(values.newPassword);
  if(!values.currentPassword) return setError("Enter your current password.");
  if(validation) return setError(validation);
  if(values.newPassword!==values.confirmPassword) return setError("New passwords do not match.");
  if(values.currentPassword===values.newPassword) return setError("Choose a different new password.");
  setBusy(true);const path=user?.role==="PLATFORM_ADMIN"?"/admin/login":"/login";
  try {await changePassword(values);navigate(path,{replace:true,state:{passwordChanged:true}});} catch(e){setError(e.message || "Could not change your password.");setBusy(false);}
 };
 return <Card className="change-password-card" style={{marginTop:24}}><h2>Change password</h2><p>Enter your current password to choose a new one. You will be signed out on all devices after saving.</p><form onSubmit={submit} className="auth-form" style={{maxWidth:520,marginTop:20}}>
 {[["currentPassword","Current password","current-password"],["newPassword","New password","new-password"],["confirmPassword","Confirm new password","new-password"]].map(([key,label,autoComplete])=><PasswordField key={key} id={`change-${key}`} label={label} autoComplete={autoComplete} value={values[key]} disabled={busy} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))} required />)}
 <p>Use 8–64 characters including uppercase, lowercase and a number.</p>{error&&<p role="alert">{error}</p>}<Button type="submit" loading={busy}>Update password</Button>
 </form></Card>;
}
