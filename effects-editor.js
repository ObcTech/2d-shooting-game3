/**
 * 特效编辑器系统
 * 实现实时调整和预览特效参数的功能
 */

class EffectsEditor {
    constructor() {
        this.isVisible = false;
        this.selectedEffect = null;
        this.previewMode = false;
        this.editorPanel = null;
        
        // 特效配置
        this.effectConfigs = {
            particles: {
                name: '粒子系统',
                params: {
                    count: { value: 50, min: 1, max: 200, type: 'range' },
                    size: { value: 3, min: 0.5, max: 10, type: 'range' },
                    speed: { value: 5, min: 0.1, max: 20, type: 'range' },
                    life: { value: 1000, min: 100, max: 5000, type: 'range' },
                    color: { value: '#ff6b6b', type: 'color' },
                    gravity: { value: 0.1, min: -1, max: 1, type: 'range' },
                    spread: { value: 0.5, min: 0, max: 2, type: 'range' }
                }
            },
            lighting: {
                name: '光照系统',
                params: {
                    intensity: { value: 1.0, min: 0, max: 3, type: 'range' },
                    radius: { value: 100, min: 10, max: 500, type: 'range' },
                    color: { value: '#ffffff', type: 'color' },
                    flickerSpeed: { value: 0.1, min: 0, max: 1, type: 'range' },
                    softness: { value: 0.5, min: 0, max: 1, type: 'range' }
                }
            },
            postProcessing: {
                name: '后处理效果',
                params: {
                    bloom: { value: 0.3, min: 0, max: 1, type: 'range' },
                    contrast: { value: 1.0, min: 0.5, max: 2, type: 'range' },
                    saturation: { value: 1.0, min: 0, max: 2, type: 'range' },
                    vignette: { value: 0.2, min: 0, max: 1, type: 'range' },
                    chromaticAberration: { value: 0.1, min: 0, max: 1, type: 'range' }
                }
            },
            screenEffects: {
                name: '屏幕特效',
                params: {
                    shakeIntensity: { value: 5, min: 0, max: 20, type: 'range' },
                    shakeDuration: { value: 200, min: 50, max: 1000, type: 'range' },
                    flashIntensity: { value: 0.5, min: 0, max: 1, type: 'range' },
                    flashDuration: { value: 100, min: 50, max: 500, type: 'range' }
                }
            },
            animation: {
                name: '角色动画',
                params: {
                    speed: { value: 1.0, min: 0.1, max: 3, type: 'range' },
                    scale: { value: 1.0, min: 0.5, max: 2, type: 'range' },
                    rotation: { value: 0, min: -180, max: 180, type: 'range' },
                    bounce: { value: 0.1, min: 0, max: 0.5, type: 'range' }
                }
            }
        };
        
        // 预设配置
        this.presets = {
            'default': '默认设置',
            'intense': '强烈特效',
            'subtle': '轻微特效',
            'retro': '复古风格',
            'neon': '霓虹风格'
        };
        
        this.createEditorUI();
        this.setupEventListeners();
    }
    
    // 创建编辑器UI
    createEditorUI() {
        // 创建主面板
        this.editorPanel = document.createElement('div');
        this.editorPanel.id = 'effects-editor';
        this.editorPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ffff;
            border-radius: 10px;
            padding: 15px;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        `;
        
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '特效编辑器';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #00ffff;
            text-align: center;
            text-shadow: 0 0 10px #00ffff;
        `;
        this.editorPanel.appendChild(title);
        
        // 创建预设选择器
        this.createPresetSelector();
        
        // 创建特效分类
        this.createEffectCategories();
        
        // 创建控制按钮
        this.createControlButtons();
        
        document.body.appendChild(this.editorPanel);
    }
    
