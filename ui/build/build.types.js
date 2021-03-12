const
  fs = require('fs'),
  path = require('path')

const
  { logError, writeFile } = require('./build.utils'),
  typeRoot = path.resolve(__dirname, '../types'),
  distRoot = path.resolve(__dirname, '../dist/types'),
  resolvePath = file => path.resolve(distRoot, file),
  extraInterfaces = {},
  // eslint-disable-next-line no-useless-escape
  toCamelCase = str => str.replace(/(-\w)/g, m => m[1].toUpperCase())

function writeLine (fileContent, line = '', indent = 0) {
  fileContent.push(`${line.padStart(line.length + (indent * 4), ' ')}\n`)
}

function writeLines (fileContent, lines = '', indent = 0) {
  lines.split('\n').forEach(line => writeLine(fileContent, line, indent))
}

function write (fileContent, text = '') {
  fileContent.push(`${text}`)
}

const typeMap = new Map([
  ['Any', 'any'],
  ['Component', 'Vue'],
  ['String', 'string'],
  ['Boolean', 'boolean'],
  ['Number', 'number']
])

const fallbackComplexTypeMap = new Map([
  ['Array', 'any[]'],
  ['Object', 'LooseDictionary']
])

const dontNarrowValues = [
  '(Boolean) true',
  '(Boolean) false',
  '(CSS selector)',
  '(DOM Element)'
]

// eslint-disable-next-line
let typeErrorCount = 0

function convertTypeVal (key, type, def, required) {
  const t = type.trim()

  if (def.values && t === 'String') {
    const narrowedValues = def.values.filter(v =>
      !dontNarrowValues.includes(v) &&
      typeof v === 'string'
    ).map(v => `'${v}'`)

    if (narrowedValues.length) {
      return narrowedValues.join(' | ')
    }
  }

  if (typeMap.has(t)) {
    return typeMap.get(t)
  }

  if (fallbackComplexTypeMap.has(t)) {
    if (def.definition) {
      const propDefinitions = getPropDefinitions(def.definition, required, true)
      const lines = []
      propDefinitions.forEach(p => lines.push(...p.split('\n')))
      return propDefinitions && propDefinitions.length > 0 ? `{\n        ${lines.join('\n        ')} }${t === 'Array' ? '[]' : ''}` : fallbackComplexTypeMap.get(t)
    }
    // uncomment to find additonal typings that probably should not be 'any[]' or `LooseDefinition`
    // console.error(`(${++typeErrorCount}) warning: '${key}' missing 'tsType' for complex "type": "${t}"...`)

    return fallbackComplexTypeMap.get(t)
  }

  return t
}

function getTypeVal (key, def, required) {
  if (def.tsType !== void 0) {
    return Array.isArray(def.tsType)
      ? def.tsType.map(type => type).join(' | ')
      : def.tsType
  }

  return Array.isArray(def.type)
    ? def.type.map(type => convertTypeVal(key, type, def, required)).join(' | ')
    : convertTypeVal(key, def.type, def, required)
}

function getPropDefinition (key, propDef, required, docs = false, isMethodParam = false) {
  const propName = toCamelCase(key)

  if (propName.startsWith('...')) {
    return isMethodParam ? `${propName}: any[]` : '[index: string]: any'
  }
  else {
    const propType = getTypeVal(key, propDef, required)
    addToExtraInterfaces(propDef)
    return `${docs ? `/**\n * ${propDef.desc}\n */\n` : ''}${propName}${!propDef.required && !required ? '?' : ''} : ${propType}`
  }
}

function getPropDefinitions (propDefs, required, docs = false, areMethodParams = false) {
  const defs = []

  for (const key in propDefs) {
    const def = getPropDefinition(key, propDefs[key], required, docs, areMethodParams)
    def && defs.push(def)
  }

  return defs
}

function getMethodDefinition (key, methodDef, required) {
  let def = `/**\n * ${methodDef.desc}\n`
  if (methodDef.params) {
    def += `${Object.entries(methodDef.params).map(([name, paramDef]) => ` * @param ${name} ${paramDef.desc}`).join('\n')}\n`
  }

  const returns = methodDef.returns
  if (returns) {
    def += ` * @returns ${returns.desc}\n`
  }

  def += ` */\n${key}`

  if (methodDef.tsType !== void 0) {
    def += `: ${methodDef.tsType}`
    addToExtraInterfaces(methodDef)
  }
  else {
    def += ' ('

    if (methodDef.params) {
      // TODO: Verify if this should be optional even for plugins
      const params = getPropDefinitions(methodDef.params, false, false, true)
      def += params.join(', ')
    }

    def += `): ${returns ? getTypeVal(key, returns, required) : 'void'}`
    addToExtraInterfaces(returns, true)
  }

  return def
}

function getObjectParamDefinition (def, required) {
  const res = []

  Object.keys(def).forEach(propName => {
    const propDef = def[propName]
    if (propDef.type && propDef.type === 'Function') {
      res.push(
        getMethodDefinition(propName, propDef, required)
      )
    }
    else {
      res.push(
        getPropDefinition(propName, propDef, required, true)
      )
    }
  })

  return res
}

