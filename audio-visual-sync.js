/**
 * 音效与视觉联动系统
 * 实现音效触发的视觉特效和节拍同步效果
 */

class AudioVisualSyncSystem {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.frequencyData = null;
        this.timeData = null;
        this.isInitialized = false;
        
        // 音频分析参数
        this.fftSize = 256;
        this.smoothingTimeConstant = 0.8;
        
        // 频率范围
        this.bassRange = { start: 0, end: 10 };
        this.midRange = { start: 10, end: 50 };
        this.trebleRange = { start: 50, end: 128 };
        
        // 视觉效果配置
        this.visualEffects = {
            bass: {
                screenShake: true,
                colorPulse: true,
                particleBurst: true,
                intensity: 1.0
            },
            mid: {
                lightFlash: true,
                waveform: true,
                intensity: 0.8
            },
            treble: {
                sparkles: true,
                highFreqEffects: true,
                intensity: 0.6
            }
        };
        
        // 节拍检测
        this.beatDetection = {
            threshold: 0.3,
            minInterval: 300, // 最小节拍间隔(ms)
            lastBeatTime: 0,
            beatHistory: [],
            bpm: 120
        };
        
        // 视觉同步效果
        this.syncEffects = [];
        this.backgroundPulse = { intensity: 0, phase: 0 };
        this.colorShift = { hue: 0, saturation: 1 };
        
