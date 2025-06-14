// NPC类（用于护送任务）
class NPC {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        
        this.size = 15;
        this.speed = 1;
        this.health = 100;
        this.maxHealth = 100;
        
        this.vx = 0;
        this.vy = 0;
        
        // 状态
        this.scared = false;
        this.scaredTime = 0;
        this.lastDamageTime = 0;
        
        // 动画
        this.animationTime = 0;
        this.walkCycle = 0;
        
        // 路径相关
        this.pathProgress = 0;
        this.stuck = false;
        this.stuckTime = 0;
        this.lastPosition = { x: x, y: y };
    }
    
    update(player, enemies, obstacles = []) {
        this.animationTime += 16;
        
        // 检查是否被卡住
        const distanceMoved = Math.sqrt(
            (this.x - this.lastPosition.x) ** 2 + 
            (this.y - this.lastPosition.y) ** 2
        );
        
        if (distanceMoved < 0.5) {
            this.stuckTime += 16;
            if (this.stuckTime > 1000) { // 1秒没移动就算卡住
                this.stuck = true;
            }
        } else {
            this.stuckTime = 0;
            this.stuck = false;
        }
        
        this.lastPosition = { x: this.x, y: this.y };
        
        // 更新恐惧状态
        if (this.scared) {
            this.scaredTime -= 16;
            if (this.scaredTime <= 0) {
                this.scared = false;
            }
        }
        
        // 检查附近是否有敌人
        const nearbyEnemies = enemies.filter(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            return Math.sqrt(dx * dx + dy * dy) < 100;
        });
        
        if (nearbyEnemies.length > 0) {
            this.scared = true;
            this.scaredTime = 2000; // 2秒恐惧
        }
        
        // 移动逻辑
        if (this.scared) {
            this.moveAwayFromEnemies(nearbyEnemies, player);
        } else {
            this.moveTowardsTarget(player, obstacles);
        }
        
        // 边界检查
        this.x = Math.max(this.size, Math.min(800 - this.size, this.x));
        this.y = Math.max(this.size, Math.min(600 - this.size, this.y));
        
        // 更新行走动画
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.walkCycle += 0.2;
        }
    }
    
    moveAwayFromEnemies(enemies, player) {
        // 计算逃离方向
        let escapeX = 0;
        let escapeY = 0;
        
        enemies.forEach(enemy => {
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                escapeX += (dx / distance) / distance;
                escapeY += (dy / distance) / distance;
            }
        });
        
        // 同时尝试靠近玩家寻求保护
        const playerDx = player.x - this.x;
        const playerDy = player.y - this.y;
        const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
        
        if (playerDistance > 50) { // 如果离玩家太远，尝试靠近
            escapeX += (playerDx / playerDistance) * 0.5;
            escapeY += (playerDy / playerDistance) * 0.5;
        }
        
        // 归一化并应用速度
        const escapeDistance = Math.sqrt(escapeX * escapeX + escapeY * escapeY);
        if (escapeDistance > 0) {
            this.vx = (escapeX / escapeDistance) * this.speed * 2; // 恐惧时移动更快
            this.vy = (escapeY / escapeDistance) * this.speed * 2;
        }
        
        this.x += this.vx;
        this.y += this.vy;
    }
    
    moveTowardsTarget(player, obstacles) {
        // 计算到目标的方向
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceToTarget < 10) {
            // 已到达目标
            this.vx = 0;
            this.vy = 0;
            return;
        }
        
        // 基本移动方向
        let moveX = (dx / distanceToTarget) * this.speed;
        let moveY = (dy / distanceToTarget) * this.speed;
        
        // 如果卡住了，尝试绕路
        if (this.stuck) {
            const perpX = -moveY; // 垂直方向
            const perpY = moveX;
            
            // 随机选择左右绕行
            const direction = Math.random() > 0.5 ? 1 : -1;
            moveX += perpX * direction * 0.5;
            moveY += perpY * direction * 0.5;
        }
        
        // 避开障碍物
        obstacles.forEach(obstacle => {
            if (obstacle.destroyed) return;
            
            const obstacleDistance = this.getDistanceToObstacle(obstacle);
            if (obstacleDistance < this.size + 20) {
                // 计算避开方向
                const avoidX = this.x - (obstacle.x + obstacle.width / 2);
                const avoidY = this.y - (obstacle.y + obstacle.height / 2);
                const avoidDistance = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                
                if (avoidDistance > 0) {
                    moveX += (avoidX / avoidDistance) * 0.5;
                    moveY += (avoidY / avoidDistance) * 0.5;
                }
            }
        });
        
        // 跟随玩家（但不要太近）
        const playerDx = player.x - this.x;
        const playerDy = player.y - this.y;
        const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
        
        if (playerDistance > 80) {
            // 如果离玩家太远，优先跟随玩家
            moveX += (playerDx / playerDistance) * this.speed * 0.3;
            moveY += (playerDy / playerDistance) * this.speed * 0.3;
        } else if (playerDistance < 30) {
            // 如果离玩家太近，稍微远离
            moveX -= (playerDx / playerDistance) * this.speed * 0.2;
            moveY -= (playerDy / playerDistance) * this.speed * 0.2;
        }
        
        this.vx = moveX;
        this.vy = moveY;
        
        this.x += this.vx;
        this.y += this.vy;
    }
    
    getDistanceToObstacle(obstacle) {
        // 计算点到矩形的最短距离
        const closestX = Math.max(obstacle.x, Math.min(this.x, obstacle.x + obstacle.width));
        const closestY = Math.max(obstacle.y, Math.min(this.y, obstacle.y + obstacle.height));
        
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.lastDamageTime = Date.now();
        
        // 受伤时变得更加恐惧
        this.scared = true;
        this.scaredTime = 3000;
        
        return this.health <= 0;
    }
    
    getProgress() {
        // 计算到目标的进度（0-1）
        const totalDistance = Math.sqrt(
            (this.targetX - this.startX) ** 2 + 
            (this.targetY - this.startY) ** 2
        );
        
        const currentDistance = Math.sqrt(
            (this.x - this.startX) ** 2 + 
            (this.y - this.startY) ** 2
        );
        
        return Math.min(1, currentDistance / totalDistance);
    }
    
    isAtTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < 20;
    }
    
    render(ctx) {
        // 受伤闪烁效果
        const timeSinceHit = Date.now() - this.lastDamageTime;
        if (timeSinceHit < 500 && Math.floor(timeSinceHit / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // 恐惧状态颜色变化
        const baseColor = this.scared ? '#FFB6C1' : '#87CEEB';
        
        // 绘制身体
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制眼睛
        const eyeOffset = this.scared ? 3 : 5;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset, this.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.x + eyeOffset, this.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制嘴巴（恐惧时是惊恐表情）
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this.scared) {
            // 惊恐的嘴
            ctx.arc(this.x, this.y + 3, 3, 0, Math.PI);
        } else {
            // 正常的嘴
            ctx.arc(this.x, this.y + 2, 2, 0, Math.PI);
        }
        ctx.stroke();
        
        // 绘制移动方向指示器
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            const angle = Math.atan2(this.vy, this.vx);
            const indicatorLength = 20;
            
            ctx.strokeStyle = '#4169E1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(angle) * indicatorLength,
                this.y + Math.sin(angle) * indicatorLength
            );
            ctx.stroke();
        }
        
        // 绘制血量条
        if (this.health < this.maxHealth) {
            const barWidth = this.size * 2;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            // 背景条
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth, barHeight);
            
            // 血量条
            ctx.fillStyle = '#2ed573';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth * healthPercent, barHeight);
        }
        
        // 绘制目标指示器
        this.renderTargetIndicator(ctx);
        
        ctx.globalAlpha = 1;
    }
    
    renderTargetIndicator(ctx) {
        // 绘制到目标的指示线
        ctx.strokeStyle = 'rgba(65, 105, 225, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.targetX, this.targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 绘制目标点
        ctx.fillStyle = 'rgba(65, 105, 225, 0.7)';
        ctx.beginPath();
        ctx.arc(this.targetX, this.targetY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 目标点动画
        const pulseSize = 5 + Math.sin(this.animationTime * 0.01) * 3;
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.targetX, this.targetY, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// NPC工厂函数
function createNPCForEscortMission() {
    // 在地图左侧生成NPC，目标是右侧
    const startX = 50;
    const startY = 300;
    const targetX = 750;
    const targetY = 300;
    
    return new NPC(startX, startY, targetX, targetY);
}