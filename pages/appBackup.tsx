import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {arbitrum,polygon,polygonMumbai, sepolia, localhost, baseGoerli} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { baseMainnet } from './baseMainnet'; // Import the baseMainnet chain object

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    polygon,sepolia,baseGoerli,baseMainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [localhost] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'lotto',
  projectId: '344e3a85b8be6680d32e6277a07df8ef',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
