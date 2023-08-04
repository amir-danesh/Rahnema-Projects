import * as readline from "readline";
import { commands } from "./constants";

const tasks: Card[] = [];
let activeCard: Card | null = null;

const labelTypes = ["yellow", "green", "blue", "red"]; // This will be changed to Unions
const statusTypes = ["todo", "doing", "done"]; //This will be changed to Unions

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Card {
  subject: string;
  deadLine: Date | null;
  labels: string[];
  status: string;
  startDate: Date | null;
  endDate: Date | null;

  constructor(
    subject: string,
    deadLine: Date | null = null,
    labels: string[] = [],
    status: string = "todo"
  ) {
    this.subject = subject;
    this.deadLine = deadLine;
    this.labels = labels[0] == "null" ? [] : labels;
    this.status = status;
    this.startDate = status.toLowerCase() === "doing" ? new Date() : null;
    this.endDate = status.toLowerCase() === "done" ? new Date() : null;
  }

  showSingleCardDetails = () => {
    const subjectText = `Subject:    ${this.subject}`;
    const deadLineText = `\nDeadline:   ${
      this.deadLine ? this.deadLine.toLocaleDateString() : "-"
    }`;
    const labelsText = `\nLabels:     ${
      this.labels.length > 0
        ? this.labels
            .reduce((prev, curr) => prev + curr + ", ", "")
            .slice(0, -2)
        : "-"
    }`;
    const statusText = `\nStatus:     ${this.status}`;
    const startDateText = `\nStart Date: ${
      this.startDate ? this.startDate.toLocaleDateString() : "-"
    }`;
    const endDateText = `\nEnd Date:   ${
      this.endDate ? this.endDate.toLocaleDateString() : "-"
    }`;

    const fullText =
      subjectText +
      deadLineText +
      labelsText +
      statusText +
      startDateText +
      endDateText +
      "\n";

    return fullText;
  };

  showSingleCardAbstract = (number: number | null = null) => {
    let fullText = number !== null ? `${number}-   ` : "";
    fullText += `${this.subject.slice(0, 10)} ${
      this.subject.length > 10 ? "...   " : ""
    }`;
    fullText += `${
      this.deadLine
        ? this.deadLine.toLocaleDateString() + "   "
        : "No-Deadline   "
    }`;
    fullText += `${this.status}`;

    return fullText;
  };

  addLabel = (labelName: string) => {
    if (!labelTypes.includes(labelName.toLowerCase())) {
      console.log(
        `!!!! Please provide a valid label, ${labelName} is not valid`
      );
      return;
    }
    if (this.labels.includes(labelName)) {
      console.log(`!!!! You already have ${labelName} label.`);
      return;
    }
    this.labels.push(labelName);
    console.log(`\n---- ${labelName} successfully added!`);
  };

  removeLabel = (labelName: string) => {
    if (!labelTypes.includes(labelName.toLowerCase())) {
      console.log(
        `\n!!!! Please provide a valid label, ${labelName} is not valid.`
      );
      return;
    }
    if (!this.labels.includes(labelName)) {
      console.log(
        `\n!!!! You don't have ${labelName} label. It cannot be deleted.`
      );
      return;
    }
    this.labels = this.labels.filter(
      (label) => label !== labelName.toLowerCase()
    );
    console.log(`\n---- ${labelName} successfully removed!`);
  };

  changeStatus = (statusName: string) => {
    if (!statusTypes.includes(statusName.toLowerCase())) {
      console.log(
        `\n!!!! Please provide a valid status, ${statusName} is not valid.`
      );
      return;
    }
    if (this.status === statusName.toLowerCase()) {
      console.log(`\n!!!! This task already has ${statusName} label`);
      return;
    }
    this.status = statusName.toLowerCase();

    this.startDate = statusName.toLowerCase() === "doing" ? new Date() : null;
    this.endDate = statusName.toLowerCase() === "done" ? new Date() : null;

    console.log(`\n---- Status successfully changed to ${statusName}!`);
  };
}

