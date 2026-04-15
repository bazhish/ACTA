const occurrenceService = require("../services/occurrenceService");
const { sendSuccess } = require("../utils/response");

const createOccurrence = async (req, res) => {
  const occurrence = await occurrenceService.createOccurrence({
    studentName: req.body.studentName,
    description: req.body.description,
    createdById: req.user.id,
  });

  sendSuccess(res, occurrence, 201);
};

const listOccurrences = async (_req, res) => {
  const occurrences = await occurrenceService.listOccurrences();
  sendSuccess(res, occurrences);
};

const getOccurrenceById = async (req, res) => {
  const occurrence = await occurrenceService.getOccurrenceById(req.params.id);
  sendSuccess(res, occurrence);
};

const updateOccurrenceStatus = async (req, res) => {
  const occurrence = await occurrenceService.updateOccurrenceStatus({
    occurrenceId: req.params.id,
    newStatus: req.body.status,
    performedById: req.user.id,
    performedByRole: req.user.role,
  });

  sendSuccess(res, occurrence);
};

const getOccurrenceHistory = async (req, res) => {
  const history = await occurrenceService.getOccurrenceHistory(req.params.id);
  sendSuccess(res, history);
};

module.exports = {
  createOccurrence,
  listOccurrences,
  getOccurrenceById,
  updateOccurrenceStatus,
  getOccurrenceHistory,
};
