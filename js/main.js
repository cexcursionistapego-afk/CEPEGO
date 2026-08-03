document.getElementById('year').textContent = new Date().getFullYear();

// Header con fondo al hacer scroll
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// Menú móvil
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navClose = document.getElementById('navClose');
navToggle.addEventListener('click', () => navMobile.classList.add('open'));
navClose.addEventListener('click', () => navMobile.classList.remove('open'));
navMobile.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navMobile.classList.remove('open'))
);

// Animación de entrada al hacer scroll
const revealEls = document.querySelectorAll('[data-reveal]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Formulario de contacto (placeholder hasta conectar backend)
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Formulario pendiente de conectar a un servicio de envío de correo.');
  });
}
