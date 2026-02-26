---
name: access-db
description: Execute SQL queries on MS Access databases (.accdb, .mdb).
version: 1.0.0
---

# Access Database Skill

This skill allows you to run SQL queries against local Microsoft Access database files (`.accdb`, `.mdb`).

## Dependencies

This skill requires the Microsoft Access Database Engine (ACE OLEDB Provider) installed on the host system.

1.  **Microsoft Access Database Engine**:
    - You must have the "Microsoft Access Database Engine 2010 Redistributable" or newer installed.
    - **Important**: The architecture (32-bit vs 64-bit) of your Node.js installation must match the installed Access Database Engine.
    - If you encounter "Provider cannot be found" errors, try installing the version that matches your Node.js architecture.

## Usage

Use the `db_client.cjs` script to execute SQL commands.

### Command Line Arguments

- `--db <path>`: Path to the Access database file.
- `--sql <query>`: SQL query to execute.
- `--password <password>`: (Optional) Database password.

### Examples

#### Select Data
```bash
node dist/skills/access-db/scripts/db_client.cjs --db "C:\Data\mydb.accdb" --sql "SELECT * FROM Users"
```

#### Insert Data
```bash
node dist/skills/access-db/scripts/db_client.cjs --db "C:\Data\mydb.accdb" --sql "INSERT INTO Users (Name, Email) VALUES ('John Doe', 'john@example.com')"
```

## Troubleshooting

- **"Provider cannot be found"**:
  - Verify that the Microsoft Access Database Engine is installed.
  - Check if your Node.js is 64-bit (`node -p "process.arch"`) and if you installed the 64-bit Access Database Engine. If you have 32-bit Office installed, you might be forced to use 32-bit Node.js and 32-bit Access Database Engine.

- **"Unrecognized database format"**:
  - Ensure the file is a valid `.accdb` or `.mdb` file.
  - Check if the file is corrupted or encrypted with a method not supported by the installed provider.
