/**
 * 配置管理系统
 * 用于保存、加载和管理游戏配置
 */

class ConfigManager {
    constructor() {
        this.configs = {
            graphics: {
                quality: 'high',
                particles: true,
                lighting: true,
                postProcessing: true,
                screenEffects: true
            },
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.8,
                sfxVolume: 1.0,
                audioVisualization: true
            },
            gameplay: {
                difficulty: 'normal',
                autoAim: false,
                showFPS: true,
                showDebugInfo: false
            },
            effects: {
                particles: {
                    count: 50,
                    size: 3,
                    speed: 5,
                    life: 1000,
                    gravity: 0.1,
                    spread: 0.5
                },
                lighting: {
                    intensity: 1.0,
                    radius: 100,
                    color: '#ffffff',
                    flickerSpeed: 0.1,
                    softness: 0.5
                },
                postProcessing: {
                    bloom: 0.3,
                    contrast: 1.0,
                    saturation: 1.0,
                    vignette: 0.2,
                    chromaticAberration: 0.1
                },
                screenEffects: {
                    shakeIntensity: 5,
                    shakeDuration: 200,
                    flashIntensity: 0.5,
                    flashDuration: 100
                },
                animation: {
                    speed: 1.0,
                    scale: 1.0,
                    rotation: 0,
                    bounce: 0.1
                }
            }
        };
        
        this.loadFromStorage();
    }
    
    // 获取配置值
    get(path) {
        const keys = path.split('.');
        let value = this.configs;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }
        
        return value;
    }
    
    // 设置配置值
    set(path, value) {
        const keys = path.split('.');
        let target = this.configs;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }
        
        target[keys[keys.length - 1]] = value;
        this.saveToStorage();
    }
    
    // 从本地存储加载配置
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('gameConfig');
            if (stored) {
                const parsedConfig = JSON.parse(stored);
                this.configs = this.mergeConfigs(this.configs, parsedConfig);
            }
        } catch (error) {
            console.warn('加载配置失败，使用默认配置:', error);
        }
    }
    
    // 保存配置到本地存储
    saveToStorage() {
        try {
            localStorage.setItem('gameConfig', JSON.stringify(this.configs));
        } catch (error) {
            console.warn('保存配置失败:', error);
        }
    }
    
    // 合并配置对象
    mergeConfigs(defaultConfig, userConfig) {
        const result = { ...defaultConfig };
        
        for (const key in userConfig) {
            if (key in result) {
                if (typeof result[key] === 'object' && typeof userConfig[key] === 'object') {
                    result[key] = this.mergeConfigs(result[key], userConfig[key]);
                } else {
                    result[key] = userConfig[key];
                }
            }
        }
        
        return result;
    }
    
    // 重置配置到默认值
    reset() {
        localStorage.removeItem('gameConfig');
        this.loadFromStorage();
    }
    
    // 导出配置
    export() {
        const dataStr = JSON.stringify(this.configs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `game-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    // 导入配置
    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    this.configs = this.mergeConfigs(this.configs, config);
                    this.saveToStorage();
                    resolve(config);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
    
    // 应用配置到游戏系统
    applyToGame() {
        // 应用图形配置
        if (window.visualEffectsEnhanced) {
            const effects = window.visualEffectsEnhanced;
            const lightingConfig = this.get('effects.lighting');
            if (lightingConfig) {
                effects.lightingIntensity = lightingConfig.intensity;
                effects.lightingRadius = lightingConfig.radius;
                effects.lightingColor = lightingConfig.color;
            }
            
            const screenConfig = this.get('effects.screenEffects');
            if (screenConfig) {
                effects.shakeIntensity = screenConfig.shakeIntensity;
                effects.shakeDuration = screenConfig.shakeDuration;
                effects.flashIntensity = screenConfig.flashIntensity;
                effects.flashDuration = screenConfig.flashDuration;
            }
        }
        
        // 应用粒子配置
        if (window.enhancedParticles) {
            const particles = window.enhancedParticles;
            const particleConfig = this.get('effects.particles');
            if (particleConfig) {
                particles.maxParticles = particleConfig.count;
                particles.defaultSize = particleConfig.size;
                particles.defaultSpeed = particleConfig.speed;
                particles.defaultLife = particleConfig.life;
                particles.gravity = particleConfig.gravity;
            }
        }
        
        // 应用动画配置
        if (window.characterAnimation) {
            const animation = window.characterAnimation;
            const animConfig = this.get('effects.animation');
            if (animConfig) {
                animation.animationSpeed = animConfig.speed;
                animation.animationScale = animConfig.scale;
                animation.rotationOffset = animConfig.rotation * Math.PI / 180;
                animation.bounceIntensity = animConfig.bounce;
            }
        }
        
        // 应用音频配置
        if (window.audioVisualSync) {
            const audio = window.audioVisualSync;
            const audioConfig = this.get('audio');
            if (audioConfig) {
                audio.masterVolume = audioConfig.masterVolume;
                audio.musicVolume = audioConfig.musicVolume;
                audio.sfxVolume = audioConfig.sfxVolume;
            }
        }
    }
    
    // 获取预设配置
    getPreset(name) {
        const presets = {
            'performance': {
                graphics: { quality: 'low', particles: false, lighting: false },
                effects: {
                    particles: { count: 20, size: 2 },
                    lighting: { intensity: 0.5 },
                    postProcessing: { bloom: 0.1 }
                }
            },
            'quality': {
                graphics: { quality: 'high', particles: true, lighting: true },
                effects: {
                    particles: { count: 100, size: 4 },
                    lighting: { intensity: 1.5 },
                    postProcessing: { bloom: 0.5 }
                }
            },
            'cinematic': {
                graphics: { quality: 'ultra', particles: true, lighting: true },
                effects: {
                    particles: { count: 150, size: 5 },
                    lighting: { intensity: 2.0 },
                    postProcessing: { bloom: 0.7, vignette: 0.4 }
                }
            }
        };
        
        return presets[name] || null;
    }
    
    // 应用预设
    applyPreset(name) {
        const preset = this.getPreset(name);
        if (preset) {
            this.configs = this.mergeConfigs(this.configs, preset);
            this.saveToStorage();
            this.applyToGame();
            return true;
        }
        return false;
    }
}

// 全局实例
window.configManager = new ConfigManager();

// 在页面加载完成后应用配置
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.configManager.applyToGame();
    });
} else {
    window.configManager.applyToGame();
}

console.log('%c配置管理系统已加载', 'color: #00ff00; font-size: 14px; font-weight: bold;');
console.log('%c使用 configManager.get("path") 获取配置', 'color: #ffffff; font-size: 12px;');
console.log('%c使用 configManager.set("path", value) 设置配置', 'color: #ffffff; font-size: 12px;');