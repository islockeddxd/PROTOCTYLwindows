'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface ConsoleProps {
  logs: string[];
  onCommand: (cmd: string) => void;
}

export default function Console({ logs, onCommand }: ConsoleProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize Terminal
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Consolas, monospace',
      fontSize: 14,
      allowTransparency: true,
      theme: {
        background: '#09090b',
        foreground: '#d4d4d8',
        cursor: '#7c3aed', // Primary purple
        selectionBackground: '#7c3aed4d',
      },
      convertEol: true, // Auto convert \n to \r\n
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    
    // Initial fit with delay to ensure DOM is ready
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Fit failed initially', e);
      }
    }, 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    let commandBuffer = '';

    term.onData(data => {
      // Enter key
      if (data === '\r') {
        term.write('\r\n');
        if (commandBuffer.trim()) {
          onCommand(commandBuffer.trim());
        }
        commandBuffer = '';
        term.write('\x1b[35m➜\x1b[0m '); // Purple prompt
      } else if (data === '\u007F') { // Backspace
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1);
          term.write('\b \b');
        }
      } else {
        commandBuffer += data;
        term.write(data);
      }
    });

    term.write('\x1b[35m➜\x1b[0m Hazır. Loglar bekleniyor...\r\n\x1b[35m➜\x1b[0m ');

    // Robust Resize Handling
    const resizeObserver = new ResizeObserver(() => {
        try {
            fitAddon.fit();
        } catch (e) {
            // Ignore resize errors if element is hidden
        }
    });
    
    resizeObserver.observe(terminalRef.current);

    // Window resize fallback
    const handleResize = () => {
        try {
            fitAddon.fit();
        } catch (e) {}
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      term.dispose();
      xtermRef.current = null;
    };
  }, []); // Only run once on mount

  // Update logs
  useEffect(() => {
    if (!xtermRef.current) return;
    
    xtermRef.current.clear();
    logs.forEach(line => xtermRef.current?.writeln(line));
    xtermRef.current.write('\x1b[35m➜\x1b[0m ');
  }, [logs]);

  return <div ref={terminalRef} className="w-full h-full min-h-[400px]" />;
}