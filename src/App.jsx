import { useState, useCallback } from "react";
import { Download, Copy, Check, ChevronRight, ChevronLeft, Sparkles, ArrowRight, X, Plus, Info } from "lucide-react";

// ══════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════
const C = {
  bg: "#04040a", s1: "#0a0a14", s2: "#101022", s3: "#161630",
  border: "#1e1e38", bHot: "#4f46e5", text: "#eaeaff", muted: "#6868a0",
  accent: "#4f46e5", a2: "#f43f5e", a3: "#10d98a", a4: "#f5b93e",
  code: "#020208",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *{box-sizing:border-box}
  ::selection{background:rgba(79,70,229,.35);color:#fff}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e1e38;border-radius:3px}
  textarea,input,select{outline:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
  .fade-up{animation:fadeUp .3s ease forwards}
  .pulse{animation:pulse 2s infinite}
  .code-scroll{overflow-x:auto;white-space:pre;font-family:'Space Mono',monospace;font-size:11px;line-height:1.75;color:#a8a8d8}
  .code-scroll .kw{color:#818cf8}.code-scroll .str{color:#86efac}.code-scroll .cmt{color:#3c3c6a}.code-scroll .tag{color:#f9a8d4}.code-scroll .key{color:#fbbf24}.code-scroll .val{color:#67e8f9}.code-scroll .op{color:#6868a0}`;

// ══════════════════════════════════════════════════════════════
// PLATFORM DATA (verified May 2026)
// ══════════════════════════════════════════════════════════════
const PLATFORMS = {
  claude:   { id:"claude",   name:"Claude",      maker:"Anthropic",      color:"#e07a5f", models:["claude-sonnet-4-6","claude-opus-4-7","claude-haiku-4-5"],     default:"claude-sonnet-4-6", outputType:".skill file (SKILL.md)", thinking:["low","medium","high","xhigh","max"],        defaultT:"high",    tag:"Native .skill container — YAML frontmatter + Markdown" },
  openai:   { id:"openai",   name:"GPT-5.5",     maker:"OpenAI",         color:"#10a37f", models:["gpt-5.5","gpt-5.5-pro","gpt-5.5-thinking"],                   default:"gpt-5.5",           outputType:"System prompt + instructions", thinking:["auto","low","medium","high"],  defaultT:"auto",    tag:"Outcome-first — define destination, not the route" },
  gemini:   { id:"gemini",   name:"Gemini 3.x",  maker:"Google",         color:"#4285f4", models:["gemini-3.1-pro","gemini-3.0-flash","gemini-3.5-flash"],        default:"gemini-3.1-pro",    outputType:"system_instruction",  thinking:["MINIMAL","LOW","MEDIUM","HIGH"],   defaultT:"HIGH",    tag:"thinking_level controls reasoning depth per request" },
  deepseek: { id:"deepseek", name:"DeepSeek V4", maker:"DeepSeek AI",    color:"#5a67ff", models:["deepseek-v4-flash","deepseek-v4-pro"],                         default:"deepseek-v4-flash", outputType:"XML-tagged system message", thinking:["disabled","high","max"],       defaultT:"high",    tag:"XML tagging raises task success from 45% → 92%" },
  llama:    { id:"llama",    name:"Llama 4",     maker:"Meta",           color:"#0866ff", models:["llama-4-scout","llama-4-maverick"],                            default:"llama-4-scout",     outputType:"ChatML system message", thinking:null,                               defaultT:null,      tag:"Open-weight — full template control, no safety pre-wrap" },
  mistral:  { id:"mistral",  name:"Mistral",     maker:"Mistral AI",     color:"#ff6b35", models:["mistral-large-3","mistral-medium-3","mistral-small-3"],        default:"mistral-large-3",   outputType:"System role message", thinking:null,                               defaultT:null,      tag:"Dense structured prompts + numbered steps perform best" },
  qwen:     { id:"qwen",     name:"Qwen 3",      maker:"Alibaba Cloud",  color:"#a855f7", models:["qwen3-235b-a22b","qwen3-72b","qwen3-32b"],                    default:"qwen3-235b-a22b",   outputType:"System message + /think prefix", thinking:["no_think","think"],       defaultT:"think",   tag:"/think or /no_think prefix switches reasoning mode" },
};

const DOMAINS = [
  {id:"ui",       label:"UI / Frontend Design",    icon:"◈", ex:"Builds React components, design systems, layout specs"},
  {id:"code",     label:"Software Engineering",    icon:"⌥", ex:"Code generation, review, debugging, architecture"},
  {id:"writing",  label:"Content & Writing",       icon:"✦", ex:"Copy, editing, structure, voice, tone matching"},
  {id:"data",     label:"Data & Analytics",        icon:"⊕", ex:"Schemas, transforms, queries, validation, output shapes"},
  {id:"legal",    label:"Legal & Compliance",      icon:"⊗", ex:"Contracts, clauses, obligations, policy review"},
  {id:"support",  label:"Customer Support",        icon:"◎", ex:"Tickets, responses, escalation paths, resolution"},
  {id:"research", label:"Research & Analysis",     icon:"◉", ex:"Synthesis, citations, evidence evaluation"},
  {id:"agent",    label:"Agentic / Automation",    icon:"⊞", ex:"Tool use, multi-step pipelines, loop control"},
  {id:"custom",   label:"Custom Domain",           icon:"◇", ex:"Define your own specialized domain"},
];

const FORMATS = [
  {id:"markdown", label:"Markdown",      sub:"Headers, lists, code blocks"},
  {id:"json",     label:"JSON",          sub:"Machine-readable structured data"},
  {id:"prose",    label:"Plain Prose",   sub:"Continuous text, no formatting"},
  {id:"code",     label:"Code + Prose",  sub:"Fenced code blocks + explanation"},
  {id:"html",     label:"HTML",          sub:"Valid semantic HTML5"},
  {id:"mixed",    label:"Mixed",         sub:"Whatever the task demands"},
];

const LENGTHS = [
  {id:"brief",    label:"Brief",       constraint:"≤150 words"},
  {id:"concise",  label:"Concise",     constraint:"≤250 words"},
  {id:"standard", label:"Standard",    constraint:"200–400 words"},
  {id:"detailed", label:"Detailed",    constraint:"≥400 words, structured sections required"},
  {id:"adaptive", label:"As needed",   constraint:"Calibrated to task complexity"},
];

// ══════════════════════════════════════════════════════════════
// PROCESSING ENGINE
// ══════════════════════════════════════════════════════════════
function toKebab(s) {
  return (s||"").toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"") || "my-skill";
}

const FILLERS = [
  [/\bi\s+want\s+(this|it)\s+to\s*/gi,""], [/\bi'd?\s+like\s+(it|this)\s+to\s*/gi,""],
  [/\bplease\s+/gi,""], [/\bmaybe\s+/gi,""], [/\bperhaps\s+/gi,""],
  [/\bkind\s+of\s+/gi,""], [/\bsort\s+of\s+/gi,""], [/\bbasically\s+/gi,""],
  [/\btry\s+to\s+/gi,""], [/\bit\s+should\s+/gi,""], [/\bthis\s+should\s+/gi,""],
  [/\bif\s+possible,?\s*/gi,""], [/\bgenerally\s+speaking,?\s*/gi,""], [/\bjust\s+(?=\w)/gi,""],
];

function norm(raw) {
  if (!raw?.trim()) return "";
  let t = raw.trim();
  FILLERS.forEach(([p,r]) => { t = t.replace(p,r); });
  t = t.replace(/\s+/g," ").trim();
  if (t) t = t[0].toUpperCase() + t.slice(1);
  if (t && !/[.!?]$/.test(t)) t += ".";
  return t;
}

function constraints(form) {
  const out = [];
  const lm = {brief:"≤150 words per response",concise:"≤250 words per response",standard:"200–400 words per response",detailed:"≥400 words — structured sections required",adaptive:"Calibrated to task complexity"};
  if (form.length && lm[form.length]) out.push("LENGTH: " + lm[form.length]);
  const fm = {markdown:"FORMAT: Markdown — H2 (##) for major sections, H3 (###) for subsections, bullet lists for enumerations",json:"FORMAT: Valid JSON object only — no prose, no markdown fences, no preamble text before or after",prose:"FORMAT: Plain prose — no markdown headers, no bullet lists, continuous flowing paragraphs",code:"FORMAT: Code in fenced blocks with language tag — prose explanation in plain text outside blocks",html:"FORMAT: Valid HTML5 — semantic elements only, no inline styles",mixed:"FORMAT: Appropriate combination as the task demands — default to structured Markdown for multi-part responses"};
  if (form.format && fm[form.format]) out.push(fm[form.format]);
  return out;
}

function triggers(name, purpose, domainId) {
  const s = new Set();
  const cn = (name||"").toLowerCase().replace(/-/g," ").trim();
  if (cn) s.add(cn);
  const d = DOMAINS.find(x=>x.id===domainId);
  if (d) { s.add("help with "+d.label.toLowerCase()); s.add(d.label.toLowerCase()+" task"); }
  const stop = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","is","are","was","were","be","have","has","do","does","will","should","could","may","might","it","its","this","that"]);
  const pw = (purpose||"").toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/).filter(w=>w.length>3&&!stop.has(w));
  if (pw.length>=2) s.add(pw.slice(0,2).join(" "));
  if (pw[0]) s.add("create "+pw[0]);
  const arr=[...s];
  while(arr.length<3) arr.push((cn||"task")+" request");
  return [...new Set(arr)].slice(0,5);
}

function bans(userBad, format) {
  const b = [
    'Sycophantic openers: "Certainly!", "Great question!", "Of course!", "Absolutely!", "Happy to help!"',
    'Meta-narration openers: "Here\'s a [X] for you:", "I\'ll now create…", "Let me explain…"',
  ];
  if (format==="json") { b.push("Prose text appearing outside the JSON structure"); b.push("Markdown code fences (```json) wrapping the response"); }
  if (format==="prose") b.push("Markdown headers (##, ###) and bullet point lists — use paragraph breaks instead");
  const t = (userBad||"").toLowerCase();
  if (/repetit/.test(t)) b.push("Repeating information already stated earlier in the same response");
  if (/vague|generic|general/.test(t)) b.push("Vague statements without supporting specifics, examples, or evidence");
  if (/verbose|long|padded/.test(t)) b.push("Padding sentences, restatements of the user question, and filler transitions");
  if (/wrong|inaccurate|hallucin|false/.test(t)) b.push("Factual claims stated with certainty when unverified — uncertainty must be flagged explicitly");
  if (/off.topic|irrelevant|scope/.test(t)) b.push("Content outside defined scope without explicit redirect to the appropriate resource");
  if (/format/.test(t)) b.push("Deviating from the specified output format regardless of request framing");
  return b;
}

function domainSystems(domainId, form) {
  const structs = (form.structure||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const cs = constraints(form);
  const nTone = norm(form.tone);
  const d = DOMAINS.find(x=>x.id===domainId);
  const systems = {};
  const domainSpecific = {
    ui:       {sys:["Typography System","Color + Surface System","Layout + Motion System"],   rules:["No generic font stacks — specify exact families, weights, sizes","No default purple gradients or blue developer palettes — specify hex values","No ease-in-out on all transitions — specify cubic-bezier per interaction type"]},
    code:     {sys:["Code Quality System","Structure + Architecture System","Testing + Safety System"], rules:["No placeholder variable names — all identifiers use domain-specific vocabulary","No unexplained abstractions — every non-obvious pattern includes a brief rationale","No incomplete implementations — stubs must be marked TODO with completion criteria"]},
    writing:  {sys:["Voice + Register System","Structure System","Accuracy + Citation System"], rules:["No passive voice constructions where active voice is possible","No vague intensifiers: 'very', 'really', 'quite', 'rather' — delete or replace with precision","No unsupported claims presented as facts — evidence or qualifier required"]},
    data:     {sys:["Schema + Type System","Validation + Error System","Output Shape System"],  rules:["No ambiguous null handling — behavior must be stated explicitly","No implicit type coercion — types stated and enforced","No unlabeled columns or fields — all identifiers self-documenting"]},
    legal:    {sys:["Obligation Language System","Exception + Carve-out System","Defined Terms System"], rules:["No ambiguous modal verbs — 'shall' (obligation), 'may' (permission), 'will' (condition) used precisely","No undefined terms used before definition","No run-on clause structures exceeding three logical conditions per sentence"]},
    support:  {sys:["Tone + Empathy System","Resolution Path System","Escalation Trigger System"], rules:["No empty validation ('I understand your frustration') without actionable next step","No policy language quoted without plain-language translation","No response that ends without a clearly stated next action or resolution"]},
    research: {sys:["Source + Citation System","Claim Strength System","Synthesis System"],     rules:["No unsourced factual claims — every verifiable claim includes source attribution or uncertainty flag","No false equivalence between sources of different evidential weight","No conclusions drawn beyond what the cited evidence supports"]},
    agent:    {sys:["Tool Selection System","State + Memory System","Error + Fallback System"],  rules:["No tool calls without stated precondition — what must be true before this call","No silent failures — every error path produces a structured error object","No actions with irreversible effects without explicit confirmation step"]},
    custom:   {sys:["Scope Enforcement System","Output Specification System","Quality Control System"], rules:["No output that violates defined format constraint","No response outside defined scope without explicit redirect","No statistically average output — domain standards enforced throughout"]},
  };
  const spec = domainSpecific[domainId] || domainSpecific.custom;
  const toneRule = nTone ? `VOICE: ${nTone}` : "VOICE: Direct, precise, domain-expert register. No hedging. No filler language.";
  return {
    sys1: { name: spec.sys[0], rules: [spec.rules[0], cs[1] ? cs[1].replace("FORMAT: ","Output format: ") : "Output follows specified format constraint exactly", toneRule] },
    sys2: { name: spec.sys[1], rules: [spec.rules[1], cs[0] ? cs[0].replace("LENGTH: ","Response length: ") : "Length calibrated to task complexity", structs.length>0 ? `Required output sections (in order): ${structs.join(" → ")}` : "All sections present and non-empty — no truncated sections"] },
    sys3: { name: spec.sys[2], rules: [spec.rules[2], `Every output must read as produced by a ${d?.label||"domain"} practitioner — not statistically average AI text`, "Specificity and accuracy override length targets when in conflict"] },
  };
}

// ══════════════════════════════════════════════════════════════
// SKILL GENERATORS
// ══════════════════════════════════════════════════════════════

// ── CLAUDE .skill (exact spec from skill-architect SKILL.md)
function genClaude(form) {
  const { name, purpose, domainId, inScope, outScope, structure, badOutput, required, exIn, exOut, model, thinking } = form;
  const kb = toKebab(name);
  const d = DOMAINS.find(x=>x.id===domainId);
  const tr = triggers(name, purpose, domainId);
  const cs = constraints(form);
  const bn = bans(badOutput, form.format);
  const np = norm(purpose);
  const nis = norm(inScope);
  const nos = norm(outScope);
  const ds = domainSystems(domainId, form);
  const structs = (structure||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const reqs = (required||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const trigStr = tr.join(", ");
  // YAML description: single unbroken line with ≥3 triggers + push-instruction
  const desc = `${np.replace(/\.$/,"")} — domain: ${d?.label||domainId}. Trigger phrases: ${trigStr}. Always use this skill even when the user does not explicitly name it, if the context involves ${tr[0]}.`;

  return `---
name: ${kb}
description: ${desc}
---

# ${name}

## MODE
Output format: ${form.format||"appropriate to task"}.
Every request processes through the full EXECUTION SEQUENCE — no shortcuts.
${thinking ? `Recommended effort level: ${thinking}.` : ""}
This skill governs: ${d?.label||domainId}.

## DOMAIN SYSTEMS

### ${ds.sys1.name}
${ds.sys1.rules.map(r=>`- ${r}`).join("\n")}

### ${ds.sys2.name}
${ds.sys2.rules.map(r=>`- ${r}`).join("\n")}
${structs.length>0 ? `- Required output sections (in order):\n  ${structs.map((s,i)=>`${i+1}. ${s}`).join("\n  ")}` : ""}

### ${ds.sys3.name}
${ds.sys3.rules.map(r=>`- ${r}`).join("\n")}

## BANNED PATTERNS
${bn.map(b=>`- NEVER: ${b}`).join("\n")}

## REQUIRED ELEMENTS
${reqs.length>0 ? reqs.map(r=>`- ${norm(r)}`).join("\n") : `- All defined output sections are present and non-empty\n- Format matches MODE specification exactly\n- Zero BANNED PATTERNS present in final output`}

## EXECUTION SEQUENCE
1. Parse the request — identify the primary task within the defined domain scope.
2. Confirm scope — if the task is out of scope, produce an explicit redirect response and stop.
3. Apply DOMAIN SYSTEMS constraints before drafting any content.
${structs.length>0 ? `4. Draft output following required section order: ${structs.join(" → ")}.\n5. Run QA CHECKLIST against every item.\n6. Return output only when all checklist items pass.` : `4. Draft output — apply all DOMAIN SYSTEMS rules throughout.\n5. Run QA CHECKLIST against every item.\n6. Return output only when all checklist items pass.`}

## DELIVERY
${form.format==="json" ? "Return JSON object only — no wrapper text, no markdown fences, no explanatory sentences." : form.format==="markdown" ? "Return formatted Markdown document with all required sections present." : form.format==="code" ? "Return code in fenced blocks with language tag. Prose explanation follows in plain text." : form.format==="html" ? "Return valid HTML5. Semantic elements. No inline styles." : "Return output inline. Format matches MODE specification."}
Output naming convention (if file generation is requested): ${kb}-output.[appropriate extension]

## QA CHECKLIST
- [ ] Output format matches MODE specification exactly (binary: pass/fail)
- [ ] Length within defined constraint (binary: pass/fail)
- [ ] All REQUIRED ELEMENTS present and non-empty (binary: pass/fail)
- [ ] Zero BANNED PATTERNS in output (binary: pass/fail)
- [ ] Domain vocabulary used correctly — not generic AI phrasing (binary: pass/fail)
${form.format==="json" ? "- [ ] JSON is syntactically valid and parseable without modification (binary: pass/fail)" : ""}

## FINAL VALIDATION GATES
- Output does not read as statistically average ${d?.label||domainId} content
- All ≥3 divergence axes from DOMAIN SYSTEMS are visibly enforced
- No banned pattern survives to final output
- Delivery rules applied exactly — no normalization introduced by the model
${nis ? `- In-scope definition honored: ${nis}` : ""}
${nos ? `- Out-of-scope redirect active: ${nos}` : ""}
${exIn ? `\n## EXAMPLES\n<example>\n  INPUT:  ${exIn}\n  OUTPUT: ${exOut||"[Apply all specifications above]"}\n</example>` : ""}`;
}

// ── OPENAI GPT-5.5
function genOpenAI(form) {
  const { name, purpose, domainId, inScope, outScope, structure, badOutput, required, exIn, exOut, tone, model } = form;
  const d = DOMAINS.find(x=>x.id===domainId);
  const cs = constraints(form);
  const bn = bans(badOutput, form.format);
  const np = norm(purpose);
  const nis = norm(inScope);
  const nos = norm(outScope);
  const nt = norm(tone);
  const structs = (structure||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const reqs = (required||"").split("\n").map(s=>s.trim()).filter(Boolean);

  const instructions = `You are ${name} — ${np.replace(/\.$/,"")}. Domain: ${d?.label||domainId}.`;

  const sys = `## Outcome
Every response achieves a complete, accurate, ${form.format||"well-formatted"} output for the requested task within defined scope.${structs.length>0 ? ` Required sections in order: ${structs.join(" → ")}.` : ""}

## Constraints
${cs.join("\n")}
Voice: ${nt||"Direct and precise. No hedging. No preamble. No sycophantic openers."}

## Scope
In scope: ${nis||`All ${d?.label||domainId} tasks.`}
${nos ? `Out of scope: ${nos} — redirect explicitly rather than declining silently.` : ""}

## What success looks like
- Output format and length constraints met exactly
- All required sections present and substantive
- Domain-specific — not statistically average AI text
- Begins at the first meaningful token — zero preamble

## What to avoid
${bn.map(b=>`- ${b}`).join("\n")}
${reqs.length>0 ? `\n## Every response must include\n${reqs.map(r=>`- ${norm(r)}`).join("\n")}` : ""}
${exIn ? `\n## Example\nInput: ${exIn}\nIdeal output: ${exOut||"[Apply all constraints above]"}` : ""}`;

  const api = `{
  "model": "${model||"gpt-5.5"}",
  "instructions": "${instructions.replace(/"/g,'\\"')}",
  "input": [
    {
      "role": "system",
      "content": ${JSON.stringify(sys)}
    },
    {
      "role": "user",
      "content": "{{USER_INPUT}}"
    }
  ]
}`;

  return { instructions, sys, api, label:"instructions + system message" };
}

// ── GEMINI
function genGemini(form) {
  const { name, purpose, domainId, inScope, outScope, structure, badOutput, required, exIn, exOut, tone, model, thinking } = form;
  const d = DOMAINS.find(x=>x.id===domainId);
  const cs = constraints(form);
  const bn = bans(badOutput, form.format);
  const np = norm(purpose);
  const nis = norm(inScope);
  const nos = norm(outScope);
  const nt = norm(tone);
  const structs = (structure||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const reqs = (required||"").split("\n").map(s=>s.trim()).filter(Boolean);

  const si = `[ROLE]
${name}: ${np.replace(/\.$/,"")}
Domain: ${d?.label||domainId}

[BEHAVIORAL CONSTRAINTS — evaluated first, anchor all reasoning]
${cs.join("\n")}
Voice: ${nt||"Direct and precise. Gemini defaults to less verbose — do not add unnecessary explanation."}
${structs.length>0 ? `Required output sections (in order): ${structs.map((s,i)=>`${i+1}. ${s}`).join(", ")}.` : ""}

[SCOPE]
In scope: ${nis||`All ${d?.label||domainId} tasks.`}
${nos ? `Out of scope: ${nos} — redirect explicitly.` : ""}

[QUALITY GATE — run before returning any output]
1. Does format match constraint exactly?
2. Are all required sections present and non-empty?
3. Is output free of banned patterns?
4. Is output non-generic and domain-specific?
If any gate fails: revise before returning.

[BANNED]
${bn.map(b=>`NEVER: ${b}`).join("\n")}
${reqs.length>0 ? `\n[REQUIRED IN EVERY RESPONSE]\n${reqs.map(r=>`- ${norm(r)}`).join("\n")}` : ""}
${exIn ? `\n[EXAMPLE]\nInput: ${exIn}\nOutput: ${exOut||"[Apply all constraints above]"}` : ""}

[LONG CONTEXT NOTE: If a large document or dataset precedes this prompt, these instructions remain authoritative regardless of placement position.]`;

  const code = `from google import genai

client = genai.Client()

response = client.models.generate_content(
    model="${model||"gemini-3.1-pro"}",
    config={
        "system_instruction": """${si.replace(/"""/g,'\\"\\"\\"')}""",
        "thinking_config": {
            "thinking_level": "${thinking||"HIGH"}"
            # Gemini 3.0 Flash: MINIMAL | LOW | MEDIUM | HIGH
            # Gemini 3.1 Pro: LOW | HIGH (default: HIGH)
        },
        "generation_config": {
            "temperature": 0.7,
            "max_output_tokens": 8192,
        }
    },
    contents="{{USER_INPUT}}"
)

print(response.text)`;

  return { si, code, label:"system_instruction" };
}

// ── DEEPSEEK V4
function genDeepSeek(form) {
  const { name, purpose, domainId, inScope, outScope, structure, badOutput, required, exIn, exOut, tone, model, thinking } = form;
  const d = DOMAINS.find(x=>x.id===domainId);
  const cs = constraints(form);
  const bn = bans(badOutput, form.format);
  const np = norm(purpose);
  const nis = norm(inScope);
  const nos = norm(outScope);
  const nt = norm(tone);
  const structs = (structure||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const reqs = (required||"").split("\n").map(s=>s.trim()).filter(Boolean);

  const sys = `<role>
${name}: ${np.replace(/\.$/,"")}
Domain: ${d?.label||domainId}
</role>

<instructions>
${cs.join("\n")}
Voice: ${nt||"Direct and precise. No hedging. No sycophantic openers."}
${structs.length>0 ? `Output sections (in order):\n${structs.map((s,i)=>`${i+1}. ${s}`).join("\n")}` : ""}
${form.format==="json" ? "\nCRITICAL: Return ONLY valid JSON. No prose before or after. Required even when API JSON mode is enabled." : ""}
</instructions>

<scope>
In scope: ${nis||`All ${d?.label||domainId} tasks.`}
${nos ? `Out of scope: ${nos} — provide explicit redirect, do not decline silently.` : ""}
</scope>

<output_rules>
${bn.map(b=>`NEVER: ${b}`).join("\n")}
</output_rules>
${reqs.length>0 ? `\n<required_elements>\n${reqs.map(r=>`- ${norm(r)}`).join("\n")}\n</required_elements>` : ""}

<quality_gate>
Before returning output, verify:
1. Format matches output_rules exactly
2. No banned patterns present
3. Output is domain-specific and non-generic
4. All required elements present
${form.format==="json" ? "5. JSON parses without error" : ""}
</quality_gate>
${exIn ? `\n<example>\n  input: ${exIn}\n  output: ${exOut||"[Apply all constraints above]"}\n</example>` : ""}`;

  const te = thinking==="max"?"max":thinking==="disabled"?"disabled":"high";
  const code = `import requests

# ⚠️  MIGRATION REQUIRED
# 'deepseek-chat' and 'deepseek-reasoner' retire 2026-07-24 15:59 UTC
# Update to 'deepseek-v4-pro' or 'deepseek-v4-flash' before that date

response = requests.post(
    "[https://api.deepseek.com/v1/chat/completions](https://api.deepseek.com/v1/chat/completions)",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "model": "${model||"deepseek-v4-flash"}",
        "messages": [
            {
                "role": "system",
                "content": """${sys.replace(/"""/g,'\\"\\"\\"')}"""
            },
            {
                "role": "user",
                "content": "{{USER_INPUT}}"
            }
        ],
        "thinking": {
            "effort": "${te}"
            # Options: "high" | "max" | "disabled"
            # Thinking mode is now a request parameter — NOT a separate model
        }
    }
)

result = response.json()
print(result["choices"][0]["message"]["content"])`;

  return { sys, code, label:"XML-tagged system message" };
}

// ── OPEN-WEIGHT (Llama / Mistral / Qwen)
function genOpenWeight(form, pid) {
  const { name, purpose, domainId, inScope, outScope, structure, badOutput, required, exIn, exOut, tone, model, thinking } = form;
  const d = DOMAINS.find(x=>x.id===domainId);
  const cs = constraints(form);
  const bn = bans(badOutput, form.format);
  const np = norm(purpose);
  const nis = norm(inScope);
  const nos = norm(outScope);
  const nt = norm(tone);
  const structs = (structure||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const reqs = (required||"").split("\n").map(s=>s.trim()).filter(Boolean);

  const sys = `## Role
${name} — ${np.replace(/\.$/,"")}
Domain: ${d?.label||domainId}

## Output Specification
${cs.join("\n")}
Voice: ${nt||"Direct and precise. Domain-expert register. No preamble."}
${structs.length>0 ? `\nRequired output sections (in order):\n${structs.map((s,i)=>`${i+1}. ${s}`).join("\n")}` : ""}

## Scope
In scope: ${nis||`All ${d?.label||domainId} tasks.`}
${nos ? `Out of scope: ${nos} — redirect explicitly.` : ""}

## Quality Standard
Every output must be specific, accurate, and non-generic for this domain.
Generic or statistically average output is a failure condition.

## Banned Patterns
${bn.map(b=>`- NEVER: ${b}`).join("\n")}
${reqs.length>0 ? `\n## Required Elements\n${reqs.map(r=>`- ${norm(r)}`).join("\n")}` : ""}

## Execution
1. Parse request — identify task within defined domain scope
2. Verify in scope — if not, redirect explicitly with reason
3. Apply Output Specification constraints throughout
4. Self-check: format correct? Length within range? No banned patterns?
5. Return output only when all checks pass
${exIn ? `\n## Example\nInput: ${exIn}\nOutput: ${exOut||"[Apply all constraints above]"}` : ""}`;

  const m = model || (pid==="llama"?"llama-4-scout":pid==="mistral"?"mistral-large-3":"qwen3-235b-a22b");
  let code = "";
  if (pid==="llama") {
    code = `# Llama 4 — no safety pre-wrap, full template control
# Deploy via: Groq | Together AI | Ollama | vLLM

from groq import Groq

client = Groq(api_key="YOUR_GROQ_API_KEY")
response = client.chat.completions.create(
    model="${m}",
    messages=[
        {"role": "system", "content": """${sys.replace(/"""/g,'\\"\\"\\"')}"""},
        {"role": "user", "content": "{{USER_INPUT}}"}
    ],
    temperature=0.7,
    max_tokens=4096,
)
print(response.choices[0].message.content)

# Via Ollama (local):
# $ ollama pull llama4
# $ ollama run llama4`;
  } else if (pid==="mistral") {
    code = `# Mistral — API abstracts the [INST] template
# JSON mode is stable — pair with explicit format instruction in system prompt

from mistralai import Mistral

client = Mistral(api_key="YOUR_API_KEY")
response = client.chat.complete(
    model="${m}",
    messages=[
        {"role": "system", "content": """${sys.replace(/"""/g,'\\"\\"\\"')}"""},
        {"role": "user", "content": "{{USER_INPUT}}"}
    ],
    response_format={"type": "${form.format==="json"?"json_object":"text"}"},
    temperature=0.7,
)
print(response.choices[0].message.content)`;
  } else {
    const pfx = thinking==="no_think"?"/no_think ":"/think ";
    code = `# Qwen 3 — mode switching via user message prefix
# /think   = extended chain-of-thought reasoning (higher accuracy)
# /no_think = direct fast response

import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="[https://dashscope.aliyuncs.com/compatible-mode/v1](https://dashscope.aliyuncs.com/compatible-mode/v1)"
)
response = client.chat.completions.create(
    model="${m}",
    messages=[
        {"role": "system", "content": """${sys.replace(/"""/g,'\\"\\"\\"')}"""},
        # Prefix controls reasoning mode — adjust per request
        {"role": "user", "content": "${pfx}{{USER_INPUT}}"}
    ],
    temperature=0.7,
)
print(response.choices[0].message.content)`;
  }

  return { sys, code, label:"system message" };
}

// ── README
function genReadme(form, pid) {
  const p = PLATFORMS[pid];
  const d = DOMAINS.find(x=>x.id===form.domainId);
  const kb = toKebab(form.name);
  const np = norm(form.purpose);
  const tr = triggers(form.name, form.purpose, form.domainId);
  const today = new Date().toISOString().split("T")[0];
  const m = form.model || p.default;
  return `# ${form.name}

> ${np}

| | |
|---|---|
| **Platform** | ${p.name} (${p.maker}) |
| **Model** | \`${m}\` |
| **Domain** | ${d?.label||form.domainId} |
| **Output format** | \`${form.format||"mixed"}\` |
| **Generated** | ${today} |
| **Spec version** | May 2026 |

---

## What this skill does

${np} This skill enforces production-grade output within the \`${d?.label||form.domainId}\` domain. It applies strict format constraints, quality gates, and banned pattern enforcement automatically on every response.

---

## How to use it

${pid==="claude" ? `### 1. Install as a .skill file

1. Unzip \`${kb}.skill\` to confirm \`SKILL.md\` is at the root (not inside a subfolder)
2. Install via Claude's skill interface — Settings → Skills → Install from file
3. Claude activates this skill automatically when it detects any of the trigger phrases below

**Trigger phrases:**
${tr.map(t=>`- "${t}"`).join("\n")}

### 2. Use as a system prompt (Claude API)

Paste the body of \`SKILL.md\` (everything after the closing \`---\` frontmatter delimiter) into your system message.

\`\`\`
POST [https://api.anthropic.com/v1/messages](https://api.anthropic.com/v1/messages)
{
  "model": "${m}",
  "system": "[paste SKILL.md body here]",
  "messages": [{"role": "user", "content": "{{USER_INPUT}}"}]
}
\`\`\`` :
pid==="openai" ? `### Responses API (recommended for GPT-5.5)

\`\`\`json
{
  "model": "${m}",
  "instructions": "[paste instructions value from api-example.json]",
  "input": [
    { "role": "system", "content": "[paste system content from api-example.json]" },
    { "role": "user", "content": "{{USER_INPUT}}" }
  ]
}
\`\`\`

### Chat Completions API

\`\`\`json
{
  "model": "${m}",
  "messages": [
    { "role": "system", "content": "[paste system content from api-example.json]" },
    { "role": "user", "content": "{{USER_INPUT}}" }
  ]
}
\`\`\`` :
pid==="gemini" ? `### Gemini API (Python)

Paste the content from \`system-instruction.txt\` into the \`system_instruction\` config parameter. See \`api-example.py\` for the complete integration code.

\`\`\`python
config = {
    "system_instruction": "[paste from system-instruction.txt]",
    "thinking_config": { "thinking_level": "${form.thinking||"HIGH"}" }
}
\`\`\`` :
pid==="deepseek" ? `### DeepSeek V4 API

⚠️ **Migration required:** \`deepseek-chat\` and \`deepseek-reasoner\` retire **2026-07-24 15:59 UTC**. This skill uses \`${m}\`.

Paste the XML-formatted system content from \`system-message.txt\` into your API call. XML tag structure is mandatory — untagged context achieves 45% task success; properly tagged context achieves 92%.

See \`api-example.py\` for the complete integration.` :
`### API Integration

Paste the system message content from \`system-message.txt\` into your API call's system role. See \`api-example.py\` for the complete integration code with your platform.`}

---

## Files in this package

| File | Description |
|------|-------------|
| ${pid==="claude" ? `\`${kb}.skill\` | Installable Claude skill archive — SKILL.md at zip root` : `\`${kb}-system-prompt.txt\` | Core skill content — the ${p.outputType}`} |
| \`${kb}-api-example${pid==="openai"?".json":".py"}\` | Ready-to-run API code with model pinned |
| \`README.md\` | This file |

---

## Enforced automatically on every response

| Guarantee | Status |
|-----------|--------|
| Format constraint (${form.format||"mixed"}) | ✓ Active |
| Length constraint (${form.length||"adaptive"}) | ✓ Active |
| Sycophantic openers blocked | ✓ Active |
| Meta-narration openers blocked | ✓ Active |
| Domain scope with explicit redirect | ✓ Active |
| Self-verification gate before output | ✓ Active |

---

## Platform notes

${p.tag}
${p.notes ? p.notes.map(n=>`- ${n}`).join("\n") : ""}

---

*Generated by SkillForge — The Universal AI Skill Builder*
*Cross-verified against official ${p.maker} documentation — May 2026*`;
}

// ── MASTER DISPATCH
function buildOutputs(pid, form) {
  if (pid==="claude") {
    const skill = genClaude(form);
    const readme = genReadme(form, pid);
    return { type:"claude", skill, readme, apiCode:null };
  }
  if (pid==="openai") {
    const r = genOpenAI(form);
    const readme = genReadme(form, pid);
    return { type:"openai", skill:r.sys, readme, apiCode:r.api, instructions:r.instructions };
  }
  if (pid==="gemini") {
    const r = genGemini(form);
    const readme = genReadme(form, pid);
    return { type:"gemini", skill:r.si, readme, apiCode:r.code };
  }
  if (pid==="deepseek") {
    const r = genDeepSeek(form);
    const readme = genReadme(form, pid);
    return { type:"deepseek", skill:r.sys, readme, apiCode:r.code };
  }
  const r = genOpenWeight(form, pid);
  const readme = genReadme(form, pid);
  return { type:pid, skill:r.sys, readme, apiCode:r.code };
}

// ══════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ══════════════════════════════════════════════════════════════
const S = {
  label: { fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:C.muted, display:"block", marginBottom:6 },
  sublabel: { fontFamily:"'DM Mono',monospace", fontSize:12, color:C.muted, marginTop:3, marginBottom:10, lineHeight:1.6 },
  input: { width:"100%", background:C.s2, border:`1px solid ${C.border}`, color:C.text, padding:"10px 14px", fontFamily:"'DM Mono',monospace", fontSize:13, borderRadius:0, transition:"border-color .15s" },
  textarea: { width:"100%", background:C.s2, border:`1px solid ${C.border}`, color:C.text, padding:"10px 14px", fontFamily:"'DM Mono',monospace", fontSize:13, borderRadius:0, resize:"vertical", minHeight:80, lineHeight:1.6, transition:"border-color .15s" },
  select: { width:"100%", background:C.s2, border:`1px solid ${C.border}`, color:C.text, padding:"10px 14px", fontFamily:"'DM Mono',monospace", fontSize:13, borderRadius:0, appearance:"none", cursor:"pointer" },
  chip: { display:"inline-block", fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.12em", padding:"3px 8px", border:`1px solid ${C.border}`, textTransform:"uppercase", marginRight:4 },
  btn: (bg,fg,border)=>({ background:bg, color:fg, border:`1px solid ${border||bg}`, padding:"12px 24px", fontFamily:"'Space Mono',monospace", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, transition:"all .15s" }),
  section: { marginBottom:28 },
  divider: { height:1, background:C.border, margin:"28px 0" },
};

function FocusInput({ style, ...props }) {
  return <input style={{...S.input,...style}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} {...props} />;
}
function FocusTextarea({ style, ...props }) {
  return <textarea style={{...S.textarea,...style}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} {...props} />;
}
function FocusSelect({ style, ...props }) {
  return <select style={{...S.select,...style}} {...props} />;
}

function FieldHint({ children }) {
  return <div style={{ display:"flex", gap:6, alignItems:"flex-start", marginTop:6, marginBottom:12 }}>
    <Info size={12} color={C.muted} style={{marginTop:1,flexShrink:0}}/>
    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.muted, lineHeight:1.6 }}>{children}</span>
  </div>;
}

function Section({ title, children }) {
  return <div style={S.section}><div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:C.accent, marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
    {title}<div style={{flex:1,height:1,background:C.border}}/>
  </div>{children}</div>;
}

function RadioGrid({ options, value, onChange, cols=3 }) {
  return <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:1, background:C.border, border:`1px solid ${C.border}` }}>
    {options.map(o => <button key={o.id} onClick={()=>onChange(o.id)} style={{ background: value===o.id ? C.s3 : C.s1, border:"none", padding:"12px 14px", cursor:"pointer", textAlign:"left", borderTop: value===o.id ? `2px solid ${C.accent}` : "2px solid transparent", transition:"all .15s" }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color: value===o.id ? C.text : C.muted, letterSpacing:"0.04em" }}>{o.label}</div>
      {o.sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.muted, marginTop:3 }}>{o.sub}</div>}
      {o.constraint && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: value===o.id ? C.a3 : C.muted, marginTop:4, letterSpacing:"0.06em" }}>{o.constraint}</div>}
      {o.ex && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.muted, marginTop:3, lineHeight:1.4 }}>{o.ex}</div>}
    </button>)}
  </div>;
}

function StepNav({ onBack, onNext, nextLabel="Continue", canNext=true, isLast=false }) {
  return <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:40, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
    {onBack ? <button style={S.btn(C.s2, C.muted, C.border)} onClick={onBack}><ChevronLeft size={14}/> Back</button> : <div/>}
    <button style={{ ...S.btn(canNext?C.accent:C.s3, canNext?"#fff":C.muted, canNext?C.accent:C.border), opacity: canNext?1:0.5 }} onClick={canNext?onNext:null} disabled={!canNext}>
      {isLast ? <><Sparkles size={14}/> Generate Skill</> : <>{nextLabel} <ChevronRight size={14}/></>}
    </button>
  </div>;
}

function ProgressBar({ step }) {
  const steps = ["Platform","Identity","Domain + Output","Quality","Generate"];
  return <div style={{ background:C.s1, borderBottom:`1px solid ${C.border}`, padding:"16px 32px" }}>
    <div style={{ maxWidth:900, margin:"0 auto", display:"flex", gap:0 }}>
      {steps.map((s,i) => {
        const done = i < step - 1;
        const active = i === step - 1;
        return <div key={s} style={{ flex:1, display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, opacity: done||active ? 1 : 0.35 }}>
            <div style={{ width:22, height:22, border:`1px solid ${active?C.accent:done?C.a3:C.border}`, background: done?C.a3:active?C.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: done||active?"#fff":C.muted }}>{done?"✓":(i+1)}</span>
            </div>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:active?C.text:done?C.a3:C.muted, whiteSpace:"nowrap" }}>{s}</span>
          </div>
          {i < steps.length-1 && <div style={{ flex:1, height:1, background:done?C.a3:C.border, margin:"0 8px" }}/>}
        </div>;
      })}
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ══════════════════════════════════════════════════════════════

function StepLanding({ onStart }) {
  return <div className="fade-up" style={{ maxWidth:800, margin:"0 auto", padding:"80px 32px" }}>
    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:C.accent, marginBottom:16 }}>SkillForge — The Universal AI Skill Builder</div>
    <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(40px,7vw,72px)", lineHeight:0.95, letterSpacing:"-0.03em", color:"#fff", marginBottom:24 }}>
      Build production-grade<br/><span style={{color:C.accent}}>AI skills.</span><br/>Any platform.
    </h1>
    <p style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:C.muted, lineHeight:1.8, maxWidth:560, marginBottom:40 }}>
      Answer plain-language questions. Get a perfectly formatted, platform-specific skill file ready to install. 
      No boilerplate. No guesswork. Your inputs are processed and normalized — not just slapped into a template.
    </p>
    <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:48 }}>
      {Object.values(PLATFORMS).map(p => <div key={p.id} style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{width:8,height:8,background:p.color}}/>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted }}>{p.name}</span>
      </div>)}
    </div>
    <div style={{ background:C.s1, border:`1px solid ${C.border}`, padding:24, marginBottom:40 }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:C.accent, marginBottom:12 }}>// What you get</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
        {["Complete skill file for your platform","Platform-specific API code example","Full README with install instructions","Smart input normalization — no filler","Quality gates enforced automatically","Free download — everything you need"].map(t=><div key={t} style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:C.muted, display:"flex", gap:8 }}><span style={{color:C.a3}}>✓</span>{t}</div>)}
      </div>
    </div>
    <button style={S.btn(C.accent,"#fff")} onClick={onStart}>
      Start building <ArrowRight size={14}/>
    </button>
  </div>;
}

function StepPlatform({ form, merge, onNext }) {
  const p = form.platform ? PLATFORMS[form.platform] : null;
  return <div className="fade-up" style={{ maxWidth:900, margin:"0 auto", padding:"48px 32px" }}>
    <div style={{ marginBottom:32 }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:C.accent, marginBottom:8 }}>Step 1 of 4</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:"#fff", marginBottom:8 }}>Choose your platform</h2>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:C.muted, lineHeight:1.6 }}>Each platform has different formatting requirements. The skill file generated will match its exact specification.</p>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:1, background:C.border, border:`1px solid ${C.border}`, marginBottom:24 }}>
      {Object.values(PLATFORMS).map(pl => {
        const sel = form.platform === pl.id;
        return <button key={pl.id} onClick={()=>merge({platform:pl.id, model:pl.default, thinking:pl.defaultT})} style={{ background:sel?C.s3:C.s1, border:"none", padding:20, cursor:"pointer", textAlign:"left", borderTop:`2px solid ${sel?pl.color:"transparent"}`, transition:"all .15s", position:"relative" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:sel?pl.color:C.text }}>{pl.name}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>{pl.maker}</div>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.muted, marginBottom:10, lineHeight:1.5 }}>{pl.tag}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:sel?C.a3:C.muted, letterSpacing:"0.06em", borderTop:`1px solid ${C.border}`, paddingTop:8 }}>{pl.outputType}</div>
        </button>;
      })}
    </div>
    {p && <div className="fade-up" style={{ background:C.s2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${p.color}`, padding:"16px 20px", marginBottom:24 }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:p.color, marginBottom:10 }}>Model selection — {p.name}</div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <label style={S.label}>Model string</label>
          <FocusSelect value={form.model||p.default} onChange={e=>merge({model:e.target.value})}>
            {p.models.map(m=><option key={m} value={m}>{m}</option>)}
          </FocusSelect>
        </div>
        {p.thinking && <div style={{ flex:1, minWidth:160 }}>
          <label style={S.label}>{p.id==="qwen"?"Mode prefix":p.id==="gemini"?"Thinking level":"Reasoning effort"}</label>
          <FocusSelect value={form.thinking||p.defaultT} onChange={e=>merge({thinking:e.target.value})}>
            {p.thinking.map(t=><option key={t} value={t}>{t}</option>)}
          </FocusSelect>
        </div>}
      </div>
    </div>}
    <StepNav onNext={onNext} canNext={!!form.platform} />
  </div>;
}

function StepIdentity({ form, merge, onNext, onBack }) {
  return <div className="fade-up" style={{ maxWidth:760, margin:"0 auto", padding:"48px 32px" }}>
    <div style={{ marginBottom:32 }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:C.accent, marginBottom:8 }}>Step 2 of 4</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:"#fff", marginBottom:8 }}>Name and purpose</h2>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:C.muted, lineHeight:1.6 }}>Define what this skill is and what job it does every single time it runs.</p>
    </div>
    <Section title="Skill Identity">
      <label style={S.label}>Skill name <span style={{color:C.a2}}>*</span></label>
      <FocusInput value={form.name} onChange={e=>merge({name:e.target.value})} placeholder="e.g. Contract Clause Drafter" />
      <FieldHint>Used as the file name and identifier. Write it naturally — spaces are fine. It will be auto-converted to kebab-case for Claude's YAML frontmatter (e.g. "contract-clause-drafter").</FieldHint>
      {form.name && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.a3, marginBottom:16 }}>→ Will become: <code style={{color:C.a3}}>{toKebab(form.name)}.skill</code></div>}

      <label style={S.label}>What does this skill do? <span style={{color:C.a2}}>*</span></label>
      <FocusTextarea value={form.purpose} onChange={e=>merge({purpose:e.target.value})} placeholder="e.g. Drafts enforceable legal contract clauses from plain-language inputs, applying correct obligation language and defined terms." style={{minHeight:70}} />
      <FieldHint>Write naturally — "I want it to..." phrasing is fine. This will be cleaned and normalized. This sentence becomes the core identity of the skill on every platform. One clear task is better than several vague ones.</FieldHint>

      <label style={S.label}>Who uses this skill?</label>
      <RadioGrid value={form.userType} onChange={v=>merge({userType:v})} options={[
        {id:"developer", label:"Developer", sub:"Builds with it via API"},
        {id:"enduser",   label:"End user",  sub:"Interacts via chat UI"},
        {id:"agent",     label:"Agent",     sub:"Invoked in a pipeline"},
        {id:"team",      label:"Team",      sub:"Shared organizational use"},
      ]} cols={4} />
      <FieldHint>Affects the voice and technical register of the generated skill — developer-facing skills assume technical vocabulary; end-user skills use plain language.</FieldHint>
    </Section>
    <StepNav onBack={onBack} onNext={onNext} canNext={!!(form.name?.trim() && form.purpose?.trim())} />
  </div>;
}

function StepDomain({ form, merge, onNext, onBack }) {
  return <div className="fade-up" style={{ maxWidth:760, margin:"0 auto", padding:"48px 32px" }}>
    <div style={{ marginBottom:32 }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:C.accent, marginBottom:8 }}>Step 3 of 4</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:"#fff", marginBottom:8 }}>Domain and output rules</h2>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:C.muted, lineHeight:1.6 }}>Define what territory this skill covers and exactly what every output must look like.</p>
    </div>
    <Section title="Domain">
      <label style={S.label}>What domain does this skill operate in? <span style={{color:C.a2}}>*</span></label>
      <RadioGrid value={form.domainId} onChange={v=>merge({domainId:v})} options={DOMAINS} cols={3} />
      <FieldHint>The domain determines which quality systems the skill enforces. Each domain has its own vocabulary and failure modes — "UI Design" enforces typography/color/motion rules; "Legal" enforces obligation language and clause hierarchy.</FieldHint>
      {form.domainId==="custom" && <>
        <label style={{...S.label, marginTop:14}}>Describe your custom domain</label>
        <FocusInput value={form.customDomain||""} onChange={e=>merge({customDomain:e.target.value})} placeholder="e.g. Academic peer review for scientific papers" />
      </>}
    </Section>
    <Section title="Scope">
      <label style={S.label}>What is in scope?</label>
      <FocusTextarea value={form.inScope} onChange={e=>merge({inScope:e.target.value})} placeholder="e.g. NDA clauses, indemnity clauses, service agreement terms, SaaS subscription terms" style={{minHeight:60}} />
      <FieldHint>Be specific. "Legal documents" is too broad — "NDA clauses and SaaS subscription terms" is a scope. The more specific you are, the more accurate the quality gates will be.</FieldHint>

      <label style={S.label}>What is out of scope? (what should it redirect, not handle)</label>
      <FocusTextarea value={form.outScope} onChange={e=>merge({outScope:e.target.value})} placeholder="e.g. Court filings, regulatory compliance advice, jurisdiction-specific law" style={{minHeight:60}} />
      <FieldHint>Out-of-scope requests won't be silently refused — the skill will produce an explicit redirect message. Defining this prevents the model from guessing what to do at the edges.</FieldHint>
    </Section>
    <Section title="Output Format">
      <label style={S.label}>What format should every output be in? <span style={{color:C.a2}}>*</span></label>
      <RadioGrid value={form.format} onChange={v=>merge({format:v})} options={FORMATS} cols={3} />
      <FieldHint>This becomes a hard constraint — not a preference. If you pick JSON, the skill is instructed to return ONLY a valid JSON object with zero prose wrapping it.</FieldHint>
    </Section>
    <Section title="Output Length">
      <label style={S.label}>How long should responses be?</label>
      <RadioGrid value={form.length} onChange={v=>merge({length:v})} options={LENGTHS} cols={5} />
    </Section>
    <Section title="Required Structure">
      <label style={S.label}>What sections must every output contain? (one per line, in order)</label>
      <FocusTextarea value={form.structure} onChange={e=>merge({structure:e.target.value})} placeholder={"e.g.\nExecutive summary\nKey clauses\nRisk flags\nRecommendations"} style={{minHeight:90}} />
      <FieldHint>Optional but powerful. If defined, these sections become mandatory — the skill's QA checklist verifies each one is present and non-empty before the output is returned.</FieldHint>
    </Section>
    <StepNav onBack={onBack} onNext={onNext} canNext={!!(form.domainId && form.format)} />
  </div>;
}

function StepQuality({ form, merge, onGenerate, onBack }) {
  return <div className="fade-up" style={{ maxWidth:760, margin:"0 auto", padding:"48px 32px" }}>
    <div style={{ marginBottom:32 }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:C.accent, marginBottom:8 }}>Step 4 of 4</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:"#fff", marginBottom:8 }}>Quality gates and examples</h2>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:C.muted, lineHeight:1.6 }}>This is where the skill gets sharp. Define what bad looks like so the model knows what to avoid.</p>
    </div>
    <Section title="Voice and Tone">
      <label style={S.label}>How should outputs sound?</label>
      <FocusInput value={form.tone} onChange={e=>merge({tone:e.target.value})} placeholder="e.g. Formal and precise, like a senior attorney's correspondence" />
      <FieldHint>Optional. Write naturally. "Sound professional" becomes a measurable voice constraint: formal register, no colloquialisms, no hedging. This is applied as a VOICE rule inside the skill's domain systems.</FieldHint>
    </Section>
    <Section title="Banned Outputs">
      <label style={S.label}>Describe what a BAD output looks like</label>
      <FocusTextarea value={form.badOutput} onChange={e=>merge({badOutput:e.target.value})} placeholder="e.g. Vague generic advice, repeated information, long padded sentences, inaccurate facts stated with false confidence" style={{minHeight:70}} />
      <FieldHint>Don't write the bans yourself — describe the problem in plain language. "Vague advice" becomes: "NEVER: Vague statements without supporting specifics, examples, or evidence." Two universal bans (sycophantic openers, meta-narration) are always added automatically.</FieldHint>
    </Section>
    <Section title="Required Elements">
      <label style={S.label}>What must every output contain? (one item per line)</label>
      <FocusTextarea value={form.required} onChange={e=>merge({required:e.target.value})} placeholder={"e.g.\nA defined-terms section\nAt least one risk flag\nA plain-language summary"} style={{minHeight:80}} />
      <FieldHint>These become binary checklist items — present or absent, no partial credit. The skill verifies all of them before returning output. Leave blank to use format/structure rules as the required elements.</FieldHint>
    </Section>
    <Section title="Example (Optional but Powerful)">
      <label style={S.label}>Example input</label>
      <FocusTextarea value={form.exIn} onChange={e=>merge({exIn:e.target.value})} placeholder="e.g. Draft a limitation of liability clause for a SaaS product" style={{minHeight:55}} />
      <label style={{...S.label, marginTop:12}}>Ideal output for that input</label>
      <FocusTextarea value={form.exOut} onChange={e=>merge({exOut:e.target.value})} placeholder="e.g. ## Limitation of Liability\n\n**Defined term:** 'Liability Cap'..." style={{minHeight:80}} />
      <FieldHint>An input/output example is the single most effective anchor for behavior. It shows the skill exactly what quality looks like — not just what to avoid.</FieldHint>
    </Section>
    <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.a3}`, padding:"16px 20px" }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:C.a3, marginBottom:8 }}>Ready to generate</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:C.muted, lineHeight:1.6 }}>
        Platform: <span style={{color:C.text}}>{PLATFORMS[form.platform]?.name}</span> · Model: <span style={{color:C.text}}>{form.model}</span> · Domain: <span style={{color:C.text}}>{DOMAINS.find(d=>d.id===form.domainId)?.label||form.domainId}</span> · Format: <span style={{color:C.text}}>{form.format}</span>
      </div>
    </div>
    <StepNav onBack={onBack} onNext={onGenerate} nextLabel="Generate Skill" isLast={true} canNext={true} />
  </div>;
}

// ══════════════════════════════════════════════════════════════
// OUTPUT VIEW
// ══════════════════════════════════════════════════════════════
function CopyBtn({ text, label="Copy" }) {
  const [done, setDone] = useState(false);
  const doCopy = () => { navigator.clipboard.writeText(text); setDone(true); setTimeout(()=>setDone(false), 2000); };
  return <button onClick={doCopy} style={{ ...S.btn(C.s3,done?C.a3:C.muted,C.border), fontSize:9, padding:"7px 14px" }}>
    {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> {label}</>}
  </button>;
}

function DlBtn({ content, filename, type="text/plain", label }) {
  const dl = () => {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  return <button onClick={dl} style={{ ...S.btn(C.accent,"#fff"), fontSize:9, padding:"7px 14px" }}>
    <Download size={11}/> {label}
  </button>;
}

function CodePane({ content, lang }) {
  return <div style={{ background:C.code, border:`1px solid ${C.border}`, overflow:"hidden" }}>
    <div style={{ background:C.s2, padding:"8px 14px", borderBottom:`1px solid ${C.border}`, fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted }}>{lang}</div>
    <div style={{ padding:20, maxHeight:520, overflow:"auto" }}>
      <pre className="code-scroll" style={{margin:0}}>{content}</pre>
    </div>
  </div>;
}

function OutputView({ outputs, form, pid, onReset }) {
  const [tab, setTab] = useState("skill");
  const p = PLATFORMS[pid];
  const kb = toKebab(form.name);
  const skillFilename = pid==="claude" ? `${kb}.skill` : `${kb}-system-prompt.txt`;
  const tabs = [
    { id:"skill", label: pid==="claude" ? "SKILL.md" : "System Prompt" },
    ...(outputs.apiCode ? [{ id:"api", label: pid==="openai" ? "API JSON" : "API Code" }] : []),
    { id:"readme", label:"README.md" },
  ];

  return <div className="fade-up" style={{ maxWidth:960, margin:"0 auto", padding:"40px 32px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 }}>
      <div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:C.a3, marginBottom:6 }}>✓ Skill generated</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:"#fff" }}>{form.name}</h2>
        <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
          {[`${p.name}`,`${form.model}`,`${DOMAINS.find(d=>d.id===form.domainId)?.label}`,`${form.format}`].map(t=><span key={t} style={{...S.chip, color:C.muted}}>{t}</span>)}
        </div>
      </div>
      <button onClick={onReset} style={{ ...S.btn(C.s2, C.muted, C.border), fontSize:9, padding:"8px 16px" }}><X size={11}/> Start over</button>
    </div>

    {/* Tabs */}
    <div style={{ display:"flex", gap:1, background:C.border, marginBottom:1 }}>
      {tabs.map(t => <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:tab===t.id?C.s2:C.s1, border:"none", padding:"10px 20px", fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:tab===t.id?C.text:C.muted, cursor:"pointer", borderTop:`2px solid ${tab===t.id?C.accent:"transparent"}` }}>{t.label}</button>)}
    </div>

    {/* Tab content */}
    <div style={{ border:`1px solid ${C.border}`, borderTop:"none" }}>
      {tab==="skill" && <div>
        <div style={{ background:C.s1, padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>{skillFilename}</span>
          <div style={{display:"flex",gap:8}}><CopyBtn text={outputs.skill} label="Copy file"/><DlBtn content={outputs.skill} filename={pid==="claude"?"SKILL.md":skillFilename} label={pid==="claude"?"Download SKILL.md":"Download"}/></div>
        </div>
        <CodePane content={outputs.skill} lang={pid==="claude"?"SKILL.md — Claude Skill Format":pid==="openai"?"System Prompt — GPT-5.5":pid==="gemini"?"system_instruction — Gemini API":pid==="deepseek"?"XML-Tagged System Message — DeepSeek V4":"System Message"} />
        {pid==="claude" && <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderTop:"none", padding:"12px 18px" }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.muted }}>To install: zip this file as </span>
          <code style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:C.a4 }}>{kb}/SKILL.md → {kb}.skill</code>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.muted }}> · SKILL.md must sit at zip root, not inside a subfolder</span>
        </div>}
      </div>}

      {tab==="api" && outputs.apiCode && <div>
        <div style={{ background:C.s1, padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>{kb}-api-example{pid==="openai"?".json":".py"}</span>
          <div style={{display:"flex",gap:8}}><CopyBtn text={outputs.apiCode} label="Copy code"/><DlBtn content={outputs.apiCode} filename={`${kb}-api-example${pid==="openai"?".json":".py"}`} label="Download"/></div>
        </div>
        {pid==="openai" && outputs.instructions && <div style={{ background:C.s2, borderBottom:`1px solid ${C.border}`, padding:"12px 18px" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted, marginBottom:6 }}>INSTRUCTIONS PARAMETER (Responses API) — paste as the top-level "instructions" value</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:C.a4, lineHeight:1.5 }}>{outputs.instructions}</div>
        </div>}
        <CodePane content={outputs.apiCode} lang={pid==="openai"?"API JSON — OpenAI Responses API":pid==="gemini"?"Python SDK — Google GenAI":pid==="deepseek"?"Python — DeepSeek V4 API":pid==="llama"?"Python — Llama 4 via Groq":pid==="mistral"?"Python — Mistral API":"Python — Qwen 3 API"} />
      </div>}

      {tab==="readme" && <div>
        <div style={{ background:C.s1, padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>README.md</span>
          <div style={{display:"flex",gap:8}}><CopyBtn text={outputs.readme} label="Copy"/><DlBtn content={outputs.readme} filename="README.md" label="Download"/></div>
        </div>
        <CodePane content={outputs.readme} lang="README.md — Markdown" />
      </div>}
    </div>

    {/* Download all */}
    <div style={{ marginTop:24, background:C.s1, border:`1px solid ${C.border}`, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
      <div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:C.accent, marginBottom:4 }}>Download package</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.muted }}>Save all files — skill, API example, and README</div>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <DlBtn content={outputs.skill} filename={pid==="claude"?"SKILL.md":skillFilename} label={pid==="claude"?"SKILL.md":"System prompt"} />
        {outputs.apiCode && <DlBtn content={outputs.apiCode} filename={`${kb}-api-example${pid==="openai"?".json":".py"}`} label="API code" />}
        <DlBtn content={outputs.readme} filename="README.md" label="README" />
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    platform:"", model:"", thinking:"",
    name:"", purpose:"", userType:"developer",
    domainId:"", customDomain:"",
    inScope:"", outScope:"",
    format:"markdown", length:"standard", structure:"",
    tone:"", badOutput:"", required:"",
    exIn:"", exOut:"",
  });
  const [outputs, setOutputs] = useState(null);

  const merge = useCallback(p => setForm(f=>({...f,...p})), []);

  const generate = useCallback(() => {
    const result = buildOutputs(form.platform, form);
    setOutputs(result);
    setStep(5);
  }, [form]);

  const reset = () => { setStep(0); setOutputs(null); setForm({platform:"",model:"",thinking:"",name:"",purpose:"",userType:"developer",domainId:"",customDomain:"",inScope:"",outScope:"",format:"markdown",length:"standard",structure:"",tone:"",badOutput:"",required:"",exIn:"",exOut:""}); };

  return <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Mono','Courier New',monospace" }}>
    <style>{FONTS}</style>
    {/* Header */}
    <div style={{ background:C.s1, borderBottom:`1px solid ${C.border}`, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:48, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:6, height:6, background:C.accent }}/>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:C.text }}>SkillForge</span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:"0.1em", color:C.muted, textTransform:"uppercase" }}>· Universal AI Skill Builder · May 2026</span>
      </div>
      {step > 0 && step < 5 && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>{form.platform ? <span style={{color:PLATFORMS[form.platform]?.color}}>{PLATFORMS[form.platform]?.name}</span> : "Select platform above"}</div>}
    </div>
    {/* Progress */}
    {step > 0 && step < 5 && <ProgressBar step={step} />}
    {/* Content */}
    {step===0 && <StepLanding onStart={()=>setStep(1)} />}
    {step===1 && <StepPlatform form={form} merge={merge} onNext={()=>setStep(2)} />}
    {step===2 && <StepIdentity form={form} merge={merge} onNext={()=>setStep(3)} onBack={()=>setStep(1)} />}
    {step===3 && <StepDomain form={form} merge={merge} onNext={()=>setStep(4)} onBack={()=>setStep(2)} />}
    {step===4 && <StepQuality form={form} merge={merge} onGenerate={generate} onBack={()=>setStep(3)} />}
    {step===5 && outputs && <OutputView outputs={outputs} form={form} pid={form.platform} onReset={reset} />}
  </div>;
}
