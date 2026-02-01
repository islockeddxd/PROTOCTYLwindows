const { execSync } = require('child_process');

console.log('\x1b[36m[Auto-Update] GitHub güncellemeleri kontrol ediliyor...\x1b[0m');

try {
    // Fetch latest changes
    execSync('git fetch', { stdio: 'ignore' });

    // Check if behind
    const status = execSync('git status -uno', { encoding: 'utf-8' });

    if (status.includes('Your branch is behind')) {
        console.log('\x1b[33m[Auto-Update] Yeni güncelleme bulundu! İndiriliyor...\x1b[0m');
        execSync('git pull', { stdio: 'inherit' });
        console.log('\x1b[32m[Auto-Update] Güncelleme tamamlandı.\x1b[0m');
    } else {
        console.log('\x1b[32m[Auto-Update] Sistem güncel.\x1b[0m');
    }
} catch (error) {
    console.log('\x1b[31m[Auto-Update] Güncelleme kontrolü başarısız (Git hatası veya internet yok).\x1b[0m');
}
