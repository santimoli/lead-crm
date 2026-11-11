"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const emptyForm = { name: "", email: "", company: "", status: "NEW" };

export default function Home() {

    const [leads, setLeads] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    const [form, setForm] = useState(emptyForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function startEdit(lead) {
        setForm({ name: lead.name, email: lead.email, company: lead.company, status: lead.status });
        setEditingId(lead.id);
        setFieldErrors({});
    }

    function cancelEdit() {
        setForm(emptyForm);
        setEditingId(null);
        setFieldErrors({});
    }

    function handleSubmit(e) {
        e.preventDefault();
        const url = editingId ? `/api/leads/${editingId}` : "/api/leads";
        const method = editingId ? "PATCH" : "POST";

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        }).then(async (response) => {
            if (!response.ok) {
                const body = await response.json();
                setFieldErrors(body.fields ?? {});
                return;
            }
            cancelEdit();
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
        setError(null);
        const params = new URLSearchParams({ search, status: statusFilter });
        fetch(`/api/leads?${params}`)
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
    }, [search, statusFilter]);

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

              <select name="status" value={form.status} onChange={handleChange}>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="LOST">Lost</option>
              </select>

              <button type="submit">{editingId ? "Save" : "Add lead"}</button>
              {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
          </form>

          <div>
              <input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="LOST">Lost</option>
              </select>
          </div>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {leads.length === 0 && !loading && !error && <p>No leads found</p>}
          <ul>
              {leads.map((lead) => (
                  <li key={lead.id}>
                      {lead.name} - {lead.email} ({lead.status})
                      <button onClick={() => startEdit(lead)}>Edit</button>
                      <button onClick={() => handleDelete(lead.id)}>Delete</button>
                  </li>
              ))}
          </ul>
      </main>
    </div>
  );
}
