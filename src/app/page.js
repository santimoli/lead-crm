"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import styles from "./page.module.css";

const emptyForm = { name: "", email: "", company: "", status: "NEW" };
const pageSize = 5;

export default function Home() {

    const [leads, setLeads] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    const [form, setForm] = useState(emptyForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);

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
                toast.error(body.error);
                return;
            }
            toast.success(editingId ? "Lead updated" : "Lead created");
            cancelEdit();
            loadLeads();
            loadStats();
        });
    }
    function handleDelete(id) {
        if (!confirm("Delete this lead?")) return;
        fetch(`/api/leads/${id}`, { method: "DELETE" }).then((response) => {
            if (!response.ok) {
                toast.error("Could not delete lead");
                return;
            }
            toast.success("Lead deleted");
            loadLeads();
            loadStats();
        });
    }

    function loadStats() {
        fetch("/api/leads/stats")
            .then((response) => response.json())
            .then((body) => setStats(body));
    }

    function loadLeads() {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ search, status: statusFilter, page, pageSize });
        fetch(`/api/leads?${params}`)
            .then((response) => {
                if (!response.ok) throw new Error("Could not load leads");
                return response.json();
            })
            .then((body) => {
                if (body.data.length === 0 && page > 1) {
                    setPage(page - 1);
                    return;
                }
                setLeads(body.data);
                setTotal(body.meta.total);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadLeads();
    }, [search, statusFilter, page]);

    useEffect(() => {
        loadStats();
    }, []);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
    <div className={styles.page}>
      <main>
          <h1>Leads</h1>

          {stats && (
              <p>
                  Total: {stats.total}
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                      <span key={status}> | {status}: {count}</span>
                  ))}
              </p>
          )}
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
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
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

          <div>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span> Page {page} of {totalPages} </span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
      </main>
    </div>
  );
}
