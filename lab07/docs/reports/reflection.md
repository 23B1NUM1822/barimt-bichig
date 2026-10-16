# Reflection, stand-up, retrospective

Page numbers below come from the literature mapping in the Week 07 lab guide. They were not checked against the books.

## Weekly reflection

**1. Which concept from Bhatti challenged my previous documentation practice the most?**

The 10-step limit for tutorials (Bhatti et al., Ch. 2, pp. 31–32). My earlier setup notes were long lists that mixed
commands, background, and fixes for errors. Fitting the whole path, from an empty folder to a graded answer, into ten
steps forced me to move everything else out: the background went to an explanation page, and the alternatives went to
how-to guides. The tutorial became a single path that a beginner cannot get lost on.

**2. Which concept from Chinchilla will I keep applying in Week 16 and beyond?**

Stating prerequisites upfront (Chinchilla, Ch. 7, p. 92). Every reference entry now starts with a table of checks and
what happens when each one fails. Writing them exposed facts that the code hides, for example that the HTTP endpoint
always needs a paid API key while the problem page does not.

**3. Where is the largest gap between theory and practice in my project?**

Reproducibility. The theory says a tutorial must work for any reader on any machine. In practice LearnLab AI needs a
PostgreSQL server, its source is not public yet, and real grading needs a paid key. I closed what I could: the tutorial
uses the free demo reviewer, so the result is the same every time, and it names UTF-8 as a requirement after the seed
failed on a Windows-encoded database. The source code question stays open, and the tutorial says so in a labelled
assumption.

## Daily stand-up

| Question | Answer |
|---|---|
| Which tutorial section is in workspace today? | “Get your first AI review”, steps 7 to 10. They were run in a browser against the local app, and step 10 now quotes the real review |
| Which code snippet is being validated in a how-to? | The `chain-rule-sin` problem object in “Add a practice problem”, and the curl and PowerShell calls in “Enable real AI grading” |
| Which microcopy touchpoint is being refactored? | The error message under the code editor. The empty state and the onboarding hint are done |

## Sprint retrospective

| Question | Answer |
|---|---|
| Which Diátaxis boundary was hardest to enforce? | How-to versus reference. The “Add a practice problem” guide wanted a table of every problem field. The table went to the Data model reference, and the guide links to it. A check now fails the build if a how-to contains a table |
| Which UX writing rule made the biggest impact? | Involving the user. Turning “if you press the button, the tutor will check” into “press the button” and adding “your code is still here” changed the texts more than any word cuts |
| How should how-to lengths be adjusted? | Keep each guide to about three steps plus a Verify section. “Enable real AI grading” is the longest because of the PowerShell variant. Next sprint, platform variants should go into tabs so that each reader sees one path |
