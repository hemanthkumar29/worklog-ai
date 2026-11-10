# Security Policy

## Supported Versions

Security updates are applied to the latest stable release of WorkLog AI.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |
| < 1.0   | No                 |

## Privacy and Offline Security Guarantees

WorkLog AI is architected from the ground up for strict local privacy:
* **Zero Network Calls:** The desktop binary does not make inbound or outbound network requests.
* **No Telemetry:** No analytics, crash reporting, tracking scripts, or beacons are embedded.
* **Local Storage:** SQLite database and automated Excel backups are stored only on the local filesystem.
* **Non-Destructive File Writes:** Excel synchronization utilizes atomic file replacement and automatic timestamped backups before modification.

## Reporting a Vulnerability

If you discover a security vulnerability in WorkLog AI, please report it responsibly:

1. **Do not open a public issue.**
2. Send an email to the project maintainers or submit a private security advisory through GitHub:
   `https://github.com/hemanthkumar29/worklog-ai/security/advisories/new`
3. Include detailed steps to reproduce the issue, environment details (OS, architecture, app version), and potential impact.

We will review reports within 48 hours and work with you on a coordinated disclosure and patch.
