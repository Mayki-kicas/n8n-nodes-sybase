# n8n-nodes-sybase

Sybase integration for n8n. This community node lets you connect n8n to a Sybase database and run SQL queries inside workflows.

If you are searching for **n8n Sybase connector**, **n8n Sybase node**, **Sybase SQL in n8n**, or **SAP SQL Anywhere / Sybase ASE automation**, this package is built for that use case.

npm package: `@mayki-kicas/n8n-nodes-sybase`

## What This Node Does

- Connects n8n to a Sybase database with credentials
- Executes SQL queries from a workflow node
- Returns rows as n8n JSON items
- Supports timeout control per node execution
- Supports debug logs for troubleshooting connection/query issues

## Features

- Credential: `Sybase API`
- Node: `Sybase`
- Operation: `Execute Query`
- Editable timeout in the node (default: `20000 ms`)
- Optional debug mode with detailed execution logs
- Compatible with self-hosted n8n

## Requirements

- Node.js `>=22.16` (recommended for current n8n versions)
- Java runtime on the machine running n8n (required by the `sybase` npm dependency)
- Network access from n8n to your Sybase host and port

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

This starts n8n in development mode with hot reload for your custom node.

Default URL:

- http://localhost:5678

## Build and Lint

```bash
npm run lint
npm run build
```

## How to Use in n8n

1. Add the `Sybase` node to your workflow.
2. Create credentials `Sybase API` with:
- Host
- Port
- Database
- Username
- Password
3. Select operation `Execute Query`.
4. Write your SQL in `Query`.
5. Optionally set:
- `Timeout In Ms`
- `Debug Mode`

Example query:

```sql
SELECT TOP 10 id, created_at
FROM my_table
ORDER BY created_at DESC;
```

## Troubleshooting

If execution appears stuck:

- Increase `Timeout In Ms` (for example `20000` to `60000`)
- Enable `Debug Mode`
- Check n8n server logs for lines prefixed with `[n8n-sybase]`
- Validate DB connectivity (host, port, firewall, credentials)

If n8n does not start in dev mode:

- Ensure Node.js version satisfies n8n requirements (`>=22.16`)

## FAQ

### Is this node compatible with n8n Cloud?

No. This package uses an external runtime dependency (`sybase`) and is designed for self-hosted n8n.

### Which Sybase products can I use?

It is intended for Sybase-compatible servers where the underlying npm driver works (for example Sybase ASE / SQL Anywhere environments).

### Can I use this in production?

Yes, for self-hosted n8n. Validate timeouts, network reliability, and query performance in your environment before rollout.

## Keywords

n8n sybase, n8n sybase node, n8n sybase connector, sybase automation, sybase sql workflow, sap sql anywhere n8n, sybase ase n8n, database workflow automation
