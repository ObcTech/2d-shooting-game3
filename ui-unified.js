/**
 * 统一UI管理系统
 * 整合所有UI组件，提供统一的界面管理
 */

class UnifiedUIManager {
    constructor(game) {
        this.game = game;
        this.panels = new Map();
        this.isUIVisible = true;
        this.currentTheme = 'dark';
        this.transparency = 0.9;
        
        this.initializeUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        this.createMainContainer();
        this.createPanels();
        this.applyTheme();
    }
    
    createMainContainer() {
        // 创建主UI容器
        const mainContainer = document.createElement('div');
        mainContainer.id = 'unifiedUIContainer';
        mainContainer.className = 'unified-ui-container';
        
        // 添加CSS样式
        const style = document.createElement('style');
        style.textContent = `
            .unified-ui-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
                font-family: 'Arial', sans-serif;
                transition: opacity 0.3s ease;
            }
            
            .ui-panel {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #4ecdc4;
                border-radius: 10px;
                padding: 15px;
                color: white;
                pointer-events: auto;
                transition: all 0.3s ease;
            }
            
            .ui-panel.hidden {
                opacity: 0;
                transform: translateY(-20px);
                pointer-events: none;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #4ecdc4;
            }
            
            .panel-title {
                font-size: 16px;
                font-weight: bold;
                color: #4ecdc4;
            }
            
            .panel-close {
                background: none;
                border: none;
                color: #ff6b6b;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            
            .panel-close:hover {
                color: #ff5252;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                padding: 5px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            
            .stat-label {
                color: #b8b8b8;
            }
            
            .stat-value {
                color: #4ecdc4;
                font-weight: bold;
            }
            
            .control-item {
                margin: 3px 0;
                font-size: 12px;
            }
            
            .control-key {
                color: #feca57;
                font-weight: bold;
            }
            
            .ui-toggle-hint {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1001;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(mainContainer);
        
        this.mainContainer = mainContainer;
    }
    
    createPanels() {
        this.createGameInfoPanel();
        this.createControlsPanel();
        this.createSkillPanel();
        this.createAchievementPanel();
        this.createStatisticsPanel();
        this.createSettingsPanel();
        this.createToggleHint();
    }
    
    createGameInfoPanel() {
        const panel = this.createPanel('gameInfo', '游戏信息', 'top-left');
        panel.style.top = '20px';
        panel.style.left = '20px';
        panel.style.width = '200px';
        
        panel.innerHTML += `
            <div class="stat-item">
                <span class="stat-label">生命值:</span>
                <span class="stat-value" id="ui-health">100</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">得分:</span>
                <span class="stat-value" id="ui-score">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">波次:</span>
                <span class="stat-value" id="ui-wave">1</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">击杀:</span>
                <span class="stat-value" id="ui-kills">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">武器:</span>
                <span class="stat-value" id="ui-weapon">手枪</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">敌人数量:</span>
                <span class="stat-value" id="ui-enemyCount">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">技能点:</span>
                <span class="stat-value" id="ui-skillPoints">0</span>
            </div>
        `;
    }
    
    createControlsPanel() {
        const panel = this.createPanel('controls', '控制说明', 'top-right');
        panel.style.top = '20px';
        panel.style.right = '20px';
        panel.style.width = '250px';
        
        panel.innerHTML += `
            <div class="control-item">
                <span class="control-key">WASD</span> - 移动
            </div>
            <div class="control-item">
                <span class="control-key">鼠标</span> - 瞄准射击
            </div>
            <div class="control-item">
                <span class="control-key">1-4</span> - 切换武器
            </div>
            <div class="control-item">
                <span class="control-key">Q</span> - 冲刺技能
            </div>
            <div class="control-item">
                <span class="control-key">E</span> - 护盾技能
            </div>
            <div class="control-item">
                <span class="control-key">R</span> - 时间减缓
            </div>
            <div class="control-item">
                <span class="control-key">T</span> - 无敌技能
            </div>
            <div class="control-item">
                <span class="control-key">K</span> - 技能面板
            </div>
            <div class="control-item">
                <span class="control-key">J</span> - 成就面板
            </div>
            <div class="control-item">
                <span class="control-key">L</span> - 统计面板
            </div>
            <div class="control-item">
                <span class="control-key">H</span> - 隐藏/显示UI
            </div>
            <div class="control-item">
                <span class="control-key">F1</span> - 设置面板
            </div>
        `;
    }
    
    createSkillPanel() {
        const panel = this.createPanel('skills', '技能系统', 'center');
        panel.style.display = 'none';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.width = '600px';
        panel.style.height = '400px';
        panel.style.overflow = 'auto';
        
        panel.innerHTML += `
            <div id="skill-content">
                <!-- 技能内容将由游戏动态更新 -->
            </div>
        `;
    }
    
    createAchievementPanel() {
        const panel = this.createPanel('achievements', '成就系统', 'center');
        panel.style.display = 'none';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.width = '500px';
        panel.style.height = '400px';
        panel.style.overflow = 'auto';
        
        panel.innerHTML += `
            <div id="achievement-content">
                <!-- 成就内容将由游戏动态更新 -->
            </div>
        `;
    }
    
    createStatisticsPanel() {
        const panel = this.createPanel('statistics', '游戏统计', 'center');
        panel.style.display = 'none';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.width = '500px';
        panel.style.height = '400px';
        panel.style.overflow = 'auto';
        
        panel.innerHTML += `
            <div id="statistics-content">
                <!-- 统计内容将由游戏动态更新 -->
            </div>
        `;
    }
    
    createSettingsPanel() {
        const panel = this.createPanel('settings', '游戏设置', 'center');
        panel.style.display = 'none';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.width = '400px';
        
        panel.innerHTML += `
            <div class="setting-item" style="margin: 10px 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="showFPS">
                    <span>显示FPS</span>
                </label>
            </div>
            <div class="setting-item" style="margin: 10px 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="showDebugInfo">
                    <span>显示调试信息</span>
                </label>
            </div>
            <div class="setting-item" style="margin: 10px 0;">
                <label style="display: block; margin-bottom: 5px;">UI透明度:</label>
                <input type="range" id="uiTransparency" min="0.3" max="1.0" step="0.1" value="0.9" style="width: 100%;">
                <span id="transparencyValue">0.9</span>
            </div>
            <div class="setting-item" style="margin: 10px 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="soundEnabled" checked>
                    <span>启用音效</span>
                </label>
            </div>
            <div class="setting-item" style="margin: 10px 0;">
                <button id="resetSettings" style="padding: 8px 15px; background: #4ecdc4; border: none; border-radius: 5px; color: white; cursor: pointer;">重置设置</button>
            </div>
        `;
        
        this.bindSettingsEvents();
    }
    
    createToggleHint() {
        const hint = document.createElement('div');
        hint.className = 'ui-toggle-hint';
        hint.textContent = '按 H 键隐藏/显示UI界面';
        this.mainContainer.appendChild(hint);
        
        // 5秒后自动隐藏提示
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 300);
        }, 5000);
    }
    
    createPanel(id, title, position) {
        const panel = document.createElement('div');
        panel.id = `panel-${id}`;
        panel.className = 'ui-panel';
        panel.style.cssText = `
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 20, 0.85));
            border: 2px solid #4ecdc4;
            border-radius: 12px;
            padding: 18px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(78, 205, 196, 0.2);
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        panel.innerHTML = `
            <div class="panel-header">
                <span class="panel-title" style="text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);">${title}</span>
                <button class="panel-close" data-panel-id="${id}" style="transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255, 107, 107, 0.2)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='none'; this.style.transform='scale(1)'">&times;</button>
            </div>
        `;
        
        // 添加关闭按钮事件监听器
        const closeButton = panel.querySelector('.panel-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hidePanel(id);
            });
        }
        
        this.mainContainer.appendChild(panel);
        this.panels.set(id, panel);
        
        return panel;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    this.toggleUI();
                    break;
                case 'k':
                    e.preventDefault();
                    this.togglePanel('skills');
                    break;
                case 'j':
                    e.preventDefault();
                    this.togglePanel('achievements');
                    break;
                case 'l':
                    e.preventDefault();
                    this.togglePanel('statistics');
                    break;
                case 'f1':
                    e.preventDefault();
                    this.togglePanel('settings');
                    break;
                case 'escape':
                    this.hideAllPanels();
                    break;
            }
        });
    }
    
    bindSettingsEvents() {
        const transparencySlider = document.getElementById('uiTransparency');
        const transparencyValue = document.getElementById('transparencyValue');
        
        if (transparencySlider) {
            transparencySlider.addEventListener('input', (e) => {
                this.transparency = parseFloat(e.target.value);
                transparencyValue.textContent = this.transparency;
                this.updateTransparency();
            });
        }
        
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }
    
    updateGameInfo(gameData = null) {
        if (!this.isUIVisible) return;
        
        // 使用传入的数据或从游戏对象获取数据
        const data = gameData || {
            health: this.game.player?.health || 0,
            score: this.game.score || 0,
            wave: this.game.waveSystem?.currentWave || 1,
            kills: this.game.killCount || 0,
            weapon: this.game.currentWeapon || '手枪',
            enemyCount: this.game.enemies?.length || 0,
            skillPoints: this.game.player?.skillSystem?.skillPoints || 0
        };
        
        // 更新游戏信息面板内容
        const gameInfoPanel = this.panels.get('gameInfo');
        if (gameInfoPanel) {
            const content = gameInfoPanel.querySelector('.panel-content');
            if (content) {
                content.innerHTML = `
                     <style>
                         .stat-item {
                             display: flex;
                             justify-content: space-between;
                             align-items: center;
                             margin-bottom: 8px;
                             padding: 6px 10px;
                             background: rgba(255, 255, 255, 0.05);
                             border-radius: 6px;
                             border-left: 3px solid #4ecdc4;
                         }
                         .stat-label {
                             color: #b8b8b8;
                             font-size: 13px;
                         }
                         .stat-value {
                             color: #4ecdc4;
                             font-weight: bold;
                             font-size: 14px;
                         }
                     </style>
                     <div class="stat-item">
                         <span class="stat-label">生命值:</span>
                         <span class="stat-value" style="color: ${data.health > 30 ? '#4ecdc4' : '#ff6b6b'}">${Math.max(0, data.health)}</span>
                     </div>
                     <div class="stat-item">
                         <span class="stat-label">得分:</span>
                         <span class="stat-value">${data.score}</span>
                     </div>
                     <div class="stat-item">
                         <span class="stat-label">波次:</span>
                         <span class="stat-value">${data.wave}</span>
                     </div>
                     <div class="stat-item">
                         <span class="stat-label">击杀:</span>
                         <span class="stat-value">${data.kills}</span>
                     </div>
                     <div class="stat-item">
                         <span class="stat-label">武器:</span>
                         <span class="stat-value">${data.weapon}</span>
                     </div>
                     <div class="stat-item">
                         <span class="stat-label">敌人数量:</span>
                         <span class="stat-value">${data.enemyCount}</span>
                     </div>
                     <div class="stat-item">
                         <span class="stat-label">技能点:</span>
                         <span class="stat-value">${data.skillPoints || 0}</span>
                     </div>
                 `;
            }
        }
    }
    
    toggleUI() {
        this.isUIVisible = !this.isUIVisible;
        this.mainContainer.style.display = this.isUIVisible ? 'block' : 'none';
        
        // 显示临时提示
        if (!this.isUIVisible) {
            this.showTemporaryMessage('UI已隐藏，按H键显示');
        }
    }
    
    togglePanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) return;
        
        const isVisible = panel.style.display !== 'none';
        
        if (isVisible) {
            this.hidePanel(panelId);
        } else {
            this.showPanel(panelId);
        }
    }
    
    showPanel(panelId) {
        // 先隐藏其他中心面板
        const centerPanels = ['skills', 'achievements', 'statistics', 'settings'];
        centerPanels.forEach(id => {
            if (id !== panelId) {
                this.hidePanel(id);
            }
        });
        
        const panel = this.panels.get(panelId);
        if (panel) {
            panel.style.display = 'block';
            // 触发动画
            requestAnimationFrame(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            });
            panel.classList.remove('hidden');
        }
    }
    
    hidePanel(panelId) {
        const panel = this.panels.get(panelId);
        if (panel) {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-10px)';
            panel.classList.add('hidden');
            // 延迟隐藏以完成动画
            setTimeout(() => {
                if (panel.style.opacity === '0') {
                    panel.style.display = 'none';
                }
            }, 300);
        }
    }
    
    hideAllPanels() {
        const centerPanels = ['skills', 'achievements', 'statistics', 'settings'];
        centerPanels.forEach(id => this.hidePanel(id));
    }
    
    updateTransparency() {
        this.panels.forEach(panel => {
            const currentBg = panel.style.background;
            panel.style.background = `rgba(0, 0, 0, ${this.transparency * 0.8})`;
        });
    }
    
    applyTheme() {
        // 主题应用逻辑
        const themes = {
            dark: {
                background: 'rgba(0, 0, 0, 0.8)',
                border: '#4ecdc4',
                text: '#ffffff',
                accent: '#feca57'
            },
            light: {
                background: 'rgba(255, 255, 255, 0.9)',
                border: '#2c3e50',
                text: '#2c3e50',
                accent: '#e74c3c'
            }
        };
        
        const theme = themes[this.currentTheme];
        this.panels.forEach(panel => {
            panel.style.background = theme.background;
            panel.style.borderColor = theme.border;
            panel.style.color = theme.text;
        });
    }
    
    resetSettings() {
        this.transparency = 0.9;
        document.getElementById('uiTransparency').value = 0.9;
        document.getElementById('transparencyValue').textContent = '0.9';
        this.updateTransparency();
        
        document.getElementById('showFPS').checked = false;
        document.getElementById('showDebugInfo').checked = false;
        document.getElementById('soundEnabled').checked = true;
        
        this.showTemporaryMessage('设置已重置');
    }
    
    showTemporaryMessage(message, duration = 2000) {
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 16px;
            z-index: 2000;
            pointer-events: none;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.3s';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
    
    // 获取面板内容容器，供游戏系统更新内容
    getPanelContent(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) return null;
        
        return panel.querySelector(`#${panelId}-content`);
    }
    
    // 更新技能面板内容
    updateSkillPanel(skillData) {
        const content = document.getElementById('skill-content');
        if (!content || !skillData) return;
        
        content.innerHTML = skillData;
    }
    
    // 更新成就面板内容
    updateAchievementPanel(achievementData) {
        const content = document.getElementById('achievement-content');
        if (!content || !achievementData) return;
        
        content.innerHTML = achievementData;
    }
    
    // 更新统计面板内容
    updateStatisticsPanel(statisticsData) {
        const content = document.getElementById('statistics-content');
        if (!content || !statisticsData) return;
        
        content.innerHTML = statisticsData;
    }
    
    // 渲染方法 - 用于游戏主循环调用
    render(ctx) {
        // 统一UI系统主要通过DOM元素渲染，不需要在canvas上绘制
        // 这个方法保持为空，确保游戏主循环不会出错
        // 如果将来需要在canvas上绘制UI元素，可以在这里添加相关代码
    }
}

// 全局实例
let unifiedUI = null;

// 初始化函数
function initializeUnifiedUI(game) {
    unifiedUI = new UnifiedUIManager(game);
    return unifiedUI;
}