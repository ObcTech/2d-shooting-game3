/**
 * 增强粒子系统
 * 支持多层粒子效果、对象池管理和性能优化
 */

class EnhancedParticleSystem {
    constructor() {
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 500;
        this.effects = new Map();
        
        this.initializeEffects();
    }
    
    initializeEffects() {
        // 预定义特效配置
        this.effects.set('explosion', {
            particleCount: 20,
            speed: { min: 2, max: 8 },
            size: { min: 2, max: 6 },
            life: { min: 30, max: 60 },
            colors: ['#ff6b6b', '#ffa502', '#ff7675', '#fd79a8'],
            gravity: 0.1,
            friction: 0.95
        });
        
        this.effects.set('muzzleFlash', {
            particleCount: 8,
            speed: { min: 1, max: 4 },
            size: { min: 1, max: 3 },
            life: { min: 10, max: 20 },
            colors: ['#feca57', '#ff9ff3', '#54a0ff'],
            gravity: 0,
            friction: 0.9
        });
        
        this.effects.set('impact', {
            particleCount: 12,
            speed: { min: 1, max: 5 },
            size: { min: 1, max: 4 },
            life: { min: 15, max: 30 },
            colors: ['#4ecdc4', '#45b7d1', '#96ceb4'],
            gravity: 0.05,
            friction: 0.92
        });
        
        this.effects.set('trail', {
            particleCount: 3,
            speed: { min: 0.5, max: 2 },
            size: { min: 1, max: 2 },
            life: { min: 20, max: 40 },
            colors: ['#74b9ff', '#0984e3', '#00b894'],
            gravity: 0,
            friction: 0.98
        });
    }
    
    createEffect(type, x, y, options = {}) {
        const config = this.effects.get(type);
        if (!config) return;
        
        const particleCount = options.intensity ? 
            Math.floor(config.particleCount * options.intensity) : 
            config.particleCount;
            
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                this.initializeParticle(particle, config, x, y, options);
                this.particles.push(particle);
            }
        }
    }
    
    createExplosion(x, y, options = {}) {
        this.createEffect('explosion', x, y, options);
    }
    
    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        
        if (this.particles.length < this.maxParticles) {
            return new EnhancedParticle();
        }
        
        return null;
    }
    
    returnParticleToPool(particle) {
        if (this.particlePool.length < 100) {
            particle.reset();
            this.particlePool.push(particle);
        }
    }
    
    initializeParticle(particle, config, x, y, options) {
        const angle = options.angle !== undefined ? 
            options.angle + (Math.random() - 0.5) * (options.spread || 0.5) :
            Math.random() * Math.PI * 2;
            
        const speed = this.randomBetween(config.speed.min, config.speed.max);
        const size = this.randomBetween(config.size.min, config.size.max);
        const life = this.randomBetween(config.life.min, config.life.max);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        
        particle.initialize(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            size, life, color,
            config.gravity,
            config.friction
        );
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
                this.returnParticleToPool(particle);
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        for (const particle of this.particles) {
            particle.render(ctx);
        }
        
        ctx.restore();
    }
    
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
    
    clear() {
        for (const particle of this.particles) {
            this.returnParticleToPool(particle);
        }
        this.particles.length = 0;
    }
}

class EnhancedParticle {
    constructor() {
        this.reset();
    }
    
    initialize(x, y, vx, vy, size, life, color, gravity, friction) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.maxSize = size;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.gravity = gravity;
        this.friction = friction;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.life--;
        
        // 粒子大小随生命周期变化
        const lifeRatio = this.life / this.maxLife;
        this.size = this.maxSize * Math.max(0, lifeRatio);
    }
    
    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        
        if (alpha <= 0 || this.size <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 解析颜色并添加透明度
        const color = this.parseColor(this.color);
        
        // 外发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 2;
        
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 内核高亮
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    parseColor(hexColor) {
        const hex = hexColor.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    }
    
    isDead() {
        return this.life <= 0;
    }
    
    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 0;
        this.maxSize = 0;
        this.life = 0;
        this.maxLife = 0;
        this.color = '#ffffff';
        this.gravity = 0;
        this.friction = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }
}

// 屏幕震动效果管理器
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    shake(intensity, duration) {
        this.intensity = Math.max(this.intensity, intensity);
        this.duration = Math.max(this.duration, duration);
    }
    
    update() {
        if (this.duration > 0) {
            this.duration--;
            const currentIntensity = this.intensity * (this.duration / 60); // 假设60帧为基准
            
            this.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
            this.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
            
            if (this.duration <= 0) {
                this.intensity = 0;
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }
    }
    
    apply(ctx) {
        if (this.intensity > 0) {
            ctx.translate(this.offsetX, this.offsetY);
        }
    }
    
    getOffset() {
        return {
            x: this.offsetX,
            y: this.offsetY
        };
    }
    
    reset(ctx) {
        if (this.intensity > 0) {
            ctx.translate(-this.offsetX, -this.offsetY);
        }
    }
}

// 伤害数字显示系统
class DamageNumbers {
    constructor() {
        this.numbers = [];
    }
    
    addDamage(x, y, damage, type = 'normal') {
        const colors = {
            normal: '#ff6b6b',
            critical: '#feca57',
            heal: '#2ed573'
        };
        
        this.numbers.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            damage: damage,
            life: 60,
            maxLife: 60,
            color: colors[type] || colors.normal,
            vy: -2,
            scale: type === 'critical' ? 1.5 : 1
        });
    }
    
    show(x, y, damage, type = 'normal') {
        this.addDamage(x, y, damage, type);
    }
    
    update() {
        for (let i = this.numbers.length - 1; i >= 0; i--) {
            const num = this.numbers[i];
            num.y += num.vy;
            num.vy *= 0.95;
            num.life--;
            
            if (num.life <= 0) {
                this.numbers.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        for (const num of this.numbers) {
            const alpha = num.life / num.maxLife;
            const scale = num.scale * (0.5 + alpha * 0.5);
            
            ctx.save();
            ctx.translate(num.x, num.y);
            ctx.scale(scale, scale);
            
            // 文字阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(num.damage.toString(), 1, 1);
            
            // 主文字
            ctx.fillStyle = num.color;
            ctx.fillText(num.damage.toString(), 0, 0);
            
            ctx.restore();
        }
        
        ctx.restore();
    }
}

// 全局实例
window.enhancedParticles = new EnhancedParticleSystem();
window.screenShake = new ScreenShake();
window.damageNumbers = new DamageNumbers();