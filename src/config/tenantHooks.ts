import { Sequelize } from "sequelize-typescript";
import { requestContext } from "../utils/requestContext";

export const applyTenantHooks = (sequelize: Sequelize) => {
  // sequelize.addHook("beforeValidate", (instance) => {
  //   const store = requestContext.getStore();
  //   if (!store?.clientId) return;


  //   if ("clientId" in instance) {
  //     instance.set("clientId", store.clientId);
  //   }

  //   if ("locationId" in instance) {
  //     if (!store.locationId) {
  //       throw new Error("LocationId is required but not found in request context");
  //     }
  //     instance.set("locationId", store.locationId);
  //   }
  // });

  // sequelize.addHook("beforeBulkCreate", (instances) => {
  //   const store = requestContext.getStore();
  //   if (!store?.clientId) return;

  //   for (const instance of instances) {
  //     if ("clientId" in instance) {
  //       instance.set("clientId", store.clientId);
  //     }

  //     if ("locationId" in instance) {
  //       if (!store.locationId) {
  //         throw new Error("LocationId is required but not found in request context");
  //       }
  //       instance.set("locationId", store.locationId);
  //     }
  //   }
  // });

  sequelize.addHook("beforeUpdate", (instance) => {
    const store = requestContext.getStore();
    if (!store?.clientId) return;

    if ("clientId" in instance) {
      if (instance.get("clientId") !== store.clientId) {
        throw new Error("Client scope violation");
      }
    }

    if ("locationId" in instance) {
      if (!store.locationId) {
        throw new Error("LocationId is required but not found in request context");
      }
      if (instance.get("locationId") !== store.locationId) {
        throw new Error("Location scope violation");
      }
    }
  });
};
