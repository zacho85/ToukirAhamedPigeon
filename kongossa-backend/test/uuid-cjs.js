// The uuid package is ESM-only, which Jest's CommonJS runtime cannot load.
// Tests only need v4, which Node provides natively.
const { randomUUID } = require('crypto');

module.exports = { v4: () => randomUUID() };
