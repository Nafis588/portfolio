document.addEventListener('DOMContentLoaded', function () {
    const pageUrlElement = document.getElementById('page-url');
    const lastModifiedElement = document.getElementById('last-modified-date');
    pageUrlElement.textContent = window.location.href;
    const lastModified = document.lastModified;
    lastModifiedElement.textContent = new Date(lastModified).toLocaleString();
});
