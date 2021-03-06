import "./App.css";
import { useState, useEffect } from "react";
import Footer from "./Components/Footer";
import Search from "./Components/Search";
import Tasks from "./Components/Tasks";
import Header from "./Components/Header";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrash, faListAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "./Components/Loader";
library.add(faTrash, faListAlt);
const axios = require("axios");

const App = () => {
  const [tasksDB, setTasksDB] = useState([]); // [{name: "My first task", done: false}, {name: "My second task",done: true}]
  // false = checkbox not checked
  // true = checkbox checked
  // tasksDB is the copy of the Data Base where all the tasks are stored and not changed when a value is entered in the input field
  const [task, setTask] = useState("");
  const [tasksResult, setTasksResult] = useState([]); // taskResult is the array which change when a value is entered in the input field
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const [isLoading, setIsLoading] = useState(true);

  // Initialization : Load the data from the DB
  const fetchInitialData = async () => {
    try {
      const response = await axios.get(
        "https://todo-list-api-remi.herokuapp.com/"
      );
      setTasksResult(response.data);
      setTasksDB(response.data);
      setIsLoading(false);
    } catch (error) {
      return error.message;
    }
  };

  // Side effect : update DB
  const getTaskDB = async () => {
    try {
      const response = await axios.get(
        "https://todo-list-api-remi.herokuapp.com/"
      );
      setTasksDB(response.data);
    } catch (error) {
      return error.message;
    }
  };

  useEffect(() => {
    getTaskDB();
  }, [tasksResult]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Add a new task
  const handleAddTask = (e) => {
    const { value } = e.target;
    setTask(value);
  };

  // Strike out text when a checkbox is checked
  const handleChecked = async (index) => {
    const newTasks = [...tasksResult];
    newTasks[index].done = !newTasks[index].done;
    let sortedTasks = [];
    for (let i = 0; i < newTasks.length; i++) {
      if (newTasks[i].done) {
        sortedTasks.push(newTasks[i]);
      } else {
        sortedTasks.unshift(newTasks[i]);
      }
    }
    setTasksResult(sortedTasks);
    const data = { id: tasksResult[index]._id, done: newTasks[index].done };
    await updateTaskDB(data);
  };

  // Delete a task
  const handleDeleteTask = async (index) => {
    const data = { id: tasksResult[index]._id };
    const newTasks = tasksResult
      .slice(0, index)
      .concat(tasksResult.slice(index + 1));
    await deleteTaskDB(data);
    setTasksResult(newTasks);
  };

  // Search a task
  const handleSearch = async (e) => {
    const value = e.target.value;
    const newSearchTasks = tasksDB.filter((task) => {
      const regex = RegExp(value, "i");
      return regex.test(task.name);
    });
    setTasksResult(newSearchTasks);
  };

  // Display or not the search bar whether tasks have been entered
  const isTasksDBEmpty = tasksDB.length !== 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { task: task, done: false };
    const response = await createTaskDB(data);
    const newTasks = [...tasksResult];
    newTasks.push({ name: task, done: false, _id: response._id });
    setTask(""); // Reset input field "New task"
    setTasksResult(newTasks);
  };

  // Link to the back-end
  const createTaskDB = async (data) => {
    try {
      const response = await axios.post(
        "https://todo-list-api-remi.herokuapp.com/create",
        data
      );
      return response.data;
    } catch (error) {
      return error.message;
    }
  };

  const deleteTaskDB = async (data) => {
    try {
      const response = await axios.post(
        "https://todo-list-api-remi.herokuapp.com/delete",
        data
      );
      return response.data;
    } catch (error) {
      return error.message;
    }
  };

  const updateTaskDB = async (data) => {
    try {
      const response = await axios.post(
        "https://todo-list-api-remi.herokuapp.com/update",
        data
      );
      return response.data;
    } catch (error) {
      return error.message;
    }
  };

  // Activate or not dark mode
  const handleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Detect when the vertical scroll bar appears to fill the whole page when dark mode is activated
  const screenHeight = window.innerHeight;
  const totalHeight = document.body.scrollHeight;
  const isVerticalScrollHere = screenHeight < totalHeight;

  return (
    <div
      className={
        darkMode && !isVerticalScrollHere
          ? "body-dark first-div"
          : darkMode
          ? "body-dark"
          : undefined
      }
    >
      <Header handleDarkMode={handleDarkMode} darkMode={darkMode} />
      {isLoading ? (
        <Loader />
      ) : (
        <main className="container">
          <Search handleSearch={handleSearch} isTasksDBEmpty={isTasksDBEmpty} />
          <Tasks
            tasksResult={tasksResult}
            handleChecked={handleChecked}
            handleDeleteTask={handleDeleteTask}
            handleSubmit={handleSubmit}
            task={task}
            handleAddTask={handleAddTask}
            darkMode={darkMode}
          />
        </main>
      )}
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default App;
