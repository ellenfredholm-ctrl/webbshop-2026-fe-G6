import { getEvents, createEvent, updateEvent, deleteEvent, getBookings, deleteBooking } from "../utils/eventApi.js";

const form = document.getElementById("createEventForm");
const eventCardsContainer = document.getElementById("admin-event-cards-container");
let selectedCategory = '';
let currentEventDate = null;

function showMessageBox(message, onConfirm = null) {
  const overlay = document.createElement('div');
  overlay.classList.add('message-box-overlay');

  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');

  const msg = document.createElement('p');
  msg.textContent = message;
  messageBox.appendChild(msg);

  if (onConfirm) {
    const messageBoxBtns = document.createElement('div');
    messageBoxBtns.classList.add('message-box-btns');

    const confirmBtn = document.createElement('button');
    confirmBtn.classList.add('confirm-btn');
    confirmBtn.textContent = "Confirm";

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.textContent = "Cancel";

    confirmBtn.addEventListener('click', () => {
      onConfirm();
      overlay.remove();
    })

    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    })

    
    messageBox.appendChild(messageBoxBtns);
    messageBoxBtns.appendChild(confirmBtn);
    messageBoxBtns.appendChild(cancelBtn);
  } else {
    const okBtn = document.createElement('button');
    okBtn.classList.add('ok-btn');
    okBtn.textContent = "Ok";
    okBtn.addEventListener('click', () => overlay.remove());
    messageBox.appendChild(okBtn);
  }

  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);
}

function textFieldReadMore(fieldElement, text, maxLength = 100) {
  if (text.length <= maxLength) {
    fieldElement.textContent = text;
    return;
  }

  const short = text.substring(0, maxLength) + '...';
  let expanded = false;

  fieldElement.innerHTML = `<span class="field-text">${short}</span><button class="read-more-btn">Read more</button>`;
  fieldElement.querySelector('.read-more-btn').addEventListener('click', () => {
    if (expanded) {
      fieldElement.querySelector('.field-text').textContent = short;
      fieldElement.querySelector('.read-more-btn').textContent = 'Read more';
    } else {
      fieldElement.querySelector('.field-text').textContent = text;
      fieldElement.querySelector('.read-more-btn').textContent = 'Read less';
    }
    expanded = !expanded;
  })
}

//      -Create event-
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;
  const price = parseFloat(document.getElementById("price").value);
  const location = document.getElementById("location").value.trim();
  const totalSpots = parseInt(document.getElementById("total-spots").value, 10);
  const category = document.getElementById("category").value.trim();
  const image = document.getElementById("image").value.trim();

  try {
    await createEvent({ title, description, date, price, location, totalSpots, category, image});
    // await createEvent({ title, description, date, location, totalSpots, category, image, });
    form.reset();
    loadEvents();
  } catch (err) {
    showMessageBox(err.message || "Failed to create event");
  }
});


//     -Test for events (placeholder for backend)-
let events = [];
// const testEvents = [
//   {_id: "1", title: "Spökvandring i Gamla Stan", description: "Spökvandring", date: "2026-04-16T00:00:00.000Z", location: "Stockholm", totalSpots: 16, bookedSpots: 8, category: "Guidade turer"},
//   {_id: "2", title: "Celine Dion Live på Avicii Arena", description: "Konsert wihoo", date: "2026-04-18T00:00:00.000Z", location: "Stockholm", totalSpots: 20000, bookedSpots: 18000, category: "Livemusik"},
//   {_id: "3", title: "Fiska med oss", description: "Dagsfiske i Göteborgs hamn", date: "2026-04-20T00:00:00.000Z", location: "Göteborg", totalSpots: 24, bookedSpots: 4, category: "Utomhusaktiviteter"},
//   {_id: "4", title: "Hitta din inre kraft", description: "En wellness-resa med oss i skogen, häng med", date: "2026-04-22T00:00:00.000Z", location: "Skogen", totalSpots: 40, bookedSpots: 2, category: "Hälsa"},
  
// ];

//     -Loading/rendering events-

function renderEventCards(eventsToRender) {
      if (eventsToRender.length === 0) {
      eventCardsContainer.innerHTML = "<p>No events found</p>";
      return;
    }
    eventCardsContainer.innerHTML = eventsToRender.map((p) =>
      `<div class="admin-event-card" data-event-id="${p._id}"><p>${p.title}</p><button class="event-details-btn">View</button></div>`
      )
      .join("");
}

async function loadEvents() {
  eventCardsContainer.innerHTML = "<p>Loading...</p>";
  try {
    events = await getEvents();
    // events = testEvents;

    renderEventCards(events);

  } catch (err){
    console.log(err);
    eventCardsContainer.innerHTML = "<p>Failed to load events.</p>";
  }
}

//     -Modal pop-up for event-details & edit-
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

let currentEventId = null;

