/**
 * Export conversation utilities
 */

/**
 * Export conversation as JSON with metadata
 * @param {Array} messages - Array of messages
 * @param {Object} metadata - Conversation metadata
 * @returns {string} JSON string
 */
export function exportAsJSON(messages, metadata = {}) {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata: {
      title: metadata.title || 'Conversación sin título',
      model: metadata.model || 'auto',
      totalMessages: messages.length,
      ...metadata
    },
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      ...(msg.sources && { sources: msg.sources })
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export conversation as Markdown
 * @param {Array} messages - Array of messages
 * @param {Object} metadata - Conversation metadata
 * @returns {string} Markdown string
 */
export function exportAsMarkdown(messages, metadata = {}) {
  const title = metadata.title || 'Conversación sin título';
  const date = new Date().toLocaleString('es-MX');

  let markdown = `# ${title}\n\n`;
  markdown += `**Fecha de exportación:** ${date}\n`;
  markdown += `**Modelo:** ${metadata.model || 'auto'}\n`;
  markdown += `**Total de mensajes:** ${messages.length}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? '👤 Usuario' : '🤖 Asistente';
    markdown += `## ${role}\n\n`;
    markdown += `${msg.content}\n\n`;

    if (msg.sources && msg.sources.length > 0) {
      markdown += `**Fuentes:**\n`;
      msg.sources.forEach(source => {
        markdown += `- ${source}\n`;
      });
      markdown += `\n`;
    }

    if (index < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
}

/**
 * Export conversation as plain text
 * @param {Array} messages - Array of messages
 * @param {Object} metadata - Conversation metadata
 * @returns {string} Plain text string
 */
export function exportAsText(messages, metadata = {}) {
  const title = metadata.title || 'Conversación sin título';
  const date = new Date().toLocaleString('es-MX');

  let text = `${title}\n`;
  text += `${'='.repeat(title.length)}\n\n`;
  text += `Fecha de exportación: ${date}\n`;
  text += `Modelo: ${metadata.model || 'auto'}\n`;
  text += `Total de mensajes: ${messages.length}\n\n`;
  text += `${'='.repeat(50)}\n\n`;

  messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? 'USUARIO' : 'ASISTENTE';
    text += `[${role}]\n`;
    text += `${msg.content}\n`;

    if (msg.sources && msg.sources.length > 0) {
      text += `\nFuentes:\n`;
      msg.sources.forEach(source => {
        text += `  - ${source}\n`;
      });
    }

    if (index < messages.length - 1) {
      text += `\n${'-'.repeat(50)}\n\n`;
    }
  });

  return text;
}

/**
 * Download a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate filename with timestamp
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} Filename
 */
export function generateFilename(prefix = 'conversacion', extension = 'txt') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
}
