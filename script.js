document.getElementById("portfolioForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    name: name.value,
    github: github.value,
    email: email.value
  };

  localStorage.setItem("portfolio", JSON.stringify(data));
  window.location.href = "preview.html";
});
