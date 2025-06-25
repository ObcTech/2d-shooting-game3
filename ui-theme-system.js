/**
 * UI主题系统
 * 实现科幻风格的界面设计和动态效果
 */

class UIThemeSystem {
    constructor() {
        this.currentTheme = 'cyberpunk';
        this.themes = {
            cyberpunk: {
                name: '赛博朋克',
                colors: {
                    primary: '#00f5ff',
                    secondary: '#ff0080',
                    accent: '#feca57',
                    background: 'rgba(0, 0, 0, 0.8)',
                    panel: 'rgba(0, 20, 40, 0.9)',
                    border: '#00f5ff',
                    text: '#ffffff',
                    textSecondary: '#a0a0a0',
                    success: '#00ff88',
                    warning: '#ffaa00',
                    danger: '#ff4757'
                },
                fonts: {
                    primary: 'Arial, sans-serif',
                    mono: 'Courier New, monospace'
                },
                effects: {
                    glow: true,
                    scanlines: true,
                    hologram: true,
                    particles: true
                }
            },
            military: {
                name: '军事风格',
                colors: {
                    primary: '#4a7c59',
                    secondary: '#8b9dc3',
                    accent: '#f39c12',
                    background: 'rgba(20, 30, 20, 0.8)',
                    panel: 'rgba(40, 60, 40, 0.9)',
                    border: '#4a7c59',
                    text: '#ffffff',
                    textSecondary: '#cccccc',
                    success: '#27ae60',
                    warning: '#f39c12',
                    danger: '#e74c3c'
                },
                fonts: {
                    primary: 'Arial, sans-serif',
                    mono: 'Courier New, monospace'
                },
                effects: {
                    glow: false,
                    scanlines: false,
                    hologram: false,
                    particles: false
                }
            }
        };
        
        this.animations = {
            slideIn: { duration: 300, easing: 'ease-out' },
            fadeIn: { duration: 200, easing: 'ease-in' },
            pulse: { duration: 1000, easing: 'ease-in-out' },
            glow: { duration: 2000, easing: 'ease-in-out' }
        };
        
        this.activeAnimations = new Map();
        this.canvas = null;
        this.ctx = null;
        
        this.initializeCanvas();
    }
    
