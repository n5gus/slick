# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within Project Slick, please do not disclose it publicly. Instead, report it to the maintainers at `security@manbearbull.capital`.

## Security Best Practices for Project Slick

### 1. Secret Management
Currently, private keys and API credentials are stored in `.env` files.
- **Critical**: Never commit `.env` files to version control.
- **Recommended**: Transition to a dedicated Secret Management service (e.g., Google Cloud Secret Manager, AWS Secrets Manager, or HashiCorp Vault).
- **Hardening**: Use environment-specific service accounts with minimal permissions (Principle of Least Privilege).

### 2. Cross-Origin Resource Sharing (CORS)
The current implementation allows all origins (`*`) for ease of development.
- **Recommended**: Restrict `allow_origins` to specific production domains (e.g., `https://slicktrader.xyz`).

### 3. Dashboard Access Control
The dashboard is currently public.
- **Recommended**: Implement an authentication layer (e.g., Auth0, NextAuth, or a simple JWT-based login) to prevent unauthorized access to live trading metrics and agent status.
- **Network Level**: Restrict backend access to known frontend IP addresses or use a VPC to isolate the backend from public traffic.

### 4. Trade Execution Security
- **Withdrawal Permissions**: Ensure the trading wallet's API keys do **not** have "Withdraw" permissions enabled. Only "Trade" and "View" permissions should be active.
- **Slippage Protection**: The `hyperliquid-operator` should enforce strict slippage and size limits to prevent execution anomalies during high volatility.

### 5. Dependency Auditing
- Regularly run `npm audit` for the frontend and `uv lock` checks for the backend to identify and patch vulnerable dependencies.
- Use GitHub’s Dependabot for automated security alerts.
