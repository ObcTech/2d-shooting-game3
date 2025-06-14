// 障碍物类
class Obstacle {
    constructor(x, y, width, height, type = 'wall') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.destroyed = false;
    }
    
    getHealthByType() {
        switch (this.type) {
            case 'wall': return 100;
            case 'crate': return 30;
            case 'barrel': return 20;
            case 'rock': return 150;
            default: return 50;
        }
    }
    
    takeDamage(damage) {
        if (this.destroyed) return false;
        
        this.health -= damage;
        if (this.health <= 0) {
            this.destroyed = true;
            return true; // 返回true表示障碍物被摧毁
        }
        return false;
    }
    
    isColliding(x, y, radius) {
        // 圆形与矩形的碰撞检测
        const closestX = Math.max(this.x, Math.min(x, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(y, this.y + this.height));
        
        const distanceX = x - closestX;
        const distanceY = y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        // 根据类型绘制不同的障碍物
        switch (this.type) {
            case 'wall':
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // 砖块纹理
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                for (let i = 0; i < this.height; i += 20) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + i);
                    ctx.lineTo(this.x + this.width, this.y + i);
                    ctx.stroke();
                }
                for (let i = 0; i < this.width; i += 30) {
                    ctx.beginPath();
                    ctx.moveTo(this.x + i, this.y);
                    ctx.lineTo(this.x + i, this.y + this.height);
                    ctx.stroke();
                }
                break;
                
            case 'crate':
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // 木箱纹理
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                
                // 交叉线
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.moveTo(this.x + this.width, this.y);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.stroke();
                break;
                
            case 'barrel':
                ctx.fillStyle = '#696969';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // 油桶纹理
                ctx.strokeStyle = '#2F4F4F';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                
                // 横条纹
                for (let i = 5; i < this.height; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + i);
                    ctx.lineTo(this.x + this.width, this.y + i);
                    ctx.stroke();
                }
                break;
                
            case 'rock':
                ctx.fillStyle = '#708090';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // 岩石纹理
                ctx.strokeStyle = '#2F4F4F';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                
                // 裂纹
                ctx.beginPath();
                ctx.moveTo(this.x + this.width * 0.3, this.y);
                ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.4);
                ctx.lineTo(this.x + this.width * 0.2, this.y + this.height);
                ctx.stroke();
                break;
        }
        
        // 绘制血量条（如果受损）
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            // 背景条
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
            
            // 血量条
            ctx.fillStyle = '#2ed573';
            ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
        }
    }
}

// 障碍物工厂函数
function createObstaclesForLevel(levelName) {
    const obstacles = [];
    const levelConfig = CONFIG.LEVELS[levelName];
    
    if (levelConfig && levelConfig.obstacles) {
        levelConfig.obstacles.forEach(obstacleData => {
            obstacles.push(new Obstacle(
                obstacleData.x,
                obstacleData.y,
                obstacleData.width,
                obstacleData.height,
                obstacleData.type
            ));
        });
    }
    
    return obstacles;
}