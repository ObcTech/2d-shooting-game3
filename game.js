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
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120; // 2秒 (60fps)
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
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
        
        this.enemies.push(new Enemy(x, y));
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // 更新玩家
        this.player.update(this.keys, this.width, this.height);
        
        // 自动瞄准和射击
        if (this.enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy();
            if (nearestEnemy) {
                this.player.autoShoot(nearestEnemy.x, nearestEnemy.y, this.bullets);
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
                    this.createExplosion(enemy.x, enemy.y);
                    
                    // 移除子弹和敌人
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // 增加分数
                    this.score += 10;
                    break;
                }
            }
        }
        
        // 敌人与玩家碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy)) {
                this.player.takeDamage(20);
                this.enemies.splice(i, 1);
                
                if (this.player.health <= 0) {
                    this.gameOver();
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
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = Math.random() * 3 + 2;
            this.particles.push(new Particle(x, y, angle, speed));
        }
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
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 4;
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 0;
    }
    
    update(keys, canvasWidth, canvasHeight) {
        // 移动
        if (keys['w'] || keys['arrowup']) this.y -= this.speed;
        if (keys['s'] || keys['arrowdown']) this.y += this.speed;
        if (keys['a'] || keys['arrowleft']) this.x -= this.speed;
        if (keys['d'] || keys['arrowright']) this.x += this.speed;
        
        // 边界检测
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
        
        // 更新射击冷却
        if (this.shootCooldown > 0) this.shootCooldown--;
    }
    
    shoot(targetX, targetY, bullets) {
        if (this.shootCooldown > 0) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        bullets.push(new Bullet(this.x, this.y, angle));
        this.shootCooldown = 10; // 射击间隔
    }
    
    autoShoot(targetX, targetY, bullets) {
        if (this.shootCooldown > 0) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        bullets.push(new Bullet(this.x, this.y, angle));
        this.shootCooldown = 15; // 自动射击间隔稍长一些
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    render(ctx) {
        // 绘制玩家
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制玩家边框
        ctx.strokeStyle = '#45b7aa';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制生命值条
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#2ed573';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = 1.5;
        this.health = 1;
    }
    
    update(playerX, playerY) {
        // 向玩家移动
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    render(ctx) {
        // 绘制敌人
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制敌人边框
        ctx.strokeStyle = '#ee5a52';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制敌人眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.speed = 8;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = '#feca57';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制子弹轨迹
        ctx.strokeStyle = '#ff9ff3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 3 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});