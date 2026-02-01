'use client';

import { useState, useEffect } from 'react';
import { Save, X, FileCode, Check } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/components/ConfigProvider';
import { getTheme, ThemeColor } from '@/lib/themes';

interface FileEditorProps {
  filePath: string;
  onClose: () => void;
}

export default function FileEditor({ filePath, onClose }: FileEditorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const config = useAppConfig();
  const theme = getTheme(config.themeColor as ThemeColor);

  useEffect(() => {
    // Add timestamp to prevent caching
    fetch(`/api/files/content?path=${encodeURIComponent(filePath)}&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setContent(typeof data.content === 'string' ? data.content : '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [filePath]);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/files/content', {
      method: 'POST',
      body: JSON.stringify({ path: filePath, content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl h-[85vh] bg-[#09090b] border ${theme.classes.border} rounded-2xl flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/5`}>
        {/* Header */}
        <div className="h-14 bg-[#121214] border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2 rounded-lg bg-opacity-10 ${theme.classes.bgPrimary} ${theme.classes.textAccent}`}>
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Dosya Düzenleniyor</span>
              <span className="text-zinc-200 font-mono text-sm truncate max-w-md">{filePath}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={loading || saving}
              className={clsx(
                "transition-all font-medium shadow-lg",
                saved
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                  : `${theme.classes.bgPrimary} text-white hover:brightness-110 shadow-indigo-500/20`
              )}
            >
              {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {saved ? 'Kaydedildi' : saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-[#0c0c0e]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#09090b]">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${theme.classes.borderAccent}`} />
                <span className="text-zinc-500 text-sm">Dosya içeriği yükleniyor...</span>
              </div>
            </div>
          )}

          <textarea
            className={`w-full h-full bg-transparent font-mono p-6 resize-none focus:outline-none text-sm leading-relaxed ${theme.classes.text} selection:bg-white/10`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Footer info */}
        <div className="h-8 bg-[#09090b] border-t border-white/5 flex items-center justify-end px-4 gap-4 text-xs text-zinc-600 font-mono">
          <span>UTF-8</span>
          <span>{content.length} karakter</span>
          <span>Satır {content.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
}
