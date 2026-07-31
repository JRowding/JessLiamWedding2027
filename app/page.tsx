"use client";

import { FormEvent, useState } from "react";

type AgeGroup = "adult" | "child" | "";
type Guest = { firstName: string; lastName: string; ageGroup: AgeGroup; starter: string; main: string; dessert: string; dietary: string; songSuggestion: string };

const adultMenu = {
  starters: ["Roasted vine tomato soup with red pepper salsa", "Homemade chicken liver parfait, sourdough croûtes, tomato and chorizo jam"],
  mains: ["Braised blade of beef, horseradish mash, Yorkshire pudding, caramelised red onion sauce", "Roasted chicken breast, fondant potato, seasonal vegetables, rosemary gravy", "Roasted vegetable and mozzarella tart, herb oil and rocket (vegetarian)"],
  desserts: ["Warm chocolate brownie, dark chocolate sauce, vanilla ice cream", "Baked New York cheesecake, blueberry compote, lemon shortbread base"],
};
const childMenu = {
  starters: ["Fan of melon with fruit compote", "Chef's soup of the day"],
  mains: ["Mini fish goujons with chips and peas", "Chicken goujons with chips and beans", "Cheese and tomato pizza with chips and beans"],
  desserts: ["Trio of ice cream", "Fresh fruit salad"],
};

const blankGuest = (): Guest => ({ firstName: "", lastName: "", ageGroup: "", starter: "", main: "", dessert: "", dietary: "", songSuggestion: "" });

