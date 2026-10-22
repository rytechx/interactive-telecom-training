import assert from 'node:assert/strict'
import test from 'node:test'
import { generateClassCode } from '../src/services/classService.js'
import { CLASS_CODE_PATTERN } from '../src/utils/classValidation.js'

test('class code generation produces non-sequential valid codes', () => {
  const codes = Array.from({ length: 50 }, () => generateClassCode())

  assert.equal(codes.every((code) => CLASS_CODE_PATTERN.test(code)), true)
  assert.equal(new Set(codes).size, codes.length)
})
