import HttpError from './HttpError.js'

const CLASS_CODE_PATTERN = /^TS-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeClassCode(value) {
  return normalizeText(value).toUpperCase()
}

function validateClassCode(value, { required = true } = {}) {
  const classCode = normalizeClassCode(value)

  if (!classCode && !required) return { classCode, error: null }
  if (!classCode) return { classCode, error: 'Class code is required.' }
  if (!CLASS_CODE_PATTERN.test(classCode)) {
    return {
      classCode,
      error: 'Enter a valid class code in the format TS-XXXXXX.',
    }
  }

  return { classCode, error: null }
}

function validateClassCreateInput(input = {}) {
  const name = normalizeText(input.name)
  const errors = {}

  if (!name) errors.name = 'Class name is required.'
  else if (name.length > 120) {
    errors.name = 'Class name must be 120 characters or fewer.'
  }

  return { values: { name }, errors, isValid: Object.keys(errors).length === 0 }
}

function validateClassUpdateInput(input = {}) {
  const values = {}
  const errors = {}

  if (Object.hasOwn(input, 'name')) {
    values.name = normalizeText(input.name)
    if (!values.name) errors.name = 'Class name is required.'
    else if (values.name.length > 120) {
      errors.name = 'Class name must be 120 characters or fewer.'
    }
  }

  if (Object.hasOwn(input, 'isActive')) {
    values.isActive = input.isActive
    if (typeof input.isActive !== 'boolean') {
      errors.isActive = 'Class status must be true or false.'
    }
  }

  if (!Object.keys(values).length) {
    throw new HttpError(
      400,
      'Provide a class name or status to update.',
      'EMPTY_CLASS_UPDATE',
    )
  }

  return { values, errors, isValid: Object.keys(errors).length === 0 }
}

export {
  CLASS_CODE_PATTERN,
  normalizeClassCode,
  validateClassCode,
  validateClassCreateInput,
  validateClassUpdateInput,
}
