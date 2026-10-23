import React, { useEffect, useState } from "react";
import Toast from "../pages/provider/serviceAreas/components/Toast";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";

export function notify(message, type = "error") {
  window.dispatchEvent(new CustomEvent("app-notification", { detail: { message, type } }));
}
export function confirmAction(message) {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent("app-confirmation", { detail: { message, resolve } })));
}
export function requestCaption(message, value = "") {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent("app-confirmation", { detail: { message, value, input: true, resolve } })));
}
export default function FeedbackHost() {
  const [notice, setNotice] = useState(null);
  const [queue, setQueue] = useState([]);
  const [value, setValue] = useState("");
  useEffect(() => { setValue(queue[0]?.value || ""); }, [queue]);
  useEffect(() => {
    const notification = event => setNotice({ ...event.detail, id: Date.now() });
    const confirmation = event => setQueue(items => [...items, event.detail]);
    window.addEventListener("app-notification", notification);
    window.addEventListener("app-confirmation", confirmation);
    return () => { window.removeEventListener("app-notification", notification); window.removeEventListener("app-confirmation", confirmation); };
  }, []);
  const finish = value => { queue[0]?.resolve(value); setQueue(items => items.slice(1)); };
  return <>{notice && <Toast key={notice.id} {...notice} onClose={() => setNotice(null)} />}
    <ConfirmDialog open={queue.length > 0 && !queue[0]?.input} title="Please confirm" message={queue[0]?.message} onClose={() => finish(false)} onConfirm={() => finish(true)} />
    <Modal open={Boolean(queue[0]?.input)} title="Enter details" onClose={() => finish(null)} footer={<><Button variant="ghost" onClick={() => finish(null)}>Cancel</Button><Button onClick={() => finish(value)}>Save</Button></>}>
      <label>{queue[0]?.message}<input value={value} maxLength={500} onChange={event => setValue(event.target.value)} /></label>
    </Modal>
  </>;
}
