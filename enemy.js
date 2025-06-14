// 敌人系统 - 多样化敌人类型实现

// 敌人基类
class BaseEnemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.angle = 0;
        this.animationFrame = 0;
        this.health = 1;
        this.maxHealth = 1;
        this.speed = CONFIG.ENEMY.SPEED;
        this.radius = CONFIG.ENEMY.RADIUS;
        this.damage = 1;
        this.scoreValue = 10;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1秒攻击冷却
        this.isAlive = true;
        this.statusEffects = {};
        
        // 初始化特定类型属性
        this.initializeType();
    }
    
    initializeType() {
        // 子类重写此方法
    }
    
    update(playerX, playerY, obstacles = [], deltaTime = 16) {
        if (!this.isAlive) return;
        
        this.animationFrame++;
        
        // 更新状态效果
        this.updateStatusEffects(deltaTime);
        
        // 移动逻辑
        this.updateMovement(playerX, playerY, obstacles);
        
        // 攻击逻辑
        this.updateAttack(playerX, playerY, deltaTime);
    }
    
    updateMovement(playerX, playerY, obstacles) {
        // 基础移动逻辑 - 向玩家移动
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let moveX = 0;
        let moveY = 0;
        
        if (distance > 0) {
            moveX = (dx / distance) * this.speed;
            moveY = (dy / distance) * this.speed;
        }
        
        // 避开障碍物
        obstacles.forEach(obstacle => {
            if (obstacle.destroyed) return;
            
            const obstacleDistance = this.getDistanceToObstacle(obstacle);
            if (obstacleDistance < this.radius + 15) {
                const avoidX = this.x - (obstacle.x + obstacle.width / 2);
                const avoidY = this.y - (obstacle.y + obstacle.height / 2);
                const avoidDistance = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                
                if (avoidDistance > 0) {
                    moveX += (avoidX / avoidDistance) * this.speed * 0.8;
                    moveY += (avoidY / avoidDistance) * this.speed * 0.8;
                }
            }
        });
        
        this.x += moveX;
        this.y += moveY;
        this.angle = Math.atan2(moveY, moveX);
    }
    
    updateAttack(playerX, playerY, deltaTime) {
        // 基础攻击逻辑 - 子类重写
    }
    
    updateStatusEffects(deltaTime) {
        // 更新状态效果（如减速、中毒等）
        Object.keys(this.statusEffects).forEach(effect => {
            this.statusEffects[effect].duration -= deltaTime;
            if (this.statusEffects[effect].duration <= 0) {
                delete this.statusEffects[effect];
            }
        });
    }
    
    getDistanceToObstacle(obstacle) {
        const closestX = Math.max(obstacle.x, Math.min(this.x, obstacle.x + obstacle.width));
        const closestY = Math.max(obstacle.y, Math.min(this.y, obstacle.y + obstacle.height));
        
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isAlive = false;
            return true; // 敌人死亡
        }
        return false;
    }
    
    applyStatusEffect(effect, duration, intensity = 1) {
        this.statusEffects[effect] = {
            duration: duration,
            intensity: intensity
        };
    }
    
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // 绘制敌人主体
        this.renderBody(ctx);
        
        // 绘制状态效果
        this.renderStatusEffects(ctx);
        
        ctx.restore();
        
        // 绘制生命值条
        if (this.maxHealth > 1) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderBody(ctx) {
        // 子类重写此方法
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ee5a52';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    renderStatusEffects(ctx) {
        // 绘制状态效果指示器
        let effectIndex = 0;
        Object.keys(this.statusEffects).forEach(effect => {
            const y = -this.radius - 15 - (effectIndex * 8);
            ctx.fillStyle = this.getEffectColor(effect);
            ctx.fillRect(-3, y, 6, 3);
            effectIndex++;
        });
    }
    
    getEffectColor(effect) {
        const colors = {
            'slow': '#74b9ff',
            'poison': '#00b894',
            'burn': '#fd79a8',
            'freeze': '#81ecec'
        };
        return colors[effect] || '#ddd';
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.radius * 1.8;
        const barHeight = 4;
        const y = this.y - this.radius - 12;
        
        // 背景
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(this.x - barWidth/2, y, barWidth, barHeight);
        
        // 生命值
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.6 ? '#00b894' : healthPercent > 0.3 ? '#fdcb6e' : '#e17055';
        ctx.fillRect(this.x - barWidth/2, y, barWidth * healthPercent, barHeight);
        
        // 边框
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, y, barWidth, barHeight);
    }
}

// 普通敌人
class NormalEnemy extends BaseEnemy {
    initializeType() {
        this.health = 1;
        this.maxHealth = 1;
        this.speed = CONFIG.ENEMY.SPEED;
        this.radius = CONFIG.ENEMY.RADIUS;
        this.scoreValue = 10;
    }
    
    renderBody(ctx) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ee5a52';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 方向指示器
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius - 3, 0);
        ctx.stroke();
        
        // 眼睛动画
        const eyeOffset = Math.sin(this.animationFrame * 0.1) * 0.5;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -3 + eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -3 + eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 快速敌人