//     -Creating modal field-
function createModalField(label, value, onEdit, type = 'text') {
  const fieldWrapper = document.createElement('div');
  fieldWrapper.classList.add('modal-field');
  const fieldLabel = document.createElement('span');    
  fieldLabel.innerHTML = `<strong>${label}: </strong>`;
  const fieldValue = document.createElement('span');
  fieldValue.textContent = `${value}`;
  const editBtn = document.createElement('button');
  editBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;
  editBtn.classList.add('edit-field-btn');

  editBtn.addEventListener('click', () => {
    //For bookedspots
    if(onEdit) {
      onEdit();
    
    } else {
      //Date field
      if(type === 'date') {
        const input = document.createElement('input');
        input.type = 'date';
        input.value = new Date(currentEventDate).toISOString().split('T')[0];
        fieldValue.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => {
          fieldValue.textContent = new Date(input.value).toLocaleDateString();
          currentEventDate = new Date(input.value).toISOString();
          input.replaceWith(fieldValue);
        })
      } else {
        //Everything else
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
const eventDate = createModalField('Date', '', undefined, 'date');
const eventPrice = createModalField('Price', '');
const eventLocation = createModalField('Location', '');
const eventTotalSpots = createModalField('Total spots', '');

//     - Edit booked spots -
const eventBookedSpots = createModalField('Booked spots', '', async () => {
  
  const existing = document.querySelector('.bookings-panel');
  if (existing) {
    existing.remove();
  }

  const bookingsPanel = document.createElement('div');
  bookingsPanel.classList.add('bookings-panel');
  bookingsPanel.innerHTML = `<p>Loading bookings...</p>`;
  modalBoxRight.appendChild(bookingsPanel);

  try {
    const allBookings = await getBookings(currentEventId);

    if (allBookings.length === 0) {
      bookingsPanel.innerHTML = `<p>No bookings for this event.</p>`;
    } else {
      bookingsPanel.innerHTML = allBookings.map(b => 
        `<div class="booking-item">
          <p><strong>Name:</strong> ${b.name || 'Unknown'}</p>
          <p><strong>Email:</strong> ${b.email || 'Unknown'}</p>
          <p><strong>Quantity:</strong> ${b.quantity || 1}</p>
          <p><strong>Booked at:</strong> ${b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Unknown'}</p>
          <button class="remove-booking-btn" data-booking-id="${b._id}">Remove booking<span class="material-symbols-outlined">delete</span></button>
        </div>`).join("");
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
    bookingsPanel.innerHTML = `<p>Error loading bookings: ${error.message}</p>`;
  }
});

const eventCategory = createModalField('Category', '');


const closeEventModalBtn = document.createElement('button');
closeEventModalBtn.textContent = "Close";
closeEventModalBtn.classList.add('modal-close-btn');

const deleteEventBtn = document.createElement('button');
deleteEventBtn.innerHTML = `<p>Delete event</p><span class="material-symbols-outlined">delete</span>`;
deleteEventBtn.classList.add('delete-event-btn');

const saveEventEditBtn = document.createElement('button');
saveEventEditBtn.textContent = "Save";
saveEventEditBtn.classList.add('modal-save-btn');  //TODO: bara få upp save button om man ändrat nåt?

eventModalFooter.appendChild(closeEventModalBtn);
eventModalFooter.appendChild(deleteEventBtn);
eventModalFooter.appendChild(saveEventEditBtn);
eventModal.appendChild(eventModalBox);

function openModal() {
  eventModal.classList.add('show');
}

function closeModal() {
  eventModal.classList.remove('show');
  const existing = document.querySelector('.bookings-panel');
  if (existing) existing.remove();
}

document.body.appendChild(eventModal);

//     -Filter the event list-

function getCategories() {
  return [...new Set(events.map(event => event.category))];
}
function categoryFiltering() {
  const categoryFilter = document.querySelector('.filter-dropdown-options'); 
  const categories = getCategories();

  categories.forEach(cat => {
    const option = document.createElement('li');
    option.classList.add('dropdown-option');
    option.dataset.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  })

  document.querySelector('.filter-dropdown-selected').addEventListener('click', () => {
  document.querySelector('.filter-dropdown-options').classList.toggle('open');
  })

  categoryFilter.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-option')) {
      selectedCategory = e.target.dataset.value;
      document.querySelector('.filter-dropdown-selected').textContent = e.target.textContent;
      categoryFilter.classList.remove('open');
      filterEvents();
    }
  })
}


document.querySelector('.filter-dropdown-selected').addEventListener('blur', () => {
  setTimeout(() => {
    document.querySelector('.filter-dropdown-options').classList.remove('open');
  }, 100);
})


function filterEvents() {
  const category = selectedCategory;
  const searchInput = document.getElementById('search-input').value.toLowerCase();

  const filtered = events.filter(ev => {
    let matchesCategory = true;
    let matchesSearch = true;
    
    if (category) {
      matchesCategory = ev.category === category;
    }

    if(searchInput) {
      matchesSearch = ev.title.toLowerCase().includes(searchInput) || ev.location.toLowerCase().includes(searchInput) || ev.description.toLowerCase().includes(searchInput);
    }

    return matchesCategory && matchesSearch;
  })

  renderEventCards(filtered);
}


document.getElementById('search-input').addEventListener('input', filterEvents);


//     -Event details-button-
eventCardsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('event-details-btn')) {
    const card = e.target.closest('.admin-event-card');
    const eventId = card.dataset.eventId;
    const event = events.find(e => e._id === eventId);
    currentEventId = event._id;
    currentEventDate = event.date;
    eventTitle.textContent = event.title;
    textFieldReadMore(eventDescription, event.description);
    eventDate.textContent = new Date(event.date).toLocaleDateString();
    eventPrice.textContent = event.price;
    eventLocation.textContent = event.location;
    eventTotalSpots.textContent = event.totalSpots;
    eventBookedSpots.textContent = event.bookedSpots;
    eventCategory.textContent = event.category;
    
    openModal();
  }
})

