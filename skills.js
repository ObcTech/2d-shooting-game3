// 技能系统 - Skills System
// 管理玩家的主动技能和被动技能

class SkillSystem {
    constructor(player) {
        this.player = player;
        
        // 主动技能
        this.activeSkills = {
            timeSlowdown: {
                name: '时间减缓',
                cooldown: 15000, // 15秒冷却
                duration: 3000,  // 3秒持续时间
                lastUsed: 0,
                isActive: false,
                key: '1'
            },
            areaExplosion: {
                name: '范围爆炸',
                cooldown: 20000, // 20秒冷却
                damage: 100,
                radius: 150,
                lastUsed: 0,
                key: '2'
            },
            invincibility: {
                name: '无敌状态',
                cooldown: 30000, // 30秒冷却
                duration: 2000,  // 2秒持续时间
                lastUsed: 0,
                isActive: false,
                key: '3'
            },
            heal: {
                name: '治疗',
                cooldown: 25000, // 25秒冷却
                healAmount: 0.5, // 恢复50%生命值
                lastUsed: 0,
                key: '4'
            },
            dash: {
                name: '冲刺',
                cooldown: 8000, // 8秒冷却
                distance: 100,
                lastUsed: 0,
                key: 'Q'
            },
            shield: {
                name: '护盾',
                cooldown: 20000, // 20秒冷却
                duration: 5000,  // 5秒持续时间
                lastUsed: 0,
                isActive: false,
                key: 'E'
            }
        };
        
        // 被动技能等级
        this.passiveSkills = {
            speedBoost: {
                name: '移动速度提升',
                level: 0,
                maxLevel: 3,
                bonusPerLevel: 0.1 // 每级+10%
            },
            fireRateBoost: {
                name: '射击速度提升',
                level: 0,
                maxLevel: 3,
                bonusPerLevel: 0.15 // 每级+15%
            },
            healthBoost: {
                name: '生命值上限提升',
                level: 0,
                maxLevel: 3,
                bonusPerLevel: 0.25 // 每级+25%
            },
            damageBoost: {
                name: '伤害增强',
                level: 0,
                maxLevel: 3,
                bonusPerLevel: 0.2 // 每级+20%
            }
        };
        
        // 技能点数
        this.skillPoints = 0;
        
        // 时间减缓效果
        this.timeSlowdownFactor = 1.0;
        
        // 绑定键盘事件
        this.bindKeyEvents();
    }
    
