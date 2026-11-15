# Lessons

- Check the repo before describing a project. The old site, the profile README and the repos disagreed (PIRS ROC-AUC 0.8554 vs 0.8973, Tamil vs Malayalam, StoryWeaver's purpose). The repo README is the source of truth; ask when sources conflict.
- Do not put a public claim on the site that Roshan has not confirmed (employer, availability, dates). Ask first.
- Do not copy a reference site's layout. Use it for structure ideas only.
- This Next.js version differs from older ones: read `node_modules/next/dist/docs/` before using an API.
- Build a new version on its own branch and show it before touching what is live. Roshan asked for this explicitly ("build a version 2 and then show me").
- A small embedding model misses names and acronyms (DRDO, mix-minus). Check retrieval with real questions before trusting it; a keyword bonus fixed it here.
- Shell-appended CSS was not picked up by the dev server until the file was edited again. Verify a new rule is actually served before debugging the component.