function getInjectionDefinition (injectionName, typeDef) {
  // Get property injection point
  for (var propKey in typeDef.props) {
    const propDef = typeDef.props[propKey]
    if (propDef.tsInjectionPoint) {
      return getPropDefinition(injectionName, propDef, true, true)
    }
  }

  // Get method injection point
  for (var methodKey in typeDef.methods) {
    const methodDef = typeDef.methods[methodKey]
    if (methodDef.tsInjectionPoint) {
      return getMethodDefinition(injectionName, methodDef, true)
    }
  }
}

function copyPredefinedTypes (dir, parentDir) {
  fs.readdirSync(dir)
    .filter(file => path.basename(file).startsWith('.') !== true)
    .forEach(file => {
      const fullPath = path.resolve(dir, file)
      const stats = fs.lstatSync(fullPath)
      if (stats.isFile()) {
        writeFile(
          resolvePath(parentDir ? parentDir + file : file),
          fs.readFileSync(fullPath)
        )
      }
      else if (stats.isDirectory()) {
        const p = resolvePath(parentDir ? parentDir + file : file)
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p)
        }
        copyPredefinedTypes(fullPath, parentDir ? parentDir + file : file + '/')
      }
    })
}

function addToExtraInterfaces (def, required) {
  if (def !== null && def !== void 0 && def.tsType !== void 0) {
    // When a type name is found and it has a definition,
    //  it's added for later usage if a previous definition isn't already there.
    // When the new interface doesn't have a definition, we initialize its key anyway
    //  to mark its existence, but with an undefined value.
    // In this way it can be overwritten if a definition is found later on.
    // Interfaces without definition at the end of the build script
    //  are considered external custom types and imported as such
    if (
      extraInterfaces[def.tsType] === void 0 &&
      def.definition !== void 0
    ) {
      extraInterfaces[def.tsType] = getObjectParamDefinition(
        def.definition, required
      )
    }
    else if (Array.isArray(def.tsType)) {
      def.tsType.forEach(type => {
        // eslint-disable-next-line no-prototype-builtins
        if (!extraInterfaces.hasOwnProperty(type)) {
          extraInterfaces[type] = void 0
        }
      })
    }
    // eslint-disable-next-line no-prototype-builtins
    else if (!extraInterfaces.hasOwnProperty(def.tsType)) {
      extraInterfaces[def.tsType] = void 0
    }
  }
}

function writeQuasarPluginProps (contents, nameName, props, isLast) {
  writeLine(contents, `${nameName}: {`, 1)
  props.forEach(prop => writeLines(contents, prop, 2))
  writeLine(contents, `}${isLast ? '' : ','}`, 1)
}

function addQuasarPluginOptions (contents, components, directives, plugins) {
  writeLine(contents, `import { GlobalQuasarLanguage, GlobalQuasarIconSet } from './globals'`)
  writeLine(contents, `export interface QuasarPluginOptions {`)
  writeLine(contents, `lang: GlobalQuasarLanguage,`, 1)
  writeLine(contents, `config: any,`, 1)
  writeLine(contents, `iconSet: GlobalQuasarIconSet,`, 1)
  writeQuasarPluginProps(contents, 'components', components)
  writeQuasarPluginProps(contents, 'directives', directives)
  writeQuasarPluginProps(contents, 'plugins', plugins, true)
  writeLine(contents, `}`)
  writeLine(contents)
}

function addQuasarLangCodes (contents) {
  // We are able to read this file only because
  //  it's been generated before type generation take place
  const langJson = require('../lang/index.json')

  // Assure we are doing a module augmentation instead of a module overwrite
  writeLine(contents, `import './lang'`)
  writeLine(contents, `declare module './lang' {`)
  writeLine(contents, `export interface QuasarLanguageCodesHolder {`, 2)
  langJson.forEach(({ isoName }) => writeLine(contents, `'${isoName}': true`, 3))
  writeLine(contents, `}`, 2)
  writeLine(contents, `}`)
}

