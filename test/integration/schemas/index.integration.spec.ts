import {
  TCitySchema,
  TEventSchema,
  TCityScalarFieldEnumSchema,
  TEventScalarFieldEnumSchema,
  SortOrderSchema,
  QueryModeSchema,
  TransactionIsolationLevelSchema,
} from '../../../src/schemas/index'

describe('Schemas Index Integration', () => {
  describe('Re-exports from generated Zod schemas', () => {
    it('should export all schema types and enums correctly', () => {
      expect(typeof TCitySchema).toBe('object')
      expect(typeof TEventSchema).toBe('object')
      expect(typeof TCityScalarFieldEnumSchema).toBe('object')
      expect(typeof TEventScalarFieldEnumSchema).toBe('object')
      expect(typeof SortOrderSchema).toBe('object')
      expect(typeof QueryModeSchema).toBe('object')
      expect(typeof TransactionIsolationLevelSchema).toBe('object')
    })
  })
})
