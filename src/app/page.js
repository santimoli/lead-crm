"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
export default function Home() {

    const [leads, setLeads] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    const [form, setForm] = useState({ name: "", email: "", company: "" });
    const [fieldErrors, setFieldErrors] = useState({});

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        }).then(async (response) => {
            if (!response.ok) {
                const body = await response.json();
                setFieldErrors(body.fields ?? {});
                return;
            }
            setForm({ name: "", email: "", company: "" });
            setFieldErrors({});
            loadLeads();
        });
    }
    function handleDelete(id) {
        if (!confirm("Delete this lead?")) return;
        fetch(`/api/leads/${id}`, { method: "DELETE" }).then((response) => {
            if (response.ok) loadLeads();
        });
    }

    function loadLeads() {
        setLoading(true);
        fetch("/api/leads")
            .then((response) => {
                if (!response.ok) throw new Error("Could not load leads");
                return response.json();
            })
            .then((body) => setLeads(body.data))
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadLeads();
    }, []);

    return (
    <div className={styles.page}>
      <main>
          <h1>Leads</h1>
          <form onSubmit={handleSubmit}>
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
              {fieldErrors.name && <p>{fieldErrors.name}</p>}

              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
              {fieldErrors.email && <p>{fieldErrors.email}</p>}

              <input name="company" placeholder="Company" value={form.company} onChange={handleChange} />
              {fieldErrors.company && <p>{fieldErrors.company}</p>}

              <button type="submit">Add lead</button>
          </form>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {leads.length === 0 && !loading && !error && <p>No leads found</p>}
          <ul>
              {leads.map((lead) => (
                  <li key={lead.id}>
                      {lead.name} - {lead.email}
                      <button onClick={() => handleDelete(lead.id)}>Delete</button>
                  </li>
              ))}
          </ul>
      </main>
    </div>
  );
}
