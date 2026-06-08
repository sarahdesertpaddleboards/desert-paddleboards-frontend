import { useState } from "react";
import axios from "axios";
import { ADMIN_API_BASE } from "@/lib/adminBase";
import OrdersManager from "@/components/admin/OrdersManager";
import GiftCertificatesManager from "@/components/admin/GiftCertificatesManager";

type Tab = "overview" | "records";

const FAREHARBOR_DASHBOARD = "https://fareharbor.com/dashboard/";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("overview");

  async function logout() {
    try {
      await axios.post(
        `${ADMIN_API_BASE}/admin/logout`,
        {},
        { withCredentials: true },
      );
    } catch {
      /* ignore — redirect regardless */
    }
    window.location.href = "/admin-login";
  }

  const tabClass = (t: Tab) =>
    `pb-2 text-sm font-medium ${
      tab === t
        ? "border-b-2 border-brand text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Desert Paddleboards Admin</h1>
        <button
          onClick={logout}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Log out
        </button>
      </div>

      <div className="flex gap-6 border-b pb-1">
        <button onClick={() => setTab("overview")} className={tabClass("overview")}>
          Overview
        </button>
        <button onClick={() => setTab("records")} className={tabClass("records")}>
          Store records
        </button>
      </div>

      {tab === "overview" && (
        <div className="space-y-5">
          <section className="space-y-3 rounded-2xl border border-brand/30 bg-brand/10 p-6">
            <h2 className="text-xl font-bold">Bookings &amp; gift certificates</h2>
            <p className="text-muted-foreground">
              All bookings, availability, and gift certificates are managed in
              FareHarbor. Use your FareHarbor dashboard to view and add bookings,
              open new dates, message customers, and handle cancellations,
              reschedules and refunds.
            </p>
            <a
              href={FAREHARBOR_DASHBOARD}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Open FareHarbor dashboard →
            </a>
          </section>

          <section className="space-y-2 rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold">Website content</h2>
            <p className="text-sm text-muted-foreground">
              Page copy — the homepage hero, FAQ, and location descriptions — is
              currently part of the site code. Ask your developer to update it. A
              self-service editor can be added later if you need to change copy
              often.
            </p>
          </section>
        </div>
      )}

      {tab === "records" && (
        <div className="space-y-8">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-muted-foreground">
            Legacy custom-store records (Stripe). New bookings and gift
            certificates live in FareHarbor, so these will usually be empty —
            kept here for reference only.
          </p>
          <OrdersManager />
          <GiftCertificatesManager />
        </div>
      )}
    </div>
  );
}
