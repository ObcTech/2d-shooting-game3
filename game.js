// 游戏配置
const CONFIG = {
    PLAYER: {
        SPEED: 4,
        HEALTH: 100,
        SHOOT_COOLDOWN: 15,
        RADIUS: 15
    },
    ENEMY: {
        SPEED: 1.5,
        SPAWN_INTERVAL: 120,
        MIN_SPAWN_INTERVAL: 30,
        SPAWN_ACCELERATION: 0.5,
        RADIUS: 12
    },
    BULLET: {
        SPEED: 8,
        RADIUS: 3
    },
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.3
    }
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = new Player(this.width / 2, this.height / 2);
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        this.score = 0;
        this.gameRunning = true;
        this.wave = 1;
        this.killCount = 0;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = CONFIG.ENEMY.SPAWN_INTERVAL;
        
        // 音效系统
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
        
        // 性能监控
        this.fps = 60;
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initAudio() {
        if (!CONFIG.AUDIO.ENABLED) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('音频初始化失败:', e);
            CONFIG.AUDIO.ENABLED = false;
        }
    }
    
    createSounds() {
        // 创建射击音效
        this.sounds.shoot = this.createTone(800, 0.1, 'square');
        // 创建敌人死亡音效
        this.sounds.enemyDeath = this.createTone(200, 0.2, 'sawtooth');
        // 创建玩家受伤音效
        this.sounds.playerHit = this.createTone(150, 0.3, 'triangle');
    }
    
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext || !CONFIG.AUDIO.ENABLED) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(CONFIG.AUDIO.VOLUME, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // 音频上下文需要用户交互才能启动
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 鼠标事件（保留用于UI交互）
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // 上边
                x = Math.random() * this.width;
                y = -20;
                break;
            case 1: // 右边
                x = this.width + 20;
                y = Math.random() * this.height;
                break;
            case 2: // 下边
                x = Math.random() * this.width;
                y = this.height + 20;
                break;
            case 3: // 左边
                x = -20;
                y = Math.random() * this.height;
                break;
        }
        
        // 根据波次决定敌人类型
        let enemyType = 'normal';
        const rand = Math.random();
        
        if (this.wave >= 3) {
            if (rand < 0.2) enemyType = 'fast';
            else if (rand < 0.35) enemyType = 'tank';
        } else if (this.wave >= 2) {
            if (rand < 0.15) enemyType = 'fast';
        }
        
        this.enemies.push(new Enemy(x, y, enemyType));
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // 更新玩家
        this.player.update(this.keys, this.width, this.height);
        
        // 自动瞄准和射击
        if (this.enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy();
            if (nearestEnemy) {
                this.player.autoShoot(nearestEnemy.x, nearestEnemy.y, this.bullets, this);
            }
        }
        
        // 生成敌人
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            // 随着时间推移，敌人生成速度加快
            if (this.enemySpawnInterval > 30) {
                this.enemySpawnInterval -= 0.5;
            }
        }
        
        // 更新敌人
        this.enemies.forEach(enemy => {
            enemy.update(this.player.x, this.player.y);
        });
        
        // 更新子弹
        this.bullets.forEach(bullet => {
            bullet.update();
        });
        
        // 更新粒子效果
        this.particles.forEach(particle => {
            particle.update();
        });
        
        // 碰撞检测
        this.checkCollisions();
        
        // 清理超出边界的对象
        this.cleanup();
        
        // 更新UI
        this.updateUI();
    }
    
    checkCollisions() {
        // 子弹与敌人碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(bullet, enemy)) {
                    // 创建爆炸粒子效果
                    this.createExplosion(enemy.x, enemy.y, '#ff6b6b');
                    
                    // 播放敌人死亡音效
                    this.playSound('enemyDeath');
                    
                    // 移除子弹
                    this.bullets.splice(i, 1);
                    
                    // 敌人受伤
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        // 移除敌人
                        this.enemies.splice(j, 1);
                        
                        // 增加分数和击杀数
                        let points = 10;
                        if (enemy.type === 'fast') points = 15;
                        else if (enemy.type === 'tank') points = 25;
                        
                        this.score += points * this.wave;
                        this.killCount++;
                    }
                    
                    // 检查是否进入下一波
                    if (this.killCount % 10 === 0) {
                        this.nextWave();
                    }
                    
                    break;
                }
            }
        }
        
        // 敌人与玩家碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy)) {
                const damaged = this.player.takeDamage(20);
                
                if (damaged) {
                    this.enemies.splice(i, 1);
                    
                    // 创建受伤粒子效果
                    this.createExplosion(this.player.x, this.player.y, '#4ecdc4');
                    
                    // 播放玩家受伤音效
                    this.playSound('playerHit');
                    
                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
    }
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    
    createExplosion(x, y, color = '#ff6b6b') {
        const particleCount = Math.random() * 6 + 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = Math.random() * 4 + 2;
            this.particles.push(new Particle(x, y, angle, speed, color));
        }
    }
    
    nextWave() {
        this.wave++;
        
        // 增加敌人生成速度
        this.enemySpawnInterval = Math.max(
            CONFIG.ENEMY.MIN_SPAWN_INTERVAL,
            this.enemySpawnInterval - CONFIG.ENEMY.SPAWN_ACCELERATION * 5
        );
        
        // 显示波次信息
        this.showWaveMessage();
    }
    
    showWaveMessage() {
        // 这里可以添加波次提示的UI效果
        console.log(`第 ${this.wave} 波开始！`);
    }
    
    cleanup() {
        // 清理超出边界的子弹
        this.bullets = this.bullets.filter(bullet => 
            bullet.x >= -10 && bullet.x <= this.width + 10 &&
            bullet.y >= -10 && bullet.y <= this.height + 10
        );
        
        // 清理死亡的粒子
        this.particles = this.particles.filter(particle => particle.life > 0);
    }
    
    updateUI() {
        document.getElementById('health').textContent = Math.max(0, this.player.health);
        document.getElementById('score').textContent = this.score;
        document.getElementById('enemyCount').textContent = this.enemies.length;
        
        // 添加波次和击杀数显示
        const waveElement = document.getElementById('wave');
        const killElement = document.getElementById('kills');
        
        if (waveElement) waveElement.textContent = this.wave;
        if (killElement) killElement.textContent = this.killCount;
    }
    
    calculateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        alert(`游戏结束！最终得分: ${this.score}`);
        location.reload();
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制网格背景
        this.drawGrid();
        
        // 绘制游戏对象
        this.player.render(this.ctx);
        
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });
        
        this.bullets.forEach(bullet => {
            bullet.render(this.ctx);
        });
        
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // 绘制自动瞄准线
        this.drawAutoAimLine();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#2a2a4e';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    findNearestEnemy() {
        let nearest = null;
        let minDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    drawAutoAimLine() {
        if (!this.gameRunning || this.enemies.length === 0) return;
        
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y);
        this.ctx.lineTo(nearestEnemy.x, nearestEnemy.y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // 绘制目标标记
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(nearestEnemy.x, nearestEnemy.y, nearestEnemy.radius + 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    gameLoop(currentTime = 0) {
        this.calculateFPS(currentTime);
        this.update();
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.PLAYER.RADIUS;
        this.speed = CONFIG.PLAYER.SPEED;
        this.health = CONFIG.PLAYER.HEALTH;
        this.maxHealth = CONFIG.PLAYER.HEALTH;
        this.shootCooldown = 0;
        this.invulnerable = 0; // 无敌时间
    }
    
    update(keys, canvasWidth, canvasHeight) {
        // 移动
        let moveX = 0, moveY = 0;
        if (keys['w'] || keys['arrowup']) moveY -= this.speed;
        if (keys['s'] || keys['arrowdown']) moveY += this.speed;
        if (keys['a'] || keys['arrowleft']) moveX -= this.speed;
        if (keys['d'] || keys['arrowright']) moveX += this.speed;
        
        // 对角线移动速度修正
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/√2
            moveY *= 0.707;
        }
        
        this.x += moveX;
        this.y += moveY;
        
        // 边界检测
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
        
        // 更新射击冷却和无敌时间
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.invulnerable > 0) this.invulnerable--;
    }
    
    shoot(targetX, targetY, bullets, game) {
        if (this.shootCooldown > 0) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        bullets.push(new Bullet(this.x, this.y, angle));
        this.shootCooldown = 10;
        
        if (game) game.playSound('shoot');
    }
    
    autoShoot(targetX, targetY, bullets, game) {
        if (this.shootCooldown > 0) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        bullets.push(new Bullet(this.x, this.y, angle));
        this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
        
        if (game) game.playSound('shoot');
    }
    
    takeDamage(damage) {
        if (this.invulnerable > 0) return false;
        
        this.health -= damage;
        this.invulnerable = 60; // 1秒无敌时间
        return true;
    }
    
    render(ctx) {
        // 无敌时闪烁效果
        const alpha = this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 ? 0.5 : 1.0;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制玩家
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制玩家边框
        ctx.strokeStyle = '#45b7aa';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制方向指示器
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - this.radius + 5);
        ctx.stroke();
        
        ctx.restore();
        
        // 绘制生命值条
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        // 背景条
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        
        // 生命值条
        ctx.fillStyle = healthPercent > 0.3 ? '#2ed573' : '#ff6b6b';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
        
        // 生命值条边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
    }
}

