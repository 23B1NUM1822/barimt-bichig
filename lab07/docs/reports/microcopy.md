# UI microcopy before and after

**US-7.4.** Three texts from the LearnLab AI interface, rewritten with the three cognitive-load rules that the lab guide
assigns to Chinchilla, Ch. 3, pp. 27–30: *reducing cognitive load*, *keeping it short*, and *involving the user*.

All three are real strings from the app's source code. The new versions are applied in the code and were checked in the
running app on 2026-10-16. The complete change is [`microcopy.diff`](microcopy.diff).

| # | Touchpoint | Where | Words before | Words after | Difference |
|---|---|---|---|---|---|
| 1 | Error message | `components/problem/code-workspace.tsx:51` | 7 | 8 | +1 |
| 2 | Empty state | `components/problem/description-panel.tsx:39-41` | 13 | 11 | −2 |
| 3 | Onboarding hint | `components/problem/code-workspace.tsx:132` | 13 | 11 | −2 |
| | **Total** | | **33** | **30** | **−3 (−9%)** |

## How the texts were measured

There is no validated readability formula for Mongolian. Flesch-type scores are calibrated on English syllables and
would give meaningless numbers here. The comparison therefore uses measures that a reader feels directly:

- **Words** and **words per sentence**: how much the reader must hold in mind at once.
- **Average word length**, in letters.
- **Chained clauses**: words that end in a converb or conditional suffix (`-ж`, `-аад/-ээд`, `-вал/-вэл`), which make
  the reader wait for the end of a long sentence.
- **User words** (`та`, `таны`, `тань`) and **imperatives** (`-аарай/-ээрэй`, `уу/үү`): whether the text speaks to the
  reader and tells them what to do.
- **System words** (`алдаа` “error”, `систем` “system”, `нэвтрэх` “login”): words about the software instead of the
  reader's goal.

Words were counted by a script that splits on spaces and punctuation, so the button name “Үнэлгээнд илгээх” counts as
two words.

## 1. Error message

Shown under the code editor when a review cannot be returned, for example after a network failure.

| | Text | English meaning |
|---|---|---|
| **Before** | Үнэлгээ авахад алдаа гарлаа. Дахин оролдоно уу. | An error occurred while getting the evaluation. Please try again. |
| **After** | Үнэлгээ ирсэнгүй. Код тань хэвээр байна, дахин илгээгээрэй. | The evaluation did not arrive. Your code is still here, send it again. |

**Why:** After a failure, the student's first worry is whether their code is lost. The old text did not answer that,
and “try again” did not say what to do. The new text says what failed, that the code is safe, and which action to
take. It is one word longer, because it carries one more fact.

| Measure | Before | After |
|---|---|---|
| Words | 7 | 8 |
| Sentences | 2 | 2 |
| Words per sentence | 3.5 | 4.0 |
| Average word length (letters) | 5.6 | 6.1 |
| User words | 0 | 1 (`тань`) |
| Imperatives | 1 (`уу`) | 1 (`илгээгээрэй`) |
| System words | 1 (`алдаа`) | 0 |

**Cognitive load:** the reader no longer has to check the editor to see whether the code survived. “Send it again”
names the exact action, where “try again” left the reader to guess. **Keeping it short:** two short sentences,
4 words each on average. **Involving the user:** “Код тань” (*your* code) and a direct request replace the impersonal
“an error occurred”.

| Word | Before | After |
|---|---|---|
| үнэлгээ (evaluation) | 1 | 1 |
| дахин (again) | 1 | 1 |
| авахад (while getting) | 1 | 0 |
| алдаа (error) | 1 | 0 |
| гарлаа (occurred) | 1 | 0 |
| оролдоно (try) | 1 | 0 |
| уу (please) | 1 | 0 |
| ирсэнгүй (did not arrive) | 0 | 1 |
| код (code) | 0 | 1 |
| тань (your) | 0 | 1 |
| хэвээр (still) | 0 | 1 |
| байна (is) | 0 | 1 |
| илгээгээрэй (send) | 0 | 1 |

```diff
-        setError("Үнэлгээ авахад алдаа гарлаа. Дахин оролдоно уу.");
+        setError("Үнэлгээ ирсэнгүй. Код тань хэвээр байна, дахин илгээгээрэй.");
```

**Known limit:** the browser receives the same error for every cause, including an answer over 20,000 characters,
where sending it again does not help. Telling these cases apart needs a code change, not a text change.

## 2. Empty state

Shown in the **Илгээлтүүд** (submissions) tab, which is always empty today.

| | Text | English meaning |
|---|---|---|
| **Before** | Одоогоор илгээлт алга. Нэвтрэх систем нэмэгдсэний дараа таны өмнөх хариулт, оноо энд харагдана. | No submissions yet. After a login system is added, your previous answers and scores will appear here. |
| **After** | Одоогоор илгээлт алга. Хариултууд хараахан хадгалагддаггүй. Үнэлгээ тань хариултын доор гарна. | No submissions yet. Answers are not saved yet. Your evaluation appears below your answer. |

The heading “Одоогоор илгээлт алга” is unchanged. Only the second line was rewritten.

**Why:** The old line explained the product's roadmap (“after a login system is added”) and left the student with
nothing to do. The new line says the same fact in the student's terms, that answers are not saved, and points to where
the result actually appears.

| Measure | Before | After |
|---|---|---|
| Words | 13 | 11 |
| Sentences | 2 | 3 |
| Words per sentence | 6.5 | 3.7 |
| Average word length (letters) | 6.2 | 7.4 |
| Commas | 1 | 0 |
| User words | 1 (`таны`) | 1 (`тань`) |
| System words | 2 (`нэвтрэх`, `систем`) | 0 |

**Cognitive load:** two technical words are gone, and the reader learns where to look instead of what will be built.
Shorter sentences (3.7 words instead of 6.5) and no comma. One cost: the average word is longer, because
“хадгалагддаггүй” (*is not saved*) is a single 15-letter word. **Keeping it short:** two words fewer. **Involving the
user:** “Үнэлгээ тань” (*your* evaluation) and a location the student can check now.

| Word | Before | After |
|---|---|---|
| одоогоор (yet) | 1 | 1 |
| илгээлт (submission) | 1 | 1 |
| алга (none) | 1 | 1 |
| нэвтрэх (login) | 1 | 0 |
| систем (system) | 1 | 0 |
| нэмэгдсэний (is added) | 1 | 0 |
| дараа (after) | 1 | 0 |
| таны (your) | 1 | 0 |
| өмнөх (previous) | 1 | 0 |
| хариулт (answer) | 1 | 0 |
| оноо (score) | 1 | 0 |
| энд (here) | 1 | 0 |
| харагдана (will appear) | 1 | 0 |
| хариултууд (answers) | 0 | 1 |
| хараахан (yet) | 0 | 1 |
| хадгалагддаггүй (is not saved) | 0 | 1 |
| үнэлгээ (evaluation) | 0 | 1 |
| тань (your) | 0 | 1 |
| хариултын (of the answer) | 0 | 1 |
| доор (below) | 0 | 1 |
| гарна (appears) | 0 | 1 |

```diff
-              Нэвтрэх систем нэмэгдсэний дараа таны өмнөх хариулт, оноо энд харагдана.
+              Хариултууд хараахан хадгалагддаггүй. Үнэлгээ тань хариултын доор гарна.
```

## 3. Onboarding hint

Shown under the code editor before the first submission. It is the first instruction a new student reads on a
problem page.

| | Text | English meaning |
|---|---|---|
| **Before** | Кодоо бичээд “Үнэлгээнд илгээх” товчийг дарвал AI багш таны кодыг шалгаж, зөвлөгөө өгнө. | If you write your code and press the “Submit for review” button, the AI tutor will check your code and give advice. |
| **After** | Кодоо бичээд “Үнэлгээнд илгээх” товчийг дараарай. AI багш энд зөвлөгөө өгнө. | Write your code and press the “Submit for review” button. The AI tutor gives advice here. |

**Why:** The old hint was one 13-word sentence with three chained clauses, and the instruction was buried in an
*if*-clause. The new hint gives the instruction first as a direct request, then says where the advice will appear.

| Measure | Before | After |
|---|---|---|
| Words | 13 | 11 |
| Sentences | 1 | 2 |
| Words per sentence | 13.0 | 5.5 |
| Average word length (letters) | 5.5 | 5.6 |
| Chained clauses | 3 (`бичээд`, `дарвал`, `шалгаж`) | 1 (`бичээд`) |
| Imperatives | 0 | 1 (`дараарай`) |

**Cognitive load:** one action per sentence, and the reader no longer waits to the end of a long sentence to learn what
happens. **Keeping it short:** “таны кодыг” (*your code*) repeated “Кодоо” and was cut. **Involving the user:** the
conditional “if you press” became the request “press”, and “энд” (*here*) points to the panel where the advice appears.

| Word | Before | After |
|---|---|---|
| кодоо (your code) | 1 | 1 |
| бичээд (having written) | 1 | 1 |
| үнэлгээнд, илгээх (“Submit for review”) | 2 | 2 |
| товчийг (the button) | 1 | 1 |
| ai, багш (AI tutor) | 2 | 2 |
| зөвлөгөө (advice) | 1 | 1 |
| өгнө (gives) | 1 | 1 |
| дарвал (if you press) | 1 | 0 |
| таны (your) | 1 | 0 |
| кодыг (the code) | 1 | 0 |
| шалгаж (checking) | 1 | 0 |
| дараарай (press) | 0 | 1 |
| энд (here) | 0 | 1 |

```diff
-              emptyText="Кодоо бичээд “Үнэлгээнд илгээх” товчийг дарвал AI багш таны кодыг шалгаж, зөвлөгөө өгнө."
+              emptyText="Кодоо бичээд “Үнэлгээнд илгээх” товчийг дараарай. AI багш энд зөвлөгөө өгнө."
```

## Rules applied

| Rule (Chinchilla Ch. 3, pp. 27–30, as mapped in the lab guide) | Touchpoint 1 | Touchpoint 2 | Touchpoint 3 |
|---|---|---|---|
| Reducing cognitive load | Answers “is my code lost?” | Removes technical words, points to where to look | One action per sentence |
| Keeping it short | 4 words per sentence | −2 words | −2 words, 13 → 5.5 words per sentence |
| Involving the user | “Код тань”, direct request | “Үнэлгээ тань” | Request instead of a condition |

## How the change was checked

On 2026-10-16 the app ran locally with the new texts:

- The onboarding hint showed under the editor of `/problems/binary-search`.
- The empty state showed in the **Илгээлтүүд** tab.
- The error message showed after an answer of 20,001 characters, which the server rejects. The code stayed in the
  editor, so the claim “Код тань хэвээр байна” holds.

The math, chat, and essay editors still use the older error pattern (“...алдаа гарлаа. Дахин оролдоно уу.”). Applying
the same rewrite there is the next step, and it is outside the three touchpoints of this lab.

The lab guide asks for the diff to be archived in Confluence. The project has no Confluence space, so the diff is
archived in the repository instead: [`microcopy.diff`](microcopy.diff).
