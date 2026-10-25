import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { notify } from "../../context/FeedbackHost";
import { getFavorites, addFavorite, removeFavorite } from "../../services/favoritesApi";
import Button from "../common/Button";

export default function FavoriteButton({ targetType, targetId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    setSaved(false); setLoaded(false);
    const load = () => {
      if (user?.role !== "CUSTOMER") return;
      getFavorites().then(items => { if (active) { setSaved(items.some(item => item.targetType === targetType && item.targetId === targetId)); setLoaded(true); } }).catch(() => { if (active) setLoaded(false); });
    };
    load(); window.addEventListener("favorites-updated", load);
    return () => { active = false; window.removeEventListener("favorites-updated", load); };
  }, [user?.id, user?.role, targetType, targetId]);
  if (user && user.role !== "CUSTOMER") return null;
  async function toggle(event) {
    event.stopPropagation();
    if (!user) { navigate("/login", { state: { from: location } }); return; }
    setBusy(true);
    try {
      const current = loaded ? saved : (await getFavorites()).some(item => item.targetType === targetType && item.targetId === targetId);
      if (current) await removeFavorite(targetType, targetId); else await addFavorite(targetType, targetId);
      setSaved(!current); setLoaded(true);
      notify(current ? "Removed from favorites" : "Added to favorites", "success");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }
  return <Button variant="outline" size="sm" loading={busy} disabled={!targetId} aria-pressed={saved} onClick={toggle} leftIcon={<Heart size={16} fill={saved ? "currentColor" : "none"} />}>{saved ? "Saved" : "Save"}</Button>;
}