    // 绑定键盘事件
    bindKeyEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                    this.useActiveSkill('timeSlowdown');
                    break;
                case '2':
                    this.useActiveSkill('areaExplosion');
                    break;
                case '3':
                    this.useActiveSkill('invincibility');
                    break;
                case '4':
                    this.useActiveSkill('heal');
                    break;
            }
        });
    }
    
    // 使用技能（通用方法）
    useSkill(skillName) {
        return this.useActiveSkill(skillName);
    }
    
    // 使用主动技能
    useActiveSkill(skillName) {
        const skill = this.activeSkills[skillName];
        const currentTime = Date.now();
        
        // 检查冷却时间
        if (currentTime - skill.lastUsed < skill.cooldown) {
            return false;
        }
        
        skill.lastUsed = currentTime;
        
        switch(skillName) {
            case 'timeSlowdown':
                this.activateTimeSlowdown();
                break;
            case 'areaExplosion':
                this.activateAreaExplosion();
                break;
            case 'invincibility':
                this.activateInvincibility();
                break;
            case 'heal':
                this.activateHeal();
                break;
            case 'dash':
                this.activateDash();
                break;
            case 'shield':
                this.activateShield();
                break;
        }
        
        return true;
    }
    
    // 激活时间减缓
    activateTimeSlowdown() {
        const skill = this.activeSkills.timeSlowdown;
        skill.isActive = true;
        this.timeSlowdownFactor = 0.5; // 时间减缓50%
        
        setTimeout(() => {
            skill.isActive = false;
            this.timeSlowdownFactor = 1.0;
        }, skill.duration);
    }
    
    // 激活范围爆炸
    activateAreaExplosion() {
        const skill = this.activeSkills.areaExplosion;
        
        // 创建爆炸效果
        this.createExplosionEffect(this.player.x, this.player.y, skill.radius);
        
        // 对范围内的敌人造成伤害
        if (window.game && window.game.enemies) {
            window.game.enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(enemy.x - this.player.x, 2) + 
                    Math.pow(enemy.y - this.player.y, 2)
                );
                
                if (distance <= skill.radius) {
                    enemy.health -= skill.damage;
                }
            });
        }
    }
    
    // 激活无敌状态
    activateInvincibility() {
        const skill = this.activeSkills.invincibility;
        skill.isActive = true;
        this.player.isInvincible = true;
        
        setTimeout(() => {
            skill.isActive = false;
            this.player.isInvincible = false;
        }, skill.duration);
    }
    
    // 激活治疗
    activateHeal() {
        const skill = this.activeSkills.heal;
        const maxHealth = this.getMaxHealth();
        const healAmount = maxHealth * skill.healAmount;
        
        this.player.health = Math.min(this.player.health + healAmount, maxHealth);
        
        // 创建治疗效果
        this.createHealEffect();
    }
    
    // 激活冲刺
    activateDash() {
        const skill = this.activeSkills.dash;
        const dashDistance = skill.distance;
        
        // 获取游戏对象的键盘状态（通过 player.game 访问）
        const keys = this.player.game ? this.player.game.keys : {};
        
        // 获取玩家当前移动方向
        let dashX = 0, dashY = 0;
        if (keys.w || keys.arrowup) dashY = -dashDistance;
        if (keys.s || keys.arrowdown) dashY = dashDistance;
        if (keys.a || keys.arrowleft) dashX = -dashDistance;
        if (keys.d || keys.arrowright) dashX = dashDistance;
        
        // 如果没有按方向键，默认向前冲刺
        if (dashX === 0 && dashY === 0) {
            dashY = -dashDistance;
        }
        
        // 应用冲刺位移
        this.player.x += dashX;
        this.player.y += dashY;
        
        // 确保玩家不会冲出边界
        const canvas = this.player.game ? this.player.game.canvas : { width: 800, height: 600 };
        this.player.x = Math.max(0, Math.min(this.player.x, canvas.width - this.player.width));
        this.player.y = Math.max(0, Math.min(this.player.y, canvas.height - this.player.height));
    }
    
    // 激活护盾
    activateShield() {
        const skill = this.activeSkills.shield;
        skill.isActive = true;
        
        // 应用护盾效果到玩家
        this.player.applyShield(skill.duration);
        
        setTimeout(() => {
            skill.isActive = false;
        }, skill.duration);
    }
    
    // 升级被动技能
    upgradePassiveSkill(skillName) {
        const skill = this.passiveSkills[skillName];
        
        if (skill.level < skill.maxLevel && this.skillPoints > 0) {
            skill.level++;
            this.skillPoints--;
            this.applyPassiveSkills();
            return true;
        }
        
        return false;
    }
    
    // 应用被动技能效果
    applyPassiveSkills() {
        // 这些效果会在游戏循环中被使用
    }
    
    // 获取移动速度加成
    getSpeedMultiplier() {
        const speedSkill = this.passiveSkills.speedBoost;
        return 1 + (speedSkill.level * speedSkill.bonusPerLevel);
    }
    
    // 获取射击速度加成
    getFireRateMultiplier() {
        const fireRateSkill = this.passiveSkills.fireRateBoost;
        return 1 + (fireRateSkill.level * fireRateSkill.bonusPerLevel);
    }
    
    // 获取最大生命值
    getMaxHealth() {
        const healthSkill = this.passiveSkills.healthBoost;
        const baseHealth = 100; // 基础生命值
        return baseHealth * (1 + (healthSkill.level * healthSkill.bonusPerLevel));
    }
    
    // 获取伤害加成
    getDamageMultiplier() {
        const damageSkill = this.passiveSkills.damageBoost;
        return 1 + (damageSkill.level * damageSkill.bonusPerLevel);
    }
    
    // 获取伤害减免
    getDamageReduction() {
        // 基础伤害减免为1（无减免）
        let reduction = 1.0;
        
        // 如果有护甲技能，可以在这里添加减免效果
        // const armorSkill = this.passiveSkills.armor;
        // reduction *= (1 - (armorSkill.level * armorSkill.bonusPerLevel));
        
        return reduction;
    }
    
    // 获取技能冷却剩余时间
    getSkillCooldown(skillName) {
        const skill = this.activeSkills[skillName];
        const currentTime = Date.now();
        const timeSinceLastUse = currentTime - skill.lastUsed;
        const remainingCooldown = Math.max(0, skill.cooldown - timeSinceLastUse);
        
        return remainingCooldown;
    }
    
    // 检查技能是否可用
    isSkillReady(skillName) {
        return this.getSkillCooldown(skillName) === 0;
    }
    
    // 检查技能是否处于激活状态
    hasActiveSkill(skillName) {
        const skill = this.activeSkills[skillName];
        return skill && skill.isActive === true;
    }
    
    // 添加技能点
    addSkillPoints(points) {
        this.skillPoints += points;
    }
    
    // 创建爆炸效果
    createExplosionEffect(x, y, radius) {
        if (window.game && window.game.particles) {
            // 创建爆炸粒子
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 * i) / 20;
                const speed = 3 + Math.random() * 2;
                
                window.game.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 30,
                    maxLife: 30,
                    color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`, // 橙红色
                    size: 3 + Math.random() * 2
                });
            }
        }
    }
    
    // 创建治疗效果
    createHealEffect() {
        if (window.game && window.game.particles) {
            // 创建治疗粒子
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random();
                
                window.game.particles.push({
                    x: this.player.x + (Math.random() - 0.5) * 40,
                    y: this.player.y + (Math.random() - 0.5) * 40,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1, // 向上飘
                    life: 40,
                    maxLife: 40,
                    color: 'rgba(0, 255, 0, 0.8)', // 绿色
                    size: 2 + Math.random()
                });
            }
        }
    }
    
    // 更新技能系统
    update(deltaTime) {
        // 应用时间减缓效果
        if (this.activeSkills.timeSlowdown.isActive) {
            deltaTime *= this.timeSlowdownFactor;
        }
        
        return deltaTime;
    }
    
    // 渲染技能UI
    renderSkillUI(ctx, canvas) {
        const skillBarY = canvas.height - 80;
        const skillSize = 50;
        const skillSpacing = 60;
        const startX = 20;
        
        // 渲染技能图标和冷却
        Object.keys(this.activeSkills).forEach((skillName, index) => {
            const skill = this.activeSkills[skillName];
            const x = startX + index * skillSpacing;
            const y = skillBarY;
            
            // 技能背景
            ctx.fillStyle = this.isSkillReady(skillName) ? 'rgba(0, 100, 200, 0.8)' : 'rgba(100, 100, 100, 0.8)';
            ctx.fillRect(x, y, skillSize, skillSize);
            
            // 技能边框
            ctx.strokeStyle = skill.isActive ? '#FFD700' : '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, skillSize, skillSize);
            
            // 技能键位
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(skill.key, x + skillSize/2, y + skillSize/2 + 5);
            
            // 冷却时间显示
            const cooldownRemaining = this.getSkillCooldown(skillName);
            if (cooldownRemaining > 0) {
                const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.fillRect(x, y, skillSize, skillSize);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(cooldownSeconds.toString(), x + skillSize/2, y + skillSize/2 + 5);
            }
            
            // 技能名称
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.fillText(skill.name, x + skillSize/2, y + skillSize + 15);
        });
        
        // 渲染技能点数
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`技能点: ${this.skillPoints}`, startX, skillBarY - 10);
    }
    
    // 渲染技能效果
    renderEffects(ctx, x, y, radius) {
        // 渲染无敌状态效果
        if (this.hasActiveSkill('invincibility')) {
            ctx.save();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
        
        // 渲染时间减缓效果
        if (this.hasActiveSkill('timeSlowdown')) {
            ctx.save();
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}

// 导出技能系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillSystem;
}