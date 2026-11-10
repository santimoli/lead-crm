"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
export default function Home() {

    const [leads, setLeads] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/leads")
            .then((response)=> {
                if (!response.ok) throw new Error("Could not load leads");
                return response.json();
            })
        .then((body) => {setLeads(body.data)})
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    },[]);

    return (
    <div className={styles.page}>
      <main>
          <h1>Leads</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {leads.length === 0 && !loading && !error && <p>No leads found</p>}
          <ul>
              {leads.map((lead) => (
                  <li key={lead.id}>
                      {lead.name} - {lead.email}
                  </li>
              ))}
          </ul>
      </main>
    </div>
  );
}
