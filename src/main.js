import { initScene, getToken } from "./app";
import "./styles.css";

initScene();

// Get modal elements
const modal = document.querySelector(".modal");
const closeBtn = document.querySelector(".close");
const spinner = document.getElementById("loading-spinner");
const spinnerText = document.getElementById("loading-text");

// Close modal when clicking the close button
closeBtn.addEventListener("click", () => {
  spinner.style.display = "block";
  spinnerText.style.display = "block";
  // Only login and start simulation after closing the modal
  getToken()
    .then(() => {
      modal.style.display = "none";
    })
    .finally(() => {
      spinner.style.display = "none";
      spinnerText.style.display = "none";
    });
});
