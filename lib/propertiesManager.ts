import fs from 'fs/promises';
import path from 'path';

const PROPERTIES_PATH = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', 'Desktop', 'Atherise', 'server.properties');

export async function getProperties() {
  try {
    const content = await fs.readFile(PROPERTIES_PATH, 'utf-8');
    const lines = content.split('\n');
    const properties: Record<string, string> = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key) {
           properties[key.trim()] = values.join('=').trim();
        }
      }
    });

    return properties;
  } catch (error) {
    throw new Error('server.properties okunamadı');
  }
}

export async function saveProperties(newProps: Record<string, string>) {
  try {
    let content = await fs.readFile(PROPERTIES_PATH, 'utf-8');
    const lines = content.split('\n');
    const updatedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key] = trimmed.split('=');
        const cleanKey = key.trim();
        if (newProps[cleanKey] !== undefined) {
          return `${cleanKey}=${newProps[cleanKey]}`;
        }
      }
      return line;
    });

    // Add new keys if not present (optional, but good for robust saving)
    // For now, let's stick to updating existing lines to preserve comments/structure roughly.

    await fs.writeFile(PROPERTIES_PATH, updatedLines.join('\n'), 'utf-8');
  } catch (error) {
    throw new Error('server.properties kaydedilemedi');
  }
}
