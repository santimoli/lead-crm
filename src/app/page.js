"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import StatusSidebar from "@/features/leads/components/StatusSidebar";
import SearchBar from "@/features/leads/components/SearchBar";
import LeadForm from "@/features/leads/components/LeadForm";
import LeadList from "@/features/leads/components/LeadList";
import Pagination from "@/features/leads/components/Pagination";
import styles from "./page.module.css";

const emptyForm = { name: "", email: "", company: "", status: "NEW" };
const pageSize = 10;

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
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(lead) {
    setForm({
      name: lead.name,
      email: lead.email,
      company: lead.company,
      status: lead.status,
    });
    setEditingId(lead.id);
    setFieldErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFieldErrors({});
    setShowForm(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const url = editingId ? `/api/leads/${editingId}` : "/api/leads";
    const method = editingId ? "PATCH" : "POST";

    setSaving(true);
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json();
          setFieldErrors(body.fields ?? {});
          toast.error(body.error);
          return;
        }
        toast.success(editingId ? "Lead updated" : "Lead created");
        closeForm();
        loadLeads();
        loadStats();
      })
      .catch(() => toast.error("Could not save lead"))
      .finally(() => setSaving(false));
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

  const loadLeads = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      search,
      status: statusFilter,
      page,
      pageSize,
    });
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
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    loadStats();
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Leads</h1>
        {!showForm && (
          <button className="primary" onClick={() => setShowForm(true)}>
            New lead
          </button>
        )}
      </div>

      <div className={styles.layout}>
        <StatusSidebar
          stats={stats}
          status={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        />

        <section className={styles.content}>
          {showForm && (
            <LeadForm
              form={form}
              fieldErrors={fieldErrors}
              editing={editingId !== null}
              saving={saving}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          )}

          {!showForm && (
            <SearchBar
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          )}

          {error && <p className={styles.message}>Error: {error.message}</p>}
          {loading && leads.length === 0 && (
            <p className={styles.message}>Loading...</p>
          )}
          {!loading && !error && leads.length === 0 && (
            <p className={styles.message}>
              {search || statusFilter
                ? "No leads match your search."
                : "No leads yet. Add your first one with New lead."}
            </p>
          )}

          {leads.length > 0 && (
            <LeadList
              leads={leads}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          )}

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </section>
      </div>
    </main>
  );
}
