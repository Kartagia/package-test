/**
 * Module storing ToDoData entries using Firebase.
 */
import {TaskStatus} from "./module.todo.js";
import {initializeApp} from "firebase/app";
import {getDatabase, ref, set} from "firebase/database";

// Initi
const firebaseConfig = {
  databaseURL: "",
}
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Get the storage root.
 * @return {Ref}
 */
function getStorageRef() {
  return ref(db, "todos");
}

const listeners = new Map();
["value", "add_child", "remove_child"].forEach( (eventType) => {
  listeners[eventType] = new Map();
} );


/**
 * Test validity of a category name..
 * @param {boolean} key - The tested category name..
 * @returns {boolean} True, iff category name is valid.
 */
const validCategoryName = (key) => {
  return typeof key === "string" &&
  /^[a-z]\w+$/.test(key);
}

/**
 * Tes validity of the listener keys.
 */
const validListenerKey =(key) => {
  return typeof key === "string" || (typeof key === "number" && key >= 0);
}

/**
 * Check validity of the listener.
 * @param {any} category - The event category.
 * @param {any} listener - The tested listener.
 * @returns {boolean} Was the listener valid for the event type.
 */
const validDbListener = (category, listener) => {
  return validCategoryName(category) && listener instanceof Function;
}

/**
 * Getter, setter, qnd deleter of database listeners.
 * @param target - The listened target reference.
 * @param {string} category - The event category.
 * @param {Array<Function>|null} [setValue] The new value, if defined valur. A null value indicates the listeners are  removed.
 */0
function dbListeners(target, category, setValue = undefined) {
  if (setValue === null) {
    // Delete listener.
    if (listeners.get(category)?.has(target)) {
      listeners.get(category).delete(target);
    }
  } else if (setValue === undefined) {
    // Getter
    if (!listeners.has(category)) {
      listeners.set(category, new Map());
    }
    if (!listeners.get(category).has(target)) {
      listeners.get(category).set(target, new Map());
    }
    return listeners.get(category)?.get(target);
0       // Setter with valid valueä
    dbListeners(target, category);
    listeners.get(category).set(target, new Map(...(setValue.entries())));
  } else {
    throw TypeError("Invalid listeners");
  }
}

/**
 * Initializes the storage.
 */
function initStorage() {
  const target = getStorageRef();
  if (listeners.has(category)?.has(target)) {
    // Remove old listeners
  (Object.getOwnPropertyNames(listeners.get(category).get(target).values())).forEach(
    (listener) => {
      if (listener != null) {
        db.off(category, target, listener);
        }
    }
  )
    listeners.get(category).set(target, new Map())
  } else if (!listeners.has(category)) {
    listeners.set(category, new Map())
    listeners.get(category).set(target) = new Map();
  }
  [["value", (snapshot) => {
    if (snapshot != null) {
      toDoState.set(id, snapshot.val);
    }
  }], 
  ["add_child", (snapshot, previousSibling) => {
    if (snapshot != null) {
      const id;
      todoState.adf(id, snaphot.val());
    }
  }],
   ["remove_child", (snapshot, previousSibling) => {
     const id;
     if (snapshot != null) {
       todoState.delete(id);
     }
    }],
  ].forEach( ([category, listener]) => {
  if (category != null && category.length > 0 && listener != null) {
    
  db.on(category, target, listener);
  if (listeners[category] == null) {
    listeners[category] = [];
  }
  listeners[category].push(listener);
  }
})
}

/**
 * The default shared storage.
 * @type {Map<Id,ToDoData>}
 */
var todoState = new Map();

/**
 * Test validity of an identifier.
 * @param {any} id The tested identifier.
 * @returns {boolean} True, iff the id is valid html id for uientry.
 */
export function validId(id) {
  return typeof id === "string" && id.length > 0 && id.split().every((segment) => (/((?<name>[a-zA-Z_][\w-]*)(?:\:(?<field>[\w-]+))?)/.test(segment)));
}

/**
 * Test validity of an data entry of the todos.
 * @param {Object} todoEntry The tested data entry.
 * @returns {boolean} true, if and only if the entry is valid.
 */
export function validToDoEntry(todoEntry) {
  switch (typeof todoEntry) {
    case "string":
      return true;
    case "object":
      if (todoEntry instanceof Function) { return false }
      //TODO: Test validity of the POJO (the valid properties)
      return true;
    default:
    return false;
  }
}

/**
 * Check the id and throw exception on failure.
 * @param {Id} id The tested id.
 * @throws {TypeError} The type of the id was invalid.
 * @throws {RangeError} The value of the id was invalid.
 */
export const checkId = (id) => {
  if (!validId(id)) {
    if (typeof id !== "string") {
      throw TypeError("Identifier has be a string");
    } else if (id.length === 0) {
      throw RangeError("Identifier canot be an empty string");
    } else {
      throw RangeError("Invalid identifier");
    }
  }
};

