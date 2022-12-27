const MY_SERVER = "https://complete-proj.onrender.com/library/"
// DISPLAYS:
// Display BOOKS
const getAllBooks = async () => {
  let book_Type = ""
  let msg = `<table id="bookTable" class="searchTable" style="text-align: center;">
    <tr>
      <th>Actions</th>
      <th>Book's Name</th>
      <th>Book's Author</th>
      <th>Book's Year of publish</th>
      <th>Book's maximum time of loan</th>
    </tr>`
  let res = ""
  await fetch(MY_SERVER + "books", { method: "GET" }).then((response) => response.json()).then((data) => res = data);
  res.map((book) => {
    if (book["book_Type"] == 1) book_Type = "up to 10 days"
    else if (book["book_Type"] == 2) book_Type = "up to 5 days"
    else if (book["book_Type"] == 3) book_Type = "up to 2 days"
    else book_Type = "ERORR"
    msg += `<tr>
        <td><button class="btn btn-danger" onclick="delBook(${book["id"]})">Delete Book</button></td>
        <td>${book["book_Name"]}</td>
        <td>${book["author"]}</td>
        <td>${book["year_Published"]}</td>
        <td>${book_Type}</td></tr>
        `}).join("")
        console.log(res)
  showBooks.innerHTML = msg;
}
getAllBooks()

// Display CUSTOMERS
const getAllCustomers = async () => {
  let msg = `<table id="custTable" class="searchTable" style="text-align: center;">
  <tr>
    <th>Actions</th>
    <th>customer's Name</th>
    <th>customer's city</th>
    <th>customer's age</th>
  </tr>`
  let res = ""
  await fetch(MY_SERVER + "customers", { method: "GET" }).then((response) => response.json()).then((data) => res = data);
  res.map((customer) => msg += `<tr>
  <td><button class="btn btn-danger" onclick="removeCust(${customer["id"]})">Delete Customer</button></td>
  <td>${customer["customerName"]}</td>
  <td>${customer["city"]}</td>
  <td>${customer["age"]}</td></tr>`).join("")
  document.getElementById("showCustomers").innerHTML = msg
}
getAllCustomers()

// Display LOANS
const getAllLoans = async () => {
  let msg = `<table id="loansTable" class="searchTable" style="text-align: center;">
  <tr>
    <th>Actions</th>
    <th>Cusomer's ID</th>
    <th>Loaned Book ID</th>
    <th>Loan's Date</th>
    <th>Loan's Return Date</th>
    <th>Status</th>
  </tr>`
  let res = ""
  await fetch(MY_SERVER + "loans", { method: "GET" }).then((response) => response.json()).then((data) => res = data);
  console.log(res)
  res.map((loan, i) => {
    let d1 = new Date();
    let d2 = new Date(loan["loan_Date"])
    let status = "ON TIME"
    if (loan["return_Date"] != "None") {
      d1 = new Date(loan["return_Date"])
    }

    var dif = Math.abs(d1 - d2);
    var d = Math.round(dif / (1000 * 3600 * 24)) - 1
    console.log(d + " Days");

    if (loan["book_Type"] == 1 && d > 10) status = "LATE"
    else if (loan["book_Type"] == 1 && d == 10) status = "DUE TODAY"
    else if (loan["book_Type"] == 2 && d > 5) status = "LATE"
    else if (loan["book_Type"] == 2 && d == 5) status = "DUE TODAY"
    else if (loan["book_Type"] == 3 && d > 2) status = "LATE"
    else if (loan["book_Type"] == 3 && d == 2) status = "DUE TODAY"

    if (loan["return_Date"] == "None") {
      msg += `<tr>
    <td><button class="btn btn-warning" onclick="returnBook(${loan["id"]})">Return Book</button></td>
    <td>${loan["customer_id"]}</td>
    <td>${loan["book_id"]}</td>
    <td>${loan["loan_Date"]}</td>
    <td><form class="formContainer"><input type="date" id="rDate${loan["id"]}" placeholder="Return Date" name="rDate" required ></form></td>
    <td>${status}</td></tr>`
    }
    else {
      msg += `<tr>
    <td><button class="btn btn-success">Returned</button></td>
    <td>${loan["customer_id"]}</td>
    <td>${loan["book_id"]}</td>
    <td>${loan["loan_Date"]}</td>
    <td>${loan["return_Date"]}</td>
    <td>${status}</td></tr>`
    }
  }).join("")
  document.getElementById("showLoans").innerHTML = msg
}
getAllLoans();