class FastEnemy extends BaseEnemy {
    initializeType() {
        this.health = 1;
        this.maxHealth = 1;
        this.speed = CONFIG.ENEMY.SPEED * 1.8;
        this.radius = CONFIG.ENEMY.RADIUS * 0.8;
        this.scoreValue = 15;
    }
    
    updateMovement(playerX, playerY, obstacles) {
        super.updateMovement(playerX, playerY, obstacles);
        
        // 快速敌人有随机移动模式
        if (Math.random() < 0.1) {
            const randomAngle = Math.random() * Math.PI * 2;
            this.x += Math.cos(randomAngle) * this.speed * 0.3;
            this.y += Math.sin(randomAngle) * this.speed * 0.3;
        }
    }
    
    renderBody(ctx) {
        // 快速敌人有闪烁效果
        const alpha = 0.7 + Math.sin(this.animationFrame * 0.3) * 0.3;
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = '#ff9f43';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ff7675';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 速度线条
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-this.radius + i * 3, -2 + i);
            ctx.lineTo(-this.radius + i * 3 + 5, -2 + i);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
}

// 坦克敌人
class TankEnemy extends BaseEnemy {
    initializeType() {
        this.health = 4;
        this.maxHealth = 4;
        this.speed = CONFIG.ENEMY.SPEED * 0.6;
        this.radius = CONFIG.ENEMY.RADIUS * 1.4;
        this.scoreValue = 30;
        this.armor = 1; // 减少1点伤害
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.armor);
        return super.takeDamage(actualDamage);
    }
    
    renderBody(ctx) {
        ctx.fillStyle = '#6c5ce7';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#5f3dc4';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 装甲板
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(-this.radius * 0.6, -this.radius * 0.3, this.radius * 1.2, this.radius * 0.6);
        
        // 炮管
        ctx.fillStyle = '#636e72';
        ctx.fillRect(0, -2, this.radius, 4);
        
        // 履带
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius - 3 - i * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// 远程敌人
class RangedEnemy extends BaseEnemy {
    constructor(x, y, type = 'ranged') {
        super(x, y, type);
        this.bullets = [];
        this.attackRange = 200;
        this.keepDistance = 120;
    }
    
    initializeType() {
        this.health = 2;
        this.maxHealth = 2;
        this.speed = CONFIG.ENEMY.SPEED * 0.8;
        this.radius = CONFIG.ENEMY.RADIUS * 1.1;
        this.scoreValue = 25;
        this.attackCooldown = 1500; // 1.5秒攻击间隔
    }
    
    updateMovement(playerX, playerY, obstacles) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let moveX = 0;
        let moveY = 0;
        
        if (distance > 0) {
            if (distance > this.attackRange) {
                // 太远了，靠近玩家
                moveX = (dx / distance) * this.speed;
                moveY = (dy / distance) * this.speed;
            } else if (distance < this.keepDistance) {
                // 太近了，保持距离
                moveX = -(dx / distance) * this.speed;
                moveY = -(dy / distance) * this.speed;
            } else {
                // 在攻击范围内，绕圈移动
                const perpAngle = Math.atan2(dy, dx) + Math.PI / 2;
                moveX = Math.cos(perpAngle) * this.speed * 0.5;
                moveY = Math.sin(perpAngle) * this.speed * 0.5;
            }
        }
        
        // 避开障碍物
        obstacles.forEach(obstacle => {
            if (obstacle.destroyed) return;
            
            const obstacleDistance = this.getDistanceToObstacle(obstacle);
            if (obstacleDistance < this.radius + 15) {
                const avoidX = this.x - (obstacle.x + obstacle.width / 2);
                const avoidY = this.y - (obstacle.y + obstacle.height / 2);
                const avoidDistance = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                
                if (avoidDistance > 0) {
                    moveX += (avoidX / avoidDistance) * this.speed * 0.8;
                    moveY += (avoidY / avoidDistance) * this.speed * 0.8;
                }
            }
        });
        
        this.x += moveX;
        this.y += moveY;
        this.angle = Math.atan2(playerY - this.y, playerX - this.x);
    }
    
    updateAttack(playerX, playerY, deltaTime) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.attackRange && Date.now() - this.lastAttackTime > this.attackCooldown) {
            this.shoot(playerX, playerY);
            this.lastAttackTime = Date.now();
        }
        
        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.x > -50 && bullet.x < 1000 && bullet.y > -50 && bullet.y < 700;
        });
    }
    
    shoot(targetX, targetY) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const bullet = new EnemyBullet(this.x, this.y, angle);
        this.bullets.push(bullet);
    }
    
    render(ctx) {
        super.render(ctx);
        
        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(ctx));
    }
    
    renderBody(ctx) {
        ctx.fillStyle = '#e84393';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#d63031';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 武器
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0, -1, this.radius + 5, 2);
        
        // 瞄准器
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.radius + 5, -3);
        ctx.lineTo(this.radius + 8, 0);
        ctx.lineTo(this.radius + 5, 3);
        ctx.stroke();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-2, -2, 1, 0, Math.PI * 2);
        ctx.arc(2, -2, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 敌人子弹类
class EnemyBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 4;
        this.radius = 2;
        this.damage = 1;
        
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = '#e84393';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#d63031';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Boss敌人基类
class BossEnemy extends BaseEnemy {
    constructor(x, y, type = 'boss') {
        super(x, y, type);
        this.phase = 1;
        this.maxPhases = 3;
        this.abilities = [];
        this.lastAbilityTime = 0;
        this.abilityInterval = 3000; // 3秒技能间隔
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
    }
    
    initializeType() {
        this.health = 20;
        this.maxHealth = 20;
        this.speed = CONFIG.ENEMY.SPEED * 0.4;
        this.radius = CONFIG.ENEMY.RADIUS * 2;
        this.scoreValue = 200;
        this.attackCooldown = 2000;
    }
    
    update(playerX, playerY, obstacles = [], deltaTime = 16) {
        super.update(playerX, playerY, obstacles, deltaTime);
        
        // 更新无敌时间
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
            }
        }
        
        // 检查阶段转换
        this.checkPhaseTransition();
        
        // 使用技能
        if (Date.now() - this.lastAbilityTime > this.abilityInterval) {
            this.useRandomAbility(playerX, playerY);
            this.lastAbilityTime = Date.now();
        }
    }
    
    checkPhaseTransition() {
        const healthPercent = this.health / this.maxHealth;
        const newPhase = Math.ceil(healthPercent * this.maxPhases);
        
        if (newPhase !== this.phase && newPhase > 0) {
            this.phase = newPhase;
            this.onPhaseChange();
        }
    }
    
    onPhaseChange() {
        // 阶段转换时短暂无敌
        this.isInvulnerable = true;
        this.invulnerabilityTime = 1000;
        
        // 根据阶段调整属性
        this.speed *= 1.1;
        this.abilityInterval = Math.max(1000, this.abilityInterval - 500);
    }
    
    useRandomAbility(playerX, playerY) {
        // 子类实现具体技能
    }
    
    takeDamage(damage) {
        if (this.isInvulnerable) return false;
        return super.takeDamage(damage);
    }
    
    renderBody(ctx) {
        // Boss有特殊的闪烁效果
        if (this.isInvulnerable) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        }
        
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fd79a8';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Boss标记
        ctx.fillStyle = '#fd79a8';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', 0, 4);
        
        ctx.globalAlpha = 1;
    }
}

