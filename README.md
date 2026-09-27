# QVAC Social Bio Writer

Enter 2-3 facts or interests about yourself and an on-device AI writes a short social media bio using those actual facts — no invented details. No cloud call, no API key.

## How it works

1. You type a comma-separated list of facts about yourself (e.g. `loves rock climbing, works as a nurse, has two rescue dogs`) into the input field and submit.
2. The server asks the on-device model for a short, catchy bio (max 2 sentences, under 160 characters) built only from those facts, explicitly told not to invent any extra hobbies, jobs, locations, or traits.
3. The reply is streamed token-by-token and cleaned up (stripped of quotes and preambles like "Here's...").
4. `logic.js` checks the result is grounded in your facts (`isGrounded` requires at least 30% of your fact keywords to actually appear in the bio) and isn't a refusal; otherwise it falls back to a simple, guaranteed-accurate template built directly from what you typed. The final bio is also hard-capped at 160 characters.

### Example

- Input: `loves rock climbing, works as a nurse, has two rescue dogs`
- Typical output: `"Nurse by day, rock climber by weekend, proud parent of two rescue dogs."`

### QVAC functions used

- `loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0 })` — loads the model on-device at startup (`src/gui.js`).
- `completion({ modelId, history, stream: true, completionOpts })` — generates the bio, streamed via `run.tokenStream` (`src/logic.js`).
- `unloadModel({ modelId })` — releases the model when the server shuts down (`src/gui.js`).

## Run

```bash
npm install
npm start
```

Then open http://localhost:31028

The port can be overridden with the `PORT` environment variable.

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## License

MIT
