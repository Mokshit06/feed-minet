import { Flex } from '@chakra-ui/react';
import Head from 'next/head';

export default function Chat() {
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
