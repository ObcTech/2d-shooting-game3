/**
 * 性能监控面板
 * 实时显示游戏性能指标和系统状态
 */

class PerformanceMonitor {
    constructor() {
        this.isVisible = false;
        this.monitorPanel = null;
        this.updateInterval = null;
        
        // 性能数据
        this.performanceData = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            particleCount: 0,
            entityCount: 0,
            drawCalls: 0,
            cpuUsage: 0,
            gpuUsage: 0
        };
        
        // 历史数据用于图表
        this.history = {
            fps: [],
            frameTime: [],
            memoryUsage: []
        };
        
        this.maxHistoryLength = 60; // 保存60帧的历史数据
        
        this.createMonitorUI();
        this.setupEventListeners();
    }
    
    // 创建监控UI
    createMonitorUI() {
        this.monitorPanel = document.createElement('div');
        this.monitorPanel.id = 'performance-monitor';
        this.monitorPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff6b6b;
            border-radius: 10px;
            padding: 15px;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000;
            display: none;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
        `;
        
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '性能监控';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #ff6b6b;
            text-align: center;
            text-shadow: 0 0 10px #ff6b6b;
        `;
        this.monitorPanel.appendChild(title);
        
        // 创建性能指标显示区域
        this.createMetricsDisplay();
        
        // 创建迷你图表
        this.createMiniCharts();
        
        // 创建控制按钮
        this.createControlButtons();
        
        document.body.appendChild(this.monitorPanel);
    }
    
    // 创建性能指标显示
    createMetricsDisplay() {
        const metricsContainer = document.createElement('div');
        metricsContainer.style.cssText = `
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
        `;
        
        const metrics = [
            { key: 'fps', label: 'FPS', unit: '', color: '#00ff00' },
            { key: 'frameTime', label: '帧时间', unit: 'ms', color: '#ffff00' },
            { key: 'memoryUsage', label: '内存使用', unit: 'MB', color: '#ff6b6b' },
            { key: 'particleCount', label: '粒子数量', unit: '', color: '#00ffff' },
            { key: 'entityCount', label: '实体数量', unit: '', color: '#ff00ff' },
            { key: 'drawCalls', label: '绘制调用', unit: '', color: '#ffa500' }
        ];
        
        metrics.forEach(metric => {
            const metricDiv = document.createElement('div');
            metricDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                padding: 2px 0;
            `;
            
            const label = document.createElement('span');
            label.textContent = metric.label + ':';
            label.style.color = metric.color;
            
            const value = document.createElement('span');
            value.id = `metric-${metric.key}`;
            value.textContent = '0' + metric.unit;
            value.style.cssText = `
                color: #ffffff;
                font-weight: bold;
            `;
            
            metricDiv.appendChild(label);
            metricDiv.appendChild(value);
            metricsContainer.appendChild(metricDiv);
        });
        
        this.monitorPanel.appendChild(metricsContainer);
    }
    
    // 创建迷你图表
    createMiniCharts() {
        const chartsContainer = document.createElement('div');
        chartsContainer.style.cssText = `
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
        `;
        
        const chartTitle = document.createElement('h4');
        chartTitle.textContent = 'FPS 趋势图';
        chartTitle.style.cssText = `
            margin: 0 0 10px 0;
            color: #00ff00;
            font-size: 11px;
        `;
        chartsContainer.appendChild(chartTitle);
        
        // 创建FPS图表画布
        this.fpsChart = document.createElement('canvas');
        this.fpsChart.width = 260;
        this.fpsChart.height = 60;
        this.fpsChart.style.cssText = `
            width: 100%;
            height: 60px;
            border: 1px solid #333;
            background: rgba(0, 0, 0, 0.3);
        `;
        chartsContainer.appendChild(this.fpsChart);
        
        this.monitorPanel.appendChild(chartsContainer);
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
        
        // 清除历史按钮
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '清除历史';
        clearBtn.style.cssText = `
            flex: 1;
            padding: 8px;
            background: #770000;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
        `;
        
        clearBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // 导出数据按钮
        const exportBtn = document.createElement('button');
        exportBtn.textContent = '导出数据';
        exportBtn.style.cssText = `
            flex: 1;
            padding: 8px;
            background: #000077;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
        `;
        
        exportBtn.addEventListener('click', () => {
            this.exportPerformanceData();
        });
        
        buttonContainer.appendChild(clearBtn);
        buttonContainer.appendChild(exportBtn);
        this.monitorPanel.appendChild(buttonContainer);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 快捷键切换监控面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    // 切换监控面板显示
    toggle() {
        this.isVisible = !this.isVisible;
        this.monitorPanel.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.startMonitoring();
        } else {
            this.stopMonitoring();
        }
    }
    
    // 开始监控
    startMonitoring() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.updatePerformanceData();
            this.updateDisplay();
            this.updateChart();
        }, 100); // 每100ms更新一次
    }
    
    // 停止监控
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // 更新性能数据
    updatePerformanceData() {
        // 获取FPS数据
        if (window.game && window.game.fps !== undefined) {
            this.performanceData.fps = Math.round(window.game.fps);
            this.performanceData.frameTime = window.game.frameTime || 0;
        }
        
        // 获取内存使用情况
        if (performance.memory) {
            this.performanceData.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        // 获取粒子数量
        if (window.enhancedParticles) {
            this.performanceData.particleCount = window.enhancedParticles.particles ? window.enhancedParticles.particles.length : 0;
        }
        
        // 获取实体数量
        if (window.game) {
            let entityCount = 0;
            if (window.game.enemies) entityCount += window.game.enemies.length;
            if (window.game.bullets) entityCount += window.game.bullets.length;
            if (window.game.powerUps) entityCount += window.game.powerUps.length;
            this.performanceData.entityCount = entityCount;
        }
        
        // 更新历史数据
        this.updateHistory();
    }
    
    // 更新历史数据
    updateHistory() {
        this.history.fps.push(this.performanceData.fps);
        this.history.frameTime.push(this.performanceData.frameTime);
        this.history.memoryUsage.push(this.performanceData.memoryUsage);
        
        // 限制历史数据长度
        Object.keys(this.history).forEach(key => {
            if (this.history[key].length > this.maxHistoryLength) {
                this.history[key].shift();
            }
        });
    }
    
    // 更新显示
    updateDisplay() {
        Object.keys(this.performanceData).forEach(key => {
            const element = document.getElementById(`metric-${key}`);
            if (element) {
                let value = this.performanceData[key];
                let unit = '';
                
                switch (key) {
                    case 'frameTime':
                        unit = 'ms';
                        value = value.toFixed(1);
                        break;
                    case 'memoryUsage':
                        unit = 'MB';
                        break;
                    default:
                        value = Math.round(value);
                }
                
                element.textContent = value + unit;
                
                // 根据性能状态改变颜色
                if (key === 'fps') {
                    if (value >= 50) {
                        element.style.color = '#00ff00';
                    } else if (value >= 30) {
                        element.style.color = '#ffff00';
                    } else {
                        element.style.color = '#ff0000';
                    }
                }
            }
        });
    }
    
    // 更新图表
    updateChart() {
        if (!this.fpsChart) return;
        
        const ctx = this.fpsChart.getContext('2d');
        const width = this.fpsChart.width;
        const height = this.fpsChart.height;
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制网格
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // 水平网格线
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // 垂直网格线
        for (let i = 0; i <= 6; i++) {
            const x = (width / 6) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // 绘制FPS曲线
        if (this.history.fps.length > 1) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const maxFps = 60;
            const stepX = width / (this.maxHistoryLength - 1);
            
            this.history.fps.forEach((fps, index) => {
                const x = index * stepX;
                const y = height - (fps / maxFps) * height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // 绘制标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Courier New';
        ctx.fillText('60', 5, 12);
        ctx.fillText('30', 5, height / 2 + 4);
        ctx.fillText('0', 5, height - 2);
    }
    
    // 清除历史数据
    clearHistory() {
        Object.keys(this.history).forEach(key => {
            this.history[key] = [];
        });
        console.log('性能监控历史数据已清除');
    }
    
    // 导出性能数据
    exportPerformanceData() {
        const data = {
            timestamp: new Date().toISOString(),
            currentMetrics: this.performanceData,
            history: this.history
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('性能数据已导出');
    }
    
    // 获取性能报告
    getPerformanceReport() {
        const avgFps = this.history.fps.length > 0 ? 
            this.history.fps.reduce((a, b) => a + b, 0) / this.history.fps.length : 0;
        
        const minFps = this.history.fps.length > 0 ? Math.min(...this.history.fps) : 0;
        const maxFps = this.history.fps.length > 0 ? Math.max(...this.history.fps) : 0;
        
        return {
            averageFps: Math.round(avgFps),
            minimumFps: minFps,
            maximumFps: maxFps,
            currentMemory: this.performanceData.memoryUsage,
            particleCount: this.performanceData.particleCount,
            entityCount: this.performanceData.entityCount
        };
    }
}

// 全局实例
window.performanceMonitor = new PerformanceMonitor();

console.log('%c性能监控面板已加载', 'color: #ff6b6b; font-size: 14px; font-weight: bold;');
console.log('%c按 F3 键打开/关闭性能监控面板', 'color: #ffff00; font-size: 12px;');
console.log('%c可以实时监控游戏性能指标', 'color: #ffffff; font-size: 12px;');