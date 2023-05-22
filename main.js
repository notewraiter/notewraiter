window.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            let target = document.querySelector(this.getAttribute('href'));

            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
