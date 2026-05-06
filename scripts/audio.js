/**
 * Audio Tag Plugin
 * Usage: {% audio url [title] %}
 */

hexo.extend.tag.register('audio', function(args) {
    const url = args[0];
    const title = args[1] || 'Audio Track';
    
    return `
    <div class="aetheria-audio-container fade-in-up">
        <div class="audio-info">
            <div class="audio-icon"><i data-lucide="music"></i></div>
            <div class="audio-details">
                <div class="audio-title">${title}</div>
                <div class="audio-subtitle">Press play to listen</div>
            </div>
        </div>
        <audio controls class="aetheria-audio">
            <source src="${url}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    </div>
    `;
});
