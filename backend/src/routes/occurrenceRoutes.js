const express = require("express");

const occurrenceController = require("../controllers/occurrenceController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { validateBody } = require("../middleware/validate");
const { createOccurrenceSchema, statusUpdateSchema } = require("../validation/occurrenceSchemas");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  authorizeRoles("PROFESSOR"),
  validateBody(createOccurrenceSchema),
  asyncHandler(occurrenceController.createOccurrence)
);
router.get("/", asyncHandler(occurrenceController.listOccurrences));
router.get("/:id", asyncHandler(occurrenceController.getOccurrenceById));
router.patch(
  "/:id/status",
  authorizeRoles("COORDINATOR", "DIRECTOR"),
  validateBody(statusUpdateSchema),
  asyncHandler(occurrenceController.updateOccurrenceStatus)
);
router.get("/:id/history", asyncHandler(occurrenceController.getOccurrenceHistory));

module.exports = router;
