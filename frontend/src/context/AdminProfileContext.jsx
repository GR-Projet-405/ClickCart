import { createContext, useContext, useEffect, useState } from "react";
import { adminRequest } from "../services/adminWorkspaceService";
const Context = createContext(null);
export function AdminProfileProvider({ children }) {
  const [profile,setProfile] = useState(null), [error,setError] = useState("");
  useEffect(() => { let active = true; adminRequest("/profile").then(p => { if(active) setProfile(p); }).catch(e => { if(active) setError(e.message); }); return () => { active = false; }; }, []);
  return <Context.Provider value={{profile,setProfile,error}}>{children}</Context.Provider>;
}
export const useAdminProfile = () => useContext(Context);
