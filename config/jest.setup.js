const { B } = require('bhala')

jest.mock('@common/helpers/handleError')
jest.mock('@sentry/nextjs')
jest.mock('react-hot-toast')

// eslint-disable-next-line no-console
console.debug = jest.fn()
// eslint-disable-next-line no-console
console.error = jest.fn()
B.error = jest.fn()
