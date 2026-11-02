// These controls demonstrate selection only. No invented recommendation,
// pricing, saved-package or comparison service is connected here.
for (const [selector, labelId, prefix] of [
  ['.goal-card', 'selectedGoalLabel', 'Đã chọn: '],
  ['.budget-card', 'selectedBudgetLabel', 'Ngân sách tham khảo: '],
]) {
  const cards = [...document.querySelectorAll(selector)];
  cards.forEach(card => {
    card.setAttribute('aria-pressed', String(card.classList.contains('active')));
    card.addEventListener('click', () => {
      cards.forEach(other => {
        const active = other === card;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
        other.querySelector('.check-icon')?.classList.toggle('hidden', !active);
        const dot = other.querySelector('.radio-dot');
        dot?.classList.toggle('bg-secondary', active);
        dot?.classList.toggle('bg-surface-container-highest', !active);
      });
      const text = card.querySelector(selector === '.goal-card' ? 'h4' : '.font-bold')?.textContent.trim();
      const label = document.getElementById(labelId);
      if (label && text) label.textContent = prefix + text;
    });
  });
}
document.getElementById('triggerRecommendBtn')?.addEventListener('click', () => {
  location.hash = 'catalog';
  document.getElementById('catalog')?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });
  document.getElementById('searchInput')?.focus({ preventScroll: true });
});
