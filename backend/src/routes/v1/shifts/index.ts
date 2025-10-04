import { Server } from "@hapi/hapi";
import * as shiftController from "./shiftController";
import {
  createShiftDto,
  filterSchema,
  idDto,
  publishShiftWeekDto,
  updateShiftDto,
} from "../../../shared/dtos";

export default function (server: Server, basePath: string) {
  server.route({
    method: "GET",
    path: basePath,
    handler: shiftController.find,
    options: {
      description: "Get shifts for a week",
      notes: "Provide weekStart query to target a specific week (defaults to current week).",
      tags: ["api", "shift"],
      validate: {
        query: filterSchema,
      },
    },
  });

  server.route({
    method: "GET",
    path: basePath + "/{id}",
    handler: shiftController.findById,
    options: {
      description: "Get shift by id",
      notes: "Get shift by id",
      tags: ["api", "shift"],
      validate: {
        params: idDto,
      },
    },
  });

  server.route({
    method: "POST",
    path: basePath,
    handler: shiftController.create,
    options: {
      description: "Create shift",
      notes: "Create shift",
      tags: ["api", "shift"],
      validate: {
        payload: createShiftDto,
      },
    },
  });

  server.route({
    method: "PATCH",
    path: basePath + "/{id}",
    handler: shiftController.updateById,
    options: {
      description: "Update shift",
      notes: "Update shift",
      tags: ["api", "shift"],
      validate: {
        params: idDto,
        payload: updateShiftDto,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: basePath + "/{id}",
    handler: shiftController.deleteById,
    options: {
      description: "Delete shift",
      notes: "Delete shift",
      tags: ["api", "shift"],
      validate: {
        params: idDto,
      },
    },
  });

  server.route({
    method: "POST",
    path: basePath + "/publish",
    handler: shiftController.publishWeek,
    options: {
      description: "Publish all shifts in a week",
      notes: "Publishes the week specified by weekStart (Monday date).",
      tags: ["api", "shift"],
      validate: {
        payload: publishShiftWeekDto,
      },
    },
  });
}