// ADD ITEMS
// ADD BOOK
const addBook = async () => {
  if (book_Name.value == "" || author.value == "" || year_Published.value == "" || book_Type.value == "") { invalidInput() }
  else if (book_Type.value > 3 || book_Type.value < 1) { invalidTypeInput() }
  else {
    const res = JSON.parse(`{
"book_Name":"${book_Name.value}",
"author":"${author.value}",
"year_Published":"${year_Published.value}",
"book_Type":${book_Type.value}
}`);
    console.log(res)
    await fetch(MY_SERVER + "books", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(res)
    })
    location.reload()
  }
}

// ADD CUSTOMER
const addCust = async () => {
  if (cid.value == "" || city.value == "" || age.value == "") { invalidInput() }
  else {
    const res = JSON.parse(`{
      "customerName":"${cid.value}",
      "city":"${city.value}",
      "age":${age.value}
      }`);
    await fetch(MY_SERVER + "customers", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(res)
    })
    location.reload()
  }
}

// ADD LOAN
const addLoan = async () => {
  if (customer_id.value == "" || customer_id.value == "" || lDate.value == "") { invalidInput() }
  else {
    const res = JSON.parse(`{
    "customer_id":${customer_id.value},
    "book_id":${book_id.value},
    "loan_Date":"${lDate.value}"
    }`);console.log(lDate.value)
    console.log(res)
    await fetch(MY_SERVER + "loans", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(res)
    })
    location.reload()
  }
}

// CLOSE LOAN
const returnBook = async (id) => {
  const res = JSON.parse(`{"return_Date":"${document.getElementById(`rDate${id}`).value}"}`);
  if (document.getElementById(`rDate${id}`).value == "") { invalidInput() }
  else {
    console.log(res)
    await fetch(MY_SERVER + `loans/${id}`, {
      method: "PUT",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(res)
    })
    location.reload()
  }
}

// DELETE CUSTOMER
const removeCust = async (id) => {
  await fetch(MY_SERVER + `customers/${id}`, { method: "DELETE" })
  location.reload()
}

// DELETE BOOK
const delBook = async (id) => {
  await fetch(MY_SERVER + `books/${id}`, { method: "DELETE" })
  location.reload()
}

// search for book by name
const searchBook = () => {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("searchForBook");
  filter = input.value.toUpperCase();
  table = document.getElementById("bookTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// search for customer by name
const searchCust = () => {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("searchForCust");
  filter = input.value.toUpperCase();
  table = document.getElementById("custTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Header fixed top on scroll
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    let headerOffset = selectHeader.offsetTop
    let nextElement = selectHeader.nextElementSibling
    const headerFixed = () => {
      if ((headerOffset - window.scrollY) <= 0) {
        selectHeader.classList.add('fixed-top')
        nextElement.classList.add('scrolled-offset')
      } else {
        selectHeader.classList.remove('fixed-top')
        nextElement.classList.remove('scrolled-offset')
      }
    }
    window.addEventListener('load', headerFixed)
    onscroll(document, headerFixed)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function (e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function (e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function (e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()

const invalidInput = () => {
  Toastify({
    text: "Please fill all mandatory fields",
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    onClick: function () { } // Callback after click
  }).showToast();
}

const invalidTypeInput = () => {
  Toastify({
    text: "Book type must be between 1 to 3",
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    onClick: function () { } // Callback after click
  }).showToast();
}