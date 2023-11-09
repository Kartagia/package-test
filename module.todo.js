
/**
 * Module storing ToDoData emtries.
 */

/**
 * A valid compound identifier.
 * The compound identifier is formed by joinig the property path with dots, and tag id separated with :. Indexes are appended with _ separator at the end of the identifier.
 * 
 * F. ex. a_5:hover refers to the hover tag of the item of a at index 5. 
 * Thf Id a.id refers to the id-propery of a.
 * 
 * @typedef {string} Id 
 */
 
/**
 * @enum {string} TaskStatus
 * 
 */
export class TaskStatus {
  /**
   * The declared task has no progress.
   */
  static DECLARED = "declared";
  
  /**
   * Partial tasks has both completed and unfin7shed tasks.
   */
  static PARTIAL = "partial";
  
  /**
   * Done task is successfullt finished.
   */
  static DONE = "done";
  
  /**
   * A finished task has all steps
   * done.
   */
  static FINISHED = "finished";
  
  /**
   * The tasknis failed.
   */
  static FAILED = "failed";
}

 
/**
 * @template DATA
 * @typedef {Object} TaskEntry
 * @param {string} title The title of the task.
 * @param {string} [description] The description ofvthe task.
 * @param {Array<Task<DATA>>} [steps] The sub steps of the entry.
 * @param {Array<string>} [target] The target of the entry.
 * @param {TaskStatus|Array<TaskStatus>} [status] The status ofvthe task. If the task has sub tasks, the array of sub task statuses.
 * @param {DATA} [data] The data of the task.
 */
 
 /**
  * The data entry or the title.
  * 
  * @template DATA
  * @typedef {TaskEntry<DATA>|string} Task
  */
 
 /**
  * UI Data.
  * @template DATA
  * @typedef {Object} ToDoData
  * @property {Id} id The identifier of he data.
  * @property {Task<DATA>} entry The data entry.
  * @property {Array<Id>} [steps] The entry step identifiers.
  */

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
  const steps = (entry instanceof Object && entry.steps instanceof Array ? entry.steps : []).map((step, index) => {
    const stepUiEntry = createTodoEntry(step, index, `${id}.step`, storage);
    if ((step instanceof Object && step.id ? step.id :`${id}.step_${index}`) != stepUiEntry.id) console.error(`Id mismatch: id[] step ${index} with id step#${index}[${step instanceof Object && step.id? step.id : `${id}.step_${index}`}]`);
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