import * as fs from 'fs';

import { Case } from '../app/case/case';
import { AppRequest, AppSession } from '../app/controller/AppRequest';
import { TranslationFn } from '../app/controller/GetController';
import { Form, FormContent } from '../app/form/Form';

import { Step } from './constants';
import { edgecaseSequence } from './edge-case/edgecaseSequence';
import { APPLICATION_SUBMITTED, CHECK_YOUR_ANSWERS, COOKIES, EDGE_CASE_URL, SUBJECT_DETAILS } from './urls';

/**
 * Pre-gather each step's content file. We do this once on startup because `require` is very slow and should not be
 * performed on every request.
 */
const stepForms: Record<string, FormContent | undefined> = {};

[edgecaseSequence].forEach((sequence: Step[], i: number) => {
  const dir = __dirname + (i === 0 ? '/edge-case' : '');
  for (const step of sequence) {
    const stepContentFile = `${dir}${step.url}/content.ts`;
    if (fs.existsSync(stepContentFile)) {
      const content: { form?: FormContent } = require(stepContentFile);

      if (content.form) {
        stepForms[step.url] = content.form;
      }
    }
  }
});

/** Get the next step in a Check Your Answers flow, recursively. This is essentially the next incomplete step. */
const getNextCyaStep = (data: Case, session: AppSession, step: Step, sequence: Step[]): string => {
  // Never go past the Check Your Answers page.
  if (step.url === CHECK_YOUR_ANSWERS) {
    return CHECK_YOUR_ANSWERS;
  }

  const stepFormContent = stepForms[step.url];
  const formFields =
    typeof stepFormContent?.fields === 'function' ? stepFormContent.fields(data) : stepFormContent?.fields;
  const stepForm = formFields ? new Form(formFields) : undefined;

  // Check whether the given step is complete.
  const isStepComplete = step.isComplete
    ? step.isComplete(session)
    : !stepForm || stepForm.getErrors(data).length === 0;

  if (!isStepComplete) {
    // The given step not currently complete or valid, so that's the answer.
    return step.url;
  }

  // The given step is complete and valid, so check the next step in the sequence, recursively.
  const nextStepUrl = step.getNextStep(data);
  const nextStep = sequence.find(s => s.url === nextStepUrl);

  return nextStep ? getNextCyaStep(data, session, nextStep, sequence) : CHECK_YOUR_ANSWERS;
};

/**
 * Get the next step in a Check Your Answers flow.
 * <br>
 * Most of the time, all the next steps will already be complete, so this will return the Check Your Answers page.
 * However, if a user has changed an answer which either:
 * * makes another page no-longer complete, or
 * * makes a new page available which was previously skipped,
 * <br>
 * then we may need to take the user to an incomplete page.
 * <br>
 * For example, if a user changes their `/representation` answer from "No" to "Yes", then the
 * `/representation-qualified` page now needs to be filled in, so we need to take the user there next.
 */
export const getNextCyaStepUrl = (req: AppRequest, data: Case): string => {
  if ((req.body as Record<string, unknown>).saveAsDraft) {
    return SUBJECT_DETAILS;
  }
  const currentStep = edgecaseSequence.find(s => s.url === req.path) ?? edgecaseSequence[0];
  return getNextCyaStep(data, req.session, currentStep, edgecaseSequence);
};

export const getNextStepUrl = (req: AppRequest, data: Case): string => {
  if ((req.body as Record<string, unknown>).saveAsDraft) {
    return SUBJECT_DETAILS;
  }
  const { path, queryString } = getPathAndQueryString(req);
  const currentStep = edgecaseSequence.find(s => s.url === path);

  const url = currentStep ? currentStep.getNextStep(data) : SUBJECT_DETAILS;

  return `${url}${queryString}`;
};

/** Get whether a step could be part of a Check Your Answers flow. */
export const isCyaCapable = (path: string, req: AppRequest): boolean => {
  if (path === CHECK_YOUR_ANSWERS || path === APPLICATION_SUBMITTED || path === COOKIES) {
    return false;
  }

  const startingStep = edgecaseSequence.find(s => s.url === path);
  if (startingStep === undefined) {
    return false;
  }
  let currentStep = startingStep;

  // Progress through the sequence calling .getNextStep until we reach the Check Your Answers page.
  const visitedSteps: Set<string> = new Set();
  while (!visitedSteps.has(currentStep.url)) {
    if (currentStep.url === CHECK_YOUR_ANSWERS) {
      // Reached CYA page
      return true;
    }

    visitedSteps.add(currentStep.url);
    const nextStep = edgecaseSequence.find(s => s.url === currentStep.getNextStep(req.session.userCase));
    if (nextStep === undefined) {
      // Something went wrong, we reached a step that doesn't exist in the sequence
      return false;
    }
    currentStep = nextStep;
  }

  // Loop detected - this means the current page does not lead to the Check Your Answers page
  return false;
};

const getPathAndQueryString = (req: AppRequest): { path: string; queryString: string } => {
  const [path, searchParams] = req.originalUrl.split('?');
  const queryString = searchParams ? `?${searchParams}` : '';
  return { path, queryString };
};

const getStepFiles = (stepDir: string) => {
  const stepContentFile = `${stepDir}/content.ts`;
  const content = fs.existsSync(stepContentFile) ? require(stepContentFile) : {};
  const stepViewFile = `${stepDir}/template.njk`;
  const view = fs.existsSync(stepViewFile) ? stepViewFile : `${stepDir}/../../common/template.njk`;

  return { content, view };
};

export type StepWithContent = Step & {
  stepDir: string;
  generateContent: TranslationFn;
  form: FormContent;
  view: string;
};

const getStepsWithContent = (sequence: Step[], subDir = ''): StepWithContent[] => {
  const dir = __dirname;

  const results: StepWithContent[] = [];
  for (const step of sequence) {
    const stepDir = `${dir}${step.url.startsWith(subDir) ? step.url : `${subDir}${step.url}`}`;
    const { content, view } = getStepFiles(stepDir);
    results.push({ stepDir, ...step, ...content, view });
  }
  return results;
};

export const stepsWithContentEdgecase = getStepsWithContent(edgecaseSequence, EDGE_CASE_URL);

export const stepsWithContent = [...stepsWithContentEdgecase];
