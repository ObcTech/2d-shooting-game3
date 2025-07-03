// 金币系统 - 收集和消费功能

class Coin {
    constructor(x, y, value = 1) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 8;
        this.collected = false;
        this.animationFrame = 0;
        this.floatOffset = Math.random() * Math.PI * 2; // 随机浮动相位
        this.magnetRange = 60; // 吸引范围
        this.magnetSpeed = 3; // 吸引速度
        this.isBeingMagnetized = false;
        
        // 视觉效果
        this.glowIntensity = 0;
        this.sparkleTimer = 0;
    }
    
    update(player) {
        this.animationFrame++;
        this.sparkleTimer++;
        
        // 检查是否在吸引范围内
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.magnetRange && !this.collected) {
            this.isBeingMagnetized = true;
            
            // 向玩家移动
            if (distance > player.radius + this.radius) {
                const moveX = (dx / distance) * this.magnetSpeed;
                const moveY = (dy / distance) * this.magnetSpeed;
                this.x += moveX;
                this.y += moveY;
                
                // 创建吸引特效
                if (this.animationFrame % 3 === 0 && window.enhancedParticles) {
                    window.enhancedParticles.createEffect('trail', this.x, this.y, {
                        count: 2,
                        color: '#ffd700',
                        size: 3,
                        speed: 1,
                        life: 20
                    });
                }
            } else {
                // 被收集
                this.collected = true;
                player.coins += this.value;
                
                // 创建收集特效
                this.createCollectionEffect();
                
                // 播放收集音效
                if (window.game && window.game.playSound) {
                    window.game.playSound('coinCollect');
                }
                
                // 记录统计
                if (player.statisticsSystem) {
                    player.statisticsSystem.recordCoinCollected(this.value);
                }
                
                // 检查成就
                if (player.achievementSystem) {
                    player.achievementSystem.recordEvent('coinCollected', this.value);
                }
            }
        }
        
        // 更新发光效果
        if (this.isBeingMagnetized) {
            this.glowIntensity = Math.min(1, this.glowIntensity + 0.1);
        } else {
            this.glowIntensity = Math.max(0, this.glowIntensity - 0.05);
        }
    }
    
    createCollectionEffect() {
        if (window.enhancedParticles) {
            // 金币收集爆炸效果
            window.enhancedParticles.createEffect('explosion', this.x, this.y, {
                count: 8,
                color: '#ffd700',
                size: 4,
                speed: 3,
                life: 30,
                gravity: -0.1
            });
        }
        
        // 创建伤害数字显示
        if (window.damageNumbers) {
            window.damageNumbers.show(this.x, this.y, `+${this.value}`, '#ffd700', 1.2);
        }
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // 浮动动画
        const floatY = this.y + Math.sin(this.animationFrame * 0.1 + this.floatOffset) * 2;
        
        // 发光效果
        if (this.glowIntensity > 0) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10 * this.glowIntensity;
        }
        
        // 绘制金币主体
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, floatY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制金币边框
        ctx.strokeStyle = '#ffb700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制金币符号
        ctx.fillStyle = '#ff8c00';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¥', this.x, floatY);
        
        // 绘制闪烁效果
        if (this.sparkleTimer % 60 < 10) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - 3, floatY - 3, 1, 0, Math.PI * 2);
            ctx.arc(this.x + 4, floatY + 2, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制吸引范围（调试用）
        if (this.isBeingMagnetized && window.DEBUG_MODE) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(this.x, floatY, this.magnetRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }
}

class UpgradeStation {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30; // 玩家角色大小
        this.height = 30;
        this.active = false;
        this.animationFrame = 0;
        this.upgradeTimer = 0;
        this.upgradeInterval = 30; // 每0.5秒消费一次金币
        this.costPerUpgrade = 1; // 每次升级消费的金币数
        this.attackBoostPerUpgrade = 1; // 每次升级增加的攻击力
        
