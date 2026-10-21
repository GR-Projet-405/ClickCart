import { useEffect, useState } from "react";
import { useAdminProfile } from "../../context/AdminProfileContext";
import { adminRequest } from "../../services/adminWorkspaceService";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageContainer from "../../components/common/PageContainer";
import "./AdminWorkspace.css";
export default function AdminProfilePage() {
  const {profile,setProfile,error:loadError} = useAdminProfile();
  const [form,setForm] = useState(null), [error,setError] = useState(""), [notice,setNotice] = useState(""), [busy,setBusy] = useState(false);
  useEffect(() => { if(profile) setForm({fullName:profile.fullName || "",phone:profile.phone || "",avatar:profile.avatar || ""}); }, [profile]);
  const photo = async e => {
    const file = e.target.files?.[0]; e.target.value = ""; if(!file) return;
    setError(""); setNotice("");
    if(!["image/jpeg","image/png"].includes(file.type) || file.size > 512000) { setError("Choose a PNG or JPEG under 500 KB (maximum 2048 × 2048 pixels)."); return; }
    const reader = new FileReader(); reader.onload = () => setForm(f => ({...f,avatar:reader.result})); reader.onerror = () => setError("Could not read that photo."); reader.readAsDataURL(file);
  };
  const save = async e => { e.preventDefault(); setBusy(true); setError(""); setNotice(""); try { setProfile(await adminRequest("/profile", {method:"PUT",body:JSON.stringify(form)})); setNotice("Your profile has been saved."); } catch(e) { setError(e.message); } finally { setBusy(false); } };
  return <PageContainer className="admin-workspace"><h1>My administrator profile</h1><p>Your name and profile photo are shared across your admin workspace.</p><Card>
    {loadError && <p role="alert">{loadError}</p>}{!form ? <p role="status">{loadError ? "Reload this page to try again." : "Loading profile…"}</p> : <form className="admin-profile-form" onSubmit={save}>
      <div className="admin-profile-photo">{form.avatar ? <img src={form.avatar} alt="Profile preview"/> : <span>{form.fullName.slice(0,2).toUpperCase()}</span>}<div><label htmlFor="admin-photo">Profile photo</label><input id="admin-photo" type="file" accept="image/png,image/jpeg" onChange={photo} disabled={busy}/><small>PNG/JPEG, up to 500 KB and 2048 × 2048 pixels.</small>{form.avatar && <button type="button" disabled={busy} onClick={() => setForm(f=>({...f,avatar:""}))}>Remove photo</button>}</div></div>
      <label>Full name<input required maxLength={100} value={form.fullName} disabled={busy} onChange={e=>setForm({...form,fullName:e.target.value})}/></label>
      <label>Email address<input value={profile.email} disabled/><small>Account email is managed in the database.</small></label>
      <label>Phone number<input type="tel" maxLength={20} value={form.phone} disabled={busy} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
      {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}<Button type="submit" loading={busy}>Save profile</Button>
    </form>}</Card></PageContainer>;
}