class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.ENEMY.RADIUS;
        this.speed = CONFIG.ENEMY.SPEED;
        this.health = 1;
        this.type = type;
        this.angle = 0;
        this.animationFrame = 0;
        
        // 根据类型调整属性
        if (type === 'fast') {
            this.speed *= 1.5;
            this.radius *= 0.8;
        } else if (type === 'tank') {
            this.speed *= 0.7;
            this.radius *= 1.3;
            this.health = 2;
        }
    }
    
    update(playerX, playerY) {
        // 向玩家移动
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.angle = Math.atan2(dy, dx);
        }
        
        this.animationFrame++;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // 根据类型绘制不同颜色
        let fillColor = '#ff6b6b';
        let strokeColor = '#ee5a52';
        
        if (this.type === 'fast') {
            fillColor = '#ff9f43';
            strokeColor = '#ff7675';
        } else if (this.type === 'tank') {
            fillColor = '#6c5ce7';
            strokeColor = '#5f3dc4';
        }
        
        // 绘制敌人主体
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制敌人边框
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制方向指示器
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius - 3, 0);
        ctx.stroke();
        
        // 绘制眼睛（带动画效果）
        const eyeOffset = Math.sin(this.animationFrame * 0.1) * 0.5;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -3 + eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -3 + eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 绘制生命值（如果大于1）
        if (this.health > 1) {
            const barWidth = this.radius * 1.5;
            const barHeight = 3;
            
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, barHeight);
            
            ctx.fillStyle = '#2ed573';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * (this.health / 2), barHeight);
        }
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.BULLET.RADIUS;
        this.speed = CONFIG.BULLET.SPEED;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.trail = [];
        this.life = 0;
    }
    
    update() {
        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
    }
    
    render(ctx) {
        // 绘制轨迹
        if (this.trail.length > 1) {
            ctx.strokeStyle = '#ff9ff3';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i + 1) / this.trail.length * 0.5;
                ctx.globalAlpha = alpha;
                
                ctx.beginPath();
                ctx.moveTo(this.trail[i].x, this.trail[i].y);
                ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
        }
        
        // 绘制子弹主体
        const glowIntensity = Math.sin(this.life * 0.3) * 0.3 + 0.7;
        
        // 外发光
        ctx.shadowColor = '#feca57';
        ctx.shadowBlur = 8 * glowIntensity;
        
        ctx.fillStyle = '#feca57';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 内核
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, angle, speed, color = '#ff6b6b') {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = Math.random() * 20 + 20;
        this.maxLife = this.life;
        this.size = Math.random() * 4 + 2;
        this.color = color;
        this.gravity = 0.1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        const size = this.size * alpha;
        
        // 解析颜色
        let r, g, b;
        if (this.color === '#ff6b6b') {
            r = 255; g = 107; b = 107;
        } else if (this.color === '#4ecdc4') {
            r = 78; g = 205; b = 196;
        } else {
            r = 255; g = 255; b = 255;
        }
        
        // 外发光
        ctx.shadowColor = this.color;
        ctx.shadowBlur = size * 2;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});