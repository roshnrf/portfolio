# Portfolio

Personal site for Roshan Abdul Rauof. Next.js (App Router), TypeScript, Tailwind. Fully static: every page is generated at build time from files in this repo.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, also type-checks
npm run lint
npm test         # unit tests for the search logic
```

## Post an update

Add one file to `content/updates/`, named `YYYY-MM-short-title.md`:

```md
---
title: Started a working student role at Example GmbH
date: "2027-02-01"
tags: [Work]
---

Body in Markdown. Links, lists and **bold** all work.
```

Commit and push. Vercel rebuilds and the update appears on `/updates` and in the "Latest" list on the home page (newest three).

## Add or edit a project

Each project is one file in `content/projects/`. The file name is the URL (`pirs.md` becomes `/projects/pirs`).

| Frontmatter | Meaning |
| --- | --- |
| `title`, `tagline`, `summary`, `year` | Shown on the card and the page header |
| `order` | Position on the home page, lowest first |
| `metrics` | List of `value` / `label` pairs. The first two show on the card |
| `tags` | Tech chips |
| `repo`, `demo` | GitHub link and optional live demo link |
| `status` | Optional one-line note under the buttons |

Images go in `public/projects/` and are referenced as `/projects/file.png`.

## Add a blog post

Add a file to `content/writing/` with `title`, `date`, `summary` and `readingTime`. Posts hosted elsewhere (Medium) are listed in `externalPosts` in `src/data/profile.ts`.

## The assistant in the hero

The "ask about my work" box answers from this site's own content, in the visitor's browser. No server and no API key.

- `scripts/build-index.ts` runs before `dev` and `build`. It splits every project, post, update and the profile data into passages, embeds them with all-MiniLM-L6-v2 and writes `public/search-index.json` (generated, not committed). New Markdown is picked up automatically.
- `public/embed-worker.js` embeds the question in the browser with the same model. Until it has loaded, keyword matching answers.
- The confidence gate lives in `content/eval/calibration.json`. After changing a lot of content, re-run it:

```bash
npm run index && npm run calibrate
```

  It scores the questions in `content/eval/questions.json` (ones the site can answer, ones it cannot) and picks the threshold between the two groups. Add questions there when you add a project.
- If you upgrade `@huggingface/transformers`, change the version in `public/embed-worker.js` to match.

## The scroll story

The five chapters on the home page are the `story` array in `src/data/profile.ts` (text and links). The visuals are in `src/components/Story.tsx`.

## Change personal details

Everything about you lives in `src/data/profile.ts`: headline, availability line, about text, timeline, skills, links. The resume is `public/resume.pdf`; replace the file to update it.

## Deploy

The repo is connected to Vercel. Every push to `main` deploys to production; any other branch gets its own preview URL. The site URL is set in `src/data/profile.ts` (`site.url`) and is used for the sitemap and social previews.
