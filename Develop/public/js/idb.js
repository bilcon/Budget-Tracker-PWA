window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

let db;
var request = window.indexedDB.open("BudgetTrackerDatabase", 1);

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("What a great success");
  console.log(event);

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onupgradeneeded = function (event) {
  var db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

function saveRecord(record) {
  var transaction = db.transaction(["pending", "readwrite"]);
  var store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  var transaction = db.transaction("pending", "readwrite");
  var store = transaction.objectStore("pending");
  var getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction("pending", "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
