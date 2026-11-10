# Contributing to WorkLog AI

Thank you for your interest in contributing to **WorkLog AI**! We welcome bug reports, feature requests, documentation improvements, and pull requests from the community.

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat others with respect and professionalism.

## Architectural Principles

Before contributing code, please review the non-negotiable architectural constraints of WorkLog AI:
1. **Offline-First:** All features must function fully without an active internet connection.
2. **Zero-Server Architecture:** Do not add dependencies on external APIs, remote cloud servers, or SaaS telemetry.
3. **Data Privacy:** User data, work descriptions, and spreadsheets must remain strictly on the local machine.
4. **Non-Destructive Excel Handling:** Excel workbook operations must preserve existing sheets, styles, formulas, and charts.

## Development Setup

### Prerequisites
* **Rust**: $\ge$ 1.80 (`rustup update stable`)
* **Node.js**: $\ge$ 20.x or 22.x LTS
* **Platform Build Tools**:
  * macOS: Xcode Command Line Tools (`xcode-select --install`)
  * Windows: Visual Studio C++ Build Tools & WebView2

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/hemanthkumar29/worklog-ai.git
cd worklog-ai

# Install frontend dependencies
cd apps/desktop
npm install

# Run backend unit and integration tests
cd src-tauri
cargo test

# Start the application in development mode
cd ..
npm run tauri dev
```

## Running Tests

Always ensure all test suites pass before submitting a pull request:

```bash
# Run frontend unit tests
cd apps/desktop
npm test

# Run TypeScript compilation and build verification
npm run build

# Run Rust backend integration tests
cd src-tauri
cargo test
```

## Submitting Pull Requests

1. **Fork** the repository and create a feature branch (`git checkout -b feature/your-feature-name`).
2. Commit your changes with clear, descriptive commit messages.
3. Ensure all tests pass (`npm test` and `cargo test`).
4. Push your branch to GitHub and open a Pull Request against `main`.
5. Provide a clear description of the problem solved, changes made, and testing verification.

## License

By contributing to WorkLog AI, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

