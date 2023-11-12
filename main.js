import {validId, check, addToDo, deleteToDo, updateToDo, createEntryId, createTodoEntry, getToDo} from "./module.todo.js";

const entries = [
  {
    "title": "Päivitä CV",
    "target": ["Koulutus", "Mäkipää"],
    "description": "Muuta Mäkipään kokemus IT alan CVhen.",
    "steps": [
  "Muuta kuvaus perheyritykseksi",
  "Muuta kuvaus hallinnoksi myös siivoustyöllä"
      ],
    "status": []
  }
];

const fireBaseDb = "https://dune-rpg-assistant-default-rtdb.europe-west1.firebasedatabase.app/";
const localJson = new Request("http://localhost:8080/data/todo.json");

const getDataFirebase = () => {
  return fetch(fireBaseDb);
}
const getDataFetchJsom = () => {
  return fetch(localJson);
}
const getDataDummy = () => {
  return new Promise((handler) => {
    return handler(entries);
  });
}
/**
 * Map from entry id to the states.
 */
const todoEntries = new Map();

/**
 * Create a change handler for a ToDoElement.
 * @param {TodoEntry} entry - The listened entry.
 * @param {Storage} storage - The entry data storage.
 * @returns {EventListener} Event listener listen7ng change events.
 */
const createChangeHandler = (todoEntry, storage) => {
  const id = todoEntry.id;
  (e) => {
  console.group(`Event Handling[${e.target.id}] for TODO[${id}]`)
  const todoData = getToDo(id, storage) || {};
  console.table(todoData);
  const stepIds = todoData.steps;
  if (e.target.id === todoData.inputId) {
    // The main entry is clicked.

    console.group("Updating steps")
    // Set state of steps
    if (stepIds) {
      // We do have steps.
      let count = 0;
      const newChecked = e.tqrget.checked;
      stepIds.forEach(
        (stepId, index) => {
          const stepData = getToDo(stepId);
          console.debug(`Handling step[${stepId}]`)
          if (stepData && stepData.inputId) {
            console.table(stepData);
            const stepInput = document.getElementById(stepData.inputId);
            if (stepInput && (stepInput.checked != newChecked || stepInput.indeterminate)) {
              stepInput.indeterminate = false;
              stepInput.checked = newChecked;
              console.debug(`Step Input set ${newChecked}`)
            } else {
              console.debug('Step state is correct');
            }
          } else if (stepData) {
            console.error("Step without input");
          } else {
            console.error("Orphan entry");
          }
          console.groupEnd();
        }
      )
      console.debug(`Steps ${e.target.checked ? 'Checked':"Unchecked"}`);
    }
    console.groupEnd();
  } else if (stepIds.length > 0) {
    // One of the children is clicked.
    console.debug(`Handling change of ${e.target.id} for ${id}`)
    const stepInputIds = stepIds.map(getToDo).map((entry) => (entry && entry.inputId ? getToDo(entry.inputId, storage) : null));
    const count = stepIds.reduce((result, id) => {
      if (id == null || id.checked) {
        return result + 1;
      }
      return result;
    }, 0);
    input.checked = count === stepIds.length;
    input.indeterminate = count > 0 && count < stepIds.length;
  } else {
    console.debug(`Event effecting id ${event.target.id} not ${todoData.input} or in [${todoData.steps.map(getToDo).filter((value) => (value != null)).mqp((entry) => (entry.inputId)).join(",")}]`);
  }
  const idInput = document.getElementById(todoData.inpuId);
  console.debug(`Input[${(idInput ? idInput.id : "")}] of [${todoDqta.id}] is ${(idInput ? (idInput.checked?"checked":"unchecked").append(idInput.indeterminate ? "(indeterminate)":"") : "undefined")}`)
};
}

/**
 * Create entry UI element.
 * @param {TodoEntry} entry The entry whose element is created.
 * @param {string|number|undefined} index The index of the entry in parent structure.
 * @param {string} prefix - The identifier prefix.
 * @param {Storage} storage - The ToDoRntry storage.
 */
