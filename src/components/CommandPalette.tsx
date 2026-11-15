"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type PaletteItem = {
  label: string;
  hint: string;
  href: string;
  external?: boolean;
};

/** Other components open the palette or hand a question to the assistant with these. */
export const OPEN_PALETTE_EVENT = "portfolio:palette";
export const ASK_EVENT = "portfolio:ask";
export const ASK_STORAGE_KEY = "portfolio:ask";

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const open = () => {
      const el = dialog.current;
      if (!el || el.open) return;
      setQuery("");
      setActive(0);
      el.showModal();
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, open);
    };
  }, []);

  const text = query.trim();
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = items.filter((item) => {
    const haystack = `${item.label} ${item.hint}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  // Anything typed can also be sent to the assistant as a question.
  const rows: PaletteItem[] = text
    ? [...matches, { label: `Ask: “${text}”`, hint: "Assistant", href: "ask" }]
    : matches;
  const current = Math.min(active, rows.length - 1);

  function choose(item: PaletteItem) {
    dialog.current?.close();
    if (item.href === "ask") {
      if (pathname === "/") {
        window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: text }));
      } else {
        sessionStorage.setItem(ASK_STORAGE_KEY, text);
        router.push("/");
      }
    } else if (item.external) {
      window.open(item.href, "_blank", "noopener");
    } else {
      router.push(item.href);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Command palette"
      className="palette"
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
    >
      <div className="border-b border-line p-3">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((current + 1) % rows.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current - 1 + rows.length) % rows.length);
            } else if (event.key === "Enter" && rows[current]) {
              event.preventDefault();
              choose(rows[current]);
            }
          }}
          placeholder="Jump to a page, or type a question…"
          aria-label="Search pages or ask a question"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={rows[current] ? `palette-${current}` : undefined}
          autoComplete="off"
          className="w-full bg-transparent px-2 py-1.5 outline-none placeholder:text-ink3"
        />
      </div>
      <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
        {rows.map((item, i) => (
          <li
            key={item.href + item.label}
            id={`palette-${i}`}
            role="option"
            aria-selected={i === current}
            onPointerMove={() => setActive(i)}
            onClick={() => choose(item)}
            className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ${
              i === current ? "bg-accent/20 text-ink" : "text-ink2"
            }`}
          >
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-mono text-[0.7rem] text-ink3">
              {item.hint}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-4 py-2 font-mono text-[0.7rem] text-ink3">
        ↑↓ move · Enter open · Esc close
      </p>
    </dialog>
  );
}
