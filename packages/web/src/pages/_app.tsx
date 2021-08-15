import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { QueryFunction, QueryKey } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Layout from '../components/layout';
import api from '../lib/api';
import { SocketProvider } from '../contexts/socket-provider';

const defaultQueryFn: QueryFunction<unknown, QueryKey> = async ({
  queryKey,
}) => {
  try {
    const { data } = await api.get(queryKey[0] as string);
    return data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error);
  }
};

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryFn: defaultQueryFn,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ChakraProvider>
        <SocketProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SocketProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