function writeIndexDTS (apis) {
  var contents = []
  var quasarTypeContents = []
  var components = []
  var directives = []
  var plugins = []

  addQuasarLangCodes(quasarTypeContents)

  // This line must be BEFORE ANY TS INSTRUCTION,
  //  or it won't be interpreted as a TS compiler directive
  //  but as a normal comment
  // On Vue CLI projects `@quasar/app` isn't available,
  //  we ignore the "missing package" error because it's the intended behaviour
  writeLine(contents, `// @ts-ignore`)
  writeLine(contents, `/// <reference types="@quasar/app" />`)
  writeLine(contents, `import Vue, { VueConstructor, PluginObject } from 'vue'`)
  writeLine(contents, `import { LooseDictionary } from './ts-helpers'`)
  writeLine(contents)
  writeLine(quasarTypeContents, 'export as namespace quasar')
  // We expose `ts-helpers` because they are needed by `@quasar/app` augmentations
  writeLine(quasarTypeContents, `export * from './ts-helpers'`)
  writeLine(quasarTypeContents, `export * from './utils'`)
  writeLine(quasarTypeContents, `export * from './feature-flag'`)
  writeLine(quasarTypeContents, `export * from './globals'`)
  writeLine(quasarTypeContents, `export * from './extras'`)
  writeLine(quasarTypeContents, `export * from './lang'`)
  writeLine(quasarTypeContents, `export * from './api'`)

  const injections = {}

  apis.forEach(data => {
    const content = data.api
    const typeName = data.name

    const extendsVue = (content.type === 'component' || content.type === 'mixin')
    const typeValue = `${extendsVue ? `VueConstructor<${typeName}>` : typeName}`
    // Add Type to the appropriate section of types
    const propTypeDef = `${typeName}?: ${typeValue}`
    if (content.type === 'component') {
      write(components, propTypeDef)
    }
    else if (content.type === 'directive') {
      write(directives, propTypeDef)
    }
    else if (content.type === 'plugin') {
      write(plugins, propTypeDef)
    }

    // Declare class
    writeLine(quasarTypeContents, `export const ${typeName}: ${extendsVue ? `VueConstructor<${typeName}>` : typeName}`)
    writeLine(contents, `export interface ${typeName} ${extendsVue ? 'extends Vue ' : ''}{`)

    // Write Props
    const props = getPropDefinitions(content.props, content.type === 'plugin', true)
    props.forEach(prop => writeLines(contents, prop, 1))

    // Write Methods
    for (const methodKey in content.methods) {
      const method = content.methods[methodKey]
      const methodDefinition = getMethodDefinition(methodKey, method, content.type === 'plugin')
      writeLines(contents, methodDefinition, 1)
    }

    // Close class declaration
    writeLine(contents, '}')
    writeLine(contents)

    // Copy Injections for type declaration
    if (content.type === 'plugin') {
      if (content.injection) {
        const injectionParts = content.injection.split('.')
        if (!injections[injectionParts[0]]) {
          injections[injectionParts[0]] = []
        }
        let def = getInjectionDefinition(injectionParts[1], content)
        if (!def) {
          def = `${injectionParts[1]}: ${typeName}`
        }
        injections[injectionParts[0]].push(def)
      }
    }
  })

  const importName = []
  Object.keys(extraInterfaces).forEach(name => {
    if (extraInterfaces[name] === void 0) {
      // If we find the symbol as part of the generated Quasar API,
      // we don't need to import it from custom TS API patches
      if (apis.some(definition => definition.name === name)) {
        return
      }

      importName.push(name)
    }
    else {
      writeLine(contents, `export interface ${name} {`)
      extraInterfaces[name].forEach(def => {
        writeLines(contents, def, 1)
      })
      writeLine(contents, '}\n')
    }
  })

  if (importName.length > 0) {
    writeLine(contents, `import { ${importName.join(', ')} } from './api'`)
  }

  // Write injection types
  for (const key in injections) {
    const injectionDefs = injections[key]
    if (injectionDefs) {
      const injectionName = `${key.toUpperCase().replace('$', '')}VueGlobals`
      writeLine(contents, `import { ${injectionName} } from "./globals";`)
      writeLine(contents, 'declare module "./globals" {')
      writeLine(contents, `export interface ${injectionName} {`)
      for (const defKey in injectionDefs) {
        writeLines(contents, injectionDefs[defKey], 1)
      }
      writeLine(contents, '}')
      writeLine(contents, '}')
    }
  }

  writeLine(contents)

  // Extend Vue instance with injections
  if (injections) {
    writeLine(contents, `declare module 'vue/types/vue' {`)
    writeLine(contents, 'interface Vue {', 1)

    for (const key3 in injections) {
      writeLine(contents, `${key3}: ${key3.toUpperCase().replace('$', '')}VueGlobals`, 2)
    }
    writeLine(contents, '}', 1)
    writeLine(contents, '}')
  }

  addQuasarPluginOptions(contents, components, directives, plugins)

  quasarTypeContents.forEach(line => write(contents, line))

  writeLine(contents, `export const Quasar: PluginObject<Partial<QuasarPluginOptions>>`)
  writeLine(contents, `export default Quasar`)
  writeLine(contents)

  // These imports force TS compiler to evaluate contained declarations
  //  which by defaults would be ignored because inside node_modules
  //  and not directly referenced by any file
  writeLine(contents, `import './vue'`)
  writeLine(contents, `import './shim-icon-set'`)

  writeFile(resolvePath('index.d.ts'), contents.join(''))
}

module.exports.generate = function (data) {
  const apis = data.plugins
    .concat(data.directives)
    .concat(data.components)

  try {
    copyPredefinedTypes(typeRoot)
    writeIndexDTS(apis)
  }
  catch (err) {
    logError('build.types.js: something went wrong...')
    console.log()
    console.error(err)
    console.log()
    process.exit(1)
  }
}
