import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubmissionService } from "./submission.service";

const createSubmission = catchAsync(async (req, res) => {
  const result = await SubmissionService.createSubmission(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Submission created",
    data: result,
  });
});

const getMySubmissions = catchAsync(async (req, res) => {
  const result = await SubmissionService.getMySubmissions(req.user!.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Submissions retrieved",
    data: result,
  });
});

const resubmitSubmission = catchAsync(async (req, res) => {
  const result = await SubmissionService.resubmitSubmission(
    req.user!.id,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    message: "Submission resubmitted",
    data: result,
  });
});

export const SubmissionController = {
  createSubmission,
  getMySubmissions,
  resubmitSubmission,
};