// 简单Boss实现
class SimpleBoss extends BossEnemy {
    constructor(x, y) {
        super(x, y, 'simple_boss');
        this.bullets = [];
        this.abilities = ['burst_shot', 'charge_attack', 'spawn_minions'];
    }
    
    useRandomAbility(playerX, playerY) {
        const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
        
        switch (ability) {
            case 'burst_shot':
                this.burstShot(playerX, playerY);
                break;
            case 'charge_attack':
                this.chargeAttack(playerX, playerY);
                break;
            case 'spawn_minions':
                this.spawnMinions();
                break;
        }
    }
    
    burstShot(playerX, playerY) {
        const bulletCount = 8;
        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i;
            const bullet = new EnemyBullet(this.x, this.y, angle);
            bullet.speed = 3;
            this.bullets.push(bullet);
        }
    }
    
    chargeAttack(playerX, playerY) {
        // 简单的冲锋攻击
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed * 5;
            this.y += (dy / distance) * this.speed * 5;
        }
    }
    
    spawnMinions() {
        // 这个方法需要游戏主循环来处理生成小兵
        this.shouldSpawnMinions = true;
    }
    
    update(playerX, playerY, obstacles = [], deltaTime = 16) {
        super.update(playerX, playerY, obstacles, deltaTime);
        
        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.x > -50 && bullet.x < 1000 && bullet.y > -50 && bullet.y < 700;
        });
    }
    
    render(ctx) {
        super.render(ctx);
        
        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(ctx));
    }
}

// 敌人工厂
class EnemyFactory {
    static createEnemy(type, x, y) {
        switch (type) {
            case 'normal':
                return new NormalEnemy(x, y);
            case 'fast':
                return new FastEnemy(x, y);
            case 'tank':
                return new TankEnemy(x, y);
            case 'ranged':
                return new RangedEnemy(x, y);
            case 'simple_boss':
                return new SimpleBoss(x, y);
            default:
                return new NormalEnemy(x, y);
        }
    }
    
    static getRandomEnemyType(wave = 1) {
        const types = ['normal', 'fast'];
        
        if (wave >= 3) types.push('tank');
        if (wave >= 5) types.push('ranged');
        
        // Boss每10波出现一次
        if (wave % 10 === 0) {
            return 'simple_boss';
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseEnemy,
        NormalEnemy,
        FastEnemy,
        TankEnemy,
        RangedEnemy,
        BossEnemy,
        SimpleBoss,
        EnemyBullet,
        EnemyFactory
    };
}