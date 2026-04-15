const { z } = require("zod");

const createOccurrenceSchema = z.object({
  studentName: z.string().trim().min(2, "studentName must contain at least 2 characters"),
  description: z.string().trim().min(5, "description must contain at least 5 characters"),
});

const statusUpdateSchema = z.object({
  status: z.enum(["REGISTRADA", "EM_ANALISE", "RESOLVIDA", "ENCERRADA"]),
});

module.exports = {
  createOccurrenceSchema,
  statusUpdateSchema,
};
