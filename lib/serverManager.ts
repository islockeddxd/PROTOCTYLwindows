import { config } from './config';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// Global scope to prevent losing connection on Next.js hot-reload in dev
declare global {
  var __serverProcess: ChildProcessWithoutNullStreams | null;
  var __serverLogs: string[];
}

const JAR_NAME = 'server.jar';
const JAVA_ARGS = [
  '-Xms4G', // Default RAM reduced to 4G to be safe
  '-Xmx4G',
  // ... (You can keep flags or optimize later)
  '-jar',
  JAR_NAME,
  '--nogui'
];

class ServerManager extends EventEmitter {
  private process: ChildProcessWithoutNullStreams | null = global.__serverProcess || null;
  private logs: string[] = global.__serverLogs || [];

  constructor() {
    super();
    if (global.__serverProcess) {
      this.attachListeners(global.__serverProcess);
    }
  }

  start() {
    if (this.process) return;

    // Dynamic Server Root from Config (Updated by Setup Wizard)
    const serverDir = config.serverRoot;

    // Ensure directory exists or basic validations?
    // fileManager handles creation usually, but here we run.

    console.log('Starting server in:', serverDir);

    // Custom Arguments Logic (Read from start.bat if possible for RAM)
    let currentArgs = [...JAVA_ARGS];

    try {
      const startBatPath = path.join(serverDir, 'start.bat');
      if (fs.existsSync(startBatPath)) {
        const content = fs.readFileSync(startBatPath, 'utf-8');

        // Check for Xmx
        const xmxMatch = content.match(/-Xmx(\d+[GMK])/);
        if (xmxMatch) {
          // Replace default Xmx
          const idx = currentArgs.findIndex(a => a.startsWith('-Xmx'));
          if (idx !== -1) currentArgs[idx] = `-Xmx${xmxMatch[1]}`;
          else currentArgs.unshift(`-Xmx${xmxMatch[1]}`);
        }

        // Check for Xms
        const xmsMatch = content.match(/-Xms(\d+[GMK])/);
        if (xmsMatch) {
          const idx = currentArgs.findIndex(a => a.startsWith('-Xms'));
          if (idx !== -1) currentArgs[idx] = `-Xms${xmsMatch[1]}`;
          else currentArgs.unshift(`-Xms${xmsMatch[1]}`);
        }
        console.log('Loaded custom RAM settings from start.bat:', xmxMatch?.[1], xmsMatch?.[1]);
      }
    } catch (e) {
      console.error('Failed to parse start.bat for RAM settings, using defaults.', e);
    }

    console.log('Using Java Path:', config.javaPath);

    try {
      this.process = spawn(config.javaPath, currentArgs, {
        cwd: serverDir,
        shell: false,
      });

      this.process.on('error', (err: any) => {
        console.error('Failed to start server process:', err);
        this.pushLog(`[System Error] Failed to launch Java: ${err.message}`);
        if (err.code === 'ENOENT') {
          this.pushLog(`[System Error] 'java' command not found! Please install Java (JDK 17+) or set JAVA_PATH in .env`);
        }
        this.process = null;
        global.__serverProcess = null;
      });

      global.__serverProcess = this.process;
      this.attachListeners(this.process);

    } catch (e: any) {
      console.error('Spawn exception:', e);
      this.pushLog(`[System Critical] ${e.message}`);
    }
  }

  private attachListeners(proc: ChildProcessWithoutNullStreams) {
    proc.stdout.on('data', (data) => {
      const line = data.toString();
      this.pushLog(line);
    });

    proc.stderr.on('data', (data) => {
      const line = data.toString();
      this.pushLog(line);
    });

    proc.on('close', (code) => {
      this.pushLog(`[System] Server process exited with code ${code}`);
      this.process = null;
      global.__serverProcess = null;
    });
  }

  private pushLog(data: string) {
    // Keep last 100 lines only (Memory Optimization)
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
    this.logs.push(data);
    global.__serverLogs = this.logs;
  }

  stop() {
    if (this.process) {
      this.process.stdin.write("stop\n");
    }
  }

  kill() {
    if (this.process) {
      this.process.kill('SIGKILL');
      this.process = null;
      global.__serverProcess = null;
    }
  }

  sendCommand(cmd: string) {
    if (this.process) {
      this.process.stdin.write(cmd + "\n");
    }
  }

  getStatus() {
    return {
      running: !!this.process,
      logs: this.logs
    };
  }
}

export const serverManager = new ServerManager();
