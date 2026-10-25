import { Navigate } from 'react-router-dom';
export default function InstantDispatchModal({provider}) {
 return provider ? <Navigate to={`/booking/create?providerId=${encodeURIComponent(provider.providerId || provider.id)}`} replace/> : null;
}
