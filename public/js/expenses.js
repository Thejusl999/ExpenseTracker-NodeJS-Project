let downloadsCurrentPage = 1;
let expCurrentPage = 1;
const pagination = document.getElementById("pagination");
const expPagination = document.getElementById("expPagination");

const isPremium = localStorage.getItem("isPremium");
if (isPremium !== "null") {
  document.getElementById("premiumBtn").textContent = "You are a Premium User";
  document.getElementById("premiumBtn").onclick = null;
  document.getElementById("premiumBtn").style.cursor = "not-allowed";
  document.getElementById("leaderboardBtn").style.display = "inline";
  document.getElementById("premiumFeatures").style.display = "block";
  document.getElementById("downloadsDiv").style.display = "block";
} else {
  document.getElementById("expincDiv").classList.remove("col-6");
  document.getElementById("expincDiv").classList.add("col-12");
}

const form = document.querySelector("#form");
const expenseamtInp = document.querySelector("#expense");
const descriptionInp = document.querySelector("#description");
const categoryInp = document.querySelector("#category");

const expenseList = document.querySelector("#expenses");
const leaderboardList = document.querySelector("#leaderboard");

form.addEventListener("submit", addItem);
async function addItem(e) {
  e.preventDefault();
  if (
    expenseamtInp.value === "" ||
    descriptionInp.value === "" ||
    categoryInp.value === ""
  ) {
    alert("Fill all inputs!");
  } else {
    let amount = expenseamtInp.value;
    let description = descriptionInp.value;
    let category = categoryInp.value;
    let obj = {
      amount,
      description,
      category,
    };
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://51.21.2.190:3000/expenses/addExpense",
        obj,
        {
          headers: { "Authorization": token },
        }
      );
      showExpense(response.data.newExpense);
      document.getElementById("leaderboardDiv").style.display = "none";
      document.getElementById("leaderboardBtn").textContent =
        "SHOW LEADERBOARD";
      document.getElementById("refreshBtn").click();
      if (expenseList.childElementCount > 0) {
        document.getElementById("expensesDiv").style.display = "block";
      }
      expenseamtInp.value = "";
      descriptionInp.value = "";
      categoryInp.value = "";
    } catch (err) {
      console.log(err);
    }
  }
}

function showExpense(obj) {
  let newLi = document.createElement("li");
  newLi.className = "item";
  let details = `${obj.amount}-${obj.description}-${obj.category}`;
  newLi.appendChild(document.createTextNode(details));
  let delBtn = document.createElement("button");
  delBtn.className = "deletebtn delete";
  delBtn.appendChild(document.createTextNode("DELETE"));
  newLi.appendChild(delBtn);
  expenseList.appendChild(newLi);
}

