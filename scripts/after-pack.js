const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return

  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`)
  const iconPath = path.join(context.packager.projectDir, 'assets', 'icon.ico')
  const rceditPath = path.join(
    context.packager.projectDir,
    'node_modules',
    'electron-winstaller',
    'vendor',
    'rcedit.exe'
  )

  if (!fs.existsSync(exePath) || !fs.existsSync(iconPath) || !fs.existsSync(rceditPath)) {
    throw new Error('No se pudo aplicar el icono: faltan exe, icon.ico o rcedit.exe.')
  }

  execFileSync(rceditPath, [
    exePath,
    '--set-icon',
    iconPath
  ], { stdio: 'inherit' })
}
