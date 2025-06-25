/**
 * 环境美术系统
 * 实现动态背景、星空效果、地图装饰等环境美术功能
 */

class EnvironmentArtSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 星空系统
        this.stars = [];
        this.nebula = [];
        this.planets = [];
        
        // 动态背景
        this.backgroundLayers = [];
        this.scrollSpeed = 0.5;
        
        // 地图装饰
        this.decorations = [];
        this.debris = [];
        
        // 环境效果
        this.environmentEffects = [];
        
        this.initializeEnvironment();
    }
    
    initializeEnvironment() {
        this.createStarField();
        this.createNebula();
        this.createPlanets();
        this.createBackgroundLayers();
        this.createDecorations();
        this.createDebris();
    }
    
    // 创建星空
    createStarField() {
        const starCount = 200;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: this.getStarColor(),
                layer: Math.floor(Math.random() * 3) // 0-2 层深度
            });
        }
    }
    
    // 获取星星颜色
    getStarColor() {
        const colors = [
            '#ffffff', '#ffffcc', '#ffcccc', '#ccccff', 
            '#ccffcc', '#ffccff', '#ccffff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 创建星云
    createNebula() {
        const nebulaCount = 5;
        
        for (let i = 0; i < nebulaCount; i++) {
            this.nebula.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: Math.random() * 300 + 200,
                height: Math.random() * 200 + 100,
                color: this.getNebulaColor(),
                alpha: Math.random() * 0.3 + 0.1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001,
                pulseSpeed: Math.random() * 0.01 + 0.005,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // 获取星云颜色
    getNebulaColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 创建行星
    createPlanets() {
        const planetCount = 3;
        
        for (let i = 0; i < planetCount; i++) {
            this.planets.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 50 + 30,
                color: this.getPlanetColor(),
                ringColor: this.getPlanetRingColor(),
                hasRing: Math.random() > 0.5,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                atmosphere: Math.random() > 0.3,
                atmosphereColor: this.getAtmosphereColor()
            });
        }
    }
    
    // 获取行星颜色
    getPlanetColor() {
        const colors = [
            '#ff7675', '#74b9ff', '#00b894', '#fdcb6e',
            '#e17055', '#6c5ce7', '#a29bfe', '#fd79a8'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 获取行星环颜色
    getPlanetRingColor() {
        const colors = ['#ddd', '#ccc', '#bbb', '#aaa'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 获取大气层颜色
    getAtmosphereColor() {
        const colors = [
            'rgba(116, 185, 255, 0.3)',
            'rgba(0, 184, 148, 0.3)',
            'rgba(253, 203, 110, 0.3)',
            'rgba(225, 112, 85, 0.3)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 创建背景层
    createBackgroundLayers() {
        // 远景层
        this.backgroundLayers.push({
            type: 'gradient',
            colors: ['#0c0c0c', '#1a1a2e', '#16213e'],
            speed: 0.1
        });
        
        // 中景层
        this.backgroundLayers.push({
            type: 'pattern',
            pattern: 'grid',
            color: 'rgba(255, 255, 255, 0.05)',
            size: 50,
            speed: 0.3
        });
        
        // 近景层
        this.backgroundLayers.push({
            type: 'pattern',
            pattern: 'dots',
            color: 'rgba(255, 255, 255, 0.1)',
            size: 20,
            speed: 0.5
        });
    }
    
    // 创建装饰物
    createDecorations() {
        const decorationCount = 10;
        
        for (let i = 0; i < decorationCount; i++) {
            this.decorations.push({
                type: this.getDecorationType(),
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 30 + 10,
                color: this.getDecorationColor(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                alpha: Math.random() * 0.7 + 0.3,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    // 获取装饰类型
    getDecorationType() {
        const types = ['crystal', 'station', 'satellite', 'asteroid', 'beacon'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    // 获取装饰颜色
    getDecorationColor() {
        const colors = [
            '#00cec9', '#6c5ce7', '#a29bfe', '#fd79a8',
            '#fdcb6e', '#e17055', '#74b9ff', '#55a3ff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 创建太空垃圾
    createDebris() {
        const debrisCount = 15;
        
        for (let i = 0; i < debrisCount; i++) {
            this.debris.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 5 + 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                color: '#666',
                trail: []
            });
        }
    }
    
    // 更新环境
    update(deltaTime) {
        this.updateStars(deltaTime);
        this.updateNebula(deltaTime);
        this.updatePlanets(deltaTime);
        this.updateDecorations(deltaTime);
        this.updateDebris(deltaTime);
        this.updateEnvironmentEffects(deltaTime);
    }
    
    // 更新星星
    updateStars(deltaTime) {
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            star.y += this.scrollSpeed * (star.layer + 1);
            
            // 重置位置
            if (star.y > this.canvas.height) {
                star.y = -10;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    // 更新星云
    updateNebula(deltaTime) {
        this.nebula.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
            nebula.pulsePhase += nebula.pulseSpeed;
            nebula.y += this.scrollSpeed * 0.2;
            
            if (nebula.y > this.canvas.height + nebula.height) {
                nebula.y = -nebula.height;
                nebula.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    // 更新行星
    updatePlanets(deltaTime) {
        this.planets.forEach(planet => {
            planet.rotation += planet.rotationSpeed;
            planet.y += this.scrollSpeed * 0.1;
            
            if (planet.y > this.canvas.height + planet.radius) {
                planet.y = -planet.radius;
                planet.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    // 更新装饰物
    updateDecorations(deltaTime) {
        this.decorations.forEach(decoration => {
            decoration.rotation += decoration.rotationSpeed;
            decoration.y += this.scrollSpeed * 0.7;
            
            if (decoration.y > this.canvas.height + decoration.size) {
                decoration.y = -decoration.size;
                decoration.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    // 更新太空垃圾
    updateDebris(deltaTime) {
        this.debris.forEach(debris => {
            debris.x += debris.vx;
            debris.y += debris.vy + this.scrollSpeed;
            debris.rotation += debris.rotationSpeed;
            
            // 添加轨迹
            debris.trail.push({ x: debris.x, y: debris.y });
            if (debris.trail.length > 5) {
                debris.trail.shift();
            }
            
            // 重置位置
            if (debris.y > this.canvas.height + 10) {
                debris.y = -10;
                debris.x = Math.random() * this.canvas.width;
                debris.trail = [];
            }
            
            if (debris.x < -10 || debris.x > this.canvas.width + 10) {
                debris.x = Math.random() * this.canvas.width;
                debris.y = -10;
                debris.trail = [];
            }
        });
    }
    
    // 更新环境效果
    updateEnvironmentEffects(deltaTime) {
        this.environmentEffects = this.environmentEffects.filter(effect => {
            effect.life -= deltaTime;
            effect.update(deltaTime);
            return effect.life > 0;
        });
    }
    
    // 渲染环境
    render() {
        this.renderBackgroundLayers();
        this.renderNebula();
        this.renderPlanets();
        this.renderStars();
        this.renderDecorations();
        this.renderDebris();
        this.renderEnvironmentEffects();
    }
    
    // 渲染背景层
    renderBackgroundLayers() {
        this.backgroundLayers.forEach(layer => {
            if (layer.type === 'gradient') {
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                layer.colors.forEach((color, index) => {
                    gradient.addColorStop(index / (layer.colors.length - 1), color);
                });
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });
    }
    
    // 渲染星云
    renderNebula() {
        this.nebula.forEach(nebula => {
            this.ctx.save();
            this.ctx.translate(nebula.x, nebula.y);
            this.ctx.rotate(nebula.rotation);
            
            const pulse = Math.sin(nebula.pulsePhase) * 0.2 + 0.8;
            this.ctx.globalAlpha = nebula.alpha * pulse;
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.width / 2);
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(-nebula.width / 2, -nebula.height / 2, nebula.width, nebula.height);
            
            this.ctx.restore();
        });
    }
    
    // 渲染行星
    renderPlanets() {
        this.planets.forEach(planet => {
            this.ctx.save();
            
            // 大气层
            if (planet.atmosphere) {
                this.ctx.fillStyle = planet.atmosphereColor;
                this.ctx.beginPath();
                this.ctx.arc(planet.x, planet.y, planet.radius * 1.2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 行星主体
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 行星环
            if (planet.hasRing) {
                this.ctx.strokeStyle = planet.ringColor;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(planet.x, planet.y, planet.radius * 1.5, 0, Math.PI * 2);
                this.ctx.stroke();
                
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(planet.x, planet.y, planet.radius * 1.7, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    // 渲染星星
    renderStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            this.ctx.globalAlpha = star.brightness * twinkle;
            this.ctx.fillStyle = star.color;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 添加星光效果
            if (star.size > 1.5) {
                this.ctx.strokeStyle = star.color;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(star.x - star.size * 2, star.y);
                this.ctx.lineTo(star.x + star.size * 2, star.y);
                this.ctx.moveTo(star.x, star.y - star.size * 2);
                this.ctx.lineTo(star.x, star.y + star.size * 2);
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染装饰物
    renderDecorations() {
        this.decorations.forEach(decoration => {
            this.ctx.save();
            this.ctx.translate(decoration.x, decoration.y);
            this.ctx.rotate(decoration.rotation);
            this.ctx.globalAlpha = decoration.alpha;
            
            this.renderDecoration(decoration);
            
            this.ctx.restore();
        });
    }
    
    // 渲染单个装饰物
    renderDecoration(decoration) {
        this.ctx.fillStyle = decoration.color;
        this.ctx.strokeStyle = decoration.color;
        
        switch (decoration.type) {
            case 'crystal':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -decoration.size);
                this.ctx.lineTo(decoration.size * 0.5, 0);
                this.ctx.lineTo(0, decoration.size);
                this.ctx.lineTo(-decoration.size * 0.5, 0);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'station':
                this.ctx.fillRect(-decoration.size / 2, -decoration.size / 2, decoration.size, decoration.size);
                this.ctx.strokeRect(-decoration.size / 3, -decoration.size / 3, decoration.size * 2 / 3, decoration.size * 2 / 3);
                break;
                
            case 'satellite':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, decoration.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeRect(-decoration.size, -2, decoration.size * 2, 4);
                break;
                
            case 'asteroid':
                this.ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = decoration.size * (0.7 + Math.random() * 0.3);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'beacon':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, decoration.size / 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                const pulse = Math.sin(Date.now() * decoration.pulseSpeed) * 0.5 + 0.5;
                this.ctx.globalAlpha = pulse * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, decoration.size, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
        }
    }
    
    // 渲染太空垃圾
    renderDebris() {
        this.debris.forEach(debris => {
            // 渲染轨迹
            if (debris.trail.length > 1) {
                this.ctx.strokeStyle = 'rgba(102, 102, 102, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(debris.trail[0].x, debris.trail[0].y);
                for (let i = 1; i < debris.trail.length; i++) {
                    this.ctx.lineTo(debris.trail[i].x, debris.trail[i].y);
                }
                this.ctx.stroke();
            }
            
            // 渲染垃圾
            this.ctx.save();
            this.ctx.translate(debris.x, debris.y);
            this.ctx.rotate(debris.rotation);
            this.ctx.fillStyle = debris.color;
            this.ctx.fillRect(-debris.size / 2, -debris.size / 2, debris.size, debris.size);
            this.ctx.restore();
        });
    }
    
    // 渲染环境效果
    renderEnvironmentEffects() {
        this.environmentEffects.forEach(effect => {
            effect.render(this.ctx);
        });
    }
    
    // 添加环境效果
    addEnvironmentEffect(effect) {
        this.environmentEffects.push(effect);
    }
    
    // 设置滚动速度
    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
    }
}

// 全局实例
window.environmentArt = null;