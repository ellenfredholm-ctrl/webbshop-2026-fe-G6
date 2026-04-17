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
  const price = parseFloat(document.getElementById("price").value);
  // const image = document.getElementById("image").value.trim();

  try {
    await createEvent({ title, description, date, location, totalSpots, category});
    // await createEvent({ title, description, date, location, totalSpots, category, image, });
    form.reset();
    loadEvents();
  } catch (err) {
    alert(err.message || "Failed to create event");
  }
});


//test för events
let events = [];
// const testEvents = [
//   {_id: "1", title: "Spökvandring i Gamla Stan", description: "Spökvandring", date: "2026-04-16T00:00:00.000Z", location: "Stockholm", totalSpots: 16, bookedSpots: 8, category: "Guidade turer"},
//   {_id: "2", title: "Celine Dion Live på Avicii Arena", description: "Konsert wihoo", date: "2026-04-18T00:00:00.000Z", location: "Stockholm", totalSpots: 20000, bookedSpots: 18000, category: "Livemusik"},
//   {_id: "3", title: "Fiska med oss", description: "Dagsfiske i Göteborgs hamn", date: "2026-04-20T00:00:00.000Z", location: "Göteborg", totalSpots: 24, bookedSpots: 4, category: "Utomhusaktiviteter"},
//   {_id: "4", title: "Hitta din inre kraft", description: "En wellness-resa med oss i skogen, häng med", date: "2026-04-22T00:00:00.000Z", location: "Skogen", totalSpots: 40, bookedSpots: 2, category: "Hälsa"},
  
// ];


async function loadEvents() {
  eventCardsContainer.innerHTML = "<p>Loading...</p>";
  try {
    events = await getEvents();
      // events = testEvents;
    if (events.length === 0) {
      eventCardsContainer.innerHTML = "<p>No events yet.</p>";
      return;
    }
    eventCardsContainer.innerHTML = events.map((p) =>
      `<div class="admin-event-card" data-event-id="${p._id}"><p>${p.title}</p><button class="event-details-btn">View</button></div>`
      )
      .join("");
  } catch (err){
    console.log(err);
    eventCardsContainer.innerHTML = "<p>Failed to load events.</p>";
  }
}

//modal pop-up för event-details och edit
const eventModal = document.createElement('div');
eventModal.id = 'event-modal';

const eventModalBox = document.createElement('div');
eventModalBox.classList.add('modal-box');

const eventModalContent = document.createElement('div');
eventModalContent.classList.add('modal-content');

const eventModalFooter = document.createElement('div');
eventModalFooter.classList.add('modal-footer');

const modalBoxLeft = document.createElement('div');
modalBoxLeft.classList.add('left-modal');

const modalBoxRight = document.createElement('div');
modalBoxRight.classList.add('right-modal');

eventModalBox.appendChild(eventModalContent);
eventModalBox.appendChild(eventModalFooter);
eventModalContent.appendChild(modalBoxLeft);
eventModalContent.appendChild(modalBoxRight);


function createModalField(label, value, onEdit) {
  const fieldWrapper = document.createElement('div');
  fieldWrapper.classList.add('modal-field');
  const fieldLabel = document.createElement('span');    
  fieldLabel.textContent = `${label}: `;
  const fieldValue = document.createElement('span');
  fieldValue.textContent = `${value}`;
  const editBtn = document.createElement('button');
  editBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;
  editBtn.classList.add('edit-field-btn');

  editBtn.addEventListener('click', () => {
    //för bookedspots
    if(onEdit) {
      onEdit();
    } else {
      //för alla andra
      const input = document.createElement('textarea');
      input.value = fieldValue.textContent;
      input.rows = 1;

      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
      })

      fieldValue.replaceWith(input);
      input.focus();

      input.addEventListener('blur', () => {
        fieldValue.textContent = input.value;
        input.replaceWith(fieldValue);
      })


    }

  })

  fieldWrapper.appendChild(fieldLabel);
  fieldWrapper.appendChild(fieldValue);
  fieldWrapper.appendChild(editBtn);
  modalBoxLeft.appendChild(fieldWrapper);
  return fieldValue;
}

const eventTitle = createModalField('Title', '');
const eventDescription = createModalField('Description', '');
const eventDate = createModalField('Date', '');
const eventLocation = createModalField('Location', '');
const eventTotalSpots = createModalField('Total spots', '');
const eventBookedSpots = createModalField('Booked spots', '', () => {
  
  const existing = document.querySelector('.bookings-panel');
  if (existing) {
    return;
  }

  const bookingsPanel = document.createElement('div');
  bookingsPanel.classList.add('bookings-panel');
  bookingsPanel.innerHTML = `<p>Här är alla bokningar osv</p>`;
  modalBoxRight.appendChild(bookingsPanel);
});
const eventCategory = createModalField('Category', '');
const eventPrice = createModalField('Price', '');



const closeEventModalBtn = document.createElement('button');
closeEventModalBtn.textContent = "Close";
closeEventModalBtn.classList.add('modal-close-btn');

const saveEventEditBtn = document.createElement('button');
saveEventEditBtn.textContent = "Save";
saveEventEditBtn.classList.add('modal-save-btn');  //TODO: bara få upp save button om man ändrat nåt?

eventModalFooter.appendChild(closeEventModalBtn);
eventModalFooter.appendChild(saveEventEditBtn);
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
    const eventId = card.dataset.eventId;
    const event = events.find(e => e._id === eventId);
    eventTitle.textContent = event.title;
    eventDescription.textContent = event.description;
    eventDate.textContent = new Date(event.date).toLocaleDateString();
    eventLocation.textContent = event.location;
    eventTotalSpots.textContent = event.totalSpots;
    eventBookedSpots.textContent = event.bookedSpots;
    eventCategory.textContent = event.category;
    eventPrice.textContent = event.price;
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


//Recent events - historik över "gamla" event
const recentEventsContainer = document.getElementById('recent-events');
function loadRecentEvents() {
  const today = new Date();
  const pastEvents = events.filter(event => new Date(event.date) < today);
  if(pastEvents.length === 0) {
    recentEventsContainer.innerHTML = "<p>No historic events to show</p>";
    return;
  }

    recentEventsContainer.innerHTML = pastEvents.map(event => 
    `<div class="recent-event-item">
      <p>Event: ${event.title}</p>
      <p>Happened: ${new Date(event.date).toDateString()} in ${event.location}</p>
    </div>`).join("");
}





function renderCalendar() {
  renderDays();
  updateHeader();
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadEvents();
  renderCalendar();
  loadRecentEvents();
});






