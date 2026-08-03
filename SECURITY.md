# Security Policy

## Supported versions

Join UI is a documentation site and an open-code component registry. There is
no published npm package and no long-lived release branches — the deployed site
at <https://ui.join-way.com> and the `main` branch are what receive fixes.

Components installed through the shadcn CLI become source files in your own
project. Once installed they are yours: a fix here does not reach an existing
installation until you re-run the CLI or apply the change by hand.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Report it privately through either channel:

- GitHub → the repository's **Security** tab → **Report a vulnerability**
  (private advisory)
- Email <info@join-way.com>

Please include what you can: affected component or route, a description of the
issue, reproduction steps, and the impact you believe it has.

## What to expect

- Acknowledgement within **3 business days**.
- An assessment and a planned fix, or a reasoned decline, within **14 days**.
- Credit in the advisory and the release notes, unless you prefer otherwise.

Please give us a reasonable window to ship a fix before disclosing publicly.

## Scope

In scope:

- XSS, injection or prototype-pollution reachable from a registry component or
  a documentation route
- Anything in the registry pipeline that would let a crafted item execute code
  in a consumer's project or environment
- Supply-chain issues in this repository's build or dependency graph

Out of scope:

- Vulnerabilities in third-party dependencies with no exploitable path here —
  report those upstream
- Findings that require a compromised machine, a malicious browser extension,
  or physical access
- Missing hardening headers with no demonstrated impact on a fully static site
- Automated scanner output submitted without a working proof of concept
