import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
const slides=[
 {image:"/assets/service-cleaning.jpg",title:"A fresh space. A fresh start.",copy:"Find cleaning services for the place you call home.",query:"Cleaning",tag:"HOME, FEELING GOOD"},
 {image:"/assets/service-plumbing.jpg",title:"Small repairs. Big relief.",copy:"Explore local plumbing services and plan your next repair.",query:"Plumbing",tag:"HELP WHEN YOU NEED IT"},
 {image:"/assets/service-ac-repair.jpg",title:"Make room for comfort.",copy:"Find air conditioning services for your everyday comfort.",query:"AC",tag:"EVERYDAY, MADE EASIER"}
];
export default function LandingCarousel(){
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[hover,setHover]=useState(false),[focused,setFocused]=useState(false);
 useEffect(()=>{if(!playing||hover||focused)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%slides.length);},6500);return()=>clearInterval(timer);},[playing,hover,focused]);
 const move=offset=>{setPlaying(false);setIndex(i=>(i+offset+slides.length)%slides.length);};
 const slide=slides[index];
 return <section className="landing-carousel" aria-label="Explore service categories" aria-roledescription="carousel" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}} onKeyDown={e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}>
 <div className="landing-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${index+1} of ${slides.length}`}>
 <img key={slide.image} src={slide.image} alt="" fetchPriority="high"/><div className="landing-carousel__shade"/>
 <div className="landing-carousel__copy" aria-live={playing?"off":"polite"}><span>{slide.tag}</span><h2>{slide.title}</h2><p>{slide.copy}</p><Link to={`/find-services?q=${encodeURIComponent(slide.query)}`}>Explore {slide.query === "AC" ? "AC services" : slide.query.toLowerCase()} <ArrowRight size={18}/></Link></div>
 </div><div className="landing-carousel__controls"><button aria-label="Previous slide" onClick={()=>move(-1)}><ArrowLeft size={18}/></button><div className="landing-carousel__dots">{slides.map((s,i)=><button key={s.query} aria-label={`Show slide ${i+1}: ${s.title}`} aria-pressed={i===index} onClick={()=>{setIndex(i);setPlaying(false);}}/>)}</div><button aria-label="Next slide" onClick={()=>move(1)}><ArrowRight size={18}/></button><button aria-label={playing?"Pause slideshow":"Play slideshow"} aria-pressed={playing} onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={16}/>:<Play size={16}/>}</button></div>
 </section>;
}
