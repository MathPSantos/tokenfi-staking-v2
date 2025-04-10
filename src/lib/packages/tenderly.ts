import { Tenderly } from "@tenderly/sdk";

export const TENDERLY_API_KEY = "Wbkbfb3ZPUiSNTXlvYhoY7Au-pBoSWr1";
export const TENDERLY_ACCOUNT_SLUG = "MathPSantos";
export const TENDERLY_PROJECT_SLUG = "project";
export const TENDERLY_API_SIMULATE_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`;
export const TENDERLY_SHARE_SIMULATION_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulations/:id/share`;

export const getTenderlySimulationUrl = (id: string) =>
  `https://dashboard.tenderly.co/public/${TENDERLY_ACCOUNT_SLUG}/${TENDERLY_PROJECT_SLUG}/simulator/${id}`;

export function getTernderlyInstance({ chainId }: { chainId: number }) {
  return new Tenderly({
    accountName: TENDERLY_ACCOUNT_SLUG,
    projectName: TENDERLY_PROJECT_SLUG,
    accessKey: TENDERLY_API_KEY,
    network: chainId,
  });
}
