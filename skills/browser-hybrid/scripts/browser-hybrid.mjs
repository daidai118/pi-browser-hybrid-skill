#!/usr/bin/env node

import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const OBSCURA_SCRIPT = process.env.HYBRID_OBSCURA_SCRIPT || resolve(HERE, '../vendor/obscura-cdp.mjs');
const CHROME_SCRIPT = process.env.HYBRID_CHROME_SCRIPT || resolve(HERE, '../vendor/chrome-cdp.mjs');

function ensureScriptExists(script, backend) {
  if (!existsSync(script)) {
    throw new Error(`${backend} backend script not found: ${script}`);
  }
}

function runBackend(backend, args, { allowFailure = false } = {}) {
  const script = backend === 'obscura' ? OBSCURA_SCRIPT : CHROME_SCRIPT;
  ensureScriptExists(script, backend);

  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error) throw result.error;
  const stdout = (result.stdout || '').trimEnd();
  const stderr = (result.stderr || '').trimEnd();
  const output = [stdout, stderr].filter(Boolean).join(stdout && stderr ? '\n' : '');

  if ((result.status ?? 1) !== 0 && !allowFailure) {
    let message = output || `${backend} backend failed with exit code ${result.status}`;
    if (backend === 'chrome') {
      message += '\nHint: enable Chrome remote debugging at chrome://inspect/#remote-debugging if hybrid fallback selected Chrome.';
    }
    throw new Error(message);
  }

  return { status: result.status ?? 0, stdout, stderr, output };
}

function parseJson(text) {
  return JSON.parse(text);
}

function parseHybridTarget(token) {
  const index = String(token || '').indexOf(':');
  if (index <= 0) throw new Error(`Hybrid target must look like "obscura:page-1" or "chrome:ABC12345", got: ${token}`);
  const backend = token.slice(0, index);
  const target = token.slice(index + 1);
  if (!['obscura', 'chrome'].includes(backend) || !target) {
    throw new Error(`Invalid hybrid target: ${token}`);
  }
  return { backend, target };
}

function prefixList(backend, output) {
  if (!output.trim()) return '';
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.replace(/^(\S+)/, `${backend}:$1`))
    .join('\n');
}

function parseOpenTarget(backend, output) {
  if (backend === 'obscura') {
    const match = output.match(/^Opened\s+(\S+)\s{2,}/m);
    if (!match) throw new Error(`Could not parse obscura open output:\n${output}`);
    return match[1];
  }
  const match = output.match(/^Opened new tab:\s+(\S+)\s+/m);
  if (!match) throw new Error(`Could not parse chrome open output:\n${output}`);
  return match[1];
}

function formatHybridCheck(report) {
  const lines = [
    `Hybrid probe: ${report.snapshot?.href || '(unknown url)'}`,
    `status: ${report.status}`,
    `recommended engine: ${report.recommendedEngine}`,
    `score: ${report.score}/100`,
  ];

  if (report.issues?.length) {
    lines.push('issues:');
    for (const issue of report.issues) lines.push(`- [${issue.severity}] ${issue.message}`);
  } else {
    lines.push('issues: none');
  }

  return lines.join('\n');
}

function formatHybridWhy(url, report) {
  const lines = [
    `Hybrid reasoning for: ${url}`,
    `chosen engine: ${report.recommendedEngine}`,
    `status: ${report.status}`,
    `risk level: ${report.riskLevel || 'unknown'}`,
    `score: ${report.score}/100`,
  ];

  if (report.decision?.primaryReason) {
    lines.push(`primary reason: ${report.decision.primaryReason}`);
  }

  if (report.issueCounts) {
    lines.push(`issues: ${report.issueCounts.total} total (${report.issueCounts.errors} errors, ${report.issueCounts.warnings} warnings)`);
  }

  if (report.reasons?.length) {
    lines.push('detailed reasons:');
    for (const reason of report.reasons) lines.push(`- ${reason}`);
  } else {
    lines.push('detailed reasons: none');
  }

  return lines.join('\n');
}

function runHybridProbe(url) {
  const result = runBackend('obscura', ['check', '--json', url]);
  return parseJson(result.stdout || result.output);
}

function routeFillToChrome(target, selector, text) {
  const expression = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { ok: false, error: 'Element not found: ' + ${JSON.stringify(selector)} };
    if (!('value' in element)) return { ok: false, error: 'Element is not fillable: ' + element.tagName };
    element.focus();
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
    if (setter) setter.call(element, ${JSON.stringify(text)});
    else element.value = ${JSON.stringify(text)};
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, tag: element.tagName, length: String(element.value).length };
  })()`;
  const result = runBackend('chrome', ['eval', target, expression]);
  const parsed = parseJson(result.stdout || result.output);
  if (!parsed.ok) throw new Error(parsed.error);
  return `Filled <${parsed.tag}> with ${parsed.length} characters`;
}

function routeMdToChrome(target) {
  const expression = `document.body?.innerText || ''`;
  return runBackend('chrome', ['eval', target, expression]).output;
}

const USAGE = `browser-hybrid - Obscura-first browser wrapper with Chrome fallback

Usage: browser-hybrid <command> [args]

