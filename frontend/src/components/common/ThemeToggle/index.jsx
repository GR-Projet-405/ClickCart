import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import "./styles.css";
export default function ThemeToggle() {
 const [dark,setDark]=useState(()=>document.documentElement.dataset.theme==="dark");
 useEffect(()=>{const sync=()=>setDark(document.documentElement.dataset.theme==="dark");window.addEventListener("clickcart-theme",sync);return ()=>window.removeEventListener("clickcart-theme",sync);},[]);
 const toggle=()=>{const next=!dark;document.documentElement.dataset.theme=next?"dark":"light";try{localStorage.setItem("clickcart-theme",next?"dark":"light");}catch{}window.dispatchEvent(new Event("clickcart-theme"));};
 return <button type="button" className="cc-theme-toggle" aria-label={dark?"Switch to light mode":"Switch to dark mode"} aria-pressed={dark} title={dark?"Light mode":"Dark mode"} onClick={toggle}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>;
}
