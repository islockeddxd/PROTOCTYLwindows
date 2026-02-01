const { PrismaClient } = require('@prisma/client');
const parser = require('cron-parser');
const prisma = new PrismaClient();

const INTERNAL_SECRET = process.env.JWT_SECRET || 'secret-key';
const API_URL = 'http://localhost:3000/api/server';

function initScheduler() {
    console.log('[Scheduler] Initialized.');

    // Check every minute
    setInterval(async () => {
        try {
            const schedules = await prisma.schedule.findMany({
                where: { isActive: true },
                include: { tasks: { orderBy: { sequence: 'asc' } } }
            });

            const now = new Date();

            for (const schedule of schedules) {
                try {
                    const interval = parser.parseExpression(schedule.cron);
                    const prev = interval.prev();
                    const pDate = prev.toDate();

                    // Check if the previous run time was within the last minute
                    // And check if we haven't already run it (using lastRun)
                    const diff = now.getTime() - pDate.getTime();

                    // If schedule was due in the last 65 seconds
                    if (diff < 65000 && diff >= 0) {
                        // Check if we already ran it for this interval
                        if (schedule.lastRun && (schedule.lastRun.getTime() === pDate.getTime() || Math.abs(schedule.lastRun.getTime() - pDate.getTime()) < 10000)) {
                            continue;
                        }

                        console.log(`[Scheduler] Running schedule: ${schedule.name}`);

                        // Execute Tasks
                        executeTasks(schedule);

                        // Update DB
                        await prisma.schedule.update({
                            where: { id: schedule.id },
                            data: { lastRun: pDate, nextRun: interval.next().toDate() }
                        });
                    }
                } catch (err) {
                    console.error(`[Scheduler] Error parsing id ${schedule.id}:`, err);
                }
            }
        } catch (e) {
            console.error('[Scheduler] Error:', e);
        }
    }, 60000); // 60 seconds
}

async function executeTasks(schedule) {
    for (const task of schedule.tasks) {
        // Handle delay
        if (task.delay > 0) {
            await new Promise(r => setTimeout(r, task.delay * 1000));
        }

        console.log(`[Scheduler] Executing task: ${task.action}`);

        try {
            let body = {};
            if (task.action === 'command') {
                body = { action: 'command', command: task.payload };
            } else if (task.action === 'power') {
                body = { action: task.payload }; // start, stop, kill
            } else if (task.action === 'backup') {
                // Call backup API
                await fetch('http://localhost:3000/api/server/backups', {
                    method: 'POST',
                    headers: { 'x-scheduler-secret': INTERNAL_SECRET }
                });
                continue;
            }

            if (body.action) {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-scheduler-secret': INTERNAL_SECRET
                    },
                    body: JSON.stringify(body)
                });
            }
        } catch (e) {
            console.error(`[Scheduler] Task failed:`, e);
        }
    }
}

module.exports = { initScheduler };
