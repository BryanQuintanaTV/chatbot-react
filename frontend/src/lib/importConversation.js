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
        error: 'import.invalidFormat',
        data: null
      };
    }

    // Check for required fields
    if (!data.messages || !Array.isArray(data.messages)) {
      return {
        valid: false,
        error: 'import.noMessages',
        data: null
      };
    }

    // If messages array is empty, still allow it
    if (data.messages.length === 0) {
      return {
        valid: true,
        error: null,
        data: {
          messages: [],
          metadata: data.metadata || {}
        }
      };
    }

    // Validate messages structure - be more flexible
    const validatedMessages = [];
    for (const msg of data.messages) {
      // Only require role and content
      if (!msg.role || msg.content === undefined || msg.content === null) {
        return {
          valid: false,
          error: 'import.invalidMessageFormat',
          data: null
        };
      }

      // Convert content to string if needed
      const content = typeof msg.content === 'string' ? msg.content : String(msg.content);

      // Validate role
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return {
          valid: false,
          error: 'import.invalidRole',
          data: null
        };
      }

      // Keep only essential fields, drop loading/error states
      validatedMessages.push({
        role: msg.role,
        content: content,
        timestamp: msg.timestamp || new Date().toISOString(),
        sources: msg.sources || [],
        modelUsed: msg.modelUsed || null
      });
    }

    return {
      valid: true,
      error: null,
      data: {
        messages: validatedMessages,
        metadata: data.metadata || {}
      }
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: false,
      error: 'import.processingError',
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
    console.error('JSON parse error:', error);
    return {
      valid: false,
      error: 'import.parseError',
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
      error: 'import.fileTooLarge'
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
      error: 'import.invalidFileType'
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
