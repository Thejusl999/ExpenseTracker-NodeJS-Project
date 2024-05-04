document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#form");
  const loginBtn = document.querySelector("#loginBtn");
  localStorage.clear();

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
      const response = await axios.post("http://51.21.2.190:3000/user/signup", obj);
      alert("User signed up successfully!");
      clearForm();
    } catch (err) {
      alert("User already exists!");
    }finally{
      window.location.href = "../html/login.html";
    }
  }

  function showLoginPage() {
    window.location.href = "../html/login.html";
  }

  function clearForm() {
    document.querySelector("#name").value = "";
    document.querySelector("#email").value = "";
    document.querySelector("#password").value = "";
  }
});