    // 创建预设选择器
    createPresetSelector() {
        const presetContainer = document.createElement('div');
        presetContainer.style.marginBottom = '15px';
        
        const presetLabel = document.createElement('label');
        presetLabel.textContent = '预设配置:';
        presetLabel.style.cssText = `
            display: block;
            margin-bottom: 5px;
            color: #00ffff;
        `;
        
        const presetSelect = document.createElement('select');
        presetSelect.style.cssText = `
            width: 100%;
            padding: 5px;
            background: #333;
            color: #fff;
            border: 1px solid #00ffff;
            border-radius: 3px;
        `;
        
        Object.entries(this.presets).forEach(([key, name]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = name;
            presetSelect.appendChild(option);
        });
        
        presetSelect.addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });
        
        presetContainer.appendChild(presetLabel);
        presetContainer.appendChild(presetSelect);
        this.editorPanel.appendChild(presetContainer);
    }
    
    // 创建特效分类
    createEffectCategories() {
        Object.entries(this.effectConfigs).forEach(([categoryKey, category]) => {
            const categoryContainer = document.createElement('div');
            categoryContainer.style.cssText = `
                margin-bottom: 20px;
                border: 1px solid #444;
                border-radius: 5px;
                padding: 10px;
            `;
            
            // 分类标题
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category.name;
            categoryTitle.style.cssText = `
                margin: 0 0 10px 0;
                color: #ffff00;
                cursor: pointer;
                user-select: none;
            `;
            
            // 参数容器
            const paramsContainer = document.createElement('div');
            paramsContainer.style.display = 'block';
            
            // 切换显示/隐藏
            categoryTitle.addEventListener('click', () => {
                const isVisible = paramsContainer.style.display !== 'none';
                paramsContainer.style.display = isVisible ? 'none' : 'block';
                categoryTitle.style.color = isVisible ? '#888' : '#ffff00';
            });
            
            // 创建参数控件
            Object.entries(category.params).forEach(([paramKey, param]) => {
                const paramControl = this.createParameterControl(categoryKey, paramKey, param);
                paramsContainer.appendChild(paramControl);
            });
            
            categoryContainer.appendChild(categoryTitle);
            categoryContainer.appendChild(paramsContainer);
            this.editorPanel.appendChild(categoryContainer);
        });
    }
    
    // 创建参数控件
    createParameterControl(categoryKey, paramKey, param) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: 10px;
            padding: 5px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
        `;
        
        const label = document.createElement('label');
        label.textContent = `${paramKey}: ${param.value}`;
        label.style.cssText = `
            display: block;
            margin-bottom: 5px;
            font-size: 11px;
        `;
        
        let input;
        
        if (param.type === 'range') {
            input = document.createElement('input');
            input.type = 'range';
            input.min = param.min;
            input.max = param.max;
            input.step = (param.max - param.min) / 100;
            input.value = param.value;
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                param.value = value;
                label.textContent = `${paramKey}: ${value.toFixed(2)}`;
                this.applyParameterChange(categoryKey, paramKey, value);
            });
        } else if (param.type === 'color') {
            input = document.createElement('input');
            input.type = 'color';
            input.value = param.value;
            
            input.addEventListener('change', (e) => {
                param.value = e.target.value;
                label.textContent = `${paramKey}: ${e.target.value}`;
                this.applyParameterChange(categoryKey, paramKey, e.target.value);
            });
        }
        
        input.style.cssText = `
            width: 100%;
            margin-top: 3px;
        `;
        
        container.appendChild(label);
        container.appendChild(input);
        
        return container;
    }
    
    // 创建控制按钮
    createControlButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #444;
        `;
        
        // 预览按钮
        const previewBtn = document.createElement('button');
        previewBtn.textContent = '预览模式';
        previewBtn.style.cssText = `
            flex: 1;
            padding: 8px;
            background: #007700;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        `;
        
        previewBtn.addEventListener('click', () => {
            this.togglePreviewMode();
        });
        
        // 重置按钮
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '重置';
        resetBtn.style.cssText = `
            flex: 1;
            padding: 8px;
            background: #770000;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        `;
        
        resetBtn.addEventListener('click', () => {
            this.resetToDefaults();
        });
        
        // 导出按钮
        const exportBtn = document.createElement('button');
        exportBtn.textContent = '导出';
        exportBtn.style.cssText = `
            flex: 1;
            padding: 8px;
            background: #000077;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        `;
        
        exportBtn.addEventListener('click', () => {
            this.exportConfiguration();
        });
        
        buttonContainer.appendChild(previewBtn);
        buttonContainer.appendChild(resetBtn);
        buttonContainer.appendChild(exportBtn);
        this.editorPanel.appendChild(buttonContainer);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 快捷键切换编辑器
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    // 切换编辑器显示
    toggle() {
        this.isVisible = !this.isVisible;
        this.editorPanel.style.display = this.isVisible ? 'block' : 'none';
    }
    
    // 应用参数变化
    applyParameterChange(category, param, value) {
        // 保存到配置管理器
        if (window.configManager) {
            window.configManager.set(`effects.${category}.${param}`, value);
        }
        
        // 实时应用到对应的系统
        switch (category) {
            case 'particles':
                if (window.enhancedParticles) {
                    this.updateParticleSystem(param, value);
                }
                break;
                
            case 'lighting':
                if (window.visualEffectsEnhanced) {
                    this.updateLightingSystem(param, value);
                }
                break;
                
            case 'postProcessing':
                if (window.visualEffectsEnhanced) {
                    this.updatePostProcessing(param, value);
                }
                break;
                
            case 'screenEffects':
                if (window.visualEffectsEnhanced) {
                    this.updateScreenEffects(param, value);
                }
                break;
                
            case 'animation':
                if (window.characterAnimation) {
                    this.updateAnimationSystem(param, value);
                }
                break;
        }
    }
    
    // 更新粒子系统
    updateParticleSystem(param, value) {
        if (window.enhancedParticles) {
            const particles = window.enhancedParticles;
            switch (param) {
                case 'count':
                    particles.maxParticles = Math.floor(value);
                    break;
                case 'size':
                    particles.defaultSize = value;
                    break;
                case 'speed':
                    particles.defaultSpeed = value;
                    break;
                case 'life':
                    particles.defaultLife = value;
                    break;
                case 'gravity':
                    particles.gravity = value;
                    break;
            }
        }
        console.log(`更新粒子系统: ${param} = ${value}`);
    }
    
    // 更新光照系统
    updateLightingSystem(param, value) {
        if (window.visualEffectsEnhanced) {
            const effects = window.visualEffectsEnhanced;
            switch (param) {
                case 'intensity':
                    effects.lightingIntensity = value;
                    break;
                case 'radius':
                    effects.lightingRadius = value;
                    break;
                case 'color':
                    effects.lightingColor = value;
                    break;
                case 'flickerSpeed':
                    effects.flickerSpeed = value;
                    break;
                case 'softness':
                    effects.lightingSoftness = value;
                    break;
            }
        }
        console.log(`更新光照系统: ${param} = ${value}`);
    }
    
    // 更新后处理效果
    updatePostProcessing(param, value) {
        console.log(`更新后处理: ${param} = ${value}`);
    }
    
    // 更新屏幕特效
    updateScreenEffects(param, value) {
        if (window.visualEffectsEnhanced) {
            const effects = window.visualEffectsEnhanced;
            switch (param) {
                case 'shakeIntensity':
                    effects.shakeIntensity = value;
                    break;
                case 'shakeDuration':
                    effects.shakeDuration = value;
                    break;
                case 'flashIntensity':
                    effects.flashIntensity = value;
                    break;
                case 'flashDuration':
                    effects.flashDuration = value;
                    break;
            }
        }
        console.log(`更新屏幕特效: ${param} = ${value}`);
    }
    
    // 更新动画系统
    updateAnimationSystem(param, value) {
        if (window.characterAnimation) {
            const animation = window.characterAnimation;
            switch (param) {
                case 'speed':
                    animation.animationSpeed = value;
                    break;
                case 'scale':
                    animation.animationScale = value;
                    break;
                case 'rotation':
                    animation.rotationOffset = value * Math.PI / 180; // 转换为弧度
                    break;
                case 'bounce':
                    animation.bounceIntensity = value;
                    break;
            }
        }
        console.log(`更新动画系统: ${param} = ${value}`);
    }
    
    // 切换预览模式
    togglePreviewMode() {
        this.previewMode = !this.previewMode;
        
        if (this.previewMode) {
            // 启动预览模式 - 连续播放特效
            this.startPreview();
        } else {
            // 停止预览模式
            this.stopPreview();
        }
    }
    
    // 开始预览
    startPreview() {
        console.log('开始特效预览模式');
        
        // 定期触发各种特效进行预览
        this.previewInterval = setInterval(() => {
            if (window.game) {
                // 随机触发特效
                const effects = ['explosion', 'muzzleFlash', 'screenShake', 'colorFilter'];
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                
                switch (randomEffect) {
                    case 'explosion':
                        if (window.enhancedParticles) {
                            window.enhancedParticles.createEffect('explosion', {
                                x: Math.random() * window.game.width,
                                y: Math.random() * window.game.height
                            });
                        }
                        break;
                        
                    case 'muzzleFlash':
                        if (window.visualEffectsEnhanced) {
                            window.visualEffectsEnhanced.addMuzzleFlash(
                                Math.random() * window.game.width,
                                Math.random() * window.game.height,
                                Math.random() * Math.PI * 2,
                                'PISTOL'
                            );
                        }
                        break;
                        
                    case 'screenShake':
                        if (window.visualEffectsEnhanced) {
                            window.visualEffectsEnhanced.addScreenShake(10, 200);
                        }
                        break;
                        
                    case 'colorFilter':
                        if (window.visualEffectsEnhanced) {
                            const filters = ['damage', 'heal', 'powerup'];
                            const randomFilter = filters[Math.floor(Math.random() * filters.length)];
                            window.visualEffectsEnhanced.addColorFilter(randomFilter, 500);
                        }
                        break;
                }
            }
        }, 1000);
    }
    
    // 停止预览
    stopPreview() {
        console.log('停止特效预览模式');
        
        if (this.previewInterval) {
            clearInterval(this.previewInterval);
            this.previewInterval = null;
        }
    }
    
    // 重置到默认值
    resetToDefaults() {
        if (window.configManager) {
            // 从配置管理器获取默认值
            const defaultEffects = window.configManager.get('effects');
            if (defaultEffects) {
                Object.entries(defaultEffects).forEach(([categoryKey, categoryConfig]) => {
                    if (this.effectConfigs[categoryKey]) {
                        Object.entries(categoryConfig).forEach(([paramKey, value]) => {
                            if (this.effectConfigs[categoryKey].params[paramKey]) {
                                this.effectConfigs[categoryKey].params[paramKey].value = value;
                                this.applyParameterChange(categoryKey, paramKey, value);
                            }
                        });
                    }
                });
            }
            
            // 重新创建UI以反映新值
            this.refreshUI();
        }
        
        console.log('已重置所有特效参数到默认值');
    }
    
    // 加载预设
    loadPreset(presetName) {
        console.log(`加载预设: ${presetName}`);
        
        // 根据预设名称加载不同的配置
        switch (presetName) {
            case 'intense':
                this.applyIntensePreset();
                break;
            case 'subtle':
                this.applySubtlePreset();
                break;
            case 'retro':
                this.applyRetroPreset();
                break;
            case 'neon':
                this.applyNeonPreset();
                break;
            default:
                this.resetToDefaults();
        }
    }
    
    // 应用强烈特效预设
    applyIntensePreset() {
        // 增强所有特效参数
        console.log('应用强烈特效预设');
    }
    
    // 应用轻微特效预设
    applySubtlePreset() {
        // 降低所有特效参数
        console.log('应用轻微特效预设');
    }
    
    // 应用复古风格预设
    applyRetroPreset() {
        // 设置复古风格的颜色和效果
        console.log('应用复古风格预设');
    }
    
    // 应用霓虹风格预设
    applyNeonPreset() {
        // 设置霓虹风格的颜色和效果
        console.log('应用霓虹风格预设');
    }
    
    // 导出配置
    exportConfiguration() {
        const config = {
            timestamp: new Date().toISOString(),
            effects: this.effectConfigs
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'effects-config.json';
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('特效配置已导出');
    }
    
    // 导入配置
    importConfiguration(configData) {
        try {
            const config = JSON.parse(configData);
            this.effectConfigs = config.effects;
            console.log('特效配置已导入');
        } catch (error) {
            console.error('导入配置失败:', error);
        }
    }
    
    // 刷新UI界面
    refreshUI() {
        if (this.editorPanel) {
            // 清除现有内容
            this.editorPanel.innerHTML = '';
            
            // 重新创建UI
            const title = document.createElement('h3');
            title.textContent = '特效编辑器';
            title.style.cssText = `
                margin: 0 0 15px 0;
                color: #00ffff;
                text-align: center;
                text-shadow: 0 0 10px #00ffff;
            `;
            this.editorPanel.appendChild(title);
            
            this.createPresetSelector();
            this.createEffectCategories();
            this.createControlButtons();
        }
    }
}

// 全局实例
window.effectsEditor = new EffectsEditor();

// 添加帮助信息
console.log('%c特效编辑器已加载', 'color: #00ffff; font-size: 14px; font-weight: bold;');
console.log('%c按 F2 键打开/关闭特效编辑器', 'color: #ffff00; font-size: 12px;');
console.log('%c可以实时调整游戏中的各种特效参数', 'color: #ffffff; font-size: 12px;');