import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { inventoryApi } from "./api/inventoryApi";
import { rawMaterialsApi } from "./api/rawMaterialsApi";
import { salesApi } from "./api/salesApi";
import { expensesApi } from "./api/expensesApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [rawMaterialsApi.reducerPath]: rawMaterialsApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(rawMaterialsApi.middleware)
      .concat(salesApi.middleware)
      .concat(expensesApi.middleware),
});