export default function Home() {
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [guests, setGuests] = useState<Guest[]>([blankGuest()]);
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    setGuests((current) => current.map((guest, i) => i === index ? { ...guest, [field]: value } : guest));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const rsvp = { contactFirstName, contactLastName, attending, guests: attending === "yes" ? guests : [], submittedAt: new Date().toISOString() };
    try {
      const guestFields = Object.fromEntries(rsvp.guests.flatMap((guest, index) => {
        const guestNumber = index + 1;
        return [
          [`Guest ${guestNumber}`, `${guest.firstName} ${guest.lastName} (${guest.ageGroup})`],
          [`Guest ${guestNumber} — starter`, guest.starter],
          [`Guest ${guestNumber} — main`, guest.main],
          [`Guest ${guestNumber} — dessert`, guest.dessert],
          [`Guest ${guestNumber} — dietary requirements`, guest.dietary || "None provided"],
          ...(guest.ageGroup === "adult" ? [[`Guest ${guestNumber} — song suggestion`, guest.songSuggestion || "None provided"]] : []),
        ];
      }));
      await fetch("https://script.google.com/macros/s/AKfycbwcc2mYgUlYcfe3LoCXlJYueTIP_oKZWleBnSELyAuci5l9dIIQ_w6JFPYyw5e4nE8_gQ/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          _subject: "New RSVP — Jess & Liam",
          _template: "table",
          "Lead guest": `${contactFirstName} ${contactLastName}`,
          Attendance: attending === "yes" ? "Joyfully accepts" : "Regretfully declines",
          _honey: honeypot,
          ...(attending === "yes" ? guestFields : { "Party details": "No menu choices required" }),
        }),
      });
      localStorage.setItem("jess-and-liam-rsvp", JSON.stringify(rsvp));
      setMessage(attending === "yes" ? "Thank you — your RSVP and menu choices have been sent to Jess and Liam." : "Thank you for letting Jess and Liam know.");
    } catch {
      setMessage("We couldn’t send your RSVP just now. Please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Together with their families</p>
        <h1>Jess <span>&amp;</span> Liam</h1>
        <p className="date">28 May 2027</p>
        <p className="intro">We would be delighted to celebrate with you.</p>
        <a href="#rsvp" className="button">RSVP</a>
      </section>

      <section className="details">
        <div><p className="eyebrow">The celebration</p><h2>A day to remember</h2><p><strong>Ceremony:</strong> St. George’s Church</p><p><strong>Wedding breakfast &amp; reception:</strong> Hadley Park Hotel</p><p>Please reply below so we can plan the day, including your menu choices.</p></div>
      </section>

      <section id="rsvp" className="rsvp">
        <p className="eyebrow">Kindly reply</p><h2>Will you join us?</h2>
        <form onSubmit={submit}>
          <label className="honeypot" aria-hidden="true">Leave this blank<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
          <div className="contact-grid"><label>Your first name<input required value={contactFirstName} onChange={(e) => setContactFirstName(e.target.value)} /></label><label>Your surname<input required value={contactLastName} onChange={(e) => setContactLastName(e.target.value)} /></label></div>
          <fieldset className="attendance"><legend>Attendance</legend><label><input type="radio" name="attendance" required checked={attending === "yes"} onChange={() => { setAttending("yes"); setGuests((current) => current.map((guest, index) => index === 0 ? { ...guest, firstName: contactFirstName, lastName: contactLastName } : guest)); }} /> Joyfully accepts</label><label><input type="radio" name="attendance" checked={attending === "no"} onChange={() => setAttending("no")} /> Regretfully declines</label></fieldset>
          {attending === "yes" && <div className="guests">
            <p className="guest-note">Please add every person in your party. Children aged 12 or under will see the children’s menu.</p>
            {guests.map((guest, index) => {
              const menu = guest.ageGroup === "child" ? childMenu : adultMenu;
              return <article className="guest-card" key={index}>
                <div className="guest-title"><h3>Guest {index + 1}</h3>{guests.length > 1 && <button type="button" className="text-button" onClick={() => setGuests((list) => list.filter((_, i) => i !== index))}>Remove</button>}</div>
                <div className="contact-grid"><label>First name<input required value={guest.firstName} onChange={(e) => updateGuest(index, "firstName", e.target.value)} /></label><label>Surname<input required value={guest.lastName} onChange={(e) => updateGuest(index, "lastName", e.target.value)} /></label></div>
                {guest.firstName.trim() && guest.lastName.trim() && <label className="reveal">Adult or child<select required value={guest.ageGroup} onChange={(e) => updateGuest(index, "ageGroup", e.target.value)}><option value="" disabled>Choose one</option><option value="adult">Adult</option><option value="child">Child (12 or under)</option></select></label>}
                {guest.ageGroup && <div className="reveal"><div className="menu-grid"><MenuSelect label="Starter" choices={menu.starters} value={guest.starter} onChange={(value) => updateGuest(index, "starter", value)} /><MenuSelect label="Main" choices={menu.mains} value={guest.main} onChange={(value) => updateGuest(index, "main", value)} /><MenuSelect label="Dessert" choices={menu.desserts} value={guest.dessert} onChange={(value) => updateGuest(index, "dessert", value)} /></div><label>Dietary requirements or allergies<textarea value={guest.dietary} onChange={(e) => updateGuest(index, "dietary", e.target.value)} placeholder="Please tell us about any requirements" /></label>{guest.ageGroup === "adult" && <label className="song-suggestion">Song suggestion<textarea value={guest.songSuggestion} onChange={(e) => updateGuest(index, "songSuggestion", e.target.value)} placeholder="A song that will get you on the dance floor" /></label>}</div>}
              </article>;
            })}
            <button type="button" className="add-guest" onClick={() => setGuests((list) => [...list, blankGuest()])}>+ Add another guest</button>
          </div>}
          <button className="button submit" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send RSVP"}</button>
          {message && <p className="success" role="status">{message}</p>}
        </form>
      </section>
      <footer>Jess &amp; Liam <span>·</span> 2027</footer>
    </main>
  );
}

function MenuSelect({ label, choices, value, onChange }: { label: string; choices: string[]; value: string; onChange: (value: string) => void }) {
  return <label>{label}<select required value={value} onChange={(e) => onChange(e.target.value)}><option value="" disabled>Choose a {label.toLowerCase()}</option>{choices.map((choice) => <option value={choice} key={choice}>{choice}</option>)}</select></label>;
}
