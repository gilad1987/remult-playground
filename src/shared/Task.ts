import { Allow, Entity, Fields, remult, Validators } from "remult";
import { Roles } from "./Roles";
import { makeAutoObservable, reaction } from "mobx";

@Entity<Task>("tasks", {
  allowApiRead: Allow.authenticated,
  allowApiUpdate: Allow.authenticated,
  allowApiInsert: Roles.admin,
  allowApiDelete: Roles.admin,
})
export class Task {
  autoSave: boolean = false;

  @Fields.uuid()
  id!: string;

  @Fields.string({
    validate: Validators.required,
    allowApiUpdate: Roles.admin,
  })
  title = "";

  @Fields.boolean()
  completed = false;

  save = async () => {
    const repo = remult.repo(Task);
    return repo.save(this);
  };
  remove = async () => {
    const repo = remult.repo(Task);
    return await repo.delete(this);
  };

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.toJSON,
      (current: any, pre: any) => {
        if (this.autoSave) {
          this.save();
        }
      }
    );
  }

  update = (data: Partial<Task>, disableAutoSave: boolean = false) => {
    this.autoSave = true;

    if (disableAutoSave) {
      this.autoSave = false;
    }

    this.updateData(data, disableAutoSave, []);
  };

  updateData = (
    data: Partial<Task>,
    disableAutoSave: boolean = false,
    excludeKeys: (keyof Task)[] = []
  ) => {
    Object.keys(data).forEach((key: string) => {
      let modelKey = key;

      if (!excludeKeys.includes(key as keyof Task)) {
        //@ts-ignore;
        this[modelKey] = data[key];
      }
    });
  };

  get toJSON(): { [key: string]: any } {
    return JSON.parse(
      JSON.stringify({
        title: this.title,
      })
    );
  }
}
