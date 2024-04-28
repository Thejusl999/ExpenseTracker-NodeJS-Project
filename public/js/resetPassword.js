document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#resetPassword");
  const passwordInp = document.querySelector("#password");
  const confirmPasswordInp = document.querySelector("#confirmPassword");
  const uuid = window.location.pathname.split("/")[3];
  const signupBtn = document.querySelector("#signupBtn");

  signupBtn.addEventListener("click", function () {
    showSignupPage();
  });

  form.addEventListener("submit", resetPasswordHandler);
  async function resetPasswordHandler(e) {
    e.preventDefault();
    let password = passwordInp.value;
    let confirmPassword = confirmPasswordInp.value;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
    } else {
      try {
        const response = await axios.post(
          `http://localhost:3000/user/resetpassword/${uuid}`,
          { password }
        );
        alert(response.data.message);
      } catch (err) {
        console.log(err);
      } finally {
        passwordInp.value = "";
        confirmPasswordInp.value = "";
        window.close();
      }
    }
  }

  function showSignupPage() {
    window.location.href = "http://localhost:3000/user/signup";
  }
});
