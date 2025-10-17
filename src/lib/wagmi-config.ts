import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    connectors: [
      baseAccount({
        appName: "Cypher - The Onchain Gauntlet",
        appLogoUrl: "https://onchaincypher.vercel.app/logo.png",
        // @judge: I find this the easiest way to add the subAccounts because it's more  straightforward than the other method. I'm using the WAGMI version of @base-org/account which has support for the subAccounts option. I also didn't use "latest" just in case breaking changes are introduced.
        subAccounts: {
          // @Note: WAGMI version of @base-org/account is overriden with "@base-org/account": "^2.4.0" version which has support for the required API for subAccounts to work with wagmi. I also didn't use "latest" just in case breaking changes are introduced.
          creation: "on-connect", // Auto-create sub account on connect
          defaultAccount: "sub", // Use sub account for transactions by default
        },
        paymasterUrls: {
          [baseSepolia.id]: process.env
            .NEXT_PUBLIC_PAYMASTER_SERVICE_URL as string,
        },
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseSepolia.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
