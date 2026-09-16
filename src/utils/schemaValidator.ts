import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaValidationResult, SchemaValidationError } from '../types';

let ajvInstance: Ajv | null = null;

function getAjv(): Ajv {
  if (!ajvInstance) {
    ajvInstance = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export function validateJsonAgainstSchema(
  data: any,
  schema: any
): SchemaValidationResult {
  const evaluatedAt = Date.now();

  if (!schema || typeof schema !== 'object') {
    return {
      isValid: false,
      errors: [
        {
          keyword: 'syntax',
          instancePath: '',
          schemaPath: '#',
          message: 'Invalid Schema: Schema must be a valid JSON object',
          params: {},
        },
      ],
      evaluatedAt,
    };
  }

  try {
    const ajv = getAjv();
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return {
        isValid: true,
        errors: [],
        evaluatedAt,
      };
    }

    const errors: SchemaValidationError[] = (validate.errors || []).map((err) => {
      let formattedMsg = err.message || 'Validation failed';
      if (err.keyword === 'required' && err.params?.missingProperty) {
        formattedMsg = `Missing required property: "${err.params.missingProperty}"`;
      } else if (err.keyword === 'type') {
        formattedMsg = `Expected type "${err.params?.type}"`;
      } else if (err.keyword === 'additionalProperties' && err.params?.additionalProperty) {
        formattedMsg = `Unexpected property "${err.params.additionalProperty}"`;
      }

      return {
        keyword: err.keyword,
        instancePath: err.instancePath || '/',
        schemaPath: err.schemaPath,
        message: formattedMsg,
        params: err.params || {},
      };
    });

    return {
      isValid: false,
      errors,
      evaluatedAt,
    };
  } catch (err: any) {
    return {
      isValid: false,
      errors: [
        {
          keyword: 'compilation',
          instancePath: '',
          schemaPath: '#',
          message: err?.message || 'Schema compilation failed',
          params: {},
        },
      ],
      evaluatedAt,
    };
  }
}
