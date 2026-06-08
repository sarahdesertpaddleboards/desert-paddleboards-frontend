import { Link } from "wouter";
import { membership } from "@/data/locations";
import FareHarborButton from "@/components/FareHarborButton";

export default function Membership() {
  return (
    <main>
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden bg-muted">
        <img
          src={membership.image}
          alt={membership.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em]">
              Membership
            </p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              {membership.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-1 gap-12 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Link href="/locations">
            <span className="inline-block cursor-pointer text-sm font-medium text-cyan-700 hover:text-cyan-900">
              &larr; All experiences
            </span>
          </Link>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {membership.blurb}
          </p>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Join the membership</h2>
            <p className="text-sm text-muted-foreground">
              Full details and pricing are shown at checkout.
            </p>
            <FareHarborButton
              itemId={membership.itemId}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              View &amp; join
            </FareHarborButton>
          </div>
        </aside>
      </div>
    </main>
  );
}