        this.initializeAudioContext();
    }
    
    // 初始化音频上下文
    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
            
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);
            
            this.isInitialized = true;
            console.log('Audio-Visual Sync System initialized');
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
        }
    }
    
    // 连接音频源
    connectAudioSource(audioElement) {
        if (!this.isInitialized || !audioElement) return false;
        
        try {
            const source = this.audioContext.createMediaElementSource(audioElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            return true;
        } catch (error) {
            console.warn('Failed to connect audio source:', error);
            return false;
        }
    }
    
    // 更新音频分析
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // 获取频域和时域数据
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeData);
        
        // 分析音频特征
        const audioFeatures = this.analyzeAudioFeatures();
        
        // 检测节拍
        this.detectBeat(audioFeatures);
        
        // 更新视觉效果
        this.updateVisualEffects(audioFeatures, deltaTime);
        
        // 更新同步效果
        this.updateSyncEffects(deltaTime);
    }
    
    // 分析音频特征
    analyzeAudioFeatures() {
        const features = {
            bass: 0,
            mid: 0,
            treble: 0,
            overall: 0,
            rms: 0
        };
        
        // 计算各频段能量
        features.bass = this.getFrequencyRangeEnergy(this.bassRange);
        features.mid = this.getFrequencyRangeEnergy(this.midRange);
        features.treble = this.getFrequencyRangeEnergy(this.trebleRange);
        
        // 计算总体能量
        let sum = 0;
        for (let i = 0; i < this.frequencyData.length; i++) {
            sum += this.frequencyData[i];
        }
        features.overall = sum / this.frequencyData.length / 255;
        
        // 计算RMS
        let rmsSum = 0;
        for (let i = 0; i < this.timeData.length; i++) {
            const sample = (this.timeData[i] - 128) / 128;
            rmsSum += sample * sample;
        }
        features.rms = Math.sqrt(rmsSum / this.timeData.length);
        
        return features;
    }
    
    // 获取频率范围能量
    getFrequencyRangeEnergy(range) {
        let sum = 0;
        for (let i = range.start; i < range.end && i < this.frequencyData.length; i++) {
            sum += this.frequencyData[i];
        }
        return sum / (range.end - range.start) / 255;
    }
    
    // 检测节拍
    detectBeat(audioFeatures) {
        const currentTime = Date.now();
        const timeSinceLastBeat = currentTime - this.beatDetection.lastBeatTime;
        
        // 检查是否超过最小间隔
        if (timeSinceLastBeat < this.beatDetection.minInterval) return false;
        
        // 检查能量阈值
        const energyThreshold = this.beatDetection.threshold;
        const isBeat = audioFeatures.bass > energyThreshold || audioFeatures.overall > energyThreshold;
        
        if (isBeat) {
            this.beatDetection.lastBeatTime = currentTime;
            this.beatDetection.beatHistory.push(currentTime);
            
            // 保持最近的节拍历史
            if (this.beatDetection.beatHistory.length > 10) {
                this.beatDetection.beatHistory.shift();
            }
            
            // 计算BPM
            this.calculateBPM();
            
            // 触发节拍效果
            this.triggerBeatEffects(audioFeatures);
            
            return true;
        }
        
        return false;
    }
    
    // 计算BPM
    calculateBPM() {
        if (this.beatDetection.beatHistory.length < 2) return;
        
        const intervals = [];
        for (let i = 1; i < this.beatDetection.beatHistory.length; i++) {
            intervals.push(this.beatDetection.beatHistory[i] - this.beatDetection.beatHistory[i - 1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        this.beatDetection.bpm = Math.round(60000 / avgInterval);
    }
    
    // 触发节拍效果
    triggerBeatEffects(audioFeatures) {
        // 屏幕震动
        if (this.visualEffects.bass.screenShake && window.visualEffectsEnhanced) {
            const intensity = audioFeatures.bass * this.visualEffects.bass.intensity;
            window.visualEffectsEnhanced.addScreenShake(intensity * 10, 200);
        }
        
        // 颜色脉冲
        if (this.visualEffects.bass.colorPulse) {
            this.backgroundPulse.intensity = audioFeatures.bass * 0.5;
            this.backgroundPulse.phase = 0;
        }
        
        // 粒子爆发
        if (this.visualEffects.bass.particleBurst && window.enhancedParticles) {
            const burstCount = Math.floor(audioFeatures.bass * 20);
            for (let i = 0; i < burstCount; i++) {
                window.enhancedParticles.createEffect('explosion', {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    intensity: audioFeatures.bass
                });
            }
        }
        
        // 光闪效果
        if (this.visualEffects.mid.lightFlash && window.visualEffectsEnhanced) {
            const flashIntensity = audioFeatures.mid * this.visualEffects.mid.intensity;
            window.visualEffectsEnhanced.addLightFlash(flashIntensity);
        }
        
        // 高频特效
        if (this.visualEffects.treble.sparkles && audioFeatures.treble > 0.3) {
            this.createSparkleEffect(audioFeatures.treble);
        }
    }
    
    // 创建闪烁特效
    createSparkleEffect(intensity) {
        const sparkleCount = Math.floor(intensity * 15);
        
        for (let i = 0; i < sparkleCount; i++) {
            this.syncEffects.push({
                type: 'sparkle',
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                life: 500,
                maxLife: 500,
                size: Math.random() * 3 + 1,
                color: this.getSparkleColor(),
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4
                }
            });
        }
    }
    
    // 获取闪烁颜色
    getSparkleColor() {
        const colors = [
            '#ffffff', '#ffff00', '#00ffff', '#ff00ff',
            '#00ff00', '#ff8800', '#8800ff', '#ff0088'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 更新视觉效果
    updateVisualEffects(audioFeatures, deltaTime) {
        // 更新背景脉冲
        if (this.backgroundPulse.intensity > 0) {
            this.backgroundPulse.phase += deltaTime * 0.01;
            this.backgroundPulse.intensity *= 0.95; // 衰减
        }
        
        // 更新颜色偏移
        this.colorShift.hue += audioFeatures.overall * deltaTime * 0.1;
        this.colorShift.hue = this.colorShift.hue % 360;
        
        // 更新波形效果
        if (this.visualEffects.mid.waveform) {
            this.updateWaveformEffect(audioFeatures);
        }
    }
    
    // 更新波形效果
    updateWaveformEffect(audioFeatures) {
        // 基于音频数据创建波形可视化
        const waveformData = [];
        const step = Math.floor(this.timeData.length / 50);
        
        for (let i = 0; i < this.timeData.length; i += step) {
            const sample = (this.timeData[i] - 128) / 128;
            waveformData.push(sample);
        }
        
        // 存储波形数据供渲染使用
        this.waveformData = waveformData;
    }
    
    // 更新同步效果
    updateSyncEffects(deltaTime) {
        this.syncEffects = this.syncEffects.filter(effect => {
            effect.life -= deltaTime;
            
            // 更新效果位置
            effect.x += effect.velocity.x;
            effect.y += effect.velocity.y;
            
            // 应用重力或其他物理效果
            if (effect.type === 'sparkle') {
                effect.velocity.y += 0.1; // 重力
                effect.velocity.x *= 0.99; // 阻力
                effect.velocity.y *= 0.99;
            }
            
            return effect.life > 0;
        });
    }
    
    // 渲染音频可视化效果
    renderAudioVisualization(ctx, canvas) {
        if (!this.isInitialized) return;
        
        // 渲染频谱
        this.renderSpectrum(ctx, canvas);
        
        // 渲染波形
        this.renderWaveform(ctx, canvas);
        
        // 渲染同步效果
        this.renderSyncEffects(ctx);
        
        // 渲染背景脉冲
        this.renderBackgroundPulse(ctx, canvas);
    }
    
    // 渲染频谱
    renderSpectrum(ctx, canvas) {
        if (!this.frequencyData) return;
        
        const barWidth = canvas.width / this.frequencyData.length;
        const maxHeight = canvas.height * 0.3;
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        for (let i = 0; i < this.frequencyData.length; i++) {
            const barHeight = (this.frequencyData[i] / 255) * maxHeight;
            const x = i * barWidth;
            const y = canvas.height - barHeight;
            
            // 根据频率设置颜色
            const hue = (i / this.frequencyData.length) * 360 + this.colorShift.hue;
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
        
        ctx.restore();
    }
    
    // 渲染波形
    renderWaveform(ctx, canvas) {
        if (!this.waveformData) return;
        
        ctx.save();
        ctx.strokeStyle = `hsl(${this.colorShift.hue}, 70%, 60%)`;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        const centerY = canvas.height / 2;
        const amplitude = 50;
        
        for (let i = 0; i < this.waveformData.length; i++) {
            const x = (i / this.waveformData.length) * canvas.width;
            const y = centerY + this.waveformData[i] * amplitude;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        ctx.restore();
    }
    
    // 渲染同步效果
    renderSyncEffects(ctx) {
        this.syncEffects.forEach(effect => {
            ctx.save();
            
            const alpha = effect.life / effect.maxLife;
            ctx.globalAlpha = alpha;
            
            switch (effect.type) {
                case 'sparkle':
                    ctx.fillStyle = effect.color;
                    ctx.shadowColor = effect.color;
                    ctx.shadowBlur = 10;
                    
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // 十字星光
                    ctx.strokeStyle = effect.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(effect.x - effect.size * 2, effect.y);
                    ctx.lineTo(effect.x + effect.size * 2, effect.y);
                    ctx.moveTo(effect.x, effect.y - effect.size * 2);
                    ctx.lineTo(effect.x, effect.y + effect.size * 2);
                    ctx.stroke();
                    break;
            }
            
            ctx.restore();
        });
    }
    
    // 渲染背景脉冲
    renderBackgroundPulse(ctx, canvas) {
        if (this.backgroundPulse.intensity <= 0) return;
        
        ctx.save();
        
        const pulse = Math.sin(this.backgroundPulse.phase * 10) * 0.5 + 0.5;
        const alpha = this.backgroundPulse.intensity * pulse * 0.3;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${this.colorShift.hue}, 70%, 50%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.restore();
    }
    
    // 获取当前音频特征
    getCurrentAudioFeatures() {
        if (!this.isInitialized) return null;
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.analyzeAudioFeatures();
    }
    
    // 获取当前BPM
    getCurrentBPM() {
        return this.beatDetection.bpm;
    }
    
    // 设置视觉效果强度
    setEffectIntensity(effectType, intensity) {
        if (this.visualEffects[effectType]) {
            this.visualEffects[effectType].intensity = Math.max(0, Math.min(1, intensity));
        }
    }
    
    // 启用/禁用特定效果
    toggleEffect(effectType, effectName, enabled) {
        if (this.visualEffects[effectType] && this.visualEffects[effectType][effectName] !== undefined) {
            this.visualEffects[effectType][effectName] = enabled;
        }
    }
}

// 全局实例
window.audioVisualSync = new AudioVisualSyncSystem();