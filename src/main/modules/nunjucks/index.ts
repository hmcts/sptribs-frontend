import path from 'path';

import config from 'config';
import express from 'express';
import nunjucks from 'nunjucks';

import { FormInput } from '../../app/form/Form';

export class Nunjucks {
  enableFor(app: express.Express): void {
    app.set('view engine', 'njk');
    const govUkFrontendPath = path.join(__dirname, '..', '..', '..', '..', 'node_modules', 'govuk-frontend', 'dist');
    const hmctsFrontendPath = path.join(__dirname, '..', '..', '..', '..', 'node_modules', '@hmcts', 'frontend');

    const authLessPath = path.join(__dirname, '..', '..', 'routes', 'authless', 'views');
    const GeneralViewPath = path.join(__dirname, '..', '..', 'views');

    const env = nunjucks.configure(
      [path.join(__dirname, '..', '..', 'steps'), govUkFrontendPath, GeneralViewPath, hmctsFrontendPath, authLessPath],
      {
        autoescape: true,
        watch: app.locals.developmentMode,
        express: app,
      }
    );

    env.addGlobal('getContent', function (prop): string {
      return typeof prop === 'function' ? prop(this.ctx) : prop;
    });

    env.addGlobal('getError', function (fieldName: string): { text?: string } | boolean {
      const { /*form,*/ sessionErrors, errors } = this.ctx;
      //const hasMoreThanTwoFields = new Form(form.fields).getFieldNames().size >= 2;
      if (!sessionErrors?.length /*|| !hasMoreThanTwoFields*/) {
        return false;
      }

      const fieldError = sessionErrors.find(error => error.propertyName === fieldName);
      if (!fieldError) {
        return false;
      }

      return { text: errors[fieldName][fieldError.errorType] };
    });

    env.addGlobal('formItems', function (items: FormInput[], userAnswer: string | Record<string, string>) {
      return items.map(i => ({
        id: i.id,
        label: this.env.globals.getContent.call(this, i.label),
        text: this.env.globals.getContent.call(this, i.label),
        name: i.name,
        classes: i.classes,
        disabled: i.disabled,
        value: i.value ?? userAnswer?.[i.name as string] ?? (userAnswer as string),
        attributes: i.attributes,
        checked: i.selected ?? userAnswer?.[i.name as string]?.includes(i.value as string) ?? i.value === userAnswer,
        hint: i.hint && {
          html: this.env.globals.getContent.call(this, i.hint),
        },
        divider: this.env.globals.getContent.call(this, i.divider),
        open: i.open,
        conditional: (() => {
          if (i.warning) {
            return {
              html: env.render(`${__dirname}/../../steps/common/error/warning.njk`, {
                message: this.env.globals.getContent.call(this, i.warning),
                warning: this.ctx.warning,
              }),
            };
          } else if (i.conditionalText) {
            return {
              html: this.env.globals.getContent.call(this, i.conditionalText),
            };
          } else if (i.subFields) {
            return {
              html: env.render(`${__dirname}/../../steps/common/form/fields.njk`, {
                ...this.ctx,
                form: { fields: i.subFields },
              }),
            };
          } else {
            return undefined;
          }
        })(),
      }));
    });

    const globals = {
      dynatrace: {
        dynatraceUrl: config.get('dynatrace.dynatraceUrl'),
      },
    };

    env.addGlobal('globals', globals);

    env.addGlobal('summaryDetailsHtml', function (subFields: FormInput) {
      return env.render(`${__dirname}/../../steps/common/form/fields.njk`, {
        ...this.ctx,
        form: { fields: subFields },
      });
    });

    env.addFilter('json', function (value, spaces) {
      if (value instanceof nunjucks.runtime.SafeString) {
        value = value.toString();
      }
      const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c');
      return new nunjucks.runtime.SafeString(jsonString);
    });

    env.addFilter('split', function (array, cursor) {
      return array.split(cursor);
    });

    app.use((req, res, next) => {
      res.locals.host = req.headers['x-forwarded-host'] || req.hostname;
      res.locals.pagePath = req.path;
      res.locals.serviceType = '';
      res.locals.currentUrl = req.originalUrl;
      next();
    });
  }
}
