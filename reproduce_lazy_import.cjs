
const linter = require('./hooks/scripts/linters/py.cjs');

const code = `
def f():
    import os
    print(os.getcwd())

f()
`;

const result = linter(code, 'test.py', 'write_file');
console.log(JSON.stringify(result, null, 2));
process.exit(0);
