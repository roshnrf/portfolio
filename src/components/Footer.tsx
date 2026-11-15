import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-ink3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {profile.name} · {profile.location}
        </p>
        <ul className="flex gap-5">
          <li>
            <a className="hover:text-ink" href={profile.links.github}>
              GitHub
            </a>
          </li>
          <li>
            <a className="hover:text-ink" href={profile.links.linkedin}>
              LinkedIn
            </a>
          </li>
          <li>
            <a className="hover:text-ink" href={`mailto:${profile.email}`}>
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
