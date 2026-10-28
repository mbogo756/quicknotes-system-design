const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

let notes = [];

async function request(url, options={}){
    const response = await fetch(url, options);

    if(!response.ok){
        throw new Error(`Request failed(status ${response.status}).`);
    }

    const data = response.status === 204
        ? null
        :await response.json();

    return { data, status: response.status};
}


function renderNotes(){
    notesList.textContent = "";

    if (notes.length === 0) {
        const message = document.createElement("li");
        message.textContent = "No notes to display.";
        notesList.append(message);
        return;
    }

    for (const note of notes) {
        const item = document.createElement("li");

        const title = document.createElement("h2");
        title.textContent = note.title;

        const body = document.createElement("p");
        body.textContent = note.body;

        item.append(title, body);
        notesList.append(item);

    }
}

async function loadNotes() {
    loadButton.disabled =  true;
    statusMessage.className = "";
    statusMessage.textContent = "Loading notes...";

    try{
        const result = await request(`${API_URL}?_limit=10`);
        notes = result.data;
        renderNotes();

        statusMessage.className = "success";
        statusMessage.textContent = `Loaded ${notes.length} notes from the server.`;
    }

    catch(error){
        statusMessage.className = "error";
        statusMessage.textContent= "Could not load notes. Please check your connection and try again.";
    }
     finally{
        loadButton.disabled = false;
     }
}

loadButton.addEventListener("click", loadNotes);