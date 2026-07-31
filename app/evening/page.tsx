"use client";

import { FormEvent, useState } from "react";

type Guest = { firstName: string; lastName: string };
const blankGuest = (): Guest => ({ firstName: "", lastName: "" });

export default function EveningRSVP() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [guests, setGuests] = useState<Guest[]>([blankGuest()]);
  const [honeypot, setHoneypot] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateGuest = (index: number, field: keyof Guest, value: string) => setGuests((list) => list.map((guest, i) => i === index ? { ...guest, [field]: value } : guest));
  const accept = () => {
    setAttending("yes");
    setGuests((list) => list.map((guest, index) => index === 0 ? { ...guest, firstName, lastName } : guest));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const guestFields = Object.fromEntries(guests.map((guest, index) => [`Guest ${index + 1}`, `${guest.firstName} ${guest.lastName}`]));
    try {
      await fetch("https://script.google.com/macros/s/AKfycbwcc2mYgUlYcfe3LoCXlJYueTIP_oKZWleBnSELyAuci5l9dIIQ_w6JFPYyw5e4nE8_gQ/exec", {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ _subject: "New evening RSVP — Jess & Liam", "Lead guest": `${firstName} ${lastName}`, Attendance: attending === "yes" ? "Joyfully accepts" : "Regretfully declines", _honey: honeypot, ...(attending === "yes" ? guestFields : {}) }),
      });
      setMessage(attending === "yes" ? "Thank you — your evening RSVP has been sent to Jess and Liam." : "Thank you for letting Jess and Liam know.");
    } catch { setMessage("We couldn’t send your RSVP just now. Please try again shortly."); }
    finally { setSubmitting(false); }
  }

  return <main>
    <section className="hero evening-hero"><p className="eyebrow">Together with their families</p><h1>Jess <span>&amp;</span> Liam</h1><p className="date">28 May 2027</p><p className="intro">We would be delighted to celebrate with you.</p><a href="#rsvp" className="button">RSVP</a></section>
    <section className="details evening-details"><div><p className="eyebrow">The celebration</p><h2>Evening party</h2><p><strong>Evening party:</strong> Hadley Park Hotel</p><p>Please reply below so we can plan the celebration.</p></div></section>
    <section id="rsvp" className="rsvp"><p className="eyebrow">Kindly reply</p><h2>Will you join us?</h2><form onSubmit={submit}>
      <label className="honeypot" aria-hidden="true">Leave this blank<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
      <div className="contact-grid"><label>Your first name<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label><label>Your surname<input required value={lastName} onChange={(e) => setLastName(e.target.value)} /></label></div>
      <fieldset className="attendance"><legend>Attendance</legend><label><input type="radio" name="attendance" required checked={attending === "yes"} onChange={accept} /> Joyfully accepts</label><label><input type="radio" name="attendance" checked={attending === "no"} onChange={() => setAttending("no")} /> Regretfully declines</label></fieldset>
      {attending === "yes" && <div className="guests"><p className="guest-note">Please add every person in your party.</p>{guests.map((guest, index) => <article className="guest-card" key={index}><div className="guest-title"><h3>Guest {index + 1}</h3>{guests.length > 1 && <button type="button" className="text-button" onClick={() => setGuests((list) => list.filter((_, i) => i !== index))}>Remove</button>}</div><div className="contact-grid"><label>First name<input required value={guest.firstName} onChange={(e) => updateGuest(index, "firstName", e.target.value)} /></label><label>Surname<input required value={guest.lastName} onChange={(e) => updateGuest(index, "lastName", e.target.value)} /></label></div></article>)}<button type="button" className="add-guest" onClick={() => setGuests((list) => [...list, blankGuest()])}>+ Add another guest</button></div>}
      <button className="button submit" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send RSVP"}</button>{message && <p className="success" role="status">{message}</p>}
    </form></section><footer>Jess &amp; Liam <span>·</span> 2027</footer>
  </main>;
}
