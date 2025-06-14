// Boss类
class Boss {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        const config = CONFIG.BOSSES[type];
        this.size = config.size;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.abilities = [...config.abilities];
        
        this.vx = 0;
        this.vy = 0;
        this.lastAbilityTime = 0;
        this.abilityIndex = 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // 特殊状态
        this.charging = false;
        this.chargeTarget = null;
        this.chargeSpeed = 0;
        this.spawningMinions = false;
        this.lastMinionSpawn = 0;
        
        // 动画相关
        this.animationTime = 0;
        this.flashTime = 0;
    }
    
    update(player, obstacles = []) {
        this.animationTime += 16; // 假设60fps
        
        if (this.invulnerable) {
            this.invulnerabilityTime -= 16;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        if (this.flashTime > 0) {
            this.flashTime -= 16;
        }
        
        // 根据Boss类型执行不同的AI
        switch (this.type) {
            case 'TANK_BOSS':
                this.updateTankBoss(player, obstacles);
                break;
            case 'SPEED_BOSS':
                this.updateSpeedBoss(player, obstacles);
                break;
            case 'FINAL_BOSS':
                this.updateFinalBoss(player, obstacles);
                break;
        }
        
        // 边界检查
        this.x = Math.max(this.size, Math.min(800 - this.size, this.x));
        this.y = Math.max(this.size, Math.min(600 - this.size, this.y));
        
        // 使用技能
        this.useAbilities(player);
    }
    
    updateTankBoss(player, obstacles) {
        // 坦克Boss：缓慢移动，高血量，冲撞攻击
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (!this.charging) {
            // 正常移动
            if (distance > 100) {
                this.vx = (dx / distance) * this.speed;
                this.vy = (dy / distance) * this.speed;
            } else {
                this.vx *= 0.9;
                this.vy *= 0.9;
            }
        } else {
            // 冲撞状态
            this.vx = this.chargeTarget.x * this.chargeSpeed;
            this.vy = this.chargeTarget.y * this.chargeSpeed;
        }
        
        this.x += this.vx;
        this.y += this.vy;
    }
    
    updateSpeedBoss(player, obstacles) {
        // 速度Boss：快速移动，瞬移攻击
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 围绕玩家快速移动
        const angle = Math.atan2(dy, dx) + Math.sin(this.animationTime * 0.01) * 0.5;
        const targetDistance = 150 + Math.sin(this.animationTime * 0.005) * 50;
        
        const targetX = player.x + Math.cos(angle) * targetDistance;
        const targetY = player.y + Math.sin(angle) * targetDistance;
        
        this.vx = (targetX - this.x) * 0.1;
        this.vy = (targetY - this.y) * 0.1;
        
        this.x += this.vx;
        this.y += this.vy;
    }
    
    updateFinalBoss(player, obstacles) {
        // 最终Boss：复合攻击模式
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 根据血量百分比改变行为
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent > 0.6) {
            // 第一阶段：缓慢接近
            this.vx = (dx / distance) * this.speed * 0.5;
            this.vy = (dy / distance) * this.speed * 0.5;
        } else if (healthPercent > 0.3) {
            // 第二阶段：快速移动
            this.vx = (dx / distance) * this.speed * 1.5;
            this.vy = (dy / distance) * this.speed * 1.5;
        } else {
            // 第三阶段：疯狂模式
            const angle = this.animationTime * 0.02;
            this.vx = Math.cos(angle) * this.speed * 2;
            this.vy = Math.sin(angle) * this.speed * 2;
        }
        
        this.x += this.vx;
        this.y += this.vy;
    }
    
    useAbilities(player) {
        const now = Date.now();
        if (now - this.lastAbilityTime < 3000) return; // 3秒冷却
        
        const ability = this.abilities[this.abilityIndex % this.abilities.length];
        
        switch (ability) {
            case 'charge':
                this.startCharge(player);
                break;
            case 'spawn_minions':
                this.spawnMinions();
                break;
            case 'teleport':
                this.teleport(player);
                break;
            case 'area_attack':
                this.areaAttack(player);
                break;
        }
        
        this.lastAbilityTime = now;
        this.abilityIndex++;
    }
    
    startCharge(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.charging = true;
        this.chargeTarget = {
            x: dx / distance,
            y: dy / distance
        };
        this.chargeSpeed = this.speed * 3;
        
        setTimeout(() => {
            this.charging = false;
            this.chargeSpeed = 0;
        }, 1000);
    }
    
    spawnMinions() {
        // 这个方法会被游戏主循环调用来生成小怪
        this.spawningMinions = true;
        this.lastMinionSpawn = Date.now();
        
        setTimeout(() => {
            this.spawningMinions = false;
        }, 2000);
    }
    
    teleport(player) {
        // 瞬移到玩家附近的随机位置
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        
        this.x = player.x + Math.cos(angle) * distance;
        this.y = player.y + Math.sin(angle) * distance;
        
        // 边界检查
        this.x = Math.max(this.size, Math.min(800 - this.size, this.x));
        this.y = Math.max(this.size, Math.min(600 - this.size, this.y));
    }
    
    areaAttack(player) {
        // 区域攻击会在游戏主循环中处理伤害
        // 这里只是标记攻击状态
        this.performingAreaAttack = true;
        this.areaAttackRadius = 0;
        
        const expandArea = () => {
            this.areaAttackRadius += 10;
            if (this.areaAttackRadius < 150) {
                setTimeout(expandArea, 50);
            } else {
                this.performingAreaAttack = false;
                this.areaAttackRadius = 0;
            }
        };
        
        expandArea();
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return false;
        
        this.health -= damage;
        this.flashTime = 200; // 受伤闪烁
        
        // 受伤后短暂无敌
        this.invulnerable = true;
        this.invulnerabilityTime = 100;
        
        return this.health <= 0;
    }
    
    render(ctx) {
        // 受伤闪烁效果
        if (this.flashTime > 0 && Math.floor(this.flashTime / 50) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // 根据Boss类型绘制
        switch (this.type) {
            case 'TANK_BOSS':
                this.renderTankBoss(ctx);
                break;
            case 'SPEED_BOSS':
                this.renderSpeedBoss(ctx);
                break;
            case 'FINAL_BOSS':
                this.renderFinalBoss(ctx);
                break;
        }
        
        ctx.globalAlpha = 1;
        
        // 绘制血量条
        this.renderHealthBar(ctx);
        
        // 绘制特殊效果
        if (this.performingAreaAttack) {
            this.renderAreaAttack(ctx);
        }
    }
    
    renderTankBoss(ctx) {
        // 坦克Boss：大型方形，装甲外观
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        
        // 装甲板
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        
        // 炮管
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(this.x - 5, this.y - this.size - 20, 10, 20);
        
        // 履带
        for (let i = -this.size; i < this.size; i += 10) {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(this.x - this.size - 5, this.y + i, 5, 8);
            ctx.fillRect(this.x + this.size, this.y + i, 5, 8);
        }
    }
    
    renderSpeedBoss(ctx) {
        // 速度Boss：流线型，发光效果
        const glowIntensity = Math.sin(this.animationTime * 0.01) * 0.3 + 0.7;
        
        // 发光效果
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20 * glowIntensity;
        
        ctx.fillStyle = '#00aaaa';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 能量核心
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5 * glowIntensity, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
    
    renderFinalBoss(ctx) {
        // 最终Boss：复杂外观，多层结构
        const healthPercent = this.health / this.maxHealth;
        
        // 主体
        ctx.fillStyle = healthPercent > 0.3 ? '#8B0000' : '#FF0000';
        ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        
        // 核心
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 触手/附肢
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.animationTime * 0.005;
            const length = this.size * 1.5;
            const endX = this.x + Math.cos(angle) * length;
            const endY = this.y + Math.sin(angle) * length;
            
            ctx.strokeStyle = '#8B0000';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.size * 3;
        const barHeight = 8;
        const healthPercent = this.health / this.maxHealth;
        
        // 背景条
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 20, barWidth, barHeight);
        
        // 血量条
        ctx.fillStyle = '#2ed573';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 20, barWidth * healthPercent, barHeight);
        
        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - barWidth / 2, this.y - this.size - 20, barWidth, barHeight);
    }
    
    renderAreaAttack(ctx) {
        if (!this.performingAreaAttack) return;
        
        // 绘制扩散的攻击范围
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.areaAttackRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 内部警告效果
        ctx.fillStyle = `rgba(255, 71, 87, ${0.3 * (1 - this.areaAttackRadius / 150)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.areaAttackRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 检查是否应该生成小怪（供游戏主循环调用）
    shouldSpawnMinion() {
        if (!this.spawningMinions) return false;
        
        const now = Date.now();
        if (now - this.lastMinionSpawn > 500) { // 每0.5秒生成一个
            this.lastMinionSpawn = now;
            return true;
        }
        return false;
    }
    
    // 获取区域攻击伤害（供碰撞检测调用）
    getAreaAttackDamage(targetX, targetY) {
        if (!this.performingAreaAttack) return 0;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.areaAttackRadius) {
            return this.damage * 2; // 区域攻击伤害更高
        }
        
        return 0;
    }
}