Hybrid commands
  check [--json] <url>          Probe the site with Obscura heuristics
  why   [--json] <url>          Explain why hybrid would choose obscura or chrome
  engine <url>                  Print only the recommended engine (obscura|chrome)
  open <url>                    Probe first, then open with obscura or chrome
  list                          List both obscura and chrome targets with prefixed ids
  status                        Show backend script paths and quick status

Target-routed commands
  eval   <hybrid-target> <expr>
  html   <hybrid-target> [selector]
  md     <hybrid-target>        Obscura md; Chrome falls back to body innerText
  nav    <hybrid-target> <url>
  click  <hybrid-target> <selector>
  fill   <hybrid-target> <selector> <text>
  type   <hybrid-target> <text>
  loadall <hybrid-target> <selector> [ms]
  net    <hybrid-target>
  evalraw <hybrid-target> <method> [json]
  close  <hybrid-target>        Obscura only

Backend pass-through
  obscura <args...>             Call vendor obscura backend directly
  chrome  <args...>             Call vendor chrome backend directly
`;

function print(output) {
  if (output) console.log(output);
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    print(USAGE);
    return;
  }

  if (command === 'obscura' || command === 'chrome') {
    print(runBackend(command, args).output);
    return;
  }

  if (command === 'status') {
    const obscuraStatus = runBackend('obscura', ['status'], { allowFailure: true });
    const chromeList = runBackend('chrome', ['list'], { allowFailure: true });
    print([
      `obscura-script: ${OBSCURA_SCRIPT}`,
      `chrome-script: ${CHROME_SCRIPT}`,
      `obscura-backend: ${obscuraStatus.status === 0 ? 'ok' : 'error'}`,
      obscuraStatus.output ? `obscura-details:\n${obscuraStatus.output}` : '',
      `chrome-backend: ${chromeList.status === 0 ? 'ok' : 'error'}`,
      chromeList.status === 0 ? '' : `chrome-details:\n${chromeList.output}`,
    ].filter(Boolean).join('\n'));
    return;
  }

  if (command === 'check') {
    const jsonMode = args[0] === '--json';
    const url = jsonMode ? args[1] : args[0];
    if (!url) throw new Error('Usage: check [--json] <url>');
    const report = runHybridProbe(url);
    print(jsonMode ? JSON.stringify(report, null, 2) : formatHybridCheck(report));
    return;
  }

  if (command === 'why') {
    const jsonMode = args[0] === '--json';
    const url = jsonMode ? args[1] : args[0];
    if (!url) throw new Error('Usage: why [--json] <url>');
    const report = runHybridProbe(url);
    print(jsonMode ? JSON.stringify({ url, ...report }, null, 2) : formatHybridWhy(url, report));
    return;
  }

  if (command === 'engine') {
    if (!args[0]) throw new Error('Usage: engine <url>');
    print(runHybridProbe(args[0]).recommendedEngine);
    return;
  }

  if (command === 'open') {
    const url = args[0] || 'https://example.com';
    const report = runHybridProbe(url);
    const backend = report.recommendedEngine;
    try {
      const openResult = runBackend(backend, ['open', url]);
      const target = parseOpenTarget(backend, openResult.output);
      const header = backend === 'obscura'
        ? `Hybrid chose Obscura for ${url}`
        : `Hybrid chose Chrome fallback for ${url}`;
      const reasons = report.reasons?.length ? `\nreason:\n- ${report.reasons.join('\n- ')}` : '';
      print(`${header}${reasons}\nOpened ${backend}:${target}  ${url}`);
      return;
    } catch (error) {
      throw new Error(`Hybrid chose ${backend} for ${url} but open failed.\n${error.message}`);
    }
  }

  if (command === 'list') {
    const obscura = runBackend('obscura', ['list'], { allowFailure: true });
    const chrome = runBackend('chrome', ['list'], { allowFailure: true });
    const lines = ['Obscura:'];
    lines.push(obscura.status === 0 ? (prefixList('obscura', obscura.output) || '(none)') : `(error) ${obscura.output || 'backend unavailable'}`);
    lines.push('', 'Chrome:');
    lines.push(chrome.status === 0 ? (prefixList('chrome', chrome.output) || '(none)') : `(error) ${chrome.output || 'backend unavailable'}`);
    print(lines.join('\n'));
    return;
  }

  const routedCommands = new Set(['eval', 'html', 'md', 'nav', 'click', 'fill', 'type', 'loadall', 'net', 'evalraw', 'close']);
  if (!routedCommands.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  if (!args[0]) throw new Error(`${command} requires a hybrid target.`);
  const { backend, target } = parseHybridTarget(args[0]);
  const rest = args.slice(1);

  if (command === 'close' && backend === 'chrome') {
    throw new Error('close is only supported for obscura targets. For chrome targets, close the tab manually in Chrome.');
  }
  if (command === 'fill' && backend === 'chrome') {
    if (!rest[0] || rest.length < 2) throw new Error('Usage: fill <hybrid-target> <selector> <text>');
    print(routeFillToChrome(target, rest[0], rest.slice(1).join(' ')));
    return;
  }
  if (command === 'md' && backend === 'chrome') {
    print(routeMdToChrome(target));
    return;
  }

  const backendArgs = [command, target, ...rest];
  print(runBackend(backend, backendArgs).output);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
