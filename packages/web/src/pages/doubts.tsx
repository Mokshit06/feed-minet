import { Flex } from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../hooks/auth';
import { useSocket } from '../hooks/socket';

export default function Chat() {
  const socket = useSocket();
  const user = useUser();

  useEffect(() => {
    // try connecting each time user changes
    const close = socket.connect();

    return () => {
      if (close) close();
    };
  }, [socket, user]);

  return (
    <>
      <Head>
        <title>Doubts | MINET</title>
      </Head>
      <Flex flex={1} width="full" overflow="hidden">
        Doubts Page
      </Flex>
    </>
  );
}
