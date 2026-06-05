const assert = require('assert/strict')

function validateIpcHandler() {
  const electronPath = require.resolve('electron')
  const originalElectron = require.cache[electronPath]
  const originalConsoleError = console.error
  const handled = []
  console.error = () => {}

  require.cache[electronPath] = {
    exports: {
      ipcMain: {
        handle: (channel, callback) => handled.push({ channel, callback })
      }
    }
  }

  const registerHandlerPath = require.resolve('../../main/ipc/registerHandler')
  delete require.cache[registerHandlerPath]
  const { registerHandler } = require('../../main/ipc/registerHandler')

  registerHandler(
    'test:ok',
    (event, value) => ({ success: true, value }),
    { success: false },
    'Error test:'
  )

  assert.equal(handled.length, 1)
  assert.equal(handled[0].channel, 'test:ok')

  return Promise.resolve()
    .then(() => handled[0].callback({}, 7))
    .then(result => {
      assert.deepEqual(result, { success: true, value: 7 })

      registerHandler(
        'test:error',
        () => {
          throw new Error('boom')
        },
        { success: false },
        'Error test:'
      )

      return handled[1].callback({})
    })
    .then(result => {
      assert.deepEqual(result, { success: false })
    })
    .finally(() => {
      console.error = originalConsoleError
      delete require.cache[registerHandlerPath]
      if (originalElectron) {
        require.cache[electronPath] = originalElectron
      } else {
        delete require.cache[electronPath]
      }
    })
}

module.exports = {
  validateIpcHandler
}
