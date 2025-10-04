import Joi from "joi";

export const filterSchema = Joi.object({
  weekStart: Joi.date().optional(),
});
