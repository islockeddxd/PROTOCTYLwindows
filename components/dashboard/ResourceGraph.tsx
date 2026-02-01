'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ResourceGraphProps {
    data: any[];
    dataKey: string;
    color: string;
    title: string;
    unit: string;
}

export default function ResourceGraph({ data, dataKey, color, title, unit }: ResourceGraphProps) {
    return (
        <Card className="bg-black/40 backdrop-blur-md border border-white/5 h-48 overflow-hidden relative group">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{title}</h3>
                <div className="text-2xl font-bold text-white mt-1">
                    {data.length > 0 ? data[data.length - 1][dataKey] : 0}{unit}
                </div>
            </div>

            <div className="w-full h-full pt-10 px-0 pb-0 -mr-2 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: '#27272a', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${color})`}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
    );
}
