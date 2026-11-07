import { ContainerModule, interfaces } from "inversify";
import { AxiosInstance } from "axios";
import RestClient from "@/src/core/api/common/config/rest.client";
import { createSupabaseBrowserClient } from "@/src/core/api/supabase/client";
import { BrowserSupabaseClientFactory } from "@/src/core/api/supabase/client";

export const NetWorkDataModuleSymbols = {
  REST_CLIENT: Symbol("RestClient"),
  SUPABASE_BROWSER_CLIENT_FACTORY: Symbol("SupabaseBrowserClientFactory"),
};

const initializeNetworkModule = (bind: interfaces.Bind) => {
  bind<AxiosInstance>(NetWorkDataModuleSymbols.REST_CLIENT).toConstantValue(
    RestClient,
  );
  bind<BrowserSupabaseClientFactory>(
    NetWorkDataModuleSymbols.SUPABASE_BROWSER_CLIENT_FACTORY,
  ).toConstantValue(createSupabaseBrowserClient);
};

export const NetworkModule = new ContainerModule(initializeNetworkModule);
