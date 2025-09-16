// Form validation utilities

/**
 * Validates that a string is not empty
 * @param {string} value - The value to check
 * @returns {{valid: boolean, message: string}} Validation result
 */
export function required(value) {
  const valid = typeof value === 'string' && value.trim().length > 0;
  return {
    valid,
    message: valid ? '' : 'This field is required'
  };
}

/**
 * Validates minimum length of a string
 * @param {number} min - Minimum length required
 * @returns {function} Validator function
 */
export function minLength(min) {
  return (value) => {
    const valid = typeof value === 'string' && value.trim().length >= min;
    return {
      valid,
      message: valid ? '' : `Must be at least ${min} characters`
    };
  };
}

/**
 * Validates maximum length of a string
 * @param {number} max - Maximum length allowed
 * @returns {function} Validator function
 */
export function maxLength(max) {
  return (value) => {
    const valid = typeof value === 'string' && value.trim().length <= max;
    return {
      valid,
      message: valid ? '' : `Must be no more than ${max} characters`
    };
  };
}

/**
 * Validates that a string matches a pattern
 * @param {RegExp} pattern - Regular expression to match
 * @param {string} message - Error message if validation fails
 * @returns {function} Validator function
 */
export function pattern(pattern, message) {
  return (value) => {
    const valid = pattern.test(value);
    return {
      valid,
      message: valid ? '' : message
    };
  };
}

/**
 * Validates a value is within a numeric range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {function} Validator function
 */
export function range(min, max) {
  return (value) => {
    const num = Number(value);
    const valid = !isNaN(num) && num >= min && num <= max;
    return {
      valid,
      message: valid ? '' : `Must be between ${min} and ${max}`
    };
  };
}

/**
 * Combines multiple validators
 * @param {...function} validators - Validator functions to combine
 * @returns {function} Combined validator function
 */
export function compose(...validators) {
  return (value) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true, message: '' };
  };
}

/**
 * Validates an object against a schema
 * @param {Object} schema - Validation schema
 * @returns {function} Schema validator function
 */
export function validateSchema(schema) {
  return (values) => {
    const errors = {};
    for (const [field, validator] of Object.entries(schema)) {
      const result = validator(values[field]);
      if (!result.valid) {
        errors[field] = result.message;
      }
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };
}
