import { getEvents, createEvent } from "../utils/eventApi.js";

const form = document.getElementById("createEventForm");
const eventCardsContainer = document.getElementById("admin-event-cards-container");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value.trim();
  const totalSpots = parseInt(document.getElementById("total-spots").value, 10);
  const category = document.getElementById("category").value.trim();
  // const price = parseFloat(document.getElementById("price").value);
  // const image = document.getElementById("image").value.trim();
  // const slug = document.getElementById("slug").value.trim();

  try {
    await createEvent({ title, description, date, location, totalSpots, category});
    // await createEvent({ title, description, date, location, totalSpots, category, image, slug });
    form.reset();
    loadEvents();
  } catch (err) {
    alert(err.message || "Failed to create event");
  }
});


//test för events
let events = [];
const someEvents = [
  {title: "Spökvandring i Gamla Stan", description: "Spökvandring", date: "2026-04-16T00:00:00.000Z", location: "Stockholm", totalSpots: 16, bookedSpots: 8, category: "Guidade turer"},
  {title: "Celine Dion Live på Avicii Arena", description: "Konsert wihoo", date: "2026-04-18T00:00:00.000Z", location: "Stockholm", totalSpots: 20000, bookedSpots: 18000, category: "Livemusik"},
  {title: "Fiska med oss", description: "Dagsfiske i Göteborgs hamn", date: "2026-04-20T00:00:00.000Z", location: "Göteborg", totalSpots: 24, bookedSpots: 4, category: "Utomhusaktiviteter"},
  {title: "Hitta din inre kraft", description: "En wellness-resa med oss i skogen, häng med", date: "2026-04-22T00:00:00.000Z", location: "Skogen", totalSpots: 40, bookedSpots: 2, category: "Hälsa"},
  
];


async function loadEvents() {
  eventCardsContainer.innerHTML = "<p>Loading...<p>";
  try {
    // events = await getEvents();
      events = someEvents;
    if (events.length === 0) {
      eventCardsContainer.innerHTML = "<p>No events yet.</p>";
      return;
    }
    eventCardsContainer.innerHTML = events.map((p, index) =>
      `<div class="admin-event-card" data-index="${index}"><p>${p.title}</p><button class="event-details-btn">View</button></div>`
      )
      .join("");
  } catch (err){
    console.log(err);
    eventCardsContainer.innerHTML = "<p>Failed to load events.</p>";
  }
}

//modal pop-up för event-details
const eventModal = document.createElement('div');
eventModal.id = 'event-modal';

const eventModalBox = document.createElement('div');
eventModalBox.classList.add('modal-box');

function createModalField(label, value) {
  const p = document.createElement('p');
  p.textContent = `${label}: ${value}`;
  eventModalBox.appendChild(p);
  return p;
}

const eventTitle = createModalField('Title', '');
const eventDescription = createModalField('Description', '');
const eventDate = createModalField('Date', '');
const eventLocation = createModalField('Location', '');
const eventTotalSpots = createModalField('Total spots', '');
const eventBookedSpots = createModalField('Booked spots', '');
const eventCategory = createModalField('Category', '');
// const eventPrice = createModalField('', '');



const closeEventModalBtn = document.createElement('button');
closeEventModalBtn.textContent = "Close";
//och ha en save button för att spara ändringar man gjort

eventModalBox.appendChild(closeEventModalBtn);
eventModal.appendChild(eventModalBox);


function openModal() {
  eventModal.classList.add('show');
}

function closeModal() {
  eventModal.classList.remove('show');
}

document.body.appendChild(eventModal);

eventCardsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('event-details-btn')) {
    const card = e.target.closest('.admin-event-card');
    const index = card.dataset.index;
    const event = events[index];
    eventTitle.textContent = `Title: ${event.title}`;
    eventDescription.textContent = `Description: ${event.description}`;
    eventDate.textContent = `Date: ${new Date(event.date).toLocaleDateString()}`;
    eventLocation.textContent = `Location: ${event.location}`;
    eventTotalSpots.textContent = `Total spots: ${event.totalSpots}`;
    eventBookedSpots.textContent = `Booked spots: ${event.bookedSpots}`;
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

function findEventsByDay(day) {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return (eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth && eventDate.getDate() === day);
  })
      
}

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

    const hasEvent = findEventsByDay(i).length > 0;

    if (hasEvent) {
      day.classList.add('has-event');
    }

    if (i === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear()) {
    day.classList.add('current-date');
    }

    calendarDate.appendChild(day);
  }
  
}

const previousMonthBtn = document.getElementById('previous-month');
const nextMonthBtn = document.getElementById('next-month');

//funktion för ändring av månad för att undvika repetion i event listeners
function changeMonth(direction) {
  currentMonth += direction; //currentMonth = currentMonth + direction
  if(currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  if(currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

previousMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(+1));

const dayEventsPanel = document.createElement('div');
dayEventsPanel.id = 'day-events-panel';
document.querySelector('.event-calendar').appendChild(dayEventsPanel);

calendarDate.addEventListener('click', (e) => {
  const day = e.target.closest('#days div');
  if (!day) return;
  
  document.querySelectorAll('#days div').forEach(d =>
    d.classList.remove('selected')
  );
  day.classList.add('selected');

  const clickedDay = parseInt(day.textContent);
  const dayEvents = findEventsByDay(clickedDay);

  if (dayEvents.length > 0) {
    dayEventsPanel.innerHTML = dayEvents.map(event => 
    `<div class="day-event-item">
      <p>${new Date(event.date).toDateString()}</p>
      <p>Event: ${event.title}</p>
      <p>Location: ${event.location}</p>
    </div>`).join("");
    dayEventsPanel.classList.add('open');
    
  } else {
    dayEventsPanel.innerHTML = `<p>No events</p>`;
  }

  
})


function renderCalendar() {
  renderDays();
  updateHeader();
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadEvents();
  renderCalendar();
});




//Recent events - historik över "gamla" event