        // 视觉效果
        this.glowIntensity = 0;
        this.particleTimer = 0;
    }
    
    update(player) {
        this.animationFrame++;
        this.particleTimer++;
        
        // 检查玩家是否踩在升级站上
        const playerLeft = player.x - player.radius;
        const playerRight = player.x + player.radius;
        const playerTop = player.y - player.radius;
        const playerBottom = player.y + player.radius;
        
        const stationLeft = this.x;
        const stationRight = this.x + this.width;
        const stationTop = this.y;
        const stationBottom = this.y + this.height;
        
        const isOnStation = (
            playerRight > stationLeft &&
            playerLeft < stationRight &&
            playerBottom > stationTop &&
            playerTop < stationBottom
        );
        
        this.active = isOnStation;
        
        if (this.active && player.coins >= this.costPerUpgrade) {
            this.upgradeTimer++;
            
            if (this.upgradeTimer >= this.upgradeInterval) {
                // 消费金币并提升攻击力
                player.coins -= this.costPerUpgrade;
                
                // 增加玩家基础攻击力
                if (!player.baseAttackPower) {
                    player.baseAttackPower = 1;
                }
                player.baseAttackPower += this.attackBoostPerUpgrade;
                
                // 创建消费特效
                this.createUpgradeEffect();
                
                // 播放升级音效
                if (window.game && window.game.playSound) {
                    window.game.playSound('upgrade');
                }
                
                // 记录统计
                if (player.statisticsSystem) {
                    player.statisticsSystem.recordUpgrade();
                }
                
                // 检查成就
                if (player.achievementSystem) {
                    player.achievementSystem.recordEvent('upgrade', 1);
                }
                
                this.upgradeTimer = 0;
            }
            
            // 创建持续的消费粒子效果
            if (this.particleTimer % 5 === 0 && window.enhancedParticles) {
                window.enhancedParticles.createEffect('trail', 
                    this.x + this.width / 2, 
                    this.y + this.height / 2, {
                    count: 3,
                    color: '#ff6b6b',
                    size: 4,
                    speed: 2,
                    life: 25,
                    gravity: -0.05
                });
            }
        } else {
            this.upgradeTimer = 0;
        }
        
        // 更新发光效果
        if (this.active) {
            this.glowIntensity = Math.min(1, this.glowIntensity + 0.1);
        } else {
            this.glowIntensity = Math.max(0, this.glowIntensity - 0.05);
        }
    }
    
    createUpgradeEffect() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        if (window.enhancedParticles) {
            // 升级爆炸效果
            window.enhancedParticles.createEffect('explosion', centerX, centerY, {
                count: 12,
                color: '#ff6b6b',
                size: 6,
                speed: 4,
                life: 40,
                gravity: -0.1
            });
        }
        
        // 创建升级提示
        if (window.damageNumbers) {
            window.damageNumbers.show(centerX, centerY - 20, `ATK +${this.attackBoostPerUpgrade}`, '#ff6b6b', 1.5);
        }
        
        // 屏幕震动
        if (window.screenShake) {
            window.screenShake.shake(5, 200);
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // 发光效果
        if (this.glowIntensity > 0) {
            ctx.shadowColor = this.active ? '#ff6b6b' : '#4ecdc4';
            ctx.shadowBlur = 15 * this.glowIntensity;
        }
        
        // 绘制升级站主体
        const pulseScale = 1 + Math.sin(this.animationFrame * 0.1) * 0.1;
        const renderWidth = this.width * pulseScale;
        const renderHeight = this.height * pulseScale;
        const renderX = this.x + (this.width - renderWidth) / 2;
        const renderY = this.y + (this.height - renderHeight) / 2;
        
        // 背景
        ctx.fillStyle = this.active ? '#ff6b6b' : '#4ecdc4';
        ctx.fillRect(renderX, renderY, renderWidth, renderHeight);
        
        // 边框
        ctx.strokeStyle = this.active ? '#ff4757' : '#45b7aa';
        ctx.lineWidth = 3;
        ctx.strokeRect(renderX, renderY, renderWidth, renderHeight);
        
        // 绘制升级符号
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↑', this.x + this.width / 2, this.y + this.height / 2);
        
        // 绘制消费提示
        if (this.active) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.fillText(`-${this.costPerUpgrade}¥`, this.x + this.width / 2, this.y - 10);
        }
        
        // 绘制能量线条（激活时）
        if (this.active && this.animationFrame % 20 < 10) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([2, 2]);
            
            // 绘制四个角的能量线
            ctx.beginPath();
            ctx.moveTo(renderX - 5, renderY - 5);
            ctx.lineTo(renderX + 5, renderY - 5);
            ctx.lineTo(renderX - 5, renderY + 5);
            ctx.moveTo(renderX + renderWidth + 5, renderY - 5);
            ctx.lineTo(renderX + renderWidth - 5, renderY - 5);
            ctx.lineTo(renderX + renderWidth + 5, renderY + 5);
            ctx.moveTo(renderX - 5, renderY + renderHeight + 5);
            ctx.lineTo(renderX + 5, renderY + renderHeight + 5);
            ctx.lineTo(renderX - 5, renderY + renderHeight - 5);
            ctx.moveTo(renderX + renderWidth + 5, renderY + renderHeight + 5);
            ctx.lineTo(renderX + renderWidth - 5, renderY + renderHeight + 5);
            ctx.lineTo(renderX + renderWidth + 5, renderY + renderHeight - 5);
            ctx.stroke();
            
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }
}

// 金币系统管理器
class CoinSystem {
    constructor() {
        this.coins = [];
        this.upgradeStations = [];
        this.totalCoinsCollected = 0;
        this.totalCoinsSpent = 0;
    }
    
    // 在指定位置掉落金币
    dropCoin(x, y, value = 1) {
        // 添加一些随机偏移，让金币散开
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        const coin = new Coin(x + offsetX, y + offsetY, value);
        this.coins.push(coin);
        console.log(`CoinSystem: 创建金币，最终位置: (${x + offsetX}, ${y + offsetY})，当前金币数组长度: ${this.coins.length}`);
    }
    
    // 添加升级站
    addUpgradeStation(x, y) {
        this.upgradeStations.push(new UpgradeStation(x, y));
    }
    
    // 更新所有金币和升级站
    update(player) {
        // 更新金币
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.update(player);
            
            if (coin.collected) {
                this.totalCoinsCollected += coin.value;
                this.coins.splice(i, 1);
            }
        }
        
        // 更新升级站
        this.upgradeStations.forEach(station => {
            station.update(player);
        });
    }
    
    // 渲染所有金币和升级站
    render(ctx) {
        // 渲染金币
        this.coins.forEach(coin => {
            coin.render(ctx);
        });
        
        // 渲染升级站
        this.upgradeStations.forEach(station => {
            station.render(ctx);
        });
    }
    
    // 清理所有金币
    clear() {
        this.coins = [];
    }
    
    // 获取统计信息
    getStats() {
        return {
            totalCoinsCollected: this.totalCoinsCollected,
            totalCoinsSpent: this.totalCoinsSpent,
            currentCoins: this.coins.length
        };
    }
}

// 导出类供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Coin, UpgradeStation, CoinSystem };
}