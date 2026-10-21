import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowUpRight, ArrowRight, ShieldCheck, CalendarCheck, MessageCircle, Wrench } from "lucide-react";
import { useAuth, homePathForRole } from "../../context/AuthContext";
import { marketplaceServicesApi } from "../../services/marketplaceServices";
import "./LandingPage.css";

export default function LandingPage() {
 const { user } = useAuth(); const navigate = useNavigate();
 const [query,setQuery] = useState(""), [services,setServices] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState("");
 useEffect(() => { let active=true; marketplaceServicesApi.listActive({page:0,size:4}).then(data => { if(active) setServices(data.content || []); }).catch(err => { if(active) setError(err.message); }).finally(() => { if(active) setLoading(false); }); return () => { active=false; }; }, []);
 const workspace = user ? homePathForRole(user.role) : "/register";
 return <div className="landing-page">
  <section className="landing-hero">
   <div className="landing-hero__content"><span className="landing-eyebrow"><span /> LOCAL EXPERTISE. EVERYDAY PEACE OF MIND.</span>
    <h1>A little help.<br/>A lot <em>less hassle.</em></h1>
    <p>From the repair you keep putting off to a fresh start for your home. Find local professionals and make room for what matters.</p>
    <form className="landing-search" onSubmit={e => {e.preventDefault(); navigate(`/find-services${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);}}><Search aria-hidden="true" size={22}/><label className="landing-sr-only" htmlFor="landing-query">What service do you need?</label><input id="landing-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="What can we help you with?" maxLength={120}/><button type="submit">Find services <ArrowRight size={18}/></button></form>
    <div className="landing-popular"><span>Start with</span>{["Cleaning","Plumbing","Electrical"].map(category=><Link key={category} to={`/find-services?q=${encodeURIComponent(category)}`}>{category}<ArrowUpRight size={14}/></Link>)}</div>
   </div>
   <div className="landing-hero__visual"><img src="/assets/service-cleaning.jpg" alt="Professional cleaning a home" fetchPriority="high"/><div className="landing-visual-caption"><span className="landing-icon"><CalendarCheck size={24}/></span><div><strong>Your home. In good hands.</strong><span>Find the right person for your next job.</span></div></div><span className="landing-photo-label">MORE TIME FOR YOU</span></div>
  </section>
  <section className="landing-benefits" aria-label="Why choose ClickCart">{[[ShieldCheck,"Choose with confidence","Browse provider profiles and verification details."],[CalendarCheck,"Plan around your day","Choose a service and request a time that suits you."],[MessageCircle,"Keep it all together","Manage your bookings and conversations in one place."]].map(([Icon,title,copy])=><div key={title}><Icon size={25}/><div><h2>{title}</h2><p>{copy}</p></div></div>)}</section>
  <section className="landing-section"><div className="landing-section-heading"><div><span className="landing-eyebrow">FIND YOUR NEXT HELPING HAND</span><h2>Local services, ready to explore.</h2></div><Link to="/find-services">View all services <ArrowUpRight size={19}/></Link></div>
   {loading ? <p role="status">Finding available services…</p> : error ? <div className="landing-empty" role="alert"><p>We couldn't load services right now.</p><Link to="/find-services">Try the service directory <ArrowRight size={18}/></Link></div> : services.length ? <div className="landing-service-grid">{services.map(service=><Link className="landing-service" to={`/find-services?q=${encodeURIComponent(service.title || "")}`} key={service.id}><div className="landing-service-image">{service.imageUrl ? <img src={service.imageUrl} alt="" loading="lazy"/> : <Wrench size={44}/>}<span><ArrowUpRight size={20}/></span></div><small>{service.category || "Local service"}</small><h3>{service.title}</h3><p>{service.description}</p>{service.priceFrom != null && <strong>From LKR {Number(service.priceFrom).toLocaleString()}</strong>}</Link>)}</div> : <div className="landing-empty"><Wrench size={30}/><h3>A place for local expertise.</h3><p>New services will appear here as providers publish them.</p><Link to={workspace} state={user ? undefined : { role: "SERVICE_PROVIDER" }}>{user ? "Open your workspace" : "Become a provider"}<ArrowRight size={18}/></Link></div>}
  </section>
  <section className="landing-how landing-section"><div><span className="landing-eyebrow">LESS SEARCHING. MORE LIVING.</span><h2>From “I need a hand”<br/>to “all sorted”.</h2><Link className="landing-primary-link" to="/find-services">Find your service <ArrowRight size={18}/></Link></div><ol>{[["Find your fit","Explore services, compare details and choose a professional."],["Make a plan","Choose your service and send a booking request."],["Keep in touch","Track the booking and message your provider from your account."]].map(([title,copy],i)=><li key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
  <section className="landing-provider"><div><span className="landing-eyebrow">YOUR SKILLS. YOUR NEXT OPPORTUNITY.</span><h2>Great at what you do?<br/>Let your community find you.</h2><p>Create your profile, share your services and manage your work with ClickCart.</p></div><Link className="landing-primary-link" to={workspace} state={user ? undefined : {role:"SERVICE_PROVIDER"}}>{user ? "Go to your workspace" : "Become a provider"}<ArrowUpRight size={20}/></Link></section>
 </div>;
}
