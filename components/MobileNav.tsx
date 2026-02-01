'use client';

import { useState, useEffect } from 'react';
import { Menu, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [serverIcon, setServerIcon] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/server/icon')
      .then(res => {
        if(res.ok) setServerIcon('/api/server/icon');
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0f172a] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center overflow-hidden border border-white/10">
            {serverIcon ? (
                <img src={serverIcon} alt="Icon" className="w-full h-full object-cover" />
            ) : (
                <Server className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <span className="font-bold text-white tracking-tight">Atherise</span>
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-white hover:bg-white/10">
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            
            {/* Sidebar Slider */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0f172a] z-50 md:hidden border-r border-white/10 shadow-2xl"
            >
              <Sidebar mobile onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
