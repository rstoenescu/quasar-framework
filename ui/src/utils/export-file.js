function clean (link) {
  // allow time for iOS
  setTimeout(() => {
    window.URL.revokeObjectURL(link.href)
  }, 10000)
  link.remove()
}

export default function (fileName, rawData, mimeType, parentElementId) {
  const blob = new Blob([ rawData ], { type: mimeType || 'text/plain' })

  // IE11 has its own stuff...
  if (window.navigator.msSaveOrOpenBlob) {
    return window.navigator.msSaveOrOpenBlob(blob, fileName)
  }

  const link = document.createElement('a')

  link.download = fileName
  link.href = window.URL.createObjectURL(blob)

  link.classList.add('hidden')
  link.style.position = 'fixed' // avoid scrolling to bottom
  if (typeof parentElementId !== 'undefined') {
    const parentElement = document.getElementById(parentElementId)
    parentElement.appendChild(link);
  } else {
    document.body.appendChild(link)
  }

  try {
    link.click()
    clean(link)
    return true
  }
  catch (err) {
    clean(link)
    return err
  }
}
