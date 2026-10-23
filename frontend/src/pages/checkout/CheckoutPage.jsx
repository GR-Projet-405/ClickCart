import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import Button from '../../components/common/Button';
import './CheckoutPage.css';
export default function CheckoutPage(){
 const [params]=useSearchParams();const id=params.get('bookingId');const [payment,setPayment]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{if(!id){setError('Choose a booking from My bookings first.');return;}setBusy(true);setError('');try{setPayment(await paymentService.createPaymentIntent({bookingId:id}));}catch(e){setError(e.message);}finally{setBusy(false);}};
 useEffect(()=>{load();},[id]);
 return <div className="cc-checkout-container"><h1>Cash on service</h1><p>Pay your provider directly after the work is complete. The provider confirms receipt of the cash.</p>{error&&<p role="alert">{error}</p>}{payment&&<div className="cc-checkout-card"><h2>{payment.serviceTitle}</h2><p>{payment.providerName}</p><p>{payment.serviceAddress}</p><h3>{payment.currency} {Number(payment.amount).toLocaleString()}</h3><p>Status: {payment.status==='COMPLETED'?'Cash received — paid':'Cash due — not paid yet'}</p>{payment.status==='COMPLETED'?<Link to={`/receipt/${encodeURIComponent(payment.id)}`}>View receipt</Link>:<p>No card details or online payment are needed. Refresh after your provider confirms cash received.</p>}</div>}<Button loading={busy} onClick={load}>Refresh payment status</Button> <Link to="/my-bookings">Back to my bookings</Link></div>;
}
