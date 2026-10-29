const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");


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

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", (event) =>
            deleteNote(note.id, event.currentTarget)
    );

        item.append(deleteButton);

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

noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (title.length === 0) {
        statusMessage.className = "error";
        statusMessage.textContent = "Please enter a title.";
        return;
    }

    if (title.length > 100) {
        statusMessage.className = "error";
        statusMessage.textContent = "The title must be 100 characters or fewer.";
        return;
    }

    submitButton.disabled = true;
    statusMessage.className = "";
    statusMessage.textContent = "Creating note...";

    try {
        const result = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                body,
                userId: 1
            })
        });

        notes.unshift(result.data);
        renderNotes();

        statusMessage.className = "success";
        statusMessage.textContent =
            `Note created (status ${result.status}, id ${result.data.id}).`;

        noteForm.reset();
    } catch (error) {
        statusMessage.className = "error";
        statusMessage.textContent =
            "Could not create the note. Please try again.";
    } finally {
        submitButton.disabled = false;
    }
});

async function deleteNote(id, button) {
    button.disabled = true;
    statusMessage.className = "";
    statusMessage.textContent = "Deleting note...";

    try {
        await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        // JSONPlaceholder simulates DELETE; remove the note from this page locally.
        notes = notes.filter((note) => note.id !== id);
        renderNotes();

        statusMessage.className = "success";
        statusMessage.textContent = `Note ${id} deleted.`;
    } catch (error) {
        statusMessage.className = "error";
        statusMessage.textContent = "Could not delete the note. Please try again.";
    } finally {
        button.disabled = false;
    }
    
}

