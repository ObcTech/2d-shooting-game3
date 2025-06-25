/**
 * 武器特效系统
 * 为不同武器提供独特的视觉效果和音效
 */

class WeaponEffectsManager {
    constructor() {
        this.muzzleFlashes = [];
        this.weaponTrails = [];
        this.impactEffects = [];
        
        this.initializeWeaponConfigs();
    }
    
    initializeWeaponConfigs() {
        this.weaponConfigs = {
            PISTOL: {
                muzzleFlash: {
                    size: 15,
                    color: '#feca57',
                    duration: 8,
                    particles: 5
                },
                trail: {
                    enabled: true,
                    color: '#feca57',
                    width: 2,
                    length: 8
                },
                impact: {
                    particles: 8,
                    colors: ['#feca57', '#ff9ff3'],
                    size: 12
                }
            },
            SHOTGUN: {
                muzzleFlash: {
                    size: 25,
                    color: '#ff6b6b',
                    duration: 12,
                    particles: 12
                },
                trail: {
                    enabled: true,
                    color: '#ff6b6b',
                    width: 1.5,
                    length: 6
                },
                impact: {
                    particles: 6,
                    colors: ['#ff6b6b', '#ff7675'],
                    size: 10
                }
            },
            LASER: {
                muzzleFlash: {
                    size: 20,
                    color: '#00ff00',
                    duration: 6,
                    particles: 8
                },
                trail: {
                    enabled: true,
                    color: '#00ff00',
                    width: 3,
                    length: 15,
                    glow: true
                },
                impact: {
                    particles: 12,
                    colors: ['#00ff00', '#00d2d3'],
                    size: 15
                }
            },
            ROCKET: {
                muzzleFlash: {
                    size: 35,
                    color: '#ff4757',
                    duration: 15,
                    particles: 20
                },
                trail: {
                    enabled: true,
                    color: '#ff4757',
                    width: 4,
                    length: 20,
                    smoke: true
                },
                impact: {
                    particles: 25,
                    colors: ['#ff4757', '#ffa502', '#ff6b6b'],
                    size: 30,
                    explosion: true
                }
            }
        };
    }
    
    createMuzzleFlash(x, y, angle, weaponType) {
        const config = this.weaponConfigs[weaponType]?.muzzleFlash;
        if (!config) return;
        
        // 创建枪口火光粒子效果
        window.enhancedParticles.createEffect('muzzleFlash', x, y, {
            angle: angle,
            spread: 0.8,
            intensity: config.particles / 8
        });
        
        // 添加枪口闪光
        this.muzzleFlashes.push({
            x: x,
            y: y,
            angle: angle,
            size: config.size,
            color: config.color,
            life: config.duration,
            maxLife: config.duration
        });
        
        // 屏幕震动
        const shakeIntensity = weaponType === 'ROCKET' ? 8 : 
                              weaponType === 'SHOTGUN' ? 4 : 2;
        window.screenShake.shake(shakeIntensity, 10);
    }
    
    createBulletTrail(bullet) {
        const config = this.weaponConfigs[bullet.weaponType]?.trail;
        if (!config || !config.enabled) return;
        
        // 为激光武器创建连续光束效果
        if (bullet.weaponType === 'LASER') {
            this.createLaserBeam(bullet);
        }
        
        // 为火箭创建烟雾尾迹
        if (bullet.weaponType === 'ROCKET') {
            this.createRocketTrail(bullet);
        }
        
        // 创建轨迹粒子
        if (Math.random() < 0.3) { // 30%概率创建轨迹粒子
            window.enhancedParticles.createEffect('trail', bullet.x, bullet.y, {
                angle: Math.atan2(bullet.vy, bullet.vx) + Math.PI,
                intensity: 0.5
            });
        }
    }
    
    createTrail(bullet) {
        this.createBulletTrail(bullet);
    }
    
    createLaserBeam(bullet) {
        // 激光束特效
        this.weaponTrails.push({
            type: 'laser',
            startX: bullet.x - bullet.vx * 2,
            startY: bullet.y - bullet.vy * 2,
            endX: bullet.x,
            endY: bullet.y,
            color: '#00ff00',
            width: 3,
            life: 5,
            glow: true
        });
    }
    
