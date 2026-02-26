const path = require('path');

function parseArgs(args) {
    const params = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2);
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                params[key] = args[i + 1];
                i++;
            } else {
                params[key] = true;
            }
        }
    }
    return params;
}

function getConnectionString(dbPath, password) {
    let connStr = `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${dbPath};Persist Security Info=False;`;
    if (password) {
        connStr += `Jet OLEDB:Database Password=${password};`;
    }
    return connStr;
}

async function main(deps = {}) {
    const {
        adodb = null,
        args = process.argv.slice(2),
        console = global.console,
        process = global.process
    } = deps;

    let ADODB;
    if (adodb) {
        ADODB = adodb;
    } else {
        try {
            ADODB = require('node-adodb');
        } catch (e) {
            console.error(JSON.stringify({
                error: "Dependency 'node-adodb' not found. Please install it: npm install -g node-adodb",
                details: e.message
            }));
            process.exit(1);
            return;
        }
    }

    const params = parseArgs(args);

    if (!params.db || !params.sql) {
        console.error(JSON.stringify({
            error: "Missing required arguments. Usage: node db_client.cjs --db <path> --sql <query> [--password <password>]"
        }));
        process.exit(1);
        return;
    }

    const connectionString = getConnectionString(params.db, params.password);

    try {
        const connection = ADODB.open(connectionString);
        const sql = params.sql.trim();
        // Simple check for SELECT statement to decide whether to use query or execute
        // This might need to be more robust for complex queries (e.g. EXECUTE procedure)
        // but for basic usage it should suffice.
        const isSelect = /^\s*SELECT\b/i.test(sql);

        let result;
        if (isSelect) {
            result = await connection.query(sql);
        } else {
            result = await connection.execute(sql);
        }

        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        // node-adodb errors are often wrapped
        const errorMsg = error.process ? error.process.message : error.message;
        const result = {
            error: "Database operation failed",
            details: errorMsg
        };

        if (errorMsg && errorMsg.includes('Provider cannot be found')) {
             result.suggestion = "Microsoft Access Database Engine might be missing or architecture mismatch (32-bit vs 64-bit).";
        }

        console.error(JSON.stringify(result, null, 2));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main, parseArgs, getConnectionString };
