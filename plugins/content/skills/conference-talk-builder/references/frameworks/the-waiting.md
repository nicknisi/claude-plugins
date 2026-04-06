# The Waiting for Technical Presentations

The Waiting is a narrative framework drawn from Samuel Beckett's _Waiting for Godot_ (1953), the defining work of absurdist theater where two characters wait for someone who never arrives — and in that waiting, everything and nothing happens. Beckett's insight was that the absence of resolution does not mean the absence of meaning; the waiting itself is where life occurs. This maps powerfully to technical talks because so much of engineering is spent in states of anticipation: waiting for the migration to finish, waiting for the right abstraction to emerge, waiting for a tool that will "fix everything." The framework works because it gives the audience permission to find value in the liminal state rather than demanding a triumphant conclusion. The circularity is the point — Acts 1 and 5 mirror each other, but the audience has shifted.

## Literary Context

Beckett described _Waiting for Godot_ as "a play in which nothing happens, twice." The two-act structure mirrors itself: the same characters, the same tree, the same waiting — but everything is subtly degraded or shifted. Vladimir and Estragon cannot even be sure if the boy who arrives is the same boy from yesterday. The play resists interpretation by design; Beckett refused to say who or what Godot represents. That refusal is itself the technique: the audience projects their own meaning onto the void, which makes the waiting personal. In a tech talk, this means the speaker does not need to resolve the tension. The audience will bring their own migrations, their own stalled projects, their own Godot. The speaker's job is to create the space for that recognition.

Key Beckett principles to channel:
- **Repetition with variation**: The same structure, but each repetition carries more weight
- **Dignity in futility**: The characters are not pathetic; they are persistent
- **Comedy as survival**: Vladimir and Estragon are funny precisely because the situation is unbearable

## The Phases

### 1. Introduce What We're Waiting For (The Promise)

Establish the thing everyone believes is coming. Name it clearly, make it desirable, make it feel imminent. The audience should feel the anticipation as shared and justified — this is not delusion, it is reasonable expectation.

**In a talk**: "Any day now, we'll finish the migration to microservices. It's been on the roadmap for three quarters. When it lands, everything gets better — deploys will be fast, teams will be autonomous, and the monolith will finally stop haunting our on-call rotations."

**Slide approach**: 2-3 slides. Open with energy and shared anticipation. The audience should nod along — they know this feeling.

### 2. It Doesn't Come (The Absence)

The awaited thing fails to arrive. Not dramatically — it just... doesn't show up. Deadlines slip. Priorities shift. The silence grows.

**In a talk**: "Q3 became Q4. Q4 became 'next half.' The migration tracker still shows 64% complete, same as six months ago. Nobody cancelled it. Nobody declared failure. It just... stopped moving."

**Slide approach**: 3-4 slides. Pacing matters here — slow down. Let the absence register. Use pauses. Show empty timelines, unchanged metrics, the same dashboard screenshot months apart.

### 3. We Fill the Time (The Coping)

In Beckett, Vladimir and Estragon play games, tell stories, argue — they fill the void. In engineering, we build workarounds, create abstractions, develop rituals. This is where the actual substance of the talk lives.

**In a talk**: "So while we waited, we did what engineers do. We built a shim layer. Then a caching proxy. Then a deployment script that worked around the monolith's worst behaviors. We held a weekly 'migration sync' where we mostly discussed other things. We got remarkably good at living with the thing we were supposed to be leaving."

**Slide approach**: 5-8 slides. This is the meat of the talk. Show the real work that happened in the waiting. Code examples, architecture decisions, team dynamics. This phase should feel rich and substantive because it IS the content.

### 4. Something Shifts (The Turn)

Not a resolution — a shift in perspective. The audience (and the speaker) realizes the waiting changed them. The workarounds became the architecture. The coping became the competence. Beckett's characters don't get what they want, but they are not the same people at the end of Act 2 as they were at the start of Act 1.

**In a talk**: "Somewhere around month eight, I realized our shim layer had become the best-tested, most reliable piece of our infrastructure. The 'temporary' caching proxy handled more traffic than the service it was supposed to replace. We hadn't completed the migration, but we'd accidentally built something better than what the migration promised."

**Slide approach**: 3-4 slides. This is the emotional pivot. Use a reveal, a reframing, a moment of recognition. Not a punchline — a quiet realization.

### 5. We're Still Waiting, But We're Different (The Return)

Mirror Act 1 deliberately. Restate the original promise — then show that the relationship to it has changed. The migration is still at 64%. The perfect tool still hasn't shipped. But the team, the code, the understanding — all different.

**In a talk**: "The migration tracker still says 64%. I checked this morning. But I don't check it with dread anymore. The monolith is still there, but it's surrounded by the best code we've ever written — all of it built while we were waiting for something else."

**Slide approach**: 2-3 slides. Echo the opening slides visually. Same dashboard, same metrics — but reframed. Close with the circularity made explicit.

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

Compress to three beats:
- **The Promise** (2-3 slides): Name the thing everyone is waiting for. Make it vivid.
- **The Coping** (5-7 slides): Show the real work. One strong example of what was built in the meantime.
- **The Shift** (2-3 slides): We're still waiting. But look what happened while we weren't paying attention.

