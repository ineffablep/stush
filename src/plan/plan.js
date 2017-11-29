/**
 * Created by ravindra on 28/11/17.
 */
import _ from "lodash";
import PlanSchema, {validator as PlanSchemaValidator} from "./schema";
import generateError from "../handler/error";

export default class Plan {
  data = {};
  _stripe = {};

  constructor (stushInstance, data = {}) {
    this._stripe = stushInstance.stripe;
    this.set(data, true);
  }

  static async fetchAllPlans(stushInstance, args = {}) {
    try {
      const plans = await stushInstance.stripe.plans.list(args);
      let set = new Set();
      for (let plan of plans.data) {
        set.add(new Plan(stushInstance, plan));
      }
      return Promise.resolve(set);
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  set (data, allowImmutable = false) {
    this.data = data;
  }

  async save () {
    try {
      debug("Updating Plan with: ", this.data);
      let params = PlanSchemaValidator(this.data);
      const data = await this._stripe.plans.update(this.data.id, params.value);
      this.set(data, true);
      return Promise.resolve(this);
    }
    catch (err) {
      if (_.has(err, "raw") && err.raw.param === "plan" && err.raw.statusCode === 404) {
        debug("Creating Plan with: ", this.data);
        const data = await this._stripe.plans.create(this.data);
        this.set(data, true);
        return Promise.resolve(this);
      }
      return Promise.reject(err);
    }
  }

  toJson () {
    return JSON.parse(JSON.stringify(_.omit(this, ["_stripe"])));
  }

  async selfPopulate () {
    if (!this.data.id) {
      return Promise.reject(generateError("Please provide a valid customer ID before self populating"));
    }
    try {
      this.data = await this._stripe.plans.retrieve(this.data.id);
      return Promise.resolve(this);
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async delete () {
    try {
      this.data = await this._stripe.plans.del(this.data.id);
      return Promise.resolve(this);
    }
    catch (err) {
      return Promise.reject(err);
    }
  }
}