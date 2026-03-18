/**
 * Schema Validator - Validates extracted data against defined schemas
 */

import type { SchemaDefinition } from './types';

interface ValidationError {
  path: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateSchema(data: any, schema: SchemaDefinition): ValidationResult {
  const errors: ValidationError[] = [];
  
  validateObject(data, schema, '', errors);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateObject(data: any, schema: SchemaDefinition, path: string, errors: ValidationError[]): void {
  if (typeof data !== 'object' || data === null) {
    errors.push({
      path,
      message: `Expected object, got ${typeof data}`,
    });
    return;
  }
  
  for (const [key, expectedType] of Object.entries(schema)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in data)) {
      errors.push({
        path: currentPath,
        message: `Missing required field: ${key}`,
      });
      continue;
    }
    
    validateValue(data[key], expectedType, currentPath, errors);
  }
}

function validateValue(value: any, expectedType: string | SchemaDefinition | SchemaDefinition[], path: string, errors: ValidationError[]): void {
  // Handle array types
  if (Array.isArray(expectedType)) {
    if (!Array.isArray(value)) {
      errors.push({
        path,
        message: `Expected array, got ${typeName(value)}`,
      });
      return;
    }
    
    if (expectedType.length > 0) {
      const itemSchema = expectedType[0];
      value.forEach((item, index) => {
        validateValue(item, itemSchema, `${path}[${index}]`, errors);
      });
    }
    return;
  }
  
  // Handle object types
  if (typeof expectedType === 'object') {
    validateObject(value, expectedType, path, errors);
    return;
  }
  
  // Handle primitive types
  const actualType = typeName(value);
  const expected = expectedType.toLowerCase();
  
  const typeMap: Record<string, string[]> = {
    string: ['string'],
    number: ['number', 'integer', 'float', 'double'],
    boolean: ['boolean', 'bool'],
    array: ['array', 'list'],
    object: ['object', 'dict'],
  };
  
  const validTypes = typeMap[expected] || [expected];
  if (!validTypes.includes(actualType)) {
    errors.push({
      path,
      message: `Expected ${expectedType}, got ${actualType}`,
    });
  }
}

function typeName(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value) && value.length > 0) return typeName(value[0]) + '[]';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export default validateSchema;
