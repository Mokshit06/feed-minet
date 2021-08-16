import { Box, Button, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Head from 'next/head';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { FaRocket } from 'react-icons/fa';
import coverImage from '../../public/cover.jpg';
import { useUser } from '../hooks/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useUser();

  const getStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <Flex
      flex={1}
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      <Head>
        <title>Home</title>
      </Head>
      <SimpleGrid
        width={{ base: '85%', sm: '80%' }}
        mx="auto"
        height="full"
        alignContent="center"
        gap={4}
        columns={{ base: 1, sm: 1, md: 2 }}
      >
        <Flex
          height="full"
          width="90%"
          flexDir="column"
          justifyContent="center"
        >
          <Heading fontSize="3rem">Feed</Heading>
          <Text fontSize="1.6rem" mt={6}>
            Feed reduces extreme hunger and malnutrition by getting surplus and
            specially prepared food from restaurants and homes and help it reach
            the people in need
          </Text>
          <Button
            rightIcon={<FaRocket size="0.9rem" />}
            // href="/dashboard"
            size="lg"
            width="fit-content"
            mt={6}
            onClick={getStarted}
          >
            Get Started
          </Button>
        </Flex>
        <Box height="full" width="full">
          <NextImage alt="" src={coverImage} objectFit="contain" />
        </Box>
      </SimpleGrid>
    </Flex>
  );
}
