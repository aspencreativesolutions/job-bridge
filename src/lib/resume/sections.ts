import { v4 as uuidv4 } from "uuid";

export function createEmptySection(title: string) {
  return { id: uuidv4(), title, content: "" };
}