const convertToDateObject = (dateString: string) => {
  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const dateObject = new Date(year, month, day);

  if (isNaN(dateObject.getTime())) {
    return null;
  }

  return dateObject;
};

const divideStringToArray = (stringCommand: string, divider: string = " ") => {
  return stringCommand.split(" ");
};

const createTask = (commandArray: string[]) => {
  if (commandArray.length <= 1) {
    console.log("\n!!!! create-task needs at least 1 parameter.");
    return;
  }

  const subject: string = commandArray[1];
  const deadLine: Date | null =
    commandArray[2] && commandArray[2] !== "null"
      ? convertToDateObject(commandArray[2])
      : null;
  const labels: string[] = commandArray[3]
    ? divideStringToArray(commandArray[3], ",")
    : [];
  const status: string = commandArray[4] ? commandArray[4] : "todo";

  tasks.push(new Card(subject, deadLine, labels, status));
  console.log("\n---- Task added.");
};

const editTaskGeneral = async (taskNumberStr: string) => {
  if (isNaN(Number(taskNumberStr))) {
    console.log("\n!!!! Provide a valid number");
    return;
  }
  const taskNumber: number = Number(taskNumberStr) - 1;
  if (taskNumber > tasks.length - 1 || taskNumber < 0) {
    console.log("\n!!!! The provided number exceeds the number of tasks.");
    return;
  }
  activeCard = tasks[taskNumber];
  const text = `\n--- You are now editing task ${activeCard.subject}.\n
                Details:
                ${activeCard.showSingleCardDetails()}`.replace(/^ +/gm, "");

  console.log(text);
  await handleEditFields();
  return;
};

const handleEditFields = async () => {
  while (true) {
    console.log(
      "\nWhich one do you want to edit? 'labels' or 'status'.Type 'exit' to go to main page."
    );

    const field = await promptUser("\nYour command: ");
    if (field == "exit") {
      console.log("\n---- EXIT EDITING");
      break;
    }

    switch (field) {
      case "labels":
        await handleEditLabel();
        break;

      case "status":
        await handleEditStatus();
        break;

      default:
        console.log("\n!!!! Enter from options");
        break;
    }
  }
  return;
};

const handleEditLabel = async () => {
  while (true) {
    console.log(
      "\nYou can use 'add [color]' or remove [color] to customize lables.  type 'exit' to exit editing."
    );

    const command = await promptUser("\nYour command: ");
    const commandArray = divideStringToArray(command);

    if (commandArray[0] == "exit") {
      console.log("\n---- EXIT EDITING LABEL");
      break;
    }

    switch (commandArray[0]) {
      case "add":
        activeCard?.addLabel(commandArray[1]);
        break;

      case "remove":
        activeCard?.removeLabel(commandArray[1]);
        break;

      default:
        console.log(`\n!!!! Invalid input. ${commandArray[1]} is not valid`);
        break;
    }
  }
};

const handleEditStatus = async () => {
  while (true) {
    console.log(
      "\nYou can use commands like 'changeto todo' to customize lables.  type 'exit' to exit editing."
    );

    const command = await promptUser("\nEnter your command: ");
    const commandArray = divideStringToArray(command);

    if (commandArray[0] == "exit") {
      console.log("\n---- EXIT EDITING STATUS");
      break;
    }

    switch (commandArray[0]) {
      case "changeto":
        activeCard?.changeStatus(commandArray[1]);
        break;

      default:
        console.log(`\n!!!! Invalid input. ${commandArray[1]} is not valid`);
        break;
    }
  }
};

const showCommandsBeautify = () => {
  return Object.keys(commands).reduce(
    (prev, curr, index) =>
      prev +
      `\n${index + 1}-  ${curr}\n  Ex: ${commands[curr]}\n`.replace(
        /^ +/gm,
        ""
      ),
    ""
  );
};

const showAllTasks = () => {
  tasks.map((x, i: number) =>
    console.log("\n", x.showSingleCardAbstract(i + 1))
  );
};

const deleteTask = (taskNumberStr: string) => {
  if (isNaN(Number(taskNumberStr))) {
    console.log("\n!!!! Provide a valid number");
    return;
  }
  const taskNumber: number = Number(taskNumberStr) - 1;
  if (taskNumber > tasks.length - 1 || taskNumber < 0) {
    console.log("\n!!!! The provided number exceeds the number of tasks.");
    return;
  }
  tasks.splice(taskNumber, 1);
  console.log("\n---- Task deleted");
};

const showDetail = (taskNumberStr: string) => {
  if (isNaN(Number(taskNumberStr))) {
    console.log("\n!!!! Provide a valid number");
    return;
  }
  const taskNumber: number = Number(taskNumberStr) - 1;
  if (taskNumber > tasks.length - 1 || taskNumber < 0) {
    console.log("\n!!!! The provided number exceeds the number of tasks.");
    return;
  }

  console.log(tasks[taskNumber].showSingleCardDetails());
};

const filterByStatus = (filterStr: string) => {
  if (!statusTypes.includes(filterStr.toLowerCase())) {
    console.log("\n!!!! Provide a valid label");
    return;
  }
  const filteredTasks = tasks.filter((task) => task.status === filterStr);

  filteredTasks.length === 0
    ? console.log("No task matched your filter")
    : filteredTasks.map((task) => console.log(task.showSingleCardDetails()));
};

const filterByLabel = (filterStr: string) => {
  if (!labelTypes.includes(filterStr.toLowerCase())) {
    console.log("\n!!!! Provide a valid label");
    return;
  }
  const filteredTasks = tasks.filter((task) => task.labels.includes(filterStr));

  filteredTasks.length === 0
    ? console.log("No task matched your filter")
    : filteredTasks.map((task) => console.log(task.showSingleCardDetails()));
};

const filterBySubject = (filterStr: string) => {
  const filteredTasks = tasks.filter((task) =>
    task.subject.includes(filterStr)
  );

  filteredTasks.length === 0
    ? console.log("No task matched your filter")
    : filteredTasks.map((task) => console.log(task.showSingleCardDetails()));
};

const handleFilterBy = (filterType: string, filterStr: string) => {
  switch (filterType) {
    case "status":
      filterByStatus(filterStr);
      break;

    case "label":
      filterByLabel(filterStr);
      break;

    case "subject":
      filterBySubject(filterStr);
      break;

    default:
      console.log(`\n!!!! Invalid filter type.${filterType} is not valid`);
      break;
  }
};

const promptUser = (message: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(message, (name) => {
      resolve(name.trim());
    });
  });
};

const main = async () => {
  const text = `\nYou can use below commands to interact with the application:
                   ${showCommandsBeautify()}`;
  console.log(text);

  while (true) {
    const command: string = await promptUser("Enter Your Command : ");
    const commandArray: string[] = divideStringToArray(command);

    switch (commandArray[0]) {
      case "create-task":
        createTask(commandArray);
        break;

      case "show-all-tasks":
        showAllTasks();
        break;

      case "edit-task":
        await editTaskGeneral(commandArray[1]);
        break;

      case "delete-task":
        deleteTask(commandArray[1]);
        break;

      case "show-detail":
        showDetail(commandArray[1]);
        break;

      case "filter-by":
        handleFilterBy(commandArray[1], commandArray[2]);
        break;

      default:
        console.log("\n!!!! Your command is not right. Try again.");
    }
  }
};

main();

// TEST DATA
const a = new Card(
  "first card",
  convertToDateObject("10-07-1999"),
  ["yellow", "red", "green"],
  "doing"
);
const b = new Card(
  "taskName1",
  convertToDateObject("null"),
  ["Yellow", "Red", "Green"],
  "doing"
);
const c = new Card(
  "taskName2",
  convertToDateObject("01-01-2020"),
  ["Yellow", "Blue"],
  "todo"
);
const d = new Card(
  "taskName3",
  convertToDateObject("null"),
  ["Yellow"],
  "done"
);
const e = new Card("taskName4", convertToDateObject("10-12-2019"), [], "null");
tasks.push(a);
tasks.push(b);
tasks.push(c);
tasks.push(d);
tasks.push(e);
