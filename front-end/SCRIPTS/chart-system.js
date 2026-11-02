// Chart interaction and tooltip system
document.addEventListener('DOMContentLoaded', function() {
    const chartBars = document.querySelectorAll('.chart-bar');
    const tooltip = document.getElementById('chartTooltip');
    
    if (!tooltip || !chartBars.length) return;
    
    // Add hover tracking for tooltip
    chartBars.forEach(bar => {
        bar.style.cursor = 'pointer';
        bar.style.transition = 'all 0.2s ease';
        
        bar.addEventListener('mouseenter', function(e) {
            const month = this.dataset.month;
            const revenue = this.dataset.revenue;
            const orders = this.dataset.orders;
            const growth = this.dataset.growth;
            
            // Update tooltip content
            const monthEl = document.getElementById('tooltipMonth');
            const revenueEl = document.getElementById('tooltipRevenue');
            const ordersEl = document.getElementById('tooltipOrders');
            const growthEl = document.getElementById('tooltipGrowth');
            
            if (monthEl) monthEl.textContent = month;
            if (revenueEl) revenueEl.textContent = '€ ' + parseInt(revenue).toLocaleString('fr-FR');
            if (ordersEl) ordersEl.textContent = parseInt(orders).toLocaleString('fr-FR');
            if (growthEl) growthEl.textContent = growth;
            
            tooltip.style.display = 'block';
            tooltip.style.position = 'fixed';
            tooltip.style.zIndex = '10000';
            
            // Add hover effect to bar
            this.style.opacity = '0.8';
            this.style.transform = 'scaleY(1.05)';
        });
        
        bar.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Position tooltip near cursor, but within viewport
            let x = e.clientX - tooltipRect.width / 2;
            let y = e.clientY - tooltipRect.height - 15;
            
            // Clamp to viewport
            x = Math.max(10, Math.min(x, window.innerWidth - tooltipRect.width - 10));
            y = Math.max(10, y);
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        });
        
        bar.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
            this.style.opacity = '1';
            this.style.transform = 'scaleY(1)';
        });
    });
});

// Chart view toggle functionality
function toggleChartView(viewType) {
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;
    
    const barGroup = document.querySelector('.chart-bar-group');
    const viewButtons = document.querySelectorAll('[data-chart-view]');
    
    // Update active button
    viewButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Store preference
    localStorage.setItem('dashboard-chart-view', viewType);
    
    // Apply view-specific styling
    if (viewType === 'bars') {
        barGroup.style.display = 'flex';
        barGroup.style.justifyContent = 'space-around';
        barGroup.style.alignItems = 'flex-end';
        barGroup.style.height = '280px';
        barGroup.style.gap = '12px';
    } else if (viewType === 'line') {
        // Line chart view - transform bars into line chart
        barGroup.style.position = 'relative';
        barGroup.style.display = 'flex';
        barGroup.style.alignItems = 'flex-end';
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach((bar, index) => {
            bar.style.width = 'calc(100% / ' + bars.length + ')';
            bar.style.borderRadius = '0';
            bar.style.borderRight = '2px solid #667eea';
        });
    } else if (viewType === 'area') {
        // Area chart view
        barGroup.style.background = 'linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, transparent 100%)';
        barGroup.style.borderRadius = '4px';
    }
}

// Initialize chart view from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedView = localStorage.getItem('dashboard-chart-view') || 'bars';
    const btn = document.querySelector('[data-chart-view="' + savedView + '"]');
    if (btn) {
        btn.classList.add('active');
    }
});
