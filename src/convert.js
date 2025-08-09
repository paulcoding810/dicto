// https://github.com/FoxRefire/ChromeXPIPorter/blob/main/patchExt.js

import packageData from '../package.json' with { type: 'json' }
import manifest from './manifest.js'

const isDev = process.env.NODE_ENV === 'development'

export async function patchManifest() {
  const newExtId = `${packageData.name}${isDev ? '-dev' : ''}@${packageData.author.replaceAll(' ', '')}.com`

  if (!manifest.background) {
    manifest.background = {
      scripts: [],
    }
  }
  if (manifest.background?.service_worker) {
    manifest.background.scripts = [manifest.background.service_worker]
    delete manifest.background.service_worker
  }
  manifest.background.scripts.push('uninstallHandler.js')

  if (manifest.permissions?.includes('sidePanel')) {
    manifest.permissions = manifest.permissions.filter((permission) => permission !== 'sidePanel')
  }

  if (manifest.side_panel) {
    manifest['sidebar_action'] = {
      default_title: manifest.name,
      default_panel: manifest.side_panel.default_path,
      default_icon: manifest.icons[16],
    }
    delete manifest.side_panel
  }
  manifest.browser_specific_settings = {
    gecko: {
      id: newExtId,
    },
  }

  if (manifest.web_accessible_resources) {
    manifest.web_accessible_resources.forEach((res) => {
      if (res.extension_ids) res.extension_ids = [newExtId]
    })
  }

  return manifest
}
