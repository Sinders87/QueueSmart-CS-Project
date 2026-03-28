function validateRequired(fields, body) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `${field} is required`;
    }
  }
  return null;
}

function validateString(value, fieldName, maxLength = 255) {
  if (typeof value !== 'string') return `${fieldName} must be a string`;
  if (value.trim().length === 0) return `${fieldName} cannot be empty`;
  if (value.length > maxLength) return `${fieldName} must be ${maxLength} characters or fewer`;
  return null;
}

function validateNumber(value, fieldName, min = 1) {
  if (typeof value !== 'number' || isNaN(value)) return `${fieldName} must be a number`;
  if (value < min) return `${fieldName} must be at least ${min}`;
  return null;
}

function validateEnum(value, fieldName, allowed) {
  if (!allowed.includes(value)) return `${fieldName} must be one of: ${allowed.join(', ')}`;
  return null;
}

module.exports = { validateRequired, validateString, validateNumber, validateEnum };