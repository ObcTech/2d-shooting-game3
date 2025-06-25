// 环境特效系统
class EnvironmentEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.backgroundParticles = [];
        this.gridGlowIntensity = 0;
        this.gridGlowDirection = 1;
        
        this.init();
    }
    
    init() {
        // 初始化背景粒子
        if (VISUAL_CONFIG.ENVIRONMENT.BACKGROUND_PARTICLES.enabled) {
            this.createBackgroundParticles();
        }
    }
    
    createBackgroundParticles() {
        const config = VISUAL_CONFIG.ENVIRONMENT.BACKGROUND_PARTICLES;
        
        for (let i = 0; i < config.count; i++) {
            this.backgroundParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * config.speed,
                vy: (Math.random() - 0.5) * config.speed,
                size: Math.random() * config.size + 0.5,
                alpha: Math.random() * 0.3 + 0.1,
                life: Math.random() * 200 + 100
            });
        }
    }
    
    update(deltaTime) {
        // 更新网格发光效果
        if (VISUAL_CONFIG.ENVIRONMENT.GRID_GLOW.enabled) {
            this.updateGridGlow();
        }
        
        // 更新背景粒子
        if (VISUAL_CONFIG.ENVIRONMENT.BACKGROUND_PARTICLES.enabled) {
            this.updateBackgroundParticles(deltaTime);
        }
    }
    
    updateGridGlow() {
        const config = VISUAL_CONFIG.ENVIRONMENT.GRID_GLOW;
        this.gridGlowIntensity += config.pulse_speed * this.gridGlowDirection;
        
        if (this.gridGlowIntensity >= config.intensity) {
            this.gridGlowDirection = -1;
        } else if (this.gridGlowIntensity <= 0) {
            this.gridGlowDirection = 1;
        }
    }
    
    updateBackgroundParticles(deltaTime) {
        for (let i = this.backgroundParticles.length - 1; i >= 0; i--) {
            const particle = this.backgroundParticles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // 边界检查
            if (particle.x < 0 || particle.x > this.width || 
                particle.y < 0 || particle.y > this.height || 
                particle.life <= 0) {
                this.backgroundParticles.splice(i, 1);
                
                // 重新生成粒子
                const config = VISUAL_CONFIG.ENVIRONMENT.BACKGROUND_PARTICLES;
                this.backgroundParticles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * config.speed,
                    vy: (Math.random() - 0.5) * config.speed,
                    size: Math.random() * config.size + 0.5,
                    alpha: Math.random() * 0.3 + 0.1,
                    life: Math.random() * 200 + 100
                });
            }
        }
    }
    
    renderEnhancedGrid(levelConfig) {
        if (!VISUAL_CONFIG.ENVIRONMENT.GRID_GLOW.enabled) {
            return this.renderBasicGrid(levelConfig);
        }
        
        const glowIntensity = this.gridGlowIntensity;
        
        // 基础网格
        this.ctx.strokeStyle = levelConfig.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
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
        
        // 发光网格
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = glowIntensity;
        this.ctx.shadowColor = '#4ecdc4';
        this.ctx.shadowBlur = 5;
        
        // 只绘制部分发光线条
        for (let x = 0; x < this.width; x += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    renderBasicGrid(levelConfig) {
        this.ctx.strokeStyle = levelConfig.gridColor;
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
    
    renderBackgroundParticles() {
        if (!VISUAL_CONFIG.ENVIRONMENT.BACKGROUND_PARTICLES.enabled) {
            return;
        }
        
        this.ctx.save();
        
        for (const particle of this.backgroundParticles) {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    createLightning(startX, startY, endX, endY, intensity = 1.0) {
        const segments = 8;
        const points = [];
        
        // 生成闪电路径点
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            
            // 添加随机偏移
            const offset = (Math.random() - 0.5) * 20 * intensity;
            const perpX = -(endY - startY) / Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            const perpY = (endX - startX) / Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            
            points.push({
                x: x + perpX * offset,
                y: y + perpY * offset
            });
        }
        
        // 绘制闪电
        this.ctx.save();
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 3 * intensity;
        this.ctx.shadowColor = '#4ecdc4';
        this.ctx.shadowBlur = 10 * intensity;
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    createEnergyField(centerX, centerY, radius, intensity = 1.0) {
        const rings = 3;
        const time = Date.now() * 0.001;
        
        this.ctx.save();
        
        for (let i = 0; i < rings; i++) {
            const ringRadius = radius * (0.3 + i * 0.35);
            const alpha = (1 - i / rings) * intensity * 0.3;
            const rotation = time * (i + 1) * 0.5;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = '#4ecdc4';
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = '#4ecdc4';
            this.ctx.shadowBlur = 5;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(rotation);
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.rotate(-rotation);
            this.ctx.translate(-centerX, -centerY);
        }
        
        this.ctx.restore();
    }
}

// 创建全局环境特效实例
if (typeof window !== 'undefined') {
    window.EnvironmentEffects = EnvironmentEffects;
}