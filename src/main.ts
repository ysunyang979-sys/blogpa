import './style.css'
import { posts } from './posts/index';
import { Post } from './types';

// --- Navigation Logic ---
function navigateTo(viewId: string) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// --- Render Logic ---
function renderArchive() {
  const container = document.getElementById('posts-container');
  if (!container) return;

  container.innerHTML = posts.map(post => `
    <div class="feature-card glass" data-post-id="${post.id}">
      <i data-lucide="${post.icon}"></i>
      <h3 style="margin-top: 1.5rem;">${post.title}</h3>
      <p style="margin-top: 0.5rem; font-size: 0.9rem;">${post.excerpt}</p>
    </div>
  `).join('');

  // Re-initialize icons
  // @ts-ignore
  lucide.createIcons();

  // Re-add hover effects
  setupCardHoverEffects();

  // Add click events for posts
  document.querySelectorAll('[data-post-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-post-id');
      const post = posts.find(p => p.id === id);
      if (post) openPost(post);
    });
  });
}

function openPost(post: Post) {
  const content = document.getElementById('post-content');
  if (content) {
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 4rem;">
        <div class="badge">${post.icon.toUpperCase()}</div>
        <h1 class="title" style="margin-top: 1rem;">${post.title}</h1>
        <p style="color: var(--text-dim); font-size: 1.1rem;">发布于 ${post.date} // Aetheria Editorial</p>
      </div>
      <div class="glass" style="padding: var(--spacing-lg); border-radius: 40px; margin-top: 2rem; line-height: 2;">
        <div style="font-size: 1.25rem; color: var(--text-main);">
          ${post.content}
        </div>
      </div>
    `;
    navigateTo('post');
  }
}

function setupCardHoverEffects() {
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e: any) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      let glow = card.querySelector('.glow-spot') as HTMLElement;
      if (!glow) {
        glow = document.createElement('div');
        glow.classList.add('glow-spot');
        card.appendChild(glow);
      }
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  });
}

// --- Theme Switcher ---
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme: string) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    // @ts-ignore
    lucide.createIcons();
  }
}

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderArchive();
  // @ts-ignore
  lucide.createIcons();
  setupCardHoverEffects();

  // Navbar Scroll
  const navbar = document.querySelector('#navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  });

  // Link event delegation
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('[data-link]');
    if (link) {
      const view = link.getAttribute('data-link');
      if (view) navigateTo(view);
    }
  });
});