/**
 * @param {ToDoData} entry The tested entryä
 * @throws {TypeError} The type of the entry was invalid.
 * @throws {RangeError} The value of the entry was invalid.
 */
export const checkUiEntry = (entry) => {
  if (entry instanceof Object) {
    const validators = new Map(
      [["id", validId], ["inputId", validId], ["entry", validToDoEntry], ["steps", (value) => (value instanceof Array && value.every(validId))]
        ]);
    [...(validators.entries())].forEach(([key, validator]) => {
      if (key in entry) {

      } else {
        throw RangeError(`Entry must have property ${key}`);
      }
    })
  } else {
    throw TypeError("Entry has be an object");
  }
};

/**
 * Check validity of the id and the entry of the UIEntry
 * @param id The tested id.
 * @param entry The tested ui entry.
 * @throws {TypeError} The type of the id or the entry was invalid.
 * @throws {RangeError} The value of the id or the entry was invalid.
 */
export function check(id, entry) {
  checkId(id);
  checkUiEntry(entry);
}

/**
 * Get storage or the default storage.
 * @param {ToDoStorage<DATA>|null|undefined} storage
 * @param {ToDoStorage<DATA>} [defaultStorage] The fall back storage.
 * @throws {TypeError} The storage or the default storage was invalid
 */
export function getStorage(storage=null, defaultStorage=todoState) {
  const result = (storage == null ? defaultStorage : storage);
  if (result instanceof Map) {
    return result;
  } else if (storage == null) {
    throw new Error("Missing storage");
  } else {
    throw new TypeError("Invalid storage type");
  }
}

/**
 * Get identifier.
 * 
 * @param {Id} id The sought identifier.
 * @param {Map<Id,ToDoData>} [storage]
 * @returns {ToDoData?} The Data associated with the id in storage, or un defined value.
 */
export function getToDo(id,storage=null) {
  const todos = getStorage(storage);
  return todos.get(id);
}

export function updateToDo(id, entry,storage=todoState) {
  if (storage.has(id)) {
    return getStorage(storage).set(id, entry);
  } else {
    return false;
  }
}

export function deleteToDo(id,storage=todoState) {
  if (getStorage(storage).has(id)) {
    getStorage(storage).delete(id);
    return true;
  } else {
    return false;
  }
}

export function addToDo(id, entry,storage=todoState) {
  check(id, entry);
  if (getStorage(storage).has(id)) {
    return false;
  } else {
    getStorage(storage).set(id, entry);
    return true;
  }
}

export function createEntryId(entry, index, prefix) {
  return (entry instanceof Object && entry.id ? entry.id : `${prefix}_${index}`);
}

export function createTodoEntry(entry, index, prefix = "", storage=null) {
  console.group(`CreateEntry(${entry}, ${index}, ${prefix})`)
  const id = createEntryId(entry, index, prefix);
  console.debug(`Entry[${entry instanceof Object? entry.id :""}] Id:${id}`);
  const steps = (entry instanceof Object && entry.steps instanceof Array ? entry.steps : []).map((step, index) => {
    const stepUiEntry = createTodoEntry(step, index, `${id}.step`, storage);
    if ((step instanceof Object && step.id ? step.id :`${id}.step_${index}`) != stepUiEntry.id) {
      // Refactor: Clarify failed id value body
      console.error(`Id mismatch: id[] step ${index} with id step#${index}[${step instanceof Object && step.id? step.id : `${id}.step_${index}`}]`);
    }
    addToDo(stepUiEntry.id, stepUiEntry, storage);
    return stepUiEntry.id;
  });
  console.groupEnd();
  return {
    id,
    inputId: id + ":input",
    entry,
    steps
  };
}
/**
 * Create a new data storGe.
 * @constructor
 */
export const ToDos = () => {
  return {
    /**
     * The entries of the storage.
     * @type {Map<Id,ToDoData>}
     */
    "_enties": new Map(),
    /**
     * @param {Id} id The identifier of the added value.
     * @param {ToDoData} entry The added data.
     * @returns {boolean} True, iff the entry was added.
     * @throws {TypeError} The type of id or entry was invalid.
     * @throws {RangeError} The value of id or entry was invalid.
     */
    add: (id, entry) => {
      return addToDo(id, entry, this._enties);
    },
    /**
     * Remove an identifier from collection. 
     *
     * @param {Id} id The removed id.
     * @returns {boolean} True, if and only if a data entry was removed from collection.
     * @throws {TypeError} The type of the id was invalid.
     * @throws {RangeError} The value of type was invalid.
     */
    delete: (id) => {
      return deleteToDo(id, this._enties);
    },
    update: (id, entry) => {
      return updateToDo(id, entry, this._enties);
    },
    validId,
    check,
    createEntryId,
    createTodoEntry: (entry, index, prefix=undefined) => {
      return createTodoEntry(entry, index, prefix, this._enties)
    }
  }
};
/**
 * The default export is the {@link #ToDos} class.
 * @type {ToDos}
 */
export default ToDos;