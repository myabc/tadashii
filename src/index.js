import * as validators from './validators';

function extractFunctionAndArguments(modelValue, attribute, model, options) {
  const isCustom = typeof options[0] === "function";
  const func = isCustom ? options[0] : validators[options[0]];
  /*
   * [validatorFunction, argumentsToValidator, errorMessage]
   */
  const args = options.slice(1, -1);
  const validatorArguments = [
    modelValue,
    attribute,
    model,
    ...args,
  ];

  return [func, validatorArguments];
}

/*
 * Map over each validator and return error messages for those that fail.
 */
function validate(schema, model) {
  return Object
    .keys(schema)
    .reduce((result, attribute) => {
      const validations = schema[attribute];
      const modelValue = model[attribute];

      result[attribute] = validations
        .filter(options => {
          const [func, validatorArguments] =
            extractFunctionAndArguments(modelValue, attribute, model, options);

          return func(...validatorArguments) === false;
        })
        .map(options => {
          const errorMessage = options[options.length - 1];

          return typeof errorMessage === "function" ?
            errorMessage(modelValue) :
            errorMessage;
        });

        return result;
      },
      {}
    );
}

/*
 * Determine whether a model is valid according to its schema
 */
function isValid(schema, model) {
  return !Object
    .keys(schema)
    .find(attribute => {
      const validations = schema[attribute];
      const modelValue = model[attribute];

      return !!validations.find(options => {
        const [func, validatorArguments] =
          extractFunctionAndArguments(modelValue, attribute, model, options);

        return func(...validatorArguments) === false;
      });
    });
}


export default {validate, isValid};