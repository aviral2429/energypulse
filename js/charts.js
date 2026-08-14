/**
 * charts.js
 * Configures and manages all ECharts instances.
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.resizeTimer = null;
        try {
            this.initCharts();
        } catch (e) {
            console.error('ChartManager init error:', e);
        }
        // Force resize after layout settles
        setTimeout(() => this.resizeCharts(), 500);
        setTimeout(() => this.resizeCharts(), 1500);
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.resizeCharts(), 200);
        });
        
        // Listen for theme change
        window.addEventListener('themeChanged', () => {
            // Re-render charts with new theme colors if necessary
            // ECharts doesn't support dynamic theme switching easily without recreation, 
            // but we can update options. For now we'll just resize to force a redraw.
            this.resizeCharts();
        });
    }
    
    getChartColor() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return {
            text: isLight ? '#333' : '#a0a0a0',
            line: isLight ? '#e0e0e0' : '#2a2a2a',
            accent: '#00e676',
            accentDark: '#00b259'
        };
    }
    
    initCharts() {
        const colors = this.getChartColor();
        
        // 1. Real-time Power Chart
        const rtPowerEl = document.getElementById('chart-realtime-power');
        if (rtPowerEl) {
            this.charts.realtime = echarts.init(rtPowerEl);
            this.charts.realtime.setOption({
                animationDuration: 1000,
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', textStyle: { color: '#fff' } },
                grid: { top: 10, right: 10, bottom: 20, left: 40 },
                xAxis: { 
                    type: 'category', 
                    boundaryGap: false, 
                    data: [],
                    axisLine: { lineStyle: { color: colors.line } },
                    axisLabel: { color: colors.text }
                },
                yAxis: { 
                    type: 'value', 
                    splitLine: { lineStyle: { color: colors.line } },
                    axisLabel: { color: colors.text }
                },
                series: [{
                    name: 'Power (kW)',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    itemStyle: { color: colors.accent },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 230, 118, 0.5)' },
                            { offset: 1, color: 'rgba(0, 230, 118, 0.0)' }
                        ])
                    },
                    data: []
                }]
            });
        }
        
        // 2. Device Breakdown
        const devBreakdownEl = document.getElementById('chart-device-breakdown');
        if (devBreakdownEl) {
            this.charts.breakdown = echarts.init(devBreakdownEl);
            this.charts.breakdown.setOption({
                animationDuration: 1000,
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, textStyle: { color: colors.text } },
                series: [{
                    name: 'Energy Usage',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: 'rgba(0,0,0,0)',
                        borderWidth: 2
                    },
                    label: { show: false },
                    data: [
                        { value: 45, name: 'HVAC', itemStyle: { color: '#00e676' } },
                        { value: 25, name: 'IT', itemStyle: { color: '#00b259' } },
                        { value: 15, name: 'Lighting', itemStyle: { color: '#008040' } },
                        { value: 10, name: 'Lab', itemStyle: { color: '#66ff99' } },
                        { value: 5, name: 'Other', itemStyle: { color: '#ccffcc' } }
                    ]
                }]
            });
        }

        // 3. Usage Heatmap
        const heatmapEl = document.getElementById('chart-usage-heatmap');
        if (heatmapEl) {
            this.charts.heatmap = echarts.init(heatmapEl);
            const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a','10a','11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const data = [];
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 24; j++) {
                    // Generate pseudo-realistic data: higher during day (8-18), lower at night
                    let base = (j >= 8 && j <= 18 && i > 0 && i < 6) ? 80 : 20;
                    data.push([j, i, base + Math.floor(Math.random() * 40)]);
                }
            }
            this.charts.heatmap.setOption({
                animationDuration: 1000,
                tooltip: { position: 'top' },
                grid: { top: 10, right: 10, bottom: 20, left: 40 },
                xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLabel: { color: colors.text } },
                yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLabel: { color: colors.text } },
                visualMap: {
                    min: 0, max: 120, calculable: true, orient: 'horizontal', left: 'center', bottom: -50, // Hide visual map
                    inRange: { color: ['rgba(0, 230, 118, 0.1)', 'rgba(0, 230, 118, 1)'] }
                },
                series: [{
                    name: 'kWh',
                    type: 'heatmap',
                    data: data,
                    label: { show: false },
                    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
                }]
            });
        }

        // 4. Daily Comparison
        const dailyCompEl = document.getElementById('chart-daily-comparison');
        if (dailyCompEl) {
            this.charts.daily = echarts.init(dailyCompEl);
            this.charts.daily.setOption({
                animationDuration: 1000,
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { top: 0, textStyle: { color: colors.text } },
                grid: { top: 30, right: 10, bottom: 20, left: 40 },
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { color: colors.text } },
                yAxis: { type: 'value', axisLabel: { color: colors.text }, splitLine: { lineStyle: { color: colors.line } } },
                series: [
                    { name: 'Last Week', type: 'bar', data: [320, 332, 301, 334, 390, 230, 210], itemStyle: { color: 'rgba(255,255,255,0.2)' } },
                    { name: 'This Week', type: 'bar', data: [310, 312, 290, 340, 380, 220, 200], itemStyle: { color: colors.accent } }
                ]
            });
        }

        // 5. Cost Trend
        const costTrendEl = document.getElementById('chart-cost-trend');
        if (costTrendEl) {
            this.charts.cost = echarts.init(costTrendEl);
            this.charts.cost.setOption({
                animationDuration: 1000,
                tooltip: { trigger: 'axis' },
                grid: { top: 10, right: 10, bottom: 20, left: 50 },
                xAxis: { type: 'category', boundaryGap: false, data: Array.from({length: 30}, (_, i) => `Day ${i+1}`), axisLabel: { color: colors.text } },
                yAxis: { type: 'value', axisLabel: { color: colors.text }, splitLine: { lineStyle: { color: colors.line } } },
                series: [{
                    name: 'Cost (₹)',
                    type: 'line',
                    smooth: true,
                    itemStyle: { color: '#ff9500' },
                    data: Array.from({length: 30}, () => 2000 + Math.random() * 500)
                }]
            });
        }

        // 6. Carbon Tracker
        const carbonTrackerEl = document.getElementById('chart-carbon-tracker');
        if (carbonTrackerEl) {
            this.charts.carbon = echarts.init(carbonTrackerEl);
            this.charts.carbon.setOption({
                animationDuration: 1000,
                series: [{
                    type: 'gauge',
                    startAngle: 180, endAngle: 0,
                    min: 0, max: 100,
                    splitNumber: 1,
                    axisLine: { lineStyle: { width: 15, color: [[0.7, '#00e676'], [1, '#ff3b30']] } },
                    pointer: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    detail: { show: true, fontSize: 24, formatter: '{value}%', color: colors.text, offsetCenter: [0, '0%'] },
                    data: [{ value: 65, name: 'Quota Used' }]
                }]
            });
            // Update equivalencies
            document.getElementById('eq-trees').innerText = '145';
            document.getElementById('eq-cars').innerText = '1,250';
        }

        // 7. Historical Analytics (Analytics View)
        const histEl = document.getElementById('chart-historical');
        if (histEl) {
            this.charts.historical = echarts.init(histEl);
            this.charts.historical.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 30, right: 30, bottom: 30, left: 50 },
                xAxis: { type: 'category', data: Array.from({length: 12}, (_, i) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]), axisLabel: { color: colors.text } },
                yAxis: { type: 'value', axisLabel: { color: colors.text }, splitLine: { lineStyle: { color: colors.line } } },
                series: [{
                    name: 'Energy (kWh)',
                    type: 'bar',
                    itemStyle: { color: colors.accent },
                    data: [8500, 9200, 8800, 9500, 11000, 12500, 13000, 12800, 10500, 9200, 8700, 8900]
                }]
            });
        }
    }
    
    updateRealtimeChart(timeData, valueData) {
        if (this.charts.realtime) {
            this.charts.realtime.setOption({
                xAxis: { data: timeData },
                series: [{ data: valueData }]
            });
        }
    }
    
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.resize();
        });
    }
}


window.ChartManager = ChartManager;

// Initialize ChartManager - works even if DOMContentLoaded already fired
(function initCharts() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.chartManager = new ChartManager();
        });
    } else {
        window.chartManager = new ChartManager();
    }
})();
