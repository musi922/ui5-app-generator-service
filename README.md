# Moyotech App Generator

A professional CLI tool to quickly generate SAP UI5 and CAP projects directly from your terminal.

## How to use

### 1. Install it globally (Optional)
If you want the command to be permanently available on your computer:
```bash
npm install -g moyotech-app-generator
```

### 2. Instant Usage (No installation needed)
You can also run it instantly anywhere using `npx`:

```bash
npx moyotech-app-generator MyNewApp [options]
```

### Example:
```bash
npx moyotech-app-generator my-sap-project --title "My Cool App" --scope both
```

---

## Available Options

| Option | Description | Default |
|---|---|---|
| `--title` | The title of your application | (Project Name) |
| `--namespace` | Project namespace (e.g. `com.moyo.demo`) | `com.moyo.demo` |
| `--scope` | `ui5`, `cap`, or `both` | `both` |
| `--odata` | Enable OData support (`true`/`false`) | `true` |
| `--author` | Author Name | `User` |
| `--email` | Author Email | `user@example.com` |
| `--cicd` | `github`, `azure`, or `none` | `none` |

---

## Why use Moyotech App Generator?
- **Instant Creation**: No manual setup for UI5 or CAP.
- **Local Folders**: Created exactly where you are in your terminal.
- **Production Ready**: Includes Git initialization and optional CI/CD setup.
