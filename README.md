# Semdok Design Review: a Semdok Harness plugin

Brings Google's [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) (EGM) to Semdok Harness.
Plan a feature before writing code:

- **Elephant:** the main agent, with your whole project in context, drafts the design.
- **Goldfish:** reviewer agents with **no** conversation history read only the draft and the code it names. They
  catch the unstated assumptions and gaps that the author can no longer see.
- **You** make the trade-offs and approve the design.

## Install

In Semdok Harness, either:

- **Plugins → Discover**, with the Semdok Plugins market
  (`https://raw.githubusercontent.com/YumnamMomojit/Plugins/main/index.json`), then **Install** on *Design Review*; or
- **Plugins → Add plugin**, and enter `github:Semdok/semdok-egm#main`.

Then click **Enable now**.

## Use

Start a message with a command:

| Command | What it does |
|---|---|
| `/egm-brainstorm <idea>` | Asks clarifying questions, has Goldfish reviewers challenge the idea, and writes `concepts_brief.md` |
| `/egm-draft` | Turns the brief into a full design document, `design_draft.md`, section by section with you |
| `/egm-review <design file>` | Five review stages (zoom out, comprehension, design critique, zoom out again, implementation readiness), each by fresh reviewers, with fixes between stages |
| `/egm-resolve` | Works through the reviewers' findings with you |
| `/egm-review-loop` | Repeats review and fixes until the reviewers find nothing serious |
| `/egm-drift-report` | Checks whether the code still matches the approved designs in `docs/designs/` |
| `/egm-bootstrap` | Writes `README.md` files that describe each folder of a repository |

For example:

```text
/egm-brainstorm Add rate limiting to our public API, per API key, without a new database
```

Approved designs go to `docs/designs/` in your project. To keep EGM's files somewhere else, add a line
`EGM artifact directory: <folder>` to your message or to `AGENTS.md`.

With the [Agent Team](https://github.com/YumnamMomojit/Plugins/tree/main/plugins/semdok-agent-team) plugin and **Orchestrator mode**, the reviewers run as **Team Reviewer**
specialists, which can read files but not change them.

## Good to know

- A review starts several reviewer agents in each stage, so it uses more of your Semdok quota than a normal chat.
  Use EGM for features that need design decisions, not for small, clear bug fixes.
- Reviewers read only the files you and the draft point them to. They cannot open web pages: save a page into your
  project and name the file instead.
- EGM's files are included unchanged (see [NOTICE](NOTICE)). The plugin adds `egm/docs/semdok.md`, which tells the
  agent how to run EGM's reviewers with Semdok Harness's `subagent` tool.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). EGM is Copyright 2026 Google LLC. It is not an officially
supported Google product, and this plugin is not affiliated with or endorsed by Google.
