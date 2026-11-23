import * as fs from 'fs';

import { Case, CaseWithId } from '../app/case/case';
import { AppRequest, AppSession } from '../app/controller/AppRequest';
import { TranslationFn } from '../app/controller/GetController';
import { Form, FormContent } from '../app/form/Form';

import { Step } from './constants';
import { edgecaseSequence } from './edge-case/edgecaseSequence';
import { APPLICATION_SUBMITTED, CHECK_YOUR_ANSWERS, COOKIES, EDGE_CASE_URL, SUBJECT_DETAILS } from './urls';

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

const getNextCyaStep = (data: CaseWithId, session: AppSession, step: Step, sequence: Step[]): string => {
  // Never go past the Check Your Answers page.
  if (step.url === CHECK_YOUR_ANSWERS) {
    return step.url;
  }

  const stepFormContent = stepForms[step.url];
  const formFields =
    typeof stepFormContent?.fields === 'function' ? stepFormContent.fields(data) : stepFormContent?.fields;
  const stepForm = formFields ? new Form(formFields) : undefined;

  // Check whether the step is complete.
  const isStepComplete = step.isComplete
    ? step.isComplete(session)
    : !stepForm || stepForm.getErrors(data).length === 0;

  if (!isStepComplete) {
    // It is not currently complete or valid, so return to it
    return step.url;
  }

  // It is complete and valid, so check the next step in the sequence
  const nextStepUrl = step.getNextStep(data);
  const nextStep = sequence.find(s => s.url === nextStepUrl);

  return nextStep ? getNextCyaStep(data, session, nextStep, sequence) : CHECK_YOUR_ANSWERS;
};

/**
 * Get the next step in a Check Your Answers flow.
 * <br>
 * Most of the time, this will be the Check Your Answers page itself, but the latest update will have added a new step
 * to the sequence which will be incomplete. So, go to the next incomplete step.
 */
export const getNextCyaStepUrl = (req: AppRequest): string => {
  if ((req.body as Record<string, unknown>).saveAsDraft) {
    return SUBJECT_DETAILS;
  }
  const currentStep = edgecaseSequence.find(s => s.url === req.path) ?? edgecaseSequence[0];
  return getNextCyaStep(req.session.userCase, req.session, currentStep, edgecaseSequence);
};

export const getNextStepUrl = (req: AppRequest, data: Partial<Case>): string => {
  if ((req.body as Record<string, unknown>).saveAsDraft) {
    return SUBJECT_DETAILS;
  }
  const { path, queryString } = getPathAndQueryString(req);
  const currentStep = edgecaseSequence.find(s => s.url === path);

  const url = currentStep ? currentStep.getNextStep(data) : SUBJECT_DETAILS;

  return `${url}${queryString}`;
};

/** Get whether a step could be part of a Check Your Answers flow. */
export const isCyaCapable = (path: string, userCase: Partial<Case>): boolean => {
  if (path === CHECK_YOUR_ANSWERS || path === APPLICATION_SUBMITTED || path === COOKIES) {
    return false;
  }

  const startingStep = edgecaseSequence.find(s => s.url === path);
  if (startingStep === undefined) {
    return false;
  }
  let currentStep = startingStep;

  const visitedSteps: Set<string> = new Set();
  while (!visitedSteps.has(currentStep.url)) {
    if (currentStep.url === CHECK_YOUR_ANSWERS) {
      // Reached CYA page
      return true;
    }

    visitedSteps.add(currentStep.url);
    const nextStep = edgecaseSequence.find(s => s.url === currentStep.getNextStep(userCase));
    if (nextStep === undefined) {
      return false;
    }
    currentStep = nextStep;
  }

  // Loop detected
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
