const prisma = require("../config/prisma");
const HttpError = require("../utils/httpError");

const validTransitions = {
  REGISTRADA: {
    nextStatus: "EM_ANALISE",
    role: "COORDINATOR",
  },
  EM_ANALISE: {
    nextStatus: "RESOLVIDA",
    role: "COORDINATOR",
  },
  RESOLVIDA: {
    nextStatus: "ENCERRADA",
    role: "DIRECTOR",
  },
  ENCERRADA: null,
};

const createOccurrence = async ({ studentName, description, createdById }) => {
  return prisma.$transaction(async (tx) => {
    const occurrence = await tx.occurrence.create({
      data: {
        studentName,
        description,
        createdById,
        status: "REGISTRADA",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.historyLog.create({
      data: {
        occurrenceId: occurrence.id,
        action: "OCCURRENCE_CREATED",
        previousStatus: null,
        newStatus: "REGISTRADA",
        performedById: createdById,
      },
    });

    return occurrence;
  });
};

const listOccurrences = async () =>
  prisma.occurrence.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

const getOccurrenceById = async (id) => {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!occurrence) {
    throw new HttpError(404, "occurrence not found");
  }

  return occurrence;
};

const updateOccurrenceStatus = async ({ occurrenceId, newStatus, performedById, performedByRole }) => {
  return prisma.$transaction(async (tx) => {
    const occurrence = await tx.occurrence.findUnique({
      where: { id: occurrenceId },
    });

    if (!occurrence) {
      throw new HttpError(404, "occurrence not found");
    }

    if (occurrence.status === "ENCERRADA") {
      throw new HttpError(400, "occurrence is already closed");
    }

    const transition = validTransitions[occurrence.status];

    if (!transition || transition.nextStatus !== newStatus) {
      throw new HttpError(400, "invalid status transition");
    }

    if (transition.role !== performedByRole) {
      throw new HttpError(403, "user does not have permission for this transition");
    }

    const updatedOccurrence = await tx.occurrence.update({
      where: { id: occurrenceId },
      data: { status: newStatus },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.historyLog.create({
      data: {
        occurrenceId,
        action: "STATUS_UPDATED",
        previousStatus: occurrence.status,
        newStatus,
        performedById,
      },
    });

    console.log("[STATUS_CHANGE]", {
      occurrenceId,
      previousStatus: occurrence.status,
      newStatus,
      performedById,
      performedByRole,
    });

    return updatedOccurrence;
  });
};

const getOccurrenceHistory = async (occurrenceId) => {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    select: { id: true },
  });

  if (!occurrence) {
    throw new HttpError(404, "occurrence not found");
  }

  return prisma.historyLog.findMany({
    where: { occurrenceId },
    orderBy: { timestamp: "asc" },
    include: {
      performedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

module.exports = {
  createOccurrence,
  listOccurrences,
  getOccurrenceById,
  updateOccurrenceStatus,
  getOccurrenceHistory,
};
