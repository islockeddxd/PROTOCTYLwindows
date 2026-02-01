import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import EventEmitter from 'events';
import path from 'path';

// Global scope to prevent losing connection on Next.js hot-reload in dev
declare global {
  var __serverProcess: ChildProcessWithoutNullStreams | null;
  var __serverLogs: string[];
}

const SERVER_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', 'Desktop', 'Atherise');
const JAR_NAME = 'server.jar';
const JAVA_ARGS = [
  '-Xms10G',
  '-Xmx10G',
  '--add-modules=jdk.incubator.vector',
  '-XX:+UseG1GC',
  '-DPaper.IgnoreJavaVersion=true',
  '-XX:+ParallelRefProcEnabled',
  '-XX:MaxGCPauseMillis=200',
  '-XX:+UnlockExperimentalVMOptions',
  '-XX:+DisableExplicitGC',
  '-XX:+AlwaysPreTouch',
  '-XX:G1HeapWastePercent=5',
  '-XX:G1MixedGCCountTarget=4',
  '-XX:InitiatingHeapOccupancyPercent=15',
  '-XX:G1MixedGCLiveThresholdPercent=90',
  '-XX:G1RSetUpdatingPauseTimePercent=5',
  '-XX:SurvivorRatio=32',
  '-XX:+PerfDisableSharedMem',
  '-XX:MaxTenuringThreshold=1',
  '-Dusing.aikars.flags=https://mcflags.emc.gs',
  '-Daikars.new.flags=true',
  '-XX:G1NewSizePercent=40',
  '-XX:G1MaxNewSizePercent=50',
  '-XX:G1HeapRegionSize=16M',
  '-XX:G1ReservePercent=15',
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

    console.log('Starting server in:', SERVER_DIR);
    
    this.process = spawn('java', JAVA_ARGS, {
      cwd: SERVER_DIR,
      shell: false, // Shell false is usually safer and better for signal handling
    });

    global.__serverProcess = this.process;
    this.attachListeners(this.process);
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
