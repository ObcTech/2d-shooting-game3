/**
 * 视觉特效增强系统
 * 实现光照系统、后处理效果、屏幕震动等高级视觉特效
 * 第三期项目开发计划书 - 第二部分：视觉特效增强
 */

class VisualEffectsEnhanced {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 光照系统
        this.lightSources = [];
        this.ambientLight = { r: 0.1, g: 0.1, b: 0.15, intensity: 0.3 };
        this.lightCanvas = document.createElement('canvas');
        this.lightCtx = this.lightCanvas.getContext('2d');
        this.lightCanvas.width = this.width;
        this.lightCanvas.height = this.height;
        
        // 后处理效果
        this.postProcessing = {
            screenShake: { x: 0, y: 0, intensity: 0, duration: 0 },
            colorFilter: { r: 1, g: 1, b: 1, alpha: 0 },
            blur: { enabled: false, radius: 0 },
            chromatic: { enabled: false, intensity: 0 }
        };
        
        // 特效缓存
        this.effectsBuffer = document.createElement('canvas');
        this.effectsCtx = this.effectsBuffer.getContext('2d');
        this.effectsBuffer.width = this.width;
        this.effectsBuffer.height = this.height;
        
        // 性能监控
        this.performanceMode = 'high'; // high, medium, low
        this.frameTime = 0;
        this.lastFrameTime = performance.now();
        
