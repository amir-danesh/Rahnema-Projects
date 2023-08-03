type Commands = {
    [key: string]: string;
  };

export const commands: Commands = {
    "create-task": "create-task [task name] [dd-mm-yyyy] [labels (separated by comma without spaces)] [todo|doing|done]",
    "show-all-tasks": "show-all-tasks",
    "edit-task": "edit-task [task number]",
    "add (while editing, for labels)":"add [color name]",
    "remove (while editing, for labels)":"remove [color name]",
    "changeto (while editing, for status)":"changeto [status name]",
    "delete-task": "delete-task 3",
    "show-detail": "show-detail 2",
    "filter-by": "filter-by [label name | status name | subject] [related value]"

}