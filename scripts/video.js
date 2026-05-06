/**
 * Video Tag Plugin
 * Usage: {% video url [poster] %}
 */

hexo.extend.tag.register('video', function(args) {
    const url = args[0];
    const poster = args[1] || '';
    
    return `
    <div class="aetheria-video-container fade-in-up">
        <video controls preload="metadata" poster="${poster}" class="aetheria-video">
            <source src="${url}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div class="video-overlay">
            <div class="play-hint"><i data-lucide="play-circle"></i></div>
        </div>
    </div>
    `;
});
