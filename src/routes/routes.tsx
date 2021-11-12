const basePath =
  document.getElementsByTagName('base')?.[0]?.getAttribute('href') || '/'
export const ROOT_PATH = basePath
export const ANALYTCIS = `${ROOT_PATH}analytics`
export const UPLOAD = `${ROOT_PATH}upload`
export const PIPELINES = `${ROOT_PATH}pipelines`
export const PIPELINE = `${ROOT_PATH}pipeline`
console.log(basePath)