closeEventModalBtn.addEventListener('click', (e) => {
  closeModal();
})

//     -Save event edits-
saveEventEditBtn.addEventListener('click', async () => {
  try {
    await updateEvent(currentEventId, {
      title: eventTitle.textContent,
      description: eventDescription.textContent,
      date: currentEventDate,
      price: parseFloat(eventPrice.textContent),
      location: eventLocation.textContent,
      totalSpots: parseInt(eventTotalSpots.textContent),
      category: eventCategory.textContent
    })
    showMessageBox('Event updated successfully!')
    closeModal();
    await loadEvents();
    renderCalendar();
    loadRecentEvents();
  } catch (err) {
    showMessageBox('Failed to update event details' + err.message)
  }
})

//     -Remove booking-
eventModal.addEventListener('click', async (e) => {
  if (e.target.classList.contains('remove-booking-btn')) {
    const bookingId = e.target.dataset.bookingId;
    showMessageBox('Are you sure you want to remove this booking?', async () => {
      try {
        await deleteBooking(bookingId);
        e.target.closest('.booking-item').remove();
        showMessageBox('Booking removed successfully');
      } catch (error) {
        console.error('Error removing booking:', error);
        showMessageBox('Failed to remove booking: ' + error.message);
      }
    })
  }
});

eventModal.addEventListener('click', (e) => {
  if (e.target === eventModal) closeModal();
})


//     -Delete event-
deleteEventBtn.addEventListener('click', async () => {
  showMessageBox('Are you sure you want to delete this event?', async () =>  {
    try {
      await deleteEvent(currentEventId);
      closeModal();
      await loadEvents();
      renderCalendar();
      loadRecentEvents();
    } catch (error) {
      showMessageBox('Failed to delete event: ' + error.message);
    }
  }) 
})



//     -Calendar-

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
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  //Prev month days showing
  for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.textContent = daysInPrevMonth - (firstDay - 1 - i);
      blank.classList.add('other-month');
      calendarDate.appendChild(blank);
      blank.addEventListener('click', () => changeMonth(-1));
    }

  //Current month
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

  //Next month days showing
  const totalCells = firstDay + daysInMonth;
  let remainingCells;
  if (totalCells % 7 === 0) {
    remainingCells = 0;
  } else {
    remainingCells = 7 - (totalCells % 7);
  }

  for (let i = 1; i <= remainingCells; i++) {
    const blank = document.createElement('div');
    blank.textContent = i;
    blank.classList.add('other-month');
    calendarDate.appendChild(blank);
    blank.addEventListener('click', () => changeMonth(+1));
  }

}

const previousMonthBtn = document.getElementById('previous-month');
const nextMonthBtn = document.getElementById('next-month');

function changeMonth(direction) {
  currentMonth += direction;
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
  if (day.classList.contains('other-month')) return;
  
  document.querySelectorAll('#days div').forEach(d =>
    d.classList.remove('selected')
  );
  day.classList.add('selected');

  const clickedDay = parseInt(day.textContent);
  const dayEvents = findEventsByDay(clickedDay);

  if (dayEvents.length > 0) {
    dayEventsPanel.innerHTML = dayEvents.map(event => 
    `<div class="day-event-item">
      <p><strong>${new Date(event.date).toDateString()}</strong></p>
      <p>${event.title}</p>
      <p>${event.location}</p>
    </div>`).join("");
    dayEventsPanel.classList.add('open');
    
  } else {
    dayEventsPanel.innerHTML = `<p>No events</p>`;
  }
})


//     -Recent events - event history-
const recentEventsContainer = document.getElementById('recent-events');
function loadRecentEvents() {
  const today = new Date();
  const todayStr = today.toDateString();
  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate < today && eventDate.toDateString() !== todayStr;
  })
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
  dayEventsPanel.innerHTML = '';
  dayEventsPanel.classList.remove('open');
}


document.querySelector('.site-header nav').appendChild(logOutBtn);

document.addEventListener("DOMContentLoaded", async () => {
  // const token = localStorage.getItem('token');
  // if (!token) {
  //   window.location.href = 'register.html';
  //   return;
  // }
  await loadEvents();
  renderCalendar();
  loadRecentEvents();
  categoryFiltering();
});






