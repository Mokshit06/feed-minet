import { ChakraProvider } from '@chakra-ui/react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import type { QueryFunction, QueryKey } from 'react-query';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Layout from '../components/layout';
import { SocketProvider } from '../contexts/socket-provider';
import useLocation from '../hooks/use-location';
import api from '../lib/api';

const defaultQueryFn: QueryFunction<unknown, QueryKey> = async ({
  queryKey,
}) => {
  try {
    const { data } = await api.get(queryKey.join('/'));
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
  const location = useLocation();

  useEffect(() => {
    api
      .post('/auth/location', [location?.longitude, location?.latitude])
      .catch(() => {});
  }, [location]);

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
