import Joi from "joi";
import _ from "lodash";

const schema = Joi.object().keys({
  id: Joi.string(),
  object: Joi.string(),
  created: Joi.number().positive(),
  currency: Joi.string().allow(null),
  delinquent: Joi.boolean(),
  discount: Joi.object().allow(null),
  livemode: Joi.boolean(),
  sources: Joi.object(),
  subscriptions: Joi.object(),
  email: Joi.string().email().when("id", {is: !Joi.exist(), then: Joi.required()}),
  metadata: Joi.object(),
  source: Joi.string().token(),
  default_source: Joi.string().token().allow(null),
  account_balance: Joi.number().min(0),
  business_vat_id: Joi.string().allow(null),
  coupon: Joi.string().allow(null),
  description: Joi.string().allow(null),
  shipping: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string(),
    address: Joi.object().keys({
      line1: Joi.string().required(),
      city: Joi.string(),
      country: Joi.string(),
      line2: Joi.string(),
      postal_code: Joi.string(),
      state: Joi.string()
    }).required()
  }).allow(null)
});

export const cancelSubscriptionSchema = Joi.object().keys({
  subscription: Joi.string().token(),
  cancel: Joi.string().valid("now", "after_billing_cycle").default("now"),
  refund: Joi.number().positive(),
  refund_value_from: Joi.number().positive().when("refund", {is: Joi.exist(), then: Joi.strip()}),
});

export const validator = (input, allowImmutable = false) => {
  // process the input
  let output = Joi.validate(input, schema);
  if (output.error) {
    throw output.error;
  }
  if (!allowImmutable) {
    let mutableFields = [
      "metadata",
      "name",
      "statement_descriptor"
    ];
    _.set(output, "value", stripEmptyObjects(_.pick(input, mutableFields)));
  }
  return output;
};

export const cancelSubscriptionValidator = (input) => {
  let output = Joi.validate(input, cancelSubscriptionSchema, {stripUnknown: true});
  if (output.error) {
    throw output.error;
  }
  return output;
};

export default schema;