Skip the explicit "It Doesn't Come" phase — imply it. The audience will fill in the gap.

### Standard Talk (20 min, 25-35 slides)

Use all 5 phases with emphasis on Phase 3:
- Phase 1: 3-4 slides (establish the anticipation)
- Phase 2: 4-5 slides (let the absence breathe)
- Phase 3: 10-14 slides (the substantive core — code, demos, architecture)
- Phase 4: 4-6 slides (the reframing)
- Phase 5: 3-4 slides (circular close)

### Extended Talk (45 min, 50-70 slides)

Full Beckett. Lean into the repetition:
- Phase 1: 5-7 slides (rich context, multiple stakeholder perspectives)
- Phase 2: 8-12 slides (show the non-arrival from multiple angles — timeline, team morale, technical debt)
- Phase 3: 20-28 slides (multiple examples, live demos, audience exercises)
- Phase 4: 8-12 slides (gradual turn with multiple realizations)
- Phase 5: 5-7 slides (extended mirror of opening, Q&A prompt embedded)

In extended format, consider making the circularity even more explicit: revisit Phase 2 content during Phase 4 and show how the same facts look different now.

## When to Use

- Talks about long-running migrations, modernization efforts, or technical debt
- Stories where the "failure" to complete something led to unexpected value
- Presentations about patience, iteration, and emergent architecture
- Retrospectives on projects that were never officially finished
- Talks about waiting for industry shifts (WebAssembly adoption, the year of Linux on the desktop, etc.)
- Any topic where the honest answer is "it's still not done, and that's actually okay"

## When NOT to Use

- Talks that need a clear call to action or decision point — this framework intentionally avoids resolution
- Product launches or announcements where the thing HAS arrived
- Audiences expecting a how-to or tutorial — circularity can feel like the speaker is avoiding the point
- Short lightning talks where the pacing of absence doesn't have room to land
- Topics where the waiting is genuinely harmful and the audience needs urgency, not acceptance

## Delivery Notes

Pacing is everything in this framework. The temptation is to rush through the absence (Phase 2) and get to the substance (Phase 3), but the absence needs room to breathe. In Beckett's productions, pauses are as scripted as dialogue. Consider:

- **Slide transitions in Phase 2**: Slow them down. Let a slide with a stale date sit for a beat longer than feels comfortable.
- **Vocal pacing**: Drop energy slightly in Phase 2, rebuild it gradually through Phase 3, and let Phase 4 arrive quietly rather than dramatically.
- **Visual circularity**: Use the same slide template for Phase 1 and Phase 5 with minimal changes — the audience should feel the echo before you name it.
- **The closing line**: End on a note that is neither triumphant nor defeated. Beckett's tone is wry acceptance. "We're still waiting. And we're still building. Same as yesterday. Same as tomorrow."

## Example Mapping

### "The Migration That Never Finished (And Why That's Fine)"

| Phase | Content |
|-------|---------|
| The Promise | "We committed to decomposing the monolith. The RFC had 47 thumbs-up reactions." |
| The Absence | "18 months later: 12 services extracted, 40 remaining. The Jira epic has its own Jira epic." |
| The Coping | "The API gateway we built 'temporarily.' The contract testing framework born from desperation. The deploy pipeline that's better than anything the microservices plan envisioned." |
| The Shift | "Our 'workarounds' have 94% test coverage. The monolith's critical paths are better-documented than ever. We built the tooling the migration needed, just not the migration itself." |
| Still Waiting | "The epic is still open. I hope it stays open for a while — we do our best work while we're waiting." |

### "Waiting for the Perfect Abstraction"

| Phase | Content |
|-------|---------|
| The Promise | "Once we find the right state management pattern, our frontend will be clean and predictable." |
| The Absence | "Redux, MobX, Zustand, signals, server components — the perfect pattern is always one library away." |
| The Coping | "Meanwhile, we wrote custom hooks. Lots of them. They're ugly and specific and they work." |
| The Shift | "The hooks aren't waiting for the right abstraction. They ARE the right abstraction — for us, for this codebase." |
| Still Waiting | "I still read every state management blog post. I probably always will. But I stopped waiting to start building." |

## Combination Notes

- **The Waiting + Story Circle**: Use Story Circle's 8 steps but replace Step 5 (Find) with absence — the discovery is that there is no single discovery, just gradual change. Steps 7-8 mirror Steps 1-2.
- **The Waiting + Catch-22**: The reason it never arrives IS the paradox. Phase 2 becomes a Catch-22 exposition, Phase 3 explores the trap, Phase 4 is the lateral escape of acceptance.
- **The Waiting + Comedian's Set**: Each phase of waiting can be a comedic bit. The repetition of "still waiting" becomes a running gag that lands differently each time — first funny, then uncomfortable, then weirdly profound.
- **Nested Waiting**: In extended talks, embed smaller waiting loops inside Phase 3. Each workaround has its own mini-cycle of anticipation and non-arrival, creating a fractal structure that reinforces the theme.
