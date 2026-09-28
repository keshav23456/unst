import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Users, Megaphone, ShieldCheck } from "lucide-react";

const TABS = [
  { id: "participant", label: "For Participants", icon: Users },
  { id: "organizer", label: "For Organizers", icon: Megaphone },
  { id: "admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

const List = ({ items, ordered }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} list-inside space-y-1 text-gray-700`}>
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </Tag>
  );
};

const Section = ({ title, children }) => (
  <section>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {children}
  </section>
);

export default function Resources() {
  const role = useSelector((s) => s.auth.userData?.role);
  const [picked, setPicked] = useState(null);
  // Open on the tab that matches the signed-in user's role; anyone can browse the others.
  const active = picked ?? (role === "organizer" ? "organizer" : role === "admin" ? "admin" : "participant");
  const tabs = TABS.filter((t) => !t.adminOnly || role === "admin");

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-2">Resources</h1>
      <p className="text-gray-600 mb-6">Everything you need to take part in, or run, a hackathon on EventX.</p>

      <div className="flex flex-wrap gap-2 mb-8 border-b">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPicked(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === id ? "border-yellow-500 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {active === "participant" && (
        <div className="space-y-6">
          <Section title="How a hackathon works">
            <List ordered items={[
              "Browse events and open one that interests you.",
              "Form a team: create one (you become its leader) or join an existing team with its team ID. You can be on only one team per hackathon, and a team can't exceed the hackathon's max team size.",
              "Build your project during the round.",
              "Before the round ends, submit two links: your live project URL and your GitHub repo. Your team gets one submission per round, and only team members can submit.",
              "The organizer reviews submissions and announces winners. If more rounds remain the next round opens; after the final round the hackathon ends.",
            ]} />
          </Section>
          <Section title="Judging criteria">
            <p className="text-gray-700 mb-2">
              Each round has its own judging criteria, set by the organizer. Read them before you start building. Common ones:
            </p>
            <List items={[
              "Innovation: is the idea original, or a fresh take on a known problem?",
              "Technical execution: does it actually work as demoed, and is the code sound?",
              "Impact: does it solve a real problem for real users?",
              "Design & usability: is it clear and pleasant to use?",
              "Completeness: how much of the idea is really built by the deadline?",
              "Presentation: a clear README, a working live link, and a short demo.",
            ]} />
          </Section>
          <Section title="Useful things to have ready">
            <List items={[
              "A GitHub repo (public, or accessible to the organizers) with a README covering what it does and how to run it.",
              "A deployed link (Vercel, Render, Netlify, etc.). Open it in a private window to confirm it works for someone who isn't you.",
              "Agreed roles inside your team, and small commits from the start so progress is visible.",
              "Time to spare: submit well before the round closes rather than in the last minutes.",
            ]} />
          </Section>
        </div>
      )}

      {active === "organizer" && (
        <div className="space-y-6">
          <Section title="How to organize a hackathon">
            <List ordered items={[
              "Sign up as an organizer (or ask an admin to change your role). Only organizers and admins can create hackathons.",
              "Go to Organize and fill in the name, description, banner, prize pool, finale date, max team size and number of rounds.",
              "On your hackathon's page, use Start Round to add each round: a name, type, judging criteria, and start and end dates.",
              "During and after a round, open Submissions to review what teams have sent in.",
              "Announce the winners. This opens the next round, or finishes the hackathon if it was the last one.",
            ]} />
          </Section>
          <Section title="Setting good judging criteria">
            <p className="text-gray-700 mb-2">Publish criteria before a round opens so teams know what they're being scored on. A simple starting split:</p>
            <List items={[
              "Innovation 25%: originality of the idea",
              "Technical execution 25%: it works, and the code is sound",
              "Impact 20%: solves a real problem",
              "Design & usability 15%",
              "Presentation 15%: README, live link, demo",
            ]} />
          </Section>
          <Section title="Useful things to know">
            <List items={[
              "You can manage only the hackathons you created; admins can manage any.",
              "Keep the round count realistic. Teams plan their whole schedule around it.",
              "A specific description attracts better-matched teams than a vague one.",
              "Announce results promptly, since teams are waiting on you before the next round.",
            ]} />
          </Section>
        </div>
      )}

      {active === "admin" && role === "admin" && (
        <div className="space-y-6">
          <Section title="What admins can do">
            <List items={[
              "See every user and change anyone's role (participant, organizer, admin) from the Admin dashboard.",
              "Manage any hackathon: add rounds, review submissions, announce winners.",
              "Delete a hackathon. This permanently removes its rounds, teams and submissions too.",
            ]} />
          </Section>
          <Section title="Good to know">
            <List items={[
              "You can't change your own role, so the platform always keeps an admin.",
              "Role changes take effect on the user's next request; they don't need to sign in again.",
            ]} />
          </Section>
          <Link to="/admin" className="inline-block px-4 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-300">
            Open Admin dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
