/**
 * PDF Tag Plugin
 * Usage: {% pdf url %}
 */

hexo.extend.tag.register('pdf', function(args) {
    const url = args[0];
    
    return `
    <div class="aetheria-pdf-container fade-in-up">
        <div class="pdf-header">
            <div class="pdf-title"><i data-lucide="file-text"></i> PDF Document</div>
            <a href="${url}" target="_blank" class="pdf-download" title="Open in new tab"><i data-lucide="external-link"></i></a>
        </div>
        <div class="pdf-viewport">
            <iframe src="${url}" width="100%" height="600px" frameborder="0"></iframe>
        </div>
    </div>
    `;
});
