import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { config } from '@/lib/config';

const SERVER_ROOT = config.serverRoot;

export function getSafePath(targetPath: string) {
  const resolvedPath = path.resolve(SERVER_ROOT, targetPath);
  if (!resolvedPath.startsWith(SERVER_ROOT)) {
    throw new Error('Access denied: Path is outside server directory.');
  }
  return resolvedPath;
}

export async function listFiles(dir: string = '') {
  const fullPath = getSafePath(dir);
  const items = await fs.readdir(fullPath, { withFileTypes: true });

  const files = await Promise.all(items.map(async (item) => {
    const itemPath = path.join(fullPath, item.name);
    let size = 0;
    try {
      const stats = await fs.stat(itemPath);
      size = stats.size;
    } catch { }

    return {
      name: item.name,
      isDirectory: item.isDirectory(),
      size: size,
      path: path.relative(SERVER_ROOT, itemPath).replace(/\\/g, '/')
    };
  }));

  // Sort: folders first
  files.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
    return a.isDirectory ? -1 : 1;
  });

  return files;
}

export async function readFileContent(filePath: string) {
  const fullPath = getSafePath(filePath);
  return await fs.readFile(fullPath, 'utf-8');
}

export async function saveFileContent(filePath: string, content: string) {
  const fullPath = getSafePath(filePath);
  await fs.writeFile(fullPath, content, 'utf-8');
}

export async function deleteItem(filePath: string) {
  const fullPath = getSafePath(filePath);
  await fs.rm(fullPath, { recursive: true, force: true });
}

export async function createFolder(folderPath: string) {
  const fullPath = getSafePath(folderPath);
  await fs.mkdir(fullPath, { recursive: true });
}

export async function saveFileBuffer(filePath: string, buffer: Buffer) {
  const fullPath = getSafePath(filePath);
  await fs.writeFile(fullPath, buffer);
}

export async function renameItem(oldPath: string, newPath: string) {
  const fullOld = getSafePath(oldPath);
  const fullNew = getSafePath(newPath);
  await fs.rename(fullOld, fullNew);
}

export async function extractZip(filePath: string, targetPath: string) {
  const fullZipPath = getSafePath(filePath);
  const fullTargetPath = getSafePath(targetPath);

  const zip = new AdmZip(fullZipPath);

  // Extract to a folder with the same name as the zip file (minus extension)
  const folderName = path.basename(filePath, path.extname(filePath));
  const extractPath = path.join(fullTargetPath, folderName);

  // Create the directory if it doesn't exist
  if (!fs.stat(extractPath).then(() => true).catch(() => false)) {
    await fs.mkdir(extractPath, { recursive: true });
  }

  zip.extractAllTo(extractPath, true);
}

export async function createZip(sourcePaths: string | string[], targetPath: string) {
  const fullTargetPath = getSafePath(targetPath);
  const zip = new AdmZip();

  if (Array.isArray(sourcePaths)) {
    for (const src of sourcePaths) {
      const fullSource = getSafePath(src);
      const stats = await fs.stat(fullSource);
      if (stats.isDirectory()) {
        zip.addLocalFolder(fullSource, path.basename(src));
      } else {
        zip.addLocalFile(fullSource);
      }
    }
  } else {
    const fullSource = getSafePath(sourcePaths);
    const stats = await fs.stat(fullSource);
    if (stats.isDirectory()) {
      zip.addLocalFolder(fullSource, path.basename(sourcePaths));
    } else {
      zip.addLocalFile(fullSource);
    }
  }

  await zip.writeZipPromise(fullTargetPath);
}
