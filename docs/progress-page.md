# The Progress page

The Progress page answers five questions, in the order a reader asks them. Each part of the
page answers one question, and the eye moves through them in a Z: top left, across, down,
and bottom right. The text and the charts point at each other, so one pass answers all five.

| When | The reader asks | The page answers with |
| --- | --- | --- |
| First second | Are we OK? | A headline sentence and one status dot, top left |
| 1 to 5 seconds | What changed today? | Three bands of tiles, read left to right |
| 5 to 15 seconds | Why? | A "because" line under each change, linked to the day's report |
| After 15 seconds | How did we get here? | A focus chart with the full history and a milestone strip |
| End of the scan | What do I do now? | A "Waiting on you" panel, bottom right of the first screen |

## 1. Are we OK? The headline

The headline is one or two plain sentences, built by fixed rules so it reads the same way
every day:

1. "Day N." N counts the days from the first recorded day to the latest one, both included.
2. The two biggest moves in the right direction, then the biggest move in the wrong direction.
   A move is the change since the previous reading, divided by the size of the previous
   reading (at least 1), so a metric of 3 that goes to 6 counts more than one of 300 that
   goes to 310. Metrics that are neither good nor bad when they go up are left out.
3. The number of items waiting on the reader, from the board column chosen in the settings.

For example: "Day 98. Pull requests merged went up and open queue went down. Failed checks
went the wrong way. 35 items are waiting on you."

Plurals follow the count ("1 item is", "2 items are"). When nothing moved, the headline says
so. When no column is chosen, the last sentence is left out.

The status dot uses the page's one accent color when something is waiting on the reader, and a
neutral color when nothing is.

## 2. What changed today? Three bands

Metrics belong to one of three bands, read left to right as cause and effect:

- Momentum: what the team moved forward (for example, items shipped, the open queue).
- Health: whether the system is well (for example, open alerts, error budget left).
- Trust: whether people can rely on it (for example, open security findings, mistakes).

Each tile has the same layout, so the number sits in the same place in every tile:

1. Its question, the one line it answers ("How much did we ship?").
2. The latest value in tabular figures, with its unit.
3. The change since yesterday, in words ("Up 3 since yesterday"). Its color comes from the
   metric's direction: up is good for some metrics and bad for others, so the color says
   good or bad, never up or down.
4. A small chart of the last 30 days. Points estimated from history are drawn hollow.

A metric with no readings yet shows a dim tile that says "Not measured yet. Starts when …",
never a zero.

## 3. Why? The "because" line

Under each change is one line that explains it. It comes from, in order: the note on the
day's reading, a line of the day's report that names the metric, or a milestone on that day.
Hovering a report line highlights its tile, and hovering a tile highlights its report lines.

## 4. How did we get here? The focus chart

Selecting a tile opens its full history in a large chart, with the last 30 days, 90 days or
everything. Milestones are flags on the line; points estimated from history are hollow. A
crosshair follows the pointer, or the arrow keys, and shows the date, the value and the note.
A table with the same numbers is one click away. Under the chart, a strip shows every
milestone on one timeline.

## 5. What do I do now? Waiting on you

The last stop of the scan, bottom right of the first screen, lists the count and the first
three cards of one board column. An admin chooses the team and column. This panel and the
status dot are the only places that use the accent color.

## Below the first screen: daily reports

Reports are a timeline, newest first. Each day opens in place to show its lines and its full
text. Report text is rendered as safe Markdown: HTML in a report is shown as text.

## Motion

Motion has a job or it is left out. On load, the tiles appear in reading order, 40 ms apart,
and their numbers count up in at most 600 ms. After that, things move only when the reader
acts: opening a report, choosing a tile, moving the crosshair. When the reader's system asks
for reduced motion, nothing animates.

## The first day

Before any metric is defined, the page explains what it will show and how to start: define
metrics and record the first day through the API or the MCP tools. Nothing on the page looks
broken or empty for no reason.

## Small screens

On a phone, the parts keep their order and stack: headline, waiting on you, the bands, the
focus chart, then the reports.

## Writing

The page talks like a colleague giving a status update. It uses whole words and sentences,
no symbols in place of words, and no internal terms. A technical word that has to stay is
explained once, where it appears.
