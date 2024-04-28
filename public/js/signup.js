document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#form");
  const loginBtn = document.querySelector("#loginBtn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addUser();
  });

  loginBtn.addEventListener("click", function () {
    showLoginPage();
  });

  async function addUser() {
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const obj = { name, email, password };

    try {
      const response = await axios.post("/user/signup", obj);
      alert("User signed up successfully!");
      clearForm();
      window.location.href = "/user/login";
    } catch (err) {
      alert("User already exists!");
    }
  }

  function showLoginPage() {
    window.location.href = "/user/login";
  }

  function clearForm() {
    document.querySelector("#name").value = "";
    document.querySelector("#email").value = "";
    document.querySelector("#password").value = "";
  }
});
