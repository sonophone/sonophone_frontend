// eslint-disable-next-line @typescript-eslint/no-var-requires
const omitDeep = require('omit-deep')

const omit = (object: any, name: string) => {
  return omitDeep(object, name)
}

export default omit