function entryElement(entry, index, prefix, storage) {
  const element = document.createElement("li");
  // Create the entry data.
  const newEntry = createTodoEntry(entry, index, prefix, storage);
  const id = newEntry.id;
  console.group(`Creating element for ToDo[${id}]:${entry}`);
  console.table(newEntry);
  addToDo(id, newEntry);
  element.setAttribute("id", id);
  
  // Create input for the entry
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = newEntry.inputId;
  input.name = id;
  element.appendChild(input);
  console.debug(`Added input#${newEntry.inputId}[${
    ["name", "value", "type"].map((field) => (`${field}="${input[field]}"`)).join(",")
    
  }]`);
  // Creste input label
  const label = document.createElement("label");
  label.setAttribute("for", newEntry.inputId);
  // Add change handler to the entrt
  const changeHandler = (e) => {
    // TODO: Replace this with call to createChangeHandler
    console.group(`Event Handling[${e.target.id}] for TODO[${id}]`);
    console.debug(`Event not handled`);
    console.groupEnd();
  }
  
  switch (typeof entry) {
    case "object":
      console.debug(`ToDoData[${entry.title}]:${entry.description}`);
      label.appendChild(document.createTextNode(entry.title));
      const content = document.createElement("ul");
      content.appendChild(label);
      if (entry.steps && entry.steps.length) {
        console.group(`Steps`);
        newEntry.steps.forEach(
          (step, index) => {
            const uiEntry = getToDo(step);
            console.debug(`Step#${index}[${step}]:`)
            console.table(uiEntry);
            const child = entryElement(
              uiEntry.entry, index, `${prefix}.step`, storage);
            content.appendChild(child);
          }
        );
        console.groupEnd();

        
      } else {
        // Removed invalid listener
        console.group("No steps")
        console.groupsend();
      }
      element.appendChild(label);
      element.appendChild(content);
      break;
    case "string":
      console.log(`String entry: ${entry}`);
      label.appendChild(document.createTextNode(entry));
    default:
      element.appendChild(label);
  }
  
  // Add the event listener.
  input.addEventListener("change", changeHandler);
  console.groupEnd();
  return element;
}

function composeToDos(entries, prefix="default") {
  const todoList = document.getElementById("todo");
  todoList.appendChild(document.createTextNode("Todo List"))

  entries.forEach(
    (entry, index) => {
      let article = (entryElement(entry, index, prefix, undefined));
      todoList.appendChild(article);
    }
  );
}

fetch(localJson).then(
  (resp) => {
    console.log("Loaded todos:", resp);
    if (resp.ok) {
      console.log("Resp: ", resp.body)
      return composeToDos(JSON.parse(resp.body), "fetch");
    } else {
      throw Error(`HttpError ${resp.status} ${resp.statusText}`);
    }
  }).catch((err) => {
  console.error("Could not load entries:", err.message);
});
fetch(fireBaseDb, {
  headers: {
    ["Content-Type"]: "text/json"
  }
}).then(
  (resp) => {
    console.log("Loaded todos:", resp);
    if (resp.ok) {
      console.log("Resp: ", resp.body)
      return composeToDos(JSON.parse(resp.body), "firebase");
    } else {
      throw Error(`HttpError ${resp.status} ${resp.statusText}`);
    }
  }).catch((err) => {
  console.error("Could not load entries:", err.message);
});

console.group("Default compose");
try {
  getDataDummy().then((entries) => {
    console.table(entries);
    composeToDos(entries, "dummy");
  });
  
  
} catch (error) {
  console.error("All work no play", error);
}
console.groupEnd();

async function updateInputList(target=null) {
  
  const outputter = (target instanceof Element ? (text) => {
    if (text instanceof Element) {
      target.appendChild(text);
    } else {
      target.appendChild(target.ownerDocument.createTextNode(text));
    }
  }: console.debug );
  const title = (target instanceof Element ? (text) => {
    const header = target.ownerDocument.createElement("h5");
    if (text instanceof Element) {
      header.appendChild(text);
    } else {
      header.appendChild(target.ownerDocument.createTextNode(text));
    }
    return header;
    } : (text) => (`***${text}***`));
  
  outputter(title("Inputs by tag name"));
  const nodes2 = document.getElementsByTagName("input");
     [...nodes2].forEach((elem) => {
    outputter(`Input "${elem.name}": ${elem.type} with id:${elem.id} value:${elem.value}`);
  
  });
}
setTimeout(updateInputList, 10000, document.getElementById("debugInput"));