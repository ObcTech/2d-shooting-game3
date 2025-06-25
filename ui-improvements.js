// UI和用户体验改进模块

class UIManager {
    constructor(game) {
        this.game = game;
        this.notifications = [];
        this.tooltips = new Map();
        this.animations = [];
        this.settings = {
            showFPS: false,
            showDebugInfo: false,
            particleQuality: 1.0,
            soundEnabled: true,
            autoAim: true
        };
        this.setupUI();
    }

    setupUI() {
        this.createSettingsPanel();
        this.createNotificationSystem();
        this.setupKeyboardShortcuts();
        this.createTooltips();
    }

    createSettingsPanel() {
        const settingsHTML = `
            <div id="settingsPanel" class="panel" style="display: none;">
                <h3>游戏设置</h3>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="showFPS" ${this.settings.showFPS ? 'checked' : ''}>
                        显示FPS
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="showDebugInfo" ${this.settings.showDebugInfo ? 'checked' : ''}>
                        显示调试信息
                    </label>
                </div>
                <div class="setting-item">
                    <label>粒子质量:</label>
                    <input type="range" id="particleQuality" min="0.1" max="1.0" step="0.1" value="${this.settings.particleQuality}">
                    <span id="particleQualityValue">${this.settings.particleQuality}</span>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="soundEnabled" ${this.settings.soundEnabled ? 'checked' : ''}>
                        启用音效
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="autoAim" ${this.settings.autoAim ? 'checked' : ''}>
                        自动瞄准
                    </label>
                </div>
                <button onclick="uiManager.closeSettings()">关闭</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', settingsHTML);
        this.bindSettingsEvents();
    }

    bindSettingsEvents() {
        document.getElementById('showFPS').addEventListener('change', (e) => {
            this.settings.showFPS = e.target.checked;
        });
        
        document.getElementById('showDebugInfo').addEventListener('change', (e) => {
            this.settings.showDebugInfo = e.target.checked;
        });
        
        document.getElementById('particleQuality').addEventListener('input', (e) => {
            this.settings.particleQuality = parseFloat(e.target.value);
            this.game.particleQuality = this.settings.particleQuality;
            document.getElementById('particleQualityValue').textContent = this.settings.particleQuality;
        });
        
        document.getElementById('soundEnabled').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            CONFIG.AUDIO.ENABLED = this.settings.soundEnabled;
        });
        
        document.getElementById('autoAim').addEventListener('change', (e) => {
            this.settings.autoAim = e.target.checked;
        });
    }

    createNotificationSystem() {
        const notificationHTML = `
            <div id="notificationContainer" style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                pointer-events: none;
            "></div>
        `;
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration,
            startTime: Date.now()
        };
        
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
    }

    renderNotification(notification) {
        const container = document.getElementById('notificationContainer');
        const notificationEl = document.createElement('div');
        notificationEl.id = `notification-${notification.id}`;
        notificationEl.className = `notification ${notification.type}`;
        notificationEl.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border-left: 4px solid ${this.getNotificationColor(notification.type)};
            animation: slideInRight 0.3s ease-out;
            pointer-events: auto;
            cursor: pointer;
        `;
        notificationEl.textContent = notification.message;
        notificationEl.onclick = () => this.removeNotification(notification.id);
        
        container.appendChild(notificationEl);
    }

    getNotificationColor(type) {
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        return colors[type] || colors.info;
    }

    removeNotification(id) {
        const notificationEl = document.getElementById(`notification-${id}`);
        if (notificationEl) {
            notificationEl.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notificationEl.remove();
            }, 300);
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    this.toggleSettings();
                    break;
                case 'F2':
                    e.preventDefault();
                    this.settings.showFPS = !this.settings.showFPS;
                    break;
                case 'F3':
                    e.preventDefault();
                    this.settings.showDebugInfo = !this.settings.showDebugInfo;
                    break;
                case 'Escape':
                    this.closeAllPanels();
                    break;
            }
        });
    }

    createTooltips() {
        const tooltipData = {
            'health': '生命值 - 当前生命值/最大生命值',
            'score': '得分 - 击败敌人获得分数',
            'wave': '波次 - 当前游戏波次',
            'kills': '击杀数 - 已击败的敌人数量',
            'enemyCount': '敌人数量 - 当前场上敌人数量'
        };
        
        Object.entries(tooltipData).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                this.addTooltip(element, text);
            }
        });
    }

    addTooltip(element, text) {
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, text);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    closeSettings() {
        document.getElementById('settingsPanel').style.display = 'none';
    }

    closeAllPanels() {
        document.getElementById('settingsPanel').style.display = 'none';
        // 关闭其他面板
        if (this.game && this.game.unifiedUI) {
            this.game.unifiedUI.hideAllPanels();
        }
    }

    renderDebugInfo(ctx, game) {
        if (!this.settings.showDebugInfo) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 150);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`FPS: ${game.fps}`, 20, 30);
        ctx.fillText(`敌人数量: ${game.enemies.length}`, 20, 50);
        ctx.fillText(`子弹数量: ${game.bullets.length}`, 20, 70);
        ctx.fillText(`粒子数量: ${game.particles.length}`, 20, 90);
        ctx.fillText(`敌人子弹: ${game.enemyBullets.length}`, 20, 110);
        ctx.fillText(`粒子质量: ${game.particleQuality.toFixed(1)}`, 20, 130);
        ctx.fillText(`最大粒子: ${game.maxParticles}`, 20, 150);
        ctx.restore();
    }

    renderFPS(ctx, fps) {
        if (!this.settings.showFPS) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 170, 80, 30);
        
        ctx.fillStyle = fps < 45 ? '#e74c3c' : fps < 55 ? '#f39c12' : '#2ecc71';
        ctx.font = '16px Arial';
        ctx.fillText(`FPS: ${fps}`, 20, 190);
        ctx.restore();
    }

    // 添加平滑的UI动画
    addAnimation(element, animation) {
        this.animations.push({ element, animation, startTime: Date.now() });
    }

    updateAnimations() {
        const currentTime = Date.now();
        this.animations = this.animations.filter(anim => {
            const elapsed = currentTime - anim.startTime;
            if (elapsed >= anim.animation.duration) {
                anim.animation.onComplete && anim.animation.onComplete();
                return false;
            }
            
            const progress = elapsed / anim.animation.duration;
            anim.animation.update(anim.element, progress);
            return true;
        });
    }
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #3498db;
        z-index: 1000;
        min-width: 300px;
    }
    
    .setting-item {
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .setting-item label {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .setting-item input[type="range"] {
        width: 100px;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 导出UI管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} else {
    window.UIManager = UIManager;
}