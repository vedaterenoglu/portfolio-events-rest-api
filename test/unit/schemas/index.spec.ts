import { 
  TCitySchema, 
  TEventSchema,
  TCityScalarFieldEnumSchema,
  TEventScalarFieldEnumSchema,
  SortOrderSchema,
  QueryModeSchema,
  TransactionIsolationLevelSchema,
} from '../../../src/schemas'

describe('Schemas Index', () => {
  it('should export TCitySchema and TEventSchema correctly', () => {
    expect(TCitySchema).toBeDefined()
    expect(TEventSchema).toBeDefined()
    expect(typeof TCitySchema.parse).toBe('function')
    expect(typeof TEventSchema.parse).toBe('function')
  })

  it('should export enum schemas correctly', () => {
    expect(TCityScalarFieldEnumSchema).toBeDefined()
    expect(TEventScalarFieldEnumSchema).toBeDefined()
    expect(typeof TCityScalarFieldEnumSchema.parse).toBe('function')
    expect(typeof TEventScalarFieldEnumSchema.parse).toBe('function')
    
    // Test valid enum values
    expect(() => TCityScalarFieldEnumSchema.parse('citySlug')).not.toThrow()
    expect(() => TEventScalarFieldEnumSchema.parse('id')).not.toThrow()
  })

  it('should export utility enum schemas correctly', () => {
    expect(SortOrderSchema).toBeDefined()
    expect(QueryModeSchema).toBeDefined()
    expect(TransactionIsolationLevelSchema).toBeDefined()
    expect(typeof SortOrderSchema.parse).toBe('function')
    expect(typeof QueryModeSchema.parse).toBe('function')
    expect(typeof TransactionIsolationLevelSchema.parse).toBe('function')
    
    // Test valid enum values
    expect(() => SortOrderSchema.parse('asc')).not.toThrow()
    expect(() => QueryModeSchema.parse('default')).not.toThrow()
    expect(() => TransactionIsolationLevelSchema.parse('ReadCommitted')).not.toThrow()
  })
})
