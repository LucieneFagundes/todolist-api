import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const searchObject = search
        ? {
            title: search,
            description: search,
          }
        : null;

      console.log(searchObject);

      const tasks = database.select(`tasks`, searchObject);
      return res.writeHead(200).end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "title is required" }));
      }
      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "description is required" }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      database.insert(`tasks`, task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const data = database.selectOne(`tasks`, id);
      if (!data) {
        return res.writeHead(404).end();
      }

      database.delete(`tasks`, id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const data = database.selectOne(`tasks`, id);
      if (!data) {
        return res.writeHead(404).end();
      }

      if (!title) {
        title = data.title;
      }

      if (!description) {
        description = data.description;
      }

      database.update(`tasks`, id, {
        title,
        description,
        completed_at: data.completed_at,
        created_at: data.created_at,
        updated_at: Date.now(),
      });

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const data = database.selectOne(`tasks`, id);

      if (!data) {
        return res.writeHead(404).end();
      }

      let completed;

      if (!data.completed_at) {
        completed = Date.now();
      } else {
        completed = null;
      }

      database.update(`tasks`, id, {
        title: data.title,
        description: data.description,
        completed_at: completed,
        created_at: data.created_at,
        updated_at: Date.now(),
      });

      return res.writeHead(204).end();
    },
  },
];
