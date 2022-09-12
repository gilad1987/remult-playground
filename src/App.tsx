import { useEffect, useState } from "react";
import { remult } from "remult";
import { Task } from "./shared/Task";
import { TasksController } from "./shared/TasksController";
import { makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";

class Tasks {
  repo = remult.repo(Task);
  readonly tasks = observable<Task>([]);

  constructor() {}

  fetch = () => {};
}

class TaskModel {
  constructor() {
    makeAutoObservable(this);
  }
}

const taskRepo = remult.repo(Task);

async function fetchTasks(hideCompleted: boolean) {
  return taskRepo.find({
    limit: 20,
    orderBy: { completed: "asc" },
    where: { completed: hideCompleted ? false : undefined },
  });
}

const App = observer(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    fetchTasks(hideCompleted).then((tasks) => {
      setTasks(tasks);
    });
  }, [hideCompleted]);

  const addTask = () => {
    setTasks([...tasks, new Task()]);
  };
  const setAll = async (completed: boolean) => {
    await TasksController.setAll(completed);
    setTasks(await fetchTasks(hideCompleted));
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={hideCompleted}
        onChange={(e) => setHideCompleted(e.target.checked)}
      />{" "}
      Hide Completed
      <main>
        {tasks.map((task) => {
          const handleChange = (values: Partial<Task>) => {
            task.update(values);
            // values.completed && (task.completed = values.completed);
            // values.title && (task.title = values.title);
          };

          const saveTask = async () => {
            try {
              await task.save();
            } catch (error: any) {
              alert(error.message);
            }
          };

          const deleteTask = async () => {
            await taskRepo.delete(task);
            setTasks(tasks.filter((t) => t !== task));
          };

          return (
            <div key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => handleChange({ completed: e.target.checked })}
              />
              <input
                value={task.title}
                onChange={(e) => handleChange({ title: e.target.value })}
              />
              <button onClick={saveTask}>Save</button>
              <button onClick={deleteTask}>Delete</button>
            </div>
          );
        })}
      </main>
      <button onClick={addTask}>Add Task</button>
      <div>
        <button onClick={() => setAll(true)}>Set all as completed</button>
        <button onClick={() => setAll(false)}>Set all as uncompleted</button>
      </div>
    </div>
  );
});

export default App;