    initializeCanvas() {
        // 创建离屏画布用于特效渲染
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
        }
    }
    
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }
    
    // 绘制科幻风格面板
    drawPanel(ctx, x, y, width, height, options = {}) {
        const theme = this.getCurrentTheme();
        const { title, glowIntensity = 1, cornerRadius = 10 } = options;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = theme.colors.panel;
        this.drawRoundedRect(ctx, x, y, width, height, cornerRadius);
        ctx.fill();
        
        // 边框发光效果
        if (theme.effects.glow) {
            ctx.shadowColor = theme.colors.border;
            ctx.shadowBlur = 10 * glowIntensity;
            ctx.strokeStyle = theme.colors.border;
            ctx.lineWidth = 2;
            this.drawRoundedRect(ctx, x, y, width, height, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeStyle = theme.colors.border;
            ctx.lineWidth = 2;
            this.drawRoundedRect(ctx, x, y, width, height, cornerRadius);
            ctx.stroke();
        }
        
        // 扫描线效果
        if (theme.effects.scanlines) {
            this.drawScanlines(ctx, x, y, width, height);
        }
        
        // 标题
        if (title) {
            ctx.fillStyle = theme.colors.primary;
            ctx.font = 'bold 16px ' + theme.fonts.primary;
            ctx.fillText(title, x + 15, y + 25);
        }
        
        ctx.restore();
    }
    
    // 绘制按钮
    drawButton(ctx, x, y, width, height, text, state = 'normal') {
        const theme = this.getCurrentTheme();
        
        ctx.save();
        
        let bgColor, borderColor, textColor;
        
        switch (state) {
            case 'hover':
                bgColor = theme.colors.primary + '40';
                borderColor = theme.colors.primary;
                textColor = theme.colors.primary;
                break;
            case 'pressed':
                bgColor = theme.colors.primary + '60';
                borderColor = theme.colors.primary;
                textColor = theme.colors.text;
                break;
            case 'disabled':
                bgColor = theme.colors.background;
                borderColor = theme.colors.textSecondary;
                textColor = theme.colors.textSecondary;
                break;
            default:
                bgColor = theme.colors.background;
                borderColor = theme.colors.border;
                textColor = theme.colors.text;
        }
        
        // 背景
        ctx.fillStyle = bgColor;
        this.drawRoundedRect(ctx, x, y, width, height, 5);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, x, y, width, height, 5);
        ctx.stroke();
        
        // 发光效果
        if (state === 'hover' && theme.effects.glow) {
            ctx.shadowColor = borderColor;
            ctx.shadowBlur = 15;
            ctx.stroke();
        }
        
        // 文字
        ctx.fillStyle = textColor;
        ctx.font = '14px ' + theme.fonts.primary;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
        
        ctx.restore();
    }
    
    // 绘制进度条
    drawProgressBar(ctx, x, y, width, height, progress, options = {}) {
        const theme = this.getCurrentTheme();
        const { label, showPercentage = true, animated = true } = options;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = theme.colors.background;
        this.drawRoundedRect(ctx, x, y, width, height, height / 2);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = theme.colors.border;
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, x, y, width, height, height / 2);
        ctx.stroke();
        
        // 进度填充
        if (progress > 0) {
            const fillWidth = width * Math.min(progress, 1);
            
            // 渐变填充
            const gradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
            gradient.addColorStop(0, theme.colors.primary);
            gradient.addColorStop(1, theme.colors.secondary);
            
            ctx.fillStyle = gradient;
            this.drawRoundedRect(ctx, x, y, fillWidth, height, height / 2);
            ctx.fill();
            
            // 发光效果
            if (theme.effects.glow) {
                ctx.shadowColor = theme.colors.primary;
                ctx.shadowBlur = 10;
                ctx.fill();
            }
        }
        
        // 标签和百分比
        if (label || showPercentage) {
            ctx.fillStyle = theme.colors.text;
            ctx.font = '12px ' + theme.fonts.primary;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let text = '';
            if (label) text += label;
            if (showPercentage) {
                if (label) text += ': ';
                text += Math.round(progress * 100) + '%';
            }
            
            ctx.fillText(text, x + width / 2, y + height / 2);
        }
        
        ctx.restore();
    }
    
    // 绘制图标
    drawIcon(ctx, x, y, size, iconType, color) {
        const theme = this.getCurrentTheme();
        
        ctx.save();
        ctx.fillStyle = color || theme.colors.primary;
        ctx.strokeStyle = color || theme.colors.primary;
        ctx.lineWidth = 2;
        
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size / 3;
        
        switch (iconType) {
            case 'health':
                // 十字图标
                ctx.fillRect(centerX - 2, centerY - radius, 4, radius * 2);
                ctx.fillRect(centerX - radius, centerY - 2, radius * 2, 4);
                break;
                
            case 'shield':
                // 盾牌图标
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - radius);
                ctx.lineTo(centerX + radius * 0.7, centerY - radius * 0.3);
                ctx.lineTo(centerX + radius * 0.7, centerY + radius * 0.3);
                ctx.lineTo(centerX, centerY + radius);
                ctx.lineTo(centerX - radius * 0.7, centerY + radius * 0.3);
                ctx.lineTo(centerX - radius * 0.7, centerY - radius * 0.3);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'weapon':
                // 武器图标
                ctx.fillRect(centerX - radius, centerY - 2, radius * 2, 4);
                ctx.fillRect(centerX + radius * 0.5, centerY - radius * 0.5, 4, radius);
                break;
                
            case 'coin':
                // 金币图标
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = theme.colors.background;
                ctx.font = 'bold ' + (size * 0.4) + 'px ' + theme.fonts.primary;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', centerX, centerY);
                break;
        }
        
        ctx.restore();
    }
    
    // 绘制扫描线效果
    drawScanlines(ctx, x, y, width, height) {
        const theme = this.getCurrentTheme();
        
        ctx.save();
        ctx.strokeStyle = theme.colors.primary + '20';
        ctx.lineWidth = 1;
        
        for (let i = y; i < y + height; i += 4) {
            ctx.beginPath();
            ctx.moveTo(x, i);
            ctx.lineTo(x + width, i);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // 绘制圆角矩形
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    // 动画系统
    startAnimation(id, type, duration, callback) {
        const animation = {
            id,
            type,
            duration,
            startTime: performance.now(),
            callback
        };
        
        this.activeAnimations.set(id, animation);
    }
    
    updateAnimations() {
        const currentTime = performance.now();
        
        for (const [id, animation] of this.activeAnimations) {
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            if (animation.callback) {
                animation.callback(progress);
            }
            
            if (progress >= 1) {
                this.activeAnimations.delete(id);
            }
        }
    }
    
    // 缓动函数
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // 获取主题颜色
    getColor(colorName) {
        return this.getCurrentTheme().colors[colorName] || '#ffffff';
    }
    
    // 获取主题字体
    getFont(fontName) {
        return this.getCurrentTheme().fonts[fontName] || 'Arial, sans-serif';
    }
}

// 全局实例
window.uiTheme = new UIThemeSystem();