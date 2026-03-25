# n8n-nodes-sybase

Custom n8n community node package to query Sybase databases.

## Included

- `Sybase` credential
- `Sybase` node
- Operation: `Execute Query`

## Requirements

- Node.js 22+
- Java runtime available on the machine running n8n (required by the `sybase` npm package)
- Network access to your Sybase server

## Install

```bash
npm install
```

## Local Development (No Docker)

```bash
npm run dev
```

This starts n8n locally with hot reload and your custom node loaded.

Open:

- http://localhost:5678

## Build

```bash
npm run build
```

## Usage in n8n

1. Create `Sybase` credentials:
   - Host
   - Port
   - Database
   - Username
   - Password
2. Add the `Sybase` node to a workflow.
3. Choose operation `Execute Query`.
4. Put SQL in `Query`.

Example:

```sql
SELECT TOP 10 id, created_at
FROM my_table
ORDER BY created_at DESC;
```

## Lint

```bash
npm run lint
```
