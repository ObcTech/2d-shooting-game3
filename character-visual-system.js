/**
 * 角色视觉系统
 * 实现角色与敌人的高级视觉效果和动画
 */

class CharacterVisualSystem {
    constructor() {
        this.spriteAnimations = new Map();
        this.equipmentVisuals = new Map();
        this.statusIndicators = new Map();
        this.deathAnimations = new Map();
        this.aiVisualization = new Map();
        
        this.initializeVisuals();
    }
    
    initializeVisuals() {
        this.initializeSpriteAnimations();
        this.initializeEquipmentVisuals();
        this.initializeStatusIndicators();
        this.initializeDeathAnimations();
        this.initializeAIVisualization();
    }
    
    // 初始化精灵动画
    initializeSpriteAnimations() {
        // 玩家精灵动画
        this.spriteAnimations.set('player_walk', {
            frames: [
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 1, spriteY: 0, offsetX: 0, offsetY: -1, scale: 1.02 },
                { spriteX: 2, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 3, spriteY: 0, offsetX: 0, offsetY: -1, scale: 1.02 },
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 1, spriteY: 1, offsetX: 0, offsetY: -1, scale: 1.02 },
                { spriteX: 2, spriteY: 1, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 3, spriteY: 1, offsetX: 0, offsetY: -1, scale: 1.02 }
            ],
            frameRate: 8,
            loop: true
        });
        
        this.spriteAnimations.set('player_idle', {
            frames: [
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: -0.5, scale: 1.01 },
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: -0.5, scale: 1.01 }
            ],
            frameRate: 4,
            loop: true
        });
        
        this.spriteAnimations.set('player_shoot', {
            frames: [
                { spriteX: 0, spriteY: 2, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 1, spriteY: 2, offsetX: -2, offsetY: 0, scale: 1.1 },
                { spriteX: 2, spriteY: 2, offsetX: -1, offsetY: 0, scale: 1.05 },
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0 }
            ],
            frameRate: 12,
            loop: false
        });
        
        this.spriteAnimations.set('player_hurt', {
            frames: [
                { spriteX: 0, spriteY: 3, offsetX: 0, offsetY: 0, scale: 1.0, tint: '#ff6b6b' },
                { spriteX: 1, spriteY: 3, offsetX: 2, offsetY: 1, scale: 0.9, tint: '#ff4757' },
                { spriteX: 2, spriteY: 3, offsetX: -1, offsetY: 0, scale: 1.1, tint: '#ff6b6b' },
                { spriteX: 0, spriteY: 0, offsetX: 0, offsetY: 0, scale: 1.0, tint: null }
            ],
            frameRate: 10,
            loop: false
        });
        
        // 敌人精灵动画
        this.spriteAnimations.set('enemy_normal_idle', {
            frames: [
                { spriteX: 0, spriteY: 4, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 1, spriteY: 4, offsetX: 0, offsetY: -0.5, scale: 1.01 },
                { spriteX: 2, spriteY: 4, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 1, spriteY: 4, offsetX: 0, offsetY: 0.5, scale: 0.99 }
            ],
            frameRate: 2,
            loop: true
        });
        
        this.spriteAnimations.set('enemy_fast_move', {
            frames: [
                { spriteX: 0, spriteY: 5, offsetX: 0, offsetY: 0, scale: 1.0, alpha: 0.9 },
                { spriteX: 1, spriteY: 5, offsetX: 1, offsetY: -1, scale: 1.05, alpha: 0.8 },
                { spriteX: 2, spriteY: 5, offsetX: -1, offsetY: 0, scale: 1.0, alpha: 0.9 },
                { spriteX: 3, spriteY: 5, offsetX: 0, offsetY: 1, scale: 0.95, alpha: 1.0 }
            ],
            frameRate: 6,
            loop: true
        });
        
        this.spriteAnimations.set('enemy_tank_move', {
            frames: [
                { spriteX: 0, spriteY: 6, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 1, spriteY: 6, offsetX: 0, offsetY: -1, scale: 1.02 },
                { spriteX: 2, spriteY: 6, offsetX: 0, offsetY: 0, scale: 1.0 },
                { spriteX: 3, spriteY: 6, offsetX: 0, offsetY: 1, scale: 0.98 }
            ],
            frameRate: 3,
            loop: true
        });
    }
    
    // 初始化装备视觉效果
    initializeEquipmentVisuals() {
        this.equipmentVisuals.set('pistol', {
            sprite: { x: 0, y: 7 },
            offset: { x: 8, y: 2 },
            muzzleFlash: {
                sprite: { x: 1, y: 7 },
                duration: 100,
                scale: 0.8
            }
        });
        
        this.equipmentVisuals.set('rifle', {
            sprite: { x: 2, y: 7 },
            offset: { x: 12, y: 1 },
            muzzleFlash: {
                sprite: { x: 3, y: 7 },
                duration: 120,
                scale: 1.0
            }
        });
        
        this.equipmentVisuals.set('shotgun', {
            sprite: { x: 0, y: 8 },
            offset: { x: 10, y: 3 },
            muzzleFlash: {
                sprite: { x: 1, y: 8 },
                duration: 150,
                scale: 1.2
            }
        });
        
        this.equipmentVisuals.set('machinegun', {
            sprite: { x: 2, y: 8 },
            offset: { x: 14, y: 0 },
            muzzleFlash: {
                sprite: { x: 3, y: 8 },
                duration: 80,
                scale: 0.9
            }
        });
    }
    
    // 初始化状态指示器
    initializeStatusIndicators() {
        this.statusIndicators.set('shield', {
            sprite: { x: 0, y: 9 },
            animation: {
                frames: [
                    { alpha: 0.8, scale: 1.0, rotation: 0 },
                    { alpha: 1.0, scale: 1.05, rotation: 0.1 },
                    { alpha: 0.8, scale: 1.0, rotation: 0 },
                    { alpha: 0.6, scale: 0.95, rotation: -0.1 }
                ],
                frameRate: 4,
                loop: true
            },
            color: '#74b9ff'
        });
        
        this.statusIndicators.set('speed_boost', {
            sprite: { x: 1, y: 9 },
            animation: {
                frames: [
                    { alpha: 1.0, scale: 1.0, offsetY: 0 },
                    { alpha: 0.7, scale: 1.1, offsetY: -2 },
                    { alpha: 1.0, scale: 1.0, offsetY: 0 },
                    { alpha: 0.7, scale: 0.9, offsetY: 1 }
                ],
                frameRate: 6,
                loop: true
            },
            color: '#00b894'
        });
        
        this.statusIndicators.set('damage_boost', {
            sprite: { x: 2, y: 9 },
            animation: {
                frames: [
                    { alpha: 1.0, scale: 1.0, glow: 0 },
                    { alpha: 0.8, scale: 1.2, glow: 5 },
                    { alpha: 1.0, scale: 1.0, glow: 0 },
                    { alpha: 0.9, scale: 0.8, glow: 2 }
                ],
                frameRate: 5,
                loop: true
            },
            color: '#fd79a8'
        });
        
        this.statusIndicators.set('invulnerable', {
            sprite: { x: 3, y: 9 },
            animation: {
                frames: [
                    { alpha: 1.0, scale: 1.0, flash: false },
                    { alpha: 0.3, scale: 1.0, flash: true },
                    { alpha: 1.0, scale: 1.0, flash: false },
                    { alpha: 0.3, scale: 1.0, flash: true }
                ],
                frameRate: 8,
                loop: true
            },
            color: '#ffeaa7'
        });
    }
    
    // 初始化死亡动画
    initializeDeathAnimations() {
        this.deathAnimations.set('normal_enemy', {
            type: 'dissolve',
            duration: 800,
            frames: [
                { alpha: 1.0, scale: 1.0, rotation: 0, particles: 0 },
                { alpha: 0.8, scale: 1.1, rotation: 0.2, particles: 5 },
                { alpha: 0.5, scale: 1.3, rotation: 0.5, particles: 10 },
                { alpha: 0.2, scale: 1.5, rotation: 1.0, particles: 15 },
                { alpha: 0.0, scale: 2.0, rotation: 1.5, particles: 20 }
            ],
            particleColor: '#ff6b6b',
            sound: 'enemy_death'
        });
        
        this.deathAnimations.set('fast_enemy', {
            type: 'speed_burst',
            duration: 600,
            frames: [
                { alpha: 1.0, scale: 1.0, blur: 0, trails: 0 },
                { alpha: 0.7, scale: 0.8, blur: 2, trails: 3 },
                { alpha: 0.4, scale: 0.5, blur: 5, trails: 6 },
                { alpha: 0.1, scale: 0.2, blur: 8, trails: 10 },
                { alpha: 0.0, scale: 0.0, blur: 10, trails: 0 }
            ],
            particleColor: '#ff9f43',
            sound: 'fast_enemy_death'
        });
        
        this.deathAnimations.set('tank_enemy', {
            type: 'explosion',
            duration: 1200,
            frames: [
                { alpha: 1.0, scale: 1.0, shake: 0, explosion: 0 },
                { alpha: 0.9, scale: 1.1, shake: 2, explosion: 0.2 },
                { alpha: 0.7, scale: 1.3, shake: 5, explosion: 0.5 },
                { alpha: 0.4, scale: 1.6, shake: 8, explosion: 0.8 },
                { alpha: 0.1, scale: 2.0, shake: 10, explosion: 1.0 },
                { alpha: 0.0, scale: 2.5, shake: 0, explosion: 0 }
            ],
            particleColor: '#6c5ce7',
            sound: 'tank_explosion'
        });
        
        this.deathAnimations.set('ranged_enemy', {
            type: 'energy_discharge',
            duration: 900,
            frames: [
                { alpha: 1.0, scale: 1.0, energy: 0, sparks: 0 },
                { alpha: 0.8, scale: 1.2, energy: 0.3, sparks: 5 },
                { alpha: 0.6, scale: 1.4, energy: 0.6, sparks: 10 },
                { alpha: 0.3, scale: 1.7, energy: 0.9, sparks: 15 },
                { alpha: 0.0, scale: 2.0, energy: 1.0, sparks: 20 }
            ],
            particleColor: '#e84393',
            sound: 'energy_discharge'
        });
    }
    
    // 初始化AI行为视觉化
    initializeAIVisualization() {
        this.aiVisualization.set('attack_warning', {
            type: 'warning_indicator',
            duration: 1000,
            animation: {
                frames: [
                    { alpha: 0.0, scale: 0.5, color: '#ff7675' },
                    { alpha: 1.0, scale: 1.0, color: '#fd79a8' },
                    { alpha: 0.7, scale: 1.2, color: '#ff7675' },
                    { alpha: 1.0, scale: 1.0, color: '#fd79a8' }
                ],
                frameRate: 8,
                loop: true
            },
            shape: 'exclamation'
        });
        
        this.aiVisualization.set('path_preview', {
            type: 'movement_path',
            duration: 2000,
            style: {
                lineWidth: 2,
                strokeStyle: '#74b9ff',
                lineDash: [5, 5],
                alpha: 0.6
            },
            animation: {
                dashOffset: 0,
                speed: 2
            }
        });
        
        this.aiVisualization.set('detection_range', {
            type: 'range_circle',
            style: {
                strokeStyle: '#ffeaa7',
                lineWidth: 1,
                alpha: 0.3
            },
            animation: {
                pulseSpeed: 2,
                pulseIntensity: 0.2
            }
        });
        
        this.aiVisualization.set('charge_indicator', {
            type: 'charge_bar',
            duration: 2000,
            style: {
                width: 30,
                height: 4,
                backgroundColor: '#2d3436',
                fillColor: '#fd79a8',
                borderColor: '#636e72'
            },
            animation: {
                fillSpeed: 1,
                glowIntensity: 0.5
            }
        });
    }
    
    // 渲染角色精灵动画
    renderSpriteAnimation(ctx, character, animationName, frameIndex) {
        const animation = this.spriteAnimations.get(animationName);
        if (!animation) return;
        
        const frame = animation.frames[frameIndex % animation.frames.length];
        
        ctx.save();
        ctx.translate(character.x + frame.offsetX, character.y + frame.offsetY);
        ctx.scale(frame.scale || 1, frame.scale || 1);
        
        if (frame.tint) {
            ctx.fillStyle = frame.tint;
            ctx.globalCompositeOperation = 'multiply';
        }
        
        if (frame.alpha !== undefined) {
            ctx.globalAlpha = frame.alpha;
        }
        
        // 这里应该绘制实际的精灵图像
        // 目前用简单的形状代替
        this.drawSimpleSprite(ctx, frame, character);
        
        ctx.restore();
    }
    
    // 绘制简单精灵（代替实际图像）
    drawSimpleSprite(ctx, frame, character) {
        const size = character.radius || 15;
        
        // 主体
        ctx.fillStyle = character.color || '#4a90e2';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 细节
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.arc(size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 渲染玩家
    renderPlayer(ctx, player) {
        if (!player) return;
        
        ctx.save();
        
        // 确定当前动画状态
        let animationName = 'player_idle';
        if (player.isMoving) {
            animationName = 'player_walk';
        }
        if (player.isShooting || player.isAttacking) {
            animationName = 'player_shoot';
        }
        
        // 计算动画帧
        const currentTime = Date.now();
        const animation = this.spriteAnimations.get(animationName) || this.spriteAnimations.get('player_walk');
        const frameIndex = Math.floor(currentTime / (1000 / (animation?.frameRate || 8))) % (animation?.frames?.length || 1);
        
        // 渲染玩家精灵动画
        if (animation) {
            this.renderSpriteAnimation(ctx, player, animationName, frameIndex);
        } else {
            // 备用渲染方法
            this.renderBasicPlayer(ctx, player);
        }
        
        // 渲染状态效果
        this.renderPlayerStatusEffects(ctx, player);
        
        ctx.restore();
    }
    
    // 基础玩家渲染（备用方法）
    renderBasicPlayer(ctx, player) {
        ctx.save();
        ctx.translate(player.x, player.y);
        
        // 主体
        ctx.fillStyle = player.color || '#4a90e2';
        ctx.beginPath();
        ctx.arc(0, 0, player.radius || 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-5, -5, 3, 0, Math.PI * 2);
        ctx.arc(5, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5, -5, 1, 0, Math.PI * 2);
        ctx.arc(5, -5, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染玩家状态效果
    renderPlayerStatusEffects(ctx, player) {
        // 低血量警告
        if (player.lowHealthWarning) {
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.globalAlpha = player.lowHealthPulse || 0.5;
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, (player.radius || 15) + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // 无敌状态
        if (player.invulnerable) {
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(0, 0, (player.radius || 15) + 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // 技能冷却指示器
        if (player.skills) {
            this.renderSkillCooldowns(ctx, player);
        }
    }
    
    // 渲染技能冷却指示器
    renderSkillCooldowns(ctx, player) {
        const skillCount = player.skills.length;
        const startAngle = -Math.PI / 2;
        const angleStep = (Math.PI * 2) / skillCount;
        
        player.skills.forEach((skill, index) => {
            if (skill.cooldownRemaining > 0) {
                const angle = startAngle + (angleStep * index);
                const radius = (player.radius || 15) + 10;
                const x = player.x + Math.cos(angle) * radius;
                const y = player.y + Math.sin(angle) * radius;
                
                ctx.save();
                ctx.translate(x, y);
                
                // 冷却圆圈
                ctx.strokeStyle = '#95a5a6';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.stroke();
                
                // 冷却进度
                if (skill.cooldownProgress > 0) {
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * skill.cooldownProgress));
                    ctx.stroke();
                }
                
                ctx.restore();
            }
        });
    }
    
    // 渲染装备
    renderEquipment(ctx, character, weaponType) {
        const equipment = this.equipmentVisuals.get(weaponType);
        if (!equipment) return;
        
        ctx.save();
        ctx.translate(character.x, character.y);
        ctx.rotate(character.angle || 0);
        ctx.translate(equipment.offset.x, equipment.offset.y);
        
        // 绘制武器
        this.drawWeaponSprite(ctx, equipment);
        
        // 绘制枪口火光（如果正在射击）
        if (character.isShooting && equipment.muzzleFlash) {
            this.renderMuzzleFlash(ctx, equipment.muzzleFlash);
        }
        
        ctx.restore();
    }
    
    // 绘制武器精灵
    drawWeaponSprite(ctx, equipment) {
        // 简单的武器绘制
        ctx.fillStyle = '#636e72';
        ctx.fillRect(0, -2, 15, 4);
        
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(12, -1, 3, 2);
    }
    
    // 渲染枪口火光
    renderMuzzleFlash(ctx, muzzleFlash) {
        ctx.save();
        ctx.translate(15, 0);
        ctx.scale(muzzleFlash.scale, muzzleFlash.scale);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#ffd32a');
        gradient.addColorStop(0.6, '#ff9f43');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染状态指示器
    renderStatusIndicators(ctx, character) {
        if (!character.statusEffects) return;
        
        let indicatorIndex = 0;
        Object.keys(character.statusEffects).forEach(effectName => {
            const indicator = this.statusIndicators.get(effectName);
            if (!indicator) return;
            
            const x = character.x - 20 + (indicatorIndex * 12);
            const y = character.y - character.radius - 20;
            
            this.renderStatusIndicator(ctx, indicator, x, y, character.statusEffects[effectName]);
            indicatorIndex++;
        });
    }
    
    // 渲染单个状态指示器
    renderStatusIndicator(ctx, indicator, x, y, effect) {
        ctx.save();
        ctx.translate(x, y);
        
        // 应用动画效果
        const frameIndex = Math.floor(Date.now() / (1000 / indicator.animation.frameRate)) % indicator.animation.frames.length;
        const frame = indicator.animation.frames[frameIndex];
        
        ctx.globalAlpha = frame.alpha || 1;
        ctx.scale(frame.scale || 1, frame.scale || 1);
        
        if (frame.rotation) {
            ctx.rotate(frame.rotation);
        }
        
        // 绘制指示器
        ctx.fillStyle = indicator.color;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制发光效果
        if (frame.glow) {
            ctx.shadowColor = indicator.color;
            ctx.shadowBlur = frame.glow;
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 渲染死亡动画
    renderDeathAnimation(ctx, character, animationProgress) {
        const deathAnim = this.deathAnimations.get(character.type + '_enemy');
        if (!deathAnim) return;
        
        const frameIndex = Math.floor(animationProgress * deathAnim.frames.length);
        const frame = deathAnim.frames[Math.min(frameIndex, deathAnim.frames.length - 1)];
        
        ctx.save();
        ctx.translate(character.x, character.y);
        
        // 应用死亡效果
        ctx.globalAlpha = frame.alpha;
        ctx.scale(frame.scale, frame.scale);
        
        if (frame.rotation) {
            ctx.rotate(frame.rotation);
        }
        
        // 绘制角色（逐渐消失）
        this.drawSimpleSprite(ctx, frame, character);
        
        // 绘制粒子效果
        if (frame.particles) {
            this.renderDeathParticles(ctx, deathAnim, frame.particles);
        }
        
        ctx.restore();
    }
    
    // 渲染死亡粒子
    renderDeathParticles(ctx, deathAnim, particleCount) {
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 30;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            ctx.fillStyle = deathAnim.particleColor;
            ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 渲染AI行为可视化
    renderAIVisualization(ctx, character, visualizationType, data) {
        const visualization = this.aiVisualization.get(visualizationType);
        if (!visualization) return;
        
        switch (visualization.type) {
            case 'warning_indicator':
                this.renderWarningIndicator(ctx, character, visualization);
                break;
            case 'movement_path':
                this.renderMovementPath(ctx, data.path, visualization);
                break;
            case 'range_circle':
                this.renderRangeCircle(ctx, character, data.range, visualization);
                break;
            case 'charge_bar':
                this.renderChargeBar(ctx, character, data.progress, visualization);
                break;
        }
    }
    
    // 渲染警告指示器
    renderWarningIndicator(ctx, character, visualization) {
        const frameIndex = Math.floor(Date.now() / (1000 / visualization.animation.frameRate)) % visualization.animation.frames.length;
        const frame = visualization.animation.frames[frameIndex];
        
        ctx.save();
        ctx.translate(character.x, character.y - character.radius - 15);
        ctx.globalAlpha = frame.alpha;
        ctx.scale(frame.scale, frame.scale);
        
        // 绘制感叹号
        ctx.fillStyle = frame.color;
        ctx.fillRect(-2, -8, 4, 6);
        ctx.beginPath();
        ctx.arc(0, 4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染移动路径
    renderMovementPath(ctx, path, visualization) {
        if (!path || path.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = visualization.style.strokeStyle;
        ctx.lineWidth = visualization.style.lineWidth;
        ctx.globalAlpha = visualization.style.alpha;
        ctx.setLineDash(visualization.style.lineDash);
        
        // 动画虚线偏移
        const dashOffset = (Date.now() * visualization.animation.speed) % 20;
        ctx.lineDashOffset = dashOffset;
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 渲染范围圆圈
    renderRangeCircle(ctx, character, range, visualization) {
        ctx.save();
        ctx.translate(character.x, character.y);
        
        // 脉冲效果
        const pulseOffset = Math.sin(Date.now() * 0.001 * visualization.animation.pulseSpeed) * visualization.animation.pulseIntensity;
        const currentRange = range + (range * pulseOffset);
        
        ctx.strokeStyle = visualization.style.strokeStyle;
        ctx.lineWidth = visualization.style.lineWidth;
        ctx.globalAlpha = visualization.style.alpha;
        
        ctx.beginPath();
        ctx.arc(0, 0, currentRange, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 渲染充能条
    renderChargeBar(ctx, character, progress, visualization) {
        const style = visualization.style;
        const x = character.x - style.width / 2;
        const y = character.y - character.radius - 25;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(x, y, style.width, style.height);
        
        // 充能进度
        ctx.fillStyle = style.fillColor;
        ctx.fillRect(x, y, style.width * progress, style.height);
        
        // 发光效果
        if (progress > 0.8) {
            ctx.shadowColor = style.fillColor;
            ctx.shadowBlur = visualization.animation.glowIntensity * 10;
            ctx.fillRect(x, y, style.width * progress, style.height);
        }
        
        // 边框
        ctx.strokeStyle = style.borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, style.width, style.height);
        
        ctx.restore();
    }
    
    // 获取动画帧索引
    getAnimationFrame(animationName, startTime) {
        const animation = this.spriteAnimations.get(animationName);
        if (!animation) return 0;
        
        const elapsed = Date.now() - startTime;
        const frameTime = 1000 / animation.frameRate;
        return Math.floor(elapsed / frameTime) % animation.frames.length;
    }
    
    // 检查动画是否完成
    isAnimationComplete(animationName, startTime) {
        const animation = this.spriteAnimations.get(animationName);
        if (!animation || animation.loop) return false;
        
        const elapsed = Date.now() - startTime;
        const totalDuration = (animation.frames.length / animation.frameRate) * 1000;
        return elapsed >= totalDuration;
    }
    
    // 更新玩家视觉效果
    updatePlayer(player, deltaTime) {
        if (!player) return;
        
        // 更新玩家动画状态
        if (player.isMoving) {
            if (!player.animationState || player.animationState !== 'walk') {
                player.animationState = 'walk';
                player.animationStartTime = Date.now();
            }
        } else if (player.isShooting) {
            if (!player.animationState || player.animationState !== 'shoot') {
                player.animationState = 'shoot';
                player.animationStartTime = Date.now();
            }
        } else {
            if (player.animationState && player.animationState !== 'idle') {
                player.animationState = 'idle';
                player.animationStartTime = Date.now();
            }
        }
        
        // 更新装备视觉效果
        if (player.equipment) {
            this.updateEquipmentVisuals(player, deltaTime);
        }
        
        // 更新状态指示器
        this.updateStatusIndicators(player, deltaTime);
    }
    
    // 更新装备视觉效果
    updateEquipmentVisuals(player, deltaTime) {
        // 武器发光效果
        if (player.weapon && player.weapon.level > 1) {
            const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            player.weapon.glowIntensity = glowIntensity;
        }
    }
    
    // 更新状态指示器
    updateStatusIndicators(player, deltaTime) {
        // 更新生命值指示器
        if (player.health < player.maxHealth * 0.3) {
            player.lowHealthWarning = true;
            player.lowHealthPulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        } else {
            player.lowHealthWarning = false;
        }
        
        // 更新技能冷却指示器
        if (player.skills) {
            for (const skill of player.skills) {
                if (skill.cooldownRemaining > 0) {
                    skill.cooldownProgress = 1 - (skill.cooldownRemaining / skill.cooldown);
                }
            }
        }
    }
}

// 创建全局实例
window.characterVisualSystem = new CharacterVisualSystem();

console.log('角色视觉系统已加载 - 使用 F4 键查看可用功能');