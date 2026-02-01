const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = process.argv[2];
    if (!username) {
        console.log("Usage: node check-user.js <username>");
        const users = await prisma.user.findMany();
        console.log("All users:", users);
        return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        console.log(`User ${username} not found!`);
        return;
    }

    console.log(`Found user: ${user.username}, Role: ${user.role}, Permissions: ${user.permissions}`);

    if (process.argv[3] === '--make-admin') {
        console.log(`Promoting ${username} to admin...`);
        await prisma.user.update({
            where: { username },
            data: { role: 'admin' }
        });
        console.log("Done. User is now admin.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