expenseList.addEventListener("click", deleteItem);
async function deleteItem(e) {
  if (e.target.classList.contains("delete")) {
    if (confirm('Click on "OK" to Delete Item')) {
      let elementToDelete = e.target.parentElement.textContent.split("-")[1];
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://51.21.2.190:3000/expenses/getExpenses",
          {
            headers: { "Authorization": token },
          }
        );
        for (let i = 0; i < response.data.response.length; i++) {
          if (response.data.response[i].description === elementToDelete) {
            let deletedUser = response.data.response[i].description;
            try {
              await axios.delete(
                "http://51.21.2.190:3000/expenses/deleteExpense/" +
                  response.data.response[i].id
              );
              expenseList.removeChild(e.target.parentElement);
              console.log(deletedUser, "has been removed!");
              document.getElementById("leaderboardDiv").style.display = "none";
              document.getElementById("leaderboardBtn").textContent =
                "SHOW LEADERBOARD";
              if (expenseList.childElementCount === 0 && expCurrentPage === 1) {
                document.getElementById("expensesDiv").style.display = "none";
              } else if (
                expenseList.childElementCount === 0 &&
                expCurrentPage > 1
              ) {
                expCurrentPage--;
                document.getElementById("refreshBtn").click();
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

premiumBtn.addEventListener("click", premiumHandler);
async function premiumHandler(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      "http://51.21.2.190:3000/premium/buyPremium",
      {
        headers: { "Authorization": token },
      }
    );
    let options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async (res) => {
        try {
          const response = await axios.post(
            "http://51.21.2.190:3000/premium/updateStatus",
            {
              "order_id": options.order_id,
              "payment_id": res.razorpay_payment_id,
            },
            { headers: { "Authorization": token } }
          );
          alert("You are now a Premium User!");
          localStorage.setItem("isPremium", true);
          if (isPremium) {
            window.location.reload();
          }
          document.getElementById("premiumBtn").textContent =
            "You are a Premium User";
          document.getElementById("premiumBtn").onclick = null;
          document.getElementById("premiumBtn").style.cursor = "not-allowed";
          document.getElementById("leaderboardBtn").style.display = "inline";
          document.getElementById("premiumFeatures").style.display = "block";
        } catch (err) {
          alert("Something went wrong. Please retry!");
          const response = await axios.post(
            "http://51.21.2.190:3000/premium/updateStatus",
            {
              "order_id": options.order_id,
              "payment_id": res.razorpay_payment_id,
              "status": "FAILED",
            },
            { headers: { "Authorization": token } }
          );
          alert("Transaction Failed. Please retry!");
        }
      },
    };
    const razorpayUI = new Razorpay(options);
    razorpayUI.open();
    razorpayUI.on("payment.failed", async (res) => {
      try {
        const response = await axios.post(
          "http://51.21.2.190:3000/premium/updateStatus",
          {
            "order_id": options.order_id,
            "payment_id": res.razorpay_payment_id,
            "status": "FAILED",
          },
          { headers: { "Authorization": token } }
        );
        alert("Transaction Failed. Please retry!");
      } catch (err) {
        alert(err.response.data.message);
      }
    });
  } catch (err) {
    alert("Transaction Failed!");
  }
}

document
  .querySelector("#leaderboardBtn")
  .addEventListener("click", showLeaderboard);
async function showLeaderboard(e) {
  const token = localStorage.getItem("token");
  document.querySelector("#leaderboardDiv").style.display = "block";
  document.querySelector("#leaderboardBtn").textContent = "UPDATE LEADERBOARD";
  try {
    const response = await axios.get(
      "http://51.21.2.190:3000/premium/showLeaderboard",
      {
        headers: { "Authorization": token },
      }
    );
    while (leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.firstChild);
    }
    response.data.response.forEach((expense) => {
      const li = document.createElement("li");
      let total = expense.totalExpense === null ? 0 : expense.totalExpense;
      let details = `Name-${expense.name} Total Expense-${total}`;
      li.appendChild(document.createTextNode(details));
      leaderboardList.appendChild(li);
    });
  } catch (err) {
    console.log(err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const refreshBtn = document.getElementById("refreshBtn");
  const expensesBody = document.getElementById("expensesBody");
  const incomeBody = document.getElementById("incomeBody");

  const refreshDownloadsBtn = document.getElementById("refreshDownloadsBtn");
  const downloadsBody = document.getElementById("downloadsBody");

  localStorage.setItem(
    "expRows",
    localStorage.getItem("expRows") ? localStorage.getItem("expRows") : 5
  );
  localStorage.setItem(
    "dwnRows",
    localStorage.getItem("dwnRows") ? localStorage.getItem("dwnRows") : 3
  );
  document.getElementById("expRows").value = localStorage.getItem("expRows");
  document.getElementById("dwnRows").value = localStorage.getItem("dwnRows");

  refreshBtn.addEventListener("click", refreshData);
  function refreshData() {
    fetchExpenses();
    fetchIncome();
    generatePagination(
      `http://51.21.2.190:3000/expenses/getExpenses`,
      expPagination,
      expCurrentPage,
      fetch
    );
  }
  refreshDownloadsBtn.addEventListener("click", refreshDownloads);
  function refreshDownloads() {
    renderDownloads(downloadsCurrentPage);
    generatePagination(
      `http://51.21.2.190:3000/premium/getDownloads`,
      pagination,
      downloadsCurrentPage,
      renderDownloads
    );
  }
  refreshData();

  async function fetchExpenses() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://51.21.2.190:3000/expenses/getExpenses`,
        {
          headers: { "Authorization": token },
        }
      );
      renderExpenses(
        response.data.response.filter(
          (expense) => expense.category !== "INCOME"
        )
      );
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }

  async function fetchIncome() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://51.21.2.190:3000/expenses/getExpenses`,
        {
          headers: { "Authorization": token },
        }
      );
      renderIncome(
        response.data.response.filter(
          (expense) => expense.category === "INCOME"
        )
      );
    } catch (error) {
      console.error("Error fetching income:", error);
    }
  }

  async function renderExpenses(data) {
    expensesBody.innerHTML = "";
    if (data.length > 0) {
      data.forEach((expense) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>${expense.amount}</td>
              `;
        expensesBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td colspan='3'>No Expenses Yet</td>
            `;
      expensesBody.appendChild(row);
    }
  }

  function renderIncome(data) {
    incomeBody.innerHTML = "";
    if (data.length > 0) {
      data.forEach((income) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${income.description}</td>
                <td>${income.category}</td>
                <td>${income.amount}</td>
              `;
        incomeBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td colspan='3'>No Incomes Yet</td>
            `;
      incomeBody.appendChild(row);
    }
  }

  async function generatePagination(url, divName, currPage, loadCategory) {
    divName.innerHTML = "";
    const data = await fetchPageData(url);
    let size;
    if (divName.className === "pagination") {
      size = localStorage.getItem("dwnRows");
    } else {
      size = localStorage.getItem("expRows");
    }
    const pageCount = Math.ceil(data.response.length / size);
    for (let i = 1; i <= pageCount; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.addEventListener("click", () => {
        if (divName.className === "pagination") {
          downloadsCurrentPage = i;
          currPage = downloadsCurrentPage;
        } else {
          expCurrentPage = i;
          currPage = expCurrentPage;
        }
        updateActiveButton(divName, currPage, loadCategory);
      });
      divName.appendChild(button);
    }
    updateActiveButton(divName, currPage, loadCategory);
  }

  function updateActiveButton(divName, currPage, category) {
    const buttons = divName.querySelectorAll("button");
    buttons.forEach(async (button) => {
      button.classList.remove("active");
      if (parseInt(button.textContent) === currPage) {
        button.classList.add("active");
        category(button.textContent);
      }
    });
  }
  async function fetchPageData(url, page) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        headers: { "Authorization": token },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  renderDownloads(downloadsCurrentPage);
  generatePagination(
    `http://51.21.2.190:3000/premium/getDownloads`,
    pagination,
    downloadsCurrentPage,
    renderDownloads
  );

  async function renderDownloads(page) {
    downloadsBody.innerHTML = "";
    const data = await fetchPageData(
      `http://51.21.2.190:3000/premium/getDownloads?page=${page}&pageSize=${localStorage.getItem(
        "dwnRows"
      )}`,
      page
    );
    if (data.response.length > 0) {
      data.response.forEach((download) => {
        const row = document.createElement("tr");
        const filenameCell = document.createElement("td");
        row.appendChild(filenameCell);
        const dateCell = document.createElement("td");
        dateCell.textContent = download.filename;
        row.appendChild(dateCell);
        const link = document.createElement("a");
        link.href = download.url;
        link.download = "myexpenses.csv";
        link.textContent = "Download";
        filenameCell.appendChild(link);
        downloadsBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td colspan='2'>No Downloads Yet</td>
            `;
      downloadsBody.appendChild(row);
    }
  }

  async function fetch() {
    expenseList.innerHTML = "";
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://51.21.2.190:3000/expenses/getExpenses?page=${expCurrentPage}&pageSize=${localStorage.getItem(
          "expRows"
        )}`,
        {
          headers: { "Authorization": token },
        }
      );
      for (let i = 0; i < response.data.response.length; i++) {
        showExpense(response.data.response[i]);
        if (expenseList.childElementCount > 0) {
          document.getElementById("expensesDiv").style.display = "block";
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
});

document
  .querySelector(".downloadBtn")
  .addEventListener("click", downloadExpenses);
async function downloadExpenses() {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "http://51.21.2.190:3000/premium/downloadExpenses",
    {
      headers: { "Authorization": token },
    }
  );
  if (response.status === 200) {
    var a = document.createElement("a");
    a.href = response.data.fileURL;
    a.download = "myexpense.csv";
    a.click();
    document.getElementById("refreshDownloadsBtn").click();
  } else {
    throw new Error(response.data.message);
  }
}

document.getElementById("expRows").addEventListener("change", function () {
  localStorage.setItem("expRows", this.value);
  if (localStorage.getItem("expRows") > 0) {
    document.getElementById("refreshBtn").click();
  }
});

document.getElementById("dwnRows").addEventListener("change", function () {
  localStorage.setItem("dwnRows", this.value);
  if (localStorage.getItem("dwnRows") > 0) {
    document.getElementById("refreshDownloadsBtn").click();
  }
});
