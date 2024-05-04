document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#forgotPassword");
  const emailInp = document.querySelector("#email");
  const signupBtn = document.querySelector("#signupBtn");

  signupBtn.addEventListener("click", function () {
    showSignupPage();
  });

  form.addEventListener("submit", forgotPasswordHandler);
  async function forgotPasswordHandler(e) {
    e.preventDefault();
    let email = emailInp.value;
    try {
      const response = await axios.post(
        "http://51.21.2.190:3000/user/forgotpassword",
        { email }
      );
      alert(`Password reset link sent successfully!`);
    } catch (err) {
      console.log(err);
    } finally {
      emailInp.value = "";
      window.location.href = "../html/login.html";
    }
  }

  function showSignupPage() {
    window.location.href = "../html/signup.html";
  }
});
