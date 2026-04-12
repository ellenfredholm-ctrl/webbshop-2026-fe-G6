import { getEvents, createEvent } from "../utils/productsApi.js";

const form = document.getElementById("createEventForm");
const eventBody = document.getElementById("event-products-body");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value.trim();
  const totalSpots = parseInt(document.getElementById("totalSpots").value, 10);
  const category = document.getElementById("category").value.trim();
  // const price = parseFloat(document.getElementById("price").value);
  // const stock = parseInt(document.getElementById("stock").value, 10);
  // const image = document.getElementById("image").value.trim();
  // const slug = document.getElementById("slug").value.trim();

  try {
    await createEvent({ title, description, date, location, totalSpots, category});
    // await createEvent({ title, description, date, location, totalSpots, category, image, slug });
    form.reset();
    loadProducts();
  } catch (err) {
    alert(err.message || "Failed to create event");
  }
});

// async function loadProducts() {
//   tbody.innerHTML = "<tr><td colspan=\"4\">Loading...</td></tr>";
//   try {
//     const products = await getEvents();
//     if (products.length === 0) {
//       tbody.innerHTML = "<tr><td colspan=\"4\">No products yet.</td></tr>";
//       return;
//     }
//     tbody.innerHTML = products
//       .map(
//         (p) =>
//           `<tr><td>${p.name}</td><td>$${Number(p.price).toFixed(2)}</td><td>${p.stock}</td><td>${p.slug}</td></tr>`
//       )
//       .join("");
//   } catch {
//     tbody.innerHTML = "<tr><td colspan=\"4\">Failed to load products.</td></tr>";
//   }
// }

//test för eventlista
let events = [];
// const someEvents = [
//   {name: "Event 1", price: 10.99, stock: 10, slug: "event-one"},
//   {name: "Event 2", price: 12.99, stock: 12, slug: "event-two"},
//   {name: "Event 3", price: 13.99, stock: 13, slug: "event-three"},
//   {name: "Event 4", price: 14.99, stock: 14, slug: "event-four"},
// ];


//uppdaterad och wip loadproducts
async function loadProducts() {
  eventBody.innerHTML = "<p>Loading...<p>";
  try {
    events = await getEvents();
    // products = someEvents;
    if (events.length === 0) {
      eventBody.innerHTML = "<p>No products yet.</p>";
      return;
    }
    eventBody.innerHTML = events.map((p, index) =>
          // `<div class="event-card"><p>${p.name}</p><p>${Number(p.price).toFixed(2)}</p><p>${p.stock}</p><p>${p.slug}</p></div>`
          `<div class="event-card" data-index="${index}"><p>${p.title}</p><button class="event-details-btn">View</button></div>`
      )
      .join("");
  } catch (err){
    console.log(err);
    eventBody.innerHTML = "<p>Failed to load products.</p>";
  }
}

//modal pop-up för event-details
const eventModal = document.createElement('div');
eventModal.id = 'event-modal';

const eventModalBox = document.createElement('div');
eventModalBox.classList.add('modal-box');

const eventTitle = document.createElement('p');
const eventDescription = document.createElement('p');
const eventDate = document.createElement('p');
const eventLocation = document.createElement('p');
const eventTotalSpots = document.createElement('p');
const eventCategory = document.createElement('p');
// const eventPrice = document.createElement('p');

const closeEventModalBtn = document.createElement('button');
closeEventModalBtn.textContent = "Close";
//och ha en save button för att spara ändringar man gjort

eventModalBox.appendChild(eventTitle);
eventModalBox.appendChild(eventDescription);
eventModalBox.appendChild(eventDate);
eventModalBox.appendChild(eventLocation);
eventModalBox.appendChild(eventTotalSpots);
eventModalBox.appendChild(eventCategory);
// eventModalBox.appendChild(eventPrice);
eventModalBox.appendChild(closeEventModalBtn);
eventModal.appendChild(eventModalBox);

function openModal() {
  eventModal.classList.add('show');
}

function closeModal() {
  eventModal.classList.remove('show');
}

document.body.appendChild(eventModal);

eventBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('event-details-btn')) {
    const card = e.target.closest('.event-card');
    const index = card.dataset.index;
    const event = events[index];
    eventTitle.textContent = `Title: ${event.title}`;
    eventDescription.textContent = `Description: ${event.description}`;
    eventDate.textContent = `Date: ${new Date(event.date).toLocaleDateString()}`;
    eventLocation.textContent = `Location: ${event.location}`;
    eventTotalSpots.textContent = `Total spots: ${event.totalSpots}`;
    eventCategory.textContent = `Category: ${event.category}`;
    // eventPrice.textContent = `Price: ${product.price}`;
    openModal();
    
  }
})

closeEventModalBtn.addEventListener('click', (e) => {
  closeModal();
})




//Calendar

const monthYear = document.getElementById('month-year');
const calendarDate = document.getElementById('days');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();


function updateHeader() {
  monthYear.textContent = `${months[currentMonth]} ${currentYear}`;
}

function renderDays() {
  calendarDate.innerHTML = "";
  const firstDay = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendarDate.appendChild(blank);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;
    calendarDate.appendChild(day);
  }
}

const previousMonthBtn = document.getElementById('previous-month');
const nextMonthBtn = document.getElementById('next-month');

previousMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if(currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
})

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
    if(currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
})


function renderCalendar() {
renderDays();
updateHeader();
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  renderCalendar();
});

