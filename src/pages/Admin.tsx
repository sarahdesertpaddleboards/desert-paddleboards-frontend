import { useEffect, useMemo, useState } from "react";
import ProductsEditor from "@/components/admin/ProductsEditor";
import OrdersManager from "@/components/admin/OrdersManager";
import GiftCertificatesManager from "@/components/admin/GiftCertificatesManager";
import ClassProductsEditor from "@/components/admin/classes/ClassProductsEditor";
import ClassSessionsEditor from "@/components/admin/classes/ClassSessionsEditor";
import { fetchAdminClassProducts, type AdminClassProduct } from "@/lib/adminApi";

type AdminTab = "catalog" | "orders" | "giftCertificates" | "experienceProducts" | "manageExperiences";

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>("catalog");
  const [classProducts, setClassProducts] = useState<AdminClassProduct[]>([]);
  const [selectedClassProductId, setSelectedClassProductId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminClassProducts().then((items) => {
      const list = Array.isArray(items) ? items : [];
      setClassProducts(list);
      if (!selectedClassProductId && list[0]?.id) {
        setSelectedClassProductId(list[0].id);
      }
    });
  }, []);

  const selectedExperienceProduct = useMemo(
    () => classProducts.find((p) => p.id === selectedClassProductId) ?? null,
    [classProducts, selectedClassProductId],
  );

  const pageIntro = useMemo(() => {
    switch (tab) {
      case "catalog":
        return {
          title: "Catalog",
          description:
            "Manage non-experience items customers can buy, including merchandise, gift certificates, and digital products.",
          nextStep: "Use Catalog when you are selling a thing, not scheduling a real-life session.",
        };
      case "experienceProducts":
        return {
          title: "Experience Products",
          description:
            "Define reusable real-life experience types such as floating soundbath, private pool session, private event, or yoga class.",
          nextStep: "Create the experience type here first, then schedule its actual dates and times in Manage Experiences.",
        };
      case "manageExperiences":
        return {
          title: "Manage Experiences",
          description:
            "Schedule and update the real bookable sessions for each experience product, including venue, time, and capacity.",
          nextStep: "Choose an experience product, then create or update the actual sessions customers will see and book.",
        };
      case "giftCertificates":
        return {
          title: "Gift Certificates",
          description:
            "Review issued gift certificates, balances, and redemption-related admin details.",
          nextStep: "Use this area to monitor codes, balances, and recipients after gift purchases have been made.",
        };
      case "orders":
      default:
        return {
          title: "Orders",
          description:
            "Review purchases and order activity across catalog items and booked experiences.",
          nextStep: "Use Orders to understand what customers bought, not to define products or sessions.",
        };
    }
  }, [tab]);

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Blue Wave Experiences Admin</h1>
        <p className="text-muted-foreground max-w-3xl">
          Use this admin to manage what you sell, the real-life experiences you offer, and the actual scheduled sessions customers can book.
        </p>
      </div>

      <div className="flex gap-4 border-b pb-2 flex-wrap">
        <button
          onClick={() => setTab("catalog")}
          className={`pb-2 ${tab === "catalog" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Catalog
        </button>

        <button
          onClick={() => setTab("experienceProducts")}
          className={`pb-2 ${tab === "experienceProducts" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Experience Products
        </button>

        <button
          onClick={() => setTab("manageExperiences")}
          className={`pb-2 ${tab === "manageExperiences" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Manage Experiences
        </button>

        <button
          onClick={() => setTab("orders")}
          className={`pb-2 ${tab === "orders" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Orders
        </button>

        <button
          onClick={() => setTab("giftCertificates")}
          className={`pb-2 ${tab === "giftCertificates" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Gift Certificates
        </button>
      </div>

      <div className="rounded-xl border bg-slate-50 p-4 space-y-2">
        <h2 className="text-lg font-semibold">{pageIntro.title}</h2>
        <p className="text-sm text-muted-foreground">{pageIntro.description}</p>
        <p className="text-sm text-foreground">
          <span className="font-medium">What to do here:</span> {pageIntro.nextStep}
        </p>
        {tab === "manageExperiences" && selectedExperienceProduct ? (
          <p className="text-sm text-muted-foreground">
            Currently viewing sessions for <span className="font-medium text-foreground">{selectedExperienceProduct.name}</span>.
          </p>
        ) : null}
      </div>

      {tab === "catalog" && <ProductsEditor />}
      {tab === "orders" && <OrdersManager />}
      {tab === "giftCertificates" && <GiftCertificatesManager />}
      {tab === "experienceProducts" && <ClassProductsEditor />}
      {tab === "manageExperiences" && (
        <ClassSessionsEditor
          classProductId={selectedClassProductId}
          classProducts={classProducts}
          onSelectClassProduct={setSelectedClassProductId}
        />
      )}
    </div>
  );
}
