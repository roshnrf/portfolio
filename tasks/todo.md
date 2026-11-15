# Portfolio rebuild

## Done
- [x] Scaffold Next.js 16 (App Router, TS, Tailwind 4)
- [x] Design system ported from the old site (OLED dark, indigo accent, glass cards), plus mobile menu, skip link, reduced-motion support
- [x] Content layer: Markdown + frontmatter in `content/`, rendered at build time
- [x] Home: hero, about, projects, journey, skills, latest updates, contact
- [x] Project write-ups: Scheme Sahayak, ArticuPlay, PIRS, StoryWeaver (facts from repo READMEs)
- [x] Updates feed (`/updates`), Writing (`/writing`, PIRS post ported, Medium posts linked)
- [x] ML Playground ported to React (KNN, perceptron, naive Bayes)
- [x] SEO: metadata, Open Graph image, sitemap, robots, icon
- [x] Verified: lint clean, production build static, pages checked at desktop and 375px, no horizontal overflow, no broken images, unknown slugs return 404

- [x] Name changed to "Roshan Abdul Rauof" site-wide (matches the CV)
- [x] DRDO internship added to the Journey timeline and About (Roshan reversed the earlier "leave it off" choice)
- [x] `sipconf` added as project 5, from the public repo README and docs only; nothing from the private source folder is on the site
- [x] Scheme Sahayak demo videos (Hindi, Malayalam) embedded on its project page
- [x] Current CV saved to `public/resume.pdf`; Feynn Labs spelling and B.Tech period (2022 – 2026) corrected

## Version 2 (branch `v2`, not merged)
- [x] Search core: chunking, keyword + semantic hybrid ranking, calibrated gate, 36 unit tests
- [x] Hero: live "ask about my work" pipeline, runs in the browser
- [x] Scroll story: five chapters with code-drawn scenes, replaces the About block
- [x] Gate demo on the Scheme Sahayak page
- [x] Ctrl+K command palette
- [x] llms.txt, JSON-LD, RSS feed
- [x] Verified locally: tests, lint, production build (18 static pages), desktop and 375px, no overflow, no hydration errors
- [ ] Roshan reviews v2; merge into `main` only on his say
- [ ] After the first Vercel build of v2: confirm the index is generated there

Known limits of the assistant: 80 of 82 calibration questions handled correctly ("What time is it?" and "How old are you?" get answered); scores in the browser differ from the build by about 0.01 to 0.02, so questions right at the gate can flip.

## Waiting on Roshan
- [ ] Decide whether the public `resume.pdf` should carry the phone number (it currently does)
- [ ] Confirm the MSc update date (2026-10-01)
- [ ] Create GitHub repo, push, import into Vercel with project name `roshnrf`
- [ ] Fix profile README on GitHub: Scheme Sahayak is Hindi + Malayalam, not Tamil; StoryWeaver description

## Not done
- [ ] Lighthouse run against the deployed URL

## Review
Decisions made during the build:
- Next.js chosen over Astro to match the reference site.
- Plain Markdown (gray-matter + marked) instead of MDX: simpler, no build plugins, enough for text and images.
- Cache Components and partial prefetching (scaffold defaults) turned off: the site is fully static, and they added Suspense requirements with no benefit here.
- Experience and education merged into one "Journey" timeline to avoid repeating the same entries twice.
- Phone number from the old site left out.