    createRocketTrail(bullet) {
        // 火箭尾焰
        const trailX = bullet.x - bullet.vx * 0.5;
        const trailY = bullet.y - bullet.vy * 0.5;
        
        window.enhancedParticles.createEffect('explosion', trailX, trailY, {
            angle: Math.atan2(bullet.vy, bullet.vx) + Math.PI,
            spread: 0.3,
            intensity: 0.3
        });
    }
    
    createImpactEffect(x, y, weaponType, isExplosive = false) {
        const config = this.weaponConfigs[weaponType]?.impact;
        if (!config) return;
        
        if (isExplosive) {
            // 爆炸效果
            window.enhancedParticles.createEffect('explosion', x, y, {
                intensity: 2.0
            });
            
            // 强烈屏幕震动
            window.screenShake.shake(15, 20);
            
            // 冲击波效果
            this.createShockwave(x, y, 50);
        } else {
            // 普通撞击效果
            window.enhancedParticles.createEffect('impact', x, y, {
                intensity: 1.0
            });
            
            // 轻微震动
            window.screenShake.shake(3, 5);
        }
    }
    
    createImpact(x, y, weaponType, isExplosive = false) {
        this.createImpactEffect(x, y, weaponType, isExplosive);
    }
    
    createShockwave(x, y, radius) {
        this.impactEffects.push({
            type: 'shockwave',
            x: x,
            y: y,
            radius: 0,
            maxRadius: radius,
            life: 30,
            maxLife: 30
        });
    }
    
    update() {
        // 更新枪口火光
        for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
            const flash = this.muzzleFlashes[i];
            flash.life--;
            
            if (flash.life <= 0) {
                this.muzzleFlashes.splice(i, 1);
            }
        }
        
        // 更新武器轨迹
        for (let i = this.weaponTrails.length - 1; i >= 0; i--) {
            const trail = this.weaponTrails[i];
            trail.life--;
            
            if (trail.life <= 0) {
                this.weaponTrails.splice(i, 1);
            }
        }
        
        // 更新撞击效果
        for (let i = this.impactEffects.length - 1; i >= 0; i--) {
            const effect = this.impactEffects[i];
            
            if (effect.type === 'shockwave') {
                effect.life--;
                effect.radius = effect.maxRadius * (1 - effect.life / effect.maxLife);
                
                if (effect.life <= 0) {
                    this.impactEffects.splice(i, 1);
                }
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // 渲染枪口火光
        for (const flash of this.muzzleFlashes) {
            this.renderMuzzleFlash(ctx, flash);
        }
        
        // 渲染武器轨迹
        for (const trail of this.weaponTrails) {
            this.renderWeaponTrail(ctx, trail);
        }
        
        // 渲染撞击效果
        for (const effect of this.impactEffects) {
            this.renderImpactEffect(ctx, effect);
        }
        
        ctx.restore();
    }
    
    renderMuzzleFlash(ctx, flash) {
        const alpha = flash.life / flash.maxLife;
        const size = flash.size * (0.5 + alpha * 0.5);
        
        ctx.save();
        ctx.translate(flash.x, flash.y);
        ctx.rotate(flash.angle);
        
        // 外发光
        ctx.shadowColor = flash.color;
        ctx.shadowBlur = size;
        
        // 主火光
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, flash.color);
        gradient.addColorStop(0.5, flash.color + '80');
        gradient.addColorStop(1, flash.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    renderWeaponTrail(ctx, trail) {
        if (trail.type === 'laser') {
            ctx.save();
            
            // 激光束发光效果
            ctx.shadowColor = trail.color;
            ctx.shadowBlur = trail.width * 3;
            
            ctx.strokeStyle = trail.color;
            ctx.lineWidth = trail.width;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(trail.startX, trail.startY);
            ctx.lineTo(trail.endX, trail.endY);
            ctx.stroke();
            
            // 内核
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = trail.width * 0.3;
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    renderImpactEffect(ctx, effect) {
        if (effect.type === 'shockwave') {
            const alpha = effect.life / effect.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // 冲击波环
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    // 清理所有效果
    clear() {
        this.muzzleFlashes.length = 0;
        this.weaponTrails.length = 0;
        this.impactEffects.length = 0;
    }
}

// 全局实例
window.weaponEffects = new WeaponEffectsManager();