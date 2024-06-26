document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#form");
  const signupBtn = document.querySelector("#signupBtn");
  const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");

  signupBtn.addEventListener("click", function () {
    showSignupPage();
  });
  forgotPasswordBtn.addEventListener("click", function () {
    forgotPasswordHandler();
  });

  const emailInp = document.querySelector("#email");
  const passwordInp = document.querySelector("#password");

  form.addEventListener("submit", addUser);
  async function addUser(e) {
    e.preventDefault();
    let email = emailInp.value;
    let password = passwordInp.value;
    let obj = {
      email,
      password,
    };
    try {
      const response = await axios.post("http://localhost:3000/user/login", obj);
      alert(response.data.message);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("isPremium", response.data.isPremium);
      window.location.href = "http://localhost:3000/expenses";
      emailInp.value = "";
      passwordInp.value = "";
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  function showSignupPage() {
    window.location.href = "http://localhost:3000/user/signup";
  }

  function forgotPasswordHandler() {
    window.location.href = "http://localhost:3000/user/forgotpassword";
  }
});