"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Relatório" },
  { href: "/comparar", label: "Comparar" },
];

export function AppHeader({ description }: { description?: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-accent-ink uppercase">
              Projeto de Tutoria — UFJF
            </p>
            <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
              Relatório de Inscrições
            </h1>
          </div>
          <nav className="flex gap-1 rounded-full border border-line bg-paper p-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-ink text-paper-raised"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
    </div>
  );
}
