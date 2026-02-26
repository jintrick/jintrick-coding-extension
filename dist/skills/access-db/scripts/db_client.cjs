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
        args = (deps.process || global.process).argv.slice(2),
        console: _console = global.console,
        process: _process = global.process
    } = deps;

    let ADODB;
    if (adodb) {
        ADODB = adodb;
    } else {
        try {
            ADODB = require('node-adodb');
        } catch (e) {
            _console.error(JSON.stringify({
                error: "Dependency 'node-adodb' not found. This is a deployment error.",
                details: e.message
            }));
            _process.exit(1);
            return;
        }
    }

    const params = parseArgs(args);

    if (!params.db || !params.sql) {
        _console.error(JSON.stringify({
            error: "Missing required arguments. Usage: node db_client.cjs --db <path> --sql <query> [--password <password>]"
        }));
        _process.exit(1);
        return;
    }

    const connectionString = getConnectionString(params.db, params.password);

    try {
        const connection = ADODB.open(connectionString);
        const sql = params.sql.trim();
        // Check for modification queries to decide whether to use execute or query
        const isModificationQuery = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(sql);

        let result;
        if (isModificationQuery) {
            result = await connection.execute(sql);
        } else {
            result = await connection.query(sql);
        }

        _console.log(JSON.stringify(result, null, 2));

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

        _console.error(JSON.stringify(result, null, 2));
        _process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main, parseArgs, getConnectionString };
