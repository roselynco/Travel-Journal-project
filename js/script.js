document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll(".page");

    function showPage(pageId) {
        sections.forEach((section) => {
            section.classList.remove("active");
        
    });
    document.getElementId(pageId).classList.add("active");

    }

    link.forEach ((link) => {
        link.addEventListener("click", function(event) {
            event.ptrventdefault ();
            const pageId = this.getAttribute("date-page");
            showPage(pageId);
    });
  });

  showPage("home");
});

const darkModeToggle = document.getEleemtzbyId("darkModeToggle");

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});