        this.init();
    }
    
    init() {
        // 设置默认环境光照
        this.setAmbientLight(0.1, 0.1, 0.15, 0.3);
        
        // 监听性能变化
        this.setupPerformanceMonitoring();
    }
    
    // ==================== 光照系统 ====================
    
    /**
     * 添加动态光源
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 光照半径
     * @param {Object} color - 光照颜色 {r, g, b}
     * @param {number} intensity - 光照强度
     * @param {number} duration - 持续时间（毫秒）
     */
    addDynamicLight(x, y, radius, color = {r: 1, g: 0.8, b: 0.6}, intensity = 1, duration = 500) {
        const light = {
            id: Date.now() + Math.random(),
            x, y, radius, color, intensity,
            duration, maxDuration: duration,
            type: 'dynamic',
            flickerSpeed: Math.random() * 0.1 + 0.05,
            flickerIntensity: Math.random() * 0.3 + 0.1
        };
        
        this.lightSources.push(light);
        return light.id;
    }
    
    /**
     * 添加枪口火光
     */
    addMuzzleFlash(x, y, angle = 0) {
        const radius = 30 + Math.random() * 20;
        const color = {
            r: 1,
            g: 0.8 + Math.random() * 0.2,
            b: 0.4 + Math.random() * 0.3
        };
        
        return this.addDynamicLight(x, y, radius, color, 1.5, 150);
    }
    
    /**
     * 添加爆炸光效
     */
    addExplosionLight(x, y, size = 1) {
        const radius = 60 * size + Math.random() * 30;
        const color = {
            r: 1,
            g: 0.6 + Math.random() * 0.3,
            b: 0.2 + Math.random() * 0.2
        };
        
        return this.addDynamicLight(x, y, radius, color, 2, 300);
    }
    
    /**
     * 设置环境光照
     */
    setAmbientLight(r, g, b, intensity) {
        this.ambientLight = { r, g, b, intensity };
    }
    
    /**
     * 更新光照系统
     */
    updateLighting(deltaTime) {
        // 更新动态光源
        this.lightSources = this.lightSources.filter(light => {
            if (light.type === 'dynamic') {
                light.duration -= deltaTime;
                
                // 光源衰减
                const fadeRatio = light.duration / light.maxDuration;
                light.intensity = fadeRatio * (light.maxDuration / light.duration > 1 ? 1 : light.maxDuration / light.duration);
                
                // 闪烁效果
                const flicker = Math.sin(Date.now() * light.flickerSpeed) * light.flickerIntensity;
                light.currentIntensity = Math.max(0, light.intensity + flicker);
                
                return light.duration > 0;
            }
            return true;
        });
    }
    
    /**
     * 渲染光照效果
     */
    renderLighting() {
        if (this.performanceMode === 'low') return;
        
        // 清空光照画布
        this.lightCtx.fillStyle = `rgba(${Math.floor(this.ambientLight.r * 255)}, ${Math.floor(this.ambientLight.g * 255)}, ${Math.floor(this.ambientLight.b * 255)}, ${this.ambientLight.intensity})`;
        this.lightCtx.fillRect(0, 0, this.width, this.height);
        
        // 设置混合模式
        this.lightCtx.globalCompositeOperation = 'lighter';
        
        // 渲染每个光源
        this.lightSources.forEach(light => {
            const gradient = this.lightCtx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius
            );
            
            const intensity = light.currentIntensity || light.intensity;
            const alpha = Math.max(0, Math.min(1, intensity));
            
            gradient.addColorStop(0, `rgba(${Math.floor(light.color.r * 255)}, ${Math.floor(light.color.g * 255)}, ${Math.floor(light.color.b * 255)}, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(${Math.floor(light.color.r * 255)}, ${Math.floor(light.color.g * 255)}, ${Math.floor(light.color.b * 255)}, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.lightCtx.fillStyle = gradient;
            this.lightCtx.fillRect(
                light.x - light.radius,
                light.y - light.radius,
                light.radius * 2,
                light.radius * 2
            );
        });
        
        this.lightCtx.globalCompositeOperation = 'source-over';
    }
    
    // ==================== 后处理效果 ====================
    
    /**
     * 触发屏幕震动
     * @param {number} intensity - 震动强度
     * @param {number} duration - 持续时间
     */
    triggerScreenShake(intensity = 5, duration = 300) {
        this.postProcessing.screenShake.intensity = Math.max(
            this.postProcessing.screenShake.intensity,
            intensity
        );
        this.postProcessing.screenShake.duration = Math.max(
            this.postProcessing.screenShake.duration,
            duration
        );
    }
    
    /**
     * 设置颜色滤镜
     * @param {number} r - 红色通道
     * @param {number} g - 绿色通道
     * @param {number} b - 蓝色通道
     * @param {number} alpha - 透明度
     * @param {number} duration - 持续时间
     */
    setColorFilter(r, g, b, alpha, duration = 500) {
        this.postProcessing.colorFilter = { r, g, b, alpha, duration, maxDuration: duration };
    }
    
    /**
     * 受伤红色滤镜
     */
    triggerDamageFilter() {
        this.setColorFilter(1, 0.3, 0.3, 0.3, 200);
    }
    
    /**
     * 启用模糊效果
     */
    enableBlur(radius = 3, duration = 1000) {
        this.postProcessing.blur = {
            enabled: true,
            radius,
            duration,
            maxDuration: duration
        };
    }
    
    /**
     * 更新后处理效果
     */
    updatePostProcessing(deltaTime) {
        // 更新屏幕震动
        if (this.postProcessing.screenShake.duration > 0) {
            this.postProcessing.screenShake.duration -= deltaTime;
            
            const intensity = this.postProcessing.screenShake.intensity * 
                (this.postProcessing.screenShake.duration / 300);
            
            this.postProcessing.screenShake.x = (Math.random() - 0.5) * intensity;
            this.postProcessing.screenShake.y = (Math.random() - 0.5) * intensity;
            
            if (this.postProcessing.screenShake.duration <= 0) {
                this.postProcessing.screenShake.x = 0;
                this.postProcessing.screenShake.y = 0;
                this.postProcessing.screenShake.intensity = 0;
            }
        }
        
        // 更新颜色滤镜
        if (this.postProcessing.colorFilter.duration > 0) {
            this.postProcessing.colorFilter.duration -= deltaTime;
            
            const fadeRatio = this.postProcessing.colorFilter.duration / this.postProcessing.colorFilter.maxDuration;
            this.postProcessing.colorFilter.alpha *= fadeRatio;
            
            if (this.postProcessing.colorFilter.duration <= 0) {
                this.postProcessing.colorFilter.alpha = 0;
            }
        }
        
        // 更新模糊效果
        if (this.postProcessing.blur.enabled && this.postProcessing.blur.duration > 0) {
            this.postProcessing.blur.duration -= deltaTime;
            
            if (this.postProcessing.blur.duration <= 0) {
                this.postProcessing.blur.enabled = false;
            }
        }
    }
    
    /**
     * 应用后处理效果
     */
    applyPostProcessing() {
        // 应用屏幕震动
        if (this.postProcessing.screenShake.intensity > 0) {
            this.ctx.save();
            this.ctx.translate(
                this.postProcessing.screenShake.x,
                this.postProcessing.screenShake.y
            );
        }
        
        // 应用颜色滤镜
        if (this.postProcessing.colorFilter.alpha > 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = `rgba(${Math.floor(this.postProcessing.colorFilter.r * 255)}, ${Math.floor(this.postProcessing.colorFilter.g * 255)}, ${Math.floor(this.postProcessing.colorFilter.b * 255)}, ${this.postProcessing.colorFilter.alpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
        
        // 应用光照效果
        if (this.lightSources.length > 0 && this.performanceMode !== 'low') {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.drawImage(this.lightCanvas, 0, 0);
            this.ctx.restore();
        }
    }
    
    /**
     * 恢复后处理变换
     */
    restorePostProcessing() {
        if (this.postProcessing.screenShake.intensity > 0) {
            this.ctx.restore();
        }
    }
    
    // ==================== 性能管理 ====================
    
    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        setInterval(() => {
            const currentTime = performance.now();
            this.frameTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            // 自动调整性能模式
            if (this.frameTime > 33) { // < 30 FPS
                this.performanceMode = 'low';
            } else if (this.frameTime > 20) { // < 50 FPS
                this.performanceMode = 'medium';
            } else {
                this.performanceMode = 'high';
            }
        }, 1000);
    }
    
    /**
     * 设置性能模式
     */
    setPerformanceMode(mode) {
        this.performanceMode = mode;
    }
    
    /**
     * 获取性能统计
     */
    getPerformanceStats() {
        return {
            frameTime: this.frameTime,
            fps: Math.round(1000 / this.frameTime),
            performanceMode: this.performanceMode,
            lightSources: this.lightSources.length,
            activeEffects: {
                screenShake: this.postProcessing.screenShake.intensity > 0,
                colorFilter: this.postProcessing.colorFilter.alpha > 0,
                blur: this.postProcessing.blur.enabled
            }
        };
    }
    
    // ==================== 主要更新和渲染方法 ====================
    
    /**
     * 更新所有视觉效果
     */
    update(deltaTime) {
        this.updateLighting(deltaTime);
        this.updatePostProcessing(deltaTime);
    }
    
    /**
     * 渲染前处理
     */
    preRender() {
        this.renderLighting();
        this.applyPostProcessing();
    }
    
    /**
     * 渲染后处理
     */
    postRender() {
        this.restorePostProcessing();
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        this.lightSources = [];
        this.postProcessing.screenShake.intensity = 0;
        this.postProcessing.colorFilter.alpha = 0;
        this.postProcessing.blur.enabled = false;
    }
    
    /**
     * 调整画布大小
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.lightCanvas.width = width;
        this.lightCanvas.height = height;
        this.effectsBuffer.width = width;
        this.effectsBuffer.height = height;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffectsEnhanced;
}