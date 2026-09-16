import { SchemaGeneratorOptions } from '../types';

export function generateJsonSchema(
  data: any,
  options: SchemaGeneratorOptions = {
    includeRequired: true,
    detectFormats: true,
    detectEnums: true,
    schemaDraft: 'draft-07',
    title: 'GeneratedSchema',
    description: 'Schema generated automatically by JSON Toolkit',
  }
): Record<string, any> {
  const schemaDraftUrl =
    options.schemaDraft === '2020-12'
      ? 'https://json-schema.org/draft/2020-12/schema'
      : 'http://json-schema.org/draft-07/schema#';

  const rootSchema: Record<string, any> = {
    $schema: schemaDraftUrl,
    title: options.title || 'RootSchema',
    description: options.description || 'Inferred JSON Schema specification',
    ...inferNodeSchema(data, options),
  };

  return rootSchema;
}

function inferNodeSchema(value: any, options: SchemaGeneratorOptions): Record<string, any> {
  if (value === null) {
    return { type: 'null' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { type: 'integer' }
      : { type: 'number' };
  }

  if (typeof value === 'string') {
    const node: Record<string, any> = { type: 'string' };

    if (options.detectFormats) {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)) {
        node.format = 'date-time';
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        node.format = 'date';
      } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        node.format = 'email';
      } else if (/^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)) {
        node.format = 'uri';
      } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        node.format = 'uuid';
      } else if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)) {
        node.format = 'ipv4';
      }
    }

    return node;
  }

  if (Array.isArray(value)) {
    const node: Record<string, any> = {
      type: 'array',
    };

    if (value.length === 0) {
      node.items = {};
      return node;
    }

    // Inspect items to find common item schema
    const itemSchemas = value.map((item) => inferNodeSchema(item, options));
    
    // Check if items are primitive strings with a small set of unique values -> enum
    if (
      options.detectEnums &&
      value.length >= 2 &&
      value.every((v) => typeof v === 'string')
    ) {
      const unique = Array.from(new Set(value));
      if (unique.length <= 6 && unique.length < value.length) {
        node.items = {
          type: 'string',
          enum: unique,
        };
        return node;
      }
    }

    // Merge object properties if array of objects
    const allObjects = value.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item));
    if (allObjects && value.length > 0) {
      const mergedProperties: Record<string, any> = {};
      const propertyOccurrences: Record<string, number> = {};

      value.forEach((obj) => {
        Object.keys(obj).forEach((key) => {
          propertyOccurrences[key] = (propertyOccurrences[key] || 0) + 1;
          if (!mergedProperties[key]) {
            mergedProperties[key] = inferNodeSchema(obj[key], options);
          }
        });
      });

      const requiredKeys = Object.keys(propertyOccurrences).filter(
        (key) => propertyOccurrences[key] === value.length
      );

      const itemsObj: Record<string, any> = {
        type: 'object',
        properties: mergedProperties,
      };

      if (options.includeRequired && requiredKeys.length > 0) {
        itemsObj.required = requiredKeys;
      }

      node.items = itemsObj;
      return node;
    }

    // Default: use the first item's schema or anyOf if different types
    const types = new Set(itemSchemas.map((s) => s.type));
    if (types.size === 1) {
      node.items = itemSchemas[0];
    } else {
      node.items = {
        anyOf: Array.from(new Set(itemSchemas.map((s) => JSON.stringify(s)))).map((str) => JSON.parse(str)),
      };
    }

    return node;
  }

  if (typeof value === 'object') {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const key of Object.keys(value)) {
      properties[key] = inferNodeSchema(value[key], options);
      if (options.includeRequired) {
        required.push(key);
      }
    }

    const node: Record<string, any> = {
      type: 'object',
      properties,
    };

    if (required.length > 0 && options.includeRequired) {
      node.required = required;
    }

    return node;
  }

  return {};
}
