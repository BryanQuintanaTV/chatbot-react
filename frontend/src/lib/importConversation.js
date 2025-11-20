/**
 * Import conversation utilities
 */

/**
 * Validate imported conversation data
 * @param {Object} data - Imported data
 * @returns {Object} { valid: boolean, error: string | null, data: Object | null }
 */
export function validateConversationData(data) {
  try {
    // Check if data is an object
    if (typeof data !== 'object' || data === null) {
      return {
        valid: false,
        error: 'El formato del archivo no es válido',
        data: null
      };
    }

    // Check for required fields
    if (!data.messages || !Array.isArray(data.messages)) {
      return {
        valid: false,
        error: 'El archivo no contiene mensajes válidos',
        data: null
      };
    }

    // Validate messages structure
    for (const msg of data.messages) {
      if (!msg.role || !msg.content) {
        return {
          valid: false,
          error: 'Los mensajes no tienen el formato correcto',
          data: null
        };
      }

      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return {
          valid: false,
          error: 'Rol de mensaje no válido',
          data: null
        };
      }
    }

    return {
      valid: true,
      error: null,
      data: {
        messages: data.messages,
        metadata: data.metadata || {}
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Error al procesar el archivo',
      data: null
    };
  }
}

/**
 * Parse JSON file
 * @param {string} content - File content
 * @returns {Object} Parsed data or error
 */
export function parseJSONFile(content) {
  try {
    const data = JSON.parse(content);
    return validateConversationData(data);
  } catch (error) {
    return {
      valid: false,
      error: 'Error al parsear el archivo JSON',
      data: null
    };
  }
}

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} File content
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

/**
 * Validate file size (max 10MB)
 * @param {File} file - File object
 * @returns {Object} { valid: boolean, error: string | null }
 */
export function validateFileSize(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande (máximo 10MB)'
    };
  }
  return { valid: true, error: null };
}

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {Object} { valid: boolean, error: string | null }
 */
export function validateFileType(file, allowedTypes = ['application/json']) {
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'Tipo de archivo no soportado (solo JSON)'
    };
  }
  return { valid: true, error: null };
}

/**
 * Generate unique ID for conversation
 * @returns {string} Unique ID
 */
export function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Process imported conversation
 * @param {File} file - File object
 * @returns {Promise<Object>} Processed conversation data
 */
export async function processImportedConversation(file) {
  // Validate file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    throw new Error(sizeValidation.error);
  }

  // Validate file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    throw new Error(typeValidation.error);
  }

  // Read file content
  const content = await readFileAsText(file);

  // Parse and validate
  const result = parseJSONFile(content);
  if (!result.valid) {
    throw new Error(result.error);
  }

  // Add unique ID to prevent conflicts
  const conversationId = generateConversationId();

  return {
    id: conversationId,
    ...result.data,
    importedAt: new Date().toISOString()
